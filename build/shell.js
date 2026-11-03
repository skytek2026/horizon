/* ============================================================
   shell.js — turns the five original pages into one published page.
   • Router: legacy "x.html?…#…" URLs ↔ shareable #tokens
   • Lifecycle: window/document listeners + intervals registered by
     a page are removed when you leave it (and beforeunload handlers
     are run first, so the editor saves on the way out)
   • <a download> clicks → the downloads capability
   ============================================================ */
(function () {
  "use strict";

  var winAdd = window.addEventListener.bind(window);
  var docAdd = document.addEventListener.bind(document);
  var origInterval = window.setInterval.bind(window);
  var tracked = [], intervals = [];

  // "message" listeners belong to libraries (JSZip's async scheduler loads in the
  // background and must survive page switches), so they're never torn down.
  window.addEventListener = function (t, f, o) { if (t !== "message") tracked.push([window, t, f, o]); return winAdd(t, f, o); };
  document.addEventListener = function (t, f, o) { tracked.push([document, t, f, o]); return docAdd(t, f, o); };
  window.setInterval = function () { var id = origInterval.apply(null, arguments); intervals.push(id); return id; };

  var PAGES = window.__PAGES || {};
  var FILE_TO_PAGE = { "index.html": "login", "dashboard.html": "dashboard", "project.html": "project", "editor.html": "editor", "settings.html": "settings" };
  var current = null, protoNoted = false;

  /* ---- url ↔ route ---- */
  function parseLegacy(url) {
    var m = /^\.?\/?([a-z]+\.html)?(\?[^#]*)?(#.*)?$/i.exec(url || "");
    if (!m) return null;
    var page = FILE_TO_PAGE[(m[1] || "").toLowerCase()] || (current ? current.page : "login");
    return { page: page, search: m[2] || "", frag: m[3] ? m[3].slice(1) : "" };
  }
  function qs(search, key) { try { return new URLSearchParams(search).get(key) || ""; } catch (e) { return ""; } }
  function toToken(r) {
    if (r.page === "project") return "project~" + qs(r.search, "id");
    if (r.page === "editor") return "editor~" + qs(r.search, "project") + (qs(r.search, "image") ? "~" + qs(r.search, "image") : "");
    if (r.page === "dashboard" && r.frag) return "dashboard~" + r.frag;
    return r.page;
  }
  function fromToken(tok) {
    var parts = String(tok || "").replace(/^#/, "").split("~");
    var page = parts[0];
    if (page === "project" && parts[1]) return { page: page, search: "?id=" + parts[1], frag: "" };
    if (page === "editor" && parts[1]) return { page: page, search: "?project=" + parts[1] + (parts[2] ? "&image=" + parts[2] : ""), frag: "" };
    if (page === "dashboard") return { page: page, search: "", frag: parts[1] || "" };
    if (PAGES[page]) return { page: page, search: "", frag: "" };
    return null;
  }

  /* ---- lifecycle ---- */
  function teardown() {
    if (window.Store && Store.clearListeners) Store.clearListeners();
    var fake = { type: "beforeunload", preventDefault: function () {}, returnValue: "" };
    tracked.forEach(function (t) { if (t[1] === "beforeunload" || t[1] === "pagehide") { try { t[2](fake); } catch (e) {} } });
    tracked.forEach(function (t) { try { t[0].removeEventListener(t[1], t[2], t[3]); } catch (e) {} });
    tracked = [];
    intervals.forEach(function (id) { clearInterval(id); });
    intervals = [];
  }

  function setStyles(list) {
    document.querySelectorAll("style[data-sheet]").forEach(function (s) {
      s.media = list.indexOf(s.getAttribute("data-sheet")) > -1 ? "all" : "not all";
    });
  }

  function whenLucide(cb) {
    if (window.lucide) return cb();
    var s = document.getElementById("lucideLib"), done = false;
    function f() { if (!done) { done = true; cb(); } }
    if (!s) return f();
    s.addEventListener("load", f); s.addEventListener("error", f);
    setTimeout(f, 8000);
  }
  function mount(r, push) {
    if (r.page === "editor" && !window.lucide) { whenLucide(function () { mountNow(r, push); }); return; }
    mountNow(r, push);
  }
  function mountNow(r, push) {
    var def = PAGES[r.page]; if (!def) return;
    teardown();
    current = r;
    App.search = r.search; App.hash = r.frag ? "#" + r.frag : "";
    if (push) { try { history.pushState({ t: toToken(r) }, "", "#" + toToken(r)); } catch (e) {} }
    setStyles(def.sheets);
    document.title = def.title;
    document.body.className = def.bodyClass || "";
    document.body.innerHTML = def.html;
    window.scrollTo(0, 0);
    try { def.run(); } catch (e) { console.error(e); }
    if (r.page === "dashboard" && !protoNoted && window.Store && Store.backend && Store.backend() === "browser") {
      protoNoted = true;
      setTimeout(function () { if (window.UI) UI.toast({ type: "info", title: "Prototype mode", desc: "Projects are saved in this browser only.", duration: 6000 }); }, 700);
    }
    if (r.frag) setTimeout(function () { var el = document.getElementById(r.frag); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 350);
  }

  function go(url, opts) {
    var r = typeof url === "string" ? parseLegacy(url) : url;
    if (!r) return;
    mount(r, !(opts && opts.replace));
    // pick up teammates' changes in the background; pages re-render via Store.onChange
    if (window.Store && Store.isReady && Store.isReady() && r.page !== "login") Store.refresh();
  }

  /* ---- downloads ---- */
  var downloadsP = null;
  function getDownloads() { return downloadsP || (downloadsP = (typeof claude !== "undefined" && claude.use) ? claude.use("downloads") : Promise.resolve(null)); }
  function saveFile(href, filename) {
    filename = filename || "download";
    if (/\.skproj$/i.test(filename)) filename += ".zip";
    Promise.all([getDownloads(), fetch(href).then(function (r) { return r.blob(); })]).then(function (res) {
      var dl = res[0], blob = res[1];
      if (!dl) {
        if (window.Store && Store.isLocal && Store.isLocal()) {   // plain web page: ordinary browser download
          var u = URL.createObjectURL(blob), a = document.createElement("a");
          a.href = u; a.download = filename.replace(/\.skproj\.zip$/i, ".skproj"); origClick.call(a);
          setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
          return;
        }
        if (window.UI) UI.toast({ type: "warning", title: "Downloads aren’t available here" }); return;
      }
      return dl.save({ filename: filename, data: blob }).catch(function (e) {
        if (e && e.code === "declined") return;
        if (window.UI) UI.toast({ type: "danger", title: "Download failed", desc: (e && e.message) || "" });
      });
    }).catch(function (e) { console.error(e); });
  }
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute("download") && this.href) { saveFile(this.href, this.getAttribute("download")); return; }
    return origClick.call(this);
  };

  /* ---- link interception ---- */
  docAdd("click", function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    if (a.hasAttribute("download")) { e.preventDefault(); saveFile(a.href, a.getAttribute("download")); return; }
    var h = a.getAttribute("href");
    if (/^(\.\/)?(index|dashboard|project|editor|settings)\.html/i.test(h) || (/^#[a-z]/i.test(h) && current && document.getElementById(h.slice(1)) === null)) {
      e.preventDefault();
      go(h);
    }
  });
  winAdd("popstate", function () {
    var r = fromToken(location.hash);
    if (r) go(r, { replace: true });
  });

  /* ---- AI (sample capability) ---- */
  var sampleCap = null;
  function complete(req) {
    if (!sampleCap) return Promise.reject(new Error("AI is not available in this environment."));
    var tools = (req.tools || []).map(function (t) {
      return { name: t.name, description: t.description, inputSchema: t.input_schema, execute: function (input) { return t.run(input || {}); } };
    });
    var userText = (req.messages || []).map(function (m) { return typeof m.content === "string" ? m.content : ""; }).join("\n\n");
    var input = (req.system ? req.system + "\n\n" : "") + "User request: " + userText;
    return sampleCap(input, { tools: tools, modelTier: "default", cache: false })
      .then(function (r) { return (r && r.text) || ""; })
      .catch(function (e) {
        if (e && e.code === "not_granted") throw new Error("AI access wasn’t granted for this page.");
        if (e && e.code === "rate_limited") throw new Error("Too many requests — try again in a moment.");
        throw new Error((e && e.message) || "Request failed");
      });
  }

  window.App = {
    search: "", hash: "",
    go: go,
    reload: function () { if (current) go(current, { replace: true }); },
    complete: complete,
    hasAI: function () { return !!sampleCap; },
    start: function () {
      if (typeof claude !== "undefined" && claude.use) claude.use("sample").then(function (s) { sampleCap = s; });
      var r = fromToken(location.hash);
      if (!r) r = { page: "login", search: "", frag: "" };
      mount(r, false);
      try { history.replaceState({ t: toToken(r) }, "", "#" + toToken(r)); } catch (e) {}
    }
  };
  Object.defineProperty(window.App, "href", { set: function (v) { go(v); }, get: function () { return ""; } });
})();
