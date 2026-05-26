export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const layoutRow = rows[0];
  const layoutValue = layoutRow.textContent.trim();

  if (layoutValue) {
    block.dataset.layout = layoutValue;
  }

  layoutRow.remove();
}
