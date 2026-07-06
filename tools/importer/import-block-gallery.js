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

    // home-hero-stryker — eyebrow, heading, subtext, cta link, cta text, bg
    // image, theme. Overlay theme: text over a full-bleed image.
    blocks.push(['home-hero-stryker', [
      ['Now available'],
      ['Connected care, reimagined'],
      ['Technology that helps you deliver better outcomes for more patients.'],
      [anchor(document, 'https://www.stryker.com/us/en/index.html', 'Explore')],
      ['Explore solutions'],
      [img(document, IMG(900, 620, 'Hero'), 'Hero background')],
      ['overlay'],
    ]]);

    // home-hero-stryker (stacked theme) — dark two-tone heading + subtext above
    // a contained image, no CTA (e.g. the Corporate governance hero).
    blocks.push(['home-hero-stryker', [
      [''],
      [el(document, 'div', '<p>Corporate <strong>governance</strong></p>')],
      ["At Stryker, we are committed to doing what's right and upholding our company values."],
      [''],
      [''],
      [img(document, IMG(900, 500, 'Governance'), 'Corporate governance')],
      ['stacked'],
    ]]);

    // overview-stryker — row0: titleBlack, titleGold, primer, richText; then cards
    // Card cells match the overview-stryker-card field groups: image, heading,
    // description, linkUrl. The block-level rows match overview-stryker's five
    // fields: titleBlack, titleGold, primer, body, theme.
    const overviewCard = (title, desc) => [
      img(document, IMG(400, 260, 'Overview'), title),
      title,
      el(document, 'div', `<p>${desc}</p>`),
      anchor(document, 'https://www.stryker.com/', 'https://www.stryker.com/'),
    ];
    blocks.push(['overview-stryker', [
      ['Our'],
      ['focus'],
      [el(document, 'div', '<p>Empowering people for powerful outcomes.</p>')],
      [el(document, 'div', '<p>Across the continuum of care.</p>')],
      [''],
      overviewCard('Medical and Surgical', 'Empowering people for powerful outcomes.'),
      overviewCard('Orthopaedics', "Leading what's next."),
      overviewCard('Neurotechnology', 'Better connected.'),
    ]]);

    // title-stryker — title, color, size. One per color to show the palette.
    blocks.push(['title-stryker', [
      ['Gold heading, h2'],
      ['gold'],
      ['h2'],
    ]]);
    blocks.push(['title-stryker', [
      ['Teal heading, h3'],
      ['teal'],
      ['h3'],
    ]]);

    // button-stryker — heading, label, sublabel, link, style. One per style.
    blocks.push(['button-stryker', [
      ['Code of conduct'],
      ['Our Code'],
      ["We do what's right"],
      [anchor(document, 'https://www.stryker.com/us/en/about/governance/code-of-conduct.html', 'Our Code')],
      ['primary'],
    ]]);
    blocks.push(['button-stryker', [
      [''],
      ['Learn more'],
      [''],
      [anchor(document, 'https://www.stryker.com/us/en/about.html', 'Learn more')],
      ['secondary'],
    ]]);

    // cta-stryker — a shadow-box CTA: text, cta label, cta link.
    blocks.push(['cta-stryker', [
      [el(document, 'div', '<p>A full list of our positions and statements can be found in our Corporate Responsibility Hub.</p>')],
      ['Go now'],
      [anchor(document, 'https://www.stryker.com/us/en/about/corporate-responsibility/cr-hub.html', 'Go now')],
    ]]);

    // columns-stryker — a container that lays out nested blocks side by side.
    // First cell = column count; each following cell holds a nested child block
    // (here a button + a quick-links list, matching the governance page).
    const nested = (name, cells) => WebImporter.Blocks.createBlock(document, { name, cells });
    blocks.push(['columns-stryker', [
      ['2'],
      [nested('button-stryker', [
        ['Code of conduct'],
        ['Our Code'],
        ["We do what's right"],
        [anchor(document, 'https://www.stryker.com/us/en/about/governance/code-of-conduct.html', 'Our Code')],
        ['primary'],
      ])],
      [nested('quick-links-stryker', [
        ['Guidelines, bylaws, charters'],
        ['default'],
        ['Board Committees', anchor(document, 'https://www.stryker.com/us/en/about/governance/board-committees.html', 'Board Committees')],
        ['Bylaws', anchor(document, 'https://www.stryker.com/us/en/about/governance/bylaws.html', 'Bylaws')],
        ['Charters', anchor(document, 'https://www.stryker.com/us/en/about/governance/charters.html', 'Charters')],
      ])],
    ]]);

    // 2. content-break-stryker — no fields
    blocks.push(['content-break-stryker', [['']]]);

    // section-banner-stryker — single richtext cell
    blocks.push(['section-banner-stryker', [
      [el(document, 'div', '<p>Interested in learning more? <strong>Talk to a rep today.</strong></p>')],
    ]]);

    // stats-stryker — block-level rows (titleBlack, titleGold, intro, theme)
    // then per-stat rows (icon, value, label). One per theme: light, dark, plain.
    const statItem = (value, label) => [
      img(document, IMG(96, 96, 'Icon'), label),
      value,
      el(document, 'div', `<p>${label}</p>`),
    ];
    blocks.push(['stats-stryker', [
      ['Proven'],
      ['outcomes'],
      [el(document, 'div', '<p>Results backed by published studies across our portfolio.</p>')],
      ['light'],
      statItem('633K', 'patients affected by hospital-acquired infections each year'),
      statItem('2.5M', 'patients per year are affected by pressure injuries'),
      statItem('52%', 'of nurses suffer chronic back pain'),
    ]]);
    blocks.push(['stats-stryker', [
      ['Proven'],
      ['outcomes'],
      [el(document, 'div', '<p>Dark theme variant.</p>')],
      ['dark'],
      statItem('150+', 'published outcomes'),
      statItem('75', 'countries served'),
      statItem('40yrs', 'of innovation'),
    ]]);
    blocks.push(['stats-stryker', [
      ['Our'],
      ['values'],
      [el(document, 'div', '<p>Plain theme: dark heading and subtext, no big numbers.</p>')],
      ['plain'],
      ['', 'Integrity', el(document, 'div', "<p>We do what's right.</p>")],
      ['', 'Accountability', el(document, 'div', '<p>We do what we say.</p>')],
      ['', 'People', el(document, 'div', '<p>We grow talent.</p>')],
    ]]);

    // social-cta-stryker — row0: heading; then item rows [label-or-icon, href]
    blocks.push(['social-cta-stryker', [
      ['Connect with us'],
      ['Contact sales', anchor(document, 'https://www.stryker.com/contact', 'Contact')],
      ['Find a rep', anchor(document, 'https://www.stryker.com/reps', 'Reps')],
      ['facebook', anchor(document, 'https://facebook.com/stryker', 'fb')],
      ['linkedin', anchor(document, 'https://linkedin.com/company/stryker', 'li')],
      ['youtube', anchor(document, 'https://youtube.com/stryker', 'yt')],
      ['instagram', anchor(document, 'https://instagram.com/stryker', 'ig')],
    ]]);

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

    // 7. image-gallery-stryker (standard theme — small contained badges).
    // Cells: heading, description, ctaLabel, ctaUrl, theme, then image rows.
    blocks.push(['image-gallery-stryker', [
      ['Awards'],
      ['We owe our achievements to our dedicated employees'],
      ['View all awards'],
      [anchor(document, 'https://www.stryker.com/awards', 'Awards')],
      ['standard'],
      [img(document, IMG(160, 130, 'Award 1'), 'Award 1')],
      [img(document, IMG(160, 130, 'Award 2'), 'Award 2')],
      [img(document, IMG(160, 130, 'Award 3'), 'Award 3')],
      [img(document, IMG(160, 130, 'Award 4'), 'Award 4')],
      [img(document, IMG(160, 130, 'Award 5'), 'Award 5')],
      [img(document, IMG(160, 130, 'Award 6'), 'Award 6')],
    ]]);

    // image-gallery-stryker (big theme — large edge-to-edge photos, no heading).
    blocks.push(['image-gallery-stryker', [
      [''],
      [''],
      [''],
      [''],
      ['big'],
      [img(document, IMG(800, 550, 'Photo 1'), 'Photo 1')],
      [img(document, IMG(800, 550, 'Photo 2'), 'Photo 2')],
      [img(document, IMG(800, 550, 'Photo 3'), 'Photo 3')],
      [img(document, IMG(800, 550, 'Photo 4'), 'Photo 4')],
      [img(document, IMG(800, 550, 'Photo 5'), 'Photo 5')],
      [img(document, IMG(800, 550, 'Photo 6'), 'Photo 6')],
    ]]);

    // 8. video-stryker — cells: video, theme, poster
    blocks.push(['video-stryker', [
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
      ['default'],
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

    // text-and-media-stryker (basic theme, image, media-left)
    blocks.push(['text-and-media-stryker', [
      [img(document, IMG(600, 400, 'Vision'), 'Vision')],
      [''],
      [''],
      ['Vision'],
      [el(document, 'div', '<p>Vision is a protocol management dashboard that gives caregivers visibility to compliance and bed exit alarm activity.</p>')],
      ['basic'],
      ['media-left'],
    ]]);

    // text-and-media-stryker (advanced theme, video, media-right)
    blocks.push(['text-and-media-stryker', [
      [''],
      [anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs')],
      ['Centralized'],
      ['control'],
      [el(document, 'div', '<p>Your team can assist you from the doc station without breaking sterility around the sterile field.</p>')],
      ['advanced'],
      ['media-right'],
    ]]);

    // double-text-and-media-stryker — two side-by-side text+media items. Cells
    // per item: image, heading, body, ctaLabel, ctaLink.
    blocks.push(['double-text-and-media-stryker', [
      [img(document, IMG(520, 360, 'Tile 1'), 'Code of Conduct')],
      ['Code of Conduct'],
      [el(document, 'div', '<p>Our commitment to integrity guides every decision we make.</p>')],
      ['Read more'],
      [anchor(document, 'https://www.stryker.com/conduct', 'Conduct')],
      [img(document, IMG(520, 360, 'Tile 2'), 'Quality Policy')],
      ['Quality Policy'],
      [el(document, 'div', '<p>Delivering safe, effective products that improve patient care.</p>')],
      ['Read more'],
      [anchor(document, 'https://www.stryker.com/quality', 'Quality')],
    ]]);

    // center-justified-text-stryker — single richtext cell, centered.
    blocks.push(['center-justified-text-stryker', [
      [el(document, 'div', '<h2>Our mission</h2><p>Together with our customers, we are driven to make healthcare better.</p>')],
    ]]);

    // right-justified-text-stryker — single richtext cell, right-aligned.
    blocks.push(['right-justified-text-stryker', [
      [el(document, 'div', '<h2>Our vision</h2><p>To be the most trusted partner in advancing patient care worldwide.</p>')],
    ]]);

    // text-and-media-stryker (super theme — full-bleed hero-style band)
    blocks.push(['text-and-media-stryker', [
      [img(document, IMG(1440, 600, 'Super'), 'Super')],
      [''],
      ['Powering'],
      ['possibility'],
      [el(document, 'div', '<p>A full-bleed super theme for high-impact statements.</p>')],
      ['super'],
      ['media-right'],
    ]]);

    // accordion-stryker — heading + theme, then item rows [title, body].
    // Two blocks: standard (bordered card rows) and plain (hairline dividers).
    const accordionItem = (title, body) => [title, el(document, 'div', `<p>${body}</p>`)];
    blocks.push(['accordion-stryker', [
      ['Frequently asked questions'],
      ['standard'],
      accordionItem('Is the product safe to use?', 'Yes. Our products meet all applicable safety and quality standards.'),
      accordionItem('How do I request service?', 'Contact your Stryker representative or submit a request through the support portal.'),
      accordionItem('Where can I find instructions for use?', 'Instructions for use are available at ifu.stryker.com.'),
    ]]);
    blocks.push(['accordion-stryker', [
      ['Governance policies'],
      ['plain'],
      accordionItem('Code of Conduct', 'Our commitment to integrity guides every decision we make.'),
      accordionItem('Guidelines, bylaws and charters', 'Corporate governance documents are available for download.'),
      accordionItem('Committee composition', 'Details of our board committees and their members.'),
    ]]);

    // event-details-stryker — title, description, date, time, location, credit,
    // cta text, cta link.
    blocks.push(['event-details-stryker', [
      ['Patient Temperature Management: How Controlled Warming and Cooling Affect Patient Outcomes'],
      [el(document, 'div', '<p>Managing patient temperature in the acute care space is critical to patient safety and delivering better clinical outcomes. Join us to learn practical approaches.</p>')],
      ['October 20, 2021'],
      ['2:00 - 3:00 PM ET'],
      ['Online webinar'],
      ['1 CE credit approved'],
      ['Register now'],
      [anchor(document, 'https://www.stryker.com/', 'Register')],
    ]]);

    // profile-stryker — heading + theme, then item rows
    // [headshot, name, role, bio, link]. Grid theme = leadership roster.
    const profileItem = (name, role, bio) => [
      img(document, IMG(320, 400, name), name),
      name,
      role,
      el(document, 'div', `<p>${bio}</p>`),
      anchor(document, 'https://www.stryker.com/us/en/about/our-management.html', 'Profile'),
    ];
    blocks.push(['profile-stryker', [
      ['Our management'],
      ['grid'],
      profileItem('Kevin Lobo', 'Chair and Chief Executive Officer', 'Leading Stryker with a focus on innovation and growth.'),
      profileItem('Glenn Boehnlein', 'Vice President, Chief Financial Officer', 'Overseeing global finance and investor relations.'),
      profileItem('Viju Menon', 'Group President, Global Quality and Operations', 'Driving quality and operational excellence worldwide.'),
      profileItem('Jeanne Blondia', 'Vice President, Finance and Treasurer', 'Managing capital structure and treasury operations.'),
    ]]);

    // profile-stryker (detail theme — single large bio beside a headshot)
    blocks.push(['profile-stryker', [
      ['Leadership spotlight'],
      ['detail'],
      profileItem('Kevin Lobo', 'Chair and Chief Executive Officer', 'Kevin A. Lobo is Chair and Chief Executive Officer of Stryker. He joined Stryker in 2011 and has led the company through a period of sustained growth, expanding its portfolio across MedSurg, Neurotechnology, Orthopaedics and Spine while championing a strong, people-first culture.'),
    ]]);

    // cross-promo-stryker — one per alignment (left, center, right)
    ['left', 'center', 'right'].forEach((align) => {
      blocks.push(['cross-promo-stryker', [
        [img(document, IMG(420, 240, `ProCare ${align}`), 'ProCare Services')],
        ['ProCare Services'],
        [anchor(document, 'https://www.stryker.com/us/en/acute-care/services/procare.html', 'ProCare')],
        ['Read more'],
        [align],
      ]]);
    });

    // callout-banner-stryker — dismissible blue banner (RTE + cookie-backed X)
    blocks.push(['callout-banner-stryker', [
      [el(document, 'div', '<p><strong>Customer Updates: Stryker Network Disruption &gt; <a href="https://www.stryker.com/us/en/index.html">Read Now</a></strong></p>')],
    ]]);

    // 10. legal-text-stryker
    blocks.push(['legal-text-stryker', [
      [el(document, 'div', '<p><strong>References</strong></p><ol><li>As compared to previous Stryker offering</li><li>1937000</li><li>1000904469</li><li>COMMS-COMSO-WHPR-1532602</li></ol><p>ENDO-GSNPS-SYK-2116500</p><p>Last Updated July/2025</p>')],
    ]]);

    // Nested-block container blocks. Each parent cell holds a child block table;
    // the container's decorate converts these nested tables back into block divs
    // (see scripts.js resolveNestedBlocks / tableToBlock). form-stryker is still
    // omitted: it needs a live form definition, not synthetic block-table content.
    const childBlock = (name, cells) => WebImporter.Blocks.createBlock(document, { name, cells });

    // quick-links-stryker — container + items. Each item is [linkLabel, linkUrl];
    // a blank URL makes the item a column header. First row is the heading.
    const quickItems = [['Quick links']];
    const quickGroup = (category, links) => {
      quickItems.push([category, '']);
      links.forEach(([text, href]) => quickItems.push([text, anchor(document, href, href)]));
    };
    quickGroup('Portfolio', [['Medical and Surgical Equipment', 'https://www.stryker.com/ms'], ['Orthopaedics', 'https://www.stryker.com/ortho'], ['Neurotechnology', 'https://www.stryker.com/neuro']]);
    quickGroup('Offerings', [['Services', 'https://www.stryker.com/services'], ['Care Settings', 'https://www.stryker.com/care'], ['Training and Education', 'https://www.stryker.com/training']]);
    quickGroup('Our company', [['Contact Us', 'https://www.stryker.com/contact'], ['Investor Relations', 'https://www.stryker.com/investors'], ['Comprehensive Report', 'https://www.stryker.com/report']]);
    quickGroup('More information', [['Advanced Digital Healthcare', 'https://www.stryker.com/adh'], ['Patients', 'https://www.stryker.com/patients']]);
    blocks.push(['quick-links-stryker', quickItems]);

    // quick-links-stryker (Columned theme) — heading, a theme row naming
    // "columned", then a flat list of links that CSS flows across four columns.
    const columnedItems = [['Our businesses'], ['columned']];
    [
      ['Endoscopy', 'https://www.stryker.com/endoscopy'],
      ['Instruments', 'https://www.stryker.com/instruments'],
      ['Medical', 'https://www.stryker.com/medical'],
      ['Neurovascular', 'https://www.stryker.com/neurovascular'],
      ['Craniomaxillofacial', 'https://www.stryker.com/cmf'],
      ['Joint Replacement', 'https://www.stryker.com/joint-replacement'],
      ['Spine', 'https://www.stryker.com/spine'],
      ['Trauma and Extremities', 'https://www.stryker.com/trauma'],
    ].forEach(([text, href]) => columnedItems.push([text, anchor(document, href, href)]));
    blocks.push(['quick-links-stryker', columnedItems]);

    // image-collection-stryker → image-gallery-item-stryker children (img, text, optional link)
    const galleryItem = (title, body, url) => {
      const cells = [
        [img(document, IMG(560, 360, title), title)],
        [el(document, 'div', `<h3>${title}</h3><p>${body}</p>`)],
        [url ? anchor(document, url, url) : ''],
      ];
      return childBlock('image-gallery-item-stryker', cells);
    };
    blocks.push(['image-collection-stryker', [
      ['Visualization,'],
      ['reimagined'],
      [galleryItem('Tone mode', 'Balance brightness and illuminate shadows across the field of view.', 'https://www.stryker.com/tone')],
      [galleryItem('Full frame HDR', 'High dynamic range, designed to provide more detail in shadows and highlights.', '')],
      [galleryItem('Experience one billion colors', '62.5x more colors.', '')],
      [galleryItem('Fluorescence imaging', 'Clearer delineation of fluorescence signal for improved visualization.', 'https://www.stryker.com/fluorescence')],
    ]]);

    // tabbed-content-stryker mirrors cards-stryker: a heading field row followed
    // by one multi-cell row per item. Item cell order matches the model's field
    // groups: tabName, image, ctaLabel, ctaUrl, text. Items sharing a tabName
    // group under one tab; a YouTube ctaUrl embeds the item as a video. The
    // ctaLabel/ctaUrl naming (from cards-stryker-card) keeps each field on its
    // own cell — a "linkText" name would collapse into the link field.
    const tabItem = (tabName, title, body, ctaLabel) => [
      tabName,
      img(document, 'https://placehold.co/400x300/eeeeee/333333?text=Item', title),
      ctaLabel,
      anchor(document, 'https://www.stryker.com/', ctaLabel),
      el(document, 'div', `<p>${title}</p><p>${body}</p>`),
    ];
    blocks.push(['tabbed-content-stryker', [
      [''],
      tabItem('Product Information', 'Connected Solutions Beds Brochure', 'Download the brochure to learn more.', 'Download'),
      tabItem('Related Products', 'ProCuity LE(X) / Z(X)', 'For an enhanced MedSurg experience.', 'Learn More'),
      ['Videos', '', '', anchor(document, 'https://youtu.be/kRIuiIy_SCs', 'https://youtu.be/kRIuiIy_SCs'), el(document, 'div', '<p>iBed Vision</p>')],
    ]]);

    // Build the page: a label + block table per entry, separated by section breaks.
    blocks.forEach(([name, cells], idx) => {
      if (idx > 0) main.append(document.createElement('hr'));
      main.append(label(document, name));
      const block = WebImporter.Blocks.createBlock(document, { name, cells });
      main.append(block);
    });

    // section-anchor-stryker — builds a sticky nav from the NAMED sections that
    // follow it. Demo: the anchor block, then three named sections (each given a
    // name via a Section Metadata block) so the nav has targets to link to.
    main.append(document.createElement('hr'));
    main.append(label(document, 'section-anchor-stryker'));
    main.append(WebImporter.Blocks.createBlock(document, { name: 'section-anchor-stryker', cells: [['']] }));

    [
      ['Overview', 'Welcome to the RISE of a new OR for ENT and Neurosurgery.'],
      ['Features', 'Vision is a protocol management dashboard for caregivers.'],
      ['Contact', 'Contact an expert about RISE.'],
    ].forEach(([name, body]) => {
      main.append(document.createElement('hr'));
      main.append(el(document, 'h2', name));
      main.append(el(document, 'p', body));
      main.append(WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { name },
      }));
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
