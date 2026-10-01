/*
 * Origin map: renders data/origin-map.js as SVG, handles pan / zoom / pinch,
 * and keeps the selection in the URL:
 *   map.html?node=a1-1               node panel open, camera on that node
 *   map.html?node=a1-1&piece=piece-a piece detail open inside the panel
 *   map.html?node=a1-1&from=piece-a  node panel with that piece highlighted
 * Query strings need no server rewrites, so this works on GitHub Pages
 * (including a repository subpath), on refresh, and with browser Back.
 */
(function () {
  "use strict";
  var S = window.VasiliSite, G = window.VasiliGlyphs, M = S.map;
  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var stage = document.getElementById("stage");
  var svg = document.getElementById("map");
  var panel = document.getElementById("panel");
  var panelContent = document.getElementById("panel-content");
  var trailEl = document.getElementById("trail");
  var hint = document.getElementById("hint");

  /* ---------- graph ---------- */
  var nodes = {}, children = { chain: [] };
  var CHAIN = { id: "chain", parent: null, depth: 0 };
  nodes.chain = CHAIN;
  M.nodes.forEach(function (n) { nodes[n.id] = n; children[n.id] = []; });
  M.nodes.forEach(function (n) { (children[n.parent] = children[n.parent] || []).push(n.id); });
  M.nodes.forEach(function (n) {
    var d = 0, p = n;
    while (p && p.id !== "chain") { d++; p = nodes[p.parent]; }
    n.depth = d;
  });
  function ancestry(id) {
    var out = [], p = nodes[id];
    while (p) { out.unshift(p.id); p = p.parent ? nodes[p.parent] : null; }
    return out;
  }

  var C = M.chain;
  function chainY(x) {
    return C.y + C.amp * Math.sin((x - C.x0) / (C.x1 - C.x0) * C.waves * Math.PI * 2);
  }

  /* ---------- render ---------- */
  function el(tag, attrs, html) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (html) e.innerHTML = html;
    return e;
  }
  function href(params) {
    var q = new URLSearchParams();
    Object.keys(params).forEach(function (k) { if (params[k]) q.set(k, params[k]); });
    var s = q.toString();
    return s ? "?" + s : "map.html";
  }

  function renderChain() {
    var layer = document.getElementById("chain-layer");
    var pts = [], i;
    for (i = 0; i < C.links; i++) {
      var x = C.x0 + (C.x1 - C.x0) * i / (C.links - 1);
      pts.push({ x: x, y: chainY(x) });
    }
    var a = el("a", { href: href({ node: "chain" }), class: "chain-node", "data-node": "chain",
      "aria-label": "The chain — " + S.code("chain") });
    a.appendChild(el("path", { class: "hit", d: "M" + pts.map(function (p) { return p.x + " " + p.y; }).join("L"),
      style: "stroke-width:" + C.R * 3 + ";stroke:transparent;fill:none" }));
    // end spikes + spikes first, then links, each tagged for the intro stagger
    var mid = (C.links - 1) / 2, last = pts.length - 1, e = C.R * 4.2;
    // outer spikes continue the chain's direction past the first and last link
    [[pts[0], pts[1]], [pts[last], pts[last - 1]]].forEach(function (pair) {
      var p = pair[0], q = pair[1], l = Math.hypot(p.x - q.x, p.y - q.y);
      a.appendChild(el("g", { class: "chain-spike", style: "--i:" + mid },
        G.spike(p.x, p.y, p.x + (p.x - q.x) / l * e, p.y + (p.y - q.y) / l * e, C.R * 0.42)));
    });
    for (i = 0; i < pts.length - 1; i++) {
      a.appendChild(el("g", { class: "chain-spike", style: "--i:" + Math.abs(i + 0.5 - mid).toFixed(1) },
        G.spike(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, C.R * 0.36)));
    }
    for (i = 0; i < pts.length; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(last, i + 1)];
      var ang = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
      a.appendChild(el("g", { class: "chain-link", style: "--i:" + Math.abs(i - mid).toFixed(1) },
        G.bigLink(pts[i].x, pts[i].y, ang, C.R)));
    }
    layer.appendChild(a);
  }

  function edgeY(n, toward) { return n.y + (toward > n.y ? n.r : -n.r); }

  function renderLines() {
    var layer = document.getElementById("line-layer");
    M.nodes.forEach(function (n) {
      var d, p = nodes[n.parent];
      if (n.parent === "chain") {
        var cy = chainY(n.x), above = n.y < cy;
        d = "M" + n.x + " " + (above ? n.y + n.r : n.y - n.r) + "V" + (above ? cy - C.R * 1.6 : cy + C.R * 1.6);
      } else if (p.branch === "trunk") {
        d = "M" + p.x + " " + edgeY(p, n.y) + "V" + n.y + "H" + (n.x + (n.x > p.x ? -n.r : n.r));
        if (Math.abs(n.x - p.x) < 1) d = "M" + p.x + " " + edgeY(p, n.y) + "V" + edgeY(n, p.y);
      } else {
        var mid = (edgeY(p, n.y) + edgeY(n, p.y)) / 2;
        d = "M" + p.x + " " + edgeY(p, n.y) + "V" + mid + "H" + n.x + "V" + edgeY(n, p.y);
      }
      layer.appendChild(el("path", { class: "ln", d: d, id: "ln-" + n.id, pathLength: 1, style: "--d:" + n.depth }));
    });
    (window.VASILI_CONNECTIONS || []).forEach(function (c) {
      var n = nodes[c.node];
      if (!n) return;
      var r = 66, dx = c.at[0] - n.x, dy = c.at[1] - n.y, len = Math.hypot(dx, dy);
      layer.appendChild(el("path", {
        class: "ln-piece" + (c.confirmed ? " is-confirmed" : ""), id: "lp-" + c.product,
        d: "M" + (n.x + dx / len * n.r) + " " + (n.y + dy / len * n.r) + "L" + (c.at[0] - dx / len * r) + " " + (c.at[1] - dy / len * r)
      }));
    });
  }

  function renderNodes() {
    var layer = document.getElementById("node-layer");
    M.nodes.forEach(function (n) {
      var a = el("a", { href: href({ node: n.id }), class: "node", "data-node": n.id, style: "--d:" + n.depth,
        "aria-label": "Drawing " + S.code(n.id) + (children[n.id].length ? ", " + children[n.id].length + " branches" : "") });
      a.appendChild(el("circle", { class: "halo", cx: n.x, cy: n.y, r: n.r * 1.9 }));
      a.appendChild(el("circle", { class: "hit", cx: n.x, cy: n.y, r: n.r }));
      if (n.circled) a.appendChild(el("circle", { class: "ring", cx: n.x, cy: n.y, r: n.r - 3 }));
      a.appendChild(el("g", { class: "art", transform: "translate(" + n.x + " " + n.y + ")" }, G.render(n.glyph)));
      var below = n.y > C.y || n.parent === "chain";
      a.appendChild(el("text", { class: "nlabel", x: n.x + (n.circled ? 0 : n.r * 0.95), y: n.circled ? n.y + n.r + 22 : n.y + n.r + 4,
        "aria-hidden": "true" }, S.code(n.id)));
      layer.appendChild(a);
    });
  }

  function renderPieces() {
    var layer = document.getElementById("piece-layer");
    var defs = el("defs", {});
    layer.appendChild(defs);
    (window.VASILI_CONNECTIONS || []).forEach(function (c) {
      var p = S.product(c.product);
      if (!p || !nodes[c.node]) return;
      var r = 66, x = c.at[0], y = c.at[1];
      defs.appendChild(el("clipPath", { id: "clip-" + p.id }, '<circle cx="' + x + '" cy="' + y + '" r="' + (r - 4) + '"/>'));
      var a = el("a", { href: href({ node: c.node, piece: p.id }), class: "piece", "data-piece": p.id,
        "aria-label": "Piece " + p.code + ", from drawing " + S.code(c.node) + (c.confirmed ? "" : " (connection to confirm)") });
      a.appendChild(el("circle", { class: "p-ring2", cx: x, cy: y, r: r + 7 }));
      a.appendChild(el("circle", { cx: x, cy: y, r: r - 4, fill: "#eef1f4", stroke: "none" }));
      a.appendChild(el("image", { href: S.src(p.photos[0].base, 480), x: x - r, y: y - r, width: r * 2, height: r * 2,
        preserveAspectRatio: "xMidYMid slice", "clip-path": "url(#clip-" + p.id + ")" }));
      a.appendChild(el("circle", { class: "p-ring", cx: x, cy: y, r: r - 4 }));
      a.appendChild(el("text", { class: "nlabel", x: x, y: y + r + 30, "aria-hidden": "true" }, p.code));
      layer.appendChild(a);
    });
  }

  /* ---------- camera ---------- */
  var WORLD = { x: 120, y: 120, w: M.width - 240, h: M.height - 180 };
  var cam = { cx: M.width / 2, cy: M.height / 2, s: 1 };
  var anim = null;

  function size() { var r = stage.getBoundingClientRect(); return { w: r.width || 1, h: r.height || 1 }; }
  var TOOLBAR = 84; // px kept clear at the bottom for the map controls
  function fitScale() { var z = size(); return Math.max(WORLD.w / (z.w * 0.96), WORLD.h / Math.max(120, z.h - TOOLBAR - 20)); }
  function limits() { var f = fitScale(); return { min: Math.min(0.32, f), max: f * 1.5 }; }
  function apply() {
    var z = size();
    svg.setAttribute("viewBox", [cam.cx - z.w * cam.s / 2, cam.cy - z.h * cam.s / 2, z.w * cam.s, z.h * cam.s].join(" "));
  }
  function clampCam(c) {
    var l = limits();
    c.s = Math.min(l.max, Math.max(l.min, c.s));
    // allow the camera past the canvas edge by up to half a screen, so nodes near
    // an edge can still be centred beside the panel / above the bottom sheet
    var z = size(), hx = z.w * c.s / 2, hy = z.h * c.s / 2;
    c.cx = Math.min(M.width + hx - 200, Math.max(200 - hx, c.cx));
    c.cy = Math.min(M.height + hy - 200, Math.max(200 - hy, c.cy));
    return c;
  }
  function moveTo(target, instant) {
    clampCam(target);
    if (anim) cancelAnimationFrame(anim);
    if (instant || reduceMotion) { cam = target; apply(); return; }
    var from = { cx: cam.cx, cy: cam.cy, s: cam.s }, t0 = performance.now(), dur = 750;
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      cam = { cx: from.cx + (target.cx - from.cx) * e, cy: from.cy + (target.cy - from.cy) * e,
        s: Math.exp(Math.log(from.s) + (Math.log(target.s) - Math.log(from.s)) * e) };
      apply();
      anim = t < 1 ? requestAnimationFrame(step) : null;
    })(t0);
  }
  /* Fit a world box into the part of the stage that the panel doesn't cover. */
  function focusBox(b, instant) {
    var z = size(), rightCover = 0, bottomCover = 0;
    if (!panel.hidden) {
      var pr = panel.getBoundingClientRect();
      if (pr.width < z.w * 0.95) rightCover = pr.width; else bottomCover = pr.height;
    }
    var aw = z.w - rightCover, ah = z.h - bottomCover - 60;
    var s = Math.max(b.w / (aw * 0.8), b.h / (ah * 0.8));
    s = Math.max(s, 0.95);
    moveTo({ cx: b.x + b.w / 2 + rightCover * s / 2, cy: b.y + b.h / 2 + (bottomCover - 50) * s / 2, s: s }, instant);
  }
  function overviewCam(instant) {
    var s = fitScale(), z = size();
    // portrait phones: fit the height instead so the drawings stay legible; drag to see the sides
    if (z.w < 700 && z.h > z.w) s = Math.min(s, (WORLD.h / Math.max(120, z.h - TOOLBAR - 20)) * 0.8);
    moveTo({ cx: WORLD.x + WORLD.w / 2, cy: WORLD.y + WORLD.h / 2 + (TOOLBAR / 2) * s, s: s }, instant);
  }

  function boxFor(id) {
    if (id === "chain") return WORLD;
    var n = nodes[id], pts = [[n.x, n.y, n.r]];
    if (nodes[n.parent] && n.parent !== "chain") { var p = nodes[n.parent]; pts.push([p.x, p.y, p.r * 0.6]); }
    children[id].forEach(function (c) { pts.push([nodes[c].x, nodes[c].y, nodes[c].r]); });
    (window.VASILI_CONNECTIONS || []).forEach(function (c) { if (c.node === id) pts.push([c.at[0], c.at[1], 80]); });
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(function (q) { x0 = Math.min(x0, q[0] - q[2]); y0 = Math.min(y0, q[1] - q[2]); x1 = Math.max(x1, q[0] + q[2]); y1 = Math.max(y1, q[1] + q[2]); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /* ---------- pointer / wheel / keyboard navigation ---------- */
  var pointers = {}, drag = null, suppressClick = false;
  function toWorld(px, py) {
    var z = size();
    return { x: cam.cx + (px - z.w / 2) * cam.s, y: cam.cy + (py - z.h / 2) * cam.s };
  }
  function zoomAt(px, py, k) {
    var z = size(), w = toWorld(px, py), l = limits();
    var s = Math.min(l.max, Math.max(l.min, cam.s * k));
    cam = clampCam({ cx: w.x - (px - z.w / 2) * s, cy: w.y - (py - z.h / 2) * s, s: s });
    apply();
  }
  function local(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    pointers[e.pointerId] = local(e);
    var ids = Object.keys(pointers);
    if (ids.length === 1) drag = { x: pointers[ids[0]].x, y: pointers[ids[0]].y, cx: cam.cx, cy: cam.cy, moved: false, id: e.pointerId };
    if (ids.length === 2) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      drag = { pinch: Math.hypot(a.x - b.x, a.y - b.y), s: cam.s, moved: true };
    }
  });
  stage.addEventListener("pointermove", function (e) {
    if (!pointers[e.pointerId] || !drag) return;
    pointers[e.pointerId] = local(e);
    var ids = Object.keys(pointers);
    if (ids.length >= 2 && drag.pinch) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(mx, my, (drag.s * drag.pinch / dist) / cam.s);
      return;
    }
    var p = pointers[e.pointerId], dx = p.x - drag.x, dy = p.y - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      dismissHint();
    }
    if (drag.moved && drag.cx != null) {
      cam = clampCam({ cx: drag.cx - dx * cam.s, cy: drag.cy - dy * cam.s, s: cam.s });
      apply();
    }
  });
  function endPointer(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    if (drag && drag.moved) { suppressClick = true; setTimeout(function () { suppressClick = false; }, 60); }
    if (!Object.keys(pointers).length) { drag = null; stage.classList.remove("is-dragging"); }
    else if (drag && drag.pinch) {
      var id = Object.keys(pointers)[0];
      drag = { x: pointers[id].x, y: pointers[id].y, cx: cam.cx, cy: cam.cy, moved: true, id: +id };
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    var p = local(e), dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(p.x, p.y, Math.exp(dy * (e.ctrlKey ? 0.01 : 0.0018)));
    dismissHint();
  }, { passive: false });
  stage.addEventListener("click", function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  stage.addEventListener("keydown", function (e) {
    var step = 80, z = size();
    var moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      moveTo({ cx: cam.cx + moves[e.key][0] * cam.s, cy: cam.cy + moves[e.key][1] * cam.s, s: cam.s }, true);
    } else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomAt(z.w / 2, z.h / 2, 1 / 1.3); }
    else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomAt(z.w / 2, z.h / 2, 1.3); }
  });

  document.getElementById("zoom-in").addEventListener("click", function () { var z = size(); zoomAt(z.w / 2, z.h / 2, 1 / 1.4); });
  document.getElementById("zoom-out").addEventListener("click", function () { var z = size(); zoomAt(z.w / 2, z.h / 2, 1.4); });
  document.getElementById("overview").addEventListener("click", function () { navigate({}); overviewCam(); });

  function dismissHint() { if (hint) hint.classList.add("is-gone"); }

  /* ---------- state + URL ---------- */
  var current = { node: null, piece: null, from: null };
  var lastFocusNode = null;

  function readURL() {
    var q = new URLSearchParams(location.search);
    var st = { node: q.get("node"), piece: q.get("piece"), from: q.get("from") };
    if (st.piece && !S.product(st.piece)) st.piece = null;
    if (st.piece && !st.node) { var c = S.connectionFor(st.piece); st.node = c ? c.node : null; }
    if (st.node && !nodes[st.node]) st.node = null;
    if (!st.node) st.piece = null;
    return st;
  }
  function navigate(st, replace) {
    var url = href({ node: st.node, piece: st.piece, from: st.from });
    history[replace ? "replaceState" : "pushState"](null, "", url);
    render(readURL(), { user: true });
  }
  window.addEventListener("popstate", function () { render(readURL(), { user: true, fromHistory: true }); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var h = a.getAttribute("href") || "";
    if (h.charAt(0) !== "?" && h !== "map.html") return;
    e.preventDefault();
    if (a.closest("dialog")) a.closest("dialog").close();
    dismissHint();
    var q = new URLSearchParams(h.charAt(0) === "?" ? h.slice(1) : "");
    navigate({ node: q.get("node"), piece: q.get("piece"), from: q.get("from") });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden && !document.getElementById("index-dialog").open) {
      e.preventDefault();
      closePanel();
    }
  });
  function closePanel() {
    navigate({});
  }

  /* ---------- selection visuals ---------- */
  function updateClasses(st) {
    var path = st.node ? ancestry(st.node) : [];
    var awake = { chain: true };
    children.chain.forEach(function (id) { awake[id] = true; });
    path.forEach(function (id) { awake[id] = true; (children[id] || []).forEach(function (c) { awake[c] = true; }); });

    svg.querySelectorAll(".node").forEach(function (a) {
      var id = a.getAttribute("data-node");
      a.classList.toggle("is-selected", id === st.node && !st.piece);
      a.classList.toggle("is-path", path.indexOf(id) !== -1);
      a.classList.toggle("is-dormant", !awake[id]);
      a.setAttribute("tabindex", awake[id] ? "0" : "-1");
    });
    svg.querySelector(".chain-node").classList.toggle("is-selected", st.node === "chain");
    M.nodes.forEach(function (n) {
      var ln = document.getElementById("ln-" + n.id);
      ln.classList.toggle("is-path", path.indexOf(n.id) !== -1);
      ln.classList.toggle("is-dormant", !awake[n.id]);
    });
    svg.querySelectorAll(".piece").forEach(function (a) {
      var id = a.getAttribute("data-piece");
      a.classList.toggle("is-selected", id === st.piece || id === st.from);
      a.classList.toggle("is-dim", !!st.piece && id !== st.piece);
    });
  }

  function renderTrail(st) {
    if (!st.node) { trailEl.innerHTML = ""; return; }
    var path = ancestry(st.node), html = "";
    path.forEach(function (id, i) {
      var isLast = i === path.length - 1 && !st.piece;
      html += (i ? '<span class="sep" aria-hidden="true">/</span>' : "") +
        '<a href="' + href({ node: id }) + '"' + (isLast ? ' aria-current="location"' : "") + ">" + S.code(id) + "</a>";
    });
    if (st.piece) html += '<span class="sep" aria-hidden="true">/</span><a href="' + href({ node: st.node, piece: st.piece }) +
      '" aria-current="location">' + S.esc(S.product(st.piece).code) + "</a>";
    trailEl.innerHTML = html;
  }

  /* ---------- panel ---------- */
  function confirmTag(c) { return c && c.confirmed ? "" : '<span class="tag-confirm">[Connection to confirm]</span>'; }
  function closeBtn() { return '<button type="button" class="panel-close" data-close>Close</button>'; }

  function pieceCard(p, nodeId, highlight) {
    var c = S.connectionFor(p.id);
    return '<li><a class="piece-link' + (highlight ? " is-highlight" : "") + '" href="' + href({ node: nodeId, piece: p.id }) + '">' +
      '<div class="frame">' + S.img(p.photos[0], { size: 480, sizes: "180px" }) + "</div>" +
      '<span class="meta"><span class="code">' + p.code + '</span><span class="name">[Product name]</span>' + confirmTag(c) + "</span></a></li>";
  }

  function nodePanel(st) {
    var id = st.node, n = nodes[id], kids = children[id] || [];
    var pieces = S.productsAt(id);
    var depthLabel = id === "chain" ? "Origin" : "Level " + n.depth;
    var h = '<header class="panel-head"><span class="code">' + S.code(id) + '</span><span class="label">' + depthLabel + "</span>" + closeBtn() + "</header>";
    if (id !== "chain") h += '<figure class="panel-glyph" aria-hidden="true">' + S.glyphSvg(id) + "</figure>";
    h += '<h2 class="ph-h" id="panel-title" tabindex="-1">[Heading]</h2><p class="ph-t">[Text]</p>';
    if (pieces.length) {
      h += '<section aria-labelledby="pc-h"><h3 class="label" id="pc-h">Pieces</h3><ul class="piece-list">' +
        pieces.map(function (p) { return pieceCard(p, id, p.id === st.from); }).join("") + "</ul></section>";
    }
    if (id === "chain" || n.depth === 1) {
      h += '<div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>';
    }
    if (kids.length) {
      h += '<section aria-labelledby="br-h"><h3 class="label" id="br-h">Branches</h3><ul class="branch-list">' +
        kids.map(function (k) {
          var count = children[k].length + S.productsAt(k).length;
          return '<li><a href="' + href({ node: k }) + '">' + S.glyphSvg(k) + '<span class="code">' + S.code(k) + "</span>" +
            (count ? '<span class="n">' + count + " →</span>" : "") + "</a></li>";
        }).join("") + "</ul></section>";
    }
    h += '<nav class="panel-nav" aria-label="Panel navigation">';
    if (n.parent) h += '<a class="btn" href="' + href({ node: n.parent }) + '"><span class="arrow arrow--back"></span>Toward origin · ' + S.code(n.parent) + "</a>";
    h += '<a class="btn" href="map.html" data-overview>Overview</a></nav>';
    return h;
  }

  function piecePanel(st) {
    var p = S.product(st.piece), c = S.connectionFor(p.id), originId = c ? c.node : st.node;
    var h = '<header class="panel-head"><span class="code">' + p.code + '</span><span class="label">Piece</span>' + closeBtn() + "</header>";
    h += '<figure class="piece-main" id="piece-main">' + S.img(p.photos[0], { size: 960, sizes: "(max-width: 900px) 100vw, 420px" }) + "</figure>";
    if (p.photos.length > 1) {
      h += '<div class="thumbs" role="group" aria-label="Photos">' + p.photos.map(function (ph, i) {
        return '<button type="button" data-photo="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Photo ' + (i + 1) + '">' +
          '<img src="' + S.src(ph.base, 480) + '" alt="" loading="lazy"></button>';
      }).join("") + "</div>";
    }
    h += '<h2 class="ph-h" id="panel-title" tabindex="-1">[Product name]</h2><p class="ph-t">[Product details]</p>';
    h += '<div class="origin-row"><span class="label">Origin</span><a href="' + href({ node: originId, from: p.id }) + '">' + S.code(originId) + "</a>" + confirmTag(c) + "</div>";
    h += '<div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>';
    h += '<nav class="panel-nav" aria-label="Piece navigation">' +
      '<a class="btn btn--solid" href="product.html?id=' + encodeURIComponent(p.id) + '">View piece<span class="arrow"></span></a>' +
      '<a class="btn" href="' + href({ node: originId, from: p.id }) + '"><span class="arrow arrow--back"></span>Back to origin</a></nav>';
    var others = S.products.filter(function (o) { return o.id !== p.id && S.connectionFor(o.id); });
    if (others.length) {
      h += '<section aria-labelledby="cp-h"><h3 class="label" id="cp-h">Connected pieces</h3><ul class="piece-list">' +
        others.map(function (o) { return pieceCard(o, S.connectionFor(o.id).node, false); }).join("") + "</ul></section>";
    }
    return h;
  }

  function wirePanel(st) {
    panelContent.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closePanel); });
    var ov = panelContent.querySelector("[data-overview]");
    if (ov) ov.addEventListener("click", function () { setTimeout(function () { overviewCam(); }, 0); });
    panelContent.querySelectorAll("[data-photo]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = S.product(st.piece), ph = p.photos[+b.getAttribute("data-photo")];
        document.getElementById("piece-main").innerHTML = S.img(ph, { size: 960, sizes: "(max-width: 900px) 100vw, 420px" });
        panelContent.querySelectorAll("[data-photo]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      });
    });
  }

  function render(st, opts) {
    opts = opts || {};
    var prev = current;
    current = st;
    updateClasses(st);
    renderTrail(st);
    if (!st.node) {
      if (!panel.hidden) {
        panel.hidden = true;
        document.body.classList.remove("has-panel");
        var back = lastFocusNode && svg.querySelector('[data-node="' + lastFocusNode + '"]');
        if (opts.user && back) back.focus({ preventScroll: true });
      }
      document.title = "Explore — Vasili";
      if (opts.fromHistory || opts.initial) overviewCam(opts.initial);
      return;
    }
    panelContent.innerHTML = st.piece ? piecePanel(st) : nodePanel(st);
    panel.hidden = false;
    panel.scrollTop = 0;
    document.body.classList.add("has-panel");
    wirePanel(st);
    lastFocusNode = st.node;
    document.title = (st.piece ? S.product(st.piece).code : S.code(st.node)) + " — Explore — Vasili";

    var box;
    if (st.piece) {
      var c = S.connectionFor(st.piece);
      box = c ? { x: c.at[0] - 130, y: c.at[1] - 130, w: 260, h: 260 } : boxFor(st.node);
      if (c) { var n = nodes[c.node]; box = union(box, { x: n.x - n.r, y: n.y - n.r, w: n.r * 2, h: n.r * 2 }); }
    } else box = boxFor(st.node);
    if (st.node === "chain") overviewCam(opts.initial);
    else if (!(prev.node === st.node && prev.piece === st.piece)) focusBox(box, opts.initial);
    if (opts.user || opts.initial) {
      var title = document.getElementById("panel-title");
      if (title && (opts.user || opts.initial)) title.focus({ preventScroll: true });
    }
  }
  function union(a, b) {
    var x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    return { x: x, y: y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
  }

  /* ---------- index (list view of the whole map) ---------- */
  function buildIndex() {
    function list(id) {
      var kids = children[id] || [];
      if (!kids.length) return "";
      return "<ul>" + kids.map(function (k) {
        return '<li><a href="' + href({ node: k }) + '">' + S.code(k) + "</a>" + list(k) + "</li>";
      }).join("") + "</ul>";
    }
    var html = '<ul><li><a href="' + href({ node: "chain" }) + '">' + S.code("chain") + "</a>" + list("chain") + "</li></ul>";
    html += '<div class="idx-pieces"><h3 class="label">Pieces</h3><ul>' + (window.VASILI_CONNECTIONS || []).map(function (c) {
      var p = S.product(c.product);
      return p ? '<li><a href="' + href({ node: c.node, piece: p.id }) + '">' + p.code + " · " + S.code(c.node) + "</a></li>" : "";
    }).join("") + '<li><a href="collection.html">Collection</a></li></ul></div>';
    document.getElementById("index-list").innerHTML = html;
    var dlg = document.getElementById("index-dialog");
    document.getElementById("map-index-open").addEventListener("click", function () { dlg.showModal(); });
    document.getElementById("index-close").addEventListener("click", function () { dlg.close(); });
  }

  /* ---------- boot ---------- */
  renderLines();
  renderChain();
  renderNodes();
  renderPieces();
  buildIndex();
  apply();
  overviewCam(true);
  var initial = readURL();
  if (initial.node) { dismissHint(); render(initial, { initial: true }); }
  else render(initial, {});
  // drop the intro class once the reveal is done so state transitions stay quick
  setTimeout(function () { svg.classList.remove("is-intro"); }, reduceMotion ? 0 : 3200);
  window.addEventListener("resize", function () {
    if (current.node && current.node !== "chain") focusBox(boxFor(current.node), true); else overviewCam(true);
  });
})();
