import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  let navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  navPath = navPath.replace(/^\/content\/aem-boilerplate-nr/, '');
  if (navPath.startsWith('/content/') && !navPath.startsWith('/content/dam/')) {
    navPath = navPath.replace(/^\/content/, '');
  }
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // Extract content sections from the fragment's default-content-wrapper
  const navContent = fragment.querySelector('.default-content-wrapper');
  if (navContent) {
    while (navContent.firstElementChild) nav.append(navContent.firstElementChild);
  } else {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  // Rewrite links delivered by AEM with /content/ prefix to EDS-relative paths
  nav.querySelectorAll('a[href]').forEach((a) => {
    let href = a.getAttribute('href');
    if (href) {
      href = href.replace(/^\/content\/aem-boilerplate-nr/, '');
      if (href.startsWith('/content/') && !href.startsWith('/content/dam/')) {
        href = href.replace(/^\/content/, '');
      }
      href = href.replace(/\.html$/, '');
      a.setAttribute('href', href);
    }
  });

  // Identify nav children: first non-sections child is brand, rest are tools
  const navChildren = [...nav.children].filter((c) => c.tagName !== 'DIV' || !c.classList.contains('nav-hamburger'));
  let brandFound = false;
  navChildren.forEach((child) => {
    if (child.tagName === 'UL' || child.querySelector(':scope > ul')) {
      child.classList.add('nav-sections');
    } else if (child.querySelector('picture, img') || !brandFound) {
      child.classList.add('nav-brand');
      brandFound = true;
    } else {
      child.classList.add('nav-tools');
    }
  });

  // Wrap bare <ul> nav-sections in a div for proper styling
  const bareUl = nav.querySelector(':scope > ul.nav-sections');
  if (bareUl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-sections';
    bareUl.classList.remove('nav-sections');
    bareUl.before(wrapper);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'default-content-wrapper';
    contentDiv.append(bareUl);
    wrapper.append(contentDiv);
  }

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button') || navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const container = brandLink.closest('.button-container');
      if (container) container.className = '';
      const existingImg = brandLink.querySelector('img');
      if (existingImg) {
        const src = existingImg.getAttribute('src') || '';
        const publishPrefix = 'https://publish-p63260-e524717.adobeaemcloud.com';
        if (src.startsWith(publishPrefix)) {
          existingImg.src = src.replace(publishPrefix, '');
        }
        existingImg.className = 'nav-brand-logo';
      } else {
        const logoMeta = getMetadata('logo');
        const logoPath = logoMeta || '/content/dam/asset-share-commons/en/site/Logo-light.png';
        const logoImg = document.createElement('img');
        logoImg.src = logoPath;
        logoImg.alt = 'Home';
        logoImg.className = 'nav-brand-logo';
        brandLink.textContent = '';
        brandLink.append(logoImg);
      }
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Add cart count badge to the Cart link
  const cartLink = nav.querySelector('.nav-tools a');
  if (cartLink && cartLink.textContent.trim().toLowerCase() === 'cart') {
    const badge = document.createElement('span');
    badge.className = 'cart-badge';
    badge.textContent = '0';
    badge.style.display = 'none';
    cartLink.append(badge);

    const updateBadge = () => {
      import('../../scripts/cart.js').then(({ cartSize }) => {
        const count = cartSize();
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
      });
    };
    updateBadge();
    document.addEventListener('cart:update', updateBadge);
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
