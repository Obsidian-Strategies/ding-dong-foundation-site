// Dependency-free HTML structure / accessibility contract for index.html.
// Usage: node tests/structure.mjs   (run from site/)
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const checks = [];
const check = (name, ok) => checks.push([name, ok]);
const count = (re) => (html.match(re) || []).length;

check("doctype", /^<!DOCTYPE html>/i.test(html.trim()));
check('lang="en"', /<html[^>]*\blang="en"/.test(html));
check("viewport meta", /<meta[^>]*name="viewport"/.test(html));
check("description meta", /<meta[^>]*name="description"/.test(html));
check("title is org name", /<title>The DingDong Foundation<\/title>/.test(html));
check("links styles.css", /<link[^>]*href="css\/styles\.css"/.test(html));
check("skip link targets #main", /<a[^>]*class="skip-link"[^>]*href="#main"/.test(html));
check("exactly one h1", count(/<h1[\s>]/g) === 1);
check("header landmark", /<header[\s>]/.test(html));
check('nav aria-label="Primary"', /<nav[^>]*aria-label="Primary"/.test(html));
check("nav toggle has aria-expanded + aria-controls", /<button[^>]*class="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="primary-nav"/.test(html));
check('main id="main"', /<main[^>]*id="main"/.test(html));
check("footer landmark", /<footer[\s>]/.test(html));
check('footer id="contact"', /<footer[^>]*id="contact"/.test(html));
check("no founder name", !/Judy|Peng/.test(html));
check("org name spelled DingDong", /The DingDong Foundation/.test(html) && !/Ding Dong Foundation/.test(html));
check("hero section id=top", /<section[^>]*class="hero"[^>]*id="top"/.test(html));
check("hero has Ave Maria watermark, aria-hidden", /<span class="watermark" aria-hidden="true">Ave Maria<\/span>/.test(html));
check("tagline placeholder is marked", /<!-- PLACEHOLDER: tagline pending client pick -->/.test(html));
check("fund section id=fund", /<section[^>]*id="fund"/.test(html));
check("five fund tiles", count(/<li class="tile[^"]*">/g) === 5);
check("story section id=story", /<section[^>]*id="story"/.test(html));
check("pull quote present", /Not a product — this is a gift\./.test(html));
check("grants section id=grants", /<section[^>]*id="grants"/.test(html));
check("three grant steps", count(/<li class="step">/g) === 3);
check("invitation section id=invitation", /<section[^>]*id="invitation"/.test(html));
check("three prompts", count(/<li class="prompt">/g) === 3);
check("support section id=support", /<section[^>]*id="support"/.test(html));
check("no leftover SECTIONS marker", !/<!-- SECTIONS -->/.test(html));

// Every <svg> must be either decorative (aria-hidden) or meaningful (role="img" + aria-label).
const svgTags = html.match(/<svg[^>]*>/g) || [];
check(
  "every svg is aria-hidden or role=img+aria-label",
  svgTags.every((t) => /aria-hidden="true"/.test(t) || (/role="img"/.test(t) && /aria-label="/.test(t)))
);

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
}
if (failed) {
  console.error(`\n${failed} structure failure(s)`);
  process.exit(1);
}
console.log("\nAll structure checks passed");
