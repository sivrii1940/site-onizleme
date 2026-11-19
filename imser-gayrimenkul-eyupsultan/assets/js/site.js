/* İmser Gayrimenkul ve İnşaat Danışmanlığı — site betiği (kütüphanesiz, kendi kendine yeter) */
var WA = "https://wa.me/905313007474";
var HOURS = { "0": [["09:00", "19:00"]], "1": [["09:00", "19:00"]], "2": [["09:00", "19:00"]], "3": [["09:00", "19:00"]], "4": [["09:00", "19:00"]], "5": [["09:00", "19:00"]], "6": [["09:00", "19:00"]] };

/* ---- Açık/kapalı durumu (kit/status.js kopyası) ---- */
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

/* ---- Kat planı üretici (tarayıcıda ve derleme sırasında Node'da çalışır) ----
   Plan: üst sıra odalar | hol | alt sıra odalar. Ölçüler çizim birimidir, gerçek ölçü değildir. */
var PLANS = {
  "1+0": { W: 360, H: 320, tH: 170, hH: 46, top: [["STÜDYO", 360, "studyo"]], bot: [["MUTFAK", 130, "mutfak"], ["ANTRE", 110, "antre"], ["BANYO", 120, "banyo"]] },
  "1+1": { W: 420, H: 340, tH: 180, hH: 46, top: [["SALON", 240, "salon"], ["YATAK ODASI", 180, "yatak"]], bot: [["MUTFAK", 140, "mutfak"], ["ANTRE", 120, "antre"], ["BANYO", 160, "banyo"]] },
  "2+1": { W: 480, H: 350, tH: 185, hH: 46, top: [["SALON", 260, "salon"], ["YATAK ODASI", 220, "yatak"]], bot: [["MUTFAK", 130, "mutfak"], ["ANTRE", 110, "antre"], ["BANYO", 100, "banyo"], ["YATAK ODASI", 140, "yatak"]] },
  "3+1": { W: 540, H: 360, tH: 190, hH: 46, top: [["SALON", 250, "salon"], ["YATAK ODASI", 150, "yatak"], ["YATAK ODASI", 140, "yatak"]], bot: [["MUTFAK", 130, "mutfak"], ["ANTRE", 110, "antre"], ["BANYO", 110, "banyo"], ["YATAK ODASI", 190, "yatak"]] },
  "4+1": { W: 560, H: 380, tH: 200, hH: 46, top: [["SALON", 230, "salon"], ["YATAK ODASI", 170, "yatak"], ["YATAK ODASI", 160, "yatak"]], bot: [["MUTFAK", 120, "mutfak"], ["ANTRE", 100, "antre"], ["BANYO", 85, "banyo"], ["WC", 65, "wc"], ["YATAK ODASI", 95, "yatak"], ["YATAK ODASI", 95, "yatak"]] },
  "5+1": { W: 560, H: 390, tH: 200, hH: 46, top: [["SALON", 200, "salon"], ["YATAK ODASI", 120, "yatak"], ["YATAK ODASI", 120, "yatak"], ["YATAK ODASI", 120, "yatak"]], bot: [["MUTFAK", 110, "mutfak"], ["ANTRE", 95, "antre"], ["BANYO", 85, "banyo"], ["WC", 70, "wc"], ["YATAK ODASI", 100, "yatak"], ["YATAK ODASI", 100, "yatak"]] },
  "isyeri": { W: 480, H: 330, tH: 190, hH: 40, top: [["İŞ YERİ", 480, "bos"]], bot: [["DEPO", 170, "bos"], ["ANTRE", 140, "antre"], ["WC", 70, "wc"], ["ÇAY OCAĞI", 100, "cay"]] }
};
var PLAN_INFO = {
  "1+0": { name: "1+0 (stüdyo)", dim: "1+0", read: "oturma ve yatma alanı bir arada" },
  "1+1": { name: "1+1", dim: "1+1", read: "1 yatak odası, 1 salon" },
  "2+1": { name: "2+1", dim: "2+1", read: "2 yatak odası, 1 salon" },
  "3+1": { name: "3+1", dim: "3+1", read: "3 yatak odası, 1 salon" },
  "4+1": { name: "4+1", dim: "4+1", read: "4 yatak odası, 1 salon" },
  "5+1": { name: "5+1 ve üstü", dim: "5+1 VE ÜSTÜ", read: "5 ya da daha fazla yatak odası" },
  "isyeri": { name: "İş yeri", dim: "İŞ YERİ", read: "açık çalışma alanı, depo, ıslak hacim" },
  "arsa": { name: "Parsel", dim: "PARSEL", read: "parsel sınırı, çekme mesafesi, yapı alanı" }
};

function planSVG(key, o) {
  o = o || {};
  if (key === "arsa") return parcelSVG(o);
  var P = PLANS[key] || PLANS["3+1"], W = P.W, H = P.H, tH = P.tH, bY = tH + P.hH, bH = H - bY;
  var mini = !!o.mini, hatch = o.hatch || "hatch", info = PLAN_INFO[key] || PLAN_INFO["3+1"];
  var out = [], n = 0, doors = [], wins = [], fxs = [], lbls = [], dims = [];
  var ox = mini ? 0 : 72 + (560 - W) / 2, oy = mini ? 0 : 72;
  function q(v) { return Math.round(v * 10) / 10; }
  function rd(x, y, w, h) { return "M" + q(x) + " " + q(y) + "h" + q(w) + "v" + q(h) + "h" + q(-w) + "z"; }
  function ln(d, c) { out.push('<path class="ln ' + c + '" pathLength="1" style="--i:' + (n++) + '" d="' + d + '"/>'); }
  function R(x, y, w, h) { return '<rect x="' + q(x) + '" y="' + q(y) + '" width="' + q(w) + '" height="' + q(h) + '"/>'; }
  function Pa(d, c) { return "<path " + (c ? 'class="' + c + '" ' : "") + 'd="' + d + '"/>'; }
  function Ci(x, y, r) { return '<circle cx="' + q(x) + '" cy="' + q(y) + '" r="' + r + '"/>'; }
  function El(x, y, rx, ry) { return '<ellipse cx="' + q(x) + '" cy="' + q(y) + '" rx="' + rx + '" ry="' + ry + '"/>'; }
  function bed(x, y, w, h) { return R(x, y, w, h) + R(x + 5, y + 5, w / 2 - 8, 12) + R(x + w / 2 + 3, y + 5, w / 2 - 8, 12) + Pa("M" + q(x) + " " + q(y + 26) + "h" + q(w)); }
  function bedH(x, y, w, h) { return R(x, y, w, h) + R(x + w - 17, y + 5, 12, h / 2 - 8) + R(x + w - 17, y + h / 2 + 3, 12, h / 2 - 8) + Pa("M" + q(x + w - 26) + " " + q(y) + "v" + q(h)); }
  function door(hx, hy, r, s, ext) {
    doors.push('<g class="door"><rect class="dcut" x="' + q(hx) + '" y="' + q(hy - 2.5) + '" width="' + r + '" height="' + (ext ? 12 : 5) + '"/>' +
      Pa("M" + q(hx) + " " + q(hy) + "V" + q(hy + s * r)) +
      Pa("M" + q(hx) + " " + q(hy + s * r) + "A" + r + " " + r + " 0 0 " + (s < 0 ? 1 : 0) + " " + q(hx + r) + " " + q(hy), "arc") + "</g>");
  }
  function winH(x1, y, w) { wins.push('<g class="win"><rect class="wr" x="' + q(x1) + '" y="' + y + '" width="' + q(w) + '" height="7"/>' + Pa("M" + q(x1) + " " + (y + 3.5) + "h" + q(w)) + "</g>"); }
  function winV(x, y1, h) { wins.push('<g class="win"><rect class="wr" x="' + x + '" y="' + q(y1) + '" width="7" height="' + q(h) + '"/>' + Pa("M" + (x + 3.5) + " " + q(y1) + "v" + q(h)) + "</g>"); }
  function tick(x, y) { return '<path class="tk" d="M' + q(x - 6) + " " + q(y + 6) + "L" + q(x + 6) + " " + q(y - 6) + '"/>'; }

  var tops = [], bots = [], x = 0;
  P.top.forEach(function (r) { tops.push({ l: r[0], w: r[1], t: r[2], x: x, y: 0, h: tH, row: "t" }); x += r[1]; });
  x = 0;
  P.bot.forEach(function (r) { bots.push({ l: r[0], w: r[1], t: r[2], x: x, y: bY, h: bH, row: "b" }); x += r[1]; });

  out.push('<g transform="translate(' + q(ox) + " " + oy + ')">');
  out.push('<rect class="fill" x="0" y="0" width="' + W + '" height="' + H + '"/>');
  out.push('<path class="hatch" fill="url(#' + hatch + ')" fill-rule="evenodd" d="' + rd(-7, -7, W + 14, H + 14) + rd(0, 0, W, H) + '"/>');
  ln(rd(-7, -7, W + 14, H + 14), "w-ext");
  ln(rd(0, 0, W, H), "w-ext");
  ln("M0 " + tH + "H" + W, "w-int");
  tops.forEach(function (r, k) { if (k) ln("M" + r.x + " 0V" + tH, "w-int"); });
  bots.forEach(function (r, k) {
    if (r.t === "antre") out.push('<path class="open" d="M' + r.x + " " + bY + "h" + r.w + '"/>');
    else ln("M" + r.x + " " + bY + "h" + r.w, "w-int");
    if (k) ln("M" + r.x + " " + bY + "V" + H, "w-int");
  });

  var entry = null;
  tops.forEach(function (r) { door(r.x + 14, tH, (r.t === "salon" || r.t === "studyo" || r.t === "bos") ? 36 : 30, -1); });
  bots.forEach(function (r) {
    if (r.t === "antre") { var hx = r.x + (r.w - 36) / 2; door(hx, H, 36, -1, true); entry = hx + 18; }
    else door(r.x + 10, bY, (r.t === "wc" || r.t === "banyo") ? 24 : 28, 1);
  });

  if (!mini) {
    tops.forEach(function (r) { var w = Math.min(r.w * 0.42, 96); winH(r.x + (r.w - w) / 2, -7, w); });
    bots.forEach(function (r) { if (r.t === "antre") return; var w = r.t === "wc" ? 24 : Math.min(r.w * 0.4, 64); winH(r.x + (r.w - w) / 2, H, w); });
    winV(-7, tH * 0.3, Math.min(70, tH * 0.4));
    winV(W, tH * 0.3, Math.min(70, tH * 0.4));

    tops.concat(bots).forEach(function (r) {
      var X = r.x, Y = r.y, w = r.w, h = r.h, cx = X + w / 2, s = "";
      if (r.t === "salon" || r.t === "studyo") {
        var sw = Math.min(124, w * (r.t === "studyo" ? 0.36 : 0.5));
        s += R(X + 16, Y + 16, sw, 26) + R(X + 16, Y + 42, 26, 52) + R(X + 58, Y + 58, Math.min(56, sw - 50), 28);
        if (r.t === "studyo") s += bed(X + w - 16 - 62, Y + 14, 62, 82);
        else s += R(X + w - 20, Y + 34, 10, Math.min(90, h - 80));
      } else if (r.t === "yatak") {
        if (r.row === "t") { var bw = Math.min(62, w - 44); s += bed(cx - bw / 2, Y + 12, bw, 82); }
        else { var bw2 = Math.min(78, w - 24), bh2 = Math.min(52, h - 70); s += bedH(X + w - 10 - bw2, Y + h - 10 - bh2, bw2, bh2); }
      } else if (r.t === "mutfak" || r.t === "cay") {
        s += R(X + 8, Y + h - 30, w - 16, 22) + R(X + 18, Y + h - 27, 26, 16) + Ci(X + 31, Y + h - 19, 3);
        if (r.t === "mutfak" && w > 100) s += Ci(X + w - 40, Y + h - 24, 4) + Ci(X + w - 26, Y + h - 24, 4) + Ci(X + w - 40, Y + h - 13, 4) + Ci(X + w - 26, Y + h - 13, 4);
      } else if (r.t === "banyo") {
        s += R(X + w - 46, Y + h - 46, 38, 38) + Pa("M" + q(X + w - 46) + " " + q(Y + h - 46) + "l38 38m-38 0l38 -38") + R(X + 12, Y + h - 14, 20, 7) + El(X + 22, Y + h - 27, 8, 11);
      } else if (r.t === "wc") {
        s += R(cx - 10, Y + h - 14, 20, 7) + El(cx, Y + h - 27, 8, 11);
      } else if (r.t === "antre") {
        s += R(X + 6, Y + 8, 14, Math.max(30, h - 64));
      }
      if (s) fxs.push('<g class="fx">' + s + "</g>");

      var lines = (r.l.length * 13.6 > w - 18 && r.l.indexOf(" ") > 0) ? r.l.split(" ") : [r.l];
      var cy = r.row === "t" ? (r.t === "yatak" ? 94 + (h - 94) / 2 : h * (r.t === "studyo" ? 0.74 : 0.68)) : Y + h * (r.t === "antre" ? 0.46 : 0.34);
      var y0 = cy - (lines.length - 1) * 11;
      lbls.push('<text class="lbl" x="' + q(cx) + '" y="' + q(y0) + '">' + lines.map(function (t, k) { return '<tspan x="' + q(cx) + '" dy="' + (k ? 22 : 0) + '">' + t + "</tspan>"; }).join("") + "</text>");
    });
    lbls.push('<text class="lbl hol" x="' + q(W * 0.66) + '" y="' + q(tH + P.hH / 2) + '">HOL</text>');
    if (entry !== null) lbls.push('<g class="gir"><path d="M' + q(entry) + " " + (H + 13) + 'l-7 10h14z"/><text x="' + q(entry) + '" y="' + (H + 36) + '">GİRİŞ</text></g>');

    ln("M0 -14V-50", "dim"); ln("M" + W + " -14V-50", "dim"); ln("M-6 -40H" + (W + 6), "dim");
    ln("M-6 -20H" + (W + 6), "dim");
    ln("M-14 0H-50", "dim"); ln("M-14 " + H + "H-50", "dim"); ln("M-40 -6V" + (H + 6), "dim");
    var t = tick(0, -40) + tick(W, -40) + tick(-40, 0) + tick(-40, H) + tick(W, -20);
    tops.forEach(function (r) { t += tick(r.x, -20); });
    dims.push('<g class="dimx">' + t + '<text class="dtx" x="' + W / 2 + '" y="-53">' + (o.dimText || info.dim + " · TEMSİLİ KROKİ") + '</text><text class="dtx" transform="translate(-53 ' + H / 2 + ') rotate(-90)">ÖLÇEKSİZ</text></g>');
  }
  return out.join("") + dims.join("") + doors.join("") + wins.join("") + fxs.join("") + lbls.join("") + "</g>";
}

function parcelSVG(o) {
  var hatch = o.hatch || "hatch", out = [], n = 0;
  function ln(d, c) { out.push('<path class="ln ' + c + '" pathLength="1" style="--i:' + (n++) + '" d="' + d + '"/>'); }
  function tick(x, y) { return '<path class="tk" d="M' + (x - 6) + " " + (y + 6) + "L" + (x + 6) + " " + (y - 6) + '"/>'; }
  out.push('<g transform="translate(72 72)">');
  out.push('<path class="fill" d="M0 24L520 0L548 372L26 390Z"/>');
  ln("M0 24L520 0L548 372L26 390Z", "w-ext");
  out.push('<path class="open" d="M40 60L482 40L506 334L62 350Z"/>');
  out.push('<path class="hatch" fill="url(#' + hatch + ')" d="M128 112H412V292H128Z"/>');
  ln("M128 112H412V292H128Z", "w-int");
  ln("M-14 470H570", "dim"); ln("M-14 432H570", "dim");
  ln("M0 -14V-50", "dim"); ln("M520 -24V-50", "dim"); ln("M-6 -40H526", "dim");
  ln("M-14 24H-50", "dim"); ln("M-14 390H-50", "dim"); ln("M-40 18V396", "dim");
  out.push('<g class="dimx">' + tick(0, -40) + tick(520, -40) + tick(-40, 24) + tick(-40, 390) +
    '<text class="dtx" x="260" y="-53">' + (o.dimText || "PARSEL · TEMSİLİ KROKİ") + '</text><text class="dtx" transform="translate(-53 207) rotate(-90)">ÖLÇEKSİZ</text></g>');
  out.push('<g class="fx"><path d="M128 112L412 292M412 112L128 292"/></g>');
  out.push('<text class="lbl" x="270" y="202">YAPI ALANI</text>');
  out.push('<text class="lbl hol" x="270" y="78">ÇEKME SINIRI</text>');
  out.push('<text class="lbl" x="420" y="372">PARSEL</text>');
  out.push('<text class="lbl hol" x="270" y="452">YOL</text>');
  out.push("</g>");
  return out.join("");
}

function heroMsg(oda, is) {
  var o = PLAN_INFO[oda] ? PLAN_INFO[oda].name : oda;
  var M = {
    al: "satılık bir daire arıyorum; oda sayısı: " + o + ". Uygun seçenekleriniz olursa paylaşır mısınız?",
    kirala: "kiralık bir daire arıyorum; oda sayısı: " + o + ". Uygun seçenekleriniz olursa paylaşır mısınız?",
    sat: "satmak istediğim bir dairem var; oda sayısı: " + o + ". Süreç ve fiyat görüşü için bilgi alabilir miyim?",
    kiraver: "kiraya vermek istediğim bir dairem var; oda sayısı: " + o + ". Süreç hakkında bilgi alabilir miyim?"
  };
  return "Merhaba İmser Gayrimenkul, " + (M[is] || M.al);
}

/* ---- Sayfa davranışları ---- */
if (typeof document !== "undefined") (function () {
  "use strict";
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function wa(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* canlı durum */
  var st = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) { el.textContent = st.text; el.classList.toggle("is-open", st.open); });
  $$("[data-status-wrap]").forEach(function (el) { el.classList.toggle("is-open", st.open); el.classList.add("is-known"); });
  $$("[data-day]").forEach(function (tr) { if (+tr.getAttribute("data-day") === st.dayIndex) { tr.classList.add("today"); var c = tr.querySelector("[data-today]"); if (c) c.textContent = "bugün"; } });

  /* telefon menüsü */
  var dm = $(".m-menu");
  if (dm) {
    document.addEventListener("click", function (e) { if (dm.open && !dm.contains(e.target)) dm.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && dm.open) { dm.open = false; $("summary", dm).focus(); } });
  }

  /* kopyalama */
  function copyText(t, btn) {
    var lab = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", lab);
    function done(ok) { btn.textContent = ok ? "Kopyalandı" : "Kopyalanamadı"; setTimeout(function () { btn.textContent = lab; }, 1800); }
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { done(true); }, fallback); else fallback();
  }
  function bindOut(box, build) {
    var msg = $("[data-msg]", box), a = $("[data-wa]", box), cp = $("[data-copy]", box);
    function upd() { var m = build(); msg.textContent = m; if (a) a.href = wa(m); return m; }
    if (cp) cp.addEventListener("click", function () { copyText(msg.textContent, cp); });
    return upd;
  }

  function planBox(svg) {
    var g = $(".plan-g", svg), hatch = svg.getAttribute("data-hatch") || "hatch";
    return function (key) {
      g.innerHTML = planSVG(key, { hatch: hatch });
      var inf = PLAN_INFO[key];
      svg.setAttribute("aria-label", (inf ? inf.name + ": " + inf.read : key) + " (temsili kroki)");
    };
  }
  function radio(box, name) { var r = $("input[name='" + name + "']:checked", box); return r ? r.value : ""; }
  function checks(box, name) { return $$("input[name='" + name + "']:checked", box).map(function (c) { return c.value; }); }

  /* 1) Ana sayfa: kat planında oda sayısı seçici */
  var hero = $("[data-tool='kat-plani']");
  if (hero) {
    var hdraw = planBox($("svg.plan", hero)), hread = $("[data-plan-read]", hero), hmore = $("[data-more]", hero), shown = "3+1";
    var hupd = bindOut(hero, function () { return heroMsg(radio(hero, "oda") || "3+1", radio(hero, "islem") || "al"); });
    var hsync = function () {
      var oda = radio(hero, "oda") || "3+1", is = radio(hero, "islem") || "al";
      if (oda !== shown) { hdraw(oda); shown = oda; }
      hread.textContent = PLAN_INFO[oda].name + " · " + PLAN_INFO[oda].read;
      hmore.href = "talep.html?oda=" + encodeURIComponent(oda) + "&islem=" + is;
      hupd();
    };
    hero.addEventListener("change", hsync);
    hsync();
  }

  /* 2) Plan lejantı (ana sayfa) */
  var leg = $("[data-legend]");
  if (leg) {
    var lsvg = $("svg.plan", leg), lbtns = $$("button[data-hl]", leg);
    lbtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true";
        lbtns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        if (on) { b.setAttribute("aria-pressed", "true"); leg.setAttribute("data-hl", b.getAttribute("data-hl")); }
        else leg.removeAttribute("data-hl");
      });
    });
    if ("IntersectionObserver" in window && !reduce) {
      var ldraw = planBox(lsvg);
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { ldraw(lsvg.getAttribute("data-plan") || "2+1"); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(lsvg);
    }
  }

  /* 3) Sekmeler */
  $$("[data-tabs]").forEach(function (tb) {
    var bs = $$("[role=tab]", tb), ps = $$("[role=tabpanel]", tb);
    function sel(i, focus) {
      bs.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); b.tabIndex = k === i ? 0 : -1; ps[k].hidden = k !== i; });
      if (focus) bs[i].focus();
    }
    bs.forEach(function (b, i) {
      b.addEventListener("click", function () { sel(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); sel((i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length, true); }
      });
    });
    tb.classList.add("tabs-on"); sel(0);
  });

  /* 4) Talep formu */
  var tf = $("form[data-tool='talep']");
  if (tf) {
    tf.addEventListener("submit", function (e) { e.preventDefault(); });
    var tdraw = planBox($("svg.plan", tf)), tread = $("[data-plan-read]", tf), tshown = "3+1";
    var ISL = { al: "Satın almak", kirala: "Kiralamak", sat: "Satmak", kiraver: "Kiraya vermek", insaat: "İnşaat danışmanlığı" };
    var BUD = { al: "Bütçe (üst sınır): ", kirala: "Aylık kira bütçesi: ", sat: "Fiyat beklentisi: ", kiraver: "Kira beklentisi: " };
    function val(n) { var el = tf.elements[n]; return el ? String(el.value || "").trim() : ""; }
    function group(is) { return is === "insaat" ? "ins" : (is === "sat" || is === "kiraver") ? "own" : "buy"; }
    function roomsOn(is, tur) { return group(is) !== "ins" && (tur === "Daire" || tur === "Müstakil ev" || tur === ""); }
    function planKey(is, tur, oda) { if (group(is) === "ins" || tur === "Arsa") return "arsa"; if (tur === "Dükkân" || tur === "Ofis") return "isyeri"; return oda || "3+1"; }
    var tupd = bindOut(tf, function () {
      var is = radio(tf, "islem") || "al", g = group(is), tur = radio(tf, "tur"), oda = radio(tf, "oda") || "3+1";
      var L = ["Merhaba İmser Gayrimenkul,", "web sitenizdeki talep formundan yazıyorum.", "", "İşlem: " + ISL[is]];
      if (g !== "ins") {
        if (tur) L.push("Mülk türü: " + tur);
        if (roomsOn(is, tur)) L.push("Oda sayısı: " + PLAN_INFO[oda].name);
        if (val("konum")) L.push((g === "own" ? "Konum: " : "Konum tercihi: ") + val("konum"));
        if (val("butce")) L.push(BUD[is] + val("butce"));
        var a = val("m2min"), b = g === "own" ? "" : val("m2max");
        if (a || b) L.push("Alan: " + (a && b ? a + "–" + b + " m²" : a ? (g === "own" ? a + " m²" : "en az " + a + " m²") : "en fazla " + b + " m²"));
        var oz = checks(tf, "oz"); if (oz.length) L.push((g === "own" ? "Evde olanlar: " : "Öncelikler: ") + oz.join(", "));
      } else {
        var kz = checks(tf, "konu"); if (kz.length) L.push("Konular: " + kz.join(", "));
        if (val("konum")) L.push("Taşınmazın yeri: " + val("konum"));
      }
      if (val("zaman")) L.push("Zaman: " + val("zaman"));
      if (val("not")) L.push("Not: " + val("not"));
      if (val("ad")) { L.push(""); L.push("Adım: " + val("ad")); }
      return L.join("\n");
    });
    function tsync() {
      var is = radio(tf, "islem") || "al", g = group(is), tur = radio(tf, "tur"), oda = radio(tf, "oda") || "3+1";
      $$("[data-show]", tf).forEach(function (el) { el.hidden = el.getAttribute("data-show").split(" ").indexOf(g) < 0; });
      $$("[data-rooms]", tf).forEach(function (el) { el.hidden = !roomsOn(is, tur); });
      $$("[data-l-" + g + "]", tf).forEach(function (el) { el.textContent = el.getAttribute("data-l-" + g); });
      $$("[data-l-" + is + "]", tf).forEach(function (el) { el.textContent = el.getAttribute("data-l-" + is); });
      var k = planKey(is, tur, oda);
      if (k !== tshown) { tdraw(k); tshown = k; }
      tread.textContent = PLAN_INFO[k].name + " · " + PLAN_INFO[k].read;
      tupd();
    }
    tf.addEventListener("change", tsync);
    tf.addEventListener("input", tupd);
    var qs = new URLSearchParams(location.search);
    ["oda", "islem", "tur"].forEach(function (n) {
      var v = qs.get(n); if (!v) return;
      var r = $("input[name='" + n + "'][value='" + v.replace(/'/g, "") + "']", tf); if (r) r.checked = true;
    });
    if (qs.get("konu")) { var kc = $("input[name='konu'][value='" + qs.get("konu").replace(/'/g, "") + "']", tf); if (kc) kc.checked = true; }
    $$("[data-pick]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var r = $("input[name='oda'][value='" + a.getAttribute("data-pick") + "']", tf); if (!r) return;
        e.preventDefault(); r.checked = true;
        var cur = radio(tf, "islem"); if (cur === "insaat") $("input[name='islem'][value='al']", tf).checked = true;
        var tr = radio(tf, "tur"); if (tr && tr !== "Daire" && tr !== "Müstakil ev") $("input[name='tur'][value='Daire']", tf).checked = true;
        tsync();
        var tgt = $("#talep-formu"); if (tgt) tgt.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });
    tsync();
  }

  /* 5) Ev gezme kontrol listesi */
  var ck = $("[data-tool='ev-gezme']");
  if (ck) {
    var boxes = $$("input[type=checkbox]", ck), bar = $("[data-bar]", ck), cnt = $("[data-count]", ck);
    var cupd = bindOut(ck, function () {
      var open = boxes.filter(function (b) { return !b.checked; });
      if (open.length === boxes.length) return "Merhaba İmser Gayrimenkul, baktığım bir ev için birkaç sorum var. (Listede netleşen başlıkları işaretleyin; işaretlemedikleriniz buraya soru olarak eklenir.)";
      if (!open.length) return "Merhaba İmser Gayrimenkul, baktığım evle ilgili kontrol listemi tamamladım; bir sonraki adım için görüşmek istiyorum.";
      return "Merhaba İmser Gayrimenkul, baktığım bir ev için şu başlıkları henüz netleştiremedim:\n" + open.map(function (b) { return "– " + b.getAttribute("data-q"); }).join("\n") + "\nBu konularda bilgi alabilir miyim?";
    });
    var csync = function () {
      var d = boxes.filter(function (b) { return b.checked; }).length;
      cnt.textContent = d + " / " + boxes.length;
      bar.style.setProperty("--p", (d / boxes.length).toFixed(3));
      cupd();
    };
    ck.addEventListener("change", csync);
    var rs = $("[data-reset]", ck);
    if (rs) rs.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); csync(); });
    csync();
  }

  /* 6) Kat karşılığı soru listesi */
  var kk = $("[data-tool='kat-karsiligi']");
  if (kk) {
    var kupd = bindOut(kk, function () {
      var L = ["Merhaba İmser Gayrimenkul, kat karşılığı / kentsel dönüşüm konusunda görüşmek istiyorum."];
      var sel = $("select[name='durum']", kk); if (sel && sel.value) L.push("Durumum: " + sel.value);
      var mh = $("input[name='mahalle']", kk); if (mh && mh.value.trim()) L.push("Taşınmazın yeri: " + mh.value.trim());
      var bs = checks(kk, "bas");
      if (bs.length) { L.push("Konuşmak istediğim başlıklar:"); bs.forEach(function (b) { L.push("– " + b); }); }
      else L.push("Hangi başlıklardan başlamamız gerektiğini konuşmak isterim.");
      return L.join("\n");
    });
    kk.addEventListener("change", kupd); kk.addEventListener("input", kupd);
    kupd();
  }

  /* 7) Emsal hesaplayıcı */
  var em = $("[data-tool='emsal']");
  if (em) {
    var fA = $("input[name='alan']", em), fT = $("input[name='taks']", em), fK = $("input[name='kaks']", em);
    var foot = $("[data-foot]", em), floors = $("[data-floors]", em);
    var fmt = function (v, d) { return v.toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
    var put = function (k, t) { $$("[data-o='" + k + "']", em).forEach(function (e) { e.textContent = t; }); };
    var esync = function () {
      var a = parseFloat(String(fA.value).replace(",", ".")); if (!(a > 0)) a = 0; a = Math.min(a, 1000000);
      var t = parseFloat(fT.value), k = parseFloat(fK.value), kat = k / t;
      put("taks", fmt(t, 2)); put("kaks", fmt(k, 2));
      put("taban", a ? "≈ " + fmt(a * t) + " m²" : "—");
      put("emsal", a ? "≈ " + fmt(a * k) + " m²" : "—");
      put("kat", "≈ " + fmt(kat, 1));
      put("not", kat < 1 ? "KAKS, TAKS'tan küçük: yapı alanı tabanın tamamını tek katta bile dolduramaz." : "Emsal alanı, taban alanı ölçüsünde yaklaşık " + fmt(kat, 1) + " kata yayılabilir.");
      var s = Math.sqrt(t), fw = 280 * s, fh = 200 * s;
      foot.setAttribute("x", (40 + (280 - fw) / 2).toFixed(1)); foot.setAttribute("y", (60 + (200 - fh) / 2).toFixed(1));
      foot.setAttribute("width", fw.toFixed(1)); foot.setAttribute("height", fh.toFixed(1));
      var ew = 220 * s, full = Math.floor(kat + 1e-9), frac = kat - full, maxF = 10, h = 18, g = "", base = 262, x0 = 480 - ew / 2;
      var shownF = Math.min(full, maxF);
      for (var i = 0; i < shownF; i++) g += '<rect class="fl" x="' + x0.toFixed(1) + '" y="' + (base - (i + 1) * h) + '" width="' + ew.toFixed(1) + '" height="' + h + '"/>';
      if (full < maxF && frac > 0.05) g += '<rect class="fl part" x="' + x0.toFixed(1) + '" y="' + (base - (shownF + 1) * h) + '" width="' + (ew * frac).toFixed(1) + '" height="' + h + '"/>';
      if (full > maxF) g += '<text class="ftx" x="480" y="' + (base - maxF * h - 12) + '">+' + (full - maxF) + " kat daha</text>";
      floors.innerHTML = g;
    };
    em.addEventListener("input", esync);
    esync();
  }

  /* 8) Harita görünümü */
  var mt = $("[data-map-toggle]");
  if (mt) mt.addEventListener("click", function () {
    var f = $(".map-frame"), plain = f.classList.toggle("plain");
    mt.setAttribute("aria-pressed", plain ? "true" : "false");
    mt.textContent = plain ? "Ozalit görünüme dön" : "Normal renkli harita";
  });
})();
