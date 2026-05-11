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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-ai.js
  function parse(element, { document }) {
    var _a, _b, _c;
    const bgImage = element.querySelector(":scope > img") || element.querySelector(":scope > div > img") || element.querySelector('img[src*="cfac8641"]') || element.querySelector(".elementor-background-overlay + img") || element.querySelector('img:not(.elementor_btn_icon_container img):not([alt="Arrow Icon Png"])');
    const headings = element.querySelectorAll("h1.elementor-heading-title");
    const ctaLink = element.querySelector('a[href="/ai-services"]') || element.querySelector('a[href*="ai-services"]') || element.querySelector(".gt3_module_button_elementor a") || element.querySelector("a.button_size_elementor_custom");
    const cells = [];
    const imageFragment = document.createDocumentFragment();
    imageFragment.appendChild(document.createComment(" field:image "));
    if (bgImage) {
      imageFragment.appendChild(bgImage);
    }
    cells.push([imageFragment]);
    const textFragment = document.createDocumentFragment();
    textFragment.appendChild(document.createComment(" field:text "));
    if (headings.length > 0) {
      const combinedHeading = document.createElement("h1");
      const headingTexts = [];
      headings.forEach((h) => {
        headingTexts.push(h.textContent.trim());
      });
      combinedHeading.textContent = headingTexts.join(" ");
      textFragment.appendChild(combinedHeading);
    }
    if (ctaLink) {
      const ctaParagraph = document.createElement("p");
      const link = document.createElement("a");
      link.href = ctaLink.href || ctaLink.getAttribute("href");
      link.textContent = ((_b = (_a = ctaLink.querySelector(".elementor_gt3_btn_text")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || ((_c = ctaLink.textContent) == null ? void 0 : _c.trim()) || "Learn More";
      ctaParagraph.appendChild(link);
      textFragment.appendChild(ctaParagraph);
    }
    cells.push([textFragment]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-ai", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-logos.js
  function parse2(element, { document }) {
    const logoImages = element.querySelectorAll(".elementor-col-20 .elementor-widget-image img");
    const cells = [];
    const row = [];
    logoImages.forEach((img) => {
      row.push(img);
    });
    if (row.length === 0) {
      const fallbackImages = element.querySelectorAll(".elementor-widget-container img[alt]");
      fallbackImages.forEach((img) => {
        row.push(img);
      });
    }
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-logos", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-service.js
  function parse3(element, { document }) {
    const cardElements = element.querySelectorAll(".mob-cat");
    const cells = [];
    cardElements.forEach((card) => {
      const image = card.querySelector("img.cat_img");
      const heading = card.querySelector("h4");
      const link = card.querySelector("a.category_link");
      const imageCell = [];
      if (image) {
        const imageFragment = document.createDocumentFragment();
        imageFragment.appendChild(document.createComment(" field:image "));
        const imgClone = image.cloneNode(true);
        imageFragment.appendChild(imgClone);
        imageCell.push(imageFragment);
      }
      const textCell = [];
      const textFragment = document.createDocumentFragment();
      textFragment.appendChild(document.createComment(" field:text "));
      if (heading && link) {
        const linkEl = document.createElement("a");
        linkEl.href = link.getAttribute("href");
        linkEl.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        const h4 = document.createElement("h4");
        h4.appendChild(linkEl);
        textFragment.appendChild(h4);
      } else if (heading) {
        const h4 = document.createElement("h4");
        h4.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        textFragment.appendChild(h4);
      }
      textCell.push(textFragment);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service", cells });
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

  // tools/importer/parsers/cards-blog.js
  function parse5(element, { document }) {
    const cards = element.querySelectorAll(".blog_post_preview");
    const cells = [];
    cards.forEach((card) => {
      const imageLink = card.querySelector(".blog_post_media a");
      const img = card.querySelector(".blog_post_media img");
      const titleLink = card.querySelector("h2.blogpost_title a");
      const description = card.querySelector(".blog_item_description");
      const readMoreLink = card.querySelector(".gt3_module_button_list a");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (imageLink && img) {
        const linkedImage = imageLink.cloneNode(false);
        linkedImage.appendChild(img.cloneNode(true));
        imageCell.appendChild(linkedImage);
      } else if (img) {
        imageCell.appendChild(img.cloneNode(true));
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (titleLink) {
        const heading = document.createElement("h2");
        const link = document.createElement("a");
        link.href = titleLink.href;
        link.textContent = titleLink.textContent.trim();
        heading.appendChild(link);
        textCell.appendChild(heading);
      }
      if (description) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        textCell.appendChild(p);
      }
      if (readMoreLink) {
        const ctaP = document.createElement("p");
        const cta = document.createElement("a");
        cta.href = readMoreLink.href;
        cta.textContent = readMoreLink.textContent.trim();
        ctaP.appendChild(cta);
        textCell.appendChild(ctaP);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-blog", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse6(element, { document }) {
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-ai": parse,
    "columns-logos": parse2,
    "cards-service": parse3,
    "columns-casestudy": parse4,
    "cards-blog": parse5,
    "form": parse6
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Main landing page with hero, services overview, partner logos, and call-to-action sections",
    urls: [
      "https://www.nextrow.com/"
    ],
    blocks: [
      {
        name: "hero-ai",
        instances: ["section.elementor-element-245e5dd9.home_top_section"]
      },
      {
        name: "columns-logos",
        instances: ["section.elementor-element-76a4861"]
      },
      {
        name: "cards-service",
        instances: ["section.elementor-element-46285e5.section-categories", "section.elementor-element-3d0d5d8.section-categories"]
      },
      {
        name: "columns-casestudy",
        instances: ["section.elementor-element-ccfcd7f"]
      },
      {
        name: "cards-blog",
        instances: [".gt3_module_blog"]
      },
      {
        name: "form",
        instances: ["#request-consultation"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero",
        selector: "section.elementor-element-245e5dd9.home_top_section",
        style: null,
        blocks: ["hero-ai"],
        defaultContent: []
      },
      {
        id: "section-2-logos",
        name: "Client Logos",
        selector: "section.elementor-element-76a4861",
        style: null,
        blocks: ["columns-logos"],
        defaultContent: []
      },
      {
        id: "section-3-services-heading",
        name: "Services Heading",
        selector: "section.elementor-element-6cdae88.services-heading",
        style: null,
        blocks: [],
        defaultContent: ["section.elementor-element-6cdae88.services-heading h2", "section.elementor-element-6cdae88.services-heading .elementor-widget-text-editor"]
      },
      {
        id: "section-4-services-grid",
        name: "Services Grid",
        selector: ["section.elementor-element-46285e5.section-categories", "section.elementor-element-3d0d5d8.section-categories"],
        style: null,
        blocks: ["cards-service"],
        defaultContent: []
      },
      {
        id: "section-5-casestudy",
        name: "Case Study",
        selector: "section.elementor-element-ccfcd7f",
        style: null,
        blocks: ["columns-casestudy"],
        defaultContent: []
      },
      {
        id: "section-6-blog",
        name: "Insights Blog",
        selector: "section.elementor-element-a9093b8",
        style: "grey",
        blocks: ["cards-blog"],
        defaultContent: ["section.elementor-element-a9093b8 .elementor-element-26595b92"]
      },
      {
        id: "section-7-contact",
        name: "Contact Form",
        selector: "#request-consultation",
        style: "dark",
        blocks: ["form"],
        defaultContent: [".request-consultation h2", ".request-consultation p"]
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
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
