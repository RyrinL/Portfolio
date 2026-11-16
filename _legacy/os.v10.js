/* ============================================================
   非存在 OS — the shell that wraps the portfolio.
   States: sleep -> lock -> desktop (<-> windows) -> archive.
   The ARG: delete files until one resists, find the way in,
   give it the day that keeps surfacing. Reset from the menu,
   the terminal, or the archive — no page refresh, ever.
   ============================================================ */
(() => {
  const OS = window.OS || {};
  const $  = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  const LS = {
    get booted() { try { return localStorage.getItem("nonos.booted") === "1"; } catch (e) { return false; } },
    set booted(v) { try { v ? localStorage.setItem("nonos.booted", "1") : localStorage.removeItem("nonos.booted"); } catch (e) {} },
    get deleted() { try { return JSON.parse(localStorage.getItem("nonos.deleted") || "[]"); } catch (e) { return []; } },
    set deleted(a) { try { localStorage.setItem("nonos.deleted", JSON.stringify(a)); } catch (e) {} },
    get unlocked() { try { return localStorage.getItem("nonos.unlocked") === "1"; } catch (e) { return false; } },
    set unlocked(v) { try { v ? localStorage.setItem("nonos.unlocked", "1") : localStorage.removeItem("nonos.unlocked"); } catch (e) {} },
    clearArg() { try { localStorage.removeItem("nonos.deleted"); localStorage.removeItem("nonos.unlocked"); } catch (e) {} },
  };

  // ---------- state ----------
  const S = {
    deleted: new Set(LS.deleted),
    unlocked: LS.unlocked,
    seedAwake: false,
    wins: new Map(),      // id -> {win, minimized}
    z: 30,
    lastSpoke: 0,
    lastLine: "",
    idleTimer: 0,
  };
  const deletable = () => (OS.files || []).filter((f) => f.deletable);
  const present = () => (OS.files || []).filter((f) => f.deletable && !S.deleted.has(f.id));
  const allGone = () => deletable().every((f) => S.deleted.has(f.id));

  /* ========== STATE MACHINE ========== */
  const setState = (st) => root.setAttribute("data-state", st);

  /* ========== SLEEP ========== */
  const fmtTime = (d, withDate) => {
    try {
      if (withDate) return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(d).replace(",", "");
      return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    } catch (e) { return d.toTimeString().slice(0, 5); }
  };
  const sleepClock = $("#sleepClock");
  const tickSleep = () => { if (sleepClock) sleepClock.textContent = fmtTime(new Date(), false); };
  tickSleep(); setInterval(tickSleep, 10000);

  const wake = () => {
    const scr = $("#sleep");
    if (root.getAttribute("data-state") !== "sleep") return;
    if (reduce) { setState("lock"); $("#lockField") && $("#lockField").focus(); return; }
    scr.classList.add("waking");
    const word = $("#sleepWord"), seq = ["absent", "present", "here"];
    let i = 0;
    const step = () => {
      word.textContent = seq[i]; word.classList.toggle("here", i === seq.length - 1);
      void word.offsetWidth; word.classList.add("show");
      setTimeout(() => {
        word.classList.remove("show");
        if (++i < seq.length) setTimeout(step, 160);
        else setTimeout(() => { setState("lock"); scr.classList.remove("waking"); const f = $("#lockField"); f && f.focus(); }, 320);
      }, i === seq.length - 1 ? 620 : 420);
    };
    setTimeout(step, 240);
  };
  $("#sleep").addEventListener("click", wake);
  const sleepKey = (e) => { if (root.getAttribute("data-state") === "sleep") { e.preventDefault(); wake(); } };
  addEventListener("keydown", sleepKey);

  /* ========== SIGN IN ========== */
  const owner = OS.owner || {};
  $("#avatar").textContent = owner.avatar || "·";
  $("#lockName").textContent = owner.displayName || "";
  $("#lockHint").textContent = owner.hint || "";
  $("#lockField").setAttribute("placeholder", "");
  $("#lockForm").addEventListener("submit", (e) => {
    e.preventDefault();
    LS.booted = true;
    setState("desktop");
    boot();
  });

  /* ========== DESKTOP ========== */
  const presenceEl = $("#presence"), clockEl = $("#clock");
  const tickClock = () => { clockEl.textContent = fmtTime(new Date(), true); };

  const iconMarkup = (o, kind) => {
    const i = el("div", "icon", `<div class="icon-glyph">${esc(o.glyph)}</div><div class="icon-label">${esc(o.name)}</div>`);
    i.dataset.kind = kind; i.dataset.id = o.id; i.tabIndex = 0;
    if (kind === "bin") i.querySelector(".icon-label").insertAdjacentHTML("afterend", `<div class="icon-bin-count" id="binCount"></div>`);
    if (kind === "seed" && S.seedAwake) i.classList.add("awake");
    return i;
  };

  const renderDesktop = () => {
    const wrap = $("#deskIcons"); wrap.innerHTML = "";
    const pf = (OS.apps || []).find((a) => a.id === "portfolio");
    if (pf) wrap.appendChild(iconMarkup(pf, "portfolio"));
    present().forEach((f) => wrap.appendChild(iconMarkup(f, f.kind === "folder" ? "folder" : "file")));
    const seed = (OS.files || []).find((f) => f.kind === "seed");
    if (seed) wrap.appendChild(iconMarkup(seed, "seed"));
    const bin = (OS.apps || []).find((a) => a.id === "bin");
    if (bin) wrap.appendChild(iconMarkup(bin, "bin"));
    wireIcons();
    updateBinCount();
    renderDock();
  };

  const renderDock = () => {
    const dock = $("#dock"); dock.innerHTML = "";
    (OS.apps || []).forEach((a) => {
      const d = el("button", "dock-item", `${esc(a.glyph)}<span class="dot"></span><span class="dock-tip">${esc(a.name)}</span>`);
      d.dataset.kind = a.kind; d.dataset.id = a.id;
      if (S.wins.has("app:" + a.id)) d.classList.add("running");
      d.addEventListener("click", () => openApp(a));
      dock.appendChild(d);
    });
  };

  const updateBinCount = () => { const c = $("#binCount"); if (c) c.textContent = S.deleted.size ? S.deleted.size + (S.deleted.size === 1 ? " item" : " items") : "empty"; };

  /* ----- icon interactions ----- */
  let selected = null;
  const selectIcon = (i) => { if (selected) selected.classList.remove("selected"); selected = i; i && i.classList.add("selected"); };
  const openIcon = (i) => {
    const kind = i.dataset.kind, id = i.dataset.id;
    if (kind === "portfolio") return openApp({ id: "portfolio", name: "Portfolio", glyph: "◱", kind: "portfolio" });
    if (kind === "bin") return openApp({ id: "bin", name: "Bin", glyph: "⌫", kind: "bin" });
    if (kind === "seed") return openSeed();
    const f = (OS.files || []).find((x) => x.id === id); if (f) openFile(f);
  };
  const wireIcons = () => {
    $$(".icon", $("#deskIcons")).forEach((i) => {
      i.addEventListener("pointerdown", () => selectIcon(i));
      if (fine) i.addEventListener("dblclick", () => openIcon(i));
      else i.addEventListener("click", () => openIcon(i));
      i.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); openIcon(i); }
        if ((e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); tryDelete(i); }
      });
      i.addEventListener("contextmenu", (e) => { e.preventDefault(); selectIcon(i); showCtx(e.clientX, e.clientY, i); });
    });
  };
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ----- context menu ----- */
  let ctx = null;
  const killCtx = () => { if (ctx) { ctx.remove(); ctx = null; } };
  const showCtx = (x, y, i) => {
    killCtx();
    const kind = i.dataset.kind, id = i.dataset.id;
    const isFile = kind === "file" || kind === "folder";
    const m = el("div", "ctx");
    const add = (label, fn, dis) => { const b = el("button", null, esc(label)); if (dis) b.disabled = true; else b.addEventListener("click", () => { killCtx(); fn(); }); m.appendChild(b); };
    add("Open", () => openIcon(i));
    if (isFile) add("Move to Bin", () => tryDelete(i));
    else if (kind === "seed") add("Move to Bin", () => tryDelete(i));
    else add("Move to Bin", () => {}, true);
    if (kind === "bin" && S.deleted.size) add("Empty Bin…", emptyBin);
    document.body.appendChild(m);
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
    m.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  };
  addEventListener("pointerdown", (e) => { if (ctx && !ctx.contains(e.target)) killCtx(); }, true);

  /* ----- delete / resist ----- */
  const tryDelete = (i) => {
    const kind = i.dataset.kind, id = i.dataset.id;
    if (kind === "seed" || kind === "bin" || kind === "portfolio") return resist(i);
    const f = (OS.files || []).find((x) => x.id === id);
    if (!f || !f.deletable) return resist(i);
    const first = S.deleted.size === 0;
    i.classList.add("deleting");
    const commit = () => {
      S.deleted.add(id); LS.deleted = [...S.deleted];
      renderDesktop();
      say(first ? "firstDelete" : "delete");
      checkProgress();
    };
    reduce ? commit() : setTimeout(commit, 440);
  };
  const resist = (i) => {
    i.classList.remove("resisting"); void i.offsetWidth; i.classList.add("resisting");
    say("resist", true);
  };
  const checkProgress = () => {
    if (allGone() && !S.seedAwake) {
      S.seedAwake = true;
      renderDesktop();
      setTimeout(() => say("seedWake", true), 700);
    }
  };

  /* ----- bin ----- */
  const emptyBin = () => {
    confirmModal({
      title: "Empty the Bin?",
      body: "These items will be permanently removed from the desktop.",
      ok: "Empty Bin", danger: true,
      onOk: () => { say("emptyBin", true); /* deletion already simulated; nothing to restore until reset */ const w = S.wins.get("app:bin"); if (w) renderBinBody(w.win.querySelector(".win-body")); },
    });
  };
  const putBack = (id) => { S.deleted.delete(id); LS.deleted = [...S.deleted]; if (S.seedAwake && !allGone()) { S.seedAwake = false; } renderDesktop(); const w = S.wins.get("app:bin"); if (w) renderBinBody(w.win.querySelector(".win-body")); };

  /* ========== WINDOW MANAGER ========== */
  const focusWin = (win) => { win.style.zIndex = ++S.z; $$(".win").forEach((w) => w.classList.remove("focused")); win.classList.add("focused"); $("#mbApp").textContent = win.dataset.appname || "Finder"; };
  const closeWin = (key) => {
    const rec = S.wins.get(key); if (!rec) return;
    const w = rec.win; w.classList.add("closing");
    const done = () => { w.remove(); S.wins.delete(key); renderDock(); const last = [...S.wins.values()].pop(); $("#mbApp").textContent = last ? last.win.dataset.appname : "Finder"; };
    reduce ? done() : setTimeout(done, 200);
  };
  const minWin = (key) => { const rec = S.wins.get(key); if (!rec) return; const w = rec.win; if (reduce) { w.style.display = "none"; rec.minimized = true; return; } w.classList.add("minimizing"); setTimeout(() => { w.style.display = "none"; w.classList.remove("minimizing"); rec.minimized = true; }, 300); };
  const makeWindow = (key, { title, glyph, appname, w, h, cls }) => {
    if (S.wins.has(key)) { const rec = S.wins.get(key); rec.win.style.display = ""; rec.minimized = false; focusWin(rec.win); return null; }
    const vw = innerWidth, vh = innerHeight;
    const W = Math.min(w, vw * 0.94), H = Math.min(h, vh * 0.82);
    const off = (S.wins.size % 5) * 26;
    const win = el("div", "win" + (cls ? " " + cls : ""));
    win.dataset.appname = appname || title;
    win.style.width = W + "px"; win.style.height = H + "px";
    win.style.left = Math.max(10, (vw - W) / 2 + off) + "px";
    win.style.top = Math.max(40, (vh - H) / 2 - 10 + off) + "px";
    win.innerHTML =
      `<div class="win-bar"><div class="win-lights">` +
      `<button class="win-light close" aria-label="Close"></button>` +
      `<button class="win-light min" aria-label="Minimize"></button>` +
      `<button class="win-light zoom" aria-label="Zoom"></button></div>` +
      `<span class="win-icon">${esc(glyph || "")}</span><span class="win-title">${esc(title)}</span></div>` +
      `<div class="win-body"></div>`;
    $("#windows").appendChild(win);
    S.wins.set(key, { win, minimized: false });
    // lights
    win.querySelector(".win-light.close").addEventListener("click", () => closeWin(key));
    win.querySelector(".win-light.min").addEventListener("click", () => minWin(key));
    win.querySelector(".win-light.zoom").addEventListener("click", () => zoomWin(win));
    // focus + drag
    win.addEventListener("pointerdown", () => focusWin(win));
    dragWin(win, win.querySelector(".win-bar"));
    focusWin(win);
    renderDock();
    return win;
  };
  const zoomWin = (win) => {
    if (win.dataset.zoomed) {
      win.style.left = win.dataset.ol; win.style.top = win.dataset.ot; win.style.width = win.dataset.ow; win.style.height = win.dataset.oh;
      delete win.dataset.zoomed;
    } else {
      win.dataset.ol = win.style.left; win.dataset.ot = win.style.top; win.dataset.ow = win.style.width; win.dataset.oh = win.style.height; win.dataset.zoomed = "1";
      win.style.left = "2vw"; win.style.top = "calc(var(--menubar-h) + 8px)"; win.style.width = "96vw"; win.style.height = "calc(100vh - var(--menubar-h) - 24px)";
    }
  };
  const dragWin = (win, bar) => {
    let sx, sy, ox, oy, on = false;
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win-light")) return;
      on = true; sx = e.clientX; sy = e.clientY; ox = win.offsetLeft; oy = win.offsetTop; bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!on) return;
      const nx = ox + (e.clientX - sx), ny = Math.max(32, oy + (e.clientY - sy));
      win.style.left = nx + "px"; win.style.top = ny + "px";
    });
    bar.addEventListener("pointerup", () => { on = false; });
    bar.addEventListener("pointercancel", () => { on = false; });
  };

  /* ========== OPENERS ========== */
  const openApp = (a) => {
    if (a.kind === "portfolio") {
      const win = makeWindow("app:portfolio", { title: "Portfolio", glyph: "◱", appname: "Portfolio", w: 940, h: window.innerHeight * 0.8 });
      if (win && window.Portfolio) window.Portfolio.render(win.querySelector(".win-body"));
    } else if (a.kind === "terminal") {
      const win = makeWindow("app:terminal", { title: "terminal — zsh", glyph: "›_", appname: "Terminal", w: 580, h: 380 });
      if (win) renderTerminal(win.querySelector(".win-body"));
    } else if (a.kind === "bin") {
      const win = makeWindow("app:bin", { title: "Bin", glyph: "⌫", appname: "Bin", w: 480, h: 420 });
      if (win) renderBinBody(win.querySelector(".win-body"));
    }
  };
  const openFile = (f) => {
    const body = `<div class="viewer ${f.kind === "text" || f.id === "log0613" ? "v-mono" : ""}"><p class="v-meta">${esc(f.meta || f.kind)}</p>${(f.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
    const win = makeWindow("file:" + f.id, { title: f.name, glyph: f.glyph, appname: f.name, w: 560, h: 420 });
    if (win) win.querySelector(".win-body").innerHTML = body;
    if (f.id === "log0613" || f.id === "notes") say("openSeed");
  };

  /* ----- the seed: locked gate ----- */
  const openSeed = () => {
    if (S.unlocked) { openArchive(); return; }
    const win = makeWindow("file:seed", { title: "非存在", glyph: "◍", appname: "非存在", w: 500, h: 420, cls: "gate-win" });
    if (!win) return;
    say("openSeed", true);
    const a = OS.arg || {};
    win.querySelector(".win-body").innerHTML =
      `<div class="gate"><div class="gate-glyph">非</div>` +
      `<p class="gate-title">This folder is still in use.</p>` +
      `<p class="gate-sub">It will open for one date, and only that date.</p>` +
      `<form class="gate-form" id="gateForm"><input class="gate-field" id="gateField" inputmode="numeric" autocomplete="off" placeholder="· · · ·" aria-label="date" /><button class="gate-go" type="submit">open</button></form>` +
      `<p class="gate-hint">${esc(a.keyHint || "")}</p></div>`;
    const field = win.querySelector("#gateField");
    setTimeout(() => field.focus(), 60);
    win.querySelector("#gateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const digits = (field.value || "").replace(/\D/g, "");
      const keys = (a.keyDigits || []);
      if (keys.includes(digits)) {
        S.unlocked = true; LS.unlocked = true;
        say("unlocked", true);
        closeWin("file:seed");
        setTimeout(openArchive, 260);
      } else {
        field.classList.remove("wrong"); void field.offsetWidth; field.classList.add("wrong");
        field.value = ""; say("wrongKey", true);
      }
    });
  };

  /* ----- terminal ----- */
  const renderTerminal = (body) => {
    body.style.background = "rgba(6,5,6,.6)";
    body.innerHTML = `<div style="padding:16px 18px;font:400 13px/1.7 var(--mono);color:var(--text-soft)" id="termOut"></div>`;
    const out = $("#termOut", body);
    const print = (t, c) => { const line = el("div"); line.style.color = c || "var(--text-soft)"; line.innerHTML = t; out.appendChild(line); out.scrollTop = out.scrollHeight; };
    const prompt = () => {
      const row = el("div"); row.style.display = "flex"; row.style.gap = "8px";
      row.innerHTML = `<span style="color:var(--me)">${esc((OS.owner || {}).handle || "guest")}@non ~ %</span>`;
      const inp = el("input"); inp.style.cssText = "flex:1;background:transparent;border:0;outline:none;color:var(--text);font:inherit;";
      row.appendChild(inp); out.appendChild(row); inp.focus(); out.scrollTop = out.scrollHeight;
      inp.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const cmd = inp.value.trim(); inp.disabled = true;
        run(cmd); prompt();
      });
    };
    const run = (cmd) => {
      const c = cmd.toLowerCase();
      if (!c) return;
      if (c === "help") print("commands: help · ls · whoami · date · open portfolio · reset · clear");
      else if (c === "ls") print(present().map((f) => f.name).concat(["非存在"]).join("&nbsp;&nbsp;"));
      else if (c === "whoami") print((OS.owner || {}).handle || "guest");
      else if (c === "date") { print(new Date().toString()); print("the clock is the only thing in here that's right.", "var(--text-muted)"); }
      else if (c === "open portfolio") openApp({ kind: "portfolio" });
      else if (c === "clear") out.innerHTML = "";
      else if (c === "reset" || c === "forget") doReset();
      else if (c.startsWith("rm")) { print("you don't have to use the terminal for that.", "var(--you)"); say("resist", true); }
      else print(`zsh: command not found: ${esc(cmd)}`, "var(--text-muted)");
    };
    print("non-os 1.3 — type <b>help</b>", "var(--text-muted)");
    prompt();
  };

  /* ----- bin body ----- */
  const renderBinBody = (body) => {
    const items = [...S.deleted].map((id) => (OS.files || []).find((f) => f.id === id)).filter(Boolean);
    if (!items.length) { body.innerHTML = `<div class="bin-view"><p class="bin-empty">The Bin is empty.</p></div>`; return; }
    body.innerHTML = `<div class="bin-view"><div class="bin-list">` +
      items.map((f) => `<div class="bin-row"><span class="bg">${esc(f.glyph)}</span><span>${esc(f.name)}</span><button class="br" data-put="${esc(f.id)}">put back</button></div>`).join("") +
      `</div><div class="bin-actions"><button class="btn danger" id="binEmpty">Empty Bin</button></div></div>`;
    body.querySelector("#binEmpty").addEventListener("click", emptyBin);
    $$("[data-put]", body).forEach((b) => b.addEventListener("click", () => putBack(b.dataset.put)));
  };

  /* ========== THE OBSERVER ========== */
  const say = (key, force) => {
    const pool = ((OS.observer || {}).lines || {})[key]; if (!pool || !pool.length) return;
    const now = Date.now(), gap = (OS.observer || {}).minGapMs || 8000;
    if (!force && now - S.lastSpoke < gap) return;
    let line = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && line === S.lastLine) line = pool[(pool.indexOf(line) + 1) % pool.length];
    S.lastSpoke = now; S.lastLine = line;
    presenceEl.classList.add("awake");
    clearTimeout(presenceEl._t); presenceEl._t = setTimeout(() => presenceEl.classList.remove("awake"), 4000);
    const t = el("div", "toast", esc(line));
    const _h = $("#toasts"); _h.appendChild(t); while (_h.children.length > 3) _h.firstChild.remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 500); }, 4600);
  };
  const clearToasts = () => { $("#toasts").innerHTML = ""; };

  /* ----- idle murmur ----- */
  const resetIdle = () => {
    clearTimeout(S.idleTimer);
    S.idleTimer = setTimeout(() => {
      if (root.getAttribute("data-state") === "desktop" && !root.hasAttribute("data-archive") && Math.random() < 0.55) say("idle");
      resetIdle();
    }, (OS.observer || {}).idleMs || 45000);
  };
  ["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, resetIdle, { passive: true }));

  /* ========== THE ARCHIVE ========== */
  const openArchive = () => {
    const A = OS.archive || {};
    const wrap = $("#arWrap");
    wrap.innerHTML =
      `<p class="ar-clock">${esc(A.clockLabel || "")}</p>` +
      `<p class="ar-kicker">${esc(A.kicker || "")}</p>` +
      `<h1 class="ar-title rv">${esc(A.title || "")}</h1>` +
      `<div class="ar-intro">${(A.intro || []).map((p) => `<p class="rv">${esc(p)}</p>`).join("")}</div>` +
      `<div class="ar-sections">` +
        (A.sections || []).map((s) => `
          <section class="ar-sec rv">
            <p class="ar-sec-note">${esc(s.note || "")}</p>
            <h3>${esc(s.title || "")}</h3>
            <div class="ar-items">${(s.items || []).map((it) => `<p class="ar-item ${/^\s*\[/.test(it) ? "ph" : ""}">${esc(it)}</p>`).join("")}</div>
          </section>`).join("") +
      `</div>` +
      `<div class="ar-outro rv">${(A.outro || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>` +
      `<div class="ar-foot">` +
        `<span class="ar-reset">${esc(A.resetHint || "")}</span>` +
        `<button class="ar-back" id="arBack">← back to the desktop</button>` +
      `</div>` +
      `<div class="ar-cmd"><span>%</span><input id="arCmd" autocomplete="off" placeholder="" aria-label="command" /></div>`;
    root.setAttribute("data-archive", "");
    $("#archive").scrollTop = 0;
    setTimeout(() => say("enterArchive", true), 900);
    // reveals
    if (!reduce && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { root: $("#archive"), threshold: 0.12 });
      $$(".rv", wrap).forEach((n) => io.observe(n));
    } else { $$(".rv", wrap).forEach((n) => n.classList.add("in")); }
    $("#arBack").addEventListener("click", closeArchive);
    const cmd = $("#arCmd");
    cmd.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const v = cmd.value.trim().toLowerCase();
      if (v === "forget" || v === "reset") doReset();
      else if (v === "exit" || v === "back") closeArchive();
      else { cmd.value = ""; }
    });
  };
  const closeArchive = () => { root.removeAttribute("data-archive"); };

  /* ========== RESET ========== */
  const doReset = () => {
    confirmModal({
      title: "Reset the experience?",
      body: "The desktop, its files, and everything you've found will be put back the way it started. No page reload.",
      ok: "Reset", danger: true,
      onOk: () => {
        LS.clearArg();
        S.deleted = new Set(); S.unlocked = false; S.seedAwake = false;
        [...S.wins.keys()].forEach((k) => { const r = S.wins.get(k); r && r.win.remove(); });
        S.wins.clear();
        closeArchive(); clearToasts(); killCtx(); closeMenu();
        renderDesktop();
        $("#mbApp").textContent = "Finder";
        setTimeout(() => say("reset", true), 500);
      },
    });
  };

  /* ========== MODAL ========== */
  const confirmModal = ({ title, body, ok, danger, onOk }) => {
    const host = $("#modalHost"); host.hidden = false;
    host.innerHTML = `<div class="modal"><h3>${esc(title)}</h3><p>${esc(body)}</p><div class="modal-btns"><button class="btn ghost" id="mCancel">Cancel</button><button class="btn ${danger ? "danger" : ""}" id="mOk">${esc(ok || "OK")}</button></div></div>`;
    const close = () => { host.hidden = true; host.innerHTML = ""; };
    $("#mCancel", host).addEventListener("click", close);
    $("#mOk", host).addEventListener("click", () => { close(); onOk && onOk(); });
    host.addEventListener("click", (e) => { if (e.target === host) close(); }, { once: true });
  };

  /* ========== MENU BAR ========== */
  const mbMenu = $("#mbMenu"), mbBrand = $("#mbBrand");
  const closeMenu = () => { mbMenu.hidden = true; mbBrand.setAttribute("aria-expanded", "false"); };
  mbBrand.addEventListener("click", (e) => { e.stopPropagation(); const open = mbMenu.hidden; mbMenu.hidden = !open; mbBrand.setAttribute("aria-expanded", String(open)); });
  addEventListener("pointerdown", (e) => { if (!mbMenu.hidden && !mbMenu.contains(e.target) && e.target !== mbBrand) closeMenu(); });
  mbMenu.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    closeMenu();
    if (b.dataset.act === "reset") doReset();
    else if (b.dataset.act === "about") aboutModal();
  }));
  const aboutModal = () => {
    const host = $("#modalHost"); host.hidden = false;
    host.innerHTML = `<div class="modal"><h3>非存在 OS</h3><p>version 1.3 · the clock is current.<br/>everything else is from one day in 2004.</p><div class="modal-btns"><button class="btn" id="mOk">ok</button></div></div>`;
    const close = () => { host.hidden = true; host.innerHTML = ""; };
    $("#mOk", host).addEventListener("click", close);
    host.addEventListener("click", (e) => { if (e.target === host) close(); }, { once: true });
  };

  /* ========== CUSTOM CURSOR ========== */
  if (fine && !reduce) {
    const cur = $("#cursor"); root.classList.add("has-cursor");
    addEventListener("pointermove", (e) => { cur.classList.add("on"); cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; }, { passive: true });
    addEventListener("pointerover", (e) => cur.classList.toggle("big", !!e.target.closest("a,button,.icon,.dock-item,.win-light")));
    document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  }

  /* ========== BOOT ========== */
  function boot() {
    // restore seed state from persisted progress
    S.seedAwake = S.unlocked || allGone();
    renderDesktop();
    tickClock(); setInterval(tickClock, 15000);
    resetIdle();
  }

  // If returning visitor, we're already on the desktop.
  if (root.getAttribute("data-state") === "desktop") boot();
  else { tickClock(); }  // keep the menubar clock warm behind the lock screen
})();
