# AI Generate API

## Base URL

```
https://YOUR-AI-SERVICE.edgecompute.app
```

(Not yet deployed — update when service is created)

## Endpoints

### POST /api/generate

Generate content using Claude AI.

**Request Body:**
```json
{
  "prompt": "Create a comparison table of cloud storage providers",
  "format": "html"
}
```

**Parameters:**
- `prompt` (required) — The generation instructions
- `format` (required) — `text` or `html`

**Response:**
```json
{
  "content": "<table>...</table>",
  "format": "html"
}
```

## Format Behavior

| Format | System Prompt | Output |
|--------|--------------|--------|
| `text` | "Return only plain text, no formatting" | Plain text string |
| `html` | "Return only semantic HTML, no explanation" | HTML snippet |

## Authentication

Requires Anthropic API key stored in Fastly Secret Store (`ai_secrets.anthropic_api_key`).

No client-side API key required (the edge function handles auth to Anthropic).

## Model

Uses Claude Sonnet 4.6 (`claude-sonnet-4-6-20250514`) with max 2048 tokens.

## Setup

1. Deploy `fastly-ai-generate/` to Fastly Compute
2. Configure `anthropic_api` backend → `api.anthropic.com:443`
3. Create Secret Store `ai_secrets` with `anthropic_api_key`
4. Update `AI_GENERATE_URL` in `blocks/ai-generate/ai-generate.js`
