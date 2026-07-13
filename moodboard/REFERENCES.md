# Draco — Design Research & References

Compiled 2026-07-13 via the `design-research` skill (Pinterest + Dribbble + Awwwards; ThemeForest was Cloudflare-blocked and substituted with Awwwards). Matched against Draco's **locked** direction: futuristic **ice-blue on near-black** (`#05060A` / `#4FD8FF` / `#7AA2FF`, gold `#C9A227` <5%), **Playfair Display + Jost**, Apple-style **scroll-scrubbed cinematic video hero**, glass nav, WhatsApp/email floats. Purely static (HTML/CSS/JS). **Research only — nothing built.**

## Moodboard screenshots (this folder)
| File | Source | What to look at |
|---|---|---|
| `01_pinterest_dark-cinematic-iceblue.png` | Pinterest | Tesla/SpaceX cinematic darks, glassmorphism, and dark **+ gold + serif** luxury (Noah & Clara, "Master the Art" video-hero) |
| `02_dribbble_dark-luxe-serif.png` | Dribbble | **AURELIUS** (dark+gold+serif) and **ALIANDO** (dark-blue enterprise/AI) — closest to Draco's register |
| `03_awwwards_scrolling-gallery.png` | Awwwards | **Konpo "Global Security"** (dark-blue radial glow, enterprise), OBSCURA (editorial big-type studio) |

## Best-fit live references (open these)

**Galleries — filter to Draco's palette/type**
- Awwwards · Scrolling — https://www.awwwards.com/websites/scrolling/  → use the **Color** (dark/blue) + **Font** (serif) filters
- Awwwards · Storytelling collection — https://www.awwwards.com/awwwards/collections/storytelling/
- Awwwards · "Depo Luxe" (Cuchillo) — https://www.awwwards.com/sites/depo-luxe/  → strategic, cinematic, contemporary

**The exact hero technique Draco uses (frame sequence → scroll)**
- CSS-Tricks — Apple-style scroll image-sequence — https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/
- Ghosh.dev — video scrubbing on the web (`video.currentTime`) — https://www.ghosh.dev/posts/playing-with-video-scrubbing-animations-on-the-web/

*(Draco already has 240 `assets/frames/*.jpg` — a "logo drawn in golden + ice-blue light" reveal. The CSS-Tricks image-sequence method is the right fit: preload frames, draw the frame indexed by scroll progress to a `<canvas>`, no video codec scrubbing issues.)*

## Steal-list → mapped to Draco's locked brand

| Move (from references) | Source | How it fits Draco |
|---|---|---|
| Scroll-scrubbed cinematic hero, one fixed stage | Konpo, Apple/Tesla pins | You already have the frame sequence — drive it by a ~500vh spacer per the brief |
| Dark + **gold + serif** luxe | AURELIUS, Noah & Clara | Validates Playfair headlines + gold-as-hairline (<5%) over the ice-blue system |
| Blue **radial glow** behind enterprise copy | Konpo "Global Security" | For the Capabilities / CTA beats — premium, on-palette |
| Big editorial serif statements | OBSCURA | Your H1/H2 beats in Playfair, *italic* on the emphasis word ("*Loyalty*") |
| Particle/light bokeh field | SpaceX pin, your own frames | Already in the footage; echo subtly with drifting accent-glow blobs (brief §Motion) |
| Glass nav, cool hairline border | Web-design glassmorphism pin | Matches the brief's fixed glass nav spec exactly |

## Notes
- **Icons:** brief wants monochrome SVG (Lucide/Heroicons) — pull via the `better-icons` tool when building.
- **Floating buttons:** WhatsApp (`wa.me/971504501195`, green circle, bottom-right) + `mailto:` — standard, present on all references' contact patterns.
- **Video access caveat:** references' motion was assessed from static thumbnails + the technique articles, not frame-by-frame playback.
- Draco is **vanilla**, so Magic UI/shadcn (React) don't apply — the effects are hand-built with canvas + GSAP/Lenis.

**Next (when you say build):** 2–3 hero-direction samples in Draco's exact tokens, wiring the existing `assets/frames/` sequence to scroll.
