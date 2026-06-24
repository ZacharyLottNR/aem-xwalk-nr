export default function decorate(block) {
  const lightUrl = window.location.href.replace('/home', '/light');
  const darkUrl = window.location.href.replace('/home', '/dark');

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
