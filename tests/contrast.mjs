// Dependency-free WCAG contrast check for the token pairs used as text/background.
// Usage: node tests/contrast.mjs   (run from site/)
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");

// Split the file at the dark-mode media query: everything before is the light
// theme, the first block after it is the dark override.
const [lightPart, darkPart = ""] = css.split("prefers-color-scheme: dark");

function parseTokens(src) {
  const out = {};
  for (const m of src.matchAll(/--([a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2];
  return out;
}
const light = parseTokens(lightPart);
const dark = { ...light, ...parseTokens(darkPart) };

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

// [foreground, background, minimum ratio, why]
const PAIRS = [
  ["ink", "bg", 4.5, "body text"],
  ["ink-muted", "bg", 4.5, "secondary text"],
  ["gold-ink", "bg", 4.5, "gold text & links"],
  ["ink", "bg-raised", 4.5, "text on tiles"],
  ["ink-muted", "bg-raised", 4.5, "secondary text on tiles"],
  ["bg", "gold-ink", 4.5, "primary button label"],
  ["bg", "ink", 4.5, "invitation section text"],
  ["gold", "bg", 3, "gold icons & rules"],
  ["glass-cobalt", "bg", 3, "cobalt accent"],
  ["glass-garnet", "bg", 3, "garnet accent"],
  ["glass-moss", "bg", 3, "moss accent"],
];

let failures = 0;
for (const [name, theme] of [["light", light], ["dark", dark]]) {
  for (const [fg, bg, min, why] of PAIRS) {
    if (!theme[fg] || !theme[bg]) {
      console.log(`FAIL [${name}] missing token --${theme[fg] ? bg : fg}`);
      failures++;
      continue;
    }
    const r = ratio(theme[fg], theme[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} [${name}] --${fg} on --${bg} = ${r.toFixed(2)} (min ${min}) — ${why}`);
  }
}
if (failures) {
  console.error(`\n${failures} contrast failure(s)`);
  process.exit(1);
}
console.log("\nAll contrast checks passed");
