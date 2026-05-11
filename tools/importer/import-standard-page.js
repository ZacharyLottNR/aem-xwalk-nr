/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProductParser from './parsers/hero-product.js';
import cardsPartnerParser from './parsers/cards-partner.js';
import columnsCasestudyParser from './parsers/columns-casestudy.js';
import formParser from './parsers/form.js';
import embedCalendarParser from './parsers/embed-calendar.js';

// TRANSFORMER IMPORTS
import nextrowCleanupTransformer from './transformers/nextrow-cleanup.js';
import nextrowSectionsTransformer from './transformers/nextrow-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-product': heroProductParser,
  'cards-partner': cardsPartnerParser,
  'columns-casestudy': columnsCasestudyParser,
  'form': formParser,
  'embed-calendar': embedCalendarParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'standard-page',
  description: 'General utility pages including partners, contact form, blog listing, training, and legal content',
  urls: [
    'https://www.nextrow.com/partners',
    'https://www.nextrow.com/contact-us',
    'https://www.nextrow.com/blog',
    'https://www.nextrow.com/training',
    'https://www.nextrow.com/privacy-policy'
  ],
  blocks: [
    {
      name: 'hero-product',
      instances: ['section.elementor-element-79faebc9', 'section.full-width-2col-section']
    },
    {
      name: 'cards-partner',
      instances: ['.gt3-core-imagebox-wrapper']
    },
    {
      name: 'columns-casestudy',
      instances: ["section[id='meeting_section']"]
    },
    {
      name: 'form',
      instances: ['#request-consultation', '.hbspt-form']
    },
    {
      name: 'embed-calendar',
      instances: ["section[id='calendar_show']"]
    }
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero',
      selector: ['section.elementor-element-79faebc9', 'section.full-width-2col-section'],
      style: null,
      blocks: ['hero-product'],
      defaultContent: []
    },
    {
      id: 'section-2-content',
      name: 'Main Content',
      selector: '#main_content',
      style: null,
      blocks: ['cards-partner', 'columns-casestudy', 'form'],
      defaultContent: []
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  nextrowCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [nextrowSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  }
};
