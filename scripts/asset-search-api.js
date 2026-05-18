const PUBLISH_HOST = 'https://publish-p63260-e524717.adobeaemcloud.com';
const EDGE_FUNCTION_URL = 'https://absolutely-cool-toucan.edgecompute.app/api/asset-search';
const DEFAULT_LIMIT = 24;

function getDetailType(type) {
  const typeMap = { video: 'video', document: 'document', presentation: 'presentation' };
  return typeMap[type] || 'image';
}

function buildDetailUrl(hit) {
  const type = (hit.type || 'IMAGE').toLowerCase();
  const detailType = getDetailType(type);
  const path = hit.detailPath || hit.path || '';
  const loc = window.location.pathname;
  let themeMatch = loc.match(/(\/asset-share-commons\/en\/(?:dark|light))/);
  const ascMatch = loc.match(/(\/asset-share-commons\/en)/);
  let basePath;
  if (themeMatch != null) {
    basePath = themeMatch[0];
  } else if (ascMatch) {
    basePath = `${ascMatch[1]}/light`;//Default to light theme
  } else {
    basePath = loc.replace(/\/[^/]*$/, '');
  }
  return `${basePath}/details/${detailType}?path=${encodeURIComponent(path)}`;
}

export async function searchAssets({
  fulltext = '',
  types = [],
  offset = 0,
  limit = DEFAULT_LIMIT,
  orderBy = 'modified',
  orderDirection = 'desc',
} = {}) {
  const params = new URLSearchParams();
  if (fulltext) params.set('fulltext', fulltext);
  if (types.length) params.set('types', types.join(','));
  params.set('offset', offset);
  params.set('limit', limit);
  params.set('orderBy', orderBy);
  params.set('orderDirection', orderDirection);

  const url = `${EDGE_FUNCTION_URL}?${params.toString()}`;
  const resp = await fetch(url);

  if (!resp.ok) {
    throw new Error(`Search failed: ${resp.status}`);
  }

  const data = await resp.json();
  const hits = (data.hits || []).map((hit) => ({
    ...hit,
    detailUrl: buildDetailUrl(hit),
  }));

  return {
    hits,
    total: data.total || hits.length,
    offset: data.offset || 0,
    hasMore: data.hasMore || false,
  };
}

export function getPublishHost() {
  return PUBLISH_HOST;
}

export { DEFAULT_LIMIT };
