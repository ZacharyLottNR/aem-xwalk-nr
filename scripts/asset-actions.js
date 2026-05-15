import { addToCart, removeFromCart, isInCart } from './cart.js';
import { getPublishHost } from './asset-search-api.js';

export function downloadAsset(assetPath) {
  const host = getPublishHost();
  const url = `${host}${assetPath}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = assetPath.split('/').pop();
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareAsset(assetPath, title) {
  const host = getPublishHost();
  const url = `${host}${assetPath}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: title || 'Shared Asset', url });
      return;
    } catch {
      // User cancelled or API failed, fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard');
  } catch {
    prompt('Copy the asset link:', url);
  }
}

export function toggleCart(assetPath, button) {
  if (isInCart(assetPath)) {
    removeFromCart(assetPath);
    if (button) {
      button.textContent = 'Add to Cart';
      button.classList.remove('in-cart');
    }
  } else {
    const added = addToCart(assetPath);
    if (added && button) {
      button.textContent = 'Remove from Cart';
      button.classList.add('in-cart');
    } else if (!added) {
      showToast('Already in cart');
    }
  }
}

function showToast(message) {
  let toast = document.querySelector('.asset-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'asset-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}
