/* Kamberoğlu Duşakabin ve Sineklik — site betiği (çatı yok, düz JS) */
(function () {
  "use strict";
  var D = document;
  var HOURS = { "0": [["07:00", "22:00"]], "1": [["07:00", "22:30"]], "2": [["07:00", "22:00"]], "3": [["07:30", "22:30"]], "4": [["07:00", "22:00"]], "5": [["07:00", "22:00"]], "6": [["07:00", "22:00"]] };
  var WA = "https://wa.me/905374824912";
  var RM = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function trNum(n, d) { return Number(n).toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

  /* ---------- Açık/kapalı durumu (kit/status.js'ten kopya) ---------- */
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
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); el.classList.add("is-live"); });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", +el.getAttribute("data-day") === s.dayIndex); });
    $$(".hbar__now").forEach(function (el) { el.style.left = (s.minutes / 1440 * 100).toFixed(2) + "%"; });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- Menü ---------- */
  var nb = $(".navbtn"), nav = $("#nav");
  if (nb && nav) {
    nb.addEventListener("click", function () { var o = nav.classList.toggle("is-open"); nb.setAttribute("aria-expanded", o ? "true" : "false"); });
    D.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); nb.setAttribute("aria-expanded", "false"); nb.focus(); }
    });
  }

  /* ---------- Panel arkasında düşen damlalar ---------- */
  if (!RM) $$("[data-rain]").forEach(function (box) {
    var n = +box.getAttribute("data-rain") || 12;
    for (var i = 0; i < n; i++) {
      var d = D.createElement("i"), s = 5 + Math.random() * 11;
      d.style.cssText = "--x:" + (Math.random() * 100).toFixed(1) + "%;--s:" + s.toFixed(1) + "px;--d:" + (2.6 + Math.random() * 3.4).toFixed(2) + "s;--dl:-" + (Math.random() * 6).toFixed(2) + "s";
      box.appendChild(d);
    }
  });

  /* ---------- Kopyalama ---------- */
  function copyText(text, btn) {
    var lab = btn.querySelector("[data-copy-label]") || btn, old = lab.textContent;
    function done(ok) { lab.textContent = ok ? "Kopyalandı" : "Kopyalanamadı"; setTimeout(function () { lab.textContent = old; }, 1800); }
    function fallback() {
      var ta = D.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      D.body.appendChild(ta); ta.select(); var ok = false; try { ok = D.execCommand("copy"); } catch (e) { ok = false; } D.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  /* mesaj kutusu: [data-msgbox] içinde [data-msg], [data-wa], [data-copy] */
  function bindMsg(box) {
    var pre = $("[data-msg]", box), wa = $("[data-wa]", box), cp = $("[data-copy]", box);
    if (cp) cp.addEventListener("click", function () { copyText(pre.textContent, cp); });
    return function (text) { pre.textContent = text; if (wa) wa.href = waLink(text); };
  }

  /* ---------- Duşakabin plan çizimi (üstten görünüş) ---------- */
  var TYPES = {
    kose: { ad: "Köşe duşakabin", kisa: "İki duvarın birleştiği köşeye oturur; iki cephesi camdır. Kare ya da dikdörtgen tekne üzerinde en yaygın çözümdür.", a: "En (A)", b: "Derinlik (B)", A: 90, B: 90, door: "surgulu" },
    oval: { ad: "Oval köşe duşakabin", kisa: "Köşeye oturur, önü kavisli camdır. Kapılar kavis boyunca kayar; dar banyolarda köşeyi yumuşatır, geçişe yer açar.", a: "En (A)", b: "Derinlik (B)", A: 90, B: 90, door: "surgulu" },
    besgen: { ad: "Beşgen köşe duşakabin", kisa: "Köşenin önü kırık (pah) çizgiyle kapanır, kapı bu çapraz yüzdedir. Köşe tipine göre daha geniş bir giriş verir.", a: "En (A)", b: "Derinlik (B)", A: 90, B: 90, door: "menteseli" },
    duz: { ad: "Düz (iki duvar arası)", kisa: "Üç tarafı duvar olan bir girintiye tek düz cam cephe olarak takılır. Ölçüde duvar arası en belirleyicidir.", a: "Duvar arası en (A)", b: "Tekne derinliği (B)", A: 120, B: 80, door: "surgulu" },
    kuvet: { ad: "Küvet üstü paravan", kisa: "Küveti duş alanına çevirmek için küvet kenarına oturan cam paneldir. Sabit, katlanır ya da açılır kanatlı olabilir.", a: "Küvet boyu (A)", b: "Küvet eni (B)", A: 170, B: 70, door: "sabit" },
    walkin: { ad: "Sabit panel (walk-in)", kisa: "Kapısı olmayan, tek sabit camdan oluşan açık duş alanı. Zemine sıfır duş alanlarında ve geniş banyolarda tercih edilir.", a: "Alan eni (A)", b: "Alan derinliği (B)", A: 120, B: 90, door: "yok" }
  };
  var planN = 0;
  function num(v, lo, hi) { v = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(v) && v >= lo && v <= hi ? v : null; }
  function planSVG(type, A, B, o) {
    o = o || {};
    var m = TYPES[type] || TYPES.kose, uid = "pl" + (++planN), mini = !!o.mini;
    var a = num(A, 30, 400), b = num(B, 30, 300), aL = a, bL = b;
    if (a == null) a = m.A; if (b == null) b = m.B;
    var door = o.door || m.door;
    var s = Math.min(170 / a, 112 / b), w = a * s, h = b * s;
    var out = [], bb = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    var INK = "#102A2E", PRI = "#0B7A75", ACC = "#FF9F1C", ACCD = "#B86400";
    var sw = mini ? 6 : 4.2, fs = 11;
    function F(n) { return (Math.round(n * 10) / 10).toString(); }
    function ext(x, y) { if (x < bb.x0) bb.x0 = x; if (y < bb.y0) bb.y0 = y; if (x > bb.x1) bb.x1 = x; if (y > bb.y1) bb.y1 = y; }
    function wall(x, y, ww, hh) { out.push('<rect x="' + F(x) + '" y="' + F(y) + '" width="' + F(ww) + '" height="' + F(hh) + '" fill="url(#' + uid + ')" stroke="' + INK + '" stroke-width="1.2"/>'); ext(x, y); ext(x + ww, y + hh); }
    function glass(d, pts) {
      out.push('<path d="' + d + '" fill="none" stroke="' + PRI + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#E9FBF9" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>');
      pts.forEach(function (p) { ext(p[0], p[1]); });
    }
    function doorP(d, pts) {
      out.push('<path d="' + d + '" fill="none" stroke="' + ACC + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"/>');
      pts.forEach(function (p) { ext(p[0], p[1]); });
    }
    function arrow(x1, y1, x2, y2) {
      if (mini) return;
      var t = Math.atan2(y2 - y1, x2 - x1), L = 6;
      out.push('<path d="M' + F(x1) + ' ' + F(y1) + 'L' + F(x2) + ' ' + F(y2) + 'M' + F(x2 - L * Math.cos(t - .5)) + ' ' + F(y2 - L * Math.sin(t - .5)) + 'L' + F(x2) + ' ' + F(y2) + 'L' + F(x2 - L * Math.cos(t + .5)) + ' ' + F(y2 - L * Math.sin(t + .5)) + '" fill="none" stroke="' + ACCD + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>');
    }
    function rot(vx, vy, t) { return [vx * Math.cos(t) - vy * Math.sin(t), vx * Math.sin(t) + vy * Math.cos(t)]; }
    function swing(hx, hy, ex, ey, ox, oy, ang) {
      var vx = ex - hx, vy = ey - hy, L = Math.hypot(vx, vy), t = ang * Math.PI / 180;
      var r1 = rot(vx, vy, t), r2 = rot(vx, vy, -t), use1 = (r1[0] * ox + r1[1] * oy) >= (r2[0] * ox + r2[1] * oy);
      var r = use1 ? r1 : r2, px = hx + r[0], py = hy + r[1], mid = rot(vx, vy, (use1 ? 1 : -1) * t / 2);
      out.push('<path d="M' + F(ex) + ' ' + F(ey) + 'A' + F(L) + ' ' + F(L) + ' 0 0 ' + (use1 ? 1 : 0) + ' ' + F(px) + ' ' + F(py) + '" fill="none" stroke="' + ACCD + '" stroke-width="1.3" stroke-dasharray="3 3"/>');
      doorP("M" + F(hx) + " " + F(hy) + "L" + F(px) + " " + F(py), [[hx, hy], [px, py], [hx + mid[0], hy + mid[1]], [ex, ey]]);
      out.push('<circle cx="' + F(hx) + '" cy="' + F(hy) + '" r="' + (mini ? 4 : 2.8) + '" fill="' + INK + '"/>');
    }
    function fold(hx, hy, ex, ey, ox, oy) {
      var vx = ex - hx, vy = ey - hy, L = Math.hypot(vx, vy), ux = vx / L, uy = vy / L, nx = -uy, ny = ux;
      if (nx * ox + ny * oy < 0) { nx = -nx; ny = -ny; }
      var p1x = hx + ux * L * .25 + nx * L * .433, p1y = hy + uy * L * .25 + ny * L * .433, p2x = hx + ux * L * .5, p2y = hy + uy * L * .5;
      out.push('<path d="M' + F(p2x) + ' ' + F(p2y) + 'L' + F(ex) + ' ' + F(ey) + '" fill="none" stroke="' + ACCD + '" stroke-width="1.3" stroke-dasharray="3 3"/>');
      doorP("M" + F(hx) + " " + F(hy) + "L" + F(p1x) + " " + F(p1y) + "L" + F(p2x) + " " + F(p2y), [[hx, hy], [p1x, p1y], [p2x, p2y], [ex, ey]]);
      out.push('<circle cx="' + F(hx) + '" cy="' + F(hy) + '" r="' + (mini ? 4 : 2.8) + '" fill="' + INK + '"/>');
    }
    function label(cx, cy, txt, vert) {
      var bw = txt.length * 6.3 + 14;
      var g = '<rect x="' + F(-bw / 2) + '" y="-9" width="' + F(bw) + '" height="18" rx="9" fill="#fff" stroke="' + PRI + '" stroke-width="1"/><text x="0" y="4" text-anchor="middle" font-size="' + fs + '" font-weight="700" fill="' + INK + '" font-family="Wix Madefor Text, Segoe UI, sans-serif">' + txt + "</text>";
      out.push('<g transform="translate(' + F(cx) + " " + F(cy) + ")" + (vert ? " rotate(-90)" : "") + '">' + g + "</g>");
      if (vert) { ext(cx - 10, cy - bw / 2); ext(cx + 10, cy + bw / 2); } else { ext(cx - bw / 2, cy - 10); ext(cx + bw / 2, cy + 10); }
    }
    function dims() {
      if (mini) return;
      var y = -28, x = -28;
      out.push('<path d="M0 ' + (y - 5) + "V" + (y + 5) + "M" + F(w) + " " + (y - 5) + "V" + (y + 5) + "M0 " + y + "H" + F(w) + '" stroke="#3A5559" stroke-width="1" fill="none"/>');
      out.push('<path d="M' + (x - 5) + " 0H" + (x + 5) + "M" + (x - 5) + " " + F(h) + "H" + (x + 5) + "M" + x + " 0V" + F(h) + '" stroke="#3A5559" stroke-width="1" fill="none"/>');
      label(w / 2, y, aL == null ? "A" : "A = " + trNum(aL) + " cm");
      label(x, h / 2, bL == null ? "B" : "B = " + trNum(bL) + " cm", true);
    }
    function head(x, y) { if (mini) return; out.push('<circle cx="' + F(x) + '" cy="' + F(y) + '" r="6" fill="#fff" stroke="' + INK + '" stroke-width="1.3"/><circle cx="' + F(x) + '" cy="' + F(y) + '" r="1.6" fill="' + PRI + '"/>'); }
    function drain(x, y) { out.push('<circle cx="' + F(x) + '" cy="' + F(y) + '" r="' + (mini ? 6 : 4.5) + '" fill="none" stroke="' + INK + '" stroke-width="' + (mini ? 2 : 1.2) + '"/>'); }
    var fill = "rgba(11,122,117,.11)";

    if (type === "duz" || type === "kuvet") { wall(-10, -10, w + 20, 10); wall(-10, 0, 10, h + 12); wall(w, 0, 10, h + 12); }
    else { wall(-10, -10, w + 18, 10); wall(-10, 0, 10, h + 14); }

    if (type === "kose") {
      out.push('<rect x="0" y="0" width="' + F(w) + '" height="' + F(h) + '" fill="' + fill + '"/>');
      head(16, 16); drain(w / 2, h / 2);
      if (door === "menteseli") { glass("M" + F(w) + " 0V" + F(h) + "M0 " + F(h) + "H" + F(w * .5), [[w, 0], [w, h], [0, h]]); swing(w, h, w * .5, h, 0, 1, 70); }
      else if (door === "katlanir") { glass("M" + F(w) + " 0V" + F(h) + "M0 " + F(h) + "H" + F(w * .5), [[w, 0], [w, h], [0, h]]); fold(w, h, w * .5, h, 0, 1); }
      else {
        glass("M" + F(w) + " 0V" + F(h * .55) + "M0 " + F(h) + "H" + F(w * .55), [[w, 0], [w, h], [0, h]]);
        doorP("M" + F(w - 6) + " " + F(h * .42) + "V" + F(h - 6) + "H" + F(w * .42), [[w, h]]);
        arrow(w - 15, h * .86, w - 15, h * .62); arrow(w * .86, h - 15, w * .62, h - 15);
      }
    } else if (type === "oval") {
      out.push('<path d="M0 0H' + F(w) + "A" + F(w) + " " + F(h) + " 0 0 1 0 " + F(h) + 'Z" fill="' + fill + '"/>');
      head(16, 16); drain(w * .38, h * .38);
      glass("M" + F(w) + " 0A" + F(w) + " " + F(h) + " 0 0 1 0 " + F(h), [[w, 0], [0, h], [w * .7071, h * .7071]]);
      var ang = function (deg, rx, ry) { var t = deg * Math.PI / 180; return [Math.cos(t) * rx, Math.sin(t) * ry]; };
      var q1 = ang(26, w - 7, h - 7), q2 = ang(64, w - 7, h - 7);
      doorP("M" + F(q1[0]) + " " + F(q1[1]) + "A" + F(w - 7) + " " + F(h - 7) + " 0 0 1 " + F(q2[0]) + " " + F(q2[1]), [q1, q2]);
      var a1 = ang(40, w - 18, h - 18), a2 = ang(28, w - 18, h - 18), a3 = ang(50, w - 18, h - 18), a4 = ang(62, w - 18, h - 18);
      arrow(a1[0], a1[1], a2[0], a2[1]); arrow(a3[0], a3[1], a4[0], a4[1]);
    } else if (type === "besgen") {
      var q1x = w, q1y = h * .45, q2x = w * .45, q2y = h;
      out.push('<path d="M0 0H' + F(w) + "V" + F(q1y) + "L" + F(q2x) + " " + F(q2y) + 'H0Z" fill="' + fill + '"/>');
      head(16, 16); drain(w * .42, h * .42);
      glass("M" + F(w) + " 0V" + F(q1y) + "M" + F(q2x) + " " + F(q2y) + "H0", [[w, 0], [q1x, q1y], [q2x, q2y], [0, h]]);
      if (door === "surgulu") {
        glass("M" + F(q1x) + " " + F(q1y) + "L" + F((q1x + q2x) / 2 + (q2x - q1x) * .08) + " " + F((q1y + q2y) / 2 + (q2y - q1y) * .08), [[q1x, q1y]]);
        var ox = -4.2, oy = -4.2;
        doorP("M" + F(q1x + (q2x - q1x) * .42 + ox) + " " + F(q1y + (q2y - q1y) * .42 + oy) + "L" + F(q2x + ox) + " " + F(q2y + oy), [[q2x, q2y]]);
        arrow(q1x + (q2x - q1x) * .82 - 12, q1y + (q2y - q1y) * .82 - 12, q1x + (q2x - q1x) * .58 - 12, q1y + (q2y - q1y) * .58 - 12);
      } else if (door === "katlanir") { fold(q1x, q1y, q2x, q2y, 1, 1); }
      else { swing(q1x, q1y, q2x, q2y, 1, 1, 65); }
    } else if (type === "duz") {
      out.push('<rect x="0" y="0" width="' + F(w) + '" height="' + F(h) + '" fill="' + fill + '"/>');
      head(16, 16); drain(w / 2, h / 2);
      if (door === "menteseli") { glass("M0 " + F(h) + "H" + F(w * .5), [[0, h], [w, h]]); swing(w, h, w * .5, h, 0, 1, 70); }
      else if (door === "katlanir") { glass("M0 " + F(h) + "H" + F(w * .5), [[0, h], [w, h]]); fold(w, h, w * .5, h, 0, 1); }
      else { glass("M0 " + F(h) + "H" + F(w * .56), [[0, h], [w, h]]); doorP("M" + F(w * .44) + " " + F(h - 6) + "H" + F(w), [[w, h]]); arrow(w * .9, h - 16, w * .64, h - 16); }
    } else if (type === "kuvet") {
      out.push('<rect x="0" y="0" width="' + F(w) + '" height="' + F(h) + '" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="' + (mini ? 2.4 : 1.5) + '"/>');
      out.push('<rect x="7" y="7" width="' + F(w - 14) + '" height="' + F(h - 14) + '" rx="' + F(Math.min(16, h / 3)) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (mini ? 1.6 : .8) + '"/>');
      head(14, h / 2); drain(28, h / 2);
      if (door === "menteseli") { swing(0, h, w * .45, h, 0, 1, 60); }
      else if (door === "katlanir") { fold(0, h, w * .48, h, 0, 1); }
      else if (door === "surgulu") { glass("M0 " + F(h) + "H" + F(w * .5), [[0, h], [w * .5, h]]); doorP("M" + F(w * .42) + " " + F(h + 6) + "H" + F(w * .9), [[w * .9, h + 6]]); arrow(w * .84, h + 16, w * .6, h + 16); }
      else { glass("M0 " + F(h) + "H" + F(w * .45), [[0, h], [w * .45, h]]); }
    } else {
      out.push('<rect x="0" y="0" width="' + F(w) + '" height="' + F(h) + '" fill="' + fill + '"/>');
      out.push('<path d="M' + F(w) + " 0V" + F(h) + "H" + F(w * .62) + '" fill="none" stroke="' + INK + '" stroke-width="1" stroke-dasharray="4 4"/>');
      head(16, 16); drain(w * .4, h * .45);
      glass("M0 " + F(h) + "H" + F(w * .62), [[0, h], [w * .62, h], [w, h]]);
      if (!mini) { arrow(w * .81, h + 30, w * .81, h + 6); out.push('<text x="' + F(w * .81) + '" y="' + F(h + 44) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#3A5559" font-family="Wix Madefor Text, Segoe UI, sans-serif">giriş</text>'); ext(w * .81, h + 48); }
    }
    dims();
    var pad = mini ? 6 : 10, vb = [bb.x0 - pad, bb.y0 - pad, bb.x1 - bb.x0 + pad * 2, bb.y1 - bb.y0 + pad * 2].map(F).join(" ");
    var title = (o.title || m.ad) + (mini ? "" : ", üstten görünüş");
    return '<svg viewBox="' + vb + '" role="img" aria-label="' + title + ' plan çizimi" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="' + uid + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#E3EEEE"/><path d="M0 0V6" stroke="#102A2E" stroke-width="1.3" opacity=".6"/></pattern></defs>' + out.join("") + "</svg>";
  }
  $$("[data-plan]").forEach(function (el) {
    el.innerHTML = planSVG(el.getAttribute("data-plan"), el.getAttribute("data-a"), el.getAttribute("data-b"), { door: el.getAttribute("data-door"), mini: el.hasAttribute("data-mini") });
  });

  /* ---------- Genel sekmeler ---------- */
  $$("[data-tabs]").forEach(function (box) {
    var btns = $$('[role="tab"]', box);
    function sel(b, focus) {
      btns.forEach(function (x) {
        var on = x === b, p = D.getElementById(x.getAttribute("aria-controls"));
        x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; if (p) p.hidden = !on;
      });
      if (focus) b.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { sel(b); });
      b.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); sel(btns[(i + k + btns.length) % btns.length], true); }
      });
    });
    if (btns.length) sel(btns[0]);
  });

  /* ---------- Ana sayfa: plan seçici ---------- */
  (function () {
    var box = $("[data-plantease]"); if (!box) return;
    var tabs = $$('[role="tab"]', box), outEl = $("[data-plan-out]", box), ttl = $("[data-plan-title]", box), txt = $("[data-plan-text]", box), link = $("[data-plan-link]", box);
    function sel(t, focus) {
      var k = t.getAttribute("data-k");
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); x.tabIndex = x === t ? 0 : -1; });
      outEl.innerHTML = planSVG(k, null, null, {});
      ttl.textContent = TYPES[k].ad; txt.textContent = TYPES[k].kisa; link.href = "teklif.html?tip=" + k;
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      var mi = $("[data-mini-k]", t); if (mi) mi.innerHTML = planSVG(t.getAttribute("data-k"), null, null, { mini: true });
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); sel(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    sel(tabs[0]);
  })();

  /* ---------- Ana sayfa: dert bulucu ---------- */
  (function () {
    var box = $("[data-fixer]"); if (!box) return;
    var DATA = {
      ray: { t: "Sürgülü kapı takılıyor, zor kayıyor", n: "Rayda biriken kir ve kireç, aşınmış ya da kırılmış tekerlekler (rulmanlar), kapının raydan çıkması.", y: "Rayı ve tekerlek çevresini yumuşak bezle temizleyin, zorlamadan deneyin. Düzelmiyorsa tekerlek takımının değişmesi gerekebilir; kabinin fotoğrafıyla sorun.", m: "Duşakabinimin sürgülü kapısı takılıyor, zor kayıyor. Tekerlek/ray için bakabilir misiniz?" },
      su: { t: "Alttan ya da kenardan su kaçırıyor", n: "Kapının altındaki süpürgelik fitili aşınmış, duvar ve tekne birleşimindeki silikon ayrılmış ya da kapı tam kapanmıyor olabilir.", y: "Suyun nereden çıktığını görmek için kapıyı kapatıp kenarları el duşuyla kısa süre ıslatın. Fitil ve silikon yenilenebilir; yerini gösteren fotoğrafla sorun.", m: "Duşakabinim alttan/kenardan su kaçırıyor. Fitil ya da silikon yenilemesi için bilgi alabilir miyim?" },
      mik: { t: "Kapı tam kapanmıyor, kendiliğinden açılıyor", n: "Kapıyı kapalı tutan mıknatıslı fitil zayıflamış ya da yerinden çıkmış, menteşe/ray ayarı bozulmuş olabilir.", y: "Mıknatıslı fitilin yerinde durup durmadığına bakın. Fitil değişimi ya da kapı ayarı için kapının fotoğrafıyla sorun.", m: "Duşakabin kapım tam kapanmıyor, mıknatıslı fitil ya da ayar için bakabilir misiniz?" },
      kir: { t: "Cam çatladı ya da kırıldı", n: "Duşakabinlerde kullanılan temperli cam darbe aldığında çatlamak yerine çoğu zaman küçük parçalara dağılır. Kenardan aldığı darbe sonradan kırılmaya yol açabilir.", y: "Kabini kullanmayın, parçaları eldivenle toplayın. Temperli cam sonradan kesilemediği için yeni cam ölçüye göre hazırlanır; ölçü ve fotoğrafla sorun.", m: "Duşakabinimin camı kırıldı. Cam değişimi için ölçü ve süreç hakkında bilgi alabilir miyim?" },
      sil: { t: "Silikon karardı, küf tuttu", n: "Sürekli nem ve yetersiz havalandırma silikonda küfe yol açar; yüzeyden temizlik çoğu zaman kalıcı olmaz.", y: "Eski silikon tamamen sökülüp yüzey kurutulduktan sonra yenisi çekilir. Banyoyu duştan sonra havalandırmak yeniden kararmayı geciktirir.", m: "Duşakabinimin silikonu karardı. Silikon yenileme için bilgi alabilir miyim?" },
      kirec: { t: "Camda kireç lekesi geçmiyor", n: "Sert suyun damlaları kuruyunca camda mineral izi kalır; zamanla katmanlaşır.", y: "Her duştan sonra çekpasla suyu alın. Lekeye sirkeli ılık suyu bekletip yumuşak bezle silin; tel ya da aşındırıcı sünger camı çizer. Leke kalıcıysa sorun.", m: "Duşakabin camımda geçmeyen kireç lekeleri var. Ne önerirsiniz?" }
    };
    var btns = $$("[data-fx]", box), outEl = $("[data-fixer-out]", box), setMsg = bindMsg(box);
    function sel(b) {
      var d = DATA[b.getAttribute("data-fx")];
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      outEl.innerHTML = "<h3></h3><dl><dt>Olası neden</dt><dd></dd><dt>Ne yapılabilir</dt><dd></dd></dl>";
      $("h3", outEl).textContent = d.t; var dd = $$("dd", outEl); dd[0].textContent = d.n; dd[1].textContent = d.y;
      setMsg("Merhaba, web sitenizden yazıyorum. " + d.m);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { sel(b); }); });
    sel(btns[0]);
  })();

  /* ---------- Duşakabin: cam görünümü denemesi ---------- */
  (function () {
    var box = $("[data-tool='cam-gorunum']"); if (!box) return;
    var L = {
      seffaf: { t: "Şeffaf cam", d: "Banyoyu olduğundan geniş gösterir, ışığı hiç kesmez. Su damlası ve kireç izi en çok bu camda belli olur; düzenli çekpas ister.", m: [1, 4, 4] },
      buzlu: { t: "Buzlu cam", d: "Arkadaki şekiller yalnız gölge olarak seçilir. Işığı dağıtarak geçirir, damla izlerini de büyük ölçüde gizler.", m: [4, 3, 1] },
      kumlu: { t: "Kumlu bantlı cam", d: "Göz hizasında buzlu bir şerit, üstü ve altı şeffaf. Hem açıklık hissi hem de belli bir mahremiyet sağlar.", m: [3, 4, 3] },
      desenli: { t: "Desenli (çubuklu) cam", d: "Yüzeydeki desen görüntüyü kırar; ışık bol geçer. Leke az belli olur ama desen aralarını temizlemek biraz daha özen ister.", m: [3, 4, 2] },
      fume: { t: "Füme cam", d: "Koyu tonu banyoya farklı bir hava verir. Işık geçişi azalır; mahremiyet ışık durumuna göre değişir, ters ışıkta arkası görülebilir.", m: [2, 2, 3] }
    };
    var stage = $(".gd__stage", box), tag = $(".gd__tag", box), ttl = $("[data-gd-title]", box), txt = $("[data-gd-text]", box), met = $$(".meter dd", box);
    function set(k) {
      var d = L[k]; stage.setAttribute("data-look", k); tag.textContent = d.t; ttl.textContent = d.t; txt.textContent = d.d;
      met.forEach(function (dd, i) { $$("i", dd).forEach(function (ic, j) { ic.classList.toggle("on", j < d.m[i]); }); dd.setAttribute("aria-label", d.m[i] + " / 4"); });
    }
    $$("input[name='gorunum']", box).forEach(function (r) { r.addEventListener("change", function () { if (r.checked) set(r.value); }); if (r.checked) set(r.value); });
  })();

  /* ---------- Teklif aracı (imza) ---------- */
  (function () {
    var form = $("#teklif-form"); if (!form) return;
    var planOut = $("[data-plan-live]"), sumEl = $("[data-summary]"), setMsg = bindMsg($("[data-msgbox]"));
    var lblA = $("[data-lbl-a]", form), lblB = $("[data-lbl-b]", form), olcuyok = form.elements.olcuyok, doorNote = $("[data-door-note]", form);
    var NAMES = {
      kapi: { surgulu: "Sürgülü", menteseli: "Menteşeli (açılır)", katlanir: "Katlanır", sabit: "Sabit (kapısız)", karar: "Karar vermedim" },
      cam: { seffaf: "Şeffaf", buzlu: "Buzlu", kumlu: "Kumlu bantlı", desenli: "Desenli", fume: "Füme", karar: "Karar vermedim" },
      profil: { krom: "Krom / parlak", beyaz: "Beyaz", siyah: "Siyah", fark: "Fark etmez" },
      zemin: { var: "Tekne var, aynı kalacak", degis: "Tekne de değişecek", duz: "Tekne yok, zemin düz", kuvet: "Küvet var" },
      is: { yeni: "Yeni montaj", degisim: "Eskisini söküp yenisini takma", tamir: "Parça / tamir" }
    };
    function val(n) { var el = form.elements[n]; if (!el) return ""; if (el.length !== undefined && !el.tagName) { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ""; } return el.value; }
    function setRadio(n, v) { $$("input[name='" + n + "']", form).forEach(function (r) { r.checked = r.value === v; }); }
    function fieldNum(n, lo, hi) {
      var el = form.elements[n], raw = el.value.trim(), v = num(raw, lo, hi), err = $("[data-err='" + n + "']", form);
      var bad = raw !== "" && v == null; el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (err) err.textContent = bad ? lo + "–" + hi + " cm arasında bir sayı yazın" : "";
      return v;
    }
    var tipFromUrl = (location.search.match(/[?&]tip=([a-z]+)/) || [])[1];
    if (tipFromUrl && TYPES[tipFromUrl]) setRadio("tip", tipFromUrl);
    var lastTip = null;
    function update() {
      var tip = val("tip") || "kose", m = TYPES[tip];
      if (tip !== lastTip) {
        lblA.textContent = m.a; lblB.textContent = m.b;
        form.elements.a.placeholder = "ör. " + m.A; form.elements.b.placeholder = "ör. " + m.B;
        var dRadios = $$("input[name='kapi']", form), note = "";
        dRadios.forEach(function (r) {
          var dis = false;
          if (tip === "walkin") dis = r.value !== "sabit";
          else if (tip === "oval") dis = r.value === "menteseli" || r.value === "katlanir" || r.value === "sabit";
          else if (tip !== "kuvet") dis = r.value === "sabit";
          r.disabled = dis; if (dis && r.checked) r.checked = false;
        });
        if (tip === "walkin") { setRadio("kapi", "sabit"); note = "Sabit panelde kapı yoktur; giriş açık kalır."; }
        else if (tip === "oval") note = "Oval modellerde kapılar çoğunlukla kavis boyunca kayar. Farklı bir isteğiniz varsa notta belirtin.";
        else if (tip === "kuvet") note = "Küvet üstünde sabit panel, katlanır ya da açılır kanat sık görülür; uygun olanı ölçüde konuşun.";
        if (!val("kapi")) setRadio("kapi", m.door === "yok" ? "sabit" : m.door);
        if (tip === "kuvet") setRadio("zemin", "kuvet"); else if (val("zemin") === "kuvet") setRadio("zemin", "var");
        doorNote.textContent = note; lastTip = tip;
      }
      var noM = olcuyok.checked;
      ["a", "b", "h"].forEach(function (n) { form.elements[n].disabled = noM; });
      var A = noM ? null : fieldNum("a", 30, 400), B = noM ? null : fieldNum("b", 30, 300), H = noM ? null : fieldNum("h", 100, 260);
      var kapi = val("kapi");
      planOut.innerHTML = planSVG(tip, A, B, { door: kapi === "karar" || !kapi ? m.door : kapi });
      var rows = [
        ["Tip", m.ad],
        ["Ölçü", noM ? "Yerinde ölçü istiyorum" : (A || B || H) ? [A ? m.a + " " + trNum(A) + " cm" : "", B ? m.b + " " + trNum(B) + " cm" : "", H ? "Yükseklik " + trNum(H) + " cm" : ""].filter(Boolean).join(", ") : "Henüz yazılmadı"],
        ["Kapı", NAMES.kapi[kapi] || "Karar vermedim"],
        ["Cam", NAMES.cam[val("cam")] || "Karar vermedim"],
        ["Profil", NAMES.profil[val("profil")] || "Fark etmez"],
        ["Zemin", NAMES.zemin[val("zemin")] || "Belirtilmedi"],
        ["İş", NAMES.is[val("is")] || "Belirtilmedi"]
      ];
      sumEl.innerHTML = "";
      rows.forEach(function (r) { var dt = D.createElement("dt"), dd = D.createElement("dd"); dt.textContent = r[0]; dd.textContent = r[1]; sumEl.appendChild(dt); sumEl.appendChild(dd); });
      var semt = form.elements.semt.value.trim(), ad = form.elements.ad.value.trim(), notu = form.elements.not.value.trim();
      var lines = ["Merhaba Kamberoğlu Duşakabin, web sitenizdeki seçiciden duşakabin için teklif almak istiyorum.", ""];
      rows.forEach(function (r) { lines.push("• " + r[0] + ": " + r[1]); });
      if (semt) lines.push("• Semt / mahalle: " + semt);
      if (notu) lines.push("• Not: " + notu);
      lines.push("");
      lines.push(form.elements.foto.checked ? "Banyonun fotoğraflarını bu mesajın ardından gönderiyorum." : "Gerekirse banyonun fotoğrafını da gönderebilirim.");
      lines.push("Uygun seçenekleri ve fiyat bilgisini öğrenebilir miyim?");
      if (ad) lines.push("", ad);
      setMsg(lines.join("\n"));
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); var wa = $("[data-msgbox] [data-wa]"); if (wa) window.open(wa.href, "_blank", "noopener"); });
    update();
  })();

  /* ---------- Sineklik seçici ---------- */
  (function () {
    var form = $("#sineklik-form"); if (!form) return;
    var outList = $("[data-sk-out]"), setMsg = bindMsg($("[data-sk-msg]"));
    var M = {
      plise: { ad: "Plise sineklik", d: "Akordiyon gibi katlanan file yana çekilerek kapanır, kullanılmadığında kenarda ince bir şerit olarak durur." },
      menteseli: { ad: "Menteşeli sineklik", d: "Küçük bir kapı gibi açılıp kapanan çerçeveli model; sık girilip çıkılan kapılarda rahat kullanılır." },
      surgulu: { ad: "Sürgülü sineklik", d: "Ray üzerinde yana kayan çerçeveli model; sürgülü pencere ve kapılarla aynı mantıkla çalışır." },
      stor: { ad: "Stor sineklik", d: "Üstteki kasetine sarılan file aşağı çekilir, bırakınca yukarı toplanır; pencerede kullanılmadığında görünmez." },
      sabit: { ad: "Sabit (takıp çıkarmalı) sineklik", d: "Kasaya oturan sade, çerçeveli model; mevsim bitince çıkarılıp saklanabilir." },
      miknatisli: { ad: "Mıknatıslı perde sineklik", d: "Ortadan mıknatıslı şeritle kendiliğinden kapanan file perde; kapılarda pratik ve geçici bir çözümdür." }
    };
    var YER = { pencere: "Pencere", balkon: "Balkon / bahçe kapısı", kapi: "Giriş ya da iç kapı" };
    var ACI = { ice: "İçe açılır / vasistas", surgulu: "Sürgülü", disa: "Dışa açılır" };
    var ONC = { yer: "Az yer kaplasın, görünmesin", gecis: "Sık girip çıkıyoruz", evcil: "Evcil hayvan var", mevsim: "Yazın takıp kışın sökmek" };
    function val(n) { var r = $("input[name='" + n + "']:checked", form); return r ? r.value : ""; }
    function update() {
      var yer = val("yer") || "pencere", aci = val("acilis") || "ice", onc = $$("input[name='oncelik']:checked", form).map(function (x) { return x.value; });
      var sc = { plise: 0, menteseli: 0, surgulu: 0, stor: 0, sabit: 0, miknatisli: 0 }, why = {};
      function add(k, n, w) { sc[k] += n; if (w) (why[k] = why[k] || []).push(w); }
      if (yer === "pencere") { add("stor", 3); add("plise", 3); add("sabit", 3); add("surgulu", 1); add("menteseli", 1); add("miknatisli", -5); }
      if (yer === "balkon") { add("plise", 3, "alt rayı alçak olduğu için kapıdan geçişi zorlaştırmaz"); add("menteseli", 3); add("surgulu", 2); add("stor", 0); add("sabit", -3); add("miknatisli", 1); }
      if (yer === "kapi") { add("menteseli", 3); add("plise", 2); add("miknatisli", 2); add("surgulu", 0); add("stor", -2); add("sabit", -4); }
      if (aci === "surgulu") { add("surgulu", 4, "sürgülü doğramanın rayına uyum sağlar"); add("plise", 1); add("sabit", -1); }
      if (aci === "ice") { add("sabit", 1, "içe açılan kanat sinekliğe değmez, kol içeride kalır"); add("stor", 1); add("plise", 1); }
      if (aci === "disa") { add("plise", 2, "dışa açılan kanatta sineklik içeriden takılır; açılır olması kola erişim sağlar"); add("stor", 1, "içeriden takılır, kanadı açmak için yukarı toplanır"); add("menteseli", 1); add("sabit", -4); }
      if (onc.indexOf("yer") > -1) { add("plise", 2, "kullanılmadığında yalnız ince bir şerit kalır"); add("stor", 2, "kasetinde saklandığı için görünmez"); }
      if (onc.indexOf("gecis") > -1) { add("menteseli", 2, "kapı gibi açılıp kapanır, sık geçişe uygundur"); add("plise", 1); add("miknatisli", 1, "geçtikten sonra kendiliğinden kapanır"); }
      if (onc.indexOf("mevsim") > -1) { add("sabit", 2, "mevsim sonunda kolayca çıkarılıp saklanır"); add("miknatisli", 1); }
      var keys = Object.keys(sc).filter(function (k) { return sc[k] > 0; }).sort(function (x, y) { return sc[y] - sc[x]; }).slice(0, 3);
      outList.innerHTML = "";
      keys.forEach(function (k) {
        var li = D.createElement("li"), h = D.createElement("strong"), p = D.createElement("span");
        h.textContent = M[k].ad; p.textContent = M[k].d + (why[k] ? " Sizin için: " + why[k].join("; ") + "." : "");
        li.appendChild(h); li.appendChild(p); outList.appendChild(li);
      });
      if (onc.indexOf("evcil") > -1) {
        var li2 = D.createElement("li"), h2 = D.createElement("strong"), p2 = D.createElement("span");
        h2.textContent = "File seçimi"; p2.textContent = "Evcil hayvanınız varsa tırmalamaya daha dayanıklı file seçeneklerini sorun.";
        li2.className = "is-note"; li2.appendChild(h2); li2.appendChild(p2); outList.appendChild(li2);
      }
      var en = num(form.elements.en.value, 20, 400), boy = num(form.elements.boy.value, 20, 400), adet = num(form.elements.adet.value, 1, 50);
      var lines = ["Merhaba, web sitenizden yazıyorum. Sineklik için bilgi almak istiyorum.", "", "• Yer: " + YER[yer], "• Açılış: " + ACI[aci]];
      if (onc.length) lines.push("• Önceliğim: " + onc.map(function (x) { return ONC[x]; }).join(", "));
      if (en || boy) lines.push("• Yaklaşık ölçü: " + (en ? trNum(en) : "?") + " × " + (boy ? trNum(boy) : "?") + " cm (en × boy)");
      if (adet) lines.push("• Adet: " + trNum(adet));
      lines.push("• Aklımdaki modeller: " + keys.map(function (k) { return M[k].ad; }).join(", "));
      lines.push("", "Uygun modelleri ve fiyat bilgisini öğrenebilir miyim?");
      setMsg(lines.join("\n"));
    }
    form.addEventListener("input", update); form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    update();
  })();

  /* ---------- Parça haritası (PVC pencere) ---------- */
  (function () {
    var box = $("[data-parts]"); if (!box) return;
    var P = {
      kasa: ["Kasa", "Duvara sabitlenen dış çerçeve. Kasa ile duvar arasındaki köpük ve silikon zamanla açılırsa kenardan hava ya da su gelebilir; birleşim yeri kontrol edilir."],
      kanat: ["Kanat", "Açılıp kapanan bölüm. Zamanla sarkarsa kasaya sürter, zor kapanır ya da kilitlenmez; çoğu zaman menteşe ayarıyla düzelir."],
      kol: ["Kol (ispanyolet)", "Döndürüldüğünde kanadın çevresindeki kilit noktalarını çalıştırır. Zor dönüyor ya da boşta kalıyorsa ayar veya mekanizma kontrolü gerekir; kol değişimi de sık yapılan bir iştir."],
      mentese: ["Menteşe", "Kanadın ağırlığını taşır. Ayar vidalarıyla kanat yukarı-aşağı ve sağa-sola alınabilir; sürtme ve sarkma şikâyetlerinin ilk baktığı yer burasıdır."],
      conta: ["Conta", "Kanat ile kasa arasındaki lastik. Sertleşince, büzülünce ya da koptuğunda rüzgâr, toz ve ses içeri girer; uygun profille değiştirilebilir."],
      isicam: ["Isıcam", "Arasında boşluk bulunan iki ya da daha fazla camdan oluşan ünite. Camların arası buğulanıyorsa ünitenin sızdırmazlığı bozulmuştur; ünite ölçüsüne göre yenilenir."],
      makas: ["Vasistas makası", "Kanadın üstten aralanmasını sağlayan mekanizma. Kanat vasistasta düşüyor ya da kapanırken zorlanıyorsa makas ve ayarı kontrol edilir."]
    };
    var btns = $$(".hot", box), ttl = $("[data-part-title]", box), txt = $("[data-part-text]", box);
    function sel(b) {
      var d = P[b.getAttribute("data-part")];
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      ttl.textContent = d[0]; txt.textContent = d[1];
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { sel(b); }); });
    sel(btns[0]);
  })();

  /* ---------- Cam ve ayna hesap aracı ---------- */
  (function () {
    var box = $("[data-tool='cam-hesap']"); if (!box) return;
    var list = $("[data-pieces]", box), addBtn = $("[data-add]", box), sheet = $("[data-sheet]", box), setMsg = bindMsg($("[data-cam-msg]"));
    var oAdet = $("[data-o-adet]", box), oAlan = $("[data-o-alan]", box), oKenar = $("[data-o-kenar]", box), n = 0;
    function row(en, boy, adet) {
      n++;
      var d = D.createElement("div"); d.className = "piece";
      d.innerHTML = '<label class="field"><span>En (cm)</span><input name="en" inputmode="decimal" autocomplete="off" placeholder="ör. 60"></label>' +
        '<label class="field"><span>Boy (cm)</span><input name="boy" inputmode="decimal" autocomplete="off" placeholder="ör. 90"></label>' +
        '<label class="field"><span>Adet</span><input name="adet" inputmode="numeric" autocomplete="off" value="1"></label>' +
        '<button type="button" class="piece__del" aria-label="Bu parçayı sil"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>';
      if (en) $("[name=en]", d).value = en; if (boy) $("[name=boy]", d).value = boy; if (adet) $("[name=adet]", d).value = adet;
      $(".piece__del", d).addEventListener("click", function () { if ($$(".piece", list).length > 1) { d.remove(); update(); } else { $$("input", d).forEach(function (i) { i.value = i.name === "adet" ? "1" : ""; }); update(); } });
      list.appendChild(d);
    }
    function update() {
      var ps = $$(".piece", list).map(function (d) {
        return { en: num($("[name=en]", d).value, 1, 600), boy: num($("[name=boy]", d).value, 1, 600), adet: num($("[name=adet]", d).value, 1, 999) || 1 };
      }).filter(function (p) { return p.en && p.boy; });
      var adet = 0, alan = 0, kenar = 0;
      ps.forEach(function (p) { adet += p.adet; alan += p.en * p.boy / 10000 * p.adet; kenar += 2 * (p.en + p.boy) / 100 * p.adet; });
      oAdet.textContent = trNum(adet); oAlan.textContent = trNum(alan, 2); oKenar.textContent = trNum(kenar, 2);
      /* çizim: parçalar yan yana, ölçekli */
      var maxH = 0, totW = 0; ps.forEach(function (p) { maxH = Math.max(maxH, p.boy); totW += p.en; });
      var g = [], x = 0, gap = 14;
      if (ps.length) {
        var sc = Math.min(110 / maxH, (520 - gap * (ps.length - 1)) / totW);
        ps.forEach(function (p) {
          var w = p.en * sc, h = p.boy * sc, y = 120 - h;
          g.push('<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="2" fill="rgba(11,122,117,.14)" stroke="#0B7A75" stroke-width="1.6"/>');
          g.push('<path d="M' + f1(x + w * .18) + ' ' + f1(y + h * .7) + 'L' + f1(x + w * .55) + ' ' + f1(y + h * .18) + '" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>');
          if (w > 34) g.push('<text x="' + f1(x + w / 2) + '" y="' + f1(Math.min(116, y + h / 2 + 4)) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#102A2E" font-family="Wix Madefor Text, Segoe UI, sans-serif">' + trNum(p.en) + "×" + trNum(p.boy) + "</text>");
          if (p.adet > 1) g.push('<text x="' + f1(x + w / 2) + '" y="136" text-anchor="middle" font-size="11" fill="#3A5559" font-family="Wix Madefor Text, Segoe UI, sans-serif">' + p.adet + " adet</text>");
          x += w + gap;
        });
      } else {
        g.push('<rect x="0" y="20" width="160" height="100" rx="2" fill="none" stroke="#3A5559" stroke-width="1.4" stroke-dasharray="5 5"/><text x="80" y="76" text-anchor="middle" font-size="12" fill="#3A5559" font-family="Wix Madefor Text, Segoe UI, sans-serif">Ölçü yazın</text>');
        x = 174;
      }
      sheet.innerHTML = '<svg viewBox="-4 0 ' + f1(Math.max(180, x - gap + 8)) + ' 142" role="img" aria-label="Girilen cam parçalarının ölçekli çizimi">' + g.join("") + "</svg>";
      var tur = $("[name=tur]", box).value, kenarIs = $("[name=kenar]", box).value, kul = $("[name=kullanim]", box).value, notu = $("[name=not]", box).value.trim();
      var lines = ["Merhaba, web sitenizden yazıyorum. Cam / ayna kesimi için bilgi almak istiyorum.", "", "• Tür: " + tur, "• Kullanım: " + kul, "• Kenar işlemi: " + kenarIs];
      if (ps.length) {
        lines.push("• Parçalar:");
        ps.forEach(function (p, i) { lines.push("   " + (i + 1) + ") " + trNum(p.en) + " × " + trNum(p.boy) + " cm, " + p.adet + " adet"); });
        lines.push("• Toplam alan: " + trNum(alan, 2) + " m², kenar toplamı: " + trNum(kenar, 2) + " m");
      } else lines.push("• Ölçü: henüz yazmadım");
      if ($("[name=delik]", box).checked) lines.push("• Delik, köşe yuvarlatma ya da özel kesim var");
      if (notu) lines.push("• Not: " + notu);
      lines.push("", "Hangi seçenekler var ve fiyat bilgisini öğrenebilir miyim?");
      setMsg(lines.join("\n"));
    }
    addBtn.addEventListener("click", function () { row(); update(); var ins = $$(".piece", list); $("[name=en]", ins[ins.length - 1]).focus(); });
    box.addEventListener("input", update); box.addEventListener("change", update);
    row("60", "90", "1");
    update();
  })();

  /* ---------- Kırık cam kontrol listesi ---------- */
  $$("[data-checklist]").forEach(function (box) {
    var cbs = $$("input[type=checkbox]", box), bar = $(".progress__bar i", box), txt = $("[data-progress-text]", box);
    function up() { var c = cbs.filter(function (x) { return x.checked; }).length; bar.style.width = (c / cbs.length * 100) + "%"; txt.textContent = c + " / " + cbs.length; }
    cbs.forEach(function (x) { x.addEventListener("change", up); }); up();
  });

  /* ---------- İletişim: hızlı mesaj ---------- */
  (function () {
    var form = $("#hizli-form"); if (!form) return;
    var setMsg = bindMsg($("[data-hizli-msg]"));
    function update() {
      var konu = ($("input[name='konu']:checked", form) || {}).value || "Genel bilgi", ad = form.elements.ad.value.trim(), metin = form.elements.metin.value.trim(), zaman = form.elements.zaman.value;
      var lines = ["Merhaba Kamberoğlu Duşakabin ve Sineklik, web sitenizden yazıyorum.", "", "• Konu: " + konu];
      if (metin) lines.push("• Kısaca: " + metin);
      if (zaman) lines.push("• Bana uygun zaman: " + zaman);
      if (ad) lines.push("", ad);
      setMsg(lines.join("\n"));
    }
    form.addEventListener("input", update); form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    update();
  })();

  /* ---------- Hero: buğulu cam (silinebilir) ---------- */
  (function () {
    var fig = $("[data-fog]"); if (!fig) return;
    var door = $(".glass__door", fig), svg = $(".scene", door), cv = $(".glass__fog", door), sq = $(".squeegee", door), btn = $("[data-squeegee]", fig);
    if (!cv || !cv.getContext || !window.Float32Array) return;
    var ctx = cv.getContext("2d"), GW = 56, GH = 64, fog, mc = D.createElement("canvas"), mx, idata;
    var W = 0, H = 0, cw = 0, ch = 0, dpr = 1, tex = null, img = null, running = false, last = 0, visible = true, drops = [], spawnT = .4, sweep = null, cond = RM ? 1 : 0, started = false;
    var REFOG = 1 / 9;
    function grid() {
      GH = Math.max(20, Math.round(GW * ch / cw));
      fog = new Float32Array(GW * GH); for (var i = 0; i < fog.length; i++) fog[i] = 1;
      mc.width = GW; mc.height = GH; mx = mc.getContext("2d"); idata = mx.createImageData(GW, GH);
    }
    function bead(c, x, y, r, a) {
      var gr = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255," + a + ")"); gr.addColorStop(.55, "rgba(214,236,234," + (a * .7) + ")"); gr.addColorStop(1, "rgba(11,122,117," + (a * .38) + ")");
      c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    }
    function buildTex() {
      tex = D.createElement("canvas"); tex.width = W; tex.height = H;
      var t = tex.getContext("2d"); t.fillStyle = "#E4F0F0"; t.fillRect(0, 0, W, H);
      if (img) {
        var a = D.createElement("canvas"), k = 11; a.width = Math.max(4, Math.round(W / k)); a.height = Math.max(4, Math.round(H / k));
        var ax = a.getContext("2d"); ax.imageSmoothingEnabled = true; ax.drawImage(img, 0, 0, a.width, a.height);
        var b = D.createElement("canvas"); b.width = a.width * 3; b.height = a.height * 3;
        var bx = b.getContext("2d"); bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = "high"; bx.drawImage(a, 0, 0, b.width, b.height);
        t.imageSmoothingEnabled = true; t.imageSmoothingQuality = "high"; t.drawImage(b, 0, 0, W, H);
      }
      var g = t.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(244,251,251,.8)"); g.addColorStop(1, "rgba(229,242,242,.68)");
      t.fillStyle = g; t.fillRect(0, 0, W, H);
      var i, n = Math.round(W * H / 240);
      for (i = 0; i < n; i++) { t.fillStyle = "rgba(255,255,255," + (.12 + Math.random() * .3).toFixed(2) + ")"; var r = (Math.random() * 1.1 + .3) * dpr; t.fillRect(Math.random() * W, Math.random() * H, r, r); }
      var m = Math.round(W * H / (2400 * dpr * dpr));
      for (i = 0; i < m; i++) bead(t, Math.random() * W, Math.random() * H, (Math.random() * 2.3 + .6) * dpr, .85);
    }
    function size() {
      var r = door.getBoundingClientRect(); if (!r.width || !r.height) return;
      var nw = r.width, nh = r.height, aspectChanged = !cw || Math.abs(nw / nh - cw / ch) > .02;
      cw = nw; ch = nh; dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(cw * dpr); H = Math.round(ch * dpr); cv.width = W; cv.height = H;
      if (aspectChanged) { grid(); loadImg(); }
      buildTex(); draw();
    }
    function loadImg() {
      try {
        var c = svg.cloneNode(true); c.setAttribute("xmlns", "http://www.w3.org/2000/svg"); c.setAttribute("width", Math.round(cw)); c.setAttribute("height", Math.round(ch));
        var s = new XMLSerializer().serializeToString(c), im = new Image();
        im.onload = function () { img = im; buildTex(); draw(); };
        im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
      } catch (e) { /* bulanık arka plan olmadan da çalışır */ }
    }
    function draw() {
      if (!tex || !fog) return;
      var d = idata.data, cf = cond * 255;
      for (var i = 0, j = 3; i < fog.length; i++, j += 4) d[j] = fog[i] * cf;
      mx.putImageData(idata, 0, 0);
      ctx.globalCompositeOperation = "copy"; ctx.drawImage(tex, 0, 0);
      ctx.globalCompositeOperation = "destination-in"; ctx.imageSmoothingEnabled = true; ctx.drawImage(mc, 0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      for (var k = 0; k < drops.length; k++) { var p = drops[k]; bead(ctx, p.x * W, p.y * H, p.r * dpr * (p.age < .7 ? .5 + p.age / 1.4 : 1), .95); }
    }
    function wipeAt(nx, ny, R) {
      var cx = nx * GW, cy = ny * GH, r = R || 3.3;
      var x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(GW - 1, Math.ceil(cx + r)), y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(GH - 1, Math.ceil(cy + r));
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        var dx = x + .5 - cx, dy = y + .5 - cy, dd = Math.sqrt(dx * dx + dy * dy) / r;
        if (dd < 1) { var k = dd < .55 ? 0 : (dd - .55) / .45, i = y * GW + x; if (fog[i] > k) fog[i] = k; }
      }
    }
    function clearBand(ya, yb) {
      var r0 = Math.max(0, Math.floor(Math.min(ya, yb) * GH)), r1 = Math.min(GH - 1, Math.ceil(Math.max(ya, yb) * GH)), c0 = Math.round(GW * .05), c1 = Math.round(GW * .95);
      for (var y = r0; y <= r1; y++) for (var x = c0; x <= c1; x++) { var k = (x === c0 || x === c1) ? .5 : 0, i = y * GW + x; if (fog[i] > k) fog[i] = k; }
    }
    var lastP = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
    function stroke(p) {
      if (!fog) return;
      if (lastP) {
        var dx = (p[0] - lastP[0]) * GW, dy = (p[1] - lastP[1]) * GH, steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 1.2));
        for (var i = 1; i <= steps; i++) wipeAt(lastP[0] + (p[0] - lastP[0]) * i / steps, lastP[1] + (p[1] - lastP[1]) * i / steps);
      } else wipeAt(p[0], p[1]);
      lastP = p; fig.classList.add("is-touched");
      if (RM || !running) draw();
    }
    cv.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") stroke(pos(e)); });
    cv.addEventListener("pointerdown", function (e) { if (e.pointerType !== "touch") { lastP = null; stroke(pos(e)); } });
    cv.addEventListener("pointerleave", function () { lastP = null; });
    cv.addEventListener("touchstart", function (e) { lastP = null; stroke(pos(e.touches[0])); }, { passive: true });
    cv.addEventListener("touchmove", function (e) { stroke(pos(e.touches[0])); }, { passive: true });
    cv.addEventListener("touchend", function () { lastP = null; }, { passive: true });
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function startSweep(from, to, dur) {
      if (RM) { clearBand(0, 1); draw(); return; }
      sweep = { t: 0, from: from, to: to, dur: dur, prev: from }; sq.classList.add("is-on"); run();
    }
    if (btn) btn.addEventListener("click", function () { startSweep(-.08, 1.04, 1.5); });
    function tick(t) {
      if (!running) return;
      var dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
      if (cond < 1) cond = Math.min(1, cond + dt / 1.1);
      for (var i = 0; i < fog.length; i++) if (fog[i] < 1) { fog[i] += REFOG * dt; if (fog[i] > 1) fog[i] = 1; }
      spawnT -= dt;
      if (spawnT <= 0 && drops.length < 6 && cond >= 1) { drops.push({ x: .08 + Math.random() * .84, y: .04 + Math.random() * .5, r: 2.2 + Math.random() * 2.2, v: 0, age: 0, w: Math.random() * 6 }); spawnT = .5 + Math.random() * 1.1; }
      for (var k = drops.length - 1; k >= 0; k--) {
        var p = drops[k]; p.age += dt;
        if (p.age > .7) { p.v = Math.min(.42, p.v + dt * .5); p.y += p.v * dt; p.x += Math.sin(p.age * 3 + p.w) * .0009; wipeAt(p.x, p.y, 1.15); }
        if (p.y > 1.03) drops.splice(k, 1);
      }
      if (sweep) {
        sweep.t += dt / sweep.dur;
        var e = sweep.t >= 1 ? 1 : ease(sweep.t), yy = sweep.from + (sweep.to - sweep.from) * e;
        clearBand(Math.max(0, sweep.prev), Math.max(0, yy)); sweep.prev = yy;
        sq.style.transform = "translateY(" + (yy * ch - 58).toFixed(1) + "px)";
        if (sweep.t >= 1) { sweep = null; sq.classList.remove("is-on"); }
      }
      draw();
      requestAnimationFrame(tick);
    }
    function run() { if (RM || running || !visible || D.hidden || !started) return; running = true; last = 0; requestAnimationFrame(tick); }
    function stop() { running = false; }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) run(); else stop(); }).observe(door);
    D.addEventListener("visibilitychange", function () { if (D.hidden) stop(); else run(); });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 160); });
    size();
    if (RM) { started = true; clearBand(0, .46); draw(); }
    else {
      setTimeout(function () { started = true; run(); }, 350);
      setTimeout(function () { startSweep(-.08, .5, 1.1); }, 1250);
    }
  })();
})();
