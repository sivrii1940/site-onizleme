/* Silivri Temizlik Koltuk Yıkama [Buharlı] — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var WA = "https://wa.me/905427275728";
  var TEL = "tel:+905427275728";
  var BRAND = "Silivri Temizlik Koltuk Yıkama";
  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };

  /* ---- kit/status.js'ten kopya ---- */
  function istanbulNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[o.weekday], m: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { d: (n.getDay() + 6) % 7, m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function openStatus(H) {
    var DAY = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    var n = istanbulNow(), r = { open: false, all24: false, closesAt: null, opensAt: null, opensWhen: null, dayIndex: n.d, minutes: n.m, known: !!(H && Object.keys(H).length) };
    if (!r.known) { r.text = "Saatler için arayın"; return r; }
    function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
    function ranges(d) { return H[String((d + 7) % 7)] || []; }
    ranges(n.d).forEach(function (x) {
      if (r.open) return;
      if (x[0] === "00:00" && x[1] === "24:00") { r.open = true; r.all24 = true; return; }
      var s = mins(x[0]), e = mins(x[1]); if (e <= s) e += 1440;
      if (n.m >= s && n.m < e) { r.open = true; r.closesAt = x[1] === "24:00" ? "00:00" : x[1]; }
    });
    if (!r.open) ranges(n.d - 1).forEach(function (x) {
      var s = mins(x[0]), e = mins(x[1]);
      if (e <= s && n.m < e && !r.open) { r.open = true; r.closesAt = x[1]; }
    });
    if (!r.open) {
      for (var k = 0; k < 8 && !r.opensAt; k++) {
        var dd = (n.d + k) % 7, rs = ranges(dd);
        for (var j = 0; j < rs.length; j++) {
          if (k > 0 || mins(rs[j][0]) > n.m) { r.opensAt = rs[j][0]; r.opensWhen = k === 0 ? "bugün" : (k === 1 ? "yarın" : DAY[dd]); break; }
        }
      }
    }
    r.text = r.all24 ? "Şu an açık, 24 saat hizmet" : r.open ? "Şu an açık, kapanış " + r.closesAt : r.opensAt ? "Şu an kapalı, açılış " + r.opensWhen + " " + r.opensAt : "Saatler için arayın";
    return r;
  }

  /* ---- yardımcılar ---- */
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* yok say */ } }
  function fmt(n) { try { return n.toLocaleString("tr-TR", { maximumFractionDigits: 1 }); } catch (e) { return String(Math.round(n * 10) / 10).replace(".", ","); } }
  function copyText(text, btn) {
    function ok() {
      if (!btn) return;
      if (!btn.hasAttribute("data-orig")) btn.setAttribute("data-orig", btn.innerHTML);
      btn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Kopyalandı';
      btn.classList.add("copied");
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.innerHTML = btn.getAttribute("data-orig"); btn.classList.remove("copied"); }, 1800);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { /* yok */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  /* ---- canlı durum ---- */
  function initStatus() {
    var s = openStatus(HOURS);
    var txt = s.all24 ? "Şu an açık · her gün 24 saat açık" : s.text;
    $$("[data-status]").forEach(function (el) {
      el.textContent = txt;
      var host = el.closest("[data-status-host]");
      if (host) host.classList.toggle("is-open", s.open);
    });
    $$("tr[data-day]").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-day") === s.dayIndex); });
  }

  /* ---- menü ---- */
  function initNav() {
    var btn = $(".nav-toggle"), nav = $("#menu");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !btn.contains(e.target)) { btn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
    });
  }

  /* ---- imza: temizlik silgisi ---- */
  function initEraser() {
    var stage = $("[data-eraser-stage]");
    if (!stage || !window.Path2D) return;
    var card = stage.closest("[data-tool]") || document;
    var svg = $("svg.sofa", stage), cv = $("canvas", stage), handle = $(".eraser", stage);
    var fill = $(".meter-fill", card), msg = $("[data-stage-msg]", card);
    var VW = 600, VH = 400, R = 36, START = { x: 556, y: 334 };
    var paths = $$(".fab", svg).map(function (p) { return new Path2D(p.getAttribute("d")); });
    var ctx = cv.getContext("2d");
    var mini = document.createElement("canvas"); mini.width = 150; mini.height = 100;
    var mctx = mini.getContext("2d", { willReadFrequently: true });
    var scale = 1, strokes = [], base = 1, done = false, pos = { x: START.x, y: START.y }, last = null;
    var dragging = false, off = { x: 0, y: 0 }, running = false, lastPuff = 0, pending = false, lastMsg = -1;

    function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    function blob(c, x, y, r, rnd) {
      c.beginPath();
      for (var i = 0; i <= 12; i++) {
        var a = i / 12 * Math.PI * 2, rr = r * (0.75 + rnd() * 0.45);
        var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.8;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.fill();
    }
    function dirt(c, s, detail) {
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = "source-over";
      c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      c.setTransform(s, 0, 0, s, 0, 0);
      /* her parça ayrı doldurulur (ters yönlü yollar birleşimde birbirini silmesin); ayrıntılar yalnız bu katmanın üstüne çizilir */
      c.fillStyle = "rgb(118,106,84)";
      paths.forEach(function (p) { c.fill(p); });
      c.globalCompositeOperation = "source-atop";
      if (detail) {
        var rnd = rng(7), i, g;
        for (i = 0; i < 70; i++) { c.fillStyle = "rgba(88,72,50," + (0.08 + rnd() * 0.16).toFixed(2) + ")"; c.beginPath(); c.ellipse(60 + rnd() * 480, 90 + rnd() * 240, 8 + rnd() * 28, 5 + rnd() * 16, rnd() * 3, 0, Math.PI * 2); c.fill(); }
        g = c.createLinearGradient(0, 160, 0, 200); g.addColorStop(0, "rgba(64,48,30,.42)"); g.addColorStop(1, "rgba(64,48,30,0)");
        c.fillStyle = g; c.fillRect(56, 160, 96, 40); c.fillRect(448, 160, 96, 40);
        g = c.createLinearGradient(0, 262, 0, 292); g.addColorStop(0, "rgba(64,48,30,0)"); g.addColorStop(1, "rgba(64,48,30,.38)");
        c.fillStyle = g; c.fillRect(138, 262, 324, 30);
        c.fillStyle = "rgba(108,70,36,.34)"; c.beginPath(); c.ellipse(206, 256, 18, 8.5, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = "rgba(92,56,28,.8)"; c.lineWidth = 3; c.beginPath(); c.ellipse(206, 256, 19, 9.5, 0, 0, Math.PI * 2); c.stroke();
        c.fillStyle = "rgba(92,56,28,.6)"; [[232, 250, 3], [238, 262, 2.2], [183, 263, 2.6]].forEach(function (d) { c.beginPath(); c.arc(d[0], d[1], d[2], 0, Math.PI * 2); c.fill(); });
        c.fillStyle = "rgba(84,60,40,.45)"; blob(c, 398, 168, 24, rnd);
        c.fillStyle = "rgba(150,120,60,.42)"; blob(c, 196, 196, 15, rnd);
        c.fillStyle = "rgba(70,90,130,.4)"; c.fillRect(352, 266, 26, 3); c.fillRect(360, 271, 12, 2.5);
        for (i = 0; i < 90; i++) { c.fillStyle = "rgba(58,42,26,.75)"; c.fillRect(150 + rnd() * 300, 236 + rnd() * 50, 1.6 + rnd() * 2.2, 1.6 + rnd() * 2.2); }
        c.strokeStyle = "rgba(240,232,214,.8)"; c.lineWidth = 1.2;
        for (i = 0; i < 55; i++) { var x = 70 + rnd() * 460, y = 110 + rnd() * 200; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + rnd() * 12 - 6, y + rnd() * 12 - 6, x + rnd() * 18 - 9, y + rnd() * 18 - 9); c.stroke(); }
        for (i = 0; i < 500; i++) { c.fillStyle = "rgba(255,255,255," + (rnd() * 0.2).toFixed(2) + ")"; c.fillRect(rnd() * 600, 80 + rnd() * 250, 1.5, 1.5); }
      }
      c.restore();
    }
    function dab(c, s, x, y) {
      c.save(); c.setTransform(s, 0, 0, s, 0, 0); c.globalCompositeOperation = "destination-out";
      var g = c.createRadialGradient(x, y, R * 0.3, x, y, R);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill(); c.restore();
    }
    function countDirt() {
      var d = mctx.getImageData(0, 0, mini.width, mini.height).data, n = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 36) n++;
      return n;
    }
    function size() {
      var r = stage.getBoundingClientRect();
      if (!r.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      scale = cv.width / VW;
      dirt(ctx, scale, true);
      for (var i = 0; i < strokes.length; i += 2) dab(ctx, scale, strokes[i], strokes[i + 1]);
    }
    function place() { handle.style.left = (pos.x / VW * 100) + "%"; handle.style.top = (pos.y / VH * 100) + "%"; }
    function toVB(cx, cy) { var r = stage.getBoundingClientRect(); return { x: (cx - r.left) / r.width * VW, y: (cy - r.top) / r.height * VH }; }
    function puff(x, y) {
      if (reduce) return;
      var now = Date.now(); if (now - lastPuff < 70) return; lastPuff = now;
      var s = document.createElement("span"); s.className = "puff";
      s.style.left = (x / VW * 100) + "%"; s.style.top = ((y - 8) / VH * 100) + "%";
      s.style.setProperty("--dx", (Math.random() * 34 - 17).toFixed(0) + "px");
      stage.appendChild(s);
      s.addEventListener("animationend", function () { s.remove(); });
    }
    function eraseTo(x, y) {
      var from = last || { x: x, y: y };
      var dx = x - from.x, dy = y - from.y, dist = Math.sqrt(dx * dx + dy * dy), steps = Math.max(1, Math.ceil(dist / (R * 0.28)));
      for (var i = 1; i <= steps; i++) {
        var px = from.x + dx * i / steps, py = from.y + dy * i / steps;
        dab(ctx, scale, px, py); dab(mctx, mini.width / VW, px, py); strokes.push(px, py);
      }
      last = { x: x, y: y };
      puff(x, y);
      schedule();
    }
    function moveTo(x, y, erase) {
      pos.x = Math.max(12, Math.min(VW - 12, x)); pos.y = Math.max(40, Math.min(VH - 10, y));
      place();
      if (erase && !done) eraseTo(pos.x, pos.y);
    }
    var STEPS = [
      [0, "Silgiyi tutun, koltuğun üzerinde gezdirin."],
      [0.02, "Buhar işini yapıyor. Devam edin."],
      [0.4, "Yarıyı geçtiniz. Kolçakları ve kırlentleri unutmayın."],
      [0.75, "Az kaldı, köşelerde biraz daha gezdirin."]
    ];
    function progress() {
      if (done) return;
      var cov = 1 - countDirt() / base;
      var k = Math.max(0, Math.min(1, cov / 0.9));
      fill.style.width = (k * 100).toFixed(1) + "%";
      if (cov >= 0.9) { finish(); return; }
      var idx = 0; for (var i = 0; i < STEPS.length; i++) if (cov >= STEPS[i][0]) idx = i;
      if (idx !== lastMsg) { lastMsg = idx; msg.textContent = STEPS[idx][1]; }
    }
    function schedule() { if (pending) return; pending = true; setTimeout(function () { pending = false; progress(); }, 130); }
    function finish() {
      done = true; lastMsg = -1;
      stage.classList.add("is-clean");
      fill.style.width = "100%";
      msg.innerHTML = 'Çizimdeki koltuk temizlendi. Gerçek koltuğunuz için: <a href="#sayac">ne yıkatmak istediğinizi seçin</a>.';
    }
    function reset() {
      done = false; running = false; strokes = []; last = null; lastMsg = -1;
      stage.classList.remove("is-clean", "touched");
      dirt(mctx, mini.width / VW, false); base = countDirt() || 1;
      size();
      pos = { x: START.x, y: START.y }; place();
      fill.style.width = "0%"; msg.textContent = STEPS[0][1];
    }
    function auto() {
      if (running) return;
      if (done) reset();
      running = true; stage.classList.add("touched");
      var rows = [110, 146, 182, 218, 254, 290, 318], pts = [];
      rows.forEach(function (y, i) { var a = i % 2 ? 536 : 64, b = i % 2 ? 64 : 536; pts.push({ x: a, y: y }, { x: b, y: y }); });
      last = null; moveTo(pts[0].x, pts[0].y, true);
      if (reduce) {
        for (var j = 1; j < pts.length; j++) moveTo(pts[j].x, pts[j].y, true);
        running = false; progress(); if (!done) finish(); return;
      }
      var seg = 0, t0 = null;
      function step(ts) {
        if (!running) return;
        if (t0 === null) t0 = ts;
        var a = pts[seg], b = pts[seg + 1];
        var len = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)), dur = Math.max(120, len / 0.95);
        var k = Math.min(1, (ts - t0) / dur);
        moveTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, true);
        if (k >= 1) { seg++; t0 = ts; if (seg >= pts.length - 1) { running = false; progress(); if (!done) finish(); return; } }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function startDrag(e, target, offset) {
      running = false; dragging = true; last = null; off = offset;
      stage.classList.add("touched"); handle.classList.add("is-drag");
      try { target.setPointerCapture(e.pointerId); } catch (err) { /* yok */ }
    }
    function endDrag() { dragging = false; last = null; handle.classList.remove("is-drag"); progress(); }

    handle.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var p = toVB(e.clientX, e.clientY);
      startDrag(e, handle, { x: p.x - pos.x, y: p.y - pos.y });
    });
    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var p = toVB(e.clientX, e.clientY); moveTo(p.x - off.x, p.y - off.y, true);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) { handle.addEventListener(ev, function () { if (dragging) endDrag(); }); });
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0 || (e.target.closest && e.target.closest(".eraser"))) return;
      e.preventDefault();
      var p = toVB(e.clientX, e.clientY);
      startDrag(e, stage, { x: 0, y: 0 });
      moveTo(p.x, p.y, true);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging || (e.target.closest && e.target.closest(".eraser"))) return;
      var p = toVB(e.clientX, e.clientY); moveTo(p.x - off.x, p.y - off.y, true);
    });
    ["pointerup", "pointercancel"].forEach(function (ev) { stage.addEventListener(ev, function (e) { if (dragging && !(e.target.closest && e.target.closest(".eraser"))) endDrag(); }); });
    handle.addEventListener("keydown", function (e) {
      var st = e.shiftKey ? 44 : 18, m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (m) {
        e.preventDefault(); stage.classList.add("touched");
        if (pos.x === START.x && pos.y === START.y) { moveTo(300, 220, false); last = null; }
        if (!last) last = { x: pos.x, y: pos.y };
        moveTo(pos.x + m[0], pos.y + m[1], true);
      }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); auto(); }
    });
    handle.addEventListener("blur", function () { last = null; });
    var ab = $("[data-auto-clean]", card), rb = $("[data-reset]", card);
    if (ab) ab.addEventListener("click", auto);
    if (rb) rb.addEventListener("click", reset);

    reset();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  }

  /* ---- sayaçlar ---- */
  function makeCounters(root, onChange) {
    return $$("[data-counter]", root).map(function (el) {
      var c = { el: el, key: el.getAttribute("data-counter"), label: el.getAttribute("data-label"), n: 0 };
      var out = $("output", el);
      c.set = function (n, bump) {
        c.n = Math.max(0, Math.min(30, n | 0));
        out.textContent = c.n;
        el.classList.toggle("has-count", c.n > 0);
        if (bump && !reduce) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
        onChange();
      };
      $$("[data-step]", el).forEach(function (b) {
        b.addEventListener("click", function () { c.set(c.n + parseInt(b.getAttribute("data-step"), 10), true); });
      });
      return c;
    });
  }
  function bindCopy(root, getMsg) {
    var b = $("[data-copy]", root);
    if (b) b.addEventListener("click", function () { copyText(getMsg(), b); });
  }

  function initQuick() {
    var root = $("[data-quick]");
    if (!root) return;
    var bubble = $("[data-bubble]", root), wa = $("[data-wa]", root), more = $("[data-more]", root), msg = "";
    var counters = makeCounters(root, update);
    function update() {
      var items = counters.filter(function (c) { return c.n > 0; });
      var lines = ["Merhaba, " + BRAND + ". Sitenizden yazıyorum."];
      if (items.length) {
        lines.push("", "Yıkatmak istediklerim:");
        items.forEach(function (c) { lines.push("• " + c.label + ": " + c.n); });
        lines.push("", "Fiyat ve uygun gün hakkında bilgi alabilir miyim?");
      } else {
        lines.push("Koltuk, yatak ve halı yıkama hakkında bilgi almak istiyorum.");
      }
      msg = lines.join("\n");
      bubble.textContent = msg;
      wa.href = waLink(msg);
      if (more) more.href = "talep.html" + (items.length ? "?" + items.map(function (c) { return c.key + "=" + c.n; }).join("&") : "");
    }
    update();
    bindCopy(root, function () { return msg; });
  }

  /* ---- talep formu ---- */
  function initRequest() {
    var form = $("[data-full]");
    if (!form) return;
    var bubble = $("[data-bubble]"), wa = $("[data-wa]"), note = $("[data-count-note]"), msg = "";
    var rugs = [];
    var counters = makeCounters(form, update);
    var params = {};
    location.search.replace(/^\?/, "").split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) params[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ""); });
    function val(name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ""; }
    function vals(name) { return $$('[name="' + name + '"]:checked', form).map(function (e) { return e.value; }); }
    function text(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ""; }
    function byKey(k) { for (var i = 0; i < counters.length; i++) if (counters[i].key === k) return counters[i]; return null; }

    var en = $("#hali-en"), boy = $("#hali-boy"), addB = $("[data-rug-add]"), list = $("[data-rug-list]"), live = $("[data-rug-area]"), tot = $("[data-rug-total]");
    function area(a, b) { return a * b / 10000; }
    function liveArea() {
      var a = parseFloat(en.value), b = parseFloat(boy.value);
      live.textContent = a > 0 && b > 0 ? "Bu halı yaklaşık " + fmt(area(a, b)) + " m²" : "En ve boyu santimetre olarak girin";
    }
    function drawRugs() {
      list.innerHTML = "";
      var sum = 0;
      rugs.forEach(function (r, i) {
        sum += area(r[0], r[1]);
        var li = document.createElement("li");
        li.innerHTML = "<span>" + r[0] + " × " + r[1] + " cm · " + fmt(area(r[0], r[1])) + " m²</span>";
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("aria-label", (i + 1) + ". halı ölçüsünü sil");
        b.innerHTML = '<svg aria-hidden="true"><use href="#i-x"/></svg>';
        b.addEventListener("click", function () { rugs.splice(i, 1); drawRugs(); update(); });
        li.appendChild(b); list.appendChild(li);
      });
      tot.textContent = rugs.length ? "Toplam yaklaşık " + fmt(sum) + " m² (" + rugs.length + " halı)" : "";
    }
    if (en && boy && addB) {
      [en, boy].forEach(function (i) { i.addEventListener("input", liveArea); });
      addB.addEventListener("click", function () {
        var a = Math.round(parseFloat(en.value)), b = Math.round(parseFloat(boy.value));
        if (!(a > 0 && b > 0) || a > 2000 || b > 2000) { live.textContent = "Lütfen en ve boyu santimetre olarak girin (ör. 200 ve 300)."; en.focus(); return; }
        rugs.push([a, b]); en.value = ""; boy.value = ""; liveArea(); drawRugs();
        var h = byKey("hali"); if (h && h.n < rugs.length) h.set(rugs.length, true); else update();
      });
      liveArea();
    }

    function update() {
      var items = counters.filter(function (c) { return c.n > 0; });
      var L = ["Merhaba, " + BRAND + ". Sitenizden talep oluşturuyorum."];
      if (items.length) {
        L.push("", "Yıkatmak istediklerim:");
        items.forEach(function (c) {
          var extra = "";
          if (c.key === "koltuk" && val("duzen")) extra = " (" + val("duzen") + ")";
          if (c.key === "yatak" && val("yatak-boy")) extra = " (" + val("yatak-boy").toLocaleLowerCase("tr-TR") + ")";
          if (c.key === "hali" && rugs.length) {
            var sum = 0; rugs.forEach(function (r) { sum += area(r[0], r[1]); });
            extra = " (ölçüler: " + rugs.map(function (r) { return r[0] + "×" + r[1] + " cm"; }).join(", ") + "; toplam yaklaşık " + fmt(sum) + " m²)";
          }
          if (c.key === "hali" && val("hali-tur")) extra += " — tür: " + val("hali-tur").toLocaleLowerCase("tr-TR");
          L.push("• " + c.label + ": " + c.n + extra);
        });
      } else {
        L.push("", "Henüz eşya seçmedim, bilgi almak istiyorum.");
      }
      var k = val("kumas"); if (k && k !== "Bilmiyorum") L.push("", "Kumaş: " + k); else if (k && items.length) L.push("", "Kumaş: bilmiyorum");
      var lk = vals("leke"); if (lk.length) L.push("Lekeler: " + lk.join(", ").toLocaleLowerCase("tr-TR"));
      var semt = text("semt"); if (semt) L.push("Semt/mahalle: " + semt);
      var gun = val("gun"), saat = val("saat");
      if (gun || saat) L.push("Benim için uygun zaman: " + [gun, saat].filter(Boolean).join(", ").toLocaleLowerCase("tr-TR"));
      if (form.querySelector('[name="alim"]:checked')) L.push("Adresten alım ve teslim hakkında bilgi almak istiyorum.");
      if (form.querySelector('[name="foto"]:checked')) L.push("Bu mesajdan sonra fotoğraf göndereceğim.");
      var nt = text("not"); if (nt) L.push("", "Not: " + nt);
      var ad = text("ad"); if (ad) L.push("", "Adım: " + ad);
      L.push("", "Fiyat ve uygun gün hakkında bilgi verebilir misiniz?");
      msg = L.join("\n");
      bubble.textContent = msg;
      wa.href = waLink(msg);
      var total = 0; items.forEach(function (c) { total += c.n; });
      if (note) note.textContent = total ? total + " eşya seçildi. Mesaj gönderilmeye hazır." : "Henüz eşya seçmediniz; yine de genel bir soru gönderebilirsiniz.";
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    counters.forEach(function (c) { var v = parseInt(params[c.key], 10); if (v > 0) c.set(v, false); });
    update();
    bindCopy(document, function () { return msg; });
  }

  /* ---- seçiciler (kumaş, leke) ---- */
  function initPicker(toolSel, btnAttr, cardPrefix) {
    var tool = $(toolSel);
    if (!tool) return;
    var btns = $$("[" + btnAttr + "]", tool), wrap = $("." + (cardPrefix === "f-" ? "fabric-cards" : "stain-cards"), tool);
    if (!btns.length || !wrap) return;
    wrap.classList.add("is-picker");
    function pick(id, focus) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute(btnAttr) === id)); });
      $$(".on", wrap).forEach(function (c) { c.classList.remove("on"); });
      var card = $("#" + cardPrefix + id); if (card) { card.classList.add("on"); if (focus && window.innerWidth < 1024) card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }); }
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute(btnAttr), true); }); });
    pick(btns[0].getAttribute(btnAttr), false);
  }

  /* ---- lif kesiti ---- */
  function initFiber() {
    $$("[data-fiber]").forEach(function (root) {
      var scene = $(".fiber-scene", root), tabs = $$("[data-go]", root);
      var host = root.closest("section") || document, caps = $(".stage-captions", host);
      var cur = 1, timer = null, autoOn = root.hasAttribute("data-auto") && !reduce;
      if (caps) caps.classList.add("is-stepper");
      function go(n) {
        cur = n;
        scene.setAttribute("data-step", String(n));
        tabs.forEach(function (t) { t.setAttribute("aria-selected", String(+t.getAttribute("data-go") === n)); });
        if (caps) $$("li", caps).forEach(function (li) { li.classList.toggle("on", +li.getAttribute("data-s") === n); });
      }
      tabs.forEach(function (t) { t.addEventListener("click", function () { stop(); go(+t.getAttribute("data-go")); }); });
      var prev = $("[data-prev]", host), next = $("[data-next]", host);
      if (prev) prev.addEventListener("click", function () { stop(); go(cur > 1 ? cur - 1 : 4); });
      if (next) next.addEventListener("click", function () { stop(); go(cur < 4 ? cur + 1 : 1); });
      function stop() { autoOn = false; if (timer) { clearInterval(timer); timer = null; } }
      go(1);
      if (autoOn && "IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!autoOn) return;
            if (e.isIntersecting && !timer) timer = setInterval(function () { go(cur < 4 ? cur + 1 : 1); }, 2800);
            else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
          });
        }, { threshold: 0.35 }).observe(root);
      }
    });
  }

  /* ---- kuruma koşulları ---- */
  function initDry() {
    var f = $("[data-dry]");
    if (!f) return;
    var cloud = $("[data-dry-cloud]"), verdict = $("[data-dry-verdict]"), tipsEl = $("[data-dry-tips]");
    var TIPS = {
      kumas: "Kalın ve tüylü kumaşlar nemi daha uzun tutar. Kuruduktan sonra yumuşak bir fırçayla tüy yönünde taramak görünümü toparlar.",
      sunger: "Kalın minderler içten geç kurur. Ayrılabiliyorsa minderleri dik koyun; iki yüzü de havayla temas etsin.",
      oda: "Havalandırması zayıf odada kapıyı açık bırakın; mümkünse başka bir odanın penceresini aralayarak hava akımı oluşturun.",
      hava: "Nemli ve soğuk havada odayı ılık tutun, kısa aralıklarla havalandırın. Nem dışarı atılamazsa kuruma uzar.",
      akim: "Bir vantilatörü kumaşa doğrultmadan, odadaki havayı dolaştıracak şekilde çalıştırmak kurumaya yardım eder."
    };
    var ALWAYS = [
      "Isıtıcı, soba ya da saç kurutma makinesini doğrudan kumaşa tutmayın; bazı kumaşlar çekebilir, parlayabilir ya da iz yapabilir.",
      "Tamamen kuruyana kadar üzerine örtü sermeyin ve oturmayın; nemli kumaş kiri ve izi daha kolay tutar."
    ];
    function upd() {
      var score = 0, worst = [];
      ["kumas", "sunger", "oda", "hava", "akim"].forEach(function (n) {
        var el = f.querySelector('[name="d-' + n + '"]:checked'); var v = el ? parseInt(el.value, 10) : 0;
        score += v; if (v < 0 || (n === "akim" && v === 0)) worst.push(n);
      });
      var pct = (score + 4) / 9 * 100; pct = Math.max(4, Math.min(96, pct));
      cloud.style.left = pct + "%";
      verdict.textContent = score >= 3 ? "Koşullar kurumaya elverişli görünüyor." : score >= 0 ? "Koşullar orta; birkaç küçük önlem işe yarar." : "Bu koşullarda kuruma uzun sürebilir.";
      tipsEl.innerHTML = "";
      worst.map(function (n) { return TIPS[n]; }).concat(ALWAYS).forEach(function (t) { var li = document.createElement("li"); li.textContent = t; tipsEl.appendChild(li); });
    }
    f.addEventListener("change", upd);
    upd();
  }

  /* ---- hazırlık listesi ---- */
  function initChecklist() {
    var root = $("[data-checklist]");
    if (!root) return;
    var KEY = "skyc-hazirlik", boxes = $$("input[type=checkbox]", root), count = $("[data-check-count]"), saved = {};
    try { saved = JSON.parse(lsGet(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    boxes.forEach(function (b) { if (saved[b.getAttribute("data-key")]) b.checked = true; });
    function upd() {
      var n = 0, st = {};
      boxes.forEach(function (b) { if (b.checked) { n++; st[b.getAttribute("data-key")] = 1; } });
      count.textContent = n === boxes.length ? "Hazırsınız: " + n + "/" + boxes.length : n + "/" + boxes.length + " hazır";
      lsSet(KEY, JSON.stringify(st));
    }
    root.addEventListener("change", upd);
    var rb = $("[data-check-reset]");
    if (rb) rb.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  /* ---- adres kopyalama ---- */
  function initCopyText() {
    $$("[data-copy-text]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b); }); });
  }

  initStatus();
  initNav();
  initEraser();
  initQuick();
  initRequest();
  initPicker("[data-fabric-tool]", "data-fabric", "f-");
  initPicker("[data-stain-tool]", "data-stain", "s-");
  initFiber();
  initDry();
  initChecklist();
  initCopyText();
})();
