/* Menemen Beşiktaş — site.js (kütüphanesiz) */
(function () {
  "use strict";

  var WA = "https://wa.me/905326763196";
  var BRAND = "Menemen Beşiktaş";
  /* 0 = Pazartesi … 6 = Pazar; Pazartesi kapalı (anahtar yok) */
  var HOURS = { "1": [["09:00", "16:00"]], "2": [["09:00", "16:00"]], "3": [["09:00", "17:00"]], "4": [["09:00", "16:00"]], "5": [["09:00", "17:00"]], "6": [["09:00", "17:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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
  /* ---- kopya sonu ---- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) {
    try {
      if (arguments.length < 2) return window.localStorage.getItem(k);
      if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v);
    } catch (e) { /* gizli pencere vb. */ }
    return null;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function cap(s) { return s ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : s; }
  function listTr(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " ve " + a[a.length - 1]; }
  function rangesFor(d) { return HOURS[String(d)] || []; }
  function nextOpening(fromDay) {
    for (var k = 1; k <= 7; k++) {
      var dd = (fromDay + k) % 7, r = rangesFor(dd);
      if (r.length) return DAYS[dd] + " " + r[0][0];
    }
    return "";
  }

  /* ---------- canlı durum + bugün işareti ---------- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-day]").forEach(function (el) {
      el.classList.toggle("is-today", parseInt(el.getAttribute("data-day"), 10) === s.dayIndex);
    });
    /* saat çizelgesindeki "şimdi" çizgisi (08:00–18:00 ekseni) */
    $$(".chart-now").forEach(function (x) { x.parentNode.removeChild(x); });
    var row = $('.chart-row[data-day="' + s.dayIndex + '"] .chart-track');
    if (row && s.minutes >= 480 && s.minutes <= 1080) {
      var line = document.createElement("span");
      line.className = "chart-now";
      line.style.left = ((s.minutes - 480) / 600 * 100).toFixed(2) + "%";
      line.setAttribute("aria-hidden", "true");
      row.appendChild(line);
    }
    /* saat sahanı */
    var clock = $("[data-clock]");
    if (clock) {
      var n = istanbulNow(), h = Math.floor(n.m / 60) % 12, mm = n.m % 60;
      var hh = $(".hand-h", clock), mh = $(".hand-m", clock);
      if (hh) hh.setAttribute("transform", "rotate(" + ((h + mm / 60) * 30).toFixed(1) + ")");
      if (mh) mh.setAttribute("transform", "rotate(" + (mm * 6) + ")");
    }
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ---------- gezinme ---------- */
  var top = $(".top"), nb = $(".nav-btn"), nav = $("#site-nav");
  function setNav(open) {
    if (!top || !nb) return;
    top.classList.toggle("nav-open", open);
    nb.setAttribute("aria-expanded", open ? "true" : "false");
    var lbl = $("[data-nav-label]", nb); if (lbl) lbl.textContent = open ? "Kapat" : "Sayfalar";
    document.body.classList.toggle("no-scroll", open);
    if (open) { var a = $("a", nav); if (a) a.focus(); }
  }
  if (nb && nav) {
    nb.addEventListener("click", function () { setNav(!top.classList.contains("nav-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && top.classList.contains("nav-open")) { setNav(false); nb.focus(); }
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 980 && top.classList.contains("nav-open")) setNav(false); });
  }

  /* ---------- soğanlı / soğansız (yalnız eğlence, yerel) ---------- */
  var CAPS = {
    on: "Soğanlı ekip: kavrulmuş soğanın tatlılığı olmadan menemen eksik kalır diyenlerdensiniz.",
    off: "Soğansız ekip: domates, biber, yumurta yeter; fazlası kalabalık diyenlerdensiniz.",
    none: "Seçin bakalım: sahan ona göre değişsin."
  };
  function setOnion(v, save) {
    var root = document.documentElement;
    if (v === "on" || v === "off") root.setAttribute("data-onion", v); else { root.removeAttribute("data-onion"); v = null; }
    $$('input[name="sogan"]').forEach(function (i) { i.checked = (i.value === v); });
    $$("[data-onion-caption]").forEach(function (el) { el.textContent = CAPS[v || "none"]; });
    $$("[data-onion-foot]").forEach(function (el) {
      if (v) { el.hidden = false; el.textContent = "Bu cihazdaki tarafınız: " + (v === "on" ? "soğanlı ekip." : "soğansız ekip."); }
      else el.hidden = true;
    });
    if (save) {
      store("mb-sogan", v);
      if (!reduce) $$("[data-stage]").forEach(function (st) { st.classList.remove("is-sizzle"); void st.offsetWidth; st.classList.add("is-sizzle"); });
    }
  }
  var pref = store("mb-sogan");
  setOnion(pref === "on" || pref === "off" ? pref : null, false);
  $$('input[name="sogan"]').forEach(function (i) { i.addEventListener("change", function () { setOnion(i.value, true); }); });
  $$("[data-set-onion]").forEach(function (b) { b.addEventListener("click", function () { setOnion(b.getAttribute("data-set-onion"), true); }); });

  /* ---------- kaydırdıkça dönen sahan ---------- */
  var spins = $$("[data-spin]");
  if (spins.length && !reduce) {
    var ticking = false;
    var upd = function () {
      ticking = false;
      var y = window.pageYOffset || 0;
      spins.forEach(function (el) { el.style.transform = "rotate(" + (y * 0.16).toFixed(2) + "deg)"; });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---------- sahan anatomisi ---------- */
  var anat = $("[data-anat]");
  if (anat) {
    var ings = $$(".ing");
    var hl = function (li) {
      if (li) anat.setAttribute("data-hl", li.getAttribute("data-ing")); else anat.removeAttribute("data-hl");
      ings.forEach(function (x) { x.classList.toggle("is-hl", x === li); });
    };
    ings.forEach(function (li) {
      li.addEventListener("mouseenter", function () { hl(li); });
      var b = $(".ing-btn", li);
      if (b) {
        b.addEventListener("focus", function () { hl(li); });
        b.addEventListener("click", function () { hl(li); });
      }
    });
    var list = $(".ing-list");
    if (list) list.addEventListener("mouseleave", function () { hl(null); });
  }

  /* ---------- kopyalama ---------- */
  function copyText(t, statusEl) {
    function ok() { if (statusEl) statusEl.textContent = "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz."; }
    function fail() { if (statusEl) statusEl.textContent = "Kopyalanamadı; mesajı elle seçip kopyalayın."; }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { if (document.execCommand("copy")) ok(); else fail(); } catch (e) { fail(); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, fallback); else fallback();
  }
  /* araç kökü + mesaj kurucu bağlayıcısı */
  function bindTool(root, build) {
    var out = $("[data-msg]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root), st = $("[data-copy-status]", root);
    var current = "";
    function refresh() {
      current = build();
      if (out) out.textContent = current;
      if (wa) wa.setAttribute("href", waHref(current));
      if (st) st.textContent = "";
    }
    root.addEventListener("change", refresh);
    root.addEventListener("input", refresh);
    if (cp) cp.addEventListener("click", function () { copyText(current, st); });
    refresh();
    return refresh;
  }

  /* ---------- MENÜ: sahanını kur ---------- */
  var kur = $('[data-tool="sahan-kur"]');
  if (kur) {
    var ADJ = { sogan: "soğanlı", kasar: "kaşarlı", beyaz: "beyaz peynirli", sucuk: "sucuklu", pastirma: "pastırmalı", mantar: "mantarlı", aci: "bol pul biberli" };
    var nameEl = $("[data-kur-name]", kur);
    var pre = $('input[name="kat"][value="sogan"]', kur);
    if (pre && document.documentElement.getAttribute("data-onion") === "on") pre.checked = true;
    bindTool(kur, function () {
      var sel = $$('input[name="kat"]:checked', kur).map(function (i) { return i.value; });
      Object.keys(ADJ).forEach(function (k) { kur.setAttribute("data-" + k, sel.indexOf(k) > -1 ? "1" : "0"); });
      var egg = ($('input[name="yumurta"]:checked', kur) || {}).value || "karisik";
      var kv = ($('input[name="kivam"]:checked', kur) || {}).value || "orta";
      kur.setAttribute("data-goz", egg === "goz" ? "1" : "0");
      kur.setAttribute("data-kivam", kv);
      var adj = sel.map(function (k) { return ADJ[k]; });
      var nm = adj.length ? cap(listTr(adj)) + " menemen" : "Sade menemen";
      if (egg === "goz") nm += ", göz yumurtalı";
      if (kv === "sulu") nm += ", sulu"; else if (kv === "kuru") nm += ", iyice pişmiş";
      if (nameEl) nameEl.textContent = nm;
      var m = "Merhaba " + BRAND + ", menemen hakkında sormak istiyorum.";
      if (adj.length) m += " Menemeni " + listTr(adj) + " yapabiliyor musunuz?";
      else m += " Menemeniniz nasıl hazırlanıyor, hangi seçenekler var?";
      if (egg === "goz") m += " Yumurtası karıştırılmadan, sarısı bütün olabilir mi?";
      if (kv === "sulu") m += " Kıvamı sulu olursa sevinirim.";
      if (kv === "kuru") m += " Kıvamı iyice pişmiş olursa sevinirim.";
      return m + " Teşekkürler.";
    });
    /* telefonda: büyük sahan ekrandan çıkınca seçimler küçük, yüzen bir sahanda görünsün */
    var mini = $("[data-kur-mini]", kur), bigPan = $(".kur-pan", kur), form = $(".kur-form", kur);
    if (mini && bigPan && form && "IntersectionObserver" in window) {
      var src = $("svg", bigPan);
      if (src) {
        var cl = src.cloneNode(true);
        cl.removeAttribute("role"); cl.removeAttribute("aria-labelledby"); cl.setAttribute("aria-hidden", "true"); cl.setAttribute("focusable", "false");
        $$("title", cl).forEach(function (n) { n.parentNode.removeChild(n); });
        $$("[id]", cl).forEach(function (n) { n.removeAttribute("id"); }); /* url(#…) özgün tanımlara gider */
        mini.appendChild(cl);
        var vis = { pan: true, form: false };
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.target === bigPan) vis.pan = e.isIntersecting; else vis.form = e.isIntersecting; });
          mini.classList.toggle("is-on", !vis.pan && vis.form);
        }, { threshold: 0 });
        io.observe(bigPan); io.observe(form);
      }
    }
  }

  /* ---------- MENÜ: çay rengi ---------- */
  var cay = $('[data-tool="cay"]');
  if (cay) {
    var TEA = {
      acik: { c: "#D98A2B", t: "Açık:", d: " az dem, bol su. Rengi açık kehribar, içimi yumuşak." },
      tavsan: { c: "#B3321F", t: "Tavşan kanı:", d: " koyu kırmızıya çalan, berrak bir renk. Pek çok çay severin aradığı renk." },
      demli: { c: "#5A1A0E", t: "Demli:", d: " dem fazla, rengi koyu, tadı sert. Uykusu açılmamış sabahlar için." }
    };
    var desc = $("[data-tea-desc]", cay);
    var paintTea = function () {
      var v = ($('input[name="cay"]:checked', cay) || {}).value || "tavsan", o = TEA[v];
      cay.style.setProperty("--tea", o.c);
      if (desc) { desc.innerHTML = ""; var b = document.createElement("strong"); b.textContent = o.t; desc.appendChild(b); desc.appendChild(document.createTextNode(o.d)); }
    };
    cay.addEventListener("change", paintTea);
    paintTea();
  }

  /* ---------- ZİYARET: saat planlayıcı ---------- */
  var pl = $('[data-tool="planlayici"]');
  if (pl) {
    var rng = $("#plan-time", pl), outT = $("[data-plan-time]", pl), big = $("[data-plan-big]", pl), small = $("[data-plan-small]", pl), box = $("[data-plan-out]", pl);
    var now = istanbulNow();
    $$('input[name="pday"]', pl).forEach(function (i) { i.checked = parseInt(i.value, 10) === now.d; });
    var start = Math.round(now.m / 15) * 15;
    rng.value = Math.min(1140, Math.max(420, start));
    var dur = function (m) {
      var h = Math.floor(m / 60), r = m % 60;
      return (h ? h + " saat" : "") + (h && r ? " " : "") + (r ? r + " dakika" : "");
    };
    var plan = function () {
      var d = parseInt((($('input[name="pday"]:checked', pl) || {}).value) || "0", 10);
      var t = parseInt(rng.value, 10), rs = rangesFor(d), open = false, b, s;
      outT.textContent = hm(t);
      rng.setAttribute("aria-valuetext", hm(t));
      /* kaydırıcıda o günün açık aralığı (07:00–19:00 ekseni) */
      var pct = function (m) { return (Math.max(0, Math.min(720, m - 420)) / 720 * 100).toFixed(1) + "%"; };
      rng.style.setProperty("--o", rs.length ? pct(mins(rs[0][0])) : "0%");
      rng.style.setProperty("--c", rs.length ? pct(mins(rs[0][1])) : "0%");
      if (!rs.length) { b = "Kapalı"; s = DAYS[d] + " günleri kapalı. En yakın açılış: " + nextOpening(d) + "."; }
      else {
        var o = mins(rs[0][0]), c = mins(rs[0][1]);
        if (t < o) { b = "Henüz kapalı"; s = DAYS[d] + " " + hm(t) + ": kapı daha açılmadı. Açılış saati " + rs[0][0] + "."; }
        else if (t >= c) { b = "Kapanmış"; s = DAYS[d] + " kapanış saati " + rs[0][1] + ". Sonraki açılış: " + nextOpening(d) + "."; }
        else { open = true; b = "Açık"; s = DAYS[d] + " " + hm(t) + ": " + rs[0][0] + "–" + rs[0][1] + " arası açık. Kapanışa " + dur(c - t) + " var."; }
      }
      big.textContent = b; small.textContent = s;
      box.classList.toggle("is-open", open); box.classList.toggle("is-closed", !open);
    };
    pl.addEventListener("change", plan);
    rng.addEventListener("input", plan);
    plan();
  }

  /* ---------- ZİYARET: kontrol listesi ---------- */
  var ck = $('[data-tool="kontrol"]');
  if (ck) {
    var saved = {};
    try { saved = JSON.parse(store("mb-kontrol") || "{}") || {}; } catch (e) { saved = {}; }
    var boxes = $$('input[type="checkbox"]', ck), cnt = $("[data-check-count]", ck);
    var count = function () { cnt.textContent = boxes.filter(function (b) { return b.checked; }).length + " / " + boxes.length; };
    boxes.forEach(function (b) {
      b.checked = !!saved[b.value];
      b.addEventListener("change", function () { saved[b.value] = b.checked; store("mb-kontrol", JSON.stringify(saved)); count(); });
    });
    var rs = $("[data-check-reset]", ck);
    if (rs) rs.addEventListener("click", function () { saved = {}; boxes.forEach(function (b) { b.checked = false; }); store("mb-kontrol", null); count(); });
    count();
  }

  /* ---------- GRUP: adisyon ---------- */
  var gf = $('[data-tool="grup-talep"]');
  if (gf) {
    gf.addEventListener("submit", function (e) { e.preventDefault(); });
    var S = { people: 8, on: 0, off: 0, dayKey: null, time: "" };
    var MAXP = 60, MINP = 2;
    var peopleOut = $("[data-people]", gf), tablesBox = $("[data-tables]", gf), daysBox = $("[data-days]", gf), timesBox = $("[data-times]", gf);
    var splitNote = $("[data-split-note]", gf);
    if (document.documentElement.getAttribute("data-onion") === "on") S.on = 1;
    if (document.documentElement.getAttribute("data-onion") === "off") S.off = 1;

    /* İstanbul tarihine göre önümüzdeki 21 gün */
    var base = (function () {
      try {
        var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).split("-");
        return { y: +p[0], m: +p[1], d: +p[2] };
      } catch (e) { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
    })();
    var DAYINFO = {};
    daysBox.innerHTML = "";
    for (var k = 0; k < 21; k++) {
      var dt = new Date(Date.UTC(base.y, base.m - 1, base.d + k));
      var wd = (dt.getUTCDay() + 6) % 7, closed = !rangesFor(wd).length, key = "g" + k;
      DAYINFO[key] = { wd: wd, d: dt.getUTCDate(), mo: dt.getUTCMonth(), y: dt.getUTCFullYear(), rel: k === 0 ? "bugün" : (k === 1 ? "yarın" : "") };
      var lab = document.createElement("label"); lab.className = "daychip";
      var inp = document.createElement("input"); inp.type = "radio"; inp.name = "gday"; inp.value = key; inp.disabled = closed;
      var sp = document.createElement("span");
      var top1 = document.createElement("i"); top1.textContent = k === 0 ? "Bugün" : (k === 1 ? "Yarın" : DAYS_SHORT[wd]);
      var mid = document.createElement("b"); mid.textContent = dt.getUTCDate();
      var bot = document.createElement("i"); bot.textContent = closed ? "kapalı" : MONTHS_SHORT[dt.getUTCMonth()];
      sp.appendChild(top1); sp.appendChild(mid); sp.appendChild(bot);
      lab.setAttribute("aria-label", dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()] + " " + DAYS[wd] + (closed ? ", kapalı" : ""));
      lab.appendChild(inp); lab.appendChild(sp); daysBox.appendChild(lab);
    }

    var renderTimes = function () {
      timesBox.innerHTML = "";
      if (!S.dayKey) { var p = document.createElement("p"); p.className = "hint"; p.textContent = "Önce bir gün seçin."; timesBox.appendChild(p); return; }
      var rs = rangesFor(DAYINFO[S.dayKey].wd); if (!rs.length) return;
      var o = mins(rs[0][0]), c = mins(rs[0][1]), list = [];
      for (var t = o; t <= c - 60; t += 30) list.push(hm(t));
      list.push("Esnek");
      if (list.indexOf(S.time) < 0) S.time = "";
      list.forEach(function (v) {
        var l = document.createElement("label"); l.className = "opt";
        var i = document.createElement("input"); i.type = "radio"; i.name = "gtime"; i.value = v; i.checked = v === S.time;
        var s = document.createElement("span"); s.textContent = v;
        l.appendChild(i); l.appendChild(s); timesBox.appendChild(l);
      });
    };

    var NS = "http://www.w3.org/2000/svg";
    var el = function (n, a) { var e = document.createElementNS(NS, n); for (var x in a) e.setAttribute(x, a[x]); return e; };
    var renderTables = function () {
      tablesBox.innerHTML = "";
      var left = S.people, idx = 0;
      while (left > 0) {
        var seats = Math.min(12, left), cols = Math.ceil(seats / 2);
        var svg = el("svg", { "class": "tbl", viewBox: "0 0 380 150", "aria-hidden": "true", focusable: "false" });
        svg.appendChild(el("rect", { x: 190 - cols * 28 - 10, y: 36, width: cols * 56 + 20, height: 78, rx: 14, fill: "#FFF3E0", stroke: "#1F1A17", "stroke-width": 3 }));
        for (var i = 0; i < seats; i++) {
          var row = i % 2, c = Math.floor(i / 2), cx = 190 - (cols - 1) * 28 + c * 56, cy = row ? 90 : 60, chy = row ? 124 : 8;
          var kind = idx < S.on ? "on" : (idx < S.on + S.off ? "off" : "");
          svg.appendChild(el("rect", { x: cx - 16, y: chy, width: 32, height: 18, rx: 7, fill: kind === "on" ? "#B98BCB" : (kind === "off" ? "#3A7D44" : "#E9DCC9"), stroke: "#1F1A17", "stroke-width": 2.5 }));
          svg.appendChild(el("circle", { cx: cx, cy: cy, r: 15, fill: "#2A211C" }));
          svg.appendChild(el("circle", { cx: cx, cy: cy, r: 11, fill: "#E63B2E" }));
          svg.appendChild(el("circle", { cx: cx - 2, cy: cy - 2, r: 5, fill: "#FFC72C" }));
          if (kind === "on") svg.appendChild(el("path", { d: "M" + (cx + 2) + " " + (cy + 6) + "a6 6 0 0 1 6-6", fill: "none", stroke: "#F8EEF9", "stroke-width": 2.5, "stroke-linecap": "round" }));
          idx++;
        }
        tablesBox.appendChild(svg);
        left -= seats;
      }
    };

    var syncSplit = function () {
      if (S.on + S.off > S.people) { S.off = Math.max(0, S.people - S.on); if (S.on > S.people) S.on = S.people; }
      $('[data-split-out="on"]', gf).textContent = S.on;
      $('[data-split-out="off"]', gf).textContent = S.off;
      var rest = S.people - S.on - S.off;
      splitNote.textContent = (S.on + S.off === 0) ? "Henüz kimse seçmedi. Masadaki tabaklar seçime göre renklenir." :
        (rest > 0 ? rest + " kişi henüz kararsız." : "Herkes tarafını seçti.");
    };

    var build = function () {
      peopleOut.textContent = S.people;
      syncSplit();
      renderTables();
      var L = ["Merhaba " + BRAND + ", kalabalık bir grupla gelmek istiyoruz; ön bilgi almak isterim.", ""];
      L.push("• Kişi sayısı: " + S.people);
      if (S.dayKey) {
        var di = DAYINFO[S.dayKey];
        L.push("• Gün: " + di.d + " " + MONTHS[di.mo] + " " + di.y + ", " + DAYS[di.wd] + (di.rel ? " (" + di.rel + ")" : ""));
      } else L.push("• Gün: henüz belli değil");
      if (S.time) L.push("• Saat: " + (S.time === "Esnek" ? "esnek, size uyan bir saat" : S.time + " civarı"));
      var ves = ($('input[name="vesile"]:checked', gf) || {}).value;
      if (ves) L.push("• Vesile: " + ves);
      if (S.on || S.off) {
        var parts = [];
        if (S.on) parts.push(S.on + " soğanlı");
        if (S.off) parts.push(S.off + " soğansız");
        var rest = S.people - S.on - S.off;
        if (rest > 0) parts.push(rest + " kişi kararsız");
        L.push("• Menemen tercihi (mümkünse): " + parts.join(", "));
      }
      var qs = $$('input[name="soru"]:checked', gf).map(function (i) { return i.value; });
      if (qs.length) { L.push("• Sorularımız:"); qs.forEach(function (q) { L.push("   - " + q); }); }
      var note = ($("#gf-note", gf).value || "").trim();
      if (note) L.push("• Not: " + note);
      L.push("");
      L.push("Uygunluk ve ayrıntılar için dönüşünüzü bekliyorum. Teşekkürler.");
      var nm = ($("#gf-name", gf).value || "").trim();
      if (nm) L.push(nm);
      return L.join("\n");
    };
    var refresh = bindTool(gf, build);

    $$("[data-people-step]", gf).forEach(function (b) {
      b.addEventListener("click", function () {
        S.people = Math.max(MINP, Math.min(MAXP, S.people + parseInt(b.getAttribute("data-people-step"), 10)));
        refresh();
      });
    });
    $$("[data-split]", gf).forEach(function (b) {
      b.addEventListener("click", function () {
        var side = b.getAttribute("data-split"), d = parseInt(b.getAttribute("data-d"), 10);
        var other = side === "on" ? S.off : S.on;
        S[side] = Math.max(0, Math.min(S.people - other, S[side] + d));
        refresh();
      });
    });
    daysBox.addEventListener("change", function (e) {
      if (e.target && e.target.name === "gday") { S.dayKey = e.target.value; renderTimes(); }
    });
    timesBox.addEventListener("change", function (e) {
      if (e.target && e.target.name === "gtime") S.time = e.target.value;
    });
    renderTimes();
    refresh();
  }

  /* ---------- İLETİŞİM: hızlı mesaj ---------- */
  var qm = $('[data-tool="hizli-mesaj"]');
  if (qm) {
    var TOPIC = {
      menu: "Güncel menünüzü ve fiyatlarınızı öğrenebilir miyim?",
      menemen: "Menemeniniz nasıl hazırlanıyor; soğanlı mı, soğansız mı? Seçenekler neler?",
      grup: "Kalabalık bir grupla gelmek istiyoruz; uygunluk için bilgi alabilir miyim?",
      yol: "Size en kolay nasıl ulaşırım? Yakında park yeri var mı?",
      saat: "Bugün kaça kadar açıksınız?",
      diger: "Bir sorum olacaktı."
    };
    var hint = $("[data-quick-hint]", qm);
    bindTool(qm, function () {
      var t = ($('input[name="konu"]:checked', qm) || {}).value || "menu";
      if (hint) hint.hidden = t !== "grup";
      var m = "Merhaba " + BRAND + ". " + TOPIC[t];
      var ex = ($("#q-extra", qm).value || "").trim(), nm = ($("#q-name", qm).value || "").trim();
      if (ex) m += "\n" + ex;
      if (nm) m += "\n" + nm;
      return m;
    });
  }
})();
