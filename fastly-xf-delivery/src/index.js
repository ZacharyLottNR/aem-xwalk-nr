/// <reference types="@fastly/js-compute" />

import { env } from "fastly:env";
import { SecretStore } from "fastly:secret-store";

const PUBLISH_HOST = 'publish-p63260-e524717.adobeaemcloud.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
  });
}

async function getApiKeys() {
  try {
    const store = new SecretStore('xf_secrets');
    const secret = store.get('api_keys');
    return secret.plaintext().split(',').map((k) => k.trim());
  } catch {
    return [];
  }
}

function isValidKey(key, validKeys) {
  return validKeys.includes(key);
}

function stripScripts(html) {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function inlineCssForEmail(html) {
  // Basic inline: wrap in a container with inline styles
  // For production, use a library like Juice
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
${stripScripts(html)}
</body>
</html>`;
}

function parseToJson(html, path) {
  const variation = path.split('/').pop() || 'master';
  const titleMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    path,
    title: titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : path.split('/').slice(-2, -1)[0] || 'Untitled',
    variation,
    content: {
      html,
      text: textContent.substring(0, 500),
    },
    metadata: {
      deliveredAt: new Date().toISOString(),
    },
  };
}

function generateEmbedSnippet(path, serviceUrl, apiKey) {
  const hash = path.replace(/[^a-z0-9]/gi, '-').substring(0, 32);
  return `<div id="aem-xf-${hash}"></div>
<script>
(function() {
  fetch('${serviceUrl}/api/xf/html?path=${encodeURIComponent(path)}', {
    headers: { 'x-api-key': '${apiKey}' }
  })
  .then(function(r) { return r.text(); })
  .then(function(html) {
    document.getElementById('aem-xf-${hash}').innerHTML = html;
  });
})();
</script>`;
}

async function fetchXF(path) {
  const url = `https://${PUBLISH_HOST}${path}.content.html`;
  console.log(`Fetching XF: ${url}`);

  const resp = await fetch(url, {
    backend: 'aem_publish',
    headers: { Accept: 'text/html' },
  });

  if (!resp.ok) {
    return { ok: false, status: resp.status };
  }

  const html = await resp.text();
  return { ok: true, html };
}

async function handleXfRequest(req, format) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');

  if (!path) {
    return jsonResponse({ error: 'Missing path parameter' }, 400);
  }

  if (!path.startsWith('/content/experience-fragments/')) {
    return jsonResponse({ error: 'Invalid path: must be under /content/experience-fragments/' }, 400);
  }

  const apiKey = req.headers.get('x-api-key') || url.searchParams.get('key') || '';
  const validKeys = await getApiKeys();

  if (validKeys.length > 0 && !isValidKey(apiKey, validKeys)) {
    return jsonResponse({ error: 'Unauthorized: invalid API key' }, 401);
  }

  const result = await fetchXF(path);

  if (!result.ok) {
    return jsonResponse({ error: `Experience Fragment not found: ${result.status}` }, 404);
  }

  const cleanHtml = stripScripts(result.html);

  switch (format) {
    case 'html':
      return htmlResponse(cleanHtml);

    case 'json':
      return jsonResponse(parseToJson(cleanHtml, path));

    case 'embed': {
      const serviceUrl = `https://${url.hostname}`;
      const snippet = generateEmbedSnippet(path, serviceUrl, apiKey);
      return htmlResponse(snippet);
    }

    case 'email':
      return htmlResponse(inlineCssForEmail(cleanHtml));

    default:
      return jsonResponse({ error: 'Invalid format' }, 400);
  }
}

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  console.log("FASTLY_SERVICE_VERSION:", env('FASTLY_SERVICE_VERSION') || 'local');

  const req = event.request;
  const url = new URL(req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    if (url.pathname === '/api/xf/html' && req.method === 'GET') {
      return await handleXfRequest(req, 'html');
    }
    if (url.pathname === '/api/xf/json' && req.method === 'GET') {
      return await handleXfRequest(req, 'json');
    }
    if (url.pathname === '/api/xf/embed' && req.method === 'GET') {
      return await handleXfRequest(req, 'embed');
    }
    if (url.pathname === '/api/xf/email' && req.method === 'GET') {
      return await handleXfRequest(req, 'email');
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    console.error('Edge function error:', err);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
