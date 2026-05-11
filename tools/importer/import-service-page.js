/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroServiceParser from './parsers/hero-service.js';
import columnsValuepropParser from './parsers/columns-valueprop.js';
import cardsAcceleratorParser from './parsers/cards-accelerator.js';
import columnsCasestudyParser from './parsers/columns-casestudy.js';
import embedCalendarParser from './parsers/embed-calendar.js';

// TRANSFORMER IMPORTS
import nextrowCleanupTransformer from './transformers/nextrow-cleanup.js';
import nextrowSectionsTransformer from './transformers/nextrow-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-service': heroServiceParser,
  'columns-valueprop': columnsValuepropParser,
  'cards-accelerator': cardsAcceleratorParser,
  'columns-casestudy': columnsCasestudyParser,
  'embed-calendar': embedCalendarParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'service-page',
  description: 'Service area pages describing NextRow digital service offerings with hero, features, and contact CTA',
  urls: [
    'https://www.nextrow.com/b2b-marketing',
    'https://www.nextrow.com/unified-customer-experience',
    'https://www.nextrow.com/content-supply-chain',
    'https://www.nextrow.com/martech-services',
    'https://www.nextrow.com/ai-services',
    'https://www.nextrow.com/cloud-services',
    'https://www.nextrow.com/workday-services',
    'https://www.nextrow.com/cyber-security',
    'https://www.nextrow.com/snowflake-services/cloud-data-analytics'
  ],
  blocks: [
    {
      name: 'hero-service',
      instances: ['section.full-width-2col-section']
    },
    {
      name: 'columns-valueprop',
      instances: ['section.section_result']
    },
    {
      name: 'cards-accelerator',
      instances: ['section.boxes']
    },
    {
      name: 'columns-casestudy',
      instances: ["section[id='meeting_section']"]
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
      selector: 'section.full-width-2col-section',
      style: null,
      blocks: ['hero-service'],
      defaultContent: []
    },
    {
      id: 'section-2-valueprop',
      name: 'Value Props',
      selector: 'section.section_result',
      style: null,
      blocks: ['columns-valueprop'],
      defaultContent: []
    },
    {
      id: 'section-3-accelerators',
      name: 'Accelerators',
      selector: 'section.boxes',
      style: null,
      blocks: ['cards-accelerator'],
      defaultContent: ['section.boxes h2', 'section.boxes .elementor-widget-text-editor']
    },
    {
      id: 'section-4-cta',
      name: 'CTA Section',
      selector: 'section.elementor-element-6c9fbbe2',
      style: null,
      blocks: [],
      defaultContent: ['section.elementor-element-6c9fbbe2 h2', 'section.elementor-element-6c9fbbe2 .elementor-widget-text-editor', 'section.elementor-element-6c9fbbe2 .elementor-widget-image', 'section.elementor-element-6c9fbbe2 .elementor-widget-gt3-core-button']
    },
    {
      id: 'section-5-partnership',
      name: 'Partnership',
      selector: "section[id='meeting_section']",
      style: null,
      blocks: ['columns-casestudy'],
      defaultContent: []
    },
    {
      id: 'section-6-calendar',
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
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE
  };

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
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null
        });
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
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
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

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      }
    }];
  }
};
