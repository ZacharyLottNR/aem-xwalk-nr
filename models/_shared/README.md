# Shared Model Fields

This directory contains reusable field definitions that can be included
in any block's model via the `$include` directive.

## Usage

1. Create a shared field definition in this directory (e.g., `formatting.json`)
2. In your block's `_blockname.src.json`, reference it:

```json
{
  "models": [
    {
      "id": "my-block",
      "fields": [
        { "component": "richtext", "name": "content", "label": "Text", "valueType": "string" },
        { "$include": "models/_shared/formatting.json" }
      ]
    }
  ]
}
```

3. Run `npm run build:resolve` to generate the resolved `_blockname.json`
4. Run `npm run build:json` to regenerate the final component JSON files
5. Commit both the `.src.json` and the generated `.json`

## Available Shared Fields

- **formatting.json** — Alignment (left/center/right/justify), indent/outdent (1-4 levels), max-width (narrow/medium/full)
