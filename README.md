# The DingDong Foundation — Website

Public source for [TheDingDongFoundation.org](https://thedingdongfoundation.org). Deployed automatically to GitHub Pages on every push to `main`.

Currently a placeholder page; the full site will replace it.

Planning docs and client materials live in the private [ding-dong-foundation](https://github.com/Obsidian-Strategies/ding-dong-foundation) repo.

Managed by Obsidian Strategies.

## Testing

No dependencies. From this folder:

```
node tests/contrast.mjs    # WCAG contrast of every text/background token pair, light + dark
node tests/structure.mjs   # landmarks, headings, skip link, section ids, SVG a11y attributes
```

For a visual check, run `python -m http.server 4173` and open http://localhost:4173/.
