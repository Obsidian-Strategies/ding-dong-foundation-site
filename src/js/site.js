// Apply and Donate page behaviour. Submissions are stubbed until a form service is chosen.
(function () {
  // --- Apply -------------------------------------------------------------
  var applyForm = document.querySelector("[data-apply-form]");
  if (applyForm) {
    var applyCard = document.querySelector("[data-apply-card]");
    var applySuccess = document.querySelector("[data-apply-success]");
    var org = applyForm.querySelector("#org");
    var orgField = org.closest(".field");
    var orgError = applyForm.querySelector("[data-org-error]");

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
      applyCard.hidden = true;
      applySuccess.hidden = false;
      window.scrollTo(0, 0);
    });

    var applyReset = document.querySelector("[data-apply-reset]");
    if (applyReset) {
      applyReset.addEventListener("click", function () {
        applyForm.reset();
        applySuccess.hidden = true;
        applyCard.hidden = false;
      });
    }
  }

  // --- Donate ------------------------------------------------------------
  var donate = document.querySelector("[data-donate]");
  if (donate) {
    var amount = 100;
    var buttons = donate.querySelectorAll(".amount");
    var customWrap = donate.querySelector("[data-custom]");
    var customInput = donate.querySelector("#custom");
    var give = donate.querySelector("[data-give]");
    var anon = donate.querySelector("#anon");
    var donateSuccess = document.querySelector("[data-donate-success]");
    var thanks = donateSuccess.querySelector("[data-thanks]");

    function chosen() {
      if (amount === "other") return customInput.value ? Number(customInput.value) : null;
      return amount;
    }
    function updateLabel() {
      var c = chosen();
      give.textContent = c ? "Give $" + c : "Give";
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        amount = b.dataset.amount === "other" ? "other" : Number(b.dataset.amount);
        buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        customWrap.hidden = amount !== "other";
        if (amount === "other") customInput.focus();
        updateLabel();
      });
    });
    customInput.addEventListener("input", updateLabel);

    give.addEventListener("click", function () {
      thanks.textContent = anon.checked
        ? "Your gift is recorded without your name. A receipt is on its way to your inbox."
        : "A receipt is on its way to your inbox. We will let you know where the money went.";
      donate.hidden = true;
      donateSuccess.hidden = false;
      window.scrollTo(0, 0);
    });

    var donateReset = document.querySelector("[data-donate-reset]");
    if (donateReset) {
      donateReset.addEventListener("click", function () {
        donateSuccess.hidden = true;
        donate.hidden = false;
      });
    }
  }


  // --- Questions (hover master-detail) ---------------------------------------
  // Without this script every answer is visible beneath its question. With it, the answers
  // move into the panel on the right: hover, focus or tap a question to show its answer.
  // Under 900px the panel is hidden and the open answer shows beneath its question instead.
  var faq = document.querySelector("[data-faq]");
  if (faq) {
    var faqItems = [].slice.call(faq.querySelectorAll("[data-faq-item]"));
    var faqPanel = faq.querySelector("[data-faq-panel]");
    var faqActive = -1;
    var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

    function faqBusy() {
      // someone is writing in the ask form: leave the panel alone until they are done
      var form = faqPanel.querySelector("[data-ask-form]");
      if (!form) return false;
      if (form.contains(document.activeElement)) return true;
      return [].slice.call(form.querySelectorAll("input, textarea")).some(function (f) { return f.value.trim(); });
    }

    function faqOpen(i, soft) {
      if (i === faqActive) return;
      if (soft && faqBusy()) return;
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
          bar.setAttribute("aria-expanded", "false");
          return;
        }
        faqOpen(i);
      });
      bar.addEventListener("focus", function () { faqOpen(i); });
      if (canHover) bar.addEventListener("mouseenter", function () { faqOpen(i, true); });
    });

    // Ask-your-own form. The panel holds a clone of it, so listen on the whole block.
    // Submission is stubbed until a form service is chosen.
    faq.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form.matches("[data-ask-form]")) return;
      e.preventDefault();
      var email = form.querySelector("[name=email]");
      var q = form.querySelector("[name=question]");
      var err = form.querySelector("[data-ask-error]");
      var msg = "";
      if (!q.value.trim()) msg = "Write your question first.";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) msg = "We need an email address to reply to.";
      if (msg) {
        err.textContent = msg;
        err.hidden = false;
        q.closest(".field").classList.toggle("field--error", !q.value.trim());
        email.closest(".field").classList.toggle("field--error", !!q.value.trim());
        (q.value.trim() ? email : q).focus();
        return;
      }
      var thanks = document.createElement("p");
      thanks.className = "faq__thanks";
      thanks.textContent = "Thank you. Your question is on its way, and a person will write back to " + email.value.trim() + ".";
      form.replaceWith(thanks);
    });

    faq.setAttribute("data-faq", "enhanced");
    faqOpen(0);
  }

  // --- Fund cards (homepage photo reveal) ------------------------------------
  // After Opal's showcase: one data-focus on the grid, set from JS rather than :hover so
  // it cannot flicker while the siblings move, held until the pointer leaves the grid.
  var fund = document.querySelector("[data-fund]");
  if (fund && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var fundCards = [].slice.call(fund.querySelectorAll("[data-fund-card]"));
    function fundEngage(i) {
      if (fund.getAttribute("data-focus") === String(i)) return;
      fund.setAttribute("data-focus", String(i));
      fundCards.forEach(function (c, j) { if (j === i) c.setAttribute("data-engaged", ""); else c.removeAttribute("data-engaged"); });
    }
    function fundClear() {
      fund.removeAttribute("data-focus");
      fundCards.forEach(function (c) { c.removeAttribute("data-engaged"); });
    }
    fundCards.forEach(function (c, i) {
      c.addEventListener("mousemove", function () { fundEngage(i); });
      c.addEventListener("focusin", function () { fundEngage(i); });
    });
    fund.addEventListener("mouseleave", fundClear);
    fund.addEventListener("focusout", function (e) { if (!fund.contains(e.relatedTarget)) fundClear(); });
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
})();
