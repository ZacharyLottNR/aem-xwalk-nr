const COOKIE_NAME = 'stryker-callout-dismissed';

function isDismissed() {
  return document.cookie.split('; ').some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

function dismiss() {
  // Persist for a year so the banner stays gone across visits.
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; SameSite=Lax`;
}

export default function decorate(block) {
  // The block is hidden by default in CSS; only reveal it when not dismissed so
  // it never flashes in then out on load.
  if (isDismissed()) {
    block.remove();
    return;
  }

  const cell = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  const content = document.createElement('div');
  content.className = 'callout-banner-stryker-content';
  if (cell) content.innerHTML = cell.innerHTML;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'callout-banner-stryker-close';
  close.setAttribute('aria-label', 'Dismiss');
  close.innerHTML = '&times;';
  close.addEventListener('click', () => {
    dismiss();
    block.remove();
  });

  block.textContent = '';
  block.append(content, close);
  block.classList.add('callout-banner-stryker-visible');
}
