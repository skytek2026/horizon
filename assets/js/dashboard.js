/* ============================================================
   dashboard.js — Dashboard page controller
   ============================================================ */
(function () {
  "use strict";
  if (!UI.requireAuth()) return;
  UI.initTheme();

  /* ---- shell ---- */
  document.getElementById("sidebarMount").outerHTML = UI.buildSidebar("dashboard");
  UI.wireSidebar();
  UI.hydrateIcons();

  var grid = document.getElementById("projectGrid");
  var searchEl = document.getElementById("globalSearch");
  var query = "";

  /* ---- theme toggle ---- */
  var themeBtn = document.getElementById("themeToggle");
  function syncThemeIcon() {
    var t = Store.getSettings().theme;
    themeBtn.innerHTML = ""; var span = document.createElement("span");
    span.setAttribute("data-icon", t === "dark" ? "sun" : "moon"); themeBtn.appendChild(span);
    UI.hydrateIcons(themeBtn);
  }
  themeBtn.addEventListener("click", function () { UI.toggleTheme(); syncThemeIcon(); });
  syncThemeIcon();

  /* ---- welcome + stats ---- */
  function renderStats() {
    var projects = Store.getProjects();
    var stats = [
      { v: projects.length, l: "Projects", accent: true },
      { v: Store.totalImages(), l: "Images", accent: false },
      { v: Store.getRecent().length, l: "Recently edited", accent: false },
      { v: Store.storageUsedKB() + " KB", l: "Cached", accent: false }
    ];
    document.getElementById("statRow").innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="v ' + (s.accent ? "" : "neutral") + '">' + s.v + '</div><div class="l">' + s.l + "</div></div>";
    }).join("");

    var last = Store.getProject(Store.getLastProject());
    var resume = document.getElementById("btnResume");
    if (last) {
      resume.style.display = "";
      resume.onclick = function () { location.href = "project.html?id=" + last.id; };
      resume.innerHTML = Icons.svg("open", { size: 16 }) + "Resume “" + UI.escapeHtml(last.name) + "”";
    }
  }

  /* ---- project cards ---- */
  function renderProjects() {
    var projects = Store.getProjects().filter(function (p) {
      return !query || (p.name + " " + p.description).toLowerCase().indexOf(query) > -1;
    });
    document.getElementById("projCount").textContent =
      projects.length + (projects.length === 1 ? " project" : " projects");

    if (!projects.length) {
      grid.style.display = "block";
      grid.innerHTML =
        '<div class="empty card" style="padding:56px 20px">' +
          '<div class="empty-icon">' + Icons.svg("folder", { size: 30 }) + "</div>" +
          "<h3>" + (query ? "No matching projects" : "No projects yet") + "</h3>" +
          "<p>" + (query ? "Try a different search term." : "Create your first project to start annotating images.") + "</p>" +
          (query ? "" : '<button class="btn btn--primary" id="emptyNew">' + Icons.svg("plus", { size: 16 }) + "Create a project</button>") +
        "</div>";
      var en = document.getElementById("emptyNew"); if (en) en.addEventListener("click", newProject);
      return;
    }
    grid.style.display = "grid";
    grid.innerHTML = projects.map(function (p) {
      var thumb = p.thumbnail
        ? '<img src="' + p.thumbnail + '" alt="">'
        : '<div class="pc-thumb-empty">' + Icons.svg("image", { size: 34 }) + "<span>No images</span></div>";
      return '<div class="card project-card" data-id="' + p.id + '">' +
        '<div class="pc-thumb">' + thumb +
          '<span class="pc-count">' + Icons.svg("image", { size: 12 }) + p.images.length + "</span></div>" +
        '<div class="pc-body">' +
          '<div class="pc-name">' + UI.escapeHtml(p.name) + "</div>" +
          '<div class="pc-desc">' + (p.description ? UI.escapeHtml(p.description) : "<span class='muted'>No description</span>") + "</div>" +
          '<div class="pc-meta">' + Icons.svg("clock", { size: 13 }) + "Created " + UI.fmtDate(p.createdAt) + "</div>" +
        "</div>" +
        '<div class="pc-foot">' +
          '<button class="btn btn--secondary btn--sm" data-act="open">' + Icons.svg("open", { size: 14 }) + "Open</button>" +
          '<button class="btn btn--ghost btn--sm btn--icon" data-act="dup" title="Duplicate project">' + Icons.svg("copy", { size: 14 }) + "</button>" +
          '<button class="btn btn--danger btn--sm btn--icon" data-act="del" title="Delete project">' + Icons.svg("trash", { size: 14 }) + "</button>" +
        "</div></div>";
    }).join("");

    grid.querySelectorAll(".project-card").forEach(function (card) {
      var id = card.getAttribute("data-id");
      function open() { Store.setLastProject(id); location.href = "project.html?id=" + id; }
      card.querySelector('[data-act="open"]').addEventListener("click", function (e) { e.stopPropagation(); open(); });
      card.addEventListener("click", open);
      card.querySelector('[data-act="dup"]').addEventListener("click", function (e) {
        e.stopPropagation();
        var copy = Store.duplicateProject(id);
        if (copy) { UI.toast({ type: "success", title: "Project duplicated", desc: "“" + copy.name + "” created." }); renderAll(); }
        else UI.toast({ type: "danger", title: "Couldn't duplicate", desc: "Storage may be full. Clear some data in Settings." });
      });
      card.querySelector('[data-act="del"]').addEventListener("click", function (e) {
        e.stopPropagation();
        var p = Store.getProject(id);
        UI.confirm({
          title: "Delete project?", danger: true,
          message: "“" + p.name + "” and its " + p.images.length + " image(s) will be permanently removed.",
          confirmText: "Delete", onConfirm: function () { Store.deleteProject(id); UI.toast({ type: "success", title: "Project deleted" }); renderAll(); }
        });
      });
    });
  }

  /* ---- recent images ---- */
  function renderRecent() {
    var recent = Store.getRecent().slice(0, 12);
    var el = document.getElementById("recentGrid");
    if (!recent.length) {
      el.innerHTML = '<div class="empty card" style="grid-column:1/-1;padding:40px 20px"><div class="empty-icon">' +
        Icons.svg("clock", { size: 28 }) + '</div><h3>Nothing recent</h3><p>Images you edit will appear here for quick access.</p></div>';
      return;
    }
    el.innerHTML = recent.map(function (r) {
      var img = Store.getImage(r.projectId, r.imageId);
      var thumb = (img && img.src) ? '<img src="' + img.src + '" alt="">' : Icons.svg("image", { size: 26 });
      return '<div class="card recent-card" data-pid="' + r.projectId + '" data-iid="' + r.imageId + '">' +
        '<div class="rc-thumb">' + thumb + "</div>" +
        '<div class="rc-body"><div class="rc-name">' + UI.escapeHtml(r.filename) + "</div>" +
        '<div class="rc-meta">' + UI.escapeHtml(r.projectName || "") + " · " + UI.fmtRelative(r.at) + "</div></div></div>";
    }).join("");
    el.querySelectorAll(".recent-card").forEach(function (c) {
      c.addEventListener("click", function () {
        location.href = "editor.html?project=" + c.getAttribute("data-pid") + "&image=" + c.getAttribute("data-iid");
      });
    });
  }

  /* ---- templates ---- */
  var TEMPLATES = [
    { icon: "sensor", name: "Sensor Array Audit", desc: "Label sensors, power and data lines on field equipment.", seedDesc: "Sensor & wiring annotations for the field audit." },
    { icon: "ethernet", name: "Control Cabinet", desc: "Connector callouts, leader lines and port maps.", seedDesc: "Connector and port callouts for the control cabinet." },
    { icon: "camera", name: "Drone Inspection", desc: "Mark inspection points and defects on aerial captures.", seedDesc: "Inspection-point markers from drone imagery." },
    { icon: "shield", name: "Safety Walkthrough", desc: "Highlight emergency stops, hazards and access points.", seedDesc: "Safety and hazard callouts for the walkthrough." }
  ];
  function renderTemplates() {
    document.getElementById("templateGrid").innerHTML =
      '<div class="empty card" style="grid-column:1/-1;padding:48px 24px">' +
        '<div class="empty-icon">' + Icons.svg("layout", { size: 28 }) + "</div>" +
        "<h3>Templates are coming soon</h3>" +
        "<p>Preconfigured annotation projects will land here to help you start faster.</p></div>";
  }

  /* ---- actions ---- */
  function newProject() {
    UI.modal({
      title: "New project", message: "Give your annotation project a name.",
      fields: [
        { name: "name", label: "Project name", placeholder: "e.g. Turbine Inspection — Row 12", value: "" },
        { name: "description", label: "Description (optional)", type: "textarea", placeholder: "What is this project for?" }
      ],
      confirmText: "Create project",
      onConfirm: function (data) {
        if (!data.name) { UI.toast({ type: "warning", title: "Please enter a project name" }); return false; }
        var p = Store.createProject({ name: data.name, description: data.description });
        Store.setLastProject(p.id);
        UI.toast({ type: "success", title: "Project created" });
        location.href = "project.html?id=" + p.id;
      }
    });
  }

  document.getElementById("btnNew").addEventListener("click", newProject);
  document.getElementById("btnNew2").addEventListener("click", newProject);
  searchEl.addEventListener("input", function () { query = this.value.trim().toLowerCase(); renderProjects(); });

  /* ---- welcome name ---- */
  document.getElementById("welcomeTitle").textContent =
    "Welcome back, " + (Store.getSettings().fullName || "Operator").split(" ")[0];

  function renderAll() { renderStats(); renderProjects(); UI.updateSidebarCounts(); UI.hydrateIcons(); }
  Store.ready(function () { renderAll(); renderTemplates(); UI.hydrateIcons(); });

  // honor #anchor on load
  if (location.hash) { var t = document.querySelector(location.hash); if (t) t.scrollTo ? 0 : 0; }
})();
