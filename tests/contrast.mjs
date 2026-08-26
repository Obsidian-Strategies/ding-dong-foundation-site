// WCAG contrast check for every text/background pair the site uses.
// Tokens are parsed from src/css/tokens/colors.css; the footer espresso is added by hand.
// Usage: node tests/contrast.mjs   (run from site/)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/css/tokens/colors.css", import.meta.url), "utf8");
const tokens = { "espresso-900": "#1d1713" };
for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[m[1]] = m[2];

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Nothing on the site is WCAG "large text" at 21.33px/400, so 4.5:1 applies to everything.
const PAIRS = [];
for (const bg of ["linen-100", "linen-50", "sand-200", "sand-100"]) {
  PAIRS.push(["ink-900", bg, "body text"], ["ink-800", bg, "headings, links"], ["ink-600", bg, "muted text, nav"],
    ["ink-500", bg, "faint text, attributions, placeholders"], ["brass-700", bg, "eyebrows, wordmark"], ["rose-700", bg, "link hover, errors, headline emphasis"]);
}
PAIRS.push(
  ["linen-50", "ink-800", "primary button label"],
  ["ink-900", "brass-400", "warm button, selected amount, active nav"],
  ["brass-700", "brass-100", "tag label"],
  ["rose-700", "rose-100", "rose tag label"],
  ["linen-100", "espresso-900", "footer wordmark"],
  ["sand-300", "espresso-900", "footer links, contact"],
  ["sand-400", "espresso-900", "footer legal line, Ave Maria"],
  ["brass-400", "espresso-900", "footer Ding Dong"],
  ["brass-300", "espresso-900", "footer link hover"],
);

let failures = 0;
for (const [fg, bg, why] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) { console.log(`FAIL missing token --${tokens[fg] ? bg : fg}`); failures++; continue; }
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= 4.5;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} --${fg} on --${bg} = ${r.toFixed(2)} — ${why}`);
}
if (failures) { console.error(`\n${failures} contrast failure(s)`); process.exit(1); }
console.log(`\nAll ${PAIRS.length} contrast checks passed`);
