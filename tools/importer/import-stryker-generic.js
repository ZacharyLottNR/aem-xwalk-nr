/* eslint-disable */
/* global WebImporter */

/**
 * Generic DOM-driven importer for Stryker product/marketing pages.
 *
 * Unlike the page-specific synthetic importers (import-stryker-home.js etc.),
 * this one PARSES the live Stryker DOM and maps its `page-section` components to
 * our -stryker blocks. Point a urls file at any Stryker product page and run it.
 *
 * Design notes
 * ------------
 * - Stryker pages are a flat list of `.page-section` components, each carrying a
 *   `c-{type}` class that identifies its kind (c-standalone-image, c-tabs,
 *   c-customizeable, c-disclaimer, c-section-title, ...).
 * - `c-section-title` elements have `id` + `data-title` and correspond to the
 *   sticky anchor nav. We open a new EDS section at each one and emit Section
 *   Metadata (anchorLabel) so section-anchor-stryker can rebuild that nav.
 * - Every block's cells are emitted to match how md2jcr groups model fields:
 *   the *Alt suffix folds into its image; a field whose name ends in Text/Title/
 *   Type collapses into the preceding field; container items are flat multi-cell
 *   rows (never nested tables). Getting the cell count wrong makes md2jcr throw
 *   and the page silently drops from the content package, so the extractors here
 *   deliberately mirror the proven hand-built importers.
 * - Anything we don't recognize falls through to `defaultContent` (headings,
 *   paragraphs, images preserved as-is) so no content is lost.
 */

const FALLBACK_IMAGE = 'https://author-p63260-e524717.adobeaemcloud.com/adobe/dynamicmedia/deliver/dm-aid--5df6d573-c301-41be-bd6e-f55a17edf39d/stryker-logo-thumbnail-1.jpg';
const FALLBACK_VIDEO = 'https://youtu.be/kRIuiIy_SCs?si=BxJbaFO8GU6mARUS';

function isUsableUrl(value) {
  return typeof value === 'string'
    && value.trim() !== ''
    && !/\b(undefined|null|NaN)\b/.test(value);
}

function el(document, tag, html) {
  const node = document.createElement(tag);
  if (html != null) node.innerHTML = html;
  return node;
}

function errorBlock(document, message) {
  return el(document, 'div', `<p>something went wrong: ${message}</p>`);
}

function imgNode(document, src, alt) {
  const i = document.createElement('img');
  i.src = isUsableUrl(src) ? src : FALLBACK_IMAGE;
  i.alt = alt || '';
  return i;
}

function anchorNode(document, href, text) {
  const a = document.createElement('a');
  a.href = isUsableUrl(href) ? href : '#';
  a.textContent = text || href || '';
  return a;
}

function text(node) {
  return (node?.textContent || '').replace(/\s+/g, ' ').trim();
}

// Resolve a usable image URL from an <img> (handles src / data-src / srcset).
function imgSrc(img) {
  if (!img) return '';
  const cand = img.getAttribute('src') || img.getAttribute('data-src')
    || (img.getAttribute('srcset') || '').split(',')[0].trim().split(' ')[0];
  return cand || '';
}

// Convert a YouTube watch/share URL to its embeddable form; pass others through.
function toEmbed(url) {
  try {
    const u = new URL(url, 'https://x');
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.endsWith('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
  } catch (e) { /* not a URL */ }
  return url;
}

// Stryker decorates styled headings as paragraphs with span classes rather
// than heading tags: `.futura-bold` is a bold Futura eyebrow/kicker (e.g.
// "Services", "Solutions") and `.urw-egyptienne` / `.fontsize-1-75em` is an
// enlarged serif headline (e.g. "Maximizing your investment"). The html2md/
// md2jcr round-trip strips arbitrary span classes, flattening every such line
// to an identical body paragraph and losing the visual hierarchy. Map them to
// heading tags — which the round-trip preserves — so the imported page keeps
// the bold kicker + larger headline. Returns a heading tag name, or null to
// keep the node's original tag.
function styledHeadingTag(node) {
  if (!node || !node.querySelector) return null;
  const whole = text(node);
  if (!whole) return null;
  // Only reclassify when a styling span wraps essentially the entire line.
  const wraps = (sel) => {
    const s = node.querySelector(sel);
    return s && text(s) === whole;
  };
  if (wraps('.futura-bold')) return 'h3'; // bold Futura kicker
  if (wraps('.urw-egyptienne') || wraps('.fontsize-1-75em')) return 'h2'; // serif headline
  return null;
}

// -------------------------------------------------------------------------
// Junk filter
// -------------------------------------------------------------------------
// The maximal-capture sweep and the lossless fallback would otherwise pull in
// non-article text: JS-injected video-player controls, share/embed dialogs, the
// cookie-consent modal, mobile-nav menus and leaked widget config strings.
// `isJunkText` recognises those fragments so they can be dropped AT CAPTURE
// TIME (before a node is appended). Patterns are deliberately specific so
// genuine copy is never matched. Note: filtering must happen at capture time —
// the runner re-serialises the source document, so removing nodes from the
// assembled output after the fact has no effect.

// Exact (normalized, lowercased) strings that are always widget/UI chrome.
const JUNK_EXACT = new Set([
  'audio', 'menu', 'back', 'continue', 'x', 'search this site', 'select all',
  'cancel', 'cancelselect all', 'cancelsend email', 'allow all', 'clear',
  'apply cancel', 'reject all confirm my choices', 'always active',
  'consent leg.interest', 'embed link', 'share link', 'email this to a friend',
  'reject all', 'accept all cookies', 'cookies settings', 'confirm my choices',
  'manage consent preferences', 'cookie list', 'privacy preference center',
  '8 english', 'our business', 'search…', 'allow all', 'watch on',
]);

// Regex patterns that reliably identify junk fragments.
const JUNK_PATTERNS = [
  /^\d{1,2}:\d{2}(\s*\/\s*\d{1,2}:\d{2})?$/, // media timecodes: "0:00", "0:04 / 0:07"
  /^\/content\/experience-fragments\//i, // XF path strings
  /^blob:/i, // blob: media URLs
  /^rgba?\(/i, // leaked inline color values: "rgba(255,255,255,1)"
  /^\[[ x]\]/i, // cookie toggles: "[x] Functional Cookies", "[ ] checkbox label"
  /^(true|false|none)$/i, // leaked widget config values
  /wrong email address/i, // email-a-friend form copy
  /to share this content with others/i, // embed/share dialog copy
  /^\d{2,4}x\d{2,4}$/, // embed size options: "320x240", "640x480"
  /these cookies (are|enable|allow|may)/i, // OneTrust cookie descriptions
  /localpage_nav|hcp-banner-overlay|first-item/i, // widget config tokens
  /copy and past this (code|link)/i, // embed/share instructions
  /^(load more|show more|view more|no items were found|no results found)$/i, // filter-grid widget chrome
  /^data as of .+all numbers are approximate/i, // infographic footnote (repeats per carousel copy)
];

function isJunkText(t) {
  if (!t) return true;
  const norm = t.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!norm) return true; // empty
  if (JUNK_EXACT.has(norm)) return true;
  return JUNK_PATTERNS.some((re) => re.test(norm));
}

// ---- Per-component extractors ---------------------------------------------
// Each returns an array of nodes (blocks and/or default content) to append to
// the current section, or null to skip. They never throw — a failure inside one
// component is caught by the dispatcher and replaced with an inline error note.

// c-standalone-image → a single image as default content (EDS wraps in <picture>)
function extractStandaloneImage(document, section) {
  const img = section.querySelector('img');
  if (!img) return null;
  return [imgNode(document, imgSrc(img), img.getAttribute('alt') || '')];
}

// c-disclaimer → legal-text-stryker (preserve every paragraph)
function extractDisclaimer(document, section) {
  const paras = [...section.querySelectorAll('p')]
    .map((p) => p.innerHTML.trim())
    .filter(Boolean);
  if (!paras.length) return null;
  return [WebImporter.Blocks.createBlock(document, {
    name: 'legal-text-stryker',
    cells: [[el(document, 'div', paras.map((p) => `<p>${p}</p>`).join(''))]],
  })];
}

// c-customizeable → cards-stryker (default style). Each .item is a product card:
// image, heading, description, CTA. Cells match cards-stryker-card field groups:
// image, ctaLabel, ctaUrl, text (imageAlt folds into the image).
function extractCustomizeable(document, section) {
  const items = [...section.querySelectorAll('.item')];
  if (!items.length) return null;
  const cells = [[''], ['3'], ['default']];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleEl = item.querySelector('h2, h3, h4');
    const ctaEl = item.querySelector('a.action-link, .desc-container a.action-link, a[class*="action"]');
    const desc = [...item.querySelectorAll('.desc-container p')].map((p) => p.innerHTML.trim()).filter(Boolean);
    const titleText = text(titleEl) || text(item.querySelector('a'));
    const ctaLabel = text(ctaEl) || 'Learn more';
    const ctaHref = ctaEl?.getAttribute('href') || item.querySelector('a')?.getAttribute('href') || '#';
    cells.push([
      imgNode(document, imgSrc(img), titleText),
      ctaLabel,
      anchorNode(document, ctaHref, ctaLabel),
      el(document, 'div', `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join('')}`),
    ]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'cards-stryker', cells })];
}

// c-filtered-content-type-grid-content → cards-stryker. A portfolio index grid:
// each `.product-item` is a link card wrapping an image + an <h4> title, with no
// description. The grid also ships hidden filter chrome (a "No items were found"
// notice and a "Load More" button); we read only the real, non-hidden product
// items. Cells match cards-stryker-card field groups: image, ctaLabel, ctaUrl,
// text (title only).
function extractFilteredGrid(document, section) {
  const items = [...section.querySelectorAll('.product-item')]
    // Skip hidden template/placeholder cells; keep only real product tiles.
    .filter((it) => !it.classList.contains('hidden') && it.querySelector('a[href] h4'));
  if (!items.length) return null;
  const cells = [[''], ['4'], ['default']];
  items.forEach((item) => {
    const link = item.querySelector('a[href]');
    const img = item.querySelector('img');
    const titleEl = item.querySelector('h4, h3, h2');
    const titleText = text(titleEl);
    const href = link?.getAttribute('href') || '#';
    cells.push([
      imgNode(document, imgSrc(img), titleText),
      'Learn more',
      anchorNode(document, href, 'Learn more'),
      el(document, 'div', `<p>${titleText}</p>`),
    ]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'cards-stryker', cells })];
}

// A "link-card grid" is a section (e.g. the About page's "Learn more about us")
// holding multiple `.c-standalone-image-content` cells, each an image + an <h4>
// link with no description. Map the run to cards-stryker. Returns null unless at
// least two such cells are present (so single standalone images stay images).
function extractLinkCardGrid(document, section) {
  const cells = [...section.querySelectorAll('.c-standalone-image-content')]
    .filter((c) => c.querySelector('img') && c.querySelector('h4'));
  if (cells.length < 2) return null;
  const rows = [[''], ['4'], ['default']];
  cells.forEach((cell) => {
    const img = cell.querySelector('img');
    const titleEl = cell.querySelector('h4, h3, h2');
    const link = cell.querySelector('a[href]');
    const titleText = text(titleEl);
    const href = link?.getAttribute('href') || '#';
    rows.push([
      imgNode(document, imgSrc(img), titleText),
      'Learn more',
      anchorNode(document, href, 'Learn more'),
      el(document, 'div', `<p>${titleText}</p>`),
    ]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'cards-stryker', cells: rows })];
}

// c-grouplist → quick-links-stryker. A grouped list of links (e.g. the About
// page's "Our businesses" portfolio index). Each <li> link becomes a quick-link
// item; an <li> without a link becomes a column header (blank URL). The block
// heading comes from the caller (the preceding section-title label).
function extractGroupList(document, section, heading) {
  const lis = [...section.querySelectorAll('ul li')];
  if (!lis.length) return null;
  const cells = [[heading || 'Quick links']];
  lis.forEach((li) => {
    const link = li.querySelector('a[href]');
    if (link) {
      const label = text(link);
      if (!label) return;
      cells.push([label, anchorNode(document, link.getAttribute('href') || '#', label)]);
    } else {
      const label = text(li);
      if (label) cells.push([label, '']); // column header (blank URL)
    }
  });
  if (cells.length <= 1) return null;
  return [WebImporter.Blocks.createBlock(document, { name: 'quick-links-stryker', cells })];
}

// c-standalone-video-content → video-stryker. Stryker uses Dynamic Media; we
// can rarely recover a public URL, so fall back to the brand video.
function extractVideo(document, section, theme) {
  const a = section.querySelector('a[href*="youtu"], a[href*="vimeo"]');
  const iframe = section.querySelector('iframe[src]');
  const url = a?.getAttribute('href') || iframe?.getAttribute('src') || FALLBACK_VIDEO;
  // Cells match the model field order: video, theme, poster (poster omitted).
  return [WebImporter.Blocks.createBlock(document, {
    name: 'video-stryker',
    cells: [[anchorNode(document, isUsableUrl(url) ? url : FALLBACK_VIDEO, url)], [theme || 'default']],
  })];
}

// c-autocarousel → the page hero. Each slide wraps an experience fragment whose
// content is a standalone image or video. We recover the first slide's image as
// a full-width hero image (default content); if the slide is a video, fall
// through to a video block.
function extractCarousel(document, section) {
  const firstSlide = section.querySelector('.carouselslide, .autoplay-slide') || section;
  const img = firstSlide.querySelector('img');
  if (img && imgSrc(img)) {
    return [imgNode(document, imgSrc(img), img.getAttribute('alt') || '')];
  }
  if (firstSlide.querySelector('.c-standalone-video-content, a[href*="youtu"], iframe[src]')) {
    // A hero carousel video plays full-bleed / muted / auto-loop.
    return extractVideo(document, firstSlide, 'hero');
  }
  return null;
}

// c-table → render the table's content as default-content paragraphs/list. A
// raw <table> can't be emitted here: md2jcr/html2md treat a table whose first
// row is a header as an EDS block named after that header text, which throws
// ("component does not exist"). Flattening to text avoids that while keeping
// the information. The first header row becomes a heading; each body row is a
// "label: cols" line.
function extractTable(document, section) {
  const table = section.querySelector('table');
  if (!table) return null;
  const rows = [...table.querySelectorAll('tr')];
  if (!rows.length) return null;
  const nodes = [];
  const headerCells = [...rows[0].querySelectorAll('th')];
  const headers = headerCells.map((c) => text(c));
  if (headers.length) {
    nodes.push(el(document, 'h3', headers[0] || 'Details'));
  }
  const ul = document.createElement('ul');
  rows.slice(headers.length ? 1 : 0).forEach((tr) => {
    const tds = [...tr.children].map((c) => text(c)).filter((t) => t !== '');
    if (!tds.length) return;
    const li = document.createElement('li');
    li.textContent = tds.join(' — ');
    ul.append(li);
  });
  if (ul.children.length) nodes.push(ul);
  return nodes.length ? nodes : null;
}

// c-resourcesanddownload (standalone, outside a tab) → cards-stryker. Each
// `.item` is a downloadable asset: thumbnail image + a Download link.
function extractResources(document, section) {
  const items = [...section.querySelectorAll('.item')];
  if (!items.length) return null;
  const cells = [[''], ['3'], ['default']];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const link = item.querySelector('a[target="_blank"], a');
    const titleText = img?.getAttribute('alt') || text(item.querySelector('h2, h3, h4')) || text(link);
    const ctaHref = link?.getAttribute('href') || '#';
    cells.push([
      imgNode(document, imgSrc(img), titleText),
      'Download',
      anchorNode(document, ctaHref, 'Download'),
      el(document, 'div', `<p>${titleText}</p>`),
    ]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'cards-stryker', cells })];
}

// c-marketo-form → a contact CTA. The form itself is Marketo/JS and has no EDS
// equivalent, so surface its success message (or a default) as a section banner
// inviting the reader to get in touch.
function extractMarketoForm(document, section) {
  const msg = text(section.querySelector('.alert, .marketo-form-content p'))
    || 'Interested in learning more? Talk to a rep today.';
  return [WebImporter.Blocks.createBlock(document, {
    name: 'section-banner-stryker',
    cells: [[el(document, 'div', `<p>${msg}</p>`)]],
  })];
}

// c-latestnews → cards-stryker (news style). Each `.item` is a news teaser:
// image, headline, description, Read More link.
function extractLatestNews(document, section) {
  const items = [...section.querySelectorAll('.item')];
  if (!items.length) return null;
  const heading = text(section.querySelector('.c-section-title, h2')) || 'Latest news';
  const cells = [[heading], ['4'], ['news']];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleEl = item.querySelector('h2, h3, h4, .m-c-subheading-description');
    const ctaEl = item.querySelector('a.news-link, a.action-link, a');
    const desc = [...item.querySelectorAll('p.description, .desc-container p')]
      .map((p) => p.innerHTML.trim()).filter(Boolean);
    const titleText = text(titleEl);
    const ctaLabel = text(ctaEl) || 'Read More';
    const ctaHref = ctaEl?.getAttribute('href') || '#';
    cells.push([
      imgNode(document, imgSrc(img), titleText),
      ctaLabel,
      anchorNode(document, ctaHref, ctaLabel),
      el(document, 'div', `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join('')}`),
    ]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'cards-stryker', cells })];
}

// c-largeheadline → normally a two-tone heading kept as plain <h2>. But a
// standalone largeheadline that is a full sentence (e.g. the Mission statement
// "Together with our customers, we are driven to make healthcare better.") is
// display copy, not a heading — map it to a center-justified-text block. The
// infographic's headline lives inside a full-bleed panel and is handled there,
// so it never reaches this extractor.
function extractLargeHeadline(document, section) {
  const label = text(section.querySelector('.largeheadline')) || text(section);
  if (!label) return null;
  // A multi-word sentence (has a space and ends with sentence punctuation, or is
  // long) reads as display copy → center-justified block.
  const isSentence = /[.!?]$/.test(label) || label.split(/\s+/).length >= 6;
  if (isSentence) {
    return [WebImporter.Blocks.createBlock(document, {
      name: 'center-justified-text-stryker',
      cells: [[el(document, 'div', `<p>${label}</p>`)]],
    })];
  }
  return [el(document, 'h2', label)];
}

// Promo panel (e.g. the "Training Calendar" band) → get-to-know-us-stryker.
// Stryker renders these as a heading + short description + a single CTA link
// alongside a banner image, with no distinguishing c-* class. We detect them
// structurally (see isPromoPanel) and map to get-to-know-us (standard layout).
// Cell order matches the model: image, imageAlt, text, buttonLabel, buttonLink,
// layout, backgroundImage.
function extractPromoPanel(document, panel) {
  const img = panel.querySelector('img');
  const heading = panel.querySelector('h1, h2, h3, h4');
  const cta = panel.querySelector('a[href]');
  const headingText = text(heading);
  const ctaLabel = text(cta);
  // Description = the panel's text leaves that aren't the heading or the CTA.
  // Stryker renders the blurb in a <span>/<div> (not a <p>), so scan every
  // childless text-bearing leaf, not just paragraphs. Capturing it here (rather
  // than letting it fall through) keeps the whole promo in ONE block and, via
  // the dedup key seeded from block text, stops the safety-net sweep re-emitting
  // the blurb + CTA as loose content below the card.
  const seen = new Set();
  const descParts = [];
  panel.querySelectorAll('p, span, div').forEach((n) => {
    if (n.childElementCount) return; // leaf nodes only
    const plain = text(n);
    if (!plain || plain === headingText || plain === ctaLabel) return;
    if (isJunkText(plain) || seen.has(plain)) return;
    seen.add(plain);
    descParts.push(`<p>${n.innerHTML.trim() || plain}</p>`);
  });
  const bodyHtml = `${headingText ? `<h2>${headingText}</h2>` : ''}${descParts.join('')}`;
  return [WebImporter.Blocks.createBlock(document, {
    name: 'get-to-know-us-stryker',
    cells: [
      [img ? imgNode(document, imgSrc(img), img.getAttribute('alt') || headingText) : ''],
      [el(document, 'div', bodyHtml)],
      [ctaLabel || ''],
      [cta ? anchorNode(document, cta.getAttribute('href') || '#', ctaLabel) : ''],
      ['standard'],
      [''],
    ],
  })];
}

// A curated-CTA tile section (e.g. the About page's "Code of Conduct" +
// "Quality Policy" pair) holds two or more `.c-curatedcta` promos, each an
// eyebrow (serif span) + heading (bold span) + body paragraph + a "Learn More"
// button, with a sibling standalone image. Map EACH tile to its own
// get-to-know-us-stryker block. Cell order matches the model: image, text
// (richtext body), buttonLabel, buttonLink, layout, backgroundImage.
function extractCuratedTiles(document, section) {
  const ctas = [...section.querySelectorAll('.c-curatedcta')];
  if (ctas.length < 2) return null;
  // Collect each tile's parts, then emit ONE double-text-and-media-stryker block
  // holding both tiles side by side (its centered 2-column layout aligns the
  // pair to the page content edges — no per-block centering to fight).
  const tiles = [];
  ctas.slice(0, 2).forEach((cta) => {
    const link = cta.querySelector('a[href]');
    if (!link) return;
    const textBlock = cta.closest('.buildingblock') || cta.parentElement;
    // Heading paragraph nests a serif lead-in (.urw-egyptienne, the eyebrow)
    // followed by the bold label (the heading). Derive heading = heading-para
    // text minus eyebrow (robust to the exact span classes, which hydrate late).
    const eyebrowEl = textBlock.querySelector('.urw-egyptienne');
    const eyebrow = text(eyebrowEl);
    const headingPara = eyebrowEl?.closest('p');
    const heading = headingPara
      ? text(headingPara).replace(eyebrow, '').replace(/\s+/g, ' ').trim()
      : text(textBlock.querySelector('.futura-bold'));
    // Body = the longest paragraph that isn't the heading paragraph.
    const bodyP = [...textBlock.querySelectorAll('p')]
      .filter((p) => p !== headingPara)
      .map((p) => ({ html: p.innerHTML.trim(), plain: text(p) }))
      .filter((p) => p.plain.length > 60)
      .sort((a, b) => b.plain.length - a.plain.length)[0];
    // Tile image: nearest standalone image after the text block, up to the next
    // tile's text block.
    let img = null;
    let sib = textBlock.nextElementSibling;
    while (sib && !img) {
      if (sib.querySelector) img = sib.querySelector('img');
      if (sib.classList?.contains('buildingblock')) break;
      sib = sib.nextElementSibling;
    }
    const title = heading || eyebrow;
    // Body cell keeps the eyebrow (bold lead-in) above the descriptive copy.
    const bodyHtml = `${eyebrow && heading ? `<p><strong>${eyebrow}</strong></p>` : ''}`
      + `${bodyP ? `<p>${bodyP.html}</p>` : ''}`;
    tiles.push({
      img, title, bodyHtml, ctaLabel: text(link), ctaHref: link.getAttribute('href') || '#',
    });
  });
  if (tiles.length < 2) return null;
  const cells = [];
  tiles.forEach((t) => {
    cells.push(
      [t.img ? imgNode(document, imgSrc(t.img), t.img.getAttribute('alt') || t.title) : ''],
      [t.title || ''],
      [el(document, 'div', t.bodyHtml)],
      [t.ctaLabel || 'Learn more'],
      [anchorNode(document, t.ctaHref, t.ctaLabel)],
    );
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'double-text-and-media-stryker', cells })];
}

// A "values grid" is a section of short text cards — a bold heading + a one-line
// subtext, no image (e.g. the About page's Values: Integrity / We do what's
// right, ...). Each card is a rich-text column whose paragraph nests a
// .futura-bold heading and a following subtext span. Map to a plain-theme
// stats-stryker block (value = heading, label = subtext). Returns null unless
// at least three such cards are present (so ordinary rich text isn't captured).
function extractValueCards(document, section) {
  const paras = [...section.querySelectorAll('p')].filter((p) => p.querySelector('.futura-bold'));
  const cards = [];
  paras.forEach((p) => {
    const headingEl = p.querySelector('.futura-bold');
    const heading = text(headingEl);
    if (!heading) return;
    // Subtext = the paragraph text minus the heading.
    const sub = text(p).replace(heading, '').replace(/\s+/g, ' ').trim();
    cards.push({ heading, sub });
  });
  if (cards.length < 3) return null;
  // stats-stryker cells: block-level titleBlack, titleGold, intro, theme; then
  // per-item icon, value (heading), label (subtext). No icon for value cards.
  const rows = [[''], [''], [el(document, 'div', '')], ['plain']];
  cards.forEach((c) => {
    rows.push(['', c.heading, el(document, 'div', `<p>${c.sub}</p>`)]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'stats-stryker', cells: rows })];
}

// Pull "stat cells" (a big headline number + its supporting label) out of a
// container. Stryker marks the number with an enlarged-font span
// (.fontsize-2-5em / .fontsize-2em / .fontsize-3em); the rest of the containing
// paragraph is the label. Returns [{ value, label }] in document order, deduped.
function statCells(container) {
  const seen = new Set();
  const cells = [];
  container.querySelectorAll('.fontsize-2-5em, .fontsize-2em, .fontsize-3em').forEach((big) => {
    const value = text(big);
    if (!value || value.length > 24) return; // a real stat number is short
    const p = big.closest('p') || big.parentElement;
    const full = text(p);
    const label = full.replace(value, '').replace(/\s+/g, ' ').trim();
    const key = `${value}|${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    cells.push({ value, label });
  });
  return cells;
}

// Build a stats-stryker block from a heading pair + stat cells (+ optional
// icons, matched by document order). Cells match the model field groups:
// block-level titleBlack, titleGold, intro, theme; then per-stat icon, value,
// label.
function buildStats(document, {
  titleBlack = '', titleGold = '', intro = '', theme = 'light', cells = [], icons = [],
}) {
  if (!cells.length) return null;
  const rows = [[titleBlack], [titleGold], [el(document, 'div', intro || '')], [theme]];
  cells.forEach((c, i) => {
    const icon = icons[i];
    rows.push([
      icon ? imgNode(document, icon.src, icon.alt || '') : '',
      c.value,
      el(document, 'div', `<p>${c.label || ''}</p>`),
    ]);
  });
  return [WebImporter.Blocks.createBlock(document, { name: 'stats-stryker', cells: rows })];
}

// c-full-bleed-panel → depending on content:
//  - an "Awards"-style badge wall (heading + many images + a "view all" CTA) →
//    image-gallery-stryker;
//  - a stats infographic (enlarged number spans) → stats-stryker;
//  - otherwise an experience-fragment promo (image + text) as default content.
function extractFullBleedPanel(document, section) {
  const imgs = [...section.querySelectorAll('img')];
  const heading = section.querySelector('h1, h2, h3, h4');
  const headingText = text(heading);
  const cta = section.querySelector('a[href]');

  // Awards / badge wall: several images with a heading and a single CTA.
  if (imgs.length >= 3 && cta) {
    const rows = [
      [headingText || ''],
      [text([...section.querySelectorAll('p, span, div')]
        .find((n) => !n.childElementCount && text(n) && text(n) !== headingText
          && text(n) !== text(cta)) || null)],
      [text(cta) || ''],
      [anchorNode(document, cta.getAttribute('href') || '#', text(cta))],
    ];
    imgs.forEach((im) => rows.push([imgNode(document, imgSrc(im), im.getAttribute('alt') || '')]));
    return [WebImporter.Blocks.createBlock(document, { name: 'image-gallery-stryker', cells: rows })];
  }

  // Stats infographic: enlarged number spans present.
  const cells = statCells(section);
  if (cells.length >= 2) {
    // The panel heading is often two-tone; keep it all as the black title.
    return buildStats(document, {
      titleBlack: headingText,
      theme: section.className.includes('bg-dark') ? 'dark' : 'light',
      cells,
      icons: imgs.map((im) => ({ src: imgSrc(im), alt: im.getAttribute('alt') || '' })),
    });
  }

  // Default: image + text as default content.
  const nodes = [];
  const img = section.querySelector('img');
  if (img) nodes.push(imgNode(document, imgSrc(img), img.getAttribute('alt') || ''));
  section.querySelectorAll('h1, h2, h3, h4, p').forEach((n) => {
    const t = n.innerHTML.trim();
    if (t && !isJunkText(text(n))) nodes.push(el(document, n.tagName.toLowerCase(), t));
  });
  return nodes.length ? nodes : null;
}

// c-disclaimer/c-section-title are handled inline; this covers generic text
// components (headings + paragraphs) as default content.
function extractText(document, section) {
  const nodes = [];
  section.querySelectorAll('h1, h2, h3, h4, p').forEach((n) => {
    const t = n.innerHTML.trim();
    if (!t || isJunkText(text(n))) return;
    const tag = styledHeadingTag(n) || n.tagName.toLowerCase();
    // When promoting a styled paragraph to a heading, emit its plain text so the
    // decorative spans (which md2jcr would strip anyway) don't ride along.
    nodes.push(el(document, tag, tag === n.tagName.toLowerCase() ? t : text(n)));
  });
  return nodes.length ? nodes : null;
}

// Collect tab items from a panel into flat tabbed-content-item-stryker rows.
// Cell order matches the model's field groups: tabName, image, ctaLabel,
// ctaUrl, text. A panel can hold file cards (c-resourcesanddownload), product
// cards (c-customizeable) or videos (c-standalone-video-content).
function tabItemsFromPanel(document, panel, tabName) {
  const rows = [];
  const videoSection = panel.querySelector('.c-standalone-video-content');
  if (videoSection || panel.querySelector('a[href*="youtu"], iframe[src]')) {
    const a = panel.querySelector('a[href*="youtu"], a[href*="vimeo"]');
    const iframe = panel.querySelector('iframe[src]');
    const url = a?.getAttribute('href') || iframe?.getAttribute('src') || FALLBACK_VIDEO;
    const title = text(panel.querySelector('h2, h3, h4')) || tabName;
    rows.push([tabName, '', '', anchorNode(document, isUsableUrl(url) ? url : FALLBACK_VIDEO, url), el(document, 'div', `<p>${title}</p>`)]);
    return rows;
  }
  // Card-style items (resources or customizeable products).
  [...panel.querySelectorAll('.item')].forEach((item) => {
    const img = item.querySelector('img');
    const link = item.querySelector('a.action-link, a[target="_blank"], a');
    const titleEl = item.querySelector('h2, h3, h4');
    const desc = [...item.querySelectorAll('.desc-container p, p.description')]
      .map((p) => p.innerHTML.trim()).filter(Boolean);
    const titleText = text(titleEl) || img?.getAttribute('alt') || text(link);
    const isDownload = (link?.getAttribute('href') || '').match(/\.(pdf|docx?|xlsx?|zip)$/i)
      || item.closest('.c-resourcesanddownload');
    const ctaLabel = text(item.querySelector('a.action-link')) || (isDownload ? 'Download' : 'Learn more');
    const ctaHref = link?.getAttribute('href') || '#';
    rows.push([
      tabName,
      imgNode(document, imgSrc(img), titleText),
      ctaLabel,
      anchorNode(document, ctaHref, ctaLabel),
      el(document, 'div', `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join('')}`),
    ]);
  });
  return rows;
}

// c-tabs → tabbed-content-stryker. Reads the tab labels from `.tab-link` and
// each panel's content, flattening every panel into tabName-tagged item rows.
function extractTabs(document, section) {
  const links = [...section.querySelectorAll('.tabs-nav a.tab-link, nav ul.tab a')];
  const panels = [...section.querySelectorAll('.tabs-content > .tab-content')];
  if (!links.length || !panels.length) return null;

  // Block-level heading field row (blank) precedes the item rows.
  const cells = [['']];
  links.forEach((link) => {
    const tabName = text(link);
    const href = (link.getAttribute('href') || '').replace(/^#/, '');
    const panel = panels.find((p) => p.id === href) || panels[links.indexOf(link)];
    if (!tabName || !panel) return;
    tabItemsFromPanel(document, panel, tabName).forEach((row) => cells.push(row));
  });
  if (cells.length <= 1) return null;
  return [WebImporter.Blocks.createBlock(document, { name: 'tabbed-content-stryker', cells })];
}

// Dispatch table: c-{type} → extractor. Order doesn't matter; matched by class.
const EXTRACTORS = {
  'c-standalone-image': extractStandaloneImage,
  'c-disclaimer': extractDisclaimer,
  'c-customizeable': extractCustomizeable,
  'c-procare-tile-addinfo': extractCustomizeable,
  'c-standalone-video-content': extractVideo,
  'c-latestnews': extractLatestNews,
  'c-largeheadline': extractLargeHeadline,
  'c-full-bleed-panel': extractFullBleedPanel,
  'c-autocarousel': extractCarousel,
  'c-table': extractTable,
  'c-marketo-form': extractMarketoForm,
  'c-resourcesanddownload': extractResources,
  'c-filtered-content-type-grid': extractFilteredGrid,
  'c-filtered-content-type-grid-content': extractFilteredGrid,
  'c-grouplist': extractGroupList,
  'c-tabs': extractTabs,
  'c-text': extractText,
  // c-title / c-tagline hold a hydrated heading or tagline; emit their text.
  'c-title': extractText,
  'c-tagline': extractText,
  // c-ourcompany is an empty JS-hydrated placeholder; falls through to
  // extractText which returns null, so it is safely skipped.
};

// Identify the c-{type} token on an element (searches its own classes, then any
// descendant that carries one). Some Stryker wrappers have a bare class (e.g. a
// `.largeheadline` div wrapping the real `.c-largeheadline`), so we scan the
// closest c-* descendant rather than only the first [class] child.
function componentType(section) {
  const own = [...(section.classList || [])].find((c) => c.startsWith('c-'));
  if (own) return own;
  const inner = section.querySelector?.('[class*="c-"]');
  if (inner) {
    const nested = [...(inner.classList || [])].find((c) => c.startsWith('c-'));
    if (nested) return nested;
  }
  return null;
}

// Lossless fallback: pull every meaningful node (headings, paragraphs, list
// items, standalone images) out of an element in document order. Used for any
// content that isn't a recognized component so no text is ever dropped.
function extractAllContent(document, root) {
  const nodes = [];
  const seenText = new Set();
  // Preserve document order by walking the subtree once.
  const walker = root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, img');
  walker.forEach((n) => {
    if (n.tagName === 'IMG') {
      const src = imgSrc(n);
      if (isUsableUrl(src)) nodes.push(imgNode(document, src, n.getAttribute('alt') || ''));
      return;
    }
    // Skip nodes whose text is fully contained in an ancestor we already took
    // (avoids duplicating a paragraph that also matched a parent block).
    const t = n.innerHTML.trim();
    const plain = text(n);
    if (!plain) return;
    if (seenText.has(plain)) return;
    if (isJunkText(plain)) return; // drop known widget/nav/cookie chrome
    seenText.add(plain);
    // Promote Stryker's styled title paragraphs (bold Futura kicker / enlarged
    // serif headline) to heading tags so the hierarchy survives md2jcr; emit
    // plain text for those since the decorative spans would be stripped anyway.
    const styled = n.tagName === 'P' ? styledHeadingTag(n) : null;
    if (styled) { nodes.push(el(document, styled, plain)); return; }
    const tag = n.tagName.toLowerCase();
    nodes.push(el(document, tag === 'li' ? 'p' : tag, t));
  });
  return nodes.length ? nodes : null;
}

// A "card unit" is a grid column (.xf-master-building-block) that bundles an
// image + heading + description + link — Stryker assembles these from separate
// image/title/tagline sub-components that only exist after client hydration.
// They are NOT a single c-* component, so the per-page-section dispatch misses
// them; we detect them structurally instead.
function isCardUnit(node) {
  return node.classList?.contains('xf-master-building-block')
    && node.querySelector('img')
    && node.querySelector('h2, h3, h4');
}

// A "promo panel" is a self-contained band with a heading, a short description,
// a single CTA link and a banner image (e.g. the "Training Calendar" section).
// Stryker gives these no c-* class, so detect them structurally: exactly one
// image, one CTA link, a heading, and not a card grid / tab / disclaimer.
function isPromoPanel(node) {
  if (!node.querySelector) return false;
  if (node.querySelector('.xf-master-building-block, .item, table, .c-tabs, .c-disclaimer')) return false;
  const imgs = node.querySelectorAll('img');
  const links = node.querySelectorAll('a[href]');
  const heading = node.querySelector('h1, h2, h3, h4');
  return imgs.length === 1 && links.length === 1 && !!heading
    && text(node).length > 30;
}

// Build a cards-stryker block from a list of card-unit elements. Cell order
// matches cards-stryker-card field groups: image, ctaLabel, ctaUrl, text.
function cardsFromUnits(document, units, heading) {
  const cells = [[heading || ''], ['3'], ['default']];
  units.forEach((unit) => {
    const img = unit.querySelector('img');
    const titleEl = unit.querySelector('h2, h3, h4');
    const link = unit.querySelector('a[href]');
    const titleText = text(titleEl) || img?.getAttribute('alt') || '';
    const desc = [...unit.querySelectorAll('p')]
      .map((p) => p.innerHTML.trim())
      .filter((t) => t && t !== titleText);
    const href = link?.getAttribute('href') || '#';
    cells.push([
      imgNode(document, imgSrc(img), titleText),
      'Learn more',
      anchorNode(document, href, 'Learn more'),
      el(document, 'div', `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join('')}`),
    ]);
  });
  return WebImporter.Blocks.createBlock(document, { name: 'cards-stryker', cells });
}

export default {
  // Stryker renders much of a page (training cards, carousels, taglines) with
  // client-side JS. Wait for that hydration to finish before the DOM is read,
  // otherwise headings/descriptions come through empty. Runs in the browser.
  onLoad: async ({ document }) => {
    /* global window */
    const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
    // Scroll through the page to trigger lazy hydration of off-screen widgets.
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 600) {
      window.scrollTo(0, y);
      // eslint-disable-next-line no-await-in-loop
      await sleep(120);
    }
    window.scrollTo(0, 0);
    // Wait (up to ~6s) until card grids have real headings, not empty shells.
    for (let i = 0; i < 30; i += 1) {
      const cards = document.querySelectorAll('.xf-master-building-block');
      const ready = [...cards].some((c) => c.querySelector('h2, h3, h4')
        && (c.querySelector('h2, h3, h4').textContent || '').trim());
      if (ready || !cards.length) break;
      // eslint-disable-next-line no-await-in-loop
      await sleep(200);
    }
  },

  transform: ({ document, url }) => {
    const main = document.createElement('div');
    const blockNames = [];

    try {
      // Strip filter-grid widget chrome up front so no extractor or the
      // safety-net sweep can capture it. These nodes ("Load More" button, the
      // hidden "No items were found" notice, and the empty pager/anchor stubs
      // the grid script leaves behind) are non-content and their hydration state
      // is unreliable at import time, so remove them from the source DOM before
      // anything reads it.
      document.querySelectorAll(
        '.btn-load-more, .load-more, .no-results, .filter-results, .pagination, .load-more-container',
      ).forEach((n) => n.remove());
      // Empty anchors (no text, no image) are pager/JS stubs — drop them too.
      document.querySelectorAll('a[href=""], a:not([href])').forEach((a) => {
        if (!text(a) && !a.querySelector('img, picture')) a.remove();
      });

      // Page title from <title> or first h1.
      const pageTitle = text(document.querySelector('title'))
        || text(document.querySelector('h1'))
        || 'Stryker';

      // Derive an output path from the source URL pathname.
      let path = '/stryker/imported';
      try {
        const slug = new URL(url, 'https://x').pathname
          .replace(/\.html?$/, '')
          .split('/')
          .filter(Boolean)
          .pop();
        if (slug) path = `/stryker/${slug}`;
      } catch (e) { /* keep default */ }

      // Prefer the semantic <main>, then an ARIA main-content region. Some
      // Stryker templates (e.g. tier1-landing pages) ship NO <main> tag; falling
      // straight back to <body> then sweeps in header/footer/mobile-nav chrome.
      // `[role="main"]` wraps just the article content on those pages.
      const contentRoot = document.querySelector('main')
        || document.querySelector('[role="main"]')
        || document.body;

      // Fast-facts style stat runs are fragmented across sibling sections: each
      // icon sits in its own `.c-standalone-image` and each number in a separate
      // rich-text section. Collapse such a run (a `.c-section-title` whose label
      // is followed by stat-number paragraphs) into ONE injected stats-stryker
      // block, then remove the consumed source sections so they don't fall
      // through to loose content. Runs in document order, pairing each number
      // with the most recent preceding icon image.
      const collapseStatRun = (titleSection) => {
        const label = titleSection.getAttribute('data-title') || text(titleSection);
        // The stat run lives in a self-contained experience fragment carousel:
        // the title, the stat numbers and their icons are all inside one
        // `.experienceFragment`. Pull every stat cell (enlarged number span +
        // its label) from it in document order, pairing each with the icon in
        // the same slide/cell.
        const xf = titleSection.closest('.experienceFragment, .experiencefragment')
          || titleSection.parentElement;
        if (!xf) return;
        const cells = [];
        const icons = [];
        const consumed = [];
        xf.querySelectorAll('.fontsize-2-5em, .fontsize-2em, .fontsize-3em').forEach((big) => {
          const value = text(big);
          if (!value || value.length > 24 || /fast facts/i.test(value)) return;
          const p = big.closest('p') || big.parentElement;
          const label2 = text(p).replace(value, '').replace(/\s+/g, ' ').trim();
          // Icon: nearest image within the same slide (walk up a few levels).
          let slide = p;
          let icon = null;
          for (let i = 0; i < 5 && slide; i += 1) {
            icon = slide.querySelector?.('img');
            if (icon) break;
            slide = slide.parentElement;
          }
          cells.push({ value, label: label2 });
          icons.push(icon ? { src: imgSrc(icon), alt: icon.getAttribute('alt') || '' } : null);
          consumed.push(p);
          if (icon) consumed.push(icon);
        });
        if (cells.length < 2) return;
        const block = buildStats(document, { titleBlack: label, cells, icons });
        if (!block) return;
        // Attach the finished block to the title section; the walker emits it.
        titleSection._statsBlock = block[0];
        statScopes.push({ scope: xf, title: titleSection });
        // Physically remove the consumed number paragraphs + icon images from
        // the source DOM so neither the unit walk nor the safety-net sweep can
        // re-emit them as loose content. (Mutating the source document at the
        // start of transform is honoured for the rest of this pass.)
        consumed.forEach((n) => n.remove());
      };
      // Trigger for known stat-run titles (currently "Fast facts").
      const statScopes = [];
      document.querySelectorAll('.c-section-title[data-title], [data-title]').forEach((t) => {
        if (/^fast facts$/i.test((t.getAttribute('data-title') || text(t)).trim())) {
          collapseStatRun(t);
        }
      });

      // Curated-CTA tile pairs (e.g. "Code of Conduct" + "Quality Policy") live
      // in a self-contained experience fragment whose text blocks and images are
      // separate sibling columns — so no single walked unit holds a whole tile.
      // Collapse each such XF into per-tile get-to-know-us blocks up front,
      // attaching them to a placeholder the walker emits in document order, and
      // scope the XF out of the walk + sweep so its pieces aren't re-captured.
      const curatedScopes = [];
      const seenCuratedXf = new Set();
      document.querySelectorAll('.c-curatedcta').forEach((cta) => {
        const xf = cta.closest('.experienceFragment, .experiencefragment');
        if (!xf || seenCuratedXf.has(xf)) return;
        if (xf.querySelectorAll('.c-curatedcta').length < 2) return; // a tile pair
        seenCuratedXf.add(xf);
        const blocks = extractCuratedTiles(document, xf);
        if (!blocks || !blocks.length) return;
        // Placeholder marks the XF's document position; the walk emits its
        // attached blocks and skips the rest of the XF subtree.
        const placeholder = document.createElement('div');
        placeholder.setAttribute('data-curated-tiles', 'true');
        placeholder._curatedBlocks = blocks;
        xf.parentElement.insertBefore(placeholder, xf);
        curatedScopes.push(xf);
      });

      // Only pages that actually render the sticky jump/anchor nav should get a
      // section-anchor-stryker block. Detect the real rendered nav (the
      // `.jumpbarnav` / `.c-navigation-bar` bar with in-page anchor links) — NOT
      // just the presence of `.c-section-title` markers, since templates like
      // the portfolio index carry a lone section-title marker with no rendered
      // nav. Without this gate the importer would invent an anchor nav the
      // source page doesn't have.
      const hasAnchorNav = !!document.querySelector(
        '.jumpbarnav a[href^="#"], .c-navigation-bar a[href^="#"], .bar-nav a.anchor',
      );

      // Build a flat, document-ORDER list of the "units" to import: recognized
      // Stryker components, section-title anchors, hydrated card units, and any
      // loose text/image blocks. Page structure/nesting varies a lot between
      // Stryker templates, so instead of walking a single container's children
      // we select every candidate across <main> and keep only the OUTERMOST of
      // each (a unit contained by another selected unit is handled by its
      // ancestor). This guarantees complete, order-preserving coverage with no
      // silent gaps.
      const SELECTOR = [
        '.c-section-title', '.section-title[data-title]', '[data-title]',
        '.xf-master-building-block',
        '.page-section',
        '.c-disclaimer',
        '.text.parbase', '.c-rich-text-editor', '.largeheadline',
        '.sectionseparator', '.c-section-separator', // horizontal content breaks
        '.pDiv', // bespoke promo bands (e.g. Training Calendar)
        '.c-grouplist', // grouped link lists (e.g. "Our businesses")
        '[data-curated-tiles]', // collapsed curated-CTA tile pairs
      ].join(',');
      const all = [...contentRoot.querySelectorAll(SELECTOR)]
        // Drop header/footer chrome and hidden scaffolding.
        .filter((n) => !n.closest('header, footer, nav'))
        // Drop units inside a collapsed stat run's scope (except the stat title
        // itself, which carries the finished block), so the run's number/icon
        // sub-sections aren't re-emitted as loose content.
        .filter((n) => !statScopes.some(({ scope, title }) => n !== title
          && scope.contains(n) && scope !== n))
        // Drop units inside a collapsed curated-tiles XF (its blocks are emitted
        // via the placeholder), so the tile pieces aren't re-captured.
        .filter((n) => !curatedScopes.some((scope) => scope.contains(n)));
      // Keep only outermost units (skip any node contained by another selected
      // node) so each piece of content is emitted exactly once.
      const units = all.filter((n) => !all.some((o) => o !== n && o.contains(n)));

      // Nodes whose whole subtree an extractor turned into block(s); the
      // safety-net sweep skips them so duplicate mobile/desktop copy inside
      // isn't re-emitted as loose content.
      const consumedScopes = [];

      // sectionsOut: array of { anchorLabel, nodes: [] }. First section holds
      // the hero + anchor block.
      const sectionsOut = [{ anchorLabel: '', nodes: [] }];
      let current = sectionsOut[0];

      // Legal/disclaimer copy is collected here (deduped) and emitted as ONE
      // legal-text-stryker block AFTER every other section, so legal text is
      // always the final content block on the page. `pushLegal` dedupes by
      // normalized plain text.
      const legalParas = [];
      const pushLegal = (html, plain) => {
        if (!plain || legalParas.some((p) => p.plain === plain)) return;
        legalParas.push({ html, plain });
      };

      // Card units (.xf-master-building-block) bundle an image with a hydrated
      // heading + tagline. Collect contiguous units into one cards-stryker
      // block. `pendingCards` buffers units until a non-card node flushes them.
      let pendingCards = [];
      const flushCards = () => {
        if (!pendingCards.length) return;
        try {
          current.nodes.push(cardsFromUnits(document, pendingCards));
          blockNames.push('cards-stryker');
        } catch (e) {
          current.nodes.push(errorBlock(document, `failed to build card grid — ${e.message}`));
        }
        pendingCards = [];
      };

      // Does this unit represent a section-title / anchor?
      const anchorTitleEl = (node) => (node.matches?.('.c-section-title, .section-title[data-title], [data-title]')
        ? node
        : node.querySelector?.('.c-section-title, .section-title[data-title], [data-title]'));

      // Track the source elements we consume, so the final safety-net sweep can
      // reliably skip anything already captured (avoids duplicates).
      const consumed = [];
      const processNode = (node) => {
        if (node.nodeType !== 1) return;
        if (['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT'].includes(node.tagName)) return;
        consumed.push(node);

        // Collapsed curated-tiles placeholder → emit its prebuilt
        // double-text-and-media block (both tiles, side by side).
        if (node._curatedBlocks) {
          flushCards();
          node._curatedBlocks.forEach((b) => {
            current.nodes.push(b);
            blockNames.push('double-text-and-media-stryker');
          });
          return;
        }

        // Hydrated card unit → buffer into the current card grid.
        if (isCardUnit(node)) { pendingCards.push(node); return; }

        // Horizontal content break (Stryker .sectionseparator / hr) →
        // content-break-stryker (little = thin grey rule).
        if (node.matches?.('.sectionseparator, .c-section-separator, .section-separator')
          || node.tagName === 'HR') {
          flushCards();
          current.nodes.push(WebImporter.Blocks.createBlock(document, {
            name: 'content-break-stryker',
            cells: [['little']],
          }));
          blockNames.push('content-break-stryker');
          return;
        }

        // Disclaimer / legal copy → defer into the single trailing legal block
        // (collected in `legalParas`, emitted last), never inline.
        if (node.matches?.('.c-disclaimer') || componentType(node) === 'c-disclaimer') {
          flushCards();
          [...node.querySelectorAll('p')]
            .forEach((p) => pushLegal(p.innerHTML.trim(), text(p)));
          if (!node.querySelector('p')) pushLegal(node.innerHTML.trim(), text(node));
          return;
        }

        // Section-title / anchor → open a new EDS section. The label feeds the
        // sticky anchor nav (Section Metadata) AND is emitted as a visible <h2>
        // so the on-page section heading (e.g. "Surgeons, residents and
        // fellows") is not lost — the original renders it above the card grid.
        // Some templates NEST the section-title marker inside a content section
        // (e.g. the portfolio grid wraps a .c-section-title beside its product
        // items). In that case, open the anchored section AND fall through to
        // extract the content, rather than returning early and losing the grid.
        const type = componentType(node);
        const titleEl = anchorTitleEl(node);
        if (titleEl && (titleEl.getAttribute('data-title') || text(titleEl))) {
          flushCards();
          const label = titleEl.getAttribute('data-title') || text(titleEl);
          current = { anchorLabel: label || '', nodes: [] };
          sectionsOut.push(current);
          if (label) current.nodes.push(el(document, 'h2', label));
          // A pre-collapsed stat run (see collapseStatRun) carries its finished
          // stats-stryker block; emit it here and stop.
          if (node._statsBlock || titleEl._statsBlock) {
            current.nodes.push(node._statsBlock || titleEl._statsBlock);
            blockNames.push('stats-stryker');
            return;
          }
          // Only a bare title marker stops here; a node that also carries real
          // content (a recognized component or product/card items) continues to
          // the extractor below so that content isn't dropped.
          const hasContent = (type && EXTRACTORS[type] && type !== 'c-section-title')
            || node.querySelector('.product-item, .item, .xf-master-building-block');
          if (!hasContent) return;
        }

        // Any other unit flushes buffered cards, then extracts. Recognized
        // components use their extractor; everything else falls back to a
        // lossless text/image capture so no copy is dropped.
        flushCards();
        const extractor = type ? EXTRACTORS[type] : null;
        try {
          // A run of image+title link cards (e.g. "Learn more about us") →
          // cards-stryker. Checked BEFORE the per-type extractor because such a
          // section resolves to c-standalone-image (which would emit just one
          // image); the multi-cell grid must win.
          let produced = null;
          if (node.querySelectorAll('.c-standalone-image-content').length >= 2) {
            produced = extractLinkCardGrid(document, node);
          }
          // A values grid (3+ bold-heading + subtext text cards, no images) →
          // plain-theme stats-stryker. Checked before the per-type extractor
          // since the section has no distinguishing c-type.
          if ((!produced || !produced.length)
            && node.querySelectorAll('p .futura-bold').length >= 3
            && node.querySelectorAll('img').length === 0) {
            produced = extractValueCards(document, node);
          }
          // The grouped-link list heading is already emitted as an <h2> by the
          // section-title branch (e.g. "Our businesses"), so pass a blank
          // heading to avoid duplicating it inside the block.
          if (!produced || !produced.length) {
            produced = extractor
              ? (type === 'c-grouplist'
                ? extractor(document, node, '')
                : extractor(document, node))
              : null;
          }
          // Unrecognized band that looks like a heading + blurb + CTA + banner
          // image (e.g. "Training Calendar") → get-to-know-us-stryker.
          if ((!produced || !produced.length) && isPromoPanel(node)) {
            produced = extractPromoPanel(document, node);
          }
          if (!produced || !produced.length) produced = extractAllContent(document, node);
          if (produced && produced.length) {
            current.nodes.push(...produced);
            // A recognized extractor has fully represented this node's content
            // (as block(s) or a consolidated heading), so exclude its subtree
            // from the safety-net sweep — otherwise mobile/desktop duplicate copy
            // or the sub-fragments it collapsed get re-emitted as loose content.
            // (extractAllContent, the lossless fallback, is NOT a recognized
            // extractor, so its nodes stay sweepable.)
            if (extractor || produced[0]?.tagName === 'TABLE') consumedScopes.push(node);
          }
        } catch (compErr) {
          const fallback = extractAllContent(document, node);
          if (fallback) current.nodes.push(...fallback);
          else current.nodes.push(errorBlock(document, `failed to extract ${type || node.className || 'node'} — ${compErr.message}`));
        }
      };

      units.forEach(processNode);
      flushCards();

      // Disclaimers/legal text often live in .c-disclaimer elements OUTSIDE the
      // content root (directly under <body>). Collect any that weren't already
      // captured into the deferred legal collector so no legal copy is lost.
      document.querySelectorAll('.c-disclaimer p, .c-disclaimer').forEach((d) => {
        // Only leaf .c-disclaimer paragraphs (avoid grabbing container twice).
        if (d.matches('.c-disclaimer') && d.querySelector('p')) return;
        pushLegal(d.innerHTML.trim(), text(d));
      });

      const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
      // Aggressive key for dedup: lowercase alphanumerics only, so differences
      // in whitespace, punctuation and entity encoding (e.g. curly vs straight
      // apostrophes) never cause a false match.
      const key = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

      // Safety net (maximal capture): some Stryker panels render copy in styled
      // <div>/<span> rather than headings/paragraphs (e.g. "People are at the
      // heart", "Corporate responsibility", "Awards"). Sweep every text-bearing
      // LEAF in the content area and append anything not already captured, so no
      // copy is missed. This intentionally also pulls in some non-article text
      // (widget/mobile-nav/cookie scaffolding) — an accepted trade-off for
      // guaranteed completeness; that surplus can be trimmed after import.
      let capturedKey = '';
      sectionsOut.forEach((sec) => sec.nodes.forEach((node) => {
        capturedKey += key(text(node));
      }));
      // Include deferred legal copy so the sweep never re-captures it loosely.
      legalParas.forEach((p) => { capturedKey += key(p.plain); });
      // Seed from the FULL text of every consumed scope (a unit an extractor
      // turned into a block). The block's cells reword/split the source (e.g. a
      // stats block emits "61"/"in countries" from a "in 61 countries" leaf), so
      // the emitted-node keys above miss the original prose. Adding each scope's
      // raw subtree text means the sweep won't re-emit that unit's mobile/desktop
      // duplicate copy as loose content.
      consumedScopes.forEach((scope) => { capturedKey += key(text(scope)); });
      // A "text leaf" directly holds text not wholly provided by a single child.
      // For div/span candidates we additionally require that the node is NOT a
      // multi-block container: a wrapper holding several <p>/<h*>/<li> children
      // is a container whose pieces are captured individually, and grabbing its
      // combined text would both duplicate that copy and dodge the dedup key
      // (the aggregate key never matches any single captured paragraph).
      const isTextLeaf = (n) => {
        const t = norm(text(n));
        if (!t || t.length < 3) return false;
        if (/^(DIV|SPAN)$/.test(n.tagName)
          && n.querySelector('p, h1, h2, h3, h4, h5, h6, li, ul, ol')) return false;
        return ![...n.children].some((c) => norm(text(c)) === t);
      };
      // Well-known non-article scaffolding to skip even in "capture everything"
      // mode: the OneTrust cookie modal, video-player widgets, mobile-nav
      // overlays, and hidden aria elements. This trims obvious junk while still
      // capturing all real copy (including div/span-only panels).
      const JUNK = [
        '[id*="onetrust"]', '[class*="onetrust"]', '[class*="ot-sdk"]',
        '[class*="cookie"]', '[class*="privacy-preference"]',
        '[class*="video-viewer"]', '[class*="video-content"]', '[class*="video-dynamic"]',
        '[class*="s7"]', '[id*="s7"]', '[class*="scene7"]', '[data-widget*="video"]',
        '[class*="cq-dd-image"]', '[class*="dynamicmedia"]',
        '[class*="mobile-nav"]', '[class*="nav-overlay"]', '[class*="jumpbarnav"]',
        // Filter-grid widget chrome: hidden "No items were found" notice,
        // "Load More" button, and empty pager anchors.
        '.no-results', '.btn-load-more', '.load-more', '.filter-results',
        '[aria-hidden="true"]', '[hidden]', '.hidden',
      ].join(',');
      const missed = [];
      const queuedNodes = [];
      contentRoot.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, div, span').forEach((n) => {
        // Exclude true page chrome and known widget/modal scaffolding.
        if (n.closest('header, footer, nav')) return;
        if (n.closest(JUNK)) return;
        // Skip anything inside a collapsed stat run — it's already in the stats
        // block (its number/label text differs from the split cells, so the
        // dedup key wouldn't otherwise catch it).
        if (statScopes.some(({ scope }) => scope.contains(n))) return;
        if (consumedScopes.some((scope) => scope.contains(n))) return;
        if (curatedScopes.some((scope) => scope.contains(n))) return;
        if (!isTextLeaf(n)) return;
        const plain = norm(text(n));
        if (isJunkText(plain)) return; // drop known widget/nav/cookie chrome
        const k = key(plain);
        if (!k || capturedKey.includes(k)) return;
        if (queuedNodes.some((q) => q.contains(n) || n.contains(q))) return;
        capturedKey += k;
        queuedNodes.push(n);
        const styled = styledHeadingTag(n);
        if (styled) { missed.push(el(document, styled, plain)); return; }
        const tag = /^H[1-6]$/.test(n.tagName) ? n.tagName.toLowerCase() : 'p';
        missed.push(el(document, tag, n.innerHTML.trim() || plain));
      });
      if (missed.length) {
        current.nodes.push(document.createElement('hr'));
        missed.forEach((m) => current.nodes.push(m));
      }

      // Final junk scrub: remove leaked widget/config text from the constructed
      // nodes BEFORE they're assembled into `main` (post-assembly DOM edits are
      // ignored — the runner re-serialises the source). Only touches loose
      // paragraphs/headings/list items whose text is known junk; never removes
      // anything inside a block table.
      sectionsOut.forEach((sec) => {
        sec.nodes.forEach((node) => {
          if (!node.querySelectorAll) return;
          if (node.matches && node.matches('table')) return;
          node.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach((leaf) => {
            if (leaf.closest('table')) return;
            if (![...leaf.children].some((c) => text(c) === text(leaf)) && isJunkText(text(leaf))) {
              leaf.remove();
            }
          });
          // If the node itself is a loose junk paragraph, drop it.
          if (node.matches && node.matches('p, h1, h2, h3, h4, h5, h6, li')
            && isJunkText(text(node)) && !node.querySelector('img, picture, a[href]')) {
            node._dropped = true;
          }
        });
        sec.nodes = sec.nodes.filter((n) => !n._dropped);
      });

      // Insert the sticky anchor nav into the first section (after the hero),
      // but only when the source page actually renders one (see hasAnchorNav).
      if (hasAnchorNav) {
        sectionsOut[0].nodes.push(WebImporter.Blocks.createBlock(document, {
          name: 'section-anchor-stryker',
          cells: [['']],
        }));
        blockNames.push('section-anchor-stryker');
      }

      // Assemble: <hr> between sections, Section Metadata for labeled ones.
      sectionsOut.forEach((sec, idx) => {
        if (!sec.nodes.length && !sec.anchorLabel) return;
        if (idx > 0) main.append(document.createElement('hr'));
        sec.nodes.forEach((n) => main.append(n));
        // Emit the anchorLabel Section Metadata only when the page has the
        // rendered jump nav; otherwise it's orphan metadata with nothing to
        // drive.
        if (sec.anchorLabel && hasAnchorNav) {
          main.append(WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { anchorLabel: sec.anchorLabel },
          }));
        }
      });

      // Legal text is ALWAYS the last content block: emit the collected
      // disclaimer paragraphs as a single legal-text-stryker after every
      // section (its own EDS section, separated by an <hr>).
      if (legalParas.length) {
        main.append(document.createElement('hr'));
        main.append(WebImporter.Blocks.createBlock(document, {
          name: 'legal-text-stryker',
          cells: [[el(document, 'div', legalParas.map((p) => `<p>${p.html}</p>`).join(''))]],
        }));
        blockNames.push('legal-text-stryker');
      }

      // Post-assembly dedup: Stryker serves duplicate DOM (mobile + desktop
      // copies) and the aggressive safety-net sweep can re-emit copy the
      // structured walk already placed. Remove any top-level loose
      // paragraph/heading/list whose text duplicates one seen earlier. Block
      // tables (cards/tabs/etc.) are left intact so their internal structure is
      // never corrupted; their whole-text key is still recorded so later loose
      // duplicates of block copy are dropped.
      // Record the text-key of every element INSIDE block tables (cards/tabs/
      // etc.) — both whole cells and their text leaves — so loose paragraphs
      // that merely repeat block copy are dropped, while the blocks themselves
      // stay structurally intact.
      // A metadata table (Section Metadata / metadata) holds authoring values,
      // not page content, so its cells must NOT seed the dedup set — otherwise a
      // visible section heading that matches its anchorLabel gets wrongly dropped.
      const isMetaTable = (tbl) => /^(section metadata|metadata)$/i
        .test(text(tbl.querySelector('tr')).trim());
      const seenTextKeys = new Set();
      main.querySelectorAll('table td, table th, table p, table h1, table h2, table h3, table h4, table li').forEach((c) => {
        if (isMetaTable(c.closest('table'))) return;
        const k = key(text(c));
        if (k) seenTextKeys.add(k);
      });
      // Walk loose paragraphs/headings/list-items in document order; drop any
      // whose text was already seen (block copy or an earlier loose copy). Skip
      // anything inside a block table (its structure must stay intact).
      main.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach((n) => {
        if (n.closest('table')) return;
        const k = key(text(n));
        if (!k) return;
        if (seenTextKeys.has(k)) { n.remove(); return; }
        seenTextKeys.add(k);
      });

      // Image dedup: the aggressive sweep re-captures card/gallery images as
      // loose <img> even though they already live inside a block (cards-stryker
      // etc.). Record every image already inside a block table, then drop loose
      // duplicates. Images are keyed by the media-asset slug (path minus query),
      // so the same asset at different presets is still recognised as a dup.
      const imgKey = (src) => {
        if (!src) return '';
        try { return new URL(src, 'https://x').pathname.toLowerCase(); } catch (e) { return src.split('?')[0].toLowerCase(); }
      };
      const seenImgKeys = new Set();
      main.querySelectorAll('table img').forEach((img) => {
        const k = imgKey(imgSrc(img));
        if (k) seenImgKeys.add(k);
      });
      main.querySelectorAll('img').forEach((img) => {
        if (img.closest('table')) return; // keep block-internal images
        const k = imgKey(imgSrc(img));
        if (!k) return;
        if (seenImgKeys.has(k)) {
          // Remove the image and its wrapping <picture>/<a>/<p> if now empty.
          const pic = img.closest('picture') || img;
          const wrap = pic.closest('a, p');
          pic.remove();
          if (wrap && !text(wrap) && !wrap.querySelector('img, picture')) wrap.remove();
          return;
        }
        seenImgKeys.add(k);
      });

      // Link dedup: the sweep captures a card's `.desc-container` ("Title Learn
      // more"); the text-dedup above then strips the title (it matches a card
      // cell) but leaves the CTA anchor behind as a loose "Learn more". Record
      // every href already inside a block table, then drop loose anchors that
      // duplicate one — removing the wrapping <p> if it becomes empty.
      const linkKey = (href) => {
        if (!href || href === '#') return '';
        try { return new URL(href, 'https://x').pathname.toLowerCase(); } catch (e) { return href.split('?')[0].toLowerCase(); }
      };
      const seenLinkKeys = new Set();
      main.querySelectorAll('table a[href]').forEach((a) => {
        const k = linkKey(a.getAttribute('href'));
        if (k) seenLinkKeys.add(k);
      });
      main.querySelectorAll('a[href]').forEach((a) => {
        if (a.closest('table')) return; // keep block-internal links
        if (a.querySelector('img, picture')) return; // keep image links
        const k = linkKey(a.getAttribute('href'));
        if (!k || !seenLinkKeys.has(k)) return;
        const wrap = a.closest('p') || a;
        a.remove();
        if (wrap !== a && !text(wrap) && !wrap.querySelector('img, picture, a[href]')) wrap.remove();
      });

      // Page metadata.
      main.append(document.createElement('hr'));
      main.append(WebImporter.Blocks.createBlock(document, {
        name: 'metadata',
        cells: {
          Title: pageTitle,
          theme: 'stryker',
          nav: '/content/stryker/nav',
          footer: '/content/stryker/footer',
        },
      }));

      return [{
        element: main,
        path,
        report: { title: pageTitle, template: 'stryker-generic', blocks: blockNames },
      }];
    } catch (err) {
      main.append(errorBlock(document, err && err.message ? err.message : String(err)));
      return [{
        element: main,
        path: '/stryker/imported',
        report: { title: 'Stryker Import', template: 'stryker-generic', blocks: ['error'] },
      }];
    }
  },
};
