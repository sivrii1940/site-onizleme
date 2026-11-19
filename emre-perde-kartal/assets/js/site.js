/* Emre Perde — Kartal | site betiği (bağımsız, kütüphanesiz) */
(function () {
  "use strict";

  var WA = "https://wa.me/905544940388";
  var TEL = "tel:+905544940388";
  var HOURS = { "0": [["08:00", "19:30"]], "1": [["08:00", "19:30"]], "2": [["08:00", "19:30"]], "3": [["08:00", "19:30"]], "4": [["08:00", "19:30"]], "5": [["08:00", "19:30"]] };

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

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(n, d) { return Number(n).toLocaleString("tr-TR", { maximumFractionDigits: d == null ? 1 : d }); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function copyText(text, out) {
    function ok() { if (out) out.textContent = "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz."; }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { if (out) out.textContent = "Kopyalanamadı; mesajı elle seçip kopyalayın."; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  /* ---- Canlı açık/kapalı ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var pill = el.closest(".pill"); if (pill) pill.classList.toggle("is-open", s.open);
    });
    $$("tr[data-day]").forEach(function (tr) { tr.classList.toggle("is-today", +tr.getAttribute("data-day") === s.dayIndex); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- Menü: perde gibi kapanır ---- */
  var menuBtn = $(".menu-btn"), nav = $("#site-nav");
  if (menuBtn && nav) {
    var closeBtn = $(".nav__close", nav);
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) { var f = $("a", nav); if (f) setTimeout(function () { f.focus(); }, reduce ? 0 : 320); }
      else menuBtn.focus();
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
    nav.addEventListener("click", function (e) { if (e.target === nav) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { if (nav.classList.contains("is-open")) { nav.classList.remove("is-open"); document.documentElement.style.overflow = ""; menuBtn.setAttribute("aria-expanded", "false"); } }); });
  }

  /* ---- Hero: perde açılıyor (tek sefer) ---- */
  var hero = $("[data-hero]");
  if (hero) {
    var cord = $("[data-drape-toggle]", hero);
    var setDrape = function (open) {
      hero.classList.toggle("is-open", open);
      if (cord) { cord.setAttribute("aria-pressed", open ? "false" : "true"); $(".cord__text", cord).textContent = open ? "Perdeyi kapat" : "Perdeyi aç"; }
    };
    if (reduce) setDrape(true);
    else requestAnimationFrame(function () { setTimeout(function () { setDrape(true); }, 260); });
    if (cord) cord.addEventListener("click", function () { setDrape(!hero.classList.contains("is-open")); });
  }

  /* ---- Perde türü deneyleri ---- */
  $$("[data-demo]").forEach(function (box) {
    var kind = box.getAttribute("data-demo");
    var demo = $(".demo", box), btn = $("[data-demo-btn]", box), out = $("output", box);
    if (kind === "stor") {
      var range = $("input[type=range]", box), layer = $(".demo__layer", box);
      var upd = function () { var v = +range.value; layer.style.setProperty("--roll", v + "%"); if (out) out.textContent = v < 8 ? "Stor tamamen yukarıda" : v > 92 ? "Stor tamamen inik" : "Stor yüzde " + v + " oranında inik"; };
      range.addEventListener("input", upd); upd();
      return;
    }
    if (!btn) return;
    var labels = { tul: ["Tülü topla", "Tülü çek"], fon: ["Fonu kapat", "Fonu aç"], zebra: ["Bantları kaydır: kapat", "Bantları kaydır: aç"] }[kind];
    var cls = kind === "tul" ? "is-off" : "is-on";
    var notes = {
      tul: ["Tül çekili: ışık yumuşuyor, dışarısı seçiliyor ama içerisi kolay görünmüyor.", "Tül toplandı: cam açıkta, ışık doğrudan giriyor."],
      fon: ["Fon açık: kenarlarda toplanmış, pencereyi çerçeveliyor.", "Fon kapalı: ışık büyük ölçüde kesildi, oda karardı."],
      zebra: ["Bantlar arası açık: tül bantlardan ışık süzülüyor.", "Bantlar üst üste: opak şeritler boşlukları kapattı."]
    }[kind];
    var paint = function () {
      var on = demo.classList.contains(cls);
      btn.textContent = labels[on ? 1 : 0];
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (out) out.textContent = notes[on ? 1 : 0];
    };
    btn.addEventListener("click", function () { demo.classList.toggle(cls); paint(); });
    paint();
  });

  /* ---- Rehber sekmeleri ---- */
  $$("[data-tabs]").forEach(function (wrap) {
    var tabs = $$("[role=tab]", wrap);
    var show = function (t) {
      tabs.forEach(function (x) {
        var sel = x === t; x.setAttribute("aria-selected", sel ? "true" : "false"); x.tabIndex = sel ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !sel;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); show(n); }
      });
    });
    if (tabs[0]) show(tabs[0]);
  });

  /* ---- Pile hesabı (olcu-al) ---- */
  var calc = $("[data-calc]");
  if (calc) {
    var cw = $("input[name=ray]", calc), cout = $("[data-calc-out]", calc);
    var cpaint = function () {
      var w = parseFloat(cw.value), r = parseFloat(($("input[name=oran]:checked", calc) || {}).value || 2.5);
      if (!(w > 0)) { cout.textContent = "Ray enini yazın."; return; }
      cout.textContent = fmt(w, 1) + " cm ray, 1:" + fmt(r, 1) + " pile ile kumaş eni yaklaşık " + fmt(w * r / 100, 2) + " m";
    };
    calc.addEventListener("input", cpaint); calc.addEventListener("change", cpaint); cpaint();
  }

  /* ---- SSS: arama ---- */
  var faqSearch = $("[data-faq-search]");
  if (faqSearch) {
    var items = $$(".faq details"), groups = $$(".faq-group"), empty = $("[data-faq-empty]"), cnt = $("[data-faq-count]");
    var norm = function (s) { return (s || "").toLocaleLowerCase("tr-TR"); };
    var run = function () {
      var q = norm(faqSearch.value.trim()), n = 0;
      items.forEach(function (d) {
        var hit = !q || norm(d.textContent).indexOf(q) > -1;
        d.hidden = !hit; if (hit) n++;
        if (q && hit) d.open = true;
      });
      groups.forEach(function (g) { g.hidden = !$$("details", g).some(function (d) { return !d.hidden; }); });
      if (empty) empty.hidden = n > 0;
      if (cnt) cnt.textContent = q ? n + " soru bulundu" : items.length + " soru";
    };
    faqSearch.addEventListener("input", run); run();
    var all = $("[data-faq-all]");
    if (all) all.addEventListener("click", function () {
      var open = all.getAttribute("aria-pressed") !== "true";
      items.forEach(function (d) { if (!d.hidden) d.open = open; });
      all.setAttribute("aria-pressed", open ? "true" : "false");
      all.textContent = open ? "Tümünü kapat" : "Tümünü aç";
    });
  }

  /* ---- Kopyala düğmeleri (genel) ---- */
  function bindCopy(root, getText) {
    var b = $("[data-copy]", root), o = $("[data-copy-ok]", root);
    if (b) b.addEventListener("click", function () { copyText(getText(), o); });
  }

  /* =========================================================
     İMZA ARACI: Pencere ölçü formu → teklif mesajı
     ========================================================= */
  var olcu = $("[data-tool=olcu]");
  if (olcu) (function () {
    var list = $("[data-rows]", olcu), tpl = document.getElementById("row-tpl"), addBtn = $("[data-add]", olcu);
    var drawG = $("[data-draw]", olcu), cap = $("[data-draw-cap]", olcu), est = $("[data-est]", olcu), msgEl = $("[data-msg]", olcu), waBtn = $("[data-wa]", olcu), warnEl = $("[data-warn]", olcu);
    var TIP = { tul: "Tül", fon: "Fon", tulfon: "Tül + fon", stor: "Stor", zebra: "Zebra", bilmiyorum: "Kararsızım, öneri istiyorum" };
    var MONTAJ = { duvar: "Duvara, pencerenin üstüne", tavan: "Tavana", kasa: "Pencere içine (kasaya)", bilmiyorum: "Henüz bilmiyorum" };
    var KORNIS = { var: "Var, mevcut olan kullanılacak", yok: "Yok, önerinizi istiyorum", degisecek: "Var ama değiştirmek istiyorum" };
    var uid = 0, active = null, MAX = 8;

    function num(v) { var n = parseFloat(String(v).replace(",", ".")); return isFinite(n) && n > 0 ? n : 0; }
    function rowData(row) {
      return {
        el: row,
        oda: $("select[name=oda]", row).value,
        en: num($("input[name=en]", row).value),
        boy: num($("input[name=boy]", row).value),
        tip: ($("input[type=radio]:checked", row) || {}).value || "tulfon",
        pile: parseFloat($("select[name=pile]", row).value) || 2.5,
        adet: Math.max(1, Math.min(20, parseInt($("input[name=adet]", row).value, 10) || 1))
      };
    }
    function renumber() {
      var rows = $$("[data-row]", list);
      rows.forEach(function (r, i) {
        $("legend", r).textContent = "Pencere " + (i + 1);
        $("[data-remove]", r).hidden = rows.length < 2;
      });
      addBtn.hidden = rows.length >= MAX;
    }
    function setActive(row) {
      active = row;
      $$("[data-row]", list).forEach(function (r) { r.classList.toggle("is-active", r === row); });
    }
    function syncRow(row) {
      var d = rowData(row);
      var pileBox = $(".win__pile", row), pileLbl = $(".win__pile > span", row), hint = $("[data-hint]", row);
      var fabric = d.tip === "tul" || d.tip === "fon" || d.tip === "tulfon";
      pileBox.hidden = !fabric;
      pileLbl.textContent = d.tip === "tulfon" ? "Tül pile sıklığı" : "Pile sıklığı";
      hint.textContent = fabric
        ? "Tül ve fonda en: ray ya da korniş uzunluğu; boy: perdenin asılacağı noktadan yere kadar."
        : d.tip === "bilmiyorum" ? "Pencere eni ve yüksekliğini yazmanız yeterli; uygun modeli birlikte seçelim."
        : "Stor ve zebrada en ve boy: perdenin kaplayacağı alan (kasa içiyse kasanın iç ölçüsü).";
    }
    function addRow(pre) {
      if ($$("[data-row]", list).length >= MAX) return null;
      uid++;
      var frag = tpl.content.cloneNode(true), row = $("[data-row]", frag);
      $$("input[type=radio]", row).forEach(function (r) { r.name = "tip-" + uid; });
      pre = pre || {};
      if (pre.oda) { var s = $("select[name=oda]", row); if ($$("option", s).some(function (o) { return o.value === pre.oda; })) s.value = pre.oda; }
      if (pre.en) $("input[name=en]", row).value = pre.en;
      if (pre.boy) $("input[name=boy]", row).value = pre.boy;
      if (pre.tip && TIP[pre.tip]) { var rr = $("input[type=radio][value='" + pre.tip + "']", row); if (rr) rr.checked = true; }
      list.appendChild(frag);
      row = list.lastElementChild;
      syncRow(row); renumber(); setActive(row);
      return row;
    }

    function svgDraw(d) {
      var montaj = (($("input[name=montaj]:checked", olcu) || {}).value) || "duvar";
      var W = 340, FLOOR = 284, out = [], placeholder = !(d.en && d.boy);
      var fabric = d.tip === "tul" || d.tip === "fon" || d.tip === "tulfon" || d.tip === "bilmiyorum";
      var en = d.en || (fabric ? 220 : 140), boy = d.boy || (fabric ? 250 : 150);
      var sc, w, h, x0, y0;
      function arrows(x0, y0, w, h, top) {
        var ay = top, ax = x0 + w + 16;
        out.push('<line x1="' + x0 + '" y1="' + ay + '" x2="' + (x0 + w) + '" y2="' + ay + '" stroke="#5E454A" stroke-width="1.3" marker-start="url(#ar)" marker-end="url(#ar)"/>');
        var t1 = "en " + fmt(en, 0) + " cm";
        out.push('<rect x="' + (x0 + w / 2 - 34) + '" y="' + (ay - 9) + '" width="68" height="18" rx="9" fill="#FBF8F4"/><text x="' + (x0 + w / 2) + '" y="' + (ay + 4) + '" text-anchor="middle" font-size="11.5" fill="#2C2A29" font-family="Alegreya Sans, sans-serif">' + t1 + '</text>');
        out.push('<line x1="' + ax + '" y1="' + y0 + '" x2="' + ax + '" y2="' + (y0 + h) + '" stroke="#5E454A" stroke-width="1.3" marker-start="url(#ar)" marker-end="url(#ar)"/>');
        var cy = y0 + h / 2;
        out.push('<g transform="rotate(-90 ' + ax + ' ' + cy + ')"><rect x="' + (ax - 36) + '" y="' + (cy - 9) + '" width="72" height="18" rx="9" fill="#FBF8F4"/><text x="' + ax + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="11.5" fill="#2C2A29" font-family="Alegreya Sans, sans-serif">boy ' + fmt(boy, 0) + ' cm</text></g>');
      }
      function windowGlyph(x, y, ww, hh) {
        out.push('<rect x="' + x + '" y="' + y + '" width="' + ww + '" height="' + hh + '" fill="#FCFAF6"/>');
        out.push('<rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="' + (ww - 10) + '" height="' + (hh - 10) + '" fill="url(#g-sky)"/>');
        out.push('<rect x="' + (x + ww / 2 - 2.5) + '" y="' + (y + 5) + '" width="5" height="' + (hh - 10) + '" fill="#FCFAF6"/>');
        out.push('<rect x="' + (x - 6) + '" y="' + (y + hh) + '" width="' + (ww + 12) + '" height="6" rx="1" fill="#F4EEE6" stroke="#D9CCBD" stroke-width=".8"/>');
      }
      out.push('<line x1="0" y1="' + FLOOR + '" x2="' + W + '" y2="' + FLOOR + '" stroke="#C9B9A6" stroke-width="2"/>');
      if (fabric) {
        sc = Math.min(222 / en, 222 / boy); w = en * sc; h = boy * sc; x0 = (W - 26 - w) / 2; y0 = FLOOR - h - 2;
        var wx = x0 + w * 0.14, ww = w * 0.72, wy = y0 + h * 0.1, wh = h * 0.56;
        windowGlyph(wx, wy, ww, wh);
        if (montaj === "tavan") {
          out.push('<line x1="0" y1="' + (y0 - 5) + '" x2="' + W + '" y2="' + (y0 - 5) + '" stroke="#BBA995" stroke-width="2"/>');
          out.push('<rect x="' + (x0 - 2) + '" y="' + (y0 - 5) + '" width="' + (w + 4) + '" height="4" fill="#9C8F86"/>');
        } else {
          out.push('<rect x="' + (x0 - 7) + '" y="' + (y0 - 6) + '" width="' + (w + 14) + '" height="4" rx="2" fill="#B8955A"/><circle cx="' + (x0 - 8) + '" cy="' + (y0 - 4) + '" r="4" fill="#C9A66B"/><circle cx="' + (x0 + w + 8) + '" cy="' + (y0 - 4) + '" r="4" fill="#C9A66B"/>');
        }
        if (d.tip === "tul" || d.tip === "tulfon") out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="url(#pt-tul)" opacity=".8"/>');
        if (d.tip === "fon" || d.tip === "tulfon") {
          var pw = w * (d.tip === "fon" ? 0.3 : 0.24);
          out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + pw + '" height="' + h + '" fill="url(#pt-fon)"/><rect x="' + (x0 + w - pw) + '" y="' + y0 + '" width="' + pw + '" height="' + h + '" fill="url(#pt-fon)"/>');
        }
        if (d.tip === "bilmiyorum") out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="none" stroke="#7A5C61" stroke-width="1.5" stroke-dasharray="5 4"/><text x="' + (x0 + w / 2) + '" y="' + (y0 + h * 0.82) + '" text-anchor="middle" font-size="13" fill="#5E454A" font-family="Alegreya, serif" font-style="italic">model birlikte seçilir</text>');
        arrows(x0, y0, w, h, y0 - 20);
      } else {
        sc = Math.min(214 / en, 186 / boy); w = en * sc; h = boy * sc; x0 = (W - 26 - w) / 2; y0 = 48 + (186 - h) / 2;
        var inside = montaj === "kasa";
        var bx = inside ? x0 + 5 : x0 - 7, bw = inside ? w - 10 : w + 14, by = inside ? y0 + 5 : y0 - 8, bh = inside ? h - 10 : h + 10;
        windowGlyph(x0, y0, w, h);
        out.push('<rect x="' + (bx - 2) + '" y="' + (by - 6) + '" width="' + (bw + 4) + '" height="7" rx="3" fill="#8F837B"/>');
        if (d.tip === "stor") {
          var sh = bh * 0.58;
          out.push('<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + sh + '" fill="url(#pt-stor)"/><rect x="' + bx + '" y="' + (by + sh - 4) + '" width="' + bw + '" height="5" fill="#6B5A4E"/>');
        } else {
          out.push('<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="url(#pt-zebra)"/>');
        }
        out.push('<line x1="' + (bx + bw - 6) + '" y1="' + by + '" x2="' + (bx + bw - 6) + '" y2="' + (by + bh * 0.8) + '" stroke="#8F837B" stroke-width="1.2" stroke-dasharray="1.5 2"/>');
        arrows(x0, y0, w, h, y0 - 24);
      }
      drawG.innerHTML = out.join("");
      cap.textContent = placeholder
        ? "Ölçü girilmedi: çizim örnek oranla gösteriliyor."
        : "Çizim, yazdığınız en/boy oranına göre ölçeklenir (" + (TIP[d.tip] || "") + ", " + (MONTAJ[montaj] || "").toLocaleLowerCase("tr-TR") + ").";
    }

    function build() {
      var rows = $$("[data-row]", list).map(rowData);
      var montaj = ($("input[name=montaj]:checked", olcu) || {}).value || "duvar";
      var kornis = ($("input[name=kornis]:checked", olcu) || {}).value || "";
      var istek = $$("input[name=istek]:checked", olcu).map(function (c) { return c.value; });
      var ad = $("input[name=ad]", olcu).value.trim(), semt = $("input[name=semt]", olcu).value.trim(), not = $("textarea[name=not]", olcu).value.trim();
      var lines = ["Merhaba Emre Perde, sitenizdeki ölçü formundan yazıyorum.", ""];
      var estHtml = [], totTul = 0, totFon = 0, totAlan = 0, totWin = 0, warns = [];
      rows.forEach(function (d, i) {
        var label = "Pencere " + (i + 1) + ": " + d.oda + (d.adet > 1 ? " (" + d.adet + " adet aynı ölçü)" : "");
        lines.push(label);
        lines.push(d.en && d.boy ? "• Ölçü: en " + fmt(d.en, 1) + " cm × boy " + fmt(d.boy, 1) + " cm" : "• Ölçü: henüz tam ölçmedim" + (d.en ? " (en " + fmt(d.en, 1) + " cm)" : d.boy ? " (boy " + fmt(d.boy, 1) + " cm)" : ""));
        lines.push("• Perde: " + TIP[d.tip]);
        totWin += d.adet;
        if ((d.en && (d.en < 20 || d.en > 1500)) || (d.boy && (d.boy < 20 || d.boy > 600))) warns.push("Pencere " + (i + 1) + " için ölçü olağan dışı görünüyor; santim (cm) yazdığınızdan emin olun.");
        var e = "";
        if (d.tip === "tul" || d.tip === "fon" || d.tip === "tulfon") {
          var pl = "1:" + fmt(d.pile, 1);
          if (d.en) {
            var m = d.en * d.pile / 100;
            if (d.tip === "fon") totFon += m * d.adet; else totTul += m * d.adet;
            lines.push("• Pile: " + pl + (d.tip === "tulfon" ? " (tül)" : ""));
            e = "<b>" + label + "</b><br>" + (d.tip === "fon" ? "Fon" : "Tül") + " için yaklaşık kumaş eni: " + fmt(m, 2) + " m (" + pl + ")";
            if (d.tip === "tulfon") { var f = d.en * 2 / 100; totFon += f * d.adet; e += "<br>Fon için yaklaşık: " + fmt(f, 2) + " m (1:2)"; }
            if (d.adet > 1) e += "<br>× " + d.adet + " pencere";
          } else e = "<b>" + label + "</b><br>Kumaş hesabı için eni yazın.";
        } else if (d.tip === "stor" || d.tip === "zebra") {
          if (d.en && d.boy) { var a = d.en * d.boy / 10000; totAlan += a * d.adet; e = "<b>" + label + "</b><br>" + TIP[d.tip] + " alanı: " + fmt(a, 2) + " m²" + (d.adet > 1 ? " × " + d.adet : ""); }
          else e = "<b>" + label + "</b><br>Alan hesabı için en ve boyu yazın.";
        } else e = "<b>" + label + "</b><br>Model seçilince kumaş hesabı burada görünür.";
        estHtml.push("<li>" + e + "</li>");
        lines.push("");
      });
      var tot = [totWin + " pencere"];
      if (totTul) tot.push("tül yaklaşık " + fmt(totTul, 1) + " m");
      if (totFon) tot.push("fon yaklaşık " + fmt(totFon, 1) + " m");
      if (totAlan) tot.push("stor/zebra yaklaşık " + fmt(totAlan, 2) + " m²");
      estHtml.push('<li class="est__total"><b>Toplam:</b> ' + tot.join(" · ") + "</li>");
      lines.push("Montaj yeri: " + MONTAJ[montaj]);
      if (kornis) lines.push("Korniş / ray: " + KORNIS[kornis]);
      if (istek.length) lines.push("İsteğim: " + istek.join(", "));
      if (semt) lines.push("Semt / mahalle: " + semt);
      if (ad) lines.push("Adım: " + ad);
      if (not) lines.push("Not: " + not);
      lines.push("");
      lines.push("Toplam " + totWin + " pencere. Kumaş seçenekleri ve teklif için bilgi rica ederim.");
      var msg = lines.join("\n");
      est.innerHTML = estHtml.join("");
      msgEl.textContent = msg;
      waBtn.href = waLink(msg);
      warnEl.textContent = warns.join(" ");
      if (active && list.contains(active)) svgDraw(rowData(active));
      return msg;
    }

    list.addEventListener("input", function (e) { var r = e.target.closest("[data-row]"); if (r) { syncRow(r); setActive(r); } build(); });
    list.addEventListener("change", function (e) { var r = e.target.closest("[data-row]"); if (r) { syncRow(r); setActive(r); } build(); });
    list.addEventListener("focusin", function (e) { var r = e.target.closest("[data-row]"); if (r && r !== active) { setActive(r); build(); } });
    list.addEventListener("click", function (e) {
      var st = e.target.closest("[data-step]");
      if (st) {
        var inp = $("input[name=adet]", st.closest(".stepper"));
        inp.value = Math.max(1, Math.min(20, (parseInt(inp.value, 10) || 1) + parseInt(st.getAttribute("data-step"), 10)));
        build(); return;
      }
      var rm = e.target.closest("[data-remove]");
      if (rm) {
        var row = rm.closest("[data-row]"), next = row.previousElementSibling || row.nextElementSibling;
        row.parentNode.removeChild(row); renumber(); if (next) { setActive(next); $("input[name=en]", next).focus(); } build();
      }
    });
    addBtn.addEventListener("click", function () {
      var prev = $$("[data-row]", list).pop(), pre = {};
      if (prev) { var d = rowData(prev); pre.tip = d.tip; }
      var r = addRow(pre); if (r) { build(); $("select[name=oda]", r).focus(); }
    });
    var form = $("[data-olcu-form]", olcu);
    form.addEventListener("input", build); form.addEventListener("change", build);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    bindCopy(olcu, build);

    /* Başka sayfadan gelen ön bilgi: ?en=&boy=&tip=&oda= */
    var q = new URLSearchParams(location.search), pre = {};
    ["en", "boy", "tip", "oda"].forEach(function (k) { var v = q.get(k); if (v) pre[k] = k === "en" || k === "boy" ? String(num(v) || "") : v; });
    addRow(pre);
    build();
    if (q.get("en") || q.get("tip")) { var note = $("[data-prefill]", olcu); if (note) note.hidden = false; }
  })();

  /* =========================================================
     Perde seçici (perdeler.html)
     ========================================================= */
  var sec = $("[data-tool=secici]");
  if (sec) (function () {
    var T = {
      tulfon: { ad: "Tül + fon", tip: "tulfon", why: "Gündüz tül ışığı süzer, akşam fon kapanınca oda kararır ve içerisi görünmez. Salon ve yatak odalarında yaygın bir ikilidir." },
      tul: { ad: "Tül", tip: "tul", why: "Gün ışığını içeri alır ama yumuşatır; gündüz dışarıdan bakışı azaltır, pencereyi hafif gösterir." },
      fon: { ad: "Fon perde", tip: "fon", why: "Kalın kumaşı ve dolgun pileleriyle odayı sıcak gösterir; kapatıldığında ışığı büyük ölçüde keser." },
      stor: { ad: "Stor perde", tip: "stor", why: "Yukarı sarılan düz kumaştır; az yer kaplar, pencere önünü boş bırakır ve tozu kolay alınır." },
      zebra: { ad: "Zebra perde", tip: "zebra", why: "Tül ve opak bantlar üst üste kayarak ışığı kademeli ayarlar; sade, modern bir görünüm verir." },
      karartma: { ad: "Karartma (blackout) kumaş", tip: "stor", why: "Işığı büyük ölçüde keser; gündüz uyuyanlar, çocuk odası ve ekranlı odalar için düşünülür. Stor ya da fon olarak kullanılabilir; seçenekleri mağazaya sorun." }
    };
    var ROOM = {
      salon: ["Salon", "Geniş salon pencerelerinde ray ya da korniş, pencereden biraz taşacak kadar uzun tutulursa perde açıkken camı daha az kapatır."],
      yatak: ["Yatak odası", "Sabah ışığı uykunuzu bölüyorsa ikinci katman olarak karartma özellikli bir kumaş düşünebilirsiniz."],
      cocuk: ["Çocuk odası", "Stor ve zebra zincirlerinin ya da iplerinin çocuğun ulaşamayacağı yükseklikte toplanması önerilir."],
      mutfak: ["Mutfak", "Ocağa yakın pencerede uzun, uçuşan kumaş yerine kısa ve kolay silinen modeller daha pratiktir."],
      calisma: ["Çalışma odası", "Ekrana vuran güneşi azaltmak için ışığı kademeli ayarlayan modeller işinizi kolaylaştırır."]
    };
    var out = $("[data-secici-out]", sec);
    var ORDER = ["tulfon", "zebra", "stor", "tul", "fon", "karartma"];
    function paint() {
      var oda = ($("input[name=s-oda]:checked", sec) || {}).value || "salon";
      var isik = ($("input[name=s-isik]:checked", sec) || {}).value || "yumusasin";
      var onc = ($("input[name=s-onc]:checked", sec) || {}).value || "dolgun";
      var s = { tul: 0, fon: 0, tulfon: 0, stor: 0, zebra: 0, karartma: 0 };
      var add = function (o) { for (var k in o) s[k] += o[k]; };
      add({ dolsun: { tul: 3, zebra: 2, stor: 1 }, yumusasin: { tul: 2, tulfon: 2, zebra: 2, stor: 1 }, kesilsin: { karartma: 3, tulfon: 2, fon: 2 } }[isik]);
      add({ salon: { tulfon: 2, tul: 1, fon: 1 }, yatak: { tulfon: 2, karartma: 2 }, cocuk: { stor: 2, karartma: 1, zebra: 1 }, mutfak: { stor: 2, zebra: 2, tul: 1 }, calisma: { zebra: 2, stor: 2 } }[oda]);
      add({ temizlik: { stor: 2, zebra: 2, tul: 1 }, dolgun: { tulfon: 3, fon: 2 }, sade: { stor: 2, zebra: 2 } }[onc]);
      var ranked = ORDER.slice().sort(function (a, b) { return s[b] - s[a] || ORDER.indexOf(a) - ORDER.indexOf(b); });
      var a = T[ranked[0]], b = T[ranked[1]], room = ROOM[oda];
      var waMsg = "Merhaba Emre Perde, sitenizdeki perde seçiciye göre " + room[0].toLocaleLowerCase("tr-TR") + " için " + a.ad.toLocaleLowerCase("tr-TR") + " düşünüyorum. Kumaş seçenekleri hakkında bilgi alabilir miyim?";
      out.innerHTML =
        "<h3>Önerimiz: " + a.ad + "</h3><p>" + a.why + "</p>" +
        "<p><b>İkinci seçenek:</b> " + b.ad + ". " + b.why + "</p>" +
        '<p class="muted"><b>' + room[0] + " için not:</b> " + room[1] + "</p>" +
        '<div class="btn-row"><a class="btn btn--solid" href="olcu-al.html?tip=' + a.tip + "&amp;oda=" + encodeURIComponent(room[0]) + '">Bu seçimle ölçü ver</a>' +
        '<a class="btn" target="_blank" rel="noopener" href="' + waLink(waMsg).replace(/&/g, "&amp;") + '">WhatsApp\'tan sor</a></div>';
    }
    sec.addEventListener("change", paint); paint();
  })();

  /* =========================================================
     Mağaza ziyareti planlayıcı (iletisim.html)
     ========================================================= */
  var ziy = $("[data-tool=ziyaret]");
  if (ziy) (function () {
    var msgEl = $("[data-msg]", ziy), wa = $("[data-wa]", ziy);
    function build() {
      var gun = ($("input[name=gun]:checked", ziy) || {}).value || "";
      var saat = ($("input[name=saat]:checked", ziy) || {}).value || "";
      var amac = $$("input[name=amac]:checked", ziy).map(function (c) { return c.value; });
      var ad = $("input[name=z-ad]", ziy).value.trim();
      var m = "Merhaba Emre Perde, " + (gun ? gun + " günü " : "bu hafta ") + (saat ? saat + " arasında " : "") + "Atalar'daki mağazanıza uğramak istiyorum.";
      if (amac.length) m += "\nAmacım: " + amac.join(", ") + ".";
      if (ad) m += "\nAdım: " + ad;
      m += "\nUygun olur mu?";
      msgEl.textContent = m; wa.href = waLink(m);
      return m;
    }
    ziy.addEventListener("change", build); ziy.addEventListener("input", build);
    bindCopy(ziy, build);
    var today = istanbulNow().d, names = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    var pick = today <= 5 ? names[today] : names[0];
    var r = $("input[name=gun][value='" + pick + "']", ziy); if (r) r.checked = true;
    build();
  })();
})();
