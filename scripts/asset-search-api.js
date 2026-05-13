const PUBLISH_HOST = 'https://publish-p63260-e524717.adobeaemcloud.com';
const DAM_ROOT = '/content/dam/asset-share-commons/en/public';
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

function buildQueryParams({
  fulltext = '',
  types = [],
  offset = 0,
  limit = DEFAULT_LIMIT,
  orderBy = 'modified',
  orderDirection = 'desc',
} = {}) {
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

  if (types.length) {
    if (types.length === 1) {
      const mime = MIME_TYPE_MAP[types[0].toLowerCase()];
      if (mime) {
        params.set('1_property', 'jcr:content/metadata/dc:format');
        params.set('1_property.operation', 'like');
        params.set('1_property.value', `${mime}%`);
      }
    } else {
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
  }

  const sortProp = ORDERBY_MAP[orderBy] || ORDERBY_MAP.modified;
  params.set('orderby', sortProp);
  params.set('orderby.sort', orderDirection);

  return params;
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
  if (!bytes || Number.isNaN(Number(bytes))) return '';
  const num = Number(bytes);
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

  const renditionUrl = `${PUBLISH_HOST}${path}.renditions/card/asset.rendition`;
  const detailType = type.toLowerCase() === 'image' ? 'image' : type.toLowerCase();
  const theme = document.querySelector('.asset-share-dark') ? 'dark' : 'light';
  const detailUrl = `${PUBLISH_HOST}/content/asset-share-commons/en/${theme}/details/${detailType}.html${path}`;

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
    renditionUrl,
    detailUrl,
  };
}

export async function searchAssets(options = {}) {
  const params = buildQueryParams(options);
  const url = `${PUBLISH_HOST}/bin/querybuilder.json?${params.toString()}`;

  const resp = await fetch(url, {
    mode: 'cors',
    credentials: 'omit',
  });

  if (!resp.ok) {
    throw new Error(`Search failed: ${resp.status}`);
  }

  const data = await resp.json();
  const hits = (data.hits || []).map(normalizeHit);
  const total = data.total || data.results || hits.length;
  const hasMore = (options.offset || 0) + hits.length < total;

  return { hits, total, offset: options.offset || 0, hasMore };
}

export function getPublishHost() {
  return PUBLISH_HOST;
}

export { DEFAULT_LIMIT, formatSize, getAssetType };
