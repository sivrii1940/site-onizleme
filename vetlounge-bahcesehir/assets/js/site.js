/* Vetlounge Veteriner Kliniği — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var WA = "https://wa.me/905427480769";
  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  /* ---- kit/status.js'ten kopya: açık/kapalı durumu ---- */
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
  function waUrl(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function clean(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function store(key, val) {
    try { if (val === undefined) return window.localStorage.getItem(key); window.localStorage.setItem(key, val); } catch (e) { return null; }
    return null;
  }
  function copyText(text, out) {
    function ok() { if (out) { out.textContent = "Kopyalandı. İstediğiniz yere yapıştırabilirsiniz."; setTimeout(function () { out.textContent = ""; }, 4000); } }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { if (out) out.textContent = "Kopyalanamadı; metni önizlemeden seçip kopyalayın."; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }
  function parseDate(v) { if (!v) return null; var a = v.split("-"); if (a.length !== 3) return null; var d = new Date(+a[0], +a[1] - 1, +a[2]); return isNaN(d) ? null : d; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function trDate(d, withDay) { var s = d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); return withDay ? s + ", " + DAYS[(d.getDay() + 6) % 7] : s; }
  function shortDate(d) { return d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3); }
  function nightsBetween(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function radioVal(name, root) { var r = $("input[name='" + name + "']:checked", root); return r ? r.value : ""; }
  function moonsHTML(n) {
    var out = "", shown = Math.min(n, 14);
    for (var i = 0; i < shown; i++) out += '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-moon"/></svg>';
    if (n > 14) out += "<span>+" + (n - 14) + "</span>";
    return out + "<span>" + n + " gece</span>";
  }

  /* ---- canlı durum ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    var n = istanbulNow();
    $$(".mark-dot").forEach(function (g) { g.style.transform = "rotate(" + (n.m / 1440 * 360) + "deg)"; });
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ---- telefon menüsü ---- */
  var menuBtn = $(".menu-btn"), menu = $("#menu");
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $(".menu__close", menu).focus(); else menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
    $(".menu__close", menu).addEventListener("click", function () { setMenu(false); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.hidden = true; document.body.style.overflow = ""; menuBtn.setAttribute("aria-expanded", "false"); }); });
  }

  /* ---- resepsiyon zili ---- */
  var bell = $(".dock__bell"), sheet = $("#bell-sheet");
  function setSheet(open) {
    if (!sheet || !bell) return;
    sheet.hidden = !open;
    bell.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var a = $("a", sheet); if (a) a.focus(); }
  }
  if (bell && sheet) {
    bell.addEventListener("click", function () {
      bell.classList.remove("is-ring"); void bell.offsetWidth; bell.classList.add("is-ring");
      setSheet(sheet.hidden);
    });
    $(".bell-sheet__close", sheet).addEventListener("click", function () { setSheet(false); bell.focus(); });
    document.addEventListener("click", function (e) { if (!sheet.hidden && !sheet.contains(e.target) && !bell.contains(e.target)) setSheet(false); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (menu && !menu.hidden) setMenu(false);
    if (sheet && !sheet.hidden) { setSheet(false); bell.focus(); }
  });

  /* ---- 24 saat halkası (imza) ---- */
  var ring = $("[data-ring]");
  if (ring) {
    var hand = $("#ring-hand"), dial = $(".ring__dial", ring), tEl = $("[data-ring-time]"), dEl = $("[data-ring-day]");
    var note = $("[data-ring-note]"), back = $("[data-ring-back]");
    var hint = note ? note.textContent : "";
    var cur = null, scrub = null, timer = null, dragging = false;
    var PERIOD = [
      [0, "Gece de açığız. Acil bir durumda yola çıkmadan önce arayın ve ne olduğunu kısaca anlatın."],
      [6, "Sabah saatleri. Kontrol, aşı ya da konaklama girişi için önceden arayıp saat konuşun."],
      [12, "Öğleden sonra. Muayene ya da konaklama çıkışı için gelmeden önce haber verin."],
      [18, "Akşam saatleri. İş çıkışı muayene için önceden yazın; acil durumda doğrudan arayın."]
    ];
    function periodText(h) { var t = PERIOD[0][1]; PERIOD.forEach(function (p) { if (h >= p[0]) t = p[1]; }); return t; }
    function setAngle(a) {
      if (cur === null) cur = a; else { var d = ((a - cur) % 360 + 540) % 360 - 180; cur += d; }
      hand.style.transform = "rotate(" + cur + "deg)";
    }
    function live() {
      if (scrub !== null) return;
      var n = istanbulNow(), h = Math.floor(n.m / 60);
      setAngle(n.m / 1440 * 360);
      tEl.textContent = pad(h) + ":" + pad(n.m % 60);
      dEl.textContent = DAYS[n.d] + ", İstanbul";
      dial.setAttribute("aria-valuenow", String(h));
      dial.setAttribute("aria-valuetext", "Şu an saat " + pad(h) + ":" + pad(n.m % 60) + ", açık");
    }
    function preview(h) {
      h = ((h % 24) + 24) % 24;
      scrub = h;
      setAngle(h * 15);
      tEl.textContent = pad(h) + ":00";
      dEl.textContent = "Seçtiğiniz saat";
      note.textContent = pad(h) + ":00 · Açık. " + periodText(h);
      back.hidden = false;
      ring.classList.add("is-scrub");
      dial.setAttribute("aria-valuenow", String(h));
      dial.setAttribute("aria-valuetext", "Saat " + pad(h) + ":00, açık");
      clearTimeout(timer);
      timer = setTimeout(reset, 12000);
    }
    function reset() {
      clearTimeout(timer);
      scrub = null; back.hidden = true; ring.classList.remove("is-scrub"); note.textContent = hint;
      live();
    }
    function pointAt(e) {
      var r = dial.getBoundingClientRect();
      var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      var a = Math.atan2(x, -y) * 180 / Math.PI; if (a < 0) a += 360;
      return { h: Math.round(a / 15) % 24, dist: Math.sqrt(x * x + y * y) / (r.width / 2) };
    }
    dial.addEventListener("pointerdown", function (e) {
      var p = pointAt(e);
      if (p.dist < 0.48 || p.dist > 1.04) return;
      dragging = e.pointerType !== "touch";
      preview(p.h);
    });
    dial.addEventListener("pointermove", function (e) { if (dragging) preview(pointAt(e).h); });
    window.addEventListener("pointerup", function () { dragging = false; });
    dial.addEventListener("keydown", function (e) {
      var base = scrub !== null ? scrub : Math.floor(istanbulNow().m / 60);
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { preview(base + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { preview(base - 1); e.preventDefault(); }
      else if (e.key === "Home") { preview(0); e.preventDefault(); }
      else if (e.key === "End") { preview(23); e.preventDefault(); }
      else if (e.key === "Escape" && scrub !== null) { reset(); }
    });
    back.addEventListener("click", reset);
    live();
    setInterval(live, 10000);
  }

  /* ---- kapılar aralık ---- */
  var doors = $$(".door");
  if (doors.length) setTimeout(function () { doors.forEach(function (d) { d.classList.add("is-ajar"); }); }, 1400);

  /* ---- ana sayfa: hızlı konaklama kartı ---- */
  var qb = $("[data-tool='hizli-konaklama']");
  if (qb) {
    var qIn = $("#qb-in", qb), qOut = $("#qb-out", qb), qN = $("[data-qb-nights]", qb);
    var t0 = isoDate(today());
    qIn.min = t0; qOut.min = t0;
    var qUpdate = function () {
      var a = parseDate(qIn.value), b = parseDate(qOut.value);
      if (a) qOut.min = isoDate(addDays(a, 1));
      if (a && b && nightsBetween(a, b) > 0) qN.innerHTML = moonsHTML(nightsBetween(a, b));
      else if (a && b) qN.innerHTML = "<span>Çıkış günü, giriş gününden sonra olmalı.</span>";
      else qN.innerHTML = "<span>Tarihleri seçince gece sayısı burada görünür.</span>";
    };
    qIn.addEventListener("change", qUpdate); qOut.addEventListener("change", qUpdate);
    qb.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = [];
      if (qIn.value) p.push("giris=" + qIn.value);
      if (qOut.value) p.push("cikis=" + qOut.value);
      var t = radioVal("tur", qb); if (t) p.push("tur=" + t);
      location.href = "rezervasyon.html" + (p.length ? "?" + p.join("&") : "") + "#bk-form";
    });
  }

  /* ---- rezervasyon: konaklama talebi (imza araç) ---- */
  var bk = $("[data-tool='konaklama-talebi']");
  if (bk) {
    var f = $("#bk-form"), bIn = $("#bk-in"), bOut = $("#bk-out"), adet = $("#bk-adet");
    var prev = $("[data-bk-preview]"), wa = $("[data-bk-wa]"), err = $("[data-bk-error]"), nightsEl = $("[data-bk-nights]");
    var tag = $("[data-keytag]"), ktName = $("[data-kt-name]"), ktSp = $("[data-kt-species]"), ktN = $("[data-kt-nights]"), ktD = $("[data-kt-dates]");
    var ilacBox = $("[data-bk-ilac-box]");
    var count = 1;
    var SP = { kedi: ["Kedi", "kedi"], kopek: ["Köpek", "köpek"], ikisi: ["Kedi ve köpek", "kedi ve köpek"] };
    var t1 = isoDate(today());
    bIn.min = t1; bOut.min = t1;

    // ana sayfadan gelen tarihler
    try {
      var q = new URLSearchParams(location.search);
      if (/^\d{4}-\d{2}-\d{2}$/.test(q.get("giris") || "")) bIn.value = q.get("giris");
      if (/^\d{4}-\d{2}-\d{2}$/.test(q.get("cikis") || "")) bOut.value = q.get("cikis");
      var qt = q.get("tur"); if (qt && SP[qt]) { var r0 = $("input[name='bk-tur'][value='" + qt + "']"); if (r0) r0.checked = true; }
    } catch (e) { /* eski tarayıcı */ }

    function problems() {
      var a = parseDate(bIn.value), b = parseDate(bOut.value), list = [];
      if (!a) list.push("giriş gününü seçin");
      else if (a < today()) list.push("giriş günü bugünden önce olamaz");
      if (!b) list.push("çıkış gününü seçin");
      if (a && b && nightsBetween(a, b) < 1) list.push("çıkış günü girişten sonra olmalı");
      if (!radioVal("bk-tur")) list.push("türü seçin");
      return list;
    }
    function build() {
      var a = parseDate(bIn.value), b = parseDate(bOut.value);
      var n = a && b ? nightsBetween(a, b) : 0;
      var sp = SP[radioVal("bk-tur")];
      var name = clean($("#bk-ad").value), age = clean($("#bk-yas").value), breed = clean($("#bk-irk").value);
      var L = ["Merhaba Vetlounge, konaklama için talep oluşturmak istiyorum.", ""];
      L.push("• Giriş: " + (a ? trDate(a, true) : "seçilmedi") + (clean($("#bk-saat").value) ? " (" + $("#bk-saat").value.toLowerCase() + ")" : ""));
      L.push("• Çıkış: " + (b ? trDate(b, true) : "seçilmedi"));
      if (n > 0) L.push("• Süre: " + n + " gece");
      L.push("• Misafir: " + (sp ? sp[0] : "tür seçilmedi") + ", " + count + " hayvan");
      var who = [];
      if (name) who.push("Adı: " + name);
      if (age) who.push("Yaşı: " + age);
      if (breed) who.push("Irkı: " + breed);
      if (who.length) L.push("• " + who.join(" · "));
      if ($("#bk-kisir").value) L.push("• Kısırlaştırma: " + $("#bk-kisir").value.toLowerCase());
      if ($("#bk-asi").value) L.push("• Aşı karnesi: " + $("#bk-asi").value.toLowerCase());
      var pz = $("#bk-parazit").value;
      if (pz) { var pp = pz.split("-"); L.push("• Son parazit uygulaması: " + MONTHS[+pp[1] - 1] + " " + pp[0]); }
      if (radioVal("bk-ilac") === "evet") L.push("• İlaç: kullanıyor" + (clean($("#bk-ilac-not").value) ? " (" + clean($("#bk-ilac-not").value) + ")" : ""));
      else L.push("• İlaç: kullanmıyor");
      L.push("• Mama: " + (radioVal("bk-mama") === "konus" ? "mama konusunu konuşmak istiyorum" : "kendi mamasını getireceğim"));
      var nt = clean($("#bk-not").value); if (nt) L.push("• Notlar: " + nt);
      $$("input[name='bk-ek']:checked").forEach(function (c) { L.push("• " + c.value); });
      L.push("");
      L.push("Uygunluk, konaklama koşulları ve ücret hakkında bilgi verebilir misiniz?");
      var owner = clean($("#bk-sahip").value); if (owner) L.push("Teşekkürler, " + owner);
      return L.join("\n");
    }
    function paintTag() {
      var a = parseDate(bIn.value), b = parseDate(bOut.value);
      var n = a && b ? nightsBetween(a, b) : 0;
      var nm = clean($("#bk-ad").value) || "Misafiriniz";
      if (nm.length > 16) nm = nm.slice(0, 15) + "…";
      ktName.textContent = nm;
      ktName.style.fontSize = Math.min(30, Math.round(165 / Math.max(nm.length * 0.56, 1))) + "px";
      var sp = SP[radioVal("bk-tur")];
      ktSp.textContent = sp ? sp[1] + (count > 1 ? " · " + count + " misafir" : "") : "tür seçilmedi";
      ktN.textContent = n > 0 ? n + " gece" : "gece sayısı";
      ktD.textContent = a && b && n > 0 ? shortDate(a) + " – " + shortDate(b) : "tarih seçilmedi";
      nightsEl.innerHTML = n > 0 ? moonsHTML(n) : "<span>" + (a && b ? "Çıkış günü girişten sonra olmalı." : "Gece sayısı tarihleri seçince görünür.") + "</span>";
    }
    function update() {
      var a = parseDate(bIn.value);
      if (a) bOut.min = isoDate(addDays(a, 1));
      ilacBox.hidden = radioVal("bk-ilac") !== "evet";
      var msg = build();
      prev.textContent = msg;
      wa.href = waUrl(msg);
      var pr = problems();
      wa.classList.toggle("is-incomplete", pr.length > 0);
      if (!pr.length) err.textContent = "";
      paintTag();
    }
    f.addEventListener("input", update);
    f.addEventListener("change", update);
    $$("[data-step]", f).forEach(function (btn) {
      btn.addEventListener("click", function () {
        count = Math.max(1, Math.min(6, count + parseInt(btn.getAttribute("data-step"), 10)));
        adet.textContent = String(count);
        update();
      });
    });
    wa.addEventListener("click", function (e) {
      var pr = problems();
      if (pr.length) {
        e.preventDefault();
        err.textContent = "Göndermeden önce: " + pr.join(", ") + ".";
        var first = !parseDate(bIn.value) ? bIn : !parseDate(bOut.value) || pr.join().indexOf("çıkış") > -1 ? bOut : $("input[name='bk-tur']");
        if (first) first.focus();
        return;
      }
      tag.classList.remove("is-swing"); void tag.offsetWidth; tag.classList.add("is-swing");
    });
    $("[data-bk-copy]").addEventListener("click", function () { copyText(build(), $("[data-bk-copied]")); });
    update();
  }

  /* ---- klinik: muayene notu ---- */
  var mn = $("[data-tool='muayene-notu']");
  if (mn) {
    var mnBuild = function () {
      var tur = radioVal("mn-tur", mn) || "Kedi", ad = clean($("#mn-ad").value), yas = clean($("#mn-yas").value);
      var nedenler = $$("input[name='mn-neden']:checked", mn).map(function (c) { return c.value; });
      var L = ["Merhaba Vetlounge, muayene için yazıyorum.", ""];
      L.push("• Hayvanım: " + tur + (ad ? ", adı " + ad : "") + (yas ? ", " + yas : ""));
      L.push("• Neden: " + (nedenler.length ? nedenler.join(", ") : "genel bilgi almak istiyorum"));
      if ($("#mn-ne-zaman").value) L.push("• Şikâyet: " + $("#mn-ne-zaman").value.toLowerCase());
      L.push("• Uygun zaman: " + ($("#mn-saat").value ? $("#mn-saat").value.toLowerCase() : "fark etmez"));
      var nt = clean($("#mn-not").value); if (nt) L.push("• Not: " + nt);
      L.push("");
      L.push("Uygun bir saat önerebilir misiniz?");
      return L.join("\n");
    };
    var mnUpd = function () { var m = mnBuild(); $("[data-mn-preview]").textContent = m; $("[data-mn-wa]").href = waUrl(m); };
    mn.addEventListener("input", mnUpd); mn.addEventListener("change", mnUpd);
    $("[data-mn-copy]").addEventListener("click", function () { copyText(mnBuild(), $("[data-mn-copied]")); });
    mnUpd();
  }

  /* ---- klinik: aşı yol haritası ---- */
  var vx = $("[data-tool='asi-yol-haritasi']");
  if (vx) {
    var vDate = $("#vx-dogum"), vList = $("[data-vx-list]"), vWa = $("[data-vx-wa]");
    vDate.max = isoDate(today());
    var STEPS = {
      kedi: [
        [6, 8, "İlk muayene ve karma aşı başlangıcı", "Genel kontrol yapılır; hekim karma aşının (panlökopeni, herpes, kalisi) başlangıcını ve iç parazit uygulamasını planlar."],
        [9, 12, "Karma aşı tekrar dozu", "Yavru dönem dozları genellikle 2–4 hafta arayla tekrarlanır. Yaşam tarzına göre lösemi (FeLV) aşısını da sorun."],
        [12, 14, "Kuduz aşısı", "Türkiye'de kedi ve köpekler için kuduz aşısı zorunludur; ilk doz genellikle üç aylıkken yapılır."],
        [16, 17, "Yavru dönemin son karma dozu", "Son yavru dozu genellikle 16. hafta ya da sonrasına denk getirilir."],
        [26, 52, "Pekiştirme dozu ve kısırlaştırma görüşmesi", "Yavru aşılarından sonraki pekiştirme dozunu ve kısırlaştırma için uygun dönemi hekiminizle konuşun."],
        [52, 56, "Yıllık genel kontrol ve aşı yenileme planı", "Yetişkin dönemde yılda en az bir genel kontrol önerilir; hangi aşının ne zaman yenileneceğini hekim belirler."]
      ],
      kopek: [
        [6, 8, "İlk muayene ve karma aşı başlangıcı", "Genel kontrol yapılır; hekim karma aşının (gençlik hastalığı, parvovirüs, hepatit) başlangıcını ve iç parazit uygulamasını planlar."],
        [9, 12, "Karma aşı tekrar dozu", "Yavru dönem dozları genellikle 2–4 hafta arayla tekrarlanır. Bulaşıcı öksürük ve leptospiroz aşılarını da sorun."],
        [12, 14, "Kuduz aşısı", "Türkiye'de kedi ve köpekler için kuduz aşısı zorunludur; ilk doz genellikle üç aylıkken yapılır."],
        [16, 17, "Yavru dönemin son karma dozu", "Son yavru dozu genellikle 16. hafta ya da sonrasına denk getirilir. Seri tamamlanana kadar aşı durumu bilinmeyen köpeklerle temastan kaçının."],
        [26, 52, "Pekiştirme dozu ve kısırlaştırma görüşmesi", "Yavru aşılarından sonraki pekiştirme dozunu ve kısırlaştırma için uygun dönemi hekiminizle konuşun."],
        [52, 56, "Yıllık genel kontrol ve aşı yenileme planı", "Yetişkin dönemde yılda en az bir genel kontrol önerilir; hangi aşının ne zaman yenileneceğini hekim belirler."]
      ]
    };
    var ADULT = [
      ["Her yıl", "Yıllık genel kontrol", "Yetişkin dönemde yılda en az bir genel kontrol önerilir; aşı karnesini yanınıza alın."],
      ["Her yıl", "Aşı yenileme planı", "Hangi aşının ne zaman yenileneceğini hekim, aşı geçmişine ve yaşam tarzına göre belirler. Kuduz aşısı Türkiye'de zorunludur."],
      ["Düzenli", "İç ve dış parazit uygulaması", "Uygulama aralığı kullanılan ürüne göre değişir; son uygulama tarihini not edin."],
      ["Geçmiş bilinmiyorsa", "Yeni bir başlangıç planı", "Aşı kaydı bulunamayan yetişkin hayvanlarda hekim yeni bir aşı planı önerebilir."],
      ["İleri yaşta", "Daha sık kontrol", "Yaş ilerledikçe kontrollerin sıklığını hekiminizle konuşun; su tüketimi, kilo ve iştah değişikliklerini not edin."]
    ];
    var nextText = "";
    var vxRender = function () {
      var sp = radioVal("vx-tur", vx) || "kedi", b = parseDate(vDate.value), nm = clean($("#vx-ad").value);
      var t = today();
      nextText = "";
      var example = false;
      if (b && b > t) {
        vList.innerHTML = '<li class="timeline-empty">Doğum tarihi bugünden sonra olamaz.</li>';
      } else {
        if (!b) { example = true; b = addDays(t, -49); }
        var ageW = Math.floor(nightsBetween(b, t) / 7), html = "";
        if (ageW >= 60) {
          ADULT.forEach(function (s, i) {
            html += '<li class="' + (i === 0 ? "is-next" : "") + '"><span class="when">' + s[0] + '</span><span class="what">' + s[1] + '</span><span class="why">' + s[2] + "</span></li>";
          });
          nextText = "yıllık genel kontrol ve aşı yenileme";
          html = '<li class="timeline-empty">Yaklaşık ' + Math.floor(ageW / 52) + " yaşında: yavru dönem takvimi geride kalmış. Yetişkin dönem için genel yol haritası:</li>" + html;
        } else {
          var marked = false;
          STEPS[sp].forEach(function (s) {
            var from = addDays(b, s[0] * 7), to = addDays(b, s[1] * 7);
            var cls = "";
            if (to < t) cls = "is-past";
            else if (!marked) { cls = "is-next"; marked = true; nextText = s[2].toLowerCase() + " (" + trDate(from) + " civarı)"; }
            var when = (s[0] === s[1] ? s[0] + ". hafta" : s[0] + "–" + s[1] + ". hafta") + " · " + (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear() ? from.getDate() + "–" + to.getDate() + " " + MONTHS[to.getMonth()] + " " + to.getFullYear() : trDate(from) + " – " + trDate(to));
            if (s[0] === 26) when = "6. ay – 1 yaş · " + trDate(from) + " – " + trDate(to);
            if (s[0] === 52) when = "1 yaş ve sonrası · " + trDate(from) + " civarı";
            html += '<li class="' + cls + '"><span class="when">' + when + '</span><span class="what">' + s[2] + '</span><span class="why">' + s[3] + "</span></li>";
          });
        }
        if (example) html = '<li class="timeline-empty">Örnek: bugün 7 haftalık bir ' + (sp === "kedi" ? "kedi" : "köpek") + " yavrusu için. Kendi tarihinizi girin, takvim yeniden hesaplansın.</li>" + html;
        vList.innerHTML = html;
        if (example) { b = null; nextText = ""; }
      }
      var msg = "Merhaba Vetlounge, " + (sp === "kedi" ? "kedim" : "köpeğim") + (nm ? " " + nm : "") + " için aşı ve kontrol randevusu almak istiyorum." +
        (b ? "\n• Doğum tarihi: " + trDate(b) : "") + (nextText ? "\n• Takvime göre sıradaki adım: " + nextText : "") +
        "\nAşı karnesini yanımda getireceğim. Uygun bir saat önerebilir misiniz?";
      vWa.href = waUrl(msg);
    };
    vx.addEventListener("input", vxRender); vx.addEventListener("change", vxRender);
    vxRender();
  }

  /* ---- konukevi: valiz listesi ---- */
  var bag = $("[data-tool='hazirlik-listesi']");
  if (bag) {
    var boxes = $$("input[data-bag]", bag), KEY = "vetlounge-valiz";
    var saved = {};
    try { saved = JSON.parse(store(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    boxes.forEach(function (c) { c.checked = !!saved[c.getAttribute("data-bag")]; });
    var bagPaint = function () {
      var done = boxes.filter(function (c) { return c.checked; }).length, total = boxes.length;
      $("[data-fob-count]", bag).textContent = done + "/" + total;
      $("[data-fob-word]", bag).textContent = done === total ? "valiz hazır" : "hazır";
      var h = Math.round(186 * done / total);
      var fill = $("[data-fob-fill]", bag); fill.setAttribute("y", String(236 - h)); fill.setAttribute("height", String(h));
      $("[data-bag-bar]", bag).style.width = Math.round(100 * done / total) + "%";
      $("[data-bag-text]", bag).textContent = done === 0 ? "Henüz bir şey işaretlenmedi." : done === total ? "Hepsi tamam. İyi yolculuklar!" : (total - done) + " madde kaldı.";
      var o = {}; boxes.forEach(function (c) { if (c.checked) o[c.getAttribute("data-bag")] = 1; });
      store(KEY, JSON.stringify(o));
    };
    boxes.forEach(function (c) { c.addEventListener("change", bagPaint); });
    $("[data-bag-reset]", bag).addEventListener("click", function () { boxes.forEach(function (c) { c.checked = false; }); bagPaint(); });
    $("[data-bag-copy]", bag).addEventListener("click", function () {
      var miss = boxes.filter(function (c) { return !c.checked; }).map(function (c) { return "☐ " + $("b", c.nextElementSibling).textContent; });
      copyText(miss.length ? "Konaklama valizi, eksikler:\n" + miss.join("\n") : "Konaklama valizi: hepsi hazır.", $("[data-bag-copied]", bag));
    });
    bagPaint();
  }

  /* ---- konukevi: işletmeye sorulacaklar ---- */
  var ask = $("[data-tool='konaklama-sorulari']");
  if (ask) {
    var askBuild = function () {
      var who = radioVal("as-tur", ask) || "kedim";
      var qs = $$("input[name='as-q']:checked", ask).map(function (c, i) { return (i + 1) + ") " + c.value; });
      var L = ["Merhaba Vetlounge, " + who + " için konaklama hakkında bilgi almak istiyorum."];
      if (qs.length) { L.push(""); L.push("Sorularım:"); L = L.concat(qs); }
      var nt = clean($("#as-not").value); if (nt) { L.push(""); L.push("Not: " + nt); }
      L.push(""); L.push("Teşekkür ederim.");
      return L.join("\n");
    };
    var askUpd = function () { var m = askBuild(); $("[data-as-preview]", ask).textContent = m; $("[data-as-wa]", ask).href = waUrl(m); };
    ask.addEventListener("input", askUpd); ask.addEventListener("change", askUpd);
    $("[data-as-copy]", ask).addEventListener("click", function () { copyText(askBuild(), $("[data-as-copied]", ask)); });
    askUpd();
  }

  /* ---- sss: arama ve süzme ---- */
  var faqQ = $("#faq-q");
  if (faqQ) {
    var groups = $$(".ledger__group"), tabs = $$("[data-tab]"), empty = $("[data-faq-empty]"), tab = "hepsi";
    var norm = function (s) { return String(s).toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i"); };
    var filter = function () {
      var q = norm(faqQ.value.trim()), any = false;
      groups.forEach(function (g) {
        var okTab = tab === "hepsi" || g.getAttribute("data-group") === tab, shown = 0;
        $$(".qa", g).forEach(function (d) {
          var hit = okTab && (!q || norm(d.textContent).indexOf(q) > -1);
          d.hidden = !hit;
          if (hit) shown++;
          if (q && hit) d.open = true;
        });
        g.hidden = shown === 0;
        if (shown) any = true;
      });
      empty.hidden = any;
    };
    faqQ.addEventListener("input", filter);
    tabs.forEach(function (b) {
      b.addEventListener("click", function () {
        tab = b.getAttribute("data-tab");
        tabs.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        filter();
      });
    });
  }
  var ss = $("[data-tool='soru-sor']");
  if (ss) {
    var ssBuild = function () {
      var L = ["Merhaba Vetlounge, sitenizde yanıtını bulamadığım bir sorum var.", "", "• Konu: " + $("#ss-konu").value];
      var s = clean($("#ss-soru").value);
      L.push("• Sorum: " + (s || "…"));
      var ad = clean($("#ss-ad").value); if (ad) { L.push(""); L.push("Teşekkürler, " + ad); }
      return L.join("\n");
    };
    var ssUpd = function () { var m = ssBuild(); $("[data-ss-preview]").textContent = m; $("[data-ss-wa]").href = waUrl(m); if (clean($("#ss-soru").value)) $("[data-ss-error]").textContent = ""; };
    ss.addEventListener("input", ssUpd); ss.addEventListener("change", ssUpd);
    $("[data-ss-wa]").addEventListener("click", function (e) {
      if (!clean($("#ss-soru").value)) { e.preventDefault(); $("[data-ss-error]").textContent = "Önce sorunuzu yazın."; $("#ss-soru").focus(); }
    });
    $("[data-ss-copy]").addEventListener("click", function () { copyText(ssBuild(), $("[data-ss-copied]")); });
    ssUpd();
  }

  /* ---- iletişim ---- */
  var today7 = istanbulNow().d;
  $$(".hours-table tr[data-day]").forEach(function (tr) { if (+tr.getAttribute("data-day") === today7) tr.classList.add("is-today"); });
  var ac = $("[data-addr-copy]");
  if (ac) ac.addEventListener("click", function () { copyText(ac.getAttribute("data-addr"), $("[data-addr-copied]")); });
  var gl = $("[data-tool='geliyorum']");
  if (gl) {
    var glBuild = function () {
      var neden = $("#gl-neden").value, tur = $("#gl-tur").value, ad = clean($("#gl-ad").value), sahip = clean($("#gl-sahip").value);
      var ne = radioVal("gl-ne", gl);
      var L = [];
      var WITH = { "kedim": "kedimle", "köpeğim": "köpeğimle", "hayvanım": "hayvanımla" };
      var kim = ad ? tur + " " + ad + " ile" : (WITH[tur] || tur + " ile");
      if (neden === "acil") L.push("Merhaba Vetlounge, acil bir durum var, " + kim + " geliyorum. " + ne);
      else L.push("Merhaba Vetlounge, " + kim + " " + neden + " için geliyorum. " + ne);
      if (sahip) L.push("Adım: " + sahip);
      return L.join("\n");
    };
    var glUpd = function () {
      $("[data-gl-acil]", gl).hidden = $("#gl-neden").value !== "acil";
      var m = glBuild(); $("[data-gl-preview]", gl).textContent = m; $("[data-gl-wa]", gl).href = waUrl(m);
    };
    gl.addEventListener("input", glUpd); gl.addEventListener("change", glUpd);
    $("[data-gl-copy]", gl).addEventListener("click", function () { copyText(glBuild(), $("[data-gl-copied]", gl)); });
    glUpd();
  }
})();
