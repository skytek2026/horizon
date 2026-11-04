/* ============================================================
   project.js — Project gallery controller
   ============================================================ */
(function () {
  "use strict";
  if (!UI.requireAuth()) return;
  UI.initTheme();

  var params = new URLSearchParams(location.search);
  var projectId = params.get("id");
  var project = null;
  Store.setLastProject(projectId);

  /* ---- shell ---- */
  document.getElementById("sidebarMount").outerHTML = UI.buildSidebar("projects");
  UI.wireSidebar();

  var grid = document.getElementById("galleryGrid");
  var query = "";

  function refresh() { project = Store.getProject(projectId); }

  function renderHero() {
    document.getElementById("projName").textContent = project.name;
    document.getElementById("crumbName").textContent = project.name;
    document.title = project.name + " · Horizon Caption Studio";
    var desc = document.getElementById("projDesc");
    if (project.description) { desc.textContent = project.description; desc.style.display = ""; }
    else { desc.style.display = "none"; }
    document.getElementById("metaImages").innerHTML = Icons.svg("image", { size: 14 }) + project.images.length + " image" + (project.images.length === 1 ? "" : "s");
    document.getElementById("metaCreated").innerHTML = Icons.svg("clock", { size: 14 }) + "Created " + UI.fmtDate(project.createdAt);
    document.getElementById("metaUpdated").innerHTML = Icons.svg("edit", { size: 14 }) + "Updated " + UI.fmtRelative(project.updatedAt);
    UI.hydrateIcons(document.querySelector(".ph-meta"));
  }

  function renderGallery() {
    var imgs = project.images.filter(function (im) {
      return !query || im.filename.toLowerCase().indexOf(query) > -1;
    });
    document.getElementById("imgCount").textContent = project.images.length + " total";

    var uploadTile = '<div class="upload-tile" id="uploadTile">' + Icons.svg("upload", { size: 30 }) +
      "<b>Upload images</b><small>or drag &amp; drop · JPG, PNG, WebP</small></div>";

    if (!project.images.length) {
      grid.innerHTML = uploadTile +
        '<div class="empty card" style="grid-column:2/-1;padding:40px 20px;display:flex;align-items:center;justify-content:center">' +
        '<div style="text-align:center"><h3 style="color:var(--text);margin-bottom:6px">No images yet</h3>' +
        '<p class="muted">Upload photos to start annotating them with labels and captions.</p></div></div>';
      wireUpload();
      return;
    }

    var cards = imgs.map(function (im) {
      var objCount = (im.objects || []).length;
      return '<div class="card img-card" data-id="' + im.id + '">' +
        '<div class="ic-thumb"><img src="' + (im.thumb || im.src) + '" alt="">' +
          (objCount ? '<span class="ic-badge">' + Icons.svg("tag", { size: 11 }) + objCount + " label" + (objCount === 1 ? "" : "s") + "</span>" : "") +
        "</div>" +
        '<div class="ic-body"><div class="ic-name">' + UI.escapeHtml(im.filename) + "</div>" +
          '<div class="ic-meta">' + im.w + "×" + im.h + " · edited " + UI.fmtRelative(im.updatedAt) + "</div></div>" +
        '<div class="ic-actions">' +
          '<button class="btn btn--secondary btn--sm" data-act="open">' + Icons.svg("edit", { size: 14 }) + "Open</button>" +
          '<button class="btn btn--ghost btn--sm btn--icon" data-act="ren" title="Rename">' + Icons.svg("text", { size: 14 }) + "</button>" +
          '<button class="btn btn--ghost btn--sm btn--icon" data-act="dup" title="Duplicate">' + Icons.svg("copy", { size: 14 }) + "</button>" +
          '<button class="btn btn--ghost btn--sm btn--icon" data-act="del" title="Delete">' + Icons.svg("trash", { size: 14 }) + "</button>" +
        "</div></div>";
    }).join("");

    grid.innerHTML = uploadTile + cards;
    wireUpload();

    grid.querySelectorAll(".img-card").forEach(function (card) {
      var id = card.getAttribute("data-id");
      function open() { location.href = "editor.html?project=" + projectId + "&image=" + id; }
      card.querySelector('[data-act="open"]').addEventListener("click", function (e) { e.stopPropagation(); open(); });
      card.querySelector(".ic-thumb").addEventListener("click", function () { if (!galleryJustDragged) open(); });
      function rename(e) { e.stopPropagation(); UI.renameImage(projectId, id, function () { refresh(); renderGallery(); renderHero(); }); }
      card.querySelector('[data-act="ren"]').addEventListener("click", rename);
      var nm = card.querySelector(".ic-name"); nm.title = "Double-click to rename"; nm.addEventListener("dblclick", rename);
      card.querySelector('[data-act="dup"]').addEventListener("click", function (e) {
        e.stopPropagation(); Store.duplicateImage(projectId, id); UI.toast({ type: "success", title: "Image duplicated" }); refresh(); renderGallery(); renderHero();
      });
      card.querySelector('[data-act="del"]').addEventListener("click", function (e) {
        e.stopPropagation();
        var im = Store.getImage(projectId, id);
        UI.confirm({
          title: "Delete image?", danger: true, message: "“" + im.filename + "” and its annotations will be removed.",
          confirmText: "Delete", onConfirm: function () { Store.deleteImage(projectId, id); UI.toast({ type: "success", title: "Image deleted" }); refresh(); renderGallery(); renderHero(); }
        });
      });
    });
    UI.hydrateIcons(grid);
    wireGalleryReorder();
  }

  /* ---- drag to reorder (pointer events: mouse, pen and touch) ---- */
  var galleryJustDragged = false;
  function scrollParent(el) {
    for (var n = el.parentElement; n; n = n.parentElement) {
      var oy = getComputedStyle(n).overflowY;
      if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight) return n;
    }
    return document.scrollingElement || document.documentElement;
  }
  function wireGalleryReorder() {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".img-card"));
    var filtered = !!query;
    grid.classList.toggle("reorderable", !filtered && cards.length > 1);
    if (filtered || cards.length < 2) return;
    cards.forEach(function (card) {
      card.querySelectorAll("img").forEach(function (im) { im.setAttribute("draggable", "false"); });
      card.addEventListener("dragstart", function (e) { e.preventDefault(); });
      card.addEventListener("pointerdown", function (e) {
        if (e.button !== 0 || e.target.closest("button, input, [data-act]")) return;
        var sx = e.clientX, sy = e.clientY, dragging = false, ghost = null, marker = null, drop = null, timer = null;
        var id = card.getAttribute("data-id"), r0 = card.getBoundingClientRect(), gx = sx - r0.left, gy = sy - r0.top;
        var scroller = scrollParent(grid);
        function begin() {
          dragging = true; card.classList.add("reorder-src"); document.body.style.userSelect = "none";
          ghost = card.cloneNode(true); ghost.classList.add("reorder-ghost"); ghost.style.width = r0.width + "px"; ghost.style.height = r0.height + "px";
          document.body.appendChild(ghost);
          marker = document.createElement("div"); marker.className = "reorder-marker"; document.body.appendChild(marker);
        }
        function locate(x, y) {
          var best = null;
          cards.forEach(function (n) {
            if (n === card) return;
            var r = n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            var d = Math.hypot(x - cx, (y - cy) * 1.6);   // prefer the same row
            if (!best || d < best.d) best = { d: d, el: n, after: x > cx, r: r };
          });
          return best;
        }
        function edge(y) {
          clearInterval(timer);
          var v = y < 70 ? -14 : (y > window.innerHeight - 70 ? 14 : 0);
          if (v) timer = setInterval(function () { scroller.scrollTop += v; }, 16);
        }
        function mv(ev) {
          if (!dragging) { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return; begin(); }
          ghost.style.left = (ev.clientX - gx) + "px"; ghost.style.top = (ev.clientY - gy) + "px";
          drop = locate(ev.clientX, ev.clientY);
          if (drop) {
            marker.style.display = "block";
            marker.style.left = ((drop.after ? drop.r.right + 7 : drop.r.left - 11)) + "px";
            marker.style.top = (drop.r.top + 6) + "px"; marker.style.height = (drop.r.height - 12) + "px";
          }
          edge(ev.clientY);
        }
        function up() {
          document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up);
          clearInterval(timer);
          if (!dragging) return;
          card.classList.remove("reorder-src"); document.body.style.userSelect = "";
          if (ghost) ghost.remove(); if (marker) marker.remove();
          galleryJustDragged = true; setTimeout(function () { galleryJustDragged = false; }, 0);
          if (!drop) return;
          var order = project.images.map(function (im) { return im.id; }).filter(function (x) { return x !== id; });
          var ti = order.indexOf(drop.el.getAttribute("data-id")); if (ti < 0) return;
          order.splice(drop.after ? ti + 1 : ti, 0, id);
          Store.reorderImages(projectId, order); refresh(); renderGallery(); renderHero();
        }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
      });
    });
  }

  /* ---- upload (button + tile + drag/drop) ---- */
  var uploadInput = document.getElementById("uploadInput");
  function triggerUpload() { uploadInput.value = ""; uploadInput.click(); }
  document.getElementById("btnUpload").addEventListener("click", triggerUpload);

  function wireUpload() {
    var tile = document.getElementById("uploadTile");
    if (!tile) return;
    tile.addEventListener("click", triggerUpload);
    ["dragenter", "dragover"].forEach(function (ev) { tile.addEventListener(ev, function (e) { e.preventDefault(); tile.classList.add("drag"); }); });
    ["dragleave", "drop"].forEach(function (ev) { tile.addEventListener(ev, function (e) { e.preventDefault(); tile.classList.remove("drag"); }); });
    tile.addEventListener("drop", function (e) { handleFiles(e.dataTransfer.files); });
  }
  uploadInput.addEventListener("change", function () { handleFiles(uploadInput.files); });

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) { return /image\/(jpeg|jpg|png|webp)/i.test(f.type); });
    if (!files.length) { UI.toast({ type: "warning", title: "No supported images", desc: "Use JPG, PNG or WebP." }); return; }
    var done = 0, added = 0, failed = 0;
    files.forEach(function (f) {
      UI.fileToImage(f, 1600, function (im) {
        var rec = Store.addImage(projectId, im);
        if (rec) added++; else failed++;
        if (++done === files.length) {
          if (added) UI.toast({ type: "success", title: added + " image" + (added > 1 ? "s" : "") + " added" });
          if (failed) UI.toast({ type: "danger", title: "Storage full", desc: failed + " image(s) couldn't be saved. Delete some images or clear data in Settings." });
          refresh(); renderHero(); renderGallery();
        }
      });
    });
  }

  /* ---- edit metadata ---- */
  document.getElementById("btnEditMeta").addEventListener("click", function () {
    UI.modal({
      title: "Edit project details",
      fields: [
        { name: "name", label: "Project name", value: project.name },
        { name: "description", label: "Description", type: "textarea", value: project.description }
      ],
      confirmText: "Save",
      onConfirm: function (data) {
        if (!data.name) { UI.toast({ type: "warning", title: "Name can't be empty" }); return false; }
        Store.updateProject(projectId, { name: data.name, description: data.description });
        UI.toast({ type: "success", title: "Project updated" });
        refresh(); renderHero();
      }
    });
  });

  document.getElementById("btnExport").addEventListener("click", function () {
    UI.toast({ type: "info", title: "Preparing export…", desc: "Bundling “" + project.name + "”." });
    Store.exportProject(projectId).then(function (res) {
      var url = URL.createObjectURL(res.blob);
      var a = document.createElement("a");
      a.href = url; a.download = res.filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      UI.toast({ type: "success", title: "Project exported", desc: res.filename });
    }).catch(function (err) {
      UI.toast({ type: "danger", title: "Export failed", desc: err.message || String(err) });
    });
  });

  document.getElementById("gallerySearch").addEventListener("input", function () { query = this.value.trim().toLowerCase(); renderGallery(); });

  // page-level drag/drop anywhere drops onto gallery
  ["dragover", "drop"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target.closest && e.target.closest(".content")) e.preventDefault(); });
  });

  Store.ready(function () {
    refresh();
    if (!project) {
      document.body.innerHTML = '<div class="empty" style="min-height:100vh;display:grid;place-items:center"><div><div class="empty-icon">' +
        Icons.svg("folder", { size: 30 }) + '</div><h3>Project not found</h3><p>It may have been deleted.</p>' +
        '<a class="btn btn--primary" href="dashboard.html">Back to dashboard</a></div></div>';
      UI.hydrateIcons();
      return;
    }
    renderHero(); renderGallery(); UI.updateSidebarCounts(); UI.hydrateIcons();
  });
})();
