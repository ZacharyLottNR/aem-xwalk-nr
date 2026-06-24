import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * Optimize a block image in place, but only when it is safe to do so.
 * createOptimizedPicture rewrites the URL to a same-origin path and strips the
 * query string, which breaks external/CDN images (e.g. Scene7 media-assets URLs
 * that rely on their host and query params). For cross-origin images we leave
 * the original <img> untouched.
 * @param {HTMLImageElement} img the image to (maybe) optimize
 * @param {Function} createOptimizedPicture the aem.js helper
 * @param {object[]} breakpoints optional breakpoints for the optimized picture
 */
export function optimizeBlockImage(img, createOptimizedPicture, breakpoints = [{ width: '750' }]) {
  if (!img) return;
  let external = false;
  try {
    external = new URL(img.src, window.location.href).origin !== window.location.origin;
  } catch (e) { /* treat unparseable as local */ }
  if (external) return; // keep original external image as-is
  const optimized = createOptimizedPicture(img.src, img.alt, false, breakpoints);
  moveInstrumentation(img, optimized.querySelector('img'));
  img.closest('picture').replaceWith(optimized);
}

/**
 * Convert a nested block authored as an HTML table into the block-div structure
 * EDS expects. The content importer emits child blocks (block-in-block) as
 * literal <table> elements, which the renderer does not auto-convert because it
 * only processes top-level block tables. Container blocks call this so their
 * nested children decorate correctly both from imported content and from the
 * Universal Editor (where children already arrive as block divs).
 * @param {Element} table the nested table element
 * @returns {Element} a block div (`<div class="block-name">` with row/cell divs)
 */
export function tableToBlock(table) {
  const headerText = table.querySelector('thead th, thead td')?.textContent?.trim() || '';
  const className = headerText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const block = document.createElement('div');
  if (className) block.className = className;

  table.querySelectorAll(':scope > tbody > tr').forEach((tr) => {
    const row = document.createElement('div');
    [...tr.children].forEach((td) => {
      const cell = document.createElement('div');
      cell.append(...td.childNodes);
      row.append(cell);
    });
    block.append(row);
  });

  return block;
}

/**
 * Normalize a container block's children into nested block divs, converting any
 * imported <table> children via tableToBlock. Returns the resolved block divs.
 * @param {Element} container the parent block element
 * @param {string} blockName the expected nested block class name
 * @returns {Element[]} the nested block elements
 */
export function resolveNestedBlocks(container, blockName) {
  const blocks = [];
  [...container.children].forEach((child) => {
    const table = child.querySelector(':scope table') || (child.tagName === 'TABLE' ? child : null);
    if (table) {
      const converted = tableToBlock(table);
      converted.classList.add(blockName);
      child.replaceWith(converted);
      blocks.push(converted);
    } else {
      child.classList.add(blockName);
      blocks.push(child);
    }
  });
  return blocks;
}

/**
 * Stryker image hover tooltip. Mirrors the source site, where content images
 * carry a `title` that surfaces as a dark pill on hover. A single delegated
 * handler covers every block regardless of when its images are decorated, and
 * we suppress the slow native tooltip by moving `title` into a data attribute.
 * @param {Element} root the element to scope the handler to (defaults to body)
 */
export function enableStrykerImageTooltips(root = document.body) {
  if (root.dataset.strykerTooltips === 'on') return;
  root.dataset.strykerTooltips = 'on';

  const pill = document.createElement('div');
  pill.className = 'stryker-img-tooltip';
  pill.setAttribute('role', 'tooltip');
  pill.hidden = true;
  document.body.append(pill);

  // Tooltip text: explicit title (preferred) or the image alt, mirroring the
  // source where title == alt. Only content images inside a block qualify.
  const tipText = (t) => {
    if (!t || t.tagName !== 'IMG' || !t.closest('main .block')) return '';
    return t.dataset.tooltip || t.title || t.alt || '';
  };

  const move = (e) => {
    pill.style.left = `${e.clientX}px`;
    pill.style.top = `${e.clientY}px`;
  };

  root.addEventListener('mouseover', (e) => {
    const img = e.target;
    const text = tipText(img);
    if (!text) return;
    if (img.title) {
      img.dataset.tooltip = img.title;
      img.removeAttribute('title'); // suppress the slow native tooltip
    }
    pill.textContent = text;
    pill.hidden = false;
    move(e);
  });
  root.addEventListener('mousemove', (e) => {
    if (!pill.hidden && tipText(e.target)) move(e);
  });
  root.addEventListener('mouseout', (e) => {
    if (tipText(e.target)) pill.hidden = true;
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (document.body.classList.contains('theme-stryker')) {
    await loadCSS(`${window.hlx.codeBasePath}/styles/stryker.css`);
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  if (document.body.classList.contains('theme-stryker')) {
    enableStrykerImageTooltips(doc.body);
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
