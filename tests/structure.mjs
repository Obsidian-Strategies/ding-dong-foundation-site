// Structure / content contract for the built site in _site/. Run `npx @11ty/eleventy` first.
// Usage: node tests/structure.mjs   (run from site/)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

const PAGES = {
  "/": {},
  "/inspirations/": {}, "/guidelines/": {}, "/apply/": {}, "/grants/": {}, "/questions/": {}, "/donate/": {},
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
  check(tag("header wordmark includes The"), count(html, /wordmark__ding">The DingDong</g) === 1);
  check(tag("intro overlay: name, then motto pair, then the button"), /intro__name">The DingDong Foundation<\/div>\s*<div class="motto motto--light">\s*<span class="motto__en">Make a Joyful Noise to the Lord<\/span>\s*<span class="motto__la">Jubilate Deo<\/span>\s*<\/div>\s*<button class="btn intro__ring"/.test(html));
  check(tag("exactly one h1"), count(html, /<h1[\s>]/g) === 1);
  check(tag("sticky header with 6 nav links"), count(html, /<nav class="site-nav"[\s\S]*?<\/nav>/) === 1 && count(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 6);
  check(tag("header nav: Inspirations in, Mission out"), (() => { const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]; return />Inspirations</.test(nav) && !/>Mission</.test(nav) && !/>Our story</.test(nav); })());
  check(tag("Apply is not in the header nav"), !/<nav class="site-nav"[\s\S]*?Apply[\s\S]*?<\/nav>/.test(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]));
  check(tag("no Apply link inside main"), route === "/apply/" || !/\/apply\//.test(html.match(/<main[\s\S]*?<\/main>/)[0]));
  check(tag("header Apply button is the only Apply button"), /class="btn btn--sm btn--warm"[^>]*>Apply for a grant</.test(html) && count(html, /Apply for a grant</g) === (route === "/apply/" ? 2 : 1));
  check(tag("one aria-current nav item"), route === "/apply/" ? count(html, /aria-current="page"/g) === 0 : count(html, /aria-current="page"/g) === 1);
  // The footer repeats nothing from the header (client text, 2026-09-06): no second wordmark,
  // no second set of page links, no Apply link.
  check(tag("footer: no nav, no wordmark, no Apply link"), (() => { const f = html.match(/<footer[\s\S]*<\/footer>/)[0]; return !/<nav/.test(f) && !/wordmark/.test(f) && !/\/apply\//.test(f); })());
  check(tag("Ave Maria dedication in footer"), /<em>Ave Maria<\/em>/.test(html));
  // Footer contents and order are the client's list (2026-09-01): legal name, EIN, mailing
  // address, email, then the legal sentence. EIN is from the discovery questionnaire. No blurb.
  check(tag("footer: Judy's list in her order"), /site-footer__contact">\s*<span>The DingDong Foundation, Inc\.<\/span>\s*<span>EIN 41-4593395<\/span>\s*<span>1111 Ritz Carlton Drive, Suite 1008<\/span>\s*<span>Sarasota, FL 34236, USA<\/span>\s*<a href="mailto:hello@thedingdongfoundation\.org">hello@thedingdongfoundation\.org<\/a>/.test(html) && !/site-footer__blurb/.test(html));
  check(tag("501(c)(3) legal line"), /<footer[\s\S]*<span>A Florida nonprofit corporation recognized by the IRS as a 501\(c\)\(3\) private foundation\.<\/span>[\s\S]*<\/footer>/.test(html));
  check(tag("no founder name"), !/Judy|Peng/.test(html));
  check(tag("no February/Europe/Grounded/founder"), !/February|Europe|Grounded|founder/i.test(html));
  check(tag("no 'Ding Dong' with a space, no 'public charity'"), !/Ding Dong|public charity/i.test(html));
  check(tag("no emoji"), !/[\u{1F300}-\u{1FAFF}]/u.test(html));
  check(tag("no inline style attributes"), !/ style="/.test(html));
  check(tag("hero pattern: eyebrow, h1, lede"), route === "/" ? /<h1 class="motto motto--solo">/.test(html) : /<section class="section section--hero">\s*<div class="content stack">\s*<span class="eyebrow">[^<]+<\/span>\s*<h1 class="display">[\s\S]*?<\/h1>\s*<p class="lede">/.test(html));
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
check("home: why we ring, paragraph one verbatim (client PDF, 2026-09-10)", /<p class="why__p">Church bells are the Christian call to prayer\. For centuries they have called the faithful to Sunday worship, rung the Angelus at morning, noon, and evening, pealed for weddings, and tolled in remembrance\.<\/p>/.test(read("/")));
check("home: why we ring, paragraph two verbatim with the pivot line", /<p class="why__p">When a bell falls silent, a congregation loses more than a sound\. We exist so that call is heard again\.<\/p>/.test(read("/")));
check("home: why we ring is a section heading, not a pull quote", /<h2>Why we ring<\/h2>/.test(read("/")) && !/<blockquote>/.test(read("/")));
check("home: credibility bar verbatim (client PDF, 2026-09-10)", /<p class="credibility__line">A 501\(c\)\(3\) private foundation <span class="credibility__dot" aria-hidden="true">·<\/span> IRS-certified July 2026 <span class="credibility__dot" aria-hidden="true">·<\/span> Grants across the United States<\/p>/.test(read("/")));
check("home: credibility bar sits directly under the hero", read("/").indexOf('class="credibility') > read("/").indexOf("hero-bleed__lede") && read("/").indexOf('class="credibility') < read("/").indexOf("Why we ring"));
check("home: board-dinner details are gone", !/fourteen days|one at a time/i.test(read("/")));
check("home: h1 is Jubilate Deo alone, in script; the English line stays on the entrance only", /<h1 class="motto motto--solo">\s*<span class="motto__la">Jubilate Deo<\/span>\s*<\/h1>/.test(read("/")) && !/<main[\s\S]*motto__en[\s\S]*<\/main>/.test(read("/")));
check("home: hero lede verbatim (client PDF, 2026-09-10)", /The DingDong Foundation restores the voice and light of the church — bells, towers, pipe organs, rose windows, and stained glass\. We fund the artisans who carry these crafts forward, and the organizations that employ sacred sound and light in the service of worship and healing\./.test(read("/")));
check("home: filed statement is not on Home (client PDF, 2026-09-10)", !read("/").includes(MISSION) && !/As filed with the State of Florida/i.test(read("/")));
check("home: no link to a mission page", !/\/mission\//.test(read("/")));
check("home: no Apply or Read our story in the body", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return !/Apply for a grant|Read our story/.test(main); })());
check("home: call to prayer sits above What we fund", read("/").indexOf("Why we ring") < read("/").indexOf("What we fund"));
check("home: Lord's Prayer verbatim", /Our Father, who art in heaven,<br>\s*hallowed be thy name\.<br>[\s\S]*for ever and ever\. Amen\./.test(read("/")));
check("home: Psalm 100 is verse 1 only, with its attribution (client PDF, 2026-09-10)", /<p class="prayer__verse">Make a joyful noise unto the Lord, all ye lands\.<\/p>\s*<p class="prayer__cite">— Psalm 100:1<\/p>/.test(read("/")) && !/prayer__num|Serve the Lord with gladness|endureth to all generations/.test(read("/")));
check("home: prayer sub-headings are gone", !/title-sm">The Lord's Prayer<|title-sm">Psalm 100</.test(read("/")));
check("home: prayer intro line and photo caption", /The work of this foundation is carried with prayer\./.test(read("/")) && /figure__caption">Church of the Holy Sepulchre, bell tower, Jerusalem</.test(read("/")));
check("home: hero is the bell photo full width with the motto over it", /<section class="section section--hero hero-bleed">(?:(?!<\/section>)[\s\S])*uploads\/IMG_8851\.JPG(?:(?!<\/section>)[\s\S])*hero-bleed__scrim(?:(?!<\/section>)[\s\S])*<h1 class="motto motto--solo">/.test(read("/")));
check("home: hero scrim reaches 0.85 behind the text (matches contrast model)", /\.hero-bleed__scrim \{[^}]*rgba\(10, 18, 38, 0\.85\)/.test(siteCss));
check("home: hero photo loads eagerly", /<img src="[^"]*IMG_8851\.JPG"[^>]*fetchpriority="high"/.test(read("/")) && !/<img src="[^"]*IMG_8851\.JPG"[^>]*loading="lazy"/.test(read("/")));
check("home: prayer section no longer holds the bell photo", !/<section class="section section--band prayer">(?:(?!<\/section>)[\s\S])*uploads\/IMG_8851\.JPG/.test(read("/")));
check("inspirations: call to prayer — Angelus", /the Angelus is tolled at morning, noon, and evening/i.test(read("/inspirations/")));
check("inspirations: serious undertaking", /a serious undertaking, not a pastime/i.test(read("/inspirations/")));
check("inspirations: healing frequency mention", /frequencies long associated with healing/i.test(read("/inspirations/")));
check("inspirations: certification date", /certified by the IRS on July 28, 2026/i.test(read("/inspirations/")));
check("inspirations: ringing chamber photo, no placeholder", /uploads\/ringing-chamber\.jpg/.test(read("/inspirations/")) && !/figure__placeholder/.test(read("/inspirations/")));
check("inspirations: dedication line verbatim", /Every project our foundation touches carries the same song with it: <em class="dedication">Ave Maria<\/em>\./.test(read("/inspirations/")));
// Resources (client, 2026-09-17): two groups, eight to twelve firms each, every entry a link,
// a place, and one line on what they do. Links were checked live when the round was built.
check("inspirations: two resource groups with headings", /<h3 class="resources__group">Bell foundries and carillons<\/h3>/.test(read("/inspirations/")) && /<h3 class="resources__group">Pipe organ builders and restorers<\/h3>/.test(read("/inspirations/")));
check("inspirations: eight to twelve firms per group, each with a place and a line", (() => { const h = read("/inspirations/"); const groups = h.split('<h3 class="resources__group">').slice(1); if (groups.length !== 2) return false; return groups.every((g) => { const list = g.match(/<ul class="resources">[\s\S]*?<\/ul>/); if (!list) return false; const n = count(list[0], /<li><a href="https?:\/\/[^"]+" rel="noopener">[^<]+<\/a><span class="resources__place">[^<]+<\/span><span class="resources__what">[^<]+<\/span><\/li>/g); return n >= 8 && n <= 12 && n === count(list[0], /<li>/g); }); })());
check("inspirations: not-an-endorsement line stays", /Listing here is not an endorsement and is not a condition of any grant\./.test(read("/inspirations/")));
check("inspirations: no 'bells are the story', no 'what we are for'", !/The bells are the story|What we are for/i.test(read("/inspirations/")));
check("/story/ redirects to /inspirations/", (() => { const f = new URL("../_site/story/index.html", import.meta.url); return existsSync(f) && /<meta http-equiv="refresh" content="0; url=\/inspirations\/">/.test(readFileSync(f, "utf8")); })());
check("prayer for the world: template exists but is not published until Judy sends the text", existsSync(new URL("../src/prayer-for-the-world.njk", import.meta.url)) && !existsSync(new URL("../_site/prayer-for-the-world/index.html", import.meta.url)) && !/Prayer for the World/.test(read("/")));
check("no /mission/ page is built and nothing links to it (Rogan, 2026-09-15)", !existsSync(new URL("../_site/mission/index.html", import.meta.url)) && !existsSync(new URL("../src/mission.njk", import.meta.url)));
check("home: bell photo present", /uploads\/IMG_8851\.JPG/.test(read("/")));
check("home: hero photo has figure--bell crop class", /class="hero-bleed__media figure figure--bell"/.test(read("/")));
check("home: hero photo crop is in the stylesheet", /\.hero-bleed img \{[^}]*object-position:/.test(siteCss));
check("home: four fund cards, each with a reveal photo (client PDF, 2026-09-10; Rogan, 2026-09-17)", count(read("/"), /<div class="card card--accent card--interactive fund__card" data-fund-card>/g) === 4 && count(read("/"), /<div class="card__photo" aria-hidden="true">/g) === 4 && /uploads\/fund-bells\.jpg/.test(read("/")) && /uploads\/fund-organ\.jpg/.test(read("/")) && /uploads\/fund-glass\.jpg/.test(read("/")) && /uploads\/fund-artisan\.jpg/.test(read("/")));
check("home: fund intro and card lines verbatim", (() => { const h = read("/"); return /Grants support the building, restoration, and preservation of sacred architecture and the elements that give a house of worship its voice and its light\. We also fund the training of the artisans this work depends on\. Grant amounts are determined case by case\./.test(h) && /Repair, rehanging, and new rings\. Electronic carillons for churches with no bells at all\./.test(h) && /Restoration, purchase, and the tuning that keeps them honest\./.test(h) && /Rose windows, stained glass, leadwork, and protective glazing\./.test(h) && /Apprenticeships and education in bell founding, organ building, and sacred glasswork\./.test(h); })());
check("home: fund card titles in sentence case", (() => { const h = read("/"); return />Bells and towers</.test(h) && />Pipe organs</.test(h) && />Windows and glass</.test(h) && />Artisan training</.test(h); })());
check("home: no tag pills on the fund cards", !/<span class="tag">/.test(read("/").match(/data-fund>[\s\S]*?<\/section>/)[0]));
check("home: fund grid has a four-column rule", /\.grid--fund \{[^}]*repeat\(4, minmax\(0, 1fr\)\)/.test(siteCss));
check("home: one centred guidelines button closes the page, no Apply in the body", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; const sections = main.match(/<section[\s\S]*?<\/section>/g); const last = sections[sections.length - 1]; return /<a class="btn btn--secondary btn--lg" href="\/guidelines\/">See the grant guidelines<\/a>/.test(last) && count(last, /<a /g) === 1 && count(main, /See the grant guidelines/g) === 1 && !/\/apply\//.test(main); })());
check("home: section order per the PDF", (() => { const h = read("/"); const i = (s) => h.indexOf(s); return i("hero-bleed") < i('class="credibility') && i('class="credibility') < i("Why we ring") && i("Why we ring") < i("What we fund") && i("What we fund") < i("Carried with prayer") && i("Carried with prayer") < i("See the grant guidelines") && i("See the grant guidelines") < i("<footer"); })());
check("guidelines: three steps", count(read("/guidelines/"), /<span class="steps__num"/g) === 3);
check("guidelines: lede uses the agreed sentence", /We focus on Christian sacred spaces, with room for related work\./.test(read("/guidelines/")));
check("guidelines: steps 2 and 3 verbatim", /We will read all submissions and reply\./.test(read("/guidelines/")) && /If a request passes the first review, we will ask for additional information such as budget plans, photographs, drawings, and a cost estimate\./.test(read("/guidelines/")));
check("guidelines: carillon block reworded and placed before How it goes", (() => { const h = read("/guidelines/"); return /For churches without bells/.test(h) && /nothing to cast, nothing to build/.test(h) && /Call to Worship/.test(h) && /the Angelus/.test(h) && /Westminster chimes/.test(h) && /A grant can cover one\./.test(h) && h.indexOf("For churches without bells") < h.indexOf("How it goes"); })());
check("guidelines: no fixed-amount section, no placeholder line, no 'No problem'", !/There is no fixed amount|Placeholder list|No bells\? No problem/.test(read("/guidelines/")));
check("apply: carillon project type", /<option value="carillon">Electronic carillon<\/option>/.test(read("/apply/")));
// No choices (client, 2026-09-17): recipients do not opt out of being shown, applications
// are online only, one inquiry per applicant.
check("apply: no opt-out checkbox; funded projects are shared, stated once", !/id="optout"/.test(read("/apply/")) && /<p class="apply__shared">Funded projects are shared on this site: the church, the work, and the people who did it\.<\/p>/.test(read("/apply/")));
check("apply: online only, no paper form and no mailing option", !/paper form|Prefer to mail it|Download the/i.test(read("/apply/")));
check("apply: no second inquiry button", !/Send another inquiry/.test(read("/apply/")));
check("apply: org name and email required", /id="org"[^>]*required/.test(read("/apply/")) && /id="email"[^>]*required/.test(read("/apply/")));
check("apply: project type says Artisan training", /<option value="arts">Artisan training<\/option>/.test(read("/apply/")) && !/Sacred arts or apprenticeship/.test(read("/apply/")));
check("questions: how-to-apply answer is online only", (() => { const h = read("/questions/"); const a = "Send a short inquiry through the form on this site. It takes a few minutes and asks for no documents. If it looks like a fit, we will write back and ask for photographs, drawings and estimates."; const ld = (h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1] || ""; return h.includes(a) && !/paper form|post it/i.test(h) && ld.includes(a); })());
check("donate: hero is Give. with no quiet option", /<h1 class="display">Give\.<\/h1>/.test(read("/donate/")) && !/quietly/.test(read("/donate/")));
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
check("apply: script refuses a submission without an email", /data-email-error/.test(siteJs) && /We need an email address to reply to\./.test(siteJs));
// Questions list (client, 2026-09-07): the open question must not shift sideways (the list clips
// horizontally, so a shifted bar loses its left edge). Hover previews an answer; a click pins
// it, and hover must not move the panel while a question is pinned.
check("questions: open bar does not translate sideways", !/\.faq__bar\[aria-expanded="true"\] \{[^}]*translateX/.test(siteCss));
check("questions: hover previews, click pins", (() => { const s = siteJs.match(/--- Questions[\s\S]*?--- Fund cards/)[0]; return /mouseenter[^\n]*faqOpen\(i, true\)/.test(s) && /if \(soft && \(faqPinned !== -1/.test(s) && /faqPinned = faqPinned === i \? -1 : i/.test(s); })());
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
const bellPos = siteCss.match(/\.hero-bleed img \{[^}]*object-position:\s*([0-9.]+)%/);
check("home: bell crop is centred on the bell (object-position <= 50%)", !!bellPos && parseFloat(bellPos[1]) <= 50);

check("intro: light ground, gold bell, navy name", /\.intro \{[^}]*background: var\(--ivory-50\)/.test(siteCss) && /\.intro__bell \{[^}]*color: var\(--gold-600\)/.test(siteCss) && /\.intro__name \{[^}]*color: var\(--navy-950\)/.test(siteCss));
check("intro: button is a solid navy pane on the light ground", /\.intro__ring::after \{[^}]*background: var\(--navy-950\)/.test(siteCss));
check("wordmark: roman, medium weight, breathing room", /\.wordmark__ding \{[^}]*font-style: normal/.test(siteCss) && /\.wordmark__ding \{[^}]*font-weight: var\(--weight-medium\)/.test(siteCss) && /\.wordmark \{[^}]*gap: var\(--space-2\)/.test(siteCss));
check("type: one size for section h2s and the empty-state h2", /\.section-heading h2 \{[^}]*font-size: var\(--font-size-title-lg\)/.test(siteCss) && /\.empty h2 \{[^}]*font-size: var\(--font-size-title-lg\)/.test(siteCss));

// .btn--ghost is a plain text link (see the Home hero "Read the purpose as filed..." link). If
// it inherits .btn's white-space: nowrap, a long label paints outside its box on narrow phones
// and the whole page scrolls sideways. It must wrap like ordinary text instead.
check("btn--ghost wraps like a plain text link instead of forcing nowrap", /\.btn--ghost \{[^}]*white-space:\s*normal/.test(siteCss));

// Fund-card photo reveal must work on touch too (client, 2026-08-31): the hover path is
// gated, so there has to be a tap path beside it, not instead of it.
check("fund cards: hover path still engages on pointer devices", /fundHoverable[\s\S]{0,400}addEventListener\("mousemove"/.test(siteJs));
check("fund cards: touch path taps to reveal", /else \{[\s\S]{0,900}addEventListener\("click", toggle\)/.test(siteJs));
check("fund cards: tap targets are announced as buttons", /setAttribute\("role", "button"\)[\s\S]{0,300}aria-expanded/.test(siteJs));

let failed = 0;
for (const [name, ok] of checks) { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${name}`); }
if (failed) { console.error(`\n${failed} structure failure(s)`); process.exit(1); }
console.log(`\nAll ${checks.length} structure checks passed`);
