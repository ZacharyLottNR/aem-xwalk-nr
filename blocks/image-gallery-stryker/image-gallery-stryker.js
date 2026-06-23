import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  let heading = '';
  let description = '';
  let ctaText = '';
  let ctaHref = '';
  const imageRows = [];

  // Image rows contain a picture; the remaining rows carry the text fields in
  // model order: heading, description, cta text, cta url.
  const textRows = [];
  rows.forEach((row) => {
    if (row.querySelector('picture')) imageRows.push(row);
    else textRows.push(row);
  });

  [heading, description, ctaText] = textRows.map((r) => r.textContent.trim());
  const ctaUrlRow = textRows[3];
  ctaHref = ctaUrlRow?.querySelector('a')?.href || ctaUrlRow?.textContent?.trim() || '';

  block.textContent = '';

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'image-gallery-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  if (description) {
    const p = document.createElement('p');
    p.className = 'image-gallery-stryker-description';
    p.textContent = description;
    block.append(p);
  }

  const list = document.createElement('ul');
  list.className = 'image-gallery-stryker-list';

  imageRows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'image-gallery-stryker-item';
    moveInstrumentation(row, li);
    const picture = row.querySelector('picture');
    if (picture) li.append(picture);
    list.append(li);
  });

  block.append(list);

  if (ctaText && ctaHref) {
    const cta = document.createElement('a');
    cta.className = 'image-gallery-stryker-cta button';
    cta.href = ctaHref;
    cta.textContent = ctaText;
    block.append(cta);
  }

  list.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}
