/* ============================================================
   store.js — data layer for Skytek Image Caption Studio
   ------------------------------------------------------------
   PROJECTS, IMAGES and BRAND ASSETS live in Supabase:
     • metadata  → Postgres tables (projects / images / brand_assets)
     • image bytes → Supabase Storage (private bucket, see config)
   DEVICE-LOCAL prefs stay in localStorage:
     • session (login), settings, recent feed, last-opened project.

   The rest of the app keeps its synchronous API. On page load,
   Store.ready(cb) connects, pulls all metadata into an in-memory
   cache, downloads image bytes as data URLs (so canvas export is
   never tainted by cross-origin URLs), then fires cb. Writes update
   the cache immediately (optimistic) and sync to Supabase in the
   background; Store.flush(cb) waits for pending writes to settle
   before a navigation that depends on them.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.SUPABASE_CONFIG || {};
  var BUCKET = CFG.bucket || "caption-images";
  var sb = (window.supabase && CFG.url && CFG.key)
    ? window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: false } })
    : null;

  var KEYS = {
    session:  "skytek.session",
    settings: "skytek.settings",
    recent:   "skytek.recent",
    lastOpen: "skytek.lastProject"
  };

  /* ---- localStorage helpers (device-local prefs only) ---- */
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.error("Store write failed:", e); return false; }
  }
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }
  function iso(ms) { return new Date(ms || Date.now()).toISOString(); }
  function ms(ts) { var n = Date.parse(ts); return isNaN(n) ? Date.now() : n; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ============================================================
     IN-MEMORY CACHE
     _projects: [{ id, name, description, createdAt, updatedAt, images:[
        { id, filename, w, h, addedAt, updatedAt, objects } ] }]
     _brand:    [{ id, name, w, h, addedAt }]
     IMG[id] = base64 data URL (image bytes, same-origin for canvas)
     PATH[id] = storage path in the bucket
  ============================================================ */
  var _projects = [], _brand = [], IMG = {}, PATH = {};
  var _ready = false, _starting = false, _readyCbs = [], _fatal = false;

  /* ---- pending-write tracking (for flush before navigation) ---- */
  var _pending = 0, _flushCbs = [];
  function track(promise) {
    _pending++;
    function settle() {
      _pending = Math.max(0, _pending - 1);
      if (_pending === 0) { var cbs = _flushCbs.slice(); _flushCbs.length = 0; cbs.forEach(function (f) { try { f(); } catch (e) {} }); }
    }
    promise.then(settle, function (err) {
      console.error("Supabase sync failed:", err);
      if (window.UI && UI.toast) UI.toast({ type: "danger", title: "Sync problem", desc: "A recent change may not have been saved." });
      settle();
    });
  }
  function flush(cb) { if (_pending <= 0) { if (cb) cb(); return; } if (cb) _flushCbs.push(cb); }
  function hasPending() { return _pending > 0; }
  // Surface a query error into track()'s catch handler.
  function chk(res) { if (res && res.error) throw res.error; return res; }

  // Persist an image's layers on page-unload. A normal Supabase write is
  // async and gets killed when the tab closes; a fetch with keepalive:true
  // is allowed to outlive the page, so the layer edits actually land. Also
  // updates the in-memory cache so a same-session reload is correct.
  function saveImageObjectsBeacon(projectId, imageId, objects) {
    var p = findCache(projectId);
    if (p) { var i = imgIndex(p, imageId); if (i >= 0) { p.images[i].objects = objects; p.images[i].updatedAt = Date.now(); p.updatedAt = Date.now(); } }
    if (!CFG.url || !CFG.key) return;
    try {
      fetch(CFG.url + "/rest/v1/images?id=eq." + encodeURIComponent(imageId), {
        method: "PATCH",
        headers: { apikey: CFG.key, Authorization: "Bearer " + CFG.key, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ objects: objects, updated_at: new Date().toISOString() }),
        keepalive: true
      });
    } catch (e) { /* best-effort */ }
  }

  /* ---- binary helpers ---- */
  function extFromDataUrl(d) {
    var m = /^data:image\/([a-z0-9.+-]+)/i.exec(d || "");
    var t = (m ? m[1] : "png").toLowerCase();
    if (t === "jpeg") return ".jpg";
    if (t === "svg+xml") return ".svg";
    return "." + t;
  }
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
  function uploadDataUrl(dataUrl, path) {
    var blob = dataUrlToBlob(dataUrl);
    return sb.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: blob.type || "image/png" })
      .then(function (res) { if (res && res.error) throw res.error; return res; });
  }
  function removePaths(paths) {
    paths = paths.filter(Boolean);
    if (!paths.length) return Promise.resolve();
    return sb.storage.from(BUCKET).remove(paths);
  }

  // Concurrency-limited task runner.
  function runLimited(items, limit, fn) {
    return new Promise(function (resolve) {
      var i = 0, active = 0, done = 0, n = items.length;
      if (!n) return resolve();
      function next() {
        while (active < limit && i < n) {
          var item = items[i++]; active++;
          Promise.resolve(fn(item)).then(fin, fin);
        }
      }
      function fin() { active--; if (++done >= n) resolve(); else next(); }
      next();
    });
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

  function init() {
    if (!sb) { showFatal("Supabase isn’t configured. Check assets/js/supabase-config.js."); return; }
    Promise.all([
      sb.from("projects").select("*").order("created_at", { ascending: false }),
      sb.from("images").select("*").order("project_id", { ascending: true }).order("sort_index", { ascending: true }),
      sb.from("brand_assets").select("*").order("created_at", { ascending: false })
    ]).then(function (r) {
      chk(r[0]); chk(r[1]); chk(r[2]);
      buildCache(r[0].data || [], r[1].data || [], r[2].data || []);
      var pre = _projects.length ? Promise.resolve() : seedDemo();
      return pre.then(downloadAllBytes);
    }).then(function () {
      fireReady();
    }).catch(function (e) {
      console.error(e);
      showFatal(friendlyError(e));
    });
  }

  function friendlyError(e) {
    var msg = (e && (e.message || e.error_description || e.hint)) || "";
    if (/relation .* does not exist|Could not find the table|schema cache/i.test(msg))
      return "Connected, but the database tables are missing. Run SUPABASE_SETUP.sql in your Supabase SQL editor, then reload.";
    if (/Failed to fetch|NetworkError|fetch/i.test(msg))
      return "Couldn’t reach Supabase. Check your connection and that the project is running.";
    return "Couldn’t load your data from Supabase. " + (msg || "");
  }

  function buildCache(projects, images, brand) {
    var byProj = {};
    _projects = projects.map(function (p) {
      var cp = { id: p.id, name: p.name, description: p.description || "", createdAt: ms(p.created_at), updatedAt: ms(p.updated_at), thumbnail: null, images: [] };
      byProj[p.id] = cp; return cp;
    });
    images.forEach(function (im) {
      var cp = byProj[im.project_id]; if (!cp) return;
      PATH[im.id] = im.storage_path || null;
      cp.images.push({ id: im.id, filename: im.filename || "image", w: im.w || 0, h: im.h || 0, addedAt: ms(im.created_at), updatedAt: ms(im.updated_at), objects: im.objects || [] });
    });
    _brand = brand.map(function (a) {
      PATH[a.id] = a.storage_path || null;
      return { id: a.id, name: a.name || "Asset", w: a.w || 0, h: a.h || 0, addedAt: ms(a.created_at) };
    });
  }

  function downloadAllBytes() {
    var tasks = [];
    _projects.forEach(function (p) { p.images.forEach(function (im) { if (PATH[im.id] && !IMG[im.id]) tasks.push(im.id); }); });
    _brand.forEach(function (a) { if (PATH[a.id] && !IMG[a.id]) tasks.push(a.id); });
    return runLimited(tasks, 5, function (id) {
      return sb.storage.from(BUCKET).download(PATH[id]).then(function (res) {
        if (res.error || !res.data) return;
        return blobToDataUrl(res.data).then(function (d) { IMG[id] = d; });
      }).catch(function () {});
    });
  }

  function seedDemo() {
    var defs = [
      { name: "Drone Inspection — Bay 4", description: "Annotated reference shots from the Q2 sensor audit." },
      { name: "Control Cabinet Layout", description: "Wiring & connector callouts for the field manual." }
    ];
    var now = Date.now();
    var rows = defs.map(function (d, i) {
      return { id: uid("prj"), name: d.name, description: d.description, created_at: iso(now - (defs.length - i)), updated_at: iso(now - (defs.length - i)) };
    });
    rows.forEach(function (r) { _projects.unshift({ id: r.id, name: r.name, description: r.description, createdAt: ms(r.created_at), updatedAt: ms(r.updated_at), thumbnail: null, images: [] }); });
    return sb.from("projects").insert(rows).then(chk).catch(function (e) { console.error("Seed failed:", e); });
  }

  function showFatal(message) {
    _fatal = true; _starting = false;
    function paint() {
      if (document.getElementById("sbFatal")) return;
      var wrap = document.createElement("div");
      wrap.id = "sbFatal";
      wrap.setAttribute("style", "position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:#0B1220;color:#E5EDF5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif");
      wrap.innerHTML =
        '<div style="max-width:440px;text-align:center">' +
          '<div style="width:52px;height:52px;margin:0 auto 18px;border-radius:14px;display:grid;place-items:center;background:rgba(239,68,68,.14);color:#F87171;font-size:26px">⚠</div>' +
          '<h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Can’t reach the database</h2>' +
          '<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#9FB0C0">' + escapeHtml(message) + '</p>' +
          '<button id="sbRetry" style="cursor:pointer;border:0;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:600;color:#fff;background:#00AEEF">Retry</button>' +
        '</div>';
      document.body.appendChild(wrap);
      document.getElementById("sbRetry").onclick = function () { location.reload(); };
    }
    if (document.body) paint(); else document.addEventListener("DOMContentLoaded", paint);
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- hydrate: attach cached bytes for rendering ---- */
  function hydrate(p) {
    if (!p) return p;
    var q = {}; for (var k in p) q[k] = p[k];
    q.images = (p.images || []).map(function (im) {
      var o = {}; for (var k2 in im) o[k2] = im[k2];
      o.src = IMG[im.id] || "";
      return o;
    });
    q.thumbnail = q.images.length ? (q.images[0].src || null) : null;
    return q;
  }
  function findCache(id) { for (var i = 0; i < _projects.length; i++) if (_projects[i].id === id) return _projects[i]; return null; }

  /* ---- session / auth (device-local) ---- */
  function getSession()   { return read(KEYS.session, null); }
  function setSession(s)  { write(KEYS.session, s); }
  function clearSession() { localStorage.removeItem(KEYS.session); }
  function isAuthed()     { var s = getSession(); return !!(s && s.user); }

  /* ---- settings (device-local) ---- */
  var DEFAULT_SETTINGS = {
    theme: "dark", autosave: true, autosaveInterval: 30, snapToGrid: true, gridSize: 20,
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

  function createProject(data) {
    var now = Date.now();
    var p = { id: uid("prj"), name: (data && data.name) || "Untitled Project", description: (data && data.description) || "", thumbnail: null, createdAt: now, updatedAt: now, images: [] };
    _projects.unshift(p);
    track(sb.from("projects").insert({ id: p.id, name: p.name, description: p.description, created_at: iso(now), updated_at: iso(now) }).then(chk));
    return hydrate(p);
  }
  function updateProject(id, patch) {
    var p = findCache(id); if (!p) return null;
    var now = Date.now();
    for (var k in patch) p[k] = patch[k];
    p.updatedAt = now;
    var db = { updated_at: iso(now) };
    if ("name" in patch) db.name = patch.name;
    if ("description" in patch) db.description = patch.description;
    track(sb.from("projects").update(db).eq("id", id).then(chk));
    return hydrate(p);
  }
  function deleteProject(id) {
    var p = findCache(id); if (!p) return;
    var paths = p.images.map(function (im) { return PATH[im.id]; });
    p.images.forEach(function (im) { delete IMG[im.id]; delete PATH[im.id]; });
    _projects = _projects.filter(function (x) { return x.id !== id; });
    if (read(KEYS.lastOpen, null) === id) localStorage.removeItem(KEYS.lastOpen);
    track(removePaths(paths).then(function () { return sb.from("projects").delete().eq("id", id).then(chk); }));
  }
  function duplicateProject(id) {
    var src = findCache(id); if (!src) return null;
    var idx = _projects.indexOf(src), now = Date.now();
    var copy = { id: uid("prj"), name: src.name + " copy", description: src.description, thumbnail: null, createdAt: now, updatedAt: now, images: [] };
    var uploads = [];
    src.images.forEach(function (im, i) {
      var nid = uid("img");
      copy.images.push({ id: nid, filename: im.filename, w: im.w, h: im.h, addedAt: now, updatedAt: now, objects: clone(im.objects) });
      if (IMG[im.id]) {
        var path = copy.id + "/" + nid + extFromDataUrl(IMG[im.id]);
        IMG[nid] = IMG[im.id]; PATH[nid] = path;
        uploads.push({ dataUrl: IMG[im.id], path: path, row: { id: nid, project_id: copy.id, filename: im.filename, w: im.w, h: im.h, objects: clone(im.objects), storage_path: path, sort_index: i, created_at: iso(now), updated_at: iso(now) } });
      }
    });
    _projects.splice(idx + 1, 0, copy);
    track((function () {
      return sb.from("projects").insert({ id: copy.id, name: copy.name, description: copy.description, created_at: iso(now), updated_at: iso(now) }).then(chk)
        .then(function () { return runLimited(uploads, 4, function (u) { return uploadDataUrl(u.dataUrl, u.path); }); })
        .then(function () { return uploads.length ? sb.from("images").insert(uploads.map(function (u) { return u.row; })).then(chk) : null; });
    })());
    return hydrate(copy);
  }

  /* ============================================================
     IMAGES
  ============================================================ */
  function addImage(projectId, img) {
    var p = findCache(projectId); if (!p) return null;
    var now = Date.now(), id = uid("img"), path = projectId + "/" + id + extFromDataUrl(img.src);
    var rec = { id: id, filename: img.filename || "image", w: img.w || 0, h: img.h || 0, addedAt: now, updatedAt: now, objects: [] };
    IMG[id] = img.src; PATH[id] = path;
    p.images.unshift(rec); p.updatedAt = now;
    track((function () {
      return uploadDataUrl(img.src, path)
        .then(function () { return sb.from("images").insert({ id: id, project_id: projectId, filename: rec.filename, w: rec.w, h: rec.h, objects: [], storage_path: path, sort_index: 0, created_at: iso(now), updated_at: iso(now) }).then(chk); })
        .then(function () { return sb.from("projects").update({ updated_at: iso(now) }).eq("id", projectId).then(chk); })
        .then(function () { return persistOrder(projectId); });
    })());
    return hydrate({ images: [rec] }).images[0];
  }
  function getImage(projectId, imageId) {
    var p = getProject(projectId); if (!p) return null;
    for (var i = 0; i < p.images.length; i++) if (p.images[i].id === imageId) return p.images[i];
    return null;
  }
  function imgIndex(p, imageId) { for (var i = 0; i < p.images.length; i++) if (p.images[i].id === imageId) return i; return -1; }

  function updateImage(projectId, imageId, patch) {
    var p = findCache(projectId); if (!p) return null;
    var i = imgIndex(p, imageId); if (i < 0) return null;
    var im = p.images[i], now = Date.now(), srcChanged = false;
    for (var k in patch) {
      if (k === "src") { IMG[imageId] = patch.src; srcChanged = true; }
      else im[k] = patch[k];
    }
    im.updatedAt = now; p.updatedAt = now;
    var db = { updated_at: iso(now) };
    ["filename", "w", "h", "objects"].forEach(function (kk) { if (kk in patch) db[kk] = patch[kk]; });
    track((function () {
      var pre = Promise.resolve();
      if (srcChanged) {
        var path = PATH[imageId] || (projectId + "/" + imageId + extFromDataUrl(patch.src));
        PATH[imageId] = path; db.storage_path = path;
        pre = uploadDataUrl(patch.src, path);
      }
      return pre
        .then(function () { return sb.from("images").update(db).eq("id", imageId).then(chk); })
        .then(function () { return sb.from("projects").update({ updated_at: iso(now) }).eq("id", projectId).then(chk); });
    })());
    return hydrate(p).images[i];
  }
  function deleteImage(projectId, imageId) {
    var p = findCache(projectId); if (!p) return false;
    var path = PATH[imageId];
    p.images = p.images.filter(function (im) { return im.id !== imageId; });
    p.updatedAt = Date.now();
    delete IMG[imageId]; delete PATH[imageId];
    track(removePaths([path]).then(function () { return sb.from("images").delete().eq("id", imageId).then(chk); }).then(function () { return persistOrder(projectId); }));
    return true;
  }
  function duplicateImage(projectId, imageId) {
    var p = findCache(projectId); if (!p) return null;
    var idx = imgIndex(p, imageId); if (idx < 0) return null;
    var src = p.images[idx], now = Date.now(), nid = uid("img");
    var copy = { id: nid, filename: (src.filename || "image").replace(/(\.[^.]+)?$/, " copy$1"), w: src.w, h: src.h, addedAt: now, updatedAt: now, objects: clone(src.objects) };
    var path = null;
    if (IMG[imageId]) { path = projectId + "/" + nid + extFromDataUrl(IMG[imageId]); IMG[nid] = IMG[imageId]; PATH[nid] = path; }
    p.images.splice(idx + 1, 0, copy); p.updatedAt = now;
    track((function () {
      var pre = path ? uploadDataUrl(IMG[nid], path) : Promise.resolve();
      return pre
        .then(function () { return sb.from("images").insert({ id: nid, project_id: projectId, filename: copy.filename, w: copy.w, h: copy.h, objects: copy.objects, storage_path: path, sort_index: idx + 1, created_at: iso(now), updated_at: iso(now) }).then(chk); })
        .then(function () { return persistOrder(projectId); });
    })());
    return hydrate({ images: [copy] }).images[0];
  }
  function saveImageObjects(projectId, imageId, objects) { return updateImage(projectId, imageId, { objects: objects }); }

  function reorderImages(projectId, orderedIds) {
    var p = findCache(projectId); if (!p) return false;
    var byId = {}; p.images.forEach(function (im) { byId[im.id] = im; });
    var next = [];
    orderedIds.forEach(function (id) { if (byId[id]) { next.push(byId[id]); delete byId[id]; } });
    p.images.forEach(function (im) { if (byId[im.id]) next.push(im); });
    p.images = next; p.updatedAt = Date.now();
    track(persistOrder(projectId));
    return true;
  }
  // Write each image's array position into its sort_index column.
  function persistOrder(projectId) {
    var p = findCache(projectId); if (!p) return Promise.resolve();
    return runLimited(p.images.map(function (im, i) { return { id: im.id, i: i }; }), 6, function (t) {
      return sb.from("images").update({ sort_index: t.i }).eq("id", t.id).then(chk);
    });
  }

  /* ============================================================
     BRAND ASSETS (global)
  ============================================================ */
  function getBrandAssets() {
    return _brand.map(function (a) { var o = {}; for (var k in a) o[k] = a[k]; o.src = IMG[a.id] || ""; return o; });
  }
  function addBrandAsset(img) {
    var now = Date.now(), id = uid("brand"), path = "brand/" + id + extFromDataUrl(img.src);
    var rec = { id: id, name: img.filename || "Asset", w: img.w || 0, h: img.h || 0, addedAt: now };
    IMG[id] = img.src; PATH[id] = path;
    _brand.unshift(rec);
    track(uploadDataUrl(img.src, path).then(function () {
      return sb.from("brand_assets").insert({ id: id, name: rec.name, w: rec.w, h: rec.h, storage_path: path, created_at: iso(now) }).then(chk);
    }));
    var out = {}; for (var k in rec) out[k] = rec[k]; out.src = img.src; return out;
  }
  function deleteBrandAsset(id) {
    var path = PATH[id];
    _brand = _brand.filter(function (a) { return a.id !== id; });
    delete IMG[id]; delete PATH[id];
    track(removePaths([path]).then(function () { return sb.from("brand_assets").delete().eq("id", id).then(chk); }));
    return true;
  }

  /* ---- recent feed + last project (device-local) ---- */
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
    var bytes = 0; for (var id in IMG) bytes += (IMG[id] || "").length;
    return Math.round(bytes / 1024);
  }

  /* ============================================================
     EXPORT / IMPORT  (.skproj = a ZIP archive)
     Layout inside the archive:
        project.json            manifest: name, description, and every
                                image's layer/object data + metadata
        images/0001-name.png    original image bytes, one file per image
     ============================================================ */
  function safeName(s) { return String(s || "image").replace(/[^\w.\-]+/g, "_").slice(0, 60); }
  function pad4(n) { n = String(n); while (n.length < 4) n = "0" + n; return n; }

  // Returns a Promise<{ blob, filename }>. The caller triggers the download.
  function exportProject(id) {
    if (!window.JSZip) return Promise.reject(new Error("Zip library not loaded."));
    var p = findCache(id);
    if (!p) return Promise.reject(new Error("Project not found."));
    var zip = new JSZip();
    var imagesDir = zip.folder("images");
    var manifest = {
      format: "skytek-caption-project",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      project: { name: p.name, description: p.description || "" },
      images: []
    };
    p.images.forEach(function (im, i) {
      var entry = { filename: im.filename || "image", w: im.w || 0, h: im.h || 0, objects: im.objects || [], type: null, file: null };
      var data = IMG[im.id];
      if (data && data.indexOf(",") > -1) {
        var mime = (/data:([^;]+)/.exec(data) || [])[1] || "image/png";
        var b64 = data.split(",")[1];
        var fname = pad4(i + 1) + "-" + safeName(im.filename || ("image" + extFromDataUrl(data)));
        if (!/\.[a-z0-9]+$/i.test(fname)) fname += extFromDataUrl(data);
        imagesDir.file(fname, b64, { base64: true });
        entry.type = mime; entry.file = "images/" + fname;
      }
      manifest.images.push(entry);
    });
    zip.file("project.json", JSON.stringify(manifest, null, 2));
    return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
      .then(function (blob) { return { blob: blob, filename: safeName(p.name) + ".skproj" }; });
  }

  // Reads a .skproj Blob/File and recreates it as a NEW project in Supabase.
  // Returns a Promise<project>. Image byte uploads are queued via track(),
  // so callers should Store.flush(cb) before navigating to the new project.
  function importProject(blob) {
    if (!window.JSZip) return Promise.reject(new Error("Zip library not loaded."));
    return JSZip.loadAsync(blob).then(function (zip) {
      var mf = zip.file("project.json");
      if (!mf) throw new Error("Not a valid .skproj file (missing project.json).");
      return mf.async("string").then(function (txt) {
        var manifest;
        try { manifest = JSON.parse(txt); } catch (e) { throw new Error("The project file is corrupt."); }
        if (!manifest || manifest.format !== "skytek-caption-project")
          throw new Error("This doesn’t look like a Skytek project file.");
        var proj = createProject({ name: (manifest.project && manifest.project.name) || "Imported project", description: (manifest.project && manifest.project.description) || "" });
        var imgs = manifest.images || [];
        var newIds = [];
        // Load each image's bytes (in manifest order), then add sequentially so
        // the recreated project keeps the original image order.
        return imgs.reduce(function (chain, entry) {
          return chain.then(function () {
            var filePath = entry.file;
            var byteP = (filePath && zip.file(filePath))
              ? zip.file(filePath).async("base64").then(function (b64) { return "data:" + (entry.type || "image/png") + ";base64," + b64; })
              : Promise.resolve(null);
            return byteP.then(function (dataUrl) {
              if (!dataUrl) return;
              var rec = addImage(proj.id, { src: dataUrl, w: entry.w, h: entry.h, filename: entry.filename || "image" });
              if (rec) {
                newIds.push(rec.id);
                if (entry.objects && entry.objects.length) saveImageObjects(proj.id, rec.id, entry.objects);
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

  // seedIfEmpty is now handled during ready(); kept as a no-op for callers.
  function seedIfEmpty() {}

  /* ---- clear everything (settings → danger zone) ---- */
  function clearAll(cb) {
    // wipe device-local prefs immediately
    for (var k in KEYS) localStorage.removeItem(KEYS[k]);
    var allPaths = [];
    _projects.forEach(function (p) { p.images.forEach(function (im) { if (PATH[im.id]) allPaths.push(PATH[im.id]); }); });
    _brand.forEach(function (a) { if (PATH[a.id]) allPaths.push(PATH[a.id]); });
    _projects = []; _brand = []; IMG = {}; PATH = {};
    if (!sb) { if (cb) cb(); return; }
    Promise.resolve()
      .then(function () { return removePaths(allPaths); })
      .then(function () { return sb.from("images").delete().neq("id", "__none__"); })
      .then(function () { return sb.from("projects").delete().neq("id", "__none__"); })
      .then(function () { return sb.from("brand_assets").delete().neq("id", "__none__"); })
      .then(function () { if (cb) cb(); }, function (e) { console.error(e); if (cb) cb(); });
  }

  window.Store = {
    KEYS: KEYS, uid: uid, ready: ready, flush: flush, hasPending: hasPending, clearAll: clearAll,
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
