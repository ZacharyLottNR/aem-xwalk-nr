const COLORS = ['gold', 'black', 'white', 'gray', 'teal'];
const SIZES = ['h1', 'h2', 'h3'];

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order: 0: title, 1: color, 2: size
  const titleText = innerCell(rows[0])?.textContent?.trim() || '';
  const colorVal = innerCell(rows[1])?.textContent?.trim().toLowerCase();
  const sizeVal = innerCell(rows[2])?.textContent?.trim().toLowerCase();

  const color = COLORS.includes(colorVal) ? colorVal : 'gold';
  const size = SIZES.includes(sizeVal) ? sizeVal : 'h2';

  block.textContent = '';
  if (!titleText) return;

  const heading = document.createElement(size);
  heading.className = 'title-stryker-title';
  heading.textContent = titleText;

  block.classList.add(`title-stryker-${color}`);
  block.append(heading);
}
