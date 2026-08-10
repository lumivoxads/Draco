# Handoff prompt — Draco, smooth scrolling and scroll performance

> **Superseded, 28 July 2026.** The home page was rebuilt as a fixed video stage with eight
> scroll-snap screens, and the still Earth frame sequence, the Lenis smooth scroll and the
> scroll-driven globe described below no longer exist on that page. Kept for history only.
> Current design: `docs/superpowers/specs/2026-07-28-home-video-stage-design.md`.


Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro. **Why this tool:** the acceptance test is how the page
*feels* under a real wheel and trackpad, plus frame-timing measurement — it needs a browser in the loop.

**Setup:** repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, branch `design`. Static site,
no build step, no package manager. Serve with `python3 -m http.server 8000` from the repo root. Restore
point is commit `5875135`; commit any dirty working tree before starting.

**Do not push.** GitHub Pages serves the `design` branch directly, so a push publishes straight to the
client-visible URL. Leave deployment to the repository owner.

## 2. The problem

Scrolling the homepage is not smooth. It stutters, the content reveals arrive in steps rather than
flowing, and there are stretches that feel like dead space between one section and the next.

A smooth-scroll library is part of the answer but not all of it. Three of the four causes are in our own
code, and adding a library on top of them would damp the input while leaving the jank underneath. Fix all
four.

## 3. Diagnosis

### 3.1 Three scroll listeners, each thrashing layout

There are three independent `scroll` handlers:

| File | Line | What it does on every scroll event |
|---|---|---|
| `assets/earth-scroll.js` | 152 | `stage.getBoundingClientRect()`, then writes `opacity` and `transform` on three elements |
| `assets/verticals-globe.js` | 513 | `updateFromScroll()` — recomputes region beats, panel state |
| `assets/site.js` | 63 | `hero.offsetHeight`, then toggles classes on the floating nav and back-to-top |

Each one reads geometry from the DOM and then writes styles, synchronously, inside the scroll event.
`getBoundingClientRect()` and `offsetHeight` both force the browser to flush pending style and layout
work before they can return a value. Interleaving those reads with writes across three handlers produces
repeated forced reflows on a single scroll event. This is the main source of the stutter.

### 3.2 No damping

Every reveal is computed directly from raw scroll position. A mouse wheel delivers scroll in discrete
chunks, so the opacity and transform values step in discrete chunks too. Nothing interpolates between
them, which is why the reveals look like they snap rather than flow.

### 3.3 The frame sequence is loaded all at once

`assets/earth-frames/dark/` is **26MB across 240 JPEGs**, about 105KB each. `earth-scroll.js` constructs
all 240 `Image` objects in a single synchronous loop at startup. The browser then decodes them as they are
first drawn, which produces decode spikes during exactly the early-scroll window where the page most needs
to feel smooth. On a cold cache this is also 26MB of network contention while the user is already
scrolling.

### 3.4 Two independent animation loops

`earth-scroll.js` and `verticals-globe.js` each run their own `requestAnimationFrame` loop. They can
schedule work in the same frame without any coordination, and neither knows what the other is doing.

## 4. The package: Lenis

Use **Lenis** (`https://github.com/darkroomengineering/lenis`), current version 1.3.25.

### Why this one

- **It preserves real scroll position.** Lenis animates the actual document scroll rather than
  transforming a wrapper element. This matters enormously here: the entire hero is
  `position: sticky` inside a `1000vh` stage, and all the progress maths uses
  `stage.getBoundingClientRect()`. Transform-based smooth-scroll libraries — older Locomotive Scroll, for
  instance — move content under a fixed viewport and break both `position: sticky` and
  `getBoundingClientRect()`. Choosing one of those would mean rewriting the entire scroll system.
- **It is small and dependency-free** — roughly 6KB minified, MIT licensed, plain JavaScript with a UMD
  build, so it drops into a no-build static site.
- **The native scrollbar keeps working**, along with keyboard scrolling, `Home`/`End`, and browser find.
- It exposes exactly what we need: a `scroll` event carrying an eased position, and a `raf(time)` method
  we drive from our own loop so everything shares one frame.

### Alternatives considered

- **GSAP ScrollSmoother** — the natural pairing with ScrollTrigger, but it is a Club GreenSock plugin and
  requires a paid membership. Not justified for one page.
- **Locomotive Scroll** — heavier, and its transform-based mode conflicts with our sticky hero.
- **CSS `scroll-behavior: smooth`** — only affects programmatic jumps and anchor links. It does nothing
  for wheel scrolling and would not touch this problem.

### Vendor it, do not use a CDN

Download the UMD build to `assets/vendor/lenis.min.js` and load it with a plain `<script>` tag, matching
how `d3-geo`, `d3-array` and `topojson-client` are already vendored in this project. The homepage's scroll
behaviour should not depend on a third-party CDN being reachable.

### Configuration

Start from these and tune by feel:

```js
const lenis = new Lenis({
  lerp: 0.09,          // damping; lower is smoother and heavier, higher snappier
  wheelMultiplier: 1,
  syncTouch: false,    // leave native inertia alone on touch devices
  anchors: true,       // the About page has in-page anchor links
  autoRaf: false       // we drive raf ourselves — see section 5
});
```

Do not set `duration`. Passing a `duration` flips Lenis into time-based easing and `lerp` stops applying;
for scroll-linked animation the lerp model is the one you want.

## 5. Consolidate into a single frame loop

This is the structural half of the fix and matters as much as the library.

Replace the three scroll listeners and two rAF loops with **one** loop that owns the frame:

```js
function frame(time) {
  lenis.raf(time);            // advances the eased scroll position

  // ---- read phase: no DOM geometry reads here, all values cached ----
  const progress = computeProgress();   // from lenis scroll + cached stage metrics

  // ---- write phase ----
  updateSteps(progress);      // was earth-scroll's onScroll
  updateGlobe(progress);      // was verticals-globe's updateFromScroll
  updateChrome(progress);     // was site.js nav / back-to-top toggles
  drawEarthFrame();           // throttled to the sequence's own fps

  requestAnimationFrame(frame);
}
```

Rules for this loop:

- **No layout reads inside it.** Cache `stage.offsetHeight`, the stage's document offset, `innerHeight`
  and anything else geometric, and recompute them only on `resize` (debounced) and after the frame
  sequence's first draw. `getBoundingClientRect()` must not be called per frame.
- Derive scroll position from Lenis, not `window.scrollY`, so everything reads the same eased value in
  the same frame.
- Keep all DOM writes together, after all reads. Never interleave.
- Skip work that cannot be seen: if step 3's opacity is 0, do not redraw the globe.
- Keep the Earth frame sequence on its own fps throttle inside this loop rather than a separate timer.

`site.js` runs on all three pages, so its scroll work needs to keep functioning on `about.html` and
`contact.html` where there is no stage and no globe. Structure the loop so each participant registers
itself and is simply absent when its elements are not on the page.

## 6. Fix the frame loading

26MB decoded during early scroll will stutter regardless of how good the scroll library is.

- Load the first 30 or so frames eagerly so the hero is alive immediately, then load the remainder in
  small batches during idle time, using `requestIdleCallback` where available with a `setTimeout`
  fallback.
- Set `decoding="async"` and call `img.decode()` where supported, so decode happens off the critical path
  rather than at first paint.
- The loop must degrade gracefully while frames are still arriving: `drawFrame` already returns early for
  an incomplete image, but it should hold the last successfully drawn frame rather than skipping, so the
  animation never flickers.

If stutter persists on a mid-range machine after this, report it with numbers rather than guessing — the
next lever is re-encoding the sequence smaller or halving the frame count, which is a separate task.

## 7. Section pacing and the dead space

The reviewer described "space between scrolls" — stretches where scrolling produces no visible change.
That is a pacing problem, not a smoothness one, and it is worth fixing in the same pass.

The stage is `1000vh` and the current thresholds are: step 1 fades out 0.35–0.45, step 2 runs 0.40–0.74,
step 3 runs 0.76–0.90, and the globe cycles four regions plus a final beat inside step 3's range. So the
entire globe act — the densest part of the page — is compressed into the last quarter of the scroll, while
earlier stretches have comparatively little happening.

Rebalance so each beat gets scroll proportional to how much it has to say. Give the four region rotations
roughly a viewport each, and shorten the quiet stretches. Reduce the total stage height if the result is
shorter; a 1000vh stage is only justified if every part of it is doing something.

Keep the deliberate gap between step 2 clearing and step 3 starting — that was tuned to stop the two
ghosting over each other, and closing it would reintroduce a muddy frame.

**Optional, and check before committing to it:** Lenis's `scrollTo` with `lock: true` can snap to section
boundaries as they are approached. On a long scroll-linked stage this often feels worse than free
scrolling, because it fights the user. Prototype it, judge it honestly, and leave it out if it does not
clearly improve things.

## 8. Accessibility and correctness

- **`prefers-reduced-motion: reduce`** — do not initialise Lenis at all. Fall back to native scrolling and
  the existing reduced-motion path, which renders the sections as a plain stacked page.
- Keyboard scrolling, `Home`/`End`, `Page Up`/`Page Down` and browser find-on-page must all still work.
- The About page's floating section sub-menu and back-to-top control use in-page anchors. `anchors: true`
  handles these; verify each one lands in the right place.
- Touch devices keep native inertia via `syncTouch: false`. Verify scrolling on a real phone viewport, not
  just a desktop browser's device emulation.
- Lenis must be stopped or destroyed if a modal or the mobile menu locks the body, otherwise background
  scrolling continues behind the overlay. Check the existing mobile menu, which sets
  `document.body.style.overflow`.

## 9. Testing

Measure, do not just eyeball:

- Record a performance profile while scrolling the full page. Look for long tasks and for "forced reflow"
  warnings — after this work there should be none originating from our scroll handlers.
- Confirm frame timing stays near the display refresh rate through the whole scroll, including the globe
  act where both canvases are drawing.
- Confirm there is exactly one `requestAnimationFrame` loop and no remaining `scroll` listeners doing
  layout reads.
- Test wheel, trackpad, keyboard and touch separately. A trackpad hides stutter that a discrete mouse
  wheel exposes, so test with a real wheel if one is available.
- Check the whole page on a mid-range machine with the cache disabled, which is where the frame-loading
  problem shows up.
- No console errors. The only expected warning is the known missing Bahrain country id.

## 10. Do not change

- The globe's registration to the photoreal Earth. If the registration work from
  `docs/HANDOFF-R7-GLOBE-REGISTRATION.md` has landed, the shared `earthOnScreen()` transform and its
  calibrated constants must keep working exactly as they do.
- The visual design of any step: copy, the glass card, chips, the globe's styling, the contact rail.
- The region and country data, which is placeholder pending the client.
- The photoreal animation must keep playing continuously and must never be paused or faded.

## 11. Definition of done

- [ ] Lenis vendored at `assets/vendor/lenis.min.js`; no CDN dependency.
- [ ] Configured with `lerp`, not `duration`; `autoRaf: false`.
- [ ] Exactly one `requestAnimationFrame` loop drives Lenis, the steps, the globe and the page chrome.
- [ ] No `scroll` listener performs layout reads; geometry is cached and refreshed on debounced resize.
- [ ] Reads and writes are separated within the frame; no interleaving.
- [ ] Off-screen work is skipped — the globe does not redraw when step 3 is invisible.
- [ ] Frames load progressively; the first batch is eager and the rest arrive during idle time.
- [ ] Scroll beats rebalanced so each region rotation gets meaningful scroll distance and dead stretches
      are removed; the step 2 to step 3 gap is preserved.
- [ ] `prefers-reduced-motion` bypasses Lenis entirely.
- [ ] Keyboard, `Home`/`End`, find-on-page, anchor links and the mobile menu body-lock all verified.
- [ ] Performance profile shows no forced reflows from our handlers and no long tasks during scroll.
- [ ] `site.js` scroll behaviour still works on `about.html` and `contact.html`.
- [ ] Nothing pushed; unpushed commit count reported.
