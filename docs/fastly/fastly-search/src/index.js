/// <reference types="@fastly/js-compute" />

import { env } from "fastly:env";

const PUBLISH_HOST = 'publish-p63260-e524717.adobeaemcloud.com';
const DAM_ROOT = '/content/dam/asset-share-commons/en/public';
const DAM_SUBFOLDERS = ['pictures', 'featured', 'logos', 'media', 'documents'];
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

function extractAssetsFromJson(data, folderPath) {
  const assets = [];
  for (const [name, node] of Object.entries(data)) {
    if (name.startsWith('jcr:') || name.startsWith('rep:') || typeof node !== 'object') continue;
    const jcrContent = node['jcr:content'];
    if (!jcrContent) continue;
    const primaryType = jcrContent['jcr:primaryType'] || node['jcr:primaryType'] || '';
    if (primaryType === 'dam:AssetContent' || jcrContent.metadata) {
      const metadata = jcrContent.metadata || {};
      const path = `${folderPath}/${name}`;
      const title = metadata['dc:title'] || name;
      const format = metadata['dc:format'] || '';
      const size = metadata['dam:size'] || jcrContent['dam:size'] || 0;
      const width = metadata['tiff:ImageWidth'] || 0;
      const height = metadata['tiff:ImageLength'] || 0;
      const type = getAssetType(format);
      const modified = jcrContent['jcr:lastModified'] || jcrContent['cq:lastModified'] || metadata['dam:whenLastModified'] || '';

      assets.push({
        path,
        title,
        type,
        format,
        size: formatSize(size),
        sizeBytes: Number(size),
        width: Number(width),
        height: Number(height),
        resolution: width && height ? `${width} x ${height}` : '',
        renditionUrl: `https://${PUBLISH_HOST}${path}/_jcr_content/renditions/original`,
        thumbnailUrl: `https://${PUBLISH_HOST}${path}/_jcr_content/renditions/original`,
        detailPath: path,
        modified,
      });
    }
  }
  return assets;
}

async function fetchFolderAssets(folderPath) {
  const url = `https://${PUBLISH_HOST}${folderPath}.3.json`;
  console.log(`Fetching: ${url}`);

  const resp = await fetch(url, {
    backend: 'aem_publish',
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    console.warn(`Failed to fetch ${folderPath}.3.json: ${resp.status}`);
    return [];
  }

  const data = await resp.json();
  return extractAssetsFromJson(data, folderPath);
}

function matchesType(asset, types) {
  if (!types.length) return true;
  const format = (asset.format || '').toLowerCase();
  return types.some((t) => {
    const mime = MIME_TYPE_MAP[t.toLowerCase()];
    return mime && format.startsWith(mime);
  });
}

function matchesFulltext(asset, terms) {
  if (!terms.length) return true;
  const searchable = `${asset.title} ${asset.path}`.toLowerCase();
  return terms.every((term) => searchable.includes(term));
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

  const fetchPromises = DAM_SUBFOLDERS.map((sub) => fetchFolderAssets(`${DAM_ROOT}/${sub}`));
  const results = await Promise.all(fetchPromises);
  const allAssets = results.flat();
  console.log(`Found ${allAssets.length} total assets across ${DAM_SUBFOLDERS.length} folders`);

  let filtered = allAssets
    .filter((a) => matchesType(a, types))
    .filter((a) => matchesFulltext(a, terms));

  filtered.sort((a, b) => {
    if (orderBy === 'title') {
      const vA = a.title.toLowerCase();
      const vB = b.title.toLowerCase();
      if (vA < vB) return orderDirection === 'asc' ? -1 : 1;
      if (vA > vB) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    }
    if (orderBy === 'size') {
      return orderDirection === 'asc' ? a.sizeBytes - b.sizeBytes : b.sizeBytes - a.sizeBytes;
    }
    if (orderBy === 'width') {
      return orderDirection === 'asc' ? a.width - b.width : b.width - a.width;
    }
    if (orderBy === 'height') {
      return orderDirection === 'asc' ? a.height - b.height : b.height - a.height;
    }
    const mA = new Date(a.modified || 0).getTime();
    const mB = new Date(b.modified || 0).getTime();
    return orderDirection === 'asc' ? mA - mB : mB - mA;
  });

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);
  const hasMore = offset + paged.length < total;

  return jsonResponse({ hits: paged, total, offset, hasMore });
}

async function handleAssetDetail(req) {
  const url = new URL(req.url);
  const assetPath = url.searchParams.get('path');
  if (!assetPath) return jsonResponse({ error: 'Missing path parameter' }, 400);

  const jsonUrl = `https://${PUBLISH_HOST}${assetPath}/jcr:content/metadata.json`;
  console.log(`Fetching asset detail: ${jsonUrl}`);

  const resp = await fetch(jsonUrl, {
    backend: 'aem_publish',
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    return jsonResponse({ error: `Asset not found: ${resp.status}` }, 404);
  }

  const metadata = await resp.json();
  const name = assetPath.split('/').pop();
  const title = metadata['dc:title'] || name;
  const format = metadata['dc:format'] || '';
  const size = metadata['dam:size'] || 0;
  const width = metadata['tiff:ImageWidth'] || 0;
  const height = metadata['tiff:ImageLength'] || 0;
  const type = getAssetType(format);
  const created = metadata['jcr:created'] || metadata['dam:assetCreated'] || '';
  const modified = metadata['dam:assetModified'] || metadata['jcr:lastModified'] || '';
  const description = metadata['dc:description'] || '';
  const tags = metadata['cq:tags'] || [];

  const renditions = [
    { name: 'Original File', url: `https://${PUBLISH_HOST}${assetPath}` },
    { name: 'Web Rendition', url: `https://${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/cq5dam.web.1280.1280.${format.split('/').pop() || 'jpeg'}` },
    { name: '48 x 48', url: `https://${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/cq5dam.thumbnail.48.48.png` },
    { name: '140 x 100', url: `https://${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/cq5dam.thumbnail.140.100.png` },
    { name: '319 x 319', url: `https://${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/cq5dam.thumbnail.319.319.png` },
  ];

  return jsonResponse({
    path: assetPath,
    title,
    name,
    type,
    format,
    description,
    size: formatSize(size),
    sizeBytes: Number(size),
    width: Number(width),
    height: Number(height),
    resolution: width && height ? `${width} x ${height}` : '',
    created,
    modified,
    tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
    imageUrl: `https://${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/original`,
    renditions,
  });
}

async function handleAssetImage(req) {
  const url = new URL(req.url);
  const assetPath = url.searchParams.get('path');
  if (!assetPath || !assetPath.startsWith('/content/dam/')) {
    return new Response('Bad request', { status: 400 });
  }

  const aemUrl = `https://${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/original`;
  console.log(`Proxying image: ${aemUrl}`);
  const resp = await fetch(aemUrl, {
    backend: 'aem_publish',
  });

  if (!resp.ok) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(resp.body, {
    status: 200,
    headers,
  });
}

async function handleAssetFile(req) {
  const url = new URL(req.url);
  const assetPath = url.searchParams.get('path');
  if (!assetPath || !assetPath.startsWith('/content/dam/')) {
    return new Response('Bad request', { status: 400 });
  }

  const aemUrl = `https://${PUBLISH_HOST}${assetPath}`;
  console.log(`Proxying file: ${aemUrl}`);
  const resp = await fetch(aemUrl, {
    backend: 'aem_publish',
  });

  if (!resp.ok) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers(resp.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(resp.body, {
    status: 200,
    headers,
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
    if (url.pathname === '/api/asset-search' && req.method === 'GET') {
      return await handleAssetSearch(req);
    }

    if (url.pathname === '/api/asset-image' && req.method === 'GET') {
      return await handleAssetImage(req);
    }

    if (url.pathname === '/api/asset-file' && req.method === 'GET') {
      return await handleAssetFile(req);
    }

    if (url.pathname === '/api/asset-detail' && req.method === 'GET') {
      return await handleAssetDetail(req);
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    console.error('Edge function error:', err);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
