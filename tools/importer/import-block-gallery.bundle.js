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

  // tools/importer/import-block-gallery.js
  var import_block_gallery_exports = {};
  __export(import_block_gallery_exports, {
    default: () => import_block_gallery_default
  });
  var IMG = (w, h, text) => `https://placehold.co/${w}x${h}/cccccc/333333?text=${encodeURIComponent(text)}`;
  function el(document, tag, html) {
    const node = document.createElement(tag);
    if (html != null) node.innerHTML = html;
    return node;
  }
  function img(document, src, alt) {
    const i = document.createElement("img");
    i.src = src;
    i.alt = alt || "";
    return i;
  }
  function anchor(document, href, text) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text || href;
    return a;
  }
  function label(document, text) {
    const h = document.createElement("h2");
    h.textContent = text;
    return h;
  }
  var import_block_gallery_default = {
    transform: ({ document }) => {
      const main = document.createElement("div");
      const blocks = [];
      blocks.push(["home-video-hero-stryker", [
        [anchor(document, "https://youtu.be/kRIuiIy_SCs", "https://youtu.be/kRIuiIy_SCs")]
      ]]);
      blocks.push(["home-hero-stryker", [
        ["Now available"],
        ["Connected care, reimagined"],
        ["Technology that helps you deliver better outcomes for more patients."],
        [anchor(document, "https://www.stryker.com/us/en/index.html", "Explore")],
        ["Explore solutions"],
        [img(document, IMG(900, 620, "Hero"), "Hero background")]
      ]]);
      const overviewCard = (title, desc) => [
        img(document, IMG(400, 260, "Overview"), title),
        title,
        el(document, "div", `<p>${desc}</p>`)
      ];
      blocks.push(["overview-stryker", [
        ["Our", "focus", el(document, "div", "<p>Empowering people for powerful outcomes.</p>"), el(document, "div", "<p>Across the continuum of care.</p>")],
        overviewCard("Medical and Surgical", "Empowering people for powerful outcomes."),
        overviewCard("Orthopaedics", "Leading what's next."),
        overviewCard("Neurotechnology", "Better connected.")
      ]]);
      blocks.push(["content-break-stryker", [[""]]]);
      blocks.push(["section-banner-stryker", [
        [el(document, "div", "<p>Interested in learning more? <strong>Talk to a rep today.</strong></p>")]
      ]]);
      blocks.push(["social-cta-stryker", [
        ["Connect with us"],
        ["Contact sales", anchor(document, "https://www.stryker.com/contact", "Contact")],
        ["Find a rep", anchor(document, "https://www.stryker.com/reps", "Reps")],
        ["facebook", anchor(document, "https://facebook.com/stryker", "fb")],
        ["linkedin", anchor(document, "https://linkedin.com/company/stryker", "li")],
        ["youtube", anchor(document, "https://youtube.com/stryker", "yt")],
        ["instagram", anchor(document, "https://instagram.com/stryker", "ig")]
      ]]);
      blocks.push(["get-to-know-us-stryker", [
        [img(document, IMG(600, 480, "People"), "People")],
        [el(document, "div", "<h2>What we do</h2><p>Stryker is one of the world's leading medical technology companies. Alongside our customers around the world, we impact more than 150 million patients annually.</p>")],
        ["Get to know us"],
        [anchor(document, "https://www.stryker.com/us/en/about.html", "About")],
        ["standard"],
        [""]
      ]]);
      blocks.push(["get-to-know-us-stryker", [
        [img(document, IMG(520, 400, "Responsibility"), "Responsibility")],
        [el(document, "div", "<h2>Corporate responsibility</h2><p>We are committed to positively impacting people and our planet through responsible, sustainable practices that create a better, healthier world.</p>")],
        ["Read our 2024 comprehensive report"],
        [anchor(document, "https://www.stryker.com/us/en/about/corporate-responsibility.html", "Report")],
        ["banner"],
        [img(document, IMG(1600, 200, "Band"), "Band")]
      ]]);
      const newsCard = (title) => [
        img(document, IMG(360, 200, "News"), title),
        "Read More",
        anchor(document, "https://www.stryker.com/news", "News"),
        el(document, "div", `<p>${title}</p><p>Supporting copy for the news item goes here to show the card body.</p>`)
      ];
      blocks.push(["cards-stryker", [
        ["Latest news"],
        ["4"],
        ["news"],
        newsCard("Customer Updates: Stryker Network Disruption"),
        newsCard("Stryker partners with Fortune to share our digital innovation story"),
        newsCard("Stryker launches TPX HD power tool"),
        newsCard("AVS, Now Part of Stryker, Enrolls First Patient")
      ]]);
      const focusCard = (title, sub) => [
        img(document, IMG(400, 220, "Focus"), title),
        "Learn More",
        anchor(document, "https://www.stryker.com/focus", "Focus"),
        el(document, "div", `<p>${title}</p><p>${sub}</p>`)
      ];
      blocks.push(["cards-stryker", [
        ["Our focus"],
        ["3"],
        ["default"],
        focusCard("Medical and Surgical", "Empowering people for powerful outcomes."),
        focusCard("Orthopaedics and Spine", "Leading what's next."),
        focusCard("Neurotechnology", "Better connected.")
      ]]);
      blocks.push(["image-gallery-stryker", [
        ["Awards"],
        ["We owe our achievements to our dedicated employees"],
        ["View all awards"],
        [anchor(document, "https://www.stryker.com/awards", "Awards")],
        [img(document, IMG(160, 130, "Award 1"), "Award 1")],
        [img(document, IMG(160, 130, "Award 2"), "Award 2")],
        [img(document, IMG(160, 130, "Award 3"), "Award 3")],
        [img(document, IMG(160, 130, "Award 4"), "Award 4")],
        [img(document, IMG(160, 130, "Award 5"), "Award 5")],
        [img(document, IMG(160, 130, "Award 6"), "Award 6")]
      ]]);
      blocks.push(["video-stryker", [
        [anchor(document, "https://youtu.be/kRIuiIy_SCs", "https://youtu.be/kRIuiIy_SCs")],
        [img(document, IMG(800, 450, "Poster"), "Poster")]
      ]]);
      blocks.push(["product-preview-stryker", [
        ["The"],
        ["RISE Neurotechnology Cart"],
        [el(document, "div", "<p>The customizable RISE Neurotechnology Cart accommodates unique demands of the RISE Ecosystem in ENT and Neurosurgery.</p>")],
        ["Click and drag the cart for a 360 view or use the arrows below to rotate."],
        [img(document, IMG(500, 600, "Frame 1"), "Frame 1")],
        [img(document, IMG(500, 600, "Frame 2"), "Frame 2")],
        [img(document, IMG(500, 600, "Frame 3"), "Frame 3")],
        ["Flex arm for custom positioning"],
        ["IV hooks"],
        ["Keyboard and mouse tray"],
        ["Storage for EM generator"],
        ["Suction canister holder"],
        ["Storage drawer for cables and foot pedal"]
      ]]);
      blocks.push(["text-and-media-stryker", [
        [img(document, IMG(600, 400, "Vision"), "Vision")],
        ["Vision"],
        [""],
        [""],
        ["Vision"],
        [el(document, "div", "<p>Vision is a protocol management dashboard that gives caregivers visibility to compliance and bed exit alarm activity.</p>")],
        ["basic"],
        ["media-left"]
      ]]);
      blocks.push(["text-and-media-stryker", [
        [""],
        [""],
        [anchor(document, "https://youtu.be/kRIuiIy_SCs", "https://youtu.be/kRIuiIy_SCs")],
        ["Centralized"],
        ["control"],
        [el(document, "div", "<p>Your team can assist you from the doc station without breaking sterility around the sterile field.</p>")],
        ["advanced"],
        ["media-right"]
      ]]);
      ["left", "center", "right"].forEach((align) => {
        blocks.push(["cross-promo-stryker", [
          [img(document, IMG(420, 240, `ProCare ${align}`), "ProCare Services")],
          ["ProCare Services"],
          [anchor(document, "https://www.stryker.com/us/en/acute-care/services/procare.html", "ProCare")],
          ["Read more"],
          [align]
        ]]);
      });
      blocks.push(["legal-text-stryker", [
        [el(document, "div", "<p><strong>References</strong></p><ol><li>As compared to previous Stryker offering</li><li>1937000</li><li>1000904469</li><li>COMMS-COMSO-WHPR-1532602</li></ol><p>ENDO-GSNPS-SYK-2116500</p><p>Last Updated July/2025</p>")]
      ]]);
      blocks.forEach(([name, cells], idx) => {
        if (idx > 0) main.append(document.createElement("hr"));
        main.append(label(document, name));
        const block = WebImporter.Blocks.createBlock(document, { name, cells });
        main.append(block);
      });
      main.append(document.createElement("hr"));
      main.append(label(document, "section-anchor-stryker"));
      main.append(WebImporter.Blocks.createBlock(document, { name: "section-anchor-stryker", cells: [[""]] }));
      [
        ["Overview", "Welcome to the RISE of a new OR for ENT and Neurosurgery."],
        ["Features", "Vision is a protocol management dashboard for caregivers."],
        ["Contact", "Contact an expert about RISE."]
      ].forEach(([name, body]) => {
        main.append(document.createElement("hr"));
        main.append(el(document, "h2", name));
        main.append(el(document, "p", body));
        main.append(WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { name }
        }));
      });
      main.append(document.createElement("hr"));
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: "metadata",
        cells: {
          Title: "Block Gallery",
          theme: "stryker",
          nav: "/content/stryker/nav",
          footer: "/content/stryker/footer"
        }
      });
      main.append(metadata);
      return [{
        element: main,
        path: "/stryker/block-gallery",
        report: { title: "Block Gallery", template: "block-gallery", blocks: blocks.map((b) => b[0]) }
      }];
    }
  };
  return __toCommonJS(import_block_gallery_exports);
})();
