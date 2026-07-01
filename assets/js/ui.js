/* ============================================================
   ui.js — shared UI helpers across all pages
   window.UI : icons, toasts, modal, confirm, theme, sidebar, format
   ============================================================ */
(function () {
  "use strict";

  /* ---- icon helper: replace <i data-icon="name"> with svg ---- */
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      if (el.dataset.hydrated) return;
      var size = parseInt(el.getAttribute("data-size") || "0", 10) || 18;
      el.innerHTML = window.Icons.svg(el.getAttribute("data-icon"), { size: size });
      el.style.display = "inline-flex";
      el.dataset.hydrated = "1";
    });
  }

  /* ---- format helpers ---- */
  function fmtDate(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  function fmtRelative(ts) {
    if (!ts) return "—";
    var diff = Date.now() - ts, m = 60000, h = 3600000, day = 86400000;
    if (diff < m) return "just now";
    if (diff < h) return Math.floor(diff / m) + "m ago";
    if (diff < day) return Math.floor(diff / h) + "h ago";
    if (diff < day * 7) return Math.floor(diff / day) + "d ago";
    return fmtDate(ts);
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---- toast ---- */
  function ensureToastRegion() {
    var r = document.querySelector(".toast-region");
    if (!r) { r = document.createElement("div"); r.className = "toast-region"; document.body.appendChild(r); }
    return r;
  }
  function toast(opts) {
    if (typeof opts === "string") opts = { title: opts };
    var type = opts.type || "info";
    var iconMap = { success: "checkCircle", warning: "alert", danger: "alert", info: "info" };
    var region = ensureToastRegion();
    var el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.innerHTML =
      '<span class="ti">' + window.Icons.svg(iconMap[type], { size: 18 }) + '</span>' +
      '<div class="toast-body"><div class="toast-title">' + escapeHtml(opts.title || "") + "</div>" +
      (opts.desc ? '<div class="toast-desc">' + escapeHtml(opts.desc) + "</div>" : "") + "</div>";
    region.appendChild(el);
    var ttl = opts.duration || 3200;
    var timer = setTimeout(close, ttl);
    function close() { clearTimeout(timer); el.classList.add("is-leaving"); setTimeout(function () { el.remove(); }, 180); }
    el.addEventListener("click", close);
    return close;
  }

  /* ---- modal / confirm ---- */
  function modal(opts) {
    var scrim = document.createElement("div");
    scrim.className = "modal-scrim";
    var fields = opts.fields || [];
    var fieldsHtml = fields.map(function (f) {
      if (f.type === "textarea") {
        return '<div class="field"><label class="field-label">' + escapeHtml(f.label) + '</label>' +
          '<textarea class="textarea" data-field="' + f.name + '" placeholder="' + escapeHtml(f.placeholder || "") + '">' + escapeHtml(f.value || "") + "</textarea></div>";
      }
      return '<div class="field"><label class="field-label">' + escapeHtml(f.label) + '</label>' +
        '<input class="input" data-field="' + f.name + '" value="' + escapeHtml(f.value || "") + '" placeholder="' + escapeHtml(f.placeholder || "") + '"></div>';
    }).join("");
    var confirmClass = opts.danger ? "btn--danger" : "btn--primary";
    scrim.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<div class="modal-head"><h3>' + escapeHtml(opts.title || "") + "</h3>" +
          (opts.message ? "<p>" + escapeHtml(opts.message) + "</p>" : "") + "</div>" +
        (fieldsHtml ? '<div class="modal-body">' + fieldsHtml + "</div>" : '<div style="height:8px"></div>') +
        '<div class="modal-foot">' +
          '<button class="btn btn--ghost" data-act="cancel">' + escapeHtml(opts.cancelText || "Cancel") + "</button>" +
          '<button class="btn ' + confirmClass + '" data-act="ok">' + escapeHtml(opts.confirmText || "Confirm") + "</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(scrim);
    requestAnimationFrame(function () { scrim.classList.add("is-open"); });
    var firstInput = scrim.querySelector("[data-field]");
    if (firstInput) setTimeout(function () { firstInput.focus(); firstInput.select && firstInput.select(); }, 60);

    function collect() {
      var data = {};
      scrim.querySelectorAll("[data-field]").forEach(function (i) { data[i.getAttribute("data-field")] = i.value.trim(); });
      return data;
    }
    function destroy() { scrim.classList.remove("is-open"); setTimeout(function () { scrim.remove(); }, 200); document.removeEventListener("keydown", onKey); }
    function done(ok) { if (ok && opts.onConfirm) { var r = opts.onConfirm(collect()); if (r === false) return; } if (!ok && opts.onCancel) opts.onCancel(); destroy(); }
    function onKey(e) { if (e.key === "Escape") done(false); if (e.key === "Enter" && fields.length) done(true); }
    scrim.querySelector('[data-act="ok"]').addEventListener("click", function () { done(true); });
    scrim.querySelector('[data-act="cancel"]').addEventListener("click", function () { done(false); });
    scrim.addEventListener("mousedown", function (e) { if (e.target === scrim) done(false); });
    document.addEventListener("keydown", onKey);
    return { close: destroy };
  }
  function confirm(opts) {
    return modal({
      title: opts.title, message: opts.message, danger: opts.danger,
      confirmText: opts.confirmText || "Confirm", cancelText: opts.cancelText || "Cancel",
      onConfirm: opts.onConfirm, onCancel: opts.onCancel
    });
  }

  /* ---- theme ---- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme || "dark");
  }
  function initTheme() {
    applyTheme(window.Store ? window.Store.getSettings().theme : "dark");
  }
  function toggleTheme() {
    var cur = window.Store.getSettings().theme;
    var next = cur === "dark" ? "light" : "dark";
    window.Store.setSettings({ theme: next });
    applyTheme(next);
    return next;
  }

  /* ---- auth guard ---- */
  function requireAuth() {
    if (!window.Store.isAuthed()) { location.href = "index.html"; return false; }
    return true;
  }
  function logout() {
    window.Store.clearSession();
    location.href = "index.html";
  }

  /* ---- sidebar builder (shared shell) ----
     active: 'dashboard'|'projects'|'recent'|'templates'|'settings' */
  function buildSidebar(active) {
    var items = [
      { key: "dashboard", label: "Dashboard", icon: "grid", href: "dashboard.html" },
      { key: "projects",  label: "Projects",  icon: "folder", href: "dashboard.html#projects" },
      { key: "templates", label: "Templates", icon: "layout", href: "dashboard.html#templates" },
      { key: "settings",  label: "Settings",  icon: "settings", href: "settings.html" }
    ];
    var s = window.Store.getSettings();
    var navItems = items.map(function (it) {
      var count = "";
      if (it.key === "projects") count = '<span class="nav-count">' + window.Store.getProjects().length + "</span>";
      return '<a class="nav-item' + (active === it.key ? " is-active" : "") + '" href="' + it.href + '">' +
        '<i data-icon="' + it.icon + '"></i>' + it.label + count + "</a>";
    }).join("");
    var initials = (s.fullName || "Skytek").split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
    var html =
      '<aside class="sidebar" id="appSidebar">' +
        '<div class="sidebar-brand">' +
          '<div class="brand-mark">' + window.Icons.svg("tag", { size: 21, stroke: "#fff" }) + "</div>" +
          '<div class="brand-text"><span class="brand-name">Horizon</span><span class="brand-sub">Caption Studio</span><span class="brand-tag">Powered by Skytek</span></div>' +
        "</div>" +
        '<nav class="nav"><div class="nav-section">Workspace</div>' + navItems +
          '<div class="nav-section">Account</div>' +
          '<a class="nav-item" id="navLogout"><i data-icon="logout"></i>Logout</a>' +
        "</nav>" +
        '<div class="nav-footer"><div class="user-chip"><div class="avatar">' + initials + "</div>" +
          '<div class="user-meta"><span class="user-name">' + escapeHtml(s.fullName) + '</span><span class="user-role">Signed in</span></div></div></div>' +
      "</aside>" +
      '<div class="sidebar-scrim" id="sidebarScrim"></div>';
    return html;
  }
  function wireSidebar() {
    hydrateIcons();
    var lo = document.getElementById("navLogout");
    if (lo) lo.addEventListener("click", function () {
      confirm({ title: "Log out?", message: "You'll need to sign in again to access your projects.", confirmText: "Log out", onConfirm: logout });
    });
    var scrim = document.getElementById("sidebarScrim");
    var sb = document.getElementById("appSidebar");
    if (scrim) scrim.addEventListener("click", function () { sb.classList.remove("is-open"); scrim.classList.remove("is-open"); });
    var mt = document.getElementById("menuToggle");
    if (mt) mt.addEventListener("click", function () { sb.classList.toggle("is-open"); scrim.classList.toggle("is-open"); });
  }

  /* ---- file → base64 (with downscale to keep localStorage sane) ---- */
  function fileToImage(file, maxDim, cb) {
    maxDim = maxDim || 1600;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height, scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var c = document.createElement("canvas"); c.width = cw; c.height = ch;
        var ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, cw, ch);
        var isPng = /png/i.test(file.type);
        var dataUrl = c.toDataURL(isPng ? "image/png" : "image/jpeg", isPng ? undefined : 0.9);
        // Images live in IndexedDB now (roomy), so we only guard against
        // pathologically large blobs rather than the old ~1.4MB localStorage cap.
        var LIMIT = 6000000; // ~6 MB of base64 per image
        var q = 0.85;
        while (dataUrl.length > LIMIT && q >= 0.4) {
          dataUrl = c.toDataURL("image/jpeg", q);
          q -= 0.12;
        }
        cb({ src: dataUrl, w: cw, h: ch, filename: file.name });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Refresh the sidebar's Projects count (data loads async now, after the
  // shell is built).
  function updateSidebarCounts() {
    var el = document.querySelector(".nav-count");
    if (el && window.Store) el.textContent = window.Store.getProjects().length;
  }

  window.UI = {
    hydrateIcons: hydrateIcons, fmtDate: fmtDate, fmtRelative: fmtRelative, escapeHtml: escapeHtml,
    toast: toast, modal: modal, confirm: confirm,
    applyTheme: applyTheme, initTheme: initTheme, toggleTheme: toggleTheme,
    requireAuth: requireAuth, logout: logout,
    buildSidebar: buildSidebar, wireSidebar: wireSidebar, updateSidebarCounts: updateSidebarCounts, fileToImage: fileToImage
  };
})();
