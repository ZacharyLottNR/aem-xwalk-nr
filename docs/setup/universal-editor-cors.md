# Universal Editor Forms Save: 403 / CORS Fix

## Symptom

Saving **AEM Forms** properties in the Universal Editor fails with:
- `403 Forbidden` and a `blocked by CORS policy` error in the console
- Regular (non-form) content on the same page saves fine
- The failing request is a POST to `/adobe/forms/fm/v1/submitActions` (or a form node under `/content/.../jcr:content/root/section/form_*`)

## Root Cause

It is **not** a permissions issue and **not** a missing CORS policy. The existing UE CORS policy already allows `experience.adobe.com` with credentials.

The Forms Management API sends a custom request header:

```
X-Adobe-Accept-Unsupported-Api: 1
```

If this header is **not** listed in the CORS policy's `supportedheaders` (which maps to `Access-Control-Allow-Headers`), the browser's CORS preflight fails. The request is blocked before it completes, surfacing as a CORS error + failed save.

Regular content saves succeed because they don't send this header — only the Forms API does. That's why **only forms fail**.

## Fix

Add `X-Adobe-Accept-Unsupported-Api` to the `supportedheaders` array in the
Universal Editor CORS policy:

`com.adobe.granite.cors.impl.CORSPolicyImpl~universaleditor.cfg.json`

```json
"supportedheaders": [
  "Origin",
  "Accept",
  "X-Requested-With",
  "Content-Type",
  "Access-Control-Request-Method",
  "Access-Control-Request-Headers",
  "Authorization",
  "CSRF-Token",
  "x-adobe-accept-experimental",
  "x-api-key",
  "x-gw-ims-org-id",
  "X-Adobe-Accept-Unsupported-Api"
]
```

The reference config in `docs/aem-config/osgi/` reflects this.

## Deploy

1. Update the matching config in your AEM Cloud Manager repo:
   ```
   ui.config/src/main/content/jcr_root/apps/{project}/osgiconfig/config.author/com.adobe.granite.cors.impl.CORSPolicyImpl~universaleditor.cfg.json
   ```
2. Commit, push, run the Cloud Manager pipeline.
3. Retry the form save in the Universal Editor.

## Diagnostic Tip

When only a specific operation fails with a CORS error, check the **failing request's Request Headers** for any custom `X-*` header, then confirm that header is present in `supportedheaders`. The browser preflight (`OPTIONS`) must approve every custom header the actual request sends.

## If 403 Persists After the CORS Fix

Once the CORS header fix is deployed, verify whether the failure is still CORS or a server-side authorization rejection:

- **OPTIONS preflight returns 200/204** → CORS is fixed. The remaining 403 on the POST is a server-side rejection, NOT a CORS problem (a failed preflight blocks the request with no status code; a real 403 means the request reached the server).
- **403 POST with an empty response body** on `/adobe/forms/fm/v1/submitActions` → almost always the **AEM Forms add-on is not provisioned** on the environment.

### AEM Forms Add-On Requirement

The Forms Management write API (`/adobe/forms/fm/v1/*`) is served by the AEM Forms add-on. If the add-on is not enabled on the environment:
- Reads work (the form renders, properties dialog opens)
- Writes (saving submit actions, thank-you config) return a bare 403

This cannot be fixed via repo config or CORS — the Forms add-on must be provisioned at the program/environment level (Cloud Manager add-on provisioning, or via your Adobe sandbox entitlement contact).

**Verify provisioning:**
1. Cloud Manager → Program → Environments → check listed Solutions/Add-ons for AEM Forms.
2. Or open `/aem/forms.html/content/dam/formsanddocuments` on author — missing/erroring console indicates Forms is not provisioned.
3. Check the failing POST's **Response Headers** (body is empty) for a `Server-Agent` or `X-Adobe-*` header naming the rejecting service.

If Forms IS provisioned but writes still 403, investigate the IMS token scope via `com.adobe.granite.auth.ims.impl.IMSAccessTokenRequestAuthenticationHandler` — the token may lack the Forms scope.

## Actual Root Cause (this environment)

After ruling out CORS, CSRF, ACLs, and Forms provisioning, the Network tab
revealed the real difference:

| Component | Save POST goes to |
|-----------|-------------------|
| Text / Image / standard blocks | `https://universal-editor-service.adobe.io/patch` (Adobe-hosted UE service — always works) |
| AEM Forms component | `https://author-pXXXXX-eXXXXX.adobeaemcloud.com/content/.../form_XXXXXXXX` (direct browser→author POST) |

The Forms component bypasses the Universal Editor Service and writes
**directly to the author instance**. That direct POST hits the author
CDN/dispatcher filter, which returns:

```
Forbidden
Cannot serve request to /content/.../jcr:content/root/section/form_XXXXXXXX/ on this server
```

Standard components never hit this filter because they persist through the
UE service, not a direct author POST.

### Why forms write directly (this is by design)

The page has a single, correct persistence connection:

```html
<meta name="urn:adobe:aue:system:aemconnection"
      content="xwalk:https://author-p63260-e524717.adobeaemcloud.com?ref=feature-form">
```

Standard components persist through the UE service `/patch`, which reads this
connection and writes to author server-side. The **AEM Forms "Form Properties"
dialog is a custom UE extension** (the `ue-form-properties` micro-frontend).
By design, it writes form configuration **directly to the author instance**
via its own API call rather than the generic `/patch` flow.

So the direct author POST is **expected** — not a misconfiguration. The
connection metadata is correct and does not need changing.

### The fix

Allow the direct form-node POST in the **author** dispatcher filter. This is
the correct, required fix for the AEM Forms UE extension on AEMaaCS — a
default author filter does not permit these direct writes.

See `docs/aem-config/dispatcher/author-filters.any.snippet`. Deploy to the
`*.author.farm` filters (NOT the publish `filter.any`), then run the Cloud
Manager pipeline.
