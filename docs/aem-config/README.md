# AEM Configuration Files

This directory contains AEM Cloud Service configuration snippets that need to be deployed to your AEM instance via Cloud Manager.

## Contents

### dispatcher/
Dispatcher filter rules that allow edge functions to access AEM publish content.

**Deploy to:** `dispatcher/src/conf.dispatcher.d/filters/` in your Cloud Manager repo.

### osgi/
OSGi configurations for CORS, authentication, etc.

**Deploy to:** `ui.config/src/main/content/jcr_root/apps/{project}/osgiconfig/config.publish/` in your Cloud Manager repo.

### replication/
Documentation on cache invalidation via replication events.

## How to Deploy

1. Copy the relevant files to your AEM Cloud Manager git repository
2. Place them in the correct directory structure
3. Commit and push
4. Run the Cloud Manager pipeline (Full Stack or Dispatcher-only)
5. Verify on publish tier

## Important

These files are **not deployed automatically** — they must be manually added to your Cloud Manager repository. This EDS repo doesn't deploy to AEM.
