# The Ding Dong Foundation — Website

Public source for [TheDingDongFoundation.org](https://thedingdongfoundation.org). Seven static pages built with [Eleventy](https://www.11ty.dev/) from the Claude Design handoff (design system + 7-page prototype).

- GitHub Pages: https://obsidian-strategies.github.io/ding-dong-foundation-site/ (deploys on push to `main`)
- Railway: https://web-production-af1a6.up.railway.app (builds the Dockerfile on push to `main`)

Planning docs and client materials live in the private [ding-dong-foundation](https://github.com/Obsidian-Strategies/ding-dong-foundation) repo. Managed by Obsidian Strategies.

## Layout

```
src/
  _includes/base.njk   shared layout: sticky header, footer, nav
  index.njk            Home            /
  story.njk            Our story       /story/
  mission.njk          Mission         /mission/
  guidelines.njk       Guidelines      /guidelines/
  apply.njk            Apply           /apply/
  grants.njk           Grants          /grants/
  donate.njk           Give            /donate/
  css/tokens/*.css     design tokens, ported verbatim from the design system
  css/styles.css       token entry point (@imports)
  css/site.css         component + page styles
  js/site.js           bell intro (strikes, skip, exit) + apply/donate UI states (submissions are stubbed)
  uploads/             client photography
  audio/bell.mp3       intro bell strike (Pixabay #293423, Pixabay Content License)
tests/                 dependency-free checks (see below)
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
- Two verbatim texts are never rewritten: the filed mission statement and the founding sentence.
- No newsletter signup, events calendar, cookie bar or sticky donate ribbon. The header is the only sticky element.
- The bell intro plays `audio/bell.mp3` at each swing (second one pitched down a minor third); browsers keep it silent until the visitor has interacted with the site. It shows at most once per 24h (`localStorage` key `ddf-intro-v1`), never under reduced motion, and any click, key, scroll or touch skips it. Add `?intro` to the URL to force it for review.
- "Ave Maria" stays as the standing dedication in the footer.
