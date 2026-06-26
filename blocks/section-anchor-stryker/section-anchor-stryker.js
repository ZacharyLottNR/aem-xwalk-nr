function slug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resolve the anchor target for a section from a Title Stryker block heading.
// Major sections lead with a `title-stryker` block, while sub-sections do not,
// so this naturally limits the nav to the page's primary sections. An explicit
// "Anchor Label" section field still wins when set.
function anchorFor(section) {
  // Section metadata keys are normalized to lowercase, so the "anchorLabel"
  // field surfaces as dataset.anchorlabel (not camelCase).
  let label = (section.dataset.anchorlabel || section.dataset.anchorLabel)?.trim();
  if (!label) {
    const titleBlock = section.querySelector('.title-stryker');
    if (titleBlock) {
      // The anchor block can decorate before the title-stryker block does, so
      // its <h2> may not exist yet. Prefer the decorated heading, but fall back
      // to the raw first-cell text of the block table.
      const heading = titleBlock.querySelector('h1, h2, h3');
      label = (heading || titleBlock.querySelector(':scope > div > div'))?.textContent.trim();
    }
  }
  if (!label) return null;
  if (!section.id) section.id = slug(label);
  return { id: section.id, label };
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

  const linkBySectionId = new Map();
  const linkedSections = [];

  laterSections.forEach((section) => {
    const anchor = anchorFor(section);
    if (!anchor) return;

    const link = document.createElement('a');
    link.className = 'section-anchor-stryker-link';
    link.href = `#${anchor.id}`;
    link.textContent = anchor.label;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${anchor.id}`);
    });
    nav.append(link);
    linkBySectionId.set(anchor.id, link);
    linkedSections.push(section);
    section.dataset.anchorId = anchor.id;
  });

  if (!nav.children.length) return;
  block.append(nav);

  // Scroll-spy: highlight the link for the section currently in view
  const setActive = (id) => {
    linkBySectionId.forEach((link, sectionId) => {
      link.classList.toggle('active', sectionId === id);
    });
  };

  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    // Highlight the topmost section currently in view
    const topmost = linkedSections.find((section) => visible.has(section));
    if (topmost) setActive(topmost.dataset.anchorId);
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  });

  linkedSections.forEach((section) => observer.observe(section));
}
