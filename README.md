# The DingDong Foundation — Website

Public source for [TheDingDongFoundation.org](https://thedingdongfoundation.org). Eight static pages built with [Eleventy](https://www.11ty.dev/) from the Claude Design handoff (design system + 7-page prototype).

- Client preview and live (today): Railway, deploys on every push to `main`. A separate preview link is planned, see CLAUDE.md.
- https://web-production-af1a6.up.railway.app (builds the Dockerfile)

Planning docs and client materials live in the private [ding-dong-foundation](https://github.com/Obsidian-Strategies/ding-dong-foundation) repo. Managed by Obsidian Strategies.

## Layout

```
src/
  _includes/base.njk         shared layout: sticky header, footer, nav
  index.njk                  Home            /
  inspirations.njk           Inspirations    /inspirations/
  story.njk                  redirect        /story/ → /inspirations/
  guidelines.njk             Guidelines      /guidelines/
  apply.njk                  Apply           /apply/       (her seventeen-field first-inquiry form plus up to ten documents; delivery stubbed; last nav link, 2026-10-10)
  grants.njk                 held, permalink false (hidden until the first grant, 2026-09-29)
  questions.njk              redirect        /questions/ → /resources/#questions (folded into Resources 2026-10-05)
  donate.njk                 Give            /donate/      (Stripe Payment Link button plus check; fee absorbed, receipts automatic)
  resources.njk              Resources       /resources/   (her maker lists of 2026-09-29 in three trades, then the questions)
  prayer-for-the-world.njk   held, permalink false
  _data/site.json            stripePaymentLink (empty until the Stripe account is connected; then the Give button links to it)
  css/tokens/*.css           design tokens, ported verbatim from the design system
  css/styles.css             token entry point (@imports)
  css/site.css                component + page styles
  js/site.js                 bell intro (strikes, skip, exit) + apply/donate UI states (submissions are stubbed)
  fonts/                     Great Vibes latin woff2 (OFL), the only webfont
  favicon.svg                the entrance bell, gold on navy
  uploads/                   client photography, plus fund-glass.jpg (Wikimedia Commons, CC0; see CREDITS.md). No captions on any photo.
  audio/bell.mp3             intro bell strike (Pixabay #293423, Pixabay Content License)
tests/                       dependency-free checks (see below)
```

## Develop

```
npm install
npx @11ty/eleventy --serve     # http://localhost:8080/
```

## Test

```
npx @11ty/eleventy
node tests/contrast.mjs        # every text/background token pair clears WCAG AA (4.5:1)
node tests/structure.mjs       # per-page contract: nav, footer, verbatim texts, forms, 16pt type floor
```

## Design rules that must hold

The full design system (palette, type scale, spacing, components, and how to change them) is `docs/design-system/README.md` in the private repo. The token files here are the machine source; that document explains them.

- Nothing smaller than 12pt (16px); body text 20px (client, 2026-09-29). The token scale has no smaller size.
- Sentence case. No emoji. Buttons are verb phrases — never "Submit" or "Learn more".
- The founder is anonymous: no name, no bio, no photo credits. No email address, contact link, or ask form anywhere (client, 2026-09-29). The footer is the legal name and "Sarasota, Florida" only; a PO Box line is pending.
- Verbatim texts are never rewritten: every Home text from Judy's 2026-09-10 PDF (hero paragraph, Why we ring, What we fund) and the Lord's Prayer in full (on Inspirations since 2026-09-29; Psalm 100:1 left the site the same day). The credibility line and the hero photo caption left Home on 2026-09-27. The filed purpose statement is not on the site.
- Every page has the same shape (2026-09-29): one 1200px column, one left edge, a plain h1 and one white paragraph on the hero, then h2 plus white paragraphs (`.section-p`) per section. No eyebrows, no italic words in headings, no cards around plain text, no hover lift on static content, no alternating backgrounds on inner pages. Cards: Home fund cards and the Questions answer panel only. The header spans the screen edge to edge. The last section of each page fades into the footer; there is no band on any page since the prayer moved to Inspirations (2026-09-29).
- Questions has eight questions and no ask-your-own form. The footer email is the way to write.
- Home hero is the bell photo full width with "Jubilate Deo" alone over a navy scrim (0.85 behind the text; `tests/contrast.mjs` models it over white). The English motto line alone lives on the entrance overlay; the two lines are never shown together (client, 2026-09-23). The header wordmark is small capitals, as on her business card. The entrance overlay carries no name (client, 2026-09-29).
- No newsletter signup, events calendar, cookie bar or sticky donate ribbon. The header is the only sticky element.
- The bell intro waits for the visitor to press "Ring the bell" — that click is the browser's permission for sound, so `audio/bell.mp3` (second strike pitched down a minor third) and the two swings always play together, then the curtain lifts. Esc lifts it quietly. It shows at most once per 24h (`localStorage` key `ddf-intro-v1`) and never under reduced motion. Add `?intro` to the URL to force it for review.
- No "Ave Maria" dedication (client, 2026-09-29). "Jubilate Deo" appears once, as the Home heading; the Psalm verse is gone.
- The public name is The DingDong Foundation, one word; `Ding Dong` and `public charity` are banned strings.
- Times New Roman everywhere except the motto, set in Great Vibes through `--font-script`.
- The entrance overlay is the one light surface (ivory); every page behind it is navy.
- "Apply for a grant" is a plain nav link, last of six, and appears nowhere else (client: top navigation only). No Apply button anywhere. Apply is never in a page body or the footer.
- Applications are online only: no paper form, no mailing option, email required. Funded projects are shared on the site and applicants do not opt out (client, 2026-09-17).
