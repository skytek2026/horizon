/* ============================================================
   library.js — SVG icon registry + prebuilt component library
   window.Icons : UI + stamp icon set (inline SVG paths)
   window.Library : prebuilt labels, captions, icons, shapes, arrows
   ============================================================ */
(function () {
  "use strict";

  /* ---------- ICON REGISTRY ----------
     Each value is the INNER markup of a 24x24 viewBox SVG.
     Stroke icons inherit currentColor; sized by caller.        */
  var P = {
    /* nav + ui (stroke) */
    grid:        '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    folder:      '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    clock:       '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock:        '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock:      '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.3"/>',
    layout:      '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    settings:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout:      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    search:      '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus:        '<path d="M12 5v14M5 12h14"/>',
    upload:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
    image:       '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    trash:       '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>',
    copy:        '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    open:        '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>',
    edit:        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    check:       '<path d="M20 6L9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    x:           '<path d="M18 6L6 18M6 6l12 12"/>',
    alert:       '<path d="M10.3 3.7L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info:        '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    menu:        '<path d="M3 6h18M3 12h18M3 18h18"/>',
    sun:         '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:        '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    save:        '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    undo:        '<path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.1-9.4L3 7"/>',
    redo:        '<path d="M21 7v6h-6"/><path d="M20.5 13a9 9 0 1 1-2.1-9.4L21 7"/>',
    zoomIn:      '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
    zoomOut:     '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>',
    fit:         '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/>',
    reset:       '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8"/><path d="M3 4v4h4"/>',
    fullscreen:  '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3"/>',
    layers:      '<path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>',
    bringFwd:    '<rect x="8" y="3" width="13" height="13" rx="2"/><path d="M3 9v10a2 2 0 0 0 2 2h10"/>',
    sendBack:    '<rect x="3" y="8" width="13" height="13" rx="2"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>',
    rotate:      '<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>',
    tag:         '<path d="M20.6 13.4L13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    text:        '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
    shapes:      '<rect x="3" y="13" width="8" height="8" rx="1"/><circle cx="17" cy="17" r="4"/><path d="M12 3l4 7H8z"/>',
    arrowRt:     '<path d="M5 12h14M13 6l6 6-6 6"/>',
    cursor:      '<path d="M3 3l7.5 18 2.1-7.4L20 11.5z"/>',
    gridDots:    '<circle cx="5" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/>',
    download:    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
    crop:        '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>',
    grip:        '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
    chevR:       '<path d="M9 6l6 6-6 6"/>',
    chevL:       '<path d="M15 6l-6 6 6 6"/>',
    bold:        '<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/>',
    italic:      '<path d="M19 4h-9M14 20H5M15 4L9 20"/>',
    underline:   '<path d="M6 4v6a6 6 0 0 0 12 0V4M4 21h16"/>',
    alignL:      '<path d="M3 6h18M3 12h12M3 18h15"/>',
    alignC:      '<path d="M3 6h18M6 12h12M5 18h14"/>',
    alignR:      '<path d="M3 6h18M9 12h12M6 18h15"/>',
    listUl:      '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.3" fill="currentColor" stroke="none"/>',
    listOl:      '<path d="M10 6h11M10 12h11M10 18h11"/><path d="M4 4.5h1V9M3.6 9h1.8"/><path d="M3.4 14.2a1 1 0 0 1 1.7.7c0 .5-.5.9-1 1.3l-.8.8h2"/>',
    /* stamp icons (used in library + as placeable objects) */
    bolt:        '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    camera:      '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    power:       '<path d="M18.4 6.6a9 9 0 1 1-12.8 0M12 2v10"/>',
    pin:         '<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    satellite:   '<path d="M13 7l4-4 4 4-4 4zM11 9l-4 4 4 4 4-4M3 21a6 6 0 0 0 6-6M3 17a4 4 0 0 1 4 4"/>',
    heat:        '<path d="M14 14.8V7a2 2 0 0 0-4 0v7.8a4 4 0 1 0 4 0z"/>',
    snow:        '<path d="M12 2v20M4 6l16 12M20 6L4 18"/>',
    battery:     '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2M9 10v4"/>',
    usb:         '<circle cx="12" cy="20" r="2"/><path d="M12 18V4M12 4l-3 3M12 4l3 3M8 12h8M16 12v3a2 2 0 0 1-2 2h-4"/>',
    ethernet:    '<rect x="3" y="8" width="18" height="11" rx="2"/><path d="M7 8V5h10v3M7 19v-4M12 19v-4M17 19v-4"/>',
    wifi:        '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
    cloud:       '<path d="M18 18a4 4 0 0 0 0-8 6 6 0 0 0-11.6-1.5A4.5 4.5 0 0 0 6.5 18z"/>',
    shield:      '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/>',
    target:      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    eye:         '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    sensor:      '<circle cx="12" cy="12" r="3"/><path d="M5 5l2.5 2.5M19 5l-2.5 2.5M5 19l2.5-2.5M19 19l-2.5-2.5"/>',
    gps:         '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
    danger:      '<path d="M12 2l10 18H2z"/><path d="M12 9v5M12 17h.01"/>',
    arrowStamp:  '<path d="M4 12h14M12 6l6 6-6 6"/>',
    dblArrow:    '<path d="M3 12h18M8 7l-5 5 5 5M16 7l5 5-5 5"/>'
  };

  function svg(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var inner = iconInner(name);
    var fillSet = { bolt:1, pin:1, danger:1, satellite:0 };
    var fill = opts.fill || (fillSet[name] ? "currentColor" : "none");
    var stroke = opts.stroke != null ? opts.stroke : (fill === "currentColor" && fillSet[name] ? "none" : "currentColor");
    var sw = opts.strokeWidth || 2;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + fill +
      '" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner + '</svg>';
  }

  /* ---------- LUCIDE BRIDGE ----------
     The full Lucide set is loaded as a UMD global (window.lucide). Each icon is
     an array of [tag, attrs] child tuples on a 24x24 stroke grid — the same shape
     as our own registry, so they render + export through the same path lookups. */
  function lucideInner(name) {
    var L = window.lucide;
    if (!L || !L.icons) return null;
    var node = L.icons[name];
    if (!node || !node.length) return null;
    // Some builds give the full node ["svg", attrs, [children]]; others give just
    // the children array [[tag, attrs], ...]. Normalise to the children array.
    var children = (node[0] === "svg" && Array.isArray(node[2])) ? node[2] : node;
    if (!Array.isArray(children)) return null;
    return children.map(function (ch) {
      if (!Array.isArray(ch)) return "";
      var tag = ch[0], attrs = ch[1] || {};
      var a = Object.keys(attrs).map(function (k) { return k + '="' + attrs[k] + '"'; }).join(" ");
      return "<" + tag + (a ? " " + a : "") + "/>";
    }).join("");
  }
  // Inner markup for an icon key: our own registry first, then Lucide, else a fallback.
  function iconInner(name) {
    if (P[name] != null) return P[name];
    var li = lucideInner(name);
    return li != null ? li : P.tag;
  }
  function lucideNames() {
    var L = window.lucide;
    return (L && L.icons) ? Object.keys(L.icons) : [];
  }
  // "ArrowRightCircle" -> "Arrow Right Circle"
  function humanize(name) {
    return String(name).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  }

  window.Icons = { svg: svg, paths: P, inner: iconInner, lucideNames: lucideNames, humanize: humanize };

  /* ---------- COMPONENT LIBRARY ---------- */
  // Labels: a single generic label component (placeholder text "Label").
  var LABELS = ["Label"];

  // Captions: longer descriptive text blocks.
  var CAPTIONS = ["Power Connector","Emergency Shutoff","Inspection Point","Cooling System","Optical Sensor",
    "Communication Port","Fuel Intake","Primary Battery","Secondary Battery","Main Controller","Mounting Point",
    "Service Access","Ventilation","Maintenance Area","Inspection Hatch","Calibration Port","Safety Lock"];

  // Icons: stamp glyphs to place. {name, icon(key)}
  var ICONS = [
    {name:"Arrow", icon:"arrowStamp"}, {name:"Double Arrow", icon:"dblArrow"}, {name:"Warning", icon:"alert"},
    {name:"Danger", icon:"danger"}, {name:"Power", icon:"power"}, {name:"Camera", icon:"camera"},
    {name:"Bolt", icon:"bolt"}, {name:"Sensor", icon:"sensor"}, {name:"Location Pin", icon:"pin"},
    {name:"GPS", icon:"gps"}, {name:"Satellite", icon:"satellite"}, {name:"Heat", icon:"heat"},
    {name:"Snow", icon:"snow"}, {name:"Battery", icon:"battery"}, {name:"USB", icon:"usb"},
    {name:"Ethernet", icon:"ethernet"}, {name:"WiFi", icon:"wifi"}, {name:"Cloud", icon:"cloud"},
    {name:"Settings", icon:"settings"}, {name:"Shield", icon:"shield"}, {name:"Target", icon:"target"},
    {name:"Eye", icon:"eye"}, {name:"Information", icon:"info"}
  ];

  // Shapes: vector primitives drawn on canvas as DOM
  var SHAPES = [
    {name:"Rectangle", shape:"rect"}, {name:"Rounded", shape:"rrect"}, {name:"Ellipse", shape:"ellipse"},
    {name:"Triangle", shape:"triangle"}, {name:"Diamond", shape:"diamond"}, {name:"Line", shape:"line"},
    {name:"Highlight", shape:"highlight"}
  ];

  // Arrows / leader lines
  var ARROWS = [
    {name:"Arrow", shape:"arrow"}, {name:"Double Arrow", shape:"darrow"},
    {name:"Leader Line", shape:"leader"}, {name:"Elbow Leader", shape:"elbow"}
  ];

  // Caption style presets used by the Properties panel & label drops
  var CAPTION_STYLES = [
    {id:"solid",    name:"Solid"},
    {id:"rounded",  name:"Rounded"},
    {id:"outline",  name:"Outlined"},
    {id:"transparent", name:"Transparent"},
    {id:"bubble",   name:"Speech Bubble"},
    {id:"callout",  name:"Callout"},
    {id:"leader",   name:"Leader Line"}
  ];

  window.Library = {
    labels: LABELS, captions: CAPTIONS, icons: ICONS,
    shapes: SHAPES, arrows: ARROWS, captionStyles: CAPTION_STYLES
  };
})();
