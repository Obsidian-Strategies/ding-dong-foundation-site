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
  mission.njk                redirect        /mission/ → / (the filed statement is on Home)
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
  uploads/                   client photography
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
- Three verbatim texts are never rewritten: the filed mission statement, Judy's mission paragraph on Home, and the prayers on Home.
- No newsletter signup, events calendar, cookie bar or sticky donate ribbon. The header is the only sticky element.
- The bell intro waits for the visitor to press "Ring the bell" — that click is the browser's permission for sound, so `audio/bell.mp3` (second strike pitched down a minor third) and the two swings always play together, then the curtain lifts. Esc lifts it quietly. It shows at most once per 24h (`localStorage` key `ddf-intro-v1`) and never under reduced motion. Add `?intro` to the URL to force it for review.
- "Ave Maria" stays as the standing dedication in the footer.
- The public name is The DingDong Foundation, one word; `Ding Dong` and `public charity` are banned strings.
- Times New Roman everywhere except the motto pair, set in Great Vibes through `--font-script`.
- The entrance overlay is the one light surface (ivory); every page behind it is navy.
- Apply for a grant lives in the header button and the footer only.
