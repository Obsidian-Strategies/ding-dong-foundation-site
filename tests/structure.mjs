// Structure / content contract for the built site in _site/. Run `npx @11ty/eleventy` first.
// Usage: node tests/structure.mjs   (run from site/)
import { readFileSync, existsSync } from "node:fs";

const PAGES = {
  "/": { title: "The DingDong Foundation Website" },
  "/story/": {}, "/mission/": {}, "/guidelines/": {}, "/apply/": {}, "/grants/": {}, "/donate/": {},
};
const FOUNDING = `When I went to school in Europe, I loved hearing church bells ringing every 1/2 hour and on Sundays but I've not heard much church bells ringing in the States and thought it'd be neat to have them ringing again as Christian's "Call to Prayers."`;
const MISSION = `The specific purpose of The DingDong Foundation, Inc. is to provide grants to support the building and restoration of church bell towers, pipe organs, rose windows, stained glass windows, and related sacred elements, as well as to provide grants to spiritual organizations that utilize sound, color, and frequency for healing practices. The corporation may also support related activities in sacred arts and architecture, including the training of artisans and apprentices as well as the study and dissemination of authentic scriptural and spiritual teachings.`;

const checks = [];
const check = (name, ok) => checks.push([name, ok]);
const count = (html, re) => (html.match(re) || []).length;

for (const route of Object.keys(PAGES)) {
  const file = new URL(`../_site${route}index.html`, import.meta.url);
  if (!existsSync(file)) { check(`${route} built`, false); continue; }
  const html = readFileSync(file, "utf8");
  const tag = (s) => `${route} ${s}`;
  check(tag("doctype + lang"), /^<!DOCTYPE html>\s*<html lang="en">/i.test(html.trim()));
  check(tag("title ends with org name"), /<title>(.* · )?The Ding Dong Foundation<\/title>/.test(html));
  check(tag("exactly one h1"), count(html, /<h1[\s>]/g) === 1);
  check(tag("sticky header with 6 nav links"), count(html, /<nav class="site-nav"[\s\S]*?<\/nav>/) === 1 && count(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 6);
  check(tag("Apply is not in the header nav"), !/<nav class="site-nav"[\s\S]*?Apply[\s\S]*?<\/nav>/.test(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]));
  check(tag("header Apply button"), /class="btn btn--sm btn--warm"[^>]*>Apply for a grant</.test(html));
  check(tag("one aria-current nav item"), route === "/apply/" ? count(html, /aria-current="page"/g) === 0 : count(html, /aria-current="page"/g) === 1);
  check(tag("footer nav has 7 links incl. Apply"), count(html.match(/<nav class="site-footer__nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 7 && />Apply<\/a>/.test(html));
  check(tag("Ave Maria dedication in footer"), /<em>Ave Maria<\/em>/.test(html));
  check(tag("501(c)(3) legal line"), /is a 501\(c\)\(3\) nonprofit organization incorporated in Florida\./.test(html));
  check(tag("no founder name"), !/Judy|Peng/.test(html));
  check(tag("no emoji"), !/[\u{1F300}-\u{1FAFF}]/u.test(html));
  check(tag("no 'Submit' / 'Learn more' buttons"), !/>(Submit|Learn more)</.test(html));
  check(tag("Phosphor icons stylesheet"), /@phosphor-icons\/web@2\.1\.1\/src\/regular\/style\.css/.test(html));
  check(tag("tokens + site css linked"), /css\/styles\.css/.test(html) && /css\/site\.css/.test(html));
}

const read = (r) => readFileSync(new URL(`../_site${r}index.html`, import.meta.url), "utf8");
check("home: founding sentence verbatim", read("/").includes(FOUNDING));
check("story: founding sentence verbatim", read("/story/").includes(FOUNDING));
check("mission: filed statement verbatim", read("/mission/").includes(MISSION));
check("home: hero photo", /uploads\/IMG_8851\.JPG/.test(read("/")));
check("home: three fund cards", count(read("/"), /<div class="card card--accent card--interactive">/g) === 3);
check("guidelines: three steps", count(read("/guidelines/"), /<span class="steps__num"/g) === 3);
check("apply: story/media opt-out checkbox", /id="optout"[^>]*type="checkbox"/.test(read("/apply/")));
check("apply: org name required", /id="org"[^>]*required/.test(read("/apply/")));
check("donate: anonymity checkbox", /id="anon"[^>]*type="checkbox"/.test(read("/donate/")));
check("donate: five amount buttons", count(read("/donate/"), /<button class="amount"/g) === 5);
check("grants: empty state", /The first grant is still ahead of us/.test(read("/grants/")));

// Type floor: no px font-size below 21.33 anywhere in site.css except icon glyph sizes (24px+).
const siteCss = readFileSync(new URL("../src/css/site.css", import.meta.url), "utf8");
const smallPx = [...siteCss.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1])).filter((n) => n < 21.33);
check("no font-size below 21.33px in site.css", smallPx.length === 0);

let failed = 0;
for (const [name, ok] of checks) { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${name}`); }
if (failed) { console.error(`\n${failed} structure failure(s)`); process.exit(1); }
console.log(`\nAll ${checks.length} structure checks passed`);
