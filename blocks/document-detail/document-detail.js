import { downloadAsset, shareAsset, toggleCart } from '../../scripts/asset-actions.js';
import { isInCart } from '../../scripts/cart.js';
import { getPublishHost } from '../../scripts/asset-search-api.js';

const EDGE_FUNCTION_URL = 'https://absolutely-cool-toucan.edgecompute.app/api/asset-detail';

function getAssetPath() {
  const { pathname, search } = window.location;
  const pathParam = new URLSearchParams(search).get('path');
  if (pathParam) return pathParam;
  const match = pathname.match(/\/content\/dam\/.+/);
  if (match) return match[0];
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
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function isPdf(format) {
  return (format || '').toLowerCase().includes('pdf');
}

function renderDetail(asset, block) {
  block.innerHTML = '';
  const publishHost = getPublishHost();

  const main = document.createElement('div');
  main.className = 'document-detail-main';

  const backLink = document.createElement('a');
  backLink.className = 'document-detail-back';
  backLink.href = '#';
  backLink.textContent = '← Back';
  backLink.addEventListener('click', (e) => { e.preventDefault(); window.history.back(); });

  const title = document.createElement('h1');
  title.textContent = asset.title;

  const previewWrapper = document.createElement('div');
  previewWrapper.className = 'document-detail-preview';

  if (isPdf(asset.format)) {
    const iframe = document.createElement('iframe');
    iframe.src = `${publishHost}${asset.path}`;
    iframe.title = asset.title;
    previewWrapper.append(iframe);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'document-detail-placeholder';
    placeholder.innerHTML = `
      <div class="document-icon">📄</div>
      <p class="document-filename">${asset.name}</p>
      <p class="document-format">${asset.format || 'Document'}</p>
    `;
    previewWrapper.append(placeholder);
  }

  const actionsSection = document.createElement('div');
  actionsSection.className = 'document-detail-actions';
  const actionsRow = document.createElement('div');
  actionsRow.className = 'document-detail-actions-row';

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

  main.append(backLink, title, previewWrapper, actionsSection);

  const sidebar = document.createElement('aside');
  sidebar.className = 'document-detail-sidebar';

  const metaGrid = document.createElement('div');
  metaGrid.className = 'asset-detail-meta-grid';
  const metaItems = [
    ['Created', formatDate(asset.created)],
    ['Type', asset.type],
    ['Size', asset.size],
    ['Last Modified', timeAgo(asset.modified)],
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

  block.innerHTML = '<div class="document-detail-loading">Loading document details...</div>';

  try {
    const resp = await fetch(`${EDGE_FUNCTION_URL}?path=${encodeURIComponent(assetPath)}`);
    if (!resp.ok) throw new Error(`${resp.status}`);
    const asset = await resp.json();
    renderDetail(asset, block);
  } catch (err) {
    block.innerHTML = `<p>Failed to load document details: ${err.message}</p>`;
  }
}
