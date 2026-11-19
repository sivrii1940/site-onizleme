/* Sadık Sarıgül Kuaför Salonu — site betiği (bağımlılık yok) */

/* ---- Açık/kapalı durumu (kit/status.js'ten kopya) ---- */
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
  var doc = document, root = doc.documentElement;
  root.classList.add("js");

  var HOURS = { "0": [["08:00", "22:00"]], "1": [["08:00", "22:00"]], "2": [["08:00", "22:00"]], "3": [["08:00", "22:00"]], "4": [["08:00", "22:00"]], "5": [["08:00", "22:00"]], "6": [["08:00", "22:00"]] };
  var WA = "https://wa.me/905353503412";
  var BRAND = "Sadık Sarıgül Kuaför Salonu";
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function pad(x) { return (x < 10 ? "0" : "") + x; }
  function toMin(s) { var a = String(s).split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function fmt(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }

  /* 1) Yazı tipleri yüklenince imza ve arma çizimi başlar */
  var readyDone = false;
  function ready() { if (readyDone) return; readyDone = true; root.classList.add("is-ready"); }
  if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(ready); setTimeout(ready, 1400); } else { ready(); }

  /* 2) Canlı açık/kapalı durumu, kadran ibresi, bugünün satırı */
  function paint() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
      var p = el.closest(".plaque");
      if (p) { p.classList.toggle("is-open", s.open); p.classList.toggle("is-closed", !s.open); }
    });
    $$("[data-dial-hand]").forEach(function (h) { h.style.transform = "rotate(" + (s.minutes / 1440 * 360).toFixed(2) + "deg)"; });
    $$("[data-now]").forEach(function (el) { el.textContent = fmt(s.minutes); });
    $$("[data-day]").forEach(function (row) {
      var t = parseInt(row.getAttribute("data-day"), 10) === s.dayIndex;
      row.classList.toggle("is-today", t);
      if (t) row.setAttribute("aria-current", "date"); else row.removeAttribute("aria-current");
    });
  }
  paint();
  setInterval(paint, 30000);

  /* 3) Telefon menüsü */
  var openBtn = $("[data-menu-open]"), drawer = $("#cekmece"), closeBtn = $("[data-menu-close]");
  if (openBtn && drawer) {
    var openMenu = function () {
      drawer.classList.add("is-open"); root.classList.add("menu-open");
      openBtn.setAttribute("aria-expanded", "true");
      setTimeout(function () { (closeBtn || drawer).focus(); }, 60);
    };
    var closeMenu = function (back) {
      drawer.classList.remove("is-open"); root.classList.remove("menu-open");
      openBtn.setAttribute("aria-expanded", "false");
      if (back) openBtn.focus();
    };
    openBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", function () { closeMenu(true); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeMenu(true); });
    $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960 && drawer.classList.contains("is-open")) closeMenu(false); });
  }

  /* 4) Alt bilgideki imza görünür olunca yazılır */
  var fs = $$(".foot-sig");
  if (fs.length) {
    if ("IntersectionObserver" in window) {
      /* Kırpılmış (görünmez) öğe gözlenemez; bu yüzden üstündeki armayı gözleriz */
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (!e.isIntersecting) return;
          var sig = e.target.parentNode.querySelector(".foot-sig");
          if (sig) sig.classList.add("is-drawn");
          io.unobserve(e.target);
        });
      }, { threshold: 0.6 });
      fs.forEach(function (el) { var t = el.parentNode.querySelector(".foot-crest") || el.parentNode; io.observe(t); });
    } else { fs.forEach(function (el) { el.classList.add("is-drawn"); }); }
  }

  /* 5) Kopyalama */
  function fallbackCopy(text) {
    var t = doc.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.top = "0"; t.style.opacity = "0";
    doc.body.appendChild(t); t.select();
    var ok = false; try { ok = doc.execCommand("copy"); } catch (e) { ok = false; }
    doc.body.removeChild(t); return ok;
  }
  function copyText(text, btn) {
    var lbl = btn.querySelector(".lbl") || btn;
    var old = lbl.getAttribute("data-old") || lbl.textContent;
    lbl.setAttribute("data-old", old);
    function done(ok) { lbl.textContent = ok ? "Kopyalandı" : "Kopyalanamadı, elle seçin"; setTimeout(function () { lbl.textContent = old; }, 2000); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else { done(fallbackCopy(text)); }
  }
  $$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), b); }); });

  /* Tarih yardımcıları (İstanbul takvimi) */
  function istanbulDate() {
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { y: +o.year, m: +o.month, d: +o.day };
    } catch (e) { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
  }
  function dayInfo(utcMs, k) {
    var dt = new Date(utcMs);
    return { k: k, ms: utcMs, wd: (dt.getUTCDay() + 6) % 7, d: dt.getUTCDate(), m: dt.getUTCMonth(), y: dt.getUTCFullYear() };
  }
  function longDate(x) { return x.d + " " + MONTHS[x.m] + " " + DAYS[x.wd]; }

  /* 6) RANDEVU TALEBİ OLUŞTURUCU (imza araç) */
  var tool = $("[data-tool='randevu']");
  if (tool) (function () {
    var st = { svc: [], day: null, band: null, time: null };
    var chips = $$("[data-svc]", tool);
    var daysEl = $("[data-days]", tool), timesEl = $("[data-times]", tool), timesList = $("[data-times-list]", tool);
    var flexEl = $("[data-flex]", tool), nameEl = $("[data-cust-name]", tool), peopleEl = $("[data-people]", tool), noteEl = $("[data-note]", tool);
    var msgEl = $("[data-msg]", tool), waEl = $("[data-wa]", tool), hintEl = $("[data-hint]", tool), card = $(".pcard", tool);
    var pickedEl = $("[data-day-picked]", tool), copyBtn = $("[data-copy-msg]", tool);
    var bands = $$("[data-band]", tool).map(function (b) {
      return { el: b, id: b.getAttribute("data-band"), name: b.getAttribute("data-name"), from: toMin(b.getAttribute("data-from")), to: toMin(b.getAttribute("data-to")) };
    });
    var t0 = istanbulDate(), base = Date.UTC(t0.y, t0.m - 1, t0.d), days = [];
    for (var k = 0; k < 14; k++) days.push(dayInfo(base + k * 86400000, k));

    function slots(dk, band) {
      var x = days[dk], rs = HOURS[String(x.wd)] || [], out = [];
      var minStart = dk === 0 ? istanbulNow().m + 20 : -1;
      for (var t = band.from; t < band.to; t += 30) {
        var ok = rs.some(function (r) { var s = toMin(r[0]), e = toMin(r[1]); if (e <= s) e += 1440; return t >= s && t + 30 <= e; });
        if (ok && t > minStart) out.push(t);
      }
      return out;
    }
    function dayOpen(dk) { return bands.some(function (b) { return slots(dk, b).length > 0; }); }
    function bandById(id) { for (var i = 0; i < bands.length; i++) if (bands[i].id === id) return bands[i]; return null; }

    days.forEach(function (x) {
      var b = doc.createElement("button");
      b.type = "button"; b.className = "day"; b.setAttribute("aria-pressed", "false");
      var rel = x.k === 0 ? ", bugün" : x.k === 1 ? ", yarın" : "";
      b.setAttribute("aria-label", longDate(x) + rel);
      b.innerHTML = '<span class="wd">' + DAYS_SHORT[x.wd] + '</span><span class="dn">' + x.d + '</span><span class="mo">' + MONTHS[x.m].slice(0, 3) + "</span>";
      if (x.k === 0) b.classList.add("is-today-btn");
      if (!dayOpen(x.k)) { b.disabled = true; b.title = "Bugün için uygun saat kalmadı"; }
      b.addEventListener("click", function () { selectDay(x.k); });
      daysEl.appendChild(b); x.el = b;
    });

    function selectDay(dk) {
      st.day = dk;
      days.forEach(function (x) { x.el.setAttribute("aria-pressed", String(x.k === dk)); });
      var x = days[dk];
      pickedEl.textContent = "Seçilen gün: " + longDate(x) + (dk === 0 ? " (bugün)" : dk === 1 ? " (yarın)" : "");
      bands.forEach(function (b) {
        var n = slots(dk, b).length;
        b.el.disabled = n === 0;
        b.el.title = n === 0 ? "Bu dilimin saati geçti" : "";
      });
      if (st.band && !slots(dk, bandById(st.band)).length) { st.band = null; st.time = null; }
      paintBands();
      update();
    }
    function paintBands() {
      bands.forEach(function (b) { b.el.setAttribute("aria-pressed", String(b.id === st.band)); });
      timesList.innerHTML = "";
      if (!st.band || st.day === null) { timesEl.hidden = true; return; }
      var b = bandById(st.band), list = slots(st.day, b);
      if (st.time !== null && list.indexOf(st.time) < 0) st.time = null;
      timesEl.hidden = false;
      var any = mkChip("Fark etmez", st.time === null, function () { st.time = null; paintBands(); update(); });
      timesList.appendChild(any);
      list.forEach(function (t) {
        timesList.appendChild(mkChip(fmt(t), st.time === t, function () { st.time = t; paintBands(); update(); }));
      });
    }
    function mkChip(label, pressed, fn) {
      var c = doc.createElement("button");
      c.type = "button"; c.className = "chip"; c.textContent = label; c.setAttribute("aria-pressed", String(pressed));
      c.addEventListener("click", fn); return c;
    }
    bands.forEach(function (b) {
      b.el.addEventListener("click", function () {
        if (st.day === null) { selectDay(firstOpenDay()); }
        st.band = b.id; st.time = null; paintBands(); update();
      });
    });
    function firstOpenDay() { for (var i = 0; i < days.length; i++) if (!days[i].el.disabled) return i; return 0; }

    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var v = c.getAttribute("data-label"), i = st.svc.indexOf(v);
        if (i < 0) st.svc.push(v); else st.svc.splice(i, 1);
        c.setAttribute("aria-pressed", String(i < 0));
        update();
      });
    });
    [flexEl, peopleEl].forEach(function (el) { el.addEventListener("change", update); });
    [nameEl, noteEl].forEach(function (el) { el.addEventListener("input", update); });

    function ordered() {
      return chips.map(function (c) { return c.getAttribute("data-label"); }).filter(function (v) { return st.svc.indexOf(v) > -1; });
    }
    function complete() { return st.svc.length > 0 && st.day !== null && !!st.band; }
    function build() {
      var L = ["Merhaba, " + BRAND + " için randevu talebim var.", ""];
      L.push("Hizmet: " + (st.svc.length ? ordered().join(", ") : "…"));
      if (st.day !== null) { var x = days[st.day]; L.push("Gün: " + longDate(x) + (st.day === 0 ? " (bugün)" : st.day === 1 ? " (yarın)" : "")); }
      else L.push("Gün: …");
      var b = st.band ? bandById(st.band) : null;
      L.push("Saat dilimi: " + (b ? b.name + " (" + fmt(b.from) + "–" + fmt(b.to) + ")" + (st.time !== null ? ", mümkünse " + fmt(st.time) : "") : "…"));
      if (flexEl.checked) L.push("Bu dilim doluysa aynı gün başka bir saat de olur.");
      var p = parseInt(peopleEl.value, 10); if (p > 1) L.push("Kişi sayısı: " + p);
      var nm = nameEl.value.trim(); if (nm) L.push("Ad: " + nm);
      var nt = noteEl.value.trim(); if (nt) L.push("Not: " + nt);
      L.push(""); L.push("Uygun saati bildirebilir misiniz? Teşekkür ederim.");
      return L.join("\n");
    }
    function update() {
      var msg = build(), ok = complete();
      msgEl.textContent = msg;
      card.classList.toggle("is-complete", ok);
      waEl.setAttribute("aria-disabled", String(!ok));
      waEl.href = ok ? WA + "?text=" + encodeURIComponent(msg) : WA;
      if (ok) hintEl.textContent = "";
    }
    waEl.addEventListener("click", function (e) {
      if (complete()) return;
      e.preventDefault();
      var miss = [], focus = null;
      if (!st.svc.length) { miss.push("hizmet"); focus = focus || chips[0]; }
      if (st.day === null) { miss.push("gün"); focus = focus || days[firstOpenDay()].el; }
      if (!st.band) { miss.push("saat dilimi"); focus = focus || bands.filter(function (b) { return !b.el.disabled; })[0].el; }
      hintEl.textContent = "Göndermeden önce seçin: " + miss.join(", ") + ".";
      if (focus) focus.focus();
    });
    copyBtn.addEventListener("click", function () { copyText(build(), copyBtn); });

    /* Hizmetler sayfasından gelen ön seçim: randevu.html?hizmet=sakal-tirasi */
    try {
      var q = new URLSearchParams(location.search).get("hizmet");
      if (q) chips.forEach(function (c) { if (c.getAttribute("data-svc") === q) c.click(); });
    } catch (e) { /* eski tarayıcı */ }
    update();
  })();

  /* 7) DAMAT TAKVİMİ: tarihe göre hazırlık planı */
  var plan = $("[data-tool='damat-takvimi']");
  if (plan) (function () {
    var dateEl = $("[data-plan-date]", plan), out = $("[data-plan-out]", plan), waEl = $("[data-plan-wa]", plan), list = $("[data-plan-list]", plan), empty = $("[data-plan-empty]", plan);
    var emptyText = empty.textContent;
    var msgEl = $("[data-plan-msg]", plan), noteEl = $("[data-plan-note]", plan);
    var STEPS = [
      { off: -28, label: "Yaklaşık dört hafta önce", what: "Hedef görünümü belirleyin. Sakal uzatacaksanız ya da saçta boy kazanmak istiyorsanız bu, uzamaya zaman tanır." },
      { off: -14, label: "Yaklaşık iki hafta önce", what: "Deneme niteliğinde bir kesim ve sakal şekli. Beğenmediğiniz bir ayrıntıyı değiştirmeye vakit kalır." },
      { off: -7, label: "Bir hafta önce", what: "Yüz bakımını ilk kez deneyecekseniz şimdi yaptırın; cilt tepki verirse toparlanmaya zamanı olur." },
      { off: -3, label: "Üç gün önce", what: "Asıl saç kesimi. Birkaç gün içinde kesim oturur ve fotoğraflarda daha doğal durur." },
      { off: -1, label: "Bir gün önce", what: "Sakal konturu ve ense temizliği. Ustura tıraşı düşünüyorsanız saatini bu gün netleştirin." },
      { off: 0, label: "Büyük gün", what: "Ustura tıraşı ya da son düzeltme ve şekillendirme. Fotoğraf çekiminden önce rahat bir zaman bırakın." }
    ];
    var t0 = istanbulDate(), todayMs = Date.UTC(t0.y, t0.m - 1, t0.d);
    var minD = new Date(todayMs), maxD = new Date(todayMs + 400 * 86400000);
    function iso(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
    dateEl.min = iso(minD); dateEl.max = iso(maxD);
    /* Boş görünmesin: örnek olarak altı hafta sonrası seçili gelir (not ile belirtilir) */
    if (!dateEl.value) dateEl.value = iso(new Date(todayMs + 42 * 86400000));
    function userPicked() { if (noteEl) noteEl.hidden = true; }

    function render() {
      var v = dateEl.value;
      list.innerHTML = "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { out.hidden = true; empty.hidden = false; empty.textContent = emptyText; waEl.setAttribute("aria-disabled", "true"); waEl.href = WA; return; }
      var a = v.split("-"), evMs = Date.UTC(+a[0], +a[1] - 1, +a[2]);
      if (evMs < todayMs) { out.hidden = true; empty.hidden = false; empty.textContent = "Bu tarih geçmiş görünüyor; bugünden sonraki bir tarih seçin."; waEl.setAttribute("aria-disabled", "true"); waEl.href = WA; return; }
      empty.hidden = true; out.hidden = false;
      var ev = dayInfo(evMs, 0), lines = [];
      STEPS.forEach(function (s) {
        var ms = evMs + s.off * 86400000, d = dayInfo(ms, 0), past = ms < todayMs;
        var li = doc.createElement("li");
        if (past) li.className = "is-past";
        li.innerHTML = '<span class="plan-when"></span><span class="plan-what"></span>';
        li.firstChild.textContent = longDate(d);
        var sm = doc.createElement("small"); sm.textContent = past ? s.label + " · tarihi geçti" : s.label; li.firstChild.appendChild(sm);
        li.lastChild.textContent = s.what;
        list.appendChild(li);
        if (!past && s.off < 0 && s.off >= -3) lines.push(s.label.toLocaleLowerCase("tr-TR") + " (" + longDate(d) + ")");
      });
      var msg = "Merhaba, " + BRAND + " için damat tıraşı talebim var.\n\nDüğün / özel gün: " + longDate(ev) +
        "\nKesim ve tıraş için bu tarihe göre uygun günleri birlikte planlayabilir miyiz?" +
        (lines.length ? "\nDüşündüğüm günler: " + lines.join(", ") + " ve büyük günün kendisi." : "") +
        "\n\nTeşekkür ederim.";
      waEl.href = WA + "?text=" + encodeURIComponent(msg);
      waEl.setAttribute("aria-disabled", "false");
      if (msgEl) msgEl.textContent = msg;
    }
    dateEl.addEventListener("change", function () { userPicked(); render(); });
    dateEl.addEventListener("input", function () { userPicked(); render(); });
    waEl.addEventListener("click", function (e) {
      if (waEl.getAttribute("aria-disabled") === "true") { e.preventDefault(); dateEl.focus(); empty.hidden = false; empty.textContent = "Önce düğün ya da özel gün tarihini seçin."; }
    });
    render();
  })();
})();
