import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export function renderCard(asset) {
  const li = document.createElement('li');

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

  const metaUl = document.createElement('ul');
  const sizeLi = document.createElement('li');
  sizeLi.textContent = `SIZE: ${asset.size}`;
  const typeLi = document.createElement('li');
  typeLi.textContent = `TYPE: ${asset.type}`;
  const resLi = document.createElement('li');
  resLi.textContent = asset.resolution ? `RES.: ${asset.resolution}` : 'RES.';
  metaUl.append(sizeLi, typeLi, resLi);

  const actions = document.createElement('p');
  actions.innerHTML = '<strong>Download</strong> | <strong>Share</strong> | <strong>Add to Cart</strong>';

  bodyDiv.append(h3, metaUl, actions);
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
