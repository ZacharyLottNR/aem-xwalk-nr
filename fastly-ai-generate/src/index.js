/// <reference types="@fastly/js-compute" />

import { env } from "fastly:env";
import { SecretStore } from "fastly:secret-store";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function getApiKey() {
  try {
    const store = new SecretStore('ai_secrets');
    const secret = store.get('anthropic_api_key');
    return secret.plaintext();
  } catch {
    return null;
  }
}

async function handleGenerate(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { prompt, format } = body;

  if (!prompt) {
    return jsonResponse({ error: 'Missing prompt' }, 400);
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    return jsonResponse({ error: 'API key not configured' }, 500);
  }

  const systemPrompt = format === 'html'
    ? 'Generate semantic HTML for the following request. Return only the HTML, no explanation, no markdown code fences.'
    : 'Generate a plain text response for the following request. Return only the text, no HTML, no markdown formatting.';

  const anthropicBody = JSON.stringify({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 2048,
    messages: [
      { role: 'user', content: prompt }
    ],
    system: systemPrompt,
  });

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    backend: 'anthropic_api',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: anthropicBody,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`Anthropic API error: ${resp.status} ${errText}`);
    return jsonResponse({ error: `AI generation failed: ${resp.status}` }, 502);
  }

  const result = await resp.json();
  const content = result.content?.[0]?.text || '';

  return jsonResponse({ content, format });
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
    if (url.pathname === '/api/generate' && req.method === 'POST') {
      return await handleGenerate(req);
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    console.error('Edge function error:', err);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
