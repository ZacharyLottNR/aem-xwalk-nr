# Cache Purge on XF Publish

## Overview

When an Experience Fragment is published in AEM, the edge function cache should be purged so consumers get fresh content.

## Options

### Option 1: Manual Purge (Simple)

Use the Fastly CLI to purge after publishing XFs:

```bash
fastly purge --url="https://secretly-legible-sawfly.edgecompute.app/api/xf/html?path=/content/experience-fragments/site/en/promo/master"
```

Or purge all:
```bash
fastly purge --all --service-id=SERVICE_ID
```

### Option 2: AEM Replication Agent (Automated)

Create a custom replication agent or workflow launcher in AEM that calls the Fastly purge API when XFs are activated:

1. Create a workflow launcher triggered on XF activation
2. Add a process step that calls:
   ```
   POST https://api.fastly.com/service/{service_id}/purge/{surrogate_key}
   Header: Fastly-Key: {api_token}
   ```

### Option 3: TTL-Based (Simplest)

Set a short cache TTL (e.g., 5 minutes) and accept that content updates take up to 5 minutes to propagate. No purge infrastructure needed.

## Current Approach

Currently using TTL-based caching (5 min default). For time-sensitive XF updates, use manual purge via CLI.
