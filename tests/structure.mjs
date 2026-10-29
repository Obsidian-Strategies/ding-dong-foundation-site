// Structure / content contract for the built site in _site/. Run `npx @11ty/eleventy` first.
// Usage: node tests/structure.mjs   (run from site/)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

const PAGES = {
  "/": {},
  "/inspirations/": {}, "/guidelines/": {}, "/donate/": {}, "/resources/": {}, "/apply/": {},
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
  check(tag("header wordmark: The DingDong, then Foundation, in small-capital lines"), count(html, /wordmark__line">The DingDong<\/span>\s*<span class="wordmark__line">Foundation</g) === 1 && !/wordmark__ding|wordmark__foundation/.test(html));
  check(tag("intro overlay: bell, then the English motto line alone, then the button; no name (client, 2026-09-23 and 2026-09-29)"), /<\/svg>\s*<div class="motto motto--light">\s*<span class="motto__en">Make a Joyful Noise to the Lord<\/span>\s*<\/div>\s*<button class="btn intro__ring"/.test(html) && !/<div class="intro"[\s\S]*?motto__la[\s\S]*?intro__ring/.test(html) && !/intro__name/.test(html) && !/<div class="intro"[\s\S]*?DingDong Foundation<\/div>/.test(html));
  check(tag("exactly one h1"), count(html, /<h1[\s>]/g) === 1);
  check(tag("sticky header with 6 nav links, Resources then Apply for a grant last, Grants and Questions out (client, 2026-09-29)"), count(html, /<nav class="site-nav"[\s\S]*?<\/nav>/) === 1 && count(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0], /<a /g) === 6 && /Resources<span aria-hidden="true"><\/span><\/a>\s*<a href="\/apply\/"[^>]*>Apply for a grant<span aria-hidden="true"><\/span><\/a>\s*<\/nav>/.test(html) && !/\/grants\/|\/questions\//.test(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]));
  check(tag("header nav: Inspirations in, Mission out"), (() => { const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]; return />Inspirations</.test(nav) && !/>Mission</.test(nav) && !/>Our story</.test(nav); })());
  check(tag("Apply for a grant is a plain link in the header nav, once (client, 2026-09-29: top navigation only)"), count(html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0], /Apply for a grant/g) === 1 && count(html, /Apply for a grant/g) === 1);
  check(tag("no Apply or Grants link inside main"), !/\/apply\/|\/grants\//.test(html.match(/<main[\s\S]*?<\/main>/)[0]));
  // The header button went on 2026-09-27 (Rogan); Apply came back as a plain link on 2026-09-29 (client).
  check(tag("no Apply button in the header"), (() => { const h = html.match(/<header class="site-header"[\s\S]*?<\/header>/)[0]; return !/site-header__action|<a class="btn|<button[^>]*>Apply/.test(h); })());
  check(tag("one aria-current nav item"), count(html, /aria-current="page"/g) === 1);
  // The footer repeats nothing from the header (client text, 2026-09-06): no second wordmark,
  // no second set of page links, no Apply link.
  check(tag("footer: no nav, no wordmark, no Apply link"), (() => { const f = html.match(/<footer[\s\S]*<\/footer>/)[0]; return !/<nav/.test(f) && !/wordmark/.test(f) && !/\/apply\//.test(f); })());
  // The Ave Maria dedication left the site on 2026-09-29 (client). Hymn names inside sentences may remain.
  check(tag("no Ave Maria dedication"), !/<em>Ave Maria<\/em>|class="dedication"/.test(html));
  // Footer contents and order are the client's list (2026-09-01): legal name, EIN, mailing
  // address, email, then the legal sentence. EIN is from the discovery questionnaire. No blurb.
  // Footer (client, 2026-09-29): legal name and town only. No EIN, street address, email, or legal line.
  check(tag("footer: legal name, the 501(c)(3) line, and town only (client, meeting of 2026-09-23: the status line goes down to the footer)"), (() => { const f = html.match(/<footer[\s\S]*<\/footer>/)[0]; return /<span>The DingDong Foundation, Inc\.<\/span>\s*<span>A 501\(c\)\(3\) private foundation<\/span>\s*<span>Sarasota, Florida<\/span>/.test(f) && !/EIN|Ritz|34236|mailto|hello@|recognized by the IRS|certified|site-footer__legal/.test(f); })());
  // The round bell photo from her business card, beside the text (client, 2026-10-16). Decorative: empty alt, no caption.
  check(tag("footer: business-card bell photo, decorative, before the text"), (() => { const f = html.match(/<footer[\s\S]*<\/footer>/)[0]; return count(f, /<img /g) === 1 && /<img class="site-footer__bell" src="\/uploads\/footer-bell\.jpg" alt=""[^>]*>\s*<div class="site-footer__contact">/.test(f) && !/<figcaption|<figure/.test(f); })());
  check(tag("no email or contact link anywhere"), !/mailto:|hello@thedingdongfoundation/.test(html));
  check(tag("no founder name"), !/Judy|Peng/.test(html));
  check(tag("no February/Europe/Grounded/founder"), !/February|Europe|Grounded|founder/i.test(html));
  check(tag("no 'Ding Dong' with a space, no 'public charity'"), !/Ding Dong|public charity/i.test(html));
  check(tag("no emoji"), !/[\u{1F300}-\u{1FAFF}]/u.test(html));
  check(tag("no inline style attributes"), !/ style="/.test(html));
  // Inner-page hero (polish, 2026-09-29): a plain h1 and one white paragraph in the wrap column.
  check(tag("hero pattern: plain h1 and one paragraph in the wrap column"), route === "/" ? /<h1 class="motto motto--solo">/.test(html) : /<section class="section section--hero">\s*<div class="wrap stack">\s*<h1 class="display">[^<]+<\/h1>\s*<p class="section-p">/.test(html));
  check(tag("no eyebrows, no italic words in headings, no card hover on static content"), !/class="eyebrow"/.test(html) && !/<h1 class="display">[^<]*<em>/.test(html) && (route === "/" || !/card--interactive/.test(html)));
  check(tag("no section uses the narrow centred column"), !/<section[^>]*>\s*<div class="content/.test(html.match(/<main[\s\S]*?<\/main>/)[0]));
  check(tag("favicon linked"), /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/.test(html));
  check(tag("no 'Submit' / 'Learn more' buttons"), !/>(Submit|Learn more)</.test(html));
  check(tag("Phosphor icons stylesheet"), /@phosphor-icons\/web@2\.1\.1\/src\/regular\/style\.css/.test(html));
  check(tag("tokens + site css linked"), /css\/styles\.css/.test(html) && /css\/site\.css/.test(html));
  // Cache busting (2026-09-23): every stylesheet and script link carries the build id, so a
  // deploy never draws new HTML with a browser's cached old CSS.
  check(tag("css and js links carry a build version"), count(html, /href="\/css\/(styles|site)\.css\?v=[a-z0-9]+"/g) === 2 && /src="\/js\/site\.js\?v=[a-z0-9]+"/.test(html));
  check(tag("intro gate script before first paint"), /<head>[\s\S]*ddf-intro-v1[\s\S]*prefers-reduced-motion[\s\S]*<\/head>/.test(html));
  check(tag("intro overlay is a labelled dialog before the header"), /<body>\s*<div class="intro" data-intro-overlay[^>]* role="dialog" aria-label="[^"]+">[\s\S]*intro__bell-clapper[\s\S]*<\/div>\s*<header/.test(html));
  check(tag("intro has a real 'Ring the bell' button"), /<button class="btn intro__ring" type="button" data-intro-ring>Ring the bell<\/button>/.test(html));
  // The bell sound is preloaded by the gate script only on visits that will show the intro
  // (polish, 2026-09-29); a static preload fetched it on every page view.
  check(tag("intro bell audio preloaded by the gate script only, and wired"), !/<link rel="preload" href="[^"]*\/audio\/bell\.mp3"/.test(html) && /<head>[\s\S]*l\.rel='preload';l\.as='fetch'[^\n]*\/audio\/bell\.mp3[\s\S]*<\/head>/.test(html) && /data-intro-audio="[^"]*\/audio\/bell\.mp3"/.test(html));
  check(tag("script face preloaded"), /<link rel="preload" href="[^"]*\/fonts\/great-vibes-latin\.woff2" as="font" type="font\/woff2" crossorigin>/.test(html));
}
check("intro bell audio copied to _site", existsSync(new URL("../_site/audio/bell.mp3", import.meta.url)));

const read = (r) => readFileSync(new URL(`../_site${r}index.html`, import.meta.url), "utf8");
const siteCss = readFileSync(new URL("../src/css/site.css", import.meta.url), "utf8");
const siteJs = readFileSync(new URL("../src/js/site.js", import.meta.url), "utf8");
check("script face copied to _site", existsSync(new URL("../_site/fonts/great-vibes-latin.woff2", import.meta.url)) && statSync(new URL("../_site/fonts/great-vibes-latin.woff2", import.meta.url)).size > 20000);
const fontsCss = readFileSync(new URL("../src/css/tokens/fonts.css", import.meta.url), "utf8");
check("fonts.css declares Great Vibes and --font-script", /@font-face\s*\{[^}]*font-family:\s*"Great Vibes"[^}]*great-vibes-latin\.woff2/.test(fontsCss) && /--font-script:\s*"Great Vibes"/.test(fontsCss));
check("motto component uses the script face", /\.motto \{[^}]*font-family: var\(--font-script\)/.test(siteCss));
// Her two paragraphs run as one (Rogan, 2026-09-29); every word is still hers.
check("home: why we ring, one paragraph, verbatim (client PDF, 2026-09-10)", /<p class="section-p">Church bells are the Christian call to prayer\. For centuries they have called the faithful to Sunday worship, rung the Angelus at morning, noon, and evening, pealed for weddings, and tolled in remembrance\. When a bell falls silent, a congregation loses more than a sound\. We exist so that call is heard again\.<\/p>/.test(read("/")));
check("home: why we ring is a section heading, not a pull quote", /<h2>Why we ring<\/h2>/.test(read("/")) && !/<blockquote>/.test(read("/")));
// The credibility line and the photo caption left Home on 2026-09-27 (Rogan).
check("home: no credibility bar, no hero caption", !/credibility/.test(read("/")) && !/<section class="section section--hero hero-bleed">(?:(?!<\/section>)[\s\S])*<figcaption/.test(read("/")));
check("home: board-dinner details are gone", !/fourteen days|one at a time/i.test(read("/")));
// Round 7 (client, 2026-10-12 and 2026-10-16): the English motto and Psalm 100:1 now sit under
// the Latin h1 on Home, in the same script; this reverses the 2026-09-23 "never together" rule.
check("home: h1 is Jubilate Deo, then the English motto in script with Psalm 100:1 under it (client, 2026-10-16)", /<h1 class="motto motto--solo">\s*<span class="motto__la">Jubilate Deo<\/span>\s*<\/h1>\s*<p class="motto motto--verse">\s*<span class="motto__en">Make a Joyful Noise to the Lord<\/span>\s*<cite class="motto__cite">Psalm 100:1<\/cite>\s*<\/p>/.test(read("/")) && count(read("/").match(/<main[\s\S]*?<\/main>/)[0], /motto__en/g) === 1);
check("home: Psalm citation is right-aligned under the motto, Times New Roman, at least 16px", /\.motto--verse \{[^}]*align-items: flex-end/.test(siteCss) && /\.motto__cite \{[^}]*font-family: var\(--font-display\)[^}]*font-size: var\(--font-size-(body|body-lg|fine)\)/.test(siteCss));
check("home: hero lede verbatim (client PDF, 2026-09-10; last sentence per her email of 2026-10-16)", /<p class="hero-bleed__lede">The DingDong Foundation restores the voice and light of the church — bells, towers, pipe organs, rose windows, and stained glass\. We support the artisans who carry these crafts forward and the organizations that use sacred sound and light in the service of worship and healing\.<\/p>/.test(read("/")) && !/employ sacred sound|We fund the artisans/.test(read("/")));
// Her opening paragraph is the mission statement (client, 2026-10-16): centred under the motto,
// larger and semi-bold. Only the hero is centred; the sections below keep the left edge.
check("home: opening paragraph centred, larger, semi-bold; the hero group centred", /\.hero-bleed__lede \{[^}]*font-size: clamp\(var\(--font-size-title-sm\)[^}]*font-weight: var\(--weight-semibold\)[^}]*text-align: center/.test(siteCss) && /\.hero-bleed__text \{[^}]*align-items: center[^}]*text-align: center/.test(siteCss) && !/\.section-p \{[^}]*text-align: center/.test(siteCss));
// The gold notes on the hero (client, 2026-10-12 and 2026-10-16; built in round 7) left on
// 2026-10-29 (Rogan, round 7.5). The drawing stays in _includes/home-notes.njk, unused. No audio on Home.
check("home: no notes in the hero, no audio on Home (Rogan, 2026-10-29)", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return !/hero-notes/.test(main) && !/<audio|\.mp3|\.ogg/.test(main) && !/\.hero-notes \{/.test(siteCss) && existsSync(new URL("../src/_includes/home-notes.njk", import.meta.url)); })());
check("home: filed statement is not on Home (client PDF, 2026-09-10)", !read("/").includes(MISSION) && !/As filed with the State of Florida/i.test(read("/")));
check("home: no link to a mission page", !/\/mission\//.test(read("/")));
check("home: no Apply or Read our story in the body", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return !/Apply for a grant|Read our story/.test(main); })());
check("home: call to prayer sits above What we fund", read("/").indexOf("Why we ring") < read("/").indexOf("What we fund"));
check("inspirations: Lord's Prayer verbatim, last section, on the page navy, no band; gone from Give (client, 2026-10-16)", (() => { const main = read("/inspirations/").match(/<main[\s\S]*?<\/main>/)[0]; const sections = main.match(/<section[\s\S]*?<\/section>/g); const last = sections[sections.length - 1]; return /class="section section--page prayer"/.test(last) && /<h2>Carried with prayer<\/h2>/.test(last) && /Our Father, who art in heaven,<br>\s*hallowed be thy name\.<br>[\s\S]*for ever and ever\. Amen\./.test(last) && count(last, /Our Father/g) === 1 && !/section--band/.test(main) && !/Our Father|Carried with prayer|class="[^"]*prayer/.test(read("/donate/").match(/<main[\s\S]*?<\/main>/)[0]); })());
check("inspirations: the prayer drifts only with script, never under reduced motion, pauses on hover, no pause button (Rogan, 2026-10-12)", /data-prayer-window/.test(read("/inspirations/")) && !/data-prayer-toggle|data-prayer-control|Pause the prayer/.test(read("/inspirations/")) && !/prayerToggle/.test(siteJs) && /prefers-reduced-motion: reduce\)"\)\.matches;\s*if \(prayer && !prayerCalm\)/.test(siteJs) && /\.prayer__window:hover \.prayer__track \{ animation-play-state: paused; \}/.test(siteCss) && /@keyframes prayerDrift/.test(siteCss) && /animation: prayerDrift 60s linear infinite/.test(siteCss) && /height: calc\(var\(--prayer-line\) \* 10\)/.test(siteCss) && /\.prayer__lines \{[^}]*font-size: var\(--font-size-title-sm\)/.test(siteCss));
check("home: no prayer, no band (client, 2026-09-29)", !/Our Father|class="[^"]*prayer|section--band/.test(read("/").match(/<main[\s\S]*?<\/main>/)[0]));
check("home: Jubilate Deo once, Psalm 100:1 once as the motto citation, no verse block (client, 2026-10-16)", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return count(main, /Jubilate Deo/g) === 1 && count(main, /Psalm/g) === 1 && count(main, /<cite class="motto__cite">Psalm 100:1<\/cite>/g) === 1 && !/prayer__verse|prayer__cite/.test(main); })());
check("inspirations: prayer sub-headings are gone", !/title-sm">The Lord's Prayer<|title-sm">Psalm 100</.test(read("/inspirations/")));
check("inspirations: prayer intro line", /The work of this foundation is carried with prayer\./.test(read("/inspirations/")));
check("home: hero is the bell photo full width with the motto over it", /<section class="section section--hero hero-bleed">(?:(?!<\/section>)[\s\S])*uploads\/holy-sepulchre-bells\.jpg(?:(?!<\/section>)[\s\S])*hero-bleed__scrim(?:(?!<\/section>)[\s\S])*<h1 class="motto motto--solo">/.test(read("/")));
check("home: hero scrim reaches 0.85 behind the text (matches contrast model)", /\.hero-bleed__scrim \{[^}]*rgba\(10, 18, 38, 0\.85\)/.test(siteCss));
check("home: hero photo loads eagerly", /<img src="[^"]*holy-sepulchre-bells\.jpg"[^>]*fetchpriority="high"/.test(read("/")) && !/<img src="[^"]*holy-sepulchre-bells\.jpg"[^>]*loading="lazy"/.test(read("/")));
check("inspirations: her tower photo beside the story, gold outline, one caption; two story paragraphs in the section size, the Why we ring repeat gone (client, 2026-10-16)", (() => { const h = read("/inspirations/"); const fig = /<figure class="figure figure--landscape figure--fill figure--gold">\s*<div class="figure__frame">\s*<img src="[^"]*\/uploads\/holy-sepulchre-tower\.jpg"[^>]*width="1600" height="1200"[^>]*>\s*<\/div>\s*<figcaption class="figure__caption">Church of the Holy Sepulchre, bell tower, Jerusalem\.<\/figcaption>\s*<\/figure>/.test(h); return fig && count(h, /<figcaption/g) === 1 && !/ringing-chamber/.test(h) && count(h.match(/<div class="stack prose">[\s\S]*?<\/div>/)[0], /<p class="section-p">/g) === 2 && !/For centuries the church bell|the Angelus is tolled/.test(h) && !/<p class="m0">/.test(h) && /\.figure--gold \.figure__frame \{ border: var\(--border-thick\) solid var\(--accent-primary\); \}/.test(siteCss) && /\.figure__caption \{[^}]*font-style: normal;[^}]*font-size: var\(--font-size-body\);[^}]*color: var\(--text-body\);/.test(siteCss); })());
check("inspirations: serious undertaking", /a serious undertaking, not a pastime/i.test(read("/inspirations/")));
check("inspirations: healing frequency mention", /frequencies long associated with healing/i.test(read("/inspirations/")));
check("inspirations: no certification or filing sentences", !/certified by the IRS|filed purpose|private foundation/.test(read("/inspirations/").match(/<main[\s\S]*?<\/main>/)[0]));
check("inspirations: no placeholder frame", !/figure__placeholder/.test(read("/inspirations/")));
check("inspirations: no Ave Maria section", !/Carried with a song|class="dedication"/.test(read("/inspirations/")));
// Resources (client, 2026-09-17): two groups, eight to twelve firms each, every entry a link,
// a place, and one line on what they do. Links were checked live when the round was built.
check("resources: three trades in her order under title-case headings, each with its groups (client emails, 2026-09-29 and 2026-10-16)", (() => { const h = read("/resources/"); const i = (s) => h.indexOf(s); const g = (s) => i(`<h3 class="resources__group">${s}</h3>`); return i("<h2>Bell Foundries and Carillons</h2>") > 0 && i("<h2>Bell Foundries and Carillons</h2>") < g("United States") && g("United States") < g("Electronic carillons for churches without bells") && g("Electronic carillons for churches without bells") < g("Abroad") && g("Abroad") < i('<h2 class="m0">Pipe Organ Builders</h2>') && i('<h2 class="m0">Pipe Organ Builders</h2>') < i('<h2 class="m0">Stained Glass Studios</h2>') && i('<h2 class="m0">Stained Glass Studios</h2>') < h.lastIndexOf('<h3 class="resources__group">United States</h3>') && !h.includes('<h3 class="resources__group">Studios</h3>') && !/Electronic systems for churches with no tower|Pipe organ builders and restorers|Rose windows and stained glass<\/h2>/.test(h) && !/resources__group/.test(read("/inspirations/")); })());
check("resources: her makers, each a bold linked name on its own line, then place · what they do (client, 2026-10-16); no closed foundries", (() => { const h = read("/resources/"); const groups = h.split('<h3 class="resources__group">').slice(1); if (groups.length !== 6) return false; let total = 0; const ok = groups.every((g) => { const list = g.match(/<ul class="resources">[\s\S]*?<\/ul>/); if (!list) return false; const n = count(list[0], /<li><strong class="resources__name"><a href="https?:\/\/[^"]+" rel="noopener">[^<]+<\/a><\/strong><p class="resources__detail">[^<]+ · [^<]+<\/p><\/li>/g); total += n; return n >= 1 && n === count(list[0], /<li>/g); }); const names = ["The Verdin Company", "McShane Bell Company", "B.A. Sunderlin Bellfoundry", "Christoph Paccard Bellfoundries", "Meeks, Watson and Company", "Chime Master", "Schulmerich Bells", "Fonderie Paccard", "John Taylor and Co", "Royal Eijsbouts", "Andover Organ Company", "Foley-Baker", "Paul Fritts and Co", "Parsons Pipe Organ Builders", "Schoenstein and Co", "C.B. Fisk", "Taylor and Boody Organbuilders", "Dobson Pipe Organ Builders", "Schantz Organ Company", "Reuter Organ Company", "Wicks Organ Company", "Buzard Pipe Organ Builders", "Casavant Frères", "Orgues Létourneau", "Organ Clearing House", "Stephen L. Emery Organ Service", "Willet Stained Glass Studios", "Conrad Schmitt Studios", "The Judson Studios", "Rohlf's Stained and Leaded Glass", "Lynchburg Stained Glass", "Raynal Studios"]; return ok && total === names.length && names.every((n) => h.includes(`rel="noopener">${n}</a>`)) && !/resources__place|resources__what/.test(h) && !/Meneely|Vanduzen|Stuckstede|Vanbergen/.test(h) && /apoba\.com/.test(h) && /pipeorgan\.org/.test(h) && /stainedglass\.org/.test(h); })());
check("resources: hero is Resources with no period and the new intro (client, 2026-10-16)", (() => { const h = read("/resources/"); return /<h1 class="display">Resources<\/h1>/.test(h) && /<p class="section-p">Trusted craftspeople and suppliers, along with answers to common questions\. Listing here is not an endorsement/.test(h) && !/Makers a church can still call/.test(h); })());
check("questions: round 7 wording, and guidelines page links to /guidelines/ (client, 2026-10-16)", (() => { const h = read("/resources/"); const ld = (h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1] || ""; return h.includes("It cannot pay salaries, operating costs, or debt; general building work unrelated to bells, organs, or glass; or political activity. The full lists are on the <a href=\"/guidelines/\">guidelines page</a>.") && h.includes("Please mention this in your inquiry.") && !/Say so in your inquiry|We will read it and reply|anything political|Grants are made case by case/.test(h) && ld.includes("The full lists are on the guidelines page.") && !/<a /.test(ld); })());
check("resources: not-an-endorsement line stays, once, in the hero", count(read("/resources/"), /Listing here is not an endorsement and is not a condition of any grant\./g) === 1 && /<p class="section-p">[^<]*Listing here is not an endorsement/.test(read("/resources/")));
check("inspirations: no 'bells are the story', no 'what we are for'", !/The bells are the story|What we are for/i.test(read("/inspirations/")));
check("/apply/ is its own page again: the first-inquiry form under one h1, title and intro in her 2026-10-16 wording", (() => { const h = read("/apply/"); return /<h1 class="display">Apply for a Grant<\/h1>/.test(h) && /<title>Apply for a Grant · /.test(h) && /<p class="section-p">Begin with a short inquiry\. Tell us about your organization and your project, and we will be in touch\.<\/p>/.test(h) && !/Apply for a grant\.|Start with a short inquiry|what you hope to do/.test(h) && /data-apply-form/.test(h) && !/http-equiv="refresh"/.test(h); })());
check("grants: hidden (permalink false), template kept, no nav link", existsSync(new URL("../src/grants.njk", import.meta.url)) && !existsSync(new URL("../_site/grants/index.html", import.meta.url)));
check("/questions/ redirects to the questions on /resources/ (client, 2026-09-23: combine them)", (() => { const f = new URL("../_site/questions/index.html", import.meta.url); return existsSync(f) && /<meta http-equiv="refresh" content="0; url=\/resources\/#questions">/.test(readFileSync(f, "utf8")); })());
check("resources: order is makers, then questions; no form on the page", (() => { const h = read("/resources/"); const i = (x) => h.indexOf(x); return i("resources__group") > 0 && i("resources__group") < i('id="questions"') && !/<form|data-apply-form|send-your-proposal|Send your proposal/.test(h); })());
check("/story/ redirects to /inspirations/", (() => { const f = new URL("../_site/story/index.html", import.meta.url); return existsSync(f) && /<meta http-equiv="refresh" content="0; url=\/inspirations\/">/.test(readFileSync(f, "utf8")); })());
check("prayer for the world: template exists but is not published until Judy sends the text", existsSync(new URL("../src/prayer-for-the-world.njk", import.meta.url)) && !existsSync(new URL("../_site/prayer-for-the-world/index.html", import.meta.url)) && !/Prayer for the World/.test(read("/")));
check("no /mission/ page is built and nothing links to it (Rogan, 2026-09-15)", !existsSync(new URL("../_site/mission/index.html", import.meta.url)) && !existsSync(new URL("../src/mission.njk", import.meta.url)));
check("home: bell photo present, the retouched file (client, 2026-09-23)", /uploads\/holy-sepulchre-bells\.jpg/.test(read("/")));
check("home: hero photo has figure--bell crop class", /class="hero-bleed__media figure figure--bell"/.test(read("/")));
check("home: hero photo crop is in the stylesheet", /\.hero-bleed img \{[^}]*object-position:/.test(siteCss));
// Three cards since 2026-09-27 (Rogan): the Artisan training card left Home.
check("home: three fund cards, each with a reveal photo", count(read("/"), /<div class="card card--accent card--interactive fund__card" data-fund-card>/g) === 3 && count(read("/"), /<div class="card__photo" aria-hidden="true">/g) === 3 && /uploads\/fund-bells\.jpg/.test(read("/")) && /uploads\/fund-organ\.jpg/.test(read("/")) && /uploads\/fund-glass\.jpg/.test(read("/")) && !/fund-artisan|Artisan training/.test(read("/")));
check("home: fund intro and card lines verbatim (wording per her email of 2026-10-16)", (() => { const h = read("/"); return /Grants support the building, restoration, and preservation of sacred architecture and the elements that give a house of worship its voice and its light\. We also fund the training of the artisans this work depends on\. Grant amounts are determined individually and discussed after the first review\./.test(h) && /Repair, rehanging, and new rings\. Electronic carillons for churches without bells\./.test(h) && /Restoration, purchase, and the regular tuning that keeps them in voice\./.test(h) && !/case by case|with no bells at all|keeps them honest/.test(h) && /Rose windows, stained glass, leadwork, and protective glazing\./.test(h); })());
check("home: fund card titles in sentence case", (() => { const h = read("/"); return />Bells and towers</.test(h) && />Pipe organs</.test(h) && />Windows and glass</.test(h); })());
// Home headings (Rogan, 2026-09-27): "What we fund" is the h2, the old headline is a white
// paragraph under it, no eyebrows anywhere on Home, and card text is not muted.
check("home: What we fund is the h2, old headline is a paragraph, no eyebrows", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return /<h2>What we fund<\/h2>/.test(main) && /<p class="section-p">Bells, organs, glass, and the hands that keep them\. Grants support the building/.test(main) && !/class="eyebrow"/.test(main) && !/class="lede"/.test(main.replace(/<section class="section section--hero[\s\S]*?<\/section>/, "")) && !/class="muted/.test(main); })());
check("home: no tag pills on the fund cards", !/<span class="tag">/.test(read("/").match(/data-fund>[\s\S]*?<\/section>/)[0]));
check("home: fund grid has a three-column rule", /\.grid--fund \{[^}]*repeat\(3, minmax\(0, 1fr\)\)/.test(siteCss));
// Every Home section shares one left edge (Rogan, 2026-09-27): all in .wrap, none in the
// narrower centred .content column.
check("home: every section sits in the .wrap column", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; return !/<section[^>]*>\s*<div class="content/.test(main); })());
// The closing "See the grant guidelines" button left Home on 2026-09-27 (Rogan): the prayer
// section is the last thing before the footer and carries the fade into it.
check("home: What we fund is the last section, no closing button, no Apply in the body", (() => { const main = read("/").match(/<main[\s\S]*?<\/main>/)[0]; const sections = main.match(/<section[\s\S]*?<\/section>/g); const last = sections[sections.length - 1]; return /What we fund/.test(last) && !/See the grant guidelines|class="btn/.test(main) && !/\/apply\//.test(main); })());
check("home: section order per the PDF, prayer gone", (() => { const h = read("/"); const i = (s) => h.indexOf(s); return i("hero-bleed") < i("Why we ring") && i("Why we ring") < i("What we fund") && i("What we fund") < i("<footer") && i("Carried with prayer") === -1; })());
check("guidelines: her three steps under How to apply, then the amounts line (client, 2026-10-16; no 'No documents yet', proposal in step 3)", (() => { const h = read("/guidelines/"); const sec = (h.split('<h2 class="m0">How to apply</h2>')[1] || "").split("</section>")[0]; return /<ol class="steps">\s*<li>Send a short inquiry\.<\/li>\s*<li>We review every inquiry and will reply\.<\/li>\s*<li>If a request passes the first review, we will ask for more information, such as a proposal, budget, photographs, drawings, and a cost estimate\.<\/li>\s*<\/ol>\s*<p class="section-p">Grant amounts are discussed after the first review\.<\/p>\s*<\/div>/.test(sec) && count(h, /Grant amounts are discussed/g) === 1 && !/No documents yet|steps__num/.test(h); })());
check("guidelines: title and Who we fund wording (client, 2026-10-16)", (() => { const h = read("/guidelines/"); return /<h1 class="display">Grant Guidelines<\/h1>/.test(h) && /Our focus is Christian sacred spaces, though we also consider closely related work\./.test(h) && !/with room for related work/.test(h); })());
check("guidelines: lists use the serial comma (client, 2026-10-16)", (() => { const h = read("/guidelines/"); return /Tower frames, headstocks, and fittings/.test(h) && /Pipe organ restoration, purchase, and tuning/.test(h) && /Rose windows, stained glass, and leadwork/.test(h) && /General building work unrelated to bells, organs, or glass/.test(h); })());
check("guidelines: her section order, Who we fund, pay for and cannot, How to apply (client, 2026-09-29; headings 2026-10-16)", (() => { const h = read("/guidelines/"); const i = (x) => h.indexOf(x); return i('<h2 class="m0">Who we fund</h2>') > 0 && i('<h2 class="m0">Who we fund</h2>') < i('<h2 class="m0">What a grant can pay for</h2>') && i('<h2 class="m0">What a grant can pay for</h2>') < i('<h2 class="m0">What a grant cannot pay for</h2>') && i('<h2 class="m0">What a grant cannot pay for</h2>') < i('<h2 class="m0">How to apply</h2>') && count(h, /<h2[\s>]/g) === 4; })());
check("guidelines: no How a grant works, What to send, or percentage sections (replaced by her email, 2026-09-29)", !/How a grant works|What to send|80 percent|Come with a proposal/.test(read("/guidelines/")));
check("guidelines and apply: no approve, reject, or write-to-us wording", ["/guidelines/", "/apply/"].every((r) => { const main = read(r).match(/<main[\s\S]*?<\/main>/)[0]; return !/approv|reject|write back|write to us|ask us|get in touch|feel free/i.test(main); }));
check("guidelines: the carillon note is her two sentences, under What a grant can pay for, not its own section (client, 2026-09-29; wording 2026-10-16)", (() => { const h = read("/guidelines/"); const col = (h.split('<h2 class="m0">What a grant can pay for</h2>')[1] || "").split('<h2 class="m0">What a grant cannot pay for</h2>')[0]; return /<\/ul>\s*<p class="section-p guidelines__note">Churches without bells may still apply\. A grant may cover an electronic carillon to ring the Call to Worship, the Angelus, weddings, and funerals\.<\/p>/.test(col) && !/For churches without bells|nothing to cast|Westminster|Ave Maria|Gregorian/.test(h); })());
// The "no fixed amount" section left on 2026-09-01 (client); the sentence came back inside "How a
// grant works" on 2026-09-29 (client: no fixed amount, case by case). Only a heading of it is banned.
check("guidelines: no fixed-amount heading, no placeholder line, no 'No problem'", !/<h[23][^>]*>There is no fixed amount|Placeholder list|No bells\? No problem/.test(read("/guidelines/")));
check("apply: the form sits on the page with no card, and the thank-you replaces it", (() => { const h = read("/apply/"); return /<div class="apply-form" data-apply-card>/.test(h) && !/<div class="card[^>]*data-apply-card/.test(h) && /data-apply-success hidden/.test(h); })());
check("apply: her seventeen fields in her order, the date auto-filled (client, 2026-09-29)", (() => { const h = read("/apply/"); const ids = ["org", "ein", "address", "mailing", "website", "contact", "role", "email", "phone", "description", "cost", "raised", "requested", "dates"]; let last = -1; const ordered = ids.every((id) => { const i = h.indexOf(`id="${id}"`); const ok = i > last; last = i; return ok; }); return ordered && /<input type="hidden" name="date" data-apply-date>/.test(h) && /data-apply-date\]"\)[\s\S]*?toISOString/.test(siteJs) && count(h, /<input type="radio" name="c3"/g) === 2 && count(h, /<input type="checkbox" name="ptype"/g) === 5 && h.indexOf('name="c3"') > h.indexOf('id="ein"') && h.indexOf('name="c3"') < h.indexOf('id="address"') && h.indexOf('name="ptype"') > h.indexOf('id="phone"') && h.indexOf('name="ptype"') < h.indexOf('id="description"') && !/<select/.test(h); })());
check("apply: her required fields are required, the optional ones are not", (() => { const h = read("/apply/"); const req = ["org", "ein", "address", "contact", "role", "email", "phone", "description", "cost", "raised"]; const opt = ["mailing", "website", "requested", "dates"]; const attr = (id) => (h.match(new RegExp(`id="${id}"[^>]*>`)) || [""])[0]; return req.every((id) => /\brequired\b/.test(attr(id))) && opt.every((id) => !/\brequired\b/.test(attr(id))) && count(h, /data-required/g) === 12 && /<label for="requested">Grant amount requested<\/label>/.test(h) && !/data-error="We need the grant amount requested\."|id="requested-error"/.test(h); })());
check("apply: optional document upload, at most ten files, checked by the script (Rogan, 2026-10-12)", (() => { const h = read("/apply/"); return /<div class="field" data-max-files="10" data-error="Please attach no more than 10 files\.">/.test(h) && /<input class="field__control field__file" id="files" name="files" type="file" multiple accept="[^"]*pdf[^"]*"/.test(h) && !/id="files"[^>]*\brequired\b/.test(h) && /data-file-list/.test(h) && /Up to 10 files/.test(h) && /control\.type === "file"/.test(siteJs) && /data-max-files/.test(siteJs) && /\[data-required\], \[data-max-files\]/.test(siteJs) && h.indexOf('id="files"') > h.indexOf('id="dates"') && h.indexOf('id="files"') < h.indexOf('apply__shared'); })());
check("apply: inquiry wording in the hero, button, and thank-you; no 'do not attach' note, no 'No documents yet' (Rogan, 2026-10-12)", (() => { const h = read("/apply/"); return /Send our inquiry<\/button>/.test(h) && /Thank you\. We have your inquiry\./.test(h) && !/apply__note|do not attach|No documents yet|proposal in hand|couple of weeks|looks like a fit/i.test(h); })());
// No choices (client, 2026-09-17): recipients do not opt out of being shown, applications
// are online only, one inquiry per applicant.
check("apply: her hints, and no determination-letter wording (client, 2026-09-29)", (() => { const h = read("/apply/"); return /As it appears on the IRS 501\(c\)\(3\) letter\./.test(h) && /Grants go only to 501\(c\)\(3\) organizations\./.test(h) && /<legend class="fieldset__legend">Is your organization a registered 501\(c\)\(3\)\?<span class="field__req"/.test(h) && /Pastor, administrator, board chair, etc\./.test(h) && /A few sentences is enough\./.test(h) && /Approximate dates\./.test(h) && !/determination letter/.test(h); })());
check("apply: no opt-out checkbox; funded projects are shared, stated once", !/id="optout"/.test(read("/apply/")) && count(read("/apply/"), /<p class="apply__shared">Funded projects may be featured on this site, including the church, the work, and the artisans who carried it out\.<\/p>/g) === 1);
check("apply: online only, no paper form and no mailing option", !/paper form|Prefer to mail it|Download the/i.test(read("/apply/")));
check("apply: no second inquiry button", !/Send another inquiry/.test(read("/apply/")));
check("apply: org name and email required", /id="org"[^>]*required/.test(read("/apply/")) && /id="email"[^>]*required/.test(read("/apply/")));
check("questions: how-to-apply answer follows the inquiry flow, online only", (() => { const h = read("/resources/"); const a = "Send a short inquiry through the Apply page, with your proposal and photographs if you have them. We will review it and reply. If the request passes the first review, we will ask for more, such as a budget, drawings, and a cost estimate. Everything is done online. There is nothing to print or mail."; const ld = (h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1] || ""; return h.includes(a) && !/paper form|post it|No documents yet/i.test(h) && ld.includes(a); })());
check("donate: hero is Give, no period, with no quiet option (client, 2026-10-16)", /<h1 class="display">Give<\/h1>/.test(read("/donate/")) && !/quietly/.test(read("/donate/")));
// Online giving (client, 2026-09-29): Stripe plus check. The card button is a Stripe Payment
// Link from src/_data/site.json; while the link is empty it is a stub button with a note. The
// v2 amount-and-details mock is gone for good (git history).
const siteData = JSON.parse(readFileSync(new URL("../src/_data/site.json", import.meta.url), "utf8"));
check("donate: payment link is a string in site.json (empty until Stripe is connected)", typeof siteData.stripePaymentLink === "string" && !("onlineGiving" in siteData));
check("donate: By check first, then Online with the fee and receipt sentences, then matching gifts (Rogan, 2026-09-29: humble)", (() => { const h = read("/donate/"); const i = (s) => h.indexOf(s); return /<h2 class="m0">Online<\/h2>/.test(h) && /The foundation covers the processing fee/.test(h) && /a receipt is emailed to you/.test(h) && i("<h2 class=\"m0\">By check</h2>") < i("<h2 class=\"m0\">Online</h2>") && !/Matching gifts|tax-deductible|a check is the way to give/.test(h); })());
check("donate: Give by card is a Stripe link when set, a self-explaining stub when not", (() => { const h = read("/donate/"); return siteData.stripePaymentLink ? new RegExp(`<a class="btn btn--ghost" href="${siteData.stripePaymentLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" rel="noopener">Give by card on Stripe</a>`).test(h) : /<button class="btn btn--ghost" type="button" data-give-stub aria-describedby="give-note">Give by card on Stripe<\/button>/.test(h) && /id="give-note" data-give-note hidden>Online giving opens as soon as the Stripe account is connected\./.test(h) && /data-give-stub/.test(siteJs); })());
check("donate: the mock flow is gone (no amounts, hand-off, anonymity checkbox, monthly)", (() => { const h = read("/donate/"); return !/<button class="amount"|data-stripe-mock|id="anon"|data-donate|every month|Continue to Stripe/.test(h) && !/\.amount \{|\.handoff \{|\.checkbox \{/.test(siteCss) && !/data-donate-form|Opening Stripe/.test(siteJs); })());
check("donate: no bright button, no card, nothing sticky (Rogan, 2026-09-29: humble)", !/btn--warm|btn--lg|class="card|class="actions"/.test(read("/donate/").match(/<main[\s\S]*?<\/main>/)[0]));
check("donate: nothing shown twice (each heading and sentence once)", (() => { const main = read("/donate/").match(/<main[\s\S]*?<\/main>/)[0]; return count(main, /<h1 /g) === 1 && count(main, /Gifts help restore/g) === 1 && count(main, /By check/g) === 1 && count(main, /A receipt will be sent/g) === 1 && !/class="eyebrow"/.test(main); })());
check("donate: Judy's hero sentence and her 2026-10-16 check wording verbatim: sentence, P.O. Box address block (upright), receipt line", (() => { const h = read("/donate/"); return /Gifts help restore church bells and towers, pipe organs, rose windows, and stained glass\./.test(h) && /<p class="section-p">To give by check, please make it payable to The DingDong Foundation, Inc\. and mail it to:<\/p>\s*<address class="section-p give__address">The DingDong Foundation, Inc\.<br>\s*P\.O\. Box 1414<br>\s*Sarasota, FL 34230<\/address>\s*<p class="section-p">A receipt will be sent\.<\/p>/.test(h) && !/address in the footer/.test(h) && /\.give__address \{ font-style: normal; \}/.test(siteCss) && !/mailto/.test(h); })());
check("donate: removed phrases are gone", !/Once, or every month|no staff to get past|write back either way/.test(read("/donate/")));
check("questions: eight questions, each a real button with its region", count(read("/resources/"), /<button class="faq__bar" type="button" id="faq-[a-z]+" aria-expanded="false" aria-controls="faq-[a-z]+-body" data-faq-bar>/g) === 8 && count(read("/resources/"), /<div class="faq__body" id="faq-[a-z]+-body" role="region"/g) === 8);
// The ask-your-own form left the page on 2026-09-29 (Rogan). The footer email is the way to write.
check("questions: no ask-your-own form", !/data-ask-form|faq__item--ask|Ask a question of your own/.test(read("/resources/")));
check("questions: FAQPage structured data with eight entries", (() => { const m = read("/resources/").match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/); if (!m) return false; try { const j = JSON.parse(m[1]); return j["@type"] === "FAQPage" && j.mainEntity.length === 8 && j.mainEntity.every((e) => e.name && e.acceptedAnswer.text); } catch { return false; } })());
check("questions: Judy's answers verbatim", (() => { const h = read("/resources/"); return /Eligible applicants are 501\(c\)\(3\) organizations seeking support for church bells and bell towers, pipe organs, rose windows, stained glass, related sacred architecture, artisan training, and, in some cases, spiritual work with sound, color, and frequency\. Grant amounts are determined individually\. Our focus is Christian sacred spaces, though we also consider closely related work\./.test(h) && /The board reviews requests as they are received\. If a request proceeds past the first review, we will ask for additional materials\. Timing varies\./.test(h); })());
check("questions: plain hero, removed questions and closing gone", !/The things people|Has anyone received a grant|Can I give|Will you share our project|Still wondering|confirming the edges/.test(read("/resources/")) && /<h2 class="m0">Questions<\/h2>/.test(read("/resources/")) && /<section class="section section--page" id="questions">/.test(read("/resources/")));
check("questions: answers never name the founder", !/Judy|Peng/.test(read("/resources/")));

// Type floor (client, 2026-09-29): 16px, which is 12pt. No px font-size below it anywhere in site.css.
const smallPx = [...siteCss.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1])).filter((n) => n < 16);
check("no font-size below 16px in site.css", smallPx.length === 0);
check("type floor token is 16px (12pt)", /--font-size-fine:\s*1rem;/.test(readFileSync(new URL("../src/css/tokens/typography.css", import.meta.url), "utf8")));

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
check("apply: script refuses a submission without an email, and checks every required field", /data-error="We need an email address to reply to\."/.test(read("/apply/")) && /data-email-error/.test(read("/apply/")) && /querySelectorAll\("\[data-required\], \[data-max-files\]"\)/.test(siteJs) && /control\.type === "email"\) return emailOk\(v\)/.test(siteJs));
// Questions list (client, 2026-09-07): the open question must not shift sideways (the list clips
// horizontally, so a shifted bar loses its left edge). Hover previews an answer; a click pins
// it, and hover must not move the panel while a question is pinned.
check("questions: open bar does not translate sideways", !/\.faq__bar\[aria-expanded="true"\] \{[^}]*translateX/.test(siteCss));
check("questions: hover previews, click pins, no ask form left in script or stylesheet", (() => { const s = siteJs.match(/--- Questions[\s\S]*?--- Fund cards/)[0]; return /mouseenter[^\n]*faqOpen\(i, true\)/.test(s) && /if \(soft && faqPinned !== -1\) return;/.test(s) && !/data-ask-form/.test(siteJs) && !/faq__ask/.test(siteCss); })());
check("phone header: script hides the bar on scroll", /data-hidden/.test(siteJs));
// The guard that matters: hiding must be a transform. Animating the header's HEIGHT changes
// the document height mid-scroll, and iOS then coasts past the end of the page, leaving dead
// space below the footer. If someone reintroduces a height/padding/max-height transition on
// the hidden state, this fails.
const hiddenRule = siteCss.match(/\.site-header\[data-hidden\][^{]*\{([^}]*)\}/);
check("phone header: hidden state moves the bar by transform only", !!hiddenRule && /transform:\s*translateY/.test(hiddenRule[1]));
check("phone header: hidden state never animates height", !!hiddenRule && !/(^|[^-])height:|padding|max-height/.test(hiddenRule[1]));
// The Apply button's bloom painted past the right edge at 1024 to 1279px and made the page
// scroll sideways by 12px (backlog, 2026-09-09; fixed 2026-09-17). Only overflow-x may be
// clipped: overflow-y must stay visible for the phone menu, and it must be clip, not hidden,
// so the header never becomes a scroll container.
check("header: x axis clipped so the button bloom cannot widen the page", /\.site-header \{[^}]*overflow-x: clip;/.test(siteCss) && !/\.site-header \{[^}]*overflow(-y)?: hidden/.test(siteCss));
// Round 7.5 (2026-10-29): the Menu button covers every width below 1024px, and the open panel
// sets the links as full-width rows at body size, Apply last and set apart, still a plain link.
check("phone header: nav sits behind a Menu button below 1024px", /@media \(max-width: 1023px\)[\s\S]*?\[data-nav-open\] \.site-nav/.test(siteCss) && !/@media \(max-width: 900px\) \{\s*\.site-header \{ transition/.test(siteCss));
check("phone header: open panel rows at body size with a hairline, Apply last with a larger gap, no button", /\.site-header\[data-nav-open\] \.site-nav a \{[^}]*font-size: var\(--font-size-body\)[^}]*border-top: 1px solid var\(--border-hairline\)/.test(siteCss) && /\.site-header\[data-nav-open\] \.site-nav a:last-child \{[^}]*margin-top: var\(--space-4\)/.test(siteCss) && !/\.site-header\[data-nav-open\] \.site-nav a:last-child \{[^}]*(background|color: var\(--text-accent\)|\.btn)/.test(siteCss));
// Round 7.5 (2026-10-29): one spacing rhythm. Sections carry --section-y (48px desktop, 32px
// phones) above and below; the inner-page hero takes one step more above its h1.
check("spacing: sections use --section-y, set to space-7, 32px on phones, hero one step more above", /\.section \{[^}]*padding: var\(--section-y\) var\(--space-6\)/.test(siteCss) && /--section-y: var\(--space-7\);/.test(readFileSync(new URL("../src/css/tokens/spacing.css", import.meta.url), "utf8")) && /@media \(max-width: 600px\) \{\s*:root \{ --section-y: var\(--space-6\); \}/.test(siteCss) && /\.section--hero \{[^}]*padding-top: var\(--space-8\)/.test(siteCss) && !/\.section \{[^}]*var\(--space-9\)/.test(siteCss));
check("spacing: the footer fade sits inside the last section's padding", /main > section\.section:last-of-type \{ padding-bottom: calc\(var\(--section-y\) \+ 120px\); \}/.test(siteCss) && /main > section\.section:last-of-type::after \{[^}]*height: 180px/.test(siteCss));
// Round 7.5 (2026-10-29): the form's fields sit under five legends, her order unchanged.
check("apply: five form groups in order, each holding its fields; her field order untouched", (() => { const h = read("/apply/"); const groups = h.split('<fieldset class="form-group">').slice(1); const legends = groups.map((g) => (g.match(/<legend class="form-group__legend">([^<]+)<\/legend>/) || [])[1]); const expect = { Organization: ['id="org"', 'id="ein"', 'name="c3"', 'id="address"', 'id="mailing"', 'id="website"'], Contact: ['id="contact"', 'id="role"', 'id="email"', 'id="phone"'], Project: ['name="ptype"', 'id="description"'], "Budget and timing": ['id="cost"', 'id="raised"', 'id="requested"', 'id="dates"'], "Supporting documents": ['id="files"'] }; return JSON.stringify(legends) === JSON.stringify(Object.keys(expect)) && groups.every((g, i) => { const body = g.split("</fieldset>\n\n        <fieldset")[0]; return expect[legends[i]].every((s) => body.includes(s)); }) && /\.form-group__legend \{[^}]*font-size: var\(--font-size-title-sm\)/.test(siteCss) && /\.form-group \{[^}]*gap: var\(--space-5\)/.test(siteCss) && /\.apply-form form \{ gap: var\(--space-8\); \}/.test(siteCss); })());
// Round 7.5 (2026-10-29): jump links under the Resources intro, ids on the trade sections, two
// columns of makers from 901px, no cards.
check("resources: jump links to the three trades and the questions, sections carry the ids, lists in two columns from 901px, no cards", (() => { const h = read("/resources/"); return /<nav aria-label="On this page">\s*<ul class="contents">\s*<li><a href="#bells">Bell Foundries and Carillons<\/a><\/li>\s*<li><a href="#organs">Pipe Organ Builders<\/a><\/li>\s*<li><a href="#glass">Stained Glass Studios<\/a><\/li>\s*<li><a href="#questions">Questions<\/a><\/li>\s*<\/ul>\s*<\/nav>/.test(h) && /<section class="section section--page" id="bells">/.test(h) && /<section class="section section--page" id="organs">/.test(h) && /<section class="section section--page" id="glass">/.test(h) && !/class="card/.test(h.match(/<main[\s\S]*?<\/main>/)[0]) && /@media \(min-width: 901px\) \{ \.resources \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \} \}/.test(siteCss) && /\.resources \{[^}]*gap: var\(--space-5\) var\(--space-7\)/.test(siteCss) && /section\[id\] \{ scroll-margin-top: /.test(siteCss); })());
check("home: fund cards no taller than they need (min-height 15rem)", /\.fund \.card \{ min-height: 15rem; \}/.test(siteCss));
check("phone header: toggle is a real disclosure button", /<button class="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="site-nav"/.test(read("/")));
check("phone header: nav has the id the toggle points at", /<nav class="site-nav" id="site-nav"/.test(read("/")));
check("phone header: Escape and outside taps close the menu", /Escape[\s\S]{0,200}closeNav/.test(siteJs) && /!header\.contains\(e\.target\)/.test(siteJs));
// The bell crop must stay centred on the bell; 50%+ pushes the window right and clips its lip.
const bellPos = siteCss.match(/\.hero-bleed img \{[^}]*object-position:\s*([0-9.]+)%/);
check("home: bell crop is centred on the bell (object-position <= 50%)", !!bellPos && parseFloat(bellPos[1]) <= 50);

check("intro: light ground, gold bell, no name style left behind", /\.intro \{[^}]*background: var\(--ivory-50\)/.test(siteCss) && /\.intro__bell \{[^}]*color: var\(--gold-600\)/.test(siteCss) && !/intro__name/.test(siteCss));
check("intro: motto is small (lede to 24px) and the button is a hairline navy pill at body size (client, 2026-09-29; one step up 2026-10-05)", /\.intro \.motto__en \{ font-size: clamp\(var\(--font-size-body-lg\), [^,]+, var\(--font-size-title-sm\)\)/.test(siteCss) && /\.intro__ring \{[^}]*font-size: var\(--font-size-body\)/.test(siteCss) && /\.intro__ring \{[^}]*color: var\(--navy-950\)/.test(siteCss) && /\.intro__ring::after \{[^}]*background: transparent/.test(siteCss) && /\.intro__ring::after \{[^}]*inset 0 0 0 1px var\(--navy-950\)/.test(siteCss) && /\.intro__ring:hover::after \{[^}]*background: var\(--navy-950\)/.test(siteCss));
// One colour (client, meeting of 2026-09-23): the name is gold, the nav links and all text are
// white, and there is no pink anywhere.
const colorsCss = readFileSync(new URL("../src/css/tokens/colors.css", import.meta.url), "utf8");
check("one colour: nav links white, muted and faint text retired to white", /\.site-nav a \{[^}]*color: var\(--text-body\)/.test(siteCss) && /--text-muted: var\(--white\)/.test(colorsCss) && /--text-faint: var\(--white\)/.test(colorsCss));
check("one colour: no pink in the stylesheet or the pages", !/var\(--rose-|227, 191, 182|icon--rose|accent-rose::/.test(siteCss) && !/--(accent-rose|status-error): var\(--rose/.test(colorsCss) && Object.keys(PAGES).every((r) => !/icon--rose|card--accent-rose/.test(read(r))));
check("wordmark: small capitals in the display face, one line (client card, 2026-09-23)", /\.wordmark__line \{[^}]*font-variant-caps: small-caps/.test(siteCss) && /\.wordmark__line \{[^}]*font-family: var\(--font-display\)/.test(siteCss) && !/\.wordmark__(ding|foundation)/.test(siteCss));
// Round 7 (client, 2026-10-16): the mark is bold, and stacked FOUNDATION is one step larger than the
// top line, which is justified so both lines share their left and right edges.
check("wordmark: bold, stacked FOUNDATION one size up, top line justified to match (client, 2026-10-16)", /\.wordmark__line \{[^}]*font-weight: var\(--weight-bold\)/.test(siteCss) && /\.wordmark__line \{[^}]*font-size: var\(--font-size-title\)/.test(siteCss) && /\.wordmark__line \{[^}]*text-align-last: justify/.test(siteCss) && /\.wordmark__line \+ \.wordmark__line \{[^}]*font-size: var\(--font-size-title-lg\)/.test(siteCss));
check("footer bell photo: built, shown round with a thin gold ring", existsSync(new URL("../_site/uploads/footer-bell.jpg", import.meta.url)) && /\.site-footer__bell \{[^}]*border-radius: 50%[^}]*border: 2px solid var\(--accent-warm\)/.test(siteCss));
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
