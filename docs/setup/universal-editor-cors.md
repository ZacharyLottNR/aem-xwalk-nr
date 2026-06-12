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
