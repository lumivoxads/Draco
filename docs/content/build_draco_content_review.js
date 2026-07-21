const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, TabStopType, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, ExternalHyperlink,
} = require("docx");

// ============================================================================
//  DRACO — WEBSITE CONTENT REVIEW DOCUMENT  (Lumivox letterhead)
//    NODE_PATH=$(npm root -g) node build_draco_content_review.js
//    soffice --headless --convert-to pdf "<output>.docx"
//  Runs from 02 Proposals/[Client Name]/ (two levels below project root,
//  so the shared logo path resolves).
// ============================================================================
const CONFIG = {
  client: { name: "[Client Name]", brand: "Draco", descriptor: "Enterprise Loyalty Solutions Partner" },
  date: "15 JULY 2026",
  urls: [
    ["Homepage — Loop version", "https://lumivoxads.github.io/Draco/index-loop.html"],
    ["Homepage — Scroll version", "https://lumivoxads.github.io/Draco/index.html"],
    ["About", "https://lumivoxads.github.io/Draco/about.html"],
    ["Contact", "https://lumivoxads.github.io/Draco/contact.html"],
  ],
};
const OUTPUT = "Draco Website Content Review.docx";

// ---- Brand palette (Lumivox) ----
const BLUE = "2E96C4", TEAL = "3DA8D3", GREEN = "2FAF5C", INK = "222222",
  GREY = "6B7280", LINE = "D7DEE3", PALE = "EAF6EF", PALEHEAD = "EAF4F9", ZEBRA = "F5F8FA";

const CONTENT_W = 9360;
const COL = { loc: 1900, cur: 4860, chg: 2600 }; // = 9360
// Absolute path to the shared Lumivox wordmark so this builds from anywhere (e.g. the Draco repo).
const LOGO_PATH = "/Users/xcalider/Documents/Projects/Lumivox/Lumivox_admin/03 Brand Assets/Lumivox Logo (wordmark).png";
const logo = fs.readFileSync(LOGO_PATH);

// ---- helpers ----
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const cellBorders = { top: border, bottom: border, left: border, right: border };

function H(text, color = BLUE) {
  return new Paragraph({
    spacing: { before: 320, after: 140 }, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 30, color, font: "Calibri" })],
  });
}
function subHead(text) {
  return new Paragraph({
    spacing: { before: 160, after: 80 }, keepNext: true,
    children: [new TextRun({ text, bold: true, size: 23, color: INK })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 }, alignment: opts.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
    children: [new TextRun({ text, size: 21, color: opts.grey ? GREY : INK, italics: !!opts.italic })],
  });
}
function cell(width, runs, opts = {}) {
  return new TableCell({
    borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 }, verticalAlign: VerticalAlign.CENTER,
    children: Array.isArray(runs) ? runs : [new Paragraph({ spacing: { after: 0 }, children: runs ? [runs] : [] })],
  });
}
function txt(text, opts = {}) {
  return new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, size: opts.size || 20, bold: !!opts.bold, italics: !!opts.italic, color: opts.color || INK })] });
}

// Review table: header + rows of [location, currentCopy]; 3rd column left blank for the client.
function reviewHeaderRow() {
  return new TableRow({ tableHeader: true, children: [
    cell(COL.loc, [txt("Location", { bold: true, color: "FFFFFF" })], { fill: TEAL }),
    cell(COL.cur, [txt("Current copy", { bold: true, color: "FFFFFF" })], { fill: TEAL }),
    cell(COL.chg, [txt("Your changes", { bold: true, color: "FFFFFF" })], { fill: TEAL }),
  ] });
}
function reviewRow(location, current, idx) {
  const fill = idx % 2 ? ZEBRA : "FFFFFF";
  return new TableRow({ children: [
    cell(COL.loc, [txt(location, { bold: true, size: 19 })], { fill }),
    cell(COL.cur, [txt(current, { size: 20 })], { fill }),
    cell(COL.chg, null, { fill }),
  ] });
}
function reviewTable(rows) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [COL.loc, COL.cur, COL.chg],
    rows: [reviewHeaderRow(), ...rows.map((r, i) => reviewRow(r[0], r[1], i))],
  });
}

// Blank fill-in table (Verticals & Geographies) — client completes.
function fillInTable(headers, blankRows) {
  const w = [4680, 4680];
  const head = new TableRow({ tableHeader: true, children: headers.map(h =>
    cell(w[0], [txt(h, { bold: true, color: "FFFFFF" })], { fill: TEAL })) });
  const rows = [];
  for (let i = 0; i < blankRows; i++) {
    const fill = i % 2 ? ZEBRA : "FFFFFF";
    rows.push(new TableRow({ children: [cell(w[0], null, { fill }), cell(w[1], null, { fill })] }));
  }
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w, rows: [head, ...rows] });
}

const gap = (after = 160) => new Paragraph({ spacing: { after }, children: [] });

// ============================ CONTENT ============================
const GLOBAL = [
  ["Navigation", "Home · About · Contact"],
  ["Header button", "Get in touch"],
  ["Footer tagline", "Enterprise loyalty solutions partner — turning customer engagement into lasting business value."],
  ["Footer — Navigate", "Home · About · Contact"],
  ["Footer — Connect", "LinkedIn"],
  ["Contact — Email", "Rajesh.Rishi@Draco.ae"],
  ["Contact — WhatsApp", "+971 50 450 1195"],
  ["Contact — LinkedIn", "linkedin.com/in/rajeshrishi"],
];

const HOME = [
  ["Hero eyebrow", "Enterprise Loyalty Partner"],
  ["Hero headline", "Enterprise Loyalty, Engineered."],
  ["Hero note", "For the world's most customer-obsessed brands."],
  ["Hero lead", "Draco designs and delivers the loyalty ecosystems that turn everyday customer engagement into lasting business value."],
  ["Primary button", "Start a conversation"],
  ["Secondary link", "Why Draco"],
  ["Quote", "“When setting out on a journey, do not seek advice from someone who has never left home” — Rumi"],
  ["Closing eyebrow (scroll version)", "Creating meaningful connections that inspire loyalty"],
  ["Closing headline (scroll version)", "Let's build loyalty worth keeping."],
  ["Footer essence line (loop version)", "Creating meaningful connections that inspire loyalty"],
];

const ABOUT_HERO = [
  ["Hero eyebrow", "About Draco"],
  ["Hero headline", "Your strategic loyalty partner"],
  ["Hero lead", "Draco is an enterprise loyalty solutions partner dedicated to helping businesses build stronger, more meaningful relationships with their customers — combining engagement strategy, rewards ecosystems and loyalty initiatives that improve retention and create lasting value."],
];
const ABOUT_WHO = [
  ["Eyebrow", "Who we are"],
  ["Heading", "Retention over acquisition."],
  ["Paragraph 1", "Draco partners with organisations that believe customer loyalty is a strategic business asset. Our focus is on creating engagement-driven experiences that encourage repeat interactions, build trust and support sustainable growth across diverse industries."],
  ["Paragraph 2", "Customer acquisition is becoming increasingly expensive, making retention more valuable than ever. Draco helps organisations create loyalty ecosystems that encourage long-term relationships instead of one-time transactions — every engagement aligned to measurable outcomes."],
];
const ABOUT_VM = [
  ["Eyebrow", "Where we're headed"],
  ["Heading", "Vision & mission"],
  ["Vision", "To become the trusted enterprise loyalty solutions partner for businesses seeking to build stronger customer relationships through innovative engagement strategies and exceptional customer experiences."],
  ["Mission", "To empower organisations with intelligent loyalty solutions that inspire customer engagement, strengthen brand loyalty and create sustainable business growth through meaningful customer relationships."],
];
const ABOUT_CAPS = [
  ["Section heading", "Comprehensive loyalty capabilities"],
  ["Section intro", "Draco designs and delivers customer loyalty ecosystems tailored to the unique goals of every organisation."],
  ["01 Enterprise Loyalty Programs", "Full-lifecycle loyalty programs engineered for scale — from strategy through launch and optimisation."],
  ["02 Customer Engagement", "Data-informed engagement models that turn passive customers into active, repeat advocates."],
  ["03 Membership & Privilege", "Tiered memberships and privilege schemes that recognise and reward your most valuable customers."],
  ["04 Rewards & Recognition", "Reward ecosystems that make every interaction feel earned, worthwhile and worth returning for."],
  ["05 Referral & Advocacy", "Programs that turn satisfied customers into a measurable, compounding growth channel."],
  ["06 Campaign Management", "End-to-end campaign design and execution, aligned to clear business objectives."],
  ["07 Performance Insights", "Analytics and reporting that connect loyalty activity directly to business outcomes."],
  ["08 Loyalty Consulting", "Strategic guidance to help you build the right loyalty model from the ground up."],
];
const ABOUT_VALUES = [
  ["Customer First", "Every decision starts with the customer's experience and their long-term value."],
  ["Innovation", "We bring fresh, intelligent engagement models to every partnership."],
  ["Trust", "Relationships built on transparency, reliability and measurable results."],
  ["Excellence", "We hold our work to an enterprise standard, end to end."],
  ["Growth", "We build for sustainable, long-term business value — not one-time wins."],
];
const ABOUT_INDUSTRIES = [
  ["Industries (chips)", "Retail · Hospitality · Restaurants & Cafés · Fuel & Energy · Healthcare · Automotive · Banking & Financial Services · Telecommunications · Entertainment · E-Commerce · Lifestyle · Enterprise Organisations"],
];
const ABOUT_FAQ = [
  ["Q — What is Draco?", "Draco is an enterprise loyalty solutions partner. We design and deliver loyalty ecosystems — loyalty programs, memberships, rewards and engagement campaigns — that help organisations improve customer retention, strengthen brand loyalty and create long-term business value."],
  ["Q — What services does Draco offer?", "Draco builds customer loyalty end to end: enterprise loyalty programs, customer engagement strategies, membership and privilege programs, rewards and recognition, referral and advocacy programs, campaign management, performance insights, and loyalty consulting."],
  ["Q — Which industries does Draco serve?", "Draco works across retail, hospitality, restaurants and cafés, fuel and energy, healthcare, automotive, banking and financial services, telecommunications, entertainment, e-commerce, lifestyle, and enterprise organisations."],
  ["Q — How is Draco different from a rewards platform?", "Draco is a strategic partner, not a self-serve tool. We focus on loyalty ecosystems and long-term customer relationships aligned to measurable business outcomes — combining strategy, engagement models and analytics — rather than one-time transactions."],
  ["Q — How do I start working with Draco?", "Get in touch through our contact page. We'll assess your goals and design a loyalty model suited to your customers."],
  ["Q — Where is Draco based?", "Draco is remote-first and partners with brands worldwide."],
];
const ABOUT_CTA = [
  ["Headline", "Let's build loyalty worth keeping."],
  ["Sub-line", "Creating meaningful connections that inspire loyalty — for the world's most customer-obsessed brands."],
  ["Button", "Start a conversation"],
];

const CONTACT_HERO = [
  ["Hero eyebrow", "Contact"],
  ["Hero headline", "Let's start a conversation."],
  ["Hero lead", "Tell us about your customers and your goals. We'll show you how a Draco loyalty ecosystem can turn everyday engagement into lasting business value."],
];
const CONTACT_DETAILS = [
  ["Email us", "Rajesh.Rishi@Draco.ae — We reply within one business day."],
  ["WhatsApp", "+971 50 450 1195 — Message us anytime"],
];
const CONTACT_FORM = [
  ["Field label", "Full name"],
  ["Field label", "Work email"],
  ["Field label", "Company"],
  ["Field label", "Industry"],
  ["Field label", "How can we help?"],
  ["Submit button", "Send message"],
  ["Form note", "Opens your email app with this message addressed to Rajesh.Rishi@Draco.ae."],
  ["Confirmation", "Opening your email app — send the draft to finish."],
];

const SEO = [
  ["Home — Title", "Draco — Enterprise Loyalty Solutions Partner"],
  ["Home — Description", "Draco designs and delivers the loyalty ecosystems that turn everyday customer engagement into lasting business value."],
  ["About — Title", "About — Draco · Enterprise Loyalty Solutions Partner"],
  ["About — Description", "Draco is an enterprise loyalty solutions partner helping organisations build loyalty ecosystems that improve retention, strengthen brand loyalty and create long-term business value."],
  ["Contact — Title", "Contact — Draco · Enterprise Loyalty Solutions Partner"],
  ["Contact — Description", "Start a conversation with Draco — the enterprise loyalty solutions partner helping brands turn customer engagement into lasting business value."],
];

// ---- Header & Footer (Lumivox letterhead) ----
const header = new Header({
  children: [
    new Paragraph({
      spacing: { after: 0 }, tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
      children: [
        new ImageRun({ type: "png", data: logo, transformation: { width: 150, height: 29 }, altText: { title: "Lumivox", description: "Lumivox logo", name: "logo" } }),
        new TextRun({ text: "\tDATE: ", bold: true, size: 18, color: GREY }),
        new TextRun({ text: CONFIG.date, bold: true, size: 18, color: INK }),
      ],
    }),
    new Paragraph({ spacing: { after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 6 } }, children: [] }),
  ],
});
const footer = new Footer({
  children: [new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } }, spacing: { before: 60 },
    tabStops: [{ type: TabStopType.CENTER, position: CONTENT_W / 2 }, { type: TabStopType.RIGHT, position: CONTENT_W }],
    children: [
      new TextRun({ text: "Lumivox", bold: true, size: 16, color: BLUE }),
      new TextRun({ text: "\t+91 70128 81387", size: 16, color: GREY }),
      new TextRun({ text: "\tPage ", size: 16, color: GREY }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY }),
    ],
  })],
});

// Live-URLs box on the cover
const urlBox = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
  rows: [new TableRow({ children: [new TableCell({
    borders: { left: { style: BorderStyle.SINGLE, size: 24, color: BLUE }, top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill: PALEHEAD, type: ShadingType.CLEAR }, margins: { top: 140, bottom: 140, left: 200, right: 160 },
    children: [
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "VIEW THE LIVE SITE", size: 16, bold: true, color: BLUE, characterSpacing: 40 })] }),
      ...CONFIG.urls.map(u => new Paragraph({ spacing: { after: 40 }, children: [
        new TextRun({ text: `${u[0]}:  `, size: 19, bold: true, color: INK }),
        new ExternalHyperlink({ link: u[1], children: [new TextRun({ text: u[1], size: 19, color: BLUE, underline: {} })] }),
      ] })),
    ],
  })] })],
});

// ---- Document ----
const doc = new Document({
  creator: "Lumivox",
  title: "Draco — Website Content for Review",
  styles: { default: { document: { run: { font: "Calibri", size: 21, color: INK } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1600, right: 1440, bottom: 1300, left: 1440, header: 720, footer: 600 } } },
    headers: { default: header }, footers: { default: footer },
    children: [
      // Cover
      new Paragraph({ spacing: { before: 120, after: 0 }, children: [new TextRun({ text: "WEBSITE CONTENT", size: 20, bold: true, color: GREEN, characterSpacing: 80 })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Draco — Website Content for Review", size: 34, bold: true, color: INK })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "All copy currently live on the site, laid out page by page for your review", size: 22, color: BLUE, italics: true })] }),
      // Prepared for
      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
        rows: [new TableRow({ children: [new TableCell({
          borders: { left: { style: BorderStyle.SINGLE, size: 24, color: GREEN }, top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill: "F4FAF6", type: ShadingType.CLEAR }, margins: { top: 130, bottom: 130, left: 200, right: 160 },
          children: [
            new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: "PREPARED FOR", size: 16, bold: true, color: GREEN, characterSpacing: 40 })] }),
            new Paragraph({ spacing: { after: 0 }, children: [
              new TextRun({ text: CONFIG.client.name, bold: true, size: 26, color: INK }),
              new TextRun({ text: `  —  ${CONFIG.client.brand} · ${CONFIG.client.descriptor}`, size: 20, color: GREY }),
            ] }),
          ],
        })] })],
      }),
      gap(140),
      urlBox,
      gap(120),
      // How to use
      H("How to use this document"),
      body("This document lists every piece of text currently live on the Draco website, organised page by page. Each section is a table with three columns: where the text appears, the current copy, and a blank column for your changes.", { justify: true }),
      body("To request an edit, write your revised wording in the “Your changes” column next to the relevant line (or add a comment). Anything left blank will be treated as approved as-is. The Verticals & Geographies table is empty for you to complete — please add the client verticals and regions you'd like represented (no client names required; a descriptive vertical and region for each is enough).", { justify: true }),

      // GLOBAL
      new Paragraph({ pageBreakBefore: true, children: [] }),
      H("Global elements (all pages)"),
      body("These appear on every page — navigation, buttons, footer and contact details.", { grey: true }),
      reviewTable(GLOBAL),

      // HOME
      new Paragraph({ pageBreakBefore: true, children: [] }),
      H("Page 1 — Home"),
      body("The homepage has two versions under review (Loop and Scroll). The copy below is shared by both; the closing panel appears only on the Scroll version and the footer essence line only on the Loop version.", { grey: true }),
      reviewTable(HOME),

      // ABOUT
      new Paragraph({ pageBreakBefore: true, children: [] }),
      H("Page 2 — About"),
      subHead("Hero"),
      reviewTable(ABOUT_HERO),
      subHead("Who we are"),
      reviewTable(ABOUT_WHO),
      subHead("Vision & mission"),
      reviewTable(ABOUT_VM),
      subHead("Comprehensive loyalty capabilities"),
      reviewTable(ABOUT_CAPS),
      subHead("Core values"),
      reviewTable(ABOUT_VALUES),
      subHead("Industries we serve"),
      reviewTable(ABOUT_INDUSTRIES),
      subHead("Verticals & geographies  (please complete)"),
      body("Add the client verticals and the regions you'd like represented. No client names are required — a descriptive vertical (e.g. “Retail & Grocery”) and region (e.g. “UAE”) for each row is enough. Add or remove rows as needed.", { grey: true }),
      fillInTable(["Vertical", "Region"], 8),
      subHead("Frequently asked (FAQ)"),
      reviewTable(ABOUT_FAQ),
      subHead("Closing call-to-action band"),
      reviewTable(ABOUT_CTA),

      // CONTACT
      new Paragraph({ pageBreakBefore: true, children: [] }),
      H("Page 3 — Contact"),
      subHead("Hero"),
      reviewTable(CONTACT_HERO),
      subHead("Contact details"),
      reviewTable(CONTACT_DETAILS),
      subHead("Enquiry form"),
      reviewTable(CONTACT_FORM),

      // SEO
      new Paragraph({ pageBreakBefore: true, children: [] }),
      H("Appendix — Search / SEO copy"),
      body("These titles and descriptions are what appears in Google search results and when the site is shared as a link. Optional to review.", { grey: true }),
      reviewTable(SEO),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(path.join(__dirname, OUTPUT), buf);
  console.log("Wrote", OUTPUT, `(${buf.length} bytes)`);
});
