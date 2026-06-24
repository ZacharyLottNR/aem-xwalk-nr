import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

function buildViewer(frames) {
  const viewer = document.createElement('div');
  viewer.className = 'product-preview-stryker-viewer';

  const stage = document.createElement('div');
  stage.className = 'product-preview-stryker-stage';

  frames.forEach((picture, i) => {
    picture.classList.add('product-preview-stryker-frame');
    if (i === 0) picture.classList.add('is-active');
    stage.append(picture);
  });

  viewer.append(stage);

  let current = 0;
  const total = frames.length;
  const show = (idx) => {
    frames[current]?.classList.remove('is-active');
    current = ((idx % total) + total) % total;
    frames[current]?.classList.add('is-active');
  };

  // Drag to rotate
  let dragging = false;
  let startX = 0;
  const sensitivity = 12; // px per frame step
  const onDown = (x) => { dragging = true; startX = x; stage.classList.add('is-dragging'); };
  const onMove = (x) => {
    if (!dragging) return;
    const delta = x - startX;
    if (Math.abs(delta) >= sensitivity) {
      show(current + (delta > 0 ? 1 : -1));
      startX = x;
    }
  };
  const onUp = () => { dragging = false; stage.classList.remove('is-dragging'); };

  stage.addEventListener('mousedown', (e) => onDown(e.clientX));
  window.addEventListener('mousemove', (e) => onMove(e.clientX));
  window.addEventListener('mouseup', onUp);
  stage.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
  stage.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
  stage.addEventListener('touchend', onUp);

  // Controls: prev / next
  const controls = document.createElement('div');
  controls.className = 'product-preview-stryker-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'product-preview-stryker-prev';
  prev.setAttribute('aria-label', 'Previous view');
  prev.textContent = '←';
  prev.addEventListener('click', () => show(current - 1));

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'product-preview-stryker-next';
  next.setAttribute('aria-label', 'Next view');
  next.textContent = '→';
  next.addEventListener('click', () => show(current + 1));

  controls.append(prev, next);
  viewer.append(controls);

  if (total <= 1) controls.style.display = 'none';

  return viewer;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Block-level model fields render as the first four rows in model order:
  // 0: title lead, 1: title highlight, 2: description, 3: instruction.
  const titleLead = innerCell(rows[0])?.textContent?.trim() || '';
  const titleHighlight = innerCell(rows[1])?.textContent?.trim() || '';
  const descCell = innerCell(rows[2]);
  const instruction = innerCell(rows[3])?.textContent?.trim() || '';

  // Remaining rows are child items: frame images and feature text. Optimize
  // each frame's image up front so the viewer closure holds the final nodes.
  const frames = [];
  const features = [];
  rows.slice(4).forEach((row) => {
    const picture = row.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      // Keep external/CDN images as-is; optimizing strips the host + query.
      let external = false;
      try {
        external = new URL(img.src, window.location.href).origin !== window.location.origin;
      } catch (e) { /* treat unparseable as local */ }
      if (external) {
        frames.push(picture);
      } else {
        const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
        moveInstrumentation(img, optimized.querySelector('img'));
        frames.push(optimized);
      }
    } else {
      const text = row.textContent.trim();
      if (text) features.push(text);
    }
  });

  block.textContent = '';

  if (titleLead || titleHighlight) {
    const h2 = document.createElement('h2');
    h2.className = 'product-preview-stryker-title';
    if (titleLead) {
      const lead = document.createElement('span');
      lead.className = 'product-preview-stryker-title-lead';
      lead.textContent = `${titleLead} `;
      h2.append(lead);
    }
    if (titleHighlight) {
      const hl = document.createElement('span');
      hl.className = 'product-preview-stryker-title-highlight';
      hl.textContent = titleHighlight;
      h2.append(hl);
    }
    block.append(h2);
  }

  if (descCell?.innerHTML.trim()) {
    const desc = document.createElement('div');
    desc.className = 'product-preview-stryker-description';
    desc.innerHTML = descCell.innerHTML;
    block.append(desc);
  }

  if (instruction) {
    const inst = document.createElement('p');
    inst.className = 'product-preview-stryker-instruction';
    inst.textContent = instruction;
    block.append(inst);
  }

  if (frames.length) block.append(buildViewer(frames));

  if (features.length) {
    const list = document.createElement('ul');
    list.className = 'product-preview-stryker-features';
    features.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      list.append(li);
    });
    block.append(list);
  }
}
