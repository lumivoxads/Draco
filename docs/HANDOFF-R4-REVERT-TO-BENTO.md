# Handoff prompt — Draco, remove the WebGL globe and ship the glass bento

This supersedes `docs/HANDOFF-R3-GLOBE-VERTICALS.md`. The globe direction has been rejected. Do not build
it, do not try to improve it — remove it.

Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro. **Why this tool:** a removal plus a layout port that has
to be judged by eye against a moving background, so it needs a browser in the loop.

**Setup:** repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, branch `design`. Static
site, no build step, no package manager. Serve with `python3 -m http.server 8000` from the repo root.

**Important:** nothing in this repository is committed. Every change from the last three rounds exists
only in the working tree, and the last commit predates all of it. **Commit the current state to a branch
before you change anything**, so this removal can be undone.

## 2. What went wrong, so you do not repeat it

The homepage's final scroll section — Verticals & Geographies — was built as a WebGL globe using the
`cobe` library. The intent was a dot-matrix globe with countries picked out in gold, rotating region by
region as the visitor scrolls, with a card appearing alongside.

What it actually produces is a near-black sphere with a few small dots on it. There is no visible
landmass, no country definition, nothing that reads as a map. In the reviewer's words, it is "a black
blob with just pinpoints on it". cobe's dotted map simply does not have the definition this design needs
at this size and on this dark a background, and tuning its brightness parameters has already been tried
without success.

**The decision is to abandon the globe entirely and ship the glass bento treatment instead.** That
treatment already exists, already works, and already looks right.

## 3. Objective

Two pieces of work:

1. **Remove every trace of the WebGL globe** from the homepage.
2. **Port the glass bento treatment** — Option A from the existing design lab — into the homepage as the
   third and final scroll step, sitting over the photoreal Earth animation.

The photoreal Earth-and-moon animation stays exactly as it is: playing continuously, visible behind all
three scroll steps including the bento, from the first viewport to the last. It is never faded out, never
paused, never replaced. That crossfade behaviour is part of what gets deleted.

## 4. Remove the globe

Delete these files:

- `assets/verticals-globe.js`
- `assets/vendor/cobe.js` (and the now-empty `assets/vendor/` directory)

Remove from `index.html`:

| Line (approx) | What |
|---|---|
| 52 | `canvas#cobe-canvas { … }` style rule |
| 53 | `canvas#connector-canvas { … }` style rule |
| 157 | `canvas#connector-canvas { display: none !important; }` inside the mobile media query |
| 239 | `<canvas id="cobe-canvas" aria-hidden="true"></canvas>` |
| 240 | `<canvas id="connector-canvas" aria-hidden="true"></canvas>` |
| 298 | `<script type="module" src="assets/verticals-globe.js"></script>` |

Also remove any CSS added for the globe's side panel — the `#verticals-panel`, `#region-name`,
`#verticals-chips` and `.v-chip` rules — unless you reuse those class names in the bento, in which case
reconcile them rather than leaving two competing definitions.

In `assets/earth-scroll.js`, the `window.DracoEarth` object exposes `pause` and `resume`. Those existed
only so the globe could stop the frame loop during its crossfade. With the globe gone nothing calls them.
Leave the object in place but make sure `pause` is never set true anywhere, so the Earth animation runs
continuously for the whole page. Do not remove the repaint-after-resize behaviour in `resize()` — that
fixes a real bug where the canvas is cleared by a resize and never redrawn.

Afterwards, grep the whole repository for `cobe`, `globe`, `connector-canvas` and `verticals-globe` and
confirm the only remaining hits are in the `docs/` markdown files, which are historical records.

## 5. Port the glass bento

The treatment to port is **Option A** in `verticals-lab.html` — the reviewer has seen it rendered and
approved it. Read that file and lift the Option A markup and its `.opt-a` CSS.

What it looks like: an asymmetric grid of frosted-glass cards over the Earth. Each card is a region, with
the region name in uppercase display type, a gold hairline rule beneath it, and the verticals as
gold-outlined pill chips. **Middle East is the featured card**, spanning two columns and two rows, so the
grid has a focal point rather than reading as four equal boxes. Cards stagger in on entry with roughly an
80ms offset each.

Place it in `index.html` inside the existing `<div class="overlay step-3">` block, replacing whatever is
there now. Keep the section head that is already in the lab version:

- eyebrow: "Where we operate"
- heading: "Verticals & geographies"

Do **not** carry across the lab's `.panel-tag` label ("Option A — Glass Bento") or the `.panel-note`
block underneath — those are lab chrome and have no place on the live site.

The region data stays as it is — placeholder, awaiting the client, who said they are "working on this and
will share":

| Region | Verticals |
|---|---|
| Middle East | Retail · Hospitality · Fuel & Energy · Banking & Financial Services |
| Europe | Automotive · Telecommunications · E-Commerce |
| Asia Pacific | Restaurants & Cafés · Healthcare · Lifestyle |
| Americas | Entertainment · Enterprise Organisations |

Keep it in a single data structure with a comment marking it as placeholder, so the real data is one edit
when it arrives. Nothing may be hard-coded to four regions or to these vertical counts.

## 6. Scroll behaviour

The existing three-step choreography in `assets/earth-scroll.js` stays. Step 1 is the headline, step 2 is
the Rumi quote with its call-to-action line, step 3 is now the bento. Step 3 currently fades in over the
progress range 0.75 to 0.90 — keep that, and add the per-card stagger on top so the cards arrive in
sequence rather than as a block.

The page ends on the bento. There is no footer and no closing panel.

Two things to check now that the globe's scroll length is gone:

- `.stage` is currently `height: 1000vh`. That was stretched to give the globe room to rotate through
  four regions. With the globe gone it is far too long — the visitor will scroll through several dead
  viewports after the bento has finished appearing. Bring it back to something proportionate; the
  choreography in `earth-scroll.js` is paced against `innerHeight * 5`, so `600vh` (its original value)
  is the natural fit. Verify by scrolling: the bento should be fully in place shortly before the page
  bottoms out, with no long empty tail.
- The `.scroll-hint` should still fade out early, as it does now.

## 7. Legibility over the animation

This is the one real design risk. The bento sits over a bright, moving photoreal Earth, and the Earth's
lit limb is much brighter than the space around it.

The existing `.grade` and `.scrim` overlays already darken the composition — keep them. The reviewer also
asked for the background to read as "Earth with a black overlay on top", so if the cards still fight the
animation, deepen the scrim behind the bento specifically rather than making the cards more opaque. The
glass has to stay glass: the Earth should remain faintly visible through the cards, because that is what
ties the section to the hero.

Step through the frame sequence and check the cards against the brightest frames, not just the dark ones.

## 8. Theme

Everything comes from the custom properties already in `assets/site.css`. Introduce no new colours.

```
--d-bg #06070a   --d-bg2 #0e1116   --d-panel #0c0f14
--d-fg #f4f6f8   --d-muted 60%     --d-dim 42%
--d-line 12%     --d-line-2 18%
--d-accent #c9a96a   --d-accent-dim rgba(201,169,106,.14)
--d-ff-disp (display, uppercase)   --d-ff-body (Inter)
```

Gold stays an accent — hairlines, chip borders, the rule under each region name. Never a large gold fill.

## 9. Fallbacks

- **`prefers-reduced-motion: reduce`** — no card stagger, no fade. The Earth holds on a single frame and
  the bento renders as a plain stacked column of cards. This must be a complete, readable section.
- The globe's WebGL feature detection and its no-WebGL fallback both disappear with the globe. The bento
  is plain HTML and CSS, so there is nothing left to detect.

## 10. Testing

- No console errors on any page. In particular, no 404 for `verticals-globe.js` or `cobe.js`, and no
  reference to a canvas that no longer exists.
- All 240 Earth frames still load, and the animation runs continuously from the top of the page to the
  bottom without ever pausing or fading.
- Scrolling down and back up returns cleanly to the opening state.
- The other three pages — `about.html`, `contact.html`, `index-loop.html` — are unaffected.

## 11. Visual testing

Screenshot: the homepage at first paint; each of the three scroll steps fully in view; the bento mid
stagger; the bento over one of the brightest frames of the animation; and the reduced-motion fallback.
Capture at 1280px and 375px.

## 12. Responsiveness

Test at 375px, 768px, 1280px and 1920px. The bento collapses to a single column on mobile, and the
featured Middle East card stops spanning. Confirm the grid never pushes the page into horizontal scroll,
and that the cards clear the floating contact rail in the bottom-right corner at every width.

## 13. Repository cleanup

Do this **after** the bento is ported and verified working, never before — several items below are the
only copy of things you need during the port. Run it as its own commit, or a few small commits grouped by
category, separate from the code change. After each group, reload all three pages with the console open.

The fuller reasoning is in `docs/CLEANUP-PLAN.md`; this is the executable version.

### 13.1 Agent scratch

Already covered by `.gitignore`, so this is disk, not repository hygiene. Delete:

| Path | Size | What it is |
|---|---|---|
| `node_modules/` | 29M | Puppeteer, installed by an earlier agent for screenshots |
| `package.json`, `package-lock.json` | — | Exist only to declare that dependency |
| `screenshot.js` | — | One-off screenshot harness pointed at the lab page |
| `generate_lab.py` | — | A script whose only job was to emit `verticals-lab.html` once. Nothing depends on it at runtime |
| `.playwright-mcp/` | 4.0M | Screenshot captures |
| `docs/.DS_Store` | — | Stray macOS metadata |

This site has no build step and must not acquire one. If you need screenshot tooling, keep it outside the
repository.

### 13.2 The pre-Cunnet build

The site was rebuilt on the Cunnet dark-and-gold theme in commit `6cb721c`; the original files were never
removed. Confirm each is unreferenced with a grep across the four HTML files before deleting — the check
is cheap and the cost of getting it wrong is a broken page.

| Path | Size | Evidence it is dead |
|---|---|---|
| `css/base.css`, `css/home.css`, `css/pages.css` | 1,035 lines | No `<link>` in any HTML file references `css/` |
| `js/main.js`, `js/scroll-hero.js` | 385 lines | No `<script>` in any HTML file references `js/` |
| `assets/frames/` | 5.2M | Referenced only by the two stale markdown files below. The live pages use `assets/earth-frames/dark/` |
| `assets/earth-frames/dark-prev-earth/` | 210 frames | A superseded sequence, already gitignored but still on disk |

### 13.3 Round artefacts

Now safe to remove, because the direction is settled and the bento has been ported out of the lab:

- `verticals-lab.html` — **delete only after the bento is working in `index.html`**. It is the source you
  are porting from.
- `docs/HANDOFF-R2-VERTICALS-LAB.md` and `docs/HANDOFF-R3-GLOBE-VERTICALS.md` — both superseded.

Keep `docs/CLIENT-FEEDBACK-R1.md`. It is the record of what the client asked for and why, and it will be
needed at the next review round. Keep `CUNNET-HERO-REPURPOSE.md` — it documents the theme derivation and
is still accurate.

### 13.4 Stale documentation — the most important item here

`README.md` and `PLATFORM_OVERVIEW.md` describe the pre-Cunnet architecture in detail: a frame sequence
at `assets/frames/frame_0001.webp`, a `FRAME_CONFIG.count` of zero, and a hero built from a CSS gradient
on `.hero__background`. None of that has been true since `6cb721c`.

This recovers no disk space at all and is still the highest-value item on the list, because both files
read as authoritative and will send the next reader — human or agent — down a path that does not exist.

Rewrite the README to describe the site as it actually is: three live pages plus a redirect stub, no
build step, the Cunnet-derived theme in `assets/site.css`, the 240-frame Earth sequence in
`assets/earth-frames/dark/`, the three-step scroll choreography, the floating contact rail, and the glass
bento. Either update `PLATFORM_OVERVIEW.md` the same way or fold whatever is still worth keeping into the
README and delete it.

### 13.5 Large media — move, do not delete

| Path | Size | Why it stays somewhere |
|---|---|---|
| `assets/0_Earth_Planet_3840x2160.mp4` | 20M | Source video the committed frames were rendered from. Referenced by nothing, already gitignored |
| `assets/A_photorealistic_cinematic_sh.mp4` | 2.5M | Same |
| `moodboard/` | 4.5M | Reference screenshots from the abandoned ice-blue direction. Historical value only |

Move these out of the repository to a sibling folder rather than deleting them. The videos are the only
way to re-render the frame sequence at a different length or resolution.

### 13.6 The template directory — audit, do not blind-delete

`template/` is 33M of vendored Cunnet theme. Only three files in it are referenced by the live pages:
`template/assets/css/font-awesome-pro.css`, `template/assets/css/main.css`, and
`template/assets/img/logo/favicon.png`.

Roughly 20M is `template/assets/img` (theme demo imagery, unused) and 2.5M is `template/assets/js`
(never loaded). Before removing either, list every `url()` in the two stylesheets and keep everything
reachable from them. **Keep `template/assets/fonts` (4.1M)** unless the audit proves otherwise — Font
Awesome Pro and the Sequel Sans display face both live there and both are in active use.

A missing font file is the most likely casualty of this step and the easiest to miss, because the
fallback stack quietly substitutes Inter. Check the display headings by eye afterwards.

Do not attempt to extract the used rules out of `main.css` and drop the vendored theme entirely. That is
a worthwhile end state but it is a project of its own, not part of this task.

### 13.7 Not now

`index-loop.html` stays. It is a twelve-line `noindex` redirect kept alive because the client's review
document links to it, and they are still working off that document. It goes after client sign-off, along
with the explanatory comment in `sitemap.xml`.

### 13.8 Verify after cleanup

- All three live pages load with no console errors and no failed network requests.
- All 240 Earth frames resolve.
- Font Awesome icons render everywhere, including the contact rail.
- The display typeface still loads — compare a heading against a screenshot taken before the cleanup.
- `sitemap.xml` and `llms.txt` match the pages that actually exist.

## 14. Definition of done

- [ ] The current state is committed to a branch before any deletion.
- [ ] `assets/verticals-globe.js` and `assets/vendor/cobe.js` are gone.
- [ ] No `cobe-canvas`, `connector-canvas`, or globe script tag remains in `index.html`.
- [ ] A repository-wide grep for `cobe` and `verticals-globe` returns hits only in `docs/`.
- [ ] The Earth animation plays continuously behind all three steps and is never paused or faded.
- [ ] The glass bento is the third scroll step, with Middle East featured and cards staggering in.
- [ ] No lab chrome — no option tag, no notes block.
- [ ] Region data sits in one placeholder-marked structure, tolerant of a different shape.
- [ ] `.stage` height is proportionate; no dead scroll after the bento.
- [ ] Cards are legible over the brightest frames.
- [ ] Reduced-motion renders a complete stacked section.
- [ ] Screenshots captured at both breakpoints for every state in section 11.
- [ ] Steps 1 and 2, all approved copy, and the other three pages are untouched.

Cleanup, as a separate commit and only once the above is verified:

- [ ] Agent scratch removed: `node_modules/`, `package*.json`, `screenshot.js`, `generate_lab.py`,
      `.playwright-mcp/`, `docs/.DS_Store`.
- [ ] Pre-Cunnet build removed after grep confirmation: `css/`, `js/`, `assets/frames/`,
      `assets/earth-frames/dark-prev-earth/`.
- [ ] `verticals-lab.html` deleted — and only after the bento works in `index.html`.
- [ ] `docs/HANDOFF-R2-VERTICALS-LAB.md` and `docs/HANDOFF-R3-GLOBE-VERTICALS.md` deleted.
- [ ] `docs/CLIENT-FEEDBACK-R1.md` and `CUNNET-HERO-REPURPOSE.md` kept.
- [ ] `README.md` rewritten to match the site as built; `PLATFORM_OVERVIEW.md` updated or folded in.
- [ ] `assets/*.mp4` and `moodboard/` moved outside the repository, not deleted.
- [ ] `template/assets/js` and the unreferenced part of `template/assets/img` removed after a `url()`
      audit; `template/assets/fonts` kept.
- [ ] `index-loop.html` left in place.
- [ ] Post-cleanup verification in section 13.8 passes, including the display typeface check.
