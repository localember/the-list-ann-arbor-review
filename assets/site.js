/* The List Ann Arbor | review preview script (Local Ember) */
(function () {
  "use strict";

  /* =====================================================================
     LEAD WEBHOOK: GHL PLACEHOLDER
     ---------------------------------------------------------------------
     PREVIEW MODE. This URL is intentionally EMPTY, so no form on this
     preview posts anywhere (no Mailchimp, no GHL, no live webhook).
     At launch, GHL Ops supplies the inbound webhook for The List Ann
     Arbor's GHL sub-account, e.g.
       https://services.leadconnectorhq.com/hooks/<LOCATION_ID>/webhook-trigger/<TRIGGER_ID>
     and it is set here. Payload keys sent (JSON):
       consumer : first_name, last_name, email, source=website-signup
       business : name, business_name, phone, email, business_address,
                  website, instagram, source=website-business-interest
     ===================================================================== */
  var LEAD_WEBHOOK_URL = ""; // TODO(GHL Ops): set at launch. Leave empty in preview.

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add("is-in"); }); }

  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector(".hp input") && form.querySelector(".hp input").value) return; // honeypot
      var payload = {};
      new FormData(form).forEach(function (v, k) { if (k !== "hp_company") payload[k] = String(v).trim(); });
      payload.submitted_at = new Date().toISOString();
      payload.page = location.pathname;
      var done = function () {
        var wrap = form.closest(".form-card") || form;
        wrap.classList.add("is-sent");
        var msg = wrap.querySelector(".form-success");
        if (msg) { msg.setAttribute("tabindex", "-1"); msg.focus({ preventScroll: true }); }
      };
      if (!LEAD_WEBHOOK_URL) {
        if (window.console) console.info("[The List preview] Demo mode, nothing sent. Payload would be:", payload);
        done();
        return;
      }
      fetch(LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); done(); })
        .catch(function () { alert("Sorry, something went wrong. Please try again in a moment."); });
    });
  });
})();
