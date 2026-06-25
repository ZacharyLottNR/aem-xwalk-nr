function slug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resolve the anchor target for a section: prefer an explicit section name
// (Content Tree label), then fall back to the first heading with an id (these
// are the anchors actually authored on the page, e.g. <h2 id="connectivity">).
function anchorFor(section) {
  const name = section.dataset.name?.trim();
  if (name) {
    if (!section.id) section.id = slug(name);
    return { id: section.id, label: name };
  }
  const heading = section.querySelector('h1[id], h2[id], h3[id], h4[id]');
  if (heading) {
    return { id: heading.id, label: heading.textContent.trim() };
  }
  return null;
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
