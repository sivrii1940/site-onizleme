/* Terzi Muharrem — site betiği (bağımlılık yok) */
(function () {
  "use strict";
  var d = document, html = d.documentElement;
  html.classList.add("js");

  var HOURS = { "0": [["09:00", "20:00"]], "1": [["09:00", "20:00"]], "2": [["09:00", "20:00"]], "3": [["09:00", "20:00"]], "4": [["09:00", "20:00"]], "5": [["09:00", "20:00"]], "6": [["09:00", "20:00"]] };
  var WA = "https://wa.me/905322716157";
  var GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var azHareket = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---------- açık/kapalı durumu (kit/status.js) ---------- */
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
  function iki(n) { return (n < 10 ? "0" : "") + n; }
  function durumYaz() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("acik", s.open);
      el.classList.toggle("kapali", !s.open && s.known);
    });
    $$(".saat-tablo tr").forEach(function (tr, i) { tr.classList.toggle("bugun", i === s.dayIndex); });
    var im = $(".gun-im");
    if (im) {
      im.style.left = (s.minutes / 1440 * 100).toFixed(2) + "%";
      im.classList.toggle("sol", s.minutes < 200); im.classList.toggle("sag", s.minutes > 1240);
      im.setAttribute("data-saat", "şu an " + iki(Math.floor(s.minutes / 60)) + ":" + iki(s.minutes % 60));
    }
    return s;
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ---------- gezinme ---------- */
  (function () {
    var b = $(".menu-dugme"), g = $("#gezinme");
    if (!b || !g) return;
    function kapat() { g.classList.remove("acik"); b.setAttribute("aria-expanded", "false"); }
    b.addEventListener("click", function () {
      var ac = !g.classList.contains("acik");
      g.classList.toggle("acik", ac); b.setAttribute("aria-expanded", ac ? "true" : "false");
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && g.classList.contains("acik")) { kapat(); b.focus(); } });
    d.addEventListener("click", function (e) { if (g.classList.contains("acik") && !g.contains(e.target) && !b.contains(e.target)) kapat(); });
  })();

  /* ---------- sayfa boyunca iplik ---------- */
  var iplikBaslat = function () {};
  (function () {
    var main = $("main"), bas = $("[data-th-start]"), son = $("[data-th-end]");
    if (!main || !bas || !son || !d.createElementNS) return;
    var NS = "http://www.w3.org/2000/svg";
    var svg = d.createElementNS(NS, "svg");
    svg.setAttribute("class", "iplik"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    var yol = d.createElementNS(NS, "path"); yol.setAttribute("class", "iplik-yol");
    var igne = d.createElementNS(NS, "g"); igne.setAttribute("class", "iplik-igne");
    var ig = d.createElementNS(NS, "path"); ig.setAttribute("d", "M-3,0 C-3,-2.6 1,-3 6,-2.3 L34,0 L6,2.3 C1,3 -3,2.6 -3,0Z");
    var goz = d.createElementNS(NS, "ellipse"); goz.setAttribute("cx", "2.5"); goz.setAttribute("rx", "2.6"); goz.setAttribute("ry", "0.9");
    igne.appendChild(ig); igne.appendChild(goz); svg.appendChild(yol); svg.appendChild(igne);
    main.insertBefore(svg, main.firstChild);

    var top = 0, ornek = [], cizili = 0, hedefY = -1e9, etkin = false, donuyor = false, sonW = 0, sonH = 0;
    function f(n) { return Math.round(n * 10) / 10; }

    function kur() {
      var W = main.clientWidth, H = main.offsetHeight, mr = main.getBoundingClientRect();
      sonW = W; sonH = H;
      svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      function rel(el) { var r = el.getBoundingClientRect(); return { x: r.left - mr.left + r.width / 2, y: r.top - mr.top + r.height / 2, t: r.top - mr.top }; }
      var dar = W < 760, kenar = W < 1240 ? 8 : Math.max(26, (W - 1160) / 2 - 34);
      var X = { l: kenar, r: W - kenar };
      var S = rel(bas), E = rel(son);
      var bolumler = Array.prototype.filter.call(main.children, function (c) { return c.hasAttribute && c.hasAttribute("data-th"); });
      var ilk = 0;
      bolumler.forEach(function (b, i) { if (b.contains(bas)) ilk = i; });
      var x = X[bolumler[ilk] ? bolumler[ilk].getAttribute("data-th") : "r"] || X.r;
      var dus = Math.max(dar ? 64 : 90, Math.abs(x - S.x) * 0.4);
      var p = "M" + f(S.x) + "," + f(S.y) + " C" + f(S.x + (x - S.x) * 0.6) + "," + f(S.y - (dar ? 3 : 8)) + " " + f(x) + "," + f(S.y + dus * 0.15) + " " + f(x) + "," + f(S.y + dus);
      var cy = S.y + dus, c = dar ? 30 : 50, r = dar ? 14 : 25;
      for (var i = ilk + 1; i < bolumler.length; i++) {
        var b = bolumler[i], T = rel(b).t, nx = X[b.getAttribute("data-th")];
        if (nx == null) continue;
        var y0 = Math.max(cy, T - c), y1 = T + c;
        if (y1 <= y0 + 12) continue;
        if (y0 > cy) p += " L" + f(x) + "," + f(y0);
        if (nx === x) { p += " L" + f(x) + "," + f(y1); }
        else {
          var dir = nx > x ? 1 : -1, xm = (x + nx) / 2, ym = (y0 + y1) / 2, h = y1 - y0;
          if (b.hasAttribute("data-th-ilmek")) {
            var ax = xm - dir * r * 0.5, zx = xm + dir * r * 0.5;
            p += " C" + f(x) + "," + f(y0 + h * 0.75) + " " + f(ax - dir * 2.4 * r) + "," + f(ym + 1.1 * r) + " " + f(ax) + "," + f(ym);
            p += " C" + f(ax + dir * 3.6 * r) + "," + f(ym - 1.7 * r) + " " + f(zx - dir * 3.6 * r) + "," + f(ym - 1.7 * r) + " " + f(zx) + "," + f(ym);
            p += " C" + f(zx + dir * 2.4 * r) + "," + f(ym + 1.1 * r) + " " + f(nx) + "," + f(y1 - h * 0.75) + " " + f(nx) + "," + f(y1);
          } else {
            p += " C" + f(x) + "," + f(y0 + h * 0.95) + " " + f(nx) + "," + f(y1 - h * 0.95) + " " + f(nx) + "," + f(y1);
          }
        }
        x = nx; cy = y1;
      }
      var yak = dar ? 84 : 130;
      if (E.y - yak > cy) p += " L" + f(x) + "," + f(E.y - yak);
      else yak = Math.max(20, E.y - cy);
      p += " C" + f(x) + "," + f(E.y - yak * 0.08) + " " + f(x + (E.x - x) * 0.4) + "," + f(E.y) + " " + f(E.x) + "," + f(E.y);
      yol.setAttribute("d", p);
      top = yol.getTotalLength();
      yol.style.strokeDasharray = f(top) + " " + f(top + 20);
      ornek = []; var n = Math.max(2, Math.ceil(top / 10)), my = -1e9;
      for (var k = 0; k <= n; k++) { var pt = yol.getPointAtLength(top * k / n); if (pt.y > my) my = pt.y; ornek.push(my); }
      if (etkin) { cizili = azHareket ? top : uzunluk(hedefY); }
      boya();
    }
    function uzunluk(y) {
      var n = ornek.length - 1;
      if (y >= ornek[n] - 2) return top;
      if (y <= ornek[0]) return 0;
      var lo = 0, hi = n;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (ornek[mid] >= y) hi = mid; else lo = mid + 1; }
      return top * lo / n;
    }
    function hedefAl() {
      var mr = main.getBoundingClientRect();
      var y = window.innerHeight * 0.6 - mr.top;
      var se = d.scrollingElement || html;
      if (window.innerHeight + se.scrollTop >= se.scrollHeight - 6) y = 1e9;
      if (y > hedefY) hedefY = y;
    }
    function boya() {
      yol.style.strokeDashoffset = f(top - cizili);
      var bitti = cizili >= top - 0.6;
      if (cizili > 2 && !bitti) {
        var a = yol.getPointAtLength(cizili), b = yol.getPointAtLength(Math.max(0, cizili - 5));
        var ang = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI;
        igne.setAttribute("transform", "translate(" + f(a.x) + " " + f(a.y) + ") rotate(" + f(ang) + ")");
        igne.style.opacity = 1;
      } else igne.style.opacity = 0;
      svg.classList.toggle("tamam", bitti);
      if (bitti && etkin) son.classList.add("dikildi");
    }
    function dongu() {
      var hl = uzunluk(hedefY), fark = hl - cizili;
      if (fark <= 0.5) { cizili = Math.max(cizili, hl); boya(); donuyor = false; return; }
      cizili += Math.max(Math.min(fark, 5), fark * 0.13);
      boya();
      requestAnimationFrame(dongu);
    }
    function tetik() { if (!etkin) return; hedefAl(); if (!donuyor) { donuyor = true; requestAnimationFrame(dongu); } }

    kur();
    window.addEventListener("scroll", tetik, { passive: true });
    window.addEventListener("resize", function () { kur(); tetik(); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (main.clientWidth !== sonW || main.offsetHeight !== sonH) { kur(); tetik(); } }).observe(main);
    window.addEventListener("load", function () { kur(); tetik(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { kur(); tetik(); });

    iplikBaslat = function () {
      if (etkin) return;
      etkin = true;
      if (azHareket) { hedefY = 1e9; cizili = top; boya(); return; }
      tetik();
    };
  })();

  /* ---------- hero imzası: iğne adı yazar ---------- */
  (function () {
    var svg = $(".imza");
    if (!svg) { setTimeout(iplikBaslat, azHareket ? 0 : 1000); return; }
    var ip = $(".imza-ip", svg), igne = $(".igne", svg), sar = svg.parentNode, L = ip.getTotalLength(), calisiyor = false;
    function yaz(sonra) {
      if (calisiyor) return;
      calisiyor = true;
      ip.style.strokeDasharray = L + " " + (L + 10);
      ip.style.strokeDashoffset = L;
      svg.classList.add("yaziyor");
      var t0 = null, sure = 2300;
      function kare(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / sure), e = 1 - Math.pow(1 - k, 1.5), l = L * e, pt = ip.getPointAtLength(l);
        ip.style.strokeDashoffset = L - l;
        igne.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ") rotate(" + (-40 + Math.sin(k * 26) * 5).toFixed(1) + ")");
        if (k < 1) requestAnimationFrame(kare);
        else { calisiyor = false; svg.classList.remove("yaziyor"); ip.style.strokeDasharray = "none"; if (sonra) sonra(); }
      }
      requestAnimationFrame(kare);
    }
    if (azHareket) { iplikBaslat(); return; }
    yaz(iplikBaslat);
    sar.addEventListener("click", function () { yaz(null); });
  })();

  /* ---------- ortak: mesaj aracı ---------- */
  function kopyala(metin) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(metin).catch(function () { eskiKopya(metin); });
    eskiKopya(metin); return Promise.resolve();
  }
  function eskiKopya(metin) {
    var t = d.createElement("textarea"); t.value = metin; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    d.body.appendChild(t); t.select(); try { d.execCommand("copy"); } catch (e) {} d.body.removeChild(t);
  }
  function mesajAraci(kap, kurucu) {
    var on = $("[data-onizleme]", kap), wa = $("[data-wa]", kap), kop = $("[data-kopyala]", kap);
    function guncelle() {
      var m = kurucu();
      if (on) on.textContent = m;
      if (wa) wa.href = WA + "?text=" + encodeURIComponent(m);
    }
    kap.addEventListener("input", guncelle);
    kap.addEventListener("change", guncelle);
    if (kop) {
      var ilkYazi = kop.textContent;
      kop.addEventListener("click", function () {
        kopyala(kurucu()).then(function () { kop.textContent = "Kopyalandı"; setTimeout(function () { kop.textContent = ilkYazi; }, 1800); });
      });
    }
    guncelle();
    return guncelle;
  }
  function deger(kap, ad) { var el = $('[name="' + ad + '"]:checked', kap) || $('[name="' + ad + '"]:not([type=radio])', kap); return el ? el.value.trim() : ""; }

  /* ---------- hizmet seçici ---------- */
  (function () {
    var kap = $('[data-tool="hizmet-secici"]');
    if (!kap) return;
    var ISLER = {
      pantolon: ["Pantolon", ["Paça kısaltma", "Paça uzatma (payı varsa)", "Bel daraltma", "Bel genişletme (payı varsa)", "Bacak daraltma", "Fermuar değişimi", "Sökük ya da yırtık onarımı"]],
      kot: ["Kot", ["Paça kısaltma", "Orijinal paçayı koruyarak kısaltma", "Bel daraltma", "Bacak daraltma", "Fermuar değişimi", "Yırtık onarımı ya da yama"]],
      etek: ["Etek", ["Boy kısaltma", "Bel daraltma", "Bel genişletme (payı varsa)", "Fermuar değişimi", "Astar onarımı"]],
      elbise: ["Elbise", ["Boy kısaltma", "Beden daraltma", "Askı kısaltma", "Fermuar değişimi", "Sökük onarımı"]],
      abiye: ["Abiye ya da gelinlik", ["Boy ayarı", "Beden daraltma", "Askı ve omuz ayarı", "Fermuar ya da kopça", "Prova için görüşme"]],
      ceket: ["Ceket", ["Kol boyu kısaltma", "Beden daraltma", "Astar onarımı", "Düğme dikimi ya da değişimi"]],
      gomlek: ["Gömlek", ["Kol boyu kısaltma", "Beden daraltma", "Yaka ya da manşet onarımı", "Düğme dikimi"]],
      mont: ["Mont ya da kaban", ["Fermuar değişimi", "Kol boyu kısaltma", "Astar onarımı", "Cep onarımı"]],
      perde: ["Perde ya da tül", ["Boy kısaltma", "Ölçüye göre dikim", "Büzgü şeridi dikimi"]],
      ozel: ["Kişiye özel dikim", ["Ölçüye göre elbise", "Ölçüye göre pantolon ya da etek", "Ölçüye göre gömlek", "Model üzerine görüşme"]],
      diger: ["Başka bir iş", []]
    };
    var giysiKap = $("[data-giysiler]", kap), islemKap = $("[data-islemler]", kap), bos = $("[data-islem-bos]", kap);
    var adetEl = $("[data-adet]", kap), listeEl = $("[data-liste]", kap), ekle = $("[data-ekle]", kap);
    var secili = null, islemler = [], adet = 1, liste = [];

    function islemCiz() {
      islemKap.innerHTML = "";
      if (!secili) { bos.hidden = false; bos.textContent = "Önce yukarıdan giysiyi seçin; o giysiye uygun işler burada açılır."; return; }
      var is = ISLER[secili][1];
      if (!is.length) { bos.hidden = false; bos.textContent = "Ne yapılmasını istediğinizi aşağıdaki not alanına yazın."; return; }
      bos.hidden = true;
      is.forEach(function (ad) {
        var b = d.createElement("button"); b.type = "button"; b.className = "cip"; b.textContent = ad;
        b.setAttribute("aria-pressed", islemler.indexOf(ad) > -1 ? "true" : "false");
        b.addEventListener("click", function () {
          var i = islemler.indexOf(ad);
          if (i > -1) islemler.splice(i, 1); else islemler.push(ad);
          b.setAttribute("aria-pressed", i > -1 ? "false" : "true");
          guncelle();
        });
        islemKap.appendChild(b);
      });
    }
    function giysiSec(k) {
      secili = ISLER[k] ? k : null; islemler = [];
      $$(".cip", giysiKap).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-giysi") === secili ? "true" : "false"); });
      islemCiz(); guncelle();
    }
    function satir(o) {
      var s = "• " + ISLER[o.g][0] + (o.a > 1 ? " (" + o.a + " parça)" : "");
      if (o.i.length) s += ": " + o.i.join(", ").toLocaleLowerCase("tr");
      return s;
    }
    function listeCiz() {
      listeEl.innerHTML = "";
      liste.forEach(function (o, i) {
        var li = d.createElement("li"), sp = d.createElement("span"), b = d.createElement("button");
        sp.textContent = satir(o).slice(2);
        b.type = "button"; b.setAttribute("aria-label", ISLER[o.g][0] + " satırını listeden çıkarın"); b.textContent = "×";
        b.addEventListener("click", function () { liste.splice(i, 1); listeCiz(); guncelle(); });
        li.appendChild(sp); li.appendChild(b); listeEl.appendChild(li);
      });
    }
    $$(".cip", giysiKap).forEach(function (b) { b.addEventListener("click", function () { giysiSec(b.getAttribute("data-giysi") === secili ? null : b.getAttribute("data-giysi")); }); });
    $$("[data-adet-dugme]", kap).forEach(function (b) {
      b.addEventListener("click", function () { adet = Math.max(1, Math.min(30, adet + parseInt(b.getAttribute("data-adet-dugme"), 10))); adetEl.textContent = adet; guncelle(); });
    });
    ekle.addEventListener("click", function () {
      if (!secili) { bos.hidden = false; bos.textContent = "Listeye eklemek için önce bir giysi seçin."; giysiKap.scrollIntoView({ block: "center", behavior: azHareket ? "auto" : "smooth" }); return; }
      liste.push({ g: secili, i: islemler.slice(), a: adet });
      adet = 1; adetEl.textContent = 1; giysiSec(null); listeCiz(); guncelle();
    });
    var guncelle = mesajAraci(kap, function () {
      var ad = deger(kap, "ad"), not = deger(kap, "not");
      var satirlar = liste.map(satir);
      if (secili) satirlar.push(satir({ g: secili, i: islemler, a: adet }));
      var m = "Merhaba Terzi Muharrem," + (ad ? " ben " + ad + "." : "") + "\n";
      if (satirlar.length) m += "Şu iş için bilgi almak istiyorum:\n" + satirlar.join("\n") + "\n";
      else m += "Bir dikiş işi için bilgi almak istiyorum.\n";
      if (not) m += "Not: " + not + "\n";
      m += "Uygun olduğunuz gün ve saati yazar mısınız?";
      return m;
    });
    var q = /[?&]giysi=([a-z]+)/.exec(location.search);
    if (q && ISLER[q[1]]) giysiSec(q[1]); else islemCiz();
  })();

  /* ---------- paça boyu ---------- */
  (function () {
    var kap = $('[data-tool="paca-boyu"]');
    if (!kap) return;
    var sec = "hafif", ADLAR = { kirimsiz: "kırımsız", hafif: "hafif kırım", yarim: "yarım kırım", tam: "tam kırım" };
    function uygula() {
      $$("[data-kirim]", kap).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-kirim") === sec ? "true" : "false"); });
      $$("[data-kirim-cizim]", kap).forEach(function (g) { g.classList.toggle("sec", g.getAttribute("data-kirim-cizim") === sec); });
      $$("[data-kirim-metin]", kap).forEach(function (p) { p.hidden = p.getAttribute("data-kirim-metin") !== sec; });
    }
    var guncelle = mesajAraci(kap, function () {
      return "Merhaba Terzi Muharrem, pantolon paçası kısaltılacak. Paça boyu tercihim: " + ADLAR[sec] + ". Giyeceğim ayakkabıyla gelip ölçü verebilirim; uygun olduğunuz zamanı yazar mısınız?";
    });
    $$("[data-kirim]", kap).forEach(function (b) { b.addEventListener("click", function () { sec = b.getAttribute("data-kirim"); uygula(); guncelle(); }); });
    uygula();
  })();

  /* ---------- ölçü kartı ---------- */
  (function () {
    var kap = $('[data-tool="olcu-karti"]');
    if (!kap) return;
    function isaretle(k) {
      $$("[data-olcu-cizgi]", kap).forEach(function (c) { c.classList.toggle("sec", c.getAttribute("data-olcu-cizgi") === k); });
      $$("[data-olcu]", kap).forEach(function (s) { s.classList.toggle("sec", s.getAttribute("data-olcu") === k); });
    }
    $$("[data-olcu]", kap).forEach(function (s) {
      var k = s.getAttribute("data-olcu");
      s.addEventListener("click", function () { isaretle(k); });
      s.addEventListener("focusin", function () { isaretle(k); });
    });
    isaretle("gogus");
    mesajAraci(kap, function () {
      var p = [];
      $$("[data-olcu]", kap).forEach(function (s) {
        var i = $("input", s), v = (i.value || "").replace(",", ".").trim();
        if (v && !isNaN(parseFloat(v))) p.push($("label", s).textContent.trim().toLocaleLowerCase("tr") + " " + String(parseFloat(v)).replace(".", ",") + " cm");
      });
      var ne = deger(kap, "olcu-ne");
      return "Merhaba Terzi Muharrem, " + (ne ? ne.toLocaleLowerCase("tr") + " için " : "") + "bilgi almak istiyorum.\n" +
        (p.length ? "Evde aldığım ölçüler: " + p.join(", ") + ".\n" : "Ölçülerimi atölyede vermek istiyorum.\n") +
        "Kesin ölçüyü sizin almanız için ne zaman uğrayabilirim?";
    });
  })();

  /* ---------- toplu dikim: talep + beden dağılımı ---------- */
  (function () {
    var kap = $('[data-tool="toplu-talep"]');
    if (!kap) return;
    var bedenKap = $('[data-tool="beden-dagilimi"]'), dagilimMetni = "";
    function tarihYaz(v) { var a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return a ? a[3] + "." + a[2] + "." + a[1] : v; }
    var guncelle = mesajAraci(kap, function () {
      var urun = deger(kap, "urun"), adet = deger(kap, "adet"), kumas = deger(kap, "kumas"), numune = deger(kap, "numune"),
        baski = deger(kap, "baski"), tarih = deger(kap, "tarih"), firma = deger(kap, "firma"), not = deger(kap, "not");
      var ekleDagilim = $("[data-dagilim-ekle]", kap);
      var m = "Merhaba Terzi Muharrem," + (firma ? " " + firma + " adına yazıyorum." : "") + "\nToplu dikim için bilgi almak istiyorum.\n";
      m += "• Ürün: " + (urun || "(belirtilmedi)") + "\n";
      m += "• Adet: " + (adet ? adet : "(belirtilmedi)") + "\n";
      if (kumas) m += "• Kumaş: " + kumas + "\n";
      if (numune) m += "• Numune: " + numune + "\n";
      if (baski) m += "• Baskı ya da nakış: " + baski + "\n";
      if (ekleDagilim && ekleDagilim.checked && dagilimMetni) m += "• Beden dağılımı: " + dagilimMetni + "\n";
      if (tarih) m += "• İstenen teslim tarihi: " + tarihYaz(tarih) + "\n";
      if (not) m += "Not: " + not + "\n";
      m += "Bu iş atölyenize uygun mu? Uygunsa görüşmek için ne zaman arayabilirim?";
      return m;
    });
    if (!bedenKap) return;
    function hesap() {
      var toplam = parseInt(($("[name=toplam]", bedenKap).value || "0"), 10) || 0;
      var hucre = $$("[data-beden]", bedenKap), oran = hucre.map(function (h) { return Math.max(0, parseInt($("input", h).value || "0", 10) || 0); });
      var ot = oran.reduce(function (a, b) { return a + b; }, 0), sonuc = oran.map(function () { return 0; });
      if (toplam > 0 && ot > 0) {
        var ham = oran.map(function (o) { return toplam * o / ot; });
        sonuc = ham.map(Math.floor);
        var kalan = toplam - sonuc.reduce(function (a, b) { return a + b; }, 0);
        var sira = ham.map(function (v, i) { return { i: i, k: v - Math.floor(v) }; }).filter(function (o) { return oran[o.i] > 0; }).sort(function (a, b) { return b.k - a.k; });
        for (var j = 0; j < kalan; j++) sonuc[sira[j % sira.length].i]++;
      }
      var parca = [];
      hucre.forEach(function (h, i) { $("output", h).textContent = sonuc[i]; if (sonuc[i] > 0) parca.push(h.getAttribute("data-beden") + " " + sonuc[i]); });
      dagilimMetni = parca.join(", ");
      var oz = $("[data-dagilim-ozet]", bedenKap);
      oz.textContent = toplam > 0 && ot > 0 ? "Toplam " + toplam + " adet: " + dagilimMetni + "." : "Toplam adedi ve en az bir bedenin oranını girin.";
      var ad = $("[name=adet]", kap);
      if (ad && !ad.value && toplam > 0) ad.placeholder = String(toplam);
      guncelle();
    }
    bedenKap.addEventListener("input", hesap);
    hesap();
  })();

  /* ---------- sık sorulanlar: arama ve süzme ---------- */
  (function () {
    var kap = $('[data-tool="sss-ara"]');
    if (!kap) return;
    var sorular = $$(".soru"), ara = $("[name=ara]", kap), sayi = $("[data-sss-sayi]", kap), bosKutu = $("[data-sss-bos]"), kat = "tum";
    function duz(s) { return s.toLocaleLowerCase("tr").replace(/[âîû]/g, function (c) { return { "â": "a", "î": "i", "û": "u" }[c]; }); }
    function suz() {
      var q = duz(ara.value.trim()), kelimeler = q.split(/\s+/).filter(Boolean), n = 0;
      sorular.forEach(function (s) {
        var uy = (kat === "tum" || s.getAttribute("data-kat") === kat) && kelimeler.every(function (k) { return duz(s.textContent).indexOf(k) > -1; });
        s.hidden = !uy; if (uy) n++;
      });
      sayi.textContent = n === sorular.length ? sorular.length + " sorunun tamamı gösteriliyor." : sorular.length + " sorudan " + n + " tanesi gösteriliyor.";
      if (bosKutu) bosKutu.hidden = n > 0;
    }
    $$("[data-kat-sec]", kap).forEach(function (b) {
      b.addEventListener("click", function () {
        kat = b.getAttribute("data-kat-sec");
        $$("[data-kat-sec]", kap).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        suz();
      });
    });
    ara.addEventListener("input", suz);
    suz();
    var sor = $('[data-tool="soru-sor"]');
    if (sor) {
      var g = mesajAraci(sor, function () {
        var s = deger(sor, "soru") || ara.value.trim();
        return "Merhaba Terzi Muharrem, sitede yanıtını bulamadığım bir sorum var:\n" + (s || "(sorunuzu buraya yazın)");
      });
      ara.addEventListener("input", g);
    }
  })();

  /* ---------- iletişim: uğrama mesajı ---------- */
  (function () {
    var kap = $('[data-tool="ugrama"]');
    if (!kap) return;
    var s = openStatus(HOURS), gunKap = $("[data-gunler]", kap);
    for (var k = 0; k < 7; k++) {
      var ad = GUNLER[(s.dayIndex + k) % 7], et = k === 0 ? "Bugün" : k === 1 ? "Yarın" : ad;
      var l = d.createElement("label"); l.className = "cip-r";
      var i = d.createElement("input"); i.type = "radio"; i.name = "gun"; i.value = k < 2 ? et.toLocaleLowerCase("tr") + " (" + ad + ")" : ad + " günü";
      if (k === 0) i.checked = true;
      var sp = d.createElement("span"); sp.textContent = et;
      l.appendChild(i); l.appendChild(sp); gunKap.appendChild(l);
    }
    function araliklar() {
      var bugun = /^bugün/.test(deger(kap, "gun"));
      $$("[name=aralik]", kap).forEach(function (r) {
        var bitis = parseInt(r.getAttribute("data-bitis"), 10) * 60, gecti = bugun && s.minutes >= bitis;
        r.disabled = gecti; r.parentNode.style.opacity = gecti ? ".4" : "";
        if (gecti && r.checked) r.checked = false;
      });
    }
    kap.addEventListener("change", araliklar);
    araliklar();
    mesajAraci(kap, function () {
      var gun = deger(kap, "gun"), ar = deger(kap, "aralik"), konu = deger(kap, "konu"), ad = deger(kap, "ad");
      return "Merhaba Terzi Muharrem," + (ad ? " ben " + ad + "." : "") + "\n" +
        gun.charAt(0).toLocaleUpperCase("tr") + gun.slice(1) + (ar ? " " + ar + " arasında" : "") + " atölyeye uğramak istiyorum." +
        (konu ? "\nKonu: " + konu.toLocaleLowerCase("tr") + "." : "") + "\nBu saat size uygun mu?";
    });
  })();
})();
