# Draco — Design Direction & Lovable Brief

*A futuristic, minimal, cinematic redesign of the Draco marketing site. Prepared for generating a reference design in Lovable, which will then be converted to static HTML/CSS/JS.*

---

## Locked decisions

| Decision | Choice |
|----------|--------|
| Palette | **Futuristic ice-blue** (dark) |
| Typography | **Editorial-luxe** — Playfair Display (headlines) + Jost (body/UI) |
| Homepage | **Cinematic scroll-story hero** — one fixed hero, 5 text beats, no traditional stacked sections |
| Hero animation | **Scroll-scrubbed cinematic video** (Apple product-page style). Final video supplied later; placeholder for now |
| Hero copy | **Enterprise-loyalty beats** (from the brand profile) |
| Navigation | Home · About · Contact |
| About page | Full brand story from `Draco_Brand_Profile_Expanded_Lumivox.pdf` |
| Contact page | Existing contacts + WhatsApp + socials, kept |
| Final build | Static HTML5 / vanilla CSS / vanilla JS (no framework) |

## Design tokens

```css
:root {
  /* Backgrounds (deep space, near-black) */
  --bg-deep:      #05060A;   /* page base / deepest */
  --bg-base:      #080B14;
  --bg-elevated:  #0E1422;   /* cards, panels */
  --surface:      rgba(255,255,255,0.04);  /* glass fill */
  --border:       rgba(122,162,255,0.14);  /* cool hairline */

  /* Text */
  --text:         #EAF2FF;   /* primary */
  --text-muted:   #8FA3C0;   /* secondary */
  --text-dim:     #5A6C86;   /* tertiary / muted labels */

  /* Accents (ice / electric blue) */
  --accent:       #4FD8FF;   /* primary cyan */
  --accent-2:     #7AA2FF;   /* azure / periwinkle */
  --accent-glow:  rgba(79,216,255,0.22);
  --gold:         #C9A227;   /* heritage nod ONLY — use <5%, hairline accents */

  /* Radii — sharp/futuristic */
  --radius-btn:   3px;
  --radius-card:  14px;

  --easing:       cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Typography

- **Headlines / display:** Playfair Display (500, 600). Use *italic* for the emphasis word (e.g. *Loyalty*).
  - Alternative for a sharper, more fashion-futuristic edge: **Bodoni Moda**. For a heavier "Star Wars punch": increase weight/size, keep serif.
- **Body / UI / labels:** Jost (300, 400, 500).
- **Eyebrows / labels / buttons:** Jost, uppercase, letter-spacing ~0.3em, 11–13px.
- Scale: eyebrow 12px · H1 `clamp(40px,6vw,76px)` · H2 `clamp(28px,4vw,52px)` · body 16–17px / line-height 1.65.

## Motion principles

- **Hero scroll-scrub:** a tall spacer (~500vh) drives scroll progress 0→1. Progress maps to the hero video's frame / `currentTime`. Scrolling advances the footage; scroll-up reverses it.
- **Beats:** 5 panels, each occupying a 20% scroll band. Transition = crossfade + `translateY(20px→0)`, ~500ms, `--easing`.
- **Ambient:** slow-drifting accent-glow blobs behind content; subtle.
- **Micro-interactions:** 150–300ms, transform/opacity only.
- **Scroll UI:** thin accent progress bar under nav; "Scroll" cue that fades after ~5%; footer reveals at ~98%.
- **Reduced motion:** `prefers-reduced-motion` → stack beats vertically, freeze video on a poster frame, disable scrub.

## Global elements

- **Nav:** fixed, glass (backdrop-blur), cool hairline bottom border. Wordmark **DRACO** in Playfair, letter-spaced (NOT the old harsh italic `DRACO®` logo). Links Home/About/Contact; active link underlined in `--accent`. Hamburger < 768px.
- **Footer:** dark; brand name + tagline "Creating Meaningful Connections That Inspire Loyalty." + "© 2026 Draco · A Lumivox Ads Company" + Instagram/LinkedIn. On Home it reveals at end of scroll.
- **WhatsApp float:** fixed bottom-right green circle, all pages → `https://wa.me/971504501195`.
- **Icons:** monochrome SVG (Lucide/Heroicons style), never emoji.

## Content

### Home — 5 scroll beats
0. Eyebrow **Enterprise Loyalty Solutions Partner** · H1 **Creating Meaningful Connections That Inspire *Loyalty*** · "Draco builds stronger, more meaningful relationships between businesses and their customers through intelligent loyalty ecosystems." · scroll cue
1. Eyebrow **Why Draco** · H2 **Retention Over Acquisition** · "Customer acquisition is becoming increasingly expensive. Draco helps organizations create loyalty ecosystems that encourage long-term relationships instead of one-time transactions."
2. Eyebrow **What We Do** · H2 **Loyalty Ecosystems That Drive Growth** · "We design and deliver loyalty programs, rewards initiatives, membership experiences, engagement campaigns, and retention strategies tailored to your goals."
3. Eyebrow **Our Capabilities** · H2 **End-to-End Loyalty Solutions** · grid: Enterprise Loyalty Programs · Customer Engagement · Membership & Privileges · Rewards & Recognition · Referral & Advocacy · Loyalty Consulting
4. Eyebrow **Get Started** · H2 **Build Lasting Loyalty** · "Partner with Draco to create engagement-driven experiences that strengthen trust and deliver sustainable business growth." · CTAs: *Learn About Us* → about, *Get in Touch* → contact

### About — sections (from brand PDF)
Page hero → Who We Are → Why Draco → Our Story → Vision & Mission (two cards) → Core Values (5 pills: Customer First · Innovation · Trust · Excellence · Growth) → Our Philosophy → What We Do → Our Capabilities (8: Enterprise Loyalty Programs · Customer Engagement Strategies · Membership & Privilege Programs · Rewards & Recognition Solutions · Referral & Advocacy Programs · Campaign Management · Performance Insights · Loyalty Consulting) → Industries We Serve (12 tags: Retail · Hospitality · Restaurants & Cafés · Fuel & Energy · Healthcare · Automotive · Banking & Financial Services · Telecommunications · Entertainment · E-Commerce · Lifestyle · Enterprise Organizations) → Why Businesses Choose Draco → Our Commitment → Brand Essence (closing line).

### Contact
Hero "Let's Build Lasting Loyalty" → intro → two contact cards:
- **Rajesh Rishi** — Primary Contact — +971 50 450 1195 — rajesh.rishi@draco.ae
- **Akshay Manikantan** — Business Development — +971 50 674 8498 — akshay.manikantan@draco.ae

WhatsApp CTA → `wa.me/971504501195`. Social icons: Instagram, LinkedIn (URLs TBD).

### Asset handling
Hero background = full-bleed, scroll-scrubbed cinematic video, color-graded cool to match the ice-blue system, behind a dark gradient veil for legibility. Use a placeholder dark cosmic/particle clip now; final video (frame sequence) is supplied later and swaps in.

---

## The Lovable prompt

See the prompt block delivered alongside this brief (or the chat message). Paste it into Lovable to generate the reference design.
