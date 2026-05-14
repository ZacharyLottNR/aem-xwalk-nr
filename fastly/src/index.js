/// <reference types="@fastly/js-compute" />

import { env } from "fastly:env";

const PUBLISH_HOST = 'publish-p63260-e524717.adobeaemcloud.com';
const DAM_ROOT = '/content/dam/asset-share-commons/en/public';
const API_PATH = '/api/assets/asset-share-commons/en/public';
const DEFAULT_LIMIT = 24;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MIME_TYPE_MAP = {
  image: 'image/',
  document: 'application/pdf',
  video: 'video/',
  presentation: 'application/vnd.ms-powerpoint',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function getAssetType(format) {
  if (!format) return 'IMAGE';
  const f = format.toLowerCase();
  if (f.startsWith('image')) return 'IMAGE';
  if (f.startsWith('video')) return 'VIDEO';
  if (f.includes('pdf')) return 'DOCUMENT';
  if (f.includes('powerpoint') || f.includes('presentation')) return 'PRESENTATION';
  return 'IMAGE';
}

function formatSize(bytes) {
  const num = Number(bytes);
  if (!num || Number.isNaN(num)) return '';
  if (num < 1024) return `${num} B`;
  if (num < 1048576) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1073741824) return `${(num / 1048576).toFixed(1)} MB`;
  return `${(num / 1073741824).toFixed(1)} GB`;
}

function normalizeEntity(entity) {
  const props = entity.properties || {};
  const metadata = props.metadata || props['metadata'] || {};
  const path = props['dam:relativePath']
    ? `${DAM_ROOT}/${props['dam:relativePath']}`
    : entity.links?.[0]?.href?.replace(/\/api\/assets/, '/content/dam') || '';
  const name = props.name || path.split('/').pop() || '';
  const title = metadata['dc:title'] || props['dc:title'] || name;
  const format = metadata['dc:format'] || props['dc:format'] || '';
  const size = metadata['dam:size'] || props['dam:size'] || 0;
  const width = metadata['tiff:ImageWidth'] || 0;
  const height = metadata['tiff:ImageLength'] || 0;
  const type = getAssetType(format);

  return {
    path,
    title,
    type,
    format,
    size: formatSize(size),
    sizeBytes: Number(size),
    width: Number(width),
    height: Number(height),
    resolution: width && height ? `${width} x ${height}` : '',
    renditionUrl: `https://${PUBLISH_HOST}${path}.renditions/card/asset.rendition`,
    detailPath: path,
  };
}

function matchesType(entity, types) {
  if (!types.length) return true;
  const props = entity.properties || {};
  const metadata = props.metadata || {};
  const format = (metadata['dc:format'] || props['dc:format'] || '').toLowerCase();
  return types.some((t) => {
    const mime = MIME_TYPE_MAP[t.toLowerCase()];
    return mime && format.startsWith(mime);
  });
}

function matchesFulltext(entity, terms) {
  if (!terms.length) return true;
  const props = entity.properties || {};
  const metadata = props.metadata || {};
  const title = (metadata['dc:title'] || props['dc:title'] || props.name || '').toLowerCase();
  const desc = (metadata['dc:description'] || '').toLowerCase();
  const searchable = `${title} ${desc}`;
  return terms.every((term) => searchable.includes(term));
}

async function fetchFolder(folderPath, allEntities) {
  const url = `https://${PUBLISH_HOST}${folderPath}.json?limit=1000`;
  console.log(`Fetching: ${url}`);

  const resp = await fetch(url, {
    backend: 'aem_publish',
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    console.warn(`Failed to fetch ${folderPath}: ${resp.status}`);
    return;
  }

  const data = await resp.json();
  const entities = data.entities || [];

  for (const entity of entities) {
    const classes = entity.class || [];
    if (classes.includes('assets/asset')) {
      allEntities.push(entity);
    } else if (classes.includes('assets/folder')) {
      const folderLink = entity.links?.find((l) => l.rel?.includes('self'));
      if (folderLink) {
        const subPath = new URL(folderLink.href, `https://${PUBLISH_HOST}`).pathname;
        await fetchFolder(subPath, allEntities);
      }
    }
  }
}

async function handleAssetSearch(req) {
  const url = new URL(req.url);
  const fulltext = url.searchParams.get('fulltext') || '';
  const typesRaw = url.searchParams.get('types') || '';
  const types = typesRaw ? typesRaw.split(',').filter(Boolean) : [];
  const offset = parseInt(url.searchParams.get('offset'), 10) || 0;
  const limit = Math.min(parseInt(url.searchParams.get('limit'), 10) || DEFAULT_LIMIT, 100);
  const orderBy = url.searchParams.get('orderBy') || 'modified';
  const orderDirection = url.searchParams.get('orderDirection') || 'desc';
  const terms = fulltext.toLowerCase().split(/\s+/).filter(Boolean);

  const allEntities = [];
  await fetchFolder(API_PATH, allEntities);
  console.log(`Found ${allEntities.length} total assets`);

  let filtered = allEntities
    .filter((e) => matchesType(e, types))
    .filter((e) => matchesFulltext(e, terms));

  filtered.sort((a, b) => {
    const propsA = a.properties || {};
    const propsB = b.properties || {};
    const metaA = propsA.metadata || {};
    const metaB = propsB.metadata || {};
    let valA, valB;

    if (orderBy === 'title') {
      valA = (metaA['dc:title'] || propsA.name || '').toLowerCase();
      valB = (metaB['dc:title'] || propsB.name || '').toLowerCase();
      if (valA < valB) return orderDirection === 'asc' ? -1 : 1;
      if (valA > valB) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    }
    if (orderBy === 'size') {
      valA = Number(metaA['dam:size'] || propsA['dam:size'] || 0);
      valB = Number(metaB['dam:size'] || propsB['dam:size'] || 0);
    } else {
      valA = new Date(propsA['jcr:lastModified'] || propsA.created || 0).getTime();
      valB = new Date(propsB['jcr:lastModified'] || propsB.created || 0).getTime();
    }
    return orderDirection === 'asc' ? valA - valB : valB - valA;
  });

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);
  const hits = paged.map(normalizeEntity);
  const hasMore = offset + paged.length < total;

  return jsonResponse({ hits, total, offset, hasMore });
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
    if (url.pathname === '/api/asset-search' && req.method === 'GET') {
      return await handleAssetSearch(req);
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    console.error('Edge function error:', err);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
