# Block Lookup API

## Overview

Resolves a block's JCR path by matching its rendered cell values against the page's content tree. Useful when a block needs to know its own JCR path for API calls back to AEM.

## Base URL

```
https://YOUR-BLOCK-LOOKUP-SERVICE.edgecompute.app
```

(Deploy from `docs/fastly/fastly-xf-delivery/` — note: this service was merged into the XF delivery service repo)

## Endpoints

### POST /api/block-lookup

**Request Body:**
```json
{
  "pagePath": "/asset-share-commons/en/light",
  "cellValues": ["Lorem ipsum", "2-col-50-50"]
}
```

**Parameters:**
- `pagePath` (required) — EDS page path (without `/content/aem-boilerplate-nr` prefix)
- `cellValues` (required) — Array of text content from the block's table cells

**Response:**
```json
{
  "matches": 1,
  "block": {
    "path": "/content/aem-boilerplate-nr/asset-share-commons/en/light/jcr:content/root/section/block_123",
    "data": { ... }
  }
}
```

## How It Works

1. Receives page path + cell values from the client
2. Fetches the page's `jcr:content.infinity.json` from AEM publish
3. Walks the JCR tree looking for a node whose properties match the provided values
4. Returns the matching node's path and data

## Client Usage

```javascript
import { lookupBlock, getBlockCellValues } from '../../scripts/block-lookup.js';

export default async function decorate(block) {
  const cellValues = getBlockCellValues(block);
  const result = await lookupBlock(window.location.pathname, cellValues);
  // result.path = JCR path of this block
}
```

## Requirements

- Dispatcher must allow `.infinity.json` (or `.5.json`) on content paths
- AEM publish must be accessible from the Fastly backend

## Note

In the Universal Editor, `data-aue-resource` provides the JCR path directly — the lookup is only needed on the delivered page.
