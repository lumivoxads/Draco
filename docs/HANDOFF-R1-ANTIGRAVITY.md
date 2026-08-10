# Handoff prompt — Draco website, client feedback round 1

Paste everything below this line into Antigravity (or Cursor) as the opening message.

---

## 1. Routing

**Tool:** Antigravity. **Model:** Gemini 3 Pro, or Claude Sonnet if Gemini struggles with the scroll
choreography. **Why this tool:** the work is UI-heavy — a scroll-driven hero rebuild, a floating
navigation element, and responsive behaviour across three pages — and Antigravity has a browser for
visual and responsiveness testing, which this job needs at every step.

**Setup:** open the repository at `/Users/xcalider/Documents/Projects/Lumivox/Draco` on the `design`
branch. This is a plain static site — no build step, no framework, no package manager. Serve it with any
static server (`python3 -m http.server 8000` from the repo root) and open `http://localhost:8000`.

## 2. Objective and context

Draco is an enterprise loyalty solutions consultancy. The website is a four-file static site on a dark
and gold theme, with a photoreal Earth-and-moon animation as the homepage hero. It is live at
`https://lumivoxads.github.io/Draco/` and will ship to `https://www.draco.ae/`.

Two homepage designs were built as alternatives and both were sent to the client for review:

- `index.html` — a scroll-scrubbed hero. The Earth animation is driven frame by frame by the scroll
  position across a 600vh stage, with copy fading out and a closing panel fading in.
- `index-loop.html` — a single non-scrolling viewport with the same Earth animation playing
  automatically on a loop, with all the copy laid over it.

The client has now returned written feedback. The headline response: they want **one page that combines
both** — the animation should play automatically as in the loop version, and scrolling should be used to
reveal content on top of it, ending on a Verticals & Geographies table. They also feel the hero copy is
burying the animation and want the contact actions consolidated into a single floating element.

The full feedback is recorded in `docs/CLIENT-FEEDBACK-R1.md` in the repository. **Read that file first.**
It contains the client's exact words for every change, the decisions already taken on the open questions,
and the list of things that came back approved and must not be touched.

## 3. Research and prior decisions

- The Earth animation is a frame sequence: 240 JPEG frames in `assets/earth-frames/dark/`, played onto a
  `<canvas id="earth">`. `assets/earth-loop.js` plays them on a timer at 24fps; `assets/earth-scroll.js`
  scrubs them against scroll position. The hybrid needs the loop driver, not the scrubber.
- The theme lives in `assets/site.css` as CSS custom properties (`--d-bg`, `--d-fg`, `--d-muted`,
  `--d-dim`, `--d-accent`, `--d-line`, `--d-pad`, `--d-ff-body`). Use them. Do not introduce new colours.
- Icons come from Font Awesome Pro, already linked at `template/assets/css/font-awesome-pro.css`.
  The WhatsApp icon in use is `fa-brands fa-whatsapp`; use `fa-regular fa-envelope` and
  `fa-brands fa-linkedin-in` for the two new rail icons.
- `assets/site.js` currently injects the floating WhatsApp button on every page that loads it. That
  injection is the natural place to build the three-icon rail.
- Each page has a `<style>` block in its own `<head>` for page-specific CSS, alongside the shared
  `assets/site.css`. The `css/` directory (`base.css`, `home.css`, `pages.css`) is legacy from an earlier
  build and is not linked by the current pages — ignore it, and do not revive it.
- There is a temporary design-comparison toggle (`.design-toggle`) pinned bottom-left on both homepages,
  linking Scroll and Loop. Now that a direction is chosen, remove it from both.
- Contact details, used in several places and in the structured data: email `Rajesh.Rishi@Draco.ae`,
  WhatsApp `+971 50 450 1195` (`971504501195`), LinkedIn `linkedin.com/in/rajeshrishi`.
- Every page carries hand-written JSON-LD structured data for SEO. When you move or delete content,
  keep the structured data consistent with what is actually on the page.

## 4. Development specification

### 4.1 The hybrid homepage — `index.html`

This is the centrepiece. Rebuild `index.html` so that:

**The animation runs automatically and never stops.** Use the looping driver (`assets/earth-loop.js`
behaviour), not the scroll scrubber. The canvas is `position: sticky`, full viewport, and stays pinned
while the page scrolls past it. Scroll position drives the content reveals layered over it, and may drive
a subtle scale or parallax on the canvas, but must never take over frame playback.

**The first viewport is clean.** When the page loads, the visitor sees the animation, the logo, the
primary nav, the floating contact rail, and the "Scroll to explore" hint. No headline, no eyebrow, no
lead paragraph, no buttons over the opening frame. This is the single most important part of the
feedback — the client wrote the same objection against four separate lines of hero copy.

**Scroll reveals content in three steps**, each fading and rising into place as it enters, and fading out
as the next arrives:

1. **The headline.** "Enterprise Loyalty, Engineered." as the `<h1>`, with the eyebrow "Enterprise
   Loyalty Partner", the note "For the world's most customer-obsessed brands." and the lead "Draco
   designs and delivers the loyalty ecosystems that turn everyday customer engagement into lasting
   business value." Keep the existing right-aligned composition — the Earth sits left, the copy sits on
   the clear right side. There is no button in this step; the rail handles contact.
2. **The quote, as a call to action.** The Rumi line, then the follow-up line beneath it:
   > "When setting out on a journey, do not seek advice from someone who has never left home" — Rumi
   >
   > Connect with us and speak to someone who has not been home for a very long time.
   The second line is the point of the step — it exists to push the visitor to the contact rail, so give
   it real weight (not the 12px muted treatment the current quote has) and place it so the eye travels
   from it to the rail in the bottom right. A visual link between the two — an arrow, a highlight on the
   rail as this step enters — would serve the intent well.
3. **Verticals & Geographies.** A two-column table of vertical against region. Lift the existing markup
   from `about.html` (the `#verticals` section, around line 236) — it uses `.value-row` with `.k` and
   `.v` children. Keep the six placeholder rows exactly as they are (`[Client vertical]` / `[Region]`)
   and keep the HTML comment marking them as placeholders; the client is still preparing the real data.
   This is the last thing on the page.

There is **no footer** and no closing "Let's build loyalty worth keeping" panel. The page ends on the
table. Remove `.design-toggle` and its styles.

Keep `"Scroll to explore"` visible on the first viewport and fade it out once the visitor starts scrolling.

**Reduced motion:** when `prefers-reduced-motion: reduce` is set, stop the frame animation on a single
representative frame and present all three content steps as a normal, statically stacked page. This
matters — the animation is the whole page, so the fallback has to be a real page, not an empty one.

### 4.2 `index-loop.html`

The client has this URL in their review document, so it must not 404. Reduce the file to a minimal
`noindex` page with a canonical pointing at `/` and an immediate redirect to `index.html`.

### 4.3 The floating contact rail — `assets/site.js` and `assets/site.css`

Replace the single WhatsApp float with a vertical stack of three circular icon buttons in the bottom
right corner, present on every page:

| Icon | Action |
|---|---|
| WhatsApp | `https://wa.me/971504501195?text=…` — keep the existing pre-filled message and the green treatment |
| Email | `mailto:Rajesh.Rishi@Draco.ae` |
| LinkedIn | `https://www.linkedin.com/in/rajeshrishi`, opens in a new tab |

Each needs an `aria-label` and a visible label on hover (a tooltip to the left of the icon reads best in
that corner). Keep the stack clear of the "Scroll to explore" hint on the homepage and clear of the
mobile menu button on small screens.

Then remove what it replaces:

- The header `Get in touch` button (`.draco-cta`) on all four pages.
- The hero `Start a conversation` button on the homepage.
- The footer on the loop homepage (`.draco-foot`) — it disappears with the merge.

Leave the `Start a conversation` button on the About page's closing CTA band, and leave the Contact page
form intact apart from the changes in 4.5. The nav keeps Home · About · Contact on every page.

### 4.4 `about.html`

- **Section sub-navigation.** Add anchor ids to each `<section class="d-section">` and a sub-menu listing
  them at the top of the page, below the page hero. As the visitor scrolls past the hero, that sub-menu
  becomes a floating element that stays available, with the current section highlighted. Add a
  back-to-top control that appears once the visitor is past the first screen.
- **Remove the `#verticals` section** — it has moved to the homepage.
- **Copy:** hero headline becomes "Your strategic loyalty and CX partner". The "Who we are" heading
  becomes "Supercharging acquisition and retention strategies". Both are the client's own wording.
- **FAQ:** delete the "Which industries does Draco serve?" entry (the client called it a duplicate of the
  industries section). Reword "How is Draco different from a rewards platform?" to "How is Draco
  different?" — Draco is not a rewards platform and the question implies otherwise; the answer text
  stays. Rewrite the answer to "How do I start working with Draco?" so it points at the contact rail
  rather than "our contact page". Update the FAQ JSON-LD to match on all three counts.

### 4.5 `contact.html`

- Hero lead becomes: "Tell us about you, your customers, your challenges, and your goals. We'll show you
  how we can turn everyday engagement into lasting business value." The client specifically asked for
  "how we can", not "how a Draco loyalty ecosystem can".
- WhatsApp card line becomes "Message or call us anytime".
- Remove the **Company** and **Industry** form fields, and remove them from the mailto body the form
  builds. Remaining fields: Full name, Work email, and the message.
- The message field label becomes "Tell us about you, your customers, your challenges, and your goals",
  deliberately echoing the hero lead above it.
- The client wrote "What is this" against the confirmation line "Opening your email app — send the draft
  to finish." — the mailto behaviour surprised them. Rewrite the note that sits under the Send button so
  it says plainly, *before* the click, that Send opens their own email app with the message ready, and
  make the confirmation after the click consistent with it.

### 4.6 `docs/content/build_draco_content_review.js`

Remove every "Gear House Garage" and "GHG" reference — that is a different client and must not appear in
this project. The whole "Prepared for" block goes.

### 4.7 Housekeeping

Check `sitemap.xml` and `llms.txt` against the final page structure and update anything that has moved.

## 5. Testing

There is no test framework in this project. Verify by hand:

- Every internal link on every page resolves — including `index-loop.html`, which must redirect rather
  than 404.
- No JavaScript errors in the console on any page, including after a full scroll of the homepage.
- All 240 animation frames still load; watch the network panel for 404s on the frame sequence.
- The contact rail's three links open the right targets: WhatsApp web or app with the pre-filled message,
  the mail client addressed correctly, and LinkedIn in a new tab.
- The contact form's mailto body contains only the three remaining fields.
- The JSON-LD on each page still validates and matches the content actually on the page.

## 6. Visual testing

Screenshot each of these and check them before declaring the work done:

- The homepage at first paint — it must be animation, logo, nav, rail and scroll hint, and nothing else.
- Each of the three scroll reveal steps at the point where it is fully in view.
- The end of the homepage, on the Verticals & Geographies table.
- The contact rail in its default and hover states.
- The About page sub-menu in both its inline and floating states.
- The homepage with `prefers-reduced-motion: reduce` forced on.

## 7. UI and UX testing

- Scrolling through the homepage should feel continuous — no jump, no frame stutter, no step appearing
  before the previous one has cleared.
- The animation must keep playing throughout. If it ever freezes because scroll is driving playback,
  the core of the client's request has been missed.
- Confirm the eye is drawn from the "speak to someone who has not been home" line to the contact rail.
  That connection is the entire reason the line is being restored.
- Keyboard: tab order must reach the rail's three links, they must show a visible focus ring, and the
  About sub-menu must be operable by keyboard.
- Screen reader labels on every icon-only control.
- Contrast of revealed text over the animation stays legible across all 240 frames, including the
  brightest ones — the existing scrims are there for this reason, so check them against the new layout.

## 8. Responsiveness testing

Test at 375px, 768px, 1280px and 1920px.

- On mobile the Earth composition shifts and the copy goes left-aligned — the existing `max-width: 600px`
  media queries show the intended pattern; carry it into the new layout.
- The contact rail must not cover content on small screens, and must not collide with the mobile menu
  button or the scroll hint.
- The About floating sub-menu needs a mobile form that does not eat the viewport — a horizontally
  scrolling strip or a collapsed control.
- The Verticals & Geographies table must reflow to a single column on mobile.
- Check both portrait and landscape on mobile; the hero is `100svh` and landscape phones are tight.

## 9. Data testing

Not applicable — the site is static with no data layer. The one thing to preserve is that the Verticals &
Geographies placeholder rows stay obviously placeholder, with the HTML comment intact, so the real data
is easy to drop in when the client sends it.

## 10. Definition of done

- [ ] `docs/CLIENT-FEEDBACK-R1.md` has been read and every row of its change list is accounted for.
- [ ] The homepage opens on a clean animation with no copy over the first frame.
- [ ] The animation plays automatically and continuously; scroll reveals content over it.
- [ ] Three scroll steps land in order: headline, quote with the call-to-action line, Verticals & Geographies.
- [ ] The Verticals & Geographies section is gone from About and present on the homepage with its placeholders.
- [ ] The contact rail carries WhatsApp, email and LinkedIn on all pages; the header CTA, the hero button
      and the loop footer are gone.
- [ ] The About page has a section sub-menu, a floating version of it, and a back-to-top control.
- [ ] Every copy edit in section 4 is applied word for word.
- [ ] The Company and Industry fields are gone from the contact form and its mailto body.
- [ ] The mailto behaviour is explained before the visitor clicks Send.
- [ ] No Gear House Garage or GHG reference remains anywhere in the repository.
- [ ] `index-loop.html` redirects instead of 404ing.
- [ ] `.design-toggle` is gone.
- [ ] No console errors; all frames load; structured data matches the pages.
- [ ] Screenshots captured at all four breakpoints and at each scroll step.
- [ ] Reduced-motion fallback is a complete, readable page.
- [ ] Approved content — Services, Values, Vision & Mission, About paragraphs, meta titles and
      descriptions, and the Home · About · Contact nav — is untouched.
