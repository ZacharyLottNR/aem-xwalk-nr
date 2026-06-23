import { loadCSS } from '../../scripts/aem.js';
import formDecorate from '../form/form.js';

// Reuse the out-of-the-box Adaptive Form engine, then layer Stryker styling.
// The base "form" class is added so the OOTB form CSS applies; form-stryker.css
// only carries the Stryker brand overrides.
export default async function decorate(block) {
  block.classList.add('form');
  await loadCSS(`${window.hlx.codeBasePath}/blocks/form/form.css`);
  await formDecorate(block);
}
