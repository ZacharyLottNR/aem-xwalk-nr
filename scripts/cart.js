const STORAGE_KEY = 'asset-share-commons';

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { cart: [] };
  } catch {
    return { cart: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function dispatchCartEvent(type, detail = {}) {
  document.dispatchEvent(new CustomEvent(`cart:${type}`, { detail }));
}

export function getCart() {
  return getStore().cart || [];
}

export function addToCart(assetPath) {
  const store = getStore();
  if (!store.cart) store.cart = [];
  if (store.cart.includes(assetPath)) {
    dispatchCartEvent('already-exists', { path: assetPath });
    return false;
  }
  store.cart.push(assetPath);
  saveStore(store);
  dispatchCartEvent('update', { cart: store.cart });
  return true;
}

export function removeFromCart(assetPath) {
  const store = getStore();
  store.cart = (store.cart || []).filter((p) => p !== assetPath);
  saveStore(store);
  dispatchCartEvent('update', { cart: store.cart });
}

export function clearCart() {
  const store = getStore();
  store.cart = [];
  saveStore(store);
  dispatchCartEvent('update', { cart: [] });
}

export function isInCart(assetPath) {
  return getCart().includes(assetPath);
}

export function cartSize() {
  return getCart().length;
}
