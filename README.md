# Draco — Enterprise Loyalty Solutions

Static website for **Draco**, an Enterprise Loyalty Solutions Partner under Lumivox Ads.

> *Creating Meaningful Connections That Inspire Loyalty.*

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Scroll-driven hero with 5 content panels |
| About | `about.html` | Full brand story and capabilities |
| Contact | `contact.html` | Team contacts and WhatsApp CTA |

## Quick Start

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

No build tools required — deploy as-is to GitHub Pages, Netlify, or any static host.

## Asset Drop-In

### Logo

```
assets/logo/logo.jpg       — primary nav
assets/logo/logo-alt.jpg   — alternate
```

If the image fails to load, the nav falls back to the text **DRACO**.

### Scroll Hero Frames

Add frame sequence images to:

```
assets/frames/frame_0001.webp
assets/frames/frame_0002.webp
...
```

Then update `FRAME_CONFIG.count` in `js/scroll-hero.js`:

```javascript
const FRAME_CONFIG = {
  path: 'assets/frames/frame_',
  extension: '.webp',
  padLength: 4,
  count: 120  // set to your total frame count
};
```

Until frames are added (`count: 0`), the home hero uses a navy gradient background with subtle parallax.

### Social Links

Update URLs in `SITE_CONFIG` at the top of `js/main.js`:

```javascript
social: {
  instagram: 'https://instagram.com/your-handle',
  linkedin: 'https://linkedin.com/company/your-company'
}
```

## Configuration

All site-wide settings live in `js/main.js`:

```javascript
const SITE_CONFIG = {
  logo: 'assets/logo/logo.jpg',
  logoAlt: 'assets/logo/logo-alt.jpg',
  social: { instagram: '#', linkedin: '#' },
  whatsapp: '971504501195',
  contacts: [
    { name: 'Rajesh Rishi', role: 'Primary Contact', phone: '+971504501195', email: 'rajesh.rishi@draco.ae' },
    { name: 'Akshay Manikantan', role: 'Business Development', phone: '+971506748498', email: 'akshay.manikantan@draco.ae' }
  ]
};
```

## Project Structure

```
Draco/
├── index.html
├── about.html
├── contact.html
├── css/
│   ├── base.css
│   ├── home.css
│   └── pages.css
├── js/
│   ├── main.js
│   └── scroll-hero.js
└── assets/
    ├── logo/
    ├── frames/
    └── icons/
```

## Design

- **Primary:** `#0B1D3A` (deep navy)
- **Accent:** `#C9A227` (gold)
- **Font:** Inter (Google Fonts)
