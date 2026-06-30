/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker RISE OR-integration page (full parity).
 * Output: content/stryker/rise.plain.html
 */

const MEDIA = 'https://media-assets.stryker.com/is/image/stryker';

// Fallbacks used when a source asset can't be resolved during import.
const FALLBACK_IMAGE = 'https://author-p63260-e524717.adobeaemcloud.com/adobe/dynamicmedia/deliver/dm-aid--5df6d573-c301-41be-bd6e-f55a17edf39d/stryker-logo-thumbnail-1.jpg';
const FALLBACK_VIDEO = 'https://youtu.be/kRIuiIy_SCs?si=BxJbaFO8GU6mARUS';

// A url is usable only if it's a non-empty string with no unresolved tokens.
function isUsableUrl(value) {
  return typeof value === 'string'
    && value.trim() !== ''
    && !/\b(undefined|null|NaN)\b/.test(value);
}

function el(document, tag, html) {
  const node = document.createElement(tag);
  if (html != null) node.innerHTML = html;
  return node;
}

// Surfaces a problem inline so the page still renders with an explanation.
function errorBlock(document, message) {
  return el(document, 'div', `<p>something went wrong: ${message}</p>`);
}

function img(document, src, alt) {
  const i = document.createElement('img');
  i.src = isUsableUrl(src) ? src : FALLBACK_IMAGE;
  i.alt = alt || '';
  return i;
}

function videoAnchor(document, url, text) {
  const href = isUsableUrl(url) ? url : FALLBACK_VIDEO;
  return anchor(document, href, isUsableUrl(text) ? text : href);
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

    // Build a block; if creation fails, emit an inline error node instead so the
    // rest of the page still renders.
    const block = (name, cells) => {
      blockNames.push(name);
      try {
        return WebImporter.Blocks.createBlock(document, { name, cells });
      } catch (blockErr) {
        return errorBlock(document, `failed to build the "${name}" block — ${blockErr.message}`);
      }
    };
    // A section is a group of nodes; sections are separated by <hr>. Section
    // metadata (e.g. anchorLabel) is emitted as a Section Metadata block at the
    // end of the section.
    const sections = [];
    const video = (url) => block('video-stryker', [[videoAnchor(document, url)], ['']]);
    const titleBlock = (text) => block('title-stryker', [[text], ['gold'], ['h2']]);

    try {

    // === SECTION 1: healthcare-pro eyebrow + landing video + sticky anchor nav ===
    sections.push([
      block('right-justified-text-stryker', [[el(document, 'div', '<h3>Information for <strong>healthcare professionals</strong></h3>')]]),
      block('home-video-hero-stryker', [
        [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
        ['center'],
      ]),
      block('section-anchor-stryker', [['']]),
    ]);

    // === SECTION 2 (anchor "Your OR. Your way."): overview + video + break + super t&m + product preview ===
    const featCard = (image, title, items) => [
      img(document, image, title),
      title,
      el(document, 'div', `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`),
    ];
    sections.push([
      block('overview-stryker', [
        ['Introducing'],
        ['RISE'],
        [el(document, 'div', '<br>Your Reimagined Integrated<br>Surgical Experience')],
        [el(document, 'div', '<p>Welcome to the RISE of a new OR for ENT and Neurosurgery.</p><p>RISE integrates existing Stryker solutions to create a connected surgical experience tailored just for you. Designed to improve workflow efficiencies to create a better surgical experience.<sup>2</sup></p>')],
        ['product'],
        featCard(`${MEDIA}/Your-OR-Your-Way-v2?$max_width_1440$`, 'Your OR. Your way.', ['An OR designed for you', 'Helps reduce footprint', 'Designed to improve workflow efficiencies']),
        featCard(`${MEDIA}/Connectivity-v2?$max_width_1440$`, 'Connectivity', ['Devices in harmony', 'Multiple touchpoints', 'Flow from surgery to surgery']),
        featCard(`${MEDIA}/Visualization-v2?$max_width_1440$`, 'Visualization', ['Vibrant surgical image', '62.5x more visible colors', 'Scope and sheath solution']),
      ]),
      video('https://youtu.be/kRIuiIy_SCs?si=vbHr2Ip-2ueZdTrC'),
      block('content-break-stryker', [['little']]),
      block('text-and-media-stryker', [
        [img(document, `${MEDIA}/iSuite-2929x1648?$max_width_1410$`, 'iSuite')],
        [''],
        ['Your OR.'],
        ['Your way.'],
        [el(document, 'div', 'From conveniently mobile Neurotechnology Carts to permanently installed iSuites, RISE is a surgical evolution that can be customized and configured to meet your needs. Choose an experience that works for you and your team.')],
        ['super'],
        ['media-left'],
      ]),
      block('product-preview-stryker', [
        ['The'],
        ['RISE Neurotechnology Cart'],
        [el(document, 'div', 'The customizable RISE Neurotechnology Cart accommodates unique demands of the RISE Ecosystem in ENT and Neurosurgery.')],
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
      ]),
    ]);

    // === SECTION 3 (anchor "Connectivity"): title + video + 4 t&m + video + break ===
    sections.push([
      titleBlock('Connectivity'),
      video('https://youtu.be/N14a0vnfxCc?si=I58_ePuY2yvPe-Ve'),
      block('text-and-media-stryker', [
        [img(document, `${MEDIA}/Connectivity-Neurotech-cart-OR-hub?$max_width_1410$`, '')],
        [''],
        [''],
        [''],
        [el(document, 'div', '<p>As the command center for RISE, the <strong>Connected OR Hub</strong> facilitates connectivity and allows you to control your devices from multiple touch points.</p><ul><li><strong>Capture and record</strong></li><li><strong>Custom surgeon profiles</strong></li><li><strong>Voice activation</strong></li><li><strong>Device control in and outside of the sterile field</strong></li></ul>')],
        ['super-left'],
        ['media-right'],
      ]),
      block('text-and-media-stryker', [
        [img(document, `${MEDIA}/Centralized-control-v3?$max_width_1440$`, 'Centralized control')],
        [''],
        ['Centralized'],
        ['control'],
        [el(document, 'div', 'Your team can assist you from the doc station without breaking sterility around the sterile field.')],
        ['advanced'],
        ['media-left'],
      ]),
      block('text-and-media-stryker', [
        [''],
        [videoAnchor(document, 'https://youtu.be/N14a0vnfxCc?si=I58_ePuY2yvPe-Ve')],
        ['Surgeon profiles'],
        ['and equipment checklist'],
        [el(document, 'div', 'Your team taps your custom profile, and the equipment checklist guides setup.')],
        ['advanced'],
        ['media-right'],
      ]),
      block('text-and-media-stryker', [
        [img(document, `${MEDIA}/Consolidated-Foot-Pedal?$max_width_1410$`, 'Consolidated foot pedal')],
        [''],
        ['Consolidated'],
        ['foot pedal'],
        [el(document, 'div', 'Foot pedal consolidation reduces OR clutter and provides surgeons choice of device management.')],
        ['super-right'],
        ['media-right'],
      ]),
      video('https://youtu.be/kRIuiIy_SCs?si=Fai3KIye_79hKZfb'),
      block('content-break-stryker', [['little']]),
    ]);

    // === SECTION 4 (no anchor): Visualization title + para + video + double-t&m + image collection ===
    const galleryItem = (slug, title, body) => childBlock('image-gallery-item-stryker', [
      [img(document, `${MEDIA}/${slug}?$max_width_auto$`, title)],
      [el(document, 'div', `<h3>${title}</h3><p>${body}</p>`)],
      [''],
    ]);
    sections.push([
      titleBlock('Visualization'),
      el(document, 'p', "RISE integrates clear, vivid surgical images with the 1788 platform, Stryker's most vibrant surgical 4K image ever."),
      video('https://youtu.be/kRIuiIy_SCs?si=DWN7mNJKbGlyKuVL'),
      block('double-text-and-media-stryker', [
        [img(document, `${MEDIA}/Real-time-device-status-400x300?$max_width_1440$`, 'Real-time device statuses')],
        ['Real-time device statuses'],
        [img(document, `${MEDIA}/Integrated-camera-head-400x300?$max_width_1440$`, 'Integrated camera head')],
        ['Integrated camera head'],
      ]),
      block('image-collection-stryker', [
        ['Visualization,'],
        ['reimagined'],
        [galleryItem('Tone-mode', 'Tone mode', 'Balance brightness and illuminate shadows across the field of view by enhancing posterior lighting without compromising foreground detail.<sup>3</sup>')],
        [galleryItem('Full-frame-HDR', 'Full frame HDR', 'High dynamic range (HDR), is designed to provide more detail in shadows and highlights of the image.<sup>3</sup>')],
        [galleryItem('One-billion-colors', 'Experience one billion colors', '62.5x more colors<sup>1,3</sup>')],
        [galleryItem('Fluorescence-imaging-v2', 'Fluorescence imaging', 'Experience clearer delineation of fluorescence signal designed for improved visualization of critical anatomy and perfusion.<sup>1,3</sup>')],
      ]),
    ]);

    // === SECTION 5 (anchor "Related Products"): cards + break ===
    const prodCard = (slug, title, body) => [
      img(document, `${MEDIA}/${slug}?$preset_426_254$`, title),
      'Learn more',
      anchor(document, '/stryker/home', '/stryker/home'),
      el(document, 'div', `<p>${title}</p><p>${body}</p>`),
    ];
    sections.push([
      block('cards-stryker', [
        ['Related products'],
        ['4'],
        ['product'],
        prodCard('thumbnail-2', 'Advanced Digital Healthcare', 'From advanced devices and software that transform care settings into state-of-the-art environments, to advanced visualization that guides surgeons and robotics with insightful analytics.'),
        prodCard('thumbnail-10', '1788 Platform for Minimally Invasive Surgery', 'A sophisticated surgical visualization system for multiple specialties, featuring vibrant images and enhanced fluorescence imaging capabilities.'),
        prodCard('thumbnail-3', 'Connected OR operating system', 'Our Connected OR platform optimizes the surgical environment by leveraging intelligence and automation with efficiency and safety in mind.'),
        prodCard('thumbnail-1', 'The iSuite Experience', 'Your customized, efficient, seamlessly integrated operating room. To create your iSuite, our team will guide you through the entire process.'),
        prodCard('Pello%20landing%20page%20Hero', 'Pello microdebrider', "Stryker's innovative ENT microdebrider with proprietary blades, designed for reduced clogging, efficient cutting and reliability in ENT procedures."),
        prodCard('Stryker%20unit%20with%20pro%20cart_4Kmonitor_Scopis-2', 'Stryker ENT navigation system', 'A next-generation solution powered by Scopis software. Designed to enhance precision, the system adapts to a variety of preferences and tools.'),
        prodCard('signature-2-iBur-family-1500x892', 'High Speed Drills', 'The most comprehensive and customizable neurosurgical high speed drill platform — Signature 2 Portfolio aims to provide the exact tool and touch you want.'),
        prodCard('sonopet-iq-console-handpiece', 'Sonopet iQ', 'The Sonopet iQ Ultrasonic Aspirator delivers the power and control you need to fragment, emulsify and aspirate soft tissue and bone.'),
      ]),
      block('content-break-stryker', [['little']]),
    ]);

    // === SECTION 6 (no anchor): Contact us title + para ===
    sections.push([
      titleBlock('Contact us'),
      el(document, 'p', 'Contact an expert about RISE.'),
    ]);

    // === SECTION 7: references (legal text) ===
    sections.push([
      block('legal-text-stryker', [
        [el(document, 'div', '<p><strong>References</strong></p><ol><li>As compared to previous Stryker offering</li><li>1937000</li><li>1000904469</li><li>COMMS-COMSO-WHPR-1532602</li></ol><p>ENDO-GSNPS-SYK-2116500</p><p>Last Updated July/2025</p>')],
      ]),
    ]);

    // anchorLabel per section (empty = no section metadata).
    const anchorLabels = ['', 'Your OR. Your way.', 'Connectivity', '', 'Related Products', '', ''];

    sections.forEach((nodes, sIdx) => {
      if (sIdx > 0) main.append(document.createElement('hr'));
      nodes.forEach((node) => main.append(node));
      const label = anchorLabels[sIdx];
      if (label) {
        main.append(WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { anchorLabel: label },
        }));
      }
    });

    // Page metadata
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'metadata',
      cells: {
        Title: 'RISE | OR Integration | Stryker',
        Description: 'Welcome to the RISE of a new OR for ENT and Neurosurgery.',
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
    } catch (err) {
      main.append(errorBlock(document, err && err.message ? err.message : String(err)));
      return [{
        element: main,
        path: '/stryker/rise',
        report: { title: 'RISE', template: 'stryker-rise', blocks: blockNames.concat('error') },
      }];
    }
  },
};
