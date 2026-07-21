# Handoff prompt — Draco, repository cleanup

The vector-geometry globe from `docs/HANDOFF-R5-VECTOR-GLOBE.md` is built and accepted. The design of the
Verticals & Geographies section is now settled, which unblocks the cleanup that has been deferred through
the last four rounds.

Paste everything below this line into Antigravity as the opening message.

---

## 1. Routing

**Tool:** Antigravity, or Cursor — either is fine. This is deletion and documentation work, not design.
**Model:** whatever is cheapest that follows instructions carefully. There is no visual judgement needed,
but there is a lot of "verify before you delete".

**Setup:** repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco`, branch `design`. Static site,
no build step, no package manager. Serve with `python3 -m http.server 8000` from the repo root.

## 2. Objective and the one rule

The repository has accumulated three layers of history: an original pre-Cunnet build, the Cunnet-themed
rebuild that replaced it, and agent scratch from four rounds of design work. Roughly 60MB of a 100MB
repository is referenced by nothing that ships, and two markdown files at the root actively describe an
architecture that no longer exists.

**The one rule: verify before you delete.** For every path below, grep the four HTML files and the
`assets/*.js` files for it first. The check costs seconds; a wrong deletion breaks the homepage. If a grep
turns up a reference you did not expect, stop and report it rather than deleting anyway.

**Commits.** The R5 globe work is committed at `93f8c37`, on top of a pre-R5 snapshot at `9b5a71c`. That
is your restore point — verify with `git log --oneline -3` before starting, and if the working tree is
dirty, commit it first so the cleanup starts from a clean state.

Then do the cleanup as a series of small commits grouped by the sections below, so any single group can be
reverted without unpicking the rest. Suggested grouping, one commit each:

1. Remove agent scratch and build tooling (section 4)
2. Remove the superseded pre-Cunnet build (section 5)
3. Remove superseded design-round artefacts (section 6)
4. Rewrite the project documentation (section 7)
5. Move large media out of the repository (section 8)
6. Prune the unused portion of the vendored theme (section 9)

Write real commit messages in full plain English — say what was removed and why it was safe to remove,
not just "cleanup". Anyone reading `git log` in six months should be able to tell whether a deleted file
is recoverable and why it went.

After each group, reload all three live pages with the browser console open and confirm no errors and no
failed network requests.

## 3. What ships, so you know what is load-bearing

The live site is:

- `index.html` — the homepage. Photoreal Earth frame animation, three scroll steps (headline, quote
  call-to-action, vector globe with per-region glass cards).
- `about.html`, `contact.html`
- `index-loop.html` — a twelve-line `noindex` redirect stub
- `assets/site.css`, `assets/site.js` — shared theme and the floating contact rail
- `assets/earth-scroll.js` — the frame loop and scroll choreography
- `assets/verticals-globe.js` — the globe
- `assets/vendor/` — `d3-geo.min.js`, `d3-array.min.js`, `topojson-client.min.js`, `countries-110m.json`
- `assets/earth-frames/dark/` — 240 JPEG frames
- `assets/logo/`, `assets/icons/`, `assets/og-image.jpg`
- `template/assets/css/font-awesome-pro.css`, `template/assets/css/main.css`,
  `template/assets/img/logo/favicon.png`, and the fonts those stylesheets reach for
- `sitemap.xml`, `robots.txt`, `llms.txt`

Anything not on that list is a candidate for removal, subject to the grep.

## 4. Agent scratch

Already covered by `.gitignore`, so this is disk space rather than repository hygiene. Delete:

| Path | Size | What it is |
|---|---|---|
| `node_modules/` | 29M | Puppeteer, installed by an earlier agent for screenshots |
| `package.json`, `package-lock.json` | — | Exist only to declare that dependency |
| `screenshot.js` | — | One-off screenshot harness pointed at the old design lab |
| `generate_lab.py` | — | A script whose only job was to emit `verticals-lab.html` once |
| `.playwright-mcp/` | ~10M | Screenshot and console captures from browser tooling |
| `docs/.DS_Store` | — | Stray macOS metadata |

This site has no build step and must not acquire one. If screenshot tooling is needed again it belongs
outside the repository.

## 5. The pre-Cunnet build

The site was rebuilt on the Cunnet dark-and-gold theme in commit `6cb721c`. The original files were never
removed and nothing has referenced them since.

| Path | Size | Expected grep result |
|---|---|---|
| `css/base.css`, `css/home.css`, `css/pages.css` | 1,035 lines | No `<link>` in any HTML file references `css/` |
| `js/main.js`, `js/scroll-hero.js` | 385 lines | No `<script>` in any HTML file references `js/` |
| `assets/frames/` | 5.2M | Referenced only by the two stale markdown files in section 7. The live pages use `assets/earth-frames/dark/` |
| `assets/earth-frames/dark-prev-earth/` | 210 frames | A superseded sequence, already gitignored but still on disk |

## 6. Round artefacts

Now safe, because the globe has shipped and the design is settled.

**`verticals-lab.html`** — the four-option design lab. Delete it. Confirm first that nothing references
it: the globe's own bento fallback in `assets/verticals-globe.js` builds its DOM in code and does **not**
load this file, so removing it does not weaken the fallback path. Verify that with a grep for
`verticals-lab` across `index.html` and `assets/*.js` before deleting.

Delete these superseded handoff documents:

- `docs/HANDOFF-R2-VERTICALS-LAB.md` — the four-option lab brief
- `docs/HANDOFF-R3-GLOBE-VERTICALS.md` — the cobe/WebGL globe attempt, abandoned
- `docs/HANDOFF-R4-REVERT-TO-BENTO.md` — the fallback plan, never executed
- `docs/CLEANUP-PLAN.md` — superseded by this document

Keep:

- `docs/CLIENT-FEEDBACK-R1.md` — the record of what the client asked for and why. Needed at the next
  review round.
- `docs/HANDOFF-R1-ANTIGRAVITY.md` and `docs/HANDOFF-R5-VECTOR-GLOBE.md` — between them these describe
  what was actually built and why. Treat them as the design record.
- `CUNNET-HERO-REPURPOSE.md` — documents the theme derivation, still accurate.

## 7. Stale documentation — the highest-value item here

`README.md` and `PLATFORM_OVERVIEW.md` describe the pre-Cunnet architecture in detail: a frame sequence
at `assets/frames/frame_0001.webp`, a `FRAME_CONFIG.count` of zero, and a homepage hero built from a CSS
gradient on `.hero__background`. None of that has been true since `6cb721c`.

This recovers no disk space and is still the most valuable thing on the list, because both files read as
authoritative and will send the next reader — human or agent — down a path that does not exist.

Rewrite `README.md` to describe the site as it actually is. It should cover: the three live pages plus the
redirect stub; that there is no build step and the site is served as static files; the Cunnet-derived
theme and its custom properties in `assets/site.css`; the 240-frame Earth sequence and how
`earth-scroll.js` drives it; the three-step scroll choreography and where each step's thresholds live; the
vector globe, its vendored d3 dependencies, and the placeholder region data awaiting the client; and the
floating contact rail. Keep it practical — what someone needs to know to work on this safely.

For `PLATFORM_OVERVIEW.md`, either update it the same way or fold anything still worth keeping into the
README and delete it. It was written as a brief for designers and developers before the rebuild, so most
of it no longer applies.

## 8. Large media — move, do not delete

| Path | Size | Why it must survive somewhere |
|---|---|---|
| `assets/0_Earth_Planet_3840x2160.mp4` | 20M | The source video the committed frames were rendered from |
| `assets/A_photorealistic_cinematic_sh.mp4` | 2.5M | Same |
| `moodboard/` | 4.5M | Reference screenshots from the abandoned ice-blue direction |

Move these to a sibling folder outside the repository rather than deleting them. The videos are the only
way to re-render the frame sequence at a different length or resolution, and that capability should not
be thrown away to save disk.

Report where you moved them.

## 9. The template directory — audit, do not blind-delete

`template/` is 33M of vendored Cunnet theme. Only three files in it are referenced directly by the live
pages: `template/assets/css/font-awesome-pro.css`, `template/assets/css/main.css`, and
`template/assets/img/logo/favicon.png`.

Roughly 20M is `template/assets/img` (theme demo imagery) and 2.5M is `template/assets/js` (never
loaded). Before removing either:

1. List every `url()` reference in those two stylesheets and resolve each to a path.
2. Keep everything reachable from that list.
3. **Keep `template/assets/fonts` (4.1M) unless the audit positively proves a file is unused.** Font
   Awesome Pro and the Sequel Sans display face both live there and both are in active use.
4. Then remove `template/assets/js` and the unreferenced portion of `template/assets/img`.

A missing font file is the most likely casualty of this step and the easiest to miss, because the CSS
fallback stack quietly substitutes Inter and the page still "works". Take a screenshot of a display
heading before this step and compare after.

Do **not** attempt to extract the used rules out of `main.css` and drop the vendored theme entirely. That
is a worthwhile end state but it is a project of its own, not part of this task.

## 10. Leave alone

- `index-loop.html` — a twelve-line `noindex` redirect kept alive because the client's review document
  links to it and they are still working from that document. It goes after client sign-off, together with
  the explanatory comment in `sitemap.xml`.
- `assets/vendor/` — all four files are load-bearing for the globe. `d3-array.min.js` in particular looks
  like it could be surplus but is not: `d3-geo` declares it as an external dependency and the UMD build
  does not bundle it.
- The `.gitignore` entries added for the scratch files. Leaving them costs nothing and prevents the same
  accumulation next time.

## 11. Verification when finished

- All three live pages load with no console errors and no failed network requests.
- The homepage still shows: the Earth animation playing, the headline, the quote step, and the globe
  cycling through all four regions with cards.
- All 240 Earth frames resolve.
- The globe's country topology loads and the only console warning is the known missing Bahrain id.
- Font Awesome icons render everywhere, including the floating contact rail.
- The display typeface still loads — compare a heading against the screenshot taken in section 9. If it
  has silently fallen back to Inter, restore `template/assets/fonts` and re-audit.
- `sitemap.xml` and `llms.txt` match the pages that actually exist.

Report the size of the repository before and after.

## 12. Deployment and the live site

GitHub Pages for this repository is configured to serve the **`design` branch, root path** — confirmed
via `gh api repos/lumivoxads/Draco/pages`, which returns `{"source":{"branch":"design","path":"/"}}`. The
published site is `https://lumivoxads.github.io/Draco/`.

**As of this document, the live site is several rounds out of date.** `origin/design` sits at `b80caec`,
which predates all five rounds of design work. Everything from the client feedback round onward — the
contact rail, the merged homepage, the vector globe — exists only locally. The client has therefore never
seen any of it; their review comments describe the pre-round-1 site.

This matters for cleanup in one specific way: **because Pages serves `design` directly, any push to that
branch publishes immediately.** There is no staging step. A cleanup commit that accidentally removes a
load-bearing asset goes straight to the client-visible URL.

So:

- Do **not** push. Complete the cleanup locally, verify it against a local server, and leave the push to
  the repository owner. Deploying five rounds of unreviewed change to a client-facing URL is their
  decision, not yours.
- Say clearly in your summary how many commits are unpushed and what a push would publish.

### Live URLs to re-test after the owner deploys

All seven currently return 200. Re-check each after any deploy — a cleanup that removes a referenced
asset will show up here as a 404 rather than in local testing, because a local server and Pages resolve
paths differently:

| URL | Expected |
|---|---|
| `https://lumivoxads.github.io/Draco/index.html` | 200, globe cycles through all four regions |
| `https://lumivoxads.github.io/Draco/about.html` | 200 |
| `https://lumivoxads.github.io/Draco/contact.html` | 200 |
| `https://lumivoxads.github.io/Draco/index-loop.html` | 200, redirects to the homepage — the client's review document links here, so it must not 404 |
| `https://lumivoxads.github.io/Draco/sitemap.xml` | 200 |
| `https://lumivoxads.github.io/Draco/llms.txt` | 200 |
| `https://lumivoxads.github.io/Draco/robots.txt` | 200 |

Beyond status codes, confirm on the deployed homepage that: the Earth frame sequence loads all 240
frames, `window.d3` and `window.topojson` are both defined, `#globe-canvas` exists and paints, the
floating contact rail renders all three icons, and the console shows no errors beyond the known missing
Bahrain id.

Pay particular attention to **case sensitivity**. GitHub Pages is case-sensitive where macOS is not, so a
path that resolves locally can 404 once deployed. This is the single most likely way for the cleanup to
break the live site without any local symptom.

## 13. Definition of done

- [ ] Restore point confirmed at `93f8c37` / `9b5a71c`; any dirty working tree committed before deleting.
- [ ] Cleanup landed as separate per-section commits with real, explanatory messages.
- [ ] Every path verified with a grep before removal; unexpected references reported, not overridden.
- [ ] Agent scratch removed: `node_modules/`, `package*.json`, `screenshot.js`, `generate_lab.py`,
      `.playwright-mcp/`, `docs/.DS_Store`.
- [ ] Pre-Cunnet build removed: `css/`, `js/`, `assets/frames/`, `assets/earth-frames/dark-prev-earth/`.
- [ ] `verticals-lab.html` removed after confirming the globe's bento fallback does not depend on it.
- [ ] Superseded docs removed: R2, R3, R4 handoffs and `CLEANUP-PLAN.md`.
- [ ] `CLIENT-FEEDBACK-R1.md`, `HANDOFF-R1-ANTIGRAVITY.md`, `HANDOFF-R5-VECTOR-GLOBE.md` and
      `CUNNET-HERO-REPURPOSE.md` kept.
- [ ] `README.md` rewritten to match the site as built; `PLATFORM_OVERVIEW.md` updated or folded in.
- [ ] `assets/*.mp4` and `moodboard/` moved outside the repository, with the location reported.
- [ ] `template/assets/js` and the unreferenced part of `template/assets/img` removed after a `url()`
      audit; `template/assets/fonts` intact.
- [ ] `index-loop.html` and `assets/vendor/` untouched.
- [ ] All verification in section 11 passes, including the display typeface check.
- [ ] Repository size before and after reported.
- [ ] Nothing pushed. The number of unpushed commits and what a push would publish is stated plainly in
      the summary, so the owner can make the deploy decision.
