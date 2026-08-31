// Structure / content contract for the built site in _site/. Run `npx @11ty/eleventy` first.
// Usage: node tests/structure.mjs   (run from site/)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

const PAGES = {
  "/": { title: "The DingDong Foundation Website" },
  "/story/": {}, "/mission/": {}, "/guidelines/": {}, "/apply/": {}, "/grants/": {}, "/questions/": {}, "/donate/": {},
};
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
  check(tag("header/footer wordmark includes The"), count(html, /wordmark__ding">The Ding Dong</g) >= 2);
  check(tag("intro overlay wordmark includes The"), /intro__word">The Ding Dong</.test(html));
  check(tag("exactly one h1"), count(html, /<h1[\s>]/g) === 1);
  check(tag("sticky header with 7 nav links"), count(html, /<nav class="site-nav"[\s\S]*?<\/nav>/) === 1 && count(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 7);
  check(tag("Apply is not in the header nav"), !/<nav class="site-nav"[\s\S]*?Apply[\s\S]*?<\/nav>/.test(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]));
  check(tag("header Apply button"), /class="btn btn--sm btn--warm"[^>]*>Apply for a grant</.test(html));
  check(tag("one aria-current nav item"), route === "/apply/" ? count(html, /aria-current="page"/g) === 0 : count(html, /aria-current="page"/g) === 1);
  check(tag("footer nav has 8 links incl. Apply"), count(html.match(/<nav class="site-footer__nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 8 && />Apply<\/a>/.test(html));
  check(tag("Ave Maria dedication in footer"), /<em>Ave Maria<\/em>/.test(html));
  check(tag("501(c)(3) legal line"), /is a 501\(c\)\(3\) nonprofit organization incorporated in Florida\./.test(html));
  check(tag("no founder name"), !/Judy|Peng/.test(html));
  check(tag("no February/Europe/Grounded/founder"), !/February|Europe|Grounded|founder/i.test(html));
  check(tag("no emoji"), !/[\u{1F300}-\u{1FAFF}]/u.test(html));
  check(tag("no 'Submit' / 'Learn more' buttons"), !/>(Submit|Learn more)</.test(html));
  check(tag("Phosphor icons stylesheet"), /@phosphor-icons\/web@2\.1\.1\/src\/regular\/style\.css/.test(html));
  check(tag("tokens + site css linked"), /css\/styles\.css/.test(html) && /css\/site\.css/.test(html));
  check(tag("intro gate script before first paint"), /<head>[\s\S]*ddf-intro-v1[\s\S]*prefers-reduced-motion[\s\S]*<\/head>/.test(html));
  check(tag("intro overlay is a labelled dialog before the header"), /<body>\s*<div class="intro" data-intro-overlay[^>]* role="dialog" aria-label="[^"]+">[\s\S]*intro__bell-clapper[\s\S]*<\/div>\s*<header/.test(html));
  check(tag("intro has a real 'Ring the bell' button"), /<button class="btn intro__ring" type="button" data-intro-ring>Ring the bell<\/button>/.test(html));
  check(tag("intro bell audio preloaded and wired"), /<link rel="preload" href="[^"]*\/audio\/bell\.mp3" as="fetch" crossorigin>/.test(html) && /data-intro-audio="[^"]*\/audio\/bell\.mp3"/.test(html));
}
check("intro bell audio copied to _site", existsSync(new URL("../_site/audio/bell.mp3", import.meta.url)));

const read = (r) => readFileSync(new URL(`../_site${r}index.html`, import.meta.url), "utf8");
const siteCss = readFileSync(new URL("../src/css/site.css", import.meta.url), "utf8");
check("home: call to prayer — Angelus", /rung the Angelus/i.test(read("/")));
check("home: call to prayer — peal/toll pairing", /pealed for weddings and tolled in remembrance/i.test(read("/")));
check("home: call to prayer — heard again", /so that call is heard again/i.test(read("/")));
check("story: call to prayer — Angelus", /the Angelus tolled/i.test(read("/story/")));
check("story: call to prayer — serious undertaking", /a serious undertaking, not a pastime/i.test(read("/story/")));
check("story: call to prayer — healing frequency", /frequencies people have long found healing/i.test(read("/story/")));
check("story: peal/toll phrasing", /peals for weddings and a slow toll in remembrance/i.test(read("/story/")));
check("home: certification date", /certified by the IRS on July 28, 2026/i.test(read("/")));
check("story: certification date", /certified by the IRS on July 28, 2026/i.test(read("/story/")));
check("mission: filed statement verbatim", read("/mission/").includes(MISSION));
check("home: hero photo", /uploads\/IMG_8851\.JPG/.test(read("/")));
check("home: hero photo has figure--bell crop class", /class="figure figure--bell"/.test(read("/")));
check("home: figure--bell object-position crop is in the stylesheet", /\.figure--bell \.figure__frame img \{[^}]*object-position:/.test(siteCss));
check("story: ringing chamber photo, no placeholder", /uploads\/ringing-chamber\.jpg/.test(read("/story/")) && !/figure__placeholder/.test(read("/story/")));
check("home: three fund cards with reveal photos", count(read("/"), /<div class="card card--accent card--interactive fund__card" data-fund-card>/g) === 3 && /uploads\/fund-bells\.jpg/.test(read("/")) && /uploads\/fund-organ\.jpg/.test(read("/")) && /uploads\/fund-glass\.jpg/.test(read("/")));
check("guidelines: three steps", count(read("/guidelines/"), /<span class="steps__num"/g) === 3);
check("guidelines: electronic carillon section", (() => { const h = read("/guidelines/"); return /No bells\? No problem\./.test(h) && /A church without a tower can still ring/.test(h) && /nothing to cast, nothing to build/.test(h) && /Call to Worship/.test(h) && /the Angelus/.test(h) && /Westminster chimes/.test(h) && /a grant can cover one/.test(h); })());
check("apply: carillon project type", /<option value="carillon">Electronic carillon<\/option>/.test(read("/apply/")));
check("home: carillon mention on bells card", /Repair, rehanging, new rings — and electronic carillons for churches with no bells at all\./.test(read("/")));
check("apply: story/media opt-out checkbox", /id="optout"[^>]*type="checkbox"/.test(read("/apply/")));
check("apply: org name required", /id="org"[^>]*required/.test(read("/apply/")));
check("donate: anonymity checkbox", /id="anon"[^>]*type="checkbox"/.test(read("/donate/")));
check("donate: five amount buttons", count(read("/donate/"), /<button class="amount"/g) === 5);
check("donate: step two asks for name, email, phone and frequency, then hands off to Stripe", (() => { const h = read("/donate/"); return /data-donate-details hidden/.test(h) && /<form class="stack"[^>]*data-donate-form novalidate>/.test(h) && ["dname","demail","dphone"].every((id) => new RegExp('id="' + id + '"[^>]*required').test(h)) && !/autocomplete="cc-/.test(h) && /data-stripe-mock/.test(h) && />Continue to Stripe</.test(h) && count(h, /<button class="amount amount--freq" type="button" data-freq="(once|monthly)"/g) === 2 && /data-donate-back>Change the amount</.test(h); })());
check("grants: empty state", /The first grant is still ahead of us/.test(read("/grants/")));
check("questions: eleven questions plus ask-your-own, each a real button with its region", count(read("/questions/"), /<button class="faq__bar" type="button" id="faq-[a-z]+" aria-expanded="false" aria-controls="faq-[a-z]+-body" data-faq-bar>/g) === 12 && count(read("/questions/"), /<div class="faq__body" id="faq-[a-z]+-body" role="region"/g) === 12);
check("questions: ask-your-own form is the last item, with email and question fields", (() => { const h = read("/questions/"); const last = h.lastIndexOf("data-faq-item"); return h.indexOf('faq__item--ask') < last && h.indexOf('faq__item--ask') > h.lastIndexOf('id="faq-share"') - 200 && /id="faq-ask-body"[\s\S]*<form class="faq__ask" data-ask-form novalidate>[\s\S]*name="email"[^>]*required[\s\S]*<textarea[^>]*name="question"[^>]*required[\s\S]*>Send the question<\/button>/.test(h); })());
check("questions: FAQPage structured data with eleven entries", (() => { const m = read("/questions/").match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/); if (!m) return false; try { const j = JSON.parse(m[1]); return j["@type"] === "FAQPage" && j.mainEntity.length === 11 && j.mainEntity.every((e) => e.name && e.acceptedAnswer.text); } catch { return false; } })());
check("questions: answers never name the founder", !/Judy|Peng/.test(read("/questions/")));

// Type floor: no px font-size below 21.33 anywhere in site.css except icon glyph sizes (24px+).
const smallPx = [...siteCss.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1])).filter((n) => n < 21.33);
check("no font-size below 21.33px in site.css", smallPx.length === 0);

// Every var(--x) referenced anywhere in src/css/** must resolve to a --x defined somewhere in
// src/css/**. Catches things like the focus-ring regression: --ink-800 was deleted from
// colors.css but base.css kept referencing it, silently invalidating the whole outline shorthand.
const cssDir = new URL("../src/css/", import.meta.url);
const walk = (dirUrl) => {
  const out = [];
  for (const entry of readdirSync(dirUrl)) {
    const entryUrl = new URL(entry, dirUrl);
    if (statSync(entryUrl).isDirectory()) out.push(...walk(new URL(entry + "/", dirUrl)));
    else if (entry.endsWith(".css")) out.push(entryUrl);
  }
  return out;
};
const cssFiles = walk(cssDir).map((u) => ({ path: u.pathname.split("/src/css/")[1] || u.pathname, text: readFileSync(u, "utf8") }));
const definedTokens = new Set();
for (const { text } of cssFiles) for (const m of text.matchAll(/--([a-zA-Z0-9-]+)\s*:/g)) definedTokens.add(m[1]);
const unresolved = [];
for (const { path, text } of cssFiles) {
  for (const m of text.matchAll(/var\(\s*--([a-zA-Z0-9-]+)/g)) {
    if (!definedTokens.has(m[1])) unresolved.push(`--${m[1]} (in ${path})`);
  }
}
check(`every var(--x) in src/css/** resolves to a defined token` + (unresolved.length ? ` — unresolved: ${unresolved.join(", ")}` : ""), unresolved.length === 0);

// Collapsing mobile header (client, 2026-08-31). The behaviour is CSS + JS with no markup of
// its own, so assert both halves stay wired together.
const siteJs = readFileSync(new URL("../src/js/site.js", import.meta.url), "utf8");
check("header collapse: script toggles data-condensed", /data-condensed/.test(siteJs));
check("header collapse: script guards against the sticky-reflow feedback loop", /lockedUntil/.test(siteJs));
check("header collapse: styles are scoped to <=900px", /@media \(max-width: 900px\)[\s\S]*?\[data-condensed\][\s\S]*?\.site-nav/.test(siteCss));
check("header collapse: keyboard focus reopens the collapsed nav", /\[data-condensed\]:focus-within \.site-nav/.test(siteCss));
// The bell crop must stay centred on the bell; 50%+ pushes the window right and clips its lip.
const bellPos = siteCss.match(/\.figure--bell \.figure__frame img \{[^}]*object-position:\s*([0-9.]+)%/);
check("home: bell crop is centred on the bell (object-position <= 50%)", !!bellPos && parseFloat(bellPos[1]) <= 50);

let failed = 0;
for (const [name, ok] of checks) { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${name}`); }
if (failed) { console.error(`\n${failed} structure failure(s)`); process.exit(1); }
console.log(`\nAll ${checks.length} structure checks passed`);
