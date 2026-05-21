export default function decorate(block) {
  const rows = [...block.children];
  let lightUrl = '';
  let darkUrl = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const label = (cells[0]?.textContent || '').trim().toLowerCase();
    const url = cells[1]?.querySelector('a')?.href || cells[1]?.textContent?.trim() || '';
    if (label === 'light') lightUrl = url;
    if (label === 'dark') darkUrl = url;
  });

  block.textContent = '';

  if (!lightUrl || !darkUrl) return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

  if (prefersDark.matches) {
    window.location.replace(darkUrl);
  } else if (prefersLight.matches) {
    window.location.replace(lightUrl);
  }
}
