# Handoff prompt — Draco, interactive globe for Verticals & Geographies

This supersedes `docs/HANDOFF-R2-VERTICALS-LAB.md`. A direction has been chosen, so the four-option
design lab is no longer needed — do not build it. Everything below describes the one treatment to build.

Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro, or Claude Sonnet if the WebGL and scroll choreography
needs more careful reasoning. **Why this tool:** WebGL globe work that has to be judged by eye, driven by
scroll, and made responsive — it needs a browser in the loop at every step.

**Setup:** the repository is at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, on the `design`
branch, with round-1 feedback changes applied and uncommitted. Static site, no build step, no package
manager. Serve with `python3 -m http.server 8000` from the repo root.

## 2. Objective

The Draco homepage ends on a **Verticals & Geographies** section — the final reveal of a scroll-driven
hero, and the last thing a prospect sees before reaching for the contact rail. It is currently a stack of
six flat placeholder rows, which is far too plain for that job.

Replace it with an **interactive globe**. As the visitor scrolls through this final act, a dotted,
gold-lit globe rotates to bring each region into view in turn. A marker on that region lights up, and a
frosted-glass panel slides in alongside the globe listing the verticals Draco serves there. Scroll on,
and the globe turns to the next region and the panel swaps.

The visual reference the client responded to is a dark landing page with a dot-matrix globe, small
circular pins on the map, and a thin connector line running from the active pin out to a text panel on
the right. That is the target: precise, technical, quiet — an instrument panel, not a marketing graphic.

## 3. The library

Use **cobe** (`https://github.com/shuding/cobe`) — a 5kB WebGL globe that produces exactly the dotted
look in the reference, supports markers positioned by latitude and longitude, and exposes rotation as
two numbers you can drive from anything.

Because this project has no build step, **vendor it rather than importing from npm**: download the ESM
build to `assets/vendor/cobe.js` and load it with `<script type="module">`. Do not add a CDN dependency —
the site ships to GitHub Pages today and `www.draco.ae` later, and a third-party CDN in the critical path
of the homepage's closing moment is not worth the risk.

The API you need:

```js
import createGlobe from './assets/vendor/cobe.js'

const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: 1000, height: 1000,
  phi: 0, theta: 0,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.16, 0.18, 0.22],
  markerColor: [0.79, 0.66, 0.42],
  glowColor: [0.12, 0.14, 0.18],
  markers: [
    { location: [25.20, 55.27], size: 0.06, id: 'me' }
  ],
  onRender: (state) => { state.phi = phi; state.theta = theta; }
})
```

Rotating to a location uses this conversion, which is the documented approach:

```js
function locationToAngles(lat, long) {
  return [
    Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180
  ]
}
```

Ease toward the target each frame (`current += (target - current) * 0.08`) rather than snapping — the
turn between regions should feel weighted, like a mechanism settling, not like a jump cut.

The colour values above are the theme's `--d-accent` (#c9a96a) and panel greys converted to cobe's 0–1
RGB triples. Tune them by eye, but keep the globe reading as dark grey landmass with gold markers, not a
gold globe.

## 4. How it fits with the existing hero

This is the part that needs care, because the homepage already has a planet on it.

The hero is a photoreal Earth-and-moon animation — 240 JPEG frames on a `<canvas>`, looping continuously
via `assets/earth-loop.js`. The client loves it and it must not be touched for steps 1 and 2 of the
scroll (the headline, then the quote call-to-action).

**As step 3 enters, cross-fade from the photoreal Earth to the dotted globe.** Position and scale the
cobe canvas so its sphere lands in the same place on screen as the photoreal Earth, then run a roughly
600ms cross-fade between them. Done well this reads as the planet resolving into data — reality giving
way to a coverage map — which is a far better transition than simply covering the hero with a panel. Done
badly it reads as two different globes fighting, so get the alignment right before anything else.

Pause the photoreal frame loop once it is fully faded out, and resume it if the visitor scrolls back up.
Two canvases both animating is wasted work.

## 5. The data

The client has not yet supplied the real verticals and regions — they replied "Working on this and will
share". Use this placeholder set, which draws its verticals from the industries list already on the About
page so it reads plausibly, with an invented and clearly provisional regional grouping.

Keep it in **one array at the top of the script** so swapping in the real data is a single edit. Mark it
with a comment saying the data is placeholder and awaiting the client.

| Region | Anchor (lat, lng) | Verticals |
|---|---|---|
| Middle East | 25.20, 55.27 | Retail · Hospitality · Fuel & Energy · Banking & Financial Services |
| Europe | 51.51, -0.13 | Automotive · Telecommunications · E-Commerce |
| Asia Pacific | 1.35, 103.82 | Restaurants & Cafés · Healthcare · Lifestyle |
| Americas | 40.71, -74.01 | Entertainment · Enterprise Organisations |

Every region carries a marker on the globe at all times. The active one is larger and full gold; the
others sit small and dim, so the visitor can see there is more coverage than the panel currently shows.

The structure must tolerate the real data being a different shape — more regions, more verticals per
region, longer names. Nothing may be hard-coded to four.

## 6. The panel

A frosted-glass card holding the active region's content, sitting on the clear side of the composition
opposite the globe.

- Region name in display type (`--d-ff-disp`, uppercase), with a gold hairline rule beneath it.
- Verticals as small chips: body type, gold hairline border, transparent fill. They stagger in with about
  a 50ms offset each when the panel changes, so a region swap has some life to it.
- Glass treatment: `backdrop-filter: blur()` over a low-opacity dark fill with a hairline border, so the
  globe stays faintly visible through the card and the section reads as one composition rather than a box
  pasted over an image.
- A thin gold connector line running from the active marker to the panel, as in the reference. Draw it in
  SVG or on a canvas overlay, and recompute its start point from the marker's projected screen position —
  it has to stay attached as the globe turns, or it will look broken.

Gold is an accent throughout: hairlines, chips, markers, the connector, the active region's name. Never a
large gold fill.

## 7. Scroll choreography

The globe act needs its own scroll length — extend the hero stage so this final section gets roughly one
viewport of scroll per region, with the globe canvas pinned while it plays.

For each region in turn: the globe eases round to that region's angles, its marker grows and brightens
while the previous one dims, the connector redraws, and the panel content swaps with the chips staggering
in. The transitions should overlap slightly rather than fully resetting between regions.

The globe should keep a very slow idle rotation between region changes — a few thousandths of a radian
per frame — so it never looks frozen. The reference has this and it matters; a static globe reads as an
image, a drifting one reads as live.

After the last region, hold briefly on the full globe with all markers lit at equal weight — the "we are
everywhere" beat — and end the page there. There is no footer.

## 8. Fallbacks

- **`prefers-reduced-motion: reduce`** — no rotation, no cross-fade, no chip stagger. Show the globe
  static with all markers lit, and present all regions as a plain stacked list of glass cards. This has
  to be a real, complete section, not an empty one.
- **No WebGL** — feature-detect before creating the globe. If it is unavailable, skip the globe entirely
  and render the same stacked glass cards. Never leave a blank canvas.
- **Slow devices** — cobe with `mapSamples: 16000` is fine on a laptop but should drop to something like
  8000 on small screens. Check the frame rate on a mid-range machine with the photoreal loop also running
  during the cross-fade, since that is the heaviest moment on the page.

## 9. Also fix, while you are in there

`index.html` has the `.scroll-hint` element duplicated — once around line 175 and again around line 221,
both inside the same sticky container. Remove the second one. Leftover from the round-1 merge.

## 10. Testing

- No console errors, including WebGL context warnings, on load and after a full scroll.
- The globe initialises once, not once per scroll pass, and `globe.destroy()` is called if the section is
  ever torn down.
- All 240 photoreal frames still load; the cross-fade does not trigger a re-download.
- The connector line stays attached to the active marker throughout the rotation, including mid-turn.
- Markers sit where they should geographically — Dubai should be on the Gulf, not in the Indian Ocean.
- Scrolling back up reverses cleanly: globe fades out, photoreal loop resumes, no stuck state.

## 11. Visual testing

Screenshot: the cross-fade at its midpoint; each of the four regions at rest with its panel and connector;
a mid-rotation frame between two regions; the final all-markers-lit beat; the reduced-motion fallback; and
the no-WebGL fallback. Capture at 1280px and 375px.

## 12. Responsiveness

Test at 375px, 768px, 1280px and 1920px.

- On desktop the globe sits on one side with the panel opposite, following the existing hero's
  left-planet / right-copy composition.
- On mobile, stack: globe above, panel below, and drop the connector line entirely rather than trying to
  route it across a narrow screen. Reduce `mapSamples` and the canvas resolution.
- The globe must not collide with the floating contact rail in the bottom-right corner at any width.
- Check landscape phones — the hero is `100svh` and vertical space is tight there.

## 13. Definition of done

- [ ] cobe is vendored at `assets/vendor/cobe.js`; no CDN dependency.
- [ ] The globe reads as the reference: dark dotted landmass, gold markers, quiet and technical.
- [ ] Cross-fade from the photoreal Earth is aligned in position and scale, and the frame loop pauses
      once it is hidden.
- [ ] Scroll rotates the globe region by region, with eased turns and a slow idle drift between them.
- [ ] The active marker brightens, the others dim, and the connector line stays attached through rotation.
- [ ] The glass panel swaps per region with staggered chips.
- [ ] All region data lives in one array, marked placeholder, tolerant of a different shape.
- [ ] Reduced-motion and no-WebGL fallbacks both render a complete, readable section.
- [ ] Mobile stacks the layout, drops the connector, and lowers `mapSamples`.
- [ ] The globe never collides with the contact rail.
- [ ] The duplicate `.scroll-hint` is removed.
- [ ] Screenshots captured for every state listed in section 11.
- [ ] Steps 1 and 2 of the hero, and all approved copy, are untouched.
