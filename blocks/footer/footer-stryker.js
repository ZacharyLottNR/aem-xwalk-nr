import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const SOCIAL_ICONS = ['youtube', 'facebook', 'linkedin', 'instagram', 'twitter', 'tiktok'];

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
  const footerMeta = getMetadata('footer');
  // Stryker fragments live under /content/stryker/; keep the path as authored.
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/stryker/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  // Authored sections: 0 disclaimer + legal links, 1 social links, 2 secondary links.
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [disclaimerSec, socialSec, secondarySec] = sections;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-stryker';

  // Top row: disclaimer + legal links (left) and social icons (right).
  const topRow = document.createElement('div');
  topRow.className = 'footer-stryker-top';

  const legal = document.createElement('div');
  legal.className = 'footer-stryker-legal';
  if (disclaimerSec) {
    [...disclaimerSec.children].forEach((c) => legal.append(c));
  }

  const social = document.createElement('div');
  social.className = 'footer-stryker-social';
  const socialList = socialSec?.querySelector('ul');
  if (socialList) {
    socialList.querySelectorAll('a').forEach((a) => {
      const label = a.textContent.trim().toLowerCase();
      const icon = SOCIAL_ICONS.find((name) => label.includes(name));
      if (icon) {
        a.classList.add('footer-stryker-social-link', `footer-stryker-social-${icon}`);
        a.setAttribute('aria-label', a.textContent.trim());
        const img = document.createElement('img');
        img.src = `${window.hlx.codeBasePath}/icons/${icon}.svg`;
        img.alt = a.textContent.trim();
        img.loading = 'lazy';
        a.textContent = '';
        a.append(img);
      }
    });
    social.append(socialList);
  }

  topRow.append(legal, social);
  footer.append(topRow);

  // Secondary links row.
  if (secondarySec) {
    const secondary = document.createElement('div');
    secondary.className = 'footer-stryker-secondary';
    [...secondarySec.children].forEach((c) => secondary.append(c));
    footer.append(secondary);
  }

  footer.querySelectorAll('a[href]').forEach(cleanHref);
  block.append(footer);
}
