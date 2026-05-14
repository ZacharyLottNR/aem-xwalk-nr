/// <reference types="@fastly/js-compute" />

import { env } from "fastly:env";

const PUBLISH_HOST = 'publish-p63260-e524717.adobeaemcloud.com';
const DAM_ROOT = '/content/dam/asset-share-commons/en/public';
const DEFAULT_LIMIT = 24;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MIME_TYPE_MAP = {
  image: 'image',
  document: 'application/pdf',
  video: 'video',
  presentation: 'application/vnd.ms-powerpoint',
};

const ORDERBY_MAP = {
  title: '@jcr:content/metadata/dc:title',
  size: '@jcr:content/jcr:data/@jcr:size',
  width: '@jcr:content/metadata/tiff:ImageWidth',
  height: '@jcr:content/metadata/tiff:ImageLength',
  modified: '@jcr:content/jcr:lastModified',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function buildQueryParams(searchParams) {
  const fulltext = searchParams.get('fulltext') || '';
  const typesRaw = searchParams.get('types') || '';
  const types = typesRaw ? typesRaw.split(',').filter(Boolean) : [];
  const offset = parseInt(searchParams.get('offset'), 10) || 0;
  const limit = Math.min(parseInt(searchParams.get('limit'), 10) || DEFAULT_LIMIT, 100);
  const orderBy = searchParams.get('orderBy') || 'modified';
  const orderDirection = searchParams.get('orderDirection') || 'desc';

  const params = new URLSearchParams();
  params.set('type', 'dam:Asset');
  params.set('path', DAM_ROOT);
  params.set('p.offset', offset);
  params.set('p.limit', limit);
  params.set('p.guessTotal', '250');
  params.set('p.hits', 'selective');
  params.set('p.properties', [
    'jcr:path',
    'jcr:content/metadata/dc:title',
    'jcr:content/metadata/dc:format',
    'jcr:content/metadata/dam:size',
    'jcr:content/metadata/tiff:ImageWidth',
    'jcr:content/metadata/tiff:ImageLength',
  ].join(' '));

  if (fulltext) {
    params.set('fulltext', fulltext);
    params.set('fulltext.relPath', 'jcr:content/metadata');
  }

  if (types.length === 1) {
    const mime = MIME_TYPE_MAP[types[0].toLowerCase()];
    if (mime) {
      params.set('1_property', 'jcr:content/metadata/dc:format');
      params.set('1_property.operation', 'like');
      params.set('1_property.value', `${mime}%`);
    }
  } else if (types.length > 1) {
    params.set('group.p.or', 'true');
    types.forEach((type, i) => {
      const mime = MIME_TYPE_MAP[type.toLowerCase()];
      if (mime) {
        params.set(`group.${i + 1}_property`, 'jcr:content/metadata/dc:format');
        params.set(`group.${i + 1}_property.operation`, 'like');
        params.set(`group.${i + 1}_property.value`, `${mime}%`);
      }
    });
  }

  const sortProp = ORDERBY_MAP[orderBy] || ORDERBY_MAP.modified;
  params.set('orderby', sortProp);
  params.set('orderby.sort', orderDirection);

  return { params, offset, limit };
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

function normalizeHit(hit) {
  const path = hit['jcr:path'] || hit.path || '';
  const metadata = hit['jcr:content']?.metadata || {};
  const title = metadata['dc:title'] || path.split('/').pop();
  const format = metadata['dc:format'] || '';
  const size = metadata['dam:size'] || 0;
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

async function handleAssetSearch(req) {
  const url = new URL(req.url);
  const { params, offset } = buildQueryParams(url.searchParams);

  const queryUrl = `https://${PUBLISH_HOST}/bin/querybuilder.json?${params.toString()}`;
  console.log(`Querying AEM: ${queryUrl}`);

  const aemResp = await fetch(queryUrl, {
    backend: 'aem_publish',
    headers: { 'Accept': 'application/json' },
  });

  if (!aemResp.ok) {
    console.error(`AEM QueryBuilder returned ${aemResp.status}`);
    return jsonResponse({ error: `AEM search failed: ${aemResp.status}` }, 502);
  }

  const data = await aemResp.json();
  const hits = (data.hits || []).map(normalizeHit);
  const total = data.total || data.results || hits.length;
  const hasMore = offset + hits.length < total;

  return jsonResponse({ hits, total, offset, hasMore });
}

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  console.log("FASTLY_SERVICE_VERSION:", env('FASTLY_SERVICE_VERSION') || 'local');

  const req = event.request;
  const url = new URL(req.url);

  // CORS preflight
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
