# GitHub Actions — Fastly Auto-Deploy

## Overview

A GitHub Action deploys Fastly Compute services automatically when changes are pushed to the `fastly/` directory on main.

## Workflow File

Located at `.github/workflows/deploy-fastly.yml`:

```yaml
name: Deploy Fastly Compute

on:
  push:
    branches: [main]
    paths:
      - 'fastly/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: fastly

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Fastly CLI
        uses: fastly/compute-actions/setup@v5
      - name: Install dependencies
        run: npm ci
      - name: Build and deploy
        run: fastly compute publish --token=${{ secrets.FASTLY_API_TOKEN }} --service-id=${{ secrets.FASTLY_SERVICE_ID }} --non-interactive
```

## Required GitHub Secrets

Add these in repo Settings > Secrets and variables > Actions:

| Secret | Value |
|--------|-------|
| `FASTLY_API_TOKEN` | Fastly API token with Compute write access |
| `FASTLY_SERVICE_ID` | The Compute service ID to deploy to |

## Token Permissions

The Fastly API token needs:
- `global` scope (or at minimum `service:{service_id}` write access)
- Generate at: https://manage.fastly.com/account/personal/tokens

## GitHub Token for Workflow Files

To push workflow files (`.github/workflows/`), the GitHub token needs the `workflow` scope.

## Manual Trigger

The workflow supports `workflow_dispatch` — trigger manually from the Actions tab.

## Multiple Services

For multiple edge functions (asset-search, xf-delivery, ai-generate), either:
1. Create separate workflows per service with different `paths` triggers
2. Use a matrix strategy to deploy the changed service
