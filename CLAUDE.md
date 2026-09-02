# The Ding Dong Foundation site

Public source for thedingdongfoundation.org. The full project brief, client facts, phase, and open questions live in the private repo one folder up (`../CLAUDE.md`). Read it when working from the parent folder. Follow the `client-website` skill.

## Rules that must hold (also in README.md)
- Nothing below 16pt (21.33px). Every text/background pair at or above 4.5:1.
- The filed mission statement on `/mission/` is never rewritten.
- No founder name, bio, or photo credits anywhere.
- Times New Roman, one dark theme, no toggle. Sentence case, no emoji, verb-phrase buttons.
- Banned strings in built HTML: February, Europe, Grounded, Judy, Peng, founder.

## Commands (run here)
- Dev: `npx @11ty/eleventy --serve`
- Build and test: `npx @11ty/eleventy; node tests/structure.mjs; node tests/contrast.mjs`

## Deploy
Railway builds the Dockerfile on every push to `main`. That URL is the client's current preview link, so never push. Ask before every commit.
