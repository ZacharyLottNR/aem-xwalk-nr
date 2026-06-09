# Generating API Keys

## Overview

API keys authenticate consumers of the edge function APIs (XF delivery, AI generate, etc.). Each consumer gets a unique key.

## Generating a Key

Use any secure random string generator:

```bash
# Using openssl
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Key Format

- 64 character hex string (recommended)
- Or any unique string that's hard to guess
- No spaces or special characters that need URL encoding

## Adding Keys to the Service

1. List current keys from the Secret Store
2. Add the new key to the comma-separated list
3. Update the store entry

```bash
# Update the secret store entry
fastly secret-store-entry create \
  --store-id=STORE_ID \
  --name=api_keys \
  --secret="existing-key-1,existing-key-2,NEW-KEY-HERE"
```

4. Activate the new service version:
```bash
fastly service-version activate --service-id=SERVICE_ID --version=latest
```

## Key Naming Convention

For tracking purposes, prefix keys with the consumer name:
- `eds-internal-XXXXX` — EDS block internal use
- `mobile-ios-XXXXX` — iOS mobile app
- `partner-acme-XXXXX` — Partner site
- `email-marketo-XXXXX` — Email platform

## Rotation

1. Generate new key
2. Add both old and new keys to the store
3. Deploy
4. Update the consumer to use new key
5. After confirmation, remove old key from store
6. Deploy again

## Revoking a Key

Remove it from the comma-separated list and redeploy.
