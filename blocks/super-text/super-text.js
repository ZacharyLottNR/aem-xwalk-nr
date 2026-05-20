export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cell = row.querySelector(':scope > div');
  if (!cell) return;
  block.textContent = '';
  block.append(...cell.childNodes);
}
