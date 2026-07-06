function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order follows the model field order:
  // 0 heading, 1 label, 2 sublabel, 3 link, 4 style.
  const heading = innerCell(rows[0])?.textContent?.trim() || '';
  const label = innerCell(rows[1])?.textContent?.trim() || '';
  const sublabel = innerCell(rows[2])?.textContent?.trim() || '';
  const linkCell = innerCell(rows[3]);
  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim() || '';
  const styleRaw = innerCell(rows[4])?.textContent?.trim().toLowerCase();
  const style = styleRaw === 'secondary' ? 'secondary' : 'primary';

  block.textContent = '';
  block.classList.add(`button-stryker-${style}`);

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'button-stryker-heading';
    h.textContent = heading;
    block.append(h);
  }

  if (!href || !label) return;

  const a = document.createElement('a');
  a.className = 'button-stryker-button';
  a.href = href;

  const main = document.createElement('span');
  main.className = 'button-stryker-label';
  main.textContent = label;
  a.append(main);

  if (sublabel) {
    const sub = document.createElement('span');
    sub.className = 'button-stryker-sublabel';
    sub.textContent = sublabel;
    a.append(sub);
  }

  block.append(a);
}
