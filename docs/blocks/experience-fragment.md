# Experience Fragment Block

## Overview

Renders an AEM Experience Fragment inline on the delivered EDS page. Fetches XF content at render time from the Fastly edge function.

## Authoring

1. Add an "Experience Fragment" block to a section
2. In the properties panel, paste the full XF path:
   ```
   /content/experience-fragments/site/en/header/master
   ```
3. The path must include the variation (usually `/master`)

## Finding the XF Path

In AEM author:
1. Navigate to the Experience Fragment in the Sites console
2. The path shows in the breadcrumb or URL
3. Full format: `/content/experience-fragments/{site}/{locale}/{xf-name}/{variation}`

## How It Works

- On page load, the block JS fetches XF HTML from the edge function
- The edge function proxies to AEM publish and returns the rendered XF
- Content is injected into the block and displayed inline
- Scripts in the XF are stripped for security

## Variations

Include the variation name at the end of the path:
- `/master` — default variation
- `/web` — web-specific variation
- `/mobile` — mobile variation

## Error States

- **No path entered**: Shows "No Experience Fragment selected"
- **XF not found**: Shows error message with status code
- **Network error**: Shows generic error message

## Requirements

- The XF must be published to the AEM publish tier
- The dispatcher must allow `.content.html` on XF paths
- The edge function (`secretly-legible-sawfly.edgecompute.app`) must be running
