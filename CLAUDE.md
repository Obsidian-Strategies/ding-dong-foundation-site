# The DingDong Foundation site

Public source for thedingdongfoundation.org. The full project brief, client facts, phase, and open questions live in the private repo one folder up (`../CLAUDE.md`). Read it when working from the parent folder. Follow the `client-website` skill.

## Rules that must hold (also in README.md)
- Nothing below 16pt (21.33px). Every text/background pair at or above 4.5:1.
- Home copy is the client's verbatim text from her 2026-09-10 PDF; the Lord's Prayer in full and Psalm 100:1. The filed purpose statement is not on the site, and there is no Mission page or `/mission/` address.
- No founder name, bio, or photo credits anywhere.
- Times New Roman everywhere except the motto, set in Great Vibes through `--font-script`: the pair on the entrance overlay, "Jubilate Deo" alone as the Home h1. One dark theme, no toggle. The entrance overlay is the one light (ivory) surface. Sentence case, no emoji, verb-phrase buttons.
- "Apply for a grant" is the header button only. Applications are online only: no paper form, no mailing option. Funded projects are shared on the site; applicants do not opt out.
- Banned strings in built HTML: February, Europe, Grounded, Judy, Peng, founder, Ding Dong, public charity.
- Pages: Home, Inspirations, Guidelines, Apply, Grants, Questions, Give, plus `/story/` redirecting to `/inspirations/`.

## Commands (run here)
- Dev: `npx @11ty/eleventy --serve`
- Build and test: `npx @11ty/eleventy; node tests/structure.mjs; node tests/contrast.mjs`

## Deploy
Railway builds the Dockerfile on every push to `main`. That URL is the client's current preview link, so never push. Ask before every commit.
