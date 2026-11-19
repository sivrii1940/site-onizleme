/* Pet Kuaför Beyaz — site betiği (kendi kendine yeter, dış bağımlılık yok) */
(function () {
  "use strict";

  var HOURS = { "0": [["10:00", "18:30"]], "1": [["10:00", "18:30"]], "2": [["10:00", "18:30"]], "3": [["10:00", "18:30"]], "4": [["10:00", "18:30"]], "5": [["10:00", "18:30"]] };
  var WA = "https://wa.me/905531976262";
  var BRAND = "Pet Kuaför Beyaz";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- açık/kapalı (kit/status.js'ten kopya) ---- */
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
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", parseInt(el.getAttribute("data-day"), 10) === s.dayIndex); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- üst çubuk + menü ---- */
  var top = $(".top");
  if (top) {
    var onScroll = function () { top.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  var nb = $("[data-nav-btn]"), nav = $("#menu");
  if (nb && nav) {
    var setNav = function (open) {
      nb.setAttribute("aria-expanded", String(open));
      nb.querySelector(".navbtn__t").textContent = open ? "Kapat" : "Menü";
      document.body.classList.toggle("nav-open", open);
    };
    nb.addEventListener("click", function () { setNav(nb.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setNav(false); nb.focus(); } });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 980) setNav(false); });
  }

  /* ---- sabit iletişim: ana sayfada hero geçilince belirir (hero'da aynı düğmeler var) ---- */
  var dock = $(".dock");
  if (dock && $("[data-hero]")) {
    var dockCheck = function () { dock.classList.toggle("is-tucked", window.scrollY < 380); };
    window.addEventListener("scroll", dockCheck, { passive: true }); dockCheck();
  }

  /* ---- ortak: baloncuk efektleri ---- */
  function puff(layer, x, y, size) {
    if (reduce || !layer) return;
    if (layer.childElementCount > 26) layer.removeChild(layer.firstChild);
    var b = document.createElement("i");
    var s = size || (6 + Math.random() * 14);
    b.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + s + "px;height:" + s + "px;--dx:" + Math.round(Math.random() * 40 - 20) + "px";
    layer.appendChild(b);
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 1750);
  }
  function burst(host, el) {
    if (reduce || !host || !el) return;
    var hr = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    var cx = r.left - hr.left + r.width / 2, cy = r.top - hr.top + r.height / 2, rad = r.width / 2;
    for (var i = 0; i < 8; i++) {
      var a = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      var d = document.createElement("span");
      d.className = "drop";
      d.style.cssText = "left:" + (cx + Math.cos(a) * rad * 0.9) + "px;top:" + (cy + Math.sin(a) * rad * 0.9) + "px;--dx:" + Math.round(Math.cos(a) * 26) + "px;--dy:" + Math.round(Math.sin(a) * 26) + "px";
      host.appendChild(d);
      (function (n) { setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 720); })(d);
    }
  }

  var NAMES = { banyo: "Banyo ve tarama", tiras: "Tıraş / model kesim", tirnak: "Tırnak kesimi", kulak: "Kulak ve göz çevresi temizliği", tuy: "Tüy açma", urun: "Ürün sorusu" };
  var SHORT = { banyo: "Banyo", tiras: "Tıraş", tirnak: "Tırnak", kulak: "Kulak ve göz", tuy: "Tüy açma", urun: "Ürün" };

  /* ---- ana sayfa: baloncuk rozetler + iz ---- */
  var stage = $("[data-stage]");
  if (stage) {
    var hero = $("[data-hero]") || stage;
    var fx = $(".fx", hero);
    var picked = [];
    var trayList = $("[data-tray-list]"), trayLink = $("[data-tray-link]");
    var renderTray = function () {
      if (trayList) trayList.innerHTML = picked.length ? "Seçiminiz: <span>" + picked.map(function (k) { return SHORT[k]; }).join(" · ") + "</span>" : "Henüz seçim yok";
      if (trayLink) trayLink.setAttribute("href", "randevu.html" + (picked.length ? "?islem=" + picked.join(",") : ""));
    };
    $$("[data-pick]", stage).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-pick"), on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", String(on));
        var sm = b.querySelector("small"); if (sm) sm.textContent = on ? "eklendi" : "ekle";
        if (on) { if (picked.indexOf(k) < 0) picked.push(k); burst(stage, b); } else { picked = picked.filter(function (x) { return x !== k; }); }
        renderTray();
      });
    });
    renderTray();
    if (fx && !reduce) {
      var last = 0;
      hero.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var t = Date.now(); if (t - last < 85) return; last = t;
        var r = hero.getBoundingClientRect();
        puff(fx, e.clientX - r.left, e.clientY - r.top);
      });
      stage.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse") return;
        var r = hero.getBoundingClientRect();
        for (var i = 0; i < 4; i++) puff(fx, e.clientX - r.left + (Math.random() * 40 - 20), e.clientY - r.top + (Math.random() * 30 - 15));
      });
    }
  }

  /* ---- bakımlar: tüy tipi seçici ---- */
  $$("[data-coat]").forEach(function (root) {
    var tabs = $$("[role=tab]", root), panels = $$("[role=tabpanel]", root);
    if (!tabs.length) return;
    root.classList.add("is-live");
    var sel = function (i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute("aria-selected", String(j === i));
        t.tabIndex = j === i ? 0 : -1;
        if (panels[j]) panels[j].hidden = j !== i;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); sel((i + 1) % tabs.length, true); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); sel((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    sel(0);
  });

  /* ---- kopyalama ---- */
  function copyText(text, btn, label) {
    var done = function () { btn.textContent = "Kopyalandı"; setTimeout(function () { btn.textContent = label; }, 1900); };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Kopyalanamadı"; }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  /* ---- randevu: bakım planı ---- */
  var P = $("[data-planner]");
  if (P) {
    var form = $("form", P);
    var TUR = { kopek: "Köpek", kedi: "Kedi" };
    var BOY = { kucuk: "Küçük ırk", orta: "Orta ırk", buyuk: "Büyük ırk" };
    var SCALE = { kucuk: 0.66, orta: 0.84, buyuk: 1.02 };
    var TUY = { kisa: "Kısa ve düz", cift: "Çift kat (yoğun alt tüy)", uzun: "Uzun ve ipeksi", kivircik: "Kıvırcık, sürekli uzayan", sert: "Sert (telsi)", bilmiyorum: "Emin değilim" };
    var KECE = { yok: "Keçe yok, tüyler açık", az: "Birkaç yerde keçe var", cok: "Yaygın keçe var", bilmiyorum: "Emin değilim" };
    var SAAT = { sabah: "Öğleden önce (10:00–12:00)", ogle: "Öğle saatleri (12:00–15:00)", ikindi: "Öğleden sonra (15:00–18:30)", farketmez: "Fark etmez" };
    var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    var MSHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

    /* takvim: bu haftanın pazartesisinden başlayan 3 hafta; Pazar sütunu kapalı */
    var cal = $("[data-cal]", P), calMsg = $("[data-cal-msg]", P), calMonth = $("[data-cal-month]", P);
    var now = istanbulNow();
    var todayUTC;
    try {
      var parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var pp = {}; parts.forEach(function (x) { pp[x.type] = x.value; });
      todayUTC = Date.UTC(+pp.year, +pp.month - 1, +pp.day);
    } catch (e) { var dn = new Date(); todayUTC = Date.UTC(dn.getFullYear(), dn.getMonth(), dn.getDate()); }
    var monday = todayUTC - now.d * 86400000;
    var dayInfo = {};
    if (cal) {
      var months = [];
      for (var i = 0; i < 21; i++) {
        var t = monday + i * 86400000, dt = new Date(t), wd = i % 7;
        var dnum = dt.getUTCDate(), mon = dt.getUTCMonth();
        if (months.indexOf(mon) < 0 && i >= now.d) months.push(mon);
        var past = i < now.d, today = i === now.d, sun = wd === 6, late = today && now.m >= 18 * 60 + 30;
        var lab = document.createElement("label");
        lab.className = "day" + (past ? " is-past" : "") + (sun ? " is-sun" : "") + (today ? " is-today" : "");
        var inp = document.createElement("input");
        inp.type = "radio"; inp.name = "gun"; inp.value = "d" + i;
        var small = sun ? "kapalı" : today ? (late ? "kapandı" : "bugün") : MSHORT[mon];
        if (past || sun || late) inp.disabled = true;
        var full = dnum + " " + MONTHS[mon] + " " + DAYS[wd];
        inp.setAttribute("aria-label", full + (sun ? ", Pazar kapalı" : past ? ", geçti" : late ? ", bugün için kapanış saati geçti" : ""));
        dayInfo["d" + i] = { text: full, today: today, tomorrow: i === now.d + 1 };
        var sp = document.createElement("span");
        sp.innerHTML = dnum + "<small>" + small + "</small>";
        lab.appendChild(inp); lab.appendChild(sp);
        if (sun) lab.addEventListener("click", function () { if (calMsg) calMsg.textContent = "Pazar günleri kapalıyız; Pazartesi'den Cumartesi'ye 10:00–18:30 arası açığız."; });
        cal.appendChild(lab);
      }
      if (calMonth) calMonth.textContent = months.map(function (m) { return MONTHS[m]; }).join(" – ");
    }

    var url = null;
    try { url = new URLSearchParams(location.search); } catch (e) { url = null; }
    if (url) {
      (url.get("islem") || "").split(",").forEach(function (k) {
        var box = form.querySelector('input[name="islem"][value="' + k.replace(/[^a-z]/g, "") + '"]');
        if (box) box.checked = true;
      });
      var tq = url.get("tur");
      if (tq && TUR[tq]) { var tr = form.querySelector('input[name="tur"][value="' + tq + '"]'); if (tr) tr.checked = true; }
    }

    var val = function (n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ""; };
    var msgEl = $("[data-msg]", P), waBtn = $("[data-wa]", P), copyBtn = $("[data-copy]", P), hint = $("[data-hint]", P);
    var tub = $("[data-tub]", P), pet = $("[data-pet] use", P), chips = $("[data-chips]", P), countEl = $("[data-count]", P);
    var current = "";

    var compose = function () {
      var tur = val("tur"), boy = val("boy"), tuy = val("tuy"), kece = val("kece"), gun = val("gun"), saat = val("saat");
      var ad = (form.elements.ad.value || "").trim(), not = (form.elements.not.value || "").trim(), sahip = (form.elements.sahip.value || "").trim();
      var islem = $$('input[name="islem"]:checked', form).map(function (x) { return x.value; });
      var isCat = tur === "kedi";
      P.classList.toggle("is-cat", isCat);
      var L = ["Merhaba " + BRAND + ", bakım randevusu almak istiyorum.", ""];
      L.push("Dostum: " + (tur ? TUR[tur] : "belirtmedim") + (ad ? " (adı: " + ad + ")" : ""));
      if (!isCat) L.push("Boyu: " + (boy ? BOY[boy] : "belirtmedim"));
      L.push("Tüy tipi: " + (tuy ? TUY[tuy] : "belirtmedim"));
      if (kece) L.push("Tüy durumu: " + KECE[kece]);
      L.push("İstediğim bakımlar: " + (islem.length ? islem.map(function (k) { return NAMES[k]; }).join(", ") : "henüz seçmedim"));
      var gt = "en yakın uygun gün";
      if (gun && dayInfo[gun]) gt = dayInfo[gun].text + (dayInfo[gun].today ? " (bugün)" : dayInfo[gun].tomorrow ? " (yarın)" : "");
      L.push("Tercih ettiğim gün: " + gt);
      L.push("Saat tercihim: " + (saat ? SAAT[saat] : "fark etmez"));
      if (not) L.push("Not: " + not);
      L.push("");
      L.push("Uygun saat ve yaklaşık süre için bilgi verebilir misiniz?");
      if (sahip) L.push("Teşekkürler, " + sahip);
      current = L.join("\n");
      if (msgEl) msgEl.textContent = current;

      var ready = !!tur && islem.length > 0;
      if (waBtn) {
        waBtn.setAttribute("href", WA + "?text=" + encodeURIComponent(current));
        waBtn.classList.toggle("is-off", !ready);
        if (ready) waBtn.removeAttribute("aria-disabled"); else waBtn.setAttribute("aria-disabled", "true");
      }
      if (hint) hint.textContent = ready ? "Mesajınız hazır. WhatsApp'ta açıp gönder'e siz basın." : !tur ? "Önce dostunuzun türünü seçin." : "En az bir bakım seçin.";

      if (tub) {
        tub.style.setProperty("--scale", isCat ? 0.84 : (SCALE[boy] || 0.84));
        tub.style.setProperty("--lvl", Math.min(islem.length, 6) / 6);
      }
      if (pet) pet.setAttribute("href", isCat ? "#pet-cat" : "#pet-dog");
      if (countEl) countEl.textContent = islem.length ? islem.length + " bakım seçildi" : "köpük bekliyor";
      if (chips) {
        var have = $$("li[data-k]", chips).map(function (li) { return li.getAttribute("data-k"); });
        if (have.join() !== islem.join()) {
          chips.innerHTML = "";
          if (!islem.length) { var e0 = document.createElement("li"); e0.className = "empty"; e0.textContent = "Bakım seçince burada belirir"; chips.appendChild(e0); }
          islem.forEach(function (k) { var li = document.createElement("li"); li.setAttribute("data-k", k); li.textContent = SHORT[k]; chips.appendChild(li); });
        }
      }
    };
    form.addEventListener("input", compose);
    form.addEventListener("change", compose);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    if (waBtn) waBtn.addEventListener("click", function (e) {
      if (waBtn.classList.contains("is-off")) { e.preventDefault(); if (hint) { hint.textContent = !val("tur") ? "Önce dostunuzun türünü seçin." : "En az bir bakım seçin."; } }
    });
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(current, copyBtn, "Mesajı kopyala"); });
    var dockPlan = $('.dock a[href="randevu.html"]');
    if (dockPlan) { dockPlan.setAttribute("href", "#onizleme"); dockPlan.lastChild.textContent = "Önizle"; }
    compose();
  }

  /* ---- hazırlık: kontrol listesi ---- */
  var C = $("[data-check]");
  if (C) {
    var boxes = $$("input[type=checkbox]", C), KEY = "pkb-hazirlik";
    var jars = $$("[data-tub]", C), cnt = $("[data-check-count]", C), mini = $("[data-check-mini]", C), doneEl = $("[data-check-done]", C), reset = $("[data-check-reset]", C);
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; });
    } catch (e) { /* depolama kapalı olabilir */ }
    var upd = function () {
      var on = [];
      boxes.forEach(function (b, i) { if (b.checked) on.push(i); });
      jars.forEach(function (j) { j.style.setProperty("--lvl", on.length / boxes.length); });
      if (mini) mini.textContent = on.length === boxes.length ? "Hepsi tamam" : on.length + " / " + boxes.length + " hazır";
      if (cnt) cnt.textContent = on.length + " / " + boxes.length + " hazır";
      if (doneEl) doneEl.textContent = on.length === boxes.length ? "Hepsi tamam, hazırsınız." : on.length ? "Güzel gidiyor." : "";
      try { localStorage.setItem(KEY, JSON.stringify(on)); } catch (e) { /* yok say */ }
    };
    boxes.forEach(function (b) { b.addEventListener("change", upd); });
    if (reset) reset.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }
})();
