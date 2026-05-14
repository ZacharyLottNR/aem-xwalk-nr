/// <reference types="@fastly/js-compute" />

import { ConfigStore } from 'fastly:config-store';
import { json, error } from './lib/response.js';

const DEFAULT_LIMIT = 24;

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

function getConfig() {
  try {
    const config = new ConfigStore('config_default');
    return {
      publishHost: config.get('AEM_PUBLISH_HOST') || 'publish-p63260-e524717.adobeaemcloud.com',
      damRootPath: config.get('DAM_ROOT_PATH') || '/content/dam/asset-share-commons/en/public',
    };
  } catch {
    return {
      publishHost: 'publish-p63260-e524717.adobeaemcloud.com',
      damRootPath: '/content/dam/asset-share-commons/en/public',
    };
  }
}

function buildQueryParams(searchParams, damRootPath) {
  const fulltext = searchParams.get('fulltext') || '';
  const typesRaw = searchParams.get('types') || '';
  const types = typesRaw ? typesRaw.split(',').filter(Boolean) : [];
  const offset = parseInt(searchParams.get('offset'), 10) || 0;
  const limit = Math.min(parseInt(searchParams.get('limit'), 10) || DEFAULT_LIMIT, 100);
  const orderBy = searchParams.get('orderBy') || 'modified';
  const orderDirection = searchParams.get('orderDirection') || 'desc';

  const params = new URLSearchParams();
  params.set('type', 'dam:Asset');
  params.set('path', damRootPath);
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

function normalizeHit(hit, publishHost) {
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
    renditionUrl: `https://${publishHost}${path}.renditions/card/asset.rendition`,
    detailPath: path,
  };
}

async function assetSearchHandler(req) {
  const url = new URL(req.url);
  const { publishHost, damRootPath } = getConfig();
  const { params, offset, limit } = buildQueryParams(url.searchParams, damRootPath);

  const queryUrl = `https://${publishHost}/bin/querybuilder.json?${params.toString()}`;
  console.log(`Querying AEM: ${queryUrl}`);

  const aemReq = new Request(queryUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    backend: 'aem-publish',
  });

  const aemResp = await fetch(aemReq);

  if (!aemResp.ok) {
    console.error(`AEM QueryBuilder returned ${aemResp.status}`);
    return error(`AEM search failed: ${aemResp.status}`, 502);
  }

  const data = await aemResp.json();
  const hits = (data.hits || []).map((hit) => normalizeHit(hit, publishHost));
  const total = data.total || data.results || hits.length;
  const hasMore = offset + hits.length < total;

  return json({
    hits,
    total,
    offset,
    limit,
    hasMore,
  });
}

export { assetSearchHandler };
