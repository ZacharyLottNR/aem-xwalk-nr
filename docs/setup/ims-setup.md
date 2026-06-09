# IMS / Adobe Developer Console Setup

## Overview

IMS (Identity Management System) authentication is required for:
- Universal Editor extensions (XF picker, Asset Selector)
- AEM author API access from custom tools
- Service-to-service communication with Adobe APIs

## Creating a Project

1. Go to https://developer.adobe.com/console
2. Select your organization
3. Click "Create new project"
4. Name it (e.g., "EDS Edge Functions" or "UE Extensions")

## Adding an API

1. In your project, click "Add API"
2. Select "AEM as a Cloud Service" or "Experience Manager Assets"
3. Choose authentication type:
   - **OAuth Server-to-Server**: for backend services (edge functions)
   - **OAuth Single Page App (SPA)**: for browser-based UE extensions

## OAuth SPA (for UE Extensions)

1. Select "OAuth Single Page App"
2. Add redirect URIs:
   - `https://experience.adobe.com` (for UE)
   - `http://localhost:9080` (for local dev)
3. Note the **Client ID** (API key)
4. Note the **IMS Org ID** (format: `XXXXX@AdobeOrg`)

## OAuth Server-to-Server (for Edge Functions)

1. Select "OAuth Server-to-Server"
2. Add product profiles (AEM Users, AEM Administrators as needed)
3. Note the **Client ID**, **Client Secret**, and **Scopes**
4. Store credentials securely (Fastly Secret Store)

## Key Values Needed

| Value | Where Used | How to Find |
|-------|-----------|-------------|
| Client ID | UE extensions, API calls | Developer Console > Credentials |
| IMS Org ID | Asset Selector config | Developer Console > Overview |
| Client Secret | Server-to-server auth | Developer Console > Credentials |
| Technical Account ID | Service user mapping | Developer Console > Credentials |

## Testing IMS Authentication

```bash
# Get an access token (server-to-server)
curl -X POST https://ims-na1.adobelogin.com/ims/token/v3 \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  -d "scope=AdobeID,openid,aem.folders"
```

## Important Notes

- IMS tokens expire after 24 hours (server-to-server) or session-based (SPA)
- The UE automatically provides IMS tokens to registered extensions
- Never expose Client Secrets in client-side code
