# Handoff prompt — Draco, Verticals & Geographies design lab

Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro. **Why this tool:** this is pure visual design work across
four alternative treatments, and it needs a browser to look at each one and iterate.

**Setup:** the repository is at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, on the `design`
branch, with the round-1 feedback changes already applied and uncommitted. Static site, no build step.
Serve with `python3 -m http.server 8000` from the repo root.

## 2. Objective

The Draco homepage ends on a section called **Verticals & Geographies** — the final reveal in a
scroll-driven hero, sitting over a continuously playing Earth-and-moon animation. It is the client's own
request: they asked for the coverage table to be revealed by scrolling on the homepage.

Right now that section is a plain stack of six flat rows (`.value-row` with a `.k` label and a `.v`
value), lifted verbatim from where it used to live on the About page. As the closing statement of the
homepage — the last thing a prospect sees before they reach for the contact rail — it is far too plain.
It looks like leftover markup, not a designed moment.

**Build a new standalone page, `verticals-lab.html`, that presents four different design treatments of
this section, one after another, so a direction can be chosen.** This page is a design lab for internal
review only. It is not part of the site's navigation and must never be indexed.

Do not modify `index.html` in this task. Once a direction is picked, it gets ported over in a follow-up.

## 3. Context and constraints

### The data

The client has not yet supplied the real verticals and regions — they replied "Working on this and will
share". Every treatment must therefore use placeholder content and stay robust to whatever arrives.

Use this placeholder set consistently across all four treatments, so they can be compared fairly. The
verticals are drawn from the industries list that already appears on the About page, so they are
plausible; the regional grouping is invented and clearly provisional.

| Region | Verticals |
|---|---|
| Middle East | Retail · Hospitality · Fuel & Energy · Banking & Financial Services |
| Europe | Automotive · Telecommunications · E-Commerce |
| Asia Pacific | Restaurants & Cafés · Healthcare · Lifestyle |
| Americas | Entertainment · Enterprise Organisations |

Mark the placeholder status in an HTML comment on each treatment, and keep the data in a single JS array
or object at the top of the page that all four treatments read from. That way, swapping in the real data
later is one edit, not four.

### The visual environment

Whatever is built has to survive being laid over a bright, moving, photoreal image of Earth. That is the
single hardest constraint and the main reason the current flat rows fail.

- The animation is 240 JPEG frames on a `<canvas>`, playing on a loop. Earth sits on the left of the
  frame; the right side is darker space and dust.
- Existing scrims (`.grade`, `.scrim` in `index.html`'s style block) darken the composition so copy stays
  legible. Reuse that approach rather than inventing new overlays.
- **For the lab page, reproduce the hero environment behind each treatment** — the same canvas, the same
  scrims, the same looping driver (`assets/earth-loop.js`). Judging these designs against a flat black
  background would be misleading; they need to be seen against the thing they will actually sit on.

### The theme

Everything comes from the custom properties in `assets/site.css`. Do not introduce new colours.

```
--d-bg #06070a   --d-bg2 #0e1116   --d-panel #0c0f14
--d-fg #f4f6f8   --d-muted 60%     --d-dim 42%
--d-line 12%     --d-line-2 18%
--d-accent #c9a96a   --d-accent-dim rgba(201,169,106,.14)
--d-ff-disp (display, uppercase)   --d-ff-body (Inter)
```

Gold is an accent, not a fill. It belongs on hairlines, small marks, single words and active states —
never as a large flat area. Display type is uppercase and tightly leaded; body copy is Inter.

Icons are Font Awesome Pro, already linked at `template/assets/css/font-awesome-pro.css`.

## 4. The four treatments

Build all four on the lab page, stacked vertically, each on its own full-viewport panel with the Earth
environment behind it. Label each panel with a small unobtrusive tag in a corner — "Option A — Glass
bento" and so on — styled so it clearly reads as lab chrome rather than part of the design.

### Option A — Glass bento grid

An asymmetric grid of frosted-glass cards over the animation. Each card is a region; the verticals sit
inside it as small gold-outlined chips. One card — Middle East, as the home market — is deliberately
larger than the others and carries a little more detail, so the grid has a focal point instead of reading
as four equal boxes.

The glass is the point: `backdrop-filter: blur()` with a low-opacity dark fill and a hairline border, so
the Earth remains faintly visible through the cards and the section stays connected to the hero rather
than covering it. Region names in display type, a gold hairline rule under each, chips in body type.

On entry, cards should stagger in — a short fade and rise, offset by 60–80ms per card.

This is the safest option and the one most likely to survive the real data arriving in an unexpected
shape, because a grid absorbs any number of items.

### Option B — Orbital coverage map

Lean into the fact that a planet is already on screen. Regions are plotted as small glowing gold nodes
positioned around the Earth, each connected by a thin gold line to a label that lists its verticals. Think
of a mission-control annotation layer rather than a chart.

Nodes need a subtle pulse — a slow expanding ring — and the connector lines should draw themselves in on
entry rather than simply appearing. The node positions must be defined relative to the canvas so they
still make sense when the viewport changes, and they must not land on top of the brightest part of the
planet.

This has the highest ceiling and the highest risk: it is the most striking of the four, but it fights the
animation for attention and it degrades badly if the client sends fifteen regions. Build it, but be
honest in the notes about how it holds up.

### Option C — Kinetic marquee bands

Horizontal bands, one per region. The region name is pinned on the left in display type; the verticals
scroll horizontally through the band, alternate bands moving in opposite directions at slightly different
speeds. Gold hairlines separate the bands.

The motion should be slow and continuous — closer to a stock ticker at rest than a news crawl — and it
must pause on hover and stop entirely under `prefers-reduced-motion`. Use a CSS transform loop with a
duplicated content track for a seamless wrap; do not animate `scroll-left` in JavaScript.

This echoes the auto-playing hero nicely and scales to any number of items, but it reads more brand-film
than enterprise consultancy, so it may be tonally wrong for the audience.

### Option D — Coverage matrix

A grid of verticals down the side and regions across the top, with gold dots marking presence — filled
for active, hollow outline for emerging. A quiet, dense, credible consulting-deck artefact.

Give it a real header row, generous cell padding, and a hover state that highlights the full row and
column so a cell can be read without counting across. A small legend explains the two dot states. On
entry, the dots should appear in a quick staggered sweep rather than all at once.

This is the most information-dense and the most static. On mobile it must reflow — a matrix cannot simply
shrink — so collapse it to a per-vertical list with region tags underneath.

## 5. Page requirements

- `verticals-lab.html` in the repository root. `<meta name="robots" content="noindex,nofollow">`. Do not
  add it to `sitemap.xml`, `llms.txt`, or any navigation.
- A small fixed index in a corner linking to the four panels, so a reviewer can jump between them without
  scrolling the whole page.
- Under each treatment, a short note in muted body type covering how it behaves when the data grows, how
  it behaves on mobile, and anything that worries you about it. Be candid — the point of the lab is to
  choose, and a treatment that photographs well but breaks with real data needs to say so.
- Keep all four treatments' CSS scoped so they cannot leak into each other (`.opt-a`, `.opt-b`, and so on).
- The lab page may carry the contact rail if `assets/site.js` injects it automatically; that is fine and
  actually useful, since option B's layout has to stay clear of it.

## 6. Also fix, while you are in there

`index.html` currently has the `.scroll-hint` element duplicated — once at line 175 and again at line 221,
both inside the same sticky container. Remove the second one. This is a leftover from the round-1 merge.

## 7. Testing

- No console errors on the lab page; all 240 frames load on each panel without a duplicate download per
  panel — share one canvas or one image cache rather than instantiating four independent loops, or the
  page will be unusable.
- Performance: four animated panels on one page is the main risk. Pause any panel that is off screen
  using an `IntersectionObserver`, and confirm the page still scrolls smoothly on a mid-range laptop.
- Every treatment must be legible against the brightest frames of the animation, not just the dark ones.
  Step through the frame sequence and check the worst case.

## 8. Visual testing

Screenshot each of the four treatments at 1280px and at 375px, and capture each one's entry animation
mid-flight so the motion can be judged. Also capture at least one treatment over a bright frame, to show
the legibility case.

## 9. Responsiveness

Test at 375px, 768px, 1280px and 1920px. Each treatment needs a genuine mobile answer, not a scaled-down
desktop one — particularly option D, which must abandon the matrix form entirely on narrow screens.

## 10. Definition of done

- [ ] `verticals-lab.html` exists, is `noindex`, and is linked from nowhere.
- [ ] All four treatments are built, each over a live Earth environment matching the real hero.
- [ ] All four read from one shared placeholder data structure.
- [ ] Each has a staggered or drawn entry animation, and a `prefers-reduced-motion` fallback.
- [ ] Each has a candid note on data growth, mobile behaviour and risks.
- [ ] Every colour comes from the existing custom properties; gold stays an accent.
- [ ] Off-screen panels pause; the page scrolls smoothly.
- [ ] Screenshots captured at both breakpoints, plus entry animations and a bright-frame legibility case.
- [ ] The duplicate `.scroll-hint` in `index.html` is removed.
- [ ] `index.html` is otherwise untouched.
