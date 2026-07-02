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
  var HIST_LIMIT = 60;
  var gridZoomCache = null;
  var clipboard = null;       // copied object (deep clone) for Ctrl+C / Ctrl+V
  var pasteShift = 0;         // cascade offset for repeated pastes

  /* ------------------------------------------------------------
     Top-bar logo
  ------------------------------------------------------------ */
  $("topLogo").innerHTML = Icons.svg("tag", { size: 17, stroke: "#fff" });
  $("topLogo").style.cssText = "display:grid;place-items:center;color:#fff";
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
      o.bg = "transparent"; o.color = "#EF4444"; o.borderColor = "#EF4444"; o.borderWidth = 4;
      o.arrowHead = "triangle";
      o.w = clamp(Math.round((image ? image.w : 800) * 0.2), 100, 360);
      o.h = clamp(Math.round((image ? image.w : 800) * 0.1), 50, 160);
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
    return o;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // Current date/time formatted for a stamp, e.g. "2026-06-29  14:32".
  function formatStamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "   " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

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

  // client coords -> image coords
  function toImage(clientX, clientY) {
    var r = stageImg.getBoundingClientRect();
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
    // label / caption
    var textStyle = "color:" + o.color + ";font-family:'" + o.font + "';font-size:" + o.fontSize + "px;" +
      "font-weight:" + o.fontWeight + ";text-align:" + o.align + ";" +
      (o.italic ? "font-style:italic;" : "") + (o.underline ? "text-decoration:underline;" : "") +
      (o.shadow ? "text-shadow:0 2px 6px rgba(0,0,0,.7);" : "") + "line-height:1.2;";
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
    if (o.dropShadow) st += "box-shadow:0 " + Math.round(o.h * 0.14 + 3) + "px " + Math.round(o.h * 0.34 + 8) + "px rgba(0,0,0,0.45);";
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
    } else if (o.type === "photo") {
      inner = '<div class="obj-content" style="' + photoContentStyle(o) + '"><img src="' + o.src + '" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
    } else {
      var shStyle = (o.type === "shape" || o.type === "polygon") ? shapeShadowCss(o) : "";
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
  function shadowParams(o) {
    var m = Math.min(o.w, o.h);
    return { blur: Math.max(3, Math.round(m * 0.06 + 4)), dy: Math.max(2, Math.round(m * 0.045 + 2)) };
  }
  function shapeShadowCss(o) {
    if (!o.dropShadow) return "";
    var sp = shadowParams(o);
    return "filter:drop-shadow(0 " + sp.dy + "px " + sp.blur + "px rgba(0,0,0,0.5));";
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
  function tbMetrics(o) {
    var h = o.h;
    return {
      pad: Math.max(10, Math.round(h * 0.18)),
      gap: Math.max(8, Math.round(h * 0.14)),
      logoSize: o.logoSize ? clamp(o.logoSize, 8, Math.max(8, o.h - 4)) : Math.round(h * 0.58),
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
      (o.dropShadow ? "box-shadow:0 " + Math.round(o.h * 0.14 + 3) + "px " + Math.round(o.h * 0.34 + 8) + "px rgba(0,0,0,0.45);" : "");
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
      ? '<img src="' + o.logo + '" draggable="false" style="width:' + m.logoSize + 'px;height:' + m.logoSize + 'px;object-fit:contain;flex:0 0 auto;border-radius:' + Math.round(m.logoSize * 0.16) + 'px">'
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
    // triangle (default)
    return '<polygon points="' + tx + ',' + ty + ' ' + (bx + px * hw) + ',' + (by + py * hw) + ' ' + (bx - px * hw) + ',' + (by - py * hw) + '" fill="' + c + '" stroke-linejoin="round"/>';
  }
  // How far the connecting line should stop short of the tip for each head.
  function headRetract(type, head) {
    if (type === "triangle") return head * 0.8;
    if (type === "diamond") return head * 0.95;
    if (type === "circle" || type === "ring") return head * 0.5;
    return 0; // open / none
  }
  function arrowSVG(o) {
    var w = o.w, h = o.h, c = o.color, sw = Math.max(3, o.borderWidth || 4);
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
    if (o.shapeKind === "arrow") {
      var e = ends(R, cy, 0);
      s += line(L, cy, e.lx, e.ly);
      s += arrowHead(ht, e.tx, e.ty, 0, c, sw, head);
    } else if (o.shapeKind === "darrow") {
      var er = ends(R, cy, 0), el = ends(L, cy, Math.PI);
      s += line(el.lx, el.ly, er.lx, er.ly);
      s += arrowHead(ht, er.tx, er.ty, 0, c, sw, head);
      s += arrowHead(ht, el.tx, el.ty, Math.PI, c, sw, head);
    } else if (o.shapeKind === "leader") {
      var ang = Math.atan2(sw - (h - sw), R - L);
      var le = ends(R, sw, ang);
      s += line(L, h - sw, le.lx, le.ly);
      s += '<circle cx="' + L + '" cy="' + (h - sw) + '" r="' + (sw + 2) + '" fill="' + c + '"/>';
      s += arrowHead(ht, le.tx, le.ty, ang, c, sw, head);
    } else if (o.shapeKind === "elbow") {
      var ee = ends(R, cy, 0);
      s += '<polyline points="' + L + ',' + (h - sw) + ' ' + L + ',' + cy + ' ' + ee.lx + ',' + cy + '" fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + aDash + '/>';
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
  var SWATCHES = ["#ffffff", "#0B1220", "#00AEEF", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#111827"];

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
      panel.innerHTML = '<div class="props-empty"><div class="empty-icon">' + Icons.svg("cursor", { size: 26 }) +
        "</div><p>Select an object to edit its properties, or add one from the library.</p></div>";
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
    } else {
      html += '<div class="prop-group"><h4>Colour</h4>' + colorRow("color", o.color) +
        numRow("Stroke", "borderWidth", o.borderWidth, 0, 40) +
        (o.type === "arrow" ? arrowHeadRow(o) + strokeStyleRow(o) +
          '<div class="prop-row"><label>Flip</label><div class="ctrl seg2">' +
            '<button data-arrowflip="h" class="' + (o.flipX ? "on" : "") + '">Horizontal</button>' +
            '<button data-arrowflip="v" class="' + (o.flipY ? "on" : "") + '">Vertical</button>' +
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

    panel.innerHTML = html;
    UI.hydrateIcons(panel);
    wirePropEvents(panel, o);
    if (o.type === "label" && o.iconSide) renderLabelIconPicker(o);
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
  var ARROW_HEADS = [{ id: "triangle", name: "Triangle" }, { id: "open", name: "Open / Chevron" }, { id: "diamond", name: "Diamond" }, { id: "circle", name: "Dot" }, { id: "ring", name: "Circle" }, { id: "none", name: "None (line)" }];
  function arrowHeadRow(o) {
    var head = o.arrowHead || "triangle";
    return '<div class="prop-row"><label>Head</label><div class="ctrl"><select class="select" data-prop="arrowHead">' +
      ARROW_HEADS.map(function (h) { return '<option value="' + h.id + '"' + (head === h.id ? " selected" : "") + ">" + h.name + "</option>"; }).join("") +
      "</select></div></div>" +
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
        else if (["w", "h", "fontSize", "radius", "borderWidth", "fontWeight", "titleSize", "subSize", "logoSize", "leaderAngle", "leaderLength", "subtitleSize", "bodySize", "headScale", "labelSize", "dotSize", "itemGap", "padX", "padY"].indexOf(prop) > -1) ob[prop] = +v;
        else if (prop === "rot") ob.rot = +v;
        else ob[prop] = v;
        if (prop === "text" || prop === "fontSize" || prop === "font") fitTextBox(ob);
        if (ob.type === "legend") fitLegend(ob);
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
      var ic = o.type === "icon" ? o.iconKey : (o.type === "shape" ? "shapes" : ((o.type === "polygon" || o.type === "polyline") ? "edit" : (o.type === "arrow" ? "arrowRt" : (o.type === "titlebar" ? "layout" : (o.type === "textbox" ? "text" : (o.type === "legend" ? "gridDots" : (o.type === "photo" ? "image" : "tag")))))));
      var label = o.type === "titlebar" ? (o.title || "Title bar") : (o.type === "textbox" ? (o.title || o.subtitle || rtPlainText(o.body) || "Text box") : (o.type === "legend" ? "Legend" : (o.type === "photo" ? "Image" : (o.text || (o.type.charAt(0).toUpperCase() + o.type.slice(1)) + (o.shapeKind ? " · " + o.shapeKind : "")))));
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
    if (S.snap) { o.x = snap(o.x); o.y = snap(o.y); }
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
        var payload = { kind: item.getAttribute("data-kind"), text: item.getAttribute("data-text"), icon: item.getAttribute("data-icon"), shape: item.getAttribute("data-shape"), iconSide: item.getAttribute("data-iconside"), iconKey: item.getAttribute("data-iconkey") };
        e.dataTransfer.setData("text/plain", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "copy";
        canvasWrap.classList.add("drop-active");
      });
      item.addEventListener("dragend", function () { canvasWrap.classList.remove("drop-active"); });
    });
  }
  function addFromItem(item, atImage) {
    var kind = item.getAttribute("data-kind");
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
    if (p.kind === "icon") addObject("icon", { iconKey: p.icon }, at);
    else if (p.kind === "shape" || p.kind === "arrow") addObject(p.kind, { shapeKind: p.shape }, at);
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
      moved = true;
    }
    function up() {
      document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
      clearGuides(); drag = null;
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
    var keepAspect = (o.type === "icon" || o.type === "photo");
    function mv(ev) {
      var p = toImage(ev.clientX, ev.clientY);
      var d = { x: p.x - anchor.x, y: p.y - anchor.y };
      var projX = d.x * ux.x + d.y * ux.y;
      var projY = d.x * uy.x + d.y * uy.y;
      var nw = editW ? Math.max(12, Math.abs(projX)) : w0;
      var nh = editH ? Math.max(12, Math.abs(projY)) : h0;
      if (keepAspect && editW && editH) { var ratio = w0 / h0; if (nw / nh > ratio) nw = nh * ratio; else nh = nw / ratio; }
      if (S.snap) { nw = Math.max(12, snap(nw)); nh = Math.max(12, snap(nh)); }
      var sgnX = dir[0] > 0 ? 1 : (dir[0] < 0 ? -1 : 0);
      var sgnY = dir[1] > 0 ? 1 : (dir[1] < 0 ? -1 : 0);
      var nc = { x: anchor.x + ux.x * (sgnX * nw / 2) + uy.x * (sgnY * nh / 2), y: anchor.y + ux.y * (sgnX * nw / 2) + uy.y * (sgnY * nh / 2) };
      o.w = Math.round(nw); o.h = Math.round(nh);
      o.x = Math.round(nc.x - nw / 2); o.y = Math.round(nc.y - nh / 2);
      updateObjEl(o);
      // live update size fields
      var pw = $("propsPanel").querySelector('[data-prop="w"]'); if (pw) pw.value = o.w;
      var ph = $("propsPanel").querySelector('[data-prop="h"]'); if (ph) ph.value = o.h;
    }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); drag = null; pushHistory(); markDirty(); }
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
    }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); drag = null; pushHistory(); markDirty(); }
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
      else if (o.type === "photo") { content.setAttribute("style", photoContentStyle(o)); return; }
      else if (o.type === "shape" || o.type === "polygon") content.style.filter = o.dropShadow ? shapeShadowCss(o).replace(/^filter:|;$/g, "") : "";
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
      UI.fileToImage(f, 256, function (im) {
        o.logo = im.src; renderObjects(); wireObjectEvents(); renderProps(); pushHistory(); markDirty();
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
    if (drawMode) { deselect(); UI.toast({ type: "info", title: drawKind === "polyline" ? "Freehand line" : "Freehand region", desc: "Click to add points; double-click or Enter to finish.", duration: 2600 }); }
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
    abs = simplifyPoints(abs, Math.max(1.5, 2 / S.zoom));
    var isLine = drawKind === "polyline";
    if (abs.length < 2 || (!isLine && abs.length < 3)) { UI.toast({ type: "warning", title: isLine ? "Line too short" : "Region too small", duration: 1600 }); return; }
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    abs.forEach(function (p) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
    var w = Math.max(8, maxX - minX), h = Math.max(8, maxY - minY);
    if (maxX - minX < 6 && maxY - minY < 6) { UI.toast({ type: "warning", title: isLine ? "Line too short" : "Region too small", duration: 1600 }); return; }
    var norm = abs.map(function (p) { return { x: +((p.x - minX) / w).toFixed(4), y: +((p.y - minY) / h).toFixed(4) }; });
    var o = makeObject(isLine ? "polyline" : "polygon", { points: norm });
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
      image.w = r.w; image.h = r.h; image.src = newSrc;
      Store.updateImage(projectId, imageId, { src: newSrc, w: r.w, h: r.h });
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
  function snapshot() { return JSON.stringify(S.objects); }
  function pushHistory() {
    history.push(snapshot());
    if (history.length > HIST_LIMIT) history.shift();
    future = [];
    updateUndoButtons();
  }
  function undo() {
    if (history.length < 2) { if (history.length === 1) { /* revert to empty baseline */ } return; }
    future.push(history.pop());
    S.objects = JSON.parse(history[history.length - 1]);
    S.selected = null; S.selectedIds = []; renderObjects(); wireObjectEvents(); renderProps(); renderLayers(); markDirty(); updateUndoButtons();
  }
  function redo() {
    if (!future.length) return;
    var state = future.pop(); history.push(state);
    S.objects = JSON.parse(state);
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
      if (format === "jpeg") { ctx.fillStyle = "#0B1220"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(base, 0, 0, image.w, image.h);
      var ordered = S.objects.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
      // render objects sequentially (svg objects need async image load)
      var i = 0;
      function next() {
        if (i >= ordered.length) { finish(); return; }
        var o = ordered[i]; i++;
        drawObject(ctx, o, next);
      }
      function finish() {
        var mime = format === "jpeg" ? "image/jpeg" : "image/png";
        var url = canvas.toDataURL(mime, format === "jpeg" ? 0.92 : undefined);
        var a = document.createElement("a");
        a.href = url;
        a.download = image.filename.replace(/\.[^.]+$/, "") + "-annotated." + (format === "jpeg" ? "jpg" : "png");
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
    } else if (o.type === "photo") {
      drawPhoto(ctx, o, x, y, function () { ctx.restore(); done(); });
    } else {
      // rasterize the object's SVG
      var svg = (o.type === "icon")
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="' + o.w + '" height="' + o.h + '" viewBox="0 0 24 24" fill="' + (iconFilled(o.iconKey) ? o.color : "none") + '" stroke="' + (iconFilled(o.iconKey) ? "none" : o.color) + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + Icons.inner(o.iconKey) + "</svg>"
        : '<svg xmlns="http://www.w3.org/2000/svg" width="' + o.w + '" height="' + o.h + '">' + (o.type === "shape" ? shapeInner(o) : (o.type === "polygon" ? polygonInner(o) : (o.type === "polyline" ? polylineInner(o) : arrowInner(o)))) + "</svg>";
      var img = new Image();
      img.onload = function () {
        if ((o.type === "shape" || o.type === "polygon") && o.dropShadow) { var sp = shadowParams(o); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = sp.blur; ctx.shadowOffsetY = sp.dy; }
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
    if (o.dropShadow) { ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = Math.round(o.h * 0.34 + 8); ctx.shadowOffsetY = Math.round(o.h * 0.14 + 3); }
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
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = sp.blur; ctx.shadowOffsetY = sp.dy;
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
      var textW = o.showLogo ? (o.w - m.pad * 2 - m.logoSize - m.gap) : (o.w - m.pad * 2);
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
    var lx = x + o.w - m.pad - m.logoSize, ly = y + (o.h - m.logoSize) / 2, lr = Math.round(m.logoSize * (o.logo ? 0.16 : 0.22));
    if (o.logo) {
      var img = new Image();
      img.onload = function () {
        ctx.save(); roundRect(ctx, lx, ly, m.logoSize, m.logoSize, lr); ctx.clip();
        // contain (preserve aspect ratio) within the square logo box
        var iw = img.naturalWidth || m.logoSize, ih = img.naturalHeight || m.logoSize;
        var scale = Math.min(m.logoSize / iw, m.logoSize / ih);
        var dw = iw * scale, dh = ih * scale;
        ctx.drawImage(img, lx + (m.logoSize - dw) / 2, ly + (m.logoSize - dh) / 2, dw, dh);
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
      if (o.dropShadow) { ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = Math.round(o.h * 0.34 + 8); ctx.shadowOffsetY = Math.round(o.h * 0.14 + 3); }
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
      if (o.shadow) { ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2; }
      var tw = ctx.measureText(o.text).width;
      var isz = Math.round(o.fontSize * 1.15), gap = Math.round(o.fontSize * 0.45);
      var gw = isz + gap + tw, gx = x + (o.w - gw) / 2, cyc = y + o.h / 2;
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
    if (o.shadow) { ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2; }
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
        '<img src="' + im.src + '" alt="">' +
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
        if (e.target.closest("[data-imgact]")) return;
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
    wireRibbonDnD(strip);
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
    $("filePath").textContent = project.name;
    document.title = image.filename + " · Horizon Caption Studio";
    stageImg.onload = function () {
      stageImg.style.width = image.w + "px"; stageImg.style.height = image.h + "px";
      stage.style.width = image.w + "px"; stage.style.height = image.h + "px";
      drawGrid();
      fitToScreen();
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
    S.objects = image ? JSON.parse(JSON.stringify(image.objects || [])) : [];
    boot();
  });
})();
