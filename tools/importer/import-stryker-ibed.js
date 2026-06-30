/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker iBed Wireless product page.
 * Output: content/stryker/ibed-wireless.plain.html
 */

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
    // Build a child block; if creation fails, emit an inline error node instead.
    const childBlock = (name, cells) => {
      try {
        return WebImporter.Blocks.createBlock(document, { name, cells });
      } catch (blockErr) {
        return errorBlock(document, `failed to build the "${name}" block — ${blockErr.message}`);
      }
    };
    const blockNames = [];

    const MEDIA = 'https://media-assets.stryker.com/is/image/stryker';

    try {
    const RES = 'https://www.stryker.com/content/dam/stryker/acute-care/products/ibedwireless/resources';

    // Hero (product) — eyebrow, heading, subtext, CTA, background image
    main.append(childBlock('home-hero-stryker', [
      ['Acute Care'],
      ['Connected solutions'],
      ['Bringing people and information together for enhanced patient care.'],
      [anchor(document, '/stryker/home', 'Contact an expert')],
      ['Contact an expert'],
      [img(document, `${MEDIA}/nurse-arms-crossed_prime-conect_procuity-bed_1920x640?$max_width_1440$`, 'Nurse standing with hospital beds')],
    ]));
    blockNames.push('home-hero-stryker');

    // === OVERVIEW: Innovation that empowers outcomes ===
    main.append(document.createElement('hr'));
    main.append(el(document, 'h2', 'Innovation that empowers outcomes'));
    main.append(el(document, 'p', 'With nurses caring for more patients than ever before, the demands upon them have only increased. We offer caregivers connected and confident care at their fingertips.'));
    main.append(el(document, 'p', "Available with Stryker's Prime Connect stretchers, ProCuity bed series, S3 MedSurg and InTouch Critical Care beds, our connected solutions are compatible with most healthcare information management systems, allowing your facility to build a custom end solution. Our connected solutions were designed to help support patient fall prevention protocols, simplify workflows and enhance patient safety. At the heart of our system is iBed Wireless—the enabling technology that allows us to bring these solutions to your healthcare facility."));

    // 3 feature cards — Focus on patient safety / Simplify workflows / Integrate
    const featCard = (slug, title, body) => [
      img(document, `${MEDIA}/${slug}?$max_width_1440$`, title),
      '',
      anchor(document, '#', title),
      el(document, 'div', `<p><strong>${title}</strong></p><p>${body}</p>`),
    ];
    main.append(childBlock('cards-stryker', [
      [''],
      ['3'],
      ['product'],
      featCard('reduce-risk_icon_440x220', 'Focus on patient safety', 'Take a proactive approach to help prevent patient injuries, such as falls. With bed alarm notifications and an enhanced ability to monitor risk, our system can assist your hospital staff respond to patient safety risks quickly.'),
      featCard('simplify-workflow_icon_440x220', 'Simplify workflows', 'With our connected solutions in your hospital, caregivers can access data-driven insights that aid in effective clinical decision-making, and help improve processes related to patient care protocols, asset management and asset maintenance.'),
      featCard('Integrate_your_systems_icon_440x220', 'Integrate your systems', "Stryker's connected products are an open-architecture and adaptable solution that can work with dozens of third-party systems. Protect and enhance your hospital's investments by sharing and coordinating data across various electronic health records (EHR), nurse call systems, communication devices and applications."),
    ]));
    blockNames.push('cards-stryker');

    // Vision / SEM / Secure Connect — alternating image + text blocks
    const featureBlock = (slug, alt, heading, paras, layout) => {
      main.append(document.createElement('hr'));
      main.append(childBlock('text-and-media-stryker', [
        [img(document, `${MEDIA}/${slug}?$max_width_1440$`, alt)],
        [''],
        [''],
        [heading],
        [el(document, 'div', paras.map((p) => `<p>${p}</p>`).join(''))],
        ['basic'],
        [layout],
      ]));
      blockNames.push('text-and-media-stryker');
    };
    featureBlock('ibed-vision-doc-viewing-dashboard', "Stryker's Vision dashboard", 'Vision', [
      'Vision is a protocol management dashboard that gives caregivers visibility to safe hospital bed and stretcher configuration compliance and bed exit alarm activity.',
      "It takes fall risk data pulled directly from a patient's EHR and associates it with appropriate fall prevention protocols, set by HCPs, to help provide a safer patient experience and an easier workflow for caregivers.",
    ], 'media-left');
    featureBlock('sem-tech-at-desk', 'Smart Equipment Management', 'Smart Equipment Management (SEM)', [
      "SEM is a cloud-based application available for hospitals who are looking to gather near real-time data from their Stryker connected beds and stretchers. With SEM, you will be able to remotely identify the bed and stretcher's location, serial number, operational status, preventive maintenance, error codes and more.",
      'This intuitive application is compatible with computers, tablets and mobile phones, allowing you flexibility to remotely evaluate your equipment.',
    ], 'media-right');
    featureBlock('Secure_Connect', 'Secure Connect wireless', 'Secure Connect', [
      "With Secure Connect, there's no need to constantly plug and unplug nurse call cables from the wall into the bed. Designed to help reduce errors and improve efficiency, Secure Connect provides 99.99% reliability for crucial patient safety information such as bed exit alarms to be transmitted to your facility's nurse call system.",
    ], 'media-left');

    // Section banner CTA
    main.append(document.createElement('hr'));
    main.append(childBlock('section-banner-stryker', [
      [el(document, 'div', '<p>Interested in learning more? <strong>Talk to a rep today.</strong></p>')],
    ]));
    blockNames.push('section-banner-stryker');

    // Tabbed content: Product Information / Related Products / Videos
    main.append(document.createElement('hr'));

    // Tabbed content mirrors cards-stryker: a single block whose first row is the
    // block-level heading field, followed by one multi-cell row per item. Items
    // sharing a tabName group under one tab. Item cell order matches the model:
    // tabName, image, text, linkText, link (imageAlt folds into the image). A
    // YouTube link renders a video player; any other link renders a card CTA
    // whose label is linkText (the aem-content link field only keeps the URL).
    const tabCard = (tabName, image, title, body, linkText, linkUrl) => [
      tabName,
      img(document, image, title),
      el(document, 'div', `<p>${title}</p>${body ? `<p>${body}</p>` : ''}`),
      linkText,
      anchor(document, linkUrl || '/stryker/home', linkText),
    ];
    const tabVideo = (tabName, title, url) => [
      tabName,
      '',
      el(document, 'div', `<p>${title}</p>`),
      '',
      videoAnchor(document, url),
    ];

    main.append(childBlock('tabbed-content-stryker', [
      // Block-level field row (heading; blank here) precedes the item rows.
      [''],
      // Tab 1: Product Information — brochure PDF thumbnails
      tabCard('Product Information', `${RES}/Connected%20Solutions%20Beds%20Brochure%20Web.pdf.thumb.319.319.png`, 'Connected Solutions Beds Brochure Web.pdf', '', 'Download'),
      tabCard('Product Information', `${RES}/Connected%20Solutions%20Stretcher%20Brochure%20Web.pdf.thumb.319.319.png`, 'Connected Solutions Stretcher Brochure Web.pdf', '', 'Download'),
      tabCard('Product Information', `${RES}/iBed%20Wireless_SS_Mkt%20Lit-1371%20Rev%20C.pdf.thumb.319.319.png`, 'iBed Wireless Spec Sheet', '', 'Download'),
      // Tab 2: Related Products — product cards (real Stryker thumbnails)
      tabCard('Related Products', `${MEDIA}/Thumbnail_ProCuity?$preset_426_254$`, 'ProCuity LE(X) / Z(X)', 'For an enhanced MedSurg experience', 'Learn more', '/stryker/home'),
      tabCard('Related Products', `${MEDIA}/Thumbnail_S3_SYK?$preset_426_254$`, 'S3', 'Safe. Simple. Secure.', 'Learn more', '/stryker/home'),
      tabCard('Related Products', `${MEDIA}/Thumbnail_InTouch_SYK_2?$preset_426_254$`, 'InTouch', 'Basic needs. Simplified care. Exceptional outcomes.', 'Learn more', '/stryker/home'),
      tabCard('Related Products', `${MEDIA}/20200708-Stryker_Surfaces-31?$preset_426_254$`, 'Prime Series', 'Patient transport, redefined.', 'Learn more', '/stryker/home'),
      tabCard('Related Products', `${MEDIA}/screenshot-ADH%20copy?$preset_426_254$`, 'Advanced Digital Healthcare', 'Connected technology for better outcomes.', 'Learn more', '/stryker/home'),
      // Tab 3: Videos — embedded players
      tabVideo('Videos', 'NW15', 'https://youtu.be/kRIuiIy_SCs'),
      tabVideo('Videos', 'iBed Vision', 'https://youtu.be/kRIuiIy_SCs'),
    ]));
    blockNames.push('tabbed-content-stryker');

    // ProCare + Power to purchase — paired promo cards
    main.append(document.createElement('hr'));
    const promoCard = (slug, alt, title, body) => [
      img(document, `${MEDIA}/${slug}`, alt),
      '',
      anchor(document, '/stryker/home', title),
      el(document, 'div', `<p><strong>${title}</strong></p><p>${body}</p>`),
    ];
    main.append(childBlock('cards-stryker', [
      [''],
      ['3'],
      ['default'],
      promoCard('ProCare?$preset_666_392$', 'ProCare for acute care', 'ProCare Services', 'Our expert medical device technicians help ensure your equipment is ready to perform when you need it. With preventive maintenance plans and tailored service support, we help you maximize the life of your equipment—and your investment.'),
      promoCard('flex-financial-2550x750?$max_width_1440$', 'Flex Financial', 'Power to purchase', 'Through our Flex Financial business we can help you acquire our full portfolio of products and offer numerous payment structures that can be customized to meet your budgetary needs.'),
    ]));
    blockNames.push('cards-stryker');

    // Legal references
    main.append(document.createElement('hr'));
    main.append(childBlock('legal-text-stryker', [
      [el(document, 'div', '<p>1. The features listed are only available when iBed Wireless is integrated with third party systems that bring data to EHRs, Handheld devices, Alert Management Systems, Nurse Call, or Asset Management Systems.</p><p>2. As outlined in the IFU, 99.99% efficiency is based on a 10 second time frame, as indicated with UL compliance.</p>')],
    ]));
    blockNames.push('legal-text-stryker');

    // Page metadata
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'metadata',
      cells: {
        Title: 'iBed Wireless | Acute Care | Stryker',
        theme: 'stryker',
        nav: '/content/stryker/nav',
        footer: '/content/stryker/footer',
      },
    }));

    return [{
      element: main,
      path: '/stryker/ibed-wireless',
      report: { title: 'iBed Wireless', template: 'stryker-ibed', blocks: blockNames },
    }];
    } catch (err) {
      main.append(errorBlock(document, err && err.message ? err.message : String(err)));
      return [{
        element: main,
        path: '/stryker/ibed-wireless',
        report: { title: 'iBed Wireless', template: 'stryker-ibed', blocks: blockNames.concat('error') },
      }];
    }
  },
};
