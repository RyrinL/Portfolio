/* ============================================================
   非存在 OS — the shell that wraps the portfolio.
   States: sleep -> lock -> desktop (<-> windows) -> archive.
   Desktop is clean: apps only, draggable, on the right.
   The ARG lives in the Terminal now (ls / cat / rm), leading
   to the June-13 gate and the archive. Reset from the menu,
   the terminal, or the archive — no page refresh, ever.
   ============================================================ */
(() => {
  const OS = window.OS || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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
    get icons() { try { return JSON.parse(localStorage.getItem("nonos.icons.v2") || "null"); } catch (e) { return null; } },
    set icons(o) { try { localStorage.setItem("nonos.icons.v2", JSON.stringify(o)); } catch (e) {} },
    get gone() { try { return JSON.parse(localStorage.getItem("nonos.gone") || "[]"); } catch (e) { return []; } },
    set gone(a) { try { localStorage.setItem("nonos.gone", JSON.stringify(a)); } catch (e) {} },
    get purged() { try { return JSON.parse(localStorage.getItem("nonos.purged") || "[]"); } catch (e) { return []; } },
    set purged(a) { try { localStorage.setItem("nonos.purged", JSON.stringify(a)); } catch (e) {} },
    get date() { try { return JSON.parse(localStorage.getItem("nonos.date") || "null"); } catch (e) { return null; } },
    set date(o) { try { o ? localStorage.setItem("nonos.date", JSON.stringify(o)) : localStorage.removeItem("nonos.date"); } catch (e) {} },
    clearArg() { try { localStorage.removeItem("nonos.deleted"); localStorage.removeItem("nonos.unlocked"); localStorage.removeItem("nonos.icons.v2"); localStorage.removeItem("nonos.gone"); localStorage.removeItem("nonos.purged"); localStorage.removeItem("nonos.date"); } catch (e) {} },
  };

  // ---------- state ----------
  const S = {
    deleted: new Set(LS.deleted),
    gone: new Set(LS.gone),       // apps moved to the Bin
    purged: new Set(LS.purged),   // apps emptied out of the Bin
    sysDate: LS.date,             // date picked in the calendar (null = today)
    unlocked: LS.unlocked,
    seedAwake: false,
    iconPos: null,
    wins: new Map(),
    z: 30,
    lastSpoke: 0,
    lastLine: "",
    idleTimer: 0,
  };
  const apps = () => OS.apps || [];
  const files = () => OS.files || [];
  const fileById = (id) => files().find((f) => f.id === id);
  const deletable = () => files().filter((f) => f.deletable);
  const present = () => files().filter((f) => f.deletable && !S.deleted.has(f.id));
  const allGone = () => deletable().every((f) => S.deleted.has(f.id));
  const user = (OS.owner || {}).handle || "guest";
  const ARG = !!OS.argEnabled;   // observer, terminal files, gate
  const SECRET = OS.secret || null;

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

  // focus has to wait until the lock screen is actually visible (it fades in)
  const focusLock = () => [80, 450, 1000].forEach((t) => setTimeout(() => {
    const f = $("#lockField");
    if (f && root.getAttribute("data-state") === "lock" && document.activeElement !== f) f.focus();
  }, t));
  const wake = () => {
    const scr = $("#sleep");
    if (root.getAttribute("data-state") !== "sleep") return;
    if (reduce) { setState("lock"); focusLock(); return; }
    scr.classList.add("waking");
    const word = $("#sleepWord"), seq = ["absent", "present", "here"];
    let i = 0;
    const step = () => {
      word.textContent = seq[i]; word.classList.toggle("here", i === seq.length - 1);
      void word.offsetWidth; word.classList.add("show");
      setTimeout(() => {
        word.classList.remove("show");
        if (++i < seq.length) setTimeout(step, 160);
        else setTimeout(() => { setState("lock"); scr.classList.remove("waking"); focusLock(); }, 320);
      }, i === seq.length - 1 ? 620 : 420);
    };
    setTimeout(step, 240);
  };
  $("#sleep").addEventListener("click", wake);
  addEventListener("keydown", (e) => { if (root.getAttribute("data-state") === "sleep") { e.preventDefault(); wake(); } });

  /* ========== SIGN IN ========== */
  const owner = OS.owner || {};
  $("#avatar").textContent = owner.avatar || "·";
  $("#lockName").textContent = owner.displayName || "";
  $("#lockHint").textContent = owner.hint || "";
  const signIn = () => { if (root.getAttribute("data-state") !== "lock") return; LS.booted = true; setState("desktop"); boot(); };
  $("#lockForm").addEventListener("submit", (e) => { e.preventDefault(); signIn(); });
  // Enter signs in from anywhere on the lock screen, focused or not
  addEventListener("keydown", (e) => { if (e.key === "Enter" && root.getAttribute("data-state") === "lock" && document.activeElement !== $("#lockField")) { e.preventDefault(); signIn(); } });
  $("#avatar").addEventListener("click", signIn);

  /* ========== DESKTOP ICONS (apps, draggable, right side) ========== */
  const ICON_W = 92, deskIcons = $("#deskIcons"), presenceEl = $("#presence"), clockEl = $("#clock");
  const sysNow = () => { const n = new Date(); return S.sysDate ? new Date(S.sysDate.y, S.sysDate.m - 1, S.sysDate.d, n.getHours(), n.getMinutes()) : n; };
  const tickClock = () => { clockEl.textContent = fmtTime(sysNow(), true); };

  const defaultPos = () => {
    const pos = {}, step = 104, top = 26, rows = Math.max(1, Math.floor((innerHeight - 150) / step));
    apps().filter((a) => a.desktop !== false).forEach((a, i) => { pos[a.id] = { x: 20 + Math.floor(i / rows) * 100, y: top + (i % rows) * step }; });
    return pos;
  };
  const loadPos = () => { const p = LS.icons; return p && typeof p === "object" ? p : defaultPos(); };

  const iconMarkup = (a) => {
    const i = el("div", "icon", `<div class="icon-glyph">${esc(a.glyph)}</div><div class="icon-label">${esc(a.name)}</div>`);
    i.dataset.kind = a.kind; i.dataset.id = a.id; i.tabIndex = 0;
    if (a.kind === "bin") i.querySelector(".icon-label").insertAdjacentHTML("afterend", `<div class="icon-bin-count" id="binCount"></div>`);
    return i;
  };
  const placeIcons = () => {
    $$(".icon", deskIcons).forEach((ic) => {
      const p = (S.iconPos && S.iconPos[ic.dataset.id]) || null;
      const d = defaultPos()[ic.dataset.id] || { x: 20, y: 26 };
      const x = p ? clamp(p.x, 4, innerWidth - ICON_W - 4) : d.x;
      const y = p ? clamp(p.y, 34, innerHeight - 120) : d.y;
      ic.style.left = x + "px"; ic.style.top = y + "px";
    });
  };
  const renderDesktop = () => {
    if (!S.iconPos) S.iconPos = loadPos();
    deskIcons.innerHTML = "";
    apps().filter((a) => a.desktop !== false && !S.gone.has(a.id)).forEach((a) => deskIcons.appendChild(iconMarkup(a)));
    placeIcons(); wireIcons(); updateBinCount(); renderDock();
  };

  const renderDock = () => {
    const dock = $("#dock"); dock.innerHTML = "";
    apps().filter((a) => a.dock !== false && !S.gone.has(a.id)).forEach((a) => {
      const d = el("button", "dock-item", `${esc(a.glyph)}<span class="dot"></span><span class="dock-tip">${esc(a.name)}</span>`);
      d.dataset.kind = a.kind; d.dataset.id = a.id;
      if (S.wins.has("app:" + a.id)) d.classList.add("running");
      d.addEventListener("click", () => openApp(a));
      dock.appendChild(d);
    });
  };
  const updateBinCount = () => { const n = binItems().length, c = $("#binCount"); if (c) c.textContent = n ? n + (n === 1 ? " item" : " items") : "empty"; };

  /* ----- icon select / drag / open ----- */
  let selected = null, drag = null, suppress = false;
  const selectIcon = (i) => { if (selected) selected.classList.remove("selected"); selected = i; i && i.classList.add("selected"); };
  const openIcon = (i) => {
    if (suppress) return;
    const a = apps().find((x) => x.id === i.dataset.id); if (a) openApp(a);
  };
  const binIcon = () => deskIcons.querySelector('.icon[data-kind="bin"]');
  const overBin = (ic) => {
    const b = binIcon(); if (!b || b === ic) return false;
    const a = ic.getBoundingClientRect(), r = b.getBoundingClientRect(), cx = a.left + a.width / 2, cy = a.top + a.height / 2;
    return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;
  };
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    drag.moved = true; drag.icon.classList.add("dragging");
    const nx = clamp(drag.ox + dx, 4, innerWidth - drag.icon.offsetWidth - 4);
    const ny = clamp(drag.oy + dy, 34, innerHeight - drag.icon.offsetHeight - 4);
    drag.icon.style.left = nx + "px"; drag.icon.style.top = ny + "px";
    const b = binIcon(); if (b) b.classList.toggle("drop-target", drag.icon.dataset.kind !== "bin" && overBin(drag.icon));
  });
  document.addEventListener("pointerup", () => {
    if (!drag) return;
    const b = binIcon(); if (b) b.classList.remove("drop-target");
    if (drag.moved && drag.icon.dataset.kind !== "bin" && overBin(drag.icon)) {
      const id = drag.id; drag = null; suppress = true; setTimeout(() => (suppress = false), 40);
      trashApp(id); return;
    }
    if (drag.moved) {
      drag.icon.classList.remove("dragging");
      S.iconPos[drag.id] = { x: parseFloat(drag.icon.style.left), y: parseFloat(drag.icon.style.top) };
      LS.icons = S.iconPos; suppress = true; setTimeout(() => (suppress = false), 40);
    }
    drag = null;
  });
  const wireIcons = () => {
    $$(".icon", deskIcons).forEach((i) => {
      i.addEventListener("pointerdown", (e) => {
        if (e.button === 2) return;
        selectIcon(i);
        drag = { icon: i, id: i.dataset.id, sx: e.clientX, sy: e.clientY, ox: i.offsetLeft, oy: i.offsetTop, moved: false };
      });
      if (fine) i.addEventListener("dblclick", () => openIcon(i));
      else i.addEventListener("click", () => openIcon(i));
      i.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); openIcon(i); }
        if ((e.key === "Delete" || e.key === "Backspace") && i.dataset.kind !== "bin") { e.preventDefault(); trashApp(i.dataset.id); }
      });
      i.addEventListener("contextmenu", (e) => { e.preventDefault(); selectIcon(i); showCtx(e.clientX, e.clientY, i); });
    });
  };
  addEventListener("resize", () => {
    if (root.getAttribute("data-state") !== "desktop") return;
    $$(".icon", deskIcons).forEach((ic) => {
      const x = clamp(ic.offsetLeft, 4, innerWidth - ic.offsetWidth - 4), y = clamp(ic.offsetTop, 34, innerHeight - ic.offsetHeight - 4);
      ic.style.left = x + "px"; ic.style.top = y + "px"; S.iconPos[ic.dataset.id] = { x, y };
    });
    LS.icons = S.iconPos;
  });

  /* ----- context menu ----- */
  let ctx = null;
  const killCtx = () => { if (ctx) { ctx.remove(); ctx = null; } };
  const showCtx = (x, y, i) => {
    killCtx();
    const kind = i.dataset.kind;
    const m = el("div", "ctx");
    const add = (label, fn, dis) => { const b = el("button", null, esc(label)); if (dis) b.disabled = true; else b.addEventListener("click", () => { killCtx(); fn(); }); m.appendChild(b); };
    add("Open", () => openIcon(i));
    if (kind !== "bin") add("Move to Bin", () => trashApp(i.dataset.id));
    if (kind === "bin" && binItems().length) add("Empty Bin…", emptyBin);
    document.body.appendChild(m);
    ctx = m;
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
    m.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  };
  addEventListener("pointerdown", (e) => { if (ctx && !ctx.contains(e.target)) killCtx(); }, true);

  /* ----- delete / resist (driven by the terminal now) ----- */
  const moveToBin = (id) => {
    const f = fileById(id); if (!f || !f.deletable || S.deleted.has(id)) return false;
    const first = S.deleted.size === 0;
    S.deleted.add(id); LS.deleted = [...S.deleted];
    say(first ? "firstDelete" : "delete");
    updateBinCount(); refreshBin(); checkProgress();
    return true;
  };
  const binItems = () => {
    const list = apps().filter((a) => S.gone.has(a.id) && !S.purged.has(a.id)).map((a) => ({ id: a.id, name: a.name, glyph: a.glyph, type: "app" }));
    if (ARG) [...S.deleted].map(fileById).filter(Boolean).forEach((f) => list.push({ id: f.id, name: f.name, glyph: f.glyph, type: "file" }));
    return list;
  };
  const trashApp = (id) => {
    const a = apps().find((x) => x.id === id); if (!a || a.kind === "bin" || S.gone.has(id)) return;
    if (S.wins.has("app:" + id)) closeWin("app:" + id);
    S.gone.add(id); LS.gone = [...S.gone];
    if (selected && selected.dataset.id === id) selected = null;
    renderDesktop(); refreshBin(); checkSecret();
  };
  const checkSecret = () => {
    if (!SECRET || root.hasAttribute("data-archive")) return;
    const empty = apps().filter((a) => a.kind !== "bin").every((a) => S.gone.has(a.id));
    const d = sysNow();
    if (empty && d.getMonth() + 1 === SECRET.month && d.getDate() === SECRET.day) setTimeout(openArchive, 700);
  };
  const putBack = (id, type) => {
    if (type === "app") { S.gone.delete(id); LS.gone = [...S.gone]; renderDesktop(); refreshBin(); return; }
    S.deleted.delete(id); LS.deleted = [...S.deleted];
    if (S.seedAwake && !allGone()) S.seedAwake = false;
    updateBinCount(); refreshBin();
  };
  const emptyBin = () => {
    confirmModal({ title: "Empty the Bin?", body: "These items are removed until you reset the desktop from the menu.", ok: "Empty Bin", danger: true,
      onOk: () => { S.gone.forEach((id) => S.purged.add(id)); LS.purged = [...S.purged]; say("emptyBin", true); refreshBin(); updateBinCount(); } });
  };
  const refreshBin = () => { updateBinCount(); const w = S.wins.get("app:bin"); if (w) renderBinBody(w.win.querySelector(".win-body")); };
  const checkProgress = () => {
    if (allGone() && !S.seedAwake) { S.seedAwake = true; setTimeout(() => say("seedWake", true), 700); }
  };

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
    const W = Math.min(w, vw * 0.94), H = Math.min(h, vh - 190);   // keep clear of the dock
    const off = (S.wins.size % 5) * 26;
    const win = el("div", "win" + (cls ? " " + cls : ""));
    win.dataset.appname = appname || title;
    win.style.width = W + "px"; win.style.height = H + "px";
    win.style.left = Math.max(10, Math.min(vw - W - 10, (vw - W) / 2 + 60 + off)) + "px";
    win.style.top = Math.max(44, Math.min(vh - H - 100, (vh - 90 - H) / 2 + 10 + off)) + "px";
    win.innerHTML =
      `<div class="win-bar"><div class="win-lights">` +
      `<button class="win-light close" aria-label="Close"></button>` +
      `<button class="win-light min" aria-label="Minimize"></button>` +
      `<button class="win-light zoom" aria-label="Zoom"></button></div>` +
      `<span class="win-icon">${esc(glyph || "")}</span><span class="win-title">${esc(title)}</span></div>` +
      `<div class="win-body"></div>`;
    $("#windows").appendChild(win);
    S.wins.set(key, { win, minimized: false });
    win.querySelector(".win-light.close").addEventListener("click", () => closeWin(key));
    win.querySelector(".win-light.min").addEventListener("click", () => minWin(key));
    win.querySelector(".win-light.zoom").addEventListener("click", () => zoomWin(win));
    win.addEventListener("pointerdown", () => focusWin(win));
    dragWin(win, win.querySelector(".win-bar"));
    focusWin(win); renderDock();
    return win;
  };
  const zoomWin = (win) => {
    if (win.dataset.zoomed) { win.style.left = win.dataset.ol; win.style.top = win.dataset.ot; win.style.width = win.dataset.ow; win.style.height = win.dataset.oh; delete win.dataset.zoomed; }
    else { win.dataset.ol = win.style.left; win.dataset.ot = win.style.top; win.dataset.ow = win.style.width; win.dataset.oh = win.style.height; win.dataset.zoomed = "1";
      win.style.left = "2vw"; win.style.top = "calc(var(--menubar-h) + 8px)"; win.style.width = "96vw"; win.style.height = "calc(100vh - var(--menubar-h) - 24px)"; }
  };
  const dragWin = (win, bar) => {
    let sx, sy, ox, oy, on = false;
    bar.addEventListener("pointerdown", (e) => { if (e.target.closest(".win-light")) return; on = true; sx = e.clientX; sy = e.clientY; ox = win.offsetLeft; oy = win.offsetTop; bar.setPointerCapture(e.pointerId); });
    bar.addEventListener("pointermove", (e) => { if (!on) return; win.style.left = (ox + e.clientX - sx) + "px"; win.style.top = Math.max(32, oy + e.clientY - sy) + "px"; });
    bar.addEventListener("pointerup", () => { on = false; });
    bar.addEventListener("pointercancel", () => { on = false; });
  };

  /* ========== OPENERS ========== */
  const PF = { "pf-projects": ["Projects", 960, "projects"], "pf-about": ["About", 860, "about"], "pf-experience": ["Experience", 800, "experience"] };
  const appByKind = (k) => apps().find((x) => x.kind === k);
  const downloadCV = () => {
    const url = (window.PORTFOLIO || {}).resumeUrl; if (!url) return;
    const a = document.createElement("a"); a.href = url; a.download = url.split("/").pop();
    document.body.appendChild(a); a.click(); a.remove();
  };
  const openApp = (a) => {
    if (!a) return;
    if (PF[a.kind]) {
      const [title, w, sec] = PF[a.kind];
      const win = makeWindow("app:" + a.id, { title, glyph: a.glyph, appname: title, w, h: innerHeight * 0.8 });
      if (win && window.Portfolio) window.Portfolio.render(win.querySelector(".win-body"), sec);
    } else if (a.kind === "download") {
      downloadCV();
    } else if (a.kind === "terminal") {
      const win = makeWindow("app:terminal", { title: "terminal — zsh", glyph: "›_", appname: "Terminal", w: 620, h: 420 });
      if (win) renderTerminal(win.querySelector(".win-body"));
    } else if (a.kind === "bin") {
      const win = makeWindow("app:bin", { title: "Bin", glyph: "⌫", appname: "Bin", w: 500, h: 440 });
      if (win) renderBinBody(win.querySelector(".win-body"));
    }
  };
  const openFileViewer = (f) => {
    const mono = f.kind === "text" || f.id === "log0613";
    const win = makeWindow("file:" + f.id, { title: f.name, glyph: f.glyph, appname: f.name, w: 560, h: 420 });
    if (win) win.querySelector(".win-body").innerHTML = `<div class="viewer ${mono ? "v-mono" : ""}"><p class="v-meta">${esc(f.meta || f.kind)}</p>${(f.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
  };

  /* ----- the gate (reached from the terminal) ----- */
  const openGate = () => {
    if (!ARG) return;
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
      if ((a.keyDigits || []).includes(digits)) {
        S.unlocked = true; LS.unlocked = true; say("unlocked", true); closeWin("file:seed"); setTimeout(openArchive, 260);
      } else { field.classList.remove("wrong"); void field.offsetWidth; field.classList.add("wrong"); field.value = ""; say("wrongKey", true); }
    });
  };

  /* ----- terminal (usable: history, tab completion, open, focus) ----- */
  const renderTerminal = (body) => {
    body.classList.add("term");
    body.innerHTML = `<div class="term-out" id="termOut"></div><div class="term-line"><span class="term-ps">${esc(user)}@non ~ %</span><input class="term-in" id="termIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="terminal input" /></div>`;
    const out = $("#termOut", body), inp = $("#termIn", body);
    const hist = []; let hi = 0;
    const echo = (html, cls) => { const d = el("div", "term-row" + (cls ? " " + cls : ""), html); out.appendChild(d); out.scrollTop = out.scrollHeight; };
    const ps = `<span class="term-ps">${esc(user)}@non ~ %</span>`;
    const findFile = (tok) => { if (!ARG) return null; tok = (tok || "").toLowerCase(); return files().find((f) => f.name.toLowerCase() === tok); };
    const appAlias = { projects: "pf-projects", "projects.app": "pf-projects", about: "pf-about", "about.app": "pf-about",
      experience: "pf-experience", "experience.app": "pf-experience", cv: "download", "cv.pdf": "download", resume: "download", bin: "bin", terminal: "terminal" };
    const CMDS = ["help", "ls", "open", "whoami", "date", "pwd", "echo", "clear", "reset"].concat(ARG ? ["cat", "rm"] : []);

    const run = (raw) => {
      const line = raw.trim(); if (!line) return;
      const [cmd, ...rest] = line.split(/\s+/); const arg = rest.join(" "); const c = cmd.toLowerCase(); const t = arg.toLowerCase();
      if (c === "help") {
        echo("apps&nbsp;&nbsp;&nbsp;<b>open</b> projects · about · experience · cv");
        echo(ARG ? "files&nbsp;&nbsp;<b>ls</b> · <b>ls -a</b> · <b>cat</b> &lt;file&gt; · <b>rm</b> &lt;file&gt;" : "files&nbsp;&nbsp;<b>ls</b>");
        echo("system <b>whoami</b> · <b>date</b> · <b>pwd</b> · <b>echo</b> · <b>clear</b> · <b>reset</b>");
        echo("keys&nbsp;&nbsp;&nbsp;<b>tab</b> completes · <b>↑ ↓</b> history · <b>ctrl+l</b> clears", "term-dim");
      } else if (c === "ls") {
        const names = ["projects.app", "about.app", "experience.app", "cv.pdf"];
        if (ARG) { present().forEach((f) => names.push(f.name)); if (rest.some((r) => /^-\w*a/.test(r)) && !S.unlocked) names.push("非存在"); }
        echo(names.map(esc).join("&nbsp;&nbsp;&nbsp;"));
      } else if (c === "cat") {
        if (appAlias[t]) echo(`cat: ${esc(arg)}: not a text file. try <b>open ${esc(arg)}</b>`, "term-dim");
        else if (!ARG) echo(`zsh: command not found: cat`, "term-dim");
        else {
          const f = findFile(arg);
          if (!f) echo(`cat: ${esc(arg || "")}: No such file`, "term-dim");
          else if (S.deleted.has(f.id)) echo(`cat: ${esc(arg)}: in the Bin`, "term-dim");
          else (f.body || []).forEach((p) => echo(esc(p), "term-dim"));
        }
      } else if (c === "rm") {
        if (!ARG) { echo(`zsh: command not found: rm`, "term-dim"); return; }
        const f = findFile(arg);
        if (rest.includes("-rf") || arg === "*") { echo("you don't have to force it.", "term-you"); say("resist", true); }
        else if (!f) echo(`rm: ${esc(arg || "")}: No such file`, "term-dim");
        else if (f.resists) { echo(`rm: ${esc(f.name)}: still in use`, "term-you"); say("resist", true); if (allGone()) echo("it won't delete. maybe it opens instead →  open 非存在", "term-dim"); }
        else if (S.deleted.has(f.id)) echo(`rm: ${esc(arg)}: already gone`, "term-dim");
        else { moveToBin(f.id); echo(`moved ${esc(f.name)} to Bin`, "term-dim"); if (allGone()) echo("the desktop is empty now. something is still open.", "term-dim"); }
      } else if (c === "open") {
        if (ARG && ["archive", "非存在", ".archive", "非"].includes(t)) openGate();
        else if (appAlias[t]) {
          if (t === "terminal") return;
          const a = appByKind(appAlias[t]); openApp(a);
          if (a && a.kind === "download") echo("downloading cv.pdf…", "term-dim");
        } else { const f = findFile(arg); if (f && !S.deleted.has(f.id)) openFileViewer(f); else echo(`open: ${esc(arg || "")}: not found. try <b>ls</b>`, "term-dim"); }
      } else if (c === "whoami") echo(esc(user));
      else if (c === "pwd") echo(`/Users/${esc(user)}`);
      else if (c === "date") { echo(esc(sysNow().toString())); if (ARG) echo("the clock is the only thing in here that's right.", "term-dim"); }
      else if (c === "echo") echo(esc(arg));
      else if (c === "clear") out.innerHTML = "";
      else if (c === "reset" || (ARG && c === "forget")) doReset();
      else if (c === "sudo") echo("nice try.", "term-you");
      else echo(`zsh: command not found: ${esc(cmd)}`, "term-dim");
    };

    const complete = () => {
      const v = inp.value, sp = v.indexOf(" ");
      const pre = sp === -1 ? "" : v.slice(0, sp + 1), part = (sp === -1 ? v : v.slice(sp + 1)).toLowerCase();
      const pool = pre ? ["projects", "about", "experience", "cv"].concat(ARG ? present().map((f) => f.name) : []) : CMDS;
      const hit = pool.filter((x) => x.toLowerCase().startsWith(part));
      if (hit.length === 1) inp.value = pre + hit[0] + (pre ? "" : " ");
      else if (hit.length > 1) echo(hit.map(esc).join("&nbsp;&nbsp;&nbsp;"), "term-dim");
    };

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { const v = inp.value; echo(`${ps} ${esc(v)}`, "term-cmd"); if (v.trim()) hist.push(v); hi = hist.length; inp.value = ""; run(v); }
      else if (e.key === "Tab") { e.preventDefault(); complete(); }
      else if (e.key === "ArrowUp") { if (hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi] || ""; e.preventDefault(); const p = inp.value.length; requestAnimationFrame(() => inp.setSelectionRange(p, p)); } }
      else if (e.key === "ArrowDown") { if (hist.length) { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; e.preventDefault(); } }
      else if (e.key === "l" && e.ctrlKey) { out.innerHTML = ""; e.preventDefault(); }
    });
    body.addEventListener("pointerdown", (e) => { if (!e.target.closest("a,button")) setTimeout(() => inp.focus(), 0); });
    echo("non-os 1.4  ·  type <b>help</b>  ·  <b>tab</b> completes", "term-dim");
    setTimeout(() => inp.focus(), 60);
  };

  /* ----- bin ----- */
  const renderBinBody = (body) => {
    const items = binItems();
    if (!items.length) { body.innerHTML = `<div class="bin-view"><p class="bin-empty">The Bin is empty.</p></div>`; return; }
    body.innerHTML = `<div class="bin-view"><div class="bin-list">` +
      items.map((f) => `<div class="bin-row"><span class="bg">${esc(f.glyph)}</span><span class="bn">${esc(f.name)}</span><button class="br" data-put="${esc(f.id)}" data-type="${f.type}">Put back</button></div>`).join("") +
      `</div><div class="bin-actions"><button class="btn danger" id="binEmpty">Empty Bin</button></div></div>`;
    body.querySelector("#binEmpty").addEventListener("click", emptyBin);
    $$("[data-put]", body).forEach((b) => b.addEventListener("click", () => putBack(b.dataset.put, b.dataset.type)));
  };

  /* ========== THE OBSERVER ========== */
  const say = (key, force) => {
    if (!ARG) return;
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
  const resetIdle = () => {
    clearTimeout(S.idleTimer);
    S.idleTimer = setTimeout(() => {
      if (root.getAttribute("data-state") === "desktop" && !root.hasAttribute("data-archive") && Math.random() < 0.5) say("idle");
      resetIdle();
    }, (OS.observer || {}).idleMs || 45000);
  };
  ["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, resetIdle, { passive: true }));

  /* ========== THE ARCHIVE ========== */
  const openArchive = () => {
    const A = OS.archive || {}, wrap = $("#arWrap");
    wrap.innerHTML =
      `<p class="ar-clock">${esc(A.clockLabel || "")}</p>` +
      `<p class="ar-kicker">${esc(A.kicker || "")}</p>` +
      `<h1 class="ar-title rv">${esc(A.title || "")}</h1>` +
      `<div class="ar-intro">${(A.intro || []).map((p) => `<p class="rv">${esc(p)}</p>`).join("")}</div>` +
      `<div class="ar-sections">` +
        (A.sections || []).map((s) => `<section class="ar-sec rv"><p class="ar-sec-note">${esc(s.note || "")}</p><h3>${esc(s.title || "")}</h3><div class="ar-items">${(s.items || []).map((it) => `<p class="ar-item ${/^\s*\[/.test(it) ? "ph" : ""}">${esc(it)}</p>`).join("")}</div></section>`).join("") +
      `</div>` +
      `<div class="ar-outro rv">${(A.outro || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>` +
      `<div class="ar-foot"><span class="ar-reset">${esc(A.resetHint || "")}</span><button class="ar-back" id="arBack">← back to the desktop</button></div>` +
      `<div class="ar-cmd"><span>%</span><input id="arCmd" autocomplete="off" aria-label="command" /></div>`;
    root.setAttribute("data-archive", ""); $("#archive").scrollTop = 0;
    setTimeout(() => say("enterArchive", true), 900);
    if (!reduce && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { root: $("#archive"), threshold: 0.12 });
      $$(".rv", wrap).forEach((n) => io.observe(n));
    } else $$(".rv", wrap).forEach((n) => n.classList.add("in"));
    $("#arBack").addEventListener("click", closeArchive);
    const cmd = $("#arCmd");
    cmd.addEventListener("keydown", (e) => { if (e.key !== "Enter") return; const v = cmd.value.trim().toLowerCase(); if (v === "forget" || v === "reset") doReset(); else if (v === "exit" || v === "back") closeArchive(); else cmd.value = ""; });
  };
  const closeArchive = () => root.removeAttribute("data-archive");

  /* ========== RESET ========== */
  const doReset = () => {
    confirmModal({ title: ARG ? "Reset the experience?" : "Reset the desktop?", body: ARG ? "The desktop, its files, icon positions, and everything you've found go back to the start. No page reload." : "Apps, icon positions, the date, and open windows go back to the start. No page reload.", ok: "Reset", danger: true,
      onOk: () => {
        LS.clearArg();
        S.deleted = new Set(); S.gone = new Set(); S.purged = new Set(); S.sysDate = null; S.unlocked = false; S.seedAwake = false; closeCal(); tickClock(); S.iconPos = defaultPos(); LS.icons = S.iconPos;
        [...S.wins.keys()].forEach((k) => { const r = S.wins.get(k); r && r.win.remove(); }); S.wins.clear();
        closeArchive(); clearToasts(); killCtx(); closeMenu();
        renderDesktop(); $("#mbApp").textContent = "Finder";
        setTimeout(() => say("reset", true), 500);
      } });
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

  /* ========== CALENDAR (click the clock) ========== */
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let cal = null, calView = null;
  const closeCal = () => { if (cal) { cal.remove(); cal = null; } };
  const setSysDate = (y, m, d) => {
    const t = new Date();
    S.sysDate = (y === t.getFullYear() && m === t.getMonth() + 1 && d === t.getDate()) ? null : { y, m, d };
    LS.date = S.sysDate; tickClock(); checkSecret();
  };
  const renderCal = () => {
    const { y, m } = calView, first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate(), lead = (first.getDay() + 6) % 7;
    const cur = sysNow(), today = new Date();
    let cells = ""; for (let i = 0; i < lead; i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const sel = cur.getFullYear() === y && cur.getMonth() + 1 === m && cur.getDate() === d;
      const tod = today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d;
      cells += `<button class="cal-d${sel ? " sel" : ""}${tod ? " today" : ""}" data-d="${d}">${d}</button>`;
    }
    cal.innerHTML =
      `<div class="cal-head"><button class="cal-nav" data-nav="-12" aria-label="Previous year">«</button><button class="cal-nav" data-nav="-1" aria-label="Previous month">‹</button>` +
      `<span class="cal-title">${MONTHS[m - 1]} ${y}</span>` +
      `<button class="cal-nav" data-nav="1" aria-label="Next month">›</button><button class="cal-nav" data-nav="12" aria-label="Next year">»</button></div>` +
      `<div class="cal-wk">${["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => `<span>${w}</span>`).join("")}</div>` +
      `<div class="cal-grid">${cells}</div><div class="cal-foot"><button class="cal-today">Today</button></div>`;
    $$("[data-nav]", cal).forEach((b) => b.addEventListener("click", () => {
      const mm = calView.m - 1 + Number(b.dataset.nav);
      calView = { y: calView.y + Math.floor(mm / 12), m: ((mm % 12) + 12) % 12 + 1 }; renderCal();
    }));
    $$(".cal-d", cal).forEach((b) => b.addEventListener("click", () => { setSysDate(calView.y, calView.m, Number(b.dataset.d)); renderCal(); }));
    $(".cal-today", cal).addEventListener("click", () => { const t = new Date(); calView = { y: t.getFullYear(), m: t.getMonth() + 1 }; setSysDate(calView.y, calView.m, t.getDate()); renderCal(); });
  };
  const openCal = () => {
    if (cal) { closeCal(); return; }
    const c = sysNow(); calView = { y: c.getFullYear(), m: c.getMonth() + 1 };
    cal = el("div", "cal"); $("#menubar").appendChild(cal); renderCal();
  };
  clockEl.setAttribute("role", "button"); clockEl.tabIndex = 0; clockEl.setAttribute("aria-label", "Calendar");
  clockEl.addEventListener("click", (e) => { e.stopPropagation(); openCal(); });
  clockEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCal(); } });
  addEventListener("pointerdown", (e) => { if (cal && !cal.contains(e.target) && e.target !== clockEl) closeCal(); });

  /* ========== MENU BAR ========== */
  const mbMenu = $("#mbMenu"), mbBrand = $("#mbBrand");
  mbMenu.querySelector("[data-act=reset]").textContent = ARG ? "Reset experience…" : "Reset desktop…";
  const closeMenu = () => { mbMenu.hidden = true; mbBrand.setAttribute("aria-expanded", "false"); };
  mbBrand.addEventListener("click", (e) => { e.stopPropagation(); const open = mbMenu.hidden; mbMenu.hidden = !open; mbBrand.setAttribute("aria-expanded", String(open)); });
  addEventListener("pointerdown", (e) => { if (!mbMenu.hidden && !mbMenu.contains(e.target) && e.target !== mbBrand) closeMenu(); });
  mbMenu.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { closeMenu(); if (b.dataset.act === "reset") doReset(); else if (b.dataset.act === "about") aboutModal(); }));
  const aboutModal = () => {
    const host = $("#modalHost"); host.hidden = false;
    host.innerHTML = `<div class="modal"><h3>非存在 OS</h3><p>${ARG ? "version 1.4 · the clock is current.<br/>everything else is from one day in 2004." : "version 1.4 · hand-built, no framework."}</p><div class="modal-btns"><button class="btn" id="mOk">ok</button></div></div>`;
    const close = () => { host.hidden = true; host.innerHTML = ""; };
    $("#mOk", host).addEventListener("click", close);
    host.addEventListener("click", (e) => { if (e.target === host) close(); }, { once: true });
  };

  /* ========== WALLPAPER (generated) ========== */
  // An eclipse — two discs, you and me — hanging over a dark horizon.
  // The left third stays quiet so the icons read cleanly.
  const buildWallpaper = () => {
    let seed = 20040613;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    let stars = "";
    for (let i = 0; i < 90; i++) {
      const x = 380 + rnd() * 1220, y = rnd() * 640, r = (0.5 + rnd() * 0.9).toFixed(2), o = (0.04 + rnd() * 0.16 * (1 - y / 700)).toFixed(3);
      stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#e8ddd5" fill-opacity="${o}"/>`;
    }
    let rings = "";
    for (let i = 0; i < 6; i++) rings += `<circle cx="1150" cy="430" r="${250 + i * 78}" stroke="#e8ddd5" stroke-opacity="${(0.032 - i * 0.004).toFixed(3)}"/>`;
    return `<svg class="wp-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>` +
      `<linearGradient id="wgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c0b11"/><stop offset="70%" stop-color="#0a0809"/><stop offset="100%" stop-color="#060405"/></linearGradient>` +
      `<radialGradient id="wgGlow" cx="72%" cy="43%" r="38%"><stop offset="0%" stop-color="#c9704a" stop-opacity="0.13"/><stop offset="55%" stop-color="#4a6bc9" stop-opacity="0.05"/><stop offset="100%" stop-color="#4a6bc9" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="wgYou" cx="40%" cy="40%" r="70%"><stop offset="0%" stop-color="#d98a62" stop-opacity="0.30"/><stop offset="100%" stop-color="#c9704a" stop-opacity="0.06"/></radialGradient>` +
      `<radialGradient id="wgMe" cx="60%" cy="60%" r="70%"><stop offset="0%" stop-color="#6a86d6" stop-opacity="0.22"/><stop offset="100%" stop-color="#4a6bc9" stop-opacity="0.04"/></radialGradient>` +
      `<linearGradient id="wgSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c9704a" stop-opacity="0.05"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="wgLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#050405" stop-opacity="0.65"/><stop offset="35%" stop-color="#050405" stop-opacity="0"/></linearGradient>` +
      `<radialGradient id="wgVig" cx="55%" cy="45%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.55"/></radialGradient>` +
      `<filter id="wgBlur"><feGaussianBlur stdDeviation="2"/></filter></defs>` +
      `<rect width="1600" height="1000" fill="url(#wgSky)"/>` +
      `<g>${stars}</g>` +
      `<rect width="1600" height="1000" fill="url(#wgGlow)"/>` +
      `<g fill="none" stroke-width="1">${rings}</g>` +
      `<g filter="url(#wgBlur)"><circle cx="1110" cy="410" r="150" fill="url(#wgYou)"/><circle cx="1190" cy="455" r="150" fill="url(#wgMe)"/></g>` +
      `<text x="1150" y="505" text-anchor="middle" font-family="'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" font-weight="700" font-size="200" fill="#ffffff" fill-opacity="0.035">非</text>` +
      `<rect y="720" width="1600" height="280" fill="url(#wgSea)"/>` +
      `<line x1="0" y1="720" x2="1600" y2="720" stroke="#e8ddd5" stroke-opacity="0.07"/>` +
      `<g stroke="#c9704a" stroke-opacity="0.07">` +
        `<line x1="1080" y1="736" x2="1220" y2="736"/><line x1="1105" y1="752" x2="1195" y2="752"/><line x1="1125" y1="770" x2="1175" y2="770"/></g>` +
      `<rect width="1600" height="1000" fill="url(#wgLeft)"/>` +
      `<rect width="1600" height="1000" fill="url(#wgVig)"/></svg>`;
  };

  /* ========== CUSTOM CURSOR ========== */
  if (fine && !reduce) {
    const cur = $("#cursor"); root.classList.add("has-cursor");
    addEventListener("pointermove", (e) => { cur.classList.add("on"); cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; }, { passive: true });
    addEventListener("pointerover", (e) => cur.classList.toggle("big", !!e.target.closest("a,button,.icon,.dock-item,.win-light")));
    document.addEventListener("pointerleave", () => cur.classList.remove("on"));
  }

  /* ========== BOOT ========== */
  let wallpaperDone = false;
  function boot() {
    if (!wallpaperDone) { $("#wallpaper").insertAdjacentHTML("afterbegin", buildWallpaper()); wallpaperDone = true; }
    S.iconPos = loadPos();
    S.seedAwake = S.unlocked || allGone();
    renderDesktop();
    tickClock(); setInterval(tickClock, 15000);
    resetIdle();
  }

  if (root.getAttribute("data-state") === "desktop") boot();
  else tickClock();
})();
