# Commit and Push Design System Changes

## Summary

This plan covers committing all the design system and form fix changes made in this session to GitHub. The changes include:

- **Font migration**: Switched from Roboto to Lato (Google Fonts) matching the original NextRow site
- **Design tokens**: Updated `styles/styles.css` with NextRow brand colors, typography, spacing, and button styles
- **Block CSS updates**: Updated all block CSS files (hero, cards, columns, header, footer, and all variants)
- **Font loading**: Updated `styles/fonts.css` and `head.html` with proper font loading
- **Metadata block**: Created `blocks/metadata/` to fix 404 errors
- **Form fix**: Created `content/forms/contact-form.json` and updated the form link in `contact-us.html`

## Files Changed

- `styles/styles.css` — Complete design system with NextRow tokens
- `styles/fonts.css` — Lato font import from Google Fonts
- `head.html` — Added font preconnect links
- `blocks/header/header.css` — Updated nav styling
- `blocks/footer/footer.css` — Dark background footer
- `blocks/hero/hero.css` — Dark overlay hero banner
- `blocks/hero-ai/hero-ai.css` — Same hero pattern
- `blocks/hero-service/hero-service.css` — Same hero pattern
- `blocks/hero-product/hero-product.css` — Same hero pattern
- `blocks/cards/cards.css` — Card styling with shadows
- `blocks/cards-partner/cards-partner.css` — Partner cards
- `blocks/cards-service/cards-service.css` — Service cards
- `blocks/cards-blog/cards-blog.css` — Blog cards
- `blocks/cards-accelerator/cards-accelerator.css` — Accelerator cards
- `blocks/columns/columns.css` — Columns layout
- `blocks/columns-casestudy/columns-casestudy.css` — Case study columns
- `blocks/columns-valueprop/columns-valueprop.css` — Value prop columns
- `blocks/columns-stats/columns-stats.css` — Stats columns
- `blocks/columns-logos/columns-logos.css` — Logo grid
- `blocks/metadata/metadata.js` — New file (removes metadata section)
- `blocks/metadata/metadata.css` — New file (hides metadata)
- `content/forms/contact-form.json` — New file (form definition)
- `content/contact-us.html` — Updated form link to JSON

## Checklist

- [ ] Switch to Execute mode (required for git operations)
- [ ] Configure git safe directory
- [ ] Run `git status` and `git diff` to review all changes
- [ ] Stage all modified and new files
- [ ] Create commit with descriptive message
- [ ] Push to remote (requires user confirmation)

## Notes

Committing and pushing require Execute mode. Please switch to Execute mode to proceed with the git operations.
