# Handoff prompt — Draco, vector-geometry globe for Verticals & Geographies

> **Superseded, 28 July 2026.** The home page was rebuilt as a fixed video stage with eight
> scroll-snap screens, and the still Earth frame sequence, the Lenis smooth scroll and the
> scroll-driven globe described below no longer exist on that page. Kept for history only.
> Current design: `docs/superpowers/specs/2026-07-28-home-video-stage-design.md`.


This is **one final attempt** at the globe direction, using a different technique from the failed one.

`docs/HANDOFF-R4-REVERT-TO-BENTO.md` remains the **fallback**. If this attempt does not produce a crisp,
legible wireframe globe, stop and execute R4 instead. Section 14 defines exactly when to make that call.

Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro. **Why this tool:** scroll-driven canvas rendering that
must be judged by eye at several breakpoints — it needs a browser in the loop throughout.

**Setup:** repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, branch `design`. Static site,
no build step, no package manager. Serve with `python3 -m http.server 8000` from the repo root.

**Before you change anything:** nothing in this repository is committed — three rounds of work exist only
in the working tree. Commit the current state to a branch first, so this can be undone.

## 2. Why the previous attempt failed, and why this is different

The last attempt used **cobe**, a 5kB WebGL globe. It produced a near-black sphere with a few pinpoints
and no visible landmass. That was not a tuning problem — cobe renders a *shader-generated dot map*. Its
entire API surface is a handful of lighting and colour scalars. There is no way to ask it for country
outlines, because it has no country geometry. It was the wrong tool.

**This attempt draws the globe as vector geometry**: real country polygons projected through a d3
orthographic projection and stroked onto a 2D canvas. Every line on screen is one you explicitly drew, in
a colour you chose. The "black blob" failure mode is structurally impossible, because there is no shader
and no lighting model — only strokes and fills.

It also removes a whole class of bugs that plagued the last attempt: no WebGL context to acquire or lose,
no `devicePixelRatio` double-scaling, no context-attribute conflicts.

## 3. The target

The reference the client responded to: a dark page, a globe rendered as fine geometry with continents
picked out in warm orange, small circular markers on specific locations, and a thin connector line from
the active marker out to a text panel.

Translated to Draco's theme and this page:

- The photoreal Earth-and-moon frame animation keeps playing as the background, the whole way down.
- A black overlay sits over it, deep enough that the globe reads cleanly.
- On top of that, a wireframe globe: a graticule (the latitude and longitude grid) in faint white, all
  country outlines in a dim neutral stroke, and **the countries Draco operates in filled and stroked in
  gold**.
- As the visitor scrolls, the globe rotates so each region turns to face the viewer. Its countries light
  up, a marker pulses, a connector line runs out to the side, and a glass card names the verticals Draco
  serves there.

The glass card is the treatment already approved in `verticals-lab.html` (Option A). Reuse its visual
design — frosted fill, gold hairline under the region name, gold-outlined pill chips. Do not redesign it.

## 4. Technique

**d3-geo orthographic projection, drawn to a 2D canvas.** No WebGL, no three.js.

Vendor these into `assets/vendor/` — no CDN, since this site ships to GitHub Pages and later
`www.draco.ae`, and a third-party CDN in the homepage's closing moment is not worth the risk:

| File | Approx size | Purpose |
|---|---|---|
| `d3-geo.min.js` (UMD, bundles its `d3-array` and `d3-path` deps) | ~50KB | Projection and path generation |
| `topojson-client.min.js` | ~8KB | Decode the country topology |
| `countries-110m.json` (from `world-atlas@2`) | ~110KB | Country geometry, ISO 3166-1 numeric ids |

Core API, all confirmed against current d3 documentation:

```js
const projection = d3.geoOrthographic()
  .scale(radius)
  .translate([cx, cy])
  .clipAngle(90)          // hides the far side automatically
  .rotate([0, 0, 0]);

const path = d3.geoPath(projection, ctx);   // ctx is a 2D canvas context

// draw: sphere outline, graticule, all countries, then highlighted countries
path({ type: 'Sphere' });
path(d3.geoGraticule10());

// turn the globe to a location
projection.rotate([-longitude, -latitude, 0]);

// where a marker lands on screen — returns null if it is on the far side
const xy = projection([longitude, latitude]);
```

`clipAngle(90)` means the far hemisphere is culled for free, and `projection([lng, lat])` returns `null`
for points behind the globe — use that to hide markers and the connector when a region rotates out of
view, rather than computing visibility yourself.

Draw order each frame: clear → sphere fill → graticule → all country outlines → highlighted country
fills and strokes → markers → connector line.

## 5. Region and country data

Keep this in **one structure at the top of the file**, marked as placeholder. The client is still
preparing the real list — they said "working on this and will share" — so nothing may be hard-coded to
four regions or to these countries.

`world-atlas` identifies countries by **ISO 3166-1 numeric code as a string** in each feature's `id`.

| Region | Anchor (lat, lng) | Country ids | Verticals |
|---|---|---|---|
| Middle East | 25.20, 55.27 | 784 UAE, 682 Saudi Arabia, 634 Qatar, 414 Kuwait, 512 Oman, 048 Bahrain | Retail · Hospitality · Fuel & Energy · Banking & Financial Services |
| Europe | 51.51, -0.13 | 826 United Kingdom, 276 Germany, 250 France, 724 Spain, 380 Italy, 528 Netherlands | Automotive · Telecommunications · E-Commerce |
| Asia Pacific | 1.35, 103.82 | 458 Malaysia, 356 India, 036 Australia, 392 Japan, 764 Thailand | Restaurants & Cafés · Healthcare · Lifestyle |
| Americas | 40.71, -74.01 | 840 United States, 124 Canada, 076 Brazil, 484 Mexico | Entertainment · Enterprise Organisations |

**Verify every id resolves to a feature before you rely on it.** The 110m dataset drops very small
countries — Singapore, Bahrain and Qatar are the likely casualties. Log any id that finds no match. If
several are missing, switch to `countries-50m.json` (~250KB), which is still an acceptable payload and
carries the smaller states. Do not silently render a region with half its countries missing.

Note that the anchor for a region and the countries it highlights are separate concerns: the anchor is
where the globe turns to and where the marker sits, the country list is what lights up. Singapore can
remain the Asia Pacific anchor even if it is too small to be a visible polygon.

## 6. Scroll choreography

The existing three-step structure in `assets/earth-scroll.js` stays: step 1 the headline, step 2 the Rumi
quote with its call-to-action line. Step 3 becomes the globe act.

The globe act needs its own scroll length — roughly one viewport per region. `.stage` is currently
`1000vh`, which was sized for the previous attempt; keep it in that range and tune once the beats feel
right.

For each region in turn:

1. The globe eases its rotation to that region's anchor. Interpolate the `rotate` array rather than
   snapping — around `0.08` per frame toward the target reads as weighted. Take the shortest path around
   the longitude wrap so it never spins the long way round.
2. That region's countries transition from the dim neutral stroke to gold fill and stroke. Ease the
   colour rather than switching it.
3. The previous region's countries fade back to neutral.
4. The marker at the anchor grows and pulses; a thin gold connector runs from it to the glass card.
5. The card content swaps, with its chips staggering in about 50ms apart.

Keep a very slow idle rotation between beats so the globe never looks frozen — a still globe reads as an
image, a drifting one reads as live. After the last region, hold briefly with **all** regions lit at
equal weight, no connector, no card: the "we operate everywhere" beat. The page ends there. No footer.

## 7. Layers and legibility

Back to front: photoreal Earth canvas → `.grade` and `.scrim` overlays → **black overlay** → globe canvas
→ glass card (DOM).

The client's own description was "the Earth spinning, we add a black overlay, and on top of that the
globe with the white lines". So the black overlay is deliberate and should be strong — the photoreal
Earth becomes atmosphere behind the graphic, not a competing subject. Aim for the Earth being clearly
present but subdued; if the globe's fine lines are fighting it, deepen the overlay rather than thickening
the strokes. Fine strokes are the whole aesthetic.

Check the result against the **brightest** frames in the sequence, not just the dark ones. The lit limb
of the photoreal Earth is far brighter than the surrounding space and is where legibility will break.

Never pause or fade out the photoreal animation. The previous attempt crossfaded it away and that was
wrong — the client wants it continuous behind everything.

## 8. Theme

All colour from the existing custom properties in `assets/site.css`. Introduce nothing new.

```
--d-bg #06070a   --d-bg2 #0e1116   --d-panel #0c0f14
--d-fg #f4f6f8   --d-muted 60%     --d-dim 42%
--d-line 12%     --d-line-2 18%
--d-accent #c9a96a   --d-accent-dim rgba(201,169,106,.14)
--d-ff-disp (display, uppercase)   --d-ff-body (Inter)
```

Suggested starting values, to tune by eye:

- Sphere fill: near-transparent, a barely-there darkening so the globe reads as a solid body.
- Graticule: `rgba(244,246,248,0.08)`, hairline.
- Sphere outline: `rgba(244,246,248,0.18)`.
- Inactive countries: stroke `rgba(244,246,248,0.16)`, no fill.
- Active countries: fill `rgba(201,169,106,0.18)`, stroke `#c9a96a`.
- Marker and connector: `#c9a96a`.

Scale all stroke widths by `devicePixelRatio` so lines stay hairline-crisp on retina. Set the canvas
backing store to `size * dpr` and its CSS box to `size`, then `ctx.scale(dpr, dpr)` once — get this right
at the start, because the previous attempt's single worst bug was double-applying the pixel ratio and
pushing the globe off-screen.

## 9. Sizing and layout

The globe is square. Size it from the **smaller** viewport dimension so it always fits — roughly
`min(innerWidth, innerHeight) * 0.8`. On desktop, place it toward the left of the composition with the
glass card to the right, echoing the existing hero's left-planet / right-copy arrangement.

## 10. Fallbacks

- **`prefers-reduced-motion: reduce`** — no rotation, no pulse, no stagger. Draw the globe once with all
  regions lit, and present the regions as a plain stacked column of glass cards beneath it.
- **Canvas unavailable, or the topology fails to load** — fall back to the glass bento grid from
  `verticals-lab.html`. Wrap the topology fetch in a `try`/`catch` and take this path on failure. A
  network hiccup must never leave an empty section.
- On mobile, drop the connector line entirely rather than routing it across a narrow screen, and stack
  the globe above the card.

## 11. Testing

- No console errors. The topology fetch resolves; every country id maps to a real feature, or is logged.
- All 240 photoreal frames still load, and the animation never pauses.
- Markers sit where they should geographically — Dubai on the Gulf, not in the Indian Ocean.
- Markers and the connector disappear when their region rotates to the far side, and reappear correctly.
- Rotation takes the short way round the longitude wrap, in both directions.
- Scrolling back up reverses cleanly with no stuck state.
- Frame rate holds while both canvases are drawing. If it drags, redraw the country paths only when the
  rotation actually changes, and cache the projected graticule between frames.

## 12. Visual testing

Screenshot each region at rest with its card and connector; a mid-rotation frame between two regions; the
final all-regions-lit beat; the globe over one of the brightest frames of the photoreal sequence; the
reduced-motion fallback; and the bento fallback with the topology fetch forced to fail. Capture at 1280px
and 375px.

## 13. Responsiveness

Test at 375px, 768px, 1280px and 1920px. The globe must never collide with the floating contact rail in
the bottom-right corner. Check landscape phones — the hero is `100svh` and vertical space is tight.
Reduce stroke detail rather than shrinking the globe below legibility on small screens.

## 14. When to abandon this and ship the bento instead

Be honest rather than persistent. This is the third attempt at this section, and a mediocre globe is
worse than a good bento.

Stop and execute `docs/HANDOFF-R4-REVERT-TO-BENTO.md` if, at 1280px:

- Country outlines are not clearly readable as recognisable land shapes, or
- The globe cannot be made legible over the bright frames without an overlay so heavy the photoreal Earth
  effectively disappears, or
- Frame rate cannot be held smooth with both canvases drawing.

If you reach that point, say so plainly in your summary and state which criterion failed. Do not ship a
compromised version of this.

Keep `verticals-lab.html` in place throughout — it is the source of the bento fallback. Run no repository
cleanup as part of this task; the cleanup steps live in section 13 of the R4 document and happen only
once this section is finally settled.

## 15. Definition of done

- [ ] Current state committed to a branch before any change.
- [ ] `d3-geo`, `topojson-client` and the country topology vendored in `assets/vendor/`; no CDN.
- [ ] All cobe code and canvases removed: `assets/verticals-globe.js`, `assets/vendor/cobe.js`,
      `#cobe-canvas`, `#connector-canvas` styles and elements, and the old module script tag.
- [ ] The globe renders as vector geometry: graticule, sphere outline, all country outlines, gold
      highlights.
- [ ] Every country id verified against the topology; missing ones logged, or the 50m dataset used.
- [ ] Scroll rotates region by region with eased, shortest-path rotation and a slow idle drift.
- [ ] Active countries ease to gold; the previous region eases back to neutral.
- [ ] Marker pulses, connector stays attached, and both hide when the region is on the far side.
- [ ] The glass card reuses the approved Option A design, chips staggering in.
- [ ] Final beat lights all regions equally, then the page ends.
- [ ] The photoreal Earth plays continuously behind everything and is never paused or faded.
- [ ] `devicePixelRatio` applied exactly once; lines are hairline-crisp on retina.
- [ ] Reduced-motion and topology-failure fallbacks both render complete, readable sections.
- [ ] Globe never collides with the contact rail at any width.
- [ ] Screenshots captured for every state in section 12, at both breakpoints.
- [ ] Steps 1 and 2, all approved copy, and the other three pages untouched.
- [ ] No repository cleanup performed; `verticals-lab.html` still present.
