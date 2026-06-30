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
function extractVideo(document, section) {
  const a = section.querySelector('a[href*="youtu"], a[href*="vimeo"]');
  const iframe = section.querySelector('iframe[src]');
  const url = a?.getAttribute('href') || iframe?.getAttribute('src') || FALLBACK_VIDEO;
  return [WebImporter.Blocks.createBlock(document, {
    name: 'video-stryker',
    cells: [[anchorNode(document, isUsableUrl(url) ? url : FALLBACK_VIDEO, url)], ['']],
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

// c-full-bleed-panel → an experience-fragment promo (image + text). Recover the
// image and any heading/paragraphs as default content; skip if empty.
function extractFullBleedPanel(document, section) {
  const nodes = [];
  const img = section.querySelector('img');
  if (img) nodes.push(imgNode(document, imgSrc(img), img.getAttribute('alt') || ''));
  section.querySelectorAll('h1, h2, h3, h4, p').forEach((n) => {
    const t = n.innerHTML.trim();
    if (t) nodes.push(el(document, n.tagName.toLowerCase(), t));
  });
  return nodes.length ? nodes : null;
}

// c-disclaimer/c-section-title are handled inline; this covers generic text
// components (headings + paragraphs) as default content.
function extractText(document, section) {
  const nodes = [];
  section.querySelectorAll('h1, h2, h3, h4, p').forEach((n) => {
    const t = n.innerHTML.trim();
    if (t) nodes.push(el(document, n.tagName.toLowerCase(), t));
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
  'c-tabs': extractTabs,
  'c-text': extractText,
};

// Identify the c-{type} token on a page-section element.
function componentType(section) {
  return [...section.classList].find((c) => c.startsWith('c-')) || null;
}

export default {
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

      // Walk the page-sections in document order, grouping them into EDS
      // sections that break at each c-section-title (anchor) component.
      const pageSections = [...document.querySelectorAll('.page-section')]
        // Only top-level page-sections (skip ones nested in experience fragments
        // that duplicate hero content).
        .filter((s) => !s.closest('.experienceFragment-ef, .experienceFragment-ef-mobile') || s === document.querySelector('.page-section'));

      // sectionsOut: array of { anchorLabel, nodes: [] }. First section holds
      // the hero + anchor block.
      const sectionsOut = [{ anchorLabel: '', nodes: [] }];
      let current = sectionsOut[0];

      pageSections.forEach((section) => {
        const type = componentType(section);

        // A section-title opens a new EDS section with an anchor label.
        if (type === 'c-section-title' || section.classList.contains('jumpbarparsys')) {
          const label = section.getAttribute('data-title') || text(section);
          current = { anchorLabel: label || '', nodes: [] };
          sectionsOut.push(current);
          return;
        }

        const extractor = EXTRACTORS[type];
        try {
          const produced = extractor ? extractor(document, section) : extractText(document, section);
          if (produced && produced.length) current.nodes.push(...produced);
        } catch (compErr) {
          current.nodes.push(errorBlock(document, `failed to extract ${type || 'section'} — ${compErr.message}`));
        }
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
