/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProductParser from './parsers/hero-product.js';
import columnsCasestudyParser from './parsers/columns-casestudy.js';
import embedVideoParser from './parsers/embed-video.js';
import columnsStatsParser from './parsers/columns-stats.js';
import embedCalendarParser from './parsers/embed-calendar.js';

// TRANSFORMER IMPORTS
import nextrowCleanupTransformer from './transformers/nextrow-cleanup.js';
import nextrowSectionsTransformer from './transformers/nextrow-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-product': heroProductParser,
  'columns-casestudy': columnsCasestudyParser,
  'embed-video': embedVideoParser,
  'columns-stats': columnsStatsParser,
  'embed-calendar': embedCalendarParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'product-page',
  description: 'Product pages showcasing NextRow proprietary products with features and benefits',
  urls: [
    'https://www.nextrow.com/quiptag',
    'https://www.nextrow.com/koru'
  ],
  blocks: [
    {
      name: 'hero-product',
      instances: ['section.elementor-element-79faebc9']
    },
    {
      name: 'columns-casestudy',
      instances: ["section[id='meeting_section']"]
    },
    {
      name: 'embed-video',
      instances: ['section.elementor-element-33ee4074']
    },
    {
      name: 'columns-stats',
      instances: ['section.elementor-element-5726251c']
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
      selector: 'section.elementor-element-79faebc9',
      style: null,
      blocks: ['hero-product'],
      defaultContent: []
    },
    {
      id: 'section-2-problem',
      name: 'Problem Statement',
      selector: "section[id='meeting_section']",
      style: null,
      blocks: ['columns-casestudy'],
      defaultContent: []
    },
    {
      id: 'section-3-video',
      name: 'Video Demo',
      selector: 'section.elementor-element-33ee4074',
      style: null,
      blocks: ['embed-video'],
      defaultContent: []
    },
    {
      id: 'section-4-stats',
      name: 'Results Statistics',
      selector: 'section.elementor-element-5726251c',
      style: null,
      blocks: ['columns-stats'],
      defaultContent: []
    },
    {
      id: 'section-5-calendar',
      name: 'Calendar',
      selector: "section[id='calendar_show']",
      style: null,
      blocks: ['embed-calendar'],
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
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
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
