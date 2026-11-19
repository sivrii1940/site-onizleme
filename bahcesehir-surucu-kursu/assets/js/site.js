/* Bahçeşehir Sürücü Kursu — site betiği (kütüphanesiz, kendi kendine yeter) */
(function () {
  "use strict";

  var BRAND = "Bahçeşehir Sürücü Kursu";
  var WA = "https://wa.me/905333724969";
  var TEL = "tel:+905333724969";
  var SPRITE = "img/levhalar.svg";
  var HOURS = { "0": [["09:00", "20:00"]], "1": [["09:00", "20:00"]], "2": [["09:00", "20:00"]], "3": [["09:00", "20:00"]], "4": [["09:00", "20:00"]], "5": [["10:00", "19:00"]], "6": [["10:00", "18:00"]] };
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var XLINK = "http://www.w3.org/1999/xlink";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) {
    try {
      if (v === undefined) return window.localStorage.getItem(k);
      if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v);
    } catch (e) { /* depolama kapalı olabilir */ }
    return null;
  }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function sign(id, cls, vb) { return '<svg class="' + (cls || "") + '" viewBox="' + (vb || "0 0 100 100") + '" aria-hidden="true" focusable="false"><use href="' + SPRITE + "#" + id + '"/></svg>'; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function waUrl(msg) { return WA + "?text=" + encodeURIComponent(msg); }

  /* ---------- Açık / kapalı durumu (kit/status.js'ten kopya) ---------- */
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
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-hours] [data-day]").forEach(function (row) {
      var on = parseInt(row.getAttribute("data-day"), 10) === s.dayIndex;
      row.classList.toggle("is-today", on);
      if (on) row.setAttribute("aria-current", "date"); else row.removeAttribute("aria-current");
    });
  }

  /* ---------- Menü ---------- */
  function initNav() {
    var tg = $(".nav-toggle"), list = $("#nav-list");
    if (!tg || !list) return;
    function set(open) {
      tg.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    }
    tg.addEventListener("click", function () { set(tg.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) { set(false); tg.focus(); }
    });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  }

  /* ---------- Levha bilgisi (gerçek anlamlar) ---------- */
  var LEVHA = {
    "s-dur": { ad: "Dur", not: "Sekizgen biçim yalnız bu levhaya aittir. Kavşakta tam durulur ve yol verilir; yol boş görünse bile durmadan geçilmez." },
    "s-yolver": { ad: "Yol ver", not: "Ters üçgen yalnız bu levhada kullanılır. Girdiğiniz kavşakta ana yoldaki taşıtlara yol verirsiniz, gerekirse durursunuz." },
    "s-anayol": { ad: "Ana yol", not: "Sarı, köşesi üstte dörtgen levha bulunduğunuz yolun ana yol olduğunu bildirir; kavşaklarda geçiş hakkı ana yoldakinindir. Yine de dikkat elden bırakılmaz." },
    "s-dikkat": { ad: "Dikkat (diğer tehlikeler)", not: "Kırmızı çerçeveli üçgenler tehlike uyarısıdır. Ünlem işaretli levha, başka bir levhayla anlatılamayan bir tehlikeye karşı uyarır." },
    "s-isik": { ad: "Işıklı işaret cihazı", not: "İleride trafik ışığı bulunduğunu önceden haber verir. Hızınızı ayarlayın, durmaya hazırlıklı olun." },
    "s-daralan": { ad: "Her iki taraftan daralan kaplama", not: "Yol ileride iki yandan daralıyor. Hız düşürülür, karşıdan ve yandan gelenlere dikkat edilir." },
    "s-hiz50": { ad: "Azami hız sınırlaması (50 km/s)", not: "Kırmızı çerçeveli yuvarlak levhalar yasak ya da kısıtlama bildirir: bu levhadan sonra 50 km/s'ten hızlı gidilmez. Mavi zemin üzerindeki sayı ise asgari hızı gösterir." },
    "s-kapali": { ad: "Taşıt trafiğine kapalı yol", not: "İçi boş, kırmızı çerçeveli yuvarlak levha: yol her iki yönden taşıt trafiğine kapalıdır." },
    "s-girisyok": { ad: "Girişi olmayan yol", not: "Kırmızı zemin üzerindeki beyaz yatay bant: bu yönden taşıtla girilmez. Çoğunlukla tek yönlü yolların çıkış ucunda görülür." },
    "s-sagadonulmez": { ad: "Sağa dönülmez", not: "Okun üzerindeki kırmızı çapraz çizgi yasağı gösterir: levhanın olduğu yerde sağa dönülmez." },
    "s-parkyok": { ad: "Park etmek yasaktır", not: "Mavi zemin, tek çapraz çizgi: park edilmez. İndirme bindirme gibi kısa süreli duraklamaya izin verilir." },
    "s-durakparkyok": { ad: "Duraklamak ve park etmek yasaktır", not: "Mavi zemin üzerinde çarpı: ne park edilir ne de kısa süreli duraklanır." },
    "s-ileri": { ad: "İleri mecburi yön", not: "Mavi yuvarlak levhalar mecburiyet bildirir: yalnız okun gösterdiği yönde, yani ileri gidilir." },
    "s-sagdan": { ad: "Sağdan gidiniz", not: "Aşağı ve sağa bakan ok: refüjün ya da engelin sağ tarafından geçmeniz gerekir." },
    "s-hastane": { ad: "Hastane", not: "Mavi kare levhalar bilgi verir. Beyaz H, yakında hastane bulunduğunu gösterir; bölgede sakin ve dikkatli sürülür." },
    "s-park": { ad: "Park yeri", not: "Mavi zemin üzerindeki beyaz P park yerini gösterir. Bilgi levhaları yasak koymaz, yol gösterir." },
    "s-cikmaz": { ad: "Çıkmaz yol", not: "Yol ileride kapanıyor; öbür uçtan taşıtla çıkış yok." },
    "s-tekyon": { ad: "Tek yönlü yol", not: "Mavi dikdörtgen üzerindeki ok: bu yolda trafik yalnız ok yönünde akar." }
  };
  var POOL = [
    { id: "s-dur", yanlis: ["Yol ver", "Duraklamak ve park etmek yasaktır", "Taşıt trafiğine kapalı yol"] },
    { id: "s-yolver", yanlis: ["Dikkat (diğer tehlikeler)", "Dur", "Girişi olmayan yol"] },
    { id: "s-anayol", yanlis: ["Ana yolun sonu", "Dikkat (diğer tehlikeler)", "Park yeri"] },
    { id: "s-dikkat", yanlis: ["Yol ver", "Işıklı işaret cihazı", "Taşıt trafiğine kapalı yol"] },
    { id: "s-isik", yanlis: ["Kontrolsüz kavşak", "Dikkat (diğer tehlikeler)", "Yol ver"] },
    { id: "s-daralan", yanlis: ["İki yönlü trafik", "Kasisli yol", "Sağdan gidiniz"] },
    { id: "s-hiz50", yanlis: ["Asgari hız sınırlaması (50 km/s)", "Hız sınırlaması sonu", "Ana yol"] },
    { id: "s-kapali", yanlis: ["Girişi olmayan yol", "Dur", "Park etmek yasaktır"] },
    { id: "s-girisyok", yanlis: ["Taşıt trafiğine kapalı yol", "Tek yönlü yol", "Çıkmaz yol"] },
    { id: "s-sagadonulmez", yanlis: ["Sağa mecburi yön", "İleriden sağa mecburi yön", "Sağdan gidiniz"] },
    { id: "s-parkyok", yanlis: ["Duraklamak ve park etmek yasaktır", "Park yeri", "Taşıt trafiğine kapalı yol"] },
    { id: "s-durakparkyok", yanlis: ["Park etmek yasaktır", "Girişi olmayan yol", "Taşıt trafiğine kapalı yol"] },
    { id: "s-ileri", yanlis: ["Tek yönlü yol", "İleri ve sağa mecburi yön", "Ana yol"] },
    { id: "s-sagdan", yanlis: ["Sağa dönülmez", "Sağa mecburi yön", "Tek yönlü yol"] },
    { id: "s-hastane", yanlis: ["Park yeri", "İlk yardım", "Otel"] },
    { id: "s-cikmaz", yanlis: ["Tek yönlü yol", "Girişi olmayan yol", "Yaya yolu"] },
    { id: "s-tekyon", yanlis: ["İleri mecburi yön", "Çıkmaz yol", "Sağa mecburi yön"] }
  ];
  var KEYS = ["A", "B", "C", "D"];

  /* ---------- Ana sayfa: ön camdan perspektif yol ---------- */
  function roadScene(host) {
    var svg = $(".scene-svg", host);
    if (!svg || !document.createElementNS) return;
    var NS = "http://www.w3.org/2000/svg";
    var IDS = ["s-hiz50", "s-yolver", "s-dur", "s-anayol", "s-ileri", "s-isik", "s-parkyok", "s-dikkat", "s-sagdan", "s-durakparkyok", "s-hastane", "s-daralan"];
    var W, H, H0, CX, F, ZMIN, HC = 1.3, CAMX = 1.75, SX, SY, SS;
    var dashes = [], posts = [], signs = [], gSigns, next = 0;
    var SP = 20, NSG = 5, SPEED = 8.5, dist = 0, last = 0, raf = 0, inView = true;

    function mk(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
    function X(x, z) { return CX + F * (x - CAMX) / z; }
    function Y(y, z) { return H0 + F * (HC - y) / z; }
    function f1(v) { return v.toFixed(1); }
    function strip(x1, x2, z1, z2) { return [X(x1, z1), Y(0, z1), X(x2, z1), Y(0, z1), X(x2, z2), Y(0, z2), X(x1, z2), Y(0, z2)].map(f1).join(" "); }
    function setHref(u, id) { u.setAttribute("href", SPRITE + "#" + id); try { u.setAttributeNS(XLINK, "xlink:href", SPRITE + "#" + id); } catch (e) { /* eski tarayıcı */ } }

    function build() {
      W = host.clientWidth; H = host.clientHeight;
      if (!W || !H) return false;
      var wide = W >= 900;
      H0 = Math.round(H * (wide ? 0.5 : 0.62));
      CX = W * (wide ? 0.62 : 0.5);
      F = H * 1.05;
      ZMIN = F * HC / (H - H0);
      SX = wide ? 4.9 : 4.5; SY = wide ? 2.0 : 1.7; SS = wide ? 1.0 : 0.95;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("preserveAspectRatio", "none");
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var d = "M0 " + H0, x = 0, s = 11;
      while (x < W) {
        s = (s * 9301 + 49297) % 233280;
        var r = s / 233280, w = 16 + r * 44, h = r > 0.6 ? 12 + r * 30 : 4 + r * 9;
        d += " V" + f1(H0 - h) + " H" + f1(Math.min(W, x + w));
        x += w;
      }
      mk("path", { d: d + " V" + H0 + " Z", fill: "#B3C4D6" }, svg);
      mk("rect", { x: 0, y: H0, width: W, height: H - H0, fill: "#C9D3BE" }, svg);
      var zf = 700;
      mk("polygon", { points: strip(-4.9, 4.9, ZMIN, zf), fill: "#D8DDD4" }, svg);
      mk("polygon", { points: strip(-3.7, 3.7, ZMIN, zf), fill: "#3A4047" }, svg);
      mk("polygon", { points: strip(-3.52, -3.36, ZMIN, zf), fill: "#EEF1F4" }, svg);
      mk("polygon", { points: strip(3.36, 3.52, ZMIN, zf), fill: "#EEF1F4" }, svg);
      var gD = mk("g", { fill: "#F4F6F8" }, svg);
      dashes = [];
      var nd = Math.ceil((170 - ZMIN) / 12) + 1;
      for (var i = 0; i < nd; i++) dashes.push(mk("polygon", { points: "" }, gD));
      var gP = mk("g", {}, svg);
      posts = [];
      for (var j = 0; j < 9; j++) {
        [-4.3, 4.3].forEach(function (px) {
          posts.push({ x: px, i: j, body: mk("rect", { fill: "#F4F6F8" }, gP), band: mk("rect", { fill: "#1B1F24" }, gP) });
        });
      }
      gSigns = mk("g", {}, svg);
      signs = [];
      for (var k = NSG - 1; k >= 0; k--) {
        var g = mk("g", {}, gSigns);
        var pole = mk("rect", { fill: "#8C96A0" }, g);
        var use = mk("use", {}, g);
        setHref(use, IDS[(next++) % IDS.length]);
        signs.push({ z: 9 + k * SP, g: g, pole: pole, use: use });
      }
      return true;
    }

    function draw() {
      var P = 12, L = 4.2, off = dist % P;
      for (var i = 0; i < dashes.length; i++) {
        var z1 = ZMIN + i * P - off, z2 = z1 + L;
        if (z2 <= ZMIN) { dashes[i].setAttribute("points", ""); continue; }
        if (z1 < ZMIN) z1 = ZMIN;
        dashes[i].setAttribute("points", strip(-0.07, 0.07, z1, z2));
      }
      var PP = 16, offp = dist % PP;
      posts.forEach(function (p) {
        var z = 1 + (p.i + 1) * PP - offp;
        if (z < 4) { p.body.setAttribute("height", "0"); p.band.setAttribute("height", "0"); return; }
        var w = F * 0.12 / z, top = Y(1.0, z), bot = Y(0, z), cx = X(p.x, z);
        p.body.setAttribute("x", f1(cx - w / 2)); p.body.setAttribute("y", f1(top));
        p.body.setAttribute("width", f1(w)); p.body.setAttribute("height", f1(Math.max(0, bot - top)));
        var b1 = Y(0.88, z), b2 = Y(0.74, z);
        p.band.setAttribute("x", f1(cx - w / 2)); p.band.setAttribute("y", f1(b1));
        p.band.setAttribute("width", f1(w)); p.band.setAttribute("height", f1(Math.max(0, b2 - b1)));
      });
      signs.forEach(function (sg) {
        var size = F * SS / sg.z, cx = X(SX, sg.z);
        if (cx - size / 2 > W + 4 || sg.z < 1.4) {
          sg.z += SP * NSG;
          setHref(sg.use, IDS[(next++) % IDS.length]);
          gSigns.insertBefore(sg.g, gSigns.firstChild);
          size = F * SS / sg.z; cx = X(SX, sg.z);
        }
        var cy = Y(SY, sg.z), pw = Math.max(1, F * 0.07 / sg.z);
        sg.pole.setAttribute("x", f1(cx - pw / 2)); sg.pole.setAttribute("y", f1(cy));
        sg.pole.setAttribute("width", f1(pw)); sg.pole.setAttribute("height", f1(Math.max(0, Y(0, sg.z) - cy)));
        sg.use.setAttribute("x", f1(cx - size / 2)); sg.use.setAttribute("y", f1(cy - size / 2));
        sg.use.setAttribute("width", f1(size)); sg.use.setAttribute("height", f1(size));
        sg.g.setAttribute("opacity", Math.max(0, Math.min(1, (SP * NSG + 8 - sg.z) / 22)).toFixed(2));
      });
    }

    function tick(t) {
      raf = 0;
      if (!inView) return;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      dist += dt * SPEED;
      signs.forEach(function (s) { s.z -= dt * SPEED; });
      draw();
      raf = window.requestAnimationFrame(tick);
    }
    function start() { if (!REDUCE && !raf) { last = 0; raf = window.requestAnimationFrame(tick); } }

    if (!build()) return;
    draw();
    host.classList.add("is-live");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting;
        if (inView) start();
      }).observe(host);
    }
    start();
    var rt;
    window.addEventListener("resize", function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(function () {
        if (host.clientWidth === W && host.clientHeight === H) return;
        var keep = signs.map(function (s) { return s.z; });
        if (build()) { signs.forEach(function (s, i) { s.z = keep[i] || s.z; }); draw(); }
      }, 160);
    });
  }

  /* ---------- Ortak: bir soru çiz ---------- */
  function optionButtons(q, count) {
    var opts = [LEVHA[q.id].ad].concat(shuffle(q.yanlis.slice()).slice(0, count - 1));
    return shuffle(opts);
  }

  /* ---------- Ana sayfa: tek soruluk mini test ---------- */
  function miniQuiz(root) {
    var body = $("[data-mini-body]", root);
    if (!body) return;
    var lastId = null;
    function ask() {
      var choices = POOL.filter(function (p) { return p.id !== lastId; });
      var q = choices[Math.floor(Math.random() * choices.length)];
      lastId = q.id;
      var opts = optionButtons(q, 3);
      body.innerHTML = sign(q.id, "mini-sign") +
        '<div><p class="mini-q">Bu levha ne anlama gelir?</p><div class="mini-opts">' +
        opts.map(function (o, i) { return '<button type="button" class="opt" data-val="' + esc(o) + '"><span class="opt-key">' + KEYS[i] + "</span>" + esc(o) + "</button>"; }).join("") +
        '</div><div class="mini-fb" aria-live="polite"></div></div>';
      $$(".opt", body).forEach(function (b) {
        b.addEventListener("click", function () {
          var right = LEVHA[q.id].ad, ok = b.getAttribute("data-val") === right;
          $$(".opt", body).forEach(function (x) {
            x.disabled = true;
            if (x.getAttribute("data-val") === right) x.classList.add("is-right");
          });
          if (!ok) b.classList.add("is-wrong");
          var fb = $(".mini-fb", body);
          fb.innerHTML = '<div class="feedback ' + (ok ? "ok" : "no") + '"><b>' + (ok ? "Doğru." : "Bu levha: " + esc(right) + ".") + "</b><p>" + esc(LEVHA[q.id].not) + '</p></div><p style="margin:12px 0 0"><button type="button" class="btn btn-line-light" data-again>Başka bir levha</button></p>';
          $("[data-again]", fb).addEventListener("click", function () { ask(); var f = $(".opt", body); if (f) f.focus(); });
        });
      });
    }
    ask();
  }

  /* ---------- Levha testi: beş soru ---------- */
  function fullQuiz(root) {
    var app = $("[data-quiz-app]", root);
    if (!app) return;
    var N = 5, list, idx, score, log;

    function track() {
      var html = '<div class="q-track" aria-hidden="true"><ol class="q-stops">';
      for (var i = 0; i < N; i++) {
        var c = i < log.length ? (log[i].ok ? "ok" : "no") : (i === idx ? "now" : "");
        html += '<li class="' + c + '"></li>';
      }
      var pos = Math.min(idx, N - 1) / (N - 1) * 100;
      html += "</ol>" + '<svg class="q-car" viewBox="0 0 70 40" style="left:calc(' + pos.toFixed(1) + '% )"><use href="' + SPRITE + '#arac-sag"/></svg></div>';
      return html;
    }
    function begin() {
      list = shuffle(POOL.slice()).slice(0, N);
      idx = 0; score = 0; log = [];
      render();
    }
    function render() {
      if (idx >= N) return result();
      var q = list[idx], opts = optionButtons(q, 4);
      app.innerHTML = track() +
        '<div class="q-main"><div class="q-sign-wrap">' + sign(q.id, "q-sign" + (REDUCE ? "" : " pop")) + "</div>" +
        '<div><p class="q-count">Levha ' + (idx + 1) + " / " + N + ", doğru: " + score + '</p><h3 class="q-title" tabindex="-1">Bu levha ne anlama gelir?</h3><div class="q-opts">' +
        opts.map(function (o, i) { return '<button type="button" class="opt" data-val="' + esc(o) + '"><span class="opt-key">' + KEYS[i] + "</span>" + esc(o) + "</button>"; }).join("") +
        '</div><div class="q-fb" aria-live="polite"></div></div></div>';
      $$(".opt", app).forEach(function (b) {
        b.addEventListener("click", function () { answer(q, b); });
      });
    }
    function answer(q, b) {
      var right = LEVHA[q.id].ad, val = b.getAttribute("data-val"), ok = val === right;
      if (ok) score++;
      log.push({ id: q.id, ok: ok, val: val });
      $$(".opt", app).forEach(function (x) {
        x.disabled = true;
        if (x.getAttribute("data-val") === right) x.classList.add("is-right");
      });
      if (!ok) b.classList.add("is-wrong");
      var stops = $$(".q-stops li", app);
      if (stops[idx]) stops[idx].className = ok ? "ok" : "no";
      var last = idx === N - 1;
      var fb = $(".q-fb", app);
      fb.innerHTML = '<div class="feedback ' + (ok ? "ok" : "no") + '"><b>' + (ok ? "Doğru, bu levha: " : "Bu levha: ") + esc(right) + ".</b><p>" + esc(LEVHA[q.id].not) + "</p></div>" +
        '<button type="button" class="btn btn-yellow q-next" data-next>' + (last ? "Sonucu görün" : "Sonraki levha") + "</button>";
      var nb = $("[data-next]", fb);
      nb.addEventListener("click", function () {
        idx++;
        render();
        var t = $(".q-title", app) || $(".q-result h3", app);
        if (t) t.focus({ preventScroll: true });
      });
      nb.focus({ preventScroll: true });
    }
    function result() {
      store("bsk-levha-testi", score + "/" + N);
      var msg = score === N ? "Tam isabet. Levhalar sizinle konuşuyor."
        : score >= 3 ? "İyi gidiyorsunuz. Kaçırdıklarınızı aşağıdaki sözlükten bir kez daha okuyun."
        : "Yolun başındasınız, bu çok normal. Trafik işaretleri teorik eğitimde ayrıca çalışılan bir konudur.";
      app.innerHTML = track() +
        '<div class="q-result"><div class="score-disc" role="img" aria-label="' + N + ' sorudan ' + score + ' doğru"><b>' + score + "/" + N + "</b><span>doğru</span></div>" +
        '<div><h3 tabindex="-1">' + msg + '</h3><ul class="q-review">' +
        log.map(function (l) {
          return "<li>" + sign(l.id) + "<div><b>" + esc(LEVHA[l.id].ad) + '</b><small><span class="mk ' + (l.ok ? "ok" : "no") + '">' + (l.ok ? "Doğru bildiniz" : "Sizin cevabınız: " + esc(l.val)) + "</span></small></div></li>";
        }).join("") +
        '</ul><div class="q-actions"><button type="button" class="btn btn-yellow" data-restart>Yeni beş levha</button>' +
        '<a class="btn btn-white" href="kayit.html?test=' + score + '">Sonucumla ön kayıt</a>' +
        '<a class="btn btn-line-light" href="#sozluk">Levha sözlüğü</a></div></div></div>';
      $("[data-restart]", app).addEventListener("click", function () { begin(); var t = $(".q-title", app); if (t) t.focus({ preventScroll: true }); });
    }
    begin();
  }

  /* ---------- Ehliyet sınıfları: sınıf bulucu ---------- */
  var SINIF = {
    M: { ad: "Motorlu bisiklet (moped)", ic: "v-motor", vb: "0 0 120 72", txt: "İki ya da üç tekerlekli, düşük hızlı küçük motorlu bisikletler.", yas: "" },
    A1: { ad: "Hafif motosiklet", ic: "v-motor", vb: "0 0 120 72", txt: "Silindir hacmi en çok 125 cm³, motor gücü en çok 11 kW olan motosikletler.", yas: "" },
    A2: { ad: "Orta güçte motosiklet", ic: "v-motor", vb: "0 0 120 72", txt: "Motor gücü 35 kW'ı geçmeyen motosikletler.", yas: "18" },
    A: { ad: "Motosiklet", ic: "v-motor", vb: "0 0 120 72", txt: "Motor gücü 35 kW'ı geçenler dahil tüm motosikletler. Yaş şartı, A2 belgeniz olup olmamasına göre değişir.", yas: "" },
    B1: { ad: "Dört tekerlekli motosiklet", ic: "v-atv", vb: "0 0 120 72", txt: "ATV türü dört tekerlekli motosikletler.", yas: "" },
    B: { ad: "Otomobil ve kamyonet", ic: "v-otomobil", vb: "0 0 120 72", txt: "Azami yüklü ağırlığı 3.500 kg'ı, oturma yeri sürücü dahil 9'u geçmeyen otomobil ve kamyonetler. Hafif bir römork takılabilir.", yas: "18" },
    BE: { ad: "Römorklu otomobil", ic: "v-romorklu", vb: "0 0 162 72", txt: "B sınıfı araca, hafif römork sınırını aşan bir römork takılarak oluşan araç bileşimleri.", yas: "18", on: "B sınıfı belge" },
    C1: { ad: "Hafif kamyon", ic: "v-kamyon", vb: "0 0 140 72", txt: "Azami yüklü ağırlığı 3.500 kg'ın üzerinde, 7.500 kg'ı geçmeyen kamyon ve çekiciler.", yas: "18", on: "genel olarak B sınıfı belge" },
    C1E: { ad: "Römorklu hafif kamyon", ic: "v-tir", vb: "0 0 172 72", txt: "C1 sınıfı araca römork takılarak oluşan araç bileşimleri.", yas: "18", on: "C1 sınıfı belge" },
    C: { ad: "Kamyon ve çekici", ic: "v-kamyon", vb: "0 0 140 72", txt: "Azami yüklü ağırlığı 3.500 kg'ı geçen kamyon ve çekiciler.", yas: "21", on: "genel olarak B sınıfı belge" },
    CE: { ad: "Römorklu kamyon, tır", ic: "v-tir", vb: "0 0 172 72", txt: "C sınıfı araca römork ya da yarı römork takılarak oluşan araç bileşimleri.", yas: "21", on: "C sınıfı belge" },
    D1: { ad: "Minibüs", ic: "v-minibus", vb: "0 0 130 72", txt: "Minibüs türü yolcu taşıtları.", yas: "21", on: "genel olarak B sınıfı belge" },
    D: { ad: "Otobüs", ic: "v-otobus", vb: "0 0 172 72", txt: "Otobüs türü yolcu taşıtları.", yas: "24", on: "genel olarak B sınıfı belge" },
    F: { ad: "Lastik tekerlekli traktör", ic: "v-traktor", vb: "0 0 130 72", txt: "Lastik tekerlekli traktörler.", yas: "" },
    G: { ad: "İş makinesi", ic: "v-ismakinesi", vb: "0 0 140 72", txt: "Kendi yürür iş makineleri, örneğin ekskavatör ve yükleyiciler.", yas: "" }
  };
  function classFinder(root) {
    var out = $("[data-finder-out]", root);
    if (!out) return;
    function code() {
      var a = $("input[name=arac]:checked", root);
      if (!a) return null;
      var v = a.value;
      $$("[data-sub]", root).forEach(function (fs) { fs.hidden = fs.getAttribute("data-sub") !== v; });
      if (v === "motosiklet") { var g = $("input[name=guc]:checked", root); return g ? g.value : "?moto"; }
      if (v === "kamyon") { var k = $("input[name=agirlik]:checked", root); return k ? k.value : "?kamyon"; }
      return v;
    }
    function render() {
      var c = code();
      $$(".lic-row.is-hit").forEach(function (r) { r.classList.remove("is-hit"); });
      if (!c) { out.innerHTML = '<p class="finder-hint">Bir araç türü seçin; uygun sınıf burada görünecek.</p>'; return; }
      if (c.charAt(0) === "?") { out.innerHTML = '<p class="finder-hint">Bir adım daha: yukarıdaki ek soruyu yanıtlayın.</p>'; return; }
      var s = SINIF[c];
      var facts = [];
      facts.push(s.yas ? "Asgari yaş: " + s.yas : "Yaş şartını sorun");
      if (s.on) facts.push("Ön koşul: " + s.on);
      var ask = "Merhaba, " + c + " sınıfı (" + s.ad.toLowerCase() + ") ehliyet eğitimi hakkında bilgi almak istiyorum.";
      out.innerHTML = '<div class="verdict"><div class="verdict-code"><b>' + c + "</b>" + sign(s.ic, "", s.vb) + "</div><div>" +
        "<h3>" + esc(s.ad) + "</h3><p>" + esc(s.txt) + '</p><ul class="facts">' + facts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
        '<p>Bu sınıf için kursumuzda eğitim verilip verilmediğini ve güncel şartları bize sorun.</p><div class="actions">' +
        '<a class="btn btn-yellow" href="kayit.html?sinif=' + c + '">Bu sınıf için ön kayıt</a>' +
        '<a class="btn btn-wa" href="' + waUrl(ask) + '" target="_blank" rel="noopener">' + sign("p-mesaj") + "WhatsApp'tan sorun</a>" +
        '<a class="btn btn-line" href="#sinif-' + c.toLowerCase() + '" data-jump>Tabloda göster</a></div></div></div>';
      var row = document.getElementById("sinif-" + c.toLowerCase());
      if (row) row.classList.add("is-hit");
    }
    root.addEventListener("change", render);
    render();
  }

  /* ---------- Kontrol listesi ---------- */
  function checklist(root) {
    var key = "bsk-liste-" + (root.getAttribute("data-key") || "x");
    var boxes = $$("input[type=checkbox]", root);
    var saved = (store(key) || "").split(",");
    boxes.forEach(function (b, i) { if (saved.indexOf(String(i)) > -1) b.checked = true; });
    var fill = $(".cl-fill", root), car = $(".cl-car", root), count = $(".cl-count", root);
    function upd() {
      var done = boxes.filter(function (b) { return b.checked; }).length, pct = boxes.length ? done / boxes.length : 0;
      if (fill) fill.style.width = (pct * 100) + "%";
      if (car) car.style.left = "calc(" + (pct * 100) + "% - " + (pct * 36) + "px)";
      if (count) count.textContent = done === boxes.length ? "Hepsi hazır: " + done + " / " + boxes.length : "Hazır: " + done + " / " + boxes.length;
      store(key, boxes.map(function (b, i) { return b.checked ? i : null; }).filter(function (x) { return x !== null; }).join(","));
    }
    root.addEventListener("change", upd);
    var rs = $("[data-reset]", root);
    if (rs) rs.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  /* ---------- Kopyalama ---------- */
  function copyText(t, done) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { done(true); }, fallback);
    else fallback();
  }

  /* ---------- Ön kayıt formu ---------- */
  function regForm(root) {
    var form = $("form", root), out = $("[data-msg]", root), wa = $("[data-wa-link]", root), state = $("[data-copy-state]", root);
    if (!form || !out || !wa) return;
    var name = form.elements.ad, cls = form.elements.sinif, err = $("[data-err]", root);
    var qs = {};
    (window.location.search || "").replace(/^\?/, "").split("&").forEach(function (p) { if (!p) return; var kv = p.split("="); qs[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " ")); });
    if (qs.sinif && cls) { for (var i = 0; i < cls.options.length; i++) if (cls.options[i].value === qs.sinif) cls.selectedIndex = i; }
    var test = null;
    if (/^[0-5]$/.test(qs.test || "")) test = qs.test + "/5";
    else { var st = store("bsk-levha-testi"); if (/^[0-5]\/5$/.test(st || "")) test = st; }
    var tWrap = $("[data-test-wrap]", root), tBox = form.elements.testekle;
    if (test && tWrap) { tWrap.classList.add("on"); $("[data-test-val]", tWrap).textContent = test; if (tBox) tBox.checked = true; }

    function val(n) {
      var el = form.elements[n];
      if (!el) return "";
      if (el.length !== undefined && el.tagName !== "SELECT") {
        var arr = [];
        Array.prototype.forEach.call(el, function (x) { if (x.checked) arr.push(x.value); });
        return arr.join(", ");
      }
      return (el.value || "").trim();
    }
    function build() {
      var lines = ["Merhaba " + BRAND + ",", "web sitenizden ön kayıt için yazıyorum.", ""];
      lines.push("Ad Soyad: " + (val("ad") || "(yazılmadı)"));
      var c = cls ? cls.options[cls.selectedIndex].text : "";
      lines.push("İlgilendiğim sınıf: " + c);
      if (val("belge")) lines.push("Mevcut belgem: " + val("belge"));
      if (val("vites")) lines.push("Vites tercihim: " + val("vites"));
      if (val("zaman")) lines.push("Bana uygun zaman: " + val("zaman"));
      if (test && tBox && tBox.checked) lines.push("Sitedeki levha testi sonucum: " + test);
      if (val("not")) lines.push("Not: " + val("not"));
      lines.push("", "Kayıt dönemi, ders programı ve gerekli evraklar hakkında bilgi alabilir miyim? Teşekkürler.");
      return lines.join("\n");
    }
    function upd() {
      var m = build();
      out.textContent = m;
      wa.setAttribute("href", waUrl(m));
      if (val("ad")) { name.classList.remove("is-invalid"); name.removeAttribute("aria-invalid"); if (err) err.hidden = true; }
    }
    function check() {
      if (val("ad")) return true;
      name.classList.add("is-invalid"); name.setAttribute("aria-invalid", "true");
      if (err) err.hidden = false;
      name.focus();
      return false;
    }
    form.addEventListener("input", upd);
    form.addEventListener("change", upd);
    form.addEventListener("submit", function (e) { e.preventDefault(); if (check()) wa.click(); });
    wa.addEventListener("click", function (e) { upd(); if (!check()) e.preventDefault(); });
    var cp = $("[data-copy]", root);
    if (cp) cp.addEventListener("click", function () {
      upd();
      copyText(out.textContent, function (ok) {
        if (state) state.textContent = ok ? "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; önizlemedeki metni elle seçip kopyalayın.";
      });
    });
    upd();
  }

  /* ---------- Başlat ---------- */
  function init() {
    paintStatus();
    window.setInterval(paintStatus, 60000);
    initNav();
    var road = $("[data-road]");
    if (road) roadScene(road);
    $$("[data-tool='levha-mini']").forEach(miniQuiz);
    $$("[data-tool='levha-testi']").forEach(fullQuiz);
    $$("[data-tool='sinif-bul']").forEach(classFinder);
    $$("[data-tool='kontrol-listesi']").forEach(checklist);
    $$("[data-tool='on-kayit']").forEach(regForm);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
