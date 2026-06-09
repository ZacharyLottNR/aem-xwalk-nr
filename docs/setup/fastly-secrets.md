# Fastly Secret Stores

## Overview

Secret Stores hold sensitive values (API keys, credentials) that edge functions can read at runtime without exposing them in code.

## Create a Secret Store

```bash
fastly secret-store create --name=xf_secrets
```

Note the returned `Store ID`.

## Add Entries

```bash
fastly secret-store-entry create \
  --store-id=STORE_ID \
  --name=api_keys \
  --secret="key1,key2,key3"
```

## Link to a Service

```bash
fastly resource-link create \
  --service-id=SERVICE_ID \
  --version=latest \
  --resource-id=STORE_ID
```

Then activate the new version:
```bash
fastly service-version activate --service-id=SERVICE_ID --version=latest
```

## Reading Secrets in Code

```javascript
import { SecretStore } from "fastly:secret-store";

const store = new SecretStore('xf_secrets');
const secret = store.get('api_keys');
const keys = secret.plaintext().split(',');
```

## Key Rotation

1. Add the new key to the comma-separated list
2. Update the secret store entry
3. Activate new version
4. Distribute new key to consumer
5. After transition period, remove old key

## Current Secret Stores

| Store | Service | Entries |
|-------|---------|---------|
| `xf_secrets` | XF Delivery | `api_keys` — consumer API keys |
| `ai_secrets` | AI Generate | `anthropic_api_key` — Claude API key |
| `recaptcha_secrets` | reCAPTCHA | `google_api_key`, `google_project_id` |
