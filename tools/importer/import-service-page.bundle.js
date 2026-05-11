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

  // tools/importer/import-service-page.js
  var import_service_page_exports = {};
  __export(import_service_page_exports, {
    default: () => import_service_page_default
  });

  // tools/importer/parsers/hero-service.js
  function parse(element, { document }) {
    const rightColumn = element.querySelector(".elementor-inner-column:last-child .elementor-widget-image img, .elementor-col-50:last-child .elementor-widget-image img");
    const image = rightColumn ? rightColumn.cloneNode(true) : null;
    const heading = element.querySelector(".elementor-heading-title, h2");
    const textEditors = element.querySelectorAll(".elementor-widget-text-editor .elementor-widget-container");
    const ctaLink = element.querySelector(".gt3_module_button_elementor a, .elementor-widget-gt3-core-button a");
    const textFrag = document.createDocumentFragment();
    const fieldHintText = document.createComment(" field:text ");
    textFrag.appendChild(fieldHintText);
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.trim();
      textFrag.appendChild(h2);
    }
    if (textEditors && textEditors.length > 0) {
      textEditors.forEach((editor) => {
        const p = document.createElement("p");
        p.textContent = editor.textContent.trim();
        if (p.textContent) {
          textFrag.appendChild(p);
        }
      });
    }
    if (ctaLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = ctaLink.href || ctaLink.getAttribute("href") || "#";
      const btnTextSpan = ctaLink.querySelector(".elementor_gt3_btn_text");
      a.textContent = btnTextSpan ? btnTextSpan.textContent.trim() : ctaLink.textContent.trim() || "Learn More";
      p.appendChild(a);
      textFrag.appendChild(p);
    }
    const imageFrag = document.createDocumentFragment();
    const fieldHintImage = document.createComment(" field:image ");
    imageFrag.appendChild(fieldHintImage);
    if (image) {
      imageFrag.appendChild(image);
    }
    const cells = [
      [imageFrag],
      [textFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-service", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-valueprop.js
  function parse2(element, { document }) {
    const topColumns = element.querySelectorAll(":scope > .elementor-container > .elementor-column.elementor-col-50");
    const cells = [];
    const row = [];
    topColumns.forEach((col) => {
      const cellContent = [];
      const iconImg = col.querySelector(".elementor-icon img, .elementor-icon-wrapper img");
      if (iconImg) {
        const img = document.createElement("img");
        img.src = iconImg.getAttribute("src") || "";
        if (iconImg.getAttribute("alt")) {
          img.alt = iconImg.getAttribute("alt");
        }
        cellContent.push(img);
      }
      const heading = col.querySelector(".elementor-widget-heading h3, .elementor-heading-title, h3");
      if (heading) {
        const h3 = document.createElement("h3");
        h3.textContent = heading.textContent.trim();
        cellContent.push(h3);
      }
      const textWidget = col.querySelector(".elementor-widget-text-editor .elementor-widget-container");
      if (textWidget) {
        const p = document.createElement("p");
        p.textContent = textWidget.textContent.trim();
        cellContent.push(p);
      }
      row.push(cellContent);
    });
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-valueprop", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-accelerator.js
  function parse3(element, { document }) {
    const cardElements = element.querySelectorAll(".content_box .inner_layer");
    const cells = [];
    cardElements.forEach((card) => {
      const heading = card.querySelector("h5, h4, h6, h3, h2, h1");
      const allParagraphs = Array.from(card.querySelectorAll("p"));
      const descriptions = allParagraphs.filter((p) => p.textContent.trim().length > 0);
      const link = card.querySelector("a.box_link, a");
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      descriptions.forEach((desc) => textFrag.appendChild(desc));
      if (link) textFrag.appendChild(link);
      cells.push(["", textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-accelerator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-casestudy.js
  function parse4(element, { document }) {
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

  // tools/importer/import-service-page.js
  var parsers = {
    "hero-service": parse,
    "columns-valueprop": parse2,
    "cards-accelerator": parse3,
    "columns-casestudy": parse4,
    "embed-calendar": parse5
  };
  var PAGE_TEMPLATE = {
    name: "service-page",
    description: "Service area pages describing NextRow digital service offerings with hero, features, and contact CTA",
    urls: [
      "https://www.nextrow.com/b2b-marketing",
      "https://www.nextrow.com/unified-customer-experience",
      "https://www.nextrow.com/content-supply-chain",
      "https://www.nextrow.com/martech-services",
      "https://www.nextrow.com/ai-services",
      "https://www.nextrow.com/cloud-services",
      "https://www.nextrow.com/workday-services",
      "https://www.nextrow.com/cyber-security",
      "https://www.nextrow.com/snowflake-services/cloud-data-analytics"
    ],
    blocks: [
      {
        name: "hero-service",
        instances: ["section.full-width-2col-section"]
      },
      {
        name: "columns-valueprop",
        instances: ["section.section_result"]
      },
      {
        name: "cards-accelerator",
        instances: ["section.boxes"]
      },
      {
        name: "columns-casestudy",
        instances: ["section[id='meeting_section']"]
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
        selector: "section.full-width-2col-section",
        style: null,
        blocks: ["hero-service"],
        defaultContent: []
      },
      {
        id: "section-2-valueprop",
        name: "Value Props",
        selector: "section.section_result",
        style: null,
        blocks: ["columns-valueprop"],
        defaultContent: []
      },
      {
        id: "section-3-accelerators",
        name: "Accelerators",
        selector: "section.boxes",
        style: null,
        blocks: ["cards-accelerator"],
        defaultContent: ["section.boxes h2", "section.boxes .elementor-widget-text-editor"]
      },
      {
        id: "section-4-cta",
        name: "CTA Section",
        selector: "section.elementor-element-6c9fbbe2",
        style: null,
        blocks: [],
        defaultContent: ["section.elementor-element-6c9fbbe2 h2", "section.elementor-element-6c9fbbe2 .elementor-widget-text-editor", "section.elementor-element-6c9fbbe2 .elementor-widget-image", "section.elementor-element-6c9fbbe2 .elementor-widget-gt3-core-button"]
      },
      {
        id: "section-5-partnership",
        name: "Partnership",
        selector: "section[id='meeting_section']",
        style: null,
        blocks: ["columns-casestudy"],
        defaultContent: []
      },
      {
        id: "section-6-calendar",
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
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_service_page_default = {
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
        } else {
          console.warn(`No parser found for block: ${block.name}`);
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
  return __toCommonJS(import_service_page_exports);
})();
