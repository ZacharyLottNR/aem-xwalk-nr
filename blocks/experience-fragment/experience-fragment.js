const XF_DELIVERY_URL = 'https://YOUR-XF-SERVICE.edgecompute.app/api/xf/html';

export default async function decorate(block) {
  const rows = [...block.children];
  const xfPath = rows[0]?.textContent?.trim() || '';
  const variation = rows[1]?.textContent?.trim() || 'master';

  block.textContent = '';

  if (!xfPath) {
    block.innerHTML = '<p class="xf-placeholder">No Experience Fragment selected.</p>';
    return;
  }

  block.innerHTML = '<div class="xf-loading">Loading experience fragment...</div>';

  const fullPath = xfPath.endsWith(`/${variation}`)
    ? xfPath
    : `${xfPath}/${variation}`;

  try {
    const resp = await fetch(`${XF_DELIVERY_URL}?path=${encodeURIComponent(fullPath)}`);
    if (!resp.ok) throw new Error(`${resp.status}`);
    const html = await resp.text();

    block.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'xf-content';
    wrapper.innerHTML = html;
    block.append(wrapper);
  } catch (err) {
    block.innerHTML = `<p class="xf-error">Failed to load experience fragment: ${err.message}</p>`;
  }
}
