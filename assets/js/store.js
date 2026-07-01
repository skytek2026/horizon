/* ============================================================
   store.js — data layer for Skytek Caption Studio
   Metadata (projects, settings, session) lives in localStorage.
   Image bytes (heavy base64) live in IndexedDB, mirrored in an
   in-memory cache so the rest of the app keeps a synchronous API.
   Call Store.ready(cb) once per page before rendering images.
   ============================================================ */
(function () {
  "use strict";

  var KEYS = {
    session:  "skytek.session",
    settings: "skytek.settings",
    projects: "skytek.projects",
    recent:   "skytek.recent",
    lastOpen: "skytek.lastProject",
    brand:    "skytek.brand"
  };

  /* ---- low-level localStorage helpers ---- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.error("Store write failed:", e); return false; }
  }
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  /* ============================================================
     IMAGE BLOB STORE (IndexedDB + in-memory cache)
     IMG[id] = base64 data URL. IndexedDB gives us hundreds of MB
     to GB of room, versus localStorage's ~5MB hard cap.
  ============================================================ */
  var DB_NAME = "skytek", DB_STORE = "images", DB_VER = 1;
  var _db = null, idbOK = false, IMG = {};
  var _ready = false, _starting = false, _readyCbs = [];

  function openDB(cb) {
    if (!("indexedDB" in window) || !window.indexedDB) { cb(null); return; }
    try {
      var req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      req.onsuccess = function () { cb(req.result); };
      req.onerror = function () { cb(null); };
    } catch (e) { cb(null); }
  }
  function idbPut(id, val) {
    if (!_db) return;
    try { _db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(val, id); } catch (e) {}
  }
  function idbDelete(id) {
    if (!_db) return;
    try { _db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).delete(id); } catch (e) {}
  }
  function idbLoadAll(cb) {
    if (!_db) { cb(); return; }
    try {
      var store = _db.transaction(DB_STORE, "readonly").objectStore(DB_STORE);
      var cur = store.openCursor();
      cur.onsuccess = function (e) {
        var c = e.target.result;
        if (c) { IMG[c.key] = c.value; c.continue(); }
        else cb();
      };
      cur.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }

  // One-time move of any inline base64 that still lives in the localStorage
  // projects blob (legacy data) into IndexedDB, then strip it out so the blob
  // becomes tiny and the ~5MB quota is freed.
  function migrateInlineSrcs() {
    var list = read(KEYS.projects, []);
    var changed = false;
    list.forEach(function (p) {
      if (p.thumbnail) { p.thumbnail = null; changed = true; }
      (p.images || []).forEach(function (im) {
        if (im.src) {
          IMG[im.id] = im.src;
          idbPut(im.id, im.src);
          delete im.src;
          changed = true;
        }
      });
    });
    if (changed) write(KEYS.projects, list);
  }

  // Ready = DB open + cache loaded + legacy data migrated. Safe to call many
  // times; every callback fires once initialisation has completed.
  function ready(cb) {
    if (_ready) { if (cb) cb(); return; }
    if (cb) _readyCbs.push(cb);
    if (_starting) return;
    _starting = true;
    openDB(function (db) {
      _db = db; idbOK = !!db;
      idbLoadAll(function () {
        if (idbOK) { try { migrateInlineSrcs(); } catch (e) { console.error(e); } }
        _ready = true;
        var cbs = _readyCbs.slice(); _readyCbs.length = 0;
        cbs.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
      });
    });
  }

  // Attach cached src (+ derived thumbnail) to a metadata record for rendering.
  // Returns shallow copies so callers can't accidentally persist base64 back
  // into the localStorage blob.
  function hydrate(p) {
    if (!p) return p;
    var q = {}; for (var k in p) q[k] = p[k];
    q.images = (p.images || []).map(function (im) {
      var o = {}; for (var k2 in im) o[k2] = im[k2];
      o.src = IMG[im.id] || im.src || "";
      return o;
    });
    q.thumbnail = q.images.length ? (q.images[0].src || null) : null;
    return q;
  }

  /* ---- session / auth ---- */
  function getSession()   { return read(KEYS.session, null); }
  function setSession(s)  { write(KEYS.session, s); }
  function clearSession() { localStorage.removeItem(KEYS.session); }
  function isAuthed()     { var s = getSession(); return !!(s && s.user); }

  /* ---- settings ---- */
  var DEFAULT_SETTINGS = {
    theme: "dark",
    autosave: true,
    autosaveInterval: 30,
    snapToGrid: true,
    gridSize: 20,
    showGrid: false,
    alignmentGuides: true,
    defaultExport: "png",
    fullName: "Skytek Operator",
    email: "operator@skytek.com"
  };
  function getSettings() {
    var s = read(KEYS.settings, {});
    var out = {};
    for (var k in DEFAULT_SETTINGS) out[k] = (s[k] !== undefined ? s[k] : DEFAULT_SETTINGS[k]);
    return out;
  }
  function setSettings(patch) {
    var s = getSettings();
    for (var k in patch) s[k] = patch[k];
    write(KEYS.settings, s);
    return s;
  }

  /* ---- projects ----
     Persisted (localStorage) image shape: { id, filename, w, h, addedAt,
     updatedAt, objects:[...] } — NO src. Image bytes live in IMG/IndexedDB.
     Reads go through hydrate() which re-attaches src for the UI. */
  function getProjectsRaw() { return read(KEYS.projects, []); }
  function getProjects() { return getProjectsRaw().map(hydrate); }

  // Persist metadata only. When IndexedDB is available we strip any base64 so
  // it can never bloat localStorage; without it we fall back to inline storage.
  function saveProjects(list) {
    if (idbOK) {
      list = list.map(function (p) {
        var q = {}; for (var k in p) q[k] = p[k];
        q.thumbnail = null;
        q.images = (p.images || []).map(function (im) {
          var o = {}; for (var k2 in im) o[k2] = im[k2];
          delete o.src;
          return o;
        });
        return q;
      });
    }
    return write(KEYS.projects, list);
  }

  function findRaw(id) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function getProject(id) { var p = findRaw(id); return p ? hydrate(p) : null; }

  function createProject(data) {
    var list = getProjectsRaw();
    var now = Date.now();
    var p = {
      id: uid("prj"),
      name: (data && data.name) || "Untitled Project",
      description: (data && data.description) || "",
      thumbnail: null,
      createdAt: now,
      updatedAt: now,
      images: []
    };
    list.unshift(p);
    saveProjects(list);
    return p;
  }
  function updateProject(id, patch) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        for (var k in patch) list[i][k] = patch[k];
        list[i].updatedAt = Date.now();
        saveProjects(list);
        return hydrate(list[i]);
      }
    }
    return null;
  }
  function duplicateProject(id) {
    var list = getProjectsRaw();
    var idx = -1, src = null;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { idx = i; src = list[i]; break; } }
    if (!src) return null;
    var now = Date.now();
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = uid("prj");
    copy.name = src.name + " copy";
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.images = copy.images.map(function (im) {
      var oldId = im.id;
      im.id = uid("img");
      im.addedAt = now;
      im.updatedAt = now;
      // clone the image bytes under the new id
      var bytes = IMG[oldId];
      if (bytes) { IMG[im.id] = bytes; idbPut(im.id, bytes); }
      return im;
    });
    list.splice(idx + 1, 0, copy);
    return saveProjects(list) ? hydrate(copy) : null;
  }
  function deleteProject(id) {
    var p = findRaw(id);
    if (p) (p.images || []).forEach(function (im) { delete IMG[im.id]; idbDelete(im.id); });
    var list = getProjectsRaw().filter(function (x) { return x.id !== id; });
    saveProjects(list);
    if (read(KEYS.lastOpen, null) === id) localStorage.removeItem(KEYS.lastOpen);
  }

  /* ---- images within a project ---- */
  function addImage(projectId, img) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === projectId) {
        var now = Date.now();
        var id = uid("img");
        var rec = {
          id: id,
          filename: img.filename || "image",
          w: img.w || 0,
          h: img.h || 0,
          addedAt: now,
          updatedAt: now,
          objects: []
        };
        // stash bytes in the image store (or inline as a last resort)
        IMG[id] = img.src;
        if (idbOK) idbPut(id, img.src); else rec.src = img.src;
        list[i].images.unshift(rec);
        list[i].updatedAt = now;
        if (saveProjects(list)) {
          var out = hydrate({ images: [rec] }).images[0];
          return out;
        }
        // write failed — roll back the cache/DB entry
        delete IMG[id]; if (idbOK) idbDelete(id);
        return null;
      }
    }
    return null;
  }
  function getImage(projectId, imageId) {
    var p = getProject(projectId);
    if (!p) return null;
    for (var i = 0; i < p.images.length; i++) if (p.images[i].id === imageId) return p.images[i];
    return null;
  }
  function updateImage(projectId, imageId, patch) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === projectId) {
        for (var j = 0; j < list[i].images.length; j++) {
          if (list[i].images[j].id === imageId) {
            var im = list[i].images[j];
            for (var k in patch) {
              if (k === "src") {
                IMG[imageId] = patch.src;
                if (idbOK) idbPut(imageId, patch.src); else im.src = patch.src;
              } else {
                im[k] = patch[k];
              }
            }
            im.updatedAt = Date.now();
            list[i].updatedAt = Date.now();
            saveProjects(list);
            return hydrate(list[i]).images[j];
          }
        }
      }
    }
    return null;
  }
  function deleteImage(projectId, imageId) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === projectId) {
        list[i].images = list[i].images.filter(function (im) { return im.id !== imageId; });
        list[i].updatedAt = Date.now();
        delete IMG[imageId]; idbDelete(imageId);
        saveProjects(list);
        return true;
      }
    }
    return false;
  }
  function duplicateImage(projectId, imageId) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === projectId) {
        var idx = list[i].images.findIndex(function (im) { return im.id === imageId; });
        if (idx < 0) return null;
        var src = list[i].images[idx];
        var copy = JSON.parse(JSON.stringify(src));
        copy.id = uid("img");
        copy.filename = (src.filename || "image").replace(/(\.[^.]+)?$/, " copy$1");
        copy.addedAt = copy.updatedAt = Date.now();
        var bytes = IMG[imageId];
        if (bytes) { IMG[copy.id] = bytes; if (idbOK) { idbPut(copy.id, bytes); delete copy.src; } else { copy.src = bytes; } }
        list[i].images.splice(idx + 1, 0, copy);
        saveProjects(list);
        return hydrate({ images: [copy] }).images[0];
      }
    }
    return null;
  }
  function saveImageObjects(projectId, imageId, objects) {
    return updateImage(projectId, imageId, { objects: objects });
  }
  function reorderImages(projectId, orderedIds) {
    var list = getProjectsRaw();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === projectId) {
        var byId = {};
        list[i].images.forEach(function (im) { byId[im.id] = im; });
        var next = [];
        orderedIds.forEach(function (id) { if (byId[id]) { next.push(byId[id]); delete byId[id]; } });
        list[i].images.forEach(function (im) { if (byId[im.id]) next.push(im); });
        list[i].images = next;
        list[i].updatedAt = Date.now();
        return saveProjects(list);
      }
    }
    return false;
  }

  /* ---- recent images (global feed) ---- */
  function pushRecent(entry) {
    var list = read(KEYS.recent, []);
    list = list.filter(function (r) { return !(r.projectId === entry.projectId && r.imageId === entry.imageId); });
    list.unshift({ projectId: entry.projectId, imageId: entry.imageId, filename: entry.filename, projectName: entry.projectName, at: Date.now() });
    list = list.slice(0, 24);
    write(KEYS.recent, list);
  }
  function getRecent() {
    var list = read(KEYS.recent, []);
    return list.filter(function (r) { return !!findRaw(r.projectId) && (function () {
      var p = findRaw(r.projectId);
      return p.images.some(function (im) { return im.id === r.imageId; });
    })(); });
  }

  /* ---- last opened project ---- */
  function setLastProject(id) { write(KEYS.lastOpen, id); }
  function getLastProject()  { return read(KEYS.lastOpen, null); }

  /* ---- stats ---- */
  function totalImages() {
    return getProjectsRaw().reduce(function (n, p) { return n + p.images.length; }, 0);
  }
  // True footprint = localStorage metadata + cached image bytes.
  function storageUsedKB() {
    var bytes = 0;
    for (var k in KEYS) { var v = localStorage.getItem(KEYS[k]); if (v) bytes += v.length; }
    for (var id in IMG) bytes += (IMG[id] || "").length;
    return Math.round(bytes / 1024);
  }

  /* ---- brand assets (global, reusable logos/graphics) ----
     Bytes live in the same IndexedDB image store (+ IMG cache); metadata in
     localStorage. Available across all projects. */
  function getBrandRaw() { return read(KEYS.brand, []); }
  function saveBrand(list) {
    if (idbOK) list = list.map(function (a) { var o = {}; for (var k in a) o[k] = a[k]; delete o.src; return o; });
    return write(KEYS.brand, list);
  }
  function getBrandAssets() {
    return getBrandRaw().map(function (a) {
      var o = {}; for (var k in a) o[k] = a[k];
      o.src = IMG[a.id] || a.src || "";
      return o;
    });
  }
  function addBrandAsset(img) {
    var id = uid("brand");
    IMG[id] = img.src;
    if (idbOK) idbPut(id, img.src);
    var rec = { id: id, name: img.filename || "Asset", w: img.w || 0, h: img.h || 0, addedAt: Date.now() };
    if (!idbOK) rec.src = img.src;
    var list = getBrandRaw(); list.unshift(rec);
    if (saveBrand(list)) { var out = {}; for (var k in rec) out[k] = rec[k]; out.src = img.src; return out; }
    delete IMG[id]; if (idbOK) idbDelete(id);
    return null;
  }
  function deleteBrandAsset(id) {
    var list = getBrandRaw().filter(function (a) { return a.id !== id; });
    delete IMG[id]; idbDelete(id);
    return saveBrand(list);
  }

  /* ---- seed demo data on first run ---- */
  function seedIfEmpty() {
    if (read(KEYS.projects, null) !== null) return;
    createProject({ name: "Drone Inspection — Bay 4", description: "Annotated reference shots from the Q2 sensor audit." });
    createProject({ name: "Control Cabinet Layout", description: "Wiring & connector callouts for the field manual." });
  }

  /* ---- clear everything (settings → danger zone) ---- */
  function clearAll() {
    for (var k in KEYS) localStorage.removeItem(KEYS[k]);
    IMG = {};
    if (_db) { try { _db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).clear(); } catch (e) {} }
  }

  window.Store = {
    KEYS: KEYS, uid: uid, ready: ready, clearAll: clearAll,
    getSession: getSession, setSession: setSession, clearSession: clearSession, isAuthed: isAuthed,
    getSettings: getSettings, setSettings: setSettings,
    getProjects: getProjects, getProject: getProject, createProject: createProject,
    updateProject: updateProject, deleteProject: deleteProject, duplicateProject: duplicateProject,
    addImage: addImage, getImage: getImage, updateImage: updateImage, deleteImage: deleteImage,
    duplicateImage: duplicateImage, saveImageObjects: saveImageObjects, reorderImages: reorderImages,
    pushRecent: pushRecent, getRecent: getRecent,
    getBrandAssets: getBrandAssets, addBrandAsset: addBrandAsset, deleteBrandAsset: deleteBrandAsset,
    setLastProject: setLastProject, getLastProject: getLastProject,
    totalImages: totalImages, storageUsedKB: storageUsedKB, seedIfEmpty: seedIfEmpty
  };
})();
