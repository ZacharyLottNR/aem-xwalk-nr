const SOCIAL_ICONS = ['facebook', 'linkedin', 'youtube', 'instagram', 'twitter', 'tiktok'];

function innerCell(row) {
  return row?.querySelector(':scope > div') || row;
}

function iconImg(name) {
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/${name}.svg`;
  img.alt = name;
  img.loading = 'lazy';
  img.width = 40;
  img.height = 40;
  return img;
}

export default function decorate(block) {
  const rows = [...block.children];

  // First row: block-level fields (heading)
  const headingText = innerCell(rows[0])?.textContent?.trim() || '';
  const itemRows = rows.slice(1);

  block.textContent = '';

  if (headingText) {
    const heading = document.createElement('h3');
    heading.className = 'social-cta-stryker-heading';
    heading.textContent = headingText;
    block.append(heading);
  }

  const linkList = document.createElement('ul');
  linkList.className = 'social-cta-stryker-links';

  const socialList = document.createElement('div');
  socialList.className = 'social-cta-stryker-social';

  itemRows.forEach((row) => {
    const cells = [...row.children];
    const firstVal = cells[0]?.textContent?.trim().toLowerCase() || '';
    const href = cells[1]?.querySelector('a')?.href
      || cells[1]?.textContent?.trim() || '#';

    if (SOCIAL_ICONS.includes(firstVal)) {
      // Social icon item
      const a = document.createElement('a');
      a.className = 'social-cta-stryker-social-link';
      a.href = href;
      a.setAttribute('aria-label', firstVal);
      a.append(iconImg(firstVal));
      socialList.append(a);
    } else {
      // Text link item
      const label = cells[0]?.textContent?.trim() || '';
      if (!label) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'social-cta-stryker-link';
      a.href = href;
      a.textContent = label;
      li.append(a);
      linkList.append(li);
    }
  });

  if (linkList.children.length) block.append(linkList);
  if (socialList.children.length) block.append(socialList);
}
