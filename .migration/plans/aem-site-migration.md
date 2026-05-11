# NextRow.com Full Site Migration Plan

## Overview

Migrate the full website at **https://www.nextrow.com/** to AEM Edge Delivery Services using an automated approach. The site contains approximately 20 unique pages covering service areas, product pages, and standard pages.

## Site Structure

### Service Area Pages
- Homepage (`/`)
- B2B Marketing (`/b2b-marketing`)
- Unified Customer Experience (`/unified-customer-experience`)
- Content Supply Chain (`/content-supply-chain`)
- MarTech Services (`/martech-services`)
- AI Services (`/ai-services`)
- Cloud Services (`/cloud-services`)
- Workday Services (`/workday-services`)
- Cyber Security (`/cyber-security`)
- Data & Analytics (`/snowflake-services/cloud-data-analytics`)

### Product Pages
- QuipTag (`/quiptag`)
- Koru (`/koru`)

### Standard Pages
- Partners (`/partners`)
- Contact Us (`/contact-us`)
- Blog/Insights (`/blog`)
- Training (`/training`)
- Privacy Policy (`/privacy-policy`)

### Out of Scope (Subdomain)
- `landing.nextrow.com` pages (AEM Cloud Launchpad, Adobe CJA Launchpad, QuipMLR) — hosted on a separate subdomain and excluded from this migration.

## Migration Approach

The automated migration will proceed in these phases:

### Phase 1: Site Analysis & URL Classification
- Crawl key pages and classify them into page templates
- Identify common patterns (navigation, footer, hero sections, content blocks)

### Phase 2: Page Analysis & Block Discovery
- Analyze representative pages from each template group
- Identify block variants (hero, columns, cards, CTAs, etc.)
- Map DOM selectors to EDS blocks

### Phase 3: Design Migration
- Extract global design tokens (colors, fonts, spacing)
- Migrate site-wide CSS (typography, layout)
- Adapt block-level styles to EDS format

### Phase 4: Import Infrastructure
- Generate block parsers for each identified variant
- Create page transformers (cleanup + section logic)
- Build import scripts per template

### Phase 5: Content Import & Verification
- Execute import for all pages
- Verify rendered output against originals
- Fix any visual discrepancies

## Checklist

- [ ] Run site analysis to classify URLs into page templates
- [ ] Analyze homepage and identify block variants
- [ ] Analyze 2-3 representative service pages for common patterns
- [ ] Analyze product pages (QuipTag, Koru) for unique patterns
- [ ] Analyze standard pages (Contact, Partners, Blog)
- [ ] Map all discovered blocks to EDS block library
- [ ] Extract and migrate global design system (colors, fonts, spacing)
- [ ] Generate block parsers for all identified variants
- [ ] Generate page transformers (cleanup + sections)
- [ ] Build import scripts for each page template
- [ ] Import homepage content
- [ ] Import service area pages
- [ ] Import product pages
- [ ] Import standard pages
- [ ] Migrate navigation structure (header/footer)
- [ ] Validate all pages render correctly in preview
- [ ] Visual comparison and fix any discrepancies

## Notes

- The existing EDS project already has base blocks (hero, columns, cards, header, footer, fragment) — these will be extended with new variants as needed.
- Pages on `landing.nextrow.com` are excluded from this migration scope.
- Blog listing pages may require special handling depending on volume.

---

*To begin execution, exit Plan mode and the migration will proceed automatically through each phase.*
