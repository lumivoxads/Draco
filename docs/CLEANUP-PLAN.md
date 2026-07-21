# Draco — repository cleanup plan

**Status:** planned, not started. To be executed **after the R3 globe work is built and reviewed**, and
not before. Several items on this list are only safe to remove once the globe design is signed off,
because they are the fallback if it is rejected.

## Why now

The repository has accumulated three distinct layers of history: an original pre-Cunnet build, the
Cunnet-themed rebuild that replaced it, and the agent scratch from the round-1 and round-2 handoffs.
Roughly 60MB of a 100MB repository is no longer referenced by any page that ships, and two of the
markdown documents at the root actively describe an architecture that no longer exists — which is worse
than clutter, because anyone reading them will be misled.

## Preconditions

Do not start until all of these are true:

1. The R3 globe treatment is built, reviewed, and accepted.
2. The current uncommitted work (rounds 1 and 2) is committed, so there is a restore point. At the time
   of writing, `git status` shows seven modified files and no commits since `b80caec` — everything since
   then exists only in the working tree.
3. The cleanup runs on its own branch, as a series of small commits grouped by category, so any single
   removal can be reverted without unpicking the rest.

After each group, serve the site locally and load all three pages with the browser console open. A
missing stylesheet or a 404 on a frame will show up immediately; a slow visual regression will not, so
also compare against screenshots from the R3 review.

## Group 1 — Agent scratch

Already excluded from git via `.gitignore`, so this is about reclaiming disk, not protecting the repo.

| Path | Size | Notes |
|---|---|---|
| `node_modules/` | 29M | Puppeteer, installed by the round-2 agent for screenshots |
| `package.json`, `package-lock.json` | — | Exist only to declare that Puppeteer dependency |
| `screenshot.js` | 43 lines | One-off screenshot harness pointed at the lab page |
| `generate_lab.py` | 380 lines | A Python script whose only job was to emit `verticals-lab.html` once. The lab page does not depend on it at runtime |
| `.playwright-mcp/` | 4.0M | Screenshot captures from the browser tooling |
| `docs/.DS_Store` | — | Stray macOS metadata |

This site has no build step and should not acquire one. If screenshot tooling is needed again, it belongs
outside the repository.

**Recovers roughly 33MB. No risk — nothing that ships references any of it.**

## Group 2 — The pre-Cunnet build

The site was originally built with a separate stylesheet and script structure, then rebuilt on the Cunnet
dark-and-gold theme in commit `6cb721c`. The original files were never removed.

| Path | Size | Evidence it is dead |
|---|---|---|
| `css/base.css`, `css/home.css`, `css/pages.css` | 1,035 lines | No `<link>` in any of the four HTML files references the `css/` directory |
| `js/main.js`, `js/scroll-hero.js` | 385 lines | No `<script>` in any HTML file references the `js/` directory |
| `assets/frames/` | 5.2M | Referenced only by `README.md` and `PLATFORM_OVERVIEW.md`, both of which are themselves stale. The live pages use `assets/earth-frames/dark/` |
| `assets/earth-frames/dark-prev-earth/` | 210 frames | A superseded frame sequence. Already listed in `.gitignore`, so it is untracked, but still on disk |

Verify before deleting by grepping the four HTML files for each path. The check is cheap and the
consequence of getting it wrong is a broken homepage.

**Recovers roughly 10MB plus 1,400 lines of dead source.**

## Group 3 — Stale documentation

`README.md` and `PLATFORM_OVERVIEW.md` describe the pre-Cunnet architecture in detail: a frame sequence
at `assets/frames/frame_0001.webp`, a `FRAME_CONFIG.count` of zero, and a homepage hero built from a CSS
gradient on `.hero__background`. None of that is true any more. The homepage now runs a 240-frame JPEG
sequence from `assets/earth-frames/dark/`, and after R3 it will also carry a WebGL globe.

These are the most damaging items on the list, because they read as authoritative and will send the next
person — human or agent — down a path that does not exist.

Rewrite rather than delete. The README should describe the site as it actually is: four pages, no build
step, the Cunnet-derived theme in `assets/site.css`, the Earth frame sequence, the contact rail, and the
globe. `PLATFORM_OVERVIEW.md` was written as a brief for designers and developers; either update it to
match or fold the parts still worth keeping into the README and remove it.

`CUNNET-HERO-REPURPOSE.md` documents the theme derivation and is still accurate — leave it.

## Group 4 — The template directory

`template/` is 33MB and is the vendored Cunnet HTML theme, kept as the base the site was built from. Only
three files in it are actually referenced by the live pages:

- `template/assets/css/font-awesome-pro.css`
- `template/assets/css/main.css`
- `template/assets/img/logo/favicon.png`

Of that 33MB, roughly 20MB is `template/assets/img` — demo imagery from the theme that no page uses — and
2.5MB is `template/assets/js`, none of which is loaded.

This is the largest single win available, but it is also the one that needs real care, because
`main.css` and `font-awesome-pro.css` will reference fonts and possibly background images by relative
path. The safe sequence is:

1. Audit `main.css` and `font-awesome-pro.css` for every `url()` they contain and build the list of
   assets actually reachable from them.
2. Keep `template/assets/fonts` (4.1MB) unless the audit proves otherwise — Font Awesome Pro and the
   Sequel Sans display face both live there and both are in active use.
3. Remove `template/assets/js` and the unreferenced portion of `template/assets/img`.
4. Consider going further: extract only the rules the site actually uses out of `main.css` into
   `assets/site.css` and drop the vendored theme entirely. This is the cleanest end state but it is a
   project in itself, not a cleanup task — treat it as optional and separate.

**Recovers up to 22MB at step 3, more if step 4 is ever done.**

## Group 5 — Round-2 and round-3 artefacts

Only once the globe is accepted:

| Path | When to remove |
|---|---|
| `verticals-lab.html` | After the globe is signed off. Until then it is the fallback if the globe is rejected — it holds four working alternative treatments |
| `docs/HANDOFF-R2-VERTICALS-LAB.md` | Same. It is already marked superseded by the R3 document |
| `assets/earth-scroll.js` or `assets/earth-loop.js` | R3 may consolidate these. Whichever the finished homepage does not load should go — check the `<script>` tags in `index.html` after the globe lands |

Keep `docs/CLIENT-FEEDBACK-R1.md`. It is the record of what the client asked for and why, and it will be
needed again at the next review round.

## Group 6 — Large media

| Path | Size | Recommendation |
|---|---|---|
| `assets/0_Earth_Planet_3840x2160.mp4` | 20M | Source video for the Earth frame sequence. Referenced by nothing. Already gitignored |
| `assets/A_photorealistic_cinematic_sh.mp4` | 2.5M | Same |
| `moodboard/` | 4.5M | Three reference screenshots plus `REFERENCES.md`, from the superseded ice-blue design direction |

The videos are the sources the committed frames were rendered from, so do not delete them outright —
move them somewhere outside the repository where they can be found again if the frames ever need
re-rendering at a different length or resolution.

The moodboard belongs to a design direction that was abandoned when the client chose the Cunnet theme.
It has historical value only. Move it out alongside the videos rather than deleting it.

## Group 7 — After client sign-off

`index-loop.html` is now a twelve-line redirect stub kept alive solely because the client's review
document links to it. Once the client has finished with that document and confirmed the round-2 changes,
delete the file and remove the explanatory comment from `sitemap.xml`.

## Expected result

| Group | Recovered |
|---|---|
| 1 — Agent scratch | ~33MB |
| 2 — Pre-Cunnet build | ~10MB, 1,400 lines |
| 3 — Stale docs | Nothing in bytes; removes the main source of confusion in the repository |
| 4 — Template audit | up to ~22MB |
| 5 — Round artefacts | small |
| 6 — Large media | ~27MB moved out of the working tree |

The shipping site is four files of HTML, one stylesheet, one script, the Earth frame sequence, the globe
vendor file, the logo and icons — and after R3, nothing else.

## Final verification

- All three live pages load with no console errors and no failed network requests.
- All 240 Earth frames still resolve.
- The globe initialises and rotates.
- Font Awesome icons render everywhere they are used, including the contact rail.
- The display typeface still loads — a missing font file is the most likely casualty of the template
  audit and the easiest to miss, because the fallback stack will quietly substitute Inter.
- `sitemap.xml` and `llms.txt` match the pages that actually exist.
