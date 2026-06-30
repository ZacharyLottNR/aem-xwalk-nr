/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-stryker-generic.js
  var import_stryker_generic_exports = {};
  __export(import_stryker_generic_exports, {
    default: () => import_stryker_generic_default
  });
  var FALLBACK_IMAGE = "https://author-p63260-e524717.adobeaemcloud.com/adobe/dynamicmedia/deliver/dm-aid--5df6d573-c301-41be-bd6e-f55a17edf39d/stryker-logo-thumbnail-1.jpg";
  var FALLBACK_VIDEO = "https://youtu.be/kRIuiIy_SCs?si=BxJbaFO8GU6mARUS";
  function isUsableUrl(value) {
    return typeof value === "string" && value.trim() !== "" && !/\b(undefined|null|NaN)\b/.test(value);
  }
  function el(document, tag, html) {
    const node = document.createElement(tag);
    if (html != null) node.innerHTML = html;
    return node;
  }
  function errorBlock(document, message) {
    return el(document, "div", `<p>something went wrong: ${message}</p>`);
  }
  function imgNode(document, src, alt) {
    const i = document.createElement("img");
    i.src = isUsableUrl(src) ? src : FALLBACK_IMAGE;
    i.alt = alt || "";
    return i;
  }
  function anchorNode(document, href, text2) {
    const a = document.createElement("a");
    a.href = isUsableUrl(href) ? href : "#";
    a.textContent = text2 || href || "";
    return a;
  }
  function text(node) {
    return ((node == null ? void 0 : node.textContent) || "").replace(/\s+/g, " ").trim();
  }
  function imgSrc(img) {
    if (!img) return "";
    const cand = img.getAttribute("src") || img.getAttribute("data-src") || (img.getAttribute("srcset") || "").split(",")[0].trim().split(" ")[0];
    return cand || "";
  }
  function extractStandaloneImage(document, section) {
    const img = section.querySelector("img");
    if (!img) return null;
    return [imgNode(document, imgSrc(img), img.getAttribute("alt") || "")];
  }
  function extractDisclaimer(document, section) {
    const paras = [...section.querySelectorAll("p")].map((p) => p.innerHTML.trim()).filter(Boolean);
    if (!paras.length) return null;
    return [WebImporter.Blocks.createBlock(document, {
      name: "legal-text-stryker",
      cells: [[el(document, "div", paras.map((p) => `<p>${p}</p>`).join(""))]]
    })];
  }
  function extractCustomizeable(document, section) {
    const items = [...section.querySelectorAll(".item")];
    if (!items.length) return null;
    const cells = [[""], ["3"], ["default"]];
    items.forEach((item) => {
      var _a;
      const img = item.querySelector("img");
      const titleEl = item.querySelector("h2, h3, h4");
      const ctaEl = item.querySelector('a.action-link, .desc-container a.action-link, a[class*="action"]');
      const desc = [...item.querySelectorAll(".desc-container p")].map((p) => p.innerHTML.trim()).filter(Boolean);
      const titleText = text(titleEl) || text(item.querySelector("a"));
      const ctaLabel = text(ctaEl) || "Learn more";
      const ctaHref = (ctaEl == null ? void 0 : ctaEl.getAttribute("href")) || ((_a = item.querySelector("a")) == null ? void 0 : _a.getAttribute("href")) || "#";
      cells.push([
        imgNode(document, imgSrc(img), titleText),
        ctaLabel,
        anchorNode(document, ctaHref, ctaLabel),
        el(document, "div", `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join("")}`)
      ]);
    });
    return [WebImporter.Blocks.createBlock(document, { name: "cards-stryker", cells })];
  }
  function extractVideo(document, section) {
    const a = section.querySelector('a[href*="youtu"], a[href*="vimeo"]');
    const iframe = section.querySelector("iframe[src]");
    const url = (a == null ? void 0 : a.getAttribute("href")) || (iframe == null ? void 0 : iframe.getAttribute("src")) || FALLBACK_VIDEO;
    return [WebImporter.Blocks.createBlock(document, {
      name: "video-stryker",
      cells: [[anchorNode(document, isUsableUrl(url) ? url : FALLBACK_VIDEO, url)], [""]]
    })];
  }
  function extractText(document, section) {
    const nodes = [];
    section.querySelectorAll("h1, h2, h3, h4, p").forEach((n) => {
      const t = n.innerHTML.trim();
      if (t) nodes.push(el(document, n.tagName.toLowerCase(), t));
    });
    return nodes.length ? nodes : null;
  }
  var EXTRACTORS = {
    "c-standalone-image": extractStandaloneImage,
    "c-disclaimer": extractDisclaimer,
    "c-customizeable": extractCustomizeable,
    "c-standalone-video-content": extractVideo,
    "c-procare-tile-addinfo": extractCustomizeable,
    "c-text": extractText
  };
  function componentType(section) {
    return [...section.classList].find((c) => c.startsWith("c-")) || null;
  }
  var import_stryker_generic_default = {
    transform: ({ document, url }) => {
      const main = document.createElement("div");
      const blockNames = [];
      try {
        const pageTitle = text(document.querySelector("title")) || text(document.querySelector("h1")) || "Stryker";
        let path = "/stryker/imported";
        try {
          const slug = new URL(url, "https://x").pathname.replace(/\.html?$/, "").split("/").filter(Boolean).pop();
          if (slug) path = `/stryker/${slug}`;
        } catch (e) {
        }
        const pageSections = [...document.querySelectorAll(".page-section")].filter((s) => !s.closest(".experienceFragment-ef, .experienceFragment-ef-mobile") || s === document.querySelector(".page-section"));
        const sectionsOut = [{ anchorLabel: "", nodes: [] }];
        let current = sectionsOut[0];
        pageSections.forEach((section) => {
          const type = componentType(section);
          if (type === "c-section-title" || section.classList.contains("jumpbarparsys")) {
            const label = section.getAttribute("data-title") || text(section);
            current = { anchorLabel: label || "", nodes: [] };
            sectionsOut.push(current);
            return;
          }
          const extractor = EXTRACTORS[type];
          try {
            const produced = extractor ? extractor(document, section) : extractText(document, section);
            if (produced && produced.length) current.nodes.push(...produced);
          } catch (compErr) {
            current.nodes.push(errorBlock(document, `failed to extract ${type || "section"} \u2014 ${compErr.message}`));
          }
        });
        sectionsOut[0].nodes.push(WebImporter.Blocks.createBlock(document, {
          name: "section-anchor-stryker",
          cells: [[""]]
        }));
        blockNames.push("section-anchor-stryker");
        sectionsOut.forEach((sec, idx) => {
          if (!sec.nodes.length && !sec.anchorLabel) return;
          if (idx > 0) main.append(document.createElement("hr"));
          sec.nodes.forEach((n) => main.append(n));
          if (sec.anchorLabel) {
            main.append(WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells: { anchorLabel: sec.anchorLabel }
            }));
          }
        });
        main.append(document.createElement("hr"));
        main.append(WebImporter.Blocks.createBlock(document, {
          name: "metadata",
          cells: {
            Title: pageTitle,
            theme: "stryker",
            nav: "/content/stryker/nav",
            footer: "/content/stryker/footer"
          }
        }));
        return [{
          element: main,
          path,
          report: { title: pageTitle, template: "stryker-generic", blocks: blockNames }
        }];
      } catch (err) {
        main.append(errorBlock(document, err && err.message ? err.message : String(err)));
        return [{
          element: main,
          path: "/stryker/imported",
          report: { title: "Stryker Import", template: "stryker-generic", blocks: ["error"] }
        }];
      }
    }
  };
  return __toCommonJS(import_stryker_generic_exports);
})();
