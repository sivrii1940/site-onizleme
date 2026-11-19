/* Selo Nakliye — site betiği. Kütüphane yok; JS kapalıyken içerik okunur, yalnız araçlar çalışmaz. */
(function () {
  "use strict";

  var WA = "https://wa.me/905359367525";
  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- kit/status.js'ten kopya ---------- */
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

  var ST = openStatus(HOURS);
  var stText = ST.all24 ? "Şu an açık · her gün 24 saat açık" : ST.text;
  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.textContent = stText;
    el.classList.toggle("is-open", ST.open);
  });
  document.querySelectorAll("[data-day]").forEach(function (row) {
    if (+row.getAttribute("data-day") === ST.dayIndex) row.classList.add("is-today");
  });

  /* ---------- Menü ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("rota-menu");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Yardımcılar ---------- */
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function qs(name) { try { return new URLSearchParams(location.search).get(name) || ""; } catch (e) { return ""; } }

  /* ---------- İlçeler ve harita izdüşümü (img haritasıyla aynı) ---------- */
  var DIST = [
    ["Arnavutköy", 41.184, 28.740, "eu"], ["Avcılar", 40.990, 28.722, "eu"], ["Bağcılar", 41.039, 28.857, "eu"],
    ["Bahçelievler", 41.002, 28.861, "eu"], ["Bakırköy", 40.982, 28.872, "eu"], ["Başakşehir", 41.093, 28.802, "eu"],
    ["Bayrampaşa", 41.046, 28.903, "eu"], ["Beşiktaş", 41.048, 29.000, "eu"], ["Beylikdüzü", 40.995, 28.640, "eu"],
    ["Beyoğlu", 41.037, 28.977, "eu"], ["Büyükçekmece", 41.030, 28.540, "eu"], ["Çatalca", 41.143, 28.461, "eu"],
    ["Esenler", 41.043, 28.876, "eu"], ["Esenyurt", 41.030, 28.675, "eu"], ["Eyüpsultan", 41.062, 28.924, "eu"],
    ["Fatih", 41.012, 28.950, "eu"], ["Gaziosmanpaşa", 41.064, 28.912, "eu"], ["Güngören", 41.021, 28.873, "eu"],
    ["Kağıthane", 41.081, 28.973, "eu"], ["Küçükçekmece", 41.010, 28.790, "eu"], ["Sarıyer", 41.160, 29.040, "eu"],
    ["Silivri", 41.085, 28.250, "eu"], ["Sultangazi", 41.106, 28.866, "eu"], ["Şişli", 41.060, 28.987, "eu"],
    ["Zeytinburnu", 41.000, 28.904, "eu"],
    ["Adalar", 40.877, 29.093, "ad"], ["Ataşehir", 40.984, 29.107, "as"], ["Beykoz", 41.128, 29.110, "as"],
    ["Çekmeköy", 41.035, 29.177, "as"], ["Kadıköy", 40.987, 29.045, "as"], ["Kartal", 40.900, 29.192, "as"],
    ["Maltepe", 40.940, 29.140, "as"], ["Pendik", 40.885, 29.250, "as"], ["Sancaktepe", 40.990, 29.227, "as"],
    ["Sultanbeyli", 40.968, 29.262, "as"], ["Şile", 41.165, 29.610, "as"], ["Tuzla", 40.832, 29.305, "as"],
    ["Ümraniye", 41.016, 29.124, "as"], ["Üsküdar", 41.025, 29.032, "as"]
  ];
  var BY = {}; DIST.forEach(function (d) { BY[d[0]] = d; });
  var BRIDGES = [[41.045, 29.034], [41.0895, 29.0615], [41.205, 29.110]];
  var BOSTANCI = [40.957, 29.088];
  var SELO = [41.0450113, 28.6993543];
  var CANVAS = { w: 1230, h: 848 };
  function P(lat, lon) { return [(lon - 27.95) * 600, (41.62 - lat) * 792]; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

  function catmull(pts) {
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += "C" + c1[0].toFixed(1) + " " + c1[1].toFixed(1) + " " + c2[0].toFixed(1) + " " + c2[1].toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d;
  }

  function routeD(a, b) {
    var A = BY[a], B = BY[b];
    var pa = P(A[1], A[2]), pb = P(B[1], B[2]);
    if (a === b) {
      var r = 13;
      return { d: "M" + pa[0] + " " + pa[1] + "a" + r + " " + r + " 0 1 1 0.01 0", pts: [pa, [pa[0], pa[1] - 2 * r]] };
    }
    var sideA = A[3] === "eu" ? "eu" : "as", sideB = B[3] === "eu" ? "eu" : "as";
    var bos = P(BOSTANCI[0], BOSTANCI[1]);
    var pts = [pa];
    if (A[3] === "ad") pts.push(bos);
    if (sideA !== sideB) {
      var target = B[3] === "ad" ? bos : pb, last = pts[pts.length - 1], best = null, bd = 1e9;
      BRIDGES.forEach(function (g) { var q = P(g[0], g[1]), s = dist(last, q) + dist(q, target); if (s < bd) { bd = s; best = q; } });
      pts.push(best);
    }
    if (B[3] === "ad" && A[3] !== "ad") pts.push(bos);
    pts.push(pb);
    if (pts.length === 2) {
      var dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      if (ny > 0) { nx = -nx; ny = -ny; }
      var k = .16 * L;
      pts = [pa, [(pa[0] + pb[0]) / 2 + nx * k, (pa[1] + pb[1]) / 2 + ny * k], pb];
    }
    return { d: catmull(pts), pts: pts };
  }

  /* ---------- Rota haritası bileşeni ---------- */
  function RouteMap(root) {
    var self = this;
    this.root = root;
    this.svg = root.querySelector(".rmap__svg");
    this.layer = root.querySelector(".rmap__layer");
    this.path = root.querySelector(".rm-path");
    this.casing = root.querySelector(".rm-casing");
    this.under = root.querySelector(".rm-line-under");
    this.line = root.querySelector(".rm-line");
    this.pinA = root.querySelector(".rm-pin--a");
    this.pinB = root.querySelector(".rm-pin--b");
    this.truck = root.querySelector(".rm-truck");
    this.selo = root.querySelector(".rm-selo");
    this.note = root.parentNode.querySelector(".rmap__note");
    this.vb = { x: 150, y: 220, w: 900, h: 480 };
    this.token = 0;
    this.cur = null;
    this.placed = [];
    // ilçe noktaları ve etiketler
    var frag = document.createDocumentFragment();
    DIST.forEach(function (d) {
      var s = document.createElement("span"); s.className = "rm-dot"; s._p = P(d[1], d[2]); frag.appendChild(s); self.placed.push(s);
    });
    [["Karadeniz", 41.29, 29.33, "rm-sea-label"], ["Marmara Denizi", 40.875, 28.68, "rm-sea-label"], ["Avrupa Yakası", 41.17, 28.60, "rm-side-label"], ["Anadolu Yakası", 41.075, 29.43, "rm-side-label"]].forEach(function (l) {
      var s = document.createElement("span"); s.className = l[3]; s.textContent = l[0]; s._p = P(l[1], l[2]); s.setAttribute("aria-hidden", "true"); frag.appendChild(s); self.placed.push(s);
    });
    this.layer.insertBefore(frag, this.layer.firstChild);
    if (this.selo) { this.selo._p = P(SELO[0], SELO[1]); this.placed.push(this.selo); }
    this.fitAll(false);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (self.cur) self.show(self.cur[0], self.cur[1], { instant: true }); else self.fitAll(false); }, 150); });
  }
  RouteMap.prototype.aspect = function () {
    var r = this.root.getBoundingClientRect();
    return r.width && r.height ? r.width / r.height : 4 / 3;
  };
  RouteMap.prototype.box = function (minx, miny, maxx, maxy, minW) {
    var ar = this.aspect();
    var pad = Math.max(46, .2 * Math.max(maxx - minx, maxy - miny));
    var w = maxx - minx + pad * 2, h = maxy - miny + pad * 2.3;
    if (w / h < ar) w = h * ar; else h = w / ar;
    if (w < minW) { w = minW; h = w / ar; }
    if (w > CANVAS.w) { w = CANVAS.w; h = w / ar; }
    if (h > CANVAS.h) { h = CANVAS.h; w = h * ar; }
    var cx = (minx + maxx) / 2, cy = (miny + maxy) / 2 + 6;
    return { x: clamp(cx - w / 2, 0, CANVAS.w - w), y: clamp(cy - h / 2, 0, CANVAS.h - h), w: w, h: h };
  };
  RouteMap.prototype.applyVB = function (v) {
    this.vb = v;
    this.svg.setAttribute("viewBox", v.x.toFixed(1) + " " + v.y.toFixed(1) + " " + v.w.toFixed(1) + " " + v.h.toFixed(1));
    var self = this, box = this.root.getBoundingClientRect(), W = box.width, H = box.height;
    this.placed.forEach(function (el) {
      self.put(el, el._p);
      if (el.classList.contains("rm-sea-label") || el.classList.contains("rm-side-label")) {
        var x = (el._p[0] - v.x) / v.w * W, y = (el._p[1] - v.y) / v.h * H, hw = el.offsetWidth / 2 + 6;
        el.style.visibility = x - hw < 0 || x + hw > W || y < 12 || y > H - 12 ? "hidden" : "";
      }
    });
    if (this.selo) {
      var sx = (this.selo._p[0] - v.x) / v.w * W, lw = (this.selo.querySelector("span") || {}).offsetWidth || 80;
      this.selo.classList.toggle("is-edge", sx + 10 + lw > W - 4 || sx < 4);
    }
    if (this.pinA && this.pinA._p) this.put(this.pinA, this.pinA._p);
    if (this.pinB && this.pinB._p) this.put(this.pinB, this.pinB._p);
    if (this.truck && this.truck._p) this.put(this.truck, this.truck._p);
  };
  RouteMap.prototype.put = function (el, p) {
    el.style.left = ((p[0] - this.vb.x) / this.vb.w * 100).toFixed(3) + "%";
    el.style.top = ((p[1] - this.vb.y) / this.vb.h * 100).toFixed(3) + "%";
  };
  RouteMap.prototype.fitAll = function (anim) {
    var a = P(41.20, 28.36), b = P(40.84, 29.40);
    this.tween(this.box(a[0], a[1], b[0], b[1], 300), anim);
  };
  RouteMap.prototype.tween = function (to, anim, done) {
    var self = this, from = this.vb, t0 = null, my = this.token;
    if (!anim || REDUCED) { this.applyVB(to); if (done) done(); return; }
    function step(ts) {
      if (my !== self.token) return;
      if (!t0) t0 = ts;
      var t = clamp((ts - t0) / 700, 0, 1), e = ease(t);
      self.applyVB({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
      if (t < 1) requestAnimationFrame(step); else if (done) done();
    }
    requestAnimationFrame(step);
  };
  RouteMap.prototype.clear = function () {
    this.token++;
    this.cur = null;
    ["casing", "under", "line"].forEach(function (k) { if (this[k]) this[k].setAttribute(k === "casing" ? "d" : "points", ""); }, this);
    if (this.pinA) this.pinA.hidden = true;
    if (this.pinB) this.pinB.hidden = true;
    if (this.truck) this.truck.hidden = true;
    if (this.selo) this.selo.classList.remove("is-quiet");
    this.fitAll(true);
  };
  RouteMap.prototype.show = function (a, b, opt) {
    opt = opt || {};
    if (!BY[a] || !BY[b]) { this.clear(); return; }
    var self = this, my = ++this.token, instant = opt.instant || REDUCED;
    this.cur = [a, b];
    var R = routeD(a, b);
    this.path.setAttribute("d", R.d);
    var L = this.path.getTotalLength(), N = 140, S = [];
    for (var i = 0; i <= N; i++) { var q = this.path.getPointAtLength(L * i / N); S.push([q.x, q.y]); }
    var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    S.forEach(function (p) { minx = Math.min(minx, p[0]); miny = Math.min(miny, p[1]); maxx = Math.max(maxx, p[0]); maxy = Math.max(maxy, p[1]); });
    var pa = S[0], pb = S[S.length - 1];
    if (a === b) pb = pa;
    var target = this.box(minx, miny, maxx, maxy, 280);
    this.casing.setAttribute("d", R.d);
    this.under.setAttribute("points", "");
    this.line.setAttribute("points", "");
    this.pinA._p = pa; this.pinB._p = pb;
    this.pinA.hidden = false; this.pinB.hidden = a === b;
    this.pinA.querySelector(".rm-tag").textContent = a === b ? a + " · ilçe içi" : "A · " + a;
    this.pinB.querySelector(".rm-tag").textContent = "B · " + b;
    this.pinB.classList.remove("is-arrived");
    // etiket yönü: rota yukarıdan geliyorsa etiket aşağıda kalsın
    var upA = S[Math.min(8, N)][1] > pa[1] + 2, upB = S[Math.max(N - 8, 0)][1] > pb[1] + 2;
    this.pinA.classList.toggle("tag-up", upA); this.pinB.classList.toggle("tag-up", upB);
    if (this.selo) {
      var sp = this.selo._p, near = dist(sp, pa) < .09 * target.w || dist(sp, pb) < .09 * target.w;
      this.selo.classList.toggle("is-quiet", near);
    }
    this.truck.hidden = false;
    this.truck._p = pa;
    function pts(k) { return S.slice(0, k + 1).map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
    function finish() {
      var all = pts(N);
      self.under.setAttribute("points", all); self.line.setAttribute("points", all);
      self.truck._p = pb; self.put(self.truck, pb);
      self.pinB.classList.add("is-arrived");
      self.truck.querySelectorAll(".wheel-spin").forEach(function (w) { w.style.animationPlayState = "paused"; });
    }
    if (instant) { this.applyVB(target); finish(); return; }
    this.truck.querySelectorAll(".wheel-spin").forEach(function (w) { w.style.animationPlayState = "running"; });
    this.tween(target, true, function () {
      if (my !== self.token) return;
      var dur = clamp(L * 7, 1100, 2600), t0 = null, lastX = pa[0];
      function step(ts) {
        if (my !== self.token) return;
        if (!t0) t0 = ts;
        var t = clamp((ts - t0) / dur, 0, 1), e = ease(t), f = e * N, k = Math.floor(f), fr = f - k;
        var head = k >= N ? S[N] : [S[k][0] + (S[k + 1][0] - S[k][0]) * fr, S[k][1] + (S[k + 1][1] - S[k][1]) * fr];
        var str = pts(k) + " " + head[0].toFixed(1) + "," + head[1].toFixed(1);
        self.under.setAttribute("points", str); self.line.setAttribute("points", str);
        self.truck._p = head; self.put(self.truck, head);
        if (Math.abs(head[0] - lastX) > .4) { self.truck.classList.toggle("is-left", head[0] < lastX); lastX = head[0]; }
        if (t < 1) requestAnimationFrame(step); else finish();
      }
      requestAnimationFrame(step);
    });
  };

  var maps = [];
  document.querySelectorAll("[data-routemap]").forEach(function (el) { maps.push(new RouteMap(el)); });

  /* ---------- Ana sayfa: hızlı rota ---------- */
  var heroPick = document.querySelector("[data-hero-route]");
  if (heroPick && maps[0]) {
    var hA = heroPick.querySelector("[name=nereden]"), hB = heroPick.querySelector("[name=nereye]"), hGo = heroPick.querySelector("[data-hero-go]"), hNote = document.querySelector("[data-hero-note]");
    var heroMap = maps[0];
    var touched = false;
    function heroUpdate(anim) {
      var a = hA.value, b = hB.value;
      if (a && b) heroMap.show(a, b, { instant: !anim });
      var q = [];
      if (a) q.push("nereden=" + encodeURIComponent(a));
      if (b) q.push("nereye=" + encodeURIComponent(b));
      hGo.setAttribute("href", "teklif.html" + (q.length ? "?" + q.join("&") : ""));
      if (hNote) hNote.textContent = touched ? (a && b ? (a === b ? "İlçe içi taşıma: " + a : a + " → " + b) : "İki ilçeyi de seçin") : "Örnek rota. İlçeleri değiştirin, rota yeniden çizilsin.";
    }
    [hA, hB].forEach(function (s) { s.addEventListener("change", function () { touched = true; heroUpdate(true); }); });
    setTimeout(function () { heroUpdate(true); }, 350);
  }

  /* ---------- Süreç yolu: kamyon kaydırmayla ilerler ---------- */
  document.querySelectorAll("[data-lane]").forEach(function (lane) {
    var track = lane.querySelector(".lane__track"), truck = lane.querySelector(".lane__truck"), road = lane.querySelector(".lane__road");
    var stops = [].slice.call(lane.querySelectorAll(".stop"));
    var wheels = truck.querySelectorAll(".wheel-spin"), idle;
    wheels.forEach(function (w) { w.style.animationPlayState = "paused"; });
    var ticking = false;
    function update() {
      ticking = false;
      var scrollable = lane.scrollWidth > lane.clientWidth + 4, p;
      if (scrollable) p = lane.scrollLeft / Math.max(1, lane.scrollWidth - lane.clientWidth);
      else {
        var vh = window.innerHeight, r = road.getBoundingClientRect();
        p = clamp((vh * .86 - r.top) / (vh * .6), 0, 1);
      }
      var tw = truck.offsetWidth, W = track.clientWidth, x = 8 + p * (W - tw - 16);
      truck.style.transform = "translateX(" + x.toFixed(1) + "px)";
      var front = x + tw * .8;
      stops.forEach(function (s) { s.classList.toggle("is-passed", s.offsetLeft + 30 <= front); });
      if (!REDUCED) {
        wheels.forEach(function (w) { w.style.animationPlayState = "running"; });
        clearTimeout(idle);
        idle = setTimeout(function () { wheels.forEach(function (w) { w.style.animationPlayState = "paused"; }); }, 140);
      }
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    lane.addEventListener("scroll", req, { passive: true });
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    update();
  });

  /* ---------- Teklif aracı (imza) ---------- */
  var EK = {
    paketleme: "paketleme desteği",
    montaj: "mobilya söküm ve kurulum",
    beyaz: "beyaz eşya taşıma",
    hassas: "ağır ya da hassas eşya (piyano, kasa vb.)",
    depolama: "eşya depolama hakkında bilgi",
    asansor: "dış cephe asansörü hakkında bilgi"
  };
  var YOL = {
    dar: "sokak dar, araç yanaşması zor olabilir",
    yokus: "yokuşlu ya da merdivenli sokak",
    site: "site girişi için izin gerekiyor",
    park: "kapı önünde park yeri sıkıntılı"
  };
  function katLabel(v) {
    if (v === "") return "";
    if (v === "-1") return "bodrum kat";
    if (v === "0") return "zemin / bahçe katı";
    if (v === "0.5") return "yüksek giriş";
    if (v === "m") return "müstakil ev";
    if (v === "21") return "20. kattan yukarı";
    return v + ". kat";
  }
  function building(v, lift, color) {
    var f = v === "" ? null : (v === "m" ? 1 : parseFloat(v));
    var rows = f === null ? 4 : clamp(Math.ceil(Math.max(f, 0)) + 2, 3, 8);
    var base = f !== null && f < 0 ? 1 : 0;
    var total = rows + base, top = 8, bottom = 92, rh = (bottom - top) / total;
    var bw = lift === "var" || lift === "yok" ? 36 : 46;
    var hl = f === null ? -9 : (f < 0 ? -1 : Math.min(Math.round(f === .5 ? 0 : f), rows - 1));
    var skip = f !== null && f > rows - 1;
    var s = '<svg viewBox="0 0 54 96" class="leg__bld" aria-hidden="true">';
    s += '<rect x="2" y="' + top + '" width="' + bw + '" height="' + (bottom - top) + '" rx="2" fill="' + color + '"/>';
    for (var i = -base; i < rows; i++) {
      var y = bottom - (i + 1 + base) * rh, on = i === hl;
      if (on) s += '<rect x="2" y="' + y.toFixed(1) + '" width="' + bw + '" height="' + rh.toFixed(1) + '" fill="#FFB000"/>';
      var wy = y + rh * .28, wh = Math.max(3, rh * .42);
      s += '<rect x="7" y="' + wy.toFixed(1) + '" width="' + (bw / 2 - 8) + '" height="' + wh.toFixed(1) + '" rx="1" fill="' + (on ? "#17301F" : "#E7F1EA") + '"/>';
      s += '<rect x="' + (bw / 2 + 3) + '" y="' + wy.toFixed(1) + '" width="' + (bw / 2 - 8) + '" height="' + wh.toFixed(1) + '" rx="1" fill="' + (on ? "#17301F" : "#E7F1EA") + '"/>';
    }
    if (base) s += '<line x1="0" y1="' + (bottom - rh).toFixed(1) + '" x2="54" y2="' + (bottom - rh).toFixed(1) + '" stroke="#6B7F72" stroke-width="2" stroke-dasharray="3 2"/>';
    if (skip) s += '<path d="M0 ' + (top + rh * .9).toFixed(1) + 'l6 -4 6 4 6 -4 6 4 6 -4 6 4 6 -4 6 4" fill="none" stroke="#F3F7F2" stroke-width="2.5"/>';
    if (lift === "var") {
      s += '<rect x="41" y="' + top + '" width="11" height="' + (bottom - top) + '" rx="1.5" fill="#DDE7E0" stroke="#17301F" stroke-width="1.5"/>';
      var cy = hl === -9 ? bottom - rh : bottom - (Math.max(hl, -base) + 1 + base) * rh;
      s += '<rect x="42.5" y="' + (cy + 1).toFixed(1) + '" width="8" height="' + Math.max(4, rh - 2).toFixed(1) + '" rx="1" fill="#FFB000" stroke="#17301F" stroke-width="1"/>';
    } else if (lift === "yok") {
      var ty = hl === -9 ? bottom - rh : bottom - (Math.max(hl, -base) + 1 + base) * rh, d = "M52 " + bottom;
      var steps = 8, sy = (bottom - ty) / steps;
      for (var k = 0; k < steps; k++) d += "v-" + sy.toFixed(1) + (k % 2 ? "h3" : "h-3");
      s += '<path d="' + d + '" fill="none" stroke="#17301F" stroke-width="2" stroke-linejoin="round"/>';
    }
    s += '<line x1="0" y1="' + (bottom + 2) + '" x2="54" y2="' + (bottom + 2) + '" stroke="#17301F" stroke-width="3"/></svg>';
    return s;
  }

  var qf = document.querySelector("[data-quote]");
  if (qf) {
    var form = qf.querySelector("form");
    var qmap = maps.filter(function (m) { return qf.contains(m.root); })[0];
    var out = qf.querySelector("[data-msg]"), waBtn = qf.querySelector("[data-wa]"), cpBtn = qf.querySelector("[data-copy]"), err = qf.querySelector("[data-err]"), ok = qf.querySelector("[data-ok]");
    var legA = qf.querySelector("[data-leg=a]"), legB = qf.querySelector("[data-leg=b]"), adalar = qf.querySelector("[data-adalar]");
    var dateIn = form.querySelector("[name=tarih]"), flex = form.querySelector("[name=esnek]");
    var lastRoute = "";
    // bugünden önceki tarih seçilmesin
    try {
      var n = new Date(), iso = new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      dateIn.min = iso;
    } catch (e) { /* eski tarayıcı */ }
    function val(name) { var el = form.elements[name]; if (!el) return ""; return (el.value || "").trim(); }
    function radio(name) { var r = form.querySelector("[name=" + name + "]:checked"); return r ? r.value : ""; }
    function checks(name) { return [].slice.call(form.querySelectorAll("[name=" + name + "]:checked")).map(function (c) { return c.value; }); }
    function leg(side) {
      var ilce = val(side + "_ilce"), mah = val(side + "_mahalle"), kat = val(side + "_kat"), as = radio(side + "_asansor");
      var parts = [];
      if (kat) parts.push(katLabel(kat));
      if (as && kat !== "m") parts.push(as === "var" ? "asansör var" : "asansör yok");
      return { ilce: ilce, mah: mah, kat: kat, as: as, place: ilce ? ilce + (mah ? ", " + mah : "") : "", detail: parts.join(" · ") };
    }
    function build() {
      var A = leg("a"), B = leg("b");
      var lines = ["Merhaba Selo Nakliye, web sitenizdeki teklif formundan yazıyorum. Taşınmam için fiyat bilgisi almak istiyorum.", ""];
      lines.push("Nereden: " + (A.place || "(ilçe seçilmedi)") + (A.detail ? " — " + A.detail : ""));
      lines.push("Nereye: " + (B.place || "(ilçe seçilmedi)") + (B.detail ? " — " + B.detail : ""));
      var ev = radio("ev"); if (ev) lines.push("Taşınacak yer: " + ev);
      if (flex.checked) lines.push("Tarih: henüz belli değil");
      else if (dateIn.value) {
        var d = new Date(dateIn.value + "T12:00:00");
        lines.push("Tarih: " + d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }));
      }
      var ek = checks("ek").map(function (k) { return EK[k]; }); if (ek.length) lines.push("Konuşmak istediklerim: " + ek.join(", "));
      var yol = checks("yol").map(function (k) { return YOL[k]; }); if (yol.length) lines.push("Yol ve bina notu: " + yol.join("; "));
      var note = val("not"); if (note) lines.push("Not: " + note);
      var ad = val("ad"); if (ad) lines.push("Adım: " + ad);
      lines.push("", "Uygun olduğunuzda dönüş yapabilir misiniz?");
      return { text: lines.join("\n"), A: A, B: B };
    }
    function legHTML(L, side, color) {
      var title = (side === "a" ? "A · " : "B · ") + (L.ilce || (side === "a" ? "Nereden?" : "Nereye?"));
      return building(L.kat, L.kat === "m" ? "" : L.as, color) + '<div class="leg__txt"><strong>' + title.replace(/</g, "&lt;") + "</strong>" + (L.detail ? L.detail : "kat ve asansör seçin") + "</div>";
    }
    function render() {
      var r = build();
      out.textContent = r.text;
      waBtn.setAttribute("href", waLink(r.text));
      legA.innerHTML = legHTML(r.A, "a", "#1E7B4C");
      legB.innerHTML = legHTML(r.B, "b", "#17301F");
      if (adalar) adalar.hidden = !(r.A.ilce === "Adalar" || r.B.ilce === "Adalar");
      var key = r.A.ilce + "|" + r.B.ilce;
      if (qmap && key !== lastRoute) {
        lastRoute = key;
        if (r.A.ilce && r.B.ilce) qmap.show(r.A.ilce, r.B.ilce);
        else qmap.clear();
        if (qmap.note) qmap.note.textContent = r.A.ilce && r.B.ilce ? (r.A.ilce === r.B.ilce ? "İlçe içi taşıma" : r.A.ilce + " → " + r.B.ilce) : "İki ilçeyi seçince rota çizilir";
      }
      if (r.A.ilce && r.B.ilce) err.hidden = true;
      ok.textContent = "";
    }
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    flex.addEventListener("change", function () { dateIn.disabled = flex.checked; });
    form.addEventListener("submit", function (e) { e.preventDefault(); waBtn.click(); });
    waBtn.addEventListener("click", function (e) {
      var r = build();
      if (!r.A.ilce || !r.B.ilce) {
        e.preventDefault();
        err.hidden = false;
        (r.A.ilce ? form.elements.b_ilce : form.elements.a_ilce).focus();
      }
    });
    cpBtn.addEventListener("click", function () {
      copyText(build().text, function (s) { ok.textContent = s ? "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın."; });
    });
    // adres çubuğundan ön doldurma (ana sayfa ve hizmetler sayfasından gelir)
    var pa = qs("nereden"), pb = qs("nereye"), pe = qs("ek");
    if (BY[pa]) form.elements.a_ilce.value = pa;
    if (BY[pb]) form.elements.b_ilce.value = pb;
    pe.split(",").forEach(function (k) { var c = form.querySelector("[name=ek][value='" + k.replace(/[^a-z]/g, "") + "']"); if (c) c.checked = true; });
    render();
  }

  /* ---------- Hizmetler: rotanıza durak ekleyin ---------- */
  var stopper = document.querySelector("[data-stopper]");
  if (stopper) {
    var sSigns = stopper.querySelector(".stopper__signs"), sGo = stopper.querySelector("[data-stopper-go]"), sWa = stopper.querySelector("[data-stopper-wa]"), sMsg = stopper.querySelector("[data-stopper-msg]");
    function sUpdate() {
      var on = [].slice.call(stopper.querySelectorAll("input:checked"));
      sSigns.innerHTML = "";
      if (!on.length) { var em = document.createElement("em"); em.textContent = "Henüz durak eklenmedi"; sSigns.appendChild(em); }
      on.forEach(function (c) { var s = document.createElement("span"); s.textContent = c.getAttribute("data-short"); sSigns.appendChild(s); });
      var keys = on.map(function (c) { return c.value; });
      sGo.setAttribute("href", "teklif.html" + (keys.length ? "?ek=" + keys.join(",") : ""));
      var msg = "Merhaba Selo Nakliye, taşınmam için " + (keys.length ? "şu konuları konuşmak istiyorum: " + keys.map(function (k) { return EK[k]; }).join(", ") + "." : "bilgi almak istiyorum.");
      sMsg.textContent = msg;
      sWa.setAttribute("href", waLink(msg));
    }
    stopper.addEventListener("change", sUpdate);
    sUpdate();
  }

  /* ---------- SSS: arama ve soru gönderme ---------- */
  var fs = document.querySelector("[data-faq-search]");
  if (fs) {
    var items = [].slice.call(document.querySelectorAll("details.q")), groups = [].slice.call(document.querySelectorAll(".faq-group")), empty = document.querySelector("[data-faq-empty]");
    function norm(s) { return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase(); }
    items.forEach(function (d) { d._t = norm(d.textContent); });
    fs.addEventListener("input", function () {
      var q = norm(fs.value.trim()), any = false;
      items.forEach(function (d) { var m = !q || d._t.indexOf(q) > -1; d.hidden = !m; if (m) any = true; if (q && m) d.open = true; if (!q) d.open = false; });
      groups.forEach(function (g) { g.hidden = !g.querySelector("details.q:not([hidden])"); });
      empty.hidden = any;
    });
  }
  var ask = document.querySelector("[data-ask]");
  if (ask) {
    var aOut = ask.querySelector("[data-ask-msg]"), aWa = ask.querySelector("[data-ask-wa]");
    function aUpdate() {
      var topic = (ask.querySelector("[name=konu]:checked") || {}).value || "";
      var q = (ask.querySelector("[name=soru]").value || "").trim();
      var msg = "Merhaba Selo Nakliye, " + (topic ? topic.toLocaleLowerCase("tr-TR") + " hakkında bir sorum var." : "bir sorum var.") + (q ? "\n" + q : "");
      aOut.textContent = msg; aWa.setAttribute("href", waLink(msg));
    }
    ask.addEventListener("input", aUpdate); ask.addEventListener("change", aUpdate); aUpdate();
  }

  /* ---------- İletişim: geri arama notu ---------- */
  var cb = document.querySelector("[data-callback]");
  if (cb) {
    var cOut = cb.querySelector("[data-cb-msg]"), cWa = cb.querySelector("[data-cb-wa]"), cCp = cb.querySelector("[data-cb-copy]"), cOk = cb.querySelector("[data-cb-ok]");
    function cText() {
      var when = (cb.querySelector("[name=zaman]:checked") || {}).value || "";
      var about = (cb.querySelector("[name=konu2]:checked") || {}).value || "";
      var name = (cb.querySelector("[name=ad2]").value || "").trim();
      var msg = "Merhaba Selo Nakliye" + (name ? ", ben " + name : "") + ". " + (about ? about + " için " : "") + "beni " + (when ? when.toLocaleLowerCase("tr-TR") + " arayabilir misiniz?" : "uygun bir saatte arayabilir misiniz?");
      return msg;
    }
    function cUpdate() { var t = cText(); cOut.textContent = t; cWa.setAttribute("href", waLink(t)); cOk.textContent = ""; }
    cb.addEventListener("input", cUpdate); cb.addEventListener("change", cUpdate);
    cCp.addEventListener("click", function () { copyText(cText(), function (s) { cOk.textContent = s ? "Kopyalandı." : "Kopyalanamadı; elle seçip kopyalayın."; }); });
    cUpdate();
  }

})();
