function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

// A labeled section: an h5 label above a value paragraph (or arbitrary node).
function labeledSection(label, valueNode) {
  const wrap = document.createElement('div');
  wrap.className = 'event-details-stryker-section';
  const h = document.createElement('h5');
  h.className = 'event-details-stryker-label';
  h.textContent = label;
  wrap.append(h, valueNode);
  return wrap;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Cell order follows the model field order: 0 title, 1 description, 2 date,
  // 3 time, 4 location, 5 country, 6 credit, 7 register label, 8 register url,
  // 9 map address, 10 map url.
  const title = innerCell(rows[0])?.textContent?.trim() || '';
  const descCell = innerCell(rows[1]);
  const date = innerCell(rows[2])?.textContent?.trim() || '';
  const time = innerCell(rows[3])?.textContent?.trim() || '';
  const location = innerCell(rows[4])?.textContent?.trim() || '';
  const country = innerCell(rows[5])?.textContent?.trim() || '';
  const credit = innerCell(rows[6])?.textContent?.trim() || '';
  const ctaLabel = innerCell(rows[7])?.textContent?.trim() || '';
  const ctaCell = innerCell(rows[8]);
  const ctaHref = ctaCell?.querySelector('a')?.href || ctaCell?.textContent?.trim() || '';
  const mapAddress = innerCell(rows[9])?.textContent?.trim() || '';
  const mapCell = innerCell(rows[10]);
  const mapUrl = mapCell?.querySelector('a')?.href || mapCell?.textContent?.trim() || '';

  block.textContent = '';

  if (title) {
    const h = document.createElement('h2');
    h.className = 'event-details-stryker-title';
    h.textContent = title;
    block.append(h);
  }

  const layout = document.createElement('div');
  layout.className = 'event-details-stryker-layout';

  // Left column: the labeled event info.
  const info = document.createElement('div');
  info.className = 'event-details-stryker-info';

  // Meeting time = date + time on two lines.
  if (date || time) {
    const v = document.createElement('p');
    if (date) v.append(document.createTextNode(date));
    if (date && time) v.append(document.createElement('br'));
    if (time) v.append(document.createTextNode(time));
    info.append(labeledSection('Meeting time', v));
  }

  if (location) {
    const v = document.createElement('p');
    v.textContent = location;
    info.append(labeledSection('Location', v));
  }

  if (country) {
    const v = document.createElement('p');
    v.textContent = country;
    info.append(labeledSection('Country', v));
  }

  // Print event details (uses the browser print dialog).
  const print = document.createElement('a');
  print.className = 'event-details-stryker-print button';
  print.href = '#';
  print.textContent = 'Print event details';
  print.addEventListener('click', (e) => { e.preventDefault(); window.print(); });
  info.append(print);

  if (descCell?.innerHTML.trim()) {
    const v = document.createElement('div');
    v.className = 'event-details-stryker-detail-body';
    v.innerHTML = descCell.innerHTML;
    info.append(labeledSection('Details', v));
  }

  if (credit) {
    const disc = document.createElement('p');
    disc.className = 'event-details-stryker-disclaimer';
    const strong = document.createElement('strong');
    strong.textContent = 'Disclaimer: ';
    disc.append(strong, document.createTextNode(credit));
    info.append(disc);
  }

  if (ctaLabel && ctaHref) {
    const reg = document.createElement('div');
    reg.className = 'event-details-stryker-section';
    const h = document.createElement('h5');
    h.className = 'event-details-stryker-label';
    h.textContent = 'Registration';
    const cta = document.createElement('a');
    cta.className = 'event-details-stryker-cta button';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
    reg.append(h, cta);
    info.append(reg);
  }

  layout.append(info);

  // Right column: a Google map embed (from an explicit embed URL or an address).
  const src = mapUrl
    || (mapAddress ? `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed` : '');
  if (src) {
    const mapWrap = document.createElement('div');
    mapWrap.className = 'event-details-stryker-map';
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Event location map';
    iframe.loading = 'lazy';
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapWrap.append(iframe);
    layout.append(mapWrap);
  }

  block.append(layout);
}
