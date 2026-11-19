/* Stüdyo Dijifoto — site.js: canlı durum, menü, deklanşör geçişi, kırmızı kalem, vizör ve araçlar. */

/* ——— kit/status.js: açık/kapalı durumu (aynen kopya) ——— */
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

(function () {
  "use strict";
  var HOURS = { "0": [["09:00", "21:00"]], "1": [["09:00", "21:00"]], "2": [["09:00", "21:00"]], "3": [["09:00", "21:00"]], "4": [["09:00", "21:00"]], "5": [["12:00", "20:00"]], "6": [["12:00", "19:00"]] };
  var WA = "https://wa.me/905337067674";
  var DAY = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var MONTH = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var BOT = !!navigator.webdriver; /* otomatik ekran görüntülerinde kalem izleri baştan çizili gelsin */
  var PEN = '<svg class="pen draw" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path d="M24 28C56 6 152 2 185 27C206 45 195 79 150 90C103 101 40 97 16 76C-2 58 11 31 47 17C71 8 112 6 142 11"/></svg>';
  var OK = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M3 12.5l6 6.5L21.5 3"/></svg>';
  var NO = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M4 4l16 14M20 4L4 18"/></svg>';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(s) { var a = s.split(":"); return (+a[0]) * 60 + (+a[1]); }
  function hhmm(m) { m = Math.round(m); return pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60); }
  function todayISO() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  }
  function dayIdx(iso) { var p = iso.split("-"); return (new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay() + 6) % 7; }
  function fmtDate(iso) { var p = iso.split("-"); return (+p[2]) + " " + MONTH[+p[1] - 1] + " " + p[0] + " " + DAY[dayIdx(iso)]; }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }

  /* ——— Kırmızı kalem: görününce çiz ——— */
  var io = (!RM && !BOT && "IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-on"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function drawIn(root) { $$(".draw:not(.is-on)", root).forEach(function (p) { if (io) io.observe(p); else p.classList.add("is-on"); }); }
  function redraw(svg) {
    if (!svg) return;
    if (RM || BOT) { svg.classList.add("is-on"); return; }
    svg.classList.remove("is-on"); void svg.getBoundingClientRect();
    requestAnimationFrame(function () { requestAnimationFrame(function () { svg.classList.add("is-on"); }); });
  }

  /* ——— Canlı durum ——— */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var w = el.closest("[data-status-wrap], .st, .vf__st");
      if (w) w.classList.toggle("is-open", s.open);
    });
    $$("[data-hours] tr[data-day]").forEach(function (tr) {
      var on = +tr.getAttribute("data-day") === s.dayIndex;
      tr.classList.toggle("is-today", on);
      var sp = $("th span", tr);
      if (on && sp && !$(".pen", sp)) { sp.insertAdjacentHTML("beforeend", PEN); drawIn(sp); }
    });
    $$(".days .fr[data-day]").forEach(function (fr) { fr.classList.toggle("is-today", +fr.getAttribute("data-day") === s.dayIndex); });
    if (!paintStatus.done) {
      paintStatus.done = true;
      var td = $(".days .fr.is-today");
      if (td) { var tr = td.parentNode, d = td.getBoundingClientRect().left - tr.getBoundingClientRect().left - parseFloat(getComputedStyle(tr).paddingLeft); if (d > 0) tr.scrollLeft += d; }
    }
  }
  paintStatus();
  setInterval(paintStatus, 60000);
  drawIn(document);

  /* ——— Menü ——— */
  var mb = $(".menu-btn"), nav = $("#nav");
  if (mb && nav) {
    var setNav = function (open) {
      nav.classList.toggle("is-open", open);
      mb.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("no-scroll", open);
      if (open) { var c = $(".nav__close", nav); if (c) c.focus(); $$(".pen", nav).forEach(redraw); } else mb.focus();
    };
    mb.addEventListener("click", function () { setNav(true); });
    var cl = $(".nav__close", nav); if (cl) cl.addEventListener("click", function () { setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) setNav(false); });
  }

  /* ——— Deklanşör geçişi (sayfalar arası) ——— */
  var iris = $(".iris:not(.iris--local)");
  document.addEventListener("click", function (e) {
    if (RM || !iris || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self")) return;
    var href = a.getAttribute("href");
    if (!/^[a-z0-9-]+\.html([?#].*)?$/i.test(href)) return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    try { sessionStorage.setItem("df-shutter", "1"); } catch (er) { /* yok */ }
    iris.classList.add("is-closing");
    setTimeout(function () { location.href = url.href; }, 270);
  });
  window.addEventListener("pageshow", function () { if (iris) iris.classList.remove("is-closing"); });
  setTimeout(function () { document.documentElement.classList.remove("shutter-in"); }, 650);

  /* ——— Film şeridi düğmeleri ——— */
  $$("[data-ctl]").forEach(function (c) {
    var strip = document.getElementById(c.getAttribute("data-ctl")); if (!strip) return;
    var tr = $(".strip__track", strip), bs = $$("button", c), sw = c.parentNode ? $(".swipe", c.parentNode) : null;
    function upd() {
      var max = tr.scrollWidth - tr.clientWidth - 2;
      c.style.visibility = max > 0 ? "" : "hidden";
      if (sw) sw.style.visibility = max > 0 ? "" : "hidden";
      bs[0].disabled = tr.scrollLeft <= 2; bs[1].disabled = tr.scrollLeft >= max;
    }
    bs.forEach(function (b) {
      b.addEventListener("click", function () {
        var fr = $(".fr", tr), step = fr ? fr.getBoundingClientRect().width + 14 : 300;
        tr.scrollBy({ left: step * (+b.getAttribute("data-dir")), behavior: RM ? "auto" : "smooth" });
      });
    });
    tr.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  });

  /* ——— Vizör: diyafram + flaş + odak kilidi ——— */
  function VF(el) {
    var ir = $(".iris--local", el);
    function flash() { el.classList.remove("is-shot"); void el.offsetWidth; el.classList.add("is-shot"); }
    function lock() {
      el.classList.remove("is-lock"); el.classList.add("is-hunt");
      setTimeout(function () { el.classList.remove("is-hunt"); }, 80);
      setTimeout(function () { el.classList.add("is-lock"); }, 600);
    }
    setTimeout(function () { el.classList.remove("is-hunt"); }, 350);
    setTimeout(function () { el.classList.add("is-lock"); }, 950);
    return {
      shoot: function (mid) {
        if (RM || !ir) { if (mid) mid(); flash(); lock(); return; }
        ir.classList.remove("is-opening"); void ir.offsetWidth; ir.classList.add("is-closing");
        setTimeout(function () {
          if (mid) mid();
          ir.classList.remove("is-closing"); ir.classList.add("is-opening"); flash(); lock();
          setTimeout(function () { ir.classList.remove("is-opening"); }, 430);
        }, 280);
      }
    };
  }

  /* ——— Ana sayfa vizörü ——— */
  var hero = $("[data-tool=vizor]");
  if (hero) {
    var hv = $("[data-vf]", hero), V = VF(hv), hud = $("[data-hud]", hv), cnt = $("[data-count]", hv), cta = $("[data-cta]");
    var LBL = { vesikalik: "Vesikalık için gün sor", dugun: "Düğün için tarih sor", dis: "Dış çekim için gün sor", urun: "Ürün çekimi için yazın" };
    var shots = 36;
    var tick = function () { shots = shots <= 1 ? 36 : shots - 1; cnt.textContent = shots; };
    $$(".mode", hero).forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.getAttribute("data-mode");
        if (b.getAttribute("aria-pressed") !== "true") {
          $$(".mode", hero).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          redraw($(".pen", b));
          if (cta) { cta.setAttribute("href", "randevu.html?tur=" + m); cta.textContent = LBL[m]; }
        }
        V.shoot(function () { hv.setAttribute("data-mode", m); hud.textContent = b.getAttribute("data-hud"); });
        tick();
      });
    });
    var sh = $("[data-shoot]", hero);
    if (sh) sh.addEventListener("click", function () { V.shoot(); tick(); });
    hv.addEventListener("click", function () { V.shoot(); tick(); });
  }

  /* ——— Kopyalama ——— */
  function copyText(text, fb) {
    function done(ok) { if (fb) { fb.textContent = ok ? "Kopyalandı." : "Kopyalanamadı; metni elle seçip kopyalayın."; setTimeout(function () { fb.textContent = ""; }, 2600); } }
    function legacy() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.left = "0"; ta.style.top = "0";
      document.body.appendChild(ta); ta.select(); var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    else legacy();
  }
  $$("[data-tool]").forEach(function (t) {
    var b = $("[data-copy]", t), m = $("[data-msg]", t);
    if (b && m) b.addEventListener("click", function () { copyText(m.textContent, $("[data-copied]", t)); });
  });
  $$("[data-copy-text]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), $("[data-copied-global]")); });
  });

  /* ——— Güneş konumu (İstanbul, stüdyo koordinatı) ——— */
  var LAT = 41.0355744, LNG = 28.908099, RAD = Math.PI / 180;
  function sunElev(ms) {
    var d = ms / 86400000 - 10957.5;
    var g = (357.529 + 0.98560028 * d) * RAD;
    var q = 280.459 + 0.98564736 * d;
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
    var ep = (23.439 - 0.00000036 * d) * RAD;
    var ra = Math.atan2(Math.cos(ep) * Math.sin(L), Math.cos(L));
    var dec = Math.asin(Math.sin(ep) * Math.sin(L));
    var gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    var ha = (gmst * 15 + LNG) * RAD - ra, la = LAT * RAD;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha)) / RAD;
  }
  function sunDay(iso) {
    var p = iso.split("-"), base = Date.UTC(+p[0], +p[1] - 1, +p[2]) - 3 * 3600000; /* İstanbul UTC+3 */
    var prev = sunElev(base), x = {}, curve = [[0, prev]], TH = [-6, -4, -0.833, 6];
    for (var m = 1; m <= 1440; m++) {
      var h = sunElev(base + m * 60000);
      for (var i = 0; i < TH.length; i++) {
        var th = TH[i];
        if ((prev - th) * (h - th) < 0) { var k = (h > prev ? "u" : "d") + th; if (!(k in x)) x[k] = m - 1 + (th - prev) / (h - prev); }
      }
      if (m % 10 === 0) curve.push([m, h]);
      prev = h;
    }
    x.curve = curve;
    return x;
  }
  function rangeTxt(a, b) { return (a == null || b == null) ? "–" : hhmm(a) + "–" + hhmm(b); }
  function goldenEve(iso) { var s = sunDay(iso); return rangeTxt(s.d6, s["d-4"]); }

  /* ——— Altın saat aracı ——— */
  var gs = $("[data-tool=altin-saat]");
  if (gs) {
    var gIn = $("[data-date]", gs), gSvg = $("[data-sun]", gs), gMsg = $("[data-msg]", gs), gWa = $("[data-wa]", gs);
    gIn.value = todayISO();
    var drawSun = function () {
      if (!gIn.value) return;
      var s = sunDay(gIn.value), c = s.curve, out = [];
      var noon = c.reduce(function (a, b) { return b[1] > a[1] ? b : a; });
      var top = Math.max(30, Math.ceil(noon[1] / 10) * 10 + 8), bot = -14;
      var X = function (m) { return 28 + m / 1440 * 322; }, Y = function (e) { return 172 - (Math.max(bot, e) - bot) / (top - bot) * 150; };
      out.push('<rect x="28" y="' + Y(6).toFixed(1) + '" width="322" height="' + (Y(-4) - Y(6)).toFixed(1) + '" fill="#F2B544" fill-opacity=".16"/>');
      out.push('<path d="M28 ' + Y(0).toFixed(1) + 'H350" stroke="#F4F1EA" stroke-opacity=".55" stroke-dasharray="3 4"/>');
      for (var hr = 0; hr <= 24; hr += 6) {
        out.push('<path d="M' + X(hr * 60).toFixed(1) + ' 172v5" stroke="#F4F1EA" stroke-opacity=".5"/><text x="' + X(hr * 60).toFixed(1) + '" y="192" text-anchor="middle">' + pad(hr % 24) + ':00</text>');
      }
      out.push('<text x="32" y="' + (Y(6) - 5).toFixed(1) + '" fill="#F2B544">altın saat bandı</text>');
      var pts = c.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ");
      out.push('<polyline points="' + pts + '" fill="none" stroke="#F4F1EA" stroke-width="1.8"/>');
      [[s["u-4"], s.u6], [s.d6, s["d-4"]]].forEach(function (r) {
        if (r[0] == null || r[1] == null) return;
        var seg = c.filter(function (p) { return p[0] >= r[0] - 10 && p[0] <= r[1] + 10; }).map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); });
        if (seg.length > 1) out.push('<polyline points="' + seg.join(" ") + '" fill="none" stroke="#F2B544" stroke-width="4.5" stroke-linecap="round"/>');
      });
      [s["u-0.833"], s["d-0.833"]].forEach(function (t) { if (t != null) out.push('<circle cx="' + X(t).toFixed(1) + '" cy="' + Y(-0.833).toFixed(1) + '" r="4.5" fill="#E63946"/>'); });
      out.push('<text x="' + X(noon[0]).toFixed(1) + '" y="' + (Y(noon[1]) - 8).toFixed(1) + '" text-anchor="middle">öğle, ' + Math.round(noon[1]) + '°</text>');
      gSvg.innerHTML = out.join("");
      var set = function (k, v) { var el = $('[data-k="' + k + '"]', gs); if (el) el.textContent = v; };
      set("rise", s["u-0.833"] != null ? hhmm(s["u-0.833"]) : "–");
      set("set", s["d-0.833"] != null ? hhmm(s["d-0.833"]) : "–");
      set("gm", rangeTxt(s["u-4"], s.u6));
      set("ge", rangeTxt(s.d6, s["d-4"]));
      set("blue", rangeTxt(s["d-4"], s["d-6"]));
      var msg = "Merhaba Stüdyo Dijifoto, " + fmtDate(gIn.value) + " tarihi için düğün / dış çekim uygunluğunu sormak istiyorum.\n" +
        "Sitedeki hesaba göre o gün akşam altın saati yaklaşık " + rangeTxt(s.d6, s["d-4"]) + ", gün batımı " + (s["d-0.833"] != null ? hhmm(s["d-0.833"]) : "–") + ".\n" +
        "Bu tarih için bilgi verebilir misiniz?";
      gMsg.textContent = msg; gWa.setAttribute("href", waLink(msg));
    };
    gIn.addEventListener("input", drawSun); gIn.addEventListener("change", drawSun);
    drawSun();
  }

  /* ——— Düğün kontrol listesi ——— */
  var lst = $("[data-tool=liste]");
  if (lst) {
    var KEY = "df-dugun-liste", boxes = $$("input[type=checkbox]", lst), prog = $("[data-progress]", lst), lc = $("[data-count]", lst);
    prog.innerHTML = boxes.map(function () { return "<i></i>"; }).join("");
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    boxes.forEach(function (b) { b.checked = !!saved[b.getAttribute("data-i")]; });
    var updL = function () {
      var n = 0, st = {};
      boxes.forEach(function (b) { if (b.checked) { n++; st[b.getAttribute("data-i")] = 1; } });
      $$("i", prog).forEach(function (x, i) { x.classList.toggle("on", i < n); });
      lc.textContent = n + " / " + boxes.length + " işaretli" + (n === boxes.length ? ": hazırsınız" : "");
      try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* depolama kapalı */ }
    };
    lst.addEventListener("change", updL);
    $("[data-reset]", lst).addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); updL(); });
    updL();
  }

  /* ——— Kırmızı kalem seçici ——— */
  var kk = $("[data-tool=kalem]");
  if (kk) {
    var kon = $(".kontakt", kk), frs = $$(".fr[data-tags]", kk), kout = $(".picker__out", kk);
    $$("[data-need]", kk).forEach(function (b) {
      b.addEventListener("click", function () {
        var need = b.getAttribute("data-need"), picks = [];
        $$("[data-need]", kk).forEach(function (x) { x.setAttribute("aria-pressed", (x === b && need) ? "true" : "false"); });
        kon.classList.toggle("is-filtered", !!need);
        frs.forEach(function (fr) {
          var on = !!need && fr.getAttribute("data-tags").split(" ").indexOf(need) > -1;
          fr.classList.toggle("is-pick", on);
          if (on) { picks.push(fr.getAttribute("data-name")); redraw($(".pen.draw", fr)); }
        });
        kout.textContent = need ? "Kırmızı kalem " + picks.length + " kareyi işaretledi: " + picks.join(", ") + "." : "Bütün kareler açık. Bir ihtiyaç seçin; kalem uygun kareleri işaretlesin.";
        $$(".strip__track", kon).forEach(function (tr) {
          var f = $(".fr.is-pick", tr); if (!f) return;
          var d = f.getBoundingClientRect().left - tr.getBoundingClientRect().left - parseFloat(getComputedStyle(tr).paddingLeft);
          if (Math.abs(d) > 4) tr.scrollTo({ left: Math.max(0, tr.scrollLeft + d), behavior: RM ? "auto" : "smooth" });
        });
      });
    });
  }

  /* ——— Baskı netlik hesaplayıcı ——— */
  var bk = $("[data-tool=baski]");
  if (bk) {
    var wI = $("[data-w]", bk), hI = $("[data-h]", bk), pl = $("[data-prints]", bk), mp = $("[data-mp]", bk);
    var SIZES = [[9, 13], [10, 15], [13, 18], [15, 21], [20, 25], [20, 30], [30, 40], [30, 45], [50, 70]];
    var RAT = [[1, 1], [5, 4], [4, 3], [7, 5], [3, 2], [16, 9], [2, 1]];
    var calc = function () {
      var w = +wI.value, h = +hI.value;
      if (!(w >= 100 && h >= 100)) { pl.innerHTML = ""; mp.textContent = "Geçerli bir piksel ölçüsü girin (en az 100)."; return; }
      var L = Math.max(w, h), S = Math.min(w, h), r = L / S;
      var best = RAT.reduce(function (a, b) { return Math.abs(b[0] / b[1] - r) < Math.abs(a[0] / a[1] - r) ? b : a; });
      var rn = Math.abs(best[0] / best[1] - r) < 0.03 ? best[0] + ":" + best[1] : r.toFixed(2).replace(".", ",") + ":1";
      var crop = [];
      pl.innerHTML = SIZES.map(function (s) {
        var dpi = Math.min(L / (s[1] / 2.54), S / (s[0] / 2.54));
        var cls = dpi >= 300 ? "ok3" : dpi >= 200 ? "ok2" : dpi >= 150 ? "ok1" : "ok0";
        var word = { ok3: "çok net", ok2: "net", ok1: "uzaktan iyi", ok0: "önerilmez" }[cls];
        if (Math.abs(r - s[1] / s[0]) / (s[1] / s[0]) > 0.03) crop.push(s[0] + "×" + s[1]);
        return '<li class="' + cls + '"><span class="sz">' + s[0] + "×" + s[1] + ' cm</span><span class="bar"><i style="width:' + Math.min(100, dpi / 300 * 100).toFixed(0) + '%"></i></span><span class="v">' + word + " · " + Math.round(dpi) + " dpi</span></li>";
      }).join("");
      mp.textContent = (w * h / 1e6).toFixed(1).replace(".", ",") + " megapiksel · oran " + rn + (crop.length ? " · " + crop.join(", ") + " cm kâğıtta kenarlardan kırpılır" : "");
    };
    $$("[data-px]", bk).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-px").split("x"); wI.value = p[0]; hI.value = p[1];
        $$("[data-px]", bk).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        calc();
      });
    });
    wI.addEventListener("input", function () { $$("[data-px]", bk).forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); calc(); });
    hI.addEventListener("input", function () { $$("[data-px]", bk).forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); calc(); });
    calc();
  }

  /* ——— Vesikalık: baş oranı ——— */
  var ol = $("[data-tool=olcu]");
  if (ol) {
    var rg = $("[data-range]", ol), face = $("[data-face]", ol), hair = $("[data-hair]", ol), shd = $("[data-sh]", ol);
    var l1 = $("[data-l1]", ol), l2 = $("[data-l2]", ol), band = $("[data-band]", ol), rd = $("[data-read]", ol), vd = $("[data-verdict]", ol);
    var head = $("[data-head]", ol), fx = $("[data-fx]", ol);
    var bsvg = $("[data-bio]", ol);
    bsvg.insertAdjacentHTML("afterbegin", '<defs><clipPath id="bioclip"><rect x="40" y="30" width="250" height="300"/></clipPath></defs>');
    head.setAttribute("clip-path", "url(#bioclip)");
    var paintBio = function () {
      var H = +rg.value, top = 30 + (60 - H) * 0.42 * 5, chin = top + H * 5, cx = 165, ry = H * 5 / 2, cy = top + ry, rx = ry * 0.68;
      face.setAttribute("cx", cx); face.setAttribute("cy", cy.toFixed(1)); face.setAttribute("rx", rx.toFixed(1)); face.setAttribute("ry", ry.toFixed(1));
      hair.setAttribute("d", "M" + (cx - rx * 1.02).toFixed(1) + " " + (cy - ry * 0.05).toFixed(1) + "C" + (cx - rx * 1.08).toFixed(1) + " " + (top - ry * 0.12).toFixed(1) + " " + (cx + rx * 1.08).toFixed(1) + " " + (top - ry * 0.12).toFixed(1) + " " + (cx + rx * 1.02).toFixed(1) + " " + (cy - ry * 0.05).toFixed(1));
      var sY = chin + 26;
      shd.setAttribute("d", "M" + (cx - rx * 0.36).toFixed(1) + " " + (chin - 6).toFixed(1) + "V" + (sY - 6).toFixed(1) + "M" + (cx + rx * 0.36).toFixed(1) + " " + (chin - 6).toFixed(1) + "V" + (sY - 6).toFixed(1) +
        "M" + (cx - 170) + " 350C" + (cx - 120) + " " + sY.toFixed(1) + " " + (cx - 60) + " " + (sY - 8).toFixed(1) + " " + cx + " " + (sY - 8).toFixed(1) + "S" + (cx + 120) + " " + sY.toFixed(1) + " " + (cx + 170) + " 350");
      var ey = cy - ry * 0.02, ew = rx * 0.36;
      fx.setAttribute("d", "M" + (cx - ew - 8).toFixed(1) + " " + ey.toFixed(1) + "h12M" + (cx + ew - 4).toFixed(1) + " " + ey.toFixed(1) + "h12M" + cx + " " + (ey + ry * 0.12).toFixed(1) + "v" + (ry * 0.2).toFixed(1) + "h-5M" + (cx - rx * 0.28).toFixed(1) + " " + (cy + ry * 0.5).toFixed(1) + "h" + (rx * 0.56).toFixed(1));
      l1.setAttribute("d", "M30 " + top.toFixed(1) + "H300"); l2.setAttribute("d", "M30 " + chin.toFixed(1) + "H300");
      band.setAttribute("y", (top + 42 * 5).toFixed(1)); band.setAttribute("height", "30");
      var pct = Math.round(H / 60 * 100);
      rd.textContent = H + " mm · fotoğraf yüksekliğinin yüzde " + pct + "'i";
      var ok = H >= 42 && H <= 48;
      vd.innerHTML = (ok ? OK : NO) + "<span>" + (ok ? "Genel kurala uygun aralıkta: çene kırmızı bandın içinde." : H < 42 ? "Baş küçük kalıyor; yüz ayrıntısı yetersiz kalabilir." : "Baş çok büyük; tepe ya da çene kadraja sığmayabilir.") + "</span>";
    };
    rg.addEventListener("input", paintBio);
    paintBio();
  }

  /* ——— Vesikalık: belge ölçüleri ——— */
  var bl = $("[data-tool=belge]");
  if (bl) {
    var DOCS = {
      tr: { w: 50, h: 60, size: "50×60 mm", type: "Biyometrik", note: "Türkiye'de pasaport, kimlik kartı ve sürücü belgesi için yaygın ölçü." },
      klasik: { w: 45, h: 60, size: "45×60 mm (4,5×6 cm)", type: "Çoğunlukla biyometrik değil", note: "Okul, kurs ve iş başvurularında yaygın. Kurum biyometrik isterse 50×60 mm gerekir." },
      schengen: { w: 35, h: 45, size: "35×45 mm", type: "Biyometrik", note: "Schengen vize başvurularında yaygın ölçü. Ülke ve aracı kurum ek şart koyabilir." },
      abd: { w: 51, h: 51, size: "51×51 mm (2×2 inç)", type: "Biyometrik, kare", note: "ABD vize başvurularında kare fotoğraf istenir; gözlük takılmaz." },
      kanada: { w: 50, h: 70, size: "50×70 mm", type: "Biyometrik", note: "Basılı fotoğraf istendiğinde yaygın ölçü. Çevrimiçi başvurularda dijital fotoğraf kuralları ayrıca açıklanır." },
      cin: { w: 33, h: 48, size: "33×48 mm", type: "Biyometrik", note: "Çin vize başvurularında yaygın ölçü." }
    };
    var sc = $("[data-scale]", bl), K = 2.2, base = 168;
    var paintDoc = function (key) {
      var d = DOCS[key], out = [];
      var rect = function (w, h, attrs) { return '<rect x="' + (110 - w * K / 2).toFixed(1) + '" y="' + (base - h * K).toFixed(1) + '" width="' + (w * K).toFixed(1) + '" height="' + (h * K).toFixed(1) + '" ' + attrs + "/>"; };
      out.push(rect(d.w, d.h, 'fill="#ECE7DC" stroke="#E63946" stroke-width="2"'));
      var hh = d.h * K * 0.72, hcY = base - d.h * K + d.h * K * 0.12 + hh / 2;
      out.push('<ellipse cx="110" cy="' + hcY.toFixed(1) + '" rx="' + (hh * 0.36).toFixed(1) + '" ry="' + (hh / 2 * 0.86).toFixed(1) + '" fill="none" stroke="#161514" stroke-width="1.8"/>');
      if (key !== "tr") out.push(rect(50, 60, 'fill="none" stroke="#F4F1EA" stroke-width="1.4" stroke-dasharray="4 4"'));
      out.push('<text x="110" y="184" text-anchor="middle">' + d.w + ' mm</text>');
      out.push('<text x="' + (116 + d.w * K / 2).toFixed(1) + '" y="' + (base - d.h * K / 2).toFixed(1) + '">' + d.h + "</text>");
      if (key !== "tr") out.push('<text x="4" y="12">- - 50×60 karşılaştırma</text>');
      sc.innerHTML = out.join("");
      $('[data-s="size"]', bl).textContent = d.size; $('[data-s="type"]', bl).textContent = d.type; $('[data-s="note"]', bl).textContent = d.note;
    };
    $$("[data-doc]", bl).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("[data-doc]", bl).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        paintDoc(b.getAttribute("data-doc"));
      });
    });
    paintDoc("tr");
  }

  /* ——— İletişim: o saatte açık mı ——— */
  var am = $("[data-tool=acikmi]");
  if (am) {
    var dS = $("[data-day]", am), tI = $("[data-time]", am), res = $("[data-res]", am);
    var runAm = function () {
      var di = +dS.value, t = tI.value;
      if (!t) { res.innerHTML = "<span>Bir saat seçin.</span>"; return; }
      var m = toMin(t), r = HOURS[String(di)][0], s = toMin(r[0]), e = toMin(r[1]), open = m >= s && m < e;
      var txt = DAY[di] + " " + t + ": " + (open ? "açık. " : "kapalı. ") + "O gün " + r[0] + "–" + r[1] + " arası açık" +
        (open ? "; kapanışa " + (Math.floor((e - m) / 60) ? Math.floor((e - m) / 60) + " saat " : "") + ((e - m) % 60 ? ((e - m) % 60) + " dakika " : "") + "var." : (m < s ? "; açılışa " + (Math.floor((s - m) / 60) ? Math.floor((s - m) / 60) + " saat " : "") + ((s - m) % 60 ? ((s - m) % 60) + " dakika " : "") + "var." : "."));
      res.innerHTML = (open ? OK : NO) + "<span>" + txt + "</span>";
    };
    var setNow = function () { var n = istanbulNow(); dS.value = String(n.d); tI.value = hhmm(n.m); };
    $$("[data-q]", am).forEach(function (b) {
      b.addEventListener("click", function () {
        var q = b.getAttribute("data-q");
        if (q === "now") setNow(); else { var p = q.split("|"); dS.value = p[0]; tI.value = p[1]; }
        runAm();
      });
    });
    dS.addEventListener("change", runAm); tI.addEventListener("input", runAm); tI.addEventListener("change", runAm);
    setNow(); runAm();
  }

  /* ——— Randevu seçici (imza aracı) ——— */
  var book = $("[data-tool=randevu]");
  if (book) {
    var form = $("[data-form]", book), bv = $("[data-vf]", book), BV = VF(bv);
    var img = $("[data-img]", bv), empty = $("[data-empty]", bv), sum = $("[data-sum]", bv), stc = $("[data-stepc]", bv);
    var note = $("[data-daynote]", form), msgEl = $("[data-msg]", book), waA = $("[data-wa]", book);
    var dateIn = form.elements.tarih, steps = $$("[data-lock]", form);
    var IMG = {
      vesikalik: ["img/studyo-halka-isik.jpg", 495, 1043, "Temsili görsel: kırmızı perde önünde halka ışık"],
      dugun: ["img/vizor-ekran.jpg", 860, 983, "Temsili görsel: tripoddaki makinenin ekranında bir kadraj"],
      dis: ["img/dis-cekim.jpg", 1020, 530, "Temsili görsel: sokakta fotoğraf çeken bir kadın"],
      urun: ["img/urun-isik.jpg", 530, 385, "Temsili görsel: mor ışıkta bir objektifin odak halkası"],
      diger: ["img/mercek.jpg", 960, 640, "Temsili görsel: bir objektifin ön merceği"]
    };
    var NAME = { vesikalik: "Vesikalık / biyometrik fotoğraf", dugun: "Düğün / nişan çekimi", dis: "Dış çekim", urun: "Ürün çekimi", diger: "Diğer bir çekim" };
    var SHORT = { vesikalik: "VESİKALIK", dugun: "DÜĞÜN", dis: "DIŞ ÇEKİM", urun: "ÜRÜN", diger: "DİĞER" };
    var checked = function (n) { return $$('input[name="' + n + '"]:checked', form).map(function (i) { return i.value; }); };
    var txt = function (n) { var e = form.elements[n]; return e && typeof e.value === "string" ? e.value.trim() : ""; };
    dateIn.min = todayISO();
    steps.forEach(function (s) { s.hidden = true; });

    var build = function () {
      var t = checked("tur")[0]; if (!t) return "";
      var d = [], L = ["Merhaba Stüdyo Dijifoto, web sitenizdeki randevu seçiciden yazıyorum."];
      if (t === "vesikalik") { var b = checked("belge")[0]; if (b === "Vize") b = txt("ulke") ? txt("ulke") + " vizesi" : "vize"; if (b) d.push(b); var k = checked("kisi")[0]; if (k) d.push(k); }
      if (t === "dugun") { var e = checked("etkinlik"); if (e.length) d.push(e.join(", ")); if (txt("mekan")) d.push("mekân: " + txt("mekan")); if (form.elements.video.checked) d.push("video da düşünüyoruz"); }
      if (t === "dis") { var c = checked("konu")[0]; if (c) d.push(c.toLocaleLowerCase("tr") + " çekimi"); if (txt("yer")) d.push("yer fikri: " + txt("yer")); }
      if (t === "urun") { var a = checked("adet")[0]; if (a) d.push(a); var u = checked("kullanim"); if (u.length) d.push("kullanım: " + u.join(", ")); var f = checked("fon")[0]; if (f) d.push(f); }
      if (t === "diger" && txt("ne")) d.push(txt("ne"));
      L.push("Çekim: " + NAME[t] + (d.length ? " (" + d.join("; ") + ")" : ""));
      var z = checked("zaman")[0], zt = z && z !== "fark etmez" ? z + " saatleri" : "";
      if (dateIn.value) L.push("İstediğim gün: " + fmtDate(dateIn.value) + (zt ? ", " + zt : "") + (form.elements.esnek.checked ? " (tarihim esnek)" : ""));
      else L.push("Tarih: henüz belli değil, uygun günler için bilgi almak istiyorum" + (zt ? " (" + zt + " tercihim)" : "") + ".");
      if (txt("not")) L.push("Not: " + txt("not"));
      if (txt("ad")) L.push("Adım: " + txt("ad"));
      L.push(t === "dugun" || t === "dis" ? "Bu tarih için uygunluğu ve seçenekleri öğrenebilir miyim?" : "Bu gün için uygunluk ve bilgi alabilir miyim?");
      return L.join("\n");
    };
    var dayNote = function () {
      var t = checked("tur")[0], ds = dateIn.value, z = checked("zaman")[0], out = "";
      if (ds && t) {
        var di = dayIdx(ds), h = HOURS[String(di)][0];
        if (t === "dugun" || t === "dis") {
          out = fmtDate(ds) + ": çekim mekânda yapılacaksa stüdyo saatleri bağlayıcı olmayabilir; uygunluğu sorun. O gün İstanbul'da akşam altın saati yaklaşık " + goldenEve(ds) + ".";
        } else {
          out = fmtDate(ds) + ": stüdyo " + h[0] + "–" + h[1] + " arası açık.";
          if (z === "sabah" && di >= 5) out += " Hafta sonu stüdyo öğlen açılıyor; sabah için arayıp sorun.";
        }
      }
      note.textContent = out;
    };
    var update = function () {
      var t = checked("tur")[0], m = build();
      msgEl.textContent = m || "Önce bir çekim türü seçin.";
      waA.setAttribute("href", m ? waLink(m) : WA);
      var ds = dateIn.value;
      sum.textContent = (t ? SHORT[t] : "TÜR —") + "  ·  " + (ds ? "GÜN " + ds.split("-").reverse().join(".") : "GÜN —");
      stc.textContent = !t ? 1 : !ds ? 2 : (txt("ad") || txt("not")) ? 4 : 3;
      var ulke = $("[data-if-belge]", form); if (ulke) ulke.hidden = checked("belge")[0] !== "Vize";
      dayNote();
    };
    var setType = function (t, anim) {
      var swap = function () {
        bv.setAttribute("data-mode", t);
        var im = IMG[t]; img.src = im[0]; img.width = im[1]; img.height = im[2]; img.alt = im[3];
        if (empty) empty.hidden = true;
      };
      if (anim) BV.shoot(swap); else swap();
      $$("[data-sub]", form).forEach(function (s) { s.classList.toggle("is-on", s.getAttribute("data-sub") === t); });
      steps.forEach(function (s) { s.hidden = false; });
      var lab = form.querySelector('input[name="tur"][value="' + t + '"]');
      if (lab) redraw($(".pen", lab.parentNode));
    };
    form.addEventListener("change", function (e) { if (e.target.name === "tur") setType(e.target.value, true); update(); });
    form.addEventListener("input", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    var q = null;
    try { q = new URLSearchParams(location.search).get("tur"); } catch (e) { q = null; }
    if (q && NAME[q]) {
      var r0 = form.querySelector('input[name="tur"][value="' + q + '"]');
      if (r0) { r0.checked = true; setType(q, false); setTimeout(function () { BV.shoot(); }, 500); }
    }
    update();
  }
})();
