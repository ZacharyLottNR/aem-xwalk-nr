const XF_DELIVERY_URL = 'https://secretly-legible-sawfly.edgecompute.app/api/xf/html';
const XF_API_KEY = 'eds-internal-key';

export default async function decorate(block) {
  const rows = [...block.children];
  const xfPath = rows[0]?.querySelector('div')?.textContent?.trim()
    || rows[0]?.textContent?.trim() || '';

  block.textContent = '';

  if (!xfPath || !xfPath.startsWith('/content/experience-fragments')) {
    block.innerHTML = '<p class="xf-placeholder">No Experience Fragment selected.</p>';
    return;
  }

  block.innerHTML = '<div class="xf-loading">Loading experience fragment...</div>';

  try {
    const resp = await fetch(
      `${XF_DELIVERY_URL}?path=${encodeURIComponent(xfPath)}`,
      { headers: { 'x-api-key': XF_API_KEY } },
    );
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
