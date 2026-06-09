# XF Delivery API

## Base URL

```
https://secretly-legible-sawfly.edgecompute.app
```

## Authentication

All endpoints require the `x-api-key` header (or `?key=` query param for embed endpoint).

## Endpoints

### GET /api/xf/html

Returns the Experience Fragment as raw HTML.

**Parameters:**
- `path` (required) — Full JCR path to the XF variation

**Example:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://secretly-legible-sawfly.edgecompute.app/api/xf/html?path=/content/experience-fragments/site/en/promo/master"
```

**Response:** Raw HTML (Content-Type: text/html)

---

### GET /api/xf/json

Returns structured JSON with the XF content and metadata.

**Example:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://secretly-legible-sawfly.edgecompute.app/api/xf/json?path=/content/experience-fragments/site/en/promo/master"
```

**Response:**
```json
{
  "path": "/content/experience-fragments/site/en/promo/master",
  "title": "Promo",
  "variation": "master",
  "content": {
    "html": "<div>...</div>",
    "text": "Plain text extraction..."
  },
  "metadata": {
    "deliveredAt": "2026-06-09T12:00:00Z"
  }
}
```

---

### GET /api/xf/embed

Returns an embeddable HTML/JS snippet for third-party sites.

**Example:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://secretly-legible-sawfly.edgecompute.app/api/xf/embed?path=/content/experience-fragments/site/en/promo/master"
```

**Response:** Self-loading script that fetches and renders the XF.

**Usage on third-party site:**
```html
<!-- Paste embed code directly -->
<div id="aem-xf-..."></div>
<script>...</script>
```

---

### GET /api/xf/email

Returns email-safe HTML with inlined CSS, no JavaScript.

**Example:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://secretly-legible-sawfly.edgecompute.app/api/xf/email?path=/content/experience-fragments/site/en/newsletter/master"
```

**Response:** Full HTML document with inlined styles, safe for email clients.

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Missing `path` parameter or invalid path |
| 401 | Missing or invalid API key |
| 404 | XF not found on AEM publish |
| 502 | AEM publish unreachable |
| 500 | Internal error |

## Path Format

Paths must:
- Start with `/content/experience-fragments/`
- Include the variation (typically `/master` at the end)
- Match a published Experience Fragment on AEM publish

## Rate Limits

Currently no enforced rate limits. Future: 1000 req/min per API key.

## Caching

Responses are cached at the edge for 5 minutes by default. Use `?nocache=true` to bypass (for testing only).
