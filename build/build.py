import re, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent; S = ROOT / "src"; B = ROOT / "build"
rd = lambda p: (S / p).read_text(encoding="utf-8")

def patch_js(js):
    js = js.replace("location.href = ", "App.href = ")
    js = js.replace("location.replace(", "App.go(")
    js = js.replace("location.reload()", "App.reload()")
    js = js.replace("location.search", "App.search")
    js = js.replace("location.hash", "App.hash")
    js = js.replace("localStorage.getItem(", "__lsGet(")
    return js

def split_page(html):
    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
    head_styles = "".join(re.findall(r"<style>.*?</style>", re.search(r"<head>(.*?)</head>", html, re.S).group(1), re.S))
    m = re.search(r"<body([^>]*)>(.*)</body>", html, re.S)
    cls = re.search(r'class="([^"]*)"', m.group(1)); cls = cls.group(1) if cls else ""
    body = m.group(2)
    inline = "".join(re.findall(r"<script>(.*?)</script>", body, re.S))
    body = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.S).strip()
    return title, cls, head_styles + body, inline

pages = {}
for key, fname, sheets, script in [
    ("login", "index.html", ["app"], None),
    ("dashboard", "dashboard.html", ["app", "pages"], "assets/js/dashboard.js"),
    ("project", "project.html", ["app", "pages"], "assets/js/project.js"),
    ("editor", "editor.html", ["app", "editor"], "assets/js/editor.js"),
    ("settings", "settings.html", ["app", "pages"], None),
]:
    title, cls, html, inline = split_page(rd(fname))
    code = rd(script) if script else inline
    html = html.replace("shared Supabase database", "shared workspace")
    code = code.replace("shared Supabase database", "shared workspace")
    if key == "dashboard":
        old = "Store.ready(function () { renderAll(); renderTemplates(); UI.hydrateIcons(); });"
        assert old in code
        code = code.replace(old, old + "\n  Store.onChange(renderAll);")
        html = html.replace('accept=".skproj,application/zip"', 'accept=".skproj,.zip,application/zip"')
    if key == "project":
        a = "  Store.ready(function () {\n    refresh();\n    if (!project) {"
        assert a in code
        code = code.replace(a, "  function __start() {\n    refresh();\n    if (!project) {")
        tail = "    renderHero(); renderGallery(); UI.updateSidebarCounts(); UI.hydrateIcons();\n  });\n})();"
        assert tail in code
        code = code.replace(tail, "    renderHero(); renderGallery(); UI.updateSidebarCounts(); UI.hydrateIcons();\n  }\n"
          "  Store.ready(function () { if (!Store.getProject(projectId) && !Store.isFresh()) Store.readyFresh(__start); else __start(); });\n"
          "  Store.onChange(function () { refresh(); if (project) { renderHero(); renderGallery(); UI.updateSidebarCounts(); UI.hydrateIcons(); } });\n})();")
    if key == "settings":
        a = "Store.ready(function () { refreshStorage(); UI.updateSidebarCounts(); });"
        assert a in code
        code = code.replace(a, a + "\n  Store.onChange(function () { refreshStorage(); UI.updateSidebarCounts(); });")
        code = code.replace("stored in this browser.", "in the shared workspace.")
    if key == "editor":
        code = code.replace("!(window.claude && window.claude.complete)", "!App.hasAI()")
        code = code.replace("window.claude.complete({", "App.complete({")
        code = code.replace('model: "claude-sonnet-4-5",', "")
        a = "  Store.ready(function () {\n    project = Store.getProject(projectId);"
        assert a in code
        code = code.replace(a, "  Store.readyFresh(function () {\n    project = Store.getProject(projectId);")
        code = code.replace('var ind = $("autosaveInd"); ind.className', 'var ind = $("autosaveInd"); if (!ind) return; ind.className')
        assert "if (!ind) return;" in code
        assert "App.complete({" in code and "App.hasAI()" in code
    pages[key] = dict(title=title, bodyClass=cls, sheets=sheets, html=html, code=patch_js(code))

def js_str(s): return json.dumps(s).replace("</", "<\\/")

defs = ["window.__PAGES = {}; window.__lsGet = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };"]
for k, p in pages.items():
    defs.append("window.__PAGES[%s] = { title: %s, bodyClass: %s, sheets: %s, html: %s, run: function () {\n%s\n} };" % (
        js_str(k), js_str(p["title"]), js_str(p["bodyClass"]), json.dumps(p["sheets"]), js_str(p["html"]), p["code"]))

app_css = re.sub(r"@font-face\s*\{[^}]*\}\s*", "", rd("assets/css/app.css"))
extra_css = """
:root { box-sizing: border-box; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
html { scroll-padding-top: env(safe-area-inset-top, 0px); }
html.is-navigating, html.is-navigating * { cursor: progress !important; }
html.is-navigating::after { content: ""; position: fixed; left: 0; top: 0; height: 2px; width: 40%; z-index: 100000;
  background: #00AEEF; animation: navbar 0.9s ease-in-out infinite; }
@keyframes navbar { from { transform: translateX(-100%); } to { transform: translateX(260%); } }
"""
fonts = "https://fonts.googleapis.com/css2?family=Exo:wght@100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"

out = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Horizon Caption Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<style data-sheet="app">{app_css}{extra_css}</style>
<style data-sheet="pages" media="not all">{rd("assets/css/pages.css")}</style>
<style data-sheet="editor" media="not all">{rd("assets/css/editor.css")}</style>
<script async id="lucideLib" src="https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js"></script>
<script async src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
</head>
<body>
<script>
{chr(10).join(defs)}
</script>
<script>
{rd("assets/js/library.js")}
</script>
<script>
{patch_js(rd("assets/js/ui.js"))}
</script>
<script>
{(B/"store.js").read_text()}
</script>
<script>
{(B/"shell.js").read_text()}
</script>
<script>App.start();</script>
</body>
</html>
"""
o = ROOT / "dist" / "index.html"
o.write_text(out, encoding="utf-8")
print(len(out), "bytes")
for bad in ["location.href", "supabase", "unpkg", "window.claude.complete", "localStorage" ]:
    print(bad, out.count(bad))
