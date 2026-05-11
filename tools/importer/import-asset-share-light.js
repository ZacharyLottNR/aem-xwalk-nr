/* eslint-disable */
/* global WebImporter */

import searchAssetParser from './parsers/search-asset.js';
import cardsAssetParser from './parsers/cards-asset.js';
import accordionFilterParser from './parsers/accordion-filter.js';
import columnsStatisticsParser from './parsers/columns-statistics.js';

import cleanupTransformer from './transformers/asset-share-commons-cleanup.js';
import sectionsTransformer from './transformers/asset-share-commons-sections.js';

const parsers = {
  'search-asset': searchAssetParser,
  'cards-asset': cardsAssetParser,
  'accordion-filter': accordionFilterParser,
  'columns-statistics': columnsStatisticsParser,
};

const PAGE_TEMPLATE = {
  name: 'asset-share-light',
  urls: [
    'https://publish-p63260-e524717.adobeaemcloud.com/content/asset-share-commons/en/light.html',
  ],
  description: 'Asset Share Commons light theme page with asset browsing and search functionality',
  blocks: [
    {
      name: 'search-asset',
      instances: ['.cmp-search-search-bar', '.cmp-search-layout-toggle', '.cmp-search-sort'],
    },
    {
      name: 'cards-asset',
      instances: ['.cards.cmp-cards'],
    },
    {
      name: 'accordion-filter',
      instances: ['.cmp-search-property', '.cmp-search-date-range', '.cmp-search-tags'],
    },
    {
      name: 'columns-statistics',
      instances: ['.cmp-search-statistics'],
    },
  ],
  sections: [
    {
      id: 'section-1-search',
      name: 'Search Controls',
      selector: '.cmp-search-search-bar, .cmp-search-layout-toggle, .cmp-search-sort',
      style: null,
      blocks: ['search-asset'],
      defaultContent: [],
    },
    {
      id: 'section-2-results',
      name: 'Asset Results',
      selector: '.cmp-search-results',
      style: null,
      blocks: ['cards-asset'],
      defaultContent: [],
    },
    {
      id: 'section-3-sidebar',
      name: 'Filter Sidebar',
      selector: '#rail',
      style: null,
      blocks: ['accordion-filter', 'columns-statistics'],
      defaultContent: [],
    },
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
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
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
