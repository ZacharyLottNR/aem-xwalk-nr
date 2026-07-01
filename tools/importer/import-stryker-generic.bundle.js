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
  var JUNK_EXACT = /* @__PURE__ */ new Set([
    "audio",
    "menu",
    "back",
    "continue",
    "x",
    "search this site",
    "select all",
    "cancel",
    "cancelselect all",
    "cancelsend email",
    "allow all",
    "clear",
    "apply cancel",
    "reject all confirm my choices",
    "always active",
    "consent leg.interest",
    "embed link",
    "share link",
    "email this to a friend",
    "reject all",
    "accept all cookies",
    "cookies settings",
    "confirm my choices",
    "manage consent preferences",
    "cookie list",
    "privacy preference center",
    "8 english",
    "our business",
    "search\u2026",
    "allow all",
    "watch on"
  ]);
  var JUNK_PATTERNS = [
    /^\d{1,2}:\d{2}(\s*\/\s*\d{1,2}:\d{2})?$/,
    // media timecodes: "0:00", "0:04 / 0:07"
    /^\/content\/experience-fragments\//i,
    // XF path strings
    /^blob:/i,
    // blob: media URLs
    /^rgba?\(/i,
    // leaked inline color values: "rgba(255,255,255,1)"
    /^\[[ x]\]/i,
    // cookie toggles: "[x] Functional Cookies", "[ ] checkbox label"
    /^(true|false|none)$/i,
    // leaked widget config values
    /wrong email address/i,
    // email-a-friend form copy
    /to share this content with others/i,
    // embed/share dialog copy
    /^\d{2,4}x\d{2,4}$/,
    // embed size options: "320x240", "640x480"
    /these cookies (are|enable|allow|may)/i,
    // OneTrust cookie descriptions
    /localpage_nav|hcp-banner-overlay|first-item/i,
    // widget config tokens
    /copy and past this (code|link)/i
    // embed/share instructions
  ];
  function isJunkText(t) {
    if (!t) return true;
    const norm = t.replace(/\s+/g, " ").trim().toLowerCase();
    if (!norm) return true;
    if (JUNK_EXACT.has(norm)) return true;
    return JUNK_PATTERNS.some((re) => re.test(norm));
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
  function extractVideo(document, section, theme) {
    const a = section.querySelector('a[href*="youtu"], a[href*="vimeo"]');
    const iframe = section.querySelector("iframe[src]");
    const url = (a == null ? void 0 : a.getAttribute("href")) || (iframe == null ? void 0 : iframe.getAttribute("src")) || FALLBACK_VIDEO;
    return [WebImporter.Blocks.createBlock(document, {
      name: "video-stryker",
      cells: [[anchorNode(document, isUsableUrl(url) ? url : FALLBACK_VIDEO, url)], [theme || "default"]]
    })];
  }
  function extractCarousel(document, section) {
    const firstSlide = section.querySelector(".carouselslide, .autoplay-slide") || section;
    const img = firstSlide.querySelector("img");
    if (img && imgSrc(img)) {
      return [imgNode(document, imgSrc(img), img.getAttribute("alt") || "")];
    }
    if (firstSlide.querySelector('.c-standalone-video-content, a[href*="youtu"], iframe[src]')) {
      return extractVideo(document, firstSlide, "hero");
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
  function extractPromoPanel(document, panel) {
    const img = panel.querySelector("img");
    const heading = panel.querySelector("h1, h2, h3, h4");
    const cta = panel.querySelector("a[href]");
    const headingText = text(heading);
    const ctaLabel = text(cta);
    const seen = /* @__PURE__ */ new Set();
    const descParts = [];
    panel.querySelectorAll("p, span, div").forEach((n) => {
      if (n.childElementCount) return;
      const plain = text(n);
      if (!plain || plain === headingText || plain === ctaLabel) return;
      if (isJunkText(plain) || seen.has(plain)) return;
      seen.add(plain);
      descParts.push(`<p>${n.innerHTML.trim() || plain}</p>`);
    });
    const bodyHtml = `${headingText ? `<h2>${headingText}</h2>` : ""}${descParts.join("")}`;
    return [WebImporter.Blocks.createBlock(document, {
      name: "get-to-know-us-stryker",
      cells: [
        [img ? imgNode(document, imgSrc(img), img.getAttribute("alt") || headingText) : ""],
        [el(document, "div", bodyHtml)],
        [ctaLabel || ""],
        [cta ? anchorNode(document, cta.getAttribute("href") || "#", ctaLabel) : ""],
        ["standard"],
        [""]
      ]
    })];
  }
  function extractFullBleedPanel(document, section) {
    const nodes = [];
    const img = section.querySelector("img");
    if (img) nodes.push(imgNode(document, imgSrc(img), img.getAttribute("alt") || ""));
    section.querySelectorAll("h1, h2, h3, h4, p").forEach((n) => {
      const t = n.innerHTML.trim();
      if (t && !isJunkText(text(n))) nodes.push(el(document, n.tagName.toLowerCase(), t));
    });
    return nodes.length ? nodes : null;
  }
  function extractText(document, section) {
    const nodes = [];
    section.querySelectorAll("h1, h2, h3, h4, p").forEach((n) => {
      const t = n.innerHTML.trim();
      if (t && !isJunkText(text(n))) nodes.push(el(document, n.tagName.toLowerCase(), t));
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
    var _a;
    const own = [...section.classList || []].find((c) => c.startsWith("c-"));
    if (own) return own;
    const inner = (_a = section.querySelector) == null ? void 0 : _a.call(section, "[class]");
    if (inner) {
      const nested = [...inner.classList || []].find((c) => c.startsWith("c-"));
      if (nested) return nested;
    }
    return null;
  }
  function extractAllContent(document, root) {
    const nodes = [];
    const seenText = /* @__PURE__ */ new Set();
    const walker = root.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, img");
    walker.forEach((n) => {
      if (n.tagName === "IMG") {
        const src = imgSrc(n);
        if (isUsableUrl(src)) nodes.push(imgNode(document, src, n.getAttribute("alt") || ""));
        return;
      }
      const t = n.innerHTML.trim();
      const plain = text(n);
      if (!plain) return;
      if (seenText.has(plain)) return;
      if (isJunkText(plain)) return;
      seenText.add(plain);
      const tag = n.tagName.toLowerCase();
      nodes.push(el(document, tag === "li" ? "p" : tag, t));
    });
    return nodes.length ? nodes : null;
  }
  function isCardUnit(node) {
    var _a;
    return ((_a = node.classList) == null ? void 0 : _a.contains("xf-master-building-block")) && node.querySelector("img") && node.querySelector("h2, h3, h4");
  }
  function isPromoPanel(node) {
    if (!node.querySelector) return false;
    if (node.querySelector(".xf-master-building-block, .item, table, .c-tabs, .c-disclaimer")) return false;
    const imgs = node.querySelectorAll("img");
    const links = node.querySelectorAll("a[href]");
    const heading = node.querySelector("h1, h2, h3, h4");
    return imgs.length === 1 && links.length === 1 && !!heading && text(node).length > 30;
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
        const contentRoot = document.querySelector("main") || document.body;
        const SELECTOR = [
          ".c-section-title",
          ".section-title[data-title]",
          "[data-title]",
          ".xf-master-building-block",
          ".page-section",
          ".c-disclaimer",
          ".text.parbase",
          ".c-rich-text-editor",
          ".largeheadline",
          ".sectionseparator",
          ".c-section-separator",
          // horizontal content breaks
          ".pDiv"
          // bespoke promo bands (e.g. Training Calendar)
        ].join(",");
        const all = [...contentRoot.querySelectorAll(SELECTOR)].filter((n) => !n.closest("header, footer, nav"));
        const units = all.filter((n) => !all.some((o) => o !== n && o.contains(n)));
        const sectionsOut = [{ anchorLabel: "", nodes: [] }];
        let current = sectionsOut[0];
        const legalParas = [];
        const pushLegal = (html, plain) => {
          if (!plain || legalParas.some((p) => p.plain === plain)) return;
          legalParas.push({ html, plain });
        };
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
        const anchorTitleEl = (node) => {
          var _a, _b;
          return ((_a = node.matches) == null ? void 0 : _a.call(node, ".c-section-title, .section-title[data-title], [data-title]")) ? node : (_b = node.querySelector) == null ? void 0 : _b.call(node, ".c-section-title, .section-title[data-title], [data-title]");
        };
        const consumed = [];
        const processNode = (node) => {
          var _a, _b;
          if (node.nodeType !== 1) return;
          if (["SCRIPT", "STYLE", "LINK", "NOSCRIPT"].includes(node.tagName)) return;
          consumed.push(node);
          if (isCardUnit(node)) {
            pendingCards.push(node);
            return;
          }
          if (((_a = node.matches) == null ? void 0 : _a.call(node, ".sectionseparator, .c-section-separator, .section-separator")) || node.tagName === "HR") {
            flushCards();
            current.nodes.push(WebImporter.Blocks.createBlock(document, {
              name: "content-break-stryker",
              cells: [["little"]]
            }));
            blockNames.push("content-break-stryker");
            return;
          }
          if (((_b = node.matches) == null ? void 0 : _b.call(node, ".c-disclaimer")) || componentType(node) === "c-disclaimer") {
            flushCards();
            [...node.querySelectorAll("p")].forEach((p) => pushLegal(p.innerHTML.trim(), text(p)));
            if (!node.querySelector("p")) pushLegal(node.innerHTML.trim(), text(node));
            return;
          }
          const titleEl = anchorTitleEl(node);
          if (titleEl && (titleEl.getAttribute("data-title") || text(titleEl))) {
            flushCards();
            const label = titleEl.getAttribute("data-title") || text(titleEl);
            current = { anchorLabel: label || "", nodes: [] };
            sectionsOut.push(current);
            return;
          }
          flushCards();
          const type = componentType(node);
          const extractor = type ? EXTRACTORS[type] : null;
          try {
            let produced = extractor ? extractor(document, node) : null;
            if ((!produced || !produced.length) && isPromoPanel(node)) {
              produced = extractPromoPanel(document, node);
            }
            if (!produced || !produced.length) produced = extractAllContent(document, node);
            if (produced && produced.length) current.nodes.push(...produced);
          } catch (compErr) {
            const fallback = extractAllContent(document, node);
            if (fallback) current.nodes.push(...fallback);
            else current.nodes.push(errorBlock(document, `failed to extract ${type || node.className || "node"} \u2014 ${compErr.message}`));
          }
        };
        units.forEach(processNode);
        flushCards();
        document.querySelectorAll(".c-disclaimer p, .c-disclaimer").forEach((d) => {
          if (d.matches(".c-disclaimer") && d.querySelector("p")) return;
          pushLegal(d.innerHTML.trim(), text(d));
        });
        const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
        const key = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        let capturedKey = "";
        sectionsOut.forEach((sec) => sec.nodes.forEach((node) => {
          capturedKey += key(text(node));
        }));
        legalParas.forEach((p) => {
          capturedKey += key(p.plain);
        });
        const isTextLeaf = (n) => {
          const t = norm(text(n));
          if (!t || t.length < 3) return false;
          return ![...n.children].some((c) => norm(text(c)) === t);
        };
        const JUNK = [
          '[id*="onetrust"]',
          '[class*="onetrust"]',
          '[class*="ot-sdk"]',
          '[class*="cookie"]',
          '[class*="privacy-preference"]',
          '[class*="video-viewer"]',
          '[class*="video-content"]',
          '[class*="video-dynamic"]',
          '[class*="s7"]',
          '[id*="s7"]',
          '[class*="scene7"]',
          '[data-widget*="video"]',
          '[class*="cq-dd-image"]',
          '[class*="dynamicmedia"]',
          '[class*="mobile-nav"]',
          '[class*="nav-overlay"]',
          '[class*="jumpbarnav"]',
          '[aria-hidden="true"]',
          "[hidden]"
        ].join(",");
        const missed = [];
        const queuedNodes = [];
        contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, div, span").forEach((n) => {
          if (n.closest("header, footer, nav")) return;
          if (n.closest(JUNK)) return;
          if (!isTextLeaf(n)) return;
          const plain = norm(text(n));
          if (isJunkText(plain)) return;
          const k = key(plain);
          if (!k || capturedKey.includes(k)) return;
          if (queuedNodes.some((q) => q.contains(n) || n.contains(q))) return;
          capturedKey += k;
          queuedNodes.push(n);
          const tag = /^H[1-6]$/.test(n.tagName) ? n.tagName.toLowerCase() : "p";
          missed.push(el(document, tag, n.innerHTML.trim() || plain));
        });
        if (missed.length) {
          current.nodes.push(document.createElement("hr"));
          missed.forEach((m) => current.nodes.push(m));
        }
        sectionsOut.forEach((sec) => {
          sec.nodes.forEach((node) => {
            if (!node.querySelectorAll) return;
            if (node.matches && node.matches("table")) return;
            node.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").forEach((leaf) => {
              if (leaf.closest("table")) return;
              if (![...leaf.children].some((c) => text(c) === text(leaf)) && isJunkText(text(leaf))) {
                leaf.remove();
              }
            });
            if (node.matches && node.matches("p, h1, h2, h3, h4, h5, h6, li") && isJunkText(text(node)) && !node.querySelector("img, picture, a[href]")) {
              node._dropped = true;
            }
          });
          sec.nodes = sec.nodes.filter((n) => !n._dropped);
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
        if (legalParas.length) {
          main.append(document.createElement("hr"));
          main.append(WebImporter.Blocks.createBlock(document, {
            name: "legal-text-stryker",
            cells: [[el(document, "div", legalParas.map((p) => `<p>${p.html}</p>`).join(""))]]
          }));
          blockNames.push("legal-text-stryker");
        }
        const seenTextKeys = /* @__PURE__ */ new Set();
        main.querySelectorAll("table td, table th, table p, table h1, table h2, table h3, table h4, table li").forEach((c) => {
          const k = key(text(c));
          if (k) seenTextKeys.add(k);
        });
        main.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").forEach((n) => {
          if (n.closest("table")) return;
          const k = key(text(n));
          if (!k) return;
          if (seenTextKeys.has(k)) {
            n.remove();
            return;
          }
          seenTextKeys.add(k);
        });
        const imgKey = (src) => {
          if (!src) return "";
          try {
            return new URL(src, "https://x").pathname.toLowerCase();
          } catch (e) {
            return src.split("?")[0].toLowerCase();
          }
        };
        const seenImgKeys = /* @__PURE__ */ new Set();
        main.querySelectorAll("table img").forEach((img) => {
          const k = imgKey(imgSrc(img));
          if (k) seenImgKeys.add(k);
        });
        main.querySelectorAll("img").forEach((img) => {
          if (img.closest("table")) return;
          const k = imgKey(imgSrc(img));
          if (!k) return;
          if (seenImgKeys.has(k)) {
            const pic = img.closest("picture") || img;
            const wrap = pic.closest("a, p");
            pic.remove();
            if (wrap && !text(wrap) && !wrap.querySelector("img, picture")) wrap.remove();
            return;
          }
          seenImgKeys.add(k);
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
