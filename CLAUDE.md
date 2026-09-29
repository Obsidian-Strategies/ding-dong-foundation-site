# The DingDong Foundation site

Public source for thedingdongfoundation.org. The full project brief, client facts, phase, and open questions live in the private repo one folder up (`../CLAUDE.md`). Read it when working from the parent folder. Follow the `client-website` skill.

## Rules that must hold (also in README.md)
- Nothing below 12pt (16px); body 20px (client, 2026-09-29). Every text/background pair at or above 4.5:1.
- Home copy is the client's verbatim text from her 2026-09-10 PDF. The Lord's Prayer in full is on Inspirations (moved from Home 2026-09-29, white on the page navy, no band); Psalm 100:1 is gone. The filed purpose statement is not on the site, and there is no Mission page or `/mission/` address.
- No founder name, bio, or photo credits anywhere. No email, contact link, or ask form anywhere; no Ave Maria dedication; footer is the legal name and "Sarasota, Florida" only; photos are the client's own or public domain, uncaptioned (client, 2026-09-29).
- Give (client, 2026-09-29; Rogan the same day: humble, no bright button): check first, then online as an underlined line of text, "Give by card on Stripe" that goes to a Stripe Payment Link from `src/_data/site.json` (Stripe's hosted page; nothing entered here), a stub with a note until the link exists. Copy says the foundation covers the processing fee and a receipt is emailed automatically. The v2 amount-and-details mock is gone. Her check sentence stays verbatim; the matching-gifts line and the tax line left on 2026-09-29 (Rogan).
- Guidelines and Apply (client, 2026-09-29): a proposal, not an inquiry. Applicants come with the maker's quote, timeline, photographs, cost and share, and parish involvement; everything is submitted online with document upload; a grant covers up to 80 percent, never all, no fixed amount. Never "approve", "reject", "inquiry", "first review", or any invitation to write and ask. Form delivery and upload are stubbed.
- Times New Roman everywhere except the motto, set in Great Vibes through `--font-script`: "Make a Joyful Noise to the Lord" alone on the entrance overlay, "Jubilate Deo" alone as the Home h1, never both together (client, 2026-09-23). The wordmark is "The DingDong Foundation" in small capitals, as on her business card. The entrance overlay shows no name (client, 2026-09-29): bell, small motto, small hairline button. One dark theme, no toggle. The entrance overlay is the one light (ivory) surface. Sentence case, no emoji, verb-phrase buttons.
- No "Apply for a grant" button anywhere (header button removed 2026-09-27); the header is the wordmark left, six links right. Applications are online only: no paper form, no mailing option. Funded projects are shared on the site; applicants do not opt out.
- Every page has the same shape (2026-09-29): one 1200px column, plain h1 plus one white paragraph on the hero, h2 plus white `.section-p` paragraphs per section. No eyebrows, no italic words in headings, no cards around plain text, no hover lift on static content. Questions has no ask-your-own form.
- Banned strings in built HTML: February, Europe, Grounded, Judy, Peng, founder, Ding Dong, public charity.
- Pages: Home, Inspirations, Guidelines, Questions, Give, Resources (six nav links), plus `/story/` redirecting to `/inspirations/` and `/apply/` redirecting to the proposal form at the end of `/resources/`. Grants is hidden (permalink false) until the first grant.

## Commands (run here)
- Dev: `npx @11ty/eleventy --serve`
- Build and test: `npx @11ty/eleventy; node tests/structure.mjs; node tests/contrast.mjs`

## Deploy
Railway builds the Dockerfile on every push to `main`. That URL is the client's current preview link, so never push. Ask before every commit.
