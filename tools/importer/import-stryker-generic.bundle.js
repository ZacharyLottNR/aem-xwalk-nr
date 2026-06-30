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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

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
  function extractCarousel(document, section) {
    const firstSlide = section.querySelector(".carouselslide, .autoplay-slide") || section;
    const img = firstSlide.querySelector("img");
    if (img && imgSrc(img)) {
      return [imgNode(document, imgSrc(img), img.getAttribute("alt") || "")];
    }
    if (firstSlide.querySelector('.c-standalone-video-content, a[href*="youtu"], iframe[src]')) {
      return extractVideo(document, firstSlide);
    }
    return null;
  }
  function extractTable(document, section) {
    const table = section.querySelector("table");
    if (!table) return null;
    const rows = [...table.querySelectorAll("tr")];
    if (!rows.length) return null;
    const nodes = [];
    const headerCells = [...rows[0].querySelectorAll("th")];
    const headers = headerCells.map((c) => text(c));
    if (headers.length) {
      nodes.push(el(document, "h3", headers[0] || "Details"));
    }
    const ul = document.createElement("ul");
    rows.slice(headers.length ? 1 : 0).forEach((tr) => {
      const tds = [...tr.children].map((c) => text(c)).filter((t) => t !== "");
      if (!tds.length) return;
      const li = document.createElement("li");
      li.textContent = tds.join(" \u2014 ");
      ul.append(li);
    });
    if (ul.children.length) nodes.push(ul);
    return nodes.length ? nodes : null;
  }
  function extractResources(document, section) {
    const items = [...section.querySelectorAll(".item")];
    if (!items.length) return null;
    const cells = [[""], ["3"], ["default"]];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const link = item.querySelector('a[target="_blank"], a');
      const titleText = (img == null ? void 0 : img.getAttribute("alt")) || text(item.querySelector("h2, h3, h4")) || text(link);
      const ctaHref = (link == null ? void 0 : link.getAttribute("href")) || "#";
      cells.push([
        imgNode(document, imgSrc(img), titleText),
        "Download",
        anchorNode(document, ctaHref, "Download"),
        el(document, "div", `<p>${titleText}</p>`)
      ]);
    });
    return [WebImporter.Blocks.createBlock(document, { name: "cards-stryker", cells })];
  }
  function extractMarketoForm(document, section) {
    const msg = text(section.querySelector(".alert, .marketo-form-content p")) || "Interested in learning more? Talk to a rep today.";
    return [WebImporter.Blocks.createBlock(document, {
      name: "section-banner-stryker",
      cells: [[el(document, "div", `<p>${msg}</p>`)]]
    })];
  }
  function extractLatestNews(document, section) {
    const items = [...section.querySelectorAll(".item")];
    if (!items.length) return null;
    const heading = text(section.querySelector(".c-section-title, h2")) || "Latest news";
    const cells = [[heading], ["4"], ["news"]];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const titleEl = item.querySelector("h2, h3, h4, .m-c-subheading-description");
      const ctaEl = item.querySelector("a.news-link, a.action-link, a");
      const desc = [...item.querySelectorAll("p.description, .desc-container p")].map((p) => p.innerHTML.trim()).filter(Boolean);
      const titleText = text(titleEl);
      const ctaLabel = text(ctaEl) || "Read More";
      const ctaHref = (ctaEl == null ? void 0 : ctaEl.getAttribute("href")) || "#";
      cells.push([
        imgNode(document, imgSrc(img), titleText),
        ctaLabel,
        anchorNode(document, ctaHref, ctaLabel),
        el(document, "div", `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join("")}`)
      ]);
    });
    return [WebImporter.Blocks.createBlock(document, { name: "cards-stryker", cells })];
  }
  function extractLargeHeadline(document, section) {
    const label = text(section.querySelector(".largeheadline")) || text(section);
    if (!label) return null;
    return [el(document, "h2", label)];
  }
  function extractFullBleedPanel(document, section) {
    const nodes = [];
    const img = section.querySelector("img");
    if (img) nodes.push(imgNode(document, imgSrc(img), img.getAttribute("alt") || ""));
    section.querySelectorAll("h1, h2, h3, h4, p").forEach((n) => {
      const t = n.innerHTML.trim();
      if (t) nodes.push(el(document, n.tagName.toLowerCase(), t));
    });
    return nodes.length ? nodes : null;
  }
  function extractText(document, section) {
    const nodes = [];
    section.querySelectorAll("h1, h2, h3, h4, p").forEach((n) => {
      const t = n.innerHTML.trim();
      if (t) nodes.push(el(document, n.tagName.toLowerCase(), t));
    });
    return nodes.length ? nodes : null;
  }
  function tabItemsFromPanel(document, panel, tabName) {
    const rows = [];
    const videoSection = panel.querySelector(".c-standalone-video-content");
    if (videoSection || panel.querySelector('a[href*="youtu"], iframe[src]')) {
      const a = panel.querySelector('a[href*="youtu"], a[href*="vimeo"]');
      const iframe = panel.querySelector("iframe[src]");
      const url = (a == null ? void 0 : a.getAttribute("href")) || (iframe == null ? void 0 : iframe.getAttribute("src")) || FALLBACK_VIDEO;
      const title = text(panel.querySelector("h2, h3, h4")) || tabName;
      rows.push([tabName, "", "", anchorNode(document, isUsableUrl(url) ? url : FALLBACK_VIDEO, url), el(document, "div", `<p>${title}</p>`)]);
      return rows;
    }
    [...panel.querySelectorAll(".item")].forEach((item) => {
      const img = item.querySelector("img");
      const link = item.querySelector('a.action-link, a[target="_blank"], a');
      const titleEl = item.querySelector("h2, h3, h4");
      const desc = [...item.querySelectorAll(".desc-container p, p.description")].map((p) => p.innerHTML.trim()).filter(Boolean);
      const titleText = text(titleEl) || (img == null ? void 0 : img.getAttribute("alt")) || text(link);
      const isDownload = ((link == null ? void 0 : link.getAttribute("href")) || "").match(/\.(pdf|docx?|xlsx?|zip)$/i) || item.closest(".c-resourcesanddownload");
      const ctaLabel = text(item.querySelector("a.action-link")) || (isDownload ? "Download" : "Learn more");
      const ctaHref = (link == null ? void 0 : link.getAttribute("href")) || "#";
      rows.push([
        tabName,
        imgNode(document, imgSrc(img), titleText),
        ctaLabel,
        anchorNode(document, ctaHref, ctaLabel),
        el(document, "div", `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join("")}`)
      ]);
    });
    return rows;
  }
  function extractTabs(document, section) {
    const links = [...section.querySelectorAll(".tabs-nav a.tab-link, nav ul.tab a")];
    const panels = [...section.querySelectorAll(".tabs-content > .tab-content")];
    if (!links.length || !panels.length) return null;
    const cells = [[""]];
    links.forEach((link) => {
      const tabName = text(link);
      const href = (link.getAttribute("href") || "").replace(/^#/, "");
      const panel = panels.find((p) => p.id === href) || panels[links.indexOf(link)];
      if (!tabName || !panel) return;
      tabItemsFromPanel(document, panel, tabName).forEach((row) => cells.push(row));
    });
    if (cells.length <= 1) return null;
    return [WebImporter.Blocks.createBlock(document, { name: "tabbed-content-stryker", cells })];
  }
  var EXTRACTORS = {
    "c-standalone-image": extractStandaloneImage,
    "c-disclaimer": extractDisclaimer,
    "c-customizeable": extractCustomizeable,
    "c-procare-tile-addinfo": extractCustomizeable,
    "c-standalone-video-content": extractVideo,
    "c-latestnews": extractLatestNews,
    "c-largeheadline": extractLargeHeadline,
    "c-full-bleed-panel": extractFullBleedPanel,
    "c-autocarousel": extractCarousel,
    "c-table": extractTable,
    "c-marketo-form": extractMarketoForm,
    "c-resourcesanddownload": extractResources,
    "c-tabs": extractTabs,
    "c-text": extractText,
    // c-title / c-tagline hold a hydrated heading or tagline; emit their text.
    "c-title": extractText,
    "c-tagline": extractText
    // c-ourcompany is an empty JS-hydrated placeholder; falls through to
    // extractText which returns null, so it is safely skipped.
  };
  function componentType(section) {
    return [...section.classList].find((c) => c.startsWith("c-")) || null;
  }
  function isCardUnit(node) {
    var _a;
    return ((_a = node.classList) == null ? void 0 : _a.contains("xf-master-building-block")) && node.querySelector("img") && node.querySelector("h2, h3, h4");
  }
  function cardsFromUnits(document, units, heading) {
    const cells = [[heading || ""], ["3"], ["default"]];
    units.forEach((unit) => {
      const img = unit.querySelector("img");
      const titleEl = unit.querySelector("h2, h3, h4");
      const link = unit.querySelector("a[href]");
      const titleText = text(titleEl) || (img == null ? void 0 : img.getAttribute("alt")) || "";
      const desc = [...unit.querySelectorAll("p")].map((p) => p.innerHTML.trim()).filter((t) => t && t !== titleText);
      const href = (link == null ? void 0 : link.getAttribute("href")) || "#";
      cells.push([
        imgNode(document, imgSrc(img), titleText),
        "Learn more",
        anchorNode(document, href, "Learn more"),
        el(document, "div", `<p>${titleText}</p>${desc.map((d) => `<p>${d}</p>`).join("")}`)
      ]);
    });
    return WebImporter.Blocks.createBlock(document, { name: "cards-stryker", cells });
  }
  var import_stryker_generic_default = {
    // Stryker renders much of a page (training cards, carousels, taglines) with
    // client-side JS. Wait for that hydration to finish before the DOM is read,
    // otherwise headings/descriptions come through empty. Runs in the browser.
    onLoad: (_0) => __async(void 0, [_0], function* ({ document }) {
      const sleep = (ms) => new Promise((r) => {
        setTimeout(r, ms);
      });
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 600) {
        window.scrollTo(0, y);
        yield sleep(120);
      }
      window.scrollTo(0, 0);
      for (let i = 0; i < 30; i += 1) {
        const cards = document.querySelectorAll(".xf-master-building-block");
        const ready = [...cards].some((c) => c.querySelector("h2, h3, h4") && (c.querySelector("h2, h3, h4").textContent || "").trim());
        if (ready || !cards.length) break;
        yield sleep(200);
      }
    }),
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
        let pendingCards = [];
        const flushCards = () => {
          if (!pendingCards.length) return;
          try {
            current.nodes.push(cardsFromUnits(document, pendingCards));
            blockNames.push("cards-stryker");
          } catch (e) {
            current.nodes.push(errorBlock(document, `failed to build card grid \u2014 ${e.message}`));
          }
          pendingCards = [];
        };
        const seenUnits = /* @__PURE__ */ new Set();
        pageSections.forEach((section) => {
          var _a;
          const type = componentType(section);
          if (type === "c-section-title" || section.classList.contains("jumpbarparsys")) {
            flushCards();
            const label = section.getAttribute("data-title") || text(section);
            current = { anchorLabel: label || "", nodes: [] };
            sectionsOut.push(current);
            return;
          }
          const unit = (_a = section.closest) == null ? void 0 : _a.call(section, ".xf-master-building-block");
          if (unit && isCardUnit(unit)) {
            if (!seenUnits.has(unit)) {
              seenUnits.add(unit);
              pendingCards.push(unit);
            }
            return;
          }
          flushCards();
          const extractor = EXTRACTORS[type];
          try {
            const produced = extractor ? extractor(document, section) : extractText(document, section);
            if (produced && produced.length) {
              current.nodes.push(...produced);
            } else if (!extractor && type) {
              current.nodes.push(errorBlock(document, `unmapped component "${type}" had no extractable content`));
            }
          } catch (compErr) {
            current.nodes.push(errorBlock(document, `failed to extract ${type || "section"} \u2014 ${compErr.message}`));
          }
        });
        flushCards();
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
