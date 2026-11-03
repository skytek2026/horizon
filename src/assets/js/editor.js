/* ============================================================
   editor.js — Image Caption Studio editor engine
   Handles: image loading, object model (labels/captions/icons/
   shapes/arrows), drag/resize/rotate, pan/zoom, grid+snap,
   alignment guides, layers, undo/redo, autosave, export.
   ============================================================ */
(function () {
  "use strict";
  if (!UI.requireAuth()) return;
  UI.initTheme();

  /* ------------------------------------------------------------
     DOM refs
  ------------------------------------------------------------ */
  var $ = function (id) { return document.getElementById(id); };
  var viewport = $("viewport"), stage = $("stage"), stageImg = $("stageImg"),
      objLayer = $("objLayer"), canvasWrap = $("canvasWrap"), stageGrid = $("stageGrid");

  /* ------------------------------------------------------------
     Load project / image
  ------------------------------------------------------------ */
  var params = new URLSearchParams(location.search);
  var projectId = params.get("project");
  var imageId = params.get("image");
  var project = null;
  var image = null;
  Store.setLastProject(projectId);

  /* ------------------------------------------------------------
     State
  ------------------------------------------------------------ */
  var settings = Store.getSettings();
  var S = {
    zoom: 1, panX: 0, panY: 0,
    objects: image ? JSON.parse(JSON.stringify(image.objects || [])) : [],
    selected: null,
    selectedIds: [],
    showGrid: settings.showGrid,
    snap: settings.snapToGrid,
    grid: settings.gridSize || 20,
    guides: settings.alignmentGuides,
    dirty: false
  };
  var history = [], future = [];
  var originalImageSrc = null;   // pixels as first loaded, for AI "revert"
  var HIST_LIMIT = 60;
  var gridZoomCache = null;
  var clipboard = null;       // copied object (deep clone) for Ctrl+C / Ctrl+V
  var pasteShift = 0;         // cascade offset for repeated pastes

  /* ------------------------------------------------------------
     Top-bar logo
  ------------------------------------------------------------ */
  $("topLogo").innerHTML = UI.logoSVG();
  $("topLogo").style.cssText = "display:block;width:100%;height:100%";
  $("btnBack").href = "project.html?id=" + projectId;
  UI.hydrateIcons();

  /* ============================================================
     OBJECT FACTORY
  ============================================================ */
  function uid() { return "o_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function topZ() { return S.objects.reduce(function (m, o) { return Math.max(m, o.z || 0); }, 0); }

  function baseFont() { return Math.max(15, Math.round((image ? image.w : 800) * 0.02)); }

  function makeObject(kind, opts) {
    opts = opts || {};
    var fs = baseFont();
    var o = {
      id: uid(), z: topZ() + 1, rot: 0, opacity: 1,
      x: 0, y: 0, w: 160, h: 48,
      color: "#ffffff", bg: "#00AEEF", borderColor: "#00AEEF", borderWidth: 0,
      radius: 8, font: "Inter", fontSize: fs, fontWeight: 600,
      italic: false, underline: false, align: "center", shadow: false, dropShadow: false,
      fillOpacity: 1, strokeOpacity: 1,
      text: "", captionStyle: "solid", iconKey: null, shapeKind: null
    };
    if (kind === "label") {
      o.type = "label"; o.text = opts.text || "Label";
      o.font = "Exo"; o.fontSize = 14; o.h = Math.round(o.fontSize * 2.2);
      o.captionStyle = "solid";
      if (opts.iconSide) { o.iconSide = opts.iconSide; o.iconKey = opts.iconKey || "Star"; }
      var iconExtra = o.iconSide ? Math.round(o.fontSize * 1.5) : 0;
      o.w = Math.max(80, Math.round(o.text.length * o.fontSize * 0.62) + 36 + iconExtra);
    } else if (kind === "caption") {
      o.type = "caption"; o.text = opts.text || "Caption";
      o.fontSize = Math.round(fs * 0.92); o.fontWeight = 500;
      o.bg = "#1F2937"; o.borderColor = "#00AEEF"; o.borderWidth = 0;
      o.captionStyle = "callout"; o.color = "#ffffff";
      o.h = Math.round(o.fontSize * 2.4);
      o.w = Math.max(120, Math.round(o.text.length * o.fontSize * 0.6) + 40);
    } else if (kind === "icon") {
      o.type = "icon"; o.iconKey = opts.iconKey; o.text = "";
      o.bg = "transparent"; o.borderWidth = 0; o.color = "#00AEEF";
      var sz = clamp(Math.round((image ? image.w : 800) * 0.08), 44, 160);
      o.w = sz; o.h = sz;
    } else if (kind === "shape") {
      o.type = "shape"; o.shapeKind = opts.shapeKind; o.text = "";
      o.bg = "transparent"; o.color = "#00AEEF"; o.borderColor = "#00AEEF"; o.borderWidth = 3;
      o.w = clamp(Math.round((image ? image.w : 800) * 0.18), 80, 320);
      o.h = clamp(Math.round((image ? image.w : 800) * 0.12), 60, 240);
      if (opts.shapeKind === "line" || opts.shapeKind === "highlight") o.h = clamp(Math.round((image ? image.w : 800) * 0.04), 24, 80);
      if (opts.shapeKind === "highlight") { o.bg = "#F59E0B"; o.opacity = 0.4; o.borderWidth = 0; }
    } else if (kind === "datestamp") {
      // A caption pre-filled with the current date, styled like a technical timestamp.
      o.type = "caption"; o.text = opts.text || formatStamp(); o.isStamp = true;
      o.font = "JetBrains Mono"; o.fontWeight = 700;
      o.fontSize = 14;
      o.color = "#ffffff"; o.bg = "#0B1220"; o.bgOpacity = 0.85; o.borderWidth = 0;
      o.captionStyle = "rounded"; o.shadow = true; o.align = "center";
      o.iconSide = "left"; o.iconKey = "clock";
      o.h = Math.round(o.fontSize * 2.2);
      o.w = Math.max(150, Math.round(o.text.length * o.fontSize * 0.66) + 24 + Math.round(o.fontSize * 1.8));
    } else if (kind === "titlebar") {
      // A draggable banner with logo, title, subtitle and styled background/border.
      o.type = "titlebar"; o.text = "";
      o.title = opts.title || "Image Title";
      o.subtitle = opts.subtitle || "Subtitle or description";
      o.showLogo = true; o.logo = null;          // logo = base64, or null for default mark
      o.color = "#ffffff";                         // text colour
      o.bg = "#0B1220"; o.bgOpacity = 0.85;        // background colour + opacity
      o.borderColor = "#00AEEF"; o.borderOpacity = 1; o.borderWidth = 0;
      o.radius = 0; o.font = "Inter";
      o.titleSize = 24; o.subSize = 14;
      o.titleFont = "Exo"; o.subtitleFont = "Inter";
      var iw = image ? image.w : 800;
      o.w = clamp(Math.round(iw * 0.6), 280, iw);
      o.h = clamp(Math.round(iw * 0.12), 64, 200);
    } else if (kind === "arrow") {
      o.type = "arrow"; o.shapeKind = opts.shapeKind; o.text = "";
      o.bg = "transparent"; o.color = "#FFFFFF"; o.borderColor = "#FFFFFF"; o.borderWidth = 2;
      o.arrowHead = "open"; o.dropShadow = false;
      o.w = clamp(Math.round((image ? image.w : 800) * 0.2), 100, 360);
      o.h = clamp(Math.round((image ? image.w : 800) * 0.1), 50, 160);
    } else if (kind === "watermark") {
      // Tiled / diagonal / corner watermark rendered as an SVG overlay.
      o.type = "watermark"; o.text = opts.text || "CONFIDENTIAL";
      o.wmStyle = opts.wmStyle || "tile";       // tile | band | corner
      o.color = "#ffffff"; o.bg = "transparent"; o.borderWidth = 0;
      o.font = "Inter"; o.fontWeight = 700;
      o.wmOpacity = 0.28;
      o.wmAngle = o.wmStyle === "corner" ? 0 : -30;
      o.wmDensity = 100;
      var iw3 = image ? image.w : 800, ih3 = image ? image.h : 600;
      o.fontSize = Math.round(iw3 * (o.wmStyle === "band" ? 0.075 : o.wmStyle === "corner" ? 0.028 : 0.032));
      if (o.wmStyle === "corner") {
        o.h = Math.round(o.fontSize * 1.8);
        o.w = Math.max(120, Math.round(o.text.length * o.fontSize * 0.62) + 24);
      } else if (o.wmStyle === "band") {
        o.w = iw3; o.h = Math.round(ih3 * 0.3);
      } else {
        o.w = iw3; o.h = ih3;
      }
    } else if (kind === "photo") {
      // An inset image placed on top of the base image.
      o.type = "photo"; o.src = opts.src; o.text = "";
      o.borderColor = "#ffffff"; o.borderWidth = 0; o.radius = 8; o.dropShadow = false;
      o.bg = "transparent";
      var natW = opts.w || 320, natH = opts.h || 220;
      var iw2 = image ? image.w : 800;
      var targetW = clamp(Math.round(iw2 * 0.4), 80, iw2);
      var scl = targetW / natW;
      o.w = Math.round(targetW); o.h = Math.max(40, Math.round(natH * scl));
    } else if (kind === "polygon") {
      // Freehand region. points are stored normalized (0..1) within the box,
      // so the existing move/resize/rotate machinery scales them for free.
      o.type = "polygon"; o.text = "";
      o.points = opts.points || [];
      o.color = "#00AEEF"; o.borderColor = "#00AEEF"; o.borderWidth = 3; o.strokeOpacity = 1;
      o.bg = "#00AEEF"; o.fillOpacity = 0.25;
      o.radius = 0;
    } else if (kind === "polyline") {
      // Freehand open line. Same normalized-point storage as polygon, but no fill and not closed.
      o.type = "polyline"; o.text = "";
      o.points = opts.points || [];
      o.color = "#00AEEF"; o.borderColor = "#00AEEF"; o.borderWidth = 4; o.strokeOpacity = 1;
      o.bg = "transparent"; o.radius = 0;
    } else if (kind === "textbox") {
      // Stacked text block: Title / Subtitle / Body, each independently styled.
      o.type = "textbox"; o.text = "";
      o.title = "Title"; o.subtitle = "Subtitle"; o.body = "Body text goes here.";
      o.titleShow = true; o.subtitleShow = true; o.bodyShow = true;
      o.titleColor = "#ffffff"; o.subtitleColor = "#9fb3c8"; o.bodyColor = "#e5e7eb";
      o.titleSize = 24; o.subtitleSize = 16; o.bodySize = 14;
      o.titleWeight = 700; o.subtitleWeight = 600; o.bodyWeight = 400;
      o.titleItalic = false; o.subtitleItalic = false; o.bodyItalic = false;
      o.titleFont = "Exo"; o.subtitleFont = "Inter"; o.bodyFont = "Inter";
      o.align = "left"; o.font = "Inter";
      o.bg = "#000000"; o.bgOpacity = 0.7; o.borderColor = "#ffffff"; o.borderOpacity = 1; o.borderWidth = 2; o.radius = 10; o.dropShadow = true;
      var iwt = image ? image.w : 800;
      o.w = clamp(Math.round(iwt * 0.34), 160, 900);
      o.h = Math.round(o.titleSize * 1.35 + o.subtitleSize * 1.5 + o.bodySize * 2.6 + fs * 1.2);
    } else if (kind === "legend") {
      // A key/legend: a styled container of {color, label, value} items,
      // laid out inline (a pill) or stacked. Auto-fits its content.
      o.type = "legend"; o.text = "";
      o.items = opts.items || [
        { color: "#22C55E", label: "Undamaged", value: "35%" },
        { color: "#EF4444", label: "Damaged", value: "65%" }
      ];
      o.layout = "inline";        // "inline" | "stacked"
      o.showValue = true;         // show the "(value)" suffix
      o.dotShape = "circle";      // "circle" | "square"
      o.dotSize = Math.round(fs * 0.85);
      o.labelColor = "#ffffff"; o.labelSize = 16; o.labelWeight = 400;
      o.font = "Exo";
      o.bg = "#000000"; o.bgOpacity = 0.7;
      o.borderColor = "#ffffff"; o.borderOpacity = 1; o.borderWidth = 2;
      o.radius = 24; o.itemGap = 20; o.padX = 18; o.padY = 10;
      fitLegend(o);
    }
    if (kind === "kit" || kind === "track") Kit.init(o, kind === "track" ? "track" : opts.variant, opts);
    return o;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // Current date/time formatted for a stamp, e.g. "2026-06-29  14:32".
  function formatStamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "   " + p(d.getHours()) + ":" + p(d.getMinutes());
  }


  /* ============================================================
     MAP KIT — callout cards, detection rings, scale bar, track.
     Each component is described once as drawing primitives
     (path / text / image) in object-local px. svg() renders them
     on the canvas, draw() paints the export canvas — so both
     always match and keep the page's web fonts.
  ============================================================ */
  var Kit = (function () {
    var TYPES = { callout: 1, ring: 1, scalebar: 1, track: 1, shiptag: 1, distance: 1, aoi: 1, poipin: 1, zonelabel: 1, placelabel: 1, stamp2: 1, maplegend: 1, footer: 1 };
    var LASTBOX = typeof WeakMap !== "undefined" ? new WeakMap() : { get: function () {}, set: function () {} };
    var AUTOSIZE = { shiptag: 1, poipin: 1, zonelabel: 1, placelabel: 1, stamp2: 1, maplegend: 1 };
    var NAVY = "#0B1A2E", MUTED = "#8FA3B8";
    function has(t) { return !!TYPES[t]; }
    function iw() { return image ? image.w : 1200; }
    function unit(r, min) { return Math.max(min, Math.round(iw() * r)); }
    function r1(n) { return Math.round(n * 10) / 10; }
    function esc(s) { return UI.escapeHtml(String(s == null ? "" : s)); }

    /* ---- path builders: SVG path strings, also valid for canvas Path2D ---- */
    function pRect(x, y, w, h, r) {
      var c = Array.isArray(r) ? r : [r, r, r, r];
      var m = Math.max(0, Math.min(w, h) / 2);
      c = c.map(function (v) { return Math.max(0, Math.min(v || 0, m)); });
      function arc(rr, ex, ey) { return rr ? "A" + r1(rr) + " " + r1(rr) + " 0 0 1 " + r1(ex) + " " + r1(ey) : ""; }
      return "M" + r1(x + c[0]) + " " + r1(y) +
        "H" + r1(x + w - c[1]) + arc(c[1], x + w, y + c[1]) +
        "V" + r1(y + h - c[2]) + arc(c[2], x + w - c[2], y + h) +
        "H" + r1(x + c[3]) + arc(c[3], x, y + h - c[3]) +
        "V" + r1(y + c[0]) + arc(c[0], x + c[0], y) + "Z";
    }
    function pCircle(cx, cy, r) {
      return "M" + r1(cx - r) + " " + r1(cy) + "A" + r1(r) + " " + r1(r) + " 0 1 0 " + r1(cx + r) + " " + r1(cy) +
        "A" + r1(r) + " " + r1(r) + " 0 1 0 " + r1(cx - r) + " " + r1(cy) + "Z";
    }
    function pLine(pts, closed) {
      return pts.map(function (p, i) { return (i ? "L" : "M") + r1(p[0]) + " " + r1(p[1]); }).join("") + (closed ? "Z" : "");
    }
    function textW(s, weight, size, font, ls) { return measureTextW(String(s || ""), weight, size, font) + (ls || 0) * String(s || "").length; }
    function wrap(s, maxW, weight, size, font) {
      var out = [];
      String(s || "").split(/\n/).forEach(function (para) {
        var words = para.split(/\s+/).filter(Boolean), line = "";
        if (!words.length) { out.push(""); return; }
        words.forEach(function (wd) {
          var t = line ? line + " " + wd : wd;
          if (line && measureTextW(t, weight, size, font) > maxW) { out.push(line); line = wd; } else line = t;
        });
        out.push(line);
      });
      return out;
    }
    function T(x, y, s, size, weight, font, fill, anchor, ls, outline) {
      return { t: "text", x: x, y: y, s: s, size: Math.round(size), weight: weight, font: font, fill: fill, anchor: anchor || "start", ls: ls || 0, outline: outline || null };
    }
    // Rotate a local point of o (box top-left origin) into image coordinates.
    function toImg(o, lx, ly, h) {
      var a = (o.rot || 0) * Math.PI / 180, cx = o.w / 2, cy = h / 2, dx = lx - cx, dy = ly - cy;
      return { x: o.x + cx + dx * Math.cos(a) - dy * Math.sin(a), y: o.y + cy + dx * Math.sin(a) + dy * Math.cos(a) };
    }

    // Leader line colour/thickness are independent of the header/accent colour.
    function leaderColor(o) { return o.leaderColor || o.accent; }
    function leaderWidth(o) { return o.leaderW > 0 ? o.leaderW : Math.max(1.5, o.f * 0.14); }

    // Arrowhead whose tip sits at (ex, ey), pointing along (sx,sy)→(ex,ey). Returns the
    // shortened line end (so the line stops at the arrow's base) plus the arrow prims.
    function arrowEnd(sx, sy, ex, ey, col, f, lw) {
      var dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      var len = Math.max(lw * 3.2, f * 1.15), wid = Math.max(lw * 2.8, f * 0.95);
      len = Math.min(len, L * 0.9);
      var bx = ex - ux * len, by = ey - uy * len, px = -uy * wid / 2, py = ux * wid / 2;
      var tri = pLine([[ex, ey], [bx + px, by + py], [bx - px, by - py]], true);
      return { lx: bx + ux * len * 0.25, ly: by + uy * len * 0.25,
               prims: [{ t: "path", d: tri, fill: col, stroke: "#000", strokeOp: 0.35, sw: 1, join: "round" }] };
    }

    /* ============================ CALLOUT ============================ */
    var CALLOUTS = {
      alert: { accent: "#E09A16", header: "NO AIS SIGNAL", headerRight: "", title: "", rows: [],
               body: "Vessel detected in imagery with no matching AIS transmission at acquisition time.",
               media: "none", leaderAngle: 90, leaderLen: 10, leaderEnd: "ring", wf: 21 },
      event: { accent: "#2F80ED", header: "EVENT", headerRight: "", title: "VESSEL NAME",
               rows: [{ k: "TIME", v: "2026-10-15 08:58 UTC" }, { k: "SPEED", v: "11.1 kt → 0.9 kt" }],
               body: "Short note explaining the event.", media: "none", leaderAngle: 205, leaderLen: 8, leaderEnd: "dot", wf: 23 },
      zoom:  { accent: "#E5323E", header: "VESSEL DETECTED", headerRight: "ZOOM", title: "WINE TRADER",
               rows: [{ k: "LAT", v: "45°00′25.0″ N" }, { k: "LON", v: "029°59′54.6″ E" }],
               body: "", media: "zoom", leaderAngle: 90, leaderLen: 12, leaderEnd: "dot", wf: 33 }
    };

    function headerSize(o) { return o.headerSize > 0 ? o.headerSize : Math.round(o.f * 0.86); }
    function calloutLayout(o) {
      var f = o.f, w = o.w, pad = Math.round(f * 1.25), innerW = Math.max(10, w - pad * 2);
      var hasHeader = !!(o.header || o.headerRight);
      var hh = hasHeader ? Math.max(Math.round(f * 2.3), Math.round(headerSize(o) * 2.6)) : 0;
      var mediaH = (o.media === "zoom" || (o.media === "upload" && o.image)) ? Math.round(w * (o.imgRatio || 0.62)) : 0;
      var y = hh + mediaH, content = [], any = false;
      if (o.title) {
        var ts = Math.round(f * 1.7), tlh = Math.round(ts * 1.22);
        y += Math.round(pad * 0.8);
        wrap(o.title, innerW, 700, ts, "Exo").forEach(function (ln) {
          content.push(T(pad, y + tlh / 2, ln, ts, 700, "Exo", "#ffffff")); y += tlh;
        });
        any = true;
      }
      if (o.rows && o.rows.length) {
        y += any ? Math.round(f * 0.45) : Math.round(pad * 0.6);
        var rh = Math.round(f * 2.25);
        o.rows.forEach(function (r) {
          content.push({ t: "path", d: pLine([[pad, y], [w - pad, y]]), stroke: "#ffffff", strokeOp: 0.13, sw: 1 });
          content.push(T(pad, y + rh / 2, r.k || "", f * 0.78, 600, "Inter", MUTED, "start", f * 0.14));
          content.push(T(w - pad, y + rh / 2, r.v || "", f * 1.0, 600, "JetBrains Mono", "#ffffff", "end"));
          y += rh;
        });
        any = true;
      }
      if (o.body) {
        y += any ? Math.round(f * 0.55) : Math.round(pad * 0.85);
        var blh = Math.round(f * 1.5);
        wrap(o.body, innerW, 400, f, "Inter").forEach(function (ln) {
          content.push(T(pad, y + blh / 2, ln, f, 400, "Inter", "#D5E0EB")); y += blh;
        });
        any = true;
      }
      if (any) y += Math.round(pad * 0.85);
      var h = Math.max(y, hh || Math.round(f * 2));
      return { h: h, hh: hh, pad: pad, mediaY: hh, mediaH: mediaH, content: content, any: any };
    }

    function calloutLeader(o, h) {
      var a = (o.leaderAngle || 0) * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
      var cx = o.w / 2, cy = h / 2;
      var t = Math.min(Math.abs(dx) > 1e-6 ? cx / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? cy / Math.abs(dy) : Infinity);
      var sx = cx + dx * t, sy = cy + dy * t, len = Math.max(0, o.leaderLen || 0);
      return { sx: sx, sy: sy, ex: sx + dx * len, ey: sy + dy * len };
    }

    function calloutPrims(o) {
      var L = calloutLayout(o), f = o.f, w = o.w, h = L.h, prims = [];
      var col = o.accent, rad = Math.round(o.radius == null ? f * 0.6 : o.radius);
      // leader (under the card)
      if (o.leaderShow) {
        var g = calloutLeader(o, h), lw = leaderWidth(o), lcol = leaderColor(o);
        var arr = o.leaderEnd === "arrow" ? arrowEnd(g.sx, g.sy, g.ex, g.ey, lcol, f, lw) : null;
        var tip = [[g.sx, g.sy], arr ? [arr.lx, arr.ly] : [g.ex, g.ey]];
        prims.push({ t: "path", d: pLine(tip), stroke: "#000", strokeOp: 0.35, sw: lw + 2, cap: "round" });
        prims.push({ t: "path", d: pLine(tip), stroke: lcol, sw: lw, cap: "round" });
        if (arr) prims = prims.concat(arr.prims);
        else if (o.leaderEnd === "dot") prims.push({ t: "path", d: pCircle(g.ex, g.ey, Math.max(f * 0.36, lw * 1.6)), fill: lcol, stroke: "#000", strokeOp: 0.35, sw: 1 });
        else if (o.leaderEnd === "ring") {
          var rr = Math.max(f * 0.85, lw * 3);
          prims.push({ t: "path", d: pCircle(g.ex, g.ey, rr), stroke: "#000", strokeOp: 0.35, sw: lw * 1.3 + 2 });
          prims.push({ t: "path", d: pCircle(g.ex, g.ey, rr), stroke: lcol, sw: lw * 1.3, fill: lcol, fillOp: 0.08 });
        }
        var tp = toImg(o, g.ex, g.ey, h);
        o.zoomX = Math.round(tp.x); o.zoomY = Math.round(tp.y);
      }
      // card
      prims.push({ t: "path", d: pRect(0, 0, w, h, rad), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.94 : o.bgOpacity,
                   stroke: "#ffffff", strokeOp: 0.08, sw: 1, shadow: { blur: Math.round(f * 1.6), dy: Math.round(f * 0.5), op: 0.45 } });
      if (L.hh) {
        var flatBottom = L.mediaH || L.any;
        prims.push({ t: "path", d: pRect(0, 0, w, L.hh, [rad, rad, flatBottom ? 0 : rad, flatBottom ? 0 : rad]), fill: col });
        var hc = o.headerColor || "#ffffff", hs = headerSize(o), tx = L.pad, dr = hs * 0.35;
        if (o.headerDot !== false) {
          prims.push({ t: "path", d: pCircle(L.pad + dr, L.hh / 2, dr), fill: hc });
          tx = L.pad + dr * 2 + hs * 0.5;
        }
        if (o.header) prims.push(T(tx, L.hh / 2, o.header, hs, 700, "Inter", hc, "start", hs * 0.2));
        if (o.headerRight) prims.push(T(w - L.pad, L.hh / 2, o.headerRight, hs, 600, "Inter", hc, "end", hs * 0.16));
      }
      if (L.mediaH) {
        if (o.media === "upload" && o.image) {
          prims.push({ t: "image", x: 0, y: L.mediaY, w: w, h: L.mediaH, src: o.image, natW: o.imgW || w, natH: o.imgH || L.mediaH });
        } else if (o.media === "zoom" && image && image.src) {
          // the zoom reads the image's own pixels: convert from canvas coordinates
          var BX = image.bx || 0, BY = image.by || 0, BW = image.bw || image.w, BH = image.bh || image.h;
          var z = Math.max(1, o.zoom || 4), sw = w / z, sh = L.mediaH / z;
          var cx = (o.zoomX != null ? o.zoomX : image.w / 2) - BX, cy = (o.zoomY != null ? o.zoomY : image.h / 2) - BY;
          var sx = Math.max(0, Math.min(BW - sw, cx - sw / 2)), sy = Math.max(0, Math.min(BH - sh, cy - sh / 2));
          prims.push({ t: "path", d: pRect(0, L.mediaY, w, L.mediaH, 0), fill: "#000" });
          prims.push({ t: "image", x: 0, y: L.mediaY, w: w, h: L.mediaH, src: image.src, natW: BW, natH: BH,
                       crop: { sx: sx, sy: sy, sw: Math.min(sw, BW), sh: Math.min(sh, BH) } });
        }
      }
      return prims.concat(L.content);
    }

    /* ============================ RING ============================ */
    var RINGS = {
      match:  { accent: "#22C55E", ringStyle: "ring",   halo: false, size: [0.014, 22] },
      noais:  { accent: "#F59E0B", ringStyle: "ring",   halo: false, size: [0.014, 22] },
      poi:    { accent: "#E5323E", ringStyle: "dot",    halo: false, size: [0.014, 22] },
      target: { accent: "#E5323E", ringStyle: "target", halo: true,  size: [0.058, 70] }
    };
    function ringPrims(o) {
      var D = Math.min(o.w, o.h), cx = o.w / 2, cy = o.h / 2, col = o.accent, prims = [];
      var R = o.halo ? D * 0.25 : (o.ringStyle === "target" ? D * 0.31 : D * 0.41);
      var sw = Math.max(1.5, R * 0.16);
      if (o.halo) {
        prims.push({ t: "path", d: pCircle(cx, cy, D * 0.48), fill: col, fillOp: 0.12, stroke: col, strokeOp: 0.5,
                     sw: Math.max(1, sw * 0.6), dash: [r1(sw * 2.2), r1(sw * 1.6)] });
      }
      prims.push({ t: "path", d: pCircle(cx, cy, R), stroke: "#000", strokeOp: 0.35, sw: sw + 2 });
      prims.push({ t: "path", d: pCircle(cx, cy, R), stroke: col, sw: sw, fill: col, fillOp: o.ringFill == null ? 0.08 : o.ringFill });
      if (o.ringStyle === "dot") prims.push({ t: "path", d: pCircle(cx, cy, R * 0.36), fill: col });
      if (o.ringStyle === "target") {
        [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(function (u) {
          var seg = [[cx + u[0] * R * 0.55, cy + u[1] * R * 0.55], [cx + u[0] * R * 1.35, cy + u[1] * R * 1.35]];
          prims.push({ t: "path", d: pLine(seg), stroke: "#000", strokeOp: 0.35, sw: sw + 2, cap: "round" });
          prims.push({ t: "path", d: pLine(seg), stroke: col, sw: sw, cap: "round" });
        });
        prims.push({ t: "path", d: pCircle(cx, cy, Math.max(1.5, sw * 0.55)), fill: col });
      }
      return prims;
    }

    /* ============================ SCALE BAR ============================ */
    function fmtNum(v) { return String(+(+v).toFixed(2)); }
    function scaleLayout(o) {
      var f = o.f, pad = Math.round(f * 1.0), bh = Math.max(3, Math.round(f * 0.42));
      var leftH = f * 1.35 + bh, ah = f * 1.7, northH = o.showNorth ? ah + f * 1.3 : 0;
      var inner = Math.max(leftH, northH);
      return { f: f, pad: pad, bh: bh, ah: ah, leftTop: pad + (inner - leftH) / 2, h: Math.round(pad * 2 + inner), nW: o.showNorth ? Math.round(f * 2.4) : 0 };
    }
    function scalePrims(o) {
      var L = scaleLayout(o), f = L.f, w = o.w, h = L.h, col = o.color || "#ffffff", prims = [];
      if (o.panel !== false) prims.push({ t: "path", d: pRect(0, 0, w, h, Math.round(f * 0.45)), fill: o.bg || NAVY,
        fillOp: o.bgOpacity == null ? 0.88 : o.bgOpacity, stroke: "#ffffff", strokeOp: 0.08, sw: 1 });
      var x0 = L.pad, x1 = w - L.pad - (L.nW ? L.nW + f * 0.8 : 0);
      var n = Math.max(1, Math.min(10, Math.round(o.divisions || 2))), segW = (x1 - x0) / n;
      var ly = L.leftTop + f * 0.55, by = L.leftTop + f * 1.35, max = +o.maxValue || 1;
      for (var i = 0; i <= n; i++) {
        var lab = fmtNum(max * i / n) + (i === n ? " " + (o.unit || "") : "");
        prims.push(T(x0 + segW * i, ly, lab.trim(), f * 0.9, 500, "Inter", col, i === 0 ? "start" : (i === n ? "end" : "middle")));
      }
      for (var s = 0; s < n; s += 2) prims.push({ t: "path", d: pRect(x0 + segW * s, by, segW, L.bh, 0), fill: col });
      prims.push({ t: "path", d: pRect(x0, by, x1 - x0, L.bh, 0), stroke: col, sw: Math.max(1, f * 0.09) });
      if (o.showNorth) {
        var nx = w - L.pad - L.nW / 2, ty = L.pad, ah = L.ah, aw = ah * 0.62, ccy = ty + ah / 2;
        var a = (o.northRot || 0) * Math.PI / 180;
        var rot = function (p) { return [nx + p[0] * Math.cos(a) - p[1] * Math.sin(a), ccy + p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
        var tipP = rot([0, -ah / 2]), rgt = rot([aw / 2, ah / 2]), notch = rot([0, ah * 0.22]), lft = rot([-aw / 2, ah / 2]);
        prims.push({ t: "path", d: pLine([tipP, rgt, notch, lft], true), fill: col });
        prims.push({ t: "path", d: pLine([tipP, rgt, notch], true), fill: "#000", fillOp: 0.28 });
        prims.push(T(nx, ty + ah + f * 0.7, "N", f * 0.85, 700, "Inter", col, "middle"));
      }
      return prims;
    }

    /* ============================ TRACK ============================ */
    var SAMPLE_TIMES = ["08:12", "08:34", "08:58"];
    function trackPins(o) {
      var n = (o.points || []).length, start = o.pinStart ? 0 : 1, out = [];
      for (var i = start; i < n; i++) out.push(i);
      return out;
    }
    function trackPrims(o) {
      var f = o.f, col = o.accent, sw = Math.max(1, o.lineW || 3), prims = [];
      var pts = (o.points || []).map(function (p) { return [p.x * o.w, p.y * o.h]; });
      if (pts.length < 2) return prims;
      prims.push({ t: "path", d: pLine(pts), stroke: "#000", strokeOp: 0.35, sw: sw + 2, cap: "round", join: "round" });
      prims.push({ t: "path", d: pLine(pts), stroke: col, sw: sw, cap: "round", join: "round" });
      if (o.chevrons !== false) {
        for (var i = 0; i < pts.length - 1; i++) {
          var A = pts[i], B = pts[i + 1], dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy);
          if (len < f * 3.2) continue;
          var ux = dx / len, uy = dy / len, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, s = f * 0.6;
          var chev = [[mx - ux * s * 0.5 - uy * s * 0.85, my - uy * s * 0.5 + ux * s * 0.85], [mx + ux * s * 0.5, my + uy * s * 0.5],
                      [mx - ux * s * 0.5 + uy * s * 0.85, my - uy * s * 0.5 - ux * s * 0.85]];
          prims.push({ t: "path", d: pLine(chev), stroke: "#000", strokeOp: 0.35, sw: sw + 2, cap: "round", join: "round" });
          prims.push({ t: "path", d: pLine(chev), stroke: col, sw: sw, cap: "round", join: "round" });
        }
      }
      var pr = Math.round(f * 0.95);
      trackPins(o).forEach(function (idx, k) {
        var p = pts[idx];
        if (o.numbers !== false) {
          prims.push({ t: "path", d: pCircle(p[0], p[1], pr), fill: col, stroke: "#ffffff", sw: Math.max(1.5, f * 0.16),
                       shadow: { blur: Math.round(f * 0.6), dy: Math.round(f * 0.15), op: 0.4 } });
          prims.push(T(p[0], p[1], String(k + 1), f * 1.0, 700, "Inter", "#ffffff", "middle"));
        } else {
          prims.push({ t: "path", d: pCircle(p[0], p[1], pr * 0.55), fill: col, stroke: "#ffffff", sw: Math.max(1.2, f * 0.12) });
        }
        var tm = (o.times || [])[k];
        if (o.showTimes !== false && tm) {
          var ts = Math.round(f * 0.88), cw = textW(tm, 600, ts, "JetBrains Mono") + f * 1.1, ch = Math.round(f * 1.75);
          var cxp = p[0] + (o.numbers !== false ? pr : pr * 0.55) + f * 0.45;
          prims.push({ t: "path", d: pRect(cxp, p[1] - ch / 2, cw, ch, Math.round(f * 0.3)), fill: NAVY, fillOp: 0.9, stroke: "#ffffff", strokeOp: 0.1, sw: 1 });
          prims.push(T(cxp + cw / 2, p[1], tm, ts, 600, "JetBrains Mono", "#ffffff", "middle"));
        }
      });
      return prims;
    }


    /* ============================ MORE MAP COMPONENTS ============================ */
    function leaderEnd(o, h, col, f, endKind) {
      var g = calloutLeader(o, h), lw = o.leaderW > 0 ? o.leaderW : Math.max(1.5, f * 0.14), out = [];
      var arr = endKind === "arrow" ? arrowEnd(g.sx, g.sy, g.ex, g.ey, col, f, lw) : null;
      var seg = [[g.sx, g.sy], arr ? [arr.lx, arr.ly] : [g.ex, g.ey]];
      out.push({ t: "path", d: pLine(seg), stroke: "#000", strokeOp: 0.35, sw: lw + 2, cap: "round" });
      out.push({ t: "path", d: pLine(seg), stroke: col, sw: lw, cap: "round" });
      if (arr) return out.concat(arr.prims);
      if (endKind === "ring") {
        var rr = Math.max(f * 0.8, lw * 3);
        out.push({ t: "path", d: pCircle(g.ex, g.ey, rr), stroke: "#000", strokeOp: 0.35, sw: lw * 1.4 + 2 });
        out.push({ t: "path", d: pCircle(g.ex, g.ey, rr), stroke: col, sw: lw * 1.4, fill: col, fillOp: 0.1 });
      } else if (endKind === "dot") out.push({ t: "path", d: pCircle(g.ex, g.ey, Math.max(f * 0.36, lw * 1.6)), fill: col });
      return out;
    }

    // 05 — AIS ship tag: name + optional detail rows (type, IMO, flag…) with accent bar + leader to a ring
    function shipDetails(o) { return String(o.detail || "").split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
    function shiptagLayout(o) {
      var f = o.f, ts = f * 1.25, bar = Math.max(3, Math.round(f * 0.3)), px = Math.round(f * 0.8), th = Math.round(f * 2.4);
      var det = shipDetails(o), ds = Math.round(f * 0.85), dlh = Math.round(f * 1.3), tp = Math.round(f * 0.55), nlh = Math.round(f * 1.6);
      var tw = textW(o.label || " ", 600, Math.round(ts), "Inter");
      det.forEach(function (l) { tw = Math.max(tw, textW(l, 500, ds, "Inter")); });
      var h = det.length ? tp + nlh + Math.round(f * 0.1) + det.length * dlh + Math.round(f * 0.55) : th;
      var w = Math.round(bar + px * 2 + tw), rad = Math.round(f * 0.25);
      var prims = [];
      if (o.leaderShow !== false) prims = prims.concat(leaderEnd({ w: w, leaderAngle: o.leaderAngle, leaderLen: o.leaderLen, leaderW: o.leaderW }, h, leaderColor(o), f, o.leaderEnd || "ring"));
      prims.push({ t: "path", d: pRect(0, 0, w, h, rad), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.92 : o.bgOpacity,
                   shadow: { blur: Math.round(f * 0.8), dy: Math.round(f * 0.25), op: 0.35 } });
      prims.push({ t: "path", d: pRect(0, 0, bar, h, [rad, 0, 0, rad]), fill: o.accent });
      var al = alignOf(o), ax = al === "center" ? bar + px + tw / 2 : (al === "right" ? w - px : bar + px), an = al === "center" ? "middle" : (al === "right" ? "end" : "start");
      prims.push(T(ax, det.length ? tp + nlh / 2 : h / 2, o.label || "", ts, 600, "Inter", "#ffffff", an));
      det.forEach(function (l, i) {
        prims.push(T(ax, tp + nlh + Math.round(f * 0.1) + i * dlh + dlh / 2, l, ds, 500, "Inter", o.detailColor || "#AFC0D0", an));
      });
      return { w: w, h: h, prims: prims };
    }

    // 09 — distance line: dashed line with a centred pill label (rotate the object to aim it)
    function distancePrims(o) {
      var f = o.f, w = o.w, ph = Math.round(f * 2.2), cy = ph / 2, col = o.color || "#ffffff", lw = Math.max(2, f * 0.18), prims = [];
      var seg = [[0, cy], [w, cy]], dash = [r1(f * 0.9), r1(f * 0.6)];
      prims.push({ t: "path", d: pLine(seg), stroke: "#000", strokeOp: 0.35, sw: lw + 2, dash: dash });
      prims.push({ t: "path", d: pLine(seg), stroke: col, sw: lw, dash: dash });
      [0, w].forEach(function (x) {
        if (o.ends === "dot") prims.push({ t: "path", d: pCircle(x, cy, f * 0.32), fill: col, stroke: "#000", strokeOp: 0.35, sw: 1 });
        else if (o.ends === "tick") prims.push({ t: "path", d: pLine([[x, cy - f * 0.7], [x, cy + f * 0.7]]), stroke: col, sw: lw, cap: "round" });
      });
      if (o.label) {
        var ts = Math.round(f * 1.15), pw = textW(o.label, 700, ts, "Inter") + f * 1.6;
        prims.push({ t: "path", d: pRect(w / 2 - pw / 2, 0, pw, ph, ph / 2), fill: o.pillBg || "#ffffff",
                     shadow: { blur: Math.round(f * 0.6), dy: Math.round(f * 0.15), op: 0.35 } });
        prims.push(T(w / 2, cy, o.label, ts, 700, "Inter", o.pillText || NAVY, "middle"));
      }
      return prims;
    }

    // 13 — AOI box: dashed rectangle with a tab label above its top-left corner
    function aoiPrims(o) {
      var f = o.f, col = o.color || "#ffffff", lw = Math.max(1.5, f * 0.16), prims = [];
      var dash = o.dashed === false ? null : [r1(f * 0.9), r1(f * 0.55)];
      var box = pRect(lw / 2, lw / 2, Math.max(1, o.w - lw), Math.max(1, o.h - lw), Math.round(f * 0.3));
      if (o.fill) prims.push({ t: "path", d: box, fill: col, fillOp: o.fill });
      prims.push({ t: "path", d: box, stroke: "#000", strokeOp: 0.3, sw: lw + 2, dash: dash });
      prims.push({ t: "path", d: box, stroke: col, sw: lw, dash: dash });
      if (o.label) {
        var ts = Math.round(f * 0.85), ls = f * 0.2, tw = textW(o.label, 700, ts, "Inter", ls) + f * 1.6, tabH = Math.round(f * 1.9);
        var ty = -tabH - Math.round(f * 0.4);
        prims.push({ t: "path", d: pRect(0, ty, tw, tabH, Math.round(f * 0.25)), fill: col });
        prims.push(T(f * 0.8, ty + tabH / 2, o.label, ts, 700, "Inter", o.labelText || NAVY, "start", ls));
      }
      return prims;
    }

    // 03 — POI pin: teardrop map pin + name/coordinates card
    function poipinLayout(o) {
      var f = o.f, ph = Math.round(f * 3), pw = Math.round(ph * 0.72), r = pw / 2, d = ph - r;
      var uy = r / d, ux = Math.sqrt(Math.max(0, 1 - uy * uy));
      var P1 = [pw / 2 + r * ux, r + r * uy], P2 = [pw / 2 - r * ux, r + r * uy];
      var pin = "M" + r1(pw / 2) + " " + ph + "L" + r1(P1[0]) + " " + r1(P1[1]) + "A" + r1(r) + " " + r1(r) + " 0 1 0 " + r1(P2[0]) + " " + r1(P2[1]) + "Z";
      var prims = [{ t: "path", d: pin, fill: o.accent, stroke: "#ffffff", strokeOp: 0.9, sw: Math.max(1, f * 0.12),
                     shadow: { blur: Math.round(f * 0.7), dy: Math.round(f * 0.25), op: 0.4 } },
                   { t: "path", d: pCircle(pw / 2, r, r * 0.38), fill: "#ffffff" }];
      var w = pw, h = ph;
      if (o.card !== false && (o.title || o.subtitle)) {
        var x0 = pw + Math.round(f * 0.7), tS = Math.round(f * 1.25), sS = Math.round(f * 0.82), padC = f;
        var cw = Math.max(o.title ? textW(o.title, 600, tS, "Inter") : 0, o.subtitle ? textW(o.subtitle, 400, sS, "JetBrains Mono") : 0) + padC * 2;
        var lines = (o.title ? 1 : 0) + (o.subtitle ? 1 : 0), chh = Math.round(f * (lines === 2 ? 3.4 : 2.3)), top = Math.round(ph * 0.45);
        prims.push({ t: "path", d: pRect(x0, top, cw, chh, Math.round(f * 0.35)), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.92 : o.bgOpacity,
                     stroke: "#ffffff", strokeOp: 0.08, sw: 1, shadow: { blur: Math.round(f * 1.0), dy: Math.round(f * 0.3), op: 0.35 } });
        var yy = top + (lines === 2 ? f * 1.15 : chh / 2), pa2 = alignOf(o);
        var px2 = pa2 === "center" ? x0 + cw / 2 : (pa2 === "right" ? x0 + cw - padC : x0 + padC), pn2 = pa2 === "center" ? "middle" : (pa2 === "right" ? "end" : "start");
        if (o.title) { prims.push(T(px2, yy, o.title, tS, 600, "Inter", "#ffffff", pn2)); yy += f * 1.2; }
        if (o.subtitle) prims.push(T(px2, lines === 2 ? yy : chh / 2 + top, o.subtitle, sS, 400, "JetBrains Mono", "#AFC0D0", pn2));
        w = Math.round(x0 + cw); h = Math.max(ph, top + chh);
      }
      return { w: w, h: h, prims: prims };
    }

    // 04 — zone label: kicker + name + ID badge
    function zoneLayout(o) {
      var f = o.f, pad = Math.round(f * 1.0), kS = Math.round(f * 0.78), nS = Math.round(f * 1.35), bS = Math.round(f * 0.85), ls = f * 0.2;
      var colW = Math.max(o.kicker ? textW(o.kicker, 700, kS, "Inter", ls) : 0, textW(o.name || " ", 700, nS, "Inter"));
      var bw = o.badge ? textW(o.badge, 700, bS, "JetBrains Mono") + f * 1.1 : 0, bh = Math.round(f * 1.7), gap = o.badge ? Math.round(f * 0.9) : 0;
      var h = Math.round(pad * 2 + (o.kicker ? f * 1.25 : 0) + f * 1.55), w = Math.round(pad * 2 + colW + gap + bw);
      var prims = [{ t: "path", d: pRect(0, 0, w, h, Math.round(f * 0.5)), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.92 : o.bgOpacity,
                     stroke: "#ffffff", strokeOp: 0.08, sw: 1, shadow: { blur: Math.round(f * 1.0), dy: Math.round(f * 0.3), op: 0.35 } }];
      var y = pad, za = alignOf(o), zx = za === "center" ? pad + colW / 2 : (za === "right" ? pad + colW : pad), zn = za === "center" ? "middle" : (za === "right" ? "end" : "start");
      if (o.kicker) { prims.push(T(zx, y + f * 0.55, o.kicker, kS, 700, "Inter", o.kickerColor || "#9CD8FF", zn, ls)); y += f * 1.25; }
      prims.push(T(zx, y + f * 0.78, o.name || "", nS, 700, "Inter", "#ffffff", zn));
      if (o.badge) {
        var bx = pad + colW + gap, by = (h - bh) / 2;
        prims.push({ t: "path", d: pRect(bx, by, bw, bh, Math.round(f * 0.3)), fill: o.accent });
        prims.push(T(bx + bw / 2, by + bh / 2, o.badge, bS, 700, "JetBrains Mono", "#ffffff", "middle"));
      }
      return { w: w, h: h, prims: prims };
    }

    // 02 — place label: big outlined map text + small spaced second line
    function placeLayout(o) {
      var f = o.f, s1 = Math.round(f * 2.4), s2 = Math.round(f * 1.1), ls1 = f * 0.05, ls2 = f * 0.3;
      var ow1 = Math.max(2, f * 0.32), ow2 = Math.max(1.5, f * 0.24), oc = o.outline || NAVY, col = o.color || "#ffffff";
      var oop = shMul(o);
      var w1 = textW(o.name || " ", 800, s1, "Exo", ls1), w2 = o.sub ? textW(o.sub, 700, s2, "Inter", ls2) : 0;
      var w = Math.round(Math.max(w1, w2) + ow1 * 2 + 4), h = Math.round(s1 * 1.2 + (o.sub ? s2 * 1.5 : 0) + ow1);
      var pa = o.align === "left" || o.align === "right" ? o.align : "center";
      var ax = pa === "left" ? ow1 : (pa === "right" ? w - ow1 : w / 2), an = pa === "left" ? "start" : (pa === "right" ? "end" : "middle");
      var prims = [T(ax, ow1 / 2 + s1 * 0.6, o.name || "", s1, 800, "Exo", col, an, ls1, { color: oc, w: ow1, op: oop })];
      if (o.sub) prims.push(T(ax, ow1 / 2 + s1 * 1.2 + s2 * 0.7, o.sub, s2, 700, "Inter", col, an, ls2, { color: oc, w: ow2, op: oop }));
      return { w: w, h: h, prims: prims };
    }

    // 01 — two-part timestamp panel
    function utcStamp() {
      var d = new Date(), m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
      var p = function (n) { return (n < 10 ? "0" : "") + n; };
      return d.getUTCDate() + " " + m + " " + d.getUTCFullYear() + " · " + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + " UTC";
    }
    function stampLayout(o) {
      var f = o.f, pad = Math.round(f * 1.1), gap = Math.round(f * 1.1), kS = Math.round(f * 0.8), vS = Math.round(f * 1.5), ls = f * 0.22;
      var kw = o.kicker ? textW(o.kicker, 600, kS, "Inter", ls) : 0, vw = textW(o.value || " ", 600, vS, "Inter");
      var h = Math.round(f * 3.3), w = Math.round(pad * 2 + vw + (o.kicker ? kw + gap * 2 + 1 : 0));
      var prims = [{ t: "path", d: pRect(0, 0, w, h, Math.round(f * 0.5)), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.92 : o.bgOpacity,
                     stroke: "#ffffff", strokeOp: 0.08, sw: 1, shadow: { blur: Math.round(f * 1.0), dy: Math.round(f * 0.3), op: 0.35 } }];
      var x = pad;
      if (o.kicker) {
        prims.push(T(x, h / 2, o.kicker, kS, 600, "Inter", MUTED, "start", ls)); x += kw + gap;
        prims.push({ t: "path", d: pLine([[x, h * 0.26], [x, h * 0.74]]), stroke: "#ffffff", strokeOp: 0.2, sw: 1 }); x += 1 + gap;
      }
      prims.push(T(x, h / 2, o.value || "", vS, 600, "Inter", "#ffffff"));
      return { w: w, h: h, prims: prims };
    }

    // 16 — map legend with symbol rows
    var LEGEND_SYMS = [["ring", "Ring"], ["ringdot", "Ring + dot"], ["target", "Target"], ["line", "Line"], ["dashline", "Dashed line"], ["dashbox", "Dashed box"], ["dot", "Dot"], ["square", "Square"]];
    function legendSym(sym, cx, cy, col, f) {
      var sw = Math.max(1.5, f * 0.17), r = f * 0.55, out = [];
      if (sym === "ring" || sym === "ringdot" || sym === "target") {
        out.push({ t: "path", d: pCircle(cx, cy, r), stroke: col, sw: sw });
        if (sym === "ringdot") out.push({ t: "path", d: pCircle(cx, cy, r * 0.4), fill: col });
        if (sym === "target") [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(function (u) {
          out.push({ t: "path", d: pLine([[cx + u[0] * r * 0.45, cy + u[1] * r * 0.45], [cx + u[0] * r * 1.3, cy + u[1] * r * 1.3]]), stroke: col, sw: sw * 0.8 });
        });
      } else if (sym === "line" || sym === "dashline") {
        out.push({ t: "path", d: pLine([[cx - f * 0.7, cy], [cx + f * 0.7, cy]]), stroke: col, sw: Math.max(2, f * 0.2), dash: sym === "dashline" ? [r1(f * 0.3), r1(f * 0.2)] : null });
      } else if (sym === "dashbox") {
        out.push({ t: "path", d: pRect(cx - f * 0.6, cy - f * 0.6, f * 1.2, f * 1.2, 1), stroke: col, sw: Math.max(1.2, f * 0.12), dash: [r1(f * 0.22), r1(f * 0.16)] });
      } else if (sym === "square") {
        out.push({ t: "path", d: pRect(cx - f * 0.45, cy - f * 0.45, f * 0.9, f * 0.9, Math.round(f * 0.12)), fill: col });
      } else {
        out.push({ t: "path", d: pCircle(cx, cy, f * 0.45), fill: col });
      }
      return out;
    }
    function legendLayout(o) {
      if (o.layout === "inline") return legendInline(o);
      var f = o.f, pad = Math.round(f * 1.1), rowH = Math.round(f * 2.05), lS = Math.round(f * 1.0), tS = Math.round(f * 0.8), ls = f * 0.22;
      var items = o.items || [], labW = 0;
      items.forEach(function (it) { labW = Math.max(labW, textW(it.label || " ", 500, lS, "Inter")); });
      if (o.title) labW = Math.max(labW - f * 2.1, textW(o.title, 700, tS, "Inter", ls) - f * 2.1, labW);
      var w = Math.round(pad * 2 + f * 2.1 + labW), titleH = o.title ? Math.round(f * 1.9) : 0;
      var h = Math.round(pad + titleH + items.length * rowH + pad * 0.6);
      var prims = [{ t: "path", d: pRect(0, 0, w, h, Math.round(f * 0.6)), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.9 : o.bgOpacity,
                     stroke: "#ffffff", strokeOp: 0.08, sw: 1, shadow: { blur: Math.round(f * 1.2), dy: Math.round(f * 0.35), op: 0.35 } }];
      if (o.title) prims.push(T(pad, pad + f * 0.55, o.title, tS, 700, "Inter", MUTED, "start", ls));
      items.forEach(function (it, i) {
        var cy = pad + titleH + i * rowH + rowH / 2;
        prims = prims.concat(legendSym(it.sym, pad + f * 0.7, cy, it.color || "#ffffff", f));
        prims.push(T(pad + f * 2.1, cy, it.label || "", lS, 500, "Inter", "#ffffff"));
      });
      return { w: w, h: h, prims: prims };
    }

    // Inline legend: one row — title, a thin divider, then symbol + label pairs
    function legendInline(o) {
      var f = o.f, padX = Math.round(f * 1.2), lS = Math.round(f * 1.0), tS = Math.round(f * 0.8), ls = f * 0.22;
      var h = Math.round(f * 3.2), cy = h / 2, gap = Math.round(f * 1.6), symW = f * 1.4, symGap = f * 0.6;
      var body = [], x = padX, items = o.items || [];
      if (o.title) {
        body.push(T(x, cy, o.title, tS, 700, "Inter", MUTED, "start", ls));
        x += textW(o.title, 700, tS, "Inter", ls) + f * 0.9;
        if (items.length) { body.push({ t: "path", d: pLine([[x, h * 0.28], [x, h * 0.72]]), stroke: "#ffffff", strokeOp: 0.2, sw: 1 }); x += 1 + f * 0.9; }
      }
      items.forEach(function (it, i) {
        if (i) x += gap;
        body = body.concat(legendSym(it.sym, x + symW / 2, cy, it.color || "#ffffff", f));
        x += symW + symGap;
        body.push(T(x, cy, it.label || "", lS, 500, "Inter", "#ffffff"));
        x += textW(it.label || " ", 500, lS, "Inter");
      });
      var w = Math.round(x + padX);
      var prims = [{ t: "path", d: pRect(0, 0, w, h, Math.round(f * 0.6)), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.9 : o.bgOpacity,
                     stroke: "#ffffff", strokeOp: 0.08, sw: 1, shadow: { blur: Math.round(f * 1.2), dy: Math.round(f * 0.35), op: 0.35 } }];
      return { w: w, h: h, prims: prims.concat(body) };
    }

    function iconImageSrc(name, color, size) {
      var svgTxt = Icons.svg(name, { size: size, stroke: color });
      if (svgTxt.indexOf("xmlns") < 0) svgTxt = svgTxt.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgTxt);
    }
    // 17 — footer strap: full-width band, top rule, title + subtitle, optional logo.
    // Strap height and text size are independent; the strap never gets shorter than its text.
    function footerMinH(o) { var f = o.f; return Math.max(2, Math.round(f * 0.16)) + Math.round(f * 1.75 * 1.35); }
    function footerPrims(o) {
      var f = o.f, w = o.w, h = Math.max(footerMinH(o), Math.round(o.h || f * 3.6)), rule = Math.max(2, Math.round(f * 0.16)), pad = Math.round(f * 1.6), cy = rule + (h - rule) / 2;
      var prims = [{ t: "path", d: pRect(0, 0, w, h, 0), fill: o.bg || NAVY, fillOp: o.bgOpacity == null ? 0.96 : o.bgOpacity },
                   { t: "path", d: pRect(0, 0, w, rule, 0), fill: o.accent }];
      var tS = Math.round(f * 1.75), sS = Math.round(f * 1.45), x = pad;
      if (o.showIcon && o.iconKey) {   // optional icon before the title
        var isz = Math.max(8, Math.min(o.iconSize > 0 ? o.iconSize : Math.round(f * 1.9), h - rule - 4));
        prims.push({ t: "image", x: x, y: cy - isz / 2, w: isz, h: isz, src: iconImageSrc(o.iconKey, o.iconColor || "#ffffff", isz), natW: isz, natH: isz, contain: true });
        x += isz + Math.round(f * 0.7);
      }
      if (o.title) { prims.push(T(x, cy, o.title, tS, 800, "Exo", "#ffffff")); x += textW(o.title, 800, tS, "Exo") + f * 0.9; }
      if (o.subtitle) prims.push(T(x, cy, o.subtitle, sS, 400, "Inter", "#C9D6E3"));
      if (o.logo) {
        var lh = Math.round((h - rule) * 0.62), lw = Math.round(lh * ((o.logoW || 1) / (o.logoH || 1)));
        prims.push({ t: "image", x: w - pad - lw, y: cy - lh / 2, w: lw, h: lh, src: o.logo, natW: o.logoW, natH: o.logoH, contain: true });
      }
      return prims;
    }

    /* ============================ RENDERERS ============================ */
    // Shadow opacity (0–1, default 1 = the designed look). Older place labels used "shadowOp".
    function shMul(o) { var v = o.shadowOpacity != null ? o.shadowOpacity : (o.shadowOp != null ? o.shadowOp : 1); return Math.max(0, Math.min(1, +v)); }
    var HAS_SHADOW = { callout: 1, shiptag: 1, distance: 1, poipin: 1, zonelabel: 1, stamp2: 1, maplegend: 1, track: 1, placelabel: 1 };
    function build(o) {
      var prims = buildRaw(o), m = shMul(o);
      if (m !== 1) prims.forEach(function (p) {
        if (!p.shadow) return;
        if (m <= 0) delete p.shadow; else p.shadow = { blur: p.shadow.blur, dy: p.shadow.dy, op: Math.round(p.shadow.op * m * 1000) / 1000 };
      });
      return prims;
    }
    function buildRaw(o) {
      if (o.type === "callout") return calloutPrims(o);
      if (o.type === "ring") return ringPrims(o);
      if (o.type === "scalebar") return scalePrims(o);
      if (o.type === "track") return trackPrims(o);
      if (o.type === "shiptag") return shiptagLayout(o).prims;
      if (o.type === "distance") return distancePrims(o);
      if (o.type === "aoi") return aoiPrims(o);
      if (o.type === "poipin") return poipinLayout(o).prims;
      if (o.type === "zonelabel") return zoneLayout(o).prims;
      if (o.type === "placelabel") return placeLayout(o).prims;
      if (o.type === "stamp2") return stampLayout(o).prims;
      if (o.type === "maplegend") return legendLayout(o).prims;
      if (o.type === "footer") return footerPrims(o);
      return [];
    }
    var sid = 0, fontsHooked = false;
    function svg(o) {
      if (!fontsHooked && document.fonts && document.fonts.ready) {
        fontsHooked = true;   // re-measure once web fonts arrive
        document.fonts.ready.then(function () {
          var any = false;
          S.objects.forEach(function (ob) { if (has(ob.type)) { fit(ob); any = true; } });
          if (any && !drag) { renderObjects(); wireObjectEvents(); }
        });
      }
      if (o.type === "footer") LASTBOX.set(o, { y: o.y, h: o.h });   // last drawn box: lets edits keep a bottom-docked footer docked
      var defs = "", body = "";
      build(o).forEach(function (p) {
        if (p.t === "path") {
          var flt = "";
          if (p.shadow) {
            var id = "ksh" + (++sid);
            defs += '<filter id="' + id + '" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="' + p.shadow.dy +
              '" stdDeviation="' + r1(p.shadow.blur / 2) + '" flood-color="#000" flood-opacity="' + p.shadow.op + '"/></filter>';
            flt = ' filter="url(#' + id + ')"';
          }
          body += '<path d="' + p.d + '" fill="' + (p.fill || "none") + '"' + (p.fill && p.fillOp != null ? ' fill-opacity="' + p.fillOp + '"' : "") +
            (p.stroke ? ' stroke="' + p.stroke + '" stroke-width="' + r1(p.sw || 1) + '"' + (p.strokeOp != null ? ' stroke-opacity="' + p.strokeOp + '"' : "") +
              (p.dash ? ' stroke-dasharray="' + p.dash.join(" ") + '"' : "") + ' stroke-linecap="' + (p.cap || "butt") + '" stroke-linejoin="' + (p.join || "miter") + '"' : "") +
            flt + "/>";
        } else if (p.t === "text") {
          body += '<text x="' + r1(p.x) + '" y="' + r1(p.y) + '" text-anchor="' + p.anchor + '" dominant-baseline="central" fill="' + p.fill +
            '" style="font-family:\'' + p.font + '\',sans-serif;font-size:' + p.size + "px;font-weight:" + p.weight + ";" +
            (p.ls ? "letter-spacing:" + r1(p.ls) + "px;" : "") + (p.outline && p.outline.op !== 0 ? "paint-order:stroke;stroke:" + p.outline.color + ";stroke-width:" + r1(p.outline.w * 2) + "px;stroke-linejoin:round;" +
              (p.outline.op != null && p.outline.op < 1 ? "stroke-opacity:" + p.outline.op + ";" : "") : "") +
            'white-space:pre">' + esc(p.s) + "</text>";
        } else if (p.t === "image" && p.src) {
          if (p.crop) {
            body += '<svg x="' + r1(p.x) + '" y="' + r1(p.y) + '" width="' + r1(p.w) + '" height="' + r1(p.h) + '" viewBox="' +
              [p.crop.sx, p.crop.sy, p.crop.sw, p.crop.sh].map(r1).join(" ") + '" preserveAspectRatio="none"><image href="' + esc(p.src) +
              '" x="0" y="0" width="' + p.natW + '" height="' + p.natH + '" preserveAspectRatio="none"/></svg>';
          } else {
            body += '<image href="' + esc(p.src) + '" x="' + r1(p.x) + '" y="' + r1(p.y) + '" width="' + r1(p.w) + '" height="' + r1(p.h) + '" preserveAspectRatio="xMidYMid ' + (p.contain ? "meet" : "slice") + '"/>';
          }
        }
      });
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.max(1, Math.round(o.w)) + '" height="' + Math.max(1, Math.round(o.h)) +
        '" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">' + (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
    }
    function contentHTML(o) { return '<div class="obj-content" style="overflow:visible;display:block">' + svg(o) + "</div>"; }

    function loadImg(src) {
      return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; });
    }
    function draw(ctx, o, x, y, done) {
      var prims = build(o);
      var imgs = prims.filter(function (p) { return p.t === "image" && p.src; });
      Promise.all(imgs.map(function (p) { return loadImg(p.src).then(function (im) { p._img = im; }); })).then(function () {
        ctx.save(); ctx.translate(x, y);
        prims.forEach(function (p) {
          if (p.t === "path") {
            var path = new Path2D(p.d);
            if (p.fill) {
              ctx.save();
              if (p.shadow) { ctx.shadowColor = "rgba(0,0,0," + p.shadow.op + ")"; ctx.shadowBlur = p.shadow.blur; ctx.shadowOffsetY = p.shadow.dy; }
              ctx.globalAlpha *= (p.fillOp == null ? 1 : p.fillOp); ctx.fillStyle = p.fill; ctx.fill(path); ctx.restore();
            }
            if (p.stroke) {
              ctx.save();
              ctx.globalAlpha *= (p.strokeOp == null ? 1 : p.strokeOp); ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw || 1;
              ctx.lineCap = p.cap || "butt"; ctx.lineJoin = p.join || "miter"; if (p.dash) ctx.setLineDash(p.dash);
              ctx.stroke(path); ctx.restore();
            }
          } else if (p.t === "text") {
            ctx.save();
            ctx.font = p.weight + " " + p.size + "px '" + p.font + "', sans-serif";
            ctx.fillStyle = p.fill; ctx.textBaseline = "middle";
            ctx.textAlign = p.anchor === "middle" ? "center" : (p.anchor === "end" ? "right" : "left");
            if ("letterSpacing" in ctx) ctx.letterSpacing = (p.ls || 0) + "px";
            if (p.outline && p.outline.op !== 0) {
              ctx.save(); ctx.globalAlpha *= (p.outline.op == null ? 1 : p.outline.op);
              ctx.strokeStyle = p.outline.color; ctx.lineWidth = p.outline.w * 2; ctx.lineJoin = "round"; ctx.strokeText(p.s, p.x, p.y); ctx.restore();
            }
            ctx.fillText(p.s, p.x, p.y); ctx.restore();
          } else if (p.t === "image" && p._img) {
            var im = p._img;
            if (p.crop) {
              var k = im.naturalWidth / (p.natW || im.naturalWidth);
              ctx.drawImage(im, p.crop.sx * k, p.crop.sy * k, p.crop.sw * k, p.crop.sh * k, p.x, p.y, p.w, p.h);
            } else {
              var ir = im.naturalWidth / im.naturalHeight, dr = p.w / p.h, sw = im.naturalWidth, sh = im.naturalHeight, sx = 0, sy = 0;
              if (p.contain) {
                var dw = p.w, dh = p.h; if (ir > dr) dh = dw / ir; else dw = dh * ir;
                ctx.drawImage(im, p.x + (p.w - dw) / 2, p.y + (p.h - dh) / 2, dw, dh);
              } else {
                if (ir > dr) { sw = sh * dr; sx = (im.naturalWidth - sw) / 2; } else { sh = sw / dr; sy = (im.naturalHeight - sh) / 2; }
                ctx.drawImage(im, sx, sy, sw, sh, p.x, p.y, p.w, p.h);
              }
            }
          }
        });
        ctx.restore();
        done();
      });
    }

    /* ============================ MODEL ============================ */
    function init(o, spec, opts) {
      opts = opts || {};
      var parts = String(spec || "").split(":"), kind = parts[0], variant = parts[1];
      o.text = ""; o.bg = NAVY; o.borderWidth = 0;
      if (kind === "callout") {
        var c = CALLOUTS[variant] || CALLOUTS.alert, f = unit(0.0072, 12);
        o.type = "callout"; o.variant = variant || "alert"; o.f = f;
        o.accent = c.accent; o.leaderColor = c.accent; o.headerColor = "#ffffff"; o.headerDot = true;
        o.header = c.header; o.headerRight = c.headerRight; o.title = c.title;
        o.rows = c.rows.map(function (r) { return { k: r.k, v: r.v }; }); o.body = c.body;
        o.media = c.media; o.zoom = 4; o.imgRatio = 0.62; o.image = null;
        o.leaderShow = true; o.leaderAngle = c.leaderAngle; o.leaderLen = Math.round(f * c.leaderLen); o.leaderEnd = c.leaderEnd;
        o.bgOpacity = 0.94; o.radius = Math.round(f * 0.6);
        o.w = Math.round(f * c.wf);
      } else if (kind === "ring") {
        var r = RINGS[variant] || RINGS.match, d = unit(r.size[0], r.size[1]);
        o.type = "ring"; o.variant = variant || "match";
        o.accent = r.accent; o.ringStyle = r.ringStyle; o.halo = r.halo; o.ringFill = 0.08;
        o.w = d; o.h = d;
      } else if (kind === "scalebar") {
        var fs = unit(0.0068, 11);
        o.type = "scalebar"; o.f = fs; o.maxValue = 2; o.unit = "km"; o.divisions = 2;
        o.showNorth = true; o.northRot = 0; o.color = "#ffffff"; o.panel = true; o.bgOpacity = 0.88;
        o.w = Math.round(fs * 20);
      } else if (kind === "track") {
        var ft = unit(0.0075, 12);
        o.type = "track"; o.f = ft; o.accent = "#E5323E"; o.lineW = Math.max(2, Math.round(ft * 0.2));
        o.points = opts.points || [{ x: 0, y: 1 }, { x: 0.3, y: 0.62 }, { x: 0.62, y: 0.3 }, { x: 1, y: 0 }];
        o.chevrons = true; o.numbers = true; o.showTimes = true; o.pinStart = false;
        o.times = trackPins(o).map(function (_, i) { return SAMPLE_TIMES[i] || ""; });
        if (!opts.points) { o.w = Math.round(iw() * 0.25); o.h = Math.round(iw() * 0.18); }
      } else if (kind === "shiptag") {
        var f1 = unit(0.0075, 12);
        o.type = "shiptag"; o.f = f1; o.label = "VESSEL NAME"; o.detail = ""; o.align = "center"; o.accent = variant === "noais" ? "#F59E0B" : "#22C55E"; o.leaderColor = o.accent; o.variant = variant || "match";
        o.leaderShow = true; o.leaderAngle = 15; o.leaderLen = Math.round(f1 * 5); o.leaderEnd = "ring"; o.bgOpacity = 0.92;
      } else if (kind === "distance") {
        var f2 = unit(0.0075, 12);
        o.type = "distance"; o.f = f2; o.label = "00 km"; o.color = "#ffffff"; o.ends = "none"; o.w = Math.round(iw() * 0.22);
      } else if (kind === "aoi") {
        var f3 = unit(0.0068, 11);
        o.type = "aoi"; o.f = f3; o.label = "AREA OF INTEREST"; o.color = "#ffffff"; o.dashed = true; o.fill = 0;
        o.w = Math.round(iw() * 0.16); o.h = Math.round(iw() * 0.12);
      } else if (kind === "poipin") {
        var f4 = unit(0.0075, 12);
        o.type = "poipin"; o.f = f4; o.align = "center"; o.accent = "#2F9BFF"; o.title = "Port of Sulina"; o.subtitle = "45°09′25″ N  029°40′20″ E"; o.card = true; o.bgOpacity = 0.92;
      } else if (kind === "zonelabel") {
        var f5 = unit(0.0075, 12);
        o.type = "zonelabel"; o.f = f5; o.align = "center"; o.kicker = "LISTED AREA"; o.name = "Zone name"; o.badge = "JWLA-000"; o.accent = "#2F80ED"; o.kickerColor = "#9CD8FF"; o.bgOpacity = 0.92;
      } else if (kind === "placelabel") {
        var f6 = unit(0.0085, 12);
        o.type = "placelabel"; o.f = f6; o.name = "SULINA"; o.sub = "ROMANIA"; o.color = "#ffffff"; o.outline = NAVY; o.align = "center";
      } else if (kind === "stamp2") {
        var f7 = unit(0.0075, 12);
        o.type = "stamp2"; o.f = f7; o.kicker = "OPTICAL ACQUISITION"; o.value = utcStamp(); o.bgOpacity = 0.92;
      } else if (kind === "maplegend") {
        var f8 = unit(0.0075, 12);
        o.type = "maplegend"; o.f = f8; o.title = "LEGEND"; o.bgOpacity = 0.9;
        o.items = [{ sym: "ring", color: "#22C55E", label: "AIS and imagery match" }, { sym: "ring", color: "#F59E0B", label: "Detection with no AIS" },
                   { sym: "ringdot", color: "#E5323E", label: "Point of interest" }, { sym: "line", color: "#E5323E", label: "AIS track" },
                   { sym: "dashbox", color: "#ffffff", label: "Area of interest" }];
      } else if (kind === "footer") {
        var f9 = unit(0.0095, 12);
        o.type = "footer"; o.f = f9; o.title = "VESSEL NAME"; o.subtitle = "Imagery type detection · Black Sea"; o.accent = "#E5323E";
        o.bgOpacity = 0.96; o.logo = null; o.w = iw(); o.h = Math.round(f9 * 3.6);
      }
      fit(o);
    }
    function autoH(o) { return o.type === "callout" || o.type === "scalebar" || o.type === "distance"; }
    function autoSize(o) { return !!AUTOSIZE[o.type]; }
    // Footer, scale bar and distance line have a height set by their text size:
    // dragging or typing a height scales them (width stays free).
    function heightScaled(o) { return o.type === "scalebar" || o.type === "distance"; }
    function minHeight(o) { return o.type === "footer" ? footerMinH(o) : 0; }
    // Callouts with an image: a new height goes to the image area (header + text keep their size).
    function mediaResize(o, nw, nh) {
      if (o.type !== "callout" || !(o.media === "zoom" || (o.media === "upload" && o.image))) return false;
      var w0 = o.w; o.w = Math.max(1, Math.round(nw));
      var L = calloutLayout(o), non = L.h - L.mediaH, mh = Math.max(Math.round(o.f * 2), Math.round(nh) - non);
      o.imgRatio = Math.max(0.1, Math.min(4, mh / o.w)); o.w = w0;
      return true;
    }
    function editSize(o, prop) {
      if (prop === "h" && mediaResize(o, o.w, o.h)) return;
      if (prop === "h" && heightScaled(o)) {
        var cur = heightFor(o);
        if (cur > 0 && o.h > 0) o.f = Math.max(5, Math.round(o.f * o.h / cur));
      } else if (autoSize(o) && (prop === "w" || prop === "h")) {
        var sz = sizeOf(o); if (!sz) return;
        var k = prop === "w" ? o.w / sz.w : o.h / sz.h; if (k > 0 && isFinite(k)) o.f = Math.max(5, Math.round(o.f * k));
      }
    }
    function sizeOf(o) {
      if (o.type === "shiptag") return shiptagLayout(o);
      if (o.type === "poipin") return poipinLayout(o);
      if (o.type === "zonelabel") return zoneLayout(o);
      if (o.type === "placelabel") return placeLayout(o);
      if (o.type === "stamp2") return stampLayout(o);
      if (o.type === "maplegend") return legendLayout(o);
      return null;
    }
    function heightFor(o) {
      if (o.type === "callout") return calloutLayout(o).h;
      if (o.type === "scalebar") return scaleLayout(o).h;
      if (o.type === "distance") return Math.round(o.f * 2.2);
      return o.h;
    }
    // default placement for new objects that belong at an edge
    function place(o, atImage) {
      if (!image) return;
      if (o.type === "footer") { o.x = 0; o.w = image.w; fit(o); o.y = (atImage && atImage.y < image.h / 2) ? 0 : image.h - o.h; LASTBOX.set(o, { y: o.y, h: o.h }); }
      if (o.type === "stamp2" && !atImage) { var m = Math.round(o.f * 1.5); o.x = image.w - o.w - m; o.y = m; }
    }
    function fit(o) {
      if (o.type === "scalebar") o.w = Math.max(o.w, Math.round(o.f * (o.showNorth ? 9 : 6.5)));
      if (o.type === "callout") o.w = Math.max(o.w, Math.round(o.f * 9));
      if (o.type === "distance") o.w = Math.max(o.w, Math.round(o.f * 6));
      if (autoH(o)) o.h = heightFor(o);
      if (o.type === "footer") {
        // A footer on the bottom edge stays there when its height or text size changes
        // (but not after the user has moved it somewhere else).
        var prev = LASTBOX.get(o), pinB = image && prev && prev.y === o.y && Math.abs(prev.y + prev.h - image.h) <= 2;
        o.h = Math.max(footerMinH(o), Math.round(o.h || o.f * 3.6));
        if (pinB) o.y = image.h - o.h;
        LASTBOX.set(o, { y: o.y, h: o.h });
      }
      var sz = sizeOf(o); if (sz) { o.w = Math.max(4, Math.round(sz.w)); o.h = Math.max(4, Math.round(sz.h)); }
      if (o.type === "ring") { var s = Math.max(8, Math.round(Math.max(o.w, o.h))); o.w = s; o.h = s; }
      if (o.type === "track") {
        var need = trackPins(o).length;
        o.times = (o.times || []).slice(0, need);
        while (o.times.length < need) o.times.push("");
      }
    }
    function icon(o) { return { callout: "info", ring: "target", scalebar: "gps", track: "edit", shiptag: "tag", distance: "dblArrow", aoi: "shapes",
      poipin: "pin", zonelabel: "layout", placelabel: "text", stamp2: "clock", maplegend: "gridDots", footer: "layout" }[o.type] || "tag"; }
    function label(o) {
      if (o.type === "callout") return o.title || o.header || "Callout";
      if (o.type === "ring") return { match: "AIS match ring", noais: "No-AIS ring", poi: "Point of interest", target: "Target marker" }[o.variant] || "Marker";
      if (o.type === "scalebar") return "Scale bar";
      if (o.type === "track") return "Track · " + trackPins(o).length + " pins";
      if (o.type === "shiptag") return o.label || "Ship tag";
      if (o.type === "distance") return "Distance · " + (o.label || "");
      if (o.type === "aoi") return o.label || "AOI box";
      if (o.type === "poipin") return o.title || "POI pin";
      if (o.type === "zonelabel") return o.name || "Zone label";
      if (o.type === "placelabel") return o.name || "Place label";
      if (o.type === "stamp2") return o.value || "Timestamp";
      if (o.type === "maplegend") return "Legend";
      if (o.type === "footer") return o.title || "Footer";
      return "Object";
    }

    /* ============================ LIBRARY TAB ============================ */
    function libHTML(trackOn) {
      function row(icon, name, variant, color) {
        return '<div class="lib-item" draggable="true" data-kind="kit" data-variant="' + variant + '"><span class="li-icon" style="color:' + color + '">' +
          Icons.svg(icon, { size: 16 }) + "</span>" + name + '<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>";
      }
      function sub(t) { return '<div style="font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3,#7f8ea3);margin:12px 4px 6px">' + t + "</div>"; }
      return '<div class="lib-hint">Callouts, markers and map furniture for satellite imagery.</div><div class="lib-list">' + sub("Callouts") +
        row("alert", "Alert Callout", "callout:alert", "#E09A16") +
        row("info", "Event Callout", "callout:event", "#2F80ED") +
        row("image", "Zoom Inset Callout", "callout:zoom", "#E5323E") + sub("Markers") +
        row("target", "AIS Match Ring", "ring:match", "#22C55E") +
        row("target", "No-AIS Ring", "ring:noais", "#F59E0B") +
        row("pin", "Point of Interest", "ring:poi", "#E5323E") +
        row("target", "Target Marker", "ring:target", "#E5323E") +
        row("tag", "AIS Ship Tag", "shiptag:match", "#22C55E") +
        row("tag", "No-AIS Ship Tag", "shiptag:noais", "#F59E0B") +
        row("pin", "POI Pin", "poipin", "#2F9BFF") + sub("Labels") +
        row("layout", "Zone Label", "zonelabel", "#2F80ED") +
        row("text", "Place Label", "placelabel", "#ffffff") +
        row("clock", "Timestamp", "stamp2", "#ffffff") + sub("Map furniture") +
        row("shapes", "AOI Box", "aoi", "#ffffff") +
        row("dblArrow", "Distance Line", "distance", "#ffffff") +
        row("gridDots", "Map Legend", "maplegend", "#ffffff") +
        row("layout", "Footer Strap", "footer", "#E5323E") +
        row("gps", "Scale Bar & North", "scalebar", "#ffffff") +
        '<div class="lib-item' + (trackOn ? " on" : "") + '" data-kind="tracktool"><span class="li-icon" style="color:#E5323E">' + Icons.svg("edit", { size: 16 }) +
          '</span>Track (click waypoints)<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        "</div>";
    }

    /* ============================ PROPERTIES ============================ */
    function kNum(label, key, val, min, max, step) {
      return '<div class="prop-row"><label>' + label + '</label><div class="ctrl"><input class="input" type="number" data-kprop="' + key + '" data-ktype="num" value="' + val + '" min="' + min + '" max="' + max + '"' + (step ? ' step="' + step + '"' : "") + '></div></div>';
    }
    function kText(label, key, val, ph) {
      return '<div class="prop-row"><label>' + label + '</label><div class="ctrl"><input class="input" type="text" data-kprop="' + key + '" value="' + esc(val) + '" placeholder="' + esc(ph || "") + '"></div></div>';
    }
    function kArea(label, key, val, ph) {
      return '<div class="prop-row" style="align-items:flex-start"><label>' + label + '</label><div class="ctrl"><textarea class="input" rows="3" style="resize:vertical;min-height:64px;font:inherit" data-kprop="' + key + '" placeholder="' + esc(ph || "") + '">' + esc(val) + "</textarea></div></div>";
    }
    function kSlider(label, key, val, min, max, unitTxt, type, step, withInput) {
      var range = '<input type="range" data-kprop="' + key + '" data-ktype="' + (type || "num") + '" data-unit="' + (unitTxt || "") +
        '" value="' + val + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '">';
      if (withInput) {   // slider + exact-value box, kept in sync
        return '<div class="prop-row"><label>' + label + '</label><div class="ctrl prop-num kslider-exact">' + range +
          '<input class="input knum" type="number" data-kprop="' + key + '" data-ktype="num" value="' + (Math.round(val * 10) / 10) + '" min="' + min + '" max="' + max + '" step="0.1">' +
          (unitTxt ? '<span class="kunit">' + unitTxt + "</span>" : "") + "</div></div>";
      }
      return '<div class="prop-row"><label>' + label + '</label><div class="ctrl prop-num">' + range + '<span class="val">' + val + (unitTxt || "") + "</span></div></div>";
    }
    function kSeg(label, key, opts, cur) {
      return '<div class="prop-row"><label>' + label + '</label><div class="ctrl seg2">' + opts.map(function (op) {
        return '<button data-kseg="' + key + '" data-kval="' + esc(JSON.stringify(op[0])) + '" class="' + (cur === op[0] ? "on" : "") + '">' + op[1] + "</button>";
      }).join("") + "</div></div>";
    }
    // Align (left / centre / right) for label-style components. Older saved objects without
    // the setting keep the left alignment they were drawn with.
    function alignOf(o) { return o.align === "center" || o.align === "right" ? o.align : "left"; }
    function kAlign(o) {
      var cur = alignOf(o);
      return '<div class="prop-row"><label>Align</label><div class="ctrl seg2">' + [["left", "alignL"], ["center", "alignC"], ["right", "alignR"]].map(function (a) {
        return '<button data-kseg="align" data-kval="' + esc(JSON.stringify(a[0])) + '" class="' + (cur === a[0] ? "on" : "") + '" title="Align ' + a[0] + '">' + Icons.svg(a[1], { size: 15 }) + "</button>";
      }).join("") + "</div></div>";
    }
    // Leader-end picker as icon buttons: a short leader line with each ending.
    var END_ICONS = {
      none:  '<path d="M3 12h16"/>',
      dot:   '<path d="M3 12h11"/><circle cx="17.5" cy="12" r="3.5" fill="currentColor" stroke="none"/>',
      ring:  '<path d="M3 12h9.5"/><circle cx="17" cy="12" r="4.5"/>',
      arrow: '<path d="M3 12h12"/><path d="M14 7l7 5-7 5z" fill="currentColor"/>'
    };
    function kEnd(o, dflt) {
      var cur = o.leaderEnd || dflt;
      return '<div class="prop-row"><label>End</label><div class="ctrl seg2 kend">' + [["none", "None"], ["dot", "Dot"], ["ring", "Ring"], ["arrow", "Arrow"]].map(function (e) {
        return '<button data-kseg="leaderEnd" data-kval="' + esc(JSON.stringify(e[0])) + '" class="' + (cur === e[0] ? "on" : "") + '" title="' + e[1] + '" aria-label="' + e[1] + '">' +
          '<svg width="22" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + END_ICONS[e[0]] + "</svg></button>";
      }).join("") + "</div></div>";
    }
    function group(title, inner) { return '<div class="prop-group"><h4>' + title + "</h4>" + inner + "</div>"; }

    function props(o) {
      var h = "";
      if (o.type === "callout") {
        h += group("Header", kText("Title", "header", o.header, "e.g. NO AIS SIGNAL") + kText("Right tag", "headerRight", o.headerRight, "optional") +
          kNum("Text size", "headerSize", headerSize(o), 6, 80) +
          kSeg("Dot", "headerDot", [[true, "On"], [false, "Off"]], o.headerDot !== false) + colorRow("accent", o.accent));
        var rows = (o.rows || []).map(function (r, i) {
          return '<div class="leg-row"><input class="input leg-label" data-krow="k" data-kidx="' + i + '" value="' + esc(r.k) + '" placeholder="Key">' +
            '<input class="input leg-label" data-krow="v" data-kidx="' + i + '" value="' + esc(r.v) + '" placeholder="Value">' +
            '<button class="leg-x" data-krowdel="' + i + '" title="Remove row">' + Icons.svg("trash", { size: 13 }) + "</button></div>";
        }).join("");
        h += group("Content", kText("Name", "title", o.title, "optional") + rows +
          '<button class="view-btn leg-add" data-krowadd="1">' + Icons.svg("plus", { size: 14 }) + "Add row</button>" + kArea("Note", "body", o.body));
        var media = kSeg("Image", "media", [["none", "None"], ["zoom", "Zoom"], ["upload", "Upload"]], o.media || "none");
        if (o.media === "zoom") media += kSlider("Magnify", "zoom", o.zoom || 4, 1, 16, "×", "num", 0.5) +
          '<p class="layers-hint" style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Shows the spot the leader points at. Drag the card to aim it.</p>';
        if (o.media === "upload") media += '<div class="prop-row"><button class="view-btn" data-kact="upload" style="flex:1">' + Icons.svg("image", { size: 14 }) + (o.image ? "Replace image…" : "Choose image…") + "</button></div>";
        if (o.media !== "none") media += kSlider("Height", "imgRatio", Math.round((o.imgRatio || 0.62) * 100), 25, 120, "%", "pct");
        h += group("Image", media);
        var lead = kSeg("Leader", "leaderShow", [[true, "On"], [false, "Off"]], !!o.leaderShow);
        if (o.leaderShow) lead += kSlider("Angle", "leaderAngle", o.leaderAngle || 0, 0, 360, "°", "num", 1, true) + kNum("Length", "leaderLen", Math.round(o.leaderLen || 0), 0, 4000) +
          kEnd(o, "none") + kNum("Thickness", "leaderW", Math.round(leaderWidth(o) * 10) / 10, 0.5, 40, 0.5) + '<p class="layers-hint" style="margin:6px 0 6px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Line colour</p>' + colorRow("leaderColor", leaderColor(o));
        h += group("Leader line", lead);
        h += group("Card", kNum("Text size", "f", o.f, 8, 80) + colorRow("bg", o.bg) +
          kSlider("Opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 0.94 : o.bgOpacity) * 100), 0, 100, "%", "pct") + kNum("Radius", "radius", o.radius, 0, 60));
      } else if (o.type === "ring") {
        h += group("Marker", kSeg("Style", "ringStyle", [["ring", "Ring"], ["dot", "Dot"], ["target", "Target"]], o.ringStyle) +
          kSeg("Halo", "halo", [[true, "On"], [false, "Off"]], !!o.halo) +
          kSlider("Fill", "ringFill", Math.round((o.ringFill == null ? 0.08 : o.ringFill) * 100), 0, 60, "%", "pct") + colorRow("accent", o.accent));
      } else if (o.type === "scalebar") {
        h += group("Scale", kNum("Distance", "maxValue", o.maxValue, 0, 100000) + kText("Unit", "unit", o.unit, "km") + kNum("Divisions", "divisions", o.divisions, 1, 10) +
          '<p class="layers-hint" style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Resize the bar so its length matches that distance on the image.</p>');
        var north = kSeg("North arrow", "showNorth", [[true, "On"], [false, "Off"]], !!o.showNorth);
        if (o.showNorth) north += kSlider("Rotation", "northRot", o.northRot || 0, -180, 180, "°", "num", 1, true);
        h += group("North", north);
        var panel = kNum("Text size", "f", o.f, 8, 80) + colorRow("color", o.color) + kSeg("Panel", "panel", [[true, "On"], [false, "Off"]], o.panel !== false);
        if (o.panel !== false) panel += kSlider("Opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 0.88 : o.bgOpacity) * 100), 0, 100, "%", "pct");
        h += group("Style", panel);
      } else if (o.type === "track") {
        var times = trackPins(o).map(function (_, i) {
          return '<div class="prop-row"><label>Pin ' + (i + 1) + '</label><div class="ctrl"><input class="input" type="text" data-ktime="' + i + '" value="' + esc((o.times || [])[i] || "") + '" placeholder="Time or note"></div></div>';
        }).join("");
        h += group("Pins", kSeg("Numbers", "numbers", [[true, "On"], [false, "Off"]], o.numbers !== false) +
          kSeg("Time chips", "showTimes", [[true, "On"], [false, "Off"]], o.showTimes !== false) +
          kSeg("Start point", "pinStart", [[false, "No pin"], [true, "Pin"]], !!o.pinStart) + times);
        h += group("Line", kSeg("Direction", "chevrons", [[true, "On"], [false, "Off"]], o.chevrons !== false) +
          kNum("Width", "lineW", o.lineW, 1, 40) + kNum("Pin size", "f", o.f, 6, 80) + colorRow("accent", o.accent));
      }
      if (o.type === "shiptag") {
        h += group("Tag", kText("Name", "label", o.label) + kAlign(o) +
          kArea("Details", "detail", o.detail || "", "e.g. Bulk carrier\nIMO 9341287") +
          '<p class="layers-hint" style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Optional. Each line adds a row under the name — vessel type, IMO, flag, MMSI…</p>' +
          colorRow("accent", o.accent) +
          kSlider("Opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 0.92 : o.bgOpacity) * 100), 0, 100, "%", "pct") + kNum("Text size", "f", o.f, 6, 80));
        var tl = kSeg("Leader", "leaderShow", [[true, "On"], [false, "Off"]], o.leaderShow !== false);
        if (o.leaderShow !== false) tl += kSlider("Angle", "leaderAngle", o.leaderAngle || 0, 0, 360, "°", "num", 1, true) + kNum("Length", "leaderLen", Math.round(o.leaderLen || 0), 0, 4000) +
          kEnd(o, "ring") + kNum("Thickness", "leaderW", Math.round(leaderWidth(o) * 10) / 10, 0.5, 40, 0.5) + '<p class="layers-hint" style="margin:6px 0 6px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Line colour</p>' + colorRow("leaderColor", leaderColor(o));
        h += group("Leader line", tl);
      } else if (o.type === "distance") {
        h += group("Distance", kText("Label", "label", o.label, "e.g. 12.4 km") + kSeg("Ends", "ends", [["none", "None"], ["dot", "Dot"], ["tick", "Tick"]], o.ends || "none") +
          '<p class="layers-hint" style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Stretch to length, then use the rotate handle to aim it.</p>' +
          colorRow("color", o.color) + kNum("Size", "f", o.f, 6, 80));
      } else if (o.type === "aoi") {
        h += group("Area", kText("Tab label", "label", o.label, "leave empty to hide") + kSeg("Line", "dashed", [[true, "Dashed"], [false, "Solid"]], o.dashed !== false) +
          kSlider("Fill", "fill", Math.round((o.fill || 0) * 100), 0, 60, "%", "pct") + colorRow("color", o.color) + kNum("Size", "f", o.f, 6, 80));
      } else if (o.type === "poipin") {
        h += group("Pin", kText("Name", "title", o.title) + kText("Detail", "subtitle", o.subtitle, "e.g. coordinates") + kAlign(o) +
          kSeg("Card", "card", [[true, "On"], [false, "Off"]], o.card !== false) + colorRow("accent", o.accent) + kNum("Size", "f", o.f, 6, 80));
      } else if (o.type === "zonelabel") {
        h += group("Zone", kText("Kicker", "kicker", o.kicker, "optional") + kText("Name", "name", o.name) + kText("Badge", "badge", o.badge, "optional") + kAlign(o) +
          colorRow("accent", o.accent) + kNum("Size", "f", o.f, 6, 80));
      } else if (o.type === "placelabel") {
        h += group("Place", kText("Name", "name", o.name) + kText("Second line", "sub", o.sub, "optional") +
          kAlign({ align: o.align === "left" || o.align === "right" ? o.align : "center" }) + colorRow("color", o.color) + kNum("Size", "f", o.f, 6, 120));

      } else if (o.type === "stamp2") {
        h += group("Timestamp", kText("Label", "kicker", o.kicker, "optional") + kText("Date & time", "value", o.value) +
          '<div class="prop-row"><button class="view-btn" data-kact="now" style="flex:1">' + Icons.svg("clock", { size: 14 }) + "Set to now (UTC)</button></div>" + kNum("Size", "f", o.f, 6, 80));
      } else if (o.type === "maplegend") {
        var its = (o.items || []).map(function (it, i) {
          return '<div class="leg-row"><input type="color" data-kitem="color" data-kidx="' + i + '" value="' + esc(it.color || "#ffffff") + '" title="Colour" style="width:28px;height:28px;padding:0;border:0;background:none;flex:none">' +
            '<select class="select" data-kitem="sym" data-kidx="' + i + '" style="width:92px;flex:none">' + LEGEND_SYMS.map(function (sy) {
              return '<option value="' + sy[0] + '"' + (it.sym === sy[0] ? " selected" : "") + ">" + sy[1] + "</option>"; }).join("") + "</select>" +
            '<input class="input leg-label" data-kitem="label" data-kidx="' + i + '" value="' + esc(it.label) + '" placeholder="Label">' +
            '<button class="leg-x" data-kitemdel="' + i + '" title="Remove">' + Icons.svg("trash", { size: 13 }) + "</button></div>";
        }).join("");
        var LAYOUT_IC = {
          stacked: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="5" cy="6" r="1.6" fill="currentColor"/><path d="M10 6h10"/><circle cx="5" cy="12" r="1.6" fill="currentColor"/><path d="M10 12h10"/><circle cx="5" cy="18" r="1.6" fill="currentColor"/><path d="M10 18h10"/></svg>',
          inline:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="3.5" cy="12" r="1.6" fill="currentColor"/><path d="M6.5 12h3"/><circle cx="13" cy="12" r="1.6" fill="currentColor"/><path d="M16 12h3"/><circle cx="22" cy="12" r="1.2" fill="currentColor"/></svg>'
        };
        var lay = o.layout === "inline" ? "inline" : "stacked";
        var layRow = '<div class="prop-row"><label>Layout</label><div class="ctrl seg2">' + [["stacked", "Stacked"], ["inline", "Inline"]].map(function (l) {
          return '<button data-kseg="layout" data-kval="' + esc(JSON.stringify(l[0])) + '" class="' + (lay === l[0] ? "on" : "") + '" title="' + l[1] + '" style="display:inline-flex;align-items:center;justify-content:center;gap:6px">' + LAYOUT_IC[l[0]] + l[1] + "</button>";
        }).join("") + "</div></div>";
        h += group("Legend", layRow + kText("Title", "title", o.title, "optional") + its +
          '<button class="view-btn leg-add" data-kitemadd="1">' + Icons.svg("plus", { size: 14 }) + "Add item</button>" + kNum("Size", "f", o.f, 6, 80));
      } else if (o.type === "footer") {
        var brands = Store.getBrandAssets();
        var logoSel = '<div class="prop-row"><label>Logo</label><div class="ctrl"><select class="select" data-klogo="1"><option value="">None</option>' +
          brands.map(function (a) { return '<option value="' + a.id + '"' + (o.logoId === a.id ? " selected" : "") + ">" + esc(a.name) + "</option>"; }).join("") +
          "</select></div></div>" + (brands.length ? "" : '<p class="layers-hint" style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Add your logo in the Brand tab to use it here.</p>');
        var ic = kSeg("Icon", "showIcon", [[true, "On"], [false, "Off"]], !!o.showIcon);
        if (o.showIcon) ic += '<div class="lib-search" style="padding:0;background:none;border:none;margin-top:2px"><span class="lib-search-ic">' + Icons.svg("search", { size: 14 }) + "</span>" +
          '<input id="labelIconSearch" class="lib-search-input" type="text" placeholder="Search icons…" value=""></div>' +
          '<div class="lib-grid" id="labelIconGrid" style="padding:8px 0 0"></div>' +
          kNum("Size", "iconSize", o.iconSize > 0 ? o.iconSize : Math.round(o.f * 1.9), 8, 400) + colorRow("iconColor", o.iconColor || "#ffffff");
        h += group("Footer", kText("Title", "title", o.title) + kText("Subtitle", "subtitle", o.subtitle, "optional") + logoSel +
          colorRow("accent", o.accent) + kSlider("Opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 0.96 : o.bgOpacity) * 100), 0, 100, "%", "pct") + kNum("Text size", "f", o.f, 6, 80) +
          '<p class="layers-hint" style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Set the strap’s height with its handles or the Height field.</p>');
        h += group("Icon", ic);
      }
      if (HAS_SHADOW[o.type]) h += group("Shadow", kSlider("Opacity", "shadowOpacity", Math.round(shMul(o) * 100), 0, 100, "%", "pct"));
      return h;
    }

    function refresh(ob, rebuild) { fit(ob); renderObjects(); wireObjectEvents(); if (rebuild) renderProps(); markDirty(); }
    function wire(panel, o) {
      panel.querySelectorAll("[data-kprop]").forEach(function (inp) {
        var key = inp.getAttribute("data-kprop"), kind = inp.getAttribute("data-ktype") || "text";
        var isNumField = inp.type === "number";
        var ev = (inp.type === "range" || inp.type === "text" || inp.tagName === "TEXTAREA" || isNumField) ? "input" : "change";
        function apply(commit) {
          var ob = getSel(); if (!ob) return;
          var v = inp.value;
          if (kind === "num") {
            if (inp.value === "") return;
            v = +v; if (isNaN(v)) return;
            if (isNumField) {
              var mn = inp.min === "" ? -Infinity : +inp.min, mx = inp.max === "" ? Infinity : +inp.max;
              if (v < mn || v > mx) { if (!commit) return; v = Math.min(mx, Math.max(mn, v)); inp.value = v; }
              if (v === ob[key]) return;
            }
          }
          if (kind === "pct") v = +v / 100;
          if (key === "f" && (ob.type === "callout" || ob.type === "scalebar" || ob.type === "distance") && ob.f && v > 0) {
            var k = v / ob.f; ob.w = Math.round(ob.w * k); if (ob.leaderLen) ob.leaderLen = Math.round(ob.leaderLen * k); if (ob.radius) ob.radius = Math.round(ob.radius * k);
          }
          ob[key] = v;
          if (inp.type === "range") { var s = inp.parentElement.querySelector(".val"); if (s) s.textContent = inp.value + (inp.getAttribute("data-unit") || ""); }
          refresh(ob, false);
          var pw = panel.querySelector('[data-prop="w"]'); if (pw) pw.value = Math.round(ob.w);
          var ph = panel.querySelector('[data-prop="h"]'); if (ph) ph.value = Math.round(ob.h);
          panel.querySelectorAll('[data-kprop="' + key + '"]').forEach(function (other) {   // slider ⇄ number box
            if (other === inp || other.tagName === "TEXTAREA" || other.type === "text") return;
            if (kind === "num") other.value = other.type === "number" ? Math.round(ob[key] * 10) / 10 : ob[key];
          });
        }
        inp.addEventListener(ev, function () { apply(false); });
        if (isNumField) inp.addEventListener("change", function () { apply(true); });
        inp.addEventListener("change", function () { pushHistory(); markDirty(); renderLayers(); });
      });
      panel.querySelectorAll("[data-kseg]").forEach(function (b) {
        b.addEventListener("click", function () {
          var ob = getSel(); if (!ob) return;
          ob[b.getAttribute("data-kseg")] = JSON.parse(b.getAttribute("data-kval"));
          if (b.getAttribute("data-kseg") === "showIcon" && ob.showIcon && !ob.iconKey) ob.iconKey = "Ship";
          if (b.getAttribute("data-kseg") === "media" && ob.media === "upload" && !ob.image) { pick(ob); }
          refresh(ob, true); pushHistory(); renderLayers();
        });
      });
      panel.querySelectorAll("[data-krow]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var ob = getSel(); if (!ob) return;
          ob.rows[+inp.getAttribute("data-kidx")][inp.getAttribute("data-krow")] = inp.value; refresh(ob, false);
        });
        inp.addEventListener("change", function () { pushHistory(); });
      });
      panel.querySelectorAll("[data-krowdel]").forEach(function (b) {
        b.addEventListener("click", function () { var ob = getSel(); ob.rows.splice(+b.getAttribute("data-krowdel"), 1); refresh(ob, true); pushHistory(); });
      });
      panel.querySelectorAll("[data-krowadd]").forEach(function (b) {
        b.addEventListener("click", function () { var ob = getSel(); ob.rows = ob.rows || []; ob.rows.push({ k: "KEY", v: "Value" }); refresh(ob, true); pushHistory(); });
      });
      panel.querySelectorAll("[data-ktime]").forEach(function (inp) {
        inp.addEventListener("input", function () { var ob = getSel(); if (!ob) return; ob.times[+inp.getAttribute("data-ktime")] = inp.value; refresh(ob, false); });
        inp.addEventListener("change", function () { pushHistory(); });
      });
      panel.querySelectorAll("[data-kitem]").forEach(function (inp) {
        var ev = inp.tagName === "SELECT" ? "change" : "input";
        inp.addEventListener(ev, function () {
          var ob = getSel(); if (!ob) return;
          ob.items[+inp.getAttribute("data-kidx")][inp.getAttribute("data-kitem")] = inp.value; refresh(ob, false);
          var ph = panel.querySelector('[data-prop="h"]'); if (ph) ph.value = Math.round(ob.h);
        });
        inp.addEventListener("change", function () { pushHistory(); });
      });
      panel.querySelectorAll("[data-kitemdel]").forEach(function (b) {
        b.addEventListener("click", function () { var ob = getSel(); ob.items.splice(+b.getAttribute("data-kitemdel"), 1); refresh(ob, true); pushHistory(); });
      });
      panel.querySelectorAll("[data-kitemadd]").forEach(function (b) {
        b.addEventListener("click", function () { var ob = getSel(); ob.items = ob.items || []; ob.items.push({ sym: "dot", color: "#00AEEF", label: "New item" }); refresh(ob, true); pushHistory(); });
      });
      panel.querySelectorAll("[data-klogo]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          var ob = getSel(); if (!ob) return;
          var a = Store.getBrandAssets().filter(function (x) { return x.id === sel.value; })[0];
          if (a) { ob.logoId = a.id; ob.logo = a.src; ob.logoW = a.w || 1; ob.logoH = a.h || 1; } else { ob.logoId = null; ob.logo = null; }
          refresh(ob, false); pushHistory();
        });
      });
      panel.querySelectorAll('[data-kact="now"]').forEach(function (b) {
        b.addEventListener("click", function () { var ob = getSel(); ob.value = utcStamp(); refresh(ob, true); pushHistory(); });
      });
      panel.querySelectorAll('[data-kact="upload"]').forEach(function (b) { b.addEventListener("click", function () { pick(getSel()); }); });
    }
    function pick(ob) {
      if (!ob) return;
      var inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/jpeg,image/jpg,image/png,image/webp";
      inp.onchange = function () {
        var fl = inp.files && inp.files[0]; if (!fl) return;
        UI.fileToImage(fl, 1200, function (im) { ob.image = im.src; ob.imgW = im.w; ob.imgH = im.h; ob.media = "upload"; refresh(ob, true); pushHistory(); });
      };
      inp.click();
    }

    return { has: has, init: init, fit: fit, mediaResize: mediaResize, autoH: autoH, autoSize: autoSize, heightScaled: heightScaled, minHeight: minHeight, editSize: editSize, place: place, heightFor: heightFor, svg: svg, contentHTML: contentHTML, draw: draw,
             icon: icon, label: label, libHTML: libHTML, props: props, wire: wire };
  })();

  /* ============================================================
     STAGE TRANSFORM / VIEW
  ============================================================ */
  function applyTransform() {
    stage.style.transform = "translate(" + S.panX + "px," + S.panY + "px) scale(" + S.zoom + ")";
    stage.style.setProperty("--z", S.zoom);
    $("zoomLabel").textContent = Math.round(S.zoom * 100) + "%";
    // Redraw the grid when the zoom changes so line weight stays constant on screen.
    if (S.showGrid && gridZoomCache !== S.zoom) drawGrid();
  }
  function fitToScreen() {
    if (!image) return;
    var pad = 56;
    var vw = canvasWrap.clientWidth - pad * 2, vh = canvasWrap.clientHeight - pad * 2;
    var z = Math.min(vw / image.w, vh / image.h, 4);
    S.zoom = Math.max(0.05, z);
    S.panX = (canvasWrap.clientWidth - image.w * S.zoom) / 2;
    S.panY = (canvasWrap.clientHeight - image.h * S.zoom) / 2;
    applyTransform();
  }
  function centerCanvas() {
    if (!image) return;
    S.panX = (canvasWrap.clientWidth - image.w * S.zoom) / 2;
    S.panY = (canvasWrap.clientHeight - image.h * S.zoom) / 2;
    applyTransform();
  }
  function zoomAt(factor, cx, cy) {
    if (!image) return;
    var rect = canvasWrap.getBoundingClientRect();
    cx = cx == null ? rect.width / 2 : cx - rect.left;
    cy = cy == null ? rect.height / 2 : cy - rect.top;
    var newZoom = clamp(S.zoom * factor, 0.05, 8);
    var k = newZoom / S.zoom;
    S.panX = cx - (cx - S.panX) * k;
    S.panY = cy - (cy - S.panY) * k;
    S.zoom = newZoom;
    applyTransform();
  }
  function setZoom100() {
    if (!image) return;
    var rect = canvasWrap.getBoundingClientRect();
    zoomAt(1 / S.zoom, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  /* ---- Canvas: its own size, the image's position on it, and a background ---- */
  // image.bw/bh = the image's pixels; image.w/h = canvas size (stage, guides, export, fit);
  // image.bx/by = where the image sits on the canvas.
  function canvasOf(img) { var c = img && img.canvas; return (c && c.w > 0 && c.h > 0) ? c : null; }
  function applyCanvas() {
    if (!image) return;
    var c = canvasOf(image) || { w: image.bw, h: image.bh, x: 0, y: 0, bg: "transparent" };
    image.w = Math.round(c.w); image.h = Math.round(c.h);
    image.bx = Math.round(c.x || 0); image.by = Math.round(c.y || 0);
    image.canvasBg = c.bg || "transparent";
    stage.style.width = image.w + "px"; stage.style.height = image.h + "px";
    stageImg.style.left = image.bx + "px"; stageImg.style.top = image.by + "px";
    stageImg.style.width = image.bw + "px"; stageImg.style.height = image.bh + "px";
    stage.classList.toggle("canvas-transparent", image.canvasBg === "transparent");
    stage.style.backgroundColor = image.canvasBg === "transparent" ? "" : image.canvasBg;
  }
  function canvasMatches() { return image && image.w === image.bw && image.h === image.bh && !image.bx && !image.by; }
  function setCanvas(nc) {
    var ox = image.bx || 0, oy = image.by || 0;
    if (nc && nc.w === image.bw && nc.h === image.bh && !nc.x && !nc.y && (!nc.bg || nc.bg === "transparent")) nc = null;  // same as the image
    image.canvas = nc;
    applyCanvas();
    var dx = (image.bx || 0) - ox, dy = (image.by || 0) - oy;   // annotations stay attached to the image
    if (dx || dy) S.objects.forEach(function (o) { o.x = (o.x || 0) + dx; o.y = (o.y || 0) + dy; });
    Store.updateImage(projectId, imageId, { canvas: nc });
    drawGrid(); fitToScreen(); renderObjects(); wireObjectEvents(); renderLayers(); renderProps(); layoutCvOverlay();
    pushHistory(); markDirty();
  }
  function restoreSnap(state) {
    var st = JSON.parse(state);
    if (Array.isArray(st)) { S.objects = st; return; }
    S.objects = st.o || [];
    if (image && JSON.stringify(canvasOf(image)) !== JSON.stringify(st.c || null)) {
      image.canvas = st.c || null; applyCanvas(); Store.updateImage(projectId, imageId, { canvas: image.canvas }); drawGrid(); fitToScreen(); layoutCvOverlay();
    }
  }
  function canvasPanelHTML() {
    if (!image) return "";
    var c = canvasOf(image) || { w: image.bw, h: image.bh, x: 0, y: 0, ax: 0.5, ay: 0.5, bg: "transparent" };
    var ax = c.ax !== undefined ? c.ax : 0.5, ay = c.ay !== undefined ? c.ay : 0.5, bg = c.bg || "transparent";
    var grid = "";
    [0, 0.5, 1].forEach(function (yy) { [0, 0.5, 1].forEach(function (xx) {
      grid += '<button class="cv-cell' + (xx === ax && yy === ay ? " on" : "") + '" data-cvanchor="' + xx + "," + yy + '" title="Image position"><span></span></button>';
    }); });
    var sw = SWATCHES.map(function (col) {
      return '<div class="color-sw' + (bg.toLowerCase() === col.toLowerCase() ? " on" : "") + '" data-cvcolor="' + col + '" style="background:' + col + '"></div>';
    }).join("") + '<label class="color-sw custom" title="Custom colour" style="position:relative;overflow:hidden">' + Icons.svg("plus", { size: 13 }) +
      '<input type="color" data-cvcustom="1" value="' + (bg !== "transparent" ? bg : "#ffffff") + '" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>';
    var hint = 'style="margin:2px 0 8px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)"';
    return '<div class="prop-group"><h4>Canvas</h4>' +
      '<div class="prop-row"><label>Width</label><div class="ctrl"><input class="input" type="number" data-cv="w" value="' + Math.round(c.w) + '" min="16" max="20000"></div></div>' +
      '<div class="prop-row"><label>Height</label><div class="ctrl"><input class="input" type="number" data-cv="h" value="' + Math.round(c.h) + '" min="16" max="20000"></div></div>' +
      '<p class="layers-hint" ' + hint + '>Image: ' + image.bw + " × " + image.bh + " px" + (canvasMatches() ? " · canvas matches the image" : "") + "</p>" +
      '<div class="prop-row" style="gap:6px"><button class="view-btn' + (cvMode ? " on" : "") + '" data-cvact="tool" style="flex:1">' + Icons.svg(cvMode ? "check" : "edit", { size: 14 }) + (cvMode ? "Done" : "Edit on canvas") + "</button>" +
      '<button class="view-btn" data-cvact="match" style="flex:1"' + (canvasMatches() ? " disabled" : "") + ">" + Icons.svg("reset", { size: 14 }) + "Match image</button></div>" +
      '<div class="prop-row" style="align-items:flex-start"><label>Image position</label><div class="ctrl"><div class="cv-anchor">' + grid + "</div></div></div>" +
      "</div>" +
      '<div class="prop-group"><h4>Background</h4>' +
      '<div class="prop-row"><label>Fill</label><div class="ctrl seg2"><button data-cvbg="transparent" class="' + (bg === "transparent" ? "on" : "") + '">Transparent</button>' +
      '<button data-cvbg="color" class="' + (bg !== "transparent" ? "on" : "") + '">Colour</button></div></div>' +
      (bg !== "transparent" ? '<div class="prop-row"><div class="ctrl"><div class="color-swatches">' + sw + "</div></div></div>" : "") +
      "</div>";
  }
  function wireCanvasPanel(panel) {
    if (!image) return;
    function cur() { var c = canvasOf(image); return c ? JSON.parse(JSON.stringify(c)) : { w: image.bw, h: image.bh, x: 0, y: 0, ax: 0.5, ay: 0.5, bg: "transparent" }; }
    function place(c) {   // position the image on the canvas from the anchor (a dragged position has none)
      if (c.ax != null) c.x = Math.round((c.w - image.bw) * c.ax);
      if (c.ay != null) c.y = Math.round((c.h - image.bh) * c.ay);
      return c;
    }
    panel.querySelectorAll("[data-cv]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var v = Math.round(+inp.value); if (!(v >= 16)) { inp.value = inp.getAttribute("data-cv") === "w" ? image.w : image.h; return; }
        var c = cur(); c[inp.getAttribute("data-cv")] = Math.min(20000, v); setCanvas(place(c));
      });
    });
    var tl = panel.querySelector('[data-cvact="tool"]'); if (tl) tl.addEventListener("click", toggleCanvasMode);
    var m = panel.querySelector('[data-cvact="match"]'); if (m) m.addEventListener("click", function () {
      var c = cur(); setCanvas(c.bg && c.bg !== "transparent" ? { w: image.bw, h: image.bh, x: 0, y: 0, ax: 0.5, ay: 0.5, bg: c.bg } : null);
    });
    panel.querySelectorAll("[data-cvanchor]").forEach(function (b) {
      b.addEventListener("click", function () { var a = b.getAttribute("data-cvanchor").split(","), c = cur(); c.ax = +a[0]; c.ay = +a[1]; setCanvas(place(c)); });
    });
    panel.querySelectorAll("[data-cvbg]").forEach(function (b) {
      b.addEventListener("click", function () { var c = cur(); c.bg = b.getAttribute("data-cvbg") === "transparent" ? "transparent" : (c.bg && c.bg !== "transparent" ? c.bg : "#ffffff"); setCanvas(place(c)); });
    });
    panel.querySelectorAll("[data-cvcolor]").forEach(function (s) {
      s.addEventListener("click", function () { var c = cur(); c.bg = s.getAttribute("data-cvcolor"); setCanvas(place(c)); });
    });
    var cc = panel.querySelector("[data-cvcustom]"); if (cc) cc.addEventListener("change", function () { var c = cur(); c.bg = cc.value; setCanvas(place(c)); });
  }

  /* ---- Canvas tool: drag handles to resize the canvas, drag the image to move it ---- */
  var cvMode = false, cvOverlay = null;
  function enterCanvasMode() {
    if (!image) { UI.toast({ type: "warning", title: "Upload an image first" }); return; }
    if (typeof cropMode !== "undefined" && cropMode) exitCropMode();
    if (drawMode) setDrawMode(false);
    deselect(); cvMode = true;
    canvasWrap.classList.add("canvas-mode"); var b = $("btnCanvas"); if (b) b.classList.add("is-active");
    buildCvOverlay(); cvEnsureVisible(); renderProps();
    UI.toast({ type: "info", title: "Canvas", desc: "Drag the edges to resize · drag the image to move it · Esc when done.", duration: 3200 });
  }
  function exitCanvasMode() {
    cvMode = false;
    if (cvOverlay) { cvOverlay.remove(); cvOverlay = null; }
    canvasWrap.classList.remove("canvas-mode"); var b = $("btnCanvas"); if (b) b.classList.remove("is-active");
    renderProps();
  }
  // keep every handle reachable: re-fit the view if the canvas runs outside the visible area
  function cvEnsureVisible() {
    var r = stage.getBoundingClientRect(), v = canvasWrap.getBoundingClientRect(), m = 24;
    if (r.left < v.left + m || r.top < v.top + m || r.right > v.right - m || r.bottom > v.bottom - m) fitToScreen();
  }
  function toggleCanvasMode() { if (cvMode) exitCanvasMode(); else enterCanvasMode(); }
  function cvState() { var c = canvasOf(image); return { w: image.w, h: image.h, x: image.bx || 0, y: image.by || 0, bg: (c && c.bg) || "transparent" }; }
  function anchorOf(off, cw, iw) {
    var free = cw - iw; if (Math.abs(free) < 1) return 0.5;
    var r = off / free, hit = null; [0, 0.5, 1].forEach(function (v) { if (Math.abs(r - v) < 0.002) hit = v; }); return hit;
  }
  function cvApplyLive(c, pan) {
    image.canvas = { w: c.w, h: c.h, x: c.x, y: c.y, ax: anchorOf(c.x, c.w, image.bw), ay: anchorOf(c.y, c.h, image.bh), bg: c.bg };
    applyCanvas();
    if (pan) { S.panX = pan.x; S.panY = pan.y; applyTransform(); }
  }
  function buildCvOverlay() {
    cvOverlay = document.createElement("div"); cvOverlay.id = "cvOverlay";
    cvOverlay.innerHTML = '<div class="cv-frame"></div><div class="cv-img" title="Drag to move the image"></div>' +
      ["nw", "n", "ne", "e", "se", "s", "sw", "w"].map(function (h) { return '<div class="cv-h cv-' + h + '" data-cvh="' + h + '" title="Drag to resize the canvas"></div>'; }).join("") +
      '<div class="cv-size"></div>';
    stage.appendChild(cvOverlay);
    cvOverlay.querySelectorAll("[data-cvh]").forEach(function (h) { h.addEventListener("pointerdown", function (e) { startCvResize(e, h.getAttribute("data-cvh")); }); });
    cvOverlay.querySelector(".cv-img").addEventListener("pointerdown", startCvMove);
    layoutCvOverlay();
  }
  function layoutCvOverlay(snapped) {
    if (!cvOverlay || !image) return;
    var im = cvOverlay.querySelector(".cv-img");
    im.style.left = image.bx + "px"; im.style.top = image.by + "px"; im.style.width = image.bw + "px"; im.style.height = image.bh + "px";
    var match = image.w === image.bw && image.h === image.bh;
    cvOverlay.querySelector(".cv-size").textContent = image.w + " × " + image.h + (match ? "  ·  matches image" : "");
    cvOverlay.classList.toggle("snapped", !!snapped);
  }
  function cvObjs() { return S.objects.map(function (o) { return { o: o, x: o.x || 0, y: o.y || 0 }; }); }
  function startCvResize(e, h) {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    var z = S.zoom, r0 = stage.getBoundingClientRect(), s0 = cvState(), pan0 = { x: S.panX, y: S.panY }, objs0 = cvObjs();
    var I = { l: s0.x, t: s0.y, r: s0.x + image.bw, b: s0.y + image.bh }, th = 8 / z;
    function snapTo(v, cands) { var best = v, d = th, hit = false; cands.forEach(function (c) { if (Math.abs(v - c) < d) { d = Math.abs(v - c); best = c; hit = true; } }); return [best, hit]; }
    function mv(ev) {
      var qx = (ev.clientX - r0.left) / z, qy = (ev.clientY - r0.top) / z;
      var L = 0, T = 0, R = s0.w, B = s0.h, snapped = false, sn;
      if (h.indexOf("w") > -1) { sn = snapTo(qx, [I.l, 0]); L = Math.min(sn[0], R - 16); snapped = snapped || sn[1]; }
      if (h.indexOf("e") > -1) { sn = snapTo(qx, [I.r, s0.w]); R = Math.max(sn[0], L + 16); snapped = snapped || sn[1]; }
      if (h.indexOf("n") > -1) { sn = snapTo(qy, [I.t, 0]); T = Math.min(sn[0], B - 16); snapped = snapped || sn[1]; }
      if (h.indexOf("s") > -1) { sn = snapTo(qy, [I.b, s0.h]); B = Math.max(sn[0], T + 16); snapped = snapped || sn[1]; }
      L = Math.round(L); T = Math.round(T); R = Math.round(R); B = Math.round(B);
      cvApplyLive({ w: R - L, h: B - T, x: s0.x - L, y: s0.y - T, bg: s0.bg }, { x: pan0.x + L * z, y: pan0.y + T * z });
      objs0.forEach(function (rec) { rec.o.x = rec.x - L; rec.o.y = rec.y - T; updateObjEl(rec.o); });
      layoutCvOverlay(snapped);
    }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); cvCommit(); }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }
  function startCvMove(e) {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    var z = S.zoom, sx = e.clientX, sy = e.clientY, s0 = cvState(), objs0 = cvObjs(), th = 8 / z;
    function mv(ev) {
      var nx = s0.x + (ev.clientX - sx) / z, ny = s0.y + (ev.clientY - sy) / z, snapped = false;
      [[nx, 0], [nx + image.bw, s0.w], [nx + image.bw / 2, s0.w / 2]].some(function (p) { if (Math.abs(p[0] - p[1]) < th) { nx += p[1] - p[0]; snapped = true; return true; } });
      [[ny, 0], [ny + image.bh, s0.h], [ny + image.bh / 2, s0.h / 2]].some(function (p) { if (Math.abs(p[0] - p[1]) < th) { ny += p[1] - p[0]; snapped = true; return true; } });
      nx = Math.round(nx); ny = Math.round(ny);
      cvApplyLive({ w: s0.w, h: s0.h, x: nx, y: ny, bg: s0.bg });
      var dx = nx - s0.x, dy = ny - s0.y;
      objs0.forEach(function (rec) { rec.o.x = rec.x + dx; rec.o.y = rec.y + dy; updateObjEl(rec.o); });
      layoutCvOverlay(snapped);
    }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); cvCommit(); }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }
  function cvCommit() {
    var c = canvasOf(image), nc = c;
    if (c && c.w === image.bw && c.h === image.bh && !c.x && !c.y && (!c.bg || c.bg === "transparent")) nc = null;
    image.canvas = nc; applyCanvas();
    Store.updateImage(projectId, imageId, { canvas: nc });
    drawGrid(); renderObjects(); wireObjectEvents(); layoutCvOverlay(); renderProps();
    cvEnsureVisible();
    pushHistory(); markDirty();
  }

  // client coords -> image coords
  function toImage(clientX, clientY) {
    var r = stage.getBoundingClientRect();   // canvas coordinates (the image may sit inside a larger canvas)
    return { x: (clientX - r.left) / S.zoom, y: (clientY - r.top) / S.zoom };
  }

  /* ============================================================
     RENDER OBJECTS
  ============================================================ */
  function objContentHTML(o) {
    if (o.type === "icon") {
      return Icons.svg(o.iconKey, { size: Math.min(o.w, o.h), stroke: o.color, fill: iconFilled(o.iconKey) ? o.color : "none" });
    }
    if (o.type === "shape") return shapeSVG(o);
    if (o.type === "polygon") return polygonSVG(o);
    if (o.type === "polyline") return polylineSVG(o);
    if (o.type === "arrow") return arrowSVG(o);
    if (o.type === "watermark") return watermarkSVG(o);
    // label / caption
    var textStyle = "color:" + o.color + ";font-family:'" + o.font + "';font-size:" + o.fontSize + "px;" +
      "font-weight:" + o.fontWeight + ";text-align:" + o.align + ";" +
      (o.italic ? "font-style:italic;" : "") + (o.underline ? "text-decoration:underline;" : "") +
      (o.shadow ? "text-shadow:0 2px 6px rgba(0,0,0," + shA(o, 0.7) + ");" : "") + "line-height:1.2;";
    var textEl = '<div class="obj-text" style="' + textStyle + '">' + UI.escapeHtml(o.text) + "</div>";
    if ((o.type === "label" || o.type === "caption") && o.iconSide && o.iconKey) {
      var isz = Math.round(o.fontSize * 1.15);
      var glyph = '<span class="obj-labelicon" style="flex:0 0 auto;display:inline-flex;color:' + o.color + '">' +
        Icons.svg(o.iconKey, { size: isz, stroke: o.color, fill: iconFilled(o.iconKey) ? o.color : "none" }) + "</span>";
      var gap = Math.round(o.fontSize * 0.45);
      var row = "display:inline-flex;align-items:center;gap:" + gap + "px;";
      return '<div style="' + row + '">' + (o.iconSide === "left" ? glyph + textEl : textEl + glyph) + "</div>";
    }
    return textEl;
  }
  function iconFilled(k) { return { bolt: 1, pin: 1, danger: 1 }[k]; }

  // Watermark: repeated / diagonal / corner text, rendered as one SVG that fills
  // the object box (identical in the DOM and on the export canvas).
  function watermarkSVG(o) {
    var w = Math.max(1, Math.round(o.w)), h = Math.max(1, Math.round(o.h));
    var txt = o.text || "WATERMARK";
    var col = o.color || "#ffffff";
    var op = (o.wmOpacity == null ? 0.28 : o.wmOpacity);
    var fs = Math.max(6, Math.round(o.fontSize || 24));
    var weight = o.fontWeight || 700;
    var font = o.font || "Inter";
    var angle = (o.wmAngle == null ? -30 : o.wmAngle);
    var style = o.wmStyle || "tile";
    var esc = UI.escapeHtml;
    var common = "font-family:'" + font + "',sans-serif;font-weight:" + weight + ";font-size:" + fs + "px;";
    var open = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">';
    var body;
    if (style === "band") {
      body = '<text x="' + (w / 2) + '" y="' + (h / 2) + '" transform="rotate(' + angle + " " + (w / 2) + " " + (h / 2) + ')" text-anchor="middle" dominant-baseline="central" fill="' + col + '" fill-opacity="' + op + '" style="' + common + "letter-spacing:0.1em\">" + esc(txt) + "</text>";
    } else if (style === "corner") {
      body = '<text x="' + (w - Math.round(fs * 0.4)) + '" y="' + (h / 2) + '" text-anchor="end" dominant-baseline="central" fill="' + col + '" fill-opacity="' + Math.min(1, op + 0.35) + '" style="' + common + '">' + esc(txt) + "</text>";
    } else {
      var dens = (o.wmDensity == null ? 100 : o.wmDensity) / 100;
      var gapX = Math.max(fs * 3, Math.round(fs * (txt.length * 0.62 + 3) * dens));
      var gapY = Math.max(Math.round(fs * 1.6), Math.round(fs * 2.6 * dens));
      var texts = "", row = 0;
      for (var y = -h; y <= h * 2; y += gapY, row++) {
        var off = (row % 2) * (gapX / 2);
        for (var x = -w; x <= w * 2; x += gapX) {
          texts += '<text x="' + Math.round(x + off) + '" y="' + Math.round(y) + '" text-anchor="middle" dominant-baseline="central">' + esc(txt) + "</text>";
        }
      }
      body = '<g transform="rotate(' + angle + " " + (w / 2) + " " + (h / 2) + ')" fill="' + col + '" fill-opacity="' + op + '" style="' + common + '">' + texts + "</g>";
    }
    return open + body + "</svg>";
  }

  // Leader-line geometry + defaults. The line starts at the label's left-middle
  // anchor and reaches out by `leaderLength` at `leaderAngle` degrees
  // (180° = straight left). Endpoint carries a small target dot.
  function leaderGeom(o) {
    var color = o.leaderColor || o.borderColor || "#00AEEF";
    var angle = (o.leaderAngle == null ? 180 : o.leaderAngle);
    var len = (o.leaderLength == null ? Math.round(o.w * 0.5) : o.leaderLength);
    var rad = angle * Math.PI / 180;
    var ax = 0, ay = o.h / 2;
    var ex = ax + len * Math.cos(rad), ey = ay + len * Math.sin(rad);
    return { color: color, angle: angle, len: len, ax: ax, ay: ay, ex: ex, ey: ey };
  }
  function leaderSVG(o) {
    var g = leaderGeom(o);
    return '<svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="' + o.w + '" height="' + o.h + '">' +
      '<line x1="' + g.ax + '" y1="' + g.ay + '" x2="' + g.ex.toFixed(1) + '" y2="' + g.ey.toFixed(1) + '" stroke="' + g.color + '" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="' + g.ex.toFixed(1) + '" cy="' + g.ey.toFixed(1) + '" r="4" fill="' + g.color + '"/></svg>';
  }

  function captionBoxStyle(o) {
    var jc = o.align === "left" ? "flex-start" : (o.align === "right" ? "flex-end" : "center");
    var st = "width:100%;height:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:" + jc + ";padding:" +
      Math.round(o.fontSize * 0.4) + "px " + Math.round(o.fontSize * 0.7) + "px;overflow:hidden;";
    var cs = o.captionStyle;
    var bgc = hexRgba(o.bg, o.bgOpacity == null ? 1 : o.bgOpacity);
    var bdc = hexRgba(o.borderColor, o.borderOpacity == null ? 1 : o.borderOpacity);
    if (cs === "transparent") { /* no bg */ }
    else if (cs === "outline") { st += "background:transparent;border:" + Math.max(2, o.borderWidth || 2) + "px " + cssBorderStyle(o) + " " + bdc + ";border-radius:" + o.radius + "px;"; }
    else { st += "background:" + bgc + ";border-radius:" + (cs === "rounded" || cs === "bubble" || cs === "callout" ? Math.max(o.radius, 12) : o.radius) + "px;"; if (o.borderWidth) st += "border:" + o.borderWidth + "px " + cssBorderStyle(o) + " " + bdc + ";"; }
    if (o.dropShadow) st += "box-shadow:0 " + Math.round(o.h * 0.14 + 3) + "px " + Math.round(o.h * 0.34 + 8) + "px rgba(0,0,0," + shA(o, 0.45) + ");";
    return st;
  }

  function renderObjectEl(o) {
    var el = document.createElement("div");
    el.className = "obj" + (isSelected(o.id) ? " selected" : "");
    el.setAttribute("data-id", o.id);
    el.style.left = o.x + "px"; el.style.top = o.y + "px";
    el.style.width = o.w + "px"; el.style.height = o.h + "px";
    el.style.transform = "rotate(" + o.rot + "deg)";
    el.style.zIndex = o.z;
    el.style.opacity = (o.type === "titlebar") ? 1 : o.opacity;

    var inner = "";
    if (o.type === "label" || o.type === "caption") {
      inner = '<div class="obj-content" style="' + captionBoxStyle(o) + '">' + objContentHTML(o) + "</div>";
      // tail for bubble / callout
      if (o.captionStyle === "bubble" || o.captionStyle === "callout") {
        var tcol = o.bg;
        inner += '<div style="position:absolute;left:24px;bottom:-9px;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:10px solid ' + tcol + ';"></div>';
      }
      if (o.captionStyle === "leader") {
        inner += leaderSVG(o);
      }
    } else if (o.type === "titlebar") {
      inner = '<div class="obj-content" style="' + tbContentStyle(o) + '">' + tbInnerHTML(o) + "</div>";
    } else if (o.type === "textbox") {
      inner = '<div class="obj-content" style="' + tbxContentStyle(o) + '">' + tbxInnerHTML(o) + "</div>";
    } else if (o.type === "legend") {
      inner = '<div class="obj-content" style="' + legendContentStyle(o) + '">' + legendInnerHTML(o) + "</div>";
    } else if (Kit.has(o.type)) {
      inner = Kit.contentHTML(o);
    } else if (o.type === "photo") {
      inner = '<div class="obj-content" style="' + photoContentStyle(o) + '"><img src="' + o.src + '" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
    } else {
      var shStyle = (o.type === "shape" || o.type === "polygon" || o.type === "arrow") ? shapeShadowCss(o) : "";
      if (o.type === "arrow" && (o.flipX || o.flipY)) shStyle += "transform:scale(" + (o.flipX ? -1 : 1) + "," + (o.flipY ? -1 : 1) + ");";
      inner = '<div class="obj-content"' + (shStyle ? ' style="' + shStyle + '"' : "") + ">" + objContentHTML(o) + "</div>";
    }
    el.innerHTML = inner;

    if (isSelected(o.id)) {
      el.innerHTML += (S.selectedIds.length === 1 && !o.locked) ? selectionHTML() : '<div class="sel-box"></div>';
    } else {
      el.innerHTML += '<div class="obj-hover"></div>';
    }
    return el;
  }
  function selectionHTML() {
    var h = '<div class="sel-box"></div>';
    ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach(function (d) { h += '<div class="handle ' + d + '" data-handle="' + d + '"></div>'; });
    h += '<div class="handle-rot" data-handle="rot"></div>';
    return h;
  }

  function renderObjects() {
    objLayer.innerHTML = "";
    S.objects.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); }).forEach(function (o) {
      objLayer.appendChild(renderObjectEl(o));
    });
  }

  // Drop-shadow geometry shared by DOM render and canvas export (shapes).
  // Shadow strength: the original alpha scaled by the component's Shadow opacity (default 100%).
  function shA(o, base) { var m = o.shadowOpacity == null ? 1 : Math.max(0, Math.min(1, +o.shadowOpacity)); return Math.round(base * m * 1000) / 1000; }
  function shadowParams(o) {
    var m = Math.min(o.w, o.h);
    return { blur: Math.max(3, Math.round(m * 0.06 + 4)), dy: Math.max(2, Math.round(m * 0.045 + 2)) };
  }
  function shapeShadowCss(o) {
    if (!o.dropShadow) return "";
    var sp = shadowParams(o);
    return "filter:drop-shadow(0 " + sp.dy + "px " + sp.blur + "px rgba(0,0,0," + shA(o, 0.5) + "));";
  }
  /* ---- stroke style (solid / dashed / dotted) shared by render + export ---- */
  // SVG dash pattern scaled to stroke width. Dotted uses a ~zero dash with round
  // caps to render round dots; dashed uses proportional dash + gap.
  function strokeDashArray(style, sw) {
    sw = Math.max(1, sw || 1);
    if (style === "dashed") return (sw * 2.8).toFixed(2) + " " + (sw * 1.9).toFixed(2);
    if (style === "dotted") return "0.01 " + (sw * 2).toFixed(2);
    return "";
  }
  // Dash attributes for a stroke that has NO existing linecap (rect-family shapes).
  function svgDashAttrs(o, sw) {
    var d = strokeDashArray(o.strokeStyle, sw);
    if (!d) return "";
    return ' stroke-dasharray="' + d + '"' + (o.strokeStyle === "dotted" ? ' stroke-linecap="round"' : "");
  }
  // Dash attribute for a stroke that ALREADY sets stroke-linecap (lines/polygons/arrows).
  function svgDashOnly(o, sw) {
    var d = strokeDashArray(o.strokeStyle, sw);
    return d ? ' stroke-dasharray="' + d + '"' : "";
  }
  function cssBorderStyle(o) { return o.strokeStyle === "dashed" ? "dashed" : (o.strokeStyle === "dotted" ? "dotted" : "solid"); }
  // Apply the object's stroke style to a 2D canvas context (export).
  function applyCanvasDash(ctx, o, sw) {
    sw = Math.max(1, sw || 1);
    if (o.strokeStyle === "dashed") { ctx.setLineDash([sw * 2.8, sw * 1.9]); ctx.lineCap = "butt"; }
    else if (o.strokeStyle === "dotted") { ctx.setLineDash([0.01, sw * 2]); ctx.lineCap = "round"; }
    else { ctx.setLineDash([]); ctx.lineCap = "butt"; }
  }
  // Style for an inset photo's box: border, radius, clip, optional drop shadow.
  function photoContentStyle(o) {
    return "width:100%;height:100%;box-sizing:border-box;overflow:hidden;border-radius:" + o.radius + "px;" +
      (o.borderWidth ? "border:" + o.borderWidth + "px " + cssBorderStyle(o) + " " + o.borderColor + ";" : "") +
      shapeShadowCss(o);
  }
  /* shapes & arrows as SVG (also reused by export) */
  // hex (#rgb/#rrggbb) + 0..1 opacity -> rgba() string.
  function hexRgba(hex, op) {
    if (!hex || hex === "transparent") return "transparent";
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return "rgba(" + r + "," + g + "," + b + "," + (op == null ? 1 : op) + ")";
  }
  // Title-bar geometry derived from height, shared by DOM render + export.
  // Logo height (clamped to the bar) and width (from the logo's own aspect ratio).
  function tbLogoH(o) { return o.logoSize ? clamp(o.logoSize, 8, Math.max(8, o.h - 4)) : Math.round(o.h * 0.58); }
  function tbLogoW(o) {
    var hh = tbLogoH(o);
    if (o.logo && !o.logoAspect && !tbAspPending[o.logo]) {   // older bars: measure the logo once
      tbAspPending[o.logo] = true; var im = new Image();
      im.onload = function () { o.logoAspect = (im.naturalWidth || 1) / (im.naturalHeight || 1); renderObjects(); wireObjectEvents(); };
      im.src = o.logo;
    }
    return (o.logo && o.logoAspect) ? Math.max(8, Math.round(hh * o.logoAspect)) : hh;
  }
  var tbAspPending = {};
  // Make room for the logo: grow the bar's height for a taller logo and its width so the
  // title/subtitle keep their space. Text sizes are frozen first so they don't change.
  function tbFitLogo(ob) {
    if (!ob || ob.type !== "titlebar" || !ob.showLogo) return;
    var tm = tbMetrics(ob); if (!ob.titleSize) ob.titleSize = tm.titleSize; if (!ob.subSize) ob.subSize = tm.subSize;
    if (ob.logoSize && ob.logoSize + 8 > ob.h) { var gh = ob.logoSize + 8 - ob.h; ob.y -= Math.round(gh / 2); ob.h += gh; }
    var m = tbMetrics(ob);
    var textNeed = Math.max(measureTextW(ob.title, 700, m.titleSize, ob.titleFont || ob.font), ob.subtitle ? measureTextW(ob.subtitle, 500, m.subSize, ob.subtitleFont || ob.font) : 0);
    var need = Math.ceil(m.pad * 2 + m.logoW + m.gap + textNeed + 4);
    if (ob.w < need) { var gw = need - ob.w; ob.x -= Math.round(gw / 2); ob.w = need; }
  }
  function tbMetrics(o) {
    var h = o.h;
    return {
      pad: Math.max(10, Math.round(h * 0.18)),
      gap: Math.max(8, Math.round(h * 0.14)),
      logoSize: tbLogoH(o), logoW: tbLogoW(o),
      titleSize: o.titleSize ? clamp(o.titleSize, 8, 200) : clamp(Math.round(h * 0.34), 11, 80),
      subSize: o.subSize ? clamp(o.subSize, 8, 200) : clamp(Math.round(h * 0.2), 9, 48)
    };
  }
  function tbContentStyle(o) {
    var m = tbMetrics(o);
    var bd = o.borderWidth ? (o.borderWidth + "px " + cssBorderStyle(o) + " " + hexRgba(o.borderColor, o.borderOpacity)) : "none";
    return "display:flex;align-items:center;justify-content:flex-start;gap:" + m.gap + "px;padding:0 " + m.pad + "px;" +
      "background:" + hexRgba(o.bg, o.bgOpacity) + ";border:" + bd + ";border-radius:" + o.radius + "px;box-sizing:border-box;";
  }
  /* ---- textbox (Title / Subtitle / Body, each independently styled) ---- */
  var TBX_FIELDS = [
    { key: "title", show: "titleShow", color: "titleColor", size: "titleSize", weight: "titleWeight", italic: "titleItalic", font: "titleFont" },
    { key: "subtitle", show: "subtitleShow", color: "subtitleColor", size: "subtitleSize", weight: "subtitleWeight", italic: "subtitleItalic", font: "subtitleFont" },
    { key: "body", show: "bodyShow", color: "bodyColor", size: "bodySize", weight: "bodyWeight", italic: "bodyItalic", font: "bodyFont" }
  ];
  /* ---- rich text helpers (textbox body) ------------------------------
     Body is stored as a small HTML subset: <p>, <br>, <ul>/<ol>/<li>,
     <strong>, <em>, <u>. rtSanitize() enforces the whitelist; rtBlocks()
     parses to blocks+runs for canvas export; the stage renders the HTML. */
  var RT_ALLOWED = { P: 1, BR: 1, UL: 1, OL: 1, LI: 1, STRONG: 1, EM: 1, U: 1, B: 1, I: 1, DIV: 1 };
  function rtIsHtml(s) { return /<(p|div|ul|ol|li|br|strong|em|b|i|u)\b/i.test(s || ""); }
  function rtFromPlain(text) {
    var lines = String(text || "").split(/\r?\n/);
    if (!lines.length) return "<p><br></p>";
    return lines.map(function (l) { return "<p>" + (l ? UI.escapeHtml(l) : "<br>") + "</p>"; }).join("");
  }
  function rtSanitize(html) {
    var src = document.createElement("div"); src.innerHTML = html || "";
    function clean(node) {
      var out = "";
      for (var n = node.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) { out += UI.escapeHtml(n.nodeValue); continue; }
        if (n.nodeType !== 1) continue;
        var tag = n.tagName;
        if (tag === "BR") { out += "<br>"; continue; }
        if (RT_ALLOWED[tag]) {
          var t = (tag === "DIV" ? "P" : tag === "B" ? "STRONG" : tag === "I" ? "EM" : tag).toLowerCase();
          out += "<" + t + ">" + clean(n) + "</" + t + ">";
        } else { out += clean(n); }
      }
      return out;
    }
    return clean(src);
  }
  function rtHasText(html) {
    var d = document.createElement("div"); d.innerHTML = html || "";
    return d.textContent.trim().length > 0 || /<(li|br)\b/i.test(html || "");
  }
  function rtBodyHtml(raw) { return rtIsHtml(raw) ? rtSanitize(raw) : rtFromPlain(raw); }
  function rtPlainText(html) { var d = document.createElement("div"); d.innerHTML = html || ""; return d.textContent.replace(/\s+/g, " ").trim(); }
  // Parse body HTML into blocks: {kind:'para'|'bullet'|'number', num, runs:[{text,b,i,u}|{br:true}]}
  function rtBlocks(html) {
    var src = document.createElement("div"); src.innerHTML = rtBodyHtml(html);
    var blocks = [];
    function styleOf(tag, st) { return { b: st.b || tag === "STRONG" || tag === "B", i: st.i || tag === "EM" || tag === "I", u: st.u || tag === "U" }; }
    function emit(node, st, runs) {
      for (var c = node.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) { if (c.nodeValue) runs.push({ text: c.nodeValue, b: st.b, i: st.i, u: st.u }); continue; }
        if (c.nodeType !== 1) continue;
        if (c.tagName === "BR") { runs.push({ br: true }); continue; }
        emit(c, styleOf(c.tagName, st), runs);
      }
    }
    function runsOf(node) { var r = []; emit(node, { b: false, i: false, u: false }, r); return r; }
    function runsOfInline(node) {
      if (node.tagName === "BR") return [{ br: true }];
      var r = []; emit(node, styleOf(node.tagName, { b: false, i: false, u: false }), r); return r;
    }
    function pushList(listEl, kind) {
      var num = 1;
      for (var li = listEl.firstChild; li; li = li.nextSibling) {
        if (li.nodeType === 1 && li.tagName === "LI") blocks.push({ kind: kind, num: num++, runs: runsOf(li) });
      }
    }
    var pending = null;
    for (var n = src.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) { if (n.nodeValue.trim()) { (pending = pending || { kind: "para", runs: [] }).runs.push({ text: n.nodeValue }); } continue; }
      if (n.nodeType !== 1) continue;
      var tag = n.tagName;
      if (tag === "UL") { if (pending) { blocks.push(pending); pending = null; } pushList(n, "bullet"); }
      else if (tag === "OL") { if (pending) { blocks.push(pending); pending = null; } pushList(n, "number"); }
      else if (tag === "P" || tag === "DIV") { if (pending) { blocks.push(pending); pending = null; } blocks.push({ kind: "para", runs: runsOf(n) }); }
      else { (pending = pending || { kind: "para", runs: [] }).runs = pending.runs.concat(runsOfInline(n)); }
    }
    if (pending) blocks.push(pending);
    if (!blocks.length) blocks.push({ kind: "para", runs: [] });
    return blocks;
  }

  function tbxContentStyle(o) {
    var ai = o.align === "left" ? "flex-start" : (o.align === "right" ? "flex-end" : "center");
    var bd = o.borderWidth ? (o.borderWidth + "px " + cssBorderStyle(o) + " " + hexRgba(o.borderColor, o.borderOpacity)) : "none";
    var pad = Math.round((o.bodySize || 14) * 0.9);
    return "width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:" + ai +
      ";gap:" + Math.round((o.bodySize || 14) * 0.35) + "px;padding:" + pad + "px;overflow:hidden;" +
      "background:" + hexRgba(o.bg, o.bgOpacity == null ? 1 : o.bgOpacity) + ";border:" + bd + ";border-radius:" + o.radius + "px;" +
      (o.dropShadow ? "box-shadow:0 " + Math.round(o.h * 0.14 + 3) + "px " + Math.round(o.h * 0.34 + 8) + "px rgba(0,0,0," + shA(o, 0.45) + ");" : "");
  }
  function tbxInnerHTML(o) {
    return TBX_FIELDS.map(function (f) {
      if (!o[f.show]) return "";
      var raw = String(o[f.key] || "");
      var isBody = f.key === "body";
      if (isBody ? !rtHasText(raw) : !raw.trim()) return "";
      var st = "margin:0;color:" + o[f.color] + ";font-family:'" + o[f.font] + "';font-size:" + o[f.size] + "px;font-weight:" + o[f.weight] +
        ";" + (o[f.italic] ? "font-style:italic;" : "") + "line-height:1.3;text-align:" + o.align + ";width:100%;word-break:break-word;";
      if (isBody) return '<div class="tbx-body" style="' + st + '">' + rtBodyHtml(raw) + "</div>";
      st += "white-space:pre-wrap;";
      return '<div class="tbx-' + f.key + '" style="' + st + '">' + UI.escapeHtml(raw) + "</div>";
    }).join("");
  }
  /* ---- legend (a key of {color,label,value} items, inline or stacked) ---- */
  var LEGEND_PALETTE = ["#22C55E", "#EF4444", "#F59E0B", "#3B82F6", "#A855F7", "#EC4899", "#14B8A6", "#F97316"];
  var _measureCanvas = null;
  function measureTextW(txt, weight, size, font) {
    if (!_measureCanvas) _measureCanvas = document.createElement("canvas");
    var ctx = _measureCanvas.getContext("2d");
    ctx.font = (weight || 400) + " " + (size || 14) + "px '" + (font || "Inter") + "', sans-serif";
    return ctx.measureText(txt || "").width;
  }
  function legendItemText(o, it) {
    var t = it.label || "";
    if (o.showValue && String(it.value || "").trim()) t += " (" + it.value + ")";
    return t;
  }
  // Compute one item's pixel width (dot + gap + text).
  function legendItemW(o, it) {
    var dotGap = Math.round(o.dotSize * 0.55);
    return o.dotSize + dotGap + measureTextW(legendItemText(o, it), o.labelWeight, o.labelSize, o.font);
  }
  // Auto-size the box to hug its content for the current layout.
  function fitLegend(o) {
    var items = o.items || [];
    var lineH = Math.max(Math.round(o.labelSize * 1.35), o.dotSize);
    if (o.layout === "stacked") {
      var maxW = 0;
      items.forEach(function (it) { maxW = Math.max(maxW, legendItemW(o, it)); });
      var vGap = Math.round(o.itemGap * 0.5);
      o.w = Math.round(maxW + o.padX * 2);
      o.h = Math.round(items.length * lineH + Math.max(0, items.length - 1) * vGap + o.padY * 2);
    } else {
      var total = 0;
      items.forEach(function (it) { total += legendItemW(o, it); });
      total += Math.max(0, items.length - 1) * o.itemGap;
      o.w = Math.round(total + o.padX * 2);
      o.h = Math.round(lineH + o.padY * 2);
    }
    var iw = image ? image.w : 2000;
    o.w = Math.min(o.w, iw);
  }
  function legendContentStyle(o) {
    var bd = o.borderWidth ? (o.borderWidth + "px " + cssBorderStyle(o) + " " + hexRgba(o.borderColor, o.borderOpacity)) : "none";
    var dir = o.layout === "stacked" ? "column" : "row";
    var wrap = o.layout === "stacked" ? "nowrap" : "wrap";
    var gap = o.layout === "stacked" ? Math.round(o.itemGap * 0.5) : o.itemGap;
    var align = o.layout === "stacked" ? "flex-start" : "center";
    return "width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:" + dir + ";flex-wrap:" + wrap +
      ";align-items:" + align + ";justify-content:center;gap:" + gap + "px;padding:" + o.padY + "px " + o.padX + "px;overflow:hidden;" +
      "background:" + hexRgba(o.bg, o.bgOpacity == null ? 1 : o.bgOpacity) + ";border:" + bd + ";border-radius:" + o.radius + "px;";
  }
  function legendInnerHTML(o) {
    var dotGap = Math.round(o.dotSize * 0.55);
    var radius = o.dotShape === "square" ? Math.round(o.dotSize * 0.22) : "50%";
    return (o.items || []).map(function (it) {
      var dot = '<span style="flex:0 0 auto;width:' + o.dotSize + 'px;height:' + o.dotSize + 'px;border-radius:' + radius + (o.dotShape === "square" ? "px" : "") + ';background:' + it.color + '"></span>';
      var txt = '<span style="color:' + o.labelColor + ";font-family:'" + o.font + "';font-size:" + o.labelSize + "px;font-weight:" + o.labelWeight + ';white-space:nowrap;line-height:1.2">' + UI.escapeHtml(legendItemText(o, it)) + "</span>";
      return '<span style="display:inline-flex;align-items:center;gap:' + dotGap + 'px">' + dot + txt + "</span>";
    }).join("");
  }
  function tbInnerHTML(o) {
    var m = tbMetrics(o);
    var logo = !o.showLogo ? "" : (o.logo
      ? '<img src="' + o.logo + '" draggable="false" style="width:' + m.logoW + 'px;height:' + m.logoSize + 'px;object-fit:contain;flex:0 0 auto;border-radius:' + Math.round(m.logoSize * 0.16) + 'px">'
      : '<div style="width:' + m.logoSize + 'px;height:' + m.logoSize + 'px;flex:0 0 auto;border-radius:' + Math.round(m.logoSize * 0.22) + 'px;background:linear-gradient(140deg,#00AEEF,#0066a8);display:flex;align-items:center;justify-content:center;color:#fff">' + Icons.svg("tag", { size: Math.round(m.logoSize * 0.58), stroke: "#fff" }) + "</div>");
    return '<div class="tb-text" style="min-width:0;flex:1 1 auto">' +
        '<div class="tb-title" style="color:' + o.color + ";font-family:'" + (o.titleFont || o.font) + "';font-weight:700;font-size:" + m.titleSize + 'px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + UI.escapeHtml(o.title) + "</div>" +
        (o.subtitle ? '<div class="tb-sub" style="color:' + o.color + ";font-family:'" + (o.subtitleFont || o.font) + "';font-weight:500;font-size:" + m.subSize + 'px;line-height:1.2;margin-top:2px;opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + UI.escapeHtml(o.subtitle) + "</div>" : "") +
      "</div>" + logo;
  }
  function shapeSVG(o) {
    var w = o.w, h = o.h, sw = o.borderWidth || 0, c = o.color, p = sw / 2;
    var hasFill = o.bg && o.bg !== "transparent";
    var fill = hasFill ? o.bg : "none";
    var fo = o.fillOpacity == null ? 1 : o.fillOpacity;
    var so = o.strokeOpacity == null ? 1 : o.strokeOpacity;
    var fa = 'fill="' + fill + '" fill-opacity="' + fo + '"';
    var s = '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="overflow:visible">';
    var stroke = sw ? 'stroke="' + c + '" stroke-width="' + sw + '" stroke-opacity="' + so + '"' + svgDashAttrs(o, sw) : 'stroke="none"';
    var lineDash = svgDashOnly(o, Math.max(2, sw));
    switch (o.shapeKind) {
      case "rect": s += '<rect x="' + p + '" y="' + p + '" width="' + (w - sw) + '" height="' + (h - sw) + '" ' + fa + ' ' + stroke + '/>'; break;
      case "rrect": s += '<rect x="' + p + '" y="' + p + '" width="' + (w - sw) + '" height="' + (h - sw) + '" rx="' + Math.min(w, h) * 0.18 + '" ' + fa + ' ' + stroke + '/>'; break;
      case "ellipse": s += '<ellipse cx="' + w / 2 + '" cy="' + h / 2 + '" rx="' + (w - sw) / 2 + '" ry="' + (h - sw) / 2 + '" ' + fa + ' ' + stroke + '/>'; break;
      case "triangle": s += '<polygon points="' + (w / 2) + ',' + p + ' ' + (w - p) + ',' + (h - p) + ' ' + p + ',' + (h - p) + '" ' + fa + ' ' + stroke + ' stroke-linejoin="round"/>'; break;
      case "diamond": s += '<polygon points="' + (w / 2) + ',' + p + ' ' + (w - p) + ',' + (h / 2) + ' ' + (w / 2) + ',' + (h - p) + ' ' + p + ',' + (h / 2) + '" ' + fa + ' ' + stroke + ' stroke-linejoin="round"/>'; break;
      case "line": s += '<line x1="' + p + '" y1="' + h / 2 + '" x2="' + (w - p) + '" y2="' + h / 2 + '" stroke="' + c + '" stroke-width="' + Math.max(2, sw) + '" stroke-opacity="' + so + '" stroke-linecap="round"' + lineDash + '/>'; break;
      case "highlight": s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="4" fill="' + (o.bg || c) + '" fill-opacity="' + fo + '"/>'; break;
    }
    return s + "</svg>";
  }
  // Freehand polygon. points are normalized 0..1 within the box; viewBox matches
  // the box (1:1) so stroke-width stays an image-space pixel value like shapes.
  function polygonSVG(o) {
    var w = o.w, h = o.h, sw = o.borderWidth || 0, c = o.color;
    var hasFill = o.bg && o.bg !== "transparent";
    var fill = hasFill ? o.bg : "none";
    var fo = o.fillOpacity == null ? 1 : o.fillOpacity;
    var so = o.strokeOpacity == null ? 1 : o.strokeOpacity;
    var pts = (o.points || []).map(function (pt) { return (pt.x * w).toFixed(2) + "," + (pt.y * h).toFixed(2); }).join(" ");
    var stroke = sw ? 'stroke="' + c + '" stroke-width="' + sw + '" stroke-opacity="' + so + '" stroke-linejoin="round" stroke-linecap="round"' + svgDashOnly(o, sw) : 'stroke="none"';
    return '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="overflow:visible">' +
      '<polygon points="' + pts + '" fill="' + fill + '" fill-opacity="' + fo + '" ' + stroke + '/></svg>';
  }
  // Freehand open line (polyline, no fill).
  function polylineSVG(o) {
    var w = o.w, h = o.h, sw = o.borderWidth || 2, c = o.color;
    var so = o.strokeOpacity == null ? 1 : o.strokeOpacity;
    var pts = (o.points || []).map(function (pt) { return (pt.x * w).toFixed(2) + "," + (pt.y * h).toFixed(2); }).join(" ");
    return '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="overflow:visible">' +
      '<polyline points="' + pts + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-opacity="' + so + '" stroke-linejoin="round" stroke-linecap="round"' + svgDashOnly(o, sw) + "/></svg>";
  }
  // markup for a head whose tip is at (tx,ty) pointing along angle `ang` (rad).
  function arrowHead(type, tx, ty, ang, c, sw, head) {
    if (type === "none") return "";
    var fx = Math.cos(ang), fy = Math.sin(ang);   // forward (toward tip)
    var px = -fy, py = fx;                         // perpendicular
    var hw = head * 0.6;                           // half width
    var bx = tx - fx * head, by = ty - fy * head;  // base centre
    if (type === "open") {
      var d = 0.46;
      var p1x = tx + Math.cos(ang + Math.PI - d) * head, p1y = ty + Math.sin(ang + Math.PI - d) * head;
      var p2x = tx + Math.cos(ang + Math.PI + d) * head, p2y = ty + Math.sin(ang + Math.PI + d) * head;
      return '<path d="M' + p1x + ',' + p1y + ' L' + tx + ',' + ty + ' L' + p2x + ',' + p2y + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    if (type === "circle") {
      return '<circle cx="' + tx + '" cy="' + ty + '" r="' + (hw * 0.9) + '" fill="' + c + '"/>';
    }
    if (type === "ring") {
      return '<circle cx="' + tx + '" cy="' + ty + '" r="' + (hw * 0.9) + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '"/>';
    }
    if (type === "diamond") {
      var mx = tx - fx * head / 2, my = ty - fy * head / 2;
      return '<polygon points="' + tx + ',' + ty + ' ' + (mx + px * hw) + ',' + (my + py * hw) + ' ' + bx + ',' + by + ' ' + (mx - px * hw) + ',' + (my - py * hw) + '" fill="' + c + '"/>';
    }
    if (type === "stealth") {   // swept-back barbed head
      var nx = tx - fx * head * 0.6, ny = ty - fy * head * 0.6;
      return '<polygon points="' + tx + ',' + ty + ' ' + (bx + px * hw) + ',' + (by + py * hw) + ' ' + nx + ',' + ny + ' ' + (bx - px * hw) + ',' + (by - py * hw) + '" fill="' + c + '" stroke-linejoin="round"/>';
    }
    if (type === "bar") {       // flat T-end across the line
      return '<line x1="' + (tx + px * hw) + '" y1="' + (ty + py * hw) + '" x2="' + (tx - px * hw) + '" y2="' + (ty - py * hw) + '" stroke="' + c + '" stroke-width="' + (sw * 1.25) + '" stroke-linecap="round"/>';
    }
    // triangle (default)
    return '<polygon points="' + tx + ',' + ty + ' ' + (bx + px * hw) + ',' + (by + py * hw) + ' ' + (bx - px * hw) + ',' + (by - py * hw) + '" fill="' + c + '" stroke-linejoin="round"/>';
  }
  // How far the connecting line should stop short of the tip for each head.
  function headRetract(type, head) {
    if (type === "triangle") return head * 0.8;
    if (type === "diamond") return head * 0.95;
    if (type === "stealth") return head * 0.55;
    if (type === "circle" || type === "ring") return head * 0.5;
    return 0; // open / none
  }
  function arrowSVG(o) {
    var w = o.w, h = o.h, c = o.color, sw = Math.max(2, o.borderWidth || 2);
    var cy = h / 2, head = Math.min(h * 0.95, (18 + sw * 2) * ((o.headScale || 100) / 100));
    var ht = o.arrowHead || "triangle";
    var ret = headRetract(ht, head);
    var aDash = svgDashOnly(o, sw);
    // How far the head's tip must sit inside the box so the head isn't clipped.
    var tipInset = (ht === "circle" || ht === "ring") ? head * 0.6 * 0.9 : 0;
    var s = '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="overflow:visible">';
    var L = sw, R = w - sw;
    // Given the box-edge end point + angle, return the inset head tip and the line stop point.
    function ends(ex, ey, ang) {
      var fx = Math.cos(ang), fy = Math.sin(ang);
      var tx = ex - fx * tipInset, ty = ey - fy * tipInset;
      return { tx: tx, ty: ty, lx: tx - fx * ret, ly: ty - fy * ret };
    }
    function line(x1, y1, x2, y2) {
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round"' + aDash + '/>';
    }
    var both = !!o.bothEnds || o.shapeKind === "darrow";   // Double Arrow = Arrow with both ends
    if (o.shapeKind === "arrow" || o.shapeKind === "darrow") {
      var er = ends(R, cy, 0), el = both ? ends(L, cy, Math.PI) : null;
      s += line(el ? el.lx : L, el ? el.ly : cy, er.lx, er.ly);
      s += arrowHead(ht, er.tx, er.ty, 0, c, sw, head);
      if (el) s += arrowHead(ht, el.tx, el.ty, Math.PI, c, sw, head);
    } else if (o.shapeKind === "leader") {
      var ang = Math.atan2(sw - (h - sw), R - L);
      var le = ends(R, sw, ang), ls = both ? ends(L, h - sw, ang + Math.PI) : null;
      s += line(ls ? ls.lx : L, ls ? ls.ly : h - sw, le.lx, le.ly);
      if (ls) s += arrowHead(ht, ls.tx, ls.ty, ang + Math.PI, c, sw, head);
      else s += '<circle cx="' + L + '" cy="' + (h - sw) + '" r="' + (sw + 2) + '" fill="' + c + '"/>';
      s += arrowHead(ht, le.tx, le.ty, ang, c, sw, head);
    } else if (o.shapeKind === "elbow") {
      var ee = ends(R, cy, 0), es = both ? ends(L, h - sw, Math.PI / 2) : null;
      if (es) s += arrowHead(ht, es.tx, es.ty, Math.PI / 2, c, sw, head);
      s += '<polyline points="' + (es ? es.lx : L) + ',' + (es ? es.ly : h - sw) + ' ' + L + ',' + cy + ' ' + ee.lx + ',' + cy + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + aDash + '/>';
      s += arrowHead(ht, ee.tx, ee.ty, 0, c, sw, head);
    }
    return s + "</svg>";
  }

  /* ============================================================
     SELECTION / PROPERTIES / LAYERS
  ============================================================ */
  function getSel() { return S.objects.filter(function (o) { return o.id === S.selected; })[0] || null; }
  function selectedObjects() { return S.objects.filter(function (o) { return S.selectedIds.indexOf(o.id) > -1; }); }
  function isSelected(id) { return S.selectedIds.indexOf(id) > -1; }
  // All object ids that belong to the same group as `id` (or just [id] if ungrouped).
  function groupMembers(id) {
    var o = S.objects.filter(function (x) { return x.id === id; })[0];
    if (o && o.groupId) return S.objects.filter(function (x) { return x.groupId === o.groupId; }).map(function (x) { return x.id; });
    return [id];
  }
  function select(id) {
    S.selectedIds = id ? groupMembers(id) : [];
    S.selected = id;
    renderObjects(); wireObjectEvents(); renderProps(); renderLayers();
  }
  // Shift-click: add/remove an object (and its group) to/from the current selection.
  function toggleSelect(id) {
    var members = groupMembers(id);
    var allIn = members.every(function (m) { return isSelected(m); });
    if (allIn) {
      S.selectedIds = S.selectedIds.filter(function (x) { return members.indexOf(x) === -1; });
      if (members.indexOf(S.selected) > -1) S.selected = S.selectedIds[S.selectedIds.length - 1] || null;
    } else {
      members.forEach(function (m) { if (!isSelected(m)) S.selectedIds.push(m); });
      S.selected = id;
    }
    renderObjects(); wireObjectEvents(); renderProps(); renderLayers();
  }
  function deselect() { S.selected = null; S.selectedIds = []; renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); }

  /* ---- grouping ---- */
  function groupSelected() {
    var objs = selectedObjects();
    if (objs.length < 2) { UI.toast({ type: "info", title: "Select 2+ objects to group", duration: 1500 }); return; }
    var gid = "g_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    objs.forEach(function (o) { o.groupId = gid; });
    renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); pushHistory(); markDirty();
    UI.toast({ type: "success", title: "Grouped " + objs.length + " objects", duration: 1400 });
  }
  function ungroupSelected() {
    var objs = selectedObjects().filter(function (o) { return o.groupId; });
    if (!objs.length) { UI.toast({ type: "info", title: "No group selected", duration: 1400 }); return; }
    objs.forEach(function (o) { delete o.groupId; });
    renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); pushHistory(); markDirty();
    UI.toast({ type: "success", title: "Ungrouped", duration: 1400 });
  }
  function selectionHasGroup() { return selectedObjects().some(function (o) { return o.groupId; }); }

  var WEIGHT_LABELS = { 400: "Regular", 500: "Medium", 600: "Semibold", 700: "Bold", 800: "Heavy" };
  // Per-field style group for the textbox (Title / Subtitle / Body).
  function tbxFieldGroup(o, key, label) {
    var show = key + "Show", color = key + "Color", size = key + "Size", weight = key + "Weight", italic = key + "Italic", font = key + "Font";
    var h = '<div class="prop-group"><h4>' + label + "</h4>" +
      '<div class="prop-row"><label>Show</label><div class="ctrl seg2">' +
        '<button data-toggle="' + show + '" class="' + (o[show] ? "on" : "") + '">' + (o[show] ? "On" : "Off") + "</button></div></div>";
    if (o[show]) {
      if (key === "body") {
        h += '<div class="prop-row"><label>Text</label><div class="ctrl"><button class="view-btn" data-rtedit="1" style="width:100%">' + Icons.svg("edit", { size: 13 }) + "Edit rich text…</button></div></div>" +
          '<p class="layers-hint" style="margin:2px 0 8px">Double-click the text box on the canvas to edit. A toolbar gives you bold, italic, underline, bullets and numbered lists.</p>';
      } else {
        h += '<div class="prop-row"><label>Text</label><div class="ctrl"><input class="input" data-prop="' + key + '" value="' + UI.escapeHtml(o[key] || "") + '"></div></div>';
      }
      h += '<div class="prop-row"><label>Font</label><div class="ctrl"><select class="select" data-prop="' + font + '">' +
          FONTS.map(function (f) { return '<option value="' + f + '"' + (o[font] === f ? " selected" : "") + ">" + f + "</option>"; }).join("") + "</select></div></div>" +
        numRow("Size", size, o[size], 8, 200) +
        '<div class="prop-row"><label>Weight</label><div class="ctrl"><select class="select" data-prop="' + weight + '">' +
          [400, 500, 600, 700, 800].map(function (w) { return '<option value="' + w + '"' + (+o[weight] === w ? " selected" : "") + ">" + WEIGHT_LABELS[w] + "</option>"; }).join("") + "</select></div></div>" +
        '<div class="prop-row"><label>Italic</label><div class="ctrl seg2">' + segBtn(italic, "italic", o[italic]) + "</div></div>" +
        colorRow(color, o[color]);
    }
    return h + "</div>";
  }

  var FONTS = ["Inter", "Exo", "JetBrains Mono", "Georgia", "Arial", "Courier New"];
  var SWATCHES = ["#ffffff", "#0B1220", "#00AEEF", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#111827", "#032036", "#58AEDE", "#1C83C6"];

  function renderProps() {
    var o = getSel();
    var panel = $("propsPanel");
    // multi-selection panel
    if (S.selectedIds.length > 1) {
      var n = S.selectedIds.length;
      var grouped = selectionHasGroup();
      panel.innerHTML = '<div class="prop-group"><h4>' + n + ' objects selected</h4>' +
        '<div class="prop-row" style="gap:6px">' +
          '<button class="view-btn" data-act="group" style="flex:1">' + Icons.svg("layers", { size: 14 }) + "Group</button>" +
          (grouped ? '<button class="view-btn" data-act="ungroup" style="flex:1">' + Icons.svg("grid", { size: 14 }) + "Ungroup</button>" : "") +
        "</div>" +
        '<div class="prop-row" style="gap:6px;margin-top:6px">' +
          '<button class="view-btn" data-act="mdup" style="flex:1">' + Icons.svg("copy", { size: 14 }) + "Duplicate</button>" +
          '<button class="view-btn" data-act="mdelete" style="flex:1;color:var(--danger)">' + Icons.svg("trash", { size: 14 }) + "Delete</button>" +
        "</div>" +
        '<p class="layers-hint" style="margin-top:10px">Shift-click objects to add/remove. ⌘/Ctrl+G to group, ⌘/Ctrl+Shift+G to ungroup.</p></div>';
      UI.hydrateIcons(panel);
      panel.querySelector('[data-act="group"]').addEventListener("click", groupSelected);
      var ug = panel.querySelector('[data-act="ungroup"]'); if (ug) ug.addEventListener("click", ungroupSelected);
      panel.querySelector('[data-act="mdup"]').addEventListener("click", duplicateSelected);
      panel.querySelector('[data-act="mdelete"]').addEventListener("click", deleteSelected);
      return;
    }
    if (!o) {
      panel.innerHTML = (image ? canvasPanelHTML() + '<p class="layers-hint" style="margin:4px 16px 16px;font-size:11.5px;line-height:1.45;color:var(--text-3,#7f8ea3)">Select a component to edit its properties.</p>'
        : '<div class="props-empty"><div class="empty-icon">' + Icons.svg("cursor", { size: 26 }) + "</div><p>Select an object to edit its properties, or add one from the library.</p></div>");
      wireCanvasPanel(panel);
      return;
    }
    var html = "";
    var isText = (o.type === "label" || o.type === "caption");

    // Transform (title bars use Background opacity only — no whole-object fade)
    html += '<div class="prop-group"><h4>Transform</h4>' +
      numRow("Width", "w", Math.round(o.w), 8, 1200) +
      numRow("Height", "h", Math.round(o.h), 8, 1200) +
      numRow("Rotate", "rot", Math.round(o.rot), -180, 180) +
      (o.type === "titlebar" ? "" : sliderRow("Opacity", "opacity", Math.round(o.opacity * 100), 0, 100, "%")) +
      "</div>";

    if (o.type === "titlebar") {
      var bo = o.bgOpacity == null ? 1 : o.bgOpacity;
      var rdo = o.borderOpacity == null ? 1 : o.borderOpacity;
      // Content
      html += '<div class="prop-group"><h4>Content</h4>' +
        '<div class="prop-row"><label>Title</label><div class="ctrl"><input class="input" data-prop="title" value="' + UI.escapeHtml(o.title) + '"></div></div>' +
        '<div class="prop-row"><label>Subtitle</label><div class="ctrl"><input class="input" data-prop="subtitle" value="' + UI.escapeHtml(o.subtitle) + '"></div></div>' +
        numRow("Title size", "titleSize", o.titleSize || tbMetrics(o).titleSize, 8, 200) +
        numRow("Subtitle size", "subSize", o.subSize || tbMetrics(o).subSize, 8, 200) +
        '<div class="prop-row"><label>Title font</label><div class="ctrl"><select class="select" data-prop="titleFont">' +
          FONTS.map(function (f) { return '<option value="' + f + '"' + ((o.titleFont || o.font) === f ? " selected" : "") + ">" + f + "</option>"; }).join("") + "</select></div></div>" +
        '<div class="prop-row"><label>Subtitle font</label><div class="ctrl"><select class="select" data-prop="subtitleFont">' +
          FONTS.map(function (f) { return '<option value="' + f + '"' + ((o.subtitleFont || o.font) === f ? " selected" : "") + ">" + f + "</option>"; }).join("") + "</select></div></div></div>";
      // Logo
      html += '<div class="prop-group"><h4>Logo</h4>' +
        '<div class="prop-row"><label>Show logo</label><div class="ctrl seg2">' +
          '<button data-toggle="showLogo" class="' + (o.showLogo ? "on" : "") + '">' + Icons.svg("image", { size: 15 }) + (o.showLogo ? " On" : " Off") + "</button></div></div>" +
        (o.showLogo ? '<div class="prop-row" style="gap:6px">' +
          '<button class="view-btn" data-act="logo-upload" style="flex:1">' + Icons.svg("upload", { size: 14 }) + "Upload</button>" +
          (o.logo ? '<button class="view-btn" data-act="logo-clear" style="flex:1">' + Icons.svg("reset", { size: 14 }) + "Default</button>" : "") +
          "</div>" +
          numRow("Logo size", "logoSize", o.logoSize || tbMetrics(o).logoSize, 8, 400) : "") + "</div>";
      // Text colour
      html += '<div class="prop-group"><h4>Text colour</h4>' + colorRow("color", o.color) + "</div>";
      // Background colour + opacity
      html += '<div class="prop-group"><h4>Background</h4>' + colorRow("bg", o.bg) +
        sliderRow("Opacity", "bgOpacity", Math.round(bo * 100), 0, 100, "%") +
        numRow("Radius", "radius", o.radius, 0, 40) + "</div>";
      // Border colour + opacity
      html += '<div class="prop-group"><h4>Border</h4>' + colorRow("borderColor", o.borderColor) +
        numRow("Width", "borderWidth", o.borderWidth, 0, 30) +
        sliderRow("Opacity", "borderOpacity", Math.round(rdo * 100), 0, 100, "%") +
        (o.borderWidth ? strokeStyleRow(o) : "") + "</div>";
    } else if (o.type === "textbox") {
      html += tbxFieldGroup(o, "title", "Title");
      html += tbxFieldGroup(o, "subtitle", "Subtitle");
      html += tbxFieldGroup(o, "body", "Text");
      var tbxHasBg = o.bg && o.bg !== "transparent";
      html += '<div class="prop-group"><h4>Box</h4>' +
        '<div class="prop-row"><label>Align</label><div class="ctrl seg2">' +
          alignBtn("left", "alignL", o.align) + alignBtn("center", "alignC", o.align) + alignBtn("right", "alignR", o.align) + "</div></div>" +
        '<div class="prop-row"><label>Background</label><div class="ctrl seg2">' +
          '<button data-fill="off" class="' + (!tbxHasBg ? "on" : "") + '">None</button>' +
          '<button data-fill="on" class="' + (tbxHasBg ? "on" : "") + '">Solid</button></div></div>' +
        (tbxHasBg ? colorRow("bg", o.bg) + sliderRow("Opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 1 : o.bgOpacity) * 100), 0, 100, "%") : "") +
        numRow("Radius", "radius", o.radius, 0, 80) +
        numRow("Border", "borderWidth", o.borderWidth, 0, 20) +
        (o.borderWidth ? colorRow("borderColor", o.borderColor) + strokeStyleRow(o) : "") +
        '<div class="prop-row"><label>Drop shadow</label><div class="ctrl seg2">' +
          '<button data-toggle="dropShadow" class="' + (o.dropShadow ? "on" : "") + '" title="Drop shadow">' + Icons.svg("layers", { size: 15 }) + (o.dropShadow ? " On" : " Off") + "</button>" +
        "</div></div></div>";
    } else if (o.type === "legend") {
      var legBg = o.bg && o.bg !== "transparent";
      // Layout
      html += '<div class="prop-group"><h4>Layout</h4>' +
        '<div class="prop-row"><label>Arrangement</label><div class="ctrl seg2">' +
          '<button data-leglayout="inline" class="' + (o.layout !== "stacked" ? "on" : "") + '">Inline</button>' +
          '<button data-leglayout="stacked" class="' + (o.layout === "stacked" ? "on" : "") + '">Stacked</button></div></div>' +
        '<div class="prop-row"><label>Show value</label><div class="ctrl seg2">' +
          '<button data-leg-showvalue="on" class="' + (o.showValue ? "on" : "") + '">On</button>' +
          '<button data-leg-showvalue="off" class="' + (!o.showValue ? "on" : "") + '">Off</button></div></div>' +
        '<div class="prop-row"><label>Dot shape</label><div class="ctrl seg2">' +
          '<button data-legdot="circle" class="' + (o.dotShape !== "square" ? "on" : "") + '">Circle</button>' +
          '<button data-legdot="square" class="' + (o.dotShape === "square" ? "on" : "") + '">Square</button></div></div>' +
        "</div>";
      // Items (repeatable)
      html += '<div class="prop-group"><h4>Items</h4>';
      o.items.forEach(function (it, i) {
        html += '<div class="leg-row">' +
          '<button class="leg-chip" data-legcolor="' + i + '" title="Item colour" style="background:' + it.color + '"></button>' +
          '<input class="input leg-label" data-legfield="label" data-legidx="' + i + '" value="' + UI.escapeHtml(it.label || "") + '" placeholder="Label">' +
          '<input class="input leg-value" data-legfield="value" data-legidx="' + i + '" value="' + UI.escapeHtml(it.value || "") + '" placeholder="Val">' +
          '<button class="leg-x" data-legdel="' + i + '"' + (o.items.length <= 2 ? " disabled title=\"Minimum 2 items\"" : ' title="Remove item"') + ">" + Icons.svg("trash", { size: 13 }) + "</button>" +
          "</div>";
      });
      html += '<button class="view-btn leg-add" data-legadd="1">' + Icons.svg("plus", { size: 14 }) + "Add item</button></div>";
      // Labels & dots
      html += '<div class="prop-group"><h4>Labels &amp; dots</h4>' + colorRow("labelColor", o.labelColor) +
        numRow("Text size", "labelSize", o.labelSize, 8, 80) +
        '<div class="prop-row"><label>Weight</label><div class="ctrl seg2">' +
          '<button data-legweight="400" class="' + (o.labelWeight <= 400 ? "on" : "") + '">Regular</button>' +
          '<button data-legweight="600" class="' + (o.labelWeight > 400 && o.labelWeight < 700 ? "on" : "") + '">Medium</button>' +
          '<button data-legweight="700" class="' + (o.labelWeight >= 700 ? "on" : "") + '">Bold</button></div></div>' +
        numRow("Dot size", "dotSize", o.dotSize, 4, 60) +
        numRow("Item gap", "itemGap", o.itemGap, 0, 80) + "</div>";
      // Box
      html += '<div class="prop-group"><h4>Box</h4>' +
        '<div class="prop-row"><label>Background</label><div class="ctrl seg2">' +
          '<button data-fill="off" class="' + (!legBg ? "on" : "") + '">None</button>' +
          '<button data-fill="on" class="' + (legBg ? "on" : "") + '">Solid</button></div></div>' +
        (legBg ? colorRow("bg", o.bg) + sliderRow("Opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 1 : o.bgOpacity) * 100), 0, 100, "%") : "") +
        numRow("Radius", "radius", o.radius, 0, 80) +
        numRow("Padding X", "padX", o.padX, 0, 80) +
        numRow("Padding Y", "padY", o.padY, 0, 60) +
        numRow("Border", "borderWidth", o.borderWidth, 0, 20) +
        (o.borderWidth ? colorRow("borderColor", o.borderColor) + strokeStyleRow(o) : "") + "</div>";
    } else if (o.type === "photo") {
      html += '<div class="prop-group"><h4>Image</h4><div class="prop-row" style="gap:6px">' +
        '<button class="view-btn" data-act="photo-replace" style="flex:1">' + Icons.svg("image", { size: 14 }) + "Replace image</button></div></div>";
      html += '<div class="prop-group"><h4>Border</h4>' + colorRow("borderColor", o.borderColor) +
        numRow("Width", "borderWidth", o.borderWidth, 0, 40) +
        (o.borderWidth ? strokeStyleRow(o) : "") +
        numRow("Radius", "radius", o.radius, 0, 120) + "</div>";
      html += '<div class="prop-group"><h4>Effects</h4>' +
        '<div class="prop-row"><label>Drop shadow</label><div class="ctrl seg2">' +
          '<button data-toggle="dropShadow" class="' + (o.dropShadow ? "on" : "") + '">' + Icons.svg("layers", { size: 15 }) + (o.dropShadow ? " On" : " Off") + "</button>" +
        "</div></div></div>";
    } else if (isText) {
      html += '<div class="prop-group"><h4>Style</h4><div class="prop-row"><label>Preset</label><div class="ctrl"><select class="select" data-prop="captionStyle">' +
        Library.captionStyles.map(function (c) { return '<option value="' + c.id + '"' + (o.captionStyle === c.id ? " selected" : "") + ">" + c.name + "</option>"; }).join("") +
        "</select></div></div></div>";
      // Leading icon toggle for the timestamp component
      if (o.isStamp) {
        html += '<div class="prop-group"><h4>Icon</h4>' +
          '<div class="prop-row"><label>Leading icon</label><div class="ctrl seg2">' +
            '<button data-stampicon="on" class="' + (o.iconSide ? "on" : "") + '">On</button>' +
            '<button data-stampicon="off" class="' + (!o.iconSide ? "on" : "") + '">Off</button>' +
          "</div></div></div>";
      }
      // Icon (only for icon-labels)
      if (o.type === "label" && o.iconSide) {
        html += '<div class="prop-group"><h4>Icon</h4>' +
          '<div class="prop-row"><label>Side</label><div class="ctrl seg2">' +
            '<button data-iconside="left" class="' + (o.iconSide === "left" ? "on" : "") + '">Left</button>' +
            '<button data-iconside="right" class="' + (o.iconSide === "right" ? "on" : "") + '">Right</button>' +
          "</div></div>" +
          '<div class="lib-search" style="padding:0;background:none;border:none;margin-top:2px"><span class="lib-search-ic" data-icon="search" data-size="14"></span>' +
          '<input id="labelIconSearch" class="lib-search-input" type="text" placeholder="Search icons…" value=""></div>' +
          '<div class="lib-grid" id="labelIconGrid" style="padding:8px 0 0"></div>' +
          "</div>";
      }
      // Leader line (only when the leader preset is active)
      if (o.captionStyle === "leader") {
        var lg2 = leaderGeom(o);
        html += '<div class="prop-group"><h4>Leader line</h4>' + colorRow("leaderColor", lg2.color) +
          sliderRow("Angle", "leaderAngle", Math.round(lg2.angle), -180, 180, "°") +
          sliderRow("Length", "leaderLength", Math.round(lg2.len), 10, 600, "px") + "</div>";
      }
      // Text
      html += '<div class="prop-group"><h4>Text</h4>' +
        '<div class="prop-row"><label>Content</label><div class="ctrl"><input class="input" data-prop="text" value="' + UI.escapeHtml(o.text) + '"></div></div>' +
        '<div class="prop-row"><label>Font</label><div class="ctrl"><select class="select" data-prop="font">' +
          FONTS.map(function (f) { return '<option value="' + f + '"' + (o.font === f ? " selected" : "") + ">" + f + "</option>"; }).join("") + "</select></div></div>" +
        numRow("Size", "fontSize", o.fontSize, 8, 200) +
        '<div class="prop-row"><label>Weight</label><div class="ctrl"><select class="select" data-prop="fontWeight">' +
          [400, 500, 600, 700, 800].map(function (w) { return '<option value="' + w + '"' + (+o.fontWeight === w ? " selected" : "") + ">" + ({ 400: "Regular", 500: "Medium", 600: "Semibold", 700: "Bold", 800: "Heavy" }[w]) + "</option>"; }).join("") + "</select></div></div>" +
        '<div class="prop-row"><label>Format</label><div class="ctrl seg2">' +
          segBtn("italic", "italic", o.italic) + segBtn("underline", "underline", o.underline) + segBtn("shadow", "alert", o.shadow, "Shadow") +
          "</div></div>" +
        '<div class="prop-row"><label>Align</label><div class="ctrl seg2">' +
          alignBtn("left", "alignL", o.align) + alignBtn("center", "alignC", o.align) + alignBtn("right", "alignR", o.align) +
          "</div></div></div>";
      // Colors
      html += '<div class="prop-group"><h4>Text colour</h4>' + colorRow("color", o.color) + "</div>";
      html += '<div class="prop-group"><h4>Background</h4>' + colorRow("bg", o.bg) +
        sliderRow("Bg opacity", "bgOpacity", Math.round((o.bgOpacity == null ? 1 : o.bgOpacity) * 100), 0, 100, "%") +
        numRow("Radius", "radius", o.radius, 0, 60) +
        numRow("Border", "borderWidth", o.borderWidth, 0, 20) +
        ((o.borderWidth || o.captionStyle === "outline") ? colorRow("borderColor", o.borderColor) + strokeStyleRow(o) +
          sliderRow("Border opacity", "borderOpacity", Math.round((o.borderOpacity == null ? 1 : o.borderOpacity) * 100), 0, 100, "%") : "") +
        '<div class="prop-row"><label>Drop shadow</label><div class="ctrl seg2">' +
          '<button data-toggle="dropShadow" class="' + (o.dropShadow ? "on" : "") + '" title="Drop shadow">' + Icons.svg("layers", { size: 15 }) + (o.dropShadow ? " On" : " Off") + "</button>" +
        "</div></div></div>";
    } else if (o.type === "icon") {
      html += '<div class="prop-group"><h4>Icon colour</h4>' + colorRow("color", o.color) + "</div>";
    } else if (o.type === "shape" || o.type === "polygon" || o.type === "polyline") {
      var fo = o.fillOpacity == null ? 1 : o.fillOpacity;
      var so = o.strokeOpacity == null ? 1 : o.strokeOpacity;
      var hasFill = o.bg && o.bg !== "transparent";
      var lineLabel = (o.type === "polygon" || o.type === "polyline") ? "Line" : "Border";
      // Border / line
      html += '<div class="prop-group"><h4>' + lineLabel + '</h4>' + colorRow("color", o.color) +
        numRow("Width", "borderWidth", o.borderWidth, 0, 40) +
        sliderRow("Opacity", "strokeOpacity", Math.round(so * 100), 0, 100, "%") +
        (o.borderWidth || o.shapeKind === "line" ? strokeStyleRow(o) : "") + "</div>";
      // Fill (not for line shape / polyline)
      if (o.shapeKind !== "line" && o.type !== "polyline") {
        html += '<div class="prop-group"><h4>Fill</h4>' +
          '<div class="prop-row"><label>Fill</label><div class="ctrl seg2">' +
            '<button data-fill="off" class="' + (!hasFill ? "on" : "") + '">None</button>' +
            '<button data-fill="on" class="' + (hasFill ? "on" : "") + '">Solid</button>' +
          "</div></div>" +
          (hasFill ? colorRow("bg", o.bg) + sliderRow("Opacity", "fillOpacity", Math.round(fo * 100), 0, 100, "%") : "") +
          "</div>";
      }
      // Effects
      html += '<div class="prop-group"><h4>Effects</h4>' +
        '<div class="prop-row"><label>Drop shadow</label><div class="ctrl seg2">' +
          '<button data-toggle="dropShadow" class="' + (o.dropShadow ? "on" : "") + '">' + Icons.svg("layers", { size: 15 }) + (o.dropShadow ? " On" : " Off") + "</button>" +
        "</div></div></div>";
    } else if (o.type === "watermark") {
      html += '<div class="prop-group"><h4>Watermark</h4>' +
        '<div class="prop-row"><label>Text</label><div class="ctrl"><input class="input" data-prop="text" value="' + UI.escapeHtml(o.text) + '"></div></div>' +
        '<div class="prop-row"><label>Style</label><div class="ctrl seg2">' +
          [["tile", "Tiled"], ["band", "Diagonal"], ["corner", "Corner"]].map(function (s) {
            return '<button data-wmstyle="' + s[0] + '" class="' + ((o.wmStyle || "tile") === s[0] ? "on" : "") + '">' + s[1] + "</button>";
          }).join("") + "</div></div>" +
        '<div class="prop-row"><label>Font</label><div class="ctrl"><select class="select" data-prop="font">' +
          FONTS.map(function (f) { return '<option value="' + f + '"' + (o.font === f ? " selected" : "") + ">" + f + "</option>"; }).join("") + "</select></div></div>" +
        '<div class="prop-row"><label>Weight</label><div class="ctrl"><select class="select" data-prop="fontWeight">' +
          [400, 500, 600, 700, 800].map(function (w) { return '<option value="' + w + '"' + (+o.fontWeight === w ? " selected" : "") + ">" + ({ 400: "Regular", 500: "Medium", 600: "Semibold", 700: "Bold", 800: "Heavy" }[w]) + "</option>"; }).join("") + "</select></div></div>" +
        numRow("Size", "fontSize", o.fontSize, 8, 400) +
        sliderRow("Opacity", "wmOpacity", Math.round((o.wmOpacity == null ? 0.28 : o.wmOpacity) * 100), 0, 100, "%") +
        (o.wmStyle !== "corner" ? sliderRow("Angle", "wmAngle", Math.round(o.wmAngle == null ? -30 : o.wmAngle), -90, 90, "°") : "") +
        (o.wmStyle === "tile" ? sliderRow("Spacing", "wmDensity", Math.round(o.wmDensity == null ? 100 : o.wmDensity), 40, 260, "%") : "") +
        "</div>";
      html += '<div class="prop-group"><h4>Colour</h4>' + colorRow("color", o.color) + "</div>";
    } else if (Kit.has(o.type)) {
      html += Kit.props(o);
    } else {
      html += '<div class="prop-group"><h4>Colour</h4>' + colorRow("color", o.color) +
        numRow("Stroke", "borderWidth", o.borderWidth, 0, 40) +
        (o.type === "arrow" ? arrowHeadRow(o) + strokeStyleRow(o) +
          '<div class="prop-row"><label>Flip</label><div class="ctrl seg2">' +
            '<button data-arrowflip="h" class="' + (o.flipX ? "on" : "") + '">Horizontal</button>' +
            '<button data-arrowflip="v" class="' + (o.flipY ? "on" : "") + '">Vertical</button>' +
          "</div></div>" +
          '<div class="prop-row"><label>Drop shadow</label><div class="ctrl seg2">' +
            '<button data-toggle="dropShadow" class="' + (o.dropShadow ? "on" : "") + '" title="Drop shadow">' + Icons.svg("layers", { size: 15 }) + (o.dropShadow ? " On" : " Off") + "</button>" +
          "</div></div>" : (o.borderWidth ? strokeStyleRow(o) : "")) +
        "</div>";
    }

    // Arrange
    html += '<div class="prop-group"><h4>Arrange</h4><div class="prop-row" style="gap:6px">' +
      '<button class="view-btn" data-act="forward" style="flex:1">' + Icons.svg("bringFwd", { size: 14 }) + "Forward</button>" +
      '<button class="view-btn" data-act="backward" style="flex:1">' + Icons.svg("sendBack", { size: 14 }) + "Back</button></div>" +
      '<div class="prop-row" style="gap:6px">' +
      '<button class="view-btn" data-act="duplicate" style="flex:1">' + Icons.svg("copy", { size: 14 }) + "Duplicate</button>" +
      '<button class="view-btn" data-act="delete" style="flex:1;color:var(--danger)">' + Icons.svg("trash", { size: 14 }) + "Delete</button></div></div>";

    if (!Kit.has(o.type) && (o.dropShadow || o.shadow)) {
      var shRow = sliderRow("Shadow opacity", "shadowOpacity", Math.round((o.shadowOpacity == null ? 1 : o.shadowOpacity) * 100), 0, 100, "%");
      var dsRe = /(<div class="prop-row"><label>Drop shadow<\/label>[\s\S]*?<\/button><\/div><\/div>)/;
      html = dsRe.test(html) ? html.replace(dsRe, "$1" + shRow) : html.replace(/(<\/div>)$/, shRow + "$1");
    }
    panel.innerHTML = html;
    UI.hydrateIcons(panel);
    wirePropEvents(panel, o);
    if (Kit.has(o.type)) Kit.wire(panel, o);
    panel.querySelectorAll("[data-arrowhead]").forEach(function (b) { b.addEventListener("click", function () {
      var ob = getSel(); if (!ob) return; ob.arrowHead = b.getAttribute("data-arrowhead"); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
    }); });
    panel.querySelectorAll("[data-bothends]").forEach(function (b) { b.addEventListener("click", function () {
      var ob = getSel(); if (!ob) return; var on = b.getAttribute("data-bothends") === "1";
      ob.bothEnds = on; if (ob.shapeKind === "darrow") ob.shapeKind = "arrow";   // legacy Double Arrow becomes Arrow + setting
      renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
    }); });
    if ((o.type === "label" && o.iconSide) || (o.type === "footer" && o.showIcon)) renderLabelIconPicker(o);
  }

  // Compact searchable Lucide picker inside a label's Icon property group.
  function renderLabelIconPicker(o) {
    var grid = $("labelIconGrid"), search = $("labelIconSearch");
    if (!grid) return;
    function paint(q) {
      var names = Icons.lucideNames();
      if (!names.length) { grid.innerHTML = '<p class="lib-grid-more">Icons loading…</p>'; return; }
      q = (q || "").trim().toLowerCase();
      var list = (q ? names.filter(function (n) { return Icons.humanize(n).toLowerCase().indexOf(q) > -1; }) : names).slice(0, 60);
      grid.innerHTML = list.map(function (n) {
        return '<div class="lib-cell' + (n === o.iconKey ? " on" : "") + '" data-picklabelicon="' + n + '" data-hydrated="1" title="' + UI.escapeHtml(Icons.humanize(n)) + '" style="min-height:44px">' + Icons.svg(n, { size: 20 }) + "</div>";
      }).join("");
      grid.querySelectorAll("[data-picklabelicon]").forEach(function (c) {
        c.addEventListener("click", function () {
          var ob = getSel(); if (!ob) return;
          ob.iconKey = c.getAttribute("data-picklabelicon");
          renderObjects(); wireObjectEvents(); pushHistory(); markDirty();
          grid.querySelectorAll(".lib-cell").forEach(function (x) { x.classList.remove("on"); });
          c.classList.add("on");
        });
      });
    }
    if (search) search.addEventListener("input", function () { paint(search.value); });
    paint("");
  }

  function numRow(label, prop, val, min, max) {
    return '<div class="prop-row"><label>' + label + '</label><div class="ctrl"><input class="input" type="number" data-prop="' + prop + '" value="' + val + '" min="' + min + '" max="' + max + '"></div></div>';
  }
  function sliderRow(label, prop, val, min, max, unit) {
    return '<div class="prop-row"><label>' + label + '</label><div class="ctrl prop-num"><input type="range" data-prop="' + prop + '" value="' + val + '" min="' + min + '" max="' + max + '"><span class="val">' + val + (unit || "") + "</span></div></div>";
  }
  function segBtn(prop, icon, on, title) {
    return '<button data-toggle="' + prop + '" class="' + (on ? "on" : "") + '" title="' + (title || prop) + '">' + Icons.svg(icon, { size: 15 }) + "</button>";
  }
  function alignBtn(val, icon, cur) {
    return '<button data-align="' + val + '" class="' + (cur === val ? "on" : "") + '">' + Icons.svg(icon, { size: 15 }) + "</button>";
  }
  // Solid / dashed / dotted segmented control for any object with a stroke.
  function strokeStyleRow(o) {
    var v = o.strokeStyle || "solid";
    return '<div class="prop-row"><label>Line style</label><div class="ctrl seg2">' +
      [["solid", "Solid"], ["dashed", "Dashed"], ["dotted", "Dotted"]].map(function (s) {
        return '<button data-strokestyle="' + s[0] + '" class="' + (v === s[0] ? "on" : "") + '">' + s[1] + "</button>";
      }).join("") + "</div></div>";
  }
  var ARROW_HEADS = [{ id: "triangle", name: "Triangle" }, { id: "open", name: "Open" }, { id: "stealth", name: "Barbed" }, { id: "diamond", name: "Diamond" }, { id: "circle", name: "Dot" }, { id: "ring", name: "Circle" }, { id: "bar", name: "Bar" }, { id: "none", name: "None" }];
  function arrowHeadRow(o) {
    var head = o.arrowHead || "triangle";
    var both = !!o.bothEnds || o.shapeKind === "darrow";
    var picker = ARROW_HEADS.map(function (h) {
      var ic = '<svg width="30" height="16" viewBox="0 0 30 16" style="overflow:visible">' +
        (h.id === "none" ? '<line x1="3" y1="8" x2="27" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
          : '<line x1="3" y1="8" x2="' + (26 - headRetract(h.id, 9)) + '" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' + arrowHead(h.id, 26, 8, 0, "currentColor", 2, 9)) + "</svg>";
      return '<button class="ah-btn' + (head === h.id ? " on" : "") + '" data-arrowhead="' + h.id + '" title="' + h.name + '" aria-label="' + h.name + '">' + ic + "</button>";
    }).join("");
    return '<div class="prop-row" style="align-items:flex-start"><label>Head</label><div class="ctrl"><div class="ah-grid">' + picker + "</div></div></div>" +
      '<div class="prop-row"><label>Ends</label><div class="ctrl seg2">' +
        '<button data-bothends="0" class="' + (!both ? "on" : "") + '">One</button><button data-bothends="1" class="' + (both ? "on" : "") + '">Both</button></div></div>' +
      (head === "none" ? "" : sliderRow("Head size", "headScale", Math.round(o.headScale || 100), 40, 300, "%"));
  }
  function colorRow(prop, val) {
    var sw = SWATCHES.map(function (c) {
      return '<div class="color-sw' + (val && val.toLowerCase() === c.toLowerCase() ? " on" : "") + '" data-color="' + prop + '" data-val="' + c + '" style="background:' + c + '"></div>';
    }).join("");
    sw += '<div class="color-sw custom" data-customcolor="' + prop + '" title="Custom colour">' + Icons.svg("plus", { size: 13 }) + "</div>";
    return '<div class="prop-row"><div class="ctrl"><div class="color-swatches">' + sw + "</div></div></div>";
  }

  function wirePropEvents(panel, o) {
    panel.querySelectorAll("[data-prop]").forEach(function (input) {
      var prop = input.getAttribute("data-prop");
      var ev = (input.type === "range") ? "input" : "change";
      input.addEventListener(ev, function () {
        var ob = getSel(); if (!ob) return;
        var v = input.value;
        if (/opacity$/i.test(prop)) { ob[prop] = clamp(+v / 100, 0, 1); var val = input.parentElement.querySelector(".val"); if (val) val.textContent = v + "%"; }
        else if (["w", "h", "fontSize", "radius", "borderWidth", "fontWeight", "titleSize", "subSize", "logoSize", "leaderAngle", "leaderLength", "subtitleSize", "bodySize", "headScale", "labelSize", "dotSize", "itemGap", "padX", "padY", "wmAngle", "wmDensity"].indexOf(prop) > -1) ob[prop] = +v;
        else if (prop === "rot") ob.rot = +v;
        else ob[prop] = v;
        if (prop === "text" || prop === "fontSize" || prop === "font") fitTextBox(ob);
        if (ob.type === "legend") fitLegend(ob);
        if (ob.type === "titlebar" && prop === "logoSize") {
          tbFitLogo(ob);
          var thIn = panel.querySelector('[data-prop="h"]'); if (thIn) thIn.value = Math.round(ob.h);
          var twIn = panel.querySelector('[data-prop="w"]'); if (twIn) twIn.value = Math.round(ob.w);
        }
        if (Kit.has(ob.type)) {
          Kit.editSize(ob, prop); Kit.fit(ob);
          if (prop === "w" || prop === "h") input.value = Math.round(ob[prop]);
          var fIn = panel.querySelector('[data-kprop="f"]'); if (fIn) fIn.value = ob.f;
          var oIn = panel.querySelector('[data-prop="' + (prop === "w" ? "h" : "w") + '"]'); if (oIn) oIn.value = Math.round(prop === "w" ? ob.h : ob.w);
        }
        renderObjects(); wireObjectEvents();
        if (!/opacity$/i.test(prop) && ev === "change") { pushHistory(); markDirty(); renderLayers(); if (prop === "borderWidth" || prop === "captionStyle" || prop === "arrowHead") renderProps(); }
        else markDirty();
      });
      if (input.type === "range") input.addEventListener("change", function () { pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-rtedit]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel(); if (!ob) return;
        var el = objLayer.querySelector('.obj[data-id="' + ob.id + '"]');
        if (el) beginBodyEdit(el, ob);
      });
    });
    panel.querySelectorAll("[data-toggle]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); var p = b.getAttribute("data-toggle"); ob[p] = !ob[p]; renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-stampicon]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel();
        if (b.getAttribute("data-stampicon") === "on") { ob.iconSide = "left"; ob.iconKey = ob.iconKey || "clock"; }
        else { ob.iconSide = null; }
        renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-arrowflip]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel(); if (!ob) return;
        if (b.getAttribute("data-arrowflip") === "h") ob.flipX = !ob.flipX;
        else ob.flipY = !ob.flipY;
        renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-iconside]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.iconSide = b.getAttribute("data-iconside"); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-strokestyle]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.strokeStyle = b.getAttribute("data-strokestyle"); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-wmstyle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel(); if (!ob) return;
        ob.wmStyle = b.getAttribute("data-wmstyle");
        if (ob.wmStyle === "corner") ob.wmAngle = 0;
        else if (!ob.wmAngle) ob.wmAngle = -30;
        renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-align]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.align = b.getAttribute("data-align"); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-fill]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel();
        if (b.getAttribute("data-fill") === "on") ob.bg = (ob.bg && ob.bg !== "transparent") ? ob.bg : (ob.color || "#00AEEF");
        else ob.bg = "transparent";
        renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-color]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var ob = getSel(); var prop = sw.getAttribute("data-color");
        ob[prop] = sw.getAttribute("data-val");
        if (prop === "bg" && ob.borderWidth === 0 && ob.type !== "label" && ob.type !== "caption") { }
        renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-customcolor]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var prop = sw.getAttribute("data-customcolor"); var picker = $("hiddenColor");
        var ob = getSel(); picker.value = /^#/.test(ob[prop]) ? ob[prop] : "#00AEEF";
        picker.onchange = function () { ob[prop] = picker.value; renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); };
        picker.click();
      });
    });
    // ---- legend controls ----
    panel.querySelectorAll("[data-leglayout]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.layout = b.getAttribute("data-leglayout"); fitLegend(ob); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-leg-showvalue]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.showValue = b.getAttribute("data-leg-showvalue") === "on"; fitLegend(ob); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-legdot]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.dotShape = b.getAttribute("data-legdot"); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-legweight]").forEach(function (b) {
      b.addEventListener("click", function () { var ob = getSel(); ob.labelWeight = +b.getAttribute("data-legweight"); fitLegend(ob); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-legfield]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var ob = getSel(); var i = +inp.getAttribute("data-legidx"); var f = inp.getAttribute("data-legfield");
        if (!ob.items[i]) return;
        ob.items[i][f] = inp.value; fitLegend(ob); renderObjects(); wireObjectEvents(); markDirty();
      });
      inp.addEventListener("change", function () { pushHistory(); markDirty(); });
    });
    panel.querySelectorAll("[data-legcolor]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel(); var i = +b.getAttribute("data-legcolor"); var picker = $("hiddenColor");
        picker.value = /^#/.test(ob.items[i].color) ? ob.items[i].color : "#22C55E";
        picker.onchange = function () { ob.items[i].color = picker.value; renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); };
        picker.click();
      });
    });
    panel.querySelectorAll("[data-legdel]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel(); if (ob.items.length <= 2) return;
        ob.items.splice(+b.getAttribute("data-legdel"), 1);
        fitLegend(ob); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-legadd]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ob = getSel();
        var c = LEGEND_PALETTE[ob.items.length % LEGEND_PALETTE.length];
        ob.items.push({ color: c, label: "Item " + (ob.items.length + 1), value: "" });
        fitLegend(ob); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
      });
    });
    panel.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var act = b.getAttribute("data-act");
        if (act === "forward") arrange(1);
        else if (act === "backward") arrange(-1);
        else if (act === "duplicate") duplicateSelected();
        else if (act === "delete") deleteSelected();
        else if (act === "logo-upload") uploadTitleBarLogo(getSel());
        else if (act === "logo-clear") { var ob = getSel(); ob.logo = null; renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty(); }
        else if (act === "photo-replace") replacePhotoSrc(getSel());
      });
    });
  }

  // Drag the divider to resize the left (Library / Properties) panel.
  var RAIL_W_KEY = "skytek.leftRailW";
  function setupRailResize() {
    var rail = $("rightRail"), grip = $("leftResizer");
    if (!rail || !grip) return;
    var saved = parseInt(localStorage.getItem(RAIL_W_KEY), 10);
    if (saved && saved >= 220 && saved <= 640) rail.style.width = saved + "px";
    grip.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var startX = e.clientX, startW = rail.offsetWidth;
      grip.classList.add("dragging");
      document.body.style.userSelect = "none";
      function mv(ev) {
        var w = Math.max(220, Math.min(640, startW + (ev.clientX - startX)));
        rail.style.width = w + "px";
      }
      function up() {
        document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
        grip.classList.remove("dragging"); document.body.style.userSelect = "";
        try { localStorage.setItem(RAIL_W_KEY, String(rail.offsetWidth)); } catch (err) {}
      }
      document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
    });
  }

  function fitTextBox(o) {
    // grow width to fit single-line text, keep height proportional to font
    if (o.type !== "label" && o.type !== "caption") return;
    o.h = Math.max(o.h, Math.round(o.fontSize * 1.9));
  }

  function renderLayers() {
    var list = $("layerList");
    var sorted = S.objects.slice().sort(function (a, b) { return (b.z || 0) - (a.z || 0); });
    if (!sorted.length) { list.innerHTML = '<p class="muted" style="font-size:12px">No objects yet.</p>'; return; }
    list.innerHTML = (sorted.length > 1 ? '<p class="layers-hint">Drag to reorder · top sits in front</p>' : "") + sorted.map(function (o) {
      var ic = Kit.has(o.type) ? Kit.icon(o) : o.type === "icon" ? o.iconKey : (o.type === "shape" ? "shapes" : ((o.type === "polygon" || o.type === "polyline") ? "edit" : (o.type === "arrow" ? "arrowRt" : (o.type === "titlebar" ? "layout" : (o.type === "textbox" ? "text" : (o.type === "legend" ? "gridDots" : (o.type === "photo" ? "image" : "tag")))))));
      var label = Kit.has(o.type) ? Kit.label(o) : o.type === "titlebar" ? (o.title || "Title bar") : (o.type === "textbox" ? (o.title || o.subtitle || rtPlainText(o.body) || "Text box") : (o.type === "legend" ? "Legend" : (o.type === "photo" ? "Image" : (o.text || (o.type.charAt(0).toUpperCase() + o.type.slice(1)) + (o.shapeKind ? " · " + o.shapeKind : "")))));
      return '<div class="layer-item' + (isSelected(o.id) ? " on" : "") + (o.locked ? " locked" : "") + '" data-id="' + o.id + '" draggable="' + (o.locked ? "false" : "true") + '">' +
        '<span class="li-grip" title="Drag to reorder">' + Icons.svg("grip", { size: 13 }) + "</span>" +
        '<span class="li-ic">' + Icons.svg(ic, { size: 14 }) + "</span>" +
        '<span class="li-lbl">' + UI.escapeHtml(label) + "</span>" +
        '<span class="li-acts">' +
          '<button class="li-act li-act--lock' + (o.locked ? " on" : "") + '" data-layeract="lock" title="' + (o.locked ? "Unlock layer" : "Lock layer") + '">' + Icons.svg(o.locked ? "lock" : "unlock", { size: 12 }) + "</button>" +
          '<button class="li-act" data-layeract="dup" title="Duplicate layer">' + Icons.svg("copy", { size: 12 }) + "</button>" +
          '<button class="li-act li-act--del" data-layeract="del" title="Delete layer">' + Icons.svg("trash", { size: 12 }) + "</button>" +
        "</span></div>";
    }).join("");
    list.querySelectorAll(".layer-item").forEach(function (it) {
      it.addEventListener("click", function (e) {
        if (e.target.closest("[data-layeract]")) return;
        if (e.shiftKey) toggleSelect(it.getAttribute("data-id"));
        else select(it.getAttribute("data-id"));
      });
      it.querySelectorAll("[data-layeract]").forEach(function (b) {
        b.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          var id = it.getAttribute("data-id");
          var act = b.getAttribute("data-layeract");
          if (act === "lock") { toggleLock(id); return; }
          if (id !== S.selected) select(id);
          if (act === "dup") duplicateSelected();
          else deleteSelected();
        });
      });
    });
    wireLayerDnD(list);
  }
  function toggleLock(id) {
    var o = S.objects.filter(function (x) { return x.id === id; })[0];
    if (!o) return;
    o.locked = !o.locked;
    renderObjects(); wireObjectEvents(); renderLayers(); renderProps(); pushHistory(); markDirty();
  }

  // Drag-and-drop reordering of the layers list. The list shows objects in
  // descending z (front-most first); after a drop we reassign z so DOM order
  // becomes the new stacking order.
  var layerDrag = null;
  function wireLayerDnD(list) {
    var items = list.querySelectorAll(".layer-item");
    function clearMarks() { items.forEach(function (n) { n.classList.remove("drop-before", "drop-after"); }); }
    items.forEach(function (it) {
      it.addEventListener("dragstart", function (e) {
        layerDrag = it.getAttribute("data-id");
        it.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", layerDrag); } catch (err) {}
      });
      it.addEventListener("dragend", function () { it.classList.remove("dragging"); clearMarks(); layerDrag = null; });
      it.addEventListener("dragover", function (e) {
        if (!layerDrag || it.getAttribute("data-id") === layerDrag) return;
        e.preventDefault(); e.dataTransfer.dropEffect = "move";
        var r = it.getBoundingClientRect();
        var after = e.clientY > r.top + r.height / 2;
        clearMarks();
        it.classList.add(after ? "drop-after" : "drop-before");
      });
      it.addEventListener("dragleave", function () { it.classList.remove("drop-before", "drop-after"); });
      it.addEventListener("drop", function (e) {
        e.preventDefault();
        var targetId = it.getAttribute("data-id");
        if (!layerDrag || targetId === layerDrag) { clearMarks(); return; }
        var r = it.getBoundingClientRect();
        var after = e.clientY > r.top + r.height / 2;
        clearMarks();
        reorderLayer(layerDrag, targetId, after);
      });
    });
  }

  // Move object `dragId` to just before/after `targetId` in the visual (top→front)
  // order, then renumber z values to match.
  function reorderLayer(dragId, targetId, after) {
    var order = S.objects.slice().sort(function (a, b) { return (b.z || 0) - (a.z || 0); }).map(function (o) { return o.id; });
    var from = order.indexOf(dragId);
    if (from < 0) return;
    order.splice(from, 1);
    var ti = order.indexOf(targetId);
    if (ti < 0) return;
    order.splice(after ? ti + 1 : ti, 0, dragId);
    // top of list = highest z
    var n = order.length;
    order.forEach(function (id, i) {
      var ob = S.objects.filter(function (x) { return x.id === id; })[0];
      if (ob) ob.z = n - i;
    });
    renderObjects(); wireObjectEvents(); renderLayers(); pushHistory(); markDirty();
  }

  function arrange(dir) {
    var o = getSel(); if (!o) return;
    var sorted = S.objects.slice().sort(function (a, b) { return a.z - b.z; });
    var i = sorted.indexOf(o);
    var j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    var tmp = sorted[j].z; sorted[j].z = o.z; o.z = tmp;
    renderObjects(); wireObjectEvents(); renderLayers(); pushHistory(); markDirty();
  }
  function duplicateSelected() {
    var objs = selectedObjects(); if (!objs.length) return;
    var regroup = objs.length > 1 || objs.some(function (o) { return o.groupId; });
    var gid = regroup ? ("g_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)) : null;
    var newIds = [];
    objs.forEach(function (o) {
      var copy = JSON.parse(JSON.stringify(o));
      copy.id = uid(); copy.x += 24; copy.y += 24; copy.z = topZ() + 1;
      if (gid) copy.groupId = gid; else delete copy.groupId;
      S.objects.push(copy); newIds.push(copy.id);
    });
    S.selectedIds = newIds; S.selected = newIds[newIds.length - 1];
    renderObjects(); wireObjectEvents(); renderProps(); renderLayers();
    pushHistory(); markDirty();
    UI.toast({ type: "success", title: "Duplicated", duration: 1400 });
  }
  function deleteSelected() {
    if (!S.selectedIds.length) return;
    var ids = S.selectedIds.slice();
    S.objects = S.objects.filter(function (x) { return ids.indexOf(x.id) === -1; });
    deselect(); pushHistory(); markDirty();
  }
  // Clipboard persists to localStorage so an object copied on one image can be
  // pasted onto another (navigating between images reloads the page).
  var CLIP_KEY = "skytek.clipboard";
  function readClipboard() {
    try { return JSON.parse(localStorage.getItem(CLIP_KEY) || "null"); } catch (e) { return null; }
  }
  // Copy the selected object(s) to the (persistent) clipboard as an array.
  function copySelected() {
    var objs = selectedObjects(); if (!objs.length) return;
    clipboard = JSON.parse(JSON.stringify(objs));
    try { localStorage.setItem(CLIP_KEY, JSON.stringify(clipboard)); } catch (e) {}
    pasteShift = 0;
    UI.toast({ type: "info", title: objs.length > 1 ? "Copied " + objs.length + " objects" : "Copied", duration: 1200 });
  }
  // Paste clipboard object(s), cascading position and preserving relative layout + grouping.
  function pasteClipboard() {
    if (!image) return;
    var src = clipboard || readClipboard();
    if (!src) return;
    var arr = Array.isArray(src) ? src : [src];
    if (!arr.length) return;
    pasteShift += 22;
    // shared offset derived from the group's top-left, clamped on-canvas
    var minX = Math.min.apply(null, arr.map(function (o) { return o.x || 0; }));
    var minY = Math.min.apply(null, arr.map(function (o) { return o.y || 0; }));
    var bx = Math.max(0, Math.min(minX, Math.max(0, image.w - 40)));
    var by = Math.max(0, Math.min(minY, Math.max(0, image.h - 40)));
    var odx = bx - minX + pasteShift, ody = by - minY + pasteShift;
    var regroup = arr.length > 1 || arr.some(function (o) { return o.groupId; });
    var gid = regroup ? ("g_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)) : null;
    var newIds = [];
    arr.forEach(function (o) {
      var copy = JSON.parse(JSON.stringify(o));
      copy.id = uid();
      copy.x = (o.x || 0) + odx; copy.y = (o.y || 0) + ody;
      copy.z = topZ() + 1;
      if (gid) copy.groupId = gid; else delete copy.groupId;
      S.objects.push(copy); newIds.push(copy.id);
    });
    S.selectedIds = newIds; S.selected = newIds[newIds.length - 1];
    renderObjects(); wireObjectEvents(); renderProps(); renderLayers();
    pushHistory(); markDirty();
    UI.toast({ type: "success", title: "Pasted", duration: 1200 });
  }

  /* ============================================================
     ADD OBJECT (click or drop)
  ============================================================ */
  function viewportCenterImage() {
    var r = canvasWrap.getBoundingClientRect();
    return toImage(r.left + r.width / 2, r.top + r.height / 2);
  }
  function addObject(kind, opts, atImage) {
    if (!image) { UI.toast({ type: "warning", title: "Upload an image first" }); return; }
    var o = makeObject(kind, opts);
    var c = atImage || viewportCenterImage();
    o.x = Math.round(c.x - o.w / 2); o.y = Math.round(c.y - o.h / 2);
    if (o.type === "watermark" && o.wmStyle !== "corner" && !atImage) { o.x = 0; o.y = 0; }
    if (S.snap) { o.x = snap(o.x); o.y = snap(o.y); }
    if (Kit.has(o.type)) Kit.place(o, atImage);
    S.objects.push(o); select(o.id); pushHistory(); markDirty();
  }
  function snap(v) { return S.snap ? Math.round(v / S.grid) * S.grid : v; }

  /* ============================================================
     COMPONENT LIBRARY (right rail)
  ============================================================ */
  var activeTab = "labels";
  var iconQuery = "";
  var ICON_GRID_CAP = 240;
  function renderLib() {
    var panel = $("libPanel");
    var html = "";
    if (activeTab === "labels") {
      html = '<div class="lib-list">' +
        libItemRow("tag", "Label", "label", { text: "Label" }) +
        libItemRow("tag", "Label / Icon Left", "label", { text: "Label", iconSide: "left", iconKey: "Star" }) +
        libItemRow("tag", "Label / Icon Right", "label", { text: "Label", iconSide: "right", iconKey: "Star" }) +
        "</div>";
    } else if (activeTab === "components") {
      html = '<div class="lib-list">' +
        '<div class="lib-item" draggable="true" data-kind="titlebar" data-text=""><span class="li-icon">' + Icons.svg("layout", { size: 16 }) + '</span>Title Bar<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item" draggable="true" data-kind="datestamp" data-text=""><span class="li-icon">' + Icons.svg("clock", { size: 16 }) + '</span>Date Stamp<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item" draggable="true" data-kind="textbox" data-text=""><span class="li-icon">' + Icons.svg("text", { size: 16 }) + '</span>Text Box<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item" draggable="true" data-kind="legend" data-text=""><span class="li-icon">' + Icons.svg("gridDots", { size: 16 }) + '</span>Legend<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item" data-kind="photo"><span class="li-icon">' + Icons.svg("image", { size: 16 }) + '</span>Image Overlay<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        "</div>";
    } else if (activeTab === "map") {
      html = Kit.libHTML(drawMode && drawKind === "track");
    } else if (activeTab === "icons") {
      html = '<div class="lib-search"><span class="lib-search-ic" data-icon="search" data-size="14"></span>' +
        '<input id="iconSearch" class="lib-search-input" type="text" placeholder="Search all icons…" value="' + UI.escapeHtml(iconQuery) + '"></div>' +
        '<div class="lib-grid" id="iconGrid"></div>';
    } else if (activeTab === "arrows") {
      html = '<div class="lib-list">' + Library.arrows.map(function (a) {
        return '<div class="lib-item" draggable="true" data-kind="arrow" data-shape="' + a.shape + '"><span class="li-icon">' + Icons.svg("arrowRt", { size: 16 }) + '</span>' + a.name + '<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>";
      }).join("") + "</div>";
    } else if (activeTab === "shapes") {
      html = '<div class="lib-hint">Trace a freehand region, then style its fill &amp; line.</div><div class="lib-list">' +
        '<div class="lib-item' + (drawMode && drawKind === "polygon" ? " on" : "") + '" data-kind="polytool"><span class="li-icon">' + Icons.svg("edit", { size: 16 }) + '</span>Polygon (freehand)<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item' + (drawMode && drawKind === "polyline" ? " on" : "") + '" data-kind="linetool"><span class="li-icon">' + Icons.svg("edit", { size: 16 }) + '</span>Line (freehand)<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        Library.shapes.map(function (s) {
          return '<div class="lib-item" draggable="true" data-kind="shape" data-shape="' + s.shape + '"><span class="li-icon">' + Icons.svg("shapes", { size: 16 }) + '</span>' + s.name + '<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>";
        }).join("") + "</div>";
    } else if (activeTab === "watermark") {
      html = '<div class="lib-hint">Add a watermark, then edit its text, opacity &amp; angle in Properties.</div><div class="lib-list">' +
        '<div class="lib-item" draggable="true" data-kind="watermark" data-wmstyle="tile"><span class="li-icon">' + Icons.svg("gridDots", { size: 16 }) + '</span>Tiled Watermark<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item" draggable="true" data-kind="watermark" data-wmstyle="band"><span class="li-icon">' + Icons.svg("arrowRt", { size: 16 }) + '</span>Diagonal Banner<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        '<div class="lib-item" draggable="true" data-kind="watermark" data-wmstyle="corner"><span class="li-icon">' + Icons.svg("tag", { size: 16 }) + '</span>Corner Mark<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>" +
        "</div>";
    } else if (activeTab === "brand") {
      var assets = Store.getBrandAssets();
      html = '<div class="brand-drop" id="brandDrop"><span data-icon="upload" data-size="20"></span>' +
        '<div class="brand-drop-t">Drop brand assets here</div>' +
        '<div class="brand-drop-s">Logos, marks &amp; graphics · click to browse</div></div>' +
        (assets.length ? '<div class="brand-grid" id="brandGrid">' + assets.map(function (a) {
          return '<div class="brand-cell" draggable="true" data-brandid="' + a.id + '" title="' + UI.escapeHtml(a.name) + '">' +
            '<img src="' + a.src + '" alt="">' +
            '<button class="brand-del" data-branddel="' + a.id + '" title="Remove asset">' + Icons.svg("x", { size: 12 }) + "</button></div>";
        }).join("") + "</div>" : '<p class="lib-grid-more">No brand assets yet.</p>');
    }
    panel.innerHTML = html;
    UI.hydrateIcons(panel);
    wireLibDrag(panel);
    if (activeTab === "icons") {
      renderIconGrid();
      var si = $("iconSearch");
      if (si) si.addEventListener("input", function () { iconQuery = si.value; renderIconGrid(); });
    }
    if (activeTab === "brand") wireBrandPanel(panel);
  }
  // Brand asset panel: upload/drop images (stored globally), then click or drag
  // an asset onto the canvas to place it as an image overlay.
  var brandInput = null;
  function wireBrandPanel(panel) {
    var drop = panel.querySelector("#brandDrop");
    if (!brandInput) {
      brandInput = document.createElement("input");
      brandInput.type = "file"; brandInput.accept = "image/jpeg,image/jpg,image/png,image/webp,image/svg+xml";
      brandInput.multiple = true; brandInput.style.display = "none";
      document.body.appendChild(brandInput);
    }
    function ingest(fileList) {
      var files = Array.prototype.slice.call(fileList || []).filter(function (f) { return /image\//i.test(f.type); });
      if (!files.length) return;
      var done = 0, added = 0;
      files.forEach(function (f) {
        UI.fileToImage(f, 1200, function (im) {
          if (Store.addBrandAsset(im)) added++;
          if (++done === files.length) {
            if (added) UI.toast({ type: "success", title: added + " asset(s) added", duration: 1400 });
            else UI.toast({ type: "danger", title: "Couldn't save asset" });
            renderLib();
          }
        });
      });
    }
    if (drop) {
      drop.addEventListener("click", function () { brandInput.value = ""; brandInput.onchange = function () { ingest(brandInput.files); }; brandInput.click(); });
      drop.addEventListener("dragover", function (e) { e.preventDefault(); drop.classList.add("over"); });
      drop.addEventListener("dragleave", function () { drop.classList.remove("over"); });
      drop.addEventListener("drop", function (e) { e.preventDefault(); drop.classList.remove("over"); ingest(e.dataTransfer.files); });
    }
    panel.querySelectorAll("[data-brandid]").forEach(function (cell) {
      var id = cell.getAttribute("data-brandid");
      cell.addEventListener("click", function (e) {
        if (e.target.closest("[data-branddel]")) return;
        placeBrandAsset(id, null);
      });
      cell.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", JSON.stringify({ kind: "brandasset", brandId: id }));
        e.dataTransfer.effectAllowed = "copy";
      });
    });
    panel.querySelectorAll("[data-branddel]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        Store.deleteBrandAsset(b.getAttribute("data-branddel"));
        renderLib();
      });
    });
  }
  function placeBrandAsset(id, at) {
    if (!image) { UI.toast({ type: "warning", title: "Upload a base image first" }); return; }
    var a = Store.getBrandAssets().filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    addObject("photo", { src: a.src, w: a.w, h: a.h }, at);
  }
  // The Icons tab exposes the full Lucide set. The grid is search-filtered and
  // capped for performance; cells carry data-hydrated so UI.hydrateIcons (which
  // replaces any [data-icon] node's contents) leaves their svg + label intact.
  function renderIconGrid() {
    var grid = $("iconGrid"); if (!grid) return;
    var names = Icons.lucideNames();
    if (!names.length) { grid.innerHTML = '<p class="lib-grid-more">Icon set still loading…</p>'; return; }
    var q = iconQuery.trim().toLowerCase();
    var filtered = q ? names.filter(function (n) { return Icons.humanize(n).toLowerCase().indexOf(q) > -1; }) : names;
    var shown = filtered.slice(0, ICON_GRID_CAP);
    if (!filtered.length) { grid.innerHTML = '<p class="lib-grid-more">No icons match “' + UI.escapeHtml(iconQuery) + '”.</p>'; return; }
    grid.innerHTML = shown.map(function (n) {
      var label = Icons.humanize(n);
      return '<div class="lib-cell" draggable="true" data-kind="icon" data-icon="' + n + '" data-hydrated="1" title="' + UI.escapeHtml(label) + '">' +
        Icons.svg(n, { size: 22 }) + "<span>" + UI.escapeHtml(label) + "</span></div>";
    }).join("") +
      (filtered.length > shown.length ? '<p class="lib-grid-more">Showing ' + shown.length + " of " + filtered.length + " — refine your search to see more.</p>" : "");
    wireLibDrag(grid);
  }
  function libItemRow(icon, text, kind, opts) {
    opts = opts || {};
    var placeholder = opts.text != null ? opts.text : text;
    var extra = (opts.iconSide ? ' data-iconside="' + opts.iconSide + '" data-iconkey="' + (opts.iconKey || "Star") + '"' : "");
    return '<div class="lib-item" draggable="true" data-kind="' + kind + '" data-text="' + UI.escapeHtml(placeholder) + '"' + extra + ">" +
      '<span class="li-icon">' + Icons.svg(icon, { size: 16 }) + "</span>" + UI.escapeHtml(text) +
      '<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>";
  }
  function wireLibDrag(panel) {
    panel.querySelectorAll("[data-kind]").forEach(function (item) {
      // click to add at center
      item.addEventListener("click", function () { addFromItem(item, null); });
      // drag to drop
      item.addEventListener("dragstart", function (e) {
        lastDragItem = item;
        var payload = { kind: item.getAttribute("data-kind"), text: item.getAttribute("data-text"), icon: item.getAttribute("data-icon"), shape: item.getAttribute("data-shape"), variant: item.getAttribute("data-variant"), iconSide: item.getAttribute("data-iconside"), iconKey: item.getAttribute("data-iconkey"), wmStyle: item.getAttribute("data-wmstyle") };
        e.dataTransfer.setData("text/plain", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "copy";
        canvasWrap.classList.add("drop-active");
      });
      item.addEventListener("dragend", function () { canvasWrap.classList.remove("drop-active"); });
    });
  }
  function addFromItem(item, atImage) {
    var kind = item.getAttribute("data-kind");
    recordRecent(item);
    if (kind === "tracktool") { setDrawMode(!(drawMode && drawKind === "track"), "track"); return; }
    if (kind === "kit") { addObject("kit", { variant: item.getAttribute("data-variant") }, atImage); return; }
    if (kind === "polytool") { setDrawMode(!(drawMode && drawKind === "polygon"), "polygon"); return; }
    if (kind === "linetool") { setDrawMode(!(drawMode && drawKind === "polyline"), "polyline"); return; }
    if (kind === "datestamp") addObject("datestamp", {}, atImage);
    else if (kind === "titlebar") addObject("titlebar", {}, atImage);
    else if (kind === "textbox") addObject("textbox", {}, atImage);
    else if (kind === "legend") addObject("legend", {}, atImage);
    else if (kind === "photo") addImageObject(atImage);
    else if (kind === "label" || kind === "caption") addObject(kind, { text: item.getAttribute("data-text"), iconSide: item.getAttribute("data-iconside"), iconKey: item.getAttribute("data-iconkey") }, atImage);
    else if (kind === "icon") addObject("icon", { iconKey: item.getAttribute("data-icon") }, atImage);
    else if (kind === "shape") addObject("shape", { shapeKind: item.getAttribute("data-shape") }, atImage);
    else if (kind === "arrow") addObject("arrow", { shapeKind: item.getAttribute("data-shape") }, atImage);
    else if (kind === "watermark") addObject("watermark", { wmStyle: item.getAttribute("data-wmstyle") }, atImage);
  }
  // canvas drop target
  canvasWrap.addEventListener("dragover", function (e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
  canvasWrap.addEventListener("drop", function (e) {
    e.preventDefault(); canvasWrap.classList.remove("drop-active");
    var at = toImage(e.clientX, e.clientY);
    // Native image file dropped from the desktop → add as an inset photo.
    var files = e.dataTransfer.files;
    if (files && files.length) {
      var imgFile = Array.prototype.slice.call(files).filter(function (f) { return /image\/(jpeg|jpg|png|webp)/i.test(f.type); })[0];
      if (imgFile) { if (!image) { UI.toast({ type: "warning", title: "Upload a base image first" }); return; } UI.fileToImage(imgFile, 1200, function (im) { addObject("photo", { src: im.src, w: im.w, h: im.h }, at); }); return; }
    }
    var raw = e.dataTransfer.getData("text/plain"); if (!raw) return;
    var p; try { p = JSON.parse(raw); } catch (_) { return; }
    if (lastDragItem && p && p.kind) { recordRecent(lastDragItem); lastDragItem = null; }
    if (p.kind === "kit") addObject("kit", { variant: p.variant }, at);
    else if (p.kind === "icon") addObject("icon", { iconKey: p.icon }, at);
    else if (p.kind === "shape" || p.kind === "arrow") addObject(p.kind, { shapeKind: p.shape }, at);
    else if (p.kind === "watermark") addObject("watermark", { wmStyle: p.wmStyle }, at);
    else if (p.kind === "datestamp") addObject("datestamp", {}, at);
    else if (p.kind === "titlebar") addObject("titlebar", {}, at);
    else if (p.kind === "textbox") addObject("textbox", {}, at);
    else if (p.kind === "legend") addObject("legend", {}, at);
    else if (p.kind === "photo") addImageObject(at);
    else if (p.kind === "brandasset") placeBrandAsset(p.brandId, at);
    else addObject(p.kind, { text: p.text, iconSide: p.iconSide, iconKey: p.iconKey }, at);
  });

  UI.hydrateIcons($("libTabs"));
  $("libTabs").querySelectorAll(".lib-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      $("libTabs").querySelectorAll(".lib-tab").forEach(function (x) { x.classList.remove("on"); });
      t.classList.add("on"); activeTab = t.getAttribute("data-tab"); renderLib();
    });
  });

  /* ============================================================
     OBJECT INTERACTION (select / move / resize / rotate / edit)
  ============================================================ */
  var drag = null;
  function wireObjectEvents() {
    objLayer.querySelectorAll(".obj").forEach(function (el) {
      var id = el.getAttribute("data-id");
      el.addEventListener("pointerdown", function (e) {
        if (el.getAttribute("data-editing")) return;
        var handle = e.target.getAttribute("data-handle");
        e.stopPropagation();
        if (e.shiftKey && !handle) { toggleSelect(id); return; }
        if (!isSelected(id)) select(id);
        var o = getSel();
        if (o && o.locked) return; // locked layers can be selected but not transformed
        var start = toImage(e.clientX, e.clientY);
        if (handle === "rot") startRotate(o, e);
        else if (handle) startResize(o, handle, e);
        else startMove(o, e, start);
      });
      // double-click to edit text
      if (true) el.addEventListener("dblclick", function (e) {
        var o = S.objects.filter(function (x) { return x.id === id; })[0];
        if (o && (o.type === "label" || o.type === "caption")) { e.stopPropagation(); beginTextEdit(el, o); }
        else if (o && o.type === "textbox") { e.stopPropagation(); beginBodyEdit(el, o); }
        else if (o && o.type === "titlebar") {
          var node = e.target.closest && e.target.closest(".tb-title,.tb-sub");
          if (node) { e.stopPropagation(); beginTBEdit(el, o, node.classList.contains("tb-sub") ? "subtitle" : "title", node); }
        }
      });
    });
  }

  function startMove(o, e, start) {
    // move every selected object together (group or shift-selection)
    var movers = selectedObjects().filter(function (m) { return !m.locked; });
    if (movers.indexOf(o) === -1) movers = o.locked ? [] : [o];
    if (!movers.length) { drag = null; return; }
    var origs = movers.map(function (m) { return { o: m, x: m.x, y: m.y }; });
    drag = { mode: "move" };
    var moved = false;
    function mv(ev) {
      var cur = toImage(ev.clientX, ev.clientY);
      var dx = cur.x - start.x, dy = cur.y - start.y;
      // snap + guides are computed from the primary object, then applied as a shared delta
      var pnx = origs[0].x + dx, pny = origs[0].y + dy;
      if (S.snap) { pnx = snap(pnx); pny = snap(pny); }
      var g = (S.guides && movers.length === 1) ? applyGuides(o, pnx, pny) : { x: pnx, y: pny };
      var adx = Math.round(g.x) - origs[0].x, ady = Math.round(g.y) - origs[0].y;
      origs.forEach(function (rec) { rec.o.x = rec.x + adx; rec.o.y = rec.y + ady; updateObjEl(rec.o); });
      showEdgeGuides(movers);
      moved = true;
    }
    function up() {
      document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
      clearGuides(); clearEdgeGuides(); drag = null;
      if (moved) { pushHistory(); markDirty(); }
    }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }

  function startResize(o, handle, e) {
    drag = { mode: "resize" };
    var rot = o.rot * Math.PI / 180;
    var ux = { x: Math.cos(rot), y: Math.sin(rot) };
    var uy = { x: -Math.sin(rot), y: Math.cos(rot) };
    var c0 = { x: o.x + o.w / 2, y: o.y + o.h / 2 };
    var dir = { nw: [-.5, -.5], n: [0, -.5], ne: [.5, -.5], e: [.5, 0], se: [.5, .5], s: [0, .5], sw: [-.5, .5], w: [-.5, 0] }[handle];
    var w0 = o.w, h0 = o.h;
    var anchor = { x: c0.x + ux.x * (-dir[0] * w0) + uy.x * (-dir[1] * h0), y: c0.y + ux.y * (-dir[0] * w0) + uy.y * (-dir[1] * h0) };
    var editW = dir[0] !== 0, editH = dir[1] !== 0;
    var keepAspect = (o.type === "icon" || o.type === "photo" || o.type === "ring");
    var f0 = o.f;
    function mv(ev) {
      var p = toImage(ev.clientX, ev.clientY);
      var d = { x: p.x - anchor.x, y: p.y - anchor.y };
      var projX = d.x * ux.x + d.y * ux.y;
      var projY = d.x * uy.x + d.y * uy.y;
      var nw = editW ? Math.max(12, Math.abs(projX)) : w0;
      var nh = editH ? Math.max(12, Math.abs(projY)) : h0;
      if (keepAspect && editW && editH) { var ratio = w0 / h0; if (nw / nh > ratio) nw = nh * ratio; else nh = nw / ratio; }
      if (S.snap) { nw = Math.max(12, snap(nw)); nh = Math.max(12, snap(nh)); }
      if (Kit.autoSize(o)) { o.f = Math.max(5, Math.round(f0 * (editW ? nw / w0 : nh / h0))); Kit.fit(o); nw = o.w; nh = o.h; }
      if (Kit.heightScaled(o) && editH) o.f = Math.max(5, Math.round(f0 * nh / h0));
      if (editH && Kit.minHeight(o) && nh < Kit.minHeight(o)) nh = Kit.minHeight(o);
      if (editH) Kit.mediaResize(o, nw, nh);
      if (Kit.autoH(o)) { var _w0 = o.w; o.w = Math.round(nw); nh = Kit.heightFor(o); o.w = _w0; }
      var sgnX = dir[0] > 0 ? 1 : (dir[0] < 0 ? -1 : 0);
      var sgnY = dir[1] > 0 ? 1 : (dir[1] < 0 ? -1 : 0);
      var nc = { x: anchor.x + ux.x * (sgnX * nw / 2) + uy.x * (sgnY * nh / 2), y: anchor.y + ux.y * (sgnX * nw / 2) + uy.y * (sgnY * nh / 2) };
      o.w = Math.round(nw); o.h = Math.round(nh);
      o.x = Math.round(nc.x - nw / 2); o.y = Math.round(nc.y - nh / 2);
      snapResizeToEdges(o, dir, keepAspect);
      updateObjEl(o);
      // live update size fields
      var pw = $("propsPanel").querySelector('[data-prop="w"]'); if (pw) pw.value = o.w;
      var ph = $("propsPanel").querySelector('[data-prop="h"]'); if (ph) ph.value = o.h;
      showEdgeGuides([o]);
    }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); clearEdgeGuides(); drag = null; pushHistory(); markDirty(); }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }

  function startRotate(o, e) {
    drag = { mode: "rotate" };
    var c = { x: o.x + o.w / 2, y: o.y + o.h / 2 };
    function mv(ev) {
      var p = toImage(ev.clientX, ev.clientY);
      var ang = Math.atan2(p.y - c.y, p.x - c.x) * 180 / Math.PI + 90;
      ang = ((ang + 180) % 360) - 180;
      if (ev.shiftKey) ang = Math.round(ang / 15) * 15;
      o.rot = Math.round(ang);
      updateObjEl(o);
      var pr = $("propsPanel").querySelector('[data-prop="rot"]'); if (pr) pr.value = o.rot;
      showEdgeGuides([o]);
    }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); clearEdgeGuides(); drag = null; pushHistory(); markDirty(); }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }

  function updateObjEl(o) {
    var el = objLayer.querySelector('.obj[data-id="' + o.id + '"]');
    if (!el) return;
    el.style.left = o.x + "px"; el.style.top = o.y + "px";
    el.style.width = o.w + "px"; el.style.height = o.h + "px";
    el.style.transform = "rotate(" + o.rot + "deg)"; el.style.opacity = (o.type === "titlebar") ? 1 : o.opacity;
    // re-render content (sizes for svg etc.)
    var content = el.querySelector(".obj-content");
    if (content) {
      if (o.type === "label" || o.type === "caption") content.setAttribute("style", captionBoxStyle(o));
      else if (o.type === "titlebar") { content.setAttribute("style", tbContentStyle(o)); content.innerHTML = tbInnerHTML(o); return; }
      else if (o.type === "textbox") { content.setAttribute("style", tbxContentStyle(o)); content.innerHTML = tbxInnerHTML(o); return; }
      else if (o.type === "legend") { content.setAttribute("style", legendContentStyle(o)); content.innerHTML = legendInnerHTML(o); return; }
      else if (Kit.has(o.type)) { content.innerHTML = Kit.svg(o); return; }
      else if (o.type === "photo") { content.setAttribute("style", photoContentStyle(o)); return; }
      else if (o.type === "shape" || o.type === "polygon" || o.type === "arrow") content.style.filter = o.dropShadow ? shapeShadowCss(o).replace(/^filter:|;$/g, "") : "";
      content.innerHTML = objContentHTML(o);
    }
  }

  function beginTextEdit(el, o) {
    var textEl = el.querySelector(".obj-text");
    if (!textEl) return;
    el.setAttribute("data-editing", "1");
    textEl.setAttribute("contenteditable", "true");
    textEl.style.cursor = "text";
    textEl.focus();
    document.execCommand && document.getSelection && (function () {
      var range = document.createRange(); range.selectNodeContents(textEl);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    })();
    function finish() {
      o.text = textEl.textContent.trim() || (o.type === "label" ? "Label" : "Caption");
      textEl.removeAttribute("contenteditable");
      el.removeAttribute("data-editing");
      fitTextBox(o);
      renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); pushHistory(); markDirty();
      textEl.removeEventListener("blur", finish); textEl.removeEventListener("keydown", key);
    }
    function key(ev) { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); textEl.blur(); } ev.stopPropagation(); }
    textEl.addEventListener("blur", finish);
    textEl.addEventListener("keydown", key);
  }

  // In-place edit of a title bar's title or subtitle (double-click).
  function beginTBEdit(el, o, field, node) {
    el.setAttribute("data-editing", "1");
    node.setAttribute("contenteditable", "true"); node.style.cursor = "text"; node.focus();
    (function () { var r = document.createRange(); r.selectNodeContents(node); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); })();
    function finish() {
      o[field] = node.textContent.trim() || (field === "title" ? "Title" : "");
      node.removeAttribute("contenteditable"); el.removeAttribute("data-editing");
      renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); pushHistory(); markDirty();
      node.removeEventListener("blur", finish); node.removeEventListener("keydown", key);
    }
    function key(ev) { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); node.blur(); } ev.stopPropagation(); }
    node.addEventListener("blur", finish); node.addEventListener("keydown", key);
  }

  // In-place RICH-TEXT edit of a textbox body (double-click / panel button).
  // Body is stored as sanitized HTML; a floating toolbar drives execCommand.
  var rtEditing = null;
  function beginBodyEdit(el, o) {
    if (rtEditing) return;
    if (!o.bodyShow) { o.bodyShow = true; renderObjects(); wireObjectEvents(); el = objLayer.querySelector('.obj[data-id="' + o.id + '"]'); }
    var node = el.querySelector(".tbx-body");
    if (!node) {
      // body empty/hidden — seed a paragraph so there's something to edit
      o.body = rtHasText(o.body) ? o.body : "<p>Body text</p>";
      renderObjects(); wireObjectEvents();
      el = objLayer.querySelector('.obj[data-id="' + o.id + '"]');
      node = el.querySelector(".tbx-body");
      if (!node) return;
    }
    el.setAttribute("data-editing", "1");
    node.setAttribute("contenteditable", "true"); node.style.cursor = "text";
    node.focus();
    (function () { var r = document.createRange(); r.selectNodeContents(node); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); })();
    var tb = buildRTToolbar(node);
    positionRTToolbar(tb, el);
    var repos = function () { positionRTToolbar(tb, el); };
    canvasWrap.addEventListener("scroll", repos, true); window.addEventListener("resize", repos);
    function finish() {
      if (!rtEditing) return;
      rtEditing = null;
      o.body = rtSanitize(node.innerHTML) || "";
      node.removeAttribute("contenteditable"); el.removeAttribute("data-editing");
      tb.remove();
      canvasWrap.removeEventListener("scroll", repos, true); window.removeEventListener("resize", repos);
      document.removeEventListener("pointerdown", outside, true);
      node.removeEventListener("keydown", key);
      renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); pushHistory(); markDirty();
    }
    function outside(ev) { if (ev.target.closest("#rtToolbar") || node.contains(ev.target)) return; finish(); }
    function key(ev) {
      ev.stopPropagation();
      if (ev.key === "Escape") { ev.preventDefault(); finish(); }
    }
    node.addEventListener("keydown", key);
    rtEditing = { finish: finish };
    setTimeout(function () { document.addEventListener("pointerdown", outside, true); }, 0);
  }

  function buildRTToolbar(node) {
    var tb = document.createElement("div"); tb.id = "rtToolbar";
    var btns = [
      { ic: "bold", cmd: "bold", t: "Bold" },
      { ic: "italic", cmd: "italic", t: "Italic" },
      { ic: "underline", cmd: "underline", t: "Underline" },
      { sep: 1 },
      { ic: "listUl", cmd: "insertUnorderedList", t: "Bulleted list" },
      { ic: "listOl", cmd: "insertOrderedList", t: "Numbered list" },
      { sep: 1 },
      { ic: "text", cmd: "formatBlock", arg: "p", t: "Paragraph" }
    ];
    tb.innerHTML = btns.map(function (b) {
      if (b.sep) return '<span class="rt-sep"></span>';
      return '<button data-cmd="' + b.cmd + '"' + (b.arg ? ' data-arg="' + b.arg + '"' : "") + ' title="' + b.t + '">' + Icons.svg(b.ic, { size: 15 }) + "</button>";
    }).join("");
    document.body.appendChild(tb);
    tb.addEventListener("mousedown", function (e) { e.preventDefault(); }); // keep selection
    tb.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        node.focus();
        document.execCommand(b.getAttribute("data-cmd"), false, b.getAttribute("data-arg") || null);
        updateRTToolbarState(tb);
      });
    });
    var sync = function () { updateRTToolbarState(tb); };
    node.addEventListener("keyup", sync); node.addEventListener("mouseup", sync);
    updateRTToolbarState(tb);
    return tb;
  }
  function updateRTToolbarState(tb) {
    [["bold"], ["italic"], ["underline"], ["insertUnorderedList"], ["insertOrderedList"]].forEach(function (p) {
      var b = tb.querySelector('[data-cmd="' + p[0] + '"]'); if (!b) return;
      try { b.classList.toggle("on", document.queryCommandState(p[0])); } catch (e) {}
    });
  }
  function positionRTToolbar(tb, el) {
    var r = el.getBoundingClientRect();
    var tw = tb.offsetWidth || 240, th = tb.offsetHeight || 40;
    var left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    var top = r.top - th - 10;
    if (top < 8) top = r.bottom + 10;
    tb.style.left = Math.round(left) + "px";
    tb.style.top = Math.round(top) + "px";
  }

  // Upload a logo image for the selected title bar (stored as base64).
  function uploadTitleBarLogo(o) {
    if (!o) return;
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/png,image/jpeg,image/jpg,image/webp,image/svg+xml";
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      UI.fileToImage(f, 800, function (im) {
        o.logo = im.src; o.logoAspect = (im.w || 1) / (im.h || 1); tbFitLogo(o); renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
        UI.toast({ type: "success", title: "Logo added", duration: 1400 });
      });
    };
    inp.click();
  }

  // Open a file picker and add the chosen image as an inset photo object.
  function addImageObject(atImage) {
    if (!image) { UI.toast({ type: "warning", title: "Upload a base image first" }); return; }
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/jpeg,image/jpg,image/png,image/webp";
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      UI.fileToImage(f, 1200, function (im) { addObject("photo", { src: im.src, w: im.w, h: im.h }, atImage); });
    };
    inp.click();
  }

  // Replace the image source of an existing photo object.
  function replacePhotoSrc(o) {
    if (!o) return;
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/jpeg,image/jpg,image/png,image/webp";
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      UI.fileToImage(f, 1200, function (im) {
        o.src = im.src; renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
        UI.toast({ type: "success", title: "Image replaced", duration: 1400 });
      });
    };
    inp.click();
  }

  /* ============================================================
     FREEHAND POLYGON DRAWING
  ============================================================ */
  var drawMode = false;      // pen tool active
  var drawKind = "polygon";  // "polygon" (closed region) or "polyline" (open line)
  var polyDraw = null;       // in-progress drag trace state
  var clickDraw = null;      // in-progress click-to-place-point line state

  function setDrawMode(on, kind) {
    if (on && !image) { UI.toast({ type: "warning", title: "Upload an image first" }); return; }
    if (kind) drawKind = kind;
    drawMode = !!on;
    canvasWrap.classList.toggle("draw-mode", drawMode);
    var b = $("btnDraw"); if (b) b.classList.toggle("is-active", drawMode);
    var pt = document.querySelector('.lib-item[data-kind="polytool"]'); if (pt) pt.classList.toggle("on", drawMode && drawKind === "polygon");
    var lt = document.querySelector('.lib-item[data-kind="linetool"]'); if (lt) lt.classList.toggle("on", drawMode && drawKind === "polyline");
    var tt = document.querySelector('.lib-item[data-kind="tracktool"]'); if (tt) tt.classList.toggle("on", drawMode && drawKind === "track");
    if (drawMode) { deselect(); UI.toast({ type: "info", title: drawKind === "track" ? "Draw a track" : (drawKind === "polyline" ? "Freehand line" : "Freehand region"), desc: "Click to add points; double-click or Enter to finish.", duration: 2600 }); }
  }

  // Perpendicular-distance polyline simplification (Ramer–Douglas–Peucker).
  function simplifyPoints(pts, eps) {
    if (pts.length < 3) return pts.slice();
    var keep = new Array(pts.length); keep[0] = keep[pts.length - 1] = true;
    (function rec(s, e) {
      var maxD = -1, idx = -1, a = pts[s], b = pts[e];
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      for (var i = s + 1; i < e; i++) {
        var d = Math.abs((pts[i].x - a.x) * dy - (pts[i].y - a.y) * dx) / len;
        if (d > maxD) { maxD = d; idx = i; }
      }
      if (maxD > eps && idx > -1) { keep[idx] = true; rec(s, idx); rec(idx, e); }
    })(0, pts.length - 1);
    return pts.filter(function (_, i) { return keep[i]; });
  }

  function startPolygonDraw(e) {
    var first = toImage(e.clientX, e.clientY);
    var abs = [{ x: clamp(first.x, 0, image.w), y: clamp(first.y, 0, image.h) }];
    // live preview overlay (image-space SVG on the stage)
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "poly-preview");
    svg.setAttribute("width", image.w); svg.setAttribute("height", image.h);
    svg.setAttribute("viewBox", "0 0 " + image.w + " " + image.h);
    var fillPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    fillPoly.setAttribute("fill", drawKind === "polyline" ? "none" : "rgba(0,174,239,0.22)"); fillPoly.setAttribute("stroke", "none");
    var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("fill", "none"); line.setAttribute("stroke", "#00AEEF");
    line.setAttribute("stroke-width", Math.max(2, 3) / 1); line.setAttribute("stroke-linejoin", "round"); line.setAttribute("stroke-linecap", "round");
    line.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(fillPoly); svg.appendChild(line);
    stage.appendChild(svg);
    polyDraw = { abs: abs, svg: svg, line: line, fill: fillPoly };
    paintPreview();
    function paintPreview() {
      var str = polyDraw.abs.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");
      polyDraw.line.setAttribute("points", str);
      polyDraw.fill.setAttribute("points", str);
    }
    function mv(ev) {
      var p = toImage(ev.clientX, ev.clientY);
      p = { x: clamp(p.x, 0, image.w), y: clamp(p.y, 0, image.h) };
      var last = polyDraw.abs[polyDraw.abs.length - 1];
      var minD = Math.max(2, 3 / S.zoom);
      if (Math.hypot(p.x - last.x, p.y - last.y) >= minD) { polyDraw.abs.push(p); paintPreview(); }
    }
    function up() {
      document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
      var pts = polyDraw.abs.slice();
      if (polyDraw.svg.parentNode) polyDraw.svg.parentNode.removeChild(polyDraw.svg);
      polyDraw = null;
      finalizePolygon(pts);
    }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }

  function finalizePolygon(abs) {
    var isTrack = drawKind === "track";
    if (isTrack) { var src = abs; abs = src.filter(function (p, i) { return i === 0 || Math.hypot(p.x - src[i - 1].x, p.y - src[i - 1].y) > 4 / S.zoom; }); }
    else abs = simplifyPoints(abs, Math.max(1.5, 2 / S.zoom));
    var isLine = drawKind === "polyline" || isTrack;
    if (abs.length < 2 || (!isLine && abs.length < 3)) { UI.toast({ type: "warning", title: isLine ? "Line too short" : "Region too small", duration: 1600 }); return; }
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    abs.forEach(function (p) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
    var w = Math.max(8, maxX - minX), h = Math.max(8, maxY - minY);
    if (maxX - minX < 6 && maxY - minY < 6) { UI.toast({ type: "warning", title: isLine ? "Line too short" : "Region too small", duration: 1600 }); return; }
    var norm = abs.map(function (p) { return { x: +((p.x - minX) / w).toFixed(4), y: +((p.y - minY) / h).toFixed(4) }; });
    var o = makeObject(isTrack ? "track" : (isLine ? "polyline" : "polygon"), { points: norm });
    o.x = Math.round(minX); o.y = Math.round(minY); o.w = Math.round(w); o.h = Math.round(h);
    S.objects.push(o); select(o.id); pushHistory(); markDirty();
    setDrawMode(false);
  }

  // Click-to-place-point line drawing. Each canvas click adds a vertex; a
  // rubber-band segment follows the cursor; double-click / Enter finishes.
  function addClickPoint(e) {
    var p = toImage(e.clientX, e.clientY);
    p = { x: clamp(p.x, 0, image.w), y: clamp(p.y, 0, image.h) };
    if (!clickDraw) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "poly-preview");
      svg.setAttribute("width", image.w); svg.setAttribute("height", image.h);
      svg.setAttribute("viewBox", "0 0 " + image.w + " " + image.h);
      var fill = null;
      if (drawKind === "polygon") {
        fill = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        fill.setAttribute("fill", "rgba(0,174,239,0.22)"); fill.setAttribute("stroke", "none");
        svg.appendChild(fill);
      }
      var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("fill", "none"); line.setAttribute("stroke", "#00AEEF");
      line.setAttribute("stroke-width", "3"); line.setAttribute("stroke-linejoin", "round"); line.setAttribute("stroke-linecap", "round");
      line.setAttribute("vector-effect", "non-scaling-stroke");
      var dots = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svg.appendChild(line); svg.appendChild(dots);
      stage.appendChild(svg);
      var mv = function (ev) { paintClick(toImage(ev.clientX, ev.clientY)); };
      document.addEventListener("pointermove", mv);
      clickDraw = { abs: [], svg: svg, line: line, fill: fill, dots: dots, mv: mv };
    }
    clickDraw.abs.push(p);
    paintClick(p);
  }
  function paintClick(tip) {
    if (!clickDraw) return;
    var pts = clickDraw.abs.slice();
    if (tip) pts.push(tip);
    var str = pts.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");
    clickDraw.line.setAttribute("points", str);
    if (clickDraw.fill) clickDraw.fill.setAttribute("points", str);
    clickDraw.dots.innerHTML = clickDraw.abs.map(function (p) {
      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (3.5 / S.zoom) + '" fill="#00AEEF"/>';
    }).join("");
  }
  function cancelClickLine() {
    if (!clickDraw) return;
    document.removeEventListener("pointermove", clickDraw.mv);
    if (clickDraw.svg.parentNode) clickDraw.svg.parentNode.removeChild(clickDraw.svg);
    clickDraw = null;
  }
  function finishClickLine() {
    if (!clickDraw) return;
    var pts = clickDraw.abs.slice();
    cancelClickLine();
    finalizePolygon(pts);
  }

  /* ============================================================
     PAN + ZOOM (background)
  ============================================================ */
  var panning = null, spaceDown = false;
  viewport.addEventListener("pointerdown", function (e) {
    if (cropMode) return;
    if (e.target.closest(".obj")) return;
    if (drawMode && image && e.button === 0 && !spaceDown) {
      e.preventDefault();
      addClickPoint(e); return;
    }
    if (e.button === 1 || spaceDown || e.button === 0) {
      // background click = deselect; also begin pan
      if (e.button === 0 && !spaceDown) deselect();
      panning = { x: e.clientX, y: e.clientY, px: S.panX, py: S.panY, moved: false };
      viewport.classList.add("panning");
      viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
    }
  });
  viewport.addEventListener("dblclick", function (e) {
    if (clickDraw) { e.preventDefault(); if (clickDraw.abs.length > 2) clickDraw.abs.pop(); finishClickLine(); }
  });
  viewport.addEventListener("pointermove", function (e) {
    if (!panning) return;
    S.panX = panning.px + (e.clientX - panning.x);
    S.panY = panning.py + (e.clientY - panning.y);
    panning.moved = true; applyTransform();
  });
  function endPan(e) { if (panning) { panning = null; viewport.classList.remove("panning"); } }
  viewport.addEventListener("pointerup", endPan);
  viewport.addEventListener("pointerleave", endPan);

  canvasWrap.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey || true) {
      var factor = e.deltaY < 0 ? 1.12 : 0.893;
      zoomAt(factor, e.clientX, e.clientY);
    }
  }, { passive: false });

  /* ============================================================
     CROP (base image) — modal overlay in image space
  ============================================================ */
  var cropMode = false, cropRect = null, cropAspect = null;
  var cropOverlay = null, cropBar = null, cropDrag = null;
  var CROP_MIN = 24;

  function toggleCropMode() {
    if (cropMode) { exitCropMode(); return; }
    enterCropMode();
  }
  function enterCropMode() {
    if (!image) { UI.toast({ type: "warning", title: "Upload an image first" }); return; }
    if (cvMode) exitCanvasMode();
    if (!canvasMatches()) { UI.toast({ type: "warning", title: "Match the canvas to the image first", desc: "Cropping works on the image itself. Deselect everything and use Match image in Canvas." }); return; }
    if (drawMode) setDrawMode(false);
    deselect();
    cropMode = true; cropAspect = null;
    var inset = Math.round(Math.min(image.w, image.h) * 0.08);
    cropRect = { x: inset, y: inset, w: image.w - inset * 2, h: image.h - inset * 2 };
    buildCropOverlay(); buildCropBar();
    canvasWrap.classList.add("crop-mode");
    $("btnCrop").classList.add("is-active");
    UI.toast({ type: "info", title: "Crop image", desc: "Drag the handles, then Apply. Esc to cancel.", duration: 2600 });
  }
  function exitCropMode() {
    cropMode = false; cropDrag = null;
    if (cropOverlay) { cropOverlay.remove(); cropOverlay = null; }
    if (cropBar) { cropBar.remove(); cropBar = null; }
    canvasWrap.classList.remove("crop-mode");
    var b = $("btnCrop"); if (b) b.classList.remove("is-active");
  }

  function buildCropOverlay() {
    cropOverlay = document.createElement("div");
    cropOverlay.id = "cropOverlay";
    var handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
      .map(function (h) { return '<div class="crop-h crop-' + h + '" data-h="' + h + '"></div>'; }).join("");
    cropOverlay.innerHTML =
      '<div class="crop-shade" data-s="top"></div><div class="crop-shade" data-s="bottom"></div>' +
      '<div class="crop-shade" data-s="left"></div><div class="crop-shade" data-s="right"></div>' +
      '<div class="crop-box" data-h="move">' +
        '<div class="crop-thirds"><i class="v v1"></i><i class="v v2"></i><i class="h h1"></i><i class="h h2"></i></div>' +
        '<div class="crop-dims"></div>' + handles +
      "</div>";
    stage.appendChild(cropOverlay);
    cropOverlay.addEventListener("pointerdown", onCropDown);
    updateCropOverlay();
  }
  function setBox(el, x, y, w, h) {
    if (!el) return;
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.width = Math.max(0, w) + "px"; el.style.height = Math.max(0, h) + "px";
  }
  function updateCropOverlay() {
    if (!cropOverlay) return;
    var r = cropRect, W = image.w, H = image.h;
    var q = function (s) { return cropOverlay.querySelector('.crop-shade[data-s="' + s + '"]'); };
    setBox(q("top"), 0, 0, W, r.y);
    setBox(q("bottom"), 0, r.y + r.h, W, H - (r.y + r.h));
    setBox(q("left"), 0, r.y, r.x, r.h);
    setBox(q("right"), r.x + r.w, r.y, W - (r.x + r.w), r.h);
    setBox(cropOverlay.querySelector(".crop-box"), r.x, r.y, r.w, r.h);
    cropOverlay.querySelector(".crop-dims").textContent = Math.round(r.w) + " × " + Math.round(r.h);
  }

  function onCropDown(e) {
    var t = e.target.closest("[data-h]");
    if (!t) return;
    e.preventDefault(); e.stopPropagation();
    var p = toImage(e.clientX, e.clientY);
    cropDrag = { h: t.getAttribute("data-h"), sx: p.x, sy: p.y, r: { x: cropRect.x, y: cropRect.y, w: cropRect.w, h: cropRect.h } };
    window.addEventListener("pointermove", onCropMove);
    window.addEventListener("pointerup", onCropUp);
  }
  function onCropMove(e) {
    if (!cropDrag) return;
    var p = toImage(e.clientX, e.clientY);
    if (cropDrag.h === "move") moveCrop(p.x - cropDrag.sx, p.y - cropDrag.sy);
    else if (cropAspect) resizeCropCorner(cropDrag.h, p.x, p.y);
    else resizeCropFree(cropDrag.h, p.x, p.y);
    updateCropOverlay();
  }
  function onCropUp() {
    cropDrag = null;
    window.removeEventListener("pointermove", onCropMove);
    window.removeEventListener("pointerup", onCropUp);
  }
  function moveCrop(dx, dy) {
    var r0 = cropDrag.r;
    cropRect.x = clamp(r0.x + dx, 0, image.w - r0.w);
    cropRect.y = clamp(r0.y + dy, 0, image.h - r0.h);
    cropRect.w = r0.w; cropRect.h = r0.h;
  }
  function resizeCropFree(h, px, py) {
    var r0 = cropDrag.r;
    var x1 = r0.x, y1 = r0.y, x2 = r0.x + r0.w, y2 = r0.y + r0.h;
    if (h.indexOf("w") >= 0) x1 = clamp(px, 0, x2 - CROP_MIN);
    if (h.indexOf("e") >= 0) x2 = clamp(px, x1 + CROP_MIN, image.w);
    if (h.indexOf("n") >= 0) y1 = clamp(py, 0, y2 - CROP_MIN);
    if (h.indexOf("s") >= 0) y2 = clamp(py, y1 + CROP_MIN, image.h);
    cropRect = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  function resizeCropCorner(h, px, py) {
    var r0 = cropDrag.r;
    var west = h.indexOf("w") >= 0, north = h.indexOf("n") >= 0;
    var ax = west ? r0.x + r0.w : r0.x;       // anchor = opposite corner
    var ay = north ? r0.y + r0.h : r0.y;
    var dirX = west ? -1 : 1, dirY = north ? -1 : 1;
    var availX = dirX > 0 ? image.w - ax : ax;
    var availY = dirY > 0 ? image.h - ay : ay;
    var maxW = Math.min(availX, availY * cropAspect);
    var w = clamp((px - ax) * dirX, CROP_MIN, Math.max(CROP_MIN, maxW));
    var hh = w / cropAspect;
    cropRect = { x: dirX > 0 ? ax : ax - w, y: dirY > 0 ? ay : ay - hh, w: w, h: hh };
  }

  function buildCropBar() {
    cropBar = document.createElement("div");
    cropBar.id = "cropBar";
    var presets = [["Free", ""], ["Original", "orig"], ["1:1", "1"], ["16:9", "1.7778"], ["4:3", "1.3333"], ["3:2", "1.5"]];
    cropBar.innerHTML =
      '<span class="crop-bar-label">' + Icons.svg("crop", { size: 15 }) + "Crop</span>" +
      '<div class="crop-ratios">' + presets.map(function (p) {
        return '<button class="crop-ratio" data-ratio="' + p[1] + '">' + p[0] + "</button>";
      }).join("") + "</div>" +
      '<button class="btn btn--ghost btn--sm" data-crop="cancel">Cancel</button>' +
      '<button class="btn btn--primary btn--sm" data-crop="apply">' + Icons.svg("check", { size: 15 }) + "Apply crop</button>";
    canvasWrap.appendChild(cropBar);
    cropBar.querySelectorAll("[data-ratio]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-ratio");
        setCropAspect(v === "" ? null : (v === "orig" ? image.w / image.h : parseFloat(v)));
      });
    });
    cropBar.querySelector('[data-crop="cancel"]').addEventListener("click", exitCropMode);
    cropBar.querySelector('[data-crop="apply"]').addEventListener("click", applyCrop);
    updateCropBarActive();
  }
  function setCropAspect(a) {
    cropAspect = a;
    cropOverlay.classList.toggle("locked", !!a);
    if (a) {
      var W = image.w, H = image.h;
      var w = W, hh = w / a;
      if (hh > H) { hh = H; w = hh * a; }
      w *= 0.9; hh *= 0.9;
      var cx = cropRect.x + cropRect.w / 2, cy = cropRect.y + cropRect.h / 2;
      cropRect = { x: clamp(cx - w / 2, 0, W - w), y: clamp(cy - hh / 2, 0, H - hh), w: w, h: hh };
    }
    updateCropOverlay(); updateCropBarActive();
  }
  function updateCropBarActive() {
    if (!cropBar) return;
    cropBar.querySelectorAll("[data-ratio]").forEach(function (b) {
      var v = b.getAttribute("data-ratio");
      var on = (v === "" && !cropAspect) ||
        (v === "orig" && cropAspect && Math.abs(cropAspect - image.w / image.h) < 0.002) ||
        (v !== "" && v !== "orig" && cropAspect && Math.abs(cropAspect - parseFloat(v)) < 0.002);
      b.classList.toggle("on", !!on);
    });
  }

  function applyCrop() {
    if (!cropMode) return;
    var r = { x: Math.round(cropRect.x), y: Math.round(cropRect.y), w: Math.round(cropRect.w), h: Math.round(cropRect.h) };
    r.x = clamp(r.x, 0, image.w - 1); r.y = clamp(r.y, 0, image.h - 1);
    r.w = clamp(r.w, 1, image.w - r.x); r.h = clamp(r.h, 1, image.h - r.y);
    if (r.w < 8 || r.h < 8) { UI.toast({ type: "warning", title: "Crop area too small" }); return; }
    if (r.x === 0 && r.y === 0 && r.w === image.w && r.h === image.h) { exitCropMode(); return; }
    var base = new Image();
    base.onload = function () {
      var cnv = document.createElement("canvas");
      cnv.width = r.w; cnv.height = r.h;
      cnv.getContext("2d").drawImage(base, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      var newSrc = cnv.toDataURL("image/png");
      // shift every annotation into the new crop origin
      S.objects.forEach(function (o) { o.x = Math.round((o.x || 0) - r.x); o.y = Math.round((o.y || 0) - r.y); });
      image.w = r.w; image.h = r.h; image.bw = r.w; image.bh = r.h; image.bx = 0; image.by = 0; image.canvas = null; image.src = newSrc;
      Store.updateImage(projectId, imageId, { src: newSrc, w: r.w, h: r.h, canvas: null });
      exitCropMode();
      stageImg.onload = function () {
        stageImg.style.width = image.w + "px"; stageImg.style.height = image.h + "px";
        stage.style.width = image.w + "px"; stage.style.height = image.h + "px";
        drawGrid(); fitToScreen(); renderObjects(); wireObjectEvents();
        // crop rewrites the base image + object coords, so reset the undo baseline
        history.length = 0; history.push(snapshot()); future = []; updateUndoButtons();
        renderProps(); renderLayers(); markDirty();
      };
      stageImg.src = newSrc;
      UI.toast({ type: "success", title: "Image cropped", desc: r.w + " × " + r.h + " px" });
    };
    base.src = image.src;
  }

  /* ============================================================
     HISTORY (undo / redo)
  ============================================================ */
  function snapshot() { return JSON.stringify({ o: S.objects, c: image ? (canvasOf(image) || null) : null }); }
  function pushHistory() {
    history.push(snapshot());
    if (history.length > HIST_LIMIT) history.shift();
    future = [];
    updateUndoButtons();
  }
  function undo() {
    if (history.length < 2) { if (history.length === 1) { /* revert to empty baseline */ } return; }
    future.push(history.pop());
    restoreSnap(history[history.length - 1]);
    S.selected = null; S.selectedIds = []; renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); markDirty(); updateUndoButtons();
  }
  function redo() {
    if (!future.length) return;
    var state = future.pop(); history.push(state);
    restoreSnap(state);
    S.selected = null; S.selectedIds = []; renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); markDirty(); updateUndoButtons();
  }
  function updateUndoButtons() {
    $("btnUndo").disabled = history.length < 2;
    $("btnRedo").disabled = future.length === 0;
  }

  /* ============================================================
     SAVE / AUTOSAVE
  ============================================================ */
  var autosaveTimer = null, dirtyTimer = null;
  function markDirty() {
    S.dirty = true;
    setAutosaveState("dirty", "Unsaved");
    clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(function () { if (settings.autosave) save(true); }, 1200);
  }
  function setAutosaveState(cls, text) {
    var ind = $("autosaveInd"); ind.className = "autosave-ind " + (cls || "");
    $("autosaveText").textContent = text;
  }
  function save(silent) {
    if (!image) return;
    setAutosaveState("saving", "Saving…");
    Store.saveImageObjects(projectId, imageId, S.objects);
    Store.pushRecent({ projectId: projectId, imageId: imageId, filename: image.filename, projectName: project.name });
    S.dirty = false;
    scheduleThumb();
    setTimeout(function () { setAutosaveState("", "Saved"); }, 350);
    if (!silent) UI.toast({ type: "success", title: "Saved", duration: 1400 });
  }
  function saveAs() {
    if (!image) return;
    // persist current first, then duplicate
    Store.saveImageObjects(projectId, imageId, S.objects);
    var copy = Store.duplicateImage(projectId, imageId);
    if (copy) {
      UI.toast({ type: "success", title: "Saved as copy", desc: copy.filename });
      Store.flush(function () { location.href = "editor.html?project=" + projectId + "&image=" + copy.id; });
    }
  }
  // autosave interval (per settings)
  function startAutosave() {
    if (autosaveTimer) clearInterval(autosaveTimer);
    if (settings.autosave) autosaveTimer = setInterval(function () { if (S.dirty) save(true); }, (settings.autosaveInterval || 30) * 1000);
  }
  // Persist layers reliably when leaving. A background write dies with the
  // page, so use a keepalive beacon. Also save when the tab is hidden
  // (covers mobile/app-switch, where beforeunload may not fire).
  function persistOnLeave() {
    if (S.dirty && image) { Store.saveImageObjectsBeacon(projectId, imageId, S.objects); S.dirty = false; }
  }
  window.addEventListener("beforeunload", persistOnLeave);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") persistOnLeave(); });

  /* ============================================================
     EXPORT (render to canvas)
  ============================================================ */
  function exportImage(format) {
    if (!image) return;
    var canvas = document.createElement("canvas");
    canvas.width = image.w; canvas.height = image.h;
    var ctx = canvas.getContext("2d");
    var base = new Image();
    base.onload = function () {
      var cbg = image.canvasBg && image.canvasBg !== "transparent" ? image.canvasBg : (format === "jpeg" ? "#0B1220" : null);
      if (cbg) { ctx.fillStyle = cbg; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(base, image.bx || 0, image.by || 0, image.bw || image.w, image.bh || image.h);
      var ordered = S.objects.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
      // render objects sequentially (svg objects need async image load)
      var i = 0;
      function next() {
        if (i >= ordered.length) { finish(); return; }
        var o = ordered[i]; i++;
        drawObject(ctx, o, next);
      }
      function finish() {
        var mime = format === "jpeg" ? "image/jpeg" : (format === "webp" ? "image/webp" : "image/png");
        var url = canvas.toDataURL(mime, format === "png" ? undefined : 0.92);
        if (format === "webp" && url.indexOf("data:image/webp") !== 0) {   // e.g. Safari: no WEBP encoder
          format = "png"; url = canvas.toDataURL("image/png");
          UI.toast({ type: "warning", title: "This browser can’t create WEBP", desc: "Saved as PNG instead." });
        }
        var a = document.createElement("a");
        a.href = url;
        a.download = image.filename.replace(/\.[^.]+$/, "") + "-annotated." + (format === "jpeg" ? "jpg" : (format === "webp" ? "webp" : "png"));
        document.body.appendChild(a); a.click(); a.remove();
        UI.toast({ type: "success", title: "Exported " + format.toUpperCase(), desc: a.download });
      }
      next();
    };
    base.src = image.src;
  }

  function drawObject(ctx, o, done) {
    ctx.save();
    var cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.translate(cx, cy); ctx.rotate(o.rot * Math.PI / 180); ctx.globalAlpha = (o.type === "titlebar") ? 1 : o.opacity;
    var x = -o.w / 2, y = -o.h / 2;
    if (o.type === "label" || o.type === "caption") {
      drawTextBox(ctx, o, x, y, function () { ctx.restore(); done(); });
    } else if (o.type === "titlebar") {
      drawTitleBar(ctx, o, x, y, function () { ctx.restore(); done(); });
    } else if (o.type === "textbox") {
      drawTextbox(ctx, o, x, y); ctx.restore(); done();
    } else if (o.type === "legend") {
      drawLegend(ctx, o, x, y); ctx.restore(); done();
    } else if (Kit.has(o.type)) {
      Kit.draw(ctx, o, x, y, function () { ctx.restore(); done(); });
    } else if (o.type === "photo") {
      drawPhoto(ctx, o, x, y, function () { ctx.restore(); done(); });
    } else {
      // rasterize the object's SVG
      var svg = (o.type === "icon")
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="' + o.w + '" height="' + o.h + '" viewBox="0 0 24 24" fill="' + (iconFilled(o.iconKey) ? o.color : "none") + '" stroke="' + (iconFilled(o.iconKey) ? "none" : o.color) + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + Icons.inner(o.iconKey) + "</svg>"
        : '<svg xmlns="http://www.w3.org/2000/svg" width="' + o.w + '" height="' + o.h + '">' + (o.type === "shape" ? shapeInner(o) : (o.type === "polygon" ? polygonInner(o) : (o.type === "polyline" ? polylineInner(o) : (o.type === "watermark" ? watermarkInner(o) : arrowInner(o))))) + "</svg>";
      var img = new Image();
      img.onload = function () {
        if ((o.type === "shape" || o.type === "polygon" || o.type === "arrow") && o.dropShadow) { var sp = shadowParams(o); ctx.shadowColor = "rgba(0,0,0," + shA(o, 0.5) + ")"; ctx.shadowBlur = sp.blur; ctx.shadowOffsetY = sp.dy; }
        if (o.type === "arrow" && (o.flipX || o.flipY)) {
          var cxf = x + o.w / 2, cyf = y + o.h / 2;
          ctx.translate(cxf, cyf); ctx.scale(o.flipX ? -1 : 1, o.flipY ? -1 : 1); ctx.translate(-cxf, -cyf);
        }
        ctx.drawImage(img, x, y, o.w, o.h); ctx.restore(); done();
      };
      img.onerror = function () { ctx.restore(); done(); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
  }
  // strip outer <svg> wrapper for export (we add namespaced one)
  function shapeInner(o) { return shapeSVG(o).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }
  function polygonInner(o) { return polygonSVG(o).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }
  function polylineInner(o) { return polylineSVG(o).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }
  function arrowInner(o) { return arrowSVG(o).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }
  function watermarkInner(o) { return watermarkSVG(o).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }

  // Render a textbox (Title / Subtitle / Body) onto the export canvas.
  // Wrap styled runs into lines within maxW. Returns array of lines; each line is
  // an array of segments {text,b,i,u}. Honors {br:true} run separators.
  function wrapRuns(ctx, runs, maxW, size, weight, font) {
    var lines = [], cur = [], curW = 0;
    function fontFor(b, i) { return (i ? "italic " : "") + (b ? Math.max(weight, 700) : weight) + " " + size + "px '" + font + "', sans-serif"; }
    function nl() { lines.push(cur); cur = []; curW = 0; }
    (runs || []).forEach(function (run) {
      if (run.br) { nl(); return; }
      if (run.text == null) return;
      ctx.font = fontFor(run.b, run.i);
      run.text.split(/(\s+)/).forEach(function (tok) {
        if (tok === "") return;
        var tw = ctx.measureText(tok).width;
        if (curW + tw > maxW && curW > 0 && /\S/.test(tok)) nl();
        var last = cur[cur.length - 1];
        if (last && last.b === !!run.b && last.i === !!run.i && last.u === !!run.u) last.text += tok;
        else cur.push({ text: tok, b: !!run.b, i: !!run.i, u: !!run.u });
        curW += tw;
      });
    });
    if (cur.length) nl();
    return lines;
  }

  function drawTextbox(ctx, o, x, y) {
    var r = Math.min(o.radius, o.w / 2, o.h / 2);
    if (o.dropShadow) { ctx.save(); ctx.shadowColor = "rgba(0,0,0," + shA(o, 0.45) + ")"; ctx.shadowBlur = Math.round(o.h * 0.34 + 8); ctx.shadowOffsetY = Math.round(o.h * 0.14 + 3); }
    if (o.bg && o.bg !== "transparent") { ctx.fillStyle = hexRgba(o.bg, o.bgOpacity == null ? 1 : o.bgOpacity); roundRect(ctx, x, y, o.w, o.h, r); ctx.fill(); }
    if (o.dropShadow) ctx.restore();
    if (o.borderWidth) { ctx.strokeStyle = hexRgba(o.borderColor, o.borderOpacity); ctx.lineWidth = o.borderWidth; applyCanvasDash(ctx, o, o.borderWidth); roundRect(ctx, x, y, o.w, o.h, r); ctx.stroke(); ctx.setLineDash([]); }

    var pad = Math.round((o.bodySize || 14) * 0.9);
    var fieldGap = Math.round((o.bodySize || 14) * 0.35);
    var maxW = o.w - pad * 2;
    function fontStr(size, weight, italic, font) { return (italic ? "italic " : "") + weight + " " + size + "px '" + font + "', sans-serif"; }

    // Flatten title, subtitle and rich body into a single list of render lines.
    var lines = [];
    ["title", "subtitle"].forEach(function (key) {
      var f = TBX_FIELDS.filter(function (x) { return x.key === key; })[0];
      if (!o[f.show] || !String(o[f.key] || "").trim()) return;
      var size = o[f.size], fnt = fontStr(size, o[f.weight], o[f.italic], o[f.font]);
      ctx.font = fnt;
      String(o[f.key]).split(/\r?\n/).forEach(function (para) {
        wrapText(ctx, para, maxW).forEach(function (ln) {
          lines.push({ segs: [{ text: ln, font: fnt, fill: o[f.color], size: size, u: false }], lh: size * 1.3 });
        });
      });
      if (lines.length) lines[lines.length - 1].gapAfter = fieldGap;
    });

    if (o.bodyShow && rtHasText(o.body)) {
      var bs = o.bodySize, bw = o.bodyWeight, bf = o.bodyFont, bc = o.bodyColor, blh = bs * 1.3;
      var paraGap = Math.round(bs * 0.5);
      var blocks = rtBlocks(o.body);
      blocks.forEach(function (blk, bi) {
        var marker = blk.kind === "bullet" ? "•\u2002" : (blk.kind === "number" ? blk.num + ".\u2002" : null);
        ctx.font = fontStr(bs, bw, false, bf);
        var indent = marker ? ctx.measureText(marker).width : 0;
        var wrapped = wrapRuns(ctx, blk.runs, maxW - indent, bs, bw, bf);
        if (!wrapped.length) wrapped = [[]];
        wrapped.forEach(function (segRuns, li) {
          var segs = segRuns.map(function (rn) {
            return { text: rn.text, font: fontStr(bs, rn.b ? Math.max(bw, 700) : bw, rn.i, bf), fill: bc, size: bs, u: rn.u };
          });
          lines.push({ segs: segs, lh: blh, marker: li === 0 ? marker : null, markerFont: fontStr(bs, bw, false, bf), markerFill: bc, indent: marker ? indent : 0 });
        });
        if (bi < blocks.length - 1 && lines.length) lines[lines.length - 1].gapAfter = paraGap;
      });
    }

    var totalH = lines.reduce(function (s, l) { return s + l.lh + (l.gapAfter || 0); }, 0);
    var cy = y + o.h / 2 - totalH / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, o.w, o.h); ctx.clip();
    ctx.textBaseline = "top"; ctx.textAlign = "left";
    lines.forEach(function (l) {
      var lineW = 0;
      l.segs.forEach(function (s) { ctx.font = s.font; lineW += ctx.measureText(s.text).width; });
      var markerW = 0;
      if (l.marker) { ctx.font = l.markerFont; markerW = ctx.measureText(l.marker).width; }
      var markerX, segX;
      if (o.align === "right") { segX = x + o.w - pad - lineW; markerX = segX - markerW; }
      else if (o.align === "center") { var tot = lineW + markerW; markerX = x + o.w / 2 - tot / 2; segX = markerX + markerW; }
      else { markerX = x + pad; segX = x + pad + (l.indent || 0); }
      if (l.marker) { ctx.font = l.markerFont; ctx.fillStyle = l.markerFill; ctx.fillText(l.marker, markerX, cy); }
      var dx = segX;
      l.segs.forEach(function (s) {
        ctx.font = s.font; ctx.fillStyle = s.fill;
        ctx.fillText(s.text, dx, cy);
        var w = ctx.measureText(s.text).width;
        if (s.u) { var uy = cy + s.size * 1.02; ctx.strokeStyle = s.fill; ctx.lineWidth = Math.max(1, s.size * 0.07); ctx.beginPath(); ctx.moveTo(dx, uy); ctx.lineTo(dx + w, uy); ctx.stroke(); }
        dx += w;
      });
      cy += l.lh + (l.gapAfter || 0);
    });
    ctx.restore();
  }

  // Render a legend (inline pill or stacked key) onto the export canvas.
  function drawLegend(ctx, o, x, y) {
    var r = Math.min(o.radius, o.w / 2, o.h / 2);
    if (o.bg && o.bg !== "transparent") { ctx.fillStyle = hexRgba(o.bg, o.bgOpacity == null ? 1 : o.bgOpacity); roundRect(ctx, x, y, o.w, o.h, r); ctx.fill(); }
    if (o.borderWidth) { ctx.strokeStyle = hexRgba(o.borderColor, o.borderOpacity); ctx.lineWidth = o.borderWidth; applyCanvasDash(ctx, o, o.borderWidth); roundRect(ctx, x, y, o.w, o.h, r); ctx.stroke(); ctx.setLineDash([]); }
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, o.w, o.h); ctx.clip();
    var dotGap = Math.round(o.dotSize * 0.55);
    var font = o.labelWeight + " " + o.labelSize + "px '" + o.font + "', sans-serif";
    ctx.font = font; ctx.textBaseline = "middle";
    var dotR = o.dotSize / 2;
    function drawItem(it, ix, iy) {
      // dot
      ctx.fillStyle = it.color;
      if (o.dotShape === "square") {
        var rr = Math.round(o.dotSize * 0.22);
        roundRect(ctx, ix, iy - dotR, o.dotSize, o.dotSize, rr); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(ix + dotR, iy, dotR, 0, Math.PI * 2); ctx.fill();
      }
      // text
      ctx.fillStyle = o.labelColor; ctx.textAlign = "left";
      ctx.fillText(legendItemText(o, it), ix + o.dotSize + dotGap, iy + 1);
    }
    if (o.layout === "stacked") {
      var lineH = Math.max(Math.round(o.labelSize * 1.35), o.dotSize);
      var vGap = Math.round(o.itemGap * 0.5);
      var cy = y + o.padY;
      o.items.forEach(function (it) {
        drawItem(it, x + o.padX, cy + lineH / 2);
        cy += lineH + vGap;
      });
    } else {
      var cyc = y + o.h / 2;
      var cx = x + o.padX;
      o.items.forEach(function (it) {
        drawItem(it, cx, cyc);
        cx += legendItemW(o, it) + o.itemGap;
      });
    }
    ctx.restore();
  }

  // Render an inset photo (rounded, optional border + drop shadow) onto export canvas.
  function drawPhoto(ctx, o, x, y, cb) {
    var r = Math.min(o.radius, o.w / 2, o.h / 2);
    var img = new Image();
    img.onload = function () {
      // Drop shadow: cast from a filled rounded rect behind the (opaque) image.
      if (o.dropShadow) {
        var sp = shadowParams(o);
        ctx.save(); ctx.shadowColor = "rgba(0,0,0," + shA(o, 0.5) + ")"; ctx.shadowBlur = sp.blur; ctx.shadowOffsetY = sp.dy;
        ctx.fillStyle = "#000"; roundRect(ctx, x, y, o.w, o.h, r); ctx.fill(); ctx.restore();
      }
      ctx.save(); roundRect(ctx, x, y, o.w, o.h, r); ctx.clip();
      // object-fit: cover
      var ir = img.width / img.height, dr = o.w / o.h, sw, sh, sx, sy;
      if (ir > dr) { sh = img.height; sw = sh * dr; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / dr; sx = 0; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, o.w, o.h);
      ctx.restore();
      if (o.borderWidth) {
        ctx.strokeStyle = o.borderColor; ctx.lineWidth = o.borderWidth; applyCanvasDash(ctx, o, o.borderWidth);
        roundRect(ctx, x + o.borderWidth / 2, y + o.borderWidth / 2, o.w - o.borderWidth, o.h - o.borderWidth, Math.max(0, r - o.borderWidth / 2));
        ctx.stroke(); ctx.setLineDash([]);
      }
      cb();
    };
    img.onerror = function () { cb(); };
    img.src = o.src;
  }

  // Render a title bar onto the export canvas (async — logo image may load).
  function drawTitleBar(ctx, o, x, y, cb) {
    var m = tbMetrics(o);
    var r = Math.min(o.radius, o.w / 2, o.h / 2);
    // background
    if (o.bg && o.bg !== "transparent") { ctx.fillStyle = hexRgba(o.bg, o.bgOpacity); roundRect(ctx, x, y, o.w, o.h, r); ctx.fill(); }
    if (o.borderWidth) { ctx.strokeStyle = hexRgba(o.borderColor, o.borderOpacity); ctx.lineWidth = o.borderWidth; applyCanvasDash(ctx, o, o.borderWidth); roundRect(ctx, x, y, o.w, o.h, r); ctx.stroke(); ctx.setLineDash([]); }
    function drawText() {
      var tx = x + m.pad;
      ctx.save();
      var textW = o.showLogo ? (o.w - m.pad * 2 - m.logoW - m.gap) : (o.w - m.pad * 2);
      ctx.beginPath(); ctx.rect(x + m.pad, y, Math.max(0, textW), o.h); ctx.clip();
      ctx.textAlign = "left"; ctx.fillStyle = o.color;
      var cyc = y + o.h / 2;
      if (o.subtitle) {
        ctx.textBaseline = "bottom";
        ctx.font = "700 " + m.titleSize + "px '" + (o.titleFont || o.font) + "', sans-serif";
        ctx.fillText(o.title, tx, cyc - 1);
        var a = ctx.globalAlpha; ctx.globalAlpha = a * 0.72;
        ctx.textBaseline = "top";
        ctx.font = "500 " + m.subSize + "px '" + (o.subtitleFont || o.font) + "', sans-serif";
        ctx.fillText(o.subtitle, tx, cyc + 3);
        ctx.globalAlpha = a;
      } else {
        ctx.textBaseline = "middle";
        ctx.font = "700 " + m.titleSize + "px '" + (o.titleFont || o.font) + "', sans-serif";
        ctx.fillText(o.title, tx, cyc);
      }
      ctx.restore();
      cb();
    }
    if (!o.showLogo) { drawText(); return; }
    var lx = x + o.w - m.pad - m.logoW, ly = y + (o.h - m.logoSize) / 2, lr = Math.round(m.logoSize * (o.logo ? 0.16 : 0.22));
    if (o.logo) {
      var img = new Image();
      img.onload = function () {
        ctx.save(); roundRect(ctx, lx, ly, m.logoW, m.logoSize, lr); ctx.clip();
        // contain (preserve aspect ratio) within the square logo box
        var iw = img.naturalWidth || m.logoSize, ih = img.naturalHeight || m.logoSize;
        var scale = Math.min(m.logoW / iw, m.logoSize / ih);
        var dw = iw * scale, dh = ih * scale;
        ctx.drawImage(img, lx + (m.logoW - dw) / 2, ly + (m.logoSize - dh) / 2, dw, dh);
        ctx.restore(); drawText();
      };
      img.onerror = function () { drawText(); };
      img.src = o.logo;
    } else {
      var grad = ctx.createLinearGradient(lx, ly, lx + m.logoSize, ly + m.logoSize);
      grad.addColorStop(0, "#00AEEF"); grad.addColorStop(1, "#0066a8");
      ctx.fillStyle = grad; roundRect(ctx, lx, ly, m.logoSize, m.logoSize, lr); ctx.fill();
      var gsz = Math.round(m.logoSize * 0.58);
      var gsvg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + gsz + '" height="' + gsz + '" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + Icons.paths.tag + "</svg>";
      var gimg = new Image();
      gimg.onload = function () { ctx.drawImage(gimg, lx + (m.logoSize - gsz) / 2, ly + (m.logoSize - gsz) / 2, gsz, gsz); drawText(); };
      gimg.onerror = function () { drawText(); };
      gimg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(gsvg);
    }
  }

  function drawTextBox(ctx, o, x, y, cb) {
    cb = cb || function () {};
    var cs = o.captionStyle, r = (cs === "rounded" || cs === "bubble" || cs === "callout") ? Math.max(o.radius, 12) : o.radius;
    if (cs !== "transparent" && cs !== "leader") {
      if (o.dropShadow) { ctx.save(); ctx.shadowColor = "rgba(0,0,0," + shA(o, 0.45) + ")"; ctx.shadowBlur = Math.round(o.h * 0.34 + 8); ctx.shadowOffsetY = Math.round(o.h * 0.14 + 3); }
      var _bgc = hexRgba(o.bg, o.bgOpacity == null ? 1 : o.bgOpacity);
      var _bdc = hexRgba(o.borderColor, o.borderOpacity == null ? 1 : o.borderOpacity);
      if (cs === "outline") { ctx.strokeStyle = _bdc; ctx.lineWidth = Math.max(2, o.borderWidth); applyCanvasDash(ctx, o, Math.max(2, o.borderWidth)); roundRect(ctx, x, y, o.w, o.h, r); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = _bgc; roundRect(ctx, x, y, o.w, o.h, r); ctx.fill(); }
      if (o.dropShadow) ctx.restore();
      if (cs !== "outline" && o.borderWidth) { ctx.strokeStyle = _bdc; ctx.lineWidth = o.borderWidth; applyCanvasDash(ctx, o, o.borderWidth); roundRect(ctx, x, y, o.w, o.h, r); ctx.stroke(); ctx.setLineDash([]); }
    }
    if ((cs === "bubble" || cs === "callout")) {
      ctx.fillStyle = o.bg; ctx.beginPath(); ctx.moveTo(x + 24, y + o.h); ctx.lineTo(x + 42, y + o.h); ctx.lineTo(x + 33, y + o.h + 10); ctx.closePath(); ctx.fill();
    }
    if (cs === "leader") {
      var lg = leaderGeom(o);
      ctx.strokeStyle = lg.color; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x + lg.ax, y + lg.ay); ctx.lineTo(x + lg.ex, y + lg.ey); ctx.stroke();
      ctx.fillStyle = lg.color; ctx.beginPath(); ctx.arc(x + lg.ex, y + lg.ey, 4, 0, 7); ctx.fill();
      ctx.fillStyle = o.bg; roundRect(ctx, x, y, o.w, o.h, r); ctx.fill();
    }
    // icon label (single line, icon beside the text) — async because the glyph rasterizes
    if ((o.type === "label" || o.type === "caption") && o.iconSide && o.iconKey) {
      ctx.fillStyle = o.color;
      ctx.font = (o.italic ? "italic " : "") + o.fontWeight + " " + o.fontSize + "px '" + o.font + "', sans-serif";
      ctx.textBaseline = "middle"; ctx.textAlign = "left";
      if (o.shadow) { ctx.shadowColor = "rgba(0,0,0," + shA(o, 0.7) + ")"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2; }
      var tw = ctx.measureText(o.text).width;
      var isz = Math.round(o.fontSize * 1.15), gap = Math.round(o.fontSize * 0.45);
      var gw = isz + gap + tw, lpad = Math.round(o.fontSize * 0.7), cyc = y + o.h / 2;
      var gx = o.align === "left" ? x + lpad : (o.align === "right" ? x + o.w - lpad - gw : x + (o.w - gw) / 2);
      var iconX = (o.iconSide === "left") ? gx : gx + tw + gap;
      var textX = (o.iconSide === "left") ? gx + isz + gap : gx;
      ctx.fillText(o.text, textX, cyc);
      ctx.shadowColor = "transparent";
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + isz + '" height="' + isz + '" viewBox="0 0 24 24" fill="' + (iconFilled(o.iconKey) ? o.color : "none") + '" stroke="' + o.color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + Icons.inner(o.iconKey) + "</svg>";
      var gimg = new Image();
      gimg.onload = function () { ctx.drawImage(gimg, iconX, cyc - isz / 2, isz, isz); cb(); };
      gimg.onerror = function () { cb(); };
      gimg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      return;
    }
    // text
    ctx.fillStyle = o.color;
    ctx.font = (o.italic ? "italic " : "") + o.fontWeight + " " + o.fontSize + "px '" + o.font + "', sans-serif";
    ctx.textBaseline = "middle";
    if (o.shadow) { ctx.shadowColor = "rgba(0,0,0," + shA(o, 0.7) + ")"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2; }
    var padX = Math.round(o.fontSize * 0.7);
    var lines = wrapText(ctx, o.text, o.w - padX * 2);
    var lh = o.fontSize * 1.2;
    var totalH = lines.length * lh;
    var startY = y + o.h / 2 - totalH / 2 + lh / 2;
    lines.forEach(function (ln, idx) {
      var tx;
      ctx.textAlign = o.align;
      if (o.align === "left") tx = x + padX;
      else if (o.align === "right") tx = x + o.w - padX;
      else tx = x + o.w / 2;
      var ty = startY + idx * lh;
      ctx.fillText(ln, tx, ty);
      if (o.underline) {
        var tw = ctx.measureText(ln).width;
        var ux0 = o.align === "left" ? tx : (o.align === "right" ? tx - tw : tx - tw / 2);
        ctx.save(); ctx.shadowColor = "transparent"; ctx.strokeStyle = o.color; ctx.lineWidth = Math.max(1, o.fontSize / 14);
        ctx.beginPath(); ctx.moveTo(ux0, ty + o.fontSize * 0.5); ctx.lineTo(ux0 + tw, ty + o.fontSize * 0.5); ctx.stroke(); ctx.restore();
      }
    });
    cb();
  }
  function wrapText(ctx, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], line = "";
    words.forEach(function (w) {
      var test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ============================================================
     ALIGNMENT GUIDES
  ============================================================ */
  var guideEls = [];
  function clearGuides() { guideEls.forEach(function (g) { g.remove(); }); guideEls = []; }
  function applyGuides(o, nx, ny) {
    clearGuides();
    var thresh = 7 / S.zoom;
    var targetsX = [], targetsY = [];
    // image edges + center
    targetsX.push(0, image.w / 2, image.w);
    targetsY.push(0, image.h / 2, image.h);
    S.objects.forEach(function (other) {
      if (other.id === o.id) return;
      targetsX.push(other.x, other.x + other.w / 2, other.x + other.w);
      targetsY.push(other.y, other.y + other.h / 2, other.y + other.h);
    });
    var myX = [nx, nx + o.w / 2, nx + o.w];
    var myY = [ny, ny + o.h / 2, ny + o.h];
    var bestX = null, snapX = nx;
    myX.forEach(function (mx, i) {
      targetsX.forEach(function (tx) {
        if (Math.abs(mx - tx) < thresh) { snapX = nx + (tx - mx); bestX = tx; }
      });
    });
    var bestY = null, snapY = ny;
    myY.forEach(function (my, i) {
      targetsY.forEach(function (ty) {
        if (Math.abs(my - ty) < thresh) { snapY = ny + (ty - my); bestY = ty; }
      });
    });
    if (bestX != null) addGuide("v", bestX);
    if (bestY != null) addGuide("h", bestY);
    return { x: snapX, y: snapY };
  }
  function addGuide(type, pos) {
    var g = document.createElement("div"); g.className = "guide " + type;
    if (type === "v") g.style.left = pos + "px"; else g.style.top = pos + "px";
    stage.appendChild(g); guideEls.push(g);
  }

  /* ---- Edge guides: a red line on any image edge a component touches while moving/resizing ---- */
  var edgeEls = [], edgeTimer = null;
  function clearEdgeGuides() { edgeEls.forEach(function (g) { g.remove(); }); edgeEls = []; }
  function objBounds(o) {   // axis-aligned bounds of the (possibly rotated) component box
    var a = (o.rot || 0) * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    var cx = o.x + o.w / 2, cy = o.y + o.h / 2, hw = (o.w * c + o.h * s) / 2, hh = (o.w * s + o.h * c) / 2;
    return { l: cx - hw, t: cy - hh, r: cx + hw, b: cy + hh };
  }
  function showEdgeGuides(objs) {
    clearEdgeGuides();
    if (!image || !stage || !objs || !objs.length) return;
    var L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
    objs.forEach(function (o) { var bb = objBounds(o); L = Math.min(L, bb.l); T = Math.min(T, bb.t); R = Math.max(R, bb.r); B = Math.max(B, bb.b); });
    var tol = Math.max(0.75, 1 / (S.zoom || 1));
    // touching (within a hair) or reaching past the edge both count as touching it
    if (L <= tol) addEdgeGuide("l"); if (R >= image.w - tol) addEdgeGuide("r");
    if (T <= tol) addEdgeGuide("t"); if (B >= image.h - tol) addEdgeGuide("b");
  }
  function addEdgeGuide(side) {
    var g = document.createElement("div"); g.className = "edge-guide edge-" + side;
    stage.appendChild(g); edgeEls.push(g);
  }

  // While resizing, pull the dragged side onto an image edge when it's within a few pixels
  // (unrotated components whose sides can change independently).
  function snapResizeToEdges(o, dir, keepAspect) {
    if (!image || !S.guides || (o.rot || 0) % 360 !== 0 || keepAspect || (Kit.has(o.type) && Kit.autoSize(o))) return;
    var th = 7 / (S.zoom || 1);
    if (dir[0] > 0 && Math.abs(o.x + o.w - image.w) < th) o.w = image.w - o.x;
    if (dir[0] < 0 && Math.abs(o.x) < th) { o.w += o.x; o.x = 0; }
    if (!(Kit.has(o.type) && Kit.autoH(o))) {
      if (dir[1] > 0 && Math.abs(o.y + o.h - image.h) < th) o.h = image.h - o.y;
      if (dir[1] < 0 && Math.abs(o.y) < th) { o.h += o.y; o.y = 0; }
    }
  }

  /* ============================================================
     IMAGE RIBBON (under canvas) + upload/replace/reorder
  ============================================================ */
  function renderImageLibrary() {
    project = Store.getProject(projectId);
    var strip = $("ribbonStrip"); if (!strip) return;
    var lc = $("libCount"); if (lc) lc.textContent = project.images.length;
    if (!project.images.length) {
      $("imgRibbon").classList.add("empty");
      strip.innerHTML = "<span>No images yet — use Add to bring photos into this project.</span>";
      return;
    }
    $("imgRibbon").classList.remove("empty");
    strip.innerHTML = project.images.map(function (im, i) {
      return '<div class="ribbon-thumb' + (im.id === imageId ? " is-current" : "") + '" data-id="' + im.id + '" draggable="true" title="' + UI.escapeHtml(im.filename) + '">' +
        '<img src="' + (im.thumb || im.src) + '" alt="">' +
        '<span class="rt-num">' + (i + 1) + "</span>" +
        '<span class="rt-acts">' +
          '<button class="rt-act" data-imgact="dup" title="Duplicate image">' + Icons.svg("copy", { size: 12 }) + "</button>" +
          '<button class="rt-act" data-imgact="replace" title="Replace image">' + Icons.svg("image", { size: 12 }) + "</button>" +
          '<button class="rt-act rt-act--del" data-imgact="del" title="Remove image">' + Icons.svg("trash", { size: 12 }) + "</button>" +
        "</span></div>";
    }).join("");
    strip.querySelectorAll(".ribbon-thumb").forEach(function (el) {
      var id = el.getAttribute("data-id");
      el.addEventListener("click", function (e) {
        if (e.target.closest("[data-imgact]") || ribbonJustDragged) return;
        navigateToImage(id);
      });
      el.querySelectorAll("[data-imgact]").forEach(function (b) {
        b.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          if (b.getAttribute("data-imgact") === "del") deleteImageFromRibbon(id);
          else if (b.getAttribute("data-imgact") === "dup") duplicateImageInRibbon(id);
          else replaceImage(id);
        });
      });
    });
    wireRibbonPointerDrag(strip);
    // keep the current thumbnail visible without using scrollIntoView
    var cur = strip.querySelector(".is-current");
    if (cur) strip.scrollLeft = Math.max(0, cur.offsetLeft - strip.clientWidth / 2 + cur.clientWidth / 2);
  }

  function navigateToImage(id) {
    if (id === imageId) return;
    if (S.dirty) save(true);
    Store.flush(function () { location.href = "editor.html?project=" + projectId + "&image=" + id; });
  }

  function duplicateImageInRibbon(id) {
    // persist current edits first so the copy includes them
    if (id === imageId && image) Store.saveImageObjects(projectId, imageId, S.objects);
    var copy = Store.duplicateImage(projectId, id);
    if (copy) { UI.toast({ type: "success", title: "Image duplicated" }); renderImageLibrary(); }
    else UI.toast({ type: "danger", title: "Couldn't duplicate" });
  }

  function deleteImageFromRibbon(id) {
    var im = Store.getImage(projectId, id);
    if (!im) return;
    var imgsBefore = Store.getProject(projectId).images;
    UI.confirm({
      title: "Remove image?", danger: true,
      message: "“" + im.filename + "” and its annotations will be removed from this project.",
      confirmText: "Remove",
      onConfirm: function () {
        var wasCurrent = (id === imageId);
        var idx = imgsBefore.findIndex(function (x) { return x.id === id; });
        Store.deleteImage(projectId, id);
        UI.toast({ type: "success", title: "Image removed" });
        if (wasCurrent) {
          var remaining = Store.getProject(projectId).images;
          if (remaining.length) {
            var next = remaining[Math.min(idx, remaining.length - 1)];
            Store.flush(function () { location.href = "editor.html?project=" + projectId + "&image=" + next.id; });
          } else {
            Store.flush(function () { location.href = "project.html?id=" + projectId; });
          }
        } else {
          renderImageLibrary();
        }
      }
    });
  }

  // Horizontal drag-and-drop reordering of the project's images.
  var ribbonDrag = null;

  /* ---- Annotated thumbnails: rendered by the export pipeline, saved with the image ---- */
  var thumbTimer = null, thumbBusy = false;
  function renderThumb(cb) {
    if (!image) return cb(null);
    var full = document.createElement("canvas"); full.width = image.w; full.height = image.h;
    var ctx = full.getContext("2d"), base = new Image();
    base.onload = function () {
      var cbg = image.canvasBg && image.canvasBg !== "transparent" ? image.canvasBg : null;
      if (cbg) { ctx.fillStyle = cbg; ctx.fillRect(0, 0, full.width, full.height); }
      ctx.drawImage(base, image.bx || 0, image.by || 0, image.bw || image.w, image.bh || image.h);
      var ordered = S.objects.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); }), i = 0;
      (function next() {
        if (i >= ordered.length) {
          var tw = Math.min(480, full.width), th = Math.max(1, Math.round(full.height * tw / full.width));
          var small = document.createElement("canvas"); small.width = tw; small.height = th;
          var sc = small.getContext("2d"); sc.imageSmoothingQuality = "high"; sc.drawImage(full, 0, 0, tw, th);
          var url = small.toDataURL("image/webp", 0.82);
          if (url.indexOf("data:image/webp") !== 0) url = small.toDataURL("image/jpeg", 0.82);   // no WEBP encoder (Safari)
          cb(url); return;
        }
        drawObject(ctx, ordered[i++], next);
      })();
    };
    base.onerror = function () { cb(null); };
    base.src = image.src;
  }
  function needsThumb() { return !!(S.objects.length || !canvasMatches()); }
  function scheduleThumb(delay) {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(function () {
      if (!image || thumbBusy) return;
      if (!needsThumb()) {   // plain image: the photo itself is the thumbnail
        if (image.thumb) { image.thumb = null; Store.updateImage(projectId, imageId, { thumb: null }); setRibbonThumb(image.src); }
        return;
      }
      thumbBusy = true;
      renderThumb(function (url) {
        thumbBusy = false;
        if (!url) return;
        image.thumb = url; Store.updateImage(projectId, imageId, { thumb: url }); setRibbonThumb(url);
      });
    }, delay == null ? 900 : delay);
  }
  function setRibbonThumb(url) {
    var el = document.querySelector('.ribbon-thumb[data-id="' + imageId + '"] img'); if (el && url) el.src = url;
  }

  /* ---- Ribbon reordering with pointer events (HTML5 drag-and-drop is unreliable in embedded views and on touch) ---- */
  var ribbonJustDragged = false;
  function wireRibbonPointerDrag(strip) {
    var items = Array.prototype.slice.call(strip.querySelectorAll(".ribbon-thumb"));
    items.forEach(function (it) {
      it.setAttribute("draggable", "false");
      it.querySelectorAll("img").forEach(function (im) { im.setAttribute("draggable", "false"); });
      it.addEventListener("dragstart", function (e) { e.preventDefault(); });
      it.addEventListener("pointerdown", function (e) {
        if (e.button !== 0 || e.target.closest("[data-imgact]")) return;
        var sx = e.clientX, sy = e.clientY, dragging = false, ghost = null, marker = null, drop = null, scrollTimer = null;
        var id = it.getAttribute("data-id"), r0 = it.getBoundingClientRect(), gx = sx - r0.left, gy = sy - r0.top;
        function begin() {
          dragging = true; it.classList.add("dragging"); document.body.style.userSelect = "none";
          ghost = it.cloneNode(true); ghost.classList.remove("dragging", "is-current"); ghost.classList.add("ribbon-ghost");
          ghost.style.width = r0.width + "px"; ghost.style.height = r0.height + "px"; document.body.appendChild(ghost);
          marker = document.createElement("div"); marker.className = "ribbon-marker"; document.body.appendChild(marker);
        }
        function locate(x) {
          var best = null;
          items.forEach(function (n) {
            if (n === it) return;
            var r = n.getBoundingClientRect(), mid = r.left + r.width / 2;
            var d = Math.min(Math.abs(x - r.left), Math.abs(x - r.right), Math.abs(x - mid));
            if (!best || d < best.d) best = { d: d, el: n, after: x > mid, r: r };
          });
          return best;
        }
        function edgeScroll(x) {
          clearInterval(scrollTimer);
          var sr = strip.getBoundingClientRect(), v = x < sr.left + 40 ? -12 : (x > sr.right - 40 ? 12 : 0);
          if (v) scrollTimer = setInterval(function () { strip.scrollLeft += v; }, 16);
        }
        function mv(ev) {
          if (!dragging) { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return; begin(); }
          ghost.style.left = (ev.clientX - gx) + "px"; ghost.style.top = (ev.clientY - gy) + "px";
          drop = locate(ev.clientX);
          if (drop) {
            marker.style.display = "block";
            marker.style.left = ((drop.after ? drop.r.right : drop.r.left) + (drop.after ? 5 : -7)) + "px";
            marker.style.top = (drop.r.top + 4) + "px"; marker.style.height = (drop.r.height - 8) + "px";
          }
          edgeScroll(ev.clientX);
        }
        function up() {
          document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up);
          clearInterval(scrollTimer);
          if (!dragging) return;
          it.classList.remove("dragging"); document.body.style.userSelect = "";
          if (ghost) ghost.remove(); if (marker) marker.remove();
          ribbonJustDragged = true; setTimeout(function () { ribbonJustDragged = false; }, 0);
          if (drop) reorderRibbon(id, drop.el.getAttribute("data-id"), drop.after);
        }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
      });
    });
  }

  function wireRibbonDnD(strip) {
    var items = strip.querySelectorAll(".ribbon-thumb");
    function clearMarks() { items.forEach(function (n) { n.classList.remove("drop-before", "drop-after"); }); }
    items.forEach(function (it) {
      it.addEventListener("dragstart", function (e) {
        ribbonDrag = it.getAttribute("data-id"); it.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", ribbonDrag); } catch (err) {}
      });
      it.addEventListener("dragend", function () { it.classList.remove("dragging"); clearMarks(); ribbonDrag = null; });
      it.addEventListener("dragover", function (e) {
        if (!ribbonDrag || it.getAttribute("data-id") === ribbonDrag) return;
        e.preventDefault(); e.dataTransfer.dropEffect = "move";
        var r = it.getBoundingClientRect();
        clearMarks(); it.classList.add(e.clientX > r.left + r.width / 2 ? "drop-after" : "drop-before");
      });
      it.addEventListener("dragleave", function () { it.classList.remove("drop-before", "drop-after"); });
      it.addEventListener("drop", function (e) {
        e.preventDefault();
        var targetId = it.getAttribute("data-id");
        if (!ribbonDrag || targetId === ribbonDrag) { clearMarks(); return; }
        var r = it.getBoundingClientRect();
        clearMarks();
        reorderRibbon(ribbonDrag, targetId, e.clientX > r.left + r.width / 2);
      });
    });
  }
  function reorderRibbon(dragId, targetId, after) {
    var order = Store.getProject(projectId).images.map(function (im) { return im.id; });
    var from = order.indexOf(dragId); if (from < 0) return;
    order.splice(from, 1);
    var ti = order.indexOf(targetId); if (ti < 0) return;
    order.splice(after ? ti + 1 : ti, 0, dragId);
    Store.reorderImages(projectId, order);
    renderImageLibrary();
  }

  var fileInput = $("fileInput"), replaceInput = $("replaceInput");
  var replaceTargetId = null;
  function doUpload() { fileInput.value = ""; fileInput.click(); }
  function replaceImage(id) { replaceTargetId = id; replaceInput.value = ""; replaceInput.click(); }
  fileInput.addEventListener("change", function () {
    var files = Array.prototype.slice.call(fileInput.files || []);
    if (!files.length) return;
    var first = null, done = 0, added = 0;
    files.forEach(function (f) {
      UI.fileToImage(f, 1600, function (im) {
        var rec = Store.addImage(projectId, im); if (rec) { added++; if (!first) first = rec; }
        if (++done === files.length) {
          if (added) UI.toast({ type: "success", title: added + " image(s) added" });
          if (added < files.length) UI.toast({ type: "danger", title: "Storage full", desc: "Some images couldn't be saved. Clear data in Settings." });
          renderImageLibrary();
          if (!image && first) Store.flush(function () { location.href = "editor.html?project=" + projectId + "&image=" + first.id; });
        }
      });
    });
  });
  replaceInput.addEventListener("change", function () {
    var f = replaceInput.files && replaceInput.files[0]; if (!f) return;
    var targetId = replaceTargetId || imageId;
    UI.fileToImage(f, 1600, function (im) {
      Store.updateImage(projectId, targetId, { src: im.src, w: im.w, h: im.h, filename: im.filename });
      UI.toast({ type: "success", title: "Image replaced" });
      replaceTargetId = null;
      if (targetId === imageId) Store.flush(function () { location.reload(); });
      else renderImageLibrary();
    });
  });

  /* ============================================================
     KEYBOARD SHORTCUTS
  ============================================================ */
  document.addEventListener("keydown", function (e) {
    var editing = document.querySelector('[data-editing]');
    var inField = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || editing;
    if (e.code === "Space" && !inField) { spaceDown = true; viewport.classList.add("pan-ready"); }
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); save(false); return; }
    if (mod && e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); redo(); return; }
    if (mod && e.shiftKey && e.key.toLowerCase() === "g") { e.preventDefault(); ungroupSelected(); return; }
    if (mod && e.key.toLowerCase() === "g") { e.preventDefault(); groupSelected(); return; }
    if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
    if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
    if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); duplicateSelected(); return; }
    if (mod && e.key.toLowerCase() === "c") { if (S.selected) { e.preventDefault(); copySelected(); } return; }
    if (mod && e.key.toLowerCase() === "v") { if (clipboard || readClipboard()) { e.preventDefault(); pasteClipboard(); } return; }
    if (cvMode) { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); exitCanvasMode(); } return; }
    if (cropMode) {
      if (e.key === "Escape") { e.preventDefault(); exitCropMode(); }
      else if (e.key === "Enter") { e.preventDefault(); applyCrop(); }
      return;
    }
    if (inField) return;
    if (clickDraw && (e.key === "Enter")) { e.preventDefault(); finishClickLine(); return; }
    if (clickDraw && e.key === "Escape") { cancelClickLine(); setDrawMode(false); return; }
    if ((e.key === "p" || e.key === "P") && image) { setDrawMode(!drawMode); return; }
    if ((e.key === "Delete" || e.key === "Backspace") && S.selectedIds.length) { e.preventDefault(); deleteSelected(); }
    if (e.key === "Escape") { if (polyDraw) return; if (drawMode) { setDrawMode(false); return; } deselect(); }
    if (e.key === "f" || e.key === "F") toggleFullscreen();
    if (e.key === "Tab" && S.objects.length) {
      e.preventDefault();
      var sorted = S.objects.slice().sort(function (a, b) { return a.z - b.z; });
      var idx = sorted.findIndex(function (o) { return o.id === S.selected; });
      select(sorted[(idx + 1) % sorted.length].id);
    }
    // arrow nudge (moves all selected)
    if (S.selectedIds.length && /Arrow/.test(e.key)) {
      e.preventDefault(); var step = e.shiftKey ? 10 : 1;
      var ddx = (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0);
      var ddy = (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0);
      selectedObjects().forEach(function (o) { if (o.locked) return; o.x += ddx; o.y += ddy; updateObjEl(o); });
      showEdgeGuides(selectedObjects().filter(function (o) { return !o.locked; }));
      clearTimeout(edgeTimer); edgeTimer = setTimeout(clearEdgeGuides, 900);
      clearTimeout(dirtyTimer); dirtyTimer = setTimeout(function () { pushHistory(); markDirty(); }, 300);
    }
  });
  document.addEventListener("keyup", function (e) { if (e.code === "Space") { spaceDown = false; viewport.classList.remove("pan-ready"); } });

  /* ============================================================
     FULLSCREEN / GRID / SNAP
  ============================================================ */
  function toggleFullscreen() {
    if (!document.fullscreenElement) { (document.documentElement.requestFullscreen && document.documentElement.requestFullscreen()); }
    else document.exitFullscreen && document.exitFullscreen();
  }
  function drawGrid() {
    if (!image) return;
    stageGrid.width = image.w; stageGrid.height = image.h;
    var ctx = stageGrid.getContext("2d");
    ctx.clearRect(0, 0, image.w, image.h);
    if (!S.showGrid) { stageGrid.classList.remove("on"); return; }
    stageGrid.classList.add("on");
    gridZoomCache = S.zoom;
    // Keep lines ~1.4px on screen regardless of zoom so the grid stays visible
    // when fit/zoomed out. Bolder accent lines every 5 cells for readability.
    var lw = Math.max(0.75, 1.4 / S.zoom);
    function lines(horizontal) {
      var span = horizontal ? image.w : image.h, cross = horizontal ? image.h : image.w;
      for (var p = 0, i = 0; p <= span; p += S.grid, i++) {
        var major = (i % 5 === 0);
        ctx.strokeStyle = major ? "rgba(0,174,239,0.85)" : "rgba(0,174,239,0.5)";
        ctx.lineWidth = major ? lw * 1.7 : lw;
        ctx.beginPath();
        if (horizontal) { ctx.moveTo(p, 0); ctx.lineTo(p, cross); } else { ctx.moveTo(0, p); ctx.lineTo(cross, p); }
        ctx.stroke();
      }
    }
    lines(true); lines(false);
  }

  /* ============================================================
     AI ASSISTANT — turns a natural-language request into annotations
  ============================================================ */
  var AI_ICON_KEYS = "alert, danger, power, camera, bolt, sensor, pin, gps, satellite, heat, snow, battery, usb, ethernet, wifi, cloud, settings, shield, target, eye, info, clock";

  // Swap the base image pixels for a new dataURL and keep the stage/store in sync.
  function aiSetImageSrc(newSrc, note) {
    return new Promise(function (resolve) {
      image.src = newSrc;
      Store.updateImage(projectId, imageId, { src: newSrc });
      stageImg.onload = function () {
        stageImg.onload = null;
        stageImg.style.width = image.w + "px"; stageImg.style.height = image.h + "px";
        drawGrid(); renderObjects(); wireObjectEvents(); markDirty();
        resolve(note);
      };
      stageImg.src = newSrc;
    });
  }

  // Apply CSS-filter-based pixel adjustments to the actual image.
  function aiAdjustImage(p) {
    if (!image) return Promise.resolve("No image is loaded.");
    var f = [], names = [];
    function add(fn, val, def, unit, label) {
      if (val == null || +val === def || isNaN(+val)) return;
      f.push(fn + "(" + (+val) + unit + ")"); names.push(label);
    }
    add("brightness", p.brightness, 100, "%", "brightness");
    add("contrast", p.contrast, 100, "%", "contrast");
    add("saturate", p.saturate, 100, "%", "saturation");
    add("grayscale", p.grayscale, 0, "%", "grayscale");
    add("sepia", p.sepia, 0, "%", "sepia");
    add("hue-rotate", p.hueRotate, 0, "deg", "hue");
    add("invert", p.invert, 0, "%", "invert");
    add("blur", p.blur, 0, "px", "blur");
    if (!f.length) return Promise.resolve("No visible adjustment was specified.");
    return new Promise(function (resolve) {
      var base = new Image();
      base.onload = function () {
        var cnv = document.createElement("canvas");
        cnv.width = image.w; cnv.height = image.h;
        var ctx = cnv.getContext("2d");
        ctx.filter = f.join(" ");
        ctx.drawImage(base, 0, 0, image.w, image.h);
        aiSetImageSrc(cnv.toDataURL("image/png"), "Adjusted " + names.join(", ") + ".").then(resolve);
      };
      base.onerror = function () { resolve("Could not read the image pixels."); };
      base.src = image.src;
    });
  }

  // Geometric transform: flip / rotate the image AND its annotations together.
  function aiTransformImage(kind) {
    if (!image) return Promise.resolve("No image is loaded.");
    var W = image.w, H = image.h;
    var rot = { "rotate-cw": 90, "rotate-ccw": -90, "rotate-180": 180 }[kind];
    return new Promise(function (resolve) {
      var base = new Image();
      base.onload = function () {
        var cnv = document.createElement("canvas"), ctx;
        if (kind === "flip-h" || kind === "flip-v") {
          cnv.width = W; cnv.height = H; ctx = cnv.getContext("2d");
          ctx.translate(kind === "flip-h" ? W : 0, kind === "flip-v" ? H : 0);
          ctx.scale(kind === "flip-h" ? -1 : 1, kind === "flip-v" ? -1 : 1);
          ctx.drawImage(base, 0, 0, W, H);
          S.objects.forEach(function (o) {
            if (kind === "flip-h") o.x = W - o.x - o.w; else o.y = H - o.y - o.h;
            if (o.rot) o.rot = -o.rot;
          });
        } else {
          var swap = Math.abs(rot) === 90;
          cnv.width = swap ? H : W; cnv.height = swap ? W : H; ctx = cnv.getContext("2d");
          ctx.translate(cnv.width / 2, cnv.height / 2);
          ctx.rotate(rot * Math.PI / 180);
          ctx.drawImage(base, -W / 2, -H / 2, W, H);
          S.objects.forEach(function (o) {
            var cx = o.x + o.w / 2, cy = o.y + o.h / 2, ncx, ncy;
            if (rot === 90) { ncx = H - cy; ncy = cx; }
            else if (rot === -90) { ncx = cy; ncy = W - cx; }
            else { ncx = W - cx; ncy = H - cy; }
            o.x = Math.round(ncx - o.w / 2); o.y = Math.round(ncy - o.h / 2);
            o.rot = ((o.rot || 0) + rot) % 360;
          });
          image.w = cnv.width; image.h = cnv.height;
          Store.updateImage(projectId, imageId, { w: cnv.width, h: cnv.height });
          stage.style.width = cnv.width + "px"; stage.style.height = cnv.height + "px";
        }
        var label = { "flip-h": "flipped horizontally", "flip-v": "flipped vertically", "rotate-cw": "rotated 90° right", "rotate-ccw": "rotated 90° left", "rotate-180": "rotated 180°" }[kind];
        aiSetImageSrc(cnv.toDataURL("image/png"), "Image " + label + ".").then(function (n) { fitToScreen(); resolve(n); });
      };
      base.onerror = function () { resolve("Could not read the image pixels."); };
      base.src = image.src;
    });
  }

  function aiResetImage() {
    if (!originalImageSrc) return Promise.resolve("No original image to revert to.");
    return aiSetImageSrc(originalImageSrc, "Reverted the image to its original pixels.");
  }


  function aiApplyObject(spec) {
    if (!image) return "No image is loaded, so nothing was added.";
    var kind = String(spec.kind || "").toLowerCase();
    var validKinds = { label: 1, caption: 1, icon: 1, shape: 1, arrow: 1 };
    if (!validKinds[kind]) return "Unknown annotation kind: " + kind;
    var opts = {};
    if (spec.text != null) opts.text = String(spec.text);
    if (kind === "icon") opts.iconKey = spec.iconKey || "info";
    if (kind === "shape") opts.shapeKind = spec.shapeKind || "rect";
    if (kind === "arrow") opts.shapeKind = spec.shapeKind || "arrow";
    var o = makeObject(kind, opts);
    // size (percentage of image width)
    if (spec.widthPct != null) {
      var ratio = o.h / o.w;
      o.w = clamp(Math.round(image.w * spec.widthPct / 100), 24, image.w);
      o.h = Math.max(20, Math.round(o.w * ratio));
    }
    // colour
    if (spec.color) {
      o.color = spec.color; o.borderColor = spec.color;
      if (kind === "label" || kind === "caption") o.bg = spec.color;
    }
    // placement — xPct/yPct are the CENTRE, 0..100 across the image
    var xPct = spec.xPct != null ? clamp(spec.xPct, 0, 100) : 50;
    var yPct = spec.yPct != null ? clamp(spec.yPct, 0, 100) : 50;
    o.x = Math.round(image.w * xPct / 100 - o.w / 2);
    o.y = Math.round(image.h * yPct / 100 - o.h / 2);
    o.x = clamp(o.x, -o.w * 0.25, image.w - o.w * 0.75);
    o.y = clamp(o.y, -o.h * 0.25, image.h - o.h * 0.75);
    o.z = topZ() + 1;
    S.objects.push(o);
    return "Added " + kind + (spec.text ? ' "' + spec.text + '"' : "") + ".";
  }

  function aiLog(role, text) {
    var log = $("aiLog");
    if (!log) return null;
    var el = document.createElement("div");
    el.className = "ai-msg " + role;
    if (role === "thinking") el.innerHTML = "Thinking<span class='ai-dots'><i></i><i></i><i></i></span>";
    else el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  var aiBusy = false;
  function runAI() {
    var input = $("aiPrompt");
    var send = $("aiSend");
    var prompt = (input.value || "").trim();
    if (!prompt || aiBusy) return;
    if (!image) { UI.toast({ type: "warning", title: "Upload an image first" }); return; }
    if (!(window.claude && window.claude.complete)) {
      aiLog("err", "AI is not available in this environment.");
      return;
    }
    aiBusy = true; send.setAttribute("disabled", "");
    aiLog("user", prompt);
    input.value = "";
    var thinking = aiLog("thinking");

    var summary = S.objects.slice(0, 20).map(function (o) {
      return "- " + o.type + (o.text ? ' "' + o.text + '"' : "") +
        " at ~" + Math.round((o.x + o.w / 2) / image.w * 100) + "%," + Math.round((o.y + o.h / 2) / image.h * 100) + "%";
    }).join("\n") || "(none yet)";

    var changed = 0;
    var tools = [{
      name: "adjust_image",
      description: "Change the actual image pixels — brightness, contrast, colour, tone. Combine multiple properties in ONE call. Neutral values (100 for brightness/contrast/saturate, 0 for the rest) mean no change.",
      input_schema: {
        type: "object",
        properties: {
          brightness: { type: "number", description: "Percent. 100=normal, <100 darker, >100 brighter (e.g. 130)." },
          contrast: { type: "number", description: "Percent. 100=normal, higher=more contrast." },
          saturate: { type: "number", description: "Percent. 100=normal, 0=greyscale, >100 more vivid." },
          grayscale: { type: "number", description: "0-100. 100=fully black & white." },
          sepia: { type: "number", description: "0-100. Warm vintage tone." },
          hueRotate: { type: "number", description: "Degrees -180..180 to shift all colours." },
          invert: { type: "number", description: "0-100. 100=fully inverted (negative)." },
          blur: { type: "number", description: "Pixels of gaussian blur, e.g. 3." }
        }
      },
      run: async function (inp) { var r = await aiAdjustImage(inp); if (r.indexOf("Adjusted") === 0) changed++; return r; }
    }, {
      name: "transform_image",
      description: "Flip or rotate the whole image (and its annotations).",
      input_schema: {
        type: "object",
        properties: { op: { type: "string", enum: ["flip-h", "flip-v", "rotate-cw", "rotate-ccw", "rotate-180"] } },
        required: ["op"]
      },
      run: async function (inp) { var r = await aiTransformImage(inp.op); if (r.indexOf("Image") === 0) changed++; return r; }
    }, {
      name: "revert_image",
      description: "Restore the image to its original, unedited pixels.",
      input_schema: { type: "object", properties: {} },
      run: async function () { var r = await aiResetImage(); changed++; return r; }
    }, {
      name: "add_annotation",
      description: "Add an annotation overlay ON TOP of the image (label, caption, icon, shape, or arrow). Use this only when the user wants a marker/callout, not a pixel change. Call once per annotation.",
      input_schema: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["label", "caption", "icon", "shape", "arrow"], description: "label=short tag with background; caption=descriptive text box; icon=glyph; shape=rectangle/ellipse/etc outline; arrow=arrow or leader line" },
          text: { type: "string", description: "Text for label/caption. Omit for icon/shape/arrow." },
          iconKey: { type: "string", description: "For kind=icon only. One of: " + AI_ICON_KEYS },
          shapeKind: { type: "string", description: "For kind=shape: rect, rrect, ellipse, triangle, diamond, line, highlight. For kind=arrow: arrow, darrow, leader, elbow." },
          color: { type: "string", description: "Hex colour e.g. #EF4444. Optional." },
          xPct: { type: "number", description: "Horizontal centre 0-100 (0=left, 100=right)." },
          yPct: { type: "number", description: "Vertical centre 0-100 (0=top, 100=bottom)." },
          widthPct: { type: "number", description: "Width as percent of image width. Optional." }
        },
        required: ["kind"]
      },
      run: async function (inp) { var r = aiApplyObject(inp); if (r.indexOf("Added") === 0) changed++; return r; }
    }];

    var system = "You are an image-editing assistant inside a caption editor. The user asks you to change an image; you carry out the change by calling tools. " +
      "PREFER adjust_image for tone/colour/brightness/contrast requests (brighten, darken, more contrast, black & white, sepia, warmer/cooler, vivid, blur, negative) — combine all properties into a single adjust_image call. " +
      "Use transform_image to flip or rotate. Use revert_image to undo all your image edits. Use add_annotation only when the user explicitly wants a marker/label/arrow drawn on top. " +
      "You cannot generate brand-new picture content or objects that aren't already in the photo — if asked for that, say so briefly and suggest the closest adjustment you can make. " +
      "The image is " + image.w + "x" + image.h + " px. Existing annotations:\n" + summary +
      "\nAfter acting, reply with one short sentence describing what you changed.";

    window.claude.complete({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      system: system,
      messages: [{ role: "user", content: prompt }],
      tools: tools
    }).then(function (reply) {
      if (thinking) thinking.remove();
      aiLog("ai", (reply && reply.trim()) || (changed ? "Done." : "I wasn't able to make that change."));
      if (changed) {
        renderObjects(); wireObjectEvents(); renderProps(); renderLayers();
        pushHistory(); markDirty();
        UI.hydrateIcons();
      }
    }).catch(function (e) {
      if (thinking) thinking.remove();
      aiLog("err", "Something went wrong: " + (e && e.message ? e.message : e));
    }).finally(function () {
      aiBusy = false; send.removeAttribute("disabled");
    });
  }

  /* ---- Properties panel: docked above Layers, or floating anywhere on screen ---- */
  var DOCK_KEY = "skytek.propsDock";
  var ICON_UNDOCK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-8 8"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var ICON_DOCK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/><path d="M8 10l2 2-2 2"/></svg>';
  function wirePropsDock() {
    var dock = $("propsDock"), rail = $("leftRail"), btn = $("propsUndock"), hideBtn = $("toggleLayers");
    if (!dock || !btn || !rail) return;
    var head = dock.querySelector(".props-head"), layersHead = rail.querySelector(".layers-head");
    var st = {}, saveT = null;
    try { st = JSON.parse(localStorage.getItem(DOCK_KEY)) || {}; } catch (e) { st = {}; }
    function save() { try { localStorage.setItem(DOCK_KEY, JSON.stringify(st)); } catch (e) {} }
    function clampIn() {
      var vw = window.innerWidth, vh = window.innerHeight;
      st.w = Math.max(240, Math.min(st.w || 300, vw - 16));
      st.h = Math.max(200, Math.min(st.h || Math.round(vh * 0.62), vh - 16));
      st.x = Math.max(8, Math.min(st.x == null ? vw - st.w - 300 : st.x, vw - st.w - 8));
      st.y = Math.max(8, Math.min(st.y == null ? 72 : st.y, vh - 48));
    }
    function place() { dock.style.left = st.x + "px"; dock.style.top = st.y + "px"; dock.style.width = st.w + "px"; dock.style.height = st.h + "px"; }
    function setFloating(on, persist) {
      st.floating = !!on;
      if (on) {
        clampIn(); document.body.appendChild(dock); dock.classList.add("floating"); place();
        rail.classList.add("props-out"); if (layersHead && hideBtn) layersHead.appendChild(hideBtn);
        btn.title = "Dock above Layers"; btn.innerHTML = ICON_DOCK;
      } else {
        dock.classList.remove("floating"); dock.removeAttribute("style");
        rail.insertBefore(dock, layersHead || null); rail.classList.remove("props-out");
        if (head && hideBtn) head.appendChild(hideBtn);
        btn.title = "Undock — move anywhere"; btn.innerHTML = ICON_UNDOCK;
      }
      if (persist !== false) save();
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); setFloating(!st.floating); });
    head.addEventListener("dblclick", function (e) { if (e.target.closest("button")) return; setFloating(!st.floating); });
    head.addEventListener("pointerdown", function (e) {
      if (!dock.classList.contains("floating") || e.button !== 0 || e.target.closest("button")) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, ox = st.x, oy = st.y;
      try { head.setPointerCapture(e.pointerId); } catch (x) {}
      function mv(ev) { st.x = ox + ev.clientX - sx; st.y = oy + ev.clientY - sy; clampIn(); place(); }
      function up() { head.removeEventListener("pointermove", mv); head.removeEventListener("pointerup", up); head.removeEventListener("pointercancel", up); save(); }
      head.addEventListener("pointermove", mv); head.addEventListener("pointerup", up); head.addEventListener("pointercancel", up);
    });
    if (window.ResizeObserver) new ResizeObserver(function () {   // the corner grip: remember the size
      if (!dock.classList.contains("floating") || !dock.isConnected || !dock.offsetWidth) return;   // ignore removal on page change
      st.w = dock.offsetWidth; st.h = dock.offsetHeight; clearTimeout(saveT); saveT = setTimeout(save, 250);
    }).observe(dock);
    window.addEventListener("resize", function () { if (st.floating) { clampIn(); place(); } });
    if (st.floating) setFloating(true, false);
  }

  /* ---- Recently used: the last 5 library components added (per device) ---- */
  var RECENT_KEY = "skytek.recentComponents", RECENT_MAX = 5, lastDragItem = null;
  function readRecent() { try { var r = JSON.parse(localStorage.getItem(RECENT_KEY)); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
  function recentKey(item) {
    return Array.prototype.slice.call(item.attributes).filter(function (a) { return a.name.indexOf("data-") === 0 && a.name !== "data-hydrated"; })
      .map(function (a) { return a.name + "=" + a.value; }).sort().join("&");
  }
  function recordRecent(item) {
    if (!item || !item.getAttribute || !item.getAttribute("data-kind")) return;
    var clone = item.cloneNode(true); clone.classList.remove("on"); clone.removeAttribute("id"); clone.removeAttribute("data-hydrated");
    var html = clone.outerHTML;
    if (!clone.classList.contains("lib-item")) {           // grid tiles (icons) are shown as a normal row
      var svg = clone.querySelector("svg"), name = clone.getAttribute("title") || clone.textContent.trim() || "Item";
      var attrs = Array.prototype.slice.call(clone.attributes).filter(function (at) { return at.name.indexOf("data-") === 0; })
        .map(function (at) { return " " + at.name + '="' + UI.escapeHtml(at.value) + '"'; }).join("");
      html = '<div class="lib-item" draggable="true"' + attrs + '><span class="li-icon">' + (svg ? svg.outerHTML : "") + "</span>" + UI.escapeHtml(name) +
        '<span class="li-add">' + Icons.svg("plus", { size: 14 }) + "</span></div>";
    }
    if (html.length > 6000 || /data:image/.test(html)) return;           // never store embedded images
    var key = recentKey(item);
    var list = readRecent().filter(function (r) { return r.key !== key; });
    list.unshift({ key: key, html: html });
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX))); } catch (e) {}
    renderRecent();
  }
  function renderRecent() {
    var host = $("recentPanel"); if (!host) return;
    var list = readRecent().slice(0, RECENT_MAX);
    host.innerHTML = list.length ? list.map(function (r) { return r.html; }).join("")
      : '<div class="recent-empty">Components you add will appear here.</div>';
    wireLibDrag(host);
  }

  /* ---- Resizable panels: right panel width, and the two height splitters ---- */
  var SIZES_KEY = "skytek.panelSizes";
  function wirePanelSizers() {
    var sz = {};
    try { sz = JSON.parse(localStorage.getItem(SIZES_KEY)) || {}; } catch (e) { sz = {}; }
    function save() { try { localStorage.setItem(SIZES_KEY, JSON.stringify(sz)); } catch (e) {} }
    function drag(handle, start, move) {
      if (!handle) return;
      handle.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        var sx = e.clientX, sy = e.clientY, s0 = start();
        handle.classList.add("dragging"); document.body.style.userSelect = "none";
        function mv(ev) { move(s0, ev.clientX - sx, ev.clientY - sy); }
        function up() {
          document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
          handle.classList.remove("dragging"); document.body.style.userSelect = ""; save();
        }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      });
    }
    var rightRail = $("leftRail"), leftRail = $("rightRail");
    var recent = $("recentPanel"), layers = rightRail && rightRail.querySelector(".layers-scroll");
    function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // right panel (Properties + Layers): width, handle on its left edge
    function applyRightW() { if (rightRail) rightRail.style.width = sz.rightW ? sz.rightW + "px" : ""; }
    drag($("rightResizer"), function () { return rightRail.offsetWidth; }, function (w0, dx) {
      sz.rightW = clampN(w0 - dx, 220, 640); applyRightW();
    });
    if ($("rightResizer")) $("rightResizer").addEventListener("dblclick", function () { delete sz.rightW; applyRightW(); save(); });

    // existing left-panel width handle: double-click resets it too
    if ($("leftResizer")) $("leftResizer").addEventListener("dblclick", function () {
      if (leftRail) leftRail.style.width = ""; try { localStorage.removeItem(RAIL_W_KEY); } catch (e) {}
    });

    // Recently used ↕ Library
    function applyRecentH() {
      if (!recent) return;
      if (sz.recentH) { recent.style.height = sz.recentH + "px"; recent.style.overflowY = "auto"; }
      else { recent.style.height = ""; recent.style.overflowY = ""; }
    }
    drag($("recentSplit"), function () { return recent.offsetHeight; }, function (h0, dx, dy) {
      var max = leftRail ? leftRail.clientHeight - 180 : 600;
      sz.recentH = clampN(h0 + dy, 44, Math.max(44, max)); applyRecentH();
    });
    if ($("recentSplit")) $("recentSplit").addEventListener("dblclick", function () { delete sz.recentH; applyRecentH(); save(); });

    // Properties ↕ Layers (sets the Layers height; Properties takes the rest)
    function applyLayersH() {
      if (!layers) return;
      if (sz.layersH) { layers.style.flex = "0 0 " + sz.layersH + "px"; layers.style.maxHeight = "none"; }
      else { layers.style.flex = ""; layers.style.maxHeight = ""; }
    }
    drag($("propsSplit"), function () { return layers.offsetHeight; }, function (h0, dx, dy) {
      var max = rightRail ? rightRail.clientHeight - 200 : 600;
      sz.layersH = clampN(h0 - dy, 60, Math.max(60, max)); applyLayersH();
    });
    if ($("propsSplit")) $("propsSplit").addEventListener("dblclick", function () { delete sz.layersH; applyLayersH(); save(); });

    applyRightW(); applyRecentH(); applyLayersH();
  }

  function wireAI() {
    if (!$("aiSend")) return;   // AI Assistant panel removed
    var send = $("aiSend"), input = $("aiPrompt"), chips = $("aiChips");
    if (!send) return;
    send.onclick = runAI;
    input.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runAI(); }
    });
    if (chips) chips.querySelectorAll(".ai-chip").forEach(function (c) {
      c.onclick = function () { input.value = c.getAttribute("data-prompt"); input.focus(); runAI(); };
    });
  }

  /* ============================================================
     WIRE TOOLBAR
  ============================================================ */
  function wireToolbar() {
    $("btnUndo").onclick = undo; $("btnRedo").onclick = redo;
    $("btnResetCanvas").onclick = function () {
      if (!S.objects.length) { UI.toast({ title: "Nothing to reset" }); return; }
      UI.confirm({ title: "Reset annotations?", danger: true, message: "All " + S.objects.length + " object(s) will be removed from this image.", confirmText: "Reset", onConfirm: function () { S.objects = []; deselect(); pushHistory(); markDirty(); } });
    };
    $("btnZoomIn").onclick = function () { zoomAt(1.2); };
    $("btnZoomOut").onclick = function () { zoomAt(0.833); };
    $("btnFit").onclick = fitToScreen;
    $("btnCenter").onclick = centerCanvas;
    $("btnCrop").onclick = toggleCropMode;
    if ($("btnCanvas")) $("btnCanvas").onclick = toggleCanvasMode;
    $("zoomLabel").onclick = setZoom100;
    $("btnGrid").onclick = function () { S.showGrid = !S.showGrid; Store.setSettings({ showGrid: S.showGrid }); $("btnGrid").classList.toggle("is-active", S.showGrid); drawGrid(); };
    $("btnSnap").onclick = function () { S.snap = !S.snap; Store.setSettings({ snapToGrid: S.snap }); $("btnSnap").classList.toggle("is-active", S.snap); UI.toast({ title: "Snap to grid " + (S.snap ? "on" : "off"), duration: 1200 }); };
    $("btnDraw").onclick = function () { setDrawMode(!drawMode); };
    $("btnFullscreen").onclick = toggleFullscreen;
    $("btnSave").onclick = function () { save(false); };
    $("btnRibbonAdd").onclick = doUpload; $("btnUploadEmpty") && ($("btnUploadEmpty").onclick = doUpload);
    // layers panel show/hide
    $("toggleLayers").onclick = function () { $("leftRail").classList.add("collapsed"); $("showLayers").style.display = "grid"; };
    $("showLayers").onclick = function () { $("leftRail").classList.remove("collapsed"); $("showLayers").style.display = "none"; };
    wirePropsDock();
    renderRecent();
    wirePanelSizers();
    setupRailResize();
    // export menu
    var menu = $("exportMenu");
    $("btnExport").onclick = function (e) { e.stopPropagation(); menu.classList.toggle("open"); };
    document.addEventListener("click", function () { menu.classList.remove("open"); });
    menu.querySelectorAll("[data-export]").forEach(function (it) { it.addEventListener("click", function () { exportImage(it.getAttribute("data-export")); menu.classList.remove("open"); }); });
    // initial active states
    $("btnSnap").classList.toggle("is-active", S.snap);
    $("btnGrid").classList.toggle("is-active", S.showGrid);
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    wireToolbar();
    wireAI();
    renderImageLibrary();
    renderLib();
    if (!image) {
      $("editorEmpty").classList.remove("hidden");
      stage.style.display = "none";
      setAutosaveState("", "No image");
      renderProps(); renderLayers();
      UI.hydrateIcons();
      return;
    }
    $("fileName").textContent = image.filename;
    $("fileName").setAttribute("data-rename", ""); $("fileName").title = "Click to rename";
    $("fileName").onclick = function () {
      UI.renameImage(projectId, imageId, function (name) {
        image.filename = name; $("fileName").textContent = name; document.title = name + " · Horizon Caption Studio";
      });
    };
    $("filePath").textContent = project.name;
    document.title = image.filename + " · Horizon Caption Studio";
    stageImg.onload = function () {
      originalImageSrc = originalImageSrc || image.src;
      applyCanvas();
      drawGrid();
      fitToScreen();
      if (needsThumb() && !image.thumb) scheduleThumb(1500);
      renderObjects(); wireObjectEvents();
      pushHistory();         // baseline
      renderProps(); renderLayers();
      UI.hydrateIcons();
    };
    stageImg.src = image.src;
    startAutosave();
  }
  Store.ready(function () {
    project = Store.getProject(projectId);
    if (!project) { location.href = "dashboard.html"; return; }
    if (!imageId && project.images.length) imageId = project.images[0].id;
    image = imageId ? Store.getImage(projectId, imageId) : null;
    if (image) { image.bw = image.w; image.bh = image.h; image.bx = 0; image.by = 0; }
    S.objects = image ? JSON.parse(JSON.stringify(image.objects || [])) : [];
    boot();
  });
})();
