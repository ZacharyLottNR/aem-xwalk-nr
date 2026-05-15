import { downloadAsset, shareAsset, toggleCart } from '../../scripts/asset-actions.js';
import { isInCart } from '../../scripts/cart.js';

const EDGE_FUNCTION_URL = 'https://absolutely-cool-toucan.edgecompute.app/api/asset-detail';

function getAssetPath() {
  const { pathname, search } = window.location;
  const pathParam = new URLSearchParams(search).get('path');
  if (pathParam) return pathParam;

  const match = pathname.match(/\/content\/dam\/.+/);
  if (match) return match[0];

  const suffix = pathname.split('/details/')[1];
  if (suffix) return `/content/dam/${suffix}`;
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return 'n/a';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return 'n/a';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

function renderDetail(asset, block) {
  block.innerHTML = '';

  const main = document.createElement('div');
  main.className = 'asset-detail-main';

  const backLink = document.createElement('a');
  backLink.className = 'asset-detail-back';
  backLink.href = 'javascript:history.back()';
  backLink.textContent = '← Back';

  const title = document.createElement('h1');
  title.textContent = asset.title;

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'asset-detail-image';
  const img = document.createElement('img');
  img.src = asset.imageUrl;
  img.alt = asset.title;
  imageWrapper.append(img);

  const renditionsSection = document.createElement('div');
  renditionsSection.className = 'asset-detail-renditions';
  const renditionsTitle = document.createElement('h3');
  renditionsTitle.textContent = 'Renditions';
  renditionsSection.append(renditionsTitle);
  const renditionsList = document.createElement('div');
  renditionsList.className = 'asset-detail-renditions-list';
  asset.renditions.forEach((r) => {
    const btn = document.createElement('a');
    btn.className = 'rendition-btn';
    btn.href = r.url;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = r.name;
    renditionsList.append(btn);
  });
  renditionsSection.append(renditionsList);

  const actionsSection = document.createElement('div');
  actionsSection.className = 'asset-detail-actions';
  const actionsTitle = document.createElement('h3');
  actionsTitle.textContent = 'Actions';
  actionsSection.append(actionsTitle);
  const actionsRow = document.createElement('div');
  actionsRow.className = 'asset-detail-actions-row';

  const dlBtn = document.createElement('button');
  dlBtn.className = 'action-btn action-download';
  dlBtn.textContent = 'Download';
  dlBtn.addEventListener('click', () => downloadAsset(asset.path));

  const shareBtn = document.createElement('button');
  shareBtn.className = 'action-btn action-share';
  shareBtn.textContent = 'Share';
  shareBtn.addEventListener('click', () => shareAsset(asset.path, asset.title));

  const cartBtn = document.createElement('button');
  cartBtn.className = 'action-btn action-cart';
  cartBtn.textContent = isInCart(asset.path) ? 'Remove from Cart' : 'Add to Cart';
  if (isInCart(asset.path)) cartBtn.classList.add('in-cart');
  cartBtn.addEventListener('click', () => toggleCart(asset.path, cartBtn));

  actionsRow.append(dlBtn, shareBtn, cartBtn);
  actionsSection.append(actionsRow);

  main.append(backLink, title, imageWrapper, renditionsSection, actionsSection);

  const sidebar = document.createElement('aside');
  sidebar.className = 'asset-detail-sidebar';

  if (asset.tags && asset.tags.length) {
    const tagsSection = document.createElement('div');
    tagsSection.className = 'asset-detail-meta-section';
    tagsSection.innerHTML = `<h4>Tags</h4><div class="asset-detail-tags">${asset.tags.map((t) => `<span class="tag">${t.split('/').pop()}</span>`).join('')}</div>`;
    sidebar.append(tagsSection);
  }

  const metaGrid = document.createElement('div');
  metaGrid.className = 'asset-detail-meta-grid';
  const metaItems = [
    ['Created', formatDate(asset.created)],
    ['Type', asset.type],
    ['Size', asset.size],
    ['Last Modified', timeAgo(asset.modified)],
    ['Res.', asset.resolution || 'n/a'],
    ['Format', asset.format],
  ];
  metaItems.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'asset-detail-meta-item';
    item.innerHTML = `<span class="meta-label">${label}</span><span class="meta-value">${value}</span>`;
    metaGrid.append(item);
  });
  sidebar.append(metaGrid);

  if (asset.description) {
    const desc = document.createElement('div');
    desc.className = 'asset-detail-meta-section';
    desc.innerHTML = `<h4>Description</h4><p>${asset.description}</p>`;
    sidebar.append(desc);
  }

  block.append(main, sidebar);
}

export default async function decorate(block) {
  const assetPath = getAssetPath();
  if (!assetPath) {
    block.innerHTML = '<p>No asset specified.</p>';
    return;
  }

  block.innerHTML = '<div class="asset-detail-loading">Loading asset details...</div>';

  try {
    const resp = await fetch(`${EDGE_FUNCTION_URL}?path=${encodeURIComponent(assetPath)}`);
    if (!resp.ok) throw new Error(`${resp.status}`);
    const asset = await resp.json();
    renderDetail(asset, block);
  } catch (err) {
    block.innerHTML = `<p>Failed to load asset details: ${err.message}</p>`;
  }
}
