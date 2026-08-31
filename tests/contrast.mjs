// WCAG contrast check for every text/background pair the site uses (navy/gold dark theme).
// Tokens are parsed from src/css/tokens/colors.css.
// Usage: node tests/contrast.mjs   (run from site/)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/css/tokens/colors.css", import.meta.url), "utf8");
const tokens = {};
for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[m[1]] = m[2];

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
// Frosted-glass buttons are a translucent navy tint over the page; the effective colour is
// the tint composited on the surface beneath. Alpha mirrors --glass-frost in src/css/site.css.
const GLASS = { "navy glass": ["navy-800", 0.5] };
function over(tintHex, alpha, bgHex) {
  const ch = (h, i) => parseInt(h.slice(i, i + 2), 16);
  return "#" + [1, 3, 5].map((i) => Math.round(alpha * ch(tintHex, i) + (1 - alpha) * ch(bgHex, i)).toString(16).padStart(2, "0")).join("");
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Nothing on the site is WCAG "large text" at 21.33px/400, so 4.5:1 applies to everything.
const PAIRS = [];
for (const bg of ["navy-900", "navy-925", "navy-800", "navy-700"]) {
  PAIRS.push(
    ["ivory-50", bg, "body text, headings"],
    ["ivory-300", bg, "muted text, nav"],
    ["ivory-400", bg, "faint text, attributions, placeholders"],
    ["gold-300", bg, "eyebrows, links, wordmark, headline emphasis"],
    ["gold-200", bg, "link hover"],
    ["rose-300", bg, "errors"],
    ["sage-300", bg, "correct marks"],
  );
}
PAIRS.push(
  ["navy-950", "gold-400", "primary/warm button label, active nav, selected amount"],
  ["navy-950", "gold-300", "primary/warm button hover label"],
  ["gold-200", "navy-600", "tag label"],
  ["rose-200", "navy-600", "rose tag label"],
  ["ivory-50", "navy-950", "footer wordmark"],
  ["ivory-300", "navy-950", "footer links, contact"],
  ["ivory-400", "navy-950", "footer legal line, Ave Maria"],
  ["gold-400", "navy-950", "footer Ding Dong"],
  ["gold-200", "navy-950", "footer link hover"],
);

for (const [name, [tint, alpha]] of Object.entries(GLASS)) {
  for (const bg of ["navy-900", "navy-925", "navy-800", "navy-700"]) {
    const key = `${name} on ${bg}`;
    tokens[key] = over(tokens[tint], alpha, tokens[bg]);
    PAIRS.push(["ivory-50", key, "glass button label"], ["gold-300", key, "glass button accent"]);
  }
}

// Warm/primary buttons (.btn, .btn--warm) push their frost pane to a near-opaque gold tint
// instead of navy glass, so the label reads navy-950-on-gold. Alphas mirror .btn::after /
// .btn:hover::after / .btn:active::after in site.css. Checked against every surface a bare
// .btn can sit on (guidelines.njk and questions.njk put it directly on --surface-sunk).
const WARM_GLASS = {
  "warm rest": ["gold-400", 0.7],
  "warm hover": ["gold-400", 0.85],
  "warm active": ["gold-400", 0.75],
};
for (const [name, [tint, alpha]] of Object.entries(WARM_GLASS)) {
  for (const bg of ["navy-900", "navy-925", "navy-800", "navy-700"]) {
    const key = `${name} on ${bg}`;
    tokens[key] = over(tokens[tint], alpha, tokens[bg]);
    PAIRS.push(["navy-950", key, "warm button label"]);
  }
}

// Selected amount / open FAQ bar: the pane takes a gentle gold tint but keeps the light label
// (see .amount[aria-pressed="true"]::after and .faq__bar[aria-expanded="true"]::after, both
// rgba(217, 189, 120, 0.3) at rest — the FAQ bar has no distinct hover tint, the amount does).
const TINTED_GLASS = {
  "selected/open rest": ["gold-400", 0.3],
  "selected amount hover": ["gold-400", 0.4],
};
for (const [name, [tint, alpha]] of Object.entries(TINTED_GLASS)) {
  for (const bg of ["navy-900", "navy-925", "navy-800", "navy-700"]) {
    const key = `${name} on ${bg}`;
    tokens[key] = over(tokens[tint], alpha, tokens[bg]);
    PAIRS.push(["ivory-50", key, "selected amount / open FAQ bar label"]);
  }
}

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
