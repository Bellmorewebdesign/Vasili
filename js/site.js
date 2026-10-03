/* Shared helpers for every page. Requires data/*.js and js/glyphs.js. */
(function () {
  "use strict";
  var products = window.VASILI_PRODUCTS || [];
  var connections = window.VASILI_CONNECTIONS || [];
  var map = window.VASILI_MAP || { nodes: [] };
  var G = window.VasiliGlyphs;

  var nodeIndex = {};
  map.nodes.forEach(function (n) { nodeIndex[n.id] = n; });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* "d1-2" -> "D1·2"; the chain itself is "0". */
  function code(id) { return id === "chain" ? "0" : id.toUpperCase().replace(/-/g, "·"); }

  function product(id) { for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i]; return null; }
  function connectionFor(pid) { for (var i = 0; i < connections.length; i++) if (connections[i].product === pid) return connections[i]; return null; }
  function productsAt(nodeId) {
    return connections.filter(function (c) { return c.node === nodeId; }).map(function (c) { return product(c.product); }).filter(Boolean);
  }
  function inCollection(colId) {
    return products.filter(function (p) { return colId === "all" || (p.collections || []).indexOf(colId) !== -1; });
  }
  /* The product description's discreet link onto the drawing. */
  function originHref(pid) {
    var c = connectionFor(pid);
    return c ? "map.html?node=" + encodeURIComponent(c.node) + "&piece=" + encodeURIComponent(pid) : null;
  }

  function src(base, size) { return "assets/web/" + base + "-" + size + ".jpg"; }
  /* Responsive <img>. Only web copies are used; originals stay untouched. */
  function img(photo, opts) {
    opts = opts || {};
    return '<img src="' + src(photo.base, opts.size || 960) + '" srcset="' +
      src(photo.base, 480) + " 480w, " + src(photo.base, 960) + " 960w, " + src(photo.base, 1600) + ' 1600w" sizes="' +
      (opts.sizes || "(max-width: 720px) 100vw, 50vw") + '" alt="' + esc(photo.alt) + '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' + (opts.cls ? ' class="' + opts.cls + '"' : "") + ">";
  }

  /* Shared SVG defs (facet shading of the drawn chain) injected once per page. */
  function ensureDefs() {
    if (document.getElementById("vasili-defs")) return;
    var d = document.createElement("div");
    d.innerHTML = '<svg id="vasili-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="facet-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f2ff" stop-opacity=".9"/><stop offset="1" stop-color="#5d7ea3" stop-opacity=".15"/></linearGradient>' +
      '<linearGradient id="facet-b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6f2" stop-opacity=".75"/><stop offset=".7" stop-color="#2b4664" stop-opacity=".35"/><stop offset="1" stop-color="#0a1220" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="node-glow"><stop offset="0" stop-color="#8fd0ff" stop-opacity=".25"/><stop offset="1" stop-color="#8fd0ff" stop-opacity="0"/></radialGradient>' +
      "</defs></svg>";
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  }

  /* Standalone drawing of one form (sheet units -> its own viewBox). */
  function glyphSvg(nodeId, label, big) {
    var n = nodeIndex[nodeId];
    if (!n) return "";
    ensureDefs();
    var r = n.glyph.type === "bracket" ? n.glyph.h * 0.7 : n.r * 1.1;
    var body = n.glyph.type === "bracket"
      ? '<path class="g-bracket" d="M6 ' + (-n.glyph.h * 0.6) + "H0V" + (n.glyph.h * 0.6) + 'H6"/>' +
        [-1, 0, 1].map(function (k) { return '<path class="g-thin" d="M0 ' + (k * n.glyph.h * 0.45) + 'H10"/>'; }).join("")
      : G.render(n.glyph);
    return '<svg data-fit class="lw glyph-preview' + (big ? " glyph-preview--big" : "") + '" viewBox="' + (-r) + " " + (-r) + " " + 2 * r + " " + 2 * r + '"' +
      (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + ">" +
      (n.circled ? '<circle class="g-ring" r="' + n.r + '"/>' : "") + body + "</svg>";
  }
  /* A few links of the main chain, horizontal. */
  function chainSvg(count) {
    ensureDefs();
    var R = 21, gap = 72, pts = [];
    for (var i = 0; i < count; i++) pts.push({ x: i * gap, y: Math.sin(i * 1.3) * 6 });
    var w = (count - 1) * gap;
    return '<svg class="lw glyph-preview" viewBox="' + (-50) + " " + (-40) + " " + (w + 100) + ' 80" aria-hidden="true">' +
      G.chain(pts, R, [{ from: 0, x: -46, y: pts[0].y - 4 }, { from: count - 1, x: w + 46, y: pts[count - 1].y + 4 }]) + "</svg>";
  }
  /* One link with its connectors, in parts that can be pulled apart. */
  function anatomySvg() {
    ensureDefs();
    var R = 21, parts = G.linkParts(R);
    return '<svg class="lw anatomy" viewBox="-110 -48 220 96" role="img" aria-label="One chain link with its two connectors and four shaded facets">' +
      '<g class="an an-bar-l">' + G.connector(-92, 0, -0.5 * R, 0, R) + "</g>" +
      '<g class="an an-body">' + parts.body + "</g>" +
      '<g class="an an-top">' + parts.top + "</g>" +
      '<g class="an an-bottom">' + parts.bottom + "</g>" +
      '<g class="an an-bar-r">' + G.connector(0.5 * R, 0, 92, 0, R) + "</g></svg>";
  }

  /* Visual-only forms: nothing is collected or sent in this prototype. */
  function wireForms() {
    document.querySelectorAll("form[data-visual-only]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = form.querySelector(".note");
        if (note) note.textContent = "Not connected in this sample. Nothing was sent.";
      });
    });
  }

  /* Header: "Collections" disclosure + full menu dialog. */
  function wireMenu() {
    var dd = document.getElementById("collections-toggle"), panel = document.getElementById("collections-menu");
    if (dd && panel) {
      var setOpen = function (open) { dd.setAttribute("aria-expanded", String(open)); panel.hidden = !open; };
      dd.addEventListener("click", function () { setOpen(dd.getAttribute("aria-expanded") !== "true"); });
      document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && e.target !== dd) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { setOpen(false); dd.focus(); } });
    }
    var open = document.getElementById("menu-open"), dlg = document.getElementById("site-menu");
    if (open && dlg) {
      open.addEventListener("click", function () { dlg.showModal(); open.setAttribute("aria-expanded", "true"); });
      dlg.addEventListener("close", function () { open.setAttribute("aria-expanded", "false"); open.focus(); });
      dlg.querySelector("[data-menu-close]").addEventListener("click", function () { dlg.close(); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    }
  }

  /* Fit each drawing preview to the drawing's real bounds once it is on the page
     (tall loops and pendants overflow their click radius). */
  function fit(svg) {
    try {
      var b = svg.getBBox();
      if (!b.width || !b.height) return;
      var size = Math.max(b.width, b.height) * 1.12, cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      svg.setAttribute("viewBox", [cx - size / 2, cy - size / 2, size, size].join(" "));
      svg.removeAttribute("data-fit");
    } catch (e) { /* not rendered yet */ }
  }
  function fitAll(root) {
    if (root.matches && root.matches("svg[data-fit]")) fit(root);
    if (root.querySelectorAll) root.querySelectorAll("svg[data-fit]").forEach(fit);
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureDefs(); wireForms(); wireMenu(); fitAll(document);
    new MutationObserver(function (list) {
      list.forEach(function (m) { m.addedNodes.forEach(fitAll); });
    }).observe(document.body, { childList: true, subtree: true });
  });

  window.VasiliSite = {
    esc: esc, code: code, product: product, products: products, inCollection: inCollection,
    connectionFor: connectionFor, productsAt: productsAt, originHref: originHref,
    node: function (id) { return nodeIndex[id] || null; }, nodes: map.nodes, map: map,
    collections: window.VASILI_COLLECTIONS || [],
    img: img, src: src, glyphSvg: glyphSvg, chainSvg: chainSvg, anatomySvg: anatomySvg, ensureDefs: ensureDefs
  };
})();
