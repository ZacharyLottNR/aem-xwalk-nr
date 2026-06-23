/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic QA gallery importer.
 *
 * Unlike the other importers, this does NOT parse a source page. It ignores the
 * navigated DOM and builds a page containing every Stryker block (with sample
 * authored content) so QA can eyeball them all in one place.
 *
 * Output: content/stryker/block-gallery.plain.html
 */

const IMG = (w, h, text) => `https://placehold.co/${w}x${h}/cccccc/333333?text=${encodeURIComponent(text)}`;

function el(document, tag, html) {
  const node = document.createElement(tag);
  if (html != null) node.innerHTML = html;
  return node;
}

function img(document, src, alt) {
  const i = document.createElement('img');
  i.src = src;
  i.alt = alt || '';
  return i;
}

function anchor(document, href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text || href;
  return a;
}

// A labeled heading before each block so the gallery is easy to scan.
function label(document, text) {
  const h = document.createElement('h2');
  h.textContent = text;
  return h;
}

export default {
  transform: ({ document }) => {
    const main = document.createElement('div');

    const blocks = [];

    // 1. home-video-hero-stryker — single video URL
    blocks.push(['home-video-hero-stryker', [
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
    ]]);

    // 2. content-break-stryker — no fields
    blocks.push(['content-break-stryker', [['']]]);

    // 3. get-to-know-us-stryker (standard layout)
    blocks.push(['get-to-know-us-stryker', [
      [img(document, IMG(600, 480, 'People'), 'People')],
      [el(document, 'div', '<h2>What we do</h2><p>Stryker is one of the world\'s leading medical technology companies. Alongside our customers around the world, we impact more than 150 million patients annually.</p>')],
      ['Get to know us'],
      [anchor(document, 'https://www.stryker.com/us/en/about.html', 'About')],
      ['standard'],
      [''],
    ]]);

    // 4. get-to-know-us-stryker (banner layout, with background band image)
    blocks.push(['get-to-know-us-stryker', [
      [img(document, IMG(520, 400, 'Responsibility'), 'Responsibility')],
      [el(document, 'div', '<h2>Corporate responsibility</h2><p>We are committed to positively impacting people and our planet through responsible, sustainable practices that create a better, healthier world.</p>')],
      ['Read our 2024 comprehensive report'],
      [anchor(document, 'https://www.stryker.com/us/en/about/corporate-responsibility.html', 'Report')],
      ['banner'],
      [img(document, IMG(1600, 200, 'Band'), 'Band')],
    ]]);

    // 5. cards-stryker (news, 4 columns)
    const newsCard = (title) => [
      img(document, IMG(360, 200, 'News'), title),
      'Read More',
      anchor(document, 'https://www.stryker.com/news', 'News'),
      el(document, 'div', `<p>${title}</p><p>Supporting copy for the news item goes here to show the card body.</p>`),
    ];
    blocks.push(['cards-stryker', [
      ['Latest news'],
      ['4'],
      ['news'],
      newsCard('Customer Updates: Stryker Network Disruption'),
      newsCard('Stryker partners with Fortune to share our digital innovation story'),
      newsCard('Stryker launches TPX HD power tool'),
      newsCard('AVS, Now Part of Stryker, Enrolls First Patient'),
    ]]);

    // 6. cards-stryker (default, 3 columns)
    const focusCard = (title, sub) => [
      img(document, IMG(400, 220, 'Focus'), title),
      'Learn More',
      anchor(document, 'https://www.stryker.com/focus', 'Focus'),
      el(document, 'div', `<p>${title}</p><p>${sub}</p>`),
    ];
    blocks.push(['cards-stryker', [
      ['Our focus'],
      ['3'],
      ['default'],
      focusCard('Medical and Surgical', 'Empowering people for powerful outcomes.'),
      focusCard('Orthopaedics and Spine', "Leading what's next."),
      focusCard('Neurotechnology', 'Better connected.'),
    ]]);

    // 7. image-gallery-stryker
    blocks.push(['image-gallery-stryker', [
      ['Awards'],
      ['We owe our achievements to our dedicated employees'],
      ['View all awards'],
      [anchor(document, 'https://www.stryker.com/awards', 'Awards')],
      [img(document, IMG(160, 130, 'Award 1'), 'Award 1')],
      [img(document, IMG(160, 130, 'Award 2'), 'Award 2')],
      [img(document, IMG(160, 130, 'Award 3'), 'Award 3')],
      [img(document, IMG(160, 130, 'Award 4'), 'Award 4')],
      [img(document, IMG(160, 130, 'Award 5'), 'Award 5')],
      [img(document, IMG(160, 130, 'Award 6'), 'Award 6')],
    ]]);

    // 8. video-stryker
    blocks.push(['video-stryker', [
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
      [img(document, IMG(800, 450, 'Poster'), 'Poster')],
    ]]);

    // 9. product-preview-stryker
    blocks.push(['product-preview-stryker', [
      ['The'],
      ['RISE Neurotechnology Cart'],
      [el(document, 'div', '<p>The customizable RISE Neurotechnology Cart accommodates unique demands of the RISE Ecosystem in ENT and Neurosurgery.</p>')],
      ['Click and drag the cart for a 360 view or use the arrows below to rotate.'],
      [img(document, IMG(500, 600, 'Frame 1'), 'Frame 1')],
      [img(document, IMG(500, 600, 'Frame 2'), 'Frame 2')],
      [img(document, IMG(500, 600, 'Frame 3'), 'Frame 3')],
      ['Flex arm for custom positioning'],
      ['IV hooks'],
      ['Keyboard and mouse tray'],
      ['Storage for EM generator'],
      ['Suction canister holder'],
      ['Storage drawer for cables and foot pedal'],
    ]]);

    // 10. legal-text-stryker
    blocks.push(['legal-text-stryker', [
      [el(document, 'div', '<p><strong>References</strong></p><ol><li>As compared to previous Stryker offering</li><li>1937000</li><li>1000904469</li><li>COMMS-COMSO-WHPR-1532602</li></ol><p>ENDO-GSNPS-SYK-2116500</p><p>Last Updated July/2025</p>')],
    ]]);

    // NOTE: quick-links-stryker is intentionally omitted. It is a nested-block
    // container (parent holds child quick-link-lists-stryker blocks). The
    // importer's markdown round-trip cannot faithfully reproduce nested blocks
    // (they degrade to nested <table> elements the renderer won't re-decorate).
    // The block works correctly under real Universal Editor authoring; for QA it
    // should be reviewed on a UE-authored page rather than this synthetic gallery.

    // Build the page: a label + block table per entry, separated by section breaks.
    blocks.forEach(([name, cells], idx) => {
      if (idx > 0) main.append(document.createElement('hr'));
      main.append(label(document, name));
      const block = WebImporter.Blocks.createBlock(document, { name, cells });
      main.append(block);
    });

    // Page metadata: stryker theme + shared nav/footer.
    main.append(document.createElement('hr'));
    const metadata = WebImporter.Blocks.createBlock(document, {
      name: 'metadata',
      cells: {
        Title: 'Block Gallery',
        theme: 'stryker',
        nav: '/content/stryker/nav',
        footer: '/content/stryker/footer',
      },
    });
    main.append(metadata);

    return [{
      element: main,
      path: '/stryker/block-gallery',
      report: { title: 'Block Gallery', template: 'block-gallery', blocks: blocks.map((b) => b[0]) },
    }];
  },
};
