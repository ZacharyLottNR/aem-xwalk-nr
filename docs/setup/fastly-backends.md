# Fastly Backends

## Overview

Backends are the origin servers that Fastly Compute functions can call via `fetch()`. The backend name in code must exactly match the name configured in the service.

## Common Issue: Backend Name Mismatch

The #1 cause of "Internal Server Error" on a new Compute service is the backend name in your code not matching the name in the Fastly dashboard.

**In code:**
```javascript
fetch(url, { backend: 'aem_publish' })
```

**Must match in Fastly dashboard:** Origins > Hosts > Name field must be exactly `aem_publish`.

## Configuring via fastly.toml

```toml
[setup.backends.aem_publish]
  address = "publish-p63260-e524717.adobeaemcloud.com"
  port = 443
```

The `[setup]` section creates backends on first deploy. After that, manage them in the dashboard.

## Configuring via Dashboard

1. Go to your Compute service in Fastly dashboard
2. Click "Origins" in the left nav
3. Click "Create a host"
4. Set:
   - **Name**: must match code (e.g., `aem_publish`)
   - **Address**: hostname (e.g., `publish-p63260-e524717.adobeaemcloud.com`)
   - **Port**: 443
   - **TLS**: Yes
   - **Override host**: same as address
   - **SNI hostname**: same as address

## Verifying Backend Name

If you get Internal Server Error after deploy:
1. Dashboard > your service > Origins > Hosts
2. Check the name field — click the pencil icon to see/edit it
3. If it says "Host 1" instead of `aem_publish`, rename it

## Current Backends

| Backend Name | Host | Used By |
|-------------|------|---------|
| `aem_publish` | `publish-p63260-e524717.adobeaemcloud.com` | Asset Search, XF Delivery |
| `anthropic_api` | `api.anthropic.com` | AI Generate |
| `google_recaptcha` | `recaptchaenterprise.googleapis.com` | reCAPTCHA Verify |
