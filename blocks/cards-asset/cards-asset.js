import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { downloadAsset, shareAsset, toggleCart } from '../../scripts/asset-actions.js';
import { isInCart } from '../../scripts/cart.js';

export function renderCard(asset) {
  const li = document.createElement('li');
  li.dataset.assetPath = asset.path;

  const typeIcons = {
    VIDEO: '🎬',
    DOCUMENT: '📄',
    PRESENTATION: '📊',
    IMAGE: '🖼️',
  };

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-asset-card-image';
  const imgLink = document.createElement('a');
  imgLink.href = asset.detailUrl;
  imgLink.title = asset.title;
  const imgSrc = asset.thumbnailUrl || asset.renditionUrl;
  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = asset.title;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = 'cards-asset-card-fallback';
    fallback.innerHTML = `<span class="fallback-icon">${typeIcons[asset.type] || typeIcons.IMAGE}</span>`;
    img.replaceWith(fallback);
  });
  imgLink.append(img);
  const p = document.createElement('p');
  p.append(imgLink);
  imageDiv.append(p);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-asset-card-body';

  const h3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = asset.detailUrl;
  titleLink.textContent = asset.title;
  h3.append(titleLink);

  const metaLink = document.createElement('a');
  metaLink.href = asset.detailUrl;
  metaLink.className = 'cards-asset-card-meta-link';
  const metaUl = document.createElement('ul');
  const sizeLi = document.createElement('li');
  sizeLi.textContent = `SIZE: ${asset.size}`;
  const typeLi = document.createElement('li');
  typeLi.textContent = `TYPE: ${asset.type}`;
  const resLi = document.createElement('li');
  resLi.textContent = asset.resolution ? `RES.: ${asset.resolution}` : 'RES.';
  metaUl.append(sizeLi, typeLi, resLi);
  metaLink.append(metaUl);

  const actions = document.createElement('div');
  actions.className = 'cards-asset-card-actions';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'action-download';
  downloadBtn.textContent = 'Download';
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    downloadAsset(asset.path);
  });

  const shareBtn = document.createElement('button');
  shareBtn.className = 'action-share';
  shareBtn.textContent = 'Share';
  shareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    shareAsset(asset.path, asset.title);
  });

  const cartBtn = document.createElement('button');
  cartBtn.className = 'action-cart';
  if (isInCart(asset.path)) {
    cartBtn.textContent = 'Remove from Cart';
    cartBtn.classList.add('in-cart');
  } else {
    cartBtn.textContent = 'Add to Cart';
  }
  cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart(asset.path, cartBtn);
  });

  actions.append(downloadBtn, shareBtn, cartBtn);
  bodyDiv.append(h3, metaLink, actions);
  li.append(imageDiv, bodyDiv);

  return li;
}

export function renderCards(assets, block) {
  block.textContent = '';
  const ul = document.createElement('ul');
  assets.forEach((asset) => ul.append(renderCard(asset)));
  block.append(ul);
}

export function appendCards(assets, block) {
  let ul = block.querySelector('ul');
  if (!ul) {
    ul = document.createElement('ul');
    block.append(ul);
  }
  assets.forEach((asset) => ul.append(renderCard(asset)));
}

export default function decorate(block) {
  if (block.querySelector(':scope > ul')) return;
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-asset-card-image';
      else div.className = 'cards-asset-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
