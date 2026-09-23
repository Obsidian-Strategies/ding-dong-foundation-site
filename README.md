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
  apply.njk                  Apply           /apply/
  grants.njk                 Grants          /grants/
  questions.njk              Questions       /questions/   (answers live in front matter; hover previews an answer, click pins it)
  donate.njk                 Give            /donate/
  prayer-for-the-world.njk   held, permalink false
  _data/site.json            onlineGiving flag
  css/tokens/*.css           design tokens, ported verbatim from the design system
  css/styles.css             token entry point (@imports)
  css/site.css                component + page styles
  js/site.js                 bell intro (strikes, skip, exit) + apply/donate UI states (submissions are stubbed)
  fonts/                     Great Vibes latin woff2 (OFL), the only webfont
  uploads/                   client photography, plus fund-glass.jpg (Unsplash licence) and fund-artisan.jpg (CC0, rawpixel via Openverse); neither needs a credit
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

- Nothing smaller than 16pt (21.33px). The token scale has no smaller size.
- Sentence case. No emoji. Buttons are verb phrases — never "Submit" or "Learn more".
- The founder is anonymous: no name, no bio, no photo credits.
- Verbatim texts are never rewritten: every Home text from Judy's 2026-09-10 PDF (hero paragraph, credibility line, Why we ring, What we fund) and the prayers on Home (the Lord's Prayer in full, Psalm 100:1). The filed purpose statement is not on the site.
- Home hero is the bell photo full width with "Jubilate Deo" alone over a navy scrim (0.85 behind the text; `tests/contrast.mjs` models it over white). The English motto line alone lives on the entrance overlay; the two lines are never shown together (client, 2026-09-23). The header wordmark and the entrance name are small capitals, as on her business card.
- No newsletter signup, events calendar, cookie bar or sticky donate ribbon. The header is the only sticky element.
- The bell intro waits for the visitor to press "Ring the bell" — that click is the browser's permission for sound, so `audio/bell.mp3` (second strike pitched down a minor third) and the two swings always play together, then the curtain lifts. Esc lifts it quietly. It shows at most once per 24h (`localStorage` key `ddf-intro-v1`) and never under reduced motion. Add `?intro` to the URL to force it for review.
- "Ave Maria" stays as the standing dedication in the footer.
- The public name is The DingDong Foundation, one word; `Ding Dong` and `public charity` are banned strings.
- Times New Roman everywhere except the motto, set in Great Vibes through `--font-script`.
- The entrance overlay is the one light surface (ivory); every page behind it is navy.
- Apply for a grant lives in the header button only. Never in a page body or the footer.
- Applications are online only: no paper form, no mailing option, email required. Funded projects are shared on the site and applicants do not opt out (client, 2026-09-17).
