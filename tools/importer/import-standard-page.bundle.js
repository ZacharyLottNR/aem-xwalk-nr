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

  // tools/importer/import-standard-page.js
  var import_standard_page_exports = {};
  __export(import_standard_page_exports, {
    default: () => import_standard_page_default
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

  // tools/importer/parsers/cards-partner.js
  function parse2(element, { document }) {
    const imageboxItems = element.querySelectorAll(".elementor-widget-gt3-core-imagebox");
    const cells = [];
    imageboxItems.forEach((item) => {
      const img = item.querySelector(".gt3-core-imagebox-img img, .gt3-core-imagebox-icon img, img");
      const heading = item.querySelector("div.gt3-core-imagebox-title > h5, h5.gt3-core-imagebox-title, h5, h4, h3");
      if (!heading) return;
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textCell.appendChild(heading);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-partner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-casestudy.js
  function parse3(element, { document }) {
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

  // tools/importer/parsers/form.js
  function parse4(element, { document }) {
    const formContainer = element.querySelector('.hbspt-form, [class*="hbspt-form"]');
    const hsForm = element.querySelector('form[class*="hs-form"], form[id^="hsForm"]');
    let formId = "";
    if (hsForm) {
      const formIdMatch = hsForm.id && hsForm.id.match(/hsForm_([a-f0-9-]+)/);
      if (formIdMatch) {
        formId = formIdMatch[1];
      }
    }
    if (!formId && formContainer) {
      const containerIdMatch = formContainer.id && formContainer.id.match(/hbspt-form-([a-f0-9-]+)/);
      if (containerIdMatch) {
        formId = containerIdMatch[1];
      }
    }
    const formLink = document.createElement("a");
    const formPath = "/forms/contact-form";
    formLink.href = formPath;
    formLink.textContent = formPath;
    const cells = [
      [formLink]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
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

  // tools/importer/import-standard-page.js
  var parsers = {
    "hero-product": parse,
    "cards-partner": parse2,
    "columns-casestudy": parse3,
    "form": parse4,
    "embed-calendar": parse5
  };
  var PAGE_TEMPLATE = {
    name: "standard-page",
    description: "General utility pages including partners, contact form, blog listing, training, and legal content",
    urls: [
      "https://www.nextrow.com/partners",
      "https://www.nextrow.com/contact-us",
      "https://www.nextrow.com/blog",
      "https://www.nextrow.com/training",
      "https://www.nextrow.com/privacy-policy"
    ],
    blocks: [
      {
        name: "hero-product",
        instances: ["section.elementor-element-79faebc9", "section.full-width-2col-section"]
      },
      {
        name: "cards-partner",
        instances: [".gt3-core-imagebox-wrapper"]
      },
      {
        name: "columns-casestudy",
        instances: ["section[id='meeting_section']"]
      },
      {
        name: "form",
        instances: ["#request-consultation", ".hbspt-form"]
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
        selector: ["section.elementor-element-79faebc9", "section.full-width-2col-section"],
        style: null,
        blocks: ["hero-product"],
        defaultContent: []
      },
      {
        id: "section-2-content",
        name: "Main Content",
        selector: "#main_content",
        style: null,
        blocks: ["cards-partner", "columns-casestudy", "form"],
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
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_standard_page_default = {
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
  return __toCommonJS(import_standard_page_exports);
})();
