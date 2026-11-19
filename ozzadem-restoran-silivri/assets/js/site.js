/* Özzadem Restoran — site.js (kendi kendine yeter; kütüphane yok) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var HOURS = { "0": [["09:00", "00:00"]], "1": [["09:00", "00:00"]], "2": [["09:00", "00:00"]], "3": [["09:00", "00:00"]], "4": [["09:00", "00:00"]], "5": [["09:00", "00:00"]], "6": [["09:00", "00:00"]] };
  var WA = "https://wa.me/905536935286";
  var BRAND = "Özzadem Restoran";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---- kit/status.js (kopya) ---- */
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
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var AY_K = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var GUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  var GUN_K = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  function todayISO() {
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return o.year + "-" + o.month + "-" + o.day;
    } catch (e) { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  }
  function isoDate(iso) { var a = iso.split("-"); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2], 12)); }
  function addDays(iso, n) { var d = isoDate(iso); d.setUTCDate(d.getUTCDate() + n); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function trDate(iso) { if (!iso) return ""; var d = isoDate(iso); return d.getUTCDate() + " " + AYLAR[d.getUTCMonth()] + " " + GUN[d.getUTCDay()]; }
  function slots() { var out = []; for (var m = 9 * 60; m <= 23 * 60; m += 30) out.push(pad(Math.floor(m / 60)) + ":" + pad(m % 60)); return out; }
  function toMin(t) { var a = t.split(":"); return +a[0] * 60 + +a[1]; }

  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", old);
      btn.textContent = ok ? "Kopyalandı" : "Kopyalanamadı, elle seçin";
      setTimeout(function () { btn.textContent = old; }, 1900);
    }
    function legacy() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    else legacy();
  }
  function Composer(root) {
    var pv = $("[data-preview]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root), cur = "";
    on(cp, "click", function () { copyText(cur, cp); });
    return function (msg) {
      cur = msg;
      if (pv) pv.textContent = msg;
      if (wa) wa.setAttribute("href", WA + "?text=" + encodeURIComponent(msg));
    };
  }
  function val(root, sel) { var el = $(sel, root); return el ? String(el.value || "").trim() : ""; }
  function radioVal(root, name) { var el = $('input[name="' + name + '"]:checked', root); return el ? el.value : ""; }
  function checkedVals(root, name) { return $$('input[name="' + name + '"]:checked', root).map(function (x) { return x.value; }); }
  function param(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }

  /* ---- canlı durum + bugünün satırı ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-hours] [data-day]").forEach(function (row) { row.classList.toggle("is-today", Number(row.getAttribute("data-day")) === s.dayIndex); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- gezinme ---- */
  var nb = $(".navbtn");
  if (nb) {
    on(nb, "click", function () {
      var open = nb.getAttribute("aria-expanded") === "true";
      nb.setAttribute("aria-expanded", String(!open));
      document.body.classList.toggle("nav-open", !open);
    });
    on(document, "keydown", function (e) { if (e.key === "Escape" && nb.getAttribute("aria-expanded") === "true") { nb.click(); nb.focus(); } });
  }

  /* =====================================================================
     SOFRA — kişi sayısına göre büyüyen, üstten görünen aile masası (SVG)
     ===================================================================== */
  var NS = "http://www.w3.org/2000/svg";
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var CHAIR = '<rect x="-21" y="10" width="44" height="40" rx="9" fill="rgba(0,0,0,.24)"/><rect x="-20" y="6" width="40" height="34" rx="8" fill="#B5651D"/><rect x="-15" y="10" width="30" height="21" rx="6" fill="#C97B35"/><rect x="-23" y="37" width="46" height="11" rx="5" fill="#8F4A14"/><rect x="-19" y="39" width="38" height="3" rx="1.5" fill="#B86D2C"/>';
  var SETTING = '<circle cy="-32" r="19" fill="#FBF8F1" stroke="#E1D6BE" stroke-width="1.5"/><circle cy="-32" r="12.5" fill="none" stroke="#2D4A3E" stroke-width="1.3" stroke-dasharray="2 2.6"/><path d="M-30 -47v9M-27 -47v9M-24 -47v9M-30 -38q3 4 6 0M-27 -36v21" stroke="#DADDD5" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M27 -48c4 5 4 13 0 17v17" stroke="#DADDD5" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="17" cy="-54" r="5.5" fill="rgba(255,255,255,.3)" stroke="rgba(255,255,255,.8)" stroke-width="1.2"/>';
  var SEAM = '<path d="M0 -75V75" stroke="#3E2412" stroke-width="2" opacity=".55"/>';
  var DISH = {
    pot: '<rect x="-29" y="-6" width="11" height="12" rx="4" fill="#8F4A14"/><rect x="18" y="-6" width="11" height="12" rx="4" fill="#8F4A14"/><circle r="22" fill="#8F4A14"/><circle r="18" fill="#C9792F"/><path d="M-12 -9a15 15 0 0 1 11 -5" stroke="#F0B57A" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle r="4.5" fill="#8F4A14"/><circle cx="-1" cy="-1" r="1.6" fill="#E6AE72"/>',
    bread: '<ellipse rx="25" ry="15.5" fill="#9C6E3C"/><ellipse rx="21" ry="12" fill="#C99A5F"/><path d="M-21 0h42M0 -12v24" stroke="#A9793F" stroke-width="1" opacity=".6"/><ellipse cx="-7" cy="-1" rx="9.5" ry="6.5" fill="#E7B873"/><ellipse cx="8" cy="1.5" rx="8.5" ry="6" fill="#DBA862"/><path d="M-12 -3l6 3M3 -1l6 3" stroke="#B9813F" stroke-width="1.4" stroke-linecap="round"/>',
    salad: '<circle r="21" fill="#FBF8F1" stroke="#D8CBAE" stroke-width="1.5"/><circle r="16" fill="#5E8C3A"/><path d="M-10 6c4 -3 8 -2 10 1M2 -10c3 2 7 2 9 0M-12 -4c3 -2 6 -1 7 1" stroke="#A8CB7A" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-5" cy="-4" r="4" fill="#C7361E"/><circle cx="6" cy="4" r="3.6" fill="#C7361E"/><circle cx="5" cy="-7" r="2.4" fill="#F2EBD3"/><circle cx="-6" cy="8" r="2" fill="#F2EBD3"/>',
    meze: '<circle cx="-12" cy="-6" r="10.5" fill="#FBF8F1" stroke="#D8CBAE"/><circle cx="-12" cy="-6" r="6.8" fill="#C2442A"/><circle cx="12" cy="-7" r="10.5" fill="#FBF8F1" stroke="#D8CBAE"/><circle cx="12" cy="-7" r="6.8" fill="#F1ECDD"/><path d="M9 -8l2 2M14 -9l1 2" stroke="#4E7A33" stroke-width="1.4" stroke-linecap="round"/><circle cx="0" cy="11" r="10.5" fill="#FBF8F1" stroke="#D8CBAE"/><circle cx="0" cy="11" r="6.8" fill="#D9B27A"/><circle cx="0" cy="11" r="1.8" fill="#9E2B14"/>',
    ayran: '<circle r="18" fill="#B5651D"/><circle r="18" fill="none" stroke="#8F4A14" stroke-width="1.5"/><circle r="13.5" fill="#F6F3EC"/><circle cx="-4" cy="-3" r="2.2" fill="#fff"/><circle cx="4" cy="2" r="1.7" fill="#fff"/><circle cx="1" cy="-7" r="1.3" fill="#fff"/><circle cx="-5" cy="5" r="1.2" fill="#fff"/>',
    tea: '<circle cx="-13" r="10" fill="#FBF8F1" stroke="#D8CBAE"/><circle cx="-13" r="6" fill="#8E2B12"/><circle cx="13" r="10" fill="#FBF8F1" stroke="#D8CBAE"/><circle cx="13" r="6" fill="#8E2B12"/><circle cx="-14.5" cy="-1.5" r="1.5" fill="#E79A72"/><circle cx="11.5" cy="-1.5" r="1.5" fill="#E79A72"/>'
  };
  var DISH_ORDER = ["pot", "bread", "salad", "meze", "ayran", "tea"];

  function Sofra(svg, o) {
    o = o || {};
    var SEAT = 78, D = 150, PAD = 30, PER = o.per || 16, RATIO = o.ratio || 1.6, MINW = o.minw || 380, PITCH = D + 150, lastN = 0;
    var id = "sf" + (Sofra.n = (Sofra.n || 0) + 1);
    var defs = mk("defs", {}, svg);
    defs.innerHTML = '<pattern id="' + id + 'w" patternUnits="userSpaceOnUse" width="240" height="26"><rect width="240" height="26" fill="#7A4B2A"/><rect y="12.5" width="240" height="13.5" fill="#80502D"/><rect y="25" width="240" height="1.2" fill="#5A3519"/><rect y="12" width="240" height=".8" fill="#5E381E" opacity=".6"/><path d="M0 6c40 -3 80 4 120 0s80 -4 120 1" stroke="#6A3F22" fill="none" stroke-width="1.1" opacity=".75"/><path d="M0 19c30 2 70 -3 120 1s90 2 120 -2" stroke="#93613A" fill="none" stroke-width="1" opacity=".8"/></pattern>';
    var world = mk("g", {}, svg);
    var tables = [], vb = { x: -MINW / 2, y: -MINW / RATIO / 2, w: MINW, h: MINW / RATIO }, raf = 0, first = true;
    svg.setAttribute("viewBox", [vb.x, vb.y, vb.w, vb.h].join(" "));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    function makeTable() {
      var g = mk("g", { "class": "sf-tbl" }, world), t = { g: g, items: {}, L: SEAT + PAD * 2, cx: 0, cy: 0 };
      t.chairs = mk("g", {}, g);
      t.shadow = mk("rect", { rx: 12, fill: "rgba(0,0,0,.3)", height: D }, g);
      t.top = mk("rect", { rx: 10, fill: "url(#" + id + "w)", height: D }, g);
      t.seams = mk("g", {}, g);
      t.edge = mk("rect", { rx: 10, fill: "none", stroke: "#4A2B16", "stroke-width": 2.2, height: D }, g);
      t.runner = mk("rect", { y: -21, height: 42, fill: "#F1E7D2", rx: 2 }, g);
      t.stitch = mk("rect", { y: -16.5, height: 33, fill: "none", stroke: "#2D4A3E", "stroke-width": 1.3, "stroke-dasharray": "4 3", opacity: ".55" }, g);
      t.dishes = mk("g", {}, g);
      t.sets = mk("g", {}, g);
      return t;
    }
    function geom(t, L, cx, cy) {
      t.L = L; t.cx = cx; t.cy = cy;
      t.g.setAttribute("transform", "translate(" + cx.toFixed(2) + " " + cy.toFixed(2) + ")");
      t.shadow.setAttribute("x", -L / 2 + 5); t.shadow.setAttribute("y", -D / 2 + 9); t.shadow.setAttribute("width", L);
      [t.top, t.edge].forEach(function (r) { r.setAttribute("x", -L / 2); r.setAttribute("y", -D / 2); r.setAttribute("width", L); });
      t.runner.setAttribute("x", -L / 2 + 12); t.runner.setAttribute("width", Math.max(0, L - 24));
      t.stitch.setAttribute("x", -L / 2 + 17); t.stitch.setAttribute("width", Math.max(0, L - 34));
    }
    function place(t, key, layer, art, x, y, rot, cls, delay) {
      var it = t.items[key], tf = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) rotate(" + rot + "deg)";
      if (!it) {
        var outer = mk("g", { "class": "sf-pos" }, layer);
        outer.style.transform = tf;
        var inner = mk("g", { "class": cls }, outer);
        inner.innerHTML = art;
        if (delay) inner.style.animationDelay = delay + "ms";
        it = t.items[key] = { el: outer, inner: inner };
      } else {
        it.el.style.transform = tf;
        if (it.gone) { clearTimeout(it.gone); it.gone = 0; it.inner.classList.remove("is-out"); }
      }
      it.seen = true;
    }
    function sweep(t) {
      Object.keys(t.items).forEach(function (k) {
        var it = t.items[k];
        if (it.seen || it.gone) return;
        it.inner.style.animationDelay = "0ms";
        it.inner.classList.add("is-out");
        it.gone = setTimeout(function () { if (it.el.parentNode) it.el.parentNode.removeChild(it.el); delete t.items[k]; }, reduce ? 0 : 320);
      });
    }
    function plan(n) {
      var rowsN = Math.max(1, Math.ceil(n / PER)), base = Math.floor(n / rowsN), extra = n % rowsN, list = [], r;
      for (r = 0; r < rowsN; r++) {
        var c = base + (r < extra ? 1 : 0), heads = Math.min(2, Math.max(0, c - 2)), sides = c - heads;
        var bot = Math.ceil(sides / 2), top = Math.floor(sides / 2), cols = Math.max(1, bot);
        list.push({ c: c, heads: heads, bot: bot, top: top, cols: cols, L: cols * SEAT + PAD * 2 });
      }
      var gc = rowsN >= 3 ? 2 : 1, gr = Math.ceil(rowsN / gc);
      var maxL = Math.max.apply(null, list.map(function (t) { return t.L; }));
      var colW = maxL + 180;
      list.forEach(function (t, i) {
        var c = i % gc, rr = Math.floor(i / gc), inRow = (rr === gr - 1 && rowsN % gc) ? rowsN % gc : gc;
        t.cx = (c - (inRow - 1) / 2) * colW; t.cy = (rr - (gr - 1) / 2) * PITCH;
      });
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      list.forEach(function (t) {
        var ex = t.heads ? 62 : 34;
        minX = Math.min(minX, t.cx - t.L / 2 - ex); maxX = Math.max(maxX, t.cx + t.L / 2 + ex);
        minY = Math.min(minY, t.cy - D / 2 - 56); maxY = Math.max(maxY, t.cy + D / 2 + 56);
      });
      var w = maxX - minX + 36, h = maxY - minY + 36, R = RATIO;
      if (o.fit) { R = Math.max(o.fitMin || 1.15, Math.min(o.fitMax || 2.2, w / h)); svg.parentNode.style.aspectRatio = R.toFixed(3); }
      else if (svg.clientWidth > 0 && svg.clientHeight > 0) R = svg.clientWidth / svg.clientHeight;
      if (w < MINW) w = MINW;
      if (w / h < R) w = h * R; else h = w / R;
      var cxm = (minX + maxX) / 2, cym = (minY + maxY) / 2;
      return { list: list, vb: { x: cxm - w / 2, y: cym - h / 2, w: w, h: h } };
    }
    function populate(t, s, r, stagger) {
      Object.keys(t.items).forEach(function (k) { t.items[k].seen = false; });
      var x0 = -s.L / 2 + PAD, i, x, q = 0;
      function d() { return stagger ? (q++) * 45 : 0; }
      for (i = 0; i < s.cols; i++) {
        x = x0 + SEAT * (i + 0.5);
        if (i < s.bot) { var db = d(); place(t, "cb" + i, t.chairs, CHAIR, x, D / 2, 0, "sf-chair", db); place(t, "sb" + i, t.sets, SETTING, x, D / 2, 0, "sf-pop", db + 120); }
        if (i < s.top) { var dt = d(); place(t, "ct" + i, t.chairs, CHAIR, x, -D / 2, 180, "sf-chair", dt); place(t, "st" + i, t.sets, SETTING, x, -D / 2, 180, "sf-pop", dt + 120); }
        place(t, "d" + i, t.dishes, DISH[DISH_ORDER[(i + r * 2) % DISH_ORDER.length]], x, 0, 0, "sf-pop", stagger ? 380 + i * 60 : 140);
      }
      if (s.heads >= 1) { var dh = d(); place(t, "chr", t.chairs, CHAIR, s.L / 2, 0, -90, "sf-chair", dh); place(t, "shr", t.sets, SETTING, s.L / 2, 0, -90, "sf-pop", dh + 120); }
      if (s.heads >= 2) { var dl = d(); place(t, "chl", t.chairs, CHAIR, -s.L / 2, 0, 90, "sf-chair", dl); place(t, "shl", t.sets, SETTING, -s.L / 2, 0, 90, "sf-pop", dl + 120); }
      for (i = 1; i * 2 < s.cols; i++) place(t, "m" + i, t.seams, SEAM, x0 + SEAT * 2 * i, 0, 0, "sf-fade", 0);
      sweep(t);
    }
    function set(n, instant) {
      lastN = n;
      var p = plan(n), i;
      while (tables.length < p.list.length) { var nt = makeTable(); nt.fresh = true; tables.push(nt); }
      var extra = tables.splice(p.list.length);
      extra.forEach(function (t) {
        t.g.classList.add("sf-new", "is-out");
        setTimeout(function () { if (t.g.parentNode) t.g.parentNode.removeChild(t.g); }, reduce ? 0 : 320);
      });
      var from = [], to = [];
      p.list.forEach(function (s, r) {
        var t = tables[r];
        if (t.fresh) { geom(t, s.L, s.cx, s.cy); if (!first) t.g.classList.add("sf-new"); t.fresh = false; }
        populate(t, s, r, first);
        from.push({ L: t.L, cx: t.cx, cy: t.cy }); to.push(s);
      });
      var v0 = { x: vb.x, y: vb.y, w: vb.w, h: vb.h }, v1 = p.vb, dur = (reduce || first || instant) ? 0 : 520, t0 = 0;
      first = false;
      cancelAnimationFrame(raf);
      function frame(ts) {
        if (!t0) t0 = ts;
        var k = dur ? Math.min(1, (ts - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
        for (i = 0; i < to.length; i++) {
          geom(tables[i], from[i].L + (to[i].L - from[i].L) * e, from[i].cx + (to[i].cx - from[i].cx) * e, from[i].cy + (to[i].cy - from[i].cy) * e);
        }
        vb = { x: v0.x + (v1.x - v0.x) * e, y: v0.y + (v1.y - v0.y) * e, w: v0.w + (v1.w - v0.w) * e, h: v0.h + (v1.h - v0.h) * e };
        svg.setAttribute("viewBox", [vb.x.toFixed(1), vb.y.toFixed(1), vb.w.toFixed(1), vb.h.toFixed(1)].join(" "));
        if (k < 1) raf = requestAnimationFrame(frame);
      }
      if (dur) raf = requestAnimationFrame(frame); else frame(1);
      return { tables: p.list.length, heads: p.list.reduce(function (a, s) { return a + s.heads; }, 0) };
    }
    var rt = 0;
    on(window, "resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (lastN) set(lastN, true); }, 150); });
    return { set: set };
  }

  /* Kişi sayısı denetimi (−/+ ve hızlı seçim) + masa */
  function seatText(n, info) {
    if (info.tables > 1) return info.tables + " uzun masa yan yana, toplam " + n + " sandalye";
    if (info.heads === 0) return "Karşılıklı " + n + " sandalye";
    return "Masa başlarında " + info.heads + ", yanlarda " + (n - info.heads) + " sandalye";
  }
  function People(root, opts, onChange) {
    var min = opts.min || 2, max = opts.max || 30, n = opts.start || 6;
    var svg = $("[data-sofra]", root), table = svg ? Sofra(svg, opts) : null;
    function set(v) {
      n = Math.max(min, Math.min(max, Math.round(v) || min));
      $$("[data-count]", root).forEach(function (el) { el.textContent = n; });
      $$("[data-count-out]", root).forEach(function (el) { el.textContent = n + " kişi"; });
      $$("[data-n]", root).forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-n")) === n)); });
      $$('[data-step="-1"]', root).forEach(function (b) { b.disabled = n <= min; });
      $$('[data-step="1"]', root).forEach(function (b) { b.disabled = n >= max; });
      if (table) {
        var info = table.set(n);
        svg.setAttribute("aria-label", "Üstten görünen sofra: " + n + " kişi, " + info.tables + " masa");
        $$("[data-desc]", root).forEach(function (el) { el.textContent = seatText(n, info); });
      }
      if (onChange) onChange(n);
    }
    $$("[data-step]", root).forEach(function (b) { on(b, "click", function () { set(n + Number(b.getAttribute("data-step"))); }); });
    $$("[data-n]", root).forEach(function (b) { on(b, "click", function () { set(Number(b.getAttribute("data-n"))); }); });
    set(n);
    return { get: function () { return n; }, set: set };
  }
  function fillTimes(sel) {
    if (!sel || sel.options.length > 1) return;
    slots().forEach(function (t) { var op = document.createElement("option"); op.value = t; op.textContent = t; sel.appendChild(op); });
  }

  /* =========================== ANA SAYFA: hızlı masa talebi =========================== */
  var hizli = $('[data-tool="sofra-hizli"]');
  if (hizli) {
    var sendH = Composer(hizli), dateH = $("[name=tarih]", hizli), timeH = $("[name=saat]", hizli), hintH = $("[data-org-hint]", hizli);
    fillTimes(timeH);
    if (dateH) { dateH.min = todayISO(); dateH.max = addDays(todayISO(), 180); if (!dateH.value) dateH.value = todayISO(); }
    var ppl;
    var buildH = function () {
      if (!ppl) return;
      var n = ppl.get(), v = radioVal(hizli, "vesile") || "Aile yemeği", ad = val(hizli, "[name=ad]"), t = val(hizli, "[name=saat]");
      var lines = ["Merhaba " + BRAND + ",", n + " kişilik bir masa ayırtmak istiyorum."];
      lines.push("• Tarih: " + (dateH && dateH.value ? trDate(dateH.value) : "henüz belli değil"));
      lines.push("• Saat: " + (t || "size uygun bir saat"));
      lines.push("• Vesile: " + v);
      if (ad) lines.push("• İsim: " + ad);
      lines.push("", "Uygun olup olmadığını bildirebilir misiniz? Teşekkürler.");
      sendH(lines.join("\n"));
      if (hintH) {
        var big = n >= 12 || /Doğum|Toplu|Nişan/.test(v);
        hintH.hidden = !big;
        var a = $("a", hintH);
        if (a) a.setAttribute("href", "organizasyon.html?kisi=" + n + "&vesile=" + encodeURIComponent(v) + "#planla");
      }
    };
    ppl = People(hizli, { min: 2, max: 30, start: Number(param("kisi")) || 6, per: 16 }, buildH);
    $$("input, select, textarea", hizli).forEach(function (el) { on(el, "input", buildH); on(el, "change", buildH); });
    buildH();
  }

  /* =========================== REZERVASYON =========================== */
  var rez = $('[data-tool="masa-talebi"]');
  if (rez) {
    var sendR = Composer(rez), daysBox = $("[data-days]", rez), timesBox = $("[data-times]", rez);
    var today = todayISO(), selDay = today, selTime = "", pplR;
    var nowMin = function () { return istanbulNow().m; };
    var renderTimes = function () {
      timesBox.innerHTML = "";
      var groups = [["Sabah", 540, 690], ["Öğle", 720, 930], ["Akşam", 960, 1230], ["Gece", 1260, 1380]];
      var cut = selDay === today ? nowMin() + 30 : -1, firstFree = "";
      groups.forEach(function (g) {
        var wrap = document.createElement("div"); wrap.className = "times__grp";
        var lab = document.createElement("span"); lab.textContent = g[0]; wrap.appendChild(lab);
        var row = document.createElement("div"); row.className = "chips";
        slots().forEach(function (t) {
          var m = toMin(t); if (m < g[1] || m > g[2]) return;
          var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = t;
          b.disabled = m < cut;
          if (!b.disabled && !firstFree) firstFree = t;
          b.setAttribute("aria-pressed", String(t === selTime));
          on(b, "click", function () { selTime = t; renderTimes(); buildR(); });
          row.appendChild(b);
        });
        wrap.appendChild(row); timesBox.appendChild(wrap);
      });
      if (selTime && selDay === today && toMin(selTime) < cut) { selTime = ""; renderTimes(); }
      return firstFree;
    };
    var renderDays = function () {
      daysBox.innerHTML = "";
      for (var i = 0; i < 14; i++) {
        (function (iso, i) {
          var d = isoDate(iso), b = document.createElement("button");
          b.type = "button"; b.className = "day";
          b.innerHTML = "<b>" + (i === 0 ? "Bugün" : i === 1 ? "Yarın" : GUN_K[d.getUTCDay()]) + "</b><small>" + d.getUTCDate() + " " + AY_K[d.getUTCMonth()] + "</small>";
          b.setAttribute("aria-pressed", String(iso === selDay));
          b.setAttribute("aria-label", trDate(iso));
          if (i === 0 && nowMin() + 30 > 23 * 60) b.disabled = true;
          on(b, "click", function () { selDay = iso; renderDays(); renderTimes(); buildR(); });
          daysBox.appendChild(b);
        })(addDays(today, i), i);
      }
    };
    var buildR = function () {
      if (!pplR) return;
      var n = pplR.get(), kids = val(rez, "[name=cocuk]"), ad = val(rez, "[name=ad]"), note = val(rez, "[name=not]"), v = radioVal(rez, "vesile");
      var lines = ["Merhaba " + BRAND + ",", "Masa ayırtmak istiyorum:", "• Tarih: " + trDate(selDay), "• Saat: " + (selTime || "henüz seçmedim, uygun saatleri öğrenebilir miyim?"), "• Kişi sayısı: " + n + (kids && kids !== "0" ? " (" + kids + " çocuk dahil)" : "")];
      if (v) lines.push("• Vesile: " + v);
      if (ad) lines.push("• İsim: " + ad);
      if (note) lines.push("• Not: " + note);
      lines.push("", "Uygun olup olmadığını bildirebilir misiniz? Teşekkürler.");
      sendR(lines.join("\n"));
      $$("[data-sum-day]", rez).forEach(function (el) { el.textContent = trDate(selDay); });
      $$("[data-sum-time]", rez).forEach(function (el) { el.textContent = selTime || "saat seçilmedi"; });
    };
    if (nowMin() + 30 > 23 * 60) selDay = addDays(today, 1);
    renderDays(); renderTimes();
    pplR = People(rez, { min: 2, max: 30, start: Number(param("kisi")) || 4, per: 16 }, buildR);
    $$("input, select, textarea", rez).forEach(function (el) { on(el, "input", buildR); on(el, "change", buildR); });
    buildR();
  }

  /* =========================== ORGANİZASYON =========================== */
  var org = $('[data-tool="organizasyon"]');
  if (org) {
    var sendO = Composer(org), adultsEl = $("[data-adults]", org), kidsEl = $("[data-kids]", org), dateO = $("[name=tarih]", org);
    var adults = 14, kids = 0, tableO = Sofra($("[data-sofra]", org), { per: 16, fit: true, fitMin: 1.15, fitMax: 2.1 }), MAXO = 60;
    if (dateO) { dateO.min = todayISO(); dateO.max = addDays(todayISO(), 365); }
    var pk = Number(param("kisi")); if (pk) adults = Math.max(2, Math.min(MAXO, pk));
    var pv = param("vesile");
    if (pv) $$('input[name="vesile"]', org).forEach(function (r) { if (r.value === pv) r.checked = true; });
    var buildO = function () {
      var total = adults + kids;
      if (adultsEl) adultsEl.textContent = adults;
      if (kidsEl) kidsEl.textContent = kids;
      $$("[data-count]", org).forEach(function (el) { el.textContent = total; });
      $$("[data-n]", org).forEach(function (x) { x.setAttribute("aria-pressed", String(Number(x.getAttribute("data-n")) === total)); });
      var info = tableO.set(Math.max(2, total));
      $$("[data-desc]", org).forEach(function (el) { el.textContent = seatText(total, info); });
      $$('[data-step-a="-1"]', org).forEach(function (b) { b.disabled = adults <= 1; });
      $$('[data-step-a="1"]', org).forEach(function (b) { b.disabled = total >= MAXO; });
      $$('[data-step-k="-1"]', org).forEach(function (b) { b.disabled = kids <= 0; });
      $$('[data-step-k="1"]', org).forEach(function (b) { b.disabled = total >= MAXO; });
      var v = radioVal(org, "vesile") || "Toplu yemek", ogun = radioVal(org, "ogun"), menu = checkedVals(org, "menu"), q = checkedVals(org, "soru");
      var ad = val(org, "[name=ad]"), note = val(org, "[name=not]");
      var lines = ["Merhaba " + BRAND + ",", "Bir organizasyon için bilgi almak istiyorum.", "• Vesile: " + v, "• Kişi sayısı: yaklaşık " + total + (kids ? " (" + adults + " yetişkin, " + kids + " çocuk)" : "")];
      lines.push("• Tarih: " + (dateO && dateO.value ? trDate(dateO.value) : "henüz kesin değil") + (ogun ? ", " + ogun : ""));
      if (menu.length) lines.push("• İlgilendiğimiz yemekler: " + menu.join(", "));
      if (q.length) { lines.push("• Sorularım:"); q.forEach(function (x) { lines.push("   – " + x); }); }
      if (ad) lines.push("• İsim: " + ad);
      if (note) lines.push("• Not: " + note);
      lines.push("", "Uygunluk ve seçenekler hakkında bilgi verebilir misiniz? Teşekkürler.");
      sendO(lines.join("\n"));
    };
    $$("[data-step-a]", org).forEach(function (b) { on(b, "click", function () { adults = Math.max(1, Math.min(MAXO - kids, adults + Number(b.getAttribute("data-step-a")))); buildO(); }); });
    $$("[data-step-k]", org).forEach(function (b) { on(b, "click", function () { kids = Math.max(0, Math.min(MAXO - adults, kids + Number(b.getAttribute("data-step-k")))); buildO(); }); });
    $$("[data-n]", org).forEach(function (b) { on(b, "click", function () { var want = Number(b.getAttribute("data-n")); if (kids >= want) kids = 0; adults = Math.max(1, want - kids); buildO(); }); });
    $$("input, select, textarea", org).forEach(function (el) { on(el, "input", buildO); on(el, "change", buildO); });
    buildO();
  }

  /* Kontrol listesi (organizasyon) */
  var cl = $("[data-checklist]");
  if (cl) {
    var KEY = "ozzadem-kontrol", saved = {};
    try { saved = JSON.parse(store(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    var boxes = $$("input[type=checkbox]", cl), bar = $("[data-progress] i"), txt = $("[data-progress-text]");
    var paint = function () {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      if (bar) bar.style.width = (100 * done / boxes.length) + "%";
      if (txt) txt.textContent = done + " / " + boxes.length + " madde hazır";
    };
    boxes.forEach(function (b, i) {
      if (saved[i]) b.checked = true;
      on(b, "change", function () { saved[i] = b.checked; store(KEY, JSON.stringify(saved)); paint(); });
    });
    on($("[data-checklist-reset]"), "click", function () { boxes.forEach(function (b) { b.checked = false; }); saved = {}; store(KEY, "{}"); paint(); });
    paint();
  }

  /* =========================== MENÜ: sofra listesi =========================== */
  var mt = $('[data-tool="sofra-listesi"]');
  if (mt) {
    var sendM = Composer(mt), listEl = $("[data-slist]", mt), chip = $("[data-listchip]"), chipN = chip ? $("b", chip) : null, picks = [];
    var findPick = function (name) { for (var i = 0; i < picks.length; i++) if (picks[i].name === name) return i; return -1; };
    var buildM = function () {
      $$("[data-add]", mt).forEach(function (b) { b.setAttribute("aria-pressed", String(findPick(b.getAttribute("data-add")) > -1)); });
      listEl.innerHTML = "";
      if (!picks.length) { var e = document.createElement("li"); e.className = "slist__empty"; e.textContent = "Henüz bir şey eklemediniz. Menüdeki “Sor” düğmeleriyle listeyi doldurun."; listEl.appendChild(e); }
      picks.forEach(function (p, i) {
        var li = document.createElement("li");
        li.innerHTML = '<span></span><span class="qty"><button type="button" aria-label="Azalt">−</button><output></output><button type="button" aria-label="Artır">+</button></span>';
        li.firstChild.textContent = p.name; $("output", li).textContent = p.q;
        var bs = $$("button", li);
        on(bs[0], "click", function () { p.q--; if (p.q < 1) picks.splice(i, 1); buildM(); });
        on(bs[1], "click", function () { p.q = Math.min(20, p.q + 1); buildM(); });
        listEl.appendChild(li);
      });
      if (chip) { chip.hidden = !picks.length; if (chipN) chipN.textContent = picks.length; }
      var n = val(mt, "[name=kisi]"), how = radioVal(mt, "nasil");
      var lines = ["Merhaba " + BRAND + ",", "Menünüzle ilgili bilgi almak istiyorum."];
      if (picks.length) { lines.push("Sormak istediklerim:"); picks.forEach(function (p) { lines.push("• " + p.name + (p.q > 1 ? " × " + p.q : "")); }); }
      else lines.push("Bugün hangi yemekleriniz var?");
      if (n) lines.push("Kişi sayımız: " + n);
      if (how) lines.push(how);
      lines.push("", "Bugün hangileri var, fiyat bilgisi verebilir misiniz? Teşekkürler.");
      sendM(lines.join("\n"));
    };
    $$("[data-add]", mt).forEach(function (b) {
      on(b, "click", function () {
        var name = b.getAttribute("data-add"), i = findPick(name);
        if (i > -1) picks.splice(i, 1); else picks.push({ name: name, q: 1 });
        buildM();
      });
    });
    $$("input, select", mt).forEach(function (el) { on(el, "input", buildM); on(el, "change", buildM); });
    buildM();
  }

  /* Menü masa şeridi: bulunduğunuz bölümü işaretle */
  var tn = $("[data-tablenav]");
  if (tn && "IntersectionObserver" in window) {
    var links = $$("a", tn), list = $("ul", tn), current = null;
    var mark = function (idv) {
      if (idv === current) return; current = idv;
      links.forEach(function (a) {
        var act = a.getAttribute("href") === "#" + idv;
        if (act) { a.setAttribute("aria-current", "true"); list.scrollTo({ left: a.parentNode.offsetLeft - list.clientWidth / 2 + a.parentNode.clientWidth / 2, behavior: reduce ? "auto" : "smooth" }); }
        else a.removeAttribute("aria-current");
      });
    };
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) mark(en.target.id); });
    }, { rootMargin: "-35% 0px -60% 0px" });
    links.forEach(function (a) { var s = document.getElementById(a.getAttribute("href").slice(1)); if (s) io.observe(s); });
  }

  /* =========================== TATLI PUSULASI =========================== */
  var tp = $('[data-tool="tatli-pusulasi"]');
  if (tp) {
    var sendT = Composer(tp), resEl = $("[data-results]", tp);
    var T = [
      ["Künefe", "sicak", "serbetli", "doyurucu", "Tel kadayıf arasında tuzsuz peynir; sıcak servis edilir, üstüne çoğu yerde fıstık serpilir."],
      ["Baklava", "oda", "serbetli", "doyurucu", "İnce yufka katları, ceviz ya da fıstık, şerbet. Paylaşmalık tabağa uygundur."],
      ["Tel kadayıf", "oda", "serbetli", "doyurucu", "Tel kadayıf, cevizli ya da fıstıklı iç, şerbet. Çıtır dokulu."],
      ["Şekerpare", "oda", "serbetli", "orta", "İrmikli yumuşak kurabiye hamuru, şerbetle. Ev tatlısı tadında."],
      ["Revani", "oda", "serbetli", "hafif", "İrmikli, süngerimsi kek; şerbeti hafiftir. Şerbetlilerin en yumuşağı."],
      ["Fırın sütlaç", "soguk", "sutlu", "hafif", "Pirinçli sütlü tatlı; üstü fırında kızartılır. Soğuk yenir."],
      ["Kazandibi", "soguk", "sutlu", "hafif", "Tabanı tavada yakılarak karamelleşen muhallebi; rulo hâlinde servis edilir."],
      ["Tavuk göğsü", "soguk", "sutlu", "hafif", "Saray mutfağından: didiklenmiş tavuk göğsü eti muhallebiye katılır, tadı duyulmaz."],
      ["Keşkül", "soguk", "sutlu", "hafif", "Bademli ya da hindistancevizli sütlü tatlı; üstü fıstıkla süslenir."],
      ["Trileçe", "soguk", "sutlu", "orta", "Üç çeşit sütle ıslatılmış kek, üstte karamel. Balkan kökenli bir tatlı."],
      ["Supangle", "soguk", "cikolatali", "orta", "Kakaolu puding; çoğu zaman altında kek parçalarıyla gelir."],
      ["Sufle", "sicak", "cikolatali", "doyurucu", "Dışı kek, içi akışkan sıcak çikolata. Kaşığı daldırınca akar."],
      ["Çikolatalı pasta dilimi", "soguk", "cikolatali", "doyurucu", "Kat kat kek ve krema; kutlama sofralarının bilinen tatlısı."],
      ["Profiterol", "soguk", "cikolatali", "orta", "Kremalı küçük hamur topları, üstünde çikolata sosu."],
      ["Kabak tatlısı", "soguk", "meyveli", "hafif", "Şekerle pişen bal kabağı, üstünde ceviz ve çoğu zaman tahin. Sonbahar ve kış tatlısı."],
      ["Ayva tatlısı", "soguk", "meyveli", "orta", "Fırında pişen ayva; yanında kaymak sık görülür. Mevsimi sonbahar ve kıştır."],
      ["Dondurma", "soguk", "sutlu", "hafif", "Tek başına ya da sıcak tatlının yanında; sıcak-soğuk uyumu sevilir."]
    ];
    var ICON = { serbetli: "#t-dessert", sutlu: "#t-sutlu", cikolatali: "#t-cake", meyveli: "#t-kabak" };
    var buildT = function () {
      var temp = radioVal(tp, "sicaklik"), type = radioVal(tp, "tur"), feel = radioVal(tp, "his");
      var scored = T.map(function (d) {
        var s = 0;
        if (temp && temp !== "farketmez") { if (temp === "sicak" ? d[1] === "sicak" : d[1] !== "sicak") s += 3; else s -= 4; }
        if (type && type !== "farketmez") { if (d[2] === type) s += 4; else s -= 5; }
        if (feel && feel !== "farketmez") { if (d[3] === feel || d[3] === "orta") s += d[3] === feel ? 2 : 1; else s -= 1; }
        return { d: d, s: s };
      }).filter(function (x) { return x.s > 0 || (x.s === 0 && !(temp && temp !== "farketmez") && !(type && type !== "farketmez")); }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4);
      resEl.innerHTML = "";
      if (!scored.length) { var li0 = document.createElement("li"); li0.innerHTML = "<span></span>"; li0.firstChild.textContent = "Bu seçimlere tam uyan klasik bir tatlı bulamadık; seçimlerden birini “Farketmez” yapın ya da günün tatlılarını sorun."; li0.style.gridTemplateColumns = "1fr"; resEl.appendChild(li0); }
      scored.forEach(function (x) {
        var li = document.createElement("li");
        li.innerHTML = '<svg aria-hidden="true"><use href="' + (ICON[x.d[2]] || "#t-dessert") + '"/></svg><div><b></b><span></span></div>';
        $("b", li).textContent = x.d[0]; $("span", li).textContent = x.d[4];
        resEl.appendChild(li);
      });
      var names = scored.map(function (x) { return x.d[0]; });
      var lines = ["Merhaba " + BRAND + ",", "Bugün tatlılardan hangileri var?"];
      if (names.length) lines.push("Özellikle şunları soruyorum: " + names.join(", ") + ".");
      lines.push("Paket olarak alabilir miyim, fiyat bilgisi verebilir misiniz? Teşekkürler.");
      sendT(lines.join("\n"));
    };
    $$("input", tp).forEach(function (el) { on(el, "change", buildT); });
    buildT();
  }

  /* =========================== İLETİŞİM: hızlı soru =========================== */
  var hs = $('[data-tool="hizli-soru"]');
  if (hs) {
    var sendS = Composer(hs);
    var buildS = function () {
      var q = radioVal(hs, "soru") || "Bugün saat kaça kadar açıksınız?", ad = val(hs, "[name=ad]");
      sendS(["Merhaba " + BRAND + ",", q].concat(ad ? ["", "İsim: " + ad] : []).concat(["", "Teşekkürler."]).join("\n"));
    };
    $$("input", hs).forEach(function (el) { on(el, "change", buildS); on(el, "input", buildS); });
    buildS();
  }
})();
