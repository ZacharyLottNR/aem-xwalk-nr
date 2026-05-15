import { getCart, removeFromCart, clearCart } from '../../scripts/cart.js';
import { downloadAsset, shareAsset } from '../../scripts/asset-actions.js';
import { getPublishHost } from '../../scripts/asset-search-api.js';

const EDGE_FUNCTION = 'https://absolutely-cool-toucan.edgecompute.app/api/asset-detail';
const PUBLISH_HOST = getPublishHost();

async function fetchAssetInfo(assetPath) {
  try {
    const resp = await fetch(`${EDGE_FUNCTION}?path=${encodeURIComponent(assetPath)}`);
    if (!resp.ok) throw new Error(resp.status);
    return resp.json();
  } catch {
    return {
      path: assetPath,
      title: assetPath.split('/').pop(),
      type: 'IMAGE',
      size: '',
      thumbnailUrl: `${PUBLISH_HOST}${assetPath}/_jcr_content/renditions/original`,
    };
  }
}

function renderEmptyCart(block) {
  block.innerHTML = `
    <div class="cart-page-empty">
      <h2>Your cart is empty</h2>
      <p>Browse assets and add them to your cart to download or share.</p>
      <a href="#" class="cart-page-browse-btn" onclick="history.back(); return false;">Browse Assets</a>
    </div>`;
}

function updateCartCount() {
  const count = getCart().length;
  const countEl = document.querySelector('.cart-page-count');
  if (countEl) countEl.textContent = `(${count})`;
}

function renderCartItem(asset) {
  const row = document.createElement('tr');
  row.dataset.path = asset.path;

  const thumbTd = document.createElement('td');
  thumbTd.className = 'cart-item-thumb';
  const img = document.createElement('img');
  img.src = asset.thumbnailUrl || `${PUBLISH_HOST}${asset.path}/_jcr_content/renditions/original`;
  img.alt = asset.title;
  img.loading = 'lazy';
  thumbTd.append(img);

  const infoTd = document.createElement('td');
  infoTd.className = 'cart-item-info';
  infoTd.innerHTML = `<strong>${asset.title}</strong><br><span class="cart-item-meta">${asset.type || 'IMAGE'} &middot; ${asset.size || ''}</span>`;

  const actionsTd = document.createElement('td');
  actionsTd.className = 'cart-item-actions';

  const dlBtn = document.createElement('button');
  dlBtn.className = 'cart-action-btn';
  dlBtn.textContent = 'Download';
  dlBtn.addEventListener('click', () => downloadAsset(asset.path));

  const shareBtn = document.createElement('button');
  shareBtn.className = 'cart-action-btn';
  shareBtn.textContent = 'Share';
  shareBtn.addEventListener('click', () => shareAsset(asset.path, asset.title));

  const removeBtn = document.createElement('button');
  removeBtn.className = 'cart-action-btn cart-remove-btn';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    removeFromCart(asset.path);
    row.remove();
    const table = document.querySelector('.cart-page-table');
    if (table && !table.querySelector('tbody tr')) {
      renderEmptyCart(document.querySelector('.cart-page'));
    }
    updateCartCount();
  });

  actionsTd.append(dlBtn, shareBtn, removeBtn);
  row.append(thumbTd, infoTd, actionsTd);
  return row;
}

export default async function decorate(block) {
  block.textContent = '';
  block.classList.add('cart-page');

  const cartPaths = getCart();
  if (!cartPaths.length) {
    renderEmptyCart(block);
    return;
  }

  const header = document.createElement('div');
  header.className = 'cart-page-header';
  header.innerHTML = `<h1>Cart <span class="cart-page-count">(${cartPaths.length})</span></h1>`;

  const toolbar = document.createElement('div');
  toolbar.className = 'cart-page-toolbar';

  const downloadAllBtn = document.createElement('button');
  downloadAllBtn.className = 'cart-toolbar-btn cart-download-all';
  downloadAllBtn.textContent = 'Download All';
  downloadAllBtn.addEventListener('click', () => {
    cartPaths.forEach((p) => downloadAsset(p));
  });

  const clearBtn = document.createElement('button');
  clearBtn.className = 'cart-toolbar-btn cart-clear-btn';
  clearBtn.textContent = 'Clear Cart';
  clearBtn.addEventListener('click', () => {
    clearCart();
    renderEmptyCart(block);
  });

  toolbar.append(downloadAllBtn, clearBtn);

  const table = document.createElement('table');
  table.className = 'cart-page-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Preview</th><th>Asset</th><th>Actions</th></tr>';
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  block.append(header, toolbar, table);

  const assets = await Promise.all(cartPaths.map(fetchAssetInfo));
  assets.forEach((asset) => tbody.append(renderCartItem(asset)));
}
