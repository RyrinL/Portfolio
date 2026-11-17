/* ============================================================
   FRONT: the normal portfolio shown first, above the OS.
   The OS (the desktop) is the owner's archive: never reached by
   scrolling, only through an explicit "Want to know me better?"
   invitation (openArchive), with a transition panel both ways.
   Loads BEFORE os.js (see index.html).
   Sections render from window.PORTFOLIO; Lenis smooth scroll is
   bridged to GSAP ScrollTrigger; native scrolling when the CDN is
   unreachable or reduced motion is on.
   ============================================================ */
(function () {
  const root = document.documentElement;
  const isOn = () => root.dataset.front === "on";
  const small = () => matchMedia("(max-width: 760px)").matches;

  // Phones keep the plain #mobile page.
  if (small()) { root.dataset.front = "off"; return; }

  // A reload starts at the top of the page (with the hero intro), not wherever the visitor was.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---- Input guard ----
     os.js wakes the sleep screen on ANY window keydown (and signs in on Enter
     from the lock screen). While the front is on, those keys belong to the front
     page (Space, arrows, Tab scroll and navigate), so stop them in the capture
     phase before os.js's listeners see them. stopPropagation does not cancel
     default actions, so native scrolling, tabbing and link activation still work.
     Note: this also stops keydown listeners on front elements, so any front
     keyboard handling must also listen on window in the capture phase. */
  addEventListener("keydown", (e) => {
    if (!isOn()) return;
    // Front's own keys are handled here, in the same capture listener, because stopPropagation
    // below also keeps keydown from reaching listeners on front elements.
    if (panelIndex >= 0) {
      if (e.key === "Escape") { e.preventDefault(); closePanel(); }
      else if (e.key === "Tab") trapTab(e);   // keep focus cycling inside the open panel
    }
    e.stopPropagation();
  }, { capture: true });

  /* ---- Focus guard ----
     pointer-events:none (front.css) stops the mouse, but not the keyboard: Tab would
     still walk into the hidden OS (sign-in field, sign-in button, "skip to portfolio"),
     and Enter on a focused OS button fires its click as a default action, which the
     keydown guard above cannot stop. `inert` removes the OS from focus, clicks and
     the accessibility tree while the front is on. front.js runs after #os is parsed. */
  const osEl = document.getElementById("os");
  const setOsInert = (on) => { if (osEl) osEl.inert = on; };
  setOsInert(isOn());

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
          // Every row is a button that opens the project panel (full description + links).
          // data-label: what the cursor bubble says over it (step 6).
          return `
          <li class="f-row" data-index="${n}">
            <button type="button" class="f-row-link" data-project="${n}" data-label="View" aria-haspopup="dialog" aria-controls="fPanel">
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
              <span class="f-row-arrow" aria-hidden="true">→</span>
            </button>
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
          <button type="button" class="f-archive-link" data-f-archive>${esc(D.archiveAboutLink || "There's more of me in the archive")} <span aria-hidden="true">→</span></button>
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
        <p class="f-portal-ask">${esc(D.archiveInvite || "Want to know me better?")}</p>
        <button class="f-btn f-btn-portal" type="button" data-f-archive>
          <span class="f-btn-fill" aria-hidden="true"></span>
          <span class="f-btn-text">${esc(D.archiveButton || "Open the archive")} <span aria-hidden="true">→</span></span>
        </button>
        <p class="f-portal-note">${esc(D.archiveNote || "Hobbies, notes and the rest of me.")}</p>
      </div>
      <p class="f-copy">© ${new Date().getFullYear()} ${esc(D.name || "")}</p>
    </footer>`;

  function render() {
    const host = document.getElementById("front");
    if (!host) return;
    host.innerHTML = `
      <div class="f-label" id="fLabel" aria-hidden="true"></div>
      ${nav()}
      <main class="f-page">
        ${hero()}${statement()}${work()}${marquee()}${experience()}${about()}${contact()}
      </main>
      ${panelShell()}`;
    buildTransit();
    wire(host);
    addReturnToMenu();
    if (isOn()) intro();
    else removeLoader(document.getElementById("fLoader"));
  }

  /* ---- behaviour ---- */
  const NAV_OFFSET = 72;   // matches scroll-margin-top in front.css

  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = () => !!(window.gsap && window.ScrollTrigger);
  // Lenis is skipped for reduced motion; GSAP drives its frame loop, so it needs GSAP too.
  const wantLenis = () => !!window.Lenis && hasGsap() && !prefersReduced();

  function wire(host) {
    host.addEventListener("click", (e) => {
      const proj = e.target.closest("[data-project]");
      if (proj) { openPanel(Number(proj.dataset.project), proj); return; }
      if (e.target.closest("[data-f-close]")) { closePanel(); return; }
      if (e.target.closest("[data-f-next]")) { nextProject(); return; }
      if (e.target.closest("[data-f-archive]")) { e.preventDefault(); openArchive(); return; }
      const a = e.target.closest("a[data-f-scroll]");
      if (a) {
        const t = document.querySelector(a.getAttribute("href"));
        if (t) { e.preventDefault(); scrollToEl(t, a.getAttribute("href") === "#f-top" ? 0 : -NAV_OFFSET); }
      }
    });

    if (hasGsap()) {
      gsap.registerPlugin(ScrollTrigger);
      // ScrollTrigger saves history.scrollRestoration when it initialises (before this file
      // set "manual") and writes that saved "auto" back after every refresh. Tell it directly,
      // or a reload mid-page restores the old position again.
      ScrollTrigger.clearScrollMemory("manual");
      // Fonts change line heights; measurements taken before they load are wrong.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => isOn() && ScrollTrigger.refresh());
    }

    tickTime(); setInterval(tickTime, 15000);
    if (isOn()) startScroll();
  }

  /* ---- Scroll engine: Lenis + ScrollTrigger, created while the front is on,
     destroyed at the handoff. Destroying (not just stopping) matters: a stopped
     Lenis still swallows wheel events on window, which would break scrolling
     inside the OS's windows. ---- */
  let lenis = null;
  let triggers = [];
  let rafCb = null;
  let sectionsCtx = null;   // gsap.context holding every step-5 section animation

  /* ================= Step 5: section animations =================
     Runs inside gsap.context (scoped to #front): created by startScroll, reverted by stopScroll.
     Reveals play once per front session; returning from the OS replays them. */
  const once = (trigger, start = "top 85%") => ({ trigger, start, toggleActions: "play none none none" });
  // Word mask split. `done()` reverts it to plain text once the reveal has finished, so masks never
  // keep clipping descenders and screen readers get the original text node back.
  const maskWords = (el) => {
    if (!window.SplitText || !el) return { words: el ? [el] : [], done: () => {} };
    const s = SplitText.create(el, { type: "words", mask: "words" });
    return { words: s.words, done: () => s.revert() };
  };

  /* ================= Step 6: pointer layer =================
     Cursor label over project rows, magnetic buttons/links, direction-aware button fill.
     Real mouse only (hover + fine pointer, wider than 540px). Called inside sectionsCtx, so
     every gsap.set/tween here is reverted at the handoff; listeners are removed by the
     returned cleanup. */
  function buildPointer() {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth > 540;
    if (!fine) return () => {};
    root.classList.add("f-pointer");
    const offs = [];
    const on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); offs.push(() => el.removeEventListener(type, fn, opts)); };
    // Tweens started from event handlers run after gsap.context has finished recording, so the
    // context cannot revert them. Track every element this layer animates and clear them on cleanup.
    const touched = new Set();
    const tw = (el, vars) => { touched.add(el); return gsap.to(el, vars); };

    /* --- cursor label: follows the pointer, pops up over rows that link somewhere --- */
    const label = document.getElementById("fLabel");
    if (label) {
      gsap.set(label, { xPercent: -50, yPercent: -50, scale: 0 });
      // quickTo reuses one tween per axis instead of allocating a tween per pointermove
      const lx = gsap.quickTo(label, "x", { duration: 0.45, ease: "power3" });
      const ly = gsap.quickTo(label, "y", { duration: 0.45, ease: "power3" });
      on(window, "pointermove", (e) => { lx(e.clientX); ly(e.clientY); }, { passive: true });
      document.querySelectorAll(".f-row-link[data-label]").forEach((row) => {
        on(row, "pointerenter", () => {
          label.textContent = row.dataset.label;
          root.classList.add("f-label-on");
          tw(label, { scale: 1, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
        });
        on(row, "pointerleave", () => {
          root.classList.remove("f-label-on");
          tw(label, { scale: 0, duration: 0.25, ease: "power2.in", overwrite: "auto" });
        });
      });
    }

    /* --- magnetic: element leans toward the pointer, its label leans further; elastic snap back --- */
    const magnet = (el, strength, textStrength) => {
      const text = el.querySelector(".f-btn-text");
      on(el, "pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        tw(el, { x: nx * strength, y: ny * strength, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        if (text) tw(text, { x: nx * textStrength, y: ny * textStrength, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      });
      on(el, "pointerleave", () => {
        tw(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
        if (text) tw(text, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
      });
    };
    document.querySelectorAll(".f-btn").forEach((b) => magnet(b, b.classList.contains("f-btn-portal") ? 50 : 36, 18));
    document.querySelectorAll(".f-socials a, .f-links a").forEach((a) => magnet(a, 18, 0));
    const email = document.querySelector(".f-email");
    if (email) magnet(email, 22, 0);

    /* --- button fill: enters from below, leaves through the top (not back down) --- */
    document.querySelectorAll(".f-btn").forEach((b) => {
      const fill = b.querySelector(".f-btn-fill");
      if (!fill) return;
      // y/scale zeroed explicitly: GSAP would otherwise keep the CSS fallback's translateY(76%) scale(1.2)
      gsap.set(fill, { y: 0, scale: 1, yPercent: 101 });
      const enter = () => { touched.add(fill); return gsap.fromTo(fill, { yPercent: 101 }, { yPercent: 0, duration: 0.55, ease: "power3.out", overwrite: true }); };
      const leave = () => tw(fill, { yPercent: -101, duration: 0.5, ease: "power3.inOut", overwrite: true });
      on(b, "pointerenter", enter); on(b, "pointerleave", leave);
      on(b, "focus", enter); on(b, "blur", leave);   // keyboard users get the same fill
    });

    return () => {
      offs.forEach((off) => off());
      const els = [...touched];
      if (els.length) { gsap.killTweensOf(els); gsap.set(els, { clearProps: "all" }); }
      root.classList.remove("f-pointer", "f-label-on");
    };
  }

  function buildSections() {
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => gsap.utils.toArray(s);
    if (window.SplitText) gsap.registerPlugin(SplitText);

    /* --- nav: hides on scroll down, returns on scroll up --- */
    const nav = $("#fNav");
    ScrollTrigger.create({
      start: 0, end: "max",
      // hide only on a deliberate downward scroll: the slow tail of a Lenis glide (or a nav-link
      // scroll settling) must not re-hide a nav the visitor just brought back with the pointer
      onUpdate: (self) => {
        if (!nav) return;
        const v = self.getVelocity();
        if (self.direction === -1 && v < -150) nav.classList.remove("f-nav-hidden");
        else if (self.direction === 1 && v > 250 && self.scroll() > innerHeight * 0.6) nav.classList.add("f-nav-hidden");
      },
    });
    // A hidden nav comes back when the pointer reaches the top edge, or when anything in it gets focus.
    const navPeek = (e) => { if (nav && e.clientY < 90) nav.classList.remove("f-nav-hidden"); };
    const navFocus = () => nav && nav.classList.remove("f-nav-hidden");
    addEventListener("pointermove", navPeek, { passive: true });
    if (nav) nav.addEventListener("focusin", navFocus);

    /* --- section heads: label rises, rule draws --- */
    $$(".f-sec-head").forEach((h) => {
      gsap.timeline({ scrollTrigger: once(h, "top 88%") })
        .fromTo(h, { "--f-rule": 0 }, { "--f-rule": 1, duration: 1.3, ease: "expo.inOut" }, 0)
        .fromTo(h.children, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.2);
    });

    /* --- statement: words light up while it crosses the viewport --- */
    const st = $(".f-statement-text");
    if (st) {
      const words = window.SplitText ? SplitText.create(st, { type: "words" }).words : [st];
      gsap.fromTo(words, { opacity: 0.12 }, {
        opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 45%", scrub: true },
      });
      const side = $(".f-statement-side");
      if (side) gsap.fromTo(side, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", scrollTrigger: once(side, "top 90%") });
    }

    /* --- project rows: rule draws, title rises through a mask, details follow --- */
    $$(".f-row").forEach((row) => {
      const title = maskWords(row.querySelector(".f-row-title"));
      const tl = gsap.timeline({ scrollTrigger: once(row, "top 88%"), onComplete: title.done });
      tl.fromTo(row, { "--f-rule": 0 }, { "--f-rule": 1, duration: 1.2, ease: "expo.out" }, 0)
        .fromTo(title.words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.05 }, 0.05)
        .fromTo(row.querySelectorAll(".f-row-n, .f-row-sub, .f-row-meta, .f-row-arrow"), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.2);
    });

    /* --- marquee: endless loop, speeds up with scroll velocity, follows scroll direction --- */
    const loopsMq = $$(".f-mq-track").map((track, i) => {
      gsap.set(track, { xPercent: i % 2 ? -50 : 0 });           // second row runs the other way
      const t = gsap.to(track, { xPercent: i % 2 ? 0 : -50, duration: i % 2 ? 36 : 28, ease: "none", repeat: -1 });
      // start deep into the repeats so a negative timeScale (scrolling up) never runs into time 0 and stops
      t.totalTime(t.duration() * 500);
      return t;
    });
    if (loopsMq.length) {
      let settle = null;
      ScrollTrigger.create({
        trigger: ".f-marquee", start: "top bottom", end: "bottom top",
        onToggle: (self) => loopsMq.forEach((t) => (self.isActive ? t.resume() : t.pause())),  // idle off-screen
        onUpdate: (self) => {
          const dir = self.direction;
          const boost = Math.min(5, Math.abs(self.getVelocity()) / 450);
          if (settle) settle.kill();
          settle = gsap.timeline()
            .to(loopsMq, { timeScale: dir * (1 + boost), duration: 0.2, ease: "power1.out" })
            .to(loopsMq, { timeScale: dir, duration: 1.2, ease: "power2.out" });
        },
      });
      loopsMq.forEach((t) => t.pause());
    }

    /* --- experience: the line draws with scroll, each stop pops in --- */
    const line = $(".f-timeline-line");
    if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".f-timeline-wrap", start: "top 70%", end: "bottom 70%", scrub: 0.6 } });
    $$(".f-tl-item").forEach((it) => {
      gsap.timeline({ scrollTrigger: once(it, "top 78%") })
        .fromTo(it.querySelector(".f-tl-dot"), { scale: 0 }, { scale: 1, duration: 0.7, ease: "back.out(3)" }, 0)
        .fromTo(it.querySelectorAll(".f-tl-period, .f-tl-role, .f-tl-org, .f-tl-points li"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.05 }, 0.05);
    });

    /* --- about: lead rises word by word, the rest fades up, stats count, skills stack in --- */
    const aboutPs = $$(".f-about-text p");
    if (aboutPs[0]) {
      const lead = maskWords(aboutPs[0]);
      gsap.fromTo(lead.words, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.015, scrollTrigger: once(aboutPs[0]), onComplete: lead.done });
    }
    if (aboutPs.length > 1) gsap.fromTo(aboutPs.slice(1), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: once(aboutPs[1], "top 90%") });
    const statNums = [];
    $$(".f-stat").forEach((s, i) => {
      const n = s.querySelector(".f-stat-n");
      const target = Number(n && n.dataset.value);
      const tl = gsap.timeline({ scrollTrigger: once(s, "top 85%"), delay: i * 0.08 });
      tl.fromTo(s, { "--f-rule": 0, y: 24, autoAlpha: 0 }, { "--f-rule": 1, y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, 0);
      if (n && Number.isFinite(target)) {
        statNums.push([n, n.textContent]);
        const box = { v: 0 };
        n.textContent = "0";
        tl.to(box, { v: target, duration: 1.6, ease: "power2.out", onUpdate: () => { n.textContent = String(Math.round(box.v)); } }, 0.1);
      }
    });
    const skills = $$(".f-skill");
    if (skills.length) gsap.fromTo(skills, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: once(".f-skills", "top 88%") });

    /* --- contact: title rises, email drifts up into place, then the page dims as the OS takes over --- */
    const ct = $(".f-contact-title");
    if (ct) {
      const ctw = maskWords(ct);
      gsap.fromTo(ctw.words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, scrollTrigger: once(ct), onComplete: ctw.done });
    }
    const email = $(".f-email");
    if (email) gsap.fromTo(email, { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".f-contact", start: "top bottom", end: "top 25%", scrub: true } });
    const cbits = $$(".f-contact-row, .f-portal, .f-copy");
    // opacity, NOT autoAlpha, for anything holding links or buttons: autoAlpha sets visibility:hidden
    // until revealed, and browsers skip hidden elements on Tab, so keyboard users could never reach the
    // CV button, socials or the archive invitation. Opacity keeps them focusable; focusing scrolls them
    // into view, which plays the reveal.
    if (cbits.length) gsap.fromTo(cbits, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: once(".f-contact-row", "top 92%") });
    const aboutLink = $(".f-archive-link");
    if (aboutLink) gsap.fromTo(aboutLink, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: once(aboutLink, "top 92%") });

    const undoPointer = buildPointer();

    // Called by sectionsCtx.revert(): undo what GSAP cannot track on its own (direct text writes).
    return () => {
      undoPointer();
      statNums.forEach(([n, text]) => { n.textContent = text; });
      removeEventListener("pointermove", navPeek);
      if (nav) { nav.removeEventListener("focusin", navFocus); nav.classList.remove("f-nav-hidden"); }
    };
  }

  function startScroll() {
    if (!hasGsap()) return;      // no CDN: native scrolling, nothing to set up
    stopScroll();

    if (wantLenis()) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      rafCb = (time) => lenis && lenis.raf(time * 1000);
      gsap.ticker.add(rafCb);
      gsap.ticker.lagSmoothing(0);
    }

    // The desktop is never reached by scrolling: only openArchive() (an explicit invitation) leads there.
    if (!prefersReduced()) sectionsCtx = gsap.context(buildSections, document.getElementById("front"));
    ScrollTrigger.refresh();
  }

  function stopScroll() {
    // revert = kill every section tween/trigger AND restore the original DOM and inline styles
    // (SplitText included), so nothing animated leaks into the OS or survives as half-state.
    if (sectionsCtx) { sectionsCtx.revert(); sectionsCtx = null; }
    triggers.forEach((t) => t.kill());
    triggers = [];
    if (rafCb) { gsap.ticker.remove(rafCb); rafCb = null; }
    if (lenis) { lenis.destroy(); lenis = null; }
  }

  function scrollToEl(el, offset = 0, opts = {}) {
    if (lenis) { lenis.scrollTo(el, { offset, ...opts }); return; }
    const y = el.getBoundingClientRect().top + scrollY + offset;
    window.scrollTo({ top: y, behavior: prefersReduced() ? "auto" : "smooth" });
  }

  /* ================= Transition between the portfolio and the archive (desktop) =================
     A panel sweeps up over the screen with a curved leading edge, holds a word, swaps the view
     behind itself, then lifts away with a curved trailing edge (same lip as the loader).
     Lives on <body>, outside #front, because it also has to cover the OS on the way back. */
  let transitEl = null, transitBusy = false;
  const TRANSIT_WORDS = { toArchive: "the archive", toFront: "the portfolio" };

  function buildTransit() {
    if (transitEl || !document.body) return;
    transitEl = document.createElement("div");
    transitEl.className = "f-transit";
    transitEl.setAttribute("aria-hidden", "true");
    transitEl.innerHTML = `<div class="f-transit-lip f-transit-lip-top"></div>
      <p class="f-transit-word"><span class="f-loader-dot"></span><span class="f-transit-text"></span></p>
      <div class="f-transit-lip f-transit-lip-bot"></div>`;
    document.body.appendChild(transitEl);
  }

  function transit(word, swap, afterReveal) {
    if (!animOK() || !transitEl) { swap(); if (afterReveal) afterReveal(); return; }   // reduced motion / no GSAP: instant
    if (transitBusy) return;
    transitBusy = true;
    const top = transitEl.querySelector(".f-transit-lip-top");
    const bot = transitEl.querySelector(".f-transit-lip-bot");
    const text = transitEl.querySelector(".f-transit-text");
    const wordEl = transitEl.querySelector(".f-transit-word");
    text.textContent = word;
    if (lenis) lenis.stop();
    transitEl.classList.add("on");
    gsap.timeline({
      onComplete: () => {
        transitEl.classList.remove("on");
        gsap.set([transitEl, top, bot, wordEl], { clearProps: "all" });
        transitBusy = false;
      },
    })
      .set(transitEl, { yPercent: 100 }).set(top, { height: "16vh" }).set(bot, { height: "0vh" }).set(wordEl, { yPercent: 100, autoAlpha: 0 })
      // in: the leading edge bulges up while the panel rises, flattening as it lands
      .to(transitEl, { yPercent: 0, duration: 0.85, ease: "power4.inOut" })
      .to(top, { height: "0vh", duration: 0.85, ease: "power3.in" }, "<")
      .to(wordEl, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, "-=0.2")
      .add(swap)
      .to({}, { duration: 0.4 })
      .to(wordEl, { yPercent: -60, autoAlpha: 0, duration: 0.3, ease: "power3.in" })
      // out: lifts away, its trailing edge hanging below like the loader's
      .set(bot, { height: "16vh" })
      .to(transitEl, { yPercent: -100, duration: 0.95, ease: "power4.inOut" })
      .to(bot, { height: "0vh", duration: 0.95, ease: "power3.in" }, "<")
      .add(() => { if (afterReveal) afterReveal(); }, "-=0.6");
  }

  // The only way into the desktop from the front: an explicit "want to know me better?".
  function openArchive() {
    if (!isOn() || transitBusy) return;
    closePanel(true);
    transit(TRANSIT_WORDS.toArchive, enterOS);
  }

  // Back from the desktop (menubar): same sweep; the hero starts as the panel lifts off it.
  function closeArchive() {
    if (isOn() || transitBusy || small()) return;
    transit(TRANSIT_WORDS.toFront, () => returnToFront({ deferHero: true }), playPendingHero);
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

  /* ================= Step 4: loader + hero intro ================= */
  const animOK = () => hasGsap() && !prefersReduced();
  const ss = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  // SplitText must measure with the real font, but never wait forever on a slow font CDN.
  const fontsReady = () => Promise.race([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ]);

  let loops = [];          // infinite tweens (scroll cue, role cycle): paused while the OS is up
  let heroTl = null;       // the current hero timeline
  let rolesStarted = false;

  // Builds a fresh hero timeline. Splits are reverted when it finishes, so the final DOM is
  // the original text (no lingering masks clipping descenders, clean for screen readers).
  function buildHero() {
    const first = document.querySelector(".f-name-first");
    const rest = document.querySelector(".f-name-rest");
    const fades = gsap.utils.toArray(".f-hero-top > *, .f-tagline, .f-roles li, .f-cue");
    const navBits = gsap.utils.toArray(".f-nav > *");   // children, not .f-nav: it has a CSS transition
    const splits = [];
    // a hero still mid-flight (fast return from the OS) is finished first, so text is never split twice
    if (heroTl) heroTl.progress(1);
    const tl = heroTl = gsap.timeline({ paused: true, onComplete: () => { splits.forEach((s) => s.revert()); splits.length = 0; } });

    if (window.SplitText) {
      gsap.registerPlugin(SplitText);
      const a = SplitText.create(first, { type: "chars", mask: "chars" });
      splits.push(a);
      tl.fromTo(a.chars, { yPercent: 115 }, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.045 }, 0);
      if (rest) {
        const b = SplitText.create(rest, { type: "words", mask: "words" });
        splits.push(b);
        tl.fromTo(b.words, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.07 }, 0.3);
      }
    } else {
      // SplitText failed to load: same rhythm, no masks
      tl.fromTo([first, rest].filter(Boolean), { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.12 }, 0);
    }
    tl.fromTo(fades, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.5)
      .fromTo(".f-hero-bottom", { "--f-rule": 0 }, { "--f-rule": 1, duration: 1.2, ease: "expo.inOut" }, 0.35)
      // opacity, not autoAlpha: the nav links must stay focusable while the hero plays,
      // or the first Tab after arriving skips the whole nav
      .fromTo(navBits, { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.06 }, 0.7);
    return tl;   // fromTo renders its start state immediately, even while paused
  }

  function startLoops() {
    if (loops.length) { loops.forEach((l) => l.play()); return; }
    const cue = document.querySelector(".f-cue-line");
    if (cue) {
      loops.push(gsap.timeline({ repeat: -1, repeatDelay: 0.35 })
        .fromTo(cue, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.8, ease: "power2.inOut" })
        .set(cue, { transformOrigin: "50% 100%" })
        .to(cue, { scaleY: 0, duration: 0.8, ease: "power2.inOut" }));
    }
    startRoles();
  }

  // Eyebrow cycles through the roles: old one slides up and out, next one rises in.
  function startRoles() {
    const el = document.querySelector(".f-eyebrow");
    const roles = D.roles || [];
    if (rolesStarted || !el || roles.length < 2) return;
    rolesStarted = true;
    el.innerHTML = `<span class="f-eyebrow-in">${esc(roles[0])}</span>`;
    const inner = el.firstChild;
    let i = 0;
    const cycle = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 2.4 })
      .to(inner, { yPercent: -110, duration: 0.45, ease: "power3.in" })
      .add(() => { i = (i + 1) % roles.length; inner.textContent = roles[i]; })
      .fromTo(inner, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out" });
    loops.push(cycle);
  }

  function pauseLoops() { loops.forEach((l) => l.pause()); }

  function removeLoader(loader) {
    if (loader && loader.parentNode) loader.remove();
    if (lenis) lenis.start();
  }

  async function intro() {
    const loader = document.getElementById("fLoader");
    if (!animOK()) { removeLoader(loader); return; }   // reduced motion or no GSAP: no theatre

    root.classList.add("f-intro-pending");
    if (lenis) lenis.stop();
    await fontsReady();
    if (!isOn()) { root.classList.remove("f-intro-pending"); removeLoader(loader); return; }  // skipped meanwhile

    const hero = buildHero();
    root.classList.remove("f-intro-pending");

    if (!loader) { hero.play(); startLoops(); return; }
    loader.style.animation = "none";                     // JS is in control: cancel the CSS failsafe

    const firstVisit = !ss.get("front.loaded");
    ss.set("front.loaded", "1");
    const tl = gsap.timeline();

    if (firstVisit) {
      const word = document.getElementById("fLoaderWord");
      const words = (Array.isArray(D.loaderWords) && D.loaderWords.length ? D.loaderWords : ["Hello", "Halo", "你好", "こんにちは"]).concat(first);
      words.forEach((w, n) => {
        tl.add(() => { word.textContent = w; })
          .fromTo(word, { yPercent: 100 }, { yPercent: 0, duration: 0.3, ease: "power3.out" })
          .to({}, { duration: n === words.length - 1 ? 0.45 : 0.1 });
      });
      // panel lifts; its curved lip bulges below, then flattens as it leaves
      tl.addLabel("exit")
        .to(loader, { yPercent: -100, duration: 1.05, ease: "power4.inOut" }, "exit")
        // ease-in: the lip keeps its full bulge through the first half, then snaps flat as the panel leaves
        .fromTo(loader.querySelector(".f-loader-curve"), { height: "16vh" }, { height: "0vh", duration: 1.05, ease: "power3.in" }, "exit")
        .add(() => { hero.play(); startLoops(); }, "exit+=0.5");
    } else {
      // seen it this session: a short fade, straight into the hero
      tl.to(loader, { autoAlpha: 0, duration: 0.45, ease: "power2.out" })
        .add(() => { hero.play(); startLoops(); }, 0.15);
    }
    tl.add(() => removeLoader(loader));
  }

  // Back from the OS: no loader, replay the hero on a fresh split.
  // `deferred`: build the hero in its hidden start state now, play it later (playPendingHero),
  // so a transition panel can lift off an empty hero instead of a full one that then snaps away.
  let pendingHero = null;
  function replayHero(deferred) {
    if (!animOK()) return;
    const tl = buildHero();
    if (deferred) { pendingHero = tl; return; }
    tl.play();
    startLoops();
  }
  function playPendingHero() {
    if (!pendingHero) return;
    pendingHero.play();
    pendingHero = null;
    startLoops();
  }

  /* ================= Project panel: full description, opened from a row ================= */
  // A role="dialog" sheet inside #front, not a native <dialog>: showModal() would put it in the
  // browser's top layer, above the OS's custom cursor dot, and has-cursor hides the native cursor.
  let panelIndex = -1;          // open project, -1 when closed
  let panelReturn = null;       // element to refocus on close
  let panelTl = null;

  const panelShell = () => `
    <div class="f-panel" id="fPanel" role="dialog" aria-modal="true" aria-labelledby="fPanelTitle" hidden>
      <div class="f-panel-backdrop" data-f-close></div>
      <aside class="f-panel-sheet" data-lenis-prevent>
        <header class="f-panel-top">
          <p class="f-panel-n" id="fPanelN"></p>
          <button type="button" class="f-panel-close" data-f-close>Close <span aria-hidden="true">✕</span></button>
        </header>
        <div class="f-panel-body" id="fPanelBody"></div>
        <footer class="f-panel-foot">
          <button type="button" class="f-panel-next" data-f-next>Next project <span aria-hidden="true">→</span></button>
        </footer>
      </aside>
    </div>`;

  const panelBody = (p) => `
    ${p.context ? `<p class="f-panel-ctx">${esc(p.context)}</p>` : ""}
    <h2 class="f-panel-title" id="fPanelTitle">${esc(p.title)}</h2>
    ${p.subtitle ? `<p class="f-panel-sub">${esc(p.subtitle)}</p>` : ""}
    ${p.image ? `<figure class="f-panel-img"><img src="${safeUrl(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy" /></figure>` : ""}
    <div class="f-panel-desc">${[].concat(p.description || []).map((d) => `<p>${esc(d)}</p>`).join("")}</div>
    ${(p.stack || []).length ? `<ul class="f-panel-stack" aria-label="Built with">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    ${p.code || p.live ? `<div class="f-panel-links">${p.live ? ext(p.live, "Visit site") : ""}${p.code ? ext(p.code, "View code") : ""}</div>`
                       : `<p class="f-panel-nolink">No public link for this one yet.</p>`}`;

  const panelParts = () => {
    const panel = document.getElementById("fPanel");
    return panel && { panel, sheet: panel.querySelector(".f-panel-sheet"), backdrop: panel.querySelector(".f-panel-backdrop"),
                      body: panel.querySelector("#fPanelBody"), n: panel.querySelector("#fPanelN") };
  };

  function fillPanel(i) {
    const P = panelParts(), list = D.projects || [];
    P.body.innerHTML = panelBody(list[i] || {});
    P.n.textContent = `${pad2(i + 1)} / ${pad2(list.length)}`;
    P.sheet.scrollTop = 0;
  }

  // Background is inert, but Tab past the last control would still fall out to the document or the
  // browser chrome. Wrap it: last -> first, Shift+Tab on first -> last.
  function trapTab(e) {
    const sheet = document.querySelector("#fPanel .f-panel-sheet");
    if (!sheet) return;
    const items = [...sheet.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const inside = sheet.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  // While open, everything behind the sheet is inert (no Tab, no clicks, hidden from screen readers).
  const setBackInert = (on) => document.querySelectorAll("#front .f-page, #front .f-nav, #front .f-skip").forEach((el) => { el.inert = on; });

  // Panel content rises in; the title comes up word by word through a mask.
  function contentIn() {
    const P = panelParts();
    const tl = gsap.timeline();
    const title = maskWords(P.body.querySelector(".f-panel-title"));
    tl.fromTo(title.words, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.05, onComplete: title.done }, 0)
      .fromTo([P.n, ...[...P.body.children].filter((c) => !c.classList.contains("f-panel-title"))],
        // opacity, not autoAlpha: the panel's links must be reachable by Tab while they fade in
        { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.1);
    return tl;
  }

  function openPanel(i, trigger) {
    const P = panelParts();
    if (!P || !isOn() || panelIndex >= 0) return;
    panelIndex = i;
    panelReturn = trigger || document.activeElement;
    fillPanel(i);
    P.panel.hidden = false;
    root.classList.add("f-panel-open");
    setBackInert(true);
    if (lenis) lenis.stop();
    if (root.classList.contains("f-label-on")) {          // the row's "View" bubble leaves with it
      root.classList.remove("f-label-on");
      if (hasGsap()) gsap.to("#fLabel", { scale: 0, duration: 0.2, overwrite: "auto" });
    }
    P.panel.querySelector(".f-panel-close").focus({ preventScroll: true });
    if (!animOK()) return;
    if (panelTl) panelTl.kill();
    panelTl = gsap.timeline()
      .fromTo(P.backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0)
      // the sheet slides in with a curved leading edge that straightens as it lands
      .fromTo(P.sheet, { xPercent: 100, borderTopLeftRadius: "30vw 50vh", borderBottomLeftRadius: "30vw 50vh" },
                       { xPercent: 0, borderTopLeftRadius: "0vw 0vh", borderBottomLeftRadius: "0vw 0vh", duration: 0.95, ease: "expo.out" }, 0)
      .add(contentIn(), 0.25);
  }

  function closePanel(instant) {
    const P = panelParts();
    if (!P || panelIndex < 0) return;
    panelIndex = -1;
    if (panelTl) { panelTl.kill(); panelTl = null; }
    const done = () => {
      P.panel.hidden = true;
      if (hasGsap()) gsap.set([P.sheet, P.backdrop], { clearProps: "all" });
      root.classList.remove("f-panel-open");
      setBackInert(false);
      if (lenis && isOn()) lenis.start();
      if (isOn() && panelReturn && panelReturn.focus) panelReturn.focus({ preventScroll: true });
      panelReturn = null;
    };
    if (instant || !animOK()) { done(); return; }
    panelTl = gsap.timeline({ onComplete: done })
      .to(P.sheet, { xPercent: 100, duration: 0.6, ease: "power3.in" }, 0)
      .to(P.backdrop, { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 0.15);
  }

  function nextProject() {
    const P = panelParts(), count = (D.projects || []).length;
    if (!P || panelIndex < 0 || !count) return;
    const next = (panelIndex + 1) % count;
    panelIndex = next;
    if (!animOK()) { fillPanel(next); P.panel.querySelector(".f-panel-close").focus({ preventScroll: true }); return; }
    if (panelTl) panelTl.kill();
    panelTl = gsap.timeline()
      .to([P.n, ...P.body.children], { y: -24, opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.03 })
      .add(() => { fillPanel(next); contentIn(); });
  }

  /* ================= Step 7: way back from the OS ================= */
  // "Back to portfolio" at the top of the OS menubar dropdown. Added after os.js has run, so os.js's
  // own menu handlers (bound once at load) never see it; it closes the menu itself.
  function addReturnToMenu() {
    if (small()) return;
    const menu = document.getElementById("mbMenu");
    if (!menu || menu.querySelector("[data-f-return]")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.fReturn = "";
    btn.textContent = "Back to portfolio";
    const sep = document.createElement("div");
    sep.className = "mb-sep";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.hidden = true;
      const brand = document.getElementById("mbBrand");
      if (brand) brand.setAttribute("aria-expanded", "false");
      // drop #projects / #desktop so a reload lands on the front again
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      closeArchive();
    });
    menu.prepend(btn, sep);
  }

  /* ---- Handoff to the OS ---- */
  function enterOS() {
    if (!isOn()) return;
    closePanel(true);
    if (hasGsap()) { stopScroll(); pauseLoops(); }  // kill Lenis + triggers before the layout disappears
    removeLoader(document.getElementById("fLoader")); // skip link pressed during the loader
    root.dataset.front = "off";   // CSS hides #front, restores body overflow:hidden, enables .os
    setOsInert(false);            // before focusing anything inside the OS
    window.scrollTo(0, 0);        // safe: #front is display:none, so nothing visibly jumps
    const field = document.querySelector('html[data-state="lock"] #lockField');
    if (field) field.focus({ preventScroll: true });
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function returnToFront(opts = {}) {
    if (isOn() || small()) return;
    root.dataset.front = "on";
    setOsInert(true);             // also drops any focus left inside the OS (e.g. the sign-in field)
    window.scrollTo(0, 0);
    // Move the browser's Tab starting point to the top of the front. Otherwise it stays
    // where the OS focus was (later in the DOM) and the first Tab skips the whole front.
    const host = document.getElementById("front");
    if (host) { host.setAttribute("tabindex", "-1"); host.focus({ preventScroll: true }); }
    startScroll();
    replayHero(opts.deferHero);
  }

  // enterOS / returnToFront switch instantly; openArchive / closeArchive play the transition.
  window.Front = { enterOS, returnToFront, openArchive, closeArchive };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
