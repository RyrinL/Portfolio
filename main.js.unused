(() => {
  const D = window.PORTFOLIO || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:|mailto:|#|[\w./-]+$)/i.test(u || "") ? esc(u) : "#");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Preloader — absent … here. Once per session. ---------- */
  const preloader = () => {
    const root = document.documentElement, el = $("#preloader"), word = $("#preWord");
    const finish = () => {
      root.classList.remove("loading");
      try { sessionStorage.setItem("preloaded", "1"); } catch (e) {}
    };
    if (!el || root.classList.contains("no-pre")) { finish(); return; }
    const words = ["absent", "present", "forgotten", "remembered", "nonexistent", "here"];
    let i = 0;
    const next = () => {
      const last = i === words.length - 1;
      word.textContent = words[i];
      word.classList.toggle("here", last);
      void word.offsetWidth; // restart the transition
      word.classList.add("show");
      setTimeout(() => {
        if (last) {
          el.classList.add("gone");
          finish();
          setTimeout(() => el.remove(), 800);
        } else {
          word.classList.remove("show");
          i++;
          setTimeout(next, 170);
        }
      }, last ? 320 + 600 : 330);
    };
    next();
  };
  preloader();

  /* ---------- Render content ---------- */
  // Oversized name drifting behind the page
  const nameScroll = $("#nameScroll");
  nameScroll.textContent = `${D.name || ""} — `.repeat(14);

  document.title = `${D.name} — ${(D.roles || [])[0] || "Portfolio"}`;
  $("#footerName").textContent = `© ${new Date().getFullYear()} ${D.name}`;
  $("#tagline").textContent = D.tagline || "";
  $("#location").textContent = D.location || "";
  if (D.available) {
    $("#badge").hidden = false;
    if (D.availableLabel) $("#badgeText").textContent = D.availableLabel;
  }

  /* ---------- Generated line art (one composition per project) ---------- */
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const art = (n) => {
    const r = rng(n * 7919 + 13);
    const R = (a, b) => Math.round((a + r() * (b - a)) * 10) / 10;
    const W = 840, H = 360;
    let k = 0;
    const line = (d) => `<path class="draw" style="--k:${k++}" pathLength="1" d="${d}"/>`;
    const out = [line(`M40 0V${H}`), line(`M${W - 40} 0V${H}`)];
    const g = [];
    // striped block
    const sx = R(-380, -220), sw = R(200, 320), sn = 6 + Math.floor(r() * 5);
    g.push(line(`M${sx} -60H${sx + sw}V200H${sx}Z`));
    for (let i = 0; i < sn; i++) {
      const x = Math.round(sx + (sw * (i + 1)) / (sn + 1));
      g.push(line(`M${x} -60L${x - 34} 200`));
    }
    // nested squares
    const qx = R(100, 230), qy = R(-170, -80);
    for (let i = 0; i < 5; i++) { const s = 160 - i * 32; g.push(line(`M${qx} ${qy}h${s}v${s}h${-s}Z`)); }
    // waves
    const wy = R(40, 90);
    for (let i = 0; i < 6; i++) g.push(line(`M${qx - 60} ${wy + i * 14}q40 -22 80 0t80 0t80 0t80 0`));
    // dot field
    const dx = R(-150, -40), dy = R(-170, -110);
    for (let a = 0; a < 7; a++) for (let b = 0; b < 5; b++)
      g.push(`<circle class="dotm" cx="${dx + a * 16}" cy="${dy + b * 16}" r="${(4.6 - a * 0.5).toFixed(1)}"/>`);
    out.push(`<g transform="translate(${R(300, 540)} ${R(150, 220)}) rotate(${R(-32, 32)})">${g.join("")}</g>`);
    // two overlapping discs — you and me
    const mx = R(260, 600), my = R(90, 190), mr = R(84, 124);
    out.push(`<circle class="moon moon-you" cx="${mx}" cy="${my - mr * 0.5}" r="${mr}"/>`);
    out.push(`<circle class="moon moon-me" cx="${mx + mr * 0.35}" cy="${my + mr * 0.3}" r="${mr}"/>`);
    // the one bright mark
    const ex = R(120, 720), ey = R(60, 300);
    out.push(`<circle class="eye" cx="${ex}" cy="${ey}" r="4"/><circle class="draw eye-ring" style="--k:${k + 6}" pathLength="1" cx="${ex}" cy="${ey}" r="14"/>`);
    return `<svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out.join("")}</svg>`;
  };
  const visual = (p, n) => (p.image ? `<img src="${safeUrl(p.image)}" alt="" loading="lazy" />` : art(n));
  const pad2 = (n) => String(n).padStart(2, "0");
  if (D.resumeUrl) { $("#resumeBtn").hidden = false; $("#resumeBtn").href = D.resumeUrl; }

  // Hero name: chars surface one by one out of the blur
  const nameEl = $("#heroName");
  nameEl.setAttribute("aria-label", D.name || "");
  nameEl.setAttribute("data-text", D.name || "");
  nameEl.classList.toggle("long", (D.name || "").length > 18); // long names get a smaller size so the panel still fits
  let ci = 0;
  nameEl.innerHTML = String(D.name || "")
    .split(" ")
    .map((w) => `<span class="word" aria-hidden="true">${[...w].map((ch) => `<span class="char" style="--i:${ci++}">${esc(ch)}</span>`).join("")}</span>`)
    .join(" ");

  $("#aboutText").innerHTML = (D.about || [])
    .map((p, n) => `<p class="reveal" style="--d:${n * 100}ms">${esc(p)}</p>`).join("");

  $("#stats").innerHTML = (D.stats || [])
    .map((s, n) => `<div class="stat reveal" style="--d:${n * 100}ms"><b data-count="${Number(s.value) || 0}" data-suffix="${esc(s.suffix)}">0${esc(s.suffix)}</b><span>${esc(s.label)}</span></div>`).join("");

  $("#skills").innerHTML = (D.skills || [])
    .map((g, n) => `<div class="skill-group reveal" style="--d:${n * 100}ms"><h3>${esc(g.group)}</h3><ul class="chips">${g.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul></div>`).join("");

  const projects = D.projects || [];
  $("#projectList").innerHTML = projects
    .map((p, n) => `
      <article class="slide" id="project-${n + 1}">
        <div class="slide-art reveal-art"><div class="slide-art-in">${visual(p, n)}</div></div>
        <p class="slide-count reveal">${pad2(n + 1)} / ${pad2(projects.length)}</p>
        <h3 class="slide-title reveal-lines" style="--d:80ms">${esc(p.title)}</h3>
        ${p.subtitle ? `<p class="slide-sub reveal" style="--d:160ms">${esc(p.subtitle)}</p>` : ""}
        <dl class="slide-meta reveal" style="--d:240ms">
          ${(p.stack || []).length ? `<div><dt>Stack</dt><dd>${p.stack.map(esc).join(", ")}</dd></div>` : ""}
          ${p.context ? `<div><dt>Context</dt><dd>${esc(p.context)}</dd></div>` : ""}
        </dl>
        <div class="slide-body reveal" style="--d:320ms">${[].concat(p.description || []).map((d) => `<p>${esc(d)}</p>`).join("")}</div>
        ${p.live || p.code ? `<div class="slide-links reveal" style="--d:400ms">
          ${p.live ? `<a href="${safeUrl(p.live)}" target="_blank" rel="noopener">visit ↗</a>` : ""}
          ${p.code ? `<a href="${safeUrl(p.code)}" target="_blank" rel="noopener">code ↗</a>` : ""}
        </div>` : ""}
      </article>`).join("");

  // Project index in the side panel
  $("#piList").innerHTML = projects
    .map((p, n) => `<a href="#project-${n + 1}" data-n="${n}"><span class="pi-title">${esc(p.short || p.title)}</span><span class="pi-num">${pad2(n + 1)}</span></a>`).join("");
  const piLinks = [...document.querySelectorAll("#piList a")];

  /* ---------- Mouse-follow project card (desktop only) ---------- */
  if (finePointer && !reduce) {
    const root = document.documentElement;
    const card = $("#hoverCard"), cardImg = $("#hoverCardImg"), pill = $("#hoverPill"), pindex = $("#pindex");
    let mx = 0, my = 0, cx = 0, cy = 0, px = 0, py = 0, on = false, running = false, shown = -1;
    const loop = () => {
      cx += (mx - cx) * 0.08; cy += (my - cy) * 0.08;   // the card lags behind
      px += (mx - px) * 0.22; py += (my - py) * 0.22;   // the pill keeps up
      card.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      pill.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      if (on) requestAnimationFrame(loop); else running = false;
    };
    pindex.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    piLinks.forEach((a) => a.addEventListener("pointerenter", (e) => {
      const n = +a.dataset.n;
      if (n !== shown) { shown = n; cardImg.innerHTML = visual(projects[n], n); }
      mx = e.clientX; my = e.clientY;
      if (!on) { cx = px = mx; cy = py = my; }
      on = true; root.dataset.card = "";
      if (!running) { running = true; requestAnimationFrame(loop); }
    }));
    pindex.addEventListener("pointerleave", () => { on = false; delete root.dataset.card; });
  }

  $("#timeline").innerHTML = (D.experience || [])
    .map((e) => `
      <li class="item reveal">
        ${e.period ? `<span class="period">${esc(e.period)}</span>` : ""}
        <h3>${esc(e.role)}</h3>
        <span class="org">${esc(e.org)}</span>
        <ul class="points">${(e.points || []).map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>
      </li>`).join("");

  const emailLink = $("#emailLink");
  emailLink.textContent = D.email || "";
  emailLink.href = `mailto:${D.email || ""}`;
  $("#socials").innerHTML = (D.socials || [])
    .map((s) => `<li><a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("");

  /* ---------- Clock ---------- */
  const clockEl = $("#clock");
  const zone = D.timezone || undefined;
  let clockFmt;
  try {
    clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", hour12: false });
  } catch (e) {
    clockFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  const city = (D.location || "").split(",")[0].trim();
  const tickClock = () => { clockEl.textContent = `${clockFmt.format(new Date())}${city ? " " + city : ""}`; };
  tickClock();
  setInterval(tickClock, 15000);

  /* ---------- Copy email ---------- */
  $("#copyEmail").addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    try {
      await navigator.clipboard.writeText(D.email || "");
      btn.textContent = "copied";
      btn.classList.add("done");
    } catch (e) {
      btn.textContent = "ctrl+c";
      const r = document.createRange(); r.selectNodeContents(emailLink);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
    setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("done"); }, 1800);
  });

  /* ---------- Typed roles — slow, deliberate ---------- */
  const typed = $("#typed");
  const roles = D.roles || [];
  if (reduce || roles.length < 2) {
    typed.textContent = roles[0] || "";
  } else {
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 95;
      if (!deleting && c === word.length) { deleting = true; delay = 2600; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 650; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1400);
  }

  /* ---------- Count-up ---------- */
  const countUp = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = target + suffix; return; }
    const start = performance.now(), dur = 1500;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal on scroll + nav spy ---------- */
  // Split a heading into its rendered lines, each behind its own mask
  const splitLines = (el) => {
    const segs = [[]]; // a <br> starts a new segment
    el.childNodes.forEach((nd) => {
      if (nd.nodeName === "BR") segs.push([]);
      else (nd.textContent || "").split(/\s+/).filter(Boolean).forEach((w) => segs[segs.length - 1].push(w));
    });
    el.setAttribute("aria-label", segs.map((s) => s.join(" ")).join(" "));
    el.innerHTML = segs.map((s) => s.map((w) => `<span class="w">${esc(w)}</span>`).join(" ")).join("<br>");
    const lines = [];
    let top = null;
    el.querySelectorAll(".w").forEach((sp) => {
      if (top === null || Math.abs(sp.offsetTop - top) > 4) { lines.push([]); top = sp.offsetTop; }
      lines[lines.length - 1].push(sp.textContent);
    });
    el.innerHTML = lines
      .map((l, n) => `<span class="line-wrap" aria-hidden="true"><span class="line-inner" style="--l:${n}">${esc(l.join(" "))}</span></span>`).join("");
    el.classList.add("split");
  };
  const lineEls = [...document.querySelectorAll(".reveal-lines")];
  // Lines depend on the final font metrics, so wait for the webfonts (but never for long)
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((res) => setTimeout(res, 1500)),
  ]);

  const reveals = document.querySelectorAll(".reveal, .reveal-art, .timeline li.item");
  if ("IntersectionObserver" in window) {
    fontsReady.then(() => { lineEls.forEach(splitLines); lineEls.forEach((el) => io.observe(el)); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        const counter = en.target.querySelector("[data-count]");
        if (counter) countUp(counter);
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -14% 0px" });
    reveals.forEach((el) => io.observe(el));

    const links = [...document.querySelectorAll(".menu a[href^='#']")];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
        // The cursor, progress line and menu take on the tone of the section on screen
        document.documentElement.dataset.tone = en.target.dataset.accent || "you";
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("section[id]").forEach((s) => spy.observe(s));

    // Project index: only visible inside the projects section, tracks the current panel
    const zone = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) document.documentElement.dataset.zone = "projects";
      else delete document.documentElement.dataset.zone;
    }, { rootMargin: "-50% 0px -50% 0px" });
    zone.observe($("#projects"));
    const slideSpy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const n = +en.target.id.split("-")[1] - 1;
        piLinks.forEach((a, i) => a.classList.toggle("active", i === n));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".slide").forEach((s) => slideSpy.observe(s));
  } else {
    lineEls.forEach((el) => { splitLines(el); el.classList.add("in"); });
    reveals.forEach((el) => {
      el.classList.add("in");
      const counter = el.querySelector("[data-count]");
      if (counter) counter.textContent = counter.dataset.count + (counter.dataset.suffix || "");
    });
  }

  /* ---------- Scroll: progress + timeline line ---------- */
  const progress = $("#progress"), timeline = $("#timeline");
  const arts = [...document.querySelectorAll(".slide-art")];
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduce) {
      nameScroll.style.transform = `translateX(${(-y * 0.25).toFixed(1)}px)`;
      // Each visual drifts a little slower than the page — a small, quiet parallax
      arts.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > innerHeight + 80) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
      });
    }
    if (!reduce && timeline.children.length) {
      const rect = timeline.getBoundingClientRect();
      const drawn = (innerHeight * 0.75 - rect.top) / rect.height;
      timeline.style.setProperty("--line", Math.max(0, Math.min(1, drawn)).toFixed(3));
    }
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Void blink on nav ---------- */
  const blink = () => {
    if (reduce) return;
    document.documentElement.setAttribute("data-blink", "");
    setTimeout(() => document.documentElement.removeAttribute("data-blink"), 90);
  };
  document.querySelectorAll(".menu a[href^='#'], .footer a[href^='#'], .pi-list a").forEach((a) => {
    a.addEventListener("click", blink);
  });

  /* ---------- Glitch pulses ---------- */
  const glitchOnce = (el) => {
    if (reduce || el.classList.contains("glitching")) return;
    el.classList.add("glitching");
    setTimeout(() => el.classList.remove("glitching"), 320);
  };
  const kana = document.querySelector(".kana");
  nameEl.addEventListener("pointerenter", () => glitchOnce(nameEl));
  if (kana) kana.addEventListener("pointerenter", () => glitchOnce(kana));
  if (!reduce) {
    (function pulse() {
      setTimeout(() => {
        glitchOnce(Math.random() < 0.5 && kana ? kana : nameEl);
        pulse();
      }, 5000 + Math.random() * 7000);
    })();
  }

  /* ---------- Magnetic buttons (desktop only) ---------- */
  if (finePointer && !reduce) {
    const magnets = [...document.querySelectorAll(".copy-btn, .email-link, #resumeBtn, .socials a, .footer a")]
      .map((el) => ({ el, x: 0, y: 0 }));
    let queued = false;
    addEventListener("pointermove", (e) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        magnets.forEach((m) => {
          const r = m.el.getBoundingClientRect();
          if (!r.width) return;
          // distance from the element's resting centre
          const dx = e.clientX - (r.left - m.x + r.width / 2), dy = e.clientY - (r.top - m.y + r.height / 2);
          const near = Math.abs(dx) < r.width / 2 + 50 && Math.abs(dy) < r.height / 2 + 50;
          const nx = near ? dx * 0.35 : 0, ny = near ? dy * 0.35 : 0;
          if (nx === m.x && ny === m.y) return;
          m.x = nx; m.y = ny;
          m.el.style.translate = `${nx.toFixed(1)}px ${ny.toFixed(1)}px`;
        });
      });
    }, { passive: true });
  }

  /* ---------- Custom cursor (desktop only) ---------- */
  if (finePointer && !reduce) {
    const cur = $("#cursor");
    document.documentElement.classList.add("has-cursor");
    addEventListener("pointermove", (e) => {
      cur.classList.add("on");
      cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
    addEventListener("pointerover", (e) => {
      cur.classList.toggle("big", !!e.target.closest("a, button"));
    });
    document.documentElement.addEventListener("pointerleave", () => cur.classList.remove("on"));
  }
})();
