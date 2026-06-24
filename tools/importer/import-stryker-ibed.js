/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker iBed Wireless product page.
 * Output: content/stryker/ibed-wireless.plain.html
 */

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

    const MEDIA = 'https://media-assets.stryker.com/is/image/stryker';
    const RES = 'https://www.stryker.com/content/dam/stryker/acute-care/products/ibedwireless/resources';

    // Hero (product) — eyebrow, heading, subtext, CTA, background image
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'home-hero-stryker',
      cells: [
        ['Acute Care'],
        ['Connected solutions'],
        ['Bringing people and information together for enhanced patient care.'],
        [anchor(document, '/stryker/home', 'Contact an expert')],
        ['Contact an expert'],
        [img(document, `${MEDIA}/nurse-arms-crossed_prime-conect_procuity-bed_1920x640?$max_width_1440$`, 'Nurse standing with hospital beds')],
      ],
    }));
    blockNames.push('home-hero-stryker');

    // Tabbed content: Product Information / Related Products / Videos
    main.append(document.createElement('hr'));

    // Tab 1: Product Information — brochure PDF thumbnails as a card grid
    const docCard = (title, thumb) => [
      img(document, thumb, title),
      'Download',
      anchor(document, '/stryker/home', 'Download'),
      el(document, 'div', `<p>${title}</p>`),
    ];
    const productInfoCards = childBlock('cards-stryker', [
      [''],
      ['3'],
      ['default'],
      docCard('Connected Solutions Beds Brochure Web.pdf', `${RES}/Connected%20Solutions%20Beds%20Brochure%20Web.pdf.thumb.319.319.png`),
      docCard('Connected Solutions Stretcher Brochure Web.pdf', `${RES}/Connected%20Solutions%20Stretcher%20Brochure%20Web.pdf.thumb.319.319.png`),
      docCard('iBed Wireless Spec Sheet', `${RES}/iBed%20Wireless_SS_Mkt%20Lit-1371%20Rev%20C.pdf.thumb.319.319.png`),
    ]);
    const tabProductInfo = childBlock('tabbed-content-tab-stryker', [['Product Information'], [productInfoCards]]);

    // Tab 2: Related Products — product cards with Learn More
    const relatedCard = (title, sub) => [
      img(document, PLACE(400, 300, title), title),
      'Learn More',
      anchor(document, '/stryker/home', 'Learn More'),
      el(document, 'div', `<p>${title}</p><p>${sub}</p>`),
    ];
    const relatedCards = childBlock('cards-stryker', [
      [''],
      ['3'],
      ['default'],
      relatedCard('ProCuity LE(X) / Z(X)', 'For an enhanced MedSurg experience'),
      relatedCard('S3', 'Safe. Simple. Secure.'),
      relatedCard('InTouch', 'Basic needs. Simplified care. Exceptional outcomes.'),
    ]);
    const tabRelated = childBlock('tabbed-content-tab-stryker', [['Related Products'], [relatedCards]]);

    // Tab 3: Videos — two video players
    const v1 = childBlock('video-stryker', [
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
      [img(document, PLACE(800, 450, 'NW15'), 'NW15 video')],
    ]);
    const v2 = childBlock('video-stryker', [
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
      [img(document, PLACE(800, 450, 'iBed Vision'), 'iBed Vision video')],
    ]);
    const tabVideos = childBlock('tabbed-content-tab-stryker', [['Videos'], [v1], [v2]]);

    main.append(childBlock('tabbed-content-stryker', [
      [tabProductInfo],
      [tabRelated],
      [tabVideos],
    ]));
    blockNames.push('tabbed-content-stryker');

    // Cross-promo (ProCare)
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'cross-promo-stryker',
      cells: [
        [img(document, `${MEDIA}/ProCare?$preset_666_392$`, 'ProCare for acute care')],
        ['ProCare Services'],
        [anchor(document, '/stryker/home', 'ProCare')],
        ['Read more'],
        ['center'],
      ],
    }));
    blockNames.push('cross-promo-stryker');

    // Legal references
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'legal-text-stryker',
      cells: [[el(document, 'div', '<p>1. The features listed are only available when iBed Wireless is integrated with third party systems that bring data to EHRs, Handheld devices, Alert Management Systems, Nurse Call, or Asset Management Systems.</p><p>2. As outlined in the IFU, 99.99% efficiency is based on a 10 second time frame, as indicated with UL compliance.</p>')]],
    }));
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
  },
};
