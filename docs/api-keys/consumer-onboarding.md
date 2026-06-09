# Consumer Onboarding

## Steps to Onboard a New API Consumer

### 1. Generate a Key

```bash
openssl rand -hex 32
```

### 2. Add to Secret Store

Add the new key to the relevant service's Secret Store (see [generating-keys.md](generating-keys.md)).

### 3. Provide Consumer With

| Item | Example |
|------|---------|
| API Key | `partner-acme-a1b2c3d4...` |
| Base URL | `https://secretly-legible-sawfly.edgecompute.app` |
| Available endpoints | `/api/xf/html`, `/api/xf/json`, `/api/xf/embed`, `/api/xf/email` |
| Auth header | `x-api-key: {their-key}` |
| Rate limits | 1000 req/min (if applicable) |
| Allowed paths | Which XF paths they can access |

### 4. Example Integration Code

**JavaScript (browser/Node):**
```javascript
const resp = await fetch(
  'https://secretly-legible-sawfly.edgecompute.app/api/xf/json?path=/content/experience-fragments/site/en/promo/master',
  { headers: { 'x-api-key': 'YOUR_KEY' } }
);
const data = await resp.json();
```

**cURL:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://secretly-legible-sawfly.edgecompute.app/api/xf/html?path=/content/experience-fragments/site/en/promo/master"
```

### 5. Document the Consumer

Track active consumers:

| Consumer | Key Prefix | Endpoints | Onboarded |
|----------|-----------|-----------|-----------|
| EDS Block (internal) | `eds-internal` | `/html` | 2026-06-09 |
| Mobile App | `mobile-ios` | `/json` | — |
| Partner Site | `partner-acme` | `/embed` | — |
| Email Platform | `email-marketo` | `/email` | — |

### 6. Monitor

Watch for:
- Unusual request volumes from a key
- 401 errors (key may have been leaked/revoked)
- Requests to paths the consumer shouldn't access
