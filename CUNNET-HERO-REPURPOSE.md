# Draco — Cunnet Hero Repurpose (handoff / analysis)

> **Status:** Analysis only — nothing built. This is a pickup note. In a future session, read this file to understand the goal, the template analysis, and the exact plan, then continue. The actual build may happen in a separate project folder the owner sets up; the inputs (frames, brief, moodboard) live here in `Draco/`.

## Goal

Repurpose the Cunnet template page **`portfolio-revealing-slider`** into Draco's homepage hero — **not** as a portfolio slider. Specifically:

- **`index.html` = hero only.** Nothing else on the index page.
- **Remove the portfolio revealing slider.**
- In that "revealing" stage, put Draco's **scroll-scrubbed cinematic video** (the existing `assets/frames/` sequence) + **text** (the 5 hero beats).
- **Approach:** adapt the licensed Cunnet template files (owner will supply them) rather than build from scratch, then rebrand to Draco's system.

## Source template

- URL analysed: `https://html.aqlova.com/cunnet-demo/cunnet/portfolio-revealing-slider.html`
- It is a commercial ThemeForest template ("Cunnet – Creative Portfolio Agency"). **Only adapt a properly licensed copy.** Do not copy the template wholesale into a public repo without a license.

### Tech stack (as loaded on that page)
jQuery · Bootstrap · **Swiper** (the slider) · **GSAP + ScrollTrigger** · **split-type** (text splitting) · **three.js + `hover-effect.umd.js`** (the WebGL displacement "reveal" transition) · magnific-popup · nice-select · purecounter · custom cursor (`tp-cursor.js`) · `slider-init.js` · `main.js`. Title font: Inter.

### Page skeleton (body → main)
```
#preloader                     (loader)
#magic-cursor > #ball          (custom cursor)
.tp-offcanvas-2-area           (off-canvas menu)
header > .tp-header-area       (nav)
main
  .tp-portfolio-revealing-slider
    .tp-portfolio-revealing-slider-slides   (5 slides, .bg-position bg images)
    .tp-portfolio-revealing-slider-control   (◄ prev)
    .tp-portfolio-revealing-slider-control-right (► next)
    .tp-portfolio-revealing-slider-social
```

## Surgery map for `index.html`

**Keep (rebrand to Draco):**
| Element | Change |
|---|---|
| `#preloader` | recolor to ice-blue / near-black |
| `#magic-cursor` + `#ball` | keep, recolor to accent |
| `.tp-offcanvas-2` menu + `header` | wordmark → **DRACO** (Playfair, letter-spaced); links → Home · About · Contact |

**Remove:**
- The entire `main > .tp-portfolio-revealing-slider` block (all 5 slides, both arrow controls, the social row).
- Scripts no longer needed: `slider-init.js`, `hover-effect.umd.js`, **three.js** (the WebGL slide-reveal is not used for a frame-sequence hero), Swiper (unless reused elsewhere).

**Add in `main` (Draco hero):**
- A fixed hero stage with a `<canvas>` playing the **scroll-scrubbed frame sequence** from `assets/frames/` (240 imgs — a "logo drawn in golden + ice-blue light" reveal), driven by a **~500vh** spacer that maps scroll progress → frame index.
- **5 text beats** (content below) revealed on scroll. Reuse the template's already-loaded **GSAP + split-type** for the beat reveals, restyled in **Playfair / Jost**.
- Rebrand all tokens to Draco's system (below).

## Draco brand tokens (from `docs/design/draco-lovable-brief.md`)

- **Palette (dark ice-blue):** `--bg-deep #05060A` · `--bg-base #080B14` · `--bg-elevated #0E1422` · text `#EAF2FF` / muted `#8FA3C0` · **accent `#4FD8FF`** / `--accent-2 #7AA2FF` · gold `#C9A227` (hairline only, <5%).
- **Type:** Playfair Display (headlines, *italic* emphasis word) + Jost (body/UI/labels, uppercase eyebrows ~0.3em). Alt display: Bodoni Moda.
- **Motion:** ~500vh scroll spacer drives frame index; 5 beats over 20% bands each; crossfade + translateY(20→0) ~500ms `cubic-bezier(.16,1,.3,1)`; drifting accent-glow blobs; thin accent scroll-progress bar under nav; `prefers-reduced-motion` → stack beats, freeze on poster frame.
- **Global:** glass nav (backdrop-blur, cool hairline border); footer reveals at ~98% with tagline "Creating Meaningful Connections That Inspire Loyalty." + "© 2026 Draco · A Lumivox Ads Company" + Instagram/LinkedIn; **WhatsApp float** bottom-right green → `https://wa.me/971504501195`; monochrome SVG icons (Lucide/Heroicons — pull via `better-icons`), never emoji.

### The 5 hero beats (home)
0. Eyebrow **Enterprise Loyalty Solutions Partner** · H1 **Creating Meaningful Connections That Inspire *Loyalty*** · sub + scroll cue.
1. **Why Draco** · **Retention Over Acquisition** · acquisition-cost line.
2. **What We Do** · **Loyalty Ecosystems That Drive Growth** · programs/rewards/membership/engagement/retention.
3. **Our Capabilities** · **End-to-End Loyalty Solutions** · 6-item grid.
4. **Get Started** · **Build Lasting Loyalty** · CTAs → About / Contact.

*(About & Contact page content is fully specified in `docs/design/draco-lovable-brief.md`.)*

## Assets & references already in this repo
- **Hero frames:** `assets/frames/` — 240 JPGs, the scroll video.
- **Full brief:** `docs/design/draco-lovable-brief.md`.
- **Design research / moodboard:** `moodboard/` — `REFERENCES.md` + 3 grids (Pinterest, Dribbble, Awwwards). Best-fit live refs: Awwwards Scrolling/Storytelling, "Depo Luxe", and the CSS-Tricks image-sequence-scroll technique (the exact method for the hero).

## How to continue (future session)
1. Owner drops the licensed Cunnet template files into a folder (e.g. a new `site-v2/` here or a separate project) and gives the path.
2. Read this file + `docs/design/draco-lovable-brief.md`.
3. Adapt `index.html` per the surgery map → hero-only Draco; rebrand CSS tokens/fonts; wire the `assets/frames/` sequence to scroll; strip the slider + three.js/hover-effect/Swiper.
4. Preview; then apply the same nav/footer/cursor chrome + brand to About and Contact.

**Recommended alternative if licensing is a concern:** rebuild the reveal/hero effect natively (canvas frame-draw + GSAP/Lenis) in Draco's tokens instead of adapting Cunnet's files — same result, no heavy jQuery/Bootstrap/three.js stack, no license question.
