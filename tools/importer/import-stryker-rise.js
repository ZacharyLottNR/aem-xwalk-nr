/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker RISE OR-integration page.
 * Output: content/stryker/rise.plain.html
 */

const MEDIA = 'https://media-assets.stryker.com/is/image/stryker';
const PLACE = (w, h, t) => `https://placehold.co/${w}x${h}/eeeeee/333333?text=${encodeURIComponent(t)}`;

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

export default {
  transform: ({ document }) => {
    const main = document.createElement('div');
    const childBlock = (name, cells) => WebImporter.Blocks.createBlock(document, { name, cells });
    const blockNames = [];

    const addBlock = (name, cells, first = false) => {
      if (!first) main.append(document.createElement('hr'));
      main.append(WebImporter.Blocks.createBlock(document, { name, cells }));
      blockNames.push(name);
    };

    // Sticky section anchor nav (links to named sections that follow).
    addBlock('section-anchor-stryker', [['']], true);

    // Overview section
    main.append(document.createElement('hr'));
    main.append(el(document, 'h2', 'Overview'));
    main.append(el(document, 'p', 'Welcome to the RISE of a new OR for ENT and Neurosurgery.'));

    // Product preview (360 viewer) within the Overview section
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'product-preview-stryker',
      cells: [
        ['The'],
        ['RISE Neurotechnology Cart'],
        [el(document, 'div', '<p>The customizable RISE Neurotechnology Cart accommodates unique demands of the RISE Ecosystem in ENT and Neurosurgery.</p>')],
        ['Click and drag the cart for a 360 view or use the arrows below to rotate.'],
        [img(document, `${MEDIA}/iSuite-2929x1648?$max_width_1410$`, 'RISE Neurotechnology Cart view 1')],
        [img(document, `${MEDIA}/Connectivity-Neurotech-cart-OR-hub?$max_width_1410$`, 'RISE Neurotechnology Cart view 2')],
        [img(document, `${MEDIA}/Centralized-control-v3?$max_width_1440$`, 'RISE Neurotechnology Cart view 3')],
        ['Flex arm for custom positioning'],
        ['IV hooks'],
        ['Keyboard and mouse tray'],
        ['Storage for EM generator and flex arm of the Stryker ENT navigation system'],
        ['Suction canister holder'],
        ['Storage drawer for cables and foot pedal'],
      ],
    }));
    blockNames.push('product-preview-stryker');
    main.append(WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { name: 'Overview' } }));

    // Features section: Visualization image collection
    main.append(document.createElement('hr'));
    const galleryItem = (slug, title, body) => childBlock('image-gallery-item-stryker', [
      [img(document, `${MEDIA}/${slug}?$max_width_auto$`, title)],
      [el(document, 'div', `<h3>${title}</h3><p>${body}</p>`)],
      [''],
    ]);
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'image-collection-stryker',
      cells: [
        ['Visualization,'],
        ['reimagined'],
        [galleryItem('Tone-mode', 'Tone mode', 'Balance brightness and illuminate shadows across the field of view by enhancing posterior lighting without compromising foreground detail.')],
        [galleryItem('Full-frame-HDR', 'Full frame HDR', 'High dynamic range (HDR), is designed to provide more detail in shadows and highlights of the image.')],
        [galleryItem('One-billion-colors', 'Experience one billion colors', '62.5x more colors.')],
        [galleryItem('Fluorescence-imaging-v2', 'Fluorescence imaging', 'Experience clearer delineation of fluorescence signal designed for improved visualization of critical anatomy and perfusion.')],
      ],
    }));
    blockNames.push('image-collection-stryker');
    main.append(WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { name: 'Features' } }));

    // Contact section
    main.append(document.createElement('hr'));
    main.append(el(document, 'h2', 'Contact'));
    main.append(el(document, 'p', 'Contact an expert about RISE.'));
    main.append(WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { name: 'Contact' } }));

    // References
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'legal-text-stryker',
      cells: [[el(document, 'div', '<p><strong>References</strong></p><ol><li>As compared to previous Stryker offering</li><li>1937000</li><li>1000904469</li><li>COMMS-COMSO-WHPR-1532602</li></ol><p>ENDO-GSNPS-SYK-2116500</p><p>Last Updated July/2025</p>')]],
    }));
    blockNames.push('legal-text-stryker');

    // Page metadata
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'metadata',
      cells: {
        Title: 'RISE | OR Integration | Stryker',
        theme: 'stryker',
        nav: '/content/stryker/nav',
        footer: '/content/stryker/footer',
      },
    }));

    return [{
      element: main,
      path: '/stryker/rise',
      report: { title: 'RISE', template: 'stryker-rise', blocks: blockNames },
    }];
  },
};
