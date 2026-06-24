/* eslint-disable */
/* global WebImporter */

/**
 * Synthetic importer for the Stryker home page.
 *
 * Ignores the navigated DOM and assembles the page from our -stryker blocks
 * with the real homepage content. Output: content/stryker/home.plain.html
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
    const blocks = [];
    const childBlock = (name, cells) => WebImporter.Blocks.createBlock(document, { name, cells });

    // 1. Full-width landing video (muted, looping, hidden on mobile)
    blocks.push(['home-video-hero-stryker', [
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
    ]]);

    // 2. What we do (standard layout: text card left, 150M image right)
    blocks.push(['get-to-know-us-stryker', [
      [img(document, `${MEDIA}/150M-white?$max_width_1440$`, '150 million patients')],
      [el(document, 'div', '<h2>What we do</h2><p>Stryker is one of the world\'s leading medical technology companies. Alongside our customers around the world, we impact more than 150 million patients annually.</p>')],
      ['Get to know us'],
      [anchor(document, '/stryker/home', 'About')],
      ['standard'],
      [''],
    ]]);

    // 3. Latest news (cards, news style, 4 columns)
    const newsCard = (title, desc, href) => [
      img(document, `${MEDIA}/stryker-logo-thumbnail-1?$preset_307_184$`, title),
      'Read More',
      anchor(document, href, 'News'),
      el(document, 'div', `<p>${title}</p>${desc ? `<p>${desc}</p>` : ''}`),
    ];
    blocks.push(['cards-stryker', [
      ['Latest news'],
      ['4'],
      ['news'],
      newsCard('Customer Updates: Stryker Network Disruption', '', '/stryker/home'),
      newsCard('Stryker partners with Fortune to share our digital innovation story', 'Fortune Brand Studio sat down with Stryker leaders to explore how our connected digital solutions deliver value to our customers across the continuum of care.', '/stryker/home'),
      newsCard('Stryker launches TPX HD power tool, supporting demanding orthopaedic procedures', 'A premium small bone power tool designed to support performance, control and ergonomics in a wide range of challenging orthopaedic procedures.', '/stryker/home'),
      newsCard('AVS, Now Part of Stryker, Enrolls First Patient in First-in-Human Coronary Intravascular Lithotripsy Study', 'POWER CAD I study will evaluate feasibility of the Pulse IVL system in patients with severely calcified coronary arterial disease.', '/stryker/home'),
    ]]);

    // 4. Our focus (overview: two-color title + info cards)
    const focusCard = (image, title, sub, body) => [
      img(document, image, title),
      title,
      el(document, 'div', `<p><strong>${sub}</strong></p><p>${body}</p>`),
    ];
    blocks.push(['overview-stryker', [
      ['Our', 'focus', el(document, 'div', ''), el(document, 'div', '')],
      focusCard(`${MEDIA}/Test_Images_Portfolio_2?$max_width_1440$`, 'Medical and Surgical', 'Empowering people for powerful outcomes', 'By putting people at the heart of every innovation, we optimize pathways across the continuum of care.'),
      focusCard(`${MEDIA}/mako-column-photo-v2?$max_width_1440$`, 'Orthopaedics and Spine', "Leading what's next", 'Our Orthopaedics portfolio is a culmination of powerful solutions that maximize clinical, financial and operational outcomes.'),
      focusCard(`${MEDIA}/Test_Images_Portfolio_4?$max_width_1440$`, 'Neurotechnology', 'Better connected', 'By delivering access to meaningful innovation, operational efficiency and the simplification of a single partner.'),
    ]]);

    // 5. Corporate responsibility (banner layout, dark band)
    blocks.push(['get-to-know-us-stryker', [
      [img(document, `${MEDIA}/MakingAnImpact-greenGrad-desktopV4?$max_width_1440$`, 'Corporate responsibility')],
      [el(document, 'div', '<h2>Corporate responsibility</h2><p>We are committed to positively impacting people and our planet through responsible, sustainable practices that create a better, healthier world.</p>')],
      ['Read our 2024 Comprehensive Report'],
      [anchor(document, '/stryker/home', 'Report')],
      ['banner'],
      [img(document, `${MEDIA}/MakingAnImpact-greenGrad-desktopV4?$max_width_1440$`, 'Band')],
    ]]);

    // 6. Awards (image gallery)
    const award = (slug, alt) => [img(document, `${MEDIA}/${slug}?$max_width_png$`, alt)];
    blocks.push(['image-gallery-stryker', [
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

    // Build flat blocks with section breaks.
    blocks.forEach(([name, cells], idx) => {
      if (idx > 0) main.append(document.createElement('hr'));
      const block = WebImporter.Blocks.createBlock(document, { name, cells });
      main.append(block);
    });

    // 7. Quick links (nested container)
    main.append(document.createElement('hr'));
    const quickLinkList = (category, links) => {
      const cells = [[category]];
      links.forEach(([text, href]) => cells.push([text, anchor(document, href, href)]));
      return childBlock('quick-link-lists-stryker', cells);
    };
    main.append(childBlock('quick-links-stryker', [
      [quickLinkList('Portfolio', [['Medical and Surgical Equipment', '/stryker/home'], ['Orthopaedics', '/stryker/home'], ['Neurotechnology', '/stryker/home']])],
      [quickLinkList('Offerings', [['Services', '/stryker/home'], ['Care Settings', '/stryker/home'], ['Training and Education', '/stryker/home']])],
      [quickLinkList('Our company', [['Contact Us', '/stryker/home'], ['Investor Relations', 'https://investors.stryker.com/'], ['Comprehensive Report', '/stryker/home']])],
      [quickLinkList('More information', [['Advanced Digital Healthcare', '/stryker/home'], ['Ambulatory Surgery Centers', '/stryker/home'], ['Training and Education', '/stryker/home'], ['Accessibility Statement', '/stryker/home'], ['Patients', 'https://patients.stryker.com/index.html']])],
    ]));

    // Page metadata
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'metadata',
      cells: {
        Title: 'Stryker - Medical Devices and Equipment Manufacturing Company',
        theme: 'stryker',
        nav: '/content/stryker/nav',
        footer: '/content/stryker/footer',
      },
    }));

    return [{
      element: main,
      path: '/stryker/home',
      report: { title: 'Stryker Home', template: 'stryker-home', blocks: [...blocks.map((b) => b[0]), 'quick-links-stryker'] },
    }];
  },
};
