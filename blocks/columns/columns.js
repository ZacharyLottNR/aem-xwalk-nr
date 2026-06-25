// A text-and-media-stryker block authored inside a column does not round-trip
// as a nested block; its fields flatten into paragraphs and the theme/layout
// field values leak as literal text (e.g. "basic", "media-left"). Detect that
// shape, strip the leaked markers, and tag the column so it renders cleanly.
const TAM_THEMES = ['basic', 'advanced', 'super-left', 'super-right'];
const TAM_LAYOUTS = ['media-left', 'media-right'];

function cleanFlattenedTextAndMedia(col) {
  const paragraphs = [...col.querySelectorAll(':scope > p')];
  const markers = paragraphs.filter((p) => {
    const t = p.textContent.trim().toLowerCase();
    return p.children.length === 0
      && (TAM_THEMES.includes(t) || TAM_LAYOUTS.includes(t));
  });
  if (!markers.length) return;
  markers.forEach((p) => p.remove());
  col.classList.add('columns-text-media');
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      cleanFlattenedTextAndMedia(col);

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
