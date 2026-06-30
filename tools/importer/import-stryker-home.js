/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker home page.
 *
 * Ignores the navigated DOM and assembles the page from our -stryker blocks
 * with the real homepage content. Output: content/stryker/home.plain.html
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

    try {
    // Section 1: landing video + What we do + content break (grouped, no breaks)
    const section1 = [];

    // 1. Full-width landing video (muted, looping, hidden on mobile)
    section1.push(['home-video-hero-stryker', [
      [videoAnchor(document, 'https://youtu.be/kRIuiIy_SCs')],
      ['center'],
    ]]);

    // 2. What we do (standard layout: text card left, 150M image right)
    section1.push(['get-to-know-us-stryker', [
      [img(document, `${MEDIA}/150M-white?$max_width_1440$`, '150 million patients')],
      [el(document, 'div', '<h2>What we do</h2><p>Stryker is one of the world\'s leading medical technology companies. Alongside our customers around the world, we impact more than 150 million patients annually.</p>')],
      ['Get to know us'],
      [anchor(document, '/stryker/home', 'About')],
      ['standard'],
      [''],
    ]]);

    // 3. Content break (default/Big divider) — closes section 1
    section1.push(['content-break-stryker', [
      [''],
    ]]);

    // Section 2: Latest news (cards, news style, 4 columns)
    const newsCard = (title, desc, href) => [
      img(document, `${MEDIA}/stryker-logo-thumbnail-1?$preset_307_184$`, title),
      'Read More',
      anchor(document, href, 'News'),
      el(document, 'div', `<p>${title}</p>${desc ? `<p>${desc}</p>` : ''}`),
    ];
    const section2 = [['cards-stryker', [
      ['Latest news'],
      ['4'],
      ['news'],
      newsCard('Customer Updates: Stryker Network Disruption', '', '/stryker/home'),
      newsCard('Stryker partners with Fortune to share our digital innovation story', 'Fortune Brand Studio sat down with Stryker leaders to explore how our connected digital solutions deliver value to our customers across the continuum of care.', '/stryker/home'),
      newsCard('Stryker launches TPX HD power tool, supporting demanding orthopaedic procedures', 'A premium small bone power tool designed to support performance, control and ergonomics in a wide range of challenging orthopaedic procedures.', '/stryker/home'),
      newsCard('AVS, Now Part of Stryker, Enrolls First Patient in First-in-Human Coronary Intravascular Lithotripsy Study', 'POWER CAD I study will evaluate feasibility of the Pulse IVL system in patients with severely calcified coronary arterial disease.', '/stryker/home'),
    ]]];

    // Section 3: Our focus + People are at the heart + Corporate responsibility + Awards
    // Each focus card has a 4th CTA cell linking to /stryker/rise.
    const focusCard = (image, title, sub, body) => [
      img(document, image, title),
      title,
      el(document, 'div', `<p><strong>${sub}</strong></p><p>${body}</p>`),
      anchor(document, '/stryker/rise', '/content/aem-boilerplate-nr/stryker/rise'),
    ];
    const section3 = [];
    section3.push(['overview-stryker', [
      ['Our'],
      ['focus'],
      [el(document, 'div', '')],
      [el(document, 'div', '')],
      [''],
      focusCard(`${MEDIA}/Test_Images_Portfolio_2?$max_width_1440$`, 'Medical and Surgical', 'Empowering people for powerful outcomes', 'By putting people at the heart of every innovation, we optimize pathways across the continuum of care — for the excellence of care delivery, the safety and wellbeing of care teams and the outcomes of patients.'),
      focusCard(`${MEDIA}/mako-column-photo-v2?$max_width_1440$`, 'Orthopaedics and Spine', "Leading what's next", 'Our Orthopaedics portfolio is a culmination of powerful solutions that maximize clinical, financial and operational outcomes. From iconic innovations to reliable platforms, from decision-driving data to medical education, we help move procedures and patients forward.'),
      focusCard(`${MEDIA}/Test_Images_Portfolio_4?$max_width_1440$`, 'Neurotechnology', 'Better connected', 'By delivering access to meaningful innovation, operational efficiency and the simplification of a single partner, we provide the power of a deeper understanding to help you better serve the needs of your patients and improve clinical and economic outcomes.'),
      focusCard(`${MEDIA}/services-ourFocus?$max_width_1440$`, 'Services', 'Maximizing your investment', 'From flexible financial options to sustainable options for reprocessing single-use devices to world class technicians trained to maintain and support your equipment—we\'re here so you can focus on what matters most, your patients.'),
      focusCard(`${MEDIA}/care-settings-v3?$max_width_1440$`, 'Care settings', 'Supporting you exactly where you need to be', 'Healthcare doesn\'t only happen in the hospital. Are you outfitting your ambulatory surgery center (ASC), looking for emergency response devices for an office or caring for a loved one at home? We have solutions to meet your needs right where you are.'),
      focusCard(`${MEDIA}/trainingAndEducation-ourFocus?$max_width_1440$`, 'Training and education', 'Advancing product and procedural knowledge', 'Our partnership goes beyond delivering the latest technology and solutions. We offer a wide range of training and education options to help ensure you\'re making the most of your time and investment.'),
    ]]);

    // People are at the heart (text-and-media advanced: headline + group photo)
    section3.push(['text-and-media-stryker', [
      [img(document, `${MEDIA}/PeopleGraphic_V5?$max_width_1440$`, 'Group photo')],
      [''],
      ['People are at the heart of what we do,'],
      ['and by valuing our differences, we are stronger together.'],
      [el(document, 'div', '')],
      ['advanced'],
      ['media-right'],
    ]]);

    // Corporate responsibility (full-bleed image, text overlaid right)
    section3.push(['get-to-know-us-stryker', [
      [img(document, `${MEDIA}/MakingAnImpact-greenGrad-desktopV4?$max_width_1440$`, 'Corporate responsibility')],
      [el(document, 'div', '<h2>Corporate responsibility</h2><p>We are committed to positively impacting people and our planet through responsible, sustainable practices that create a better, healthier world.</p>')],
      ['Read our 2024 Comprehensive Report'],
      [anchor(document, '/stryker/home', 'Report')],
      ['fullbleed'],
      [el(document, 'div', '')],
    ]]);

    // Awards (image gallery)
    const award = (slug, alt) => [img(document, `${MEDIA}/${slug}?$max_width_png$`, alt)];
    section3.push(['image-gallery-stryker', [
      ['Awards'],
      ['We owe our achievements to our dedicated employees'],
      ['View all awards'],
      [anchor(document, '/stryker/home', 'Awards')],
      award('2025_worlds_best_workplaces2025_asia_best_workplaces_600x600', "World's Best Workplaces 2025"),
      award('100-best-companies-small', '100 Best Companies'),
      award('2025_asia_best_workplaces_600x600', 'Best Workplaces Asia 2025'),
      award('100-best-companies-EU-small', 'Best Workplaces Europe 2025'),
      award('GPTW-LatAm-small', 'Best Workplaces Latin America 2025'),
      award('100-best-companies-maufacturing-production-small', 'Best Workplaces Manufacturing 2025'),
    ]]);

    // Section 4: Quick links + legal text
    // Quick links — container + items (2-level, round-trips through md2jcr).
    // Each item is [linkLabel, linkUrl]; a blank URL makes the item a column
    // header. The first row is the block heading.
    const quickItems = [['Quick links']];
    const quickGroup = (category, links) => {
      quickItems.push([category, '']); // header item (blank URL)
      links.forEach(([text, href]) => quickItems.push([text, anchor(document, href, href)]));
    };
    quickGroup('Portfolio', [['Medical and Surgical Equipment', '/stryker/home'], ['Orthopaedics', '/stryker/home'], ['Neurotechnology', '/stryker/home']]);
    quickGroup('Offerings', [['Services', '/stryker/home'], ['Care Settings', '/stryker/home'], ['Training and Education', '/stryker/home']]);
    quickGroup('Our company', [['Contact Us', '/stryker/home'], ['Investor Relations', 'https://investors.stryker.com/'], ['Comprehensive Report', '/stryker/home']]);
    quickGroup('More information', [['Advanced Digital Healthcare', '/stryker/home'], ['Ambulatory Surgery Centers', '/stryker/home'], ['Training and Education', '/stryker/home'], ['Accessibility Statement', '/stryker/home'], ['Patients', 'https://patients.stryker.com/index.html']]);
    const section4 = [
      ['quick-links-stryker', quickItems],
      ['legal-text-stryker', [['COMM-GSNPS-SYK-601900_Rev-8']]],
    ];

    // Assemble sections: blocks within a section are contiguous; an <hr> only
    // separates one section from the next.
    const sections = [section1, section2, section3, section4];
    sections.forEach((section, sIdx) => {
      if (sIdx > 0) main.append(document.createElement('hr'));
      section.forEach(([name, cells]) => {
        try {
          main.append(WebImporter.Blocks.createBlock(document, { name, cells }));
        } catch (blockErr) {
          main.append(errorBlock(document, `failed to build the "${name}" block — ${blockErr.message}`));
        }
      });
    });

    // Page metadata
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'metadata',
      cells: {
        Title: 'Stryker - Medical Devices and Equipment Manufacturing Company',
        Description: 'Stryker is one of the world\'s leading medical technology companies. Alongside our customers around the world, we impact more than 150 million patients annually.',
        theme: 'stryker',
        nav: '/content/stryker/nav-home',
        footer: '/content/stryker/footer',
      },
    }));

    const allBlocks = sections.flat().map((b) => b[0]);
    return [{
      element: main,
      path: '/stryker/home',
      report: { title: 'Stryker Home', template: 'stryker-home', blocks: allBlocks },
    }];
    } catch (err) {
      main.append(errorBlock(document, err && err.message ? err.message : String(err)));
      return [{
        element: main,
        path: '/stryker/home',
        report: { title: 'Stryker Home', template: 'stryker-home', blocks: ['error'] },
      }];
    }
  },
};
