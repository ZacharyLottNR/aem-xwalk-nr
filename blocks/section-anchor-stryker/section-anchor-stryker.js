function slug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function decorate(block) {
  block.textContent = '';

  const ownSection = block.closest('.section');
  const main = ownSection?.parentElement;
  if (!main) return;

  // Make the containing section sticky at the top
  ownSection.classList.add('section-anchor-stryker-container');

  // Sections that come after this block's section
  const allSections = [...main.querySelectorAll(':scope > .section')];
  const startIndex = allSections.indexOf(ownSection);
  const laterSections = allSections.slice(startIndex + 1);

  const nav = document.createElement('nav');
  nav.className = 'section-anchor-stryker-nav';

  laterSections.forEach((section) => {
    const name = section.dataset.name?.trim();
    if (!name) return;

    if (!section.id) section.id = slug(name);

    const link = document.createElement('a');
    link.className = 'section-anchor-stryker-link';
    link.href = `#${section.id}`;
    link.textContent = name;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${section.id}`);
    });
    nav.append(link);
  });

  if (!nav.children.length) return;
  block.append(nav);
}
