# Fastly Compute Setup

## Prerequisites

- Fastly account with Compute enabled
- Fastly CLI installed
- Node.js 18+

## Install Fastly CLI

**Mac:**
```bash
brew install fastly/tap/fastly
```

**Other platforms:** Download from https://github.com/fastly/cli/releases

## Authenticate

```bash
fastly profile create
```

Enter your Fastly API token (generate at https://manage.fastly.com/account/personal/tokens).

## Deploy a New Service

```bash
cd docs/fastly/fastly-xf-delivery  # or any edge function directory
npm install
fastly compute publish
```

This will:
1. Build the Wasm package
2. Create a new Fastly Compute service (first time)
3. Set up backends from `[setup]` section in `fastly.toml`
4. Deploy and activate

## Subsequent Deploys

```bash
fastly compute publish
```

Or push to main if GitHub Actions auto-deploy is configured.

## Local Development

```bash
fastly compute serve
```

Starts a local dev server (typically on port 7676).

## Service Configuration

Each edge function has a `fastly.toml` with:
- `[setup.backends]` — Origin servers the function can call
- `[setup.secret_stores]` — Secrets (API keys, credentials)
- `[scripts]` — Build commands

## Current Services

| Service | URL | Purpose |
|---------|-----|---------|
| Asset Search | `absolutely-cool-toucan.edgecompute.app` | DAM asset search/browse |
| XF Delivery | `secretly-legible-sawfly.edgecompute.app` | Multi-channel XF delivery |
| AI Generate | (not yet deployed) | Claude AI content generation |
