/* Sporumx — canlı saat, açık/kapalı durumu, 24 saatlik halka ve sayfa araçları. Kütüphane yok. */
(function () {
  "use strict";

  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };
  var WA = "https://wa.me/905388822228";
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var BANDS = [
    { from: 0, to: 5, name: "Gece kuşları", tip: "Düzen kurun: haftanın aynı günlerinde aynı saatte gelin. Antrenmandan sonra hafif bir öğün ve karanlık, sessiz bir oda uykunuzu korur." },
    { from: 5, to: 9, name: "Erkenciler", tip: "Sabah eklemler daha serttir; ısınmayı birkaç dakika uzatın. Aç karnına başınız dönüyorsa öncesinde muz gibi hafif bir şey deneyin." },
    { from: 9, to: 12, name: "Kuşluk vakti", tip: "Kahvaltıdan sonra bir iki saat bekleyin. Günün bu aralığı kuvvet çalışması için rahat bir zaman olabilir." },
    { from: 12, to: 17, name: "Öğle ve öğleden sonra", tip: "Öğle arasına sığdıracaksanız 4–5 hareketi önceden yazın, set aralarını kısa tutun, dönüş yolunu hesaba katın." },
    { from: 17, to: 21, name: "İş çıkışı", tip: "İlk ısınma setlerinde kendinizi dinleyin. Çok yorgunsanız yükü azaltıp tekniğe odaklanın; gelmiş olmak bile alışkanlığı korur." },
    { from: 21, to: 24, name: "Geç saat", tip: "Bu saatlerde kafeinli ön antrenman ürünlerini bırakın, soğuma ve esnemeye 5–10 dakika ayırın; uykuya geçmek kolaylaşır." }
  ];
  function bandOf(h) { for (var i = 0; i < BANDS.length; i++) if (h >= BANDS[i].from && h < BANDS[i].to) return BANDS[i]; return BANDS[0]; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmt(n) { try { return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 }); } catch (e) { return String(n).replace(".", ","); } }
  function lowerTr(s) { try { return s.toLocaleLowerCase("tr-TR"); } catch (e) { return s.toLowerCase(); } }

  /* ---- kit/status.js kopyası ---- */
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

  /* İstanbul saati (saniyeli) */
  function clockNow() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[o.weekday], h: parseInt(o.hour, 10) % 24, m: parseInt(o.minute, 10), s: parseInt(o.second, 10), day: parseInt(o.day, 10), mon: parseInt(o.month, 10) };
    } catch (e) {
      var n = new Date();
      return { d: (n.getDay() + 6) % 7, h: n.getHours(), m: n.getMinutes(), s: n.getSeconds(), day: n.getDate(), mon: n.getMonth() + 1 };
    }
  }

  /* ---- yardımcılar ---- */
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function copyText(txt, btn) {
    var orig = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", orig);
    function done() { btn.textContent = "Kopyalandı"; setTimeout(function () { btn.textContent = orig; }, 1800); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* yok say */ }
      document.body.removeChild(ta); done();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
  }
  function bindMsgTool(root, build) {
    var out = $("[data-msg-out]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root);
    function upd() { var m = build(); out.textContent = m; if (wa) wa.href = WA + "?text=" + encodeURIComponent(m); }
    root.addEventListener("input", upd);
    root.addEventListener("change", upd);
    if (cp) cp.addEventListener("click", function () { copyText(out.textContent, cp); });
    upd();
    return upd;
  }
  function checkedVals(root, name) { return $$('input[name="' + name + '"]:checked', root).map(function (i) { return i.value; }); }

  /* ---- menü ---- */
  var top = $("[data-top]"), mbtn = $("[data-menu]");
  if (top && mbtn) {
    mbtn.addEventListener("click", function () {
      var open = !top.hasAttribute("data-open");
      if (open) top.setAttribute("data-open", ""); else top.removeAttribute("data-open");
      mbtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && top.hasAttribute("data-open")) { top.removeAttribute("data-open"); mbtn.setAttribute("aria-expanded", "false"); mbtn.focus(); }
    });
  }

  /* ---- 7 segmentli dev saat ---- */
  var SEGMAP = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  function hseg(x1, x2, y, t) { var h = t / 2; return [[x1, y], [x1 + h, y - h], [x2 - h, y - h], [x2, y], [x2 - h, y + h], [x1 + h, y + h]]; }
  function vseg(x, y1, y2, t) { var h = t / 2; return [[x, y1], [x + h, y1 + h], [x + h, y2 - h], [x, y2], [x - h, y2 - h], [x - h, y1 + h]]; }
  var segHost = $("[data-segclock]"), segDigits = null;
  if (segHost) {
    var t = 12, g = 2.2;
    var P = { a: hseg(6 + g, 54 - g, 6, t), b: vseg(54, 6 + g, 52 - g, t), c: vseg(54, 52 + g, 98 - g, t), d: hseg(6 + g, 54 - g, 98, t), e: vseg(6, 52 + g, 98 - g, t), f: vseg(6, 6 + g, 52 - g, t), g: hseg(6 + g, 54 - g, 52, t) };
    var svg = el("svg", { viewBox: "0 0 324 104", "class": "seg", "aria-hidden": "true", focusable: "false" });
    var gAll = el("g", { transform: "translate(10 0) skewX(-5)" }, svg);
    segDigits = [];
    [0, 76, 174, 250].forEach(function (x) {
      var gd = el("g", { transform: "translate(" + x + " 0)" }, gAll), d = {};
      "abcdefg".split("").forEach(function (k) { d[k] = el("polygon", { points: P[k].map(function (p) { return p.join(","); }).join(" "), "class": "off" }, gd); });
      segDigits.push(d);
    });
    el("rect", { x: 146, y: 28, width: 12, height: 12, "class": "colon" }, gAll);
    el("rect", { x: 146, y: 64, width: 12, height: 12, "class": "colon" }, gAll);
    segHost.innerHTML = "";
    segHost.appendChild(svg);
  }
  function setDigit(d, n) { var on = SEGMAP[n]; for (var k in d) d[k].setAttribute("class", on.indexOf(k) > -1 ? "on" : "off"); }

  var ticksHost = $("[data-ticks]"), ticks = [];
  if (ticksHost) { for (var i = 0; i < 60; i++) { var ti = document.createElement("i"); ticksHost.appendChild(ti); ticks.push(ti); } }
  var daySpans = $$("[data-daybar] span");

  /* ---- 168 saatlik hafta ızgarası ---- */
  var wg = $("[data-wgrid]"), wCells = [];
  if (wg) {
    var short = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    var frag = document.createDocumentFragment();
    var blank = document.createElement("span"); frag.appendChild(blank);
    for (var hh = 0; hh < 24; hh++) { var hs = document.createElement("span"); hs.className = "h"; hs.textContent = pad(hh); frag.appendChild(hs); }
    for (var dd = 0; dd < 7; dd++) {
      var dl = document.createElement("span"); dl.className = "d"; dl.textContent = short[dd]; frag.appendChild(dl);
      wCells[dd] = [];
      for (var h2 = 0; h2 < 24; h2++) { var c = document.createElement("i"); c.title = short[dd] + " " + pad(h2) + ":00 · açık"; frag.appendChild(c); wCells[dd].push(c); }
    }
    wg.innerHTML = "";
    wg.appendChild(frag);
  }

  /* ---- saat döngüsü ---- */
  var lastMinute = -1, lastTick = -1, ringApi = null;
  function minuteUpdate(n) {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (e) { e.textContent = s.text; e.classList.toggle("is-open", s.open); });
    $$("[data-status-short]").forEach(function (e) { e.textContent = s.open ? "Açık" : "Kapalı"; });
    var hm = pad(n.h) + ":" + pad(n.m);
    $$("[data-clock='hm']").forEach(function (e) { e.textContent = hm; });
    $$("[data-h1-now]").forEach(function (e) { e.textContent = "Şu an " + hm + ","; });
    $$("[data-date]").forEach(function (e) { e.textContent = DAYS[n.d] + ", " + n.day + " " + MONTHS[n.mon - 1]; });
    $$("[data-phase]").forEach(function (e) { e.textContent = bandOf(n.h).name; });
    $$("[data-hours-left]").forEach(function (e) { e.textContent = String(n.h); });
    document.documentElement.classList.toggle("is-night", n.h >= 20 || n.h < 6);
    if (segHost) segHost.setAttribute("aria-label", "İstanbul saati " + hm);
    daySpans.forEach(function (sp, idx) {
      sp.classList.toggle("past", idx < n.h);
      sp.classList.toggle("now", idx === n.h);
      if (idx === n.h) sp.style.setProperty("--p", Math.round(n.m / 60 * 100) + "%"); else sp.style.removeProperty("--p");
    });
    $$("[data-band-from]").forEach(function (row) {
      var f = +row.getAttribute("data-band-from"), to = +row.getAttribute("data-band-to");
      row.classList.toggle("is-now", n.h >= f && n.h < to);
    });
    $$(".hours tr[data-d]").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === n.d); });
    if (wCells.length) wCells.forEach(function (row, di) { row.forEach(function (c, hi) { c.classList.toggle("now", di === n.d && hi === n.h); }); });
    if (ringApi) ringApi.now(n);
  }
  function tick() {
    var n = clockNow();
    var key = n.h * 60 + n.m;
    if (key !== lastMinute) { lastMinute = key; minuteUpdate(n); }
    var hms = pad(n.h) + ":" + pad(n.m) + ":" + pad(n.s);
    $$("[data-clock='hms']").forEach(function (e) { e.textContent = hms; });
    if (segDigits) { setDigit(segDigits[0], Math.floor(n.h / 10)); setDigit(segDigits[1], n.h % 10); setDigit(segDigits[2], Math.floor(n.m / 10)); setDigit(segDigits[3], n.m % 10); }
    if (ticks.length && n.s !== lastTick) {
      lastTick = n.s;
      for (var k = 0; k < 60; k++) ticks[k].className = k < n.s ? "on" : (k === n.s ? "now" : "");
      $$("[data-sec]").forEach(function (e) { e.textContent = pad(n.s); });
    }
    setTimeout(tick, 1000 - (Date.now() % 1000) + 20);
  }

  /* ---- 24 saatlik halka + hedef seçici (imza araç) ---- */
  var ringTool = $("[data-tool='deneme-saati']");
  if (ringTool) ringApi = initRing(ringTool);

  function polar(r, deg) { var a = (deg - 90) * Math.PI / 180; return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }
  function pt(p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); }
  function sector(r1, r2, a0, a1) {
    return "M" + pt(polar(r2, a0)) + "A" + r2 + " " + r2 + " 0 0 1 " + pt(polar(r2, a1)) + "L" + pt(polar(r1, a1)) + "A" + r1 + " " + r1 + " 0 0 0 " + pt(polar(r1, a0)) + "Z";
  }
  function initRing(root) {
    var host = $("[data-ring]", root), form = $("[data-ring-form]", root);
    var out = $("[data-ring-out]", root), tipEl = $("[data-ring-tip]", root);
    var now0 = clockNow();
    var st = { hour: (now0.h + 2) % 24, nowH: now0.h, nowM: now0.m };
    if (now0.h + 2 >= 24) { var y = $('input[name="gun"][value="Yarın"]', form); if (y) y.checked = true; }

    var svg = el("svg", { viewBox: "-12 -12 424 424", focusable: "false" });
    el("circle", { cx: 200, cy: 200, r: 112, "class": "inner" }, svg);
    var gSlider = el("g", { role: "slider", tabindex: "0", "aria-label": "Gelmek istediğiniz saat", "aria-valuemin": "0", "aria-valuemax": "23" }, svg);
    el("circle", { cx: 200, cy: 200, r: 197, "class": "ring-focus" }, gSlider);
    var segs = [], labels = [];
    for (var h = 0; h < 24; h++) {
      var p = el("path", { d: sector(150, 190, h * 15 + 0.9, (h + 1) * 15 - 0.9), "class": "hseg", "data-h": h }, gSlider);
      var tt = el("title", {}, p); tt.textContent = pad(h) + ":00–" + pad((h + 1) % 24) + ":00 · açık";
      segs.push(p);
      var lp = polar(132, h * 15 + 7.5);
      var lb = el("text", { x: lp[0].toFixed(1), y: lp[1].toFixed(1), "class": "hl" + (h % 6 === 0 ? " major" : "") }, svg);
      lb.textContent = pad(h);
      labels.push(lb);
    }
    var hand = el("line", { "class": "hand" }, svg);
    var tip = el("polygon", { "class": "hand-tip" }, svg);
    var cl = el("text", { x: 200, y: 160, "class": "c-lbl" }, svg); cl.textContent = "seçtiğiniz saat";
    var ct = el("text", { x: 200, y: 214, "class": "c-time" }, svg);
    var cb = el("text", { x: 200, y: 248, "class": "c-band" }, svg);
    var px = el("g", { "class": "pivot", transform: "translate(200 276)" }, svg);
    el("path", { d: "M-7 -7 7 7M7 -7 -7 7" }, px);
    host.innerHTML = "";
    host.appendChild(svg);

    function select(hh) { st.hour = (hh + 24) % 24; render(); }
    segs.forEach(function (s) { s.addEventListener("click", function () { select(+s.getAttribute("data-h")); }); });
    gSlider.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowUp") { select(st.hour + 1); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "ArrowDown") { select(st.hour - 1); e.preventDefault(); }
      else if (k === "Home") { select(0); e.preventDefault(); }
      else if (k === "End") { select(23); e.preventDefault(); }
    });
    $$("[data-step]", root).forEach(function (b) { b.addEventListener("click", function () { select(st.hour + (+b.getAttribute("data-step"))); }); });

    function build() {
      var goal = (checkedVals(form, "hedef")[0]) || "Henüz karar vermedim";
      var day = (checkedVals(form, "gun")[0]) || "Bugün";
      var pt2 = $('input[name="pt"]', form).checked;
      var name = ($('input[name="ad"]', form).value || "").trim();
      var lines = ["Merhaba Sporumx, sitenizden yazıyorum. Deneme antrenmanı için gelmek istiyorum."];
      lines.push("Hedefim: " + goal);
      lines.push("Uygun zamanım: " + day + ", " + pad(st.hour) + ":00 civarı (" + lowerTr(bandOf(st.hour).name) + ")");
      if (pt2) lines.push("Kişisel antrenman hakkında da bilgi almak isterim.");
      if (name) lines.push("Adım: " + name);
      lines.push("Uygun olur mu?");
      return lines.join("\n");
    }
    var updMsg = bindMsgTool(root, build);
    form.addEventListener("change", render);

    function render() {
      segs.forEach(function (s, i) { s.setAttribute("class", "hseg" + (i === st.hour ? " sel" : "")); });
      labels.forEach(function (l, i) { l.setAttribute("class", "hl" + (i % 6 === 0 ? " major" : "") + (i === st.hour ? " sel" : "")); });
      var txt = pad(st.hour) + ":00";
      ct.textContent = txt;
      cb.textContent = bandOf(st.hour).name;
      gSlider.setAttribute("aria-valuenow", String(st.hour));
      gSlider.setAttribute("aria-valuetext", txt + ", " + bandOf(st.hour).name + ", salon açık");
      out.textContent = txt;
      var day = (checkedVals(form, "gun")[0]) || "Bugün";
      var warn = (day === "Bugün" && st.hour <= st.nowH) ? '<span class="ring-warn">Bu saat bugün için geçti; “Yarın”ı seçebilirsiniz. </span>' : "";
      tipEl.innerHTML = "<b>" + txt + " · " + bandOf(st.hour).name + "</b>" + warn + "Salon bu saatte de açık. " + bandOf(st.hour).tip;
      updMsg();
    }
    function now(n) {
      st.nowH = n.h; st.nowM = n.m;
      var a = (n.h + n.m / 60) * 15;
      var p1 = polar(140, a), p2 = polar(196, a);
      hand.setAttribute("x1", p1[0].toFixed(2)); hand.setAttribute("y1", p1[1].toFixed(2));
      hand.setAttribute("x2", p2[0].toFixed(2)); hand.setAttribute("y2", p2[1].toFixed(2));
      var t1 = polar(197, a), t2 = polar(209, a - 3.2), t3 = polar(209, a + 3.2);
      tip.setAttribute("points", pt(t1) + " " + pt(t2) + " " + pt(t3));
      render();
    }
    render();
    return { now: now };
  }

  /* ---- Salon: ilk gün çantası ---- */
  var bag = $("[data-tool='canta']");
  if (bag) {
    var boxes = $$("input[type=checkbox]", bag), KEY = "sporumx-canta";
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "[]"); boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; }); } catch (e) { /* depolama yok */ }
    var cnt = $("[data-bag-count]", bag), bar = $("[data-bag-bar]", bag), msg = $("[data-bag-msg]", bag);
    var updBag = function () {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      cnt.innerHTML = '<span class="r">' + done + "</span>/" + boxes.length;
      bar.style.width = Math.round(done / boxes.length * 100) + "%";
      msg.textContent = done === boxes.length ? "Çanta hazır. Saat kaç olursa olsun, kapı açık." : (boxes.length - done) + " parça kaldı.";
      try { localStorage.setItem(KEY, JSON.stringify(boxes.map(function (b, i) { return b.checked ? i : -1; }).filter(function (i) { return i > -1; }))); } catch (e) { /* yok say */ }
    };
    bag.addEventListener("change", updBag);
    var rs = $("[data-bag-reset]", bag);
    if (rs) rs.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); updBag(); });
    updBag();
  }

  /* ---- Salon: ekipman sözlüğü araması ---- */
  var dictTool = $("[data-tool='sozluk']");
  if (dictTool) {
    var q = $("[data-dict-q]", dictTool), items = $$(".dict > div", dictTool), empty = $("[data-dict-empty]", dictTool);
    q.addEventListener("input", function () {
      var v = lowerTr(q.value.trim()), shown = 0;
      items.forEach(function (it) { var hit = !v || lowerTr(it.textContent).indexOf(v) > -1; it.hidden = !hit; if (hit) shown++; });
      empty.style.display = shown ? "none" : "block";
    });
  }

  /* ---- Programlar: hedef sekmeleri ---- */
  var planTool = $("[data-tool='hedef-plani']");
  if (planTool) {
    var plans = $$(".plan", planTool), tabs = $(".tabs", planTool);
    plans.forEach(function (pl, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.id = "tab-" + pl.id; b.setAttribute("aria-controls", pl.id);
      b.textContent = pl.getAttribute("data-label");
      pl.setAttribute("role", "tabpanel"); pl.setAttribute("aria-labelledby", b.id);
      b.addEventListener("click", function () { showPlan(i, true); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { showPlan((i + 1) % plans.length, true); e.preventDefault(); }
        if (e.key === "ArrowLeft") { showPlan((i - 1 + plans.length) % plans.length, true); e.preventDefault(); }
      });
      tabs.appendChild(b);
    });
    tabs.setAttribute("role", "tablist");
    tabs.hidden = false;
    var showPlan = function (idx, focus) {
      $$("button", tabs).forEach(function (b, j) { b.setAttribute("aria-selected", j === idx ? "true" : "false"); b.tabIndex = j === idx ? 0 : -1; if (j === idx && focus) b.focus(); });
      plans.forEach(function (pl, j) { pl.hidden = j !== idx; });
    };
    var start = 0;
    plans.forEach(function (pl, j) { if (location.hash === "#" + pl.id) start = j; });
    showPlan(start, false);
  }

  /* ---- Programlar: 1TM + plaka hesaplayıcı ---- */
  var kv = $("[data-tool='kuvvet']");
  if (kv) {
    var kgIn = $("[name=kg]", kv), repIn = $("[name=tekrar]", kv), barIn = $("[name=bar]", kv), tgtIn = $("[name=hedefkg]", kv);
    var rmOut = $("[data-rm]", kv), tbl = $("[data-pct]", kv), plSvg = $("[data-plates]", kv), plTxt = $("[data-plate-txt]", kv);
    var PCTS = [[50, "Isınma setleri"], [60, "Teknik çalışma, 12–15 tekrar"], [70, "Kas gelişimi, 10–12 tekrar"], [75, "Kas gelişimi, 8–10 tekrar"], [80, "Kuvvet, 6–8 tekrar"], [85, "Kuvvet, 4–6 tekrar"], [90, "Deneyimliler, 2–4 tekrar"]];
    var round25 = function (x) { return Math.round(x / 2.5) * 2.5; };
    var calcRM = function () {
      var w = parseFloat(String(kgIn.value).replace(",", ".")), r = parseInt(repIn.value, 10);
      if (!(w > 0) || !(r >= 1) || r > 12 || w > 500) { rmOut.innerHTML = "—"; tbl.innerHTML = '<tr><td colspan="3">Ağırlık (1–500 kg) ve tekrar (1–12) girin.</td></tr>'; return; }
      var rm = r === 1 ? w : w * (1 + r / 30);
      rmOut.innerHTML = fmt(Math.round(rm * 2) / 2) + "<small>kg</small>";
      tbl.innerHTML = "";
      PCTS.forEach(function (row) {
        var kg = round25(rm * row[0] / 100), tr = document.createElement("tr");
        tr.innerHTML = "<th>%" + row[0] + "</th><td>" + fmt(kg) + " kg</td><td>" + row[1] + "</td>";
        tbl.appendChild(tr);
      });
    };
    var PL = [[25, 40, 196, "#FF2D55"], [20, 36, 196, "#0A0A0A"], [15, 31, 196, "#333333"], [10, 26, 196, "#5E5E5E"], [5, 19, 118, "#8A8A8A"], [2.5, 14, 92, "#B5B5B5"], [1.25, 11, 74, "#D0D0D0"]];
    var drawPlates = function () {
      var bw = parseFloat(barIn.value), total = parseFloat(String(tgtIn.value).replace(",", "."));
      while (plSvg.firstChild) plSvg.removeChild(plSvg.firstChild);
      el("rect", { x: 0, y: 104, width: 150, height: 12, fill: "#9A9A9A" }, plSvg);
      el("rect", { x: 138, y: 86, width: 14, height: 48, fill: "#0A0A0A" }, plSvg);
      el("rect", { x: 152, y: 100, width: 440, height: 20, fill: "#BDBDBD", stroke: "#0A0A0A", "stroke-width": 2 }, plSvg);
      if (!(total > 0) || total > 600) { plTxt.innerHTML = "Toplam hedef ağırlığı girin (kg)."; return; }
      if (total < bw) { plTxt.innerHTML = "Hedef, barın kendi ağırlığından (" + fmt(bw) + " kg) az. Daha hafif bir bar ya da dambıl düşünün."; return; }
      var side = (total - bw) / 2, rest = side, used = [];
      PL.forEach(function (p) { while (rest >= p[0] - 1e-9) { used.push(p); rest = Math.round((rest - p[0]) * 100) / 100; } });
      var x = 154, cut = false;
      used.forEach(function (p, i) {
        if (cut || x + p[1] > 496) { cut = true; return; }
        el("rect", { x: x, y: 110 - p[2] / 2, width: p[1], height: p[2], fill: p[3], stroke: "#0A0A0A", "stroke-width": 2 }, plSvg);
        var big = p[2] > 150;
        var tx = el("text", { x: x + p[1] / 2, y: big ? 110 - p[2] / 2 - 8 : 110 + p[2] / 2 + 20 + (i % 2) * 18, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 17, "font-weight": 800, fill: "#0A0A0A" }, plSvg);
        tx.textContent = fmt(p[0]);
        x += p[1] + 3;
      });
      if (used.length && !cut) el("rect", { x: x + 2, y: 94, width: 16, height: 32, fill: "#0A0A0A" }, plSvg);
      var list = used.map(function (p) { return fmt(p[0]); }).join(" + ");
      var html = used.length ? "Her iki tarafa: <span class=\"r\">" + list + "</span> kg" : "Plakaya gerek yok: yalnız bar.";
      html += "<br>Toplam: " + fmt(bw + 2 * (side - rest)) + " kg = bar " + fmt(bw) + " + 2 × " + fmt(side - rest);
      if (rest > 0.001) html += "<br>Standart plakalarla " + fmt(rest * 2) + " kg eşleşmedi; en yakın yük gösterildi.";
      if (cut) html += "<br>Çizime sığmayan plakalar listede var.";
      plTxt.innerHTML = html;
    };
    kv.addEventListener("input", function (e) { if (e.target === tgtIn || e.target === barIn) drawPlates(); else calcRM(); });
    kv.addEventListener("change", function (e) { if (e.target === barIn) drawPlates(); });
    tbl.addEventListener("click", function () { /* tablo yalnız bilgi */ });
    $$("[data-load]", kv).forEach(function (b) {
      b.addEventListener("click", function () {
        var w = parseFloat(String(kgIn.value).replace(",", ".")), r = parseInt(repIn.value, 10);
        if (!(w > 0) || !(r >= 1)) return;
        var rm = r === 1 ? w : w * (1 + r / 30);
        tgtIn.value = round25(rm * (+b.getAttribute("data-load")) / 100);
        drawPlates();
      });
    });
    calcRM(); drawPlates();
  }

  /* ---- Programlar: enerji ihtiyacı (yaklaşık) ---- */
  var en = $("[data-tool='enerji']");
  if (en) {
    var enOut = $("[data-en-out]", en), enBmr = $("[data-en-bmr]", en), enPro = $("[data-en-pro]", en);
    var calcEn = function () {
      var sex = (checkedVals(en, "cinsiyet")[0]) || "kadın";
      var age = parseInt($("[name=yas]", en).value, 10), hgt = parseFloat($("[name=boy]", en).value), wgt = parseFloat(String($("[name=kilo]", en).value).replace(",", "."));
      var fac = parseFloat($("[name=aktivite]", en).value);
      if (!(age >= 15 && age <= 90) || !(hgt >= 120 && hgt <= 230) || !(wgt >= 35 && wgt <= 250)) {
        enOut.innerHTML = "—"; enBmr.textContent = "Yaş 15–90, boy 120–230 cm, kilo 35–250 kg aralığında olmalı."; enPro.textContent = ""; return;
      }
      var bmr = 10 * wgt + 6.25 * hgt - 5 * age + (sex === "erkek" ? 5 : -161);
      var tdee = Math.round(bmr * fac / 10) * 10;
      enOut.innerHTML = "≈ " + fmt(tdee) + "<small>kcal / gün</small>";
      enBmr.textContent = "Dinlenme hâlindeki tahmini harcama (BMR): yaklaşık " + fmt(Math.round(bmr / 10) * 10) + " kcal.";
      enPro.textContent = "Düzenli antrenman yapanlar için sık anılan protein aralığı (kg başına 1,4–2,0 g): yaklaşık " + Math.round(wgt * 1.4) + "–" + Math.round(wgt * 2) + " g / gün.";
    };
    en.addEventListener("input", calcEn);
    en.addEventListener("change", calcEn);
    calcEn();
  }

  /* ---- Üyelik: bilgi talebi ---- */
  var uy = $("[data-tool='uyelik']");
  if (uy) {
    bindMsgTool(uy, function () {
      var lines = ["Merhaba Sporumx, üyelik hakkında bilgi almak istiyorum."];
      var dur = checkedVals(uy, "sure")[0]; if (dur) lines.push("İlgilendiğim süre: " + dur);
      var saat = checkedVals(uy, "saat")[0]; if (saat) lines.push("Genelde geleceğim saatler: " + saat);
      var hedef = $("[name=hedef-uy]", uy).value; if (hedef) lines.push("Hedefim: " + hedef);
      var ek = checkedVals(uy, "ek"); if (ek.length) lines.push("Ayrıca: " + ek.join(", "));
      var sorular = checkedVals(uy, "soru");
      if (sorular.length) { lines.push("Sorularım:"); sorular.forEach(function (s) { lines.push("- " + s); }); }
      lines.push("Güncel paket ve fiyat bilgisini paylaşabilir misiniz?");
      var name = ($("[name=ad-uy]", uy).value || "").trim(); if (name) lines.push("Adım: " + name);
      return lines.join("\n");
    });
  }

  /* ---- İletişim: hızlı mesaj ---- */
  var hm = $("[data-tool='hizli-mesaj']");
  if (hm) {
    bindMsgTool(hm, function () {
      var v = checkedVals(hm, "konu")[0] || "Merhaba Sporumx, bilgi almak istiyorum.";
      var name = ($("[name=ad-hm]", hm).value || "").trim();
      return v + (name ? "\nAdım: " + name : "");
    });
  }
  $$("[data-copy-text]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b); }); });

  /* sayfa içi bağlantılarda yumuşak kaydırma (hareket azaltma tercihine uyar) */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1), tgt = id && document.getElementById(id);
      if (!tgt) return;
      e.preventDefault();
      tgt.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
      if (a.classList.contains("skip")) { tgt.setAttribute("tabindex", "-1"); tgt.focus({ preventScroll: true }); }
      if (top && top.hasAttribute("data-open")) { top.removeAttribute("data-open"); mbtn.setAttribute("aria-expanded", "false"); }
    });
  });

  /* tembel görselleri sayfa yüklendikten sonra sessizce önceden getir */
  window.addEventListener("load", function () {
    setTimeout(function () { $$("img[loading='lazy'], iframe[loading='lazy']").forEach(function (im) { im.loading = "eager"; }); }, 250);
  });

  tick();
})();
