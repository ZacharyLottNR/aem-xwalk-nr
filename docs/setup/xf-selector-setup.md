# Experience Fragment Selector — End-to-End Setup Guide

This guide walks through setting up the Experience Fragment (XF) Selector feature from scratch, covering the EDS block, the Fastly edge function, and AEM configuration.

## Overview

The XF Selector lets authors embed AEM Experience Fragments into EDS pages. It also exposes XF content to non-Adobe channels (mobile, third-party sites, email) via a multi-channel API.

| Component | Location | Purpose |
|-----------|----------|---------|
| EDS Block | `blocks/experience-fragment/` | Renders XF inline on the page |
| Edge Function | `fastly-xf-delivery/` | Fetches XF from AEM, serves in 4 formats |
| AEM Config | `aem-config/` | Dispatcher + CORS rules |

---

## Step 1: Verify Experience Fragments Exist

Confirm your XFs are published and accessible on the publish tier:

```bash
curl "https://publish-p63260-e524717.adobeaemcloud.com/content/experience-fragments/{your-path}/master.content.html"
```

If this returns HTML, you're good. If it returns 404 or empty, the XF isn't published or the dispatcher is blocking it (see Step 4).

---

## Step 2: Deploy the Edge Function

```bash
cd fastly-xf-delivery
npm install
fastly compute publish
```

On first deploy, this creates the service and configures the `aem_publish` backend.

**Verify the backend name** in the Fastly dashboard (Origins > Hosts) is exactly `aem_publish` — see [fastly-backends.md](fastly-backends.md).

Note the assigned service URL (e.g., `secretly-legible-sawfly.edgecompute.app`).

Full instructions: [fastly-compute-setup.md](fastly-compute-setup.md).

---

## Step 3: Wire the Block to the Edge Function

Edit `blocks/experience-fragment/experience-fragment.js`:

```javascript
const XF_DELIVERY_URL = 'https://YOUR-SERVICE.edgecompute.app/api/xf/html';
const XF_API_KEY = 'eds-internal-key';
```

Replace `YOUR-SERVICE` with your deployed service subdomain. Commit and push.

---

## Step 4: Configure AEM Dispatcher

Copy the rules from `aem-config/dispatcher/filter.any.snippet` into your AEM Cloud Manager dispatcher config:

```
/0200 { /type "allow" /method "GET" /url "/content/experience-fragments/*.content.html" }
```

Deploy via Cloud Manager pipeline. See [dispatcher-rules.md](dispatcher-rules.md).

---

## Step 5: (Optional) Configure CORS

If clients fetch XF content directly from AEM publish (not via the edge function), deploy the CORS OSGi config from `aem-config/osgi/`. Not required when all access goes through the edge function (which sets its own CORS headers).

---

## Step 6: Test All Endpoints

```bash
XF="/content/experience-fragments/{your-path}/master"
KEY="eds-internal-key"
BASE="https://YOUR-SERVICE.edgecompute.app"

curl -H "x-api-key: $KEY" "$BASE/api/xf/html?path=$XF"
curl -H "x-api-key: $KEY" "$BASE/api/xf/json?path=$XF"
curl -H "x-api-key: $KEY" "$BASE/api/xf/embed?path=$XF"
curl -H "x-api-key: $KEY" "$BASE/api/xf/email?path=$XF"
```

All should return 200. Bad paths (not under `/content/experience-fragments/`) return 400.

---

## Step 7: Author a Page

1. In the Universal Editor, add an "Experience Fragment" block
2. Paste the full XF path including variation:
   ```
   /content/experience-fragments/{site}/{locale}/{xf-name}/master
   ```
3. Preview — the XF renders inline

See [../blocks/experience-fragment.md](../blocks/experience-fragment.md) for authoring details.

---

## Authentication Note

**Current state: open access.** The `xf_secrets` Secret Store is not yet configured, so the API accepts any request (or no API key). The edge function code enforces keys *only when the store is populated*.

To enable auth later:
1. Create the `xf_secrets` Secret Store
2. Add an `api_keys` entry (comma-separated keys)
3. Activate the new version

After that, requests without a valid `x-api-key` return 401. See [fastly-secrets.md](fastly-secrets.md) and [../api-keys/generating-keys.md](../api-keys/generating-keys.md).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty response from `/api/xf/html` | XF path has no content on publish | Verify the path returns HTML via Step 1 |
| "Internal Server Error" | Backend name mismatch | Ensure backend is named `aem_publish` |
| Block shows "No Experience Fragment selected" | Path empty or doesn't start with `/content/experience-fragments` | Check the authored path |
| 404 from edge function | XF not published | Publish the XF in AEM |
| Block renders in author but not preview | (resolved) Was an API key / path extraction issue | Ensure block JS sends `x-api-key` header |

---

## Architecture Recap

```
Author (UE) → enters XF path → block stored
                                    │
Delivery → block JS fetch → edge function → AEM publish (.content.html)
                                    │
                          ┌─────────┴─────────┐
                       html  json  embed  email
                          │     │     │      │
                        EDS  Mobile 3rd-party Email
```

## Related Docs

- [XF Delivery API reference](../edge-functions/xf-delivery-api.md)
- [Experience Fragment block guide](../blocks/experience-fragment.md)
- [Fastly Compute setup](fastly-compute-setup.md)
- [Consumer onboarding](../api-keys/consumer-onboarding.md)
