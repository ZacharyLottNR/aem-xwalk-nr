/// <reference types="@fastly/js-compute" />

import * as response from './lib/response.js';
import { log } from './lib/log.js';
import { assetSearchHandler } from './asset-search.js';

addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  const req = event.request;
  const url = new URL(req.url);
  let finalResponse;

  try {
    if (req.method === 'OPTIONS') {
      finalResponse = response.cors();
    } else if (url.pathname === '/api/asset-search' && req.method === 'GET') {
      finalResponse = await assetSearchHandler(req);
    } else {
      finalResponse = response.notFound();
    }
  } catch (err) {
    console.error('Edge function error:', err);
    finalResponse = response.error();
  }

  log(req, finalResponse);
  return finalResponse;
}
