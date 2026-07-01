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
        '<div class="ic-thumb"><img src="' + im.src + '" alt="">' +
          (objCount ? '<span class="ic-badge">' + Icons.svg("tag", { size: 11 }) + objCount + " label" + (objCount === 1 ? "" : "s") + "</span>" : "") +
        "</div>" +
        '<div class="ic-body"><div class="ic-name">' + UI.escapeHtml(im.filename) + "</div>" +
          '<div class="ic-meta">' + im.w + "×" + im.h + " · edited " + UI.fmtRelative(im.updatedAt) + "</div></div>" +
        '<div class="ic-actions">' +
          '<button class="btn btn--secondary btn--sm" data-act="open">' + Icons.svg("edit", { size: 14 }) + "Open</button>" +
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
      card.querySelector(".ic-thumb").addEventListener("click", open);
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
