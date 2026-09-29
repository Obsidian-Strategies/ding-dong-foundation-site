// Apply and Give page behaviour. Form delivery and online giving are stubbed until a form
// service and the Stripe Payment Link exist.
(function () {
  // --- Apply -------------------------------------------------------------
  var applyForm = document.querySelector("[data-apply-form]");
  if (applyForm) {
    var applyCard = document.querySelector("[data-apply-card]");
    var applySuccess = document.querySelector("[data-apply-success]");
    var org = applyForm.querySelector("#org");
    var orgField = org.closest(".field");
    var orgError = applyForm.querySelector("[data-org-error]");
    // Email is required too (client, 2026-09-17): applications are online only, so the reply
    // has nowhere else to go.
    var email = applyForm.querySelector("#email");
    var emailField = email.closest(".field");
    var emailError = applyForm.querySelector("[data-email-error]");
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

    applyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!org.value.trim()) {
        orgField.classList.add("field--error");
        orgError.textContent = "We need the name of the organization.";
        orgError.hidden = false;
        org.focus();
        return;
      }
      orgField.classList.remove("field--error");
      orgError.hidden = true;
      if (!emailOk(email.value.trim())) {
        emailField.classList.add("field--error");
        emailError.textContent = "We need an email address to reply to.";
        emailError.hidden = false;
        email.focus();
        return;
      }
      emailField.classList.remove("field--error");
      emailError.hidden = true;
      applyCard.hidden = true;
      applySuccess.hidden = false;
      // The form sits at the end of Resources, so the thank-you takes its place rather than
      // sending the reader back to the top of the page.
      applySuccess.scrollIntoView({ block: "start" });
    });

    // Character count under the 5,000-character box (Ken, 2026-09-29) and the names of the
    // files chosen for upload. Delivery of both is stubbed until a form service is chosen.
    var need = applyForm.querySelector("#need");
    var needCount = applyForm.querySelector("[data-need-count]");
    if (need && needCount && need.maxLength > 0) {
      var updateCount = function () {
        var left = need.maxLength - need.value.length;
        needCount.textContent = left.toLocaleString("en-US") + (left === 1 ? " character left" : " characters left");
      };
      need.addEventListener("input", updateCount);
      updateCount();
    }
    var files = applyForm.querySelector("#files");
    var fileList = applyForm.querySelector("[data-file-list]");
    if (files && fileList) {
      files.addEventListener("change", function () {
        var names = Array.prototype.map.call(files.files, function (f) { return f.name; });
        fileList.textContent = names.length ? "Attached: " + names.join(", ") : "";
      });
    }

    var applyReset = document.querySelector("[data-apply-reset]");
    if (applyReset) {
      applyReset.addEventListener("click", function () {
        applyForm.reset();
        applySuccess.hidden = true;
        applyCard.hidden = false;
      });
    }
  }

  // --- Give ---------------------------------------------------------------
  // Online giving is a Stripe Payment Link set in src/_data/site.json. While the link is
  // empty the page renders a stub button; a click shows the note under it (client, 2026-09-29).
  var giveStub = document.querySelector("[data-give-stub]");
  var giveNote = document.querySelector("[data-give-note]");
  if (giveStub && giveNote) {
    giveStub.addEventListener("click", function () {
      giveNote.hidden = false;
      giveStub.setAttribute("aria-expanded", "true");
    });
  }

  // --- Questions (hover to preview, click to pin) ------------------------------
  // Without this script every answer is visible beneath its question. With it, the answers
  // move into the panel on the right. Hovering a question previews its answer; clicking one
  // pins it, and from then on hovering changes nothing until another question is clicked
  // (client, 2026-09-07). Clicking the pinned question again unpins it. Keyboard focus and
  // taps behave like clicks.
  // Under 900px the panel is hidden and the open answer shows beneath its question instead.
  var faq = document.querySelector("[data-faq]");
  if (faq) {
    var faqItems = [].slice.call(faq.querySelectorAll("[data-faq-item]"));
    var faqPanel = faq.querySelector("[data-faq-panel]");
    var faqActive = -1;
    var faqPinned = -1;
    var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

    function faqOpen(i, soft) {
      if (i === faqActive) return;
      if (soft && faqPinned !== -1) return;
      faqActive = i;
      faqItems.forEach(function (item, j) {
        item.querySelector("[data-faq-bar]").setAttribute("aria-expanded", String(j === i));
      });
      var item = faqItems[i];
      var q = item.querySelector("[data-faq-bar] span").textContent;
      var body = item.querySelector("[data-faq-body]");
      var article = document.createElement("article");
      article.className = "card card--lg card--accent card--interactive faq__answer";
      var h = document.createElement("h3");
      h.textContent = q;
      article.appendChild(h);
      [].slice.call(body.children).forEach(function (el) { article.appendChild(el.cloneNode(true)); });
      faqPanel.innerHTML = "";
      faqPanel.appendChild(article);
    }

    faqItems.forEach(function (item, i) {
      var bar = item.querySelector("[data-faq-bar]");
      bar.addEventListener("click", function () {
        // on touch screens a second tap on the open question closes it
        if (!canHover && faqActive === i) {
          faqActive = -1;
          faqPinned = -1;
          bar.setAttribute("aria-expanded", "false");
          return;
        }
        // a second click on the pinned question lets hover take over again
        faqPinned = faqPinned === i ? -1 : i;
        faqOpen(i);
      });
      bar.addEventListener("focus", function () { faqOpen(i); });
      if (canHover) bar.addEventListener("mouseenter", function () { faqOpen(i, true); });
    });

    faq.setAttribute("data-faq", "enhanced");
    faqOpen(0);
  }

  // --- Fund cards (homepage photo reveal) ------------------------------------
  // After Opal's showcase: one data-focus on the grid, set from JS rather than :hover so
  // it cannot flicker while the siblings move, held until the pointer leaves the grid.
  var fund = document.querySelector("[data-fund]");
  if (fund) {
    var fundCards = [].slice.call(fund.querySelectorAll("[data-fund-card]"));
    var fundEngage = function (i) {
      if (fund.getAttribute("data-focus") === String(i)) return;
      fund.setAttribute("data-focus", String(i));
      fundCards.forEach(function (c, j) { if (j === i) c.setAttribute("data-engaged", ""); else c.removeAttribute("data-engaged"); });
    };
    var fundClear = function () {
      fund.removeAttribute("data-focus");
      fundCards.forEach(function (c) { c.removeAttribute("data-engaged"); });
    };
    var fundHoverable = window.matchMedia && window.matchMedia("(hover: hover)").matches;

    if (fundHoverable) {
      fundCards.forEach(function (c, i) {
        c.addEventListener("mousemove", function () { fundEngage(i); });
        c.addEventListener("focusin", function () { fundEngage(i); });
      });
      fund.addEventListener("mouseleave", fundClear);
      fund.addEventListener("focusout", function (e) { if (!fund.contains(e.relatedTarget)) fundClear(); });
    } else {
      // Touch: there is no hover to reveal the photo, so a tap does it (client, 2026-08-31).
      // Tapping the open card closes it; tapping another switches; tapping off the grid clears.
      // The cards hold no links, so a tap can't collide with navigation, and the browser only
      // fires click on a real tap — never while the finger is scrolling the page.
      fundCards.forEach(function (c, i) {
        c.setAttribute("role", "button");
        c.setAttribute("tabindex", "0");
        c.setAttribute("aria-expanded", "false");
        var toggle = function () {
          if (c.hasAttribute("data-engaged")) fundClear();
          else fundEngage(i);
          fundCards.forEach(function (o) { o.setAttribute("aria-expanded", o.hasAttribute("data-engaged") ? "true" : "false"); });
        };
        c.addEventListener("click", toggle);
        c.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggle(); }
        });
      });
      document.addEventListener("click", function (e) {
        if (!fund.contains(e.target)) {
          fundClear();
          fundCards.forEach(function (o) { o.setAttribute("aria-expanded", "false"); });
        }
      });
    }
  }

  // --- Intro (bell) --------------------------------------------------------
  // The inline script in base.njk decides visibility before first paint (data-intro="active").
  // The overlay then waits for the visitor to press "Ring the bell": that click is the
  // browser's permission to play sound, so the ding dong and the two swings always run
  // together (data-intro="ringing"), then the curtain lifts (data-intro="leaving").
  // Esc lifts it quietly without ringing. A second click during the ring lifts it early.
  var html = document.documentElement;
  var overlay = document.querySelector("[data-intro-overlay]");
  if (overlay && html.getAttribute("data-intro") === "active") {
    var RING_MS = 2600;                 // swings + hold before the curtain lifts
    var EXIT_MS = 750;                  // curtain lift (keep in sync with site.css)
    // [ms after the click, playback rate]. The visual strikes land at 300ms and 900ms; the
    // recording swells for ~0.2s before it peaks, so each play starts a little ahead.
    var STRIKES = [[100, 1], [700, 0.84]];
    var button = overlay.querySelector("[data-intro-ring]");
    var src = overlay.getAttribute("data-intro-audio");
    var timers = [];
    var bytes = null;   // the mp3, fetched ahead of the click (preloaded in <head>)
    var ctx = null;

    if (src && window.fetch) {
      fetch(src).then(function (r) { return r.arrayBuffer(); }).then(function (b) { bytes = b; }).catch(function () {});
    }

    function playStrikes(t0) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC || !bytes) return;
        ctx = ctx || new AC();
        if (ctx.state !== "running") ctx.resume();
        ctx.decodeAudioData(bytes.slice(0)).then(function (buf) {
          var elapsed = performance.now() - t0;
          STRIKES.forEach(function (st) {
            var s = ctx.createBufferSource();
            var g = ctx.createGain();
            s.buffer = buf;
            s.playbackRate.value = st[1];
            g.gain.value = 0.8;
            s.connect(g);
            g.connect(ctx.destination);
            s.start(ctx.currentTime + Math.max(0, st[0] - elapsed) / 1000);
          });
        }).catch(function () {});
      } catch (e) {}
    }

    function finish() {
      var state = html.getAttribute("data-intro");
      if (state === "leaving" || !state) return;
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      html.setAttribute("data-intro", "leaving");
      setTimeout(function () {
        html.removeAttribute("data-intro");
        overlay.remove();
      }, EXIT_MS);
    }

    function ring() {
      if (html.getAttribute("data-intro") !== "active") return;
      html.setAttribute("data-intro", "ringing");
      button.disabled = true;
      playStrikes(performance.now());
      timers.push(setTimeout(finish, RING_MS));
      // Any further interaction lifts the curtain early (the sound keeps ringing).
      setTimeout(function () {
        window.addEventListener("pointerdown", finish);
        window.addEventListener("wheel", finish, { passive: true });
        window.addEventListener("touchstart", finish, { passive: true });
      }, 0);
    }

    button.addEventListener("click", ring);
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") finish();
    });
    // No programmatic focus: it would draw a focus ring on load. The button is the first
    // thing in the document, so one Tab reaches it.
  }

  // --- Collapsing header --------------------------------------------------
  // Scrolling down condenses the header; scrolling up restores it. The styling that
  // responds to data-condensed is inside a max-width:900px query, so on desktop this
  // attribute is set but has no visual effect.
  var header = document.querySelector(".site-header");
  var navToggle = header && header.querySelector("[data-nav-toggle]");
  if (header) {
    var TOP_ZONE = 120; // above this the bar is always shown
    var DEADBAND = 6;   // ignore jitter and rubber-banding
    var lastY = window.pageYOffset || 0;
    var queued = false;

    var closeNav = function () {
      if (!navToggle) return;
      header.removeAttribute("data-nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    var navOpen = function () { return header.hasAttribute("data-nav-open"); };

    // Only ever transform the bar — never its height. Changing the header's height would
    // change the document height mid-scroll, which is what left dead space below the footer
    // on iOS. A transform is purely visual, so the page keeps exactly one length.
    var apply = function () {
      queued = false;
      var y = window.pageYOffset || 0;
      // While the menu is open the bar must stay put; it holds the links being read.
      if (navOpen()) { lastY = y; return; }
      if (y <= TOP_ZONE) header.removeAttribute("data-hidden");
      else if (y > lastY + DEADBAND) header.setAttribute("data-hidden", "");
      else if (y < lastY - DEADBAND) header.removeAttribute("data-hidden");
      if (Math.abs(y - lastY) > DEADBAND || y <= TOP_ZONE) lastY = y;
    };

    window.addEventListener("scroll", function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });

    if (navToggle) {
      navToggle.addEventListener("click", function () {
        var open = !navOpen();
        if (open) {
          header.setAttribute("data-nav-open", "");
          header.removeAttribute("data-hidden"); // never open a panel on a hidden bar
        } else {
          header.removeAttribute("data-nav-open");
        }
        navToggle.setAttribute("aria-expanded", String(open));
      });
      // Following a link ends the panel's job; so does Escape, or a tap outside it.
      header.querySelectorAll(".site-nav a").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && navOpen()) { closeNav(); navToggle.focus(); }
      });
      document.addEventListener("click", function (e) {
        if (navOpen() && !header.contains(e.target)) closeNav();
      });
    }
  }
})();
