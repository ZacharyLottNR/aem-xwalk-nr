function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order follows the model field order: 0 text, 1 cta label, 2 cta link.
  const textCell = innerCell(rows[0]);
  const ctaLabel = innerCell(rows[1])?.textContent?.trim() || '';
  const ctaCell = innerCell(rows[2]);
  const ctaHref = ctaCell?.querySelector('a')?.href || ctaCell?.textContent?.trim() || '';

  block.textContent = '';

  const boxInner = document.createElement('div');
  boxInner.className = 'cta-stryker-box';

  if (textCell?.innerHTML.trim()) {
    const text = document.createElement('div');
    text.className = 'cta-stryker-text';
    text.innerHTML = textCell.innerHTML;
    boxInner.append(text);
  }

  if (ctaLabel && ctaHref) {
    const cta = document.createElement('a');
    cta.className = 'cta-stryker-link';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
    boxInner.append(cta);
  }

  block.append(boxInner);
}
