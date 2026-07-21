# Draco — Enterprise Loyalty Solutions

Static website for **Draco**, an Enterprise Loyalty Solutions Partner under Lumivox Ads.

> *Creating Meaningful Connections That Inspire Loyalty.*

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Scroll-driven hero featuring a 240-frame Earth sequence and vector globe |
| About | `about.html` | Full brand story and capabilities |
| Contact | `contact.html` | Team contacts and inquiry paths |
| Redirect | `index-loop.html` | A `noindex` stub kept alive for an ongoing client review |

## Quick Start

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

There is **no build step**, package manager, or compile step. The site is served entirely as static files.

## Architecture & Assets

### The Cunnet-derived Theme
The site's styling is derived from the "Cunnet" dark-and-gold theme. Shared styles and custom properties (CSS variables for colors, spacing, etc.) live in `assets/site.css`. 
The visual identity is primarily navy (`#0B1D3A`) and gold (`#C9A227`).

### Scroll Choreography
The home page features a scroll-driven experience orchestrated by `assets/earth-scroll.js`. It uses a 240-frame Earth sequence located in `assets/earth-frames/dark/`.

The scroll journey has three distinct steps:
1. **Headline:** The introductory hero text.
2. **Quote CTA:** A bold quote encouraging the user to engage.
3. **Vector Globe:** The globe rendering and regional data cards.

The scroll progress thresholds that govern when each step activates or fades are defined in `assets/earth-scroll.js`.

### Vector Globe
The interactive globe is driven by `assets/verticals-globe.js`. It utilizes vendored dependencies (D3 and TopoJSON) located in `assets/vendor/` (`d3-geo.min.js`, `d3-array.min.js`, `topojson-client.min.js`, and `countries-110m.json`).

*Note:* The region data displayed in the globe's glass cards is currently placeholder content awaiting client sign-off.

### Contact Rail
A floating contact rail allows users to quickly reach out. Its logic is handled in `assets/site.js` and styling in `assets/site.css`.

## Configuration & Contact Info
Phone numbers, emails, and brand details for the contact elements and footer:
- **WhatsApp:** +971 50 450 1195
- **Primary Contact:** Rajesh Rishi (rajesh.rishi@draco.ae)
- **BD Contact:** Akshay Manikantan (akshay.manikantan@draco.ae)
