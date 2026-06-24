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

  // tools/importer/import-stryker-ibed.js
  var import_stryker_ibed_exports = {};
  __export(import_stryker_ibed_exports, {
    default: () => import_stryker_ibed_default
  });
  var PLACE = (w, h, t) => `https://placehold.co/${w}x${h}/eeeeee/333333?text=${encodeURIComponent(t)}`;
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
  var import_stryker_ibed_default = {
    transform: ({ document }) => {
      const main = document.createElement("div");
      const childBlock = (name, cells) => WebImporter.Blocks.createBlock(document, { name, cells });
      const blockNames = [];
      const MEDIA = "https://media-assets.stryker.com/is/image/stryker";
      const RES = "https://www.stryker.com/content/dam/stryker/acute-care/products/ibedwireless/resources";
      main.append(WebImporter.Blocks.createBlock(document, {
        name: "home-hero-stryker",
        cells: [
          ["Acute Care"],
          ["Connected solutions"],
          ["Bringing people and information together for enhanced patient care."],
          [anchor(document, "/stryker/home", "Contact an expert")],
          ["Contact an expert"],
          [img(document, `${MEDIA}/nurse-arms-crossed_prime-conect_procuity-bed_1920x640?$max_width_1440$`, "Nurse standing with hospital beds")]
        ]
      }));
      blockNames.push("home-hero-stryker");
      main.append(document.createElement("hr"));
      main.append(el(document, "h2", "Innovation that empowers outcomes"));
      main.append(el(document, "p", "With nurses caring for more patients than ever before, the demands upon them have only increased. We offer caregivers connected and confident care at their fingertips."));
      main.append(el(document, "p", "Available with Stryker's Prime Connect stretchers, ProCuity bed series, S3 MedSurg and InTouch Critical Care beds, our connected solutions are compatible with most healthcare information management systems, allowing your facility to build a custom end solution. Our connected solutions were designed to help support patient fall prevention protocols, simplify workflows and enhance patient safety. At the heart of our system is iBed Wireless\u2014the enabling technology that allows us to bring these solutions to your healthcare facility."));
      const featCard = (slug, title, body) => [
        img(document, `${MEDIA}/${slug}?$max_width_1440$`, title),
        "",
        anchor(document, "#", title),
        el(document, "div", `<p><strong>${title}</strong></p><p>${body}</p>`)
      ];
      main.append(WebImporter.Blocks.createBlock(document, {
        name: "cards-stryker",
        cells: [
          [""],
          ["3"],
          ["product"],
          featCard("reduce-risk_icon_440x220", "Focus on patient safety", "Take a proactive approach to help prevent patient injuries, such as falls. With bed alarm notifications and an enhanced ability to monitor risk, our system can assist your hospital staff respond to patient safety risks quickly."),
          featCard("simplify-workflow_icon_440x220", "Simplify workflows", "With our connected solutions in your hospital, caregivers can access data-driven insights that aid in effective clinical decision-making, and help improve processes related to patient care protocols, asset management and asset maintenance."),
          featCard("Integrate_your_systems_icon_440x220", "Integrate your systems", "Stryker's connected products are an open-architecture and adaptable solution that can work with dozens of third-party systems. Protect and enhance your hospital's investments by sharing and coordinating data across various electronic health records (EHR), nurse call systems, communication devices and applications.")
        ]
      }));
      blockNames.push("cards-stryker");
      const featureBlock = (slug, alt, heading, paras, layout) => {
        main.append(document.createElement("hr"));
        main.append(WebImporter.Blocks.createBlock(document, {
          name: "text-and-media-stryker",
          cells: [
            [img(document, `${MEDIA}/${slug}?$max_width_1440$`, alt)],
            [""],
            [""],
            [heading],
            [el(document, "div", paras.map((p) => `<p>${p}</p>`).join(""))],
            ["basic"],
            [layout]
          ]
        }));
        blockNames.push("text-and-media-stryker");
      };
      featureBlock("ibed-vision-doc-viewing-dashboard", "Stryker's Vision dashboard", "Vision", [
        "Vision is a protocol management dashboard that gives caregivers visibility to safe hospital bed and stretcher configuration compliance and bed exit alarm activity.",
        "It takes fall risk data pulled directly from a patient's EHR and associates it with appropriate fall prevention protocols, set by HCPs, to help provide a safer patient experience and an easier workflow for caregivers."
      ], "media-left");
      featureBlock("sem-tech-at-desk", "Smart Equipment Management", "Smart Equipment Management (SEM)", [
        "SEM is a cloud-based application available for hospitals who are looking to gather near real-time data from their Stryker connected beds and stretchers. With SEM, you will be able to remotely identify the bed and stretcher's location, serial number, operational status, preventive maintenance, error codes and more.",
        "This intuitive application is compatible with computers, tablets and mobile phones, allowing you flexibility to remotely evaluate your equipment."
      ], "media-right");
      featureBlock("Secure_Connect", "Secure Connect wireless", "Secure Connect", [
        "With Secure Connect, there's no need to constantly plug and unplug nurse call cables from the wall into the bed. Designed to help reduce errors and improve efficiency, Secure Connect provides 99.99% reliability for crucial patient safety information such as bed exit alarms to be transmitted to your facility's nurse call system."
      ], "media-left");
      main.append(document.createElement("hr"));
      main.append(WebImporter.Blocks.createBlock(document, {
        name: "section-banner-stryker",
        cells: [[el(document, "div", "<p>Interested in learning more? <strong>Talk to a rep today.</strong></p>")]]
      }));
      blockNames.push("section-banner-stryker");
      main.append(document.createElement("hr"));
      const docCard = (title, thumb) => [
        img(document, thumb, title),
        "Download",
        anchor(document, "/stryker/home", "Download"),
        el(document, "div", `<p>${title}</p>`)
      ];
      const productInfoCards = childBlock("cards-stryker", [
        [""],
        ["3"],
        ["default"],
        docCard("Connected Solutions Beds Brochure Web.pdf", `${RES}/Connected%20Solutions%20Beds%20Brochure%20Web.pdf.thumb.319.319.png`),
        docCard("Connected Solutions Stretcher Brochure Web.pdf", `${RES}/Connected%20Solutions%20Stretcher%20Brochure%20Web.pdf.thumb.319.319.png`),
        docCard("iBed Wireless Spec Sheet", `${RES}/iBed%20Wireless_SS_Mkt%20Lit-1371%20Rev%20C.pdf.thumb.319.319.png`)
      ]);
      const tabProductInfo = childBlock("tabbed-content-tab-stryker", [["Product Information"], [productInfoCards]]);
      const relatedCard = (title, sub) => [
        img(document, PLACE(400, 300, title), title),
        "Learn More",
        anchor(document, "/stryker/home", "Learn More"),
        el(document, "div", `<p>${title}</p><p>${sub}</p>`)
      ];
      const relatedCards = childBlock("cards-stryker", [
        [""],
        ["3"],
        ["default"],
        relatedCard("ProCuity LE(X) / Z(X)", "For an enhanced MedSurg experience"),
        relatedCard("S3", "Safe. Simple. Secure."),
        relatedCard("InTouch", "Basic needs. Simplified care. Exceptional outcomes.")
      ]);
      const tabRelated = childBlock("tabbed-content-tab-stryker", [["Related Products"], [relatedCards]]);
      const v1 = childBlock("video-stryker", [
        [anchor(document, "https://youtu.be/kRIuiIy_SCs", "https://youtu.be/kRIuiIy_SCs")],
        [img(document, PLACE(800, 450, "NW15"), "NW15 video")]
      ]);
      const v2 = childBlock("video-stryker", [
        [anchor(document, "https://youtu.be/kRIuiIy_SCs", "https://youtu.be/kRIuiIy_SCs")],
        [img(document, PLACE(800, 450, "iBed Vision"), "iBed Vision video")]
      ]);
      const tabVideos = childBlock("tabbed-content-tab-stryker", [["Videos"], [v1], [v2]]);
      main.append(childBlock("tabbed-content-stryker", [
        [tabProductInfo],
        [tabRelated],
        [tabVideos]
      ]));
      blockNames.push("tabbed-content-stryker");
      main.append(document.createElement("hr"));
      const promoCard = (slug, alt, title, body) => [
        img(document, `${MEDIA}/${slug}`, alt),
        "",
        anchor(document, "/stryker/home", title),
        el(document, "div", `<p><strong>${title}</strong></p><p>${body}</p>`)
      ];
      main.append(WebImporter.Blocks.createBlock(document, {
        name: "cards-stryker",
        cells: [
          [""],
          ["3"],
          ["default"],
          promoCard("ProCare?$preset_666_392$", "ProCare for acute care", "ProCare Services", "Our expert medical device technicians help ensure your equipment is ready to perform when you need it. With preventive maintenance plans and tailored service support, we help you maximize the life of your equipment\u2014and your investment."),
          promoCard("flex-financial-2550x750?$max_width_1440$", "Flex Financial", "Power to purchase", "Through our Flex Financial business we can help you acquire our full portfolio of products and offer numerous payment structures that can be customized to meet your budgetary needs.")
        ]
      }));
      blockNames.push("cards-stryker");
      main.append(document.createElement("hr"));
      main.append(WebImporter.Blocks.createBlock(document, {
        name: "legal-text-stryker",
        cells: [[el(document, "div", "<p>1. The features listed are only available when iBed Wireless is integrated with third party systems that bring data to EHRs, Handheld devices, Alert Management Systems, Nurse Call, or Asset Management Systems.</p><p>2. As outlined in the IFU, 99.99% efficiency is based on a 10 second time frame, as indicated with UL compliance.</p>")]]
      }));
      blockNames.push("legal-text-stryker");
      main.append(document.createElement("hr"));
      main.append(WebImporter.Blocks.createBlock(document, {
        name: "metadata",
        cells: {
          Title: "iBed Wireless | Acute Care | Stryker",
          theme: "stryker",
          nav: "/content/stryker/nav",
          footer: "/content/stryker/footer"
        }
      }));
      return [{
        element: main,
        path: "/stryker/ibed-wireless",
        report: { title: "iBed Wireless", template: "stryker-ibed", blocks: blockNames }
      }];
    }
  };
  return __toCommonJS(import_stryker_ibed_exports);
})();
