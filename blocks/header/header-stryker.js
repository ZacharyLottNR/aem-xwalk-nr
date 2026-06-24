import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function navPathFromMeta() {
  const navMeta = getMetadata('nav');
  let navPath = navMeta ? new URL(navMeta, window.location).pathname : '/stryker/nav';
  // Published EDS (.aem.page) serves fragments without the /content mountpoint
  // prefix; strip it so the fragment resolves on both local and published.
  navPath = navPath.replace(/^\/content\/aem-boilerplate-nr/, '');
  if (navPath.startsWith('/content/') && !navPath.startsWith('/content/dam/')) {
    navPath = navPath.replace(/^\/content/, '');
  }
  return navPath;
}

function cleanHref(a) {
  let href = a.getAttribute('href');
  if (!href) return;
  href = href.replace(/^\/content\/aem-boilerplate-nr/, '');
  if (href.startsWith('/content/') && !href.startsWith('/content/dam/')) {
    href = href.replace(/^\/content/, '');
  }
  href = href.replace(/\.html$/, '');
  a.setAttribute('href', href);
}

export default async function decorate(block) {
  const fragment = await loadFragment(navPathFromMeta());
  if (!fragment) return;

  // Fragment sections, in authored order: utility links, brand, main nav, locale.
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [utilitySec, brandSec, mainSec, localeSec] = sections;

  block.textContent = '';
  block.querySelectorAll('a[href]').forEach(cleanHref);

  const header = document.createElement('div');
  header.className = 'nav-stryker';

  // --- Global utility bar (top): brand + utility links + locale ---
  const globalBar = document.createElement('div');
  globalBar.className = 'nav-stryker-global';
  const globalInner = document.createElement('div');
  globalInner.className = 'nav-stryker-global-inner';

  const brand = document.createElement('div');
  brand.className = 'nav-stryker-brand';
  const brandLink = brandSec?.querySelector('a');
  if (brandLink) {
    // EDS button-decoration turns the image-only brand link into a .button;
    // strip that so it renders as the plain logo link.
    brandLink.classList.remove('button');
    brandLink.closest('p')?.classList.remove('button-container');
    // If the optimized <picture> was dropped, restore the logo image.
    if (!brandLink.querySelector('img')) {
      const logo = document.createElement('img');
      logo.src = '/icons/stryker-logo.svg';
      logo.alt = 'Stryker';
      brandLink.append(logo);
    }
    brand.append(brandLink);
  }

  const utility = document.createElement('nav');
  utility.className = 'nav-stryker-utility';
  utility.setAttribute('aria-label', 'Utility');
  const utilityList = utilitySec?.querySelector('ul');
  if (utilityList) utility.append(utilityList);

  const locale = document.createElement('div');
  locale.className = 'nav-stryker-locale';
  const localeSrc = localeSec?.querySelector('a, p');
  if (localeSrc) {
    // The locale arrives wrapped as a CTA (button-container + .button); strip
    // those so it renders as a plain text link, then prefix the globe icon.
    const localeLink = localeSrc.tagName === 'A' ? localeSrc : localeSrc.querySelector('a');
    if (localeLink) {
      localeLink.classList.remove('button');
      const globe = document.createElement('span');
      globe.className = 'nav-stryker-globe';
      globe.setAttribute('aria-hidden', 'true');
      localeLink.prepend(globe);
    }
    if (localeSrc.classList) localeSrc.classList.remove('button-container');
    locale.append(localeSrc);
  }

  // Search field (visual only — no search backend wired up yet).
  const search = document.createElement('div');
  search.className = 'nav-stryker-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search this site';
  searchInput.setAttribute('aria-label', 'Search this site');
  const searchIcon = document.createElement('span');
  searchIcon.className = 'nav-stryker-search-icon';
  searchIcon.setAttribute('aria-hidden', 'true');
  search.append(searchInput, searchIcon);

  // Hamburger toggle (mobile/tablet)
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-stryker-hamburger';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';

  globalInner.append(hamburger, brand, utility, locale, search);
  globalBar.append(globalInner);

  // --- Main nav bar with megamenu dropdowns ---
  const mainBar = document.createElement('nav');
  mainBar.className = 'nav-stryker-main';
  mainBar.setAttribute('aria-label', 'Main');
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-stryker-main-inner';
  const topList = mainSec?.querySelector('ul');

  if (topList) {
    cleanHref(topList); // no-op safety
    const currentPath = window.location.pathname.replace(/\.html$/, '');

    // EDS auto-wraps standalone links in <p>; unwrap so the top-level link is a
    // direct child of the <li> (matches our selectors + CSS, avoids button look).
    topList.querySelectorAll(':scope > li > p').forEach((p) => {
      if (p.children.length === 1 && p.firstElementChild.tagName === 'A') {
        p.replaceWith(p.firstElementChild);
      }
    });

    // EDS button-decoration adds .button to standalone links, giving them the
    // teal CTA background. Strip it from every nav link so they render plain.
    topList.querySelectorAll('a.button').forEach((a) => a.classList.remove('button'));
    topList.querySelectorAll('.button-container').forEach((el) => el.classList.remove('button-container'));

    [...topList.children].forEach((li) => {
      const link = li.querySelector(':scope > a');
      const submenu = li.querySelector(':scope > ul');
      li.classList.add('nav-stryker-item');

      if (submenu) {
        li.classList.add('nav-stryker-has-menu');
        const panel = document.createElement('div');
        panel.className = 'nav-stryker-panel';
        const panelInner = document.createElement('div');
        panelInner.className = 'nav-stryker-panel-inner';
        // The submenu's direct children are column groups; a group with a
        // leading heading (<p>/<strong>) spans wider and lists its links in
        // sub-columns, matching the source "Our Business" layout.
        submenu.querySelectorAll(':scope > li').forEach((group) => {
          group.classList.add('nav-stryker-group');
          if (group.querySelector(':scope > p, :scope > strong, :scope > h2, :scope > h3')) {
            group.classList.add('nav-stryker-group-titled');
          }
        });
        panelInner.append(submenu);
        panel.append(panelInner);
        li.append(panel);

        // Open the megamenu on click (desktop + mobile), like the source.
        if (link) {
          link.setAttribute('aria-haspopup', 'true');
          link.setAttribute('aria-expanded', 'false');
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const willOpen = !li.classList.contains('is-open');
            // close any other open menu first
            mainBar.querySelectorAll('.nav-stryker-has-menu.is-open').forEach((other) => {
              if (other !== li) {
                other.classList.remove('is-open');
                other.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
              }
            });
            li.classList.toggle('is-open', willOpen);
            link.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          });
        }
      }

      // Active state for the current section.
      if (link && link.getAttribute('href') === currentPath) {
        li.classList.add('is-active');
      }
    });

    mainInner.append(topList);
  }
  mainBar.append(mainInner);

  // Close any open megamenu when clicking outside it.
  const closeAllMenus = () => {
    mainBar.querySelectorAll('.nav-stryker-has-menu.is-open').forEach((li) => {
      li.classList.remove('is-open');
      li.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
    });
  };
  document.addEventListener('click', (e) => {
    if (!mainBar.contains(e.target)) closeAllMenus();
  });

  header.append(globalBar, mainBar);
  block.append(header);

  block.querySelectorAll('a[href]').forEach(cleanHref);

  // Mobile drawer toggle
  const closeMenu = () => {
    block.classList.remove('nav-stryker-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflowY = '';
  };
  const openMenu = () => {
    block.classList.add('nav-stryker-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflowY = 'hidden';
  };
  hamburger.addEventListener('click', () => {
    if (block.classList.contains('nav-stryker-open')) closeMenu();
    else openMenu();
  });

  // Reset menu state when crossing the desktop breakpoint.
  isDesktop.addEventListener('change', () => {
    closeMenu();
    closeAllMenus();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeMenu();
      closeAllMenus();
    }
  });
}
