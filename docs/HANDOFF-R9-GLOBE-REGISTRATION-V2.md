# Handoff prompt — Draco, globe registration, second attempt

This supersedes `docs/HANDOFF-R7-GLOBE-REGISTRATION.md`. That brief was built on an assumption that turns
out to be false, which is why the work done against it did not produce alignment. Read section 3 before
touching anything.

Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro. **Why this tool:** the acceptance test is visual — two
circles either coincide or they do not — across several viewport sizes and across the animation loop.

**Setup:** repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, branch `design`. Static site,
no build step. Serve with `python3 -m http.server 8000`. Commit any dirty working tree first.

**Do not push.** GitHub Pages serves the `design` branch directly, so a push publishes to the
client-visible URL.

## 2. Objective

The vector wireframe globe must sit exactly on the photoreal Earth behind it — same centre, same radius —
so the two read as one object. That must hold at every viewport size and aspect ratio, and it must hold
on mobile, where the background planet is cropped and only partly visible; the wireframe must be cropped
by the same amount in the same place.

## 3. Why the first attempt failed — read this first

R7 assumed the Earth occupies a **fixed** region inside every source frame, so that three constants
(`EARTH_CX_FRAC`, `EARTH_CY_FRAC`, `EARTH_R_FRAC`) plus the cover-fit maths would place it correctly.

**That assumption is wrong. The planet moves.**

The 240-frame sequence is not a planet rotating in a locked-off camera. It is a slow camera push: across
the loop the Earth grows and drifts down and to the left, and the moon moves with it. Measured on the
source frames (1280 × 720):

| Frame | Lit-region width | Lit-region height | Top edge | Left limb |
|---|---|---|---|---|
| 1 | 524 | 517 | 38 | ~213 |
| 60 | 539 | 543 | 14 | ~217 |
| 120 | 541 | 550 | 9 | ~223 |
| 180 | 544 | 548 | 13 | ~229 |
| 240 | 549 | 552 | 12 | ~235 |

The disc grows roughly 5% and the left limb drifts about 22px over the loop. On a disc around 540px
across, that is tens of pixels of movement — far more than enough to read as "not aligned", and it is
**continuous**, so no single set of constants can be right for more than one instant.

The current constants in `assets/earth-scroll.js` (`0.405`, `0.500`, `0.230`) are unverified estimates
that were never actually calibrated, despite the comment claiming otherwise. They are wrong on top of
being unfixable in principle.

**Also important: do not try to detect the disc automatically by brightness.** This has been attempted
several times and does not work on this footage. Deep space reads about 10.6–11 in luminance; the Earth's
unlit night limb is only about 14–24, so no threshold cleanly separates them. Worse, the Milky Way dust
on the right of the frame is *brighter than the planet* and spans the full frame height, so it saturates
any thresholded search for the disc's extent. Three separate approaches — luminance bounding box,
connected components, and least-squares circle fitting to the lit limb — all returned inconsistent or
contaminated geometry. Budget no time on this.

## 4. Pick an approach

There are three ways out. Read all three and confirm the choice with the repository owner before building,
because option A changes the design slightly and that is not your call to make alone.

### Option A — Freeze the background during the globe act (simplest, most robust)

As step 3 begins, hold the Earth animation on one nominated frame — frame 120, say — and keep it there
for the whole globe sequence. With the background static, **one** set of constants is exact, permanently,
at every breakpoint. The entire problem disappears.

This is a small design change: the planet stops moving at the moment the wireframe appears. That can be
read as deliberate — the live Earth settling into a data view as the analysis begins — and the frame loop
resumes if the visitor scrolls back up. The client did ask for the Earth to keep playing continuously
behind the page, so this needs their agreement, but it is by far the least fragile answer and it costs
nothing in performance.

**Recommended** unless the client objects to the planet holding still.

### Option B — Keyframed calibration table (preserves continuous motion)

Keep the animation playing and make the constants a function of frame index.

The camera move is smooth and monotonic, so you do not need all 240 measurements. Calibrate **8
keyframes** — 1, 35, 70, 105, 140, 175, 210, 240 — and linearly interpolate between them. Store as a
small table in the source, roughly 24 numbers:

```js
// [frameIndex, cxFrac, cyFrac, rFrac] — calibrated visually, see docs/HANDOFF-R9
var EARTH_TRACK = [
  [  1, 0.0000, 0.0000, 0.0000 ],
  [ 35, 0.0000, 0.0000, 0.0000 ],
  // ...
];
function earthFracsForFrame(i) { /* linear interpolation between bracketing keyframes */ }
```

`earthOnScreen()` then takes the current frame index, interpolates the three fractions, and applies the
same cover-fit maths as now. Everything downstream is unchanged.

### Option C — Re-render the sequence with a locked camera

Regenerate the frames from `assets/0_Earth_Planet_3840x2160.mp4` with no camera move, so the planet is
genuinely fixed. Cleanest long-term result, but it needs the original 3D project or careful stabilisation
of the existing video, and it changes the hero's look. Raise it as an option; do not do it unopened.

## 5. Build the calibration tool first

Whichever option is chosen, you need to measure at least once, and it must be done visually because
automated detection does not work here. Build the tool before anything else — it is also the verification
harness.

1. Add a temporary debug mode behind a URL flag, `?calib`. It must be trivially removable and must not
   ship.
2. In that mode: pin the Earth animation to a chosen frame (a query parameter such as `?calib&frame=120`),
   force the globe canvas visible at full opacity regardless of scroll, and stroke the projected
   `{type:'Sphere'}` outline in **bright magenta at 2px**. Nothing else on this page is near magenta.
3. Add crosshairs through the projected centre — a horizontal and a vertical line across the viewport.
   Centre error is much easier to see against a crosshair than against a circle alone.
4. Expose the three fractions on `window` with a redraw on change, so they can be nudged live from the
   console. An on-screen readout of the current values, and a keyboard nudge binding, will make this take
   minutes rather than an hour.
5. **Check all four edges of the disc, not one.** A radius error looks exactly like a centre error if you
   only ever check one side. Get the magenta circle sitting on the limb at top, bottom, left and right
   simultaneously.
6. Write the settled numbers back into the source as commented constants recording how they were obtained.

Sanity cross-check while calibrating, from independent measurement of the source frames: at frame 120 the
disc's left limb sits near x ≈ 223 and its bottom near y ≈ 559 in the 1280 × 720 frame. Use these to
confirm you are in the right region — **do not use them as values**, they are lit-region estimates and
carry contamination from the terminator.

## 6. The mechanism, which is correct and stays

The cover-fit transform already in `assets/earth-scroll.js` is right and should be kept. The frames are
**1280 × 720**, aspect 1.7778, drawn with a standard cover fit — fill height and crop horizontally when
the viewport is narrower than 16:9, which is exactly why the planet is half off-screen on a phone.

```js
function getCoverFit(cw, ch) {
  var ir = FRAME_W / FRAME_H, cr = cw / ch, w, h;
  if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
  return { w: w, h: h, ox: (cw - w) / 2, oy: (ch - h) / 2 };
}

function earthOnScreen() {
  var f = earthFracsForFrame(currentFrame);       // option B; constant for option A
  var fit = getCoverFit(innerWidth, innerHeight);
  var s = fit.w / FRAME_W;
  return { cx: fit.ox + f.cx * FRAME_W * s,
           cy: fit.oy + f.cy * FRAME_H * s,
           r:  f.r * FRAME_W * s };
}
```

`drawFrame` must call the same `getCoverFit`, so the two can never disagree. In `verticals-globe.js`,
drive the projection straight from it — `d3.geoOrthographic().scale(r)` sets the sphere radius in pixels,
so the radius goes in unmodified, with no `0.46` factor and no `min(innerWidth, innerHeight)` term:

```js
var e = window.DracoEarth.earthOnScreen();
projection.scale(e.r).translate([e.cx, e.cy]).rotate(currentRotation);
```

For option B, `earthOnScreen()` changes value every frame, so the globe must recompute it every frame
rather than caching it across the animation — but still cache the cover-fit inputs and recompute those
only on resize.

Also required regardless of option:

- Remove the hand-tweaked inline styles on `#globe-canvas` (`position: relative`, `left: 85px`,
  `bottom: 24px`, `inset: 1`). It must be a plain full-viewport layer, `position: absolute; inset: 0`.
- Both canvases must use the same devicePixelRatio clamp, `Math.min(devicePixelRatio || 1, 2)`. A
  mismatch reintroduces misalignment on retina displays only.
- Delete `getGlobeLayout()` and its mobile special case. Position now comes entirely from the transform.

## 7. Consequences

The globe is no longer centred in the viewport and on some sizes is partly off-screen — correct, since it
mirrors the background.

- **The glass card** must be positioned from the measured `e.cx` and `e.r`, on whichever side has more
  clear space. It must never overlap the disc or the floating contact rail.
- **The connector line** must be suppressed when the marker is behind the globe or outside the viewport.
  On a cropped mobile planet, markers will fall off-screen.
- **Mobile stacking** should place the card from `e.cy + e.r` rather than a hard-coded fraction. Do not
  reintroduce a special-case position for the globe.

## 8. Testing

Registration is the acceptance test. With `?calib` on, confirm the magenta circle sits on the limb on all
four edges at each viewport:

| Viewport | Aspect | Exercises |
|---|---|---|
| 1920 × 1080 | 1.78 | Exactly 16:9, the degenerate cover-fit case |
| 1440 × 900 | 1.60 | Cropped horizontally |
| 2560 × 1080 | 2.37 | Ultrawide, cropped vertically |
| 1280 × 800 | 1.60 | Common laptop |
| 768 × 1024 | 0.75 | Tablet portrait, heavy crop |
| 375 × 812 | 0.46 | Phone portrait — planet substantially off-screen, wireframe off by the same amount |
| 812 × 375 | 2.17 | Phone landscape |

Then, critically for option B: **check registration at several points across the animation loop**, not
just one. Step to frames 1, 60, 120, 180 and 240 with the calibration overlay and confirm the circle
tracks the planet at each. This is the exact failure the first attempt missed.

Also verify: continuous resize keeps the two locked with no drift or jump, especially crossing the 16:9
boundary in both directions; alignment holds at devicePixelRatio 2; rotation through all four regions
keeps the globe registered, since only `rotate` changes; no console errors beyond the known missing
Bahrain id.

## 9. Do not change

- Scroll choreography and its thresholds. Step 2 clears at 0.74, step 3 begins at 0.76 — that gap was
  tuned to stop the two ghosting over each other.
- The globe's visual design, the glass card, chips, copy, the contact rail.
- The region and country data, which is placeholder pending the client.
- `about.html`, `contact.html`, `index-loop.html`.

## 10. Definition of done

- [ ] The chosen option (A, B or C) confirmed with the repository owner before building.
- [ ] Calibration tool built behind `?calib`, with magenta sphere outline, crosshairs, live-adjustable
      fractions and an on-screen readout — and **removed before shipping**.
- [ ] Calibration performed against all four edges of the disc, not one.
- [ ] For option A: the nominated hold frame is documented, and the loop resumes on scrolling back up.
- [ ] For option B: an 8-keyframe track table with linear interpolation, values recorded as commented
      constants.
- [ ] Cover-fit maths exists in exactly one place and is shared by `drawFrame` and `earthOnScreen`.
- [ ] `getGlobeLayout()`, the `0.46` factor and the mobile special case are gone.
- [ ] Inline styles removed from `#globe-canvas`; both canvases share one dpr clamp.
- [ ] Card positioned from measured globe geometry; connector suppressed when the marker is not visible.
- [ ] Registration verified at all seven viewports **and** at five points across the animation loop.
- [ ] Screenshots with the overlay on and off at each viewport, plus the loop-tracking check.
- [ ] Nothing pushed; unpushed commit count reported.
