/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-asset-share-light.js
  var import_asset_share_light_exports = {};
  __export(import_asset_share_light_exports, {
    default: () => import_asset_share_light_default
  });

  // tools/importer/parsers/search-asset.js
  function parse(element, { document }) {
    const isSearchBar = element.classList.contains("cmp-search-search-bar");
    const isLayoutToggle = element.classList.contains("cmp-search-layout-toggle");
    const isSort = element.classList.contains("cmp-search-sort");
    if (isLayoutToggle || isSort) {
      element.remove();
      return;
    }
    const indexPath = "/query-index.json";
    const indexLink = document.createElement("a");
    indexLink.href = indexPath;
    indexLink.textContent = indexPath;
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(" field:index "));
    frag.appendChild(indexLink);
    const cells = [
      [frag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "search-asset", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-asset.js
  function parse2(element, { document }) {
    const cards = element.querySelectorAll(":scope > article.cmp-card");
    const cells = [];
    cards.forEach((card) => {
      const imageLink = card.querySelector(":scope > a.cmp-image__wrapper--card");
      const img = card.querySelector("img.cmp-image--card");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (img) {
        if (imageLink) {
          const link = document.createElement("a");
          link.href = imageLink.href;
          link.appendChild(img.cloneNode(true));
          imageCell.appendChild(link);
        } else {
          imageCell.appendChild(img.cloneNode(true));
        }
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const titleHeading = card.querySelector("h3.header");
      if (titleHeading) {
        const h3 = document.createElement("h3");
        const titleLink = titleHeading.querySelector("a");
        if (titleLink) {
          const a = document.createElement("a");
          a.href = titleLink.href;
          a.textContent = titleLink.textContent.trim();
          h3.appendChild(a);
        } else {
          h3.textContent = titleHeading.textContent.trim();
        }
        textCell.appendChild(h3);
      }
      const properties = card.querySelectorAll("div.meta div.property");
      if (properties.length > 0) {
        const metaList = document.createElement("ul");
        properties.forEach((prop) => {
          const li = document.createElement("li");
          const valueSpan = prop.querySelector("span.value");
          const value = valueSpan ? valueSpan.textContent.trim() : "";
          const labelText = prop.childNodes[0] ? prop.childNodes[0].textContent.trim() : "";
          if (labelText && value) {
            li.textContent = `${labelText}: ${value}`;
          } else if (labelText) {
            li.textContent = labelText;
          }
          if (li.textContent) {
            metaList.appendChild(li);
          }
        });
        if (metaList.children.length > 0) {
          textCell.appendChild(metaList);
        }
      }
      const actionButtons = card.querySelectorAll("ul.cmp_card__action-buttons button.ui.link.button:not(.hidden)");
      if (actionButtons.length > 0) {
        const buttonPara = document.createElement("p");
        actionButtons.forEach((btn, idx) => {
          if (idx > 0) {
            buttonPara.appendChild(document.createTextNode(" | "));
          }
          const strong = document.createElement("strong");
          strong.textContent = btn.textContent.trim();
          buttonPara.appendChild(strong);
        });
        textCell.appendChild(buttonPara);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-asset", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-filter.js
  function parse3(element, { document }) {
    const accordion = element.querySelector(".ui.fluid.styled.accordion.field");
    if (!accordion) return;
    const titleEl = accordion.querySelector(".title");
    const contentEl = accordion.querySelector(".content");
    if (!titleEl && !contentEl) return;
    const cells = [];
    const summaryFragment = document.createDocumentFragment();
    summaryFragment.appendChild(document.createComment(" field:summary "));
    if (titleEl) {
      const titleText = titleEl.textContent.replace(/\s+/g, " ").trim();
      const p = document.createElement("p");
      p.textContent = titleText;
      summaryFragment.appendChild(p);
    }
    const textFragment = document.createDocumentFragment();
    textFragment.appendChild(document.createComment(" field:text "));
    if (contentEl) {
      const labels = contentEl.querySelectorAll("label");
      const dateRangeInputs = contentEl.querySelectorAll('.ui.calendar input[type="text"], .ui.calendar input:not([type])');
      if (labels.length > 0) {
        const ul = document.createElement("ul");
        labels.forEach((label) => {
          const labelText = label.textContent.replace(/\s+/g, " ").trim();
          if (labelText) {
            const li = document.createElement("li");
            li.textContent = labelText;
            ul.appendChild(li);
          }
        });
        if (ul.childNodes.length > 0) {
          textFragment.appendChild(ul);
        }
      } else if (dateRangeInputs.length > 0) {
        const p = document.createElement("p");
        p.textContent = "Date range filter";
        textFragment.appendChild(p);
      } else {
        const contentText = contentEl.textContent.replace(/\s+/g, " ").trim();
        if (contentText) {
          const p = document.createElement("p");
          p.textContent = contentText;
          textFragment.appendChild(p);
        }
      }
    }
    cells.push([[summaryFragment], [textFragment]]);
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-filter", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-statistics.js
  function parse4(element, { document }) {
    const statisticsContainer = element.querySelector('.ui.statistics, [class*="statistics"]');
    const statisticItems = statisticsContainer ? Array.from(statisticsContainer.querySelectorAll(":scope > .statistic")) : Array.from(element.querySelectorAll(".statistic"));
    const row = [];
    statisticItems.forEach((item) => {
      const valueEl = item.querySelector(".value");
      const labelEl = item.querySelector(".label");
      const cellContent = [];
      if (valueEl) {
        const strong = document.createElement("strong");
        strong.textContent = valueEl.textContent.trim();
        cellContent.push(strong);
      }
      if (labelEl) {
        const p = document.createElement("p");
        p.textContent = labelEl.textContent.trim();
        cellContent.push(p);
      }
      row.push(cellContent);
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-statistics", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/asset-share-commons-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".ui.text.loader"]);
      WebImporter.DOMUtils.remove(element, [".ui.popup.calendar"]);
      const bodyInputs = element.querySelectorAll(":scope > input");
      bodyInputs.forEach((input) => input.remove());
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [".cmp-structure-header"]);
      WebImporter.DOMUtils.remove(element, [".cmp-structure-footer"]);
      WebImporter.DOMUtils.remove(element, [".cmp-structure-user-menu"]);
      WebImporter.DOMUtils.remove(element, [".cmp-search-filter-toggle"]);
      WebImporter.DOMUtils.remove(element, [".cmp-search-hidden"]);
      const emptySections = element.querySelectorAll("section");
      emptySections.forEach((section) => {
        if (!section.textContent.trim() && !section.children.length) {
          section.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, ["link"]);
      WebImporter.DOMUtils.remove(element, ["noscript"]);
    }
  }

  // tools/importer/transformers/asset-share-commons-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = section.selector;
        let sectionEl = null;
        if (Array.isArray(selector)) {
          for (const sel of selector) {
            sectionEl = element.querySelector(sel);
            if (sectionEl) break;
          }
        } else {
          sectionEl = element.querySelector(selector);
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-asset-share-light.js
  var parsers = {
    "search-asset": parse,
    "cards-asset": parse2,
    "accordion-filter": parse3,
    "columns-statistics": parse4
  };
  var PAGE_TEMPLATE = {
    name: "asset-share-light",
    urls: [
      "https://publish-p63260-e524717.adobeaemcloud.com/content/asset-share-commons/en/light.html"
    ],
    description: "Asset Share Commons light theme page with asset browsing and search functionality",
    blocks: [
      {
        name: "search-asset",
        instances: [".cmp-search-search-bar", ".cmp-search-layout-toggle", ".cmp-search-sort"]
      },
      {
        name: "cards-asset",
        instances: [".cards.cmp-cards"]
      },
      {
        name: "accordion-filter",
        instances: [".cmp-search-property", ".cmp-search-date-range", ".cmp-search-tags"]
      },
      {
        name: "columns-statistics",
        instances: [".cmp-search-statistics"]
      }
    ],
    sections: [
      {
        id: "section-1-search",
        name: "Search Controls",
        selector: ".cmp-search-search-bar, .cmp-search-layout-toggle, .cmp-search-sort",
        style: null,
        blocks: ["search-asset"],
        defaultContent: []
      },
      {
        id: "section-2-results",
        name: "Asset Results",
        selector: ".cmp-search-results",
        style: null,
        blocks: ["cards-asset"],
        defaultContent: []
      },
      {
        id: "section-3-sidebar",
        name: "Filter Sidebar",
        selector: "#rail",
        style: null,
        blocks: ["accordion-filter", "columns-statistics"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
            section: blockDef.section || null
          });
        });
      });
    });
    return pageBlocks;
  }
  var import_asset_share_light_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_asset_share_light_exports);
})();
