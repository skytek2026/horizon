/* ============================================================
   store.js — data layer for Horizon Caption Studio (artifact edition)
   ------------------------------------------------------------
   Same public API as the Supabase version. Backend is now the
   artifact's own shared storage:
     • metadata  → db collections  projects / images / brand
     • image bytes → artifact assets (served at /_blob/<id>)
   Device-local prefs (session, settings, recent, last project)
   stay in localStorage.

   Images embedded inside annotation layers (e.g. a brand logo
   dropped onto a photo) are moved to assets on write and stored
   as "skasset:<id>" so each image document stays well under the
   256 KB document limit; they are swapped back to data URLs on
   load, so the editor only ever sees data URLs.
   ============================================================ */
(function () {
  "use strict";

  var KEYS = {
    session:  "skytek.session",
    settings: "skytek.settings",
    recent:   "skytek.recent",
    lastOpen: "skytek.lastProject",
    snapshot: "skytek.snapshot"
  };

  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function lsRemove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var db = null, assets = null;
  // Outside Claude (e.g. GitHub Pages) there is no shared storage runtime:
  // fall back to this browser's IndexedDB so the prototype still works end to end.
  var LOCAL = !(typeof claude !== "undefined" && claude && claude.use);
  var BLOB = function (id) { return "/_blob/" + id; };
  var BLOBID = function (url) { var m = /^\/_blob\/([0-9a-f]{32})$/.exec(url || ""); return m ? m[1] : null; };

  // Shared backend for the GitHub Pages build: the original Supabase project.
  // The publishable key is Supabase's browser key; access is governed by the
  // Row-Level Security policies in SUPABASE_SETUP.sql.
  var SUPABASE = {
    url: "https://atccggprkaimmmutsprp.supabase.co",
    key: "sb_publishable_zyZ5cLHHTMGhJD4UKdLtEQ_JcHsFlIJ",
    bucket: "caption-images",
    lib: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js"
  };
  var BACKEND = LOCAL ? (SUPABASE.url ? "supabase" : "browser") : "claude";
  var EMBED_OFFLOAD = BACKEND !== "supabase";   // Supabase jsonb has no size cap: keep annotations inline like the original app

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (window.supabase && window.supabase.createClient) return res();
      var el = document.createElement("script"); el.src = src; el.async = true;
      el.onload = function () { res(); };
      el.onerror = function () { rej(new Error("Couldn’t load the Supabase library. Check your connection and try again.")); };
      document.head.appendChild(el);
    });
  }

  function supabaseRuntime() {
    return loadScript(SUPABASE.lib).then(function () {
      var sb = window.supabase.createClient(SUPABASE.url, SUPABASE.key, { auth: { persistSession: false, autoRefreshToken: false } });
      var B = SUPABASE.bucket, urls = {}, ids = {}, sizes = {};
      var TABLE = { projects: "projects", images: "images", brand: "brand_assets" };
      function chk(res) {
        if (res && res.error) { var e = new Error(res.error.message || "Supabase request failed"); e.code = res.error.code || res.error.statusCode; throw e; }
        return res;
      }
      function iso(t) { return new Date(t || Date.now()).toISOString(); }
      function ms(v) { var t = Date.parse(v); return isNaN(t) ? Date.now() : t; }
      function toDoc(coll, r) {
        if (coll === "projects") return { name: r.name, description: r.description || "", createdAt: ms(r.created_at), updatedAt: ms(r.updated_at) };
        if (coll === "images") {
          var objs = Array.isArray(r.objects) ? r.objects : [], meta = objs.filter(function (x) { return x && x.type === "__canvas"; })[0];
          var tmeta = objs.filter(function (x) { return x && x.type === "__thumb"; })[0];
          return { projectId: r.project_id, filename: r.filename || "image", w: r.w || 0, h: r.h || 0,
            objects: objs.filter(function (x) { return !(x && (x.type === "__canvas" || x.type === "__thumb")); }), canvas: meta ? meta.canvas : null, thumb: tmeta ? tmeta.src : null,
          assetId: r.storage_path || null, sizeBytes: sizes[r.storage_path] || 0, sortIndex: r.sort_index || 0, createdAt: ms(r.created_at), updatedAt: ms(r.updated_at) };
        }
        return { name: r.name || "Asset", w: r.w || 0, h: r.h || 0, assetId: r.storage_path || null, sizeBytes: sizes[r.storage_path] || 0, createdAt: ms(r.created_at) };
      }
      function toRow(coll, id, d) {
        if (coll === "projects") return { id: id, name: d.name, description: d.description || "", created_at: iso(d.createdAt), updated_at: iso(d.updatedAt) };
        if (coll === "images") return { id: id, project_id: d.projectId, filename: d.filename || "image", w: Math.round(d.w || 0), h: Math.round(d.h || 0),
          objects: (d.objects || []).concat(d.canvas ? [{ type: "__canvas", canvas: d.canvas }] : []).concat(d.thumb ? [{ type: "__thumb", src: d.thumb }] : []), storage_path: d.assetId || null, sort_index: d.sortIndex || 0, created_at: iso(d.createdAt), updated_at: iso(d.updatedAt) };
        return { id: id, name: d.name || "Asset", w: Math.round(d.w || 0), h: Math.round(d.h || 0), storage_path: d.assetId || null, created_at: iso(d.createdAt) };
      }
      function remember(path, blob) { var u = URL.createObjectURL(blob); urls[path] = u; ids[u] = path; sizes[path] = blob.size; return u; }
      // Files are pulled into same-origin blob: URLs so canvas export never taints.
      function fetchFiles(paths) {
        var need = paths.filter(function (p, i) { return p && !urls[p] && paths.indexOf(p) === i; });
        return new Promise(function (done) {
          runLimited(need, 5, function (p) {
            return sb.storage.from(B).download(p).then(function (res) { if (res && res.data) remember(p, res.data); }, function () {});
          }).then(done);
        });
      }
      // One write queue: a project row always lands before its images (foreign key).
      var queue = Promise.resolve();
      function serial(fn) { var p = queue.then(fn); queue = p.catch(function () {}); return p; }
      var sdb = {
        collection: function (coll) {
          var q = { limit: function () { return q; }, get: function () {
            return sb.from(TABLE[coll]).select("*").then(chk).then(function (res) {
              var rows = res.data || [], paths = [];
              if (coll !== "projects") rows.forEach(function (r) {
                if (r.storage_path) paths.push(r.storage_path);
                if (coll === "images") Object.keys(collectRefs(r.objects, {})).forEach(function (k) { paths.push(k); });
              });
              return fetchFiles(paths).then(function () {
                var docs = rows.map(function (r) { var d = toDoc(coll, r); return { id: r.id, data: function () { return d; } }; });
                return { docs: docs, size: docs.length, empty: !docs.length };
              });
            });
          } };
          return q;
        },
        doc: function (path) {
          var parts = path.split("/"), coll = parts[0], id = parts.slice(1).join("/");
          return {
            set: function (d) { return serial(function () { return sb.from(TABLE[coll]).upsert(toRow(coll, id, d), { onConflict: "id" }).then(chk); }); },
            delete: function () { return serial(function () { return sb.from(TABLE[coll]).delete().eq("id", id).then(chk); }); }
          };
        }
      };
      var EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg" };
      var sassets = {
        upload: function (blob) {
          var p = "files/" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10) + (EXT[blob.type] || "");
          return sb.storage.from(B).upload(p, blob, { upsert: true, contentType: blob.type || "image/png" }).then(chk).then(function () {
            return { id: p, url: remember(p, blob), sizeBytes: blob.size, contentType: blob.type };
          });
        },
        delete: function (p) { return sb.storage.from(B).remove([p]).then(function () { return { deleted: true }; }, function () { return { deleted: false }; }); }
      };
      return { db: sdb, assets: sassets, blobUrl: function (p) { return urls[p] || ""; }, blobId: function (u) { return ids[u] || null; } };
    });
  }

  function localRuntime() {
    return new Promise(function (resolve) {
      var req;
      try { if (!window.indexedDB) return resolve(null); req = indexedDB.open("horizon-caption-studio", 1); }
      catch (e) { return resolve(null); }
      req.onupgradeneeded = function () { var d = req.result; d.createObjectStore("docs"); d.createObjectStore("blobs"); };
      req.onerror = function () { resolve(null); };
      req.onsuccess = function () {
        var idb = req.result, urls = {}, ids = {};
        function tx(store, mode, fn) {
          return new Promise(function (res, rej) {
            var t = idb.transaction(store, mode), r = fn(t.objectStore(store));
            t.oncomplete = function () { res(r ? r.result : undefined); };
            t.onerror = function () { rej(t.error); }; t.onabort = function () { rej(t.error); };
          });
        }
        function remember(id, blob) { var u = URL.createObjectURL(blob); urls[id] = u; ids[u] = id; return u; }
        function getColl(coll) {
          var range = IDBKeyRange.bound(coll + "/", coll + "/\uffff");
          return Promise.all([tx("docs", "readonly", function (st) { return st.getAllKeys(range); }),
                              tx("docs", "readonly", function (st) { return st.getAll(range); })]).then(function (r) {
            return r[0].map(function (k, i) { return { id: String(k).slice(coll.length + 1), data: function () { return JSON.parse(r[1][i]); } }; });
          });
        }
        var ldb = {
          collection: function (coll) {
            var q = { limit: function () { return q; },
                      get: function () { return getColl(coll).then(function (docs) { return { docs: docs, size: docs.length, empty: !docs.length }; }); } };
            return q;
          },
          doc: function (path) {
            return { set: function (data) { return tx("docs", "readwrite", function (st) { return st.put(JSON.stringify(data), path); }); },
                     delete: function () { return tx("docs", "readwrite", function (st) { return st.delete(path); }); } };
          }
        };
        var lassets = {
          upload: function (blob) {
            var id = "loc" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
            return tx("blobs", "readwrite", function (st) { return st.put(blob, id); }).then(function () {
              return { id: id, url: remember(id, blob), sizeBytes: blob.size, contentType: blob.type };
            });
          },
          delete: function (id) {
            return tx("blobs", "readwrite", function (st) { return st.delete(id); }).then(function () { return { deleted: true }; });
          }
        };
        Promise.all([tx("blobs", "readonly", function (st) { return st.getAllKeys(); }),
                     tx("blobs", "readonly", function (st) { return st.getAll(); })]).then(function (r) {
          r[0].forEach(function (k, i) { remember(String(k), r[1][i]); });
          resolve({ db: ldb, assets: lassets, blobUrl: function (id) { return urls[id] || ""; }, blobId: function (u) { return ids[u] || null; } });
        }, function () { resolve(null); });
      };
    });
  }

  /* ---- cache ---- */
  var _projects = [], _brand = [], IMG = {}, ASSET = {}, NEEDUP = {};
  var EMB = new Map();      // embedded data URL → asset id
  var EMBDATA = {};         // asset id → data URL
  var SIZE = {};            // asset id → bytes
  var _ready = false, _starting = false, _readyCbs = [], _fatal = false;
  var _fresh = false, _freshCbs = [], _listeners = [], _lastRaw = null, _writeSeq = 0, _loading = null;

  /* ---- pending writes ---- */
  var _pending = 0, _flushCbs = [];
  function track(promise) {
    _pending++; _writeSeq++;
    function settle() {
      _pending = Math.max(0, _pending - 1);
      if (_pending === 0) { var cbs = _flushCbs.slice(); _flushCbs.length = 0; cbs.forEach(function (f) { try { f(); } catch (e) {} }); }
    }
    promise.then(settle, function (err) {
      console.error("Sync failed:", err);
      if (window.UI && UI.toast) UI.toast({ type: "danger", title: "Sync problem", desc: friendlyWriteError(err) });
      settle();
    });
    return promise;
  }
  function flush(cb) { if (_pending <= 0) { if (cb) cb(); return; } if (cb) _flushCbs.push(cb); }
  function hasPending() { return _pending > 0; }

  function friendlyWriteError(err) {
    var code = err && err.code;
    if (err && err.userMessage) return err.userMessage;
    if (code === "quota_exceeded" || code === "quota_or_state") return "Storage is full. Delete some projects or images and try again.";
    if (code === "too_large") return "That image is too large to store (20 MB max).";
    if (code === "invalid_argument") return "You don’t have permission to change data in this workspace.";
    if (code === "rate_limited" || code === "resource_exhausted") return "Too many changes at once — give it a moment.";
    return "A recent change may not have been saved.";
  }

  /* ---- one write at a time per document, always the latest state ---- */
  var SYNC = {};
  function syncDoc(path, build) {
    var st = SYNC[path] || (SYNC[path] = { running: false, again: false, build: null, promise: null });
    st.build = build;
    if (st.running) { st.again = true; return st.promise; }
    st.running = true;
    st.promise = (async function () {
      try {
        do {
          st.again = false;
          var data = await st.build();
          if (data === null) await withRetry(function () { return db.doc(path).delete(); });
          else if (data !== undefined) await withRetry(function () { return db.doc(path).set(data); });
        } while (st.again);
      } finally { st.running = false; }
    })();
    return st.promise;
  }
  async function withRetry(fn) {
    try { return await fn(); }
    catch (e) {
      if (e && (e.code === "unavailable" || e.code === "store_unavailable" || e.code === "resource_exhausted")) {
        await new Promise(function (r) { setTimeout(r, (e.code === "resource_exhausted" ? 1500 : 400) + Math.random() * 600); });
        return fn();
      }
      throw e;
    }
  }

  /* ---- binary helpers ---- */
  function dataUrlToBlob(d) {
    var parts = d.split(","), mime = (/data:([^;]+)/.exec(parts[0]) || [])[1] || "image/png";
    var bin = atob(parts[1]), len = bin.length, arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  function blobToDataUrl(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = function () { rej(fr.error); };
      fr.readAsDataURL(blob);
    });
  }
  async function uploadDataUrl(dataUrl) {
    if (!assets) await getAssets();
    if (!assets) {
      var e = new Error("no assets"); e.code = "not_granted";
      e.userMessage = "You can’t upload images in this workspace. Ask the owner to make you an Editor.";
      throw e;
    }
    var res;
    try { res = await assets.upload(dataUrlToBlob(dataUrl)); }
    catch (err) {
      if (err && (err.code === "store_unavailable")) { await new Promise(function (r) { setTimeout(r, 700); }); res = await assets.upload(dataUrlToBlob(dataUrl)); }
      else throw err;
    }
    SIZE[res.id] = res.sizeBytes || 0;
    return res.id;
  }
  function deleteAsset(id) {
    if (!id) return Promise.resolve();
    return getAssets().then(function (a) {
      if (a) return a.delete(id).catch(function () { /* someone else's upload, or already gone */ });
    });
  }
  async function fetchAsDataUrl(assetId) {
    var r = await fetch("/_blob/" + assetId);
    if (!r.ok) throw new Error("asset " + r.status);
    return blobToDataUrl(await r.blob());
  }
  function runLimited(items, limit, fn) {
    return new Promise(function (resolve) {
      var i = 0, active = 0, done = 0, n = items.length;
      if (!n) return resolve();
      function next() {
        while (active < limit && i < n) { var item = items[i++]; active++; Promise.resolve(fn(item)).then(fin, fin); }
      }
      function fin() { active--; if (++done >= n) resolve(); else next(); }
      next();
    });
  }

  /* ---- embedded images inside annotation objects ---- */
  var EMBED_MIN = 1024;
  async function encodeObjects(objects) {
    var out = clone(objects || []);
    var found = [];
    (function walk(node) {
      if (Array.isArray(node)) { for (var i = 0; i < node.length; i++) visit(node, i); }
      else if (node && typeof node === "object") { for (var k in node) visit(node, k); }
    })(out);
    function visit(parent, key) {
      var v = parent[key];
      if (typeof v === "string") {
        var known = (v.indexOf("/_blob/") === 0 || v.indexOf("blob:") === 0) ? BLOBID(v) : null;
        if (known) parent[key] = "skasset:" + known;
        else if (EMBED_OFFLOAD && v.length > EMBED_MIN && v.indexOf("data:image") === 0) found.push([parent, key, v]);
      }
      else if (v && typeof v === "object") {
        if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) visit(v, i); }
        else { for (var k in v) visit(v, k); }
      }
    }
    for (var j = 0; j < found.length; j++) {
      var f = found[j], d = f[2], id = EMB.get(d);
      if (!id) { id = await uploadDataUrl(d); EMB.set(d, id); EMBDATA[id] = d; }
      f[0][f[1]] = "skasset:" + id;
    }
    return out;
  }
  function collectRefs(node, acc) {
    if (typeof node === "string") { if (node.indexOf("skasset:") === 0) acc[node.slice(8)] = true; }
    else if (Array.isArray(node)) node.forEach(function (n) { collectRefs(n, acc); });
    else if (node && typeof node === "object") for (var k in node) collectRefs(node[k], acc);
    return acc;
  }
  function decodeObjects(node) {
    if (typeof node === "string") return node.indexOf("skasset:") === 0 ? (EMBDATA[node.slice(8)] || BLOB(node.slice(8))) : node;
    if (Array.isArray(node)) return node.map(decodeObjects);
    if (node && typeof node === "object") { var o = {}; for (var k in node) o[k] = decodeObjects(node[k]); return o; }
    return node;
  }

  /* ============================================================
     CONNECT + LOAD
  ============================================================ */
  function ready(cb) {
    if (_fatal) return;
    if (_ready) { if (cb) cb(); return; }
    if (cb) _readyCbs.push(cb);
    if (_starting) return;
    _starting = true;
    init();
  }
  function fireReady() {
    _ready = true;
    var cbs = _readyCbs.slice(); _readyCbs.length = 0;
    cbs.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }

  var assetsP = null;
  function getAssets() {
    return assetsP || (assetsP = claude.use("assets").then(function (a) { assets = a; return a; }, function () { return null; }));
  }
  async function init() {
    try {
      if (LOCAL) {
        var L = BACKEND === "supabase" ? await supabaseRuntime() : await localRuntime();
        if (!L) { showFatal("This browser can’t store projects (private browsing may block it). Try a regular window."); return; }
        db = L.db; assets = L.assets; assetsP = Promise.resolve(assets); BLOB = L.blobUrl; BLOBID = L.blobId;
        await load(); fireReady(); markFresh();
        return;
      }
      if (typeof claude !== "undefined" && claude.use) getAssets(); // connect in the background; only the db blocks loading
      // Paint instantly from this device's last snapshot, then reconcile.
      var snap = read(KEYS.snapshot, null);
      if (snap && snap.projects) {
        _lastRaw = JSON.stringify(snap);
        buildCache(snap.projects, snap.images || [], snap.brand || []);
        fireReady();
      }
      db = (typeof claude !== "undefined" && claude.use) ? await claude.use("db") : null;
      if (!db) {
        var topLevel = false; try { topLevel = window.top === window; } catch (x) {}
        if (!_ready) showFatal(topLevel
          ? "This page is open on its own, outside the claude.ai artifact viewer, where shared storage isn’t available. Open it from its claude.ai/artifact link instead."
          : "The viewer didn’t connect shared storage to this page. Reload, and make sure you’re signed in to claude.ai.");
        return;
      }
      await load();
      if (!_ready) fireReady();
      markFresh();
    } catch (e) {
      console.error(e);
      if (!_ready) showFatal((BACKEND === "supabase" ? "Couldn’t reach the Supabase workspace" : "Couldn’t load your workspace") +
        (e && e.code ? " (" + e.code + ")" : "") + ". " + ((e && e.message) || ""));
    }
  }
  function markFresh() {
    _fresh = true;
    var cbs = _freshCbs.slice(); _freshCbs.length = 0;
    cbs.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }
  // Like ready(), but waits for server data (used by the editor).
  function readyFresh(cb) {
    if (_fresh) { cb(); return; }
    _freshCbs.push(cb);
    ready();
  }
  function onChange(fn) { _listeners.push(fn); }
  function clearListeners() { _listeners = []; }
  function notify() { _listeners.slice().forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }

  async function getAll(coll) {
    var snap = await withRetry(function () { return db.collection(coll).limit(1000).get(); });
    // Platform records are frozen: copy before adding the id.
    return snap.docs.map(function (d) { var o = Object.assign({}, d.data() || {}); o.id = d.id; return o; });
  }

  // Fetch metadata only (image bytes load lazily from /_blob/ URLs).
  // Returns true when the cache changed.
  async function load() {
    if (_loading) return _loading;
    _loading = (async function () {
      for (var attempt = 0; attempt < 3; attempt++) {
        var seq = _writeSeq;
        var r = await Promise.all([getAll("projects"), getAll("images"), getAll("brand")]);
        // a local edit landed while we were reading: don't clobber it
        if (seq !== _writeSeq || _pending > 0) { await new Promise(function (res) { flush(res); }); continue; }
        var raw = { projects: r[0], images: r[1], brand: r[2] };
        var str = JSON.stringify(raw);
        if (str === _lastRaw) return false;
        _lastRaw = str;
        buildCache(raw.projects, raw.images, raw.brand);
        try { localStorage.setItem(KEYS.snapshot, str); } catch (e) { lsRemove(KEYS.snapshot); }
        return true;
      }
      return false;
    })();
    try { return await _loading; } finally { _loading = null; }
  }

  function buildCache(projects, images, brand) {
    var byProj = {};
    projects.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    // keep optimistic records that haven't reached the server yet
    var localOnly = _projects.filter(function (p) { return SYNC["projects/" + p.id] && SYNC["projects/" + p.id].running; });
    _projects = projects.map(function (p) {
      var cp = { id: p.id, name: p.name || "Untitled Project", description: p.description || "", createdAt: p.createdAt || Date.now(), updatedAt: p.updatedAt || Date.now(), thumbnail: null, images: [] };
      byProj[p.id] = cp; return cp;
    });
    localOnly.forEach(function (p) { if (!byProj[p.id]) { _projects.unshift(p); byProj[p.id] = p; } });
    images.sort(function (a, b) { return (a.sortIndex || 0) - (b.sortIndex || 0); });
    images.forEach(function (im) {
      var cp = byProj[im.projectId]; if (!cp) return;
      if (im.assetId) { ASSET[im.id] = im.assetId; if (im.sizeBytes) SIZE[im.assetId] = im.sizeBytes; }
      cp.images.push({ id: im.id, filename: im.filename || "image", w: im.w || 0, h: im.h || 0, addedAt: im.createdAt || Date.now(), updatedAt: im.updatedAt || Date.now(), objects: decodeObjects(im.objects || []), canvas: im.canvas || null, thumb: im.thumb || null });
    });
    brand.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    _brand = brand.map(function (a) {
      if (a.assetId) { ASSET[a.id] = a.assetId; if (a.sizeBytes) SIZE[a.assetId] = a.sizeBytes; }
      return { id: a.id, name: a.name || "Asset", w: a.w || 0, h: a.h || 0, addedAt: a.createdAt || Date.now() };
    });
  }

  // Re-read shared data (other people's changes) in the background.
  function refresh(cb) {
    if (!db) { if (cb) cb(); return; }
    flush(function () {
      load().then(function (changed) { if (changed) notify(); }, function (e) { console.error("Refresh failed:", e); })
        .then(function () { if (cb) cb(); });
    });
  }

  function showFatal(message) {
    _fatal = true; _starting = false;
    function paint() {
      if (document.getElementById("sbFatal")) return;
      var wrap = document.createElement("div");
      wrap.id = "sbFatal";
      wrap.setAttribute("style", "position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:#0B1220;color:#E5EDF5;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif");
      wrap.innerHTML =
        '<div style="max-width:440px;text-align:center">' +
          '<div style="width:52px;height:52px;margin:0 auto 18px;border-radius:14px;display:grid;place-items:center;background:rgba(239,68,68,.14);color:#F87171;font-size:26px">⚠</div>' +
          '<h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Can’t reach the workspace</h2>' +
          '<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#9FB0C0">' + escapeHtml(message) + '</p>' +
          '<button id="sbRetry" style="cursor:pointer;border:0;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:600;color:#fff;background:#00AEEF">Retry</button>' +
        '</div>';
      document.body.appendChild(wrap);
      document.getElementById("sbRetry").onclick = function () { wrap.remove(); _fatal = false; _starting = false; ready(); };
    }
    paint();
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- hydrate ---- */
  function hydrate(p) {
    if (!p) return p;
    var q = {}; for (var k in p) q[k] = p[k];
    q.images = (p.images || []).map(function (im) {
      var o = {}; for (var k2 in im) o[k2] = im[k2];
      o.src = srcOf(im.id);
      return o;
    });
    q.thumbnail = q.images.length ? (q.images[0].thumb || q.images[0].src || null) : null;
    return q;
  }
  function srcOf(id) { return IMG[id] || (ASSET[id] ? BLOB(ASSET[id]) : ""); }
  function findCache(id) { for (var i = 0; i < _projects.length; i++) if (_projects[i].id === id) return _projects[i]; return null; }
  function imgIndex(p, imageId) { for (var i = 0; i < p.images.length; i++) if (p.images[i].id === imageId) return i; return -1; }

  /* ---- document writers (build from cache at write time) ---- */
  function syncProject(id) {
    return syncDoc("projects/" + id, async function () {
      var p = findCache(id); if (!p) return null;
      return { name: p.name, description: p.description || "", createdAt: p.createdAt, updatedAt: p.updatedAt };
    });
  }
  var DELETED = {};
  function syncImage(projectId, imageId) {
    return syncDoc("images/" + imageId, async function () {
      if (DELETED[imageId]) return null;
      var p = findCache(projectId); if (!p) return null;
      var i = imgIndex(p, imageId); if (i < 0) return null;
      var im = p.images[i];
      if (NEEDUP[imageId] && IMG[imageId]) {
        var old = ASSET[imageId];
        var src = IMG[imageId];
        var id = await uploadDataUrl(src);
        if (IMG[imageId] === src) delete NEEDUP[imageId];
        ASSET[imageId] = id;
        if (old && old !== id && !assetInUse(old, imageId)) deleteAsset(old);
      }
      var objects = await encodeObjects(im.objects);
      return {
        projectId: projectId, filename: im.filename, w: im.w, h: im.h, objects: objects,
        assetId: ASSET[imageId] || null, sizeBytes: SIZE[ASSET[imageId]] || 0, sortIndex: i, createdAt: im.addedAt, updatedAt: im.updatedAt,
        canvas: im.canvas || null, thumb: im.thumb || null
      };
    });
  }
  function assetInUse(assetId, exceptKey) {
    for (var k in ASSET) if (k !== exceptKey && ASSET[k] === assetId) return true;
    return false;
  }

  /* ---- session / auth (device-local) ---- */
  function getSession()   { return read(KEYS.session, null); }
  function setSession(s)  { write(KEYS.session, s); }
  function clearSession() { lsRemove(KEYS.session); }
  function isAuthed()     { var s = getSession(); return !!(s && s.user); }

  /* ---- settings (device-local) ---- */
  var DEFAULT_SETTINGS = {
    theme: "dark", themeVersion: 0, autosave: true, autosaveInterval: 30, snapToGrid: true, gridSize: 20,
    showGrid: false, alignmentGuides: true, defaultExport: "png",
    fullName: "Skytek Operator", email: "operator@skytek.com"
  };
  function getSettings() {
    var s = read(KEYS.settings, {}), out = {};
    for (var k in DEFAULT_SETTINGS) out[k] = (s[k] !== undefined ? s[k] : DEFAULT_SETTINGS[k]);
    return out;
  }
  function setSettings(patch) { var s = getSettings(); for (var k in patch) s[k] = patch[k]; write(KEYS.settings, s); return s; }

  /* ============================================================
     PROJECTS
  ============================================================ */
  function getProjects() { return _projects.map(hydrate); }
  function getProject(id) { var p = findCache(id); return p ? hydrate(p) : null; }

  function touch(p) { p.updatedAt = Date.now(); track(syncProject(p.id)); }

  function createProject(data) {
    var now = Date.now();
    var p = { id: uid("prj"), name: (data && data.name) || "Untitled Project", description: (data && data.description) || "", thumbnail: null, createdAt: now, updatedAt: now, images: [] };
    _projects.unshift(p);
    track(syncProject(p.id));
    return hydrate(p);
  }
  function updateProject(id, patch) {
    var p = findCache(id); if (!p) return null;
    for (var k in patch) if (k !== "images" && k !== "id") p[k] = patch[k];
    touch(p);
    return hydrate(p);
  }
  function deleteProject(id) {
    var p = findCache(id); if (!p) return;
    var imgs = p.images.slice();
    _projects = _projects.filter(function (x) { return x.id !== id; });
    if (read(KEYS.lastOpen, null) === id) lsRemove(KEYS.lastOpen);
    imgs.forEach(function (im) {
      DELETED[im.id] = true;
      var a = ASSET[im.id]; delete IMG[im.id]; delete ASSET[im.id];
      track(syncImage(id, im.id).then(function () { if (a && !assetInUse(a)) return deleteAsset(a); }));
    });
    track(syncProject(id));
  }
  function duplicateProject(id) {
    var src = findCache(id); if (!src) return null;
    var idx = _projects.indexOf(src), now = Date.now();
    var copy = { id: uid("prj"), name: src.name + " copy", description: src.description, thumbnail: null, createdAt: now, updatedAt: now, images: [] };
    src.images.forEach(function (im) {
      var nid = uid("img");
      copy.images.push({ id: nid, filename: im.filename, w: im.w, h: im.h, addedAt: now, updatedAt: now, objects: clone(im.objects), canvas: im.canvas ? clone(im.canvas) : null, thumb: im.thumb || null });
      copyBytes(im.id, nid);
    });
    _projects.splice(idx + 1, 0, copy);
    track(syncProject(copy.id));
    copy.images.forEach(function (im) { track(syncImage(copy.id, im.id)); });
    return hydrate(copy);
  }

  /* ============================================================
     IMAGES
  ============================================================ */
  function addImage(projectId, img) {
    var p = findCache(projectId); if (!p) return null;
    var now = Date.now(), id = uid("img");
    var rec = { id: id, filename: img.filename || "image", w: img.w || 0, h: img.h || 0, addedAt: now, updatedAt: now, objects: [] };
    IMG[id] = img.src; NEEDUP[id] = true;
    p.images.unshift(rec);
    touch(p);
    p.images.forEach(function (im) { track(syncImage(projectId, im.id)); }); // sort order shifted
    return hydrate({ images: [rec] }).images[0];
  }
  function copyBytes(from, to) {
    if (ASSET[from] && !NEEDUP[from]) ASSET[to] = ASSET[from];
    else if (IMG[from]) { IMG[to] = IMG[from]; NEEDUP[to] = true; }
  }
  function getImage(projectId, imageId) {
    var p = getProject(projectId); if (!p) return null;
    for (var i = 0; i < p.images.length; i++) if (p.images[i].id === imageId) return p.images[i];
    return null;
  }
  function updateImage(projectId, imageId, patch) {
    var p = findCache(projectId); if (!p) return null;
    var i = imgIndex(p, imageId); if (i < 0) return null;
    var im = p.images[i];
    for (var k in patch) {
      if (k === "src") { IMG[imageId] = patch.src; NEEDUP[imageId] = true; if (!("thumb" in patch)) im.thumb = null; }
      else if (k !== "id") im[k] = patch[k];
    }
    im.updatedAt = Date.now();
    touch(p);
    track(syncImage(projectId, imageId));
    return hydrate(p).images[i];
  }
  function deleteImage(projectId, imageId) {
    var p = findCache(projectId); if (!p) return false;
    var a = ASSET[imageId];
    DELETED[imageId] = true;
    track(syncImage(projectId, imageId).then(function () { if (a && !assetInUse(a, imageId)) return deleteAsset(a); }));
    p.images = p.images.filter(function (im) { return im.id !== imageId; });
    delete IMG[imageId]; delete ASSET[imageId]; delete NEEDUP[imageId];
    touch(p);
    p.images.forEach(function (im) { track(syncImage(projectId, im.id)); });
    return true;
  }
  function duplicateImage(projectId, imageId) {
    var p = findCache(projectId); if (!p) return null;
    var idx = imgIndex(p, imageId); if (idx < 0) return null;
    var src = p.images[idx], now = Date.now(), nid = uid("img");
    var copy = { id: nid, filename: (src.filename || "image").replace(/(\.[^.]+)?$/, " copy$1"), w: src.w, h: src.h, addedAt: now, updatedAt: now, objects: clone(src.objects), canvas: src.canvas ? clone(src.canvas) : null, thumb: src.thumb || null };
    copyBytes(imageId, nid);
    p.images.splice(idx + 1, 0, copy);
    touch(p);
    p.images.slice(idx + 1).forEach(function (im) { track(syncImage(projectId, im.id)); });
    return hydrate({ images: [copy] }).images[0];
  }
  function saveImageObjects(projectId, imageId, objects) { return updateImage(projectId, imageId, { objects: objects }); }
  // In-app navigation keeps the page alive, so a normal tracked write is enough.
  function saveImageObjectsBeacon(projectId, imageId, objects) { saveImageObjects(projectId, imageId, objects); }

  function reorderImages(projectId, orderedIds) {
    var p = findCache(projectId); if (!p) return false;
    var byId = {}; p.images.forEach(function (im) { byId[im.id] = im; });
    var next = [];
    orderedIds.forEach(function (id) { if (byId[id]) { next.push(byId[id]); delete byId[id]; } });
    p.images.forEach(function (im) { if (byId[im.id]) next.push(im); });
    p.images = next;
    touch(p);
    p.images.forEach(function (im) { track(syncImage(projectId, im.id)); });
    return true;
  }

  /* ============================================================
     BRAND ASSETS (global)
  ============================================================ */
  function getBrandAssets() {
    return _brand.map(function (a) { var o = {}; for (var k in a) o[k] = a[k]; o.src = srcOf(a.id); return o; });
  }
  function addBrandAsset(img) {
    var now = Date.now(), id = uid("brand");
    var rec = { id: id, name: img.filename || "Asset", w: img.w || 0, h: img.h || 0, addedAt: now };
    IMG[id] = img.src;
    _brand.unshift(rec);
    track(syncDoc("brand/" + id, async function () {
      if (!_brand.some(function (b) { return b.id === id; })) return null;
      if (!ASSET[id]) {
        var aid = EMB.get(img.src) || await uploadDataUrl(img.src);
        ASSET[id] = aid; EMB.set(img.src, aid); EMBDATA[aid] = img.src;
      }
      return { name: rec.name, w: rec.w, h: rec.h, assetId: ASSET[id], sizeBytes: SIZE[ASSET[id]] || 0, createdAt: now };
    }));
    var out = {}; for (var k in rec) out[k] = rec[k]; out.src = img.src; return out;
  }
  function deleteBrandAsset(id) {
    // The asset file is kept: annotations already placed on images may point at it.
    _brand = _brand.filter(function (a) { return a.id !== id; });
    delete IMG[id]; delete ASSET[id];
    track(syncDoc("brand/" + id, async function () { return null; }));
    return true;
  }

  /* ---- recent + last project ---- */
  function pushRecent(entry) {
    var list = read(KEYS.recent, []);
    list = list.filter(function (r) { return !(r.projectId === entry.projectId && r.imageId === entry.imageId); });
    list.unshift({ projectId: entry.projectId, imageId: entry.imageId, filename: entry.filename, projectName: entry.projectName, at: Date.now() });
    write(KEYS.recent, list.slice(0, 24));
  }
  function getRecent() {
    return read(KEYS.recent, []).filter(function (r) {
      var p = findCache(r.projectId);
      return !!p && p.images.some(function (im) { return im.id === r.imageId; });
    });
  }
  function setLastProject(id) { write(KEYS.lastOpen, id); }
  function getLastProject()  { return read(KEYS.lastOpen, null); }

  /* ---- stats ---- */
  function totalImages() { return _projects.reduce(function (n, p) { return n + p.images.length; }, 0); }
  function storageUsedKB() {
    var seen = {}, bytes = 0;
    for (var k in ASSET) { var a = ASSET[k]; if (a && !seen[a]) { seen[a] = true; bytes += SIZE[a] || 0; } }
    return Math.round(bytes / 1024);
  }

  /* ============================================================
     EXPORT / IMPORT (.skproj = ZIP)
  ============================================================ */
  function extFromDataUrl(d) {
    var m = /^data:image\/([a-z0-9.+-]+)/i.exec(d || "");
    var t = (m ? m[1] : "png").toLowerCase();
    if (t === "jpeg") return ".jpg";
    if (t === "svg+xml") return ".svg";
    return "." + t;
  }
  function safeName(s) { return String(s || "image").replace(/[^\w.\-]+/g, "_").slice(0, 60); }
  function pad4(n) { n = String(n); while (n.length < 4) n = "0" + n; return n; }

  async function toDataUrl(src) {
    if (!src) return null;
    if (src.indexOf("data:") === 0) return src;
    var r = await fetch(src); if (!r.ok) return null;
    return blobToDataUrl(await r.blob());
  }
  async function inlineBlobs(node) {
    if (typeof node === "string") return node.indexOf("/_blob/") === 0 ? ((await toDataUrl(node).catch(function () { return null; })) || node) : node;
    if (Array.isArray(node)) { var a = []; for (var i = 0; i < node.length; i++) a.push(await inlineBlobs(node[i])); return a; }
    if (node && typeof node === "object") { var o = {}; for (var k in node) o[k] = await inlineBlobs(node[k]); return o; }
    return node;
  }
  async function exportProject(id) {
    if (!window.JSZip) throw new Error("Zip library not loaded yet — try again in a moment.");
    var p = findCache(id);
    if (!p) throw new Error("Project not found.");
    var zip = new JSZip();
    var imagesDir = zip.folder("images");
    var manifest = { format: "skytek-caption-project", formatVersion: 1, exportedAt: new Date().toISOString(), project: { name: p.name, description: p.description || "" }, images: [] };
    for (var i = 0; i < p.images.length; i++) {
      var im = p.images[i];
      var entry = { filename: im.filename || "image", w: im.w || 0, h: im.h || 0, objects: await inlineBlobs(im.objects || []), canvas: im.canvas || null, type: null, file: null };
      var data = await toDataUrl(srcOf(im.id)).catch(function () { return null; });
      if (data && data.indexOf(",") > -1) {
        var mime = (/data:([^;]+)/.exec(data) || [])[1] || "image/png";
        var fname = pad4(i + 1) + "-" + safeName(im.filename || ("image" + extFromDataUrl(data)));
        if (!/\.[a-z0-9]+$/i.test(fname)) fname += extFromDataUrl(data);
        imagesDir.file(fname, data.split(",")[1], { base64: true });
        entry.type = mime; entry.file = "images/" + fname;
      }
      manifest.images.push(entry);
    }
    zip.file("project.json", JSON.stringify(manifest, null, 2));
    var blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    return { blob: blob, filename: safeName(p.name) + ".skproj" };
  }

  function importProject(blob) {
    if (!window.JSZip) return Promise.reject(new Error("Zip library not loaded."));
    return JSZip.loadAsync(blob).then(function (zip) {
      var mf = zip.file("project.json");
      if (!mf) throw new Error("Not a valid .skproj file (missing project.json).");
      return mf.async("string").then(function (txt) {
        var manifest;
        try { manifest = JSON.parse(txt); } catch (e) { throw new Error("The project file is corrupt."); }
        if (!manifest || manifest.format !== "skytek-caption-project") throw new Error("This doesn’t look like a Skytek project file.");
        var proj = createProject({ name: (manifest.project && manifest.project.name) || "Imported project", description: (manifest.project && manifest.project.description) || "" });
        var imgs = manifest.images || [], newIds = [];
        return imgs.reduce(function (chain, entry) {
          return chain.then(function () {
            var byteP = (entry.file && zip.file(entry.file))
              ? zip.file(entry.file).async("base64").then(function (b64) { return "data:" + (entry.type || "image/png") + ";base64," + b64; })
              : Promise.resolve(null);
            return byteP.then(function (dataUrl) {
              if (!dataUrl) return;
              var rec = addImage(proj.id, { src: dataUrl, w: entry.w, h: entry.h, filename: entry.filename || "image" });
              if (rec) {
                newIds.push(rec.id);
                if (entry.objects && entry.objects.length) saveImageObjects(proj.id, rec.id, entry.objects);
                if (entry.canvas) updateImage(proj.id, rec.id, { canvas: entry.canvas });
              }
            });
          });
        }, Promise.resolve()).then(function () {
          if (newIds.length) reorderImages(proj.id, newIds);
          return getProject(proj.id);
        });
      });
    });
  }

  function seedIfEmpty() {}

  function clearAll(cb) {
    for (var k in KEYS) lsRemove(KEYS[k]);
    var docs = [];
    _projects.forEach(function (p) { docs.push("projects/" + p.id); p.images.forEach(function (im) { docs.push("images/" + im.id); }); });
    _brand.forEach(function (a) { docs.push("brand/" + a.id); });
    var assetIds = {};
    for (var key in ASSET) if (ASSET[key]) assetIds[ASSET[key]] = true;
    Object.keys(EMBDATA).forEach(function (id) { assetIds[id] = true; });
    _projects = []; _brand = []; IMG = {}; ASSET = {}; NEEDUP = {}; EMB = new Map(); EMBDATA = {}; _lastRaw = null;
    if (!db) { if (cb) cb(); return; }
    runLimited(docs, 4, function (path) { return syncDoc(path, async function () { return null; }).catch(function () {}); })
      .then(function () { return runLimited(Object.keys(assetIds), 3, deleteAsset); })
      .then(function () { if (cb) cb(); });
  }

  window.Store = {
    KEYS: KEYS, uid: uid, ready: ready, readyFresh: readyFresh, onChange: onChange, clearListeners: clearListeners,
    isFresh: function () { return _fresh; }, isLocal: function () { return LOCAL; }, backend: function () { return BACKEND; }, refresh: refresh, flush: flush, hasPending: hasPending, clearAll: clearAll,
    isReady: function () { return _ready; },
    saveImageObjectsBeacon: saveImageObjectsBeacon,
    getSession: getSession, setSession: setSession, clearSession: clearSession, isAuthed: isAuthed,
    getSettings: getSettings, setSettings: setSettings,
    getProjects: getProjects, getProject: getProject, createProject: createProject,
    updateProject: updateProject, deleteProject: deleteProject, duplicateProject: duplicateProject,
    exportProject: exportProject, importProject: importProject,
    addImage: addImage, getImage: getImage, updateImage: updateImage, deleteImage: deleteImage,
    duplicateImage: duplicateImage, saveImageObjects: saveImageObjects, reorderImages: reorderImages,
    pushRecent: pushRecent, getRecent: getRecent,
    getBrandAssets: getBrandAssets, addBrandAsset: addBrandAsset, deleteBrandAsset: deleteBrandAsset,
    setLastProject: setLastProject, getLastProject: getLastProject,
    totalImages: totalImages, storageUsedKB: storageUsedKB, seedIfEmpty: seedIfEmpty
  };
})();
