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

// c-largeheadline → a two-tone heading. Stryker nests color spans; we keep the
// plain text as an <h2> (default content) so it round-trips simply.
function extractLargeHeadline(document, section) {
  const label = text(section.querySelector('.largeheadline')) || text(section);
  if (!label) return null;
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
  // Description = paragraphs that aren't the heading or the CTA label.
  const ctaLabel = text(cta);
  const desc = [...panel.querySelectorAll('p')]
    .map((p) => ({ html: p.innerHTML.trim(), plain: text(p) }))
    .filter((p) => p.plain && p.plain !== headingText && p.plain !== ctaLabel)
    .map((p) => `<p>${p.html}</p>`)
    .join('');
  const bodyHtml = `${headingText ? `<h2>${headingText}</h2>` : ''}${desc}`;
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

// c-full-bleed-panel → an experience-fragment promo (image + text). Recover the
// image and any heading/paragraphs as default content; skip if empty.
function extractFullBleedPanel(document, section) {
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
    if (t && !isJunkText(text(n))) nodes.push(el(document, n.tagName.toLowerCase(), t));
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
  'c-tabs': extractTabs,
  'c-text': extractText,
  // c-title / c-tagline hold a hydrated heading or tagline; emit their text.
  'c-title': extractText,
  'c-tagline': extractText,
  // c-ourcompany is an empty JS-hydrated placeholder; falls through to
  // extractText which returns null, so it is safely skipped.
};

// Identify the c-{type} token on an element (searches its own classes, then a
// descendant/ancestor that carries one).
function componentType(section) {
  const own = [...(section.classList || [])].find((c) => c.startsWith('c-'));
  if (own) return own;
  const inner = section.querySelector?.('[class]');
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

      const contentRoot = document.querySelector('main') || document.body;

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
      ].join(',');
      const all = [...contentRoot.querySelectorAll(SELECTOR)]
        // Drop header/footer chrome and hidden scaffolding.
        .filter((n) => !n.closest('header, footer, nav'));
      // Keep only outermost units (skip any node contained by another selected
      // node) so each piece of content is emitted exactly once.
      const units = all.filter((n) => !all.some((o) => o !== n && o.contains(n)));

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

        // Section-title / anchor → open a new EDS section.
        const titleEl = anchorTitleEl(node);
        if (titleEl && (titleEl.getAttribute('data-title') || text(titleEl))) {
          flushCards();
          const label = titleEl.getAttribute('data-title') || text(titleEl);
          current = { anchorLabel: label || '', nodes: [] };
          sectionsOut.push(current);
          return;
        }

        // Any other unit flushes buffered cards, then extracts. Recognized
        // components use their extractor; everything else falls back to a
        // lossless text/image capture so no copy is dropped.
        flushCards();
        const type = componentType(node);
        const extractor = type ? EXTRACTORS[type] : null;
        try {
          let produced = extractor ? extractor(document, node) : null;
          // Unrecognized band that looks like a heading + blurb + CTA + banner
          // image (e.g. "Training Calendar") → get-to-know-us-stryker.
          if ((!produced || !produced.length) && isPromoPanel(node)) {
            produced = extractPromoPanel(document, node);
          }
          if (!produced || !produced.length) produced = extractAllContent(document, node);
          if (produced && produced.length) current.nodes.push(...produced);
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
      // A "text leaf" directly holds text not wholly provided by a single child.
      const isTextLeaf = (n) => {
        const t = norm(text(n));
        if (!t || t.length < 3) return false;
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
        '[aria-hidden="true"]', '[hidden]',
      ].join(',');
      const missed = [];
      const queuedNodes = [];
      contentRoot.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, div, span').forEach((n) => {
        // Exclude true page chrome and known widget/modal scaffolding.
        if (n.closest('header, footer, nav')) return;
        if (n.closest(JUNK)) return;
        if (!isTextLeaf(n)) return;
        const plain = norm(text(n));
        if (isJunkText(plain)) return; // drop known widget/nav/cookie chrome
        const k = key(plain);
        if (!k || capturedKey.includes(k)) return;
        if (queuedNodes.some((q) => q.contains(n) || n.contains(q))) return;
        capturedKey += k;
        queuedNodes.push(n);
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

      // Insert the sticky anchor nav into the first section (after the hero).
      sectionsOut[0].nodes.push(WebImporter.Blocks.createBlock(document, {
        name: 'section-anchor-stryker',
        cells: [['']],
      }));
      blockNames.push('section-anchor-stryker');

      // Assemble: <hr> between sections, Section Metadata for labeled ones.
      sectionsOut.forEach((sec, idx) => {
        if (!sec.nodes.length && !sec.anchorLabel) return;
        if (idx > 0) main.append(document.createElement('hr'));
        sec.nodes.forEach((n) => main.append(n));
        if (sec.anchorLabel) {
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
      const seenTextKeys = new Set();
      main.querySelectorAll('table td, table th, table p, table h1, table h2, table h3, table h4, table li').forEach((c) => {
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
