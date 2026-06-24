/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker RISE OR-integration page (full parity).
 * Output: content/stryker/rise.plain.html
 */

const MEDIA = 'https://media-assets.stryker.com/is/image/stryker';

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

    const sectionMeta = (name) => WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { name } });
    const hr = () => main.append(document.createElement('hr'));
    const addBlock = (name, cells) => {
      main.append(WebImporter.Blocks.createBlock(document, { name, cells }));
      blockNames.push(name);
    };

    // Sticky section anchor nav (links to named sections that follow).
    addBlock('section-anchor-stryker', [['']]);

    // === OVERVIEW: intro hero + 3 feature columns ===
    hr();
    main.append(el(document, 'p', 'Introducing'));
    main.append(el(document, 'h1', 'RISE'));
    main.append(el(document, 'p', '<em>Your Reimagined Integrated Surgical Experience</em>'));
    main.append(el(document, 'p', 'Welcome to the RISE of a new OR for ENT and Neurosurgery.'));
    main.append(el(document, 'p', 'RISE integrates existing Stryker solutions to create a connected surgical experience tailored just for you. Designed to improve workflow efficiencies to create a better surgical experience.'));

    // 3 feature columns — overview cards (no two-color title here, plain image+title+list)
    const featCard = (image, title, items) => [
      img(document, image, title),
      title,
      el(document, 'div', `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`),
    ];
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'overview-stryker',
      cells: [
        [''],
        [''],
        [el(document, 'div', '')],
        [el(document, 'div', '')],
        featCard(`${MEDIA}/Your-OR-Your-Way-v2?$max_width_1440$`, 'Your OR. Your way.', ['An OR designed for you', 'Helps reduce footprint', 'Designed to improve workflow efficiencies']),
        featCard(`${MEDIA}/Connectivity-v2?$max_width_1440$`, 'Connectivity', ['Devices in harmony', 'Multiple touchpoints', 'Flow from surgery to surgery']),
        featCard(`${MEDIA}/Visualization-v2?$max_width_1440$`, 'Visualization', ['Vibrant surgical image', '62.5x more visible colors', 'Scope and sheath solution']),
      ],
    }));
    blockNames.push('overview-stryker');

    // Your OR. Your way. — iSuite image + paragraph (basic text-and-media)
    hr();
    addBlock('text-and-media-stryker', [
      [img(document, `${MEDIA}/iSuite-2929x1648?$max_width_1410$`, 'iSuite')],
      [''],
      ['Your OR.'],
      ['Your way.'],
      [el(document, 'div', '<p>From conveniently mobile Neurotechnology Carts to permanently installed iSuites, RISE is a surgical evolution that can be customized and configured to meet your needs. Choose an experience that works for you and your team.</p>')],
      ['advanced'],
      ['media-left'],
    ]);

    // RISE Neurotechnology Cart — product preview (360 viewer) + features
    hr();
    addBlock('product-preview-stryker', [
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
    ]);
    main.append(sectionMeta('Overview'));

    // === CONNECTIVITY ===
    hr();
    main.append(el(document, 'h2', 'Connectivity'));

    // Connected OR Hub — image + heading + list (basic text-and-media, media-left)
    addBlock('text-and-media-stryker', [
      [img(document, `${MEDIA}/Connectivity-Neurotech-cart-OR-hub?$max_width_1410$`, 'Connected OR Hub')],
      [''],
      ['Connected'],
      ['OR Hub'],
      [el(document, 'div', '<p>As the command center for RISE, the Connected OR Hub facilitates connectivity and allows you to control your devices from multiple touch points.</p><ul><li>Capture and record</li><li>Custom surgeon profiles</li><li>Voice activation</li><li>Device control in and outside of the sterile field</li></ul>')],
      ['advanced'],
      ['media-left'],
    ]);

    // Centralized control — image + two-color heading + paragraph (media-right)
    hr();
    addBlock('text-and-media-stryker', [
      [img(document, `${MEDIA}/Centralized-control-v3?$max_width_1440$`, 'Centralized control')],
      [''],
      ['Centralized'],
      ['control'],
      [el(document, 'div', '<p>Your team can assist you from the doc station without breaking sterility around the sterile field.</p>')],
      ['advanced'],
      ['media-right'],
    ]);

    // Consolidated foot pedal — image + two-color heading + paragraph (media-left)
    hr();
    addBlock('text-and-media-stryker', [
      [img(document, `${MEDIA}/Consolidated-Foot-Pedal?$max_width_1410$`, 'Consolidated foot pedal')],
      [''],
      ['Consolidated'],
      ['foot pedal'],
      [el(document, 'div', '<p>Foot pedal consolidation reduces OR clutter and provides surgeons choice of device management.</p>')],
      ['advanced'],
      ['media-left'],
    ]);
    main.append(sectionMeta('Connectivity'));

    // === VISUALIZATION ===
    hr();
    main.append(el(document, 'h2', 'Visualization'));
    main.append(el(document, 'p', "RISE integrates clear, vivid surgical images with the 1788 platform, Stryker's most vibrant surgical 4K image ever."));

    // Real-time device statuses + Integrated camera head — two-up image gallery
    addBlock('image-gallery-stryker', [
      [''],
      [''],
      [''],
      [''],
      [img(document, `${MEDIA}/Real-time-device-status-400x300?$max_width_1440$`, 'Real-time device statuses')],
      [img(document, `${MEDIA}/Integrated-camera-head-400x300?$max_width_1440$`, 'Integrated camera head')],
    ]);

    // Visualization, reimagined — image collection (4 items)
    hr();
    const galleryItem = (slug, title, body) => childBlock('image-gallery-item-stryker', [
      [img(document, `${MEDIA}/${slug}?$max_width_auto$`, title)],
      [el(document, 'div', `<h3>${title}</h3><p>${body}</p>`)],
      [''],
    ]);
    addBlock('image-collection-stryker', [
      ['Visualization,'],
      ['reimagined'],
      [galleryItem('Tone-mode', 'Tone mode', 'Balance brightness and illuminate shadows across the field of view by enhancing posterior lighting without compromising foreground detail.')],
      [galleryItem('Full-frame-HDR', 'Full frame HDR', 'High dynamic range (HDR), is designed to provide more detail in shadows and highlights of the image.')],
      [galleryItem('One-billion-colors', 'Experience one billion colors', '62.5x more colors.')],
      [galleryItem('Fluorescence-imaging-v2', 'Fluorescence imaging', 'Experience clearer delineation of fluorescence signal designed for improved visualization of critical anatomy and perfusion.')],
    ]);
    main.append(sectionMeta('Visualization'));

    // === RELATED PRODUCTS ===
    hr();
    main.append(el(document, 'h2', 'Related products'));
    const prodCard = (slug, title, body) => [
      img(document, `${MEDIA}/${slug}?$preset_426_254$`, title),
      'Learn more',
      anchor(document, '/stryker/home', title),
      el(document, 'div', `<p>${title}</p><p>${body}</p>`),
    ];
    addBlock('cards-stryker', [
      [''],
      ['4'],
      ['default'],
      prodCard('thumbnail-2', 'Advanced Digital Healthcare', 'From advanced devices and software that transform care settings into state-of-the-art environments, to advanced visualization that guides surgeons and robotics with insightful analytics.'),
      prodCard('thumbnail-10', '1788 Platform for Minimally Invasive Surgery', 'A sophisticated surgical visualization system for multiple specialties, featuring vibrant images and enhanced fluorescence imaging capabilities.'),
      prodCard('thumbnail-3', 'Connected OR operating system', 'Our Connected OR platform optimizes the surgical environment by leveraging intelligence and automation with efficiency and safety in mind.'),
      prodCard('thumbnail-1', 'The iSuite Experience', 'Your customized, efficient, seamlessly integrated operating room. To create your iSuite, our team will guide you through the entire process.'),
      prodCard('Pello%20landing%20page%20Hero', 'Pello microdebrider', "Stryker's innovative ENT microdebrider with proprietary blades, designed for reduced clogging, efficient cutting and reliability in ENT procedures."),
      prodCard('Stryker%20unit%20with%20pro%20cart_4Kmonitor_Scopis-2', 'Stryker ENT navigation system', 'A next-generation solution powered by Scopis software. Designed to enhance precision, the system adapts to a variety of preferences and tools.'),
      prodCard('signature-2-iBur-family-1500x892', 'High Speed Drills', 'The most comprehensive and customizable neurosurgical high speed drill platform — Signature 2 Portfolio aims to provide the exact tool and touch you want.'),
      prodCard('sonopet-iq-console-handpiece', 'Sonopet iQ', 'The Sonopet iQ Ultrasonic Aspirator delivers the power and control you need to fragment, emulsify and aspirate soft tissue and bone.'),
    ]);

    // === CONTACT ===
    hr();
    main.append(el(document, 'h2', 'Contact us'));
    main.append(el(document, 'p', 'Contact an expert about RISE.'));
    main.append(sectionMeta('Contact'));

    // References
    hr();
    addBlock('legal-text-stryker', [
      [el(document, 'div', '<p><strong>References</strong></p><ol><li>As compared to previous Stryker offering</li><li>1937000</li><li>1000904469</li><li>COMMS-COMSO-WHPR-1532602</li></ol><p>ENDO-GSNPS-SYK-2116500</p><p>Last Updated July/2025</p>')],
    ]);

    // Page metadata
    hr();
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
