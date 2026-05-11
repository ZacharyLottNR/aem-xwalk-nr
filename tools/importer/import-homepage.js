/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroAiParser from './parsers/hero-ai.js';
import columnsLogosParser from './parsers/columns-logos.js';
import cardsServiceParser from './parsers/cards-service.js';
import columnsCasestudyParser from './parsers/columns-casestudy.js';
import cardsBlogParser from './parsers/cards-blog.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import nextrowCleanupTransformer from './transformers/nextrow-cleanup.js';
import nextrowSectionsTransformer from './transformers/nextrow-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-ai': heroAiParser,
  'columns-logos': columnsLogosParser,
  'cards-service': cardsServiceParser,
  'columns-casestudy': columnsCasestudyParser,
  'cards-blog': cardsBlogParser,
  'form': formParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Main landing page with hero, services overview, partner logos, and call-to-action sections',
  urls: [
    'https://www.nextrow.com/'
  ],
  blocks: [
    {
      name: 'hero-ai',
      instances: ['section.elementor-element-245e5dd9.home_top_section']
    },
    {
      name: 'columns-logos',
      instances: ['section.elementor-element-76a4861']
    },
    {
      name: 'cards-service',
      instances: ['section.elementor-element-46285e5.section-categories', 'section.elementor-element-3d0d5d8.section-categories']
    },
    {
      name: 'columns-casestudy',
      instances: ['section.elementor-element-ccfcd7f']
    },
    {
      name: 'cards-blog',
      instances: ['.gt3_module_blog']
    },
    {
      name: 'form',
      instances: ['#request-consultation']
    }
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero',
      selector: 'section.elementor-element-245e5dd9.home_top_section',
      style: null,
      blocks: ['hero-ai'],
      defaultContent: []
    },
    {
      id: 'section-2-logos',
      name: 'Client Logos',
      selector: 'section.elementor-element-76a4861',
      style: null,
      blocks: ['columns-logos'],
      defaultContent: []
    },
    {
      id: 'section-3-services-heading',
      name: 'Services Heading',
      selector: 'section.elementor-element-6cdae88.services-heading',
      style: null,
      blocks: [],
      defaultContent: ['section.elementor-element-6cdae88.services-heading h2', 'section.elementor-element-6cdae88.services-heading .elementor-widget-text-editor']
    },
    {
      id: 'section-4-services-grid',
      name: 'Services Grid',
      selector: ['section.elementor-element-46285e5.section-categories', 'section.elementor-element-3d0d5d8.section-categories'],
      style: null,
      blocks: ['cards-service'],
      defaultContent: []
    },
    {
      id: 'section-5-casestudy',
      name: 'Case Study',
      selector: 'section.elementor-element-ccfcd7f',
      style: null,
      blocks: ['columns-casestudy'],
      defaultContent: []
    },
    {
      id: 'section-6-blog',
      name: 'Insights Blog',
      selector: 'section.elementor-element-a9093b8',
      style: 'grey',
      blocks: ['cards-blog'],
      defaultContent: ['section.elementor-element-a9093b8 .elementor-element-26595b92']
    },
    {
      id: 'section-7-contact',
      name: 'Contact Form',
      selector: '#request-consultation',
      style: 'dark',
      blocks: ['form'],
      defaultContent: ['.request-consultation h2', '.request-consultation p']
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  nextrowCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [nextrowSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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

    // 1. Execute beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
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

    // 4. Execute afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
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
