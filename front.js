/* ============================================================
   FRONT: the normal portfolio shown above the OS.
   Loads BEFORE os.js (see index.html).
   Step 2: static sections rendered from window.PORTFOLIO,
   transparent curtain that reveals the OS, one-shot handoff.
   Animation (GSAP / Lenis) arrives in step 3+.
   ============================================================ */
(function () {
  const root = document.documentElement;
  const isOn = () => root.dataset.front === "on";
  const small = () => matchMedia("(max-width: 760px)").matches;

  // Phones keep the plain #mobile page.
  if (small()) { root.dataset.front = "off"; return; }

  // A reload would otherwise restore the old scroll position, which can land
  // inside the curtain and hand off to the OS before the visitor sees anything.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---- Input guard ----
     os.js wakes the sleep screen on ANY window keydown (and signs in on Enter
     from the lock screen). While the front is on, those keys belong to the front
     page (Space, arrows, Tab scroll and navigate), so stop them in the capture
     phase before os.js's listeners see them. stopPropagation does not cancel
     default actions, so native scrolling, tabbing and link activation still work.
     Note: this also stops keydown listeners on front elements, so any front
     keyboard handling must also listen on window in the capture phase. */
  addEventListener("keydown", (e) => { if (isOn()) e.stopPropagation(); }, { capture: true });

  /* ---- helpers (same escaping rules as portfolio.js) ---- */
  const D = window.PORTFOLIO || {};
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:|mailto:|#|[\w./-]+$)/i.test(u || "") ? esc(u) : "#");
  const pad2 = (n) => String(n).padStart(2, "0");
  const ext = (url, label) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener">${esc(label)} <span aria-hidden="true">↗</span></a>`;

  const nameParts = String(D.name || "Portfolio").trim().split(/\s+/);
  const first = nameParts[0];
  const rest = nameParts.slice(1).join(" ");
  const place = String(D.location || "").split(",")[0].trim();

  /* ---- sections ---- */
  const nav = () => `
    <header class="f-nav" id="fNav">
      <a class="f-brand" href="#f-top" data-f-scroll><span class="f-brand-c">©</span> Code by ${esc(first)}</a>
      <p class="f-time"><span id="fTime">--:--</span> <span class="f-time-place">${esc(place || "Local")}</span></p>
      <nav class="f-links" aria-label="Sections">
        <a href="#f-work" data-f-scroll>Work</a>
        <a href="#f-about" data-f-scroll>About</a>
        <a href="#f-contact" data-f-scroll>Contact</a>
        <a href="#f-curtain" class="f-links-os" data-f-scroll data-f-enter>Desktop <span aria-hidden="true">↓</span></a>
      </nav>
    </header>`;

  const hero = () => `
    <section class="f-hero" id="f-top">
      <div class="f-hero-top">
        <p class="f-eyebrow">${esc((D.roles || [])[0] || "")}</p>
        ${D.available ? `<p class="f-badge"><span class="f-dot" aria-hidden="true"></span>${esc(D.availableLabel || "open to work")}</p>` : ""}
      </div>
      <h1 class="f-name">
        <span class="f-name-line f-name-first">${esc(first)}</span>
        ${rest ? `<span class="f-name-line f-name-rest">${esc(rest)}</span>` : ""}
      </h1>
      <div class="f-hero-bottom">
        <p class="f-tagline">${esc(D.tagline || "")}</p>
        <ul class="f-roles" aria-label="Roles">${(D.roles || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
        <p class="f-cue" aria-hidden="true"><span class="f-cue-line"></span>scroll</p>
      </div>
    </section>`;

  const statement = () => {
    const text = D.statement || (D.about || [])[1] || D.tagline || "";
    const side = (D.about || [])[2] || "";
    return `
    <section class="f-statement" aria-label="Statement">
      <p class="f-statement-text">${esc(text)}</p>
      ${side ? `<p class="f-statement-side">${esc(side)}</p>` : ""}
    </section>`;
  };

  const work = () => {
    const list = D.projects || [];
    return `
    <section class="f-work" id="f-work">
      <header class="f-sec-head">
        <p class="f-k">Selected work</p>
        <p class="f-k f-k-count">(${pad2(list.length)})</p>
      </header>
      <ol class="f-rows">
        ${list.map((p, n) => {
          const href = p.live || p.code || "";
          const tag = href ? `a href="${safeUrl(href)}" target="_blank" rel="noopener"` : `div`;
          const close = href ? "a" : "div";
          return `
          <li class="f-row" data-index="${n}">
            <${tag} class="f-row-link">
              <span class="f-row-fill" aria-hidden="true"></span>
              <span class="f-row-n">${pad2(n + 1)}</span>
              <span class="f-row-main">
                <span class="f-row-title">${esc(p.title)}</span>
                ${p.subtitle ? `<span class="f-row-sub">${esc(p.subtitle)}</span>` : ""}
              </span>
              <span class="f-row-meta">
                ${p.context ? `<span class="f-row-ctx">${esc(p.context)}</span>` : ""}
                ${(p.stack || []).length ? `<span class="f-row-stack">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</span>` : ""}
              </span>
              <span class="f-row-arrow" aria-hidden="true">${href ? "↗" : ""}</span>
            </${close}>
          </li>`;
        }).join("")}
      </ol>
    </section>`;
  };

  const marquee = () => {
    const skills = (D.skills || []).filter((g) => g.group !== "Spoken").flatMap((g) => g.items);
    const row = (items, cls) => {
      const chunk = items.map((t) => `<span>${esc(t)}</span><span class="f-mq-sep" aria-hidden="true">✦</span>`).join("");
      // content duplicated once so step 3 can loop it seamlessly (xPercent -50)
      return `<div class="f-mq-row ${cls}"><div class="f-mq-track"><div class="f-mq-chunk">${chunk}</div><div class="f-mq-chunk" aria-hidden="true">${chunk}</div></div></div>`;
    };
    return `
    <section class="f-marquee" aria-label="Roles and skills">
      ${row(D.roles || [], "f-mq-a")}
      ${row(skills, "f-mq-b")}
    </section>`;
  };

  const experience = () => `
    <section class="f-exp" id="f-exp">
      <header class="f-sec-head"><p class="f-k">Experience &amp; education</p></header>
      <div class="f-timeline-wrap">
      <span class="f-timeline-line" aria-hidden="true"></span>
      <ol class="f-timeline">
        ${(D.experience || []).map((e) => `
          <li class="f-tl-item">
            <span class="f-tl-dot" aria-hidden="true"></span>
            ${e.period ? `<p class="f-tl-period">${esc(e.period)}</p>` : ""}
            <h3 class="f-tl-role">${esc(e.role)}</h3>
            <p class="f-tl-org">${esc(e.org)}</p>
            ${(e.points || []).length ? `<ul class="f-tl-points">${e.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>` : ""}
          </li>`).join("")}
      </ol>
      </div>
    </section>`;

  const about = () => `
    <section class="f-about" id="f-about">
      <header class="f-sec-head"><p class="f-k">About</p></header>
      <div class="f-about-grid">
        <div class="f-about-text">${(D.about || []).map((p) => `<p>${esc(p)}</p>`).join("")}
          ${D.location ? `<p class="f-loc">◎ ${esc(D.location)}</p>` : ""}
        </div>
        <dl class="f-stats">
          ${(D.stats || []).map((s) => `<div class="f-stat"><dt>${esc(s.label)}</dt><dd><span class="f-stat-n" data-value="${esc(String(s.value))}">${esc(String(s.value))}</span>${esc(s.suffix || "")}</dd></div>`).join("")}
        </dl>
      </div>
      <div class="f-skills">
        ${(D.skills || []).map((g) => `
          <div class="f-skill">
            <h4>${esc(g.group)}</h4>
            <ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>
    </section>`;

  const contact = () => `
    <footer class="f-contact" id="f-contact">
      <p class="f-k">Contact</p>
      <h2 class="f-contact-title">Let's build something<br />that exists.</h2>
      <a class="f-email" href="mailto:${esc(D.email || "")}">${esc(D.email || "")}</a>
      <div class="f-contact-row">
        <nav class="f-socials" aria-label="Social">${(D.socials || []).map((s) => ext(s.url, s.label)).join("")}</nav>
        ${D.resumeUrl ? `<a class="f-btn" href="${safeUrl(D.resumeUrl)}" download><span class="f-btn-fill" aria-hidden="true"></span><span class="f-btn-text">Download CV ↓</span></a>` : ""}
      </div>
      <div class="f-portal">
        <button class="f-btn f-btn-portal" type="button" data-f-enter>
          <span class="f-btn-fill" aria-hidden="true"></span>
          <span class="f-btn-text">Enter the desktop <span aria-hidden="true">↓</span></span>
        </button>
        <p class="f-portal-note">There is more underneath. Keep scrolling.</p>
      </div>
      <p class="f-copy">© ${new Date().getFullYear()} ${esc(D.name || "")}</p>
    </footer>`;

  const curtain = () => `
    <div class="f-curtain" id="f-curtain" aria-hidden="true"></div>`;

  function render() {
    const host = document.getElementById("front");
    if (!host) return;
    host.innerHTML = `
      <a class="f-skip" href="#f-curtain" data-f-enter-now>Skip to desktop</a>
      ${nav()}
      <main class="f-page">
        ${hero()}${statement()}${work()}${marquee()}${experience()}${about()}${contact()}
      </main>
      ${curtain()}`;
    wire(host);
  }

  /* ---- behaviour ---- */
  let curtainEl = null;

  function wire(host) {
    curtainEl = host.querySelector("#f-curtain");

    // in-page links: smooth native scroll for now (Lenis replaces this in step 3)
    host.addEventListener("click", (e) => {
      const now = e.target.closest("[data-f-enter-now]");
      if (now) { e.preventDefault(); enterOS(); return; }
      const enter = e.target.closest("[data-f-enter]");
      if (enter) { e.preventDefault(); scrollToCurtain(); return; }
      const a = e.target.closest("a[data-f-scroll]");
      if (a) {
        const t = document.querySelector(a.getAttribute("href"));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" }); }
      }
    });

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    tickTime(); setInterval(tickTime, 15000);
    onScroll();
  }

  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollToCurtain() {
    if (!curtainEl) return;
    const y = curtainEl.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: y, behavior: prefersReduced() ? "auto" : "smooth" });
  }

  // Curtain progress drives: nav fading out as the OS shows, and the one-shot handoff.
  function onScroll() {
    if (!isOn() || !curtainEl) return;
    const top = curtainEl.getBoundingClientRect().top;
    root.classList.toggle("f-revealing", top < innerHeight * 0.85);
    if (top <= 2) enterOS();
  }

  function tickTime() {
    const el = document.getElementById("fTime");
    if (!el) return;
    try {
      el.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: D.timezone || undefined }).format(new Date());
    } catch (e) {
      el.textContent = new Date().toTimeString().slice(0, 5);
    }
  }

  /* ---- Handoff to the OS ---- */
  function enterOS() {
    if (!isOn()) return;
    root.dataset.front = "off";   // CSS hides #front, restores body overflow:hidden, enables .os
    root.classList.remove("f-revealing");
    window.scrollTo(0, 0);        // safe: #front is display:none, so nothing visibly jumps
    const field = document.querySelector('html[data-state="lock"] #lockField');
    if (field) field.focus({ preventScroll: true });
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function returnToFront() {
    if (isOn() || small()) return;
    root.dataset.front = "on";
    window.scrollTo(0, 0);
    onScroll();
  }

  window.Front = { enterOS, returnToFront };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
