/* Homepage, collection and product page rendering. */
(function () {
  "use strict";
  var S = window.VasiliSite, G = window.VasiliGlyphs;

  function originHref(p) {
    var c = S.connectionFor(p.id);
    return c ? "map.html?node=" + encodeURIComponent(c.node) + "&from=" + encodeURIComponent(p.id) : "map.html";
  }
  function confirmTag(p) {
    var c = S.connectionFor(p.id);
    return c && c.confirmed ? "" : '<span class="tag-confirm">[Connection to confirm]</span>';
  }

  /* Product plate: studio photo, worn photo revealed on hover/focus. */
  function plate(p, withOrigin) {
    var c = S.connectionFor(p.id);
    var second = p.photos[1] ? S.img(p.photos[1], { size: 960, sizes: "(max-width: 900px) 50vw, 30vw" }).replace("<img ", '<img aria-hidden="true" ') : "";
    var html = '<div class="plate-wrap"><a class="plate" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="frame">' + S.img(p.photos[0], { size: 960, sizes: "(max-width: 900px) 50vw, 30vw" }) + second + "</div>" +
      '<div class="meta"><span class="code">' + p.code + '</span><span class="name">[Product name]</span>' +
      '<p class="ph-t">[Product details]</p></div></a>';
    if (withOrigin && c) {
      html += '<div class="origin"><a href="' + originHref(p) + '">See origin · ' + S.code(c.node) + "</a>" + confirmTag(p) + "</div>";
    }
    return html + "</div>";
  }

  /* Big spiked chain, vertical or horizontal, for the hero. */
  function drawHeroChain(svg) {
    if (!svg) return;
    var vertical = window.matchMedia("(min-width: 901px)").matches;
    var len = vertical ? 900 : 1000, R = vertical ? 30 : 24, n = vertical ? 7 : 8, pts = [], i;
    for (i = 0; i < n; i++) {
      var t = (i + 0.5) / n, along = 80 + (len - 160) * t, sway = Math.sin(t * Math.PI * 1.6) * (vertical ? 18 : 14);
      pts.push(vertical ? { x: 70 + sway, y: along } : { x: along, y: 60 + sway });
    }
    svg.setAttribute("viewBox", vertical ? "0 0 140 900" : "0 0 1000 120");
    var out = "", last = n - 1, e = R * 4;
    [[pts[0], pts[1]], [pts[last], pts[last - 1]]].forEach(function (pq) {
      var p = pq[0], q = pq[1], l = Math.hypot(p.x - q.x, p.y - q.y);
      out += '<g class="chain-spike" style="--i:' + n + '">' + G.spike(p.x, p.y, p.x + (p.x - q.x) / l * e, p.y + (p.y - q.y) / l * e, R * 0.42) + "</g>";
    });
    for (i = 0; i < last; i++) out += '<g class="chain-spike" style="--i:' + i + '">' + G.spike(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, R * 0.36) + "</g>";
    for (i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(last, i + 1)];
      out += '<g class="chain-link" style="--i:' + i + '">' + G.bigLink(pts[i].x, pts[i].y, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI, R) + "</g>";
    }
    svg.innerHTML = out;
  }

  /* Map teaser: a short stretch of chain with the first-level drawings. */
  function drawTeaser(svg) {
    if (!svg) return;
    var ids = ["a", "b", "c", "e", "f", "g"], W = 1400, H = 520, cy = 260, out = "";
    var pts = [];
    for (var i = 0; i < 9; i++) { var x = 40 + i * 165; pts.push({ x: x, y: cy + Math.sin(i / 8 * Math.PI * 2) * 22 }); }
    var chain = G.chainAlong(pts, 26, false);
    ids.forEach(function (id, k) {
      var n = S.node(id), above = k % 2 === 0, x = 160 + k * 216, y = above ? 100 : 420, r = 66, sc = Math.min(1, (r - 8) / n.r);
      out += '<path class="tl" d="M' + x + " " + (above ? y + r : y - r) + "V" + (above ? cy - 40 : cy + 40) + '"/>';
      out += '<a class="tnode" href="map.html?node=' + id + '" aria-label="Explore drawing ' + S.code(id) + '">' +
        '<circle class="ring" cx="' + x + '" cy="' + y + '" r="' + r + '"/>' +
        '<g transform="translate(' + x + " " + y + ") scale(" + sc + ')">' + G.render(n.glyph) + "</g>" +
        '<text x="' + (x + r + 26) + '" y="' + (y + 5) + '">' + S.code(id) + "</text></a>";
    });
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = chain + out;
  }

  function home() {
    var heroChain = document.getElementById("hero-chain");
    drawHeroChain(heroChain);
    var mq = window.matchMedia("(min-width: 901px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { drawHeroChain(heroChain); });
    var rail = document.getElementById("rail-track");
    if (rail) rail.innerHTML = S.products.map(function (p) { return plate(p, false); }).join("");
    drawTeaser(document.getElementById("teaser-svg"));
  }

  function collection() {
    var grid = document.getElementById("collection-grid");
    var cells = S.products.map(function (p) { return plate(p, true); });
    cells.splice(2, 0, '<div class="film-cell"><div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div></div>');
    cells.push('<div class="plate-wrap plate--empty" aria-hidden="true"><div class="plate"><div class="frame">[Product]</div></div></div>');
    cells.push('<div class="plate-wrap plate--empty" aria-hidden="true"><div class="plate"><div class="frame">[Product]</div></div></div>');
    grid.innerHTML = cells.join("");
  }

  function product() {
    var root = document.getElementById("product-root");
    var id = new URLSearchParams(location.search).get("id");
    var p = S.product(id) || null;
    if (!p) {
      root.innerHTML = '<div class="missing"><p class="label">Not found</p><p><a class="btn" href="collection.html"><span class="arrow arrow--back"></span>Collection</a></p></div>';
      return;
    }
    document.title = p.code + " — Vasili";
    var c = S.connectionFor(p.id);
    var html = '<nav class="crumbs" aria-label="Breadcrumb"><a href="collection.html">Collection</a><span aria-hidden="true">/</span><span aria-current="page">' + p.code + "</span></nav>";
    html += '<div class="product"><div class="gallery">' +
      '<div class="thumbs" role="group" aria-label="Photos">' + p.photos.map(function (ph, i) {
        return '<button type="button" data-photo="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Show photo ' + (i + 1) + '"><img src="' + S.src(ph.base, 480) + '" alt="" loading="lazy"></button>';
      }).join("") + "</div>" +
      '<figure class="main" id="main-photo" style="margin:0">' + S.img(p.photos[0], { size: 1600, sizes: "(max-width: 900px) 100vw, 55vw", eager: true }) + "</figure></div>";
    html += '<div class="info"><span class="code">' + p.code + '</span><h1 class="ph-h">[Product name]</h1><p class="ph-t">[Product details]</p>' +
      '<div class="row"><span class="label">[Options]</span><div class="opts" aria-hidden="true"><span>[Option]</span><span>[Option]</span><span>[Option]</span></div></div>' +
      '<div class="row buy"><button class="btn btn--solid" type="button" disabled>[Purchase]</button><small>Purchase is not connected in this sample.</small></div>';
    if (c) {
      html += '<div class="row"><span class="label">Origin</span><div class="origin-card">' + S.glyphSvg(c.node, "Drawing " + S.code(c.node)) +
        '<div class="stack"><span class="code">' + S.code(c.node) + "</span>" + confirmTag(p) +
        '<a class="btn see-origin" href="' + originHref(p) + '">See origin<span class="arrow"></span></a></div></div></div>';
    }
    html += "</div></div>";
    html += '<section class="product-film" aria-label="Video"><div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>' +
      '<div><p class="label">[Heading]</p><p class="ph-t">[Text]</p></div></section>';
    var rest = p.photos.slice(1);
    if (rest.length) html += '<section class="worn" aria-label="More photos">' + rest.map(function (ph) {
      return "<figure style=\"margin:0\">" + S.img(ph, { size: 960, sizes: "(max-width: 900px) 50vw, 25vw" }) + "</figure>";
    }).join("") + "</section>";
    var others = S.products.filter(function (o) { return o.id !== p.id; });
    html += '<section class="rail related" aria-labelledby="rel-h"><div class="rail-head"><h2 class="label" id="rel-h">Connected pieces</h2>' +
      '<a class="btn" href="collection.html">Collection<span class="arrow"></span></a></div>' +
      '<div class="rail-track">' + others.map(function (o) { return plate(o, false); }).join("") + "</div></section>";
    root.innerHTML = html;

    root.querySelectorAll("[data-photo]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ph = p.photos[+b.getAttribute("data-photo")];
        document.getElementById("main-photo").innerHTML = S.img(ph, { size: 1600, sizes: "(max-width: 900px) 100vw, 55vw", eager: true });
        root.querySelectorAll("[data-photo]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    if (page === "home") home();
    if (page === "collection") collection();
    if (page === "product") product();
  });
})();
