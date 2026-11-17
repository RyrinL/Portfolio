/* ============================================================
   DESKTOP STICKY NOTES: the owner's notes pinned to the desktop (the archive).
   Content: content.js -> window.OS.notes. Loads AFTER os.js.
   Rendered into #wallpaper: above the wallpaper art and the icons,
   below windows, dock and menubar. Untouched by "Reset desktop".
   Visitors can drag notes around; positions are not saved.
   ============================================================ */
(function () {
  const OS = window.OS || {};
  const notes = (Array.isArray(OS.notes) ? OS.notes : []).filter((n) => n && String(n.text || "").trim());
  const wall = document.getElementById("wallpaper");
  if (!wall || !notes.length) return;

  const root = document.documentElement;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const COLORS = ["yellow", "pink", "blue", "green"];
  const TILTS = [-3, 2.2, -1.4, 3, -2.2, 1.2];
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

  const layer = document.createElement("div");
  layer.className = "desk-notes";
  layer.setAttribute("aria-label", "Notes");

  notes.forEach((n, i) => {
    const el = document.createElement("article");
    el.className = "desk-note";
    el.setAttribute("role", "note");
    el.dataset.color = COLORS.includes(n.color) ? n.color : COLORS[i % COLORS.length];
    el.style.setProperty("--r", (num(n.rotate) ?? TILTS[i % TILTS.length]) + "deg");
    el.style.setProperty("--i", String(i));
    // default layout: columns of three down the right-hand side, filling leftwards
    const x = num(n.x) ?? 3 + Math.floor(i / 3) * 16;
    const y = num(n.y) ?? 5 + (i % 3) * 29;
    el.style.right = x + "%";
    el.style.top = y + "%";
    el.innerHTML =
      `<span class="desk-note-tape" aria-hidden="true"></span>` +
      `<p class="desk-note-text">${esc(n.text)}</p>` +
      (n.date ? `<p class="desk-note-date">${esc(n.date)}</p>` : "");
    layer.appendChild(el);
  });
  wall.appendChild(layer);

  /* ---- drag (pointer): move freely inside the desktop, last touched note on top ---- */
  let drag = null;
  let zTop = notes.length;
  layer.addEventListener("pointerdown", (e) => {
    const note = e.target.closest(".desk-note");
    if (!note || e.button !== 0) return;
    const wr = wall.getBoundingClientRect();
    const r = note.getBoundingClientRect();
    drag = { note, id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, wr, w: r.width, h: r.height };
    note.setPointerCapture(e.pointerId);
    note.classList.add("dragging");
    note.style.zIndex = String(++zTop);
    e.preventDefault();
  });
  layer.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { wr, note } = drag;
    const left = Math.max(0, Math.min(wr.width - drag.w, e.clientX - wr.left - drag.dx));
    const top = Math.max(0, Math.min(wr.height - drag.h, e.clientY - wr.top - drag.dy));
    note.style.right = "auto";
    note.style.left = left + "px";
    note.style.top = top + "px";
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.note.classList.remove("dragging");
    drag = null;
  };
  layer.addEventListener("pointerup", endDrag);
  layer.addEventListener("pointercancel", endDrag);

  /* ---- "stick" animation each time the desktop comes into view ----
     The desktop is visible when os.js says data-state="desktop" and the front is not covering it. */
  const visible = () => root.getAttribute("data-state") === "desktop" && root.getAttribute("data-front") !== "on";
  let shown = false;
  const sync = () => {
    const v = visible();
    if (v && !shown) {
      layer.classList.remove("in");
      void layer.offsetWidth;          // restart the CSS animation
      layer.classList.add("in");
    }
    shown = v;
  };
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-state", "data-front"] });
  sync();
})();
