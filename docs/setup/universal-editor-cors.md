# Universal Editor Write-Back: CORS & 403 Fix

## Symptom

Editing content (forms, blocks) in the Universal Editor fails on save with:
- `403 Forbidden` on a POST to `author-pXXXXX.adobeaemcloud.com/content/.../jcr:content/...`
- Console: `blocked by CORS policy: No 'Access-Control-Allow-Origin' header`
- Origin of the request: `https://experience.adobe.com`

## Root Cause

The UE runs at `https://experience.adobe.com` and writes back to your AEM **author** instance cross-origin, with an `Authorization: Bearer` token and a `CSRF-Token` header. The author rejects it unless three OSGi configs allow it:

1. **CORS policy** — allow `experience.adobe.com` origin **with credentials**
2. **Referrer filter** — allow `experience.adobe.com` as a referrer for write methods
3. **CSRF filter** — accept the CSRF token on write methods

## Configs

These live in `docs/aem-config/osgi/` and must be deployed to the **author** runmode via Cloud Manager:

| File | Purpose |
|------|---------|
| `com.adobe.granite.cors.impl.CORSPolicyImpl~universaleditor.cfg.json` | CORS with credentials for experience.adobe.com |
| `com.day.cq.security.ServiceReferrerFilter.cfg.json` | Allow experience.adobe.com referrer for writes |
| `com.adobe.granite.csrf.impl.CSRFFilter.cfg.json` | CSRF token handling for writes |

## Deploy Steps

1. Copy these files into your AEM Cloud Manager project at:
   ```
   ui.config/src/main/content/jcr_root/apps/{project}/osgiconfig/config.author/
   ```
   (Note: **config.author** — these apply to author, not publish.)

2. Commit and push to your Cloud Manager git repo.

3. Run the Cloud Manager pipeline (Full Stack).

4. After deploy, retry the form save in the Universal Editor.

## Important Notes

- The delivery CORS config (`CORSPolicyImpl~universaleditor` vs the publish one) is separate. The `~universaleditor` suffix creates a distinct named policy so it doesn't conflict with delivery CORS.
- `supportscredentials: true` is **required** — UE write-back is authenticated. Without it the browser blocks the response even if the status is 200.
- These are author-tier configs. Do not deploy them to publish.
- If you use a custom UE host (not experience.adobe.com), add it to `alloworigin`.
