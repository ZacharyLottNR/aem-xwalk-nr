function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order follows the model field order:
  // 0 title, 1 description, 2 date, 3 time, 4 location, 5 credit,
  // 6 cta text, 7 cta link.
  const title = innerCell(rows[0])?.textContent?.trim() || '';
  const descCell = innerCell(rows[1]);
  const date = innerCell(rows[2])?.textContent?.trim() || '';
  const time = innerCell(rows[3])?.textContent?.trim() || '';
  const location = innerCell(rows[4])?.textContent?.trim() || '';
  const credit = innerCell(rows[5])?.textContent?.trim() || '';
  const ctaLabel = innerCell(rows[6])?.textContent?.trim() || '';
  const ctaCell = innerCell(rows[7]);
  const ctaHref = ctaCell?.querySelector('a')?.href || ctaCell?.textContent?.trim() || '';

  block.textContent = '';

  const body = document.createElement('div');
  body.className = 'event-details-stryker-body';

  if (title) {
    const h = document.createElement('h2');
    h.className = 'event-details-stryker-title';
    h.textContent = title;
    body.append(h);
  }

  if (descCell?.innerHTML.trim()) {
    const desc = document.createElement('div');
    desc.className = 'event-details-stryker-description';
    desc.innerHTML = descCell.innerHTML;
    body.append(desc);
  }

  if (ctaLabel && ctaHref) {
    const cta = document.createElement('a');
    cta.className = 'event-details-stryker-cta button';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
    body.append(cta);
  }

  // Facts panel: only render the rows that have a value.
  const facts = document.createElement('dl');
  facts.className = 'event-details-stryker-facts';
  [
    ['Date', date],
    ['Time', time],
    ['Location', location],
    ['Accreditation', credit],
  ].forEach(([term, value]) => {
    if (!value) return;
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    facts.append(dt, dd);
  });

  block.append(body);
  if (facts.children.length) block.append(facts);
}
