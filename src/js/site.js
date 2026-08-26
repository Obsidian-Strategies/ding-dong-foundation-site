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

  // --- Intro (bell) --------------------------------------------------------
  // The inline script in base.njk decides visibility before first paint (data-intro="active").
  // This block times the two strikes to the CSS swing, lets any interaction skip, and lifts
  // the curtain. Sound is synthesized (no file) and fails silently if the browser blocks it.
  var html = document.documentElement;
  var overlay = document.querySelector("[data-intro-overlay]");
  if (overlay && html.getAttribute("data-intro") === "active") {
    var HOLD_MS = 2800;                 // entrance + hold before the curtain lifts
    var EXIT_MS = 750;                  // curtain lift (keep in sync with site.css)
    // The recording swells for ~0.4s before it peaks, so each play starts a little ahead of
    // the visual strike (0.64s and 1.24s) and the body of the sound lands on it.
    // [ms into intro, playback rate]: the second strike is pitched down a minor third.
    var STRIKES = [[440, 1], [1040, 0.84]];
    var timers = [];
    var ctx = null;
    var bell = null; // decoded AudioBuffer, once the fetch lands
    var src = overlay.getAttribute("data-intro-audio");

    // Start fetching straight away (the <link rel="preload"> in <head> has usually already
    // pulled it) so the buffer is ready before the first strike.
    function load() {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC || !src || !window.fetch) return;
        ctx = ctx || new AC();
        fetch(src)
          .then(function (r) { return r.arrayBuffer(); })
          .then(function (b) { return ctx.decodeAudioData(b); })
          .then(function (buf) { bell = buf; })
          .catch(function () {});
      } catch (e) {}
    }

    function strike(rate) {
      try {
        if (!ctx || !bell) return;
        if (ctx.state !== "running") ctx.resume();
        if (ctx.state !== "running") return; // autoplay blocked: stay silent
        var s = ctx.createBufferSource();
        var g = ctx.createGain();
        s.buffer = bell;
        s.playbackRate.value = rate;
        g.gain.value = 0.8;
        s.connect(g);
        g.connect(ctx.destination);
        s.start(ctx.currentTime);
      } catch (e) {}
    }
    load();

    function removeSkip() {
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
    }

    function finish() {
      if (html.getAttribute("data-intro") === "leaving") return;
      timers.forEach(clearTimeout);
      removeSkip();
      html.setAttribute("data-intro", "leaving");
      setTimeout(function () {
        html.removeAttribute("data-intro");
        overlay.remove();
      }, EXIT_MS);
    }

    // Schedule everything relative to the CSS animation clock so the sound lands on the
    // strike even if this script runs before or after the first paint.
    function schedule(elapsed) {
      STRIKES.forEach(function (s) {
        timers.push(setTimeout(function () { strike(s[1]); }, Math.max(0, s[0] - elapsed)));
      });
      timers.push(setTimeout(finish, Math.max(0, HOLD_MS - elapsed)));
    }

    var bell = overlay.querySelector(".intro__bell");
    var running = bell.getAnimations ? bell.getAnimations() : [];
    if (running.length) {
      schedule(running[0].currentTime || 0);
    } else if (bell.getAnimations) {
      bell.addEventListener("animationstart", function onStart(e) {
        if (e.target !== bell) return;
        bell.removeEventListener("animationstart", onStart);
        schedule(0);
      });
    } else {
      schedule(0);
    }

    window.addEventListener("pointerdown", finish);
    window.addEventListener("keydown", finish);
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchstart", finish, { passive: true });
  }
})();
