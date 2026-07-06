function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

const DIRECTIONS = {
  back: { defaultLabel: 'Back', icon: '◁', iconSide: 'before' },
  next: { defaultLabel: 'Next', icon: '▷', iconSide: 'after' },
  home: { defaultLabel: 'Home', icon: '⌂', iconSide: 'before' },
};

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order follows the model field order: 0 direction, 1 label, 2 link.
  const dirRaw = innerCell(rows[0])?.textContent?.trim().toLowerCase();
  const direction = DIRECTIONS[dirRaw] ? dirRaw : 'back';
  const cfg = DIRECTIONS[direction];
  const label = innerCell(rows[1])?.textContent?.trim() || cfg.defaultLabel;
  const linkCell = innerCell(rows[2]);
  const href = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim() || '';

  block.textContent = '';
  block.classList.add(`navigation-button-stryker-${direction}`);

  if (!href) return;

  const a = document.createElement('a');
  a.className = 'navigation-button-stryker-link';
  a.href = href;

  const icon = document.createElement('span');
  icon.className = 'navigation-button-stryker-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = cfg.icon;

  const text = document.createElement('span');
  text.className = 'navigation-button-stryker-text';
  text.textContent = label;

  if (cfg.iconSide === 'before') a.append(icon, text);
  else a.append(text, icon);

  block.append(a);
}
