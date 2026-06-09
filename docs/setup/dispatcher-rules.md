# Dispatcher Filter Rules

## Overview

AEM Cloud Service's dispatcher blocks most requests by default. You must explicitly allow paths/selectors that edge functions or clients need to access on publish.

## Adding a Rule

Edit your dispatcher's `filter.any` file and add allow rules:

```
# Allow XF content HTML
/0200 { /type "allow" /url "/content/experience-fragments/*.content.html" }
/0201 { /type "allow" /url "/content/experience-fragments/*.plain.html" }

# Allow JSON for JCR content (use with caution)
/0202 { /type "allow" /url "/content/*/jcr:content*.json" }
```

## Rule Numbering

Rules are processed in order. Higher numbers override lower. Place allow rules after deny rules.

## Common Selectors

| Selector | Purpose | Security Notes |
|----------|---------|----------------|
| `.html` | Standard page rendering | Usually allowed by default |
| `.content.html` | Content only (no chrome) | Good for XF fragments |
| `.plain.html` | Plain HTML (EDS format) | Used by franklin.delivery |
| `.json` | JSON export | Restrict to specific paths |
| `.3.json` | Depth-limited JSON | Safer than .infinity.json |
| `.infinity.json` | Full tree JSON | Block in production |

## Deploying Dispatcher Changes

1. Add rules to your AEM Cloud Manager git repo under `dispatcher/src/conf.dispatcher.d/filters/`
2. Commit and push
3. Run the Cloud Manager pipeline
4. Verify on publish: `curl https://publish-host/content/experience-fragments/path/master.content.html`

## Testing

After deploy, test that:
- Allowed paths return 200
- Paths you didn't allow still return 404
- `.infinity.json` remains blocked (security)
