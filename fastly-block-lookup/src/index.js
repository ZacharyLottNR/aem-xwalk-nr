/// <reference types="@fastly/js-compute" />

import { env } from "fastly:env";

const PUBLISH_HOST = 'publish-p63260-e524717.adobeaemcloud.com';
const CONTENT_ROOT = '/content/aem-boilerplate-nr';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function normalizeValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim().toLowerCase();
  return String(val).trim().toLowerCase();
}

function matchesProperties(node, cellValues) {
  const nodeValues = [];

  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith('jcr:') || key.startsWith('sling:') || typeof val === 'object') continue;
    nodeValues.push(normalizeValue(val));
  }

  return cellValues.every((cell) => {
    const normalized = normalizeValue(cell);
    if (!normalized) return true;
    return nodeValues.some((nv) => nv.includes(normalized) || normalized.includes(nv));
  });
}

function walkTree(node, path, cellValues, results) {
  if (!node || typeof node !== 'object') return;

  if (matchesProperties(node, cellValues)) {
    results.push({ path, data: node });
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('jcr:') || key.startsWith('rep:')) continue;
    if (typeof child === 'object' && child !== null) {
      walkTree(child, `${path}/${key}`, cellValues, results);
    }
  }
}

async function handleBlockLookup(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { pagePath, cellValues } = body;

  if (!pagePath) {
    return jsonResponse({ error: 'Missing pagePath' }, 400);
  }

  if (!cellValues || !Array.isArray(cellValues) || cellValues.length === 0) {
    return jsonResponse({ error: 'Missing or empty cellValues array' }, 400);
  }

  const jcrPath = `${CONTENT_ROOT}${pagePath}`;
  const url = `https://${PUBLISH_HOST}${jcrPath}/jcr:content.infinity.json`;

  console.log(`Fetching: ${url}`);

  const resp = await fetch(url, {
    backend: 'aem_publish',
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    return jsonResponse({ error: `Failed to fetch page content: ${resp.status}` }, 502);
  }

  const tree = await resp.json();
  const results = [];

  walkTree(tree, `${jcrPath}/jcr:content`, cellValues, results);

  if (results.length === 0) {
    return jsonResponse({ error: 'No matching block found', pagePath, cellValues }, 404);
  }

  return jsonResponse({
    matches: results.length,
    block: results[0],
  });
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
    if (url.pathname === '/api/block-lookup' && req.method === 'POST') {
      return await handleBlockLookup(req);
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    console.error('Edge function error:', err);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
