// Structure / content contract for the built site in _site/. Run `npx @11ty/eleventy` first.
// Usage: node tests/structure.mjs   (run from site/)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

const PAGES = {
  "/": { title: "The DingDong Foundation Website" },
  "/inspirations/": {}, "/mission/": {}, "/guidelines/": {}, "/apply/": {}, "/grants/": {}, "/questions/": {}, "/donate/": {},
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
  check(tag("title ends with org name"), /<title>(.* · )?The DingDong Foundation<\/title>/.test(html));
  check(tag("header/footer wordmark includes The"), count(html, /wordmark__ding">The DingDong</g) >= 2);
  check(tag("intro overlay: name, then motto pair, then the button"), /intro__name">The DingDong Foundation<\/div>\s*<div class="motto motto--light">\s*<span class="motto__en">Make a Joyful Noise to the Lord<\/span>\s*<span class="motto__la">Jubilate Deo<\/span>\s*<\/div>\s*<button class="btn intro__ring"/.test(html));
  check(tag("exactly one h1"), count(html, /<h1[\s>]/g) === 1);
  check(tag("sticky header with 6 nav links"), count(html, /<nav class="site-nav"[\s\S]*?<\/nav>/) === 1 && count(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 6);
  check(tag("header nav: Inspirations in, Mission out"), (() => { const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]; return />Inspirations</.test(nav) && !/>Mission</.test(nav) && !/>Our story</.test(nav); })());
  check(tag("footer nav keeps Mission and Inspirations"), (() => { const nav = html.match(/<nav class="site-footer__nav"[\s\S]*?<\/nav>/)[0]; return />Mission</.test(nav) && />Inspirations</.test(nav) && !/>Our story</.test(nav); })());
  check(tag("Apply is not in the header nav"), !/<nav class="site-nav"[\s\S]*?Apply[\s\S]*?<\/nav>/.test(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]));
  check(tag("no Apply link inside main"), route === "/apply/" || !/\/apply\//.test(html.match(/<main[\s\S]*?<\/main>/)[0]));
  check(tag("header Apply button"), /class="btn btn--sm btn--warm"[^>]*>Apply for a grant</.test(html));
  check(tag("one aria-current nav item"), (route === "/apply/" || route === "/mission/") ? count(html, /aria-current="page"/g) === 0 : count(html, /aria-current="page"/g) === 1);
  check(tag("footer nav has 8 links incl. Apply"), count(html.match(/<nav class="site-footer__nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 8 && />Apply<\/a>/.test(html));
  check(tag("Ave Maria dedication in footer"), /<em>Ave Maria<\/em>/.test(html));
  check(tag("501(c)(3) legal line"), /The DingDong Foundation, Inc\. A Florida nonprofit corporation recognized by the IRS as a 501\(c\)\(3\) private foundation\./.test(html));
  check(tag("no founder name"), !/Judy|Peng/.test(html));
  check(tag("no February/Europe/Grounded/founder"), !/February|Europe|Grounded|founder/i.test(html));
  check(tag("no 'Ding Dong' with a space, no 'public charity'"), !/Ding Dong|public charity/i.test(html));
  check(tag("no emoji"), !/[\u{1F300}-\u{1FAFF}]/u.test(html));
  check(tag("no inline style attributes"), !/ style="/.test(html));
  check(tag("hero pattern: eyebrow, h1, lede"), route === "/" ? /<h1 class="motto">/.test(html) : /<section class="section section--hero">\s*<div class="content stack">\s*<span class="eyebrow">[^<]+<\/span>\s*<h1 class="display">[\s\S]*?<\/h1>\s*<p class="lede">/.test(html));
  check(tag("no 'Submit' / 'Learn more' buttons"), !/>(Submit|Learn more)</.test(html));
  check(tag("Phosphor icons stylesheet"), /@phosphor-icons\/web@2\.1\.1\/src\/regular\/style\.css/.test(html));
  check(tag("tokens + site css linked"), /css\/styles\.css/.test(html) && /css\/site\.css/.test(html));
  check(tag("intro gate script before first paint"), /<head>[\s\S]*ddf-intro-v1[\s\S]*prefers-reduced-motion[\s\S]*<\/head>/.test(html));
  check(tag("intro overlay is a labelled dialog before the header"), /<body>\s*<div class="intro" data-intro-overlay[^>]* role="dialog" aria-label="[^"]+">[\s\S]*intro__bell-clapper[\s\S]*<\/div>\s*<header/.test(html));
  check(tag("intro has a real 'Ring the bell' button"), /<button class="btn intro__ring" type="button" data-intro-ring>Ring the bell<\/button>/.test(html));
  check(tag("intro bell audio preloaded and wired"), /<link rel="preload" href="[^"]*\/audio\/bell\.mp3" as="fetch" crossorigin>/.test(html) && /data-intro-audio="[^"]*\/audio\/bell\.mp3"/.test(html));
  check(tag("script face preloaded"), /<link rel="preload" href="[^"]*\/fonts\/great-vibes-latin\.woff2" as="font" type="font\/woff2" crossorigin>/.test(html));
}
check("intro bell audio copied to _site", existsSync(new URL("../_site/audio/bell.mp3", import.meta.url)));

const read = (r) => readFileSync(new URL(`../_site${r}index.html`, import.meta.url), "utf8");
const siteCss = readFileSync(new URL("../src/css/site.css", import.meta.url), "utf8");
check("script face copied to _site", existsSync(new URL("../_site/fonts/great-vibes-latin.woff2", import.meta.url)) && statSync(new URL("../_site/fonts/great-vibes-latin.woff2", import.meta.url)).size > 20000);
const fontsCss = readFileSync(new URL("../src/css/tokens/fonts.css", import.meta.url), "utf8");
check("fonts.css declares Great Vibes and --font-script", /@font-face\s*\{[^}]*font-family:\s*"Great Vibes"[^}]*great-vibes-latin\.woff2/.test(fontsCss) && /--font-script:\s*"Great Vibes"/.test(fontsCss));
check("motto component uses the script face", /\.motto \{[^}]*font-family: var\(--font-script\)/.test(siteCss));
check("home: call to prayer — Angelus", /rung the Angelus/i.test(read("/")));
check("home: call to prayer — peal/toll pairing", /pealed for weddings and tolled in remembrance/i.test(read("/")));
check("home: call to prayer — heard again", /so that call is heard again/i.test(read("/")));
check("home: certification date", /certified by the IRS on July 28, 2026/i.test(read("/")));
check("home: h1 is the motto pair in script", /<h1 class="motto">\s*<span class="motto__en">Make a Joyful Noise to the Lord<\/span>\s*<span class="motto__la">Jubilate Deo<\/span>\s*<\/h1>/.test(read("/")));
check("home: mission text verbatim", /The DingDong Foundation gives grants to mend what has gone quiet — church bells and their towers, pipe organs, rose windows, stained glass, and the craftspeople who keep them\. We also support sacred arts training and spiritual work with sound, color, and frequency\./.test(read("/")));
check("home: link to the filed purpose", /href="\/mission\/">Read the purpose as filed with the State of Florida</.test(read("/")));
check("home: no Apply or Read our story in the body", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return !/Apply for a grant|Read our story/.test(main); })());
check("home: call to prayer sits above What we fund", read("/").indexOf("Why we ring") < read("/").indexOf("What we fund"));
check("home: Lord's Prayer verbatim", /Our Father, who art in heaven,<br>\s*hallowed be thy name\.<br>[\s\S]*for ever and ever\. Amen\./.test(read("/")));
check("home: Psalm 100 verbatim, five verses", count(read("/"), /<li><span class="prayer__num" aria-hidden="true">\d<\/span>/g) === 5 && /his truth endureth to all generations\./.test(read("/")));
check("home: prayer intro line and photo caption", /The work of this foundation is carried with prayer\./.test(read("/")) && /figure__caption">Church of the Holy Sepulchre, bell tower, Jerusalem</.test(read("/")));
check("home: prayer section holds the bell photo", /<section class="section section--band prayer">(?:(?!<\/section>)[\s\S])*uploads\/IMG_8851\.JPG/.test(read("/")));
check("inspirations: call to prayer — Angelus", /the Angelus is tolled at morning, noon, and evening/i.test(read("/inspirations/")));
check("inspirations: serious undertaking", /a serious undertaking, not a pastime/i.test(read("/inspirations/")));
check("inspirations: healing frequency mention", /frequencies long associated with healing/i.test(read("/inspirations/")));
check("inspirations: certification date", /certified by the IRS on July 28, 2026/i.test(read("/inspirations/")));
check("inspirations: ringing chamber photo, no placeholder", /uploads\/ringing-chamber\.jpg/.test(read("/inspirations/")) && !/figure__placeholder/.test(read("/inspirations/")));
check("inspirations: dedication line verbatim", /Every project our foundation touches carries the same song with it: <em class="dedication">Ave Maria<\/em>\./.test(read("/inspirations/")));
check("inspirations: four resource links, names only", count(read("/inspirations/"), /<li><a href="https:\/\/[^"]+" rel="noopener">[^<]+<\/a><\/li>/g) === 4);
check("inspirations: no 'bells are the story', no 'what we are for'", !/The bells are the story|What we are for/i.test(read("/inspirations/")));
check("/story/ redirects to /inspirations/", (() => { const f = new URL("../_site/story/index.html", import.meta.url); return existsSync(f) && /<meta http-equiv="refresh" content="0; url=\/inspirations\/">/.test(readFileSync(f, "utf8")); })());
check("prayer for the world: template exists but is not published until Judy sends the text", existsSync(new URL("../src/prayer-for-the-world.njk", import.meta.url)) && !existsSync(new URL("../_site/prayer-for-the-world/index.html", import.meta.url)) && !/Prayer for the World/.test(read("/")));
check("mission: filed statement verbatim", read("/mission/").includes(MISSION));
check("home: bell photo present", /uploads\/IMG_8851\.JPG/.test(read("/")));
check("home: hero photo has figure--bell crop class", /class="figure figure--bell"/.test(read("/")));
check("home: figure--bell object-position crop is in the stylesheet", /\.figure--bell \.figure__frame img \{[^}]*object-position:/.test(siteCss));
check("home: three fund cards with reveal photos", count(read("/"), /<div class="card card--accent card--interactive fund__card" data-fund-card>/g) === 3 && /uploads\/fund-bells\.jpg/.test(read("/")) && /uploads\/fund-organ\.jpg/.test(read("/")) && /uploads\/fund-glass\.jpg/.test(read("/")));
check("guidelines: three steps", count(read("/guidelines/"), /<span class="steps__num"/g) === 3);
check("guidelines: lede uses the agreed sentence", /We focus on Christian sacred spaces, with room for related work\./.test(read("/guidelines/")));
check("guidelines: steps 2 and 3 verbatim", /We will read all submissions and reply\./.test(read("/guidelines/")) && /If a request passes the first review, we will ask for additional information such as budget plans, photographs, drawings, and a cost estimate\./.test(read("/guidelines/")));
check("guidelines: carillon block reworded and placed before How it goes", (() => { const h = read("/guidelines/"); return /For churches without bells/.test(h) && /nothing to cast, nothing to build/.test(h) && /Call to Worship/.test(h) && /the Angelus/.test(h) && /Westminster chimes/.test(h) && /A grant can cover one\./.test(h) && h.indexOf("For churches without bells") < h.indexOf("How it goes"); })());
check("guidelines: no fixed-amount section, no placeholder line, no 'No problem'", !/There is no fixed amount|Placeholder list|No bells\? No problem/.test(read("/guidelines/")));
check("apply: carillon project type", /<option value="carillon">Electronic carillon<\/option>/.test(read("/apply/")));
check("home: carillon mention on bells card", /Repair, rehanging, new rings — and electronic carillons for churches with no bells at all\./.test(read("/")));
check("apply: story/media opt-out checkbox", /id="optout"[^>]*type="checkbox"/.test(read("/apply/")));
check("apply: org name required", /id="org"[^>]*required/.test(read("/apply/")));
// Online giving is behind site.onlineGiving (src/_data/site.json). While it is false the page is
// check donations only (client, 2026-09-01). When it flips to true, restore the v2 assertions
// from git history (amount buttons, details form, Stripe hand-off, anonymity checkbox).
const siteData = JSON.parse(readFileSync(new URL("../src/_data/site.json", import.meta.url), "utf8"));
check("donate: online giving is switched off", siteData.onlineGiving === false);
check("donate: no amount buttons, no Stripe hand-off, no anonymity checkbox while giving is off", (() => { const h = read("/donate/"); return !/<button class="amount"/.test(h) && !/data-stripe-mock/.test(h) && !/id="anon"/.test(h) && !/data-donate/.test(h); })());
check("donate: Judy's check-only copy verbatim", (() => { const h = read("/donate/"); return /Gifts help restore church bells and towers, pipe organs, rose windows, and stained glass\./.test(h) && /To give by check, please make it payable to The DingDong Foundation, Inc\. and mail it to the address in the footer\. A receipt will be sent\./.test(h) && /Matching gifts, stock, and bequests can be arranged by <a href="mailto:hello@thedingdongfoundation\.org">email<\/a>\./.test(h); })());
check("donate: removed phrases are gone", !/Once, or every month|no staff to get past|write back either way/.test(read("/donate/")));
check("grants: empty state", /The first grant is still ahead of us/.test(read("/grants/")));
check("grants: new hero, no placeholders, no closing CTA", (() => { const h = read("/grants/"); return /<h1 class="display">Projects we have <em>funded<\/em>\.<\/h1>/.test(h) && /This page will show projects funded in whole or in part by The DingDong Foundation\./.test(h) && !/Where the grants have gone|figure__placeholder|Working on a bell/.test(h) && /What will live here/.test(h); })());
check("questions: eight questions plus ask-your-own, each a real button with its region", count(read("/questions/"), /<button class="faq__bar" type="button" id="faq-[a-z]+" aria-expanded="false" aria-controls="faq-[a-z]+-body" data-faq-bar>/g) === 9 && count(read("/questions/"), /<div class="faq__body" id="faq-[a-z]+-body" role="region"/g) === 9);
check("questions: ask-your-own form is the last item, with email and question fields", (() => { const h = read("/questions/"); const last = h.lastIndexOf("data-faq-item"); return h.indexOf('faq__item--ask') < last && h.indexOf('faq__item--ask') > h.lastIndexOf('id="faq-deadline"') - 200 && /id="faq-ask-body"[\s\S]*<form class="faq__ask" data-ask-form novalidate>[\s\S]*name="email"[^>]*required[\s\S]*<textarea[^>]*name="question"[^>]*required[\s\S]*>Send the question<\/button>/.test(h); })());
check("questions: FAQPage structured data with eight entries", (() => { const m = read("/questions/").match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/); if (!m) return false; try { const j = JSON.parse(m[1]); return j["@type"] === "FAQPage" && j.mainEntity.length === 8 && j.mainEntity.every((e) => e.name && e.acceptedAnswer.text); } catch { return false; } })());
check("questions: Judy's answers verbatim", (() => { const h = read("/questions/"); return /Eligible applicants are 501\(c\)\(3\) organizations seeking support for church bells and bell towers, pipe organs, rose windows, stained glass, related sacred architecture, artisan training, and, in some cases, spiritual work with sound, color, and frequency\. Grants are made case by case\. We focus on Christian sacred spaces, with room for related work\./.test(h) && /The board reviews requests as they are received\. If a request proceeds past the first review, we will ask for additional materials\. Timing varies\./.test(h); })());
check("questions: plain hero, removed questions and closing gone", !/The things people|Has anyone received a grant|Can I give|Will you share our project|Still wondering|confirming the edges/.test(read("/questions/")) && /<h1 class="display">Questions<\/h1>/.test(read("/questions/")));
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
check("phone header: script hides the bar on scroll", /data-hidden/.test(siteJs));
// The guard that matters: hiding must be a transform. Animating the header's HEIGHT changes
// the document height mid-scroll, and iOS then coasts past the end of the page, leaving dead
// space below the footer. If someone reintroduces a height/padding/max-height transition on
// the hidden state, this fails.
const hiddenRule = siteCss.match(/\.site-header\[data-hidden\][^{]*\{([^}]*)\}/);
check("phone header: hidden state moves the bar by transform only", !!hiddenRule && /transform:\s*translateY/.test(hiddenRule[1]));
check("phone header: hidden state never animates height", !!hiddenRule && !/(^|[^-])height:|padding|max-height/.test(hiddenRule[1]));
check("phone header: nav sits behind a Menu button below 900px", /@media \(max-width: 900px\)[\s\S]*?\[data-nav-open\] \.site-nav/.test(siteCss));
check("phone header: toggle is a real disclosure button", /<button class="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="site-nav"/.test(read("/")));
check("phone header: nav has the id the toggle points at", /<nav class="site-nav" id="site-nav"/.test(read("/")));
check("phone header: Escape and outside taps close the menu", /Escape[\s\S]{0,200}closeNav/.test(siteJs) && /!header\.contains\(e\.target\)/.test(siteJs));
// The bell crop must stay centred on the bell; 50%+ pushes the window right and clips its lip.
const bellPos = siteCss.match(/\.figure--bell \.figure__frame img \{[^}]*object-position:\s*([0-9.]+)%/);
check("home: bell crop is centred on the bell (object-position <= 50%)", !!bellPos && parseFloat(bellPos[1]) <= 50);

check("intro: light ground, gold bell, navy name", /\.intro \{[^}]*background: var\(--ivory-50\)/.test(siteCss) && /\.intro__bell \{[^}]*color: var\(--gold-600\)/.test(siteCss) && /\.intro__name \{[^}]*color: var\(--navy-950\)/.test(siteCss));
check("intro: button is a solid navy pane on the light ground", /\.intro__ring::after \{[^}]*background: var\(--navy-950\)/.test(siteCss));
check("wordmark: roman, medium weight, breathing room", /\.wordmark__ding \{[^}]*font-style: normal/.test(siteCss) && /\.wordmark__ding \{[^}]*font-weight: var\(--weight-medium\)/.test(siteCss) && /\.wordmark \{[^}]*gap: var\(--space-2\)/.test(siteCss));
check("type: one size for section h2s and the empty-state h2", /\.section-heading h2 \{[^}]*font-size: var\(--font-size-title-lg\)/.test(siteCss) && /\.empty h2 \{[^}]*font-size: var\(--font-size-title-lg\)/.test(siteCss));

// Fund-card photo reveal must work on touch too (client, 2026-08-31): the hover path is
// gated, so there has to be a tap path beside it, not instead of it.
check("fund cards: hover path still engages on pointer devices", /fundHoverable[\s\S]{0,400}addEventListener\("mousemove"/.test(siteJs));
check("fund cards: touch path taps to reveal", /else \{[\s\S]{0,900}addEventListener\("click", toggle\)/.test(siteJs));
check("fund cards: tap targets are announced as buttons", /setAttribute\("role", "button"\)[\s\S]{0,300}aria-expanded/.test(siteJs));

let failed = 0;
for (const [name, ok] of checks) { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${name}`); }
if (failed) { console.error(`\n${failed} structure failure(s)`); process.exit(1); }
console.log(`\nAll ${checks.length} structure checks passed`);
