# Draco — Client Feedback Round 1 (Rajesh Rishi, 19 July 2026)

Source: `docs/content/Draco Website Content Review.docx` — the review document returned by the client.
Feedback arrived as plain text in the "Your changes" column of each table, plus two Google Docs comments.
There are no tracked changes in the file, so nothing is hidden in revision history.

## The two Google Docs comments, verbatim

1. On "Homepage — Loop version":
   > Can we create a combination of the two? The globe and the moon- it's better when it's automatically
   > animated, but the scroll can be used to reveal the geo & vertical table, maybe?

2. On "Gear House Garage —":
   > GHG should not appear in this project

## Decisions taken before build

These were open questions after reading the feedback. They are now settled:

| Question | Decision |
|---|---|
| Does `contact.html` survive? | Yes. The client agreed to keep Home/About/Contact in the nav for SEO, and the contact form still has value. The floating contact rail becomes the primary path; the contact page stays as the secondary, indexable one. |
| Is there a footer to keep? | No. Neither the scroll nor the loop homepage shows a usable footer, which is why the client said "don't see this footer" twice. The footer is removed entirely and its contents (LinkedIn, email, WhatsApp) move into the floating contact rail. |
| Verticals & Geographies data | The client is still preparing the real data ("Working on this and will share"). Build the section on the homepage now with the existing placeholder rows, clearly marked, and swap the data in when it arrives. |

## Change list

### Structural — the large items

1. **Merge the two homepages into one hybrid.** `index.html` and `index-loop.html` become a single page.
   The Earth and moon animate automatically on load, exactly as the loop version does today. Scrolling
   does not replace that animation — it layers content reveals on top of a still-running animation, and
   the final reveal is the Verticals & Geographies table. `index-loop.html` is retired but must keep
   working as a URL, because the client has that link; it becomes a `noindex` redirect to `/`.

2. **Clear the hero.** The client flagged every piece of hero copy as obscuring the animation: the
   eyebrow, the headline, the note and the lead all got the same comment. The first viewport should be
   the animation, the logo, the nav and the "Scroll to explore" hint — nothing else. The H1 and lead
   still exist in the DOM for SEO, but they are revealed on the first scroll step rather than sitting
   over the opening frame.

3. **Floating contact rail, bottom right.** A persistent vertical stack of three icons: WhatsApp (the
   existing green button), email, and LinkedIn. The client's reasoning was that "Get in touch",
   "Start a conversation", the WhatsApp button and the contact page all do the same job and should be
   distilled into one place. So the header "Get in touch" button and the hero "Start a conversation"
   button are removed, and the rail carries all three channels on every page.

4. **Move Verticals & Geographies from About to the homepage**, as the final scroll reveal. The client
   said it "would be better placed on the first page the scroll to explore section". Remove the section
   from `about.html`.

5. **Restore the cheeky quote as a call to action.** The Rumi quote is currently, in the client's words,
   "too insignificant now and hidden". The original intent was the follow-up line — "Connect with us and
   speak to someone who has not been home for a very long time" — sitting under the Rumi quote to push
   the visitor toward the contact icons. Bring that second line back and place it where it reads as a
   prompt to click the rail.

6. **About page navigation.** Add a sub-menu of the page's sections at the top, a floating version of
   that sub-menu that follows the scroll, and a back-to-top link. The client accepted the SEO argument
   for the page but wants it easier to move around.

### Copy edits

| Location | Current | New |
|---|---|---|
| Home — closing eyebrow and headline | "Creating meaningful connections that inspire loyalty" / "Let's build loyalty worth keeping." | Removed. The Verticals & Geographies table takes that slot. |
| About — hero headline | Your strategic loyalty partner | Your strategic loyalty and CX partner |
| About — "Who we are" heading | Retention over acquisition. | Supercharging acquisition and retention strategies |
| About — FAQ "Which industries does Draco serve?" | (full answer) | Remove the question. The client called it a duplicate of the industries section. |
| About — FAQ "How is Draco different from a rewards platform?" | (question wording) | "How is Draco different?" — Draco is not a rewards platform, so the question should not imply it is. |
| About — FAQ "How do I start working with Draco?" | "Get in touch through our contact page…" | Point at the contact rail rather than the page. |
| Contact — hero lead | "Tell us about your customers and your goals. We'll show you how a Draco loyalty ecosystem can…" | "Tell us about you, your customers, your challenges, and your goals. We'll show you how we can turn everyday engagement into lasting business value." |
| Contact — WhatsApp line | Message us anytime | Message or call us anytime |
| Contact form — Company field | (field) | Remove. The client noted it will be in the email signature anyway. |
| Contact form — Industry field | (field) | Remove. The client noted it can be deduced from the website. |
| Contact form — "How can we help?" label | How can we help? | "Tell us about you, your customers, your challenges, and your goals" — deliberately mirroring the hero lead above it. |
| Contact form — confirmation | "Opening your email app — send the draft to finish." | The client wrote "What is this" against this line, so the mailto behaviour is not obvious. Make the form note explain up front that Send opens their email client with the message pre-filled. |
| Review doc generator | "Prepared for Gear House Garage" | Remove all Gear House Garage / GHG references from `docs/content/build_draco_content_review.js`. |

### Approved without change

Everything under Services, Values, Vision & Mission, the About paragraphs, and every meta title and
description came back marked "Good" or "Ok". Navigation stays as Home · About · Contact — the client
accepted the ranking rationale. Do not touch any of it.

## Files in scope

| File | Work |
|---|---|
| `index.html` | Rebuilt as the hybrid homepage |
| `index-loop.html` | Reduced to a `noindex` redirect to `/` |
| `about.html` | Sub-nav, back-to-top, copy edits, FAQ edits, Verticals section removed |
| `contact.html` | Copy edits, two form fields removed, form note rewritten |
| `assets/site.js` | WhatsApp float generalised into the three-icon contact rail |
| `assets/site.css` | Rail styles; sub-nav and back-to-top styles |
| `assets/earth-loop.js`, `assets/earth-scroll.js` | Reconciled into one driver for the hybrid hero |
| `docs/content/build_draco_content_review.js` | Gear House Garage removed |
| `sitemap.xml`, `llms.txt` | Updated if URLs or section structure change |
