# OSGi Configurations for AEM Publish JSON Export

These config files enable the Sling JSON export on your AEM publish instance,
which the edge function needs to fetch DAM asset data.

## Deployment

Copy these files into your AEM Cloud Manager project at:

```
ui.config/src/main/content/jcr_root/apps/<your-project>/osgiconfig/config.publish/
```

The `config.publish` runmode ensures these only apply to the publish tier.

### Files

| File | Purpose |
|------|---------|
| `org.apache.sling.servlets.get.DefaultGetServlet.cfg.json` | Enables JSON rendering on the Sling GET servlet with a 1000 result max |
| `org.apache.sling.security.impl.ReferrerFilter.cfg.json` | Allows requests from the publish host (referrer filter) |

### Additional: Restrict JSON to DAM paths only

For tighter security, add an Apache Sling Service User + ACL that limits JSON
export to `/content/dam/asset-share-commons` only. Or use a Sling Servlet Filter:

Create `ui.apps/src/main/content/jcr_root/apps/<your-project>/config.publish/org.apache.sling.engine.impl.SlingMainServlet.cfg.json`:

```json
{
  "sling.additional.response.headers": [
    "Access-Control-Allow-Origin: *"
  ]
}
```

### Dispatcher Filter (Required)

The OSGi config alone is not enough — AEM Cloud Service's dispatcher blocks
`.json` requests by default. Add this rule to your dispatcher configuration:

**File:** `dispatcher/src/conf.dispatcher.d/filters/filters.any`

```
# Allow JSON export for Asset Share Commons DAM content
/0200 { /type "allow" /method "GET" /url "/content/dam/asset-share-commons/en/public/*.json" }
```

Add this AFTER the default deny rules. The rule number (`/0200`) should be
higher than existing rules — check your `filters.any` and pick the next
available number.

Then redeploy via Cloud Manager.

### After Deployment

1. Deploy via Cloud Manager pipeline
2. Verify by hitting: `https://publish-p63260-e524717.adobeaemcloud.com/content/dam/asset-share-commons/en/public/pictures.3.json`
3. You should see a JSON tree of asset nodes with metadata
4. Then rebuild and test the Fastly edge function
