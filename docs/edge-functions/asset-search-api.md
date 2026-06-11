# Asset Search API

## Base URL

```
https://absolutely-cool-toucan.edgecompute.app
```

## Endpoints

### GET /api/asset-search

Search and browse DAM assets.

**Parameters:**
- `fulltext` (optional) — Search keywords
- `types` (optional) — Comma-separated: `image`, `video`, `document`, `presentation`
- `offset` (optional, default: 0) — Pagination offset
- `limit` (optional, default: 24, max: 100) — Results per page
- `orderBy` (optional, default: `modified`) — Sort field: `modified`, `title`, `size`, `width`, `height`
- `orderDirection` (optional, default: `desc`) — `asc` or `desc`

**Example:**
```bash
curl "https://absolutely-cool-toucan.edgecompute.app/api/asset-search?fulltext=nature&types=image&limit=12&orderBy=title&orderDirection=asc"
```

**Response:**
```json
{
  "hits": [
    {
      "path": "/content/dam/asset-share-commons/en/public/pictures/example.jpg",
      "title": "Example",
      "type": "IMAGE",
      "format": "image/jpeg",
      "size": "1.2 MB",
      "sizeBytes": 1258291,
      "width": 4000,
      "height": 3000,
      "resolution": "4000 x 3000",
      "renditionUrl": "https://publish-host/path/_jcr_content/renditions/original",
      "thumbnailUrl": "https://publish-host/path/_jcr_content/renditions/original",
      "modified": "2026-04-20T18:02:22Z"
    }
  ],
  "total": 48,
  "offset": 0,
  "hasMore": true
}
```

---

### GET /api/asset-detail

Get detailed metadata for a single asset.

**Parameters:**
- `path` (required) — Full DAM path to the asset

**Example:**
```bash
curl "https://absolutely-cool-toucan.edgecompute.app/api/asset-detail?path=/content/dam/asset-share-commons/en/public/pictures/example.jpg"
```

---

### GET /api/asset-image

Proxy an asset image rendition (bypasses CORS/auth on AEM publish).

**Parameters:**
- `path` (required) — Full DAM path (must start with `/content/dam/`)

**Example:**
```bash
curl "https://absolutely-cool-toucan.edgecompute.app/api/asset-image?path=/content/dam/asset-share-commons/en/public/pictures/example.jpg"
```

Returns the `/_jcr_content/renditions/original` rendition.

---

### GET /api/asset-file

Proxy a raw DAM binary (PDF, document, etc.) from AEM publish. Unlike `/api/asset-image`, this returns the original file directly without appending a rendition path — use it for PDFs and other documents that EDS delivery (`.aem.live`) does not serve.

**Parameters:**
- `path` (required) — Full DAM path (must start with `/content/dam/`)

**Example:**
```bash
curl -L "https://absolutely-cool-toucan.edgecompute.app/api/asset-file?path=/content/dam/abbvie-poc/Forms%20Inventory%20and%20Technical%20Details.pdf"
```

Link PDFs in content using this endpoint instead of the `.aem.live` DAM path.

## DAM Folders Scanned

The service scans these folders under `/content/dam/asset-share-commons/en/public/`:
- `pictures`
- `featured`
- `logos`
- `media`
- `documents`

## No Authentication Required

This API is currently public (no API key needed).
