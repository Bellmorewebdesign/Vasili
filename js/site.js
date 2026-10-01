/* Shared helpers for every page. Requires data/*.js and js/glyphs.js. */
(function () {
  "use strict";
  var products = window.VASILI_PRODUCTS || [];
  var connections = window.VASILI_CONNECTIONS || [];
  var map = window.VASILI_MAP || { nodes: [] };

  var nodeIndex = {};
  map.nodes.forEach(function (n) { nodeIndex[n.id] = n; });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* "a1-1" -> "A1·1"; the chain itself is "0". */
  function code(id) {
    if (id === "chain") return "0";
    return id.toUpperCase().replace(/-/g, "·");
  }

  function product(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }
  function connectionFor(productId) {
    for (var i = 0; i < connections.length; i++) if (connections[i].product === productId) return connections[i];
    return null;
  }
  function productsAt(nodeId) {
    return connections.filter(function (c) { return c.node === nodeId; })
      .map(function (c) { return product(c.product); }).filter(Boolean);
  }

  function src(base, size) { return "assets/web/" + base + "-" + size + ".jpg"; }

  /* Responsive <img>. Only web copies are used; originals stay untouched. */
  function img(photo, opts) {
    opts = opts || {};
    var sizes = opts.sizes || "(max-width: 720px) 100vw, 50vw";
    return '<img src="' + src(photo.base, opts.size || 960) + '" srcset="' +
      src(photo.base, 480) + " 480w, " + src(photo.base, 960) + " 960w, " + src(photo.base, 1600) + ' 1600w" sizes="' +
      sizes + '" alt="' + esc(photo.alt) + '"' + (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') +
      ' decoding="async"' + (opts.cls ? ' class="' + opts.cls + '"' : "") + ">";
  }

  /* Shared SVG defs (spike shading) injected once per page. */
  function ensureDefs() {
    if (document.getElementById("vasili-defs")) return;
    var d = document.createElement("div");
    d.innerHTML = '<svg id="vasili-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="spk-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f1ff"/>' +
      '<stop offset=".55" stop-color="#6f8db0"/><stop offset="1" stop-color="#14223a"/></linearGradient>' +
      '<radialGradient id="node-glow"><stop offset="0" stop-color="#8fd0ff" stop-opacity=".22"/>' +
      '<stop offset="1" stop-color="#8fd0ff" stop-opacity="0"/></radialGradient>' +
      "</defs></svg>";
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  }

  /* Small standalone drawing of one node's glyph. */
  function glyphSvg(nodeId, label) {
    var n = nodeIndex[nodeId];
    if (!n) return "";
    ensureDefs();
    var r = n.r * 1.05;
    return '<svg class="lw glyph-preview" viewBox="' + (-r) + " " + (-r) + " " + 2 * r + " " + 2 * r + '"' +
      (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + ">" +
      (n.circled ? '<circle class="g-thin" r="' + (n.r - 3) + '"/>' : "") +
      window.VasiliGlyphs.render(n.glyph) + "</svg>";
  }

  /* Email layout only: nothing is collected or sent in this prototype. */
  function wireSignup() {
    document.querySelectorAll("form.signup").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = form.querySelector(".note");
        if (note) note.textContent = "Not connected in this sample — nothing was sent.";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureDefs();
    wireSignup();
  });

  window.VasiliSite = {
    esc: esc, code: code, product: product, products: products,
    connectionFor: connectionFor, productsAt: productsAt,
    node: function (id) { return nodeIndex[id] || null; },
    nodes: map.nodes, map: map, img: img, src: src, glyphSvg: glyphSvg, ensureDefs: ensureDefs
  };
})();
