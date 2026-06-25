export default function decorate(block) {
  const themeVal = block.querySelector(':scope > div > div')?.textContent?.trim().toLowerCase();
  const theme = themeVal === 'little' ? 'little' : 'big';
  block.textContent = '';
  block.classList.add(`content-break-stryker-${theme}`);
}
