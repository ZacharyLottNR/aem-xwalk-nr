export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  const content = document.createElement('div');
  content.className = 'legal-text-stryker-content';
  if (cell) content.innerHTML = cell.innerHTML;
  block.textContent = '';
  block.append(content);
}
