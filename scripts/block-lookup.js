const BLOCK_LOOKUP_URL = 'https://YOUR-SERVICE.edgecompute.app/api/block-lookup';

export async function lookupBlock(pagePath, cellValues) {
  const aueResource = document.querySelector('[data-aue-resource]')?.dataset.aueResource;
  if (aueResource) {
    return { path: aueResource, source: 'editor' };
  }

  const resp = await fetch(BLOCK_LOOKUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pagePath, cellValues }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Lookup failed: ${resp.status}`);
  }

  const data = await resp.json();
  return { path: data.block.path, data: data.block.data, source: 'api' };
}

export function getBlockCellValues(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  return cells.map((cell) => cell.textContent.trim()).filter(Boolean);
}
