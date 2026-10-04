/* Page rendering for the regular site + the hidden drawer page. */
(function () {
  "use strict";
  var S = window.VasiliSite, G = window.VasiliGlyphs;

  function plate(p) {
    var second = p.photos[1] ? S.img(p.photos[1], { size: 960, sizes: "(max-width: 900px) 50vw, 30vw" }).replace("<img ", '<img aria-hidden="true" ') : "";
    return '<div class="plate-wrap"><a class="plate" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="frame">' + S.img(p.photos[0], { size: 960, sizes: "(max-width: 900px) 50vw, 30vw" }) + second + "</div>" +
      '<div class="meta"><span class="code">' + p.code + '</span><span class="name">[Product name]</span>' +
      '<p class="ph-t">[Price]</p></div></a></div>';
  }
  function emptyPlate() {
    return '<div class="plate-wrap plate--empty" aria-hidden="true"><div class="plate"><div class="frame">[Product]</div>' +
      '<div class="meta"><span class="code">··</span><span class="name">[Product name]</span></div></div></div>';
  }
  function videoCell() {
    return '<div class="film-cell"><div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div></div>';
  }

  /* Big chain from the drawing, vertical (desktop) or horizontal (phone). */
  function drawHeroChain(svg) {
    if (!svg) return;
    var vertical = window.matchMedia("(min-width: 901px)").matches;
    var n = vertical ? 6 : 7, R = 21, gap = 80, pts = [], i;
    for (i = 0; i < n; i++) {
      var sway = Math.sin(i / (n - 1) * Math.PI * 1.5) * 16;
      pts.push(vertical ? { x: sway, y: i * gap } : { x: i * gap, y: sway });
    }
    var len = (n - 1) * gap, tipLen = 64;
    var tips = vertical ? [{ from: 0, x: pts[0].x - 6, y: -tipLen }, { from: n - 1, x: pts[n - 1].x + 4, y: len + tipLen }]
      : [{ from: 0, x: -tipLen, y: pts[0].y - 6 }, { from: n - 1, x: len + tipLen, y: pts[n - 1].y + 4 }];
    svg.setAttribute("viewBox", vertical ? "-50 " + (-tipLen - 6) + " 100 " + (len + tipLen * 2 + 12) : (-tipLen - 6) + " -45 " + (len + tipLen * 2 + 12) + " 90");
    svg.innerHTML = G.chain(pts, R, tips);
  }

  function home() {
    var heroChain = document.getElementById("hero-chain");
    drawHeroChain(heroChain);
    var mq = window.matchMedia("(min-width: 901px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { drawHeroChain(heroChain); });
    var rail = document.getElementById("rail-track");
    if (rail) rail.innerHTML = S.inCollection(rail.getAttribute("data-collection")).map(plate).join("");
    var tiles = document.getElementById("col-tiles");
    if (tiles) tiles.innerHTML = S.collections.filter(function (c) { return c.id !== "all" && c.id !== "frontpage"; }).map(function (c) {
      return '<li><a href="' + c.file + '"><span class="tile-art">' + (c.glyph === "chain" ? S.chainSvg(2) : S.glyphSvg(c.glyph)) + "</span>" +
        '<span class="tile-label">' + c.label + '</span><span class="code">' + S.inCollection(c.id).length + "</span></a></li>";
    }).join("");
  }

  function collection() {
    var grid = document.getElementById("collection-grid"), id = grid.getAttribute("data-collection");
    var items = S.inCollection(id), cells = items.map(plate);
    if (items.length >= 2) cells.splice(2, 0, videoCell());
    var empties = Math.max(2, 3 - (items.length % 3));
    for (var i = 0; i < empties; i++) cells.push(emptyPlate());
    if (!items.length) cells.unshift('<p class="empty-note ph-t">[Text]</p>');
    grid.innerHTML = cells.join("");
  }

  function product() {
    var root = document.getElementById("product-root");
    var p = S.product(new URLSearchParams(location.search).get("id"));
    if (!p) {
      root.innerHTML = '<div class="missing"><p class="label">Not found</p><p><a class="btn" href="shop.html"><span class="arrow arrow--back"></span>Shop</a></p></div>';
      return;
    }
    document.title = p.code + " | Vasili";
    var col = S.collections.filter(function (c) { return (p.collections || [])[0] === c.id; })[0];
    var origin = S.originHref(p.id);
    var html = '<nav class="crumbs" aria-label="Breadcrumb"><a href="shop.html">Shop</a><span aria-hidden="true">/</span>' +
      (col ? '<a href="' + col.file + '">' + col.label + '</a><span aria-hidden="true">/</span>' : "") + '<span aria-current="page">' + p.code + "</span></nav>";
    html += '<div class="product"><div class="gallery"><div class="thumbs" role="group" aria-label="Photos">' + p.photos.map(function (ph, i) {
      return '<button type="button" data-photo="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Show photo ' + (i + 1) + '"><img src="' + S.src(ph.base, 480) + '" alt="" loading="lazy"></button>';
    }).join("") + '</div><figure class="main" id="main-photo" style="margin:0">' + S.img(p.photos[0], { size: 1600, sizes: "(max-width: 900px) 100vw, 55vw", eager: true }) + "</figure></div>";
    html += '<div class="info"><span class="code">' + p.code + '</span><h1 class="ph-h">[Product name]</h1><p class="price">[Price]</p>' +
      '<div class="row"><span class="label">[Options]</span><div class="opts" aria-hidden="true"><span>[Option]</span><span>[Option]</span><span>[Option]</span></div></div>' +
      '<div class="row buy"><button class="btn btn--solid" type="button" disabled>[Purchase]</button><small>Purchase is not connected in this sample.</small></div>' +
      '<div class="row description"><h2 class="label">Description</h2><p class="ph-t">[Product details]</p><p class="ph-t">[Text]' +
      (origin ? ' <a class="origin-link" href="' + origin + '">See origin</a>' : "") + "</p></div>" +
      '<details class="row more"><summary class="label">[Materials]</summary><p class="ph-t">[Text]</p></details>' +
      '<details class="row more"><summary class="label">[Care]</summary><p class="ph-t">[Text]</p></details>' +
      '<p class="row policy-links"><a href="shipping-policy.html">Shipping Policy</a> · <a href="return-policy.html">Return Policy</a></p></div></div>';
    html += '<section class="product-film" aria-label="Video"><div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>' +
      '<div><p class="label">[Heading]</p><p class="ph-t">[Text]</p></div></section>';
    if (p.photos.length > 1) html += '<section class="worn" aria-label="More photos">' + p.photos.slice(1).map(function (ph) {
      return '<figure style="margin:0">' + S.img(ph, { size: 960, sizes: "(max-width: 900px) 50vw, 25vw" }) + "</figure>";
    }).join("") + "</section>";
    var others = S.products.filter(function (o) { return o.id !== p.id; });
    html += '<section class="rail related" aria-labelledby="rel-h"><div class="rail-head"><h2 class="label" id="rel-h">More pieces</h2>' +
      '<a class="btn" href="shop.html">Shop<span class="arrow"></span></a></div><div class="rail-track">' + others.map(plate).join("") + "</div></section>";
    root.innerHTML = html;
    root.querySelectorAll("[data-photo]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.getElementById("main-photo").innerHTML = S.img(p.photos[+b.getAttribute("data-photo")], { size: 1600, sizes: "(max-width: 900px) 100vw, 55vw", eager: true });
        root.querySelectorAll("[data-photo]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      });
    });
  }

  function preface() {
    var d = document.getElementById("chain-divider");
    if (d) d.innerHTML = S.chainSvg(3);
  }

  function post() {
    var id = Math.max(1, Math.min(3, parseInt(new URLSearchParams(location.search).get("id"), 10) || 1));
    var code = document.getElementById("post-code");
    if (code) code.textContent = "Post " + ("0" + id).slice(-2);
    document.title = "Post " + ("0" + id).slice(-2) + " | Vasili";
    var nav = document.getElementById("post-nav"), h = "";
    if (id > 1) h += '<a class="btn" href="blog-post.html?id=' + (id - 1) + '"><span class="arrow arrow--back"></span>[Post title]</a>';
    h += '<a class="btn" href="blog.html">News blog</a>';
    if (id < 3) h += '<a class="btn" href="blog-post.html?id=' + (id + 1) + '">[Post title]<span class="arrow"></span></a>';
    nav.innerHTML = h;
  }

  /* ---------- hidden: the specimen drawer (reached only from the drawing) ---------- */
  function drawer() {
    var root = document.getElementById("drawer-root"), q = new URLSearchParams(location.search);
    var fam = q.get("family"), head = S.node(fam);
    var from = S.node(q.get("from")) ? q.get("from") : fam;
    if (!head || head.parent !== "chain") {
      root.innerHTML = '<div class="missing"><p class="label">Not found</p><p><a class="btn" href="shop.html">Shop</a></p></div>';
      return;
    }
    document.title = "Drawer " + S.code(fam) + " | Vasili";
    var back = "map.html?node=" + encodeURIComponent(from);
    var members = S.nodes.filter(function (n) { var p = n; while (p && p.parent !== "chain") p = S.node(p.parent); return p && p.id === fam; });
    var pieces = members.reduce(function (acc, n) { return acc.concat(S.productsAt(n.id)); }, []);
    var html = '<div class="drawer-bar"><a class="btn" href="' + back + '"><span class="arrow arrow--back"></span>Back to drawing · ' + S.code(from) + '</a>' +
      '<span class="code">Drawer · ' + S.code(fam) + '</span><a class="btn drawer-close" href="' + back + '" aria-label="Close drawer">Close</a></div>';
    html += '<header class="drawer-head"><h1 class="ph-h">[Heading]</h1><p class="ph-t">[Text]</p></header>';
    html += '<section aria-labelledby="dr-forms"><h2 class="label wrap" id="dr-forms">Forms · ' + members.length + '</h2><ul class="drawer-forms">' + members.map(function (n) {
      return '<li><a href="map.html?node=' + encodeURIComponent(n.id) + '">' + S.glyphSvg(n.id) + '<span class="code">' + S.code(n.id) + "</span></a></li>";
    }).join("") + "</ul></section>";
    if (pieces.length) {
      html += '<section aria-labelledby="dr-pieces"><h2 class="label wrap" id="dr-pieces">Pieces</h2>';
      pieces.forEach(function (p) {
        var c = S.connectionFor(p.id);
        html += '<div class="drawer-piece"><div class="dp-meta"><span class="code">' + p.code + " · " + S.code(c.node) + '</span><span class="name">[Product name]</span>' +
          (c.confirmed ? "" : '<span class="tag-confirm">[Connection to confirm]</span>') +
          '<a class="btn" href="product.html?id=' + encodeURIComponent(p.id) + '">View piece<span class="arrow"></span></a></div><ul class="dp-photos">' +
          p.photos.map(function (ph, i) {
            return '<li><button type="button" data-lightbox="' + p.id + '" data-index="' + i + '" aria-label="Open photo ' + (i + 1) + ' of piece ' + p.code + '">' +
              S.img(ph, { size: 480, sizes: "220px" }) + "</button></li>";
          }).join("") + "</ul></div>";
      });
      html += "</section>";
    }
    var sketch = head.sketch;
    html += '<section class="drawer-films" aria-labelledby="dr-film"><h2 class="label" id="dr-film">Films</h2><div class="film-row">' +
      [1, 2, 3].map(function () { return '<div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>'; }).join("") + "</div></section>";
    if (sketch) html += '<details class="sketch wrap"><summary>Sketch detail</summary><figure><img src="assets/web/sketch/' + sketch + '.jpg" alt="Detail of the client\'s original pen drawing for this family" loading="lazy"><figcaption class="label">[Sketch detail]</figcaption></figure></details>';
    html += '<dialog class="lightbox" id="lightbox" aria-label="Photo"><figure id="lb-figure"></figure><div class="lb-bar">' +
      '<button type="button" class="btn" id="lb-prev" aria-label="Previous photo"><span class="arrow arrow--back"></span></button><span class="code" id="lb-count"></span>' +
      '<button type="button" class="btn" id="lb-next" aria-label="Next photo"><span class="arrow"></span></button><button type="button" class="btn" id="lb-close">Close</button></div></dialog>';
    root.innerHTML = html;

    var lb = document.getElementById("lightbox"), cur = { p: null, i: 0 };
    function show() {
      var ph = cur.p.photos[cur.i];
      document.getElementById("lb-figure").innerHTML = S.img(ph, { size: 1600, sizes: "90vw" });
      document.getElementById("lb-count").textContent = (cur.i + 1) + " / " + cur.p.photos.length;
    }
    root.querySelectorAll("[data-lightbox]").forEach(function (b) {
      b.addEventListener("click", function () { cur = { p: S.product(b.getAttribute("data-lightbox")), i: +b.getAttribute("data-index"), btn: b }; show(); lb.showModal(); });
    });
    document.getElementById("lb-prev").addEventListener("click", function () { cur.i = (cur.i - 1 + cur.p.photos.length) % cur.p.photos.length; show(); });
    document.getElementById("lb-next").addEventListener("click", function () { cur.i = (cur.i + 1) % cur.p.photos.length; show(); });
    document.getElementById("lb-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") document.getElementById("lb-prev").click();
      if (e.key === "ArrowRight") document.getElementById("lb-next").click();
    });
    lb.addEventListener("close", function () { if (cur.btn) cur.btn.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !document.querySelector("dialog[open]")) location.href = back; });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    ({ home: home, collection: collection, product: product, preface: preface, post: post, drawer: drawer }[page] || function () {})();
  });
})();
