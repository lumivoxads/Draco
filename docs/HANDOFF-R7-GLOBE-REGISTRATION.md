# Handoff prompt — Draco, register the vector globe onto the photoreal Earth

> **Superseded, 28 July 2026.** The home page was rebuilt as a fixed video stage with eight
> scroll-snap screens, and the still Earth frame sequence, the Lenis smooth scroll and the
> scroll-driven globe described below no longer exist on that page. Kept for history only.
> Current design: `docs/superpowers/specs/2026-07-28-home-video-stage-design.md`.


Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro. **Why this tool:** the acceptance test is visual — two
circles either sit on top of each other or they do not — and it has to be checked at several viewport
sizes, so it needs a browser in the loop.

**Setup:** repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, branch `design`. Static site,
no build step. Serve with `python3 -m http.server 8000` from the repo root. The restore point is commit
`93f8c37`; commit any dirty working tree before starting.

**Do not push.** GitHub Pages serves the `design` branch directly, so a push publishes straight to the
client-visible URL. Leave deployment to the repository owner.

## 2. Objective

The homepage's final scroll act draws a vector wireframe globe over a photoreal Earth frame animation.
The two are meant to read as one object — the wireframe should sit exactly on the photoreal planet, same
centre, same radius, as though the graphic were an overlay traced onto the real thing.

Right now they are independent. The wireframe is placed at arbitrary fractions of the viewport while the
photoreal Earth is placed by a cover-fit of a 16:9 image. They coincide at roughly one window size and
drift apart everywhere else.

**Make the vector globe inherit its centre and radius from the photoreal Earth, at every viewport size and
aspect ratio.** Where the background planet goes, the wireframe goes. Where the background planet is
cropped off the edge of a narrow screen, the wireframe is cropped identically.

## 3. Root cause

`assets/verticals-globe.js` positions the globe like this:

```js
function getGlobeLayout() {
  var size = Math.min(innerWidth, innerHeight) * 0.8;
  var mobile = innerWidth <= 768;
  if (mobile) return { size: size, cx: innerWidth * 0.5, cy: innerHeight * 0.34, mobile: true };
  return { size: size, cx: innerWidth * 0.30, cy: innerHeight * 0.5, mobile: false };
}
// ...later
var radius = layout.size * 0.46;
```

Every number there is a guess about where the background planet happens to be. None of it reads the
background.

Meanwhile `assets/earth-scroll.js` draws the frame with a standard cover fit:

```js
var cw = innerWidth, ch = innerHeight, ir = img.width / img.height, cr = cw / ch, w, h;
if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
```

The frames are **1280 × 720**, aspect **1.7778**. So on a viewport wider than 16:9 the frame fills the
width and overflows vertically; on a narrower one — any phone in portrait — it fills the height and is
cropped horizontally, which is exactly why the planet appears half off-screen on mobile.

Because the Earth occupies a fixed region *within the source frame*, its on-screen position is fully
determined by that cover fit. It is computable, not guessable.

## 4. The fix

### 4.1 One shared transform

Add a single function that answers "where is the photoreal Earth on screen right now", and have both
files use it. It must live in one place — if the cover-fit maths is duplicated, the two globes will drift
apart again the next time either file is touched.

Put it in `assets/earth-scroll.js` (which owns the frame rendering) and expose it on the existing
`window.DracoEarth` object, which `verticals-globe.js` already reads:

```js
var FRAME_W = 1280, FRAME_H = 720;

// Calibrated fractions: where the Earth's disc sits inside a source frame.
// EARTH_CX_FRAC / EARTH_CY_FRAC are fractions of frame width / height.
// EARTH_R_FRAC is the disc radius as a fraction of frame WIDTH.
// See section 4.2 — these are set by visual calibration, not by guesswork.
var EARTH_CX_FRAC = 0.405;
var EARTH_CY_FRAC = 0.500;
var EARTH_R_FRAC  = 0.230;

function earthOnScreen() {
  var cw = innerWidth, ch = innerHeight;
  var ir = FRAME_W / FRAME_H, cr = cw / ch, w, h;
  if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
  var ox = (cw - w) / 2, oy = (ch - h) / 2;
  var s = w / FRAME_W;                       // uniform scale; equals h / FRAME_H
  return {
    cx: ox + EARTH_CX_FRAC * FRAME_W * s,
    cy: oy + EARTH_CY_FRAC * FRAME_H * s,
    r:  EARTH_R_FRAC * FRAME_W * s
  };
}
```

This deliberately mirrors the `drawFrame` cover maths line for line. If you ever change one, change both —
better still, have `drawFrame` call a shared helper for `w`, `h`, `ox`, `oy` so they cannot disagree.

Then in `verticals-globe.js`, delete `getGlobeLayout()` entirely and drive the projection from it:

```js
var e = window.DracoEarth.earthOnScreen();
projection.scale(e.r).translate([e.cx, e.cy]).rotate(currentRotation);
```

`d3.geoOrthographic().scale(r)` sets the sphere radius in pixels directly, so `scale` takes `e.r`
unmodified — no `0.46` factor, no `min(w,h)` term. Remove both.

### 4.2 Calibrating the three fractions

The starting values above are an estimate and **must be calibrated by eye**. Do not try to detect the disc
programmatically by luminance — this has been attempted and does not work: deep space in these frames
reads about 11 in luminance and the Earth's unlit night limb only about 14 to 24, so there is no reliable
threshold between them, and the Milky Way dust on the right of the frame is brighter than the planet.

Calibrate with a temporary debug overlay instead. It takes minutes and the result is verifiable:

1. Add a temporary debug mode — a URL flag such as `?calib` is ideal — that forces the globe visible at
   full opacity over frame 1, regardless of scroll position.
2. In that mode, stroke the projected `{type:'Sphere'}` outline in bright magenta at 2px, over the
   photoreal frame. Magenta because nothing else on this page is near it.
3. Expose `EARTH_CX_FRAC`, `EARTH_CY_FRAC` and `EARTH_R_FRAC` on `window` so they can be nudged live from
   the console, with a redraw on change.
4. Adjust until the magenta circle sits exactly on the photoreal limb — check the top, bottom, left and
   right of the disc, not just one edge, since an error in radius looks like an error in centre if you
   only check one side.
5. Write the settled values back into the source as constants, with a comment recording that they were
   calibrated visually and how to redo it.
6. **Remove the debug mode before you finish.** It must not ship.

Calibrate at one desktop size. Because everything else derives from the cover fit, correct fractions are
correct at every size — that is the whole point of the approach, and section 6 is how you prove it.

### 4.3 Consequences to handle

**The globe is no longer centred in the viewport, and on some sizes it is partly off-screen.** That is
correct and intended — it mirrors the background. But two things depend on globe position and need
revisiting:

- **The glass card.** It currently sits opposite a globe that was assumed to be at 30% width on desktop
  and centred on mobile. Position it relative to the *actual* globe: on wide viewports, place it on
  whichever side has more clear space, given `e.cx` and `e.r`. It must never overlap the globe's disc, and
  never collide with the floating contact rail in the bottom-right.
- **The connector line.** It already projects from the marker's real position, so it should keep working.
  Confirm it still terminates on the card's edge after the card moves, and that it is still suppressed
  when the marker is on the far side of the globe or when the layout is stacked.

**Markers may fall outside the viewport** when the planet is cropped — for example a region on the far
left of a narrow screen. Detect this: if the active region's projected point is outside the visible
viewport, or is behind the globe, the connector must be suppressed rather than drawn off into nothing.
The card still shows its content; only the line is dropped.

**Mobile stacking is now a real decision.** Previously the mobile branch moved the globe to the upper
centre so a card could sit below. With registration, the globe goes wherever the background Earth goes —
often large and partly cropped. Keep the card below the globe as it is now, but position it from the
measured `e.cy + e.r` rather than a hard-coded fraction, and let it float over the planet if there is not
enough clear space beneath. Do not reintroduce a special-case position for the globe itself.

### 4.4 Clean-up while you are in there

The `#globe-canvas` element currently carries hand-tweaked inline styles from a debugging session —
`position: relative`, `left: 85px`, `bottom: 24px`, `inset: 1`. Remove them. The canvas must be a plain
full-viewport layer: `position: absolute; inset: 0`, sized `innerWidth × innerHeight` in CSS pixels with a
`devicePixelRatio`-scaled backing store, exactly as `#earth` is. All positioning now comes from the
projection, never from CSS offsets on the canvas.

Both canvases must use the same `dpr` clamp (`Math.min(devicePixelRatio || 1, 2)`) — a mismatch there
reintroduces misalignment on retina displays.

## 5. Do not change

- The three-step scroll choreography and its thresholds in `earth-scroll.js`. Step 2 clears at 0.74,
  step 3 begins at 0.76; that gap was tuned deliberately to stop the two steps ghosting over each other.
- The photoreal animation must keep playing continuously and must never be paused or faded.
- The globe's visual design — graticule, country outlines, gold highlights, marker pulse, glass card and
  chips. Only its position and size change.
- The region and country data, which is placeholder pending the client.
- `about.html`, `contact.html`, `index-loop.html`.

## 6. Testing — the acceptance test is registration

For each viewport below, enable the calibration overlay and confirm the magenta sphere outline sits on the
photoreal limb on all four sides. Then disable it and confirm the finished result looks like one object.

| Viewport | Aspect | What it exercises |
|---|---|---|
| 1920 × 1080 | 1.78 | Exactly 16:9 — the degenerate case where cover fit does nothing |
| 1440 × 900 | 1.60 | Narrower than the frame: cropped horizontally |
| 2560 × 1080 | 2.37 | Ultrawide: cropped vertically, planet large |
| 1280 × 800 | 1.60 | Common laptop |
| 768 × 1024 | 0.75 | Tablet portrait: heavy horizontal crop |
| 375 × 812 | 0.46 | Phone portrait: the planet should be substantially off-screen, and the wireframe must be off-screen by the same amount |
| 812 × 375 | 2.17 | Phone landscape |

Also verify:

- Resizing the window continuously keeps the two locked together — no lag, no drift, no jump. Resize
  slowly across the 16:9 boundary in both directions, since that is where the cover fit switches branch.
- The alignment holds on a retina display, where `devicePixelRatio` is 2.
- Rotation still works: the globe turns through all four regions and the wireframe stays registered
  throughout, since only `rotate` changes and `scale`/`translate` do not.
- No console errors. The only expected warning is the known missing Bahrain country id.

## 7. Visual evidence to produce

For each of the seven viewports: one screenshot with the calibration overlay on, showing the magenta
circle against the photoreal limb, and one with it off showing the finished composition. Also capture the
375 × 812 case specifically — the reviewer's main complaint was that mobile shows only half the planet and
the wireframe did not match, so that pairing is the proof.

## 8. Definition of done

- [ ] A single shared transform computes the photoreal Earth's on-screen centre and radius; the cover-fit
      maths exists in exactly one place.
- [ ] `getGlobeLayout()` and the `0.46` radius factor are gone; the projection is driven from the shared
      transform.
- [ ] The three calibration fractions are settled by visual overlay and written back as commented
      constants.
- [ ] The debug/calibration mode is removed before shipping.
- [ ] Hand-tweaked inline styles are gone from `#globe-canvas`; it is a plain full-viewport layer.
- [ ] Both canvases use the same `devicePixelRatio` clamp.
- [ ] The card is positioned from the measured globe geometry and never overlaps the globe or the contact
      rail.
- [ ] The connector is suppressed when the marker is off-screen or behind the globe.
- [ ] Registration verified at all seven viewports, plus a continuous resize across the 16:9 boundary.
- [ ] Screenshots captured with the overlay on and off at each viewport.
- [ ] Scroll choreography, animation continuity, globe styling and region data all unchanged.
- [ ] Nothing pushed; unpushed commit count reported.
