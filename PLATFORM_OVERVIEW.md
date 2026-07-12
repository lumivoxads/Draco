# Draco — Platform Overview

**Introduction brief for designers and developers**

This document provides a single reference for understanding the Draco marketing website: what the brand represents, how the site is built, and what work remains to complete the experience.

---

## What Is Draco?

**Draco** is an **Enterprise Loyalty Solutions Partner** under **Lumivox Ads**. The company helps businesses build stronger, more meaningful customer relationships through intelligent loyalty ecosystems — programs, rewards, membership experiences, engagement campaigns, and retention strategies.

**Tagline / Brand Essence:**  
*Creating Meaningful Connections That Inspire Loyalty.*

**Parent company:** Lumivox Ads

---

## Brand Foundation

Content across the site is aligned with the Draco Brand Profile (`Draco_Brand_Profile_Expanded_Lumivox.pdf`).

### Brand Essence

Creating meaningful connections that inspire loyalty.

### Mission

To empower organizations with intelligent loyalty solutions that inspire customer engagement, strengthen brand loyalty, and create sustainable business growth through meaningful customer relationships.

### Vision

To become the trusted enterprise loyalty solutions partner for businesses seeking to build stronger customer relationships through innovative engagement strategies and exceptional customer experiences.

### Core Values

| Value | Meaning in practice |
|-------|---------------------|
| **Customer First** | Loyalty strategy starts with the customer experience |
| **Innovation** | Modern engagement models and intelligent solutions |
| **Trust** | Long-term partnerships built on reliability |
| **Excellence** | High standards in delivery and outcomes |
| **Growth** | Sustainable business value for clients and their customers |

### Philosophy

Loyalty is built through meaningful experiences — not rewards alone. Every customer interaction is an opportunity to strengthen trust, encourage advocacy, and create long-term value.

### Positioning Statement

Draco partners with organizations that treat customer loyalty as a strategic business asset, focusing on engagement-driven experiences that encourage repeat interactions and sustainable growth.

---

## Platform Purpose & Target Audience

### Purpose

The Draco website is a **static marketing presence** that:

1. Introduces Draco as an enterprise loyalty solutions partner
2. Communicates brand story, capabilities, and industries served
3. Provides clear contact paths for business inquiries (phone, email, WhatsApp)

### Target Audience

- **Enterprise decision-makers** evaluating loyalty program partners
- **Marketing and customer experience leaders** responsible for retention strategy
- **Business development contacts** across retail, hospitality, F&B, fuel, healthcare, automotive, banking, telecom, entertainment, e-commerce, lifestyle, and large enterprise organizations

The tone is professional, strategic, and trust-oriented — not consumer-facing or promotional in a retail sense.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 |
| Styling | Vanilla CSS (no preprocessor, no framework) |
| Scripting | Vanilla JavaScript (no bundler, no framework) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Build | **None** — open or serve files directly |
| Deployment | Any static host (GitHub Pages, Netlify, Vercel, S3, etc.) |

**Local preview:**

```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

There is no package manager, no compile step, and no component library. All shared behavior is centralized in `js/main.js`; the home scroll experience lives in `js/scroll-hero.js`.

---

## Site Structure

Three pages, linked via a shared fixed navigation:

| Page | File | Stylesheet | Scripts |
|------|------|------------|---------|
| Home | `index.html` | `css/base.css`, `css/home.css` | `js/main.js`, `js/scroll-hero.js` |
| About | `about.html` | `css/base.css`, `css/pages.css` | `js/main.js` |
| Contact | `contact.html` | `css/base.css`, `css/pages.css` | `js/main.js` |

---

## Page Breakdown

### Home (`index.html`)

A single-viewport, **scroll-driven hero experience** with five content panels. The page has no traditional below-the-fold sections — the entire narrative unfolds as the user scrolls through a tall spacer (`500vh`), while the hero stays fixed.

**Five panels** (each occupies 20% of scroll progress):

| Panel | Eyebrow | Headline | Content |
|-------|---------|----------|---------|
| 0 | Enterprise Loyalty Solutions Partner | Creating Meaningful Connections That Inspire Loyalty | Intro subtitle about intelligent loyalty ecosystems |
| 1 | Why Draco | Retention Over Acquisition | Cost of acquisition vs. long-term relationships |
| 2 | What We Do | Loyalty Ecosystems That Drive Growth | Programs, rewards, membership, campaigns, retention |
| 3 | Our Capabilities | End-to-End Loyalty Solutions | 6-item capability grid |
| 4 | Get Started | Build Lasting Loyalty | CTA buttons → About and Contact |

**Home-only UI elements:**

- Scroll progress bar (gold, fixed below nav)
- Scroll indicator (“Scroll” + animated line, fades after 5% progress)
- Footer revealed at ~98% scroll progress (hero fades out)

### About (`about.html`)

Full brand narrative in a conventional scroll layout. Sections:

1. **Page hero** — About Draco headline and intro
2. **Who We Are** — Strategic loyalty partner positioning
3. **Why Draco** — Retention over acquisition
4. **Our Story** — Company origin and evolution
5. **Vision & Mission** — Two side-by-side cards
6. **Core Values** — Five badge pills
7. **Our Philosophy** — Experience-driven loyalty
8. **What We Do** — Comprehensive loyalty solutions overview
9. **Our Capabilities** — 8-item grid (expanded vs. home hero)
10. **Industries We Serve** — 12 industry tags
11. **Why Businesses Choose Draco** — Trust and measurable outcomes
12. **Our Commitment** — Lasting value promise

### Contact (`contact.html`)

Lead-generation focused contact page:

1. **Page hero** — “Let's Build Lasting Loyalty”
2. **Intro copy** — Partnership messaging
3. **Contact cards** — Dynamically rendered from `SITE_CONFIG.contacts` in `js/main.js`
4. **WhatsApp CTA section** — Navy band with WhatsApp button and social icons

---

## Home Page Scroll Hero — How It Works

The scroll hero is the signature interaction on the home page. Understanding it is essential for both design (frame sequence) and development (integration).

### Architecture

```
┌─────────────────────────────────────┐
│  Fixed Nav (z-index 1000)           │
├─────────────────────────────────────┤
│  Scroll Progress Bar                │
├─────────────────────────────────────┤
│                                     │
│  Fixed Hero (100vh)                 │
│  ┌─────────────────────────────┐   │
│  │ Background / Canvas frames   │   │
│  │ Overlay gradient             │   │
│  │ Content panels (5, stacked)  │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Scroll Spacer (500vh)              │  ← drives scroll progress
│                                     │
├─────────────────────────────────────┤
│  Footer (revealed at end)           │
└─────────────────────────────────────┘
```

### Scroll mechanics

1. A `.scroll-spacer` element with `height: 500vh` creates artificial scroll distance.
2. `scroll-hero.js` calculates progress: `scrollY / (spacerHeight - viewportHeight)`, clamped 0–1.
3. At each progress band, a different `.hero__panel` receives `.is-active` (fade/slide transition).
4. A gold progress bar width tracks the same progress value.
5. At ≥98% progress, the hero gets `.is-complete` (fades out) and the footer gets `.is-visible`.

**Panel scroll ranges:**

| Progress | Panel |
|----------|-------|
| 0% – 20% | Panel 0 (intro) |
| 20% – 40% | Panel 1 (why) |
| 40% – 60% | Panel 2 (what we do) |
| 60% – 80% | Panel 3 (capabilities) |
| 80% – 100% | Panel 4 (CTA) |

### Frame animation (pending integration)

`js/scroll-hero.js` supports a **scrubbed image sequence** drawn to a `<canvas>`:

- Frames live at `assets/frames/frame_0001.webp`, `frame_0002.webp`, etc.
- Configured via `FRAME_CONFIG` in `scroll-hero.js`
- Frame index = `floor(progress × frameCount)`
- Images are cover-scaled and drawn with device-pixel-ratio awareness
- Until frames load, a navy gradient background is used with subtle parallax (`translateY`)

**Current state:** `FRAME_CONFIG.count` is `0` and the `assets/frames/` directory is empty. The home page currently uses a CSS gradient via `.hero__background`.

**Developer note:** `scroll-hero.js` expects `.hero__canvas` and `.hero__gradient` elements inside `.hero`. The current `index.html` only has `.hero__background`. To enable frame scrubbing, add a `<canvas class="hero__canvas">` and optionally `.hero__gradient` as a fallback layer inside the hero section (see `css/home.css` for existing styles).

### Reduced motion

When `prefers-reduced-motion: reduce` is set, the scroll engine is bypassed: all panels stack vertically, the spacer is hidden, and the hero becomes a standard static section.

---

## Shared UI Elements

Present on all three pages unless noted.

### Navigation (`.site-nav`)

- Fixed top bar, 72px height
- Semi-transparent navy with backdrop blur
- Logo image + “DRACO” text fallback
- Links: Home, About, Contact (active state applied by `main.js`)
- Mobile hamburger toggle below 768px

### Footer (`.site-footer`)

- Dark navy background
- Brand name, tagline, copyright (“© 2026 Draco · A Lumivox Ads Company”)
- Instagram and LinkedIn icon links (URLs from config)

On the home page, the footer starts hidden and fades in after the scroll journey completes.

### WhatsApp float (`.whatsapp-float`)

- Fixed bottom-right green circle
- Links to `https://wa.me/{number}` from `SITE_CONFIG.whatsapp`
- Present on all pages

### Social icons

- SVG assets in `assets/icons/` (instagram, linkedin, whatsapp)
- Footer and contact page use `data-social="instagram"` / `data-social="linkedin"` attributes
- URLs injected at runtime from `SITE_CONFIG.social`

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--navy` | `#0B1D3A` | Primary brand, headings, nav |
| `--navy-dark` | `#050D1A` | Hero backgrounds, footer |
| `--navy-light` | `#142847` | Depth in gradients |
| `--gold` | `#C9A227` | Accent, eyebrows, CTAs, active states |
| `--gold-light` | `#E0BC4A` | Hover states |
| `--white` | `#FFFFFF` | Text on dark backgrounds |
| `--off-white` | `#F8F9FB` | Page body background (About/Contact) |
| `--gray-100` | `#E8ECF1` | Borders, dividers |
| `--gray-300` | `#A8B4C4` | — |
| `--gray-500` | `#6B7A8D` | Body text on light sections |
| WhatsApp green | `#25D366` | WhatsApp buttons and float |

The visual identity is **navy + gold** — premium, enterprise, trustworthy.

### Typography

- **Font family:** Inter (weights 400, 500, 600, 700)
- **Eyebrows / labels:** 0.75rem, uppercase, wide letter-spacing, gold
- **Hero titles:** `clamp(2rem, 5vw, 3.25rem)`, bold, white
- **Section titles:** `clamp(1.5rem, 3vw, 2rem)`, bold, navy
- **Body:** 16px base, 1.6 line-height

### Components

| Component | Class prefix | Pages |
|-----------|--------------|-------|
| Page hero banner | `.page-hero` | About, Contact |
| Content section | `.page-section` | About, Contact |
| Vision/Mission cards | `.card`, `.card-grid` | About |
| Value badges | `.value-badge` | About |
| Capability tiles | `.capability-item`, `.hero__cap-item` | About, Home |
| Industry tags | `.industry-tag` | About |
| Contact cards | `.contact-card` | Contact (JS-generated) |
| Buttons | `.hero__btn--primary`, `.hero__btn--outline`, `.contact-cta__btn` | Home, Contact |

### Layout

- Max content width: 960px (sections), 1200px (nav/footer)
- Section padding: 4rem vertical (3rem on mobile)
- Alternating white / off-white section backgrounds on About page

---

## Configuration & Contact Info

All site-wide settings live at the top of `js/main.js` in `SITE_CONFIG`:

```javascript
const SITE_CONFIG = {
  logo: 'assets/logo/logo.jpg',
  logoAlt: 'assets/logo/logo-alt.jpg',
  social: {
    instagram: '#',    // ← pending real URL
    linkedin: '#'      // ← pending real URL
  },
  whatsapp: '971504501195',
  contacts: [
    {
      name: 'Rajesh Rishi',
      role: 'Primary Contact',
      phone: '+971504501195',
      email: 'rajesh.rishi@draco.ae',
    },
    {
      name: 'Akshay Manikantan',
      role: 'Business Development',
      phone: '+971506748498',
      email: 'akshay.manikantan@draco.ae',
    },
  ],
};
```

**To update contacts, social links, or WhatsApp:** edit `SITE_CONFIG` only — no HTML changes required for contact cards or link injection.

Phone numbers are auto-formatted for UAE (`+971`) display on contact cards.

---

## Assets — Status & Pending Work

| Asset | Location | Status |
|-------|----------|--------|
| Primary logo | `assets/logo/logo.jpg` | **Done** |
| Alternate logo | `assets/logo/logo-alt.jpg` | **Done** |
| Social icons | `assets/icons/*.svg` | **Done** |
| Scroll hero frames | `assets/frames/frame_XXXX.webp` | **Pending** — directory exists, empty |
| Instagram URL | `SITE_CONFIG.social.instagram` | **Pending** — placeholder `#` |
| LinkedIn URL | `SITE_CONFIG.social.linkedin` | **Pending** — placeholder `#` |

### Adding scroll hero frames

1. Export frame sequence as WebP: `frame_0001.webp`, `frame_0002.webp`, …
2. Place files in `assets/frames/`
3. Set `FRAME_CONFIG.count` in `js/scroll-hero.js` to the total frame count
4. Add `<canvas class="hero__canvas">` to `index.html` inside `.hero` (and optionally `.hero__gradient` for fallback)

Recommended: consistent aspect ratio across all frames; cover-scale behavior is handled in JS.

---

## File Structure

```
Draco/
├── index.html              # Home — scroll hero
├── about.html              # About — full brand story
├── contact.html            # Contact — team cards + WhatsApp
├── README.md               # Developer quick-start
├── PLATFORM_OVERVIEW.md    # This document
├── Draco_Brand_Profile_Expanded_Lumivox.pdf
│
├── css/
│   ├── base.css            # Reset, tokens, nav, footer, WhatsApp float
│   ├── home.css            # Scroll hero, panels, progress, home footer
│   └── pages.css           # About/Contact sections, cards, contact UI
│
├── js/
│   ├── main.js             # SITE_CONFIG, nav, logo, social, WhatsApp, contacts
│   └── scroll-hero.js      # Frame scrubbing, panel switching, scroll UI
│
└── assets/
    ├── logo/
    │   ├── logo.jpg        # Primary (in use)
    │   └── logo-alt.jpg    # Alternate
    ├── frames/             # Empty — awaiting frame sequence
    └── icons/
        ├── instagram.svg
        ├── linkedin.svg
        └── whatsapp.svg
```

---

## What Designers & Developers Need to Know

### For designers

1. **Stay within the navy/gold system** — CSS custom properties in `css/base.css` are the source of truth.
2. **Home is scroll-native** — design the frame sequence as a continuous visual narrative across five story beats; each panel maps to 20% of scroll.
3. **About is content-heavy** — use existing section patterns (`.page-section`, `.card-grid`, `.value-badge`, `.industry-tag`) before inventing new layouts.
4. **Logo is in place** — nav shows `logo.jpg` on a white pill; text “DRACO” appears only if the image fails to load.
5. **Icons are monochrome SVGs** — styled via CSS borders/backgrounds on their link wrappers, not recolored in the SVG itself.
6. **Reference the brand PDF** for copy tone and approved messaging; page content already mirrors it.

### For developers

1. **Single config file** — `SITE_CONFIG` in `js/main.js` drives contacts, social, WhatsApp, and logo paths. Prefer editing config over hardcoding in HTML.
2. **No build step** — test by serving locally; deploy raw files.
3. **Home scroll depends on spacer height** — `500vh` in `home.css` controls journey length; adjust if panels feel too fast or slow.
4. **Frame integration gap** — `scroll-hero.js` is ready but `index.html` lacks the canvas element and frames are not yet dropped in. Gradient fallback works today.
5. **BEM-style class naming** — follow existing patterns (`block__element--modifier`) when adding styles.
6. **Accessibility** — nav toggle has `aria-expanded`; reduced-motion path exists; ensure new animations respect `prefers-reduced-motion`.
7. **Mobile** — nav collapses to hamburger; hero capabilities go 3→2 columns; contact cards get extra right padding to clear WhatsApp float.

### Suggested next steps

- [ ] Deliver and integrate scroll hero frame sequence
- [ ] Add `<canvas class="hero__canvas">` to `index.html`
- [ ] Set real Instagram and LinkedIn URLs in `SITE_CONFIG`
- [ ] Visual QA on mobile scroll experience
- [ ] Deploy to production static host

---

## Quick Reference

| Item | Value |
|------|-------|
| Brand | Draco — Enterprise Loyalty Solutions Partner |
| Parent | Lumivox Ads |
| Tagline | Creating Meaningful Connections That Inspire Loyalty |
| Primary color | `#0B1D3A` (navy) |
| Accent color | `#C9A227` (gold) |
| Font | Inter |
| Pages | 3 (Home, About, Contact) |
| WhatsApp | +971 50 450 1195 |
| Primary contact | Rajesh Rishi — rajesh.rishi@draco.ae |
| BD contact | Akshay Manikantan — akshay.manikantan@draco.ae |

---

*Last updated: July 2026*
