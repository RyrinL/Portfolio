/* ============================================================
   Renders the professional portfolio INTO its windows.
   Split into three apps: Projects, About, Experience.
   window.Portfolio.render(scrollEl, "projects"|"about"|"experience")
   ============================================================ */
(function () {
  const D = window.PORTFOLIO || {};
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:|mailto:|#|[\w./-]+$)/i.test(u || "") ? esc(u) : "#");
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---- generated line art (one composition per project) ---- */
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const art = (n) => {
    const r = rng(n * 7919 + 13);
    const R = (a, b) => Math.round((a + r() * (b - a)) * 10) / 10;
    const W = 840, H = 360; let k = 0;
    const line = (d) => `<path class="draw" style="--k:${k++}" pathLength="1" d="${d}"/>`;
    const out = [line(`M40 0V${H}`), line(`M${W - 40} 0V${H}`)];
    const g = [];
    const sx = R(-380, -220), sw = R(200, 320), sn = 6 + Math.floor(r() * 5);
    g.push(line(`M${sx} -60H${sx + sw}V200H${sx}Z`));
    for (let i = 0; i < sn; i++) { const x = Math.round(sx + (sw * (i + 1)) / (sn + 1)); g.push(line(`M${x} -60L${x - 34} 200`)); }
    const qx = R(100, 230), qy = R(-170, -80);
    for (let i = 0; i < 5; i++) { const s = 160 - i * 32; g.push(line(`M${qx} ${qy}h${s}v${s}h${-s}Z`)); }
    const wy = R(40, 90);
    for (let i = 0; i < 6; i++) g.push(line(`M${qx - 60} ${wy + i * 14}q40 -22 80 0t80 0t80 0t80 0`));
    const dx = R(-150, -40), dy = R(-170, -110);
    for (let a = 0; a < 7; a++) for (let b = 0; b < 5; b++) g.push(`<circle class="dotm" cx="${dx + a * 16}" cy="${dy + b * 16}" r="${(4.6 - a * 0.5).toFixed(1)}"/>`);
    out.push(`<g transform="translate(${R(300, 540)} ${R(150, 220)}) rotate(${R(-32, 32)})">${g.join("")}</g>`);
    const mx = R(260, 600), my = R(90, 190), mr = R(84, 124);
    out.push(`<circle class="moon moon-you" cx="${mx}" cy="${my - mr * 0.5}" r="${mr}"/>`);
    out.push(`<circle class="moon moon-me" cx="${mx + mr * 0.35}" cy="${my + mr * 0.3}" r="${mr}"/>`);
    const ex = R(120, 720), ey = R(60, 300);
    out.push(`<circle class="eye" cx="${ex}" cy="${ey}" r="4"/><circle class="draw eye-ring" style="--k:${k + 6}" pathLength="1" cx="${ex}" cy="${ey}" r="14"/>`);
    return `<svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out.join("")}</svg>`;
  };
  const visual = (p, n) => (p.image ? `<img src="${safeUrl(p.image)}" alt="" loading="lazy" />` : art(n));

  /* ---- shared bits ---- */
  const cvBtn = () => (D.resumeUrl ? `<a class="pf-cv" href="${safeUrl(D.resumeUrl)}" download>Download CV <span aria-hidden="true">↓</span></a>` : "");
  const links = () => {
    const socials = (D.socials || []).map((s) => `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join("");
    return `<nav class="pf-links"><a href="mailto:${esc(D.email || "")}">${esc(D.email || "")}</a>${socials}</nav>`;
  };
  const head = (eyebrow, title, sub, extra) =>
    `<header class="pf-hero pf-head rv"><p class="pf-eyebrow">${esc(eyebrow)}</p><h1 class="pf-name">${esc(title)}</h1>${sub ? `<p class="pf-tagline">${esc(sub)}</p>` : ""}${extra || ""}</header>`;

  /* ---- Projects ---- */
  const projects = () => {
    const list = D.projects || [];
    return head("Selected work", "Projects", `${list.length} projects · ${D.name || ""}`) + `
      <section class="pf-sec" data-accent="you">
        <div class="pf-projects">
          ${list.map((p, n) => `
            <article class="pf-proj rv" style="--d:${(n % 2) * 60}ms">
              <div class="pf-art">${visual(p, n)}</div>
              <div class="pf-proj-body">
                <p class="pf-count">${pad2(n + 1)} / ${pad2(list.length)}</p>
                <h3 class="pf-proj-title">${esc(p.title)}</h3>
                ${p.subtitle ? `<p class="pf-proj-sub">${esc(p.subtitle)}</p>` : ""}
                ${p.context ? `<p class="pf-proj-ctx">${esc(p.context)}</p>` : ""}
                <div class="pf-proj-text">${[].concat(p.description || []).map((d) => `<p>${esc(d)}</p>`).join("")}</div>
                ${(p.stack || []).length ? `<ul class="pf-stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
                ${p.live || p.code ? `<div class="pf-proj-links">${p.live ? `<a href="${safeUrl(p.live)}" target="_blank" rel="noopener">visit ↗</a>` : ""}${p.code ? `<a href="${safeUrl(p.code)}" target="_blank" rel="noopener">code ↗</a>` : ""}</div>` : ""}
              </div>
            </article>`).join("")}
        </div>
      </section>`;
  };

  /* ---- About (includes contact + CV) ---- */
  const about = () => `
    <header class="pf-hero rv">
      <p class="pf-eyebrow">${esc((D.roles || [])[0] || "")}</p>
      <h1 class="pf-name">${esc(D.name || "")}</h1>
      <p class="pf-tagline">${esc(D.tagline || "")}</p>
      ${D.available ? `<p class="pf-badge"><span class="pf-dot"></span>${esc(D.availableLabel || "open to work")}</p>` : ""}
      ${links()}
      <div class="pf-cv-row">${cvBtn()}</div>
    </header>
    <section class="pf-sec" data-accent="me">
      <p class="pf-sec-k rv">About</p>
      <div class="pf-about rv">${(D.about || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      ${D.location ? `<p class="pf-loc rv">◎ ${esc(D.location)}</p>` : ""}
      <div class="pf-stats rv">${(D.stats || []).map((s) => `<div class="pf-stat"><b>${esc(String(s.value))}${esc(s.suffix || "")}</b><span>${esc(s.label)}</span></div>`).join("")}</div>
    </section>
    <section class="pf-sec" data-accent="me">
      <p class="pf-sec-k rv">Skills</p>
      <div class="pf-skills">${(D.skills || []).map((g, n) => `<div class="pf-skill rv" style="--d:${n * 50}ms"><h4>${esc(g.group)}</h4><ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul></div>`).join("")}</div>
    </section>
    <section class="pf-sec pf-contact" data-accent="you">
      <p class="pf-sec-k rv">Contact</p>
      <h2 class="pf-contact-title rv">Let's build something<br/>that exists.</h2>
      <a class="pf-email rv" href="mailto:${esc(D.email || "")}">${esc(D.email || "")}</a>
      <p class="pf-foot rv">© ${new Date().getFullYear()} ${esc(D.name || "")}</p>
    </section>`;

  /* ---- Experience ---- */
  const experience = () =>
    head("Experience & education", "Where I've been.", null, `<div class="pf-cv-row">${cvBtn()}</div>`) + `
    <section class="pf-sec" data-accent="me">
      <ol class="pf-timeline">
        ${(D.experience || []).map((e) => `
          <li class="pf-item rv">
            ${e.period ? `<span class="pf-period">${esc(e.period)}</span>` : ""}
            <h3>${esc(e.role)}</h3>
            <span class="pf-org">${esc(e.org)}</span>
            ${(e.points || []).length ? `<ul class="pf-points">${e.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>` : ""}
          </li>`).join("")}
      </ol>
    </section>`;

  const VIEWS = { projects, about, experience };

  function render(scrollEl, section) {
    const view = VIEWS[section] || about;
    scrollEl.innerHTML = `<div class="pf" data-view="${esc(section || "about")}">${view()}</div>`;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rvs = scrollEl.querySelectorAll(".rv");
    if (reduce || !("IntersectionObserver" in window)) { rvs.forEach((el) => el.classList.add("in")); scrollEl.querySelectorAll(".pf-art").forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { root: scrollEl, threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    rvs.forEach((el) => io.observe(el));
    const ia = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); ia.unobserve(en.target); } });
    }, { root: scrollEl, threshold: 0.2 });
    scrollEl.querySelectorAll(".pf-art").forEach((el) => ia.observe(el));
  }

  window.Portfolio = { render, art };
})();
