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

  // tools/importer/import-product-page.js
  var import_product_page_exports = {};
  __export(import_product_page_exports, {
    default: () => import_product_page_default
  });

  // tools/importer/parsers/hero-product.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img, :scope > .elementor-container img.attachment-full");
    const heading = element.querySelector('h2.h3-text, h1, h2, [class*="heading"]');
    const subtitle = element.querySelector("div.h3-content, p.h3-content, .elementor-widget-text-editor p, .elementor-widget-container > p");
    const cells = [];
    if (bgImage) {
      const imageFragment = document.createDocumentFragment();
      imageFragment.appendChild(document.createComment(" field:image "));
      imageFragment.appendChild(bgImage);
      cells.push([imageFragment]);
    }
    const textFragment = document.createDocumentFragment();
    textFragment.appendChild(document.createComment(" field:text "));
    if (heading) {
      textFragment.appendChild(heading);
    }
    if (subtitle) {
      if (subtitle.tagName === "DIV") {
        const p = document.createElement("p");
        p.textContent = subtitle.textContent;
        textFragment.appendChild(p);
      } else {
        textFragment.appendChild(subtitle);
      }
    }
    cells.push([textFragment]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-casestudy.js
  function parse2(element, { document }) {
    const heading = element.querySelector('h3.elementor-heading-title, h2.elementor-heading-title, h1.elementor-heading-title, [class*="heading-title"]');
    const descriptionWidget = element.querySelector(".elementor-widget-text-editor .elementor-widget-container");
    let description = null;
    if (descriptionWidget) {
      const text = descriptionWidget.textContent.trim();
      if (text) {
        description = document.createElement("p");
        description.textContent = text;
      }
    }
    const ctaLink = element.querySelector(".elementor-widget-gt3-core-button a, .gt3_module_button_elementor a, a.button_size_elementor_custom");
    let cta = null;
    if (ctaLink) {
      cta = document.createElement("a");
      cta.href = ctaLink.href || ctaLink.getAttribute("href");
      const btnText = ctaLink.querySelector(".elementor_gt3_btn_text");
      cta.textContent = btnText ? btnText.textContent.trim() : ctaLink.textContent.trim();
    }
    const image = element.querySelector('.elementor-widget-image img, img[class*="wp-image"]');
    const textColumn = [];
    if (heading) textColumn.push(heading);
    if (description) textColumn.push(description);
    if (cta) textColumn.push(cta);
    const imageColumn = [];
    if (image) imageColumn.push(image);
    const cells = [
      [textColumn, imageColumn]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-casestudy", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse3(element, { document }) {
    const sourceEl = element.querySelector("video source[src], video[src]");
    let videoUrl = "";
    if (sourceEl) {
      videoUrl = sourceEl.getAttribute("src") || "";
    } else {
      const videoEl = element.querySelector("video");
      if (videoEl) {
        videoUrl = videoEl.getAttribute("src") || "";
      }
    }
    const cells = [];
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      cells.push([link]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stats.js
  function parse4(element, { document }) {
    const heading = element.querySelector(".elementor-widget-heading h2, h2.elementor-heading-title");
    const descWidget = element.querySelector(".elementor-widget-text-editor .elementor-widget-container");
    const subHeading = element.querySelector(".elementor-widget-heading h3, h3.elementor-heading-title");
    const statColumns = element.querySelectorAll(".elementor-inner-section .elementor-col-33");
    const ctaLink = element.querySelector(".elementor-widget-gt3-core-button a, a.button_size_elementor_custom");
    const headerContent = [];
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.trim();
      headerContent.push(h2);
    }
    if (descWidget) {
      const p = document.createElement("p");
      p.textContent = descWidget.textContent.trim();
      headerContent.push(p);
    }
    if (subHeading) {
      const h3 = document.createElement("h3");
      h3.textContent = subHeading.textContent.trim();
      headerContent.push(h3);
    }
    const statsRow = [];
    statColumns.forEach((col) => {
      const cellContent = [];
      const statImg = col.querySelector(".elementor-widget-image img, img");
      if (statImg) {
        const img = document.createElement("img");
        img.src = statImg.getAttribute("src") || "";
        if (statImg.getAttribute("alt")) {
          img.alt = statImg.getAttribute("alt");
        }
        cellContent.push(img);
      }
      if (cellContent.length > 0) {
        statsRow.push(cellContent);
      }
    });
    const ctaContent = [];
    if (ctaLink) {
      const btnText = ctaLink.querySelector(".elementor_gt3_btn_text");
      const a = document.createElement("a");
      a.href = ctaLink.getAttribute("href") || "";
      a.textContent = btnText ? btnText.textContent.trim() : ctaLink.textContent.trim();
      ctaContent.push(a);
    }
    const cells = [];
    if (headerContent.length > 0) {
      cells.push([headerContent]);
    }
    if (statsRow.length > 0) {
      cells.push(statsRow);
    }
    if (ctaContent.length > 0) {
      cells.push([ctaContent]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-calendar.js
  function parse5(element, { document }) {
    const iframeContainer = element.querySelector(".meetings-iframe-container");
    const iframe = element.querySelector('.meetings-iframe-container iframe, iframe[src*="meetings.hubspot.com"]');
    let embedUrl = "";
    if (iframe) {
      const src = iframe.getAttribute("src");
      if (src) {
        try {
          const url = new URL(src);
          embedUrl = url.origin + url.pathname;
        } catch (e) {
          embedUrl = src.split("?")[0];
        }
      }
    }
    const cellContent = document.createDocumentFragment();
    if (embedUrl) {
      const fieldHint = document.createComment(" field:embed_uri ");
      cellContent.appendChild(fieldHint);
      const link = document.createElement("a");
      link.setAttribute("href", embedUrl);
      link.textContent = embedUrl;
      cellContent.appendChild(link);
    }
    const cells = [
      [cellContent]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-calendar", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/nextrow-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#ct-ultimate-gdpr-cookie-popup",
        "#ct-ultimate-gdpr-cookie-modal",
        "#ct-ultimate-gdpr-cookie-open",
        "#ct-ultimate-gdpr-loader"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [".wpda-header-builder"]);
      WebImporter.DOMUtils.remove(element, [".wpda-footer-builder"]);
      WebImporter.DOMUtils.remove(element, [".back_to_top_container"]);
      WebImporter.DOMUtils.remove(element, ["#elementor-device-mode"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, ["noscript"]);
      WebImporter.DOMUtils.remove(element, ["link"]);
    }
  }

  // tools/importer/transformers/nextrow-sections.js
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

  // tools/importer/import-product-page.js
  var parsers = {
    "hero-product": parse,
    "columns-casestudy": parse2,
    "embed-video": parse3,
    "columns-stats": parse4,
    "embed-calendar": parse5
  };
  var PAGE_TEMPLATE = {
    name: "product-page",
    description: "Product pages showcasing NextRow proprietary products with features and benefits",
    urls: [
      "https://www.nextrow.com/quiptag",
      "https://www.nextrow.com/koru"
    ],
    blocks: [
      {
        name: "hero-product",
        instances: ["section.elementor-element-79faebc9"]
      },
      {
        name: "columns-casestudy",
        instances: ["section[id='meeting_section']"]
      },
      {
        name: "embed-video",
        instances: ["section.elementor-element-33ee4074"]
      },
      {
        name: "columns-stats",
        instances: ["section.elementor-element-5726251c"]
      },
      {
        name: "embed-calendar",
        instances: ["section[id='calendar_show']"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero",
        selector: "section.elementor-element-79faebc9",
        style: null,
        blocks: ["hero-product"],
        defaultContent: []
      },
      {
        id: "section-2-problem",
        name: "Problem Statement",
        selector: "section[id='meeting_section']",
        style: null,
        blocks: ["columns-casestudy"],
        defaultContent: []
      },
      {
        id: "section-3-video",
        name: "Video Demo",
        selector: "section.elementor-element-33ee4074",
        style: null,
        blocks: ["embed-video"],
        defaultContent: []
      },
      {
        id: "section-4-stats",
        name: "Results Statistics",
        selector: "section.elementor-element-5726251c",
        style: null,
        blocks: ["columns-stats"],
        defaultContent: []
      },
      {
        id: "section-5-calendar",
        name: "Calendar",
        selector: "section[id='calendar_show']",
        style: null,
        blocks: ["embed-calendar"],
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
  var import_product_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
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
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_product_page_exports);
})();
