import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Stryker sites use a dedicated footer decorator.
  if (document.body.classList.contains('theme-stryker')) {
    const { default: decorateStrykerFooter } = await import('./footer-stryker.js');
    await decorateStrykerFooter(block);
    return;
  }

  // load footer as fragment
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  footerPath = footerPath.replace(/^\/content\/aem-boilerplate-nr/, '');
  if (footerPath.startsWith('/content/') && !footerPath.startsWith('/content/dam/')) {
    footerPath = footerPath.replace(/^\/content/, '');
  }
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
