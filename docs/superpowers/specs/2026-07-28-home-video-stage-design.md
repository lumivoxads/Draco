# Draco home page — fixed video stage with eight snap screens

Date: 28 July 2026
Branch: `design`
Status: approved by the client-side owner, ready for implementation planning

## Problem

The home page today is two stacked sections. The first is a static hero using a
single still frame of the Earth (`assets/earth-frames/dark/frame_0120.jpg`). The
second is `.verticals-pin`, a wrapper 700 viewport-heights tall containing a
sticky child, inside which a d3-geo vector globe rotates through seven region
beats as the user scrolls. Each region beat consumes roughly one viewport-height
of scrolling, and the globe's rotation is dragged directly by the scroll
position, which makes the whole section read as a long scroll-jacked animation.

Two things are wrong with this for what we want:

1. The background is a still image. It should be a continuously playing video
   that stays fixed in place while the content over it changes.
2. Advancing through the regions requires a lot of continuous scrolling, and the
   motion is tied to scroll pixels rather than happening on its own. It should
   instead advance one discrete screen per scroll gesture.

## Goal

One background video that plays continuously and never moves. Over it, eight
discrete full-viewport screens that the user steps through one gesture at a
time: the hero, then one screen per region. The vector globe stays layered on
top and turns to each region as that screen becomes active.

## Locked decisions

| # | Decision |
|---|---|
| 1 | The background is the supplied mp4, positioned fixed, autoplay + muted + loop + playsinline. It never scrolls and never pauses. |
| 2 | The vector globe is layered over the video. Registration between the photoreal Earth and the vector globe is deliberately abandoned. The rotation maths, anchors and `REGIONS` table in `assets/verticals-globe.js` are not to be touched. |
| 3 | Eight screens: hero, then Africa, Asia, Central America, Central Asia, Europe, Middle East, North America. |
| 4 | Native scrolling with CSS scroll snap. The globe tweens to each region on its own timer, not dragged by scroll position. |
| 5 | The page ends on North America. No closing CTA screen, no loop back to the hero. |
| 6 | The video loops by ping-pong: a forward pass followed by its own reverse, encoded into a single file, so the loop point is seamless by construction. |

### Why registration is abandoned

Earlier work (commits `cbe97ad`, `f5adc69`) deliberately locked the vector
globe's rotation so its coastlines lined up with the still Earth at frame 120.
That took considerable iteration and the resulting rotation values are correct
and must be preserved exactly.

A video Earth rotates, so nothing fixed can stay registered to it. Analysis of
the supplied clip confirms the rotation is monotonic — it never returns to a
previous orientation:

| Measure | Value |
|---|---|
| Difference between frames one second apart | 2.0 |
| Best-matching pair of frames at least eight seconds apart | 8.70 (at 68s and 76s) |
| Pairs matching closely enough to loop cleanly | none |

The best available loop point is roughly four times worse than a single second
of natural motion, so trimming the clip to a naturally seamless sub-range is not
possible. Ping-pong is used instead.

Since the two globes cannot stay aligned, the video is dimmed heavily on the
region screens so it reads as an ambient moving texture rather than a second
planet competing with the vector globe. The previous design already dimmed the
Earth to 28 percent visibility behind the globe, so little is lost.

## Video asset

Source: a 1280×720, 30 fps, 76.7 second h264 clip with an unwanted AAC audio
track, 22 MB.

Output: `assets/video/earth-loop.mp4`

| Property | Value |
|---|---|
| Content | first 40 seconds, followed by the same 40 seconds reversed |
| Duration | 80 seconds |
| Resolution | 1280×720, unchanged |
| Encoding | libx264, CRF 30, preset medium, yuv420p, `+faststart` |
| Audio | stripped |
| Size | 3.9 MB |

A test encode at these settings was checked for banding in the dark gradients and
in the night-side city lights. Both hold up; no quality increase is needed.

A poster still is extracted alongside it as `assets/video/earth-poster.jpg`, used
for first paint and as the complete replacement for the video under reduced
motion.

## Layer stack

Four layers. The first three are single fixed instances that live outside the
scrolling content and are never duplicated per section.

| z-index | Element | Behaviour on scroll |
|---|---|---|
| 0 | `<video>`, fixed, `object-fit: cover` | Nothing. Plays continuously. |
| 1 | `.stage-scrim`, fixed, flat dark fill | Opacity 0.15 on the hero, 0.70 on every region screen. |
| 2 | `#globe-canvas`, fixed | Opacity 0 on the hero, 1 on region screens. Rotates to the active region's anchor. |
| 3 | `.screen` content | The hero copy, then seven glass cards, one visible at a time. |

## Scroll model

`<main>` carries `scroll-snap-type: y mandatory`. Each of the eight screens is a
`<section class="screen">` with `height: 100svh` and `scroll-snap-align: start`.
`svh` units are used rather than `vh` so the mobile address bar collapsing does
not shift the snap points.

The `.verticals-pin` wrapper and its 700vh height are removed entirely.

Lenis smooth scrolling and `assets/scroll-loop.js` are removed from
`index.html` only, because inertial smoothing fights scroll snapping. `about.html`
and `contact.html` keep both and are not otherwise affected by this work.

## Region cards

All seven region cards are written into the markup as static HTML rather than
being rebuilt through `innerHTML` when the active region changes. Each card fades
in as its screen becomes active.

This removes the DOM rebuild path, means every region's content is present for
search engines and for users without JavaScript, and gives the click-to-expand
detail behaviour a stable element to bind to.

## Globe driver change

This is the only change permitted inside `assets/verticals-globe.js`.

Today the module reads a 0-to-1 scroll progress value for its section, converts
it into a fractional beat index, and derives the globe's rotation and each
region's highlight weight from that fraction every frame.

It will instead expose `setActiveRegion(index)`. That function sets the target
rotation to `anchorToRotation(REGIONS[index].anchor)` — the existing function,
with the existing anchor values — and eases the current rotation toward it over
roughly 700 milliseconds on a time-based tween. Region highlight weights are set
the same way, easing toward 1 for the active region and 0 for the rest.

Everything else stays exactly as it is: the `REGIONS` table, the anchor
coordinates, `anchorToRotation`, the interpolation helper, the highlight weight
model, the per-frame render loop, and all drawing and colour code.

## New module: `assets/home-stage.js`

Owns everything that reacts to which screen is active.

- An `IntersectionObserver` over the eight screens, firing at a 0.5 threshold,
  determines the active screen index.
- On a change of index it sets the scrim opacity, sets the globe canvas opacity,
  fades the outgoing and incoming region card, and calls
  `setActiveRegion(index - 1)` for region screens.
- It is the sole consumer of the globe's public API. No other module drives the
  globe.

## Files

| File | Action |
|---|---|
| `index.html` | Restructure `<main>` into the fixed stage plus eight snap screens. Remove the Lenis and `scroll-loop.js` script tags. Remove the `.verticals-pin` markup and its CSS. |
| `assets/video/earth-loop.mp4` | New. Encoded from the supplied source as specified above. |
| `assets/video/earth-poster.jpg` | New. Poster still. |
| `assets/home-stage.js` | New. Active-screen observer and stage state. |
| `assets/verticals-globe.js` | Replace the scroll-progress driver with `setActiveRegion(index)`. No other change. |
| `assets/vertical-detail-preview.js` | Retarget from the single rebuilt card to the seven static cards. |

## Reduced motion

When the user's operating system requests reduced motion:

- Scroll snapping is disabled.
- The video is not played; the poster still is shown in its place.
- All eight screens stack in normal document flow at their natural height.
- All seven region cards are visible simultaneously, with no fading.
- The globe falls back to the existing reduced-motion behaviour already in
  `verticals-globe.js`, which lights every region at once.

## Out of scope

- Any change to `about.html` or `contact.html`.
- Any change to the vector globe's anchors, rotation values or drawing code.
- The 240-frame still sequence in `assets/earth-frames/` and
  `assets/earth-loop.js`. They become unused by the home page but are not deleted
  in this piece of work.
- A closing CTA screen or footer on the home page.

## Acceptance criteria

1. The video plays continuously from page load and its position on screen never
   changes as the user scrolls.
2. The loop point is not visible.
3. One scroll gesture, one swipe, or one arrow-key press advances exactly one
   screen.
4. Scrolling from the hero to Africa dims the video and fades the vector globe
   in.
5. Each region screen shows that region's glass card, and the globe is turned to
   that region's anchor, at the same rotation values the current build produces.
6. Scrolling stops at North America.
7. The browser scrollbar, keyboard navigation, and the browser back button all
   behave normally.
8. Under reduced motion the page is a plain stacked document with no video and no
   snapping.
