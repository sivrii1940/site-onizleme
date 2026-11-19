/* Mir Davetiye ve Matbaa — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var HOURS = { "0": [["08:30", "19:00"]], "1": [["08:30", "19:00"]], "2": [["08:30", "19:00"]], "3": [["08:30", "19:00"]], "4": [["08:30", "19:00"]], "5": [["09:00", "16:00"]] };
  var WA = "https://wa.me/905324142480";
  var BRAND = "Mir Davetiye ve Matbaa";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Açık/kapalı (kit/status.js'ten kopya) ---------- */
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
  function val(el) { return el ? String(el.value || "").trim() : ""; }
  function radio(form, name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ""; }
  function upTR(s) { try { return s.toLocaleUpperCase("tr-TR"); } catch (e) { return s.toUpperCase(); } }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }

  function copyText(text, btn, note) {
    function done(ok) {
      if (note) note.textContent = ok ? "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın.";
      if (btn) { var t = btn.getAttribute("data-label") || btn.textContent; btn.setAttribute("data-label", t); }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try {
        var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy"); document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
  }

  /* ---------- Tarih yardımcıları ---------- */
  var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var GUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return null; var d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d) ? null : d; }
  function fmtDate(d, withDay) { return d.getDate() + " " + AY[d.getMonth()] + " " + d.getFullYear() + (withDay === false ? "" : " " + GUN[d.getDay()]); }
  function fmtShort(d) { return d.getDate() + " " + AY[d.getMonth()]; }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function today0() { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function fmtTime(s) { return s ? s.replace(":", ".") : ""; }

  /* ---------- Canlı durum + bugünün satırı ---------- */
  var ST = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) { el.textContent = ST.text; el.classList.toggle("is-open", ST.open); });
  $$("[data-hours] tr[data-day]").forEach(function (tr) { if (+tr.getAttribute("data-day") === ST.dayIndex) tr.classList.add("today"); });

  /* ---------- Gezinme ---------- */
  var tog = $(".nav-toggle"), nav = $("#menu");
  if (tog && nav) {
    var setNav = function (open) { nav.classList.toggle("is-open", open); tog.setAttribute("aria-expanded", open ? "true" : "false"); };
    tog.addEventListener("click", function (e) { e.stopPropagation(); setNav(!nav.classList.contains("is-open")); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target)) setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); tog.focus(); } });
  }

  /* ---------- Hero zarfı ---------- */
  var env = $("#heroEnv");
  if (env) {
    var envBtn = $('[data-env-toggle="heroEnv"]');
    var closingTimer = null;
    var setLabel = function () { if (envBtn) envBtn.textContent = env.classList.contains("is-open") ? "Zarfı kapat" : "Zarfı aç"; };
    var openEnv = function () { clearTimeout(closingTimer); env.classList.remove("is-closing"); env.classList.add("is-open"); setLabel(); };
    var closeEnv = function () {
      env.classList.remove("is-open"); env.classList.add("is-closing"); setLabel();
      closingTimer = setTimeout(function () { env.classList.remove("is-closing"); }, REDUCED ? 30 : 1800);
    };
    setLabel();
    if (REDUCED) openEnv(); else setTimeout(openEnv, 450);
    if (envBtn) envBtn.addEventListener("click", function () { env.classList.contains("is-open") ? closeEnv() : openEnv(); });
    var seal = $(".env__seal", env);
    if (seal) seal.addEventListener("click", function () { if (!env.classList.contains("is-open")) openEnv(); });
    var card = $("#heroCard");
    $$("[data-card-style]").forEach(function (b) {
      b.addEventListener("click", function () {
        var st = b.getAttribute("data-card-style");
        card.classList.remove("st-murdum", "st-fildisi", "st-pudra"); card.classList.add(st);
        $$("[data-card-style]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (!env.classList.contains("is-open")) openEnv();
      });
    });
  }

  /* =========================================================
     CANLI DAVETİYE ÖNİZLEME
     ========================================================= */
  var TYPES = {
    dugun: { ad: "Düğün", kicker: "Düğünümüze davetlisiniz", pair: true, ex: ["Ayşe", "Mehmet"], l1: "Gelinin adı", l2: "Damadın adı", f1: "Gelin tarafı (aile adları)", f2: "Damat tarafı (aile adları)", fam2: true,
      texts: ["Hayatımızı birleştirdiğimiz bu mutlu günde sizleri de aramızda görmekten onur duyarız.", "Bir ömür sürecek yolculuğumuzun ilk adımında sevincimizi sizinle paylaşmak isteriz.", "Allah'ın izniyle yuvamızı kuruyoruz; bu güzel günümüzde sizleri de aramızda görmek isteriz."] },
    nisan: { ad: "Nişan", kicker: "Nişanımıza davetlisiniz", pair: true, ex: ["Ayşe", "Mehmet"], l1: "Kızın adı", l2: "Erkeğin adı", f1: "Kız tarafı (aile adları)", f2: "Erkek tarafı (aile adları)", fam2: true,
      texts: ["Ailelerimizin rızası ve sevdiklerimizin duasıyla nişanlanıyoruz; bu mutlu günümüzde sizi de yanımızda görmek isteriz.", "Yüzüklerimizin takılacağı bu güzel günde sevincimize ortak olmanızı dileriz."] },
    soz: { ad: "Söz", kicker: "Söz merasimimize davetlisiniz", pair: true, ex: ["Ayşe", "Mehmet"], l1: "Kızın adı", l2: "Erkeğin adı", f1: "Kız tarafı (aile adları)", f2: "Erkek tarafı (aile adları)", fam2: true,
      texts: ["İki ailenin bir araya geleceği söz merasimimizde sizleri de aramızda görmek isteriz.", "Hayırlı bir başlangıç için söz kesiyoruz; bu özel günde yanımızda olmanızı dileriz."] },
    kina: { ad: "Kına", kicker: "Kına gecemize davetlisiniz", pair: false, ex: ["Ayşe"], l1: "Gelinin adı", f1: "Gelinin ailesi (anne ve baba)", fam2: false,
      texts: ["Kızımız için düzenlediğimiz kına gecesinde sizleri de aramızda görmekten mutluluk duyarız.", "Gelinimizin ellerine kına yakılacak bu gecede bizimle olmanızı isteriz."] },
    sunnet: { ad: "Sünnet", kicker: "Sünnet düğünümüze davetlisiniz", pair: false, ex: ["Yusuf"], l1: "Çocuğun adı", f1: "Anne ve baba", fam2: false,
      texts: ["Oğlumuzun sünnet düğününde sizleri de aramızda görmekten mutluluk duyarız.", "Şehzademiz erkekliğe ilk adımını atıyor; bu sevinçli günümüzde bizimle olun."] },
    dogum: { ad: "Doğum günü", kicker: "Doğum günü partisine davetlisin!", pair: false, ex: ["Deniz"], l1: "Doğum günü olanın adı", f1: "Davet eden (isteğe bağlı)", fam2: false, age: true,
      texts: ["Pastamızı birlikte kesmek, mumları birlikte üflemek için seni de bekliyoruz!", "Yeni yaşımı sevdiklerimle kutlamak istiyorum; gelirsen çok sevinirim."] }
  };
  var STYLE_NAMES = { "st-murdum": "Klasik Mürdüm", "st-fildisi": "Fildişi Dantel", "st-pudra": "Pudra Modern" };

  var pv = $("#pvForm");
  if (pv) {
    var q = new URLSearchParams(location.search);
    var el = function (id) { return document.getElementById(id); };
    var card = el("pvCard"), box = el("pvBox"), menv = el("pvEnv"), sealBtn = el("pvSealBtn");
    var selMetin = el("metin"), ozel = el("ozelMetin"), ozelWrap = el("ozelWrap");

    var fillTexts = function (type, keepIdx) {
      var t = TYPES[type], prev = keepIdx != null ? keepIdx : 0;
      selMetin.innerHTML = "";
      t.texts.forEach(function (s, i) { var o = document.createElement("option"); o.value = String(i); o.textContent = "Kalıp " + (i + 1) + ": " + (s.length > 48 ? s.slice(0, 46) + "…" : s); selMetin.appendChild(o); });
      var own = document.createElement("option"); own.value = "own"; own.textContent = "Kendi metnimi yazacağım"; selMetin.appendChild(own);
      selMetin.value = prev < t.texts.length ? String(prev) : "0";
    };

    // URL'den gelenler
    if (q.get("tur") && TYPES[q.get("tur")]) { var r0 = pv.querySelector('input[name="tur"][value="' + q.get("tur") + '"]'); if (r0) r0.checked = true; }
    if (q.get("ad1")) el("ad1").value = q.get("ad1").slice(0, 24);
    if (q.get("ad2")) el("ad2").value = q.get("ad2").slice(0, 24);
    var curType = radio(pv, "tur") || "dugun";
    fillTexts(curType, q.get("metin") ? Math.max(0, parseInt(q.get("metin"), 10) - 1) : 0);

    var render = function () {
      var type = radio(pv, "tur") || "dugun", t = TYPES[type];
      if (type !== curType) { curType = type; fillTexts(type, 0); }
      // alan etiketleri
      el("ad1lbl").textContent = t.l1;
      el("ad2wrap").hidden = !t.pair;
      if (t.pair) el("ad2lbl").textContent = t.l2;
      el("f1lbl").textContent = t.f1;
      el("aile2wrap").hidden = !t.fam2;
      if (t.fam2) el("f2lbl").textContent = t.f2;
      el("yaswrap").hidden = !t.age;
      ozelWrap.hidden = selMetin.value !== "own";

      var a1 = val(el("ad1")), a2 = t.pair ? val(el("ad2")) : "";
      var example = !a1 || (t.pair && !a2);
      var n1 = a1 || t.ex[0], n2 = t.pair ? (a2 || t.ex[1]) : "";
      var namesEl = el("pvNames");
      namesEl.innerHTML = "";
      var s1 = document.createElement("span"); s1.textContent = n1; namesEl.appendChild(s1);
      if (t.pair) {
        var amp = document.createElement("span"); amp.className = "amp"; amp.textContent = "&"; namesEl.appendChild(amp);
        var s2 = document.createElement("span"); s2.textContent = n2; namesEl.appendChild(s2);
      }
      var fam1 = val(el("aile1")), fam2 = t.fam2 ? val(el("aile2")) : "";
      var famEl = el("pvFam");
      famEl.hidden = !fam1 && !fam2;
      el("pvFam1").textContent = fam1; el("pvFam2").textContent = fam2;

      var kicker = t.kicker, yas = val(el("yas"));
      if (t.age && yas) kicker = n1 + " " + yas + " yaşına giriyor!";
      el("pvKicker").textContent = kicker;

      var text = selMetin.value === "own" ? (val(ozel) || "Davet metninizi soldaki kutuya yazın.") : t.texts[+selMetin.value || 0];
      el("pvText").textContent = text;

      var d = parseDate(val(el("tarih"))), tm = val(el("saat"));
      var dateTxt = d ? fmtDate(d) : "5 Haziran 2027 Cumartesi";
      if (tm) dateTxt += " · Saat " + fmtTime(tm); else if (!d) dateTxt += " · Saat 19.30";
      el("pvDate").textContent = dateTxt;
      el("pvDate").classList.toggle("is-ph", !d);
      el("dayHint").textContent = d ? "Seçtiğiniz gün: " + GUN[d.getDay()] + ". Davetiyede tarih ile gün adının uyuştuğundan emin olun." : "Tarihi seçince gün adı kendiliğinden yazılır.";

      var place = val(el("yer"));
      el("pvPlace").textContent = place || "[Salon ya da mekân adı · semt]";
      el("pvPlace").classList.toggle("is-ph", !place);

      var exampleAny = example || !d;
      el("pvTag").textContent = exampleAny ? "Örnek bilgiler" : "Taslak önizleme";

      var st = radio(pv, "stil") || "st-fildisi";
      card.className = "icard " + st;
      menv.className = "mini-env " + st;
      var ini = t.pair ? (upTR(n1.charAt(0)) + "·" + upTR(n2.charAt(0))) : upTR(n1.charAt(0));
      el("pvSealTxt").textContent = ini;

      // mesaj
      var lines = ["Merhaba " + BRAND + ",", "Sitenizdeki canlı önizlemeyle bir davetiye taslağı hazırladım.", ""];
      lines.push("Davet türü: " + t.ad);
      lines.push((t.pair ? "Adlar: " : "Ad: ") + (example ? "(henüz yazmadım)" : (t.pair ? a1 + " & " + a2 : a1)));
      if (t.age && yas) lines.push("Yaş: " + yas);
      if (fam1 || fam2) lines.push("Aile adları: " + [fam1, fam2].filter(Boolean).join(" / "));
      lines.push("Tarih: " + (d ? fmtDate(d) : "(henüz belli değil)") + (tm ? ", saat " + fmtTime(tm) : ""));
      if (place) lines.push("Yer: " + place);
      lines.push("Stil: " + STYLE_NAMES[st]);
      lines.push("Metin: \"" + (selMetin.value === "own" ? (val(ozel) || "(kendi metnimi yazacağım)") : text) + "\"");
      var adet = val(el("adet")); if (adet) lines.push("Tahmini adet: " + adet);
      lines.push("", "Bu havaya yakın modelleri ve fiyat bilgisini öğrenmek istiyorum.");
      var msg = lines.join("\n");
      el("pvMsg").textContent = msg;
      el("pvWa").href = waHref(msg);
      pv._msg = msg;
    };
    pv.addEventListener("input", render);
    pv.addEventListener("change", render);
    pv.addEventListener("submit", function (e) { e.preventDefault(); });
    el("pvCopy").addEventListener("click", function () { copyText(pv._msg || "", this, el("pvCopied")); });
    sealBtn.addEventListener("click", function () {
      var sealed = box.classList.toggle("is-sealed");
      sealBtn.textContent = sealed ? "Kartı zarftan çıkar" : "Kartı zarfa koy";
      sealBtn.setAttribute("aria-pressed", sealed ? "true" : "false");
    });
    render();
  }

  /* =========================================================
     ZARF ADRESİ OLUŞTURUCU
     ========================================================= */
  var zt = $("#zarfForm");
  if (zt) {
    var g = function (id) { return document.getElementById(id); };
    var zrender = function () {
      var kime = radio(zt, "kime") || "tek";
      g("zEsWrap").hidden = kime !== "cift";
      g("zUnvanWrap").hidden = kime !== "unvan";
      g("zAdLbl").textContent = kime === "cocuk" ? "Çocuğun adı" : "Ad soyad";
      var ad = val(g("zAd")), ex = !ad, caps = "";
      if (ex) ad = kime === "cocuk" ? "Deniz" : "Ahmet Yılmaz";
      if (g("zBuyuk").checked && kime !== "cocuk") {
        var parts = ad.split(/\s+/); if (parts.length > 1) { caps = upTR(parts.pop()); ad = parts.join(" ") + " " + caps; }
      }
      var es = val(g("zEs")) || (ex || kime === "cift" ? "Ayşe" : "");
      var line;
      if (kime === "tek") line = "Sayın " + ad;
      else if (kime === "cift") line = "Sayın " + es + " – " + ad;
      else if (kime === "aile") line = "Sayın " + ad + " ve Ailesi";
      else if (kime === "unvan") line = "Sayın " + (g("zUnvan").value || "Dr.") + " " + ad;
      else line = "Sevgili " + ad.split(/\s+/)[0];
      var nm = g("zName"); nm.textContent = "";
      var cut = caps ? line.lastIndexOf(caps) : -1;
      if (cut > -1) {
        nm.appendChild(document.createTextNode(line.slice(0, cut)));
        var cs = document.createElement("span"); cs.className = "caps"; cs.textContent = caps; nm.appendChild(cs);
        nm.appendChild(document.createTextNode(line.slice(cut + caps.length)));
      } else nm.textContent = line;
      var adr = val(g("zAdres"));
      var lines = adr ? adr.split(/\n+/).slice(0, 3) : [];
      var box = g("zLines"); box.innerHTML = "";
      (lines.length ? lines : ["", ""]).forEach(function (l) { var p = document.createElement("p"); p.className = "to-line"; p.textContent = l; box.appendChild(p); });
      g("zEx").hidden = !(ex || (kime === "cift" && !val(g("zEs"))));
      g("zOut").textContent = line + (lines.length ? "\n" + lines.join("\n") : "");
    };
    zt.addEventListener("input", zrender); zt.addEventListener("change", zrender);
    zt.addEventListener("submit", function (e) { e.preventDefault(); });
    g("zCopy").addEventListener("click", function () { copyText(g("zOut").textContent, this, g("zCopied")); });
    zrender();
  }

  /* =========================================================
     ÖLÇÜ VE ZARF EŞLEŞTİRİCİ
     ========================================================= */
  var sz = $("#sizeForm");
  if (sz) {
    var SIZES = {
      kartvizit: { ad: "Kartvizit", w: 85, h: 55, zarf: null, zarfAd: "Zarf gerekmez", kul: "Kartvizit; küçük hediye ya da teşekkür kartı", not: "Türkiye'de 85 × 55 mm yaygındır; 90 × 50 mm de kullanılır." },
      a6: { ad: "A6", w: 105, h: 148, zarf: [114, 162], zarfAd: "C6 zarf · 114 × 162 mm", kul: "Davetiye, ek kart (kına, LCV), teşekkür kartı, küçük el ilanı", not: "A4 sayfanın dörtte biri kadardır." },
      a5: { ad: "A5", w: 148, h: 210, zarf: [162, 229], zarfAd: "C5 zarf · 162 × 229 mm", kul: "Davetiye, el ilanı, menü, broşür", not: "A4 sayfanın yarısıdır." },
      dl: { ad: "DL (uzun)", w: 99, h: 210, zarf: [110, 220], zarfAd: "DL zarf · 110 × 220 mm", kul: "Uzun davetiye, broşür, üçe katlanmış A4", not: "A4 sayfa üçe katlanınca DL ölçüsüne yaklaşır." },
      kare: { ad: "Kare", w: 150, h: 150, zarf: [160, 160], zarfAd: "Kare zarf · yaklaşık 160 × 160 mm", kul: "Kare davetiye, tebrik kartı", not: "Kare ölçüler standart değildir; zarfı kartla birlikte seçin." },
      a4: { ad: "A4", w: 210, h: 297, zarf: [229, 324], zarfAd: "C4 zarf · 229 × 324 mm (katlamadan)", kul: "Antetli kâğıt, broşür, bilgi formu", not: "Üçe katlanırsa DL zarfa da girer." }
    };
    var svg = $("#szSvg");
    var NS = "http://www.w3.org/2000/svg";
    var mk = function (tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; };
    var srender = function () {
      var k = radio(sz, "olcu") || "a5", s = SIZES[k];
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var W = 360, H = 360, cx = W / 2, cy = H / 2;
      // A4 başvuru
      svg.appendChild(mk("rect", { x: cx - 105, y: cy - 148.5, width: 210, height: 297, fill: "none", stroke: "#2E1F2B", "stroke-opacity": ".22", "stroke-dasharray": "2 4" }));
      var ref = mk("text", { x: cx - 101, y: cy - 138, "font-size": "9", fill: "#6B5563", "font-family": "Karla, sans-serif" }); ref.textContent = "A4 çerçevesi"; svg.appendChild(ref);
      if (s.zarf) {
        var zw = s.zarf[0], zh = s.zarf[1];
        svg.appendChild(mk("rect", { x: cx - zw / 2, y: cy - zh / 2, width: zw, height: zh, fill: "#EBDCD0", "fill-opacity": ".75", stroke: "#5B2A4E", "stroke-width": "1.2", "stroke-dasharray": "5 3", rx: 1.5 }));
        var zt2 = mk("text", { x: cx, y: cy + zh / 2 + 13, "font-size": "10", "text-anchor": "middle", fill: "#5B2A4E", "font-family": "Karla, sans-serif", "font-weight": "700" }); zt2.textContent = "zarf " + zw + " × " + zh; svg.appendChild(zt2);
      }
      svg.appendChild(mk("rect", { x: cx - s.w / 2, y: cy - s.h / 2, width: s.w, height: s.h, fill: "#FFFDF8", stroke: "#C6A15B", "stroke-width": "1.6" }));
      svg.appendChild(mk("rect", { x: cx - s.w / 2 + 5, y: cy - s.h / 2 + 5, width: s.w - 10, height: s.h - 10, fill: "none", stroke: "#C6A15B", "stroke-opacity": ".5", "stroke-width": ".6" }));
      var t = mk("text", { x: cx, y: cy + 4, "font-size": s.w < 100 ? "11" : "14", "text-anchor": "middle", fill: "#5B2A4E", "font-family": "Petrona, serif", "font-style": "italic" }); t.textContent = s.w + " × " + s.h + " mm"; svg.appendChild(t);
      svg.setAttribute("aria-label", s.ad + " ölçüsü, " + s.w + " × " + s.h + " milimetre; " + s.zarfAd);
      $("#szName").textContent = s.ad;
      $("#szDim").textContent = s.w + " × " + s.h + " mm";
      $("#szZarf").textContent = s.zarfAd;
      $("#szKul").textContent = s.kul;
      $("#szNot").textContent = s.not;
    };
    sz.addEventListener("change", srender);
    srender();
  }

  /* =========================================================
     DOSYA KONTROL LİSTESİ
     ========================================================= */
  $$("[data-checklist]").forEach(function (list) {
    var boxes = $$('input[type="checkbox"]', list);
    var bar = $(".progress-bar i", list.parentNode), out = $(".progress output", list.parentNode), fin = $("[data-check-done]", list.parentNode);
    var upd = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (bar) bar.style.width = (n / boxes.length * 100) + "%";
      if (out) out.textContent = n + " / " + boxes.length;
      boxes.forEach(function (b) { b.closest("label").classList.toggle("done", b.checked); });
      if (fin) fin.hidden = n !== boxes.length;
    };
    list.addEventListener("change", upd); upd();
  });

  /* =========================================================
     SİPARİŞ ÖN FORMU
     ========================================================= */
  var of = $("#orderForm");
  if (of) {
    var o = function (id) { return document.getElementById(id); };
    var WINDOWS = { // dağıtım aralığı: etkinlikten kaç gün önce [en erken, en geç]
      "Düğün davetiyesi": [42, 21], "Sünnet davetiyesi": [35, 21], "Nişan davetiyesi": [21, 10], "Söz davetiyesi": [21, 7],
      "Kına davetiyesi": [42, 21], "Doğum günü davetiyesi": [14, 7]
    };
    var calc = function () {
      var n = ["h1", "h2", "h3"].reduce(function (a, id) { return a + (parseInt(o(id).value, 10) || 0); }, 0);
      var y = parseInt(o("h4").value, 10); if (isNaN(y)) y = n ? Math.max(5, Math.round(n * 0.05)) : 0;
      o("calcTotal").textContent = n + y;
      o("calcYedek").textContent = n ? "(" + y + " yedek dahil)" : "";
      return n + y;
    };
    o("calcApply").addEventListener("click", function () { var t = calc(); if (t) { o("adet").value = t; orender(); o("adet").focus(); } });
    var plan = function (job) {
      var list = o("plan"), d = parseDate(val(o("etkinlik"))), w = WINDOWS[job];
      list.innerHTML = "";
      var note = o("planNote");
      var add = function (date, title, desc) {
        var li = document.createElement("li");
        li.innerHTML = '<span class="pm"><span><b></b><span></span></span></span><div><div class="tl-t"></div><div class="tl-d"></div></div>';
        li.querySelector("b").textContent = date ? date.getDate() : "?";
        li.querySelector(".pm span span").textContent = date ? AY[date.getMonth()] : "tarih";
        if (!date) li.className = "is-empty";
        li.querySelector(".tl-t").textContent = title; li.querySelector(".tl-d").textContent = desc;
        list.appendChild(li);
      };
      if (!d) {
        note.textContent = "Etkinlik tarihini seçin; dağıtım için genel teamüle göre bir takvim çıkaralım.";
        add(null, "Dağıtıma başlama", "Etkinlik tarihine göre hesaplanır.");
        add(null, "Son dağıtım", "Davetlilerin hazırlanabilmesi için en geç tarih.");
        add(null, "Etkinlik günü", "Formdan seçeceğiniz tarih.");
        return "";
      }
      var t0 = today0(), left = Math.round((d - t0) / 864e5);
      if (left < 0) { note.textContent = "Seçtiğiniz tarih geçmişte görünüyor; lütfen tarihi kontrol edin."; return ""; }
      note.textContent = "Etkinliğe " + left + " gün var. Aşağıdaki tarihler genel teamüle dayanan önerilerdir; baskı ve teslim gününü siparişte sorun.";
      if (w) {
        var a = addDays(d, -w[0]), b = addDays(d, -w[1]);
        add(a, "Dağıtıma başlama", "Davetiyelerin elinizde olması için iyi bir hedef: " + fmtDate(a));
        add(b, "Son dağıtım", "Davetlilerin hazırlanabilmesi için en geç bu tarihe kadar: " + fmtDate(b));
        if (a < t0) note.textContent += " Önerilen dağıtım başlangıcı geçmiş; siparişi bir an önce konuşmanız iyi olur.";
      }
      add(d, "Etkinlik günü", fmtDate(d));
      return d;
    };
    var orender = function () {
      calc();
      var job = radio(of, "is") || "Düğün davetiyesi";
      var d = plan(job);
      var adet = val(o("adet")), teslim = parseDate(val(o("teslim")));
      var stil = radio(of, "stil2"), dosya = radio(of, "dosya");
      var detay = $$('input[name="detay"]:checked', of).map(function (x) { return x.value; });
      var ad = val(o("adsoyad")), not = val(o("not"));
      var L = ["Merhaba " + BRAND + ",", "Sitenizdeki sipariş formundan yazıyorum.", ""];
      L.push("İş: " + job);
      L.push("Adet: " + (adet || "(henüz belli değil)"));
      if (d) L.push("Etkinlik tarihi: " + fmtDate(d));
      if (teslim) L.push("Elimde olmasını istediğim tarih: " + fmtDate(teslim));
      if (stil) L.push("Stil tercihi: " + stil);
      if (detay.length) L.push("Merak ettiğim detaylar: " + detay.join(", "));
      if (dosya) L.push("Tasarım: " + dosya);
      if (not) L.push("Not: " + not);
      L.push("", "Fiyat ve teslim günü hakkında bilgi alabilir miyim?");
      if (ad) L.push("", ad);
      var msg = L.join("\n");
      o("orMsg").textContent = msg; o("orWa").href = waHref(msg); of._msg = msg;
    };
    of.addEventListener("input", orender); of.addEventListener("change", orender);
    of.addEventListener("submit", function (e) { e.preventDefault(); });
    o("orCopy").addEventListener("click", function () { copyText(of._msg || "", this, o("orCopied")); });
    var qs = new URLSearchParams(location.search);
    if (qs.get("is")) { var rr = of.querySelector('input[name="is"][value="' + qs.get("is") + '"]'); if (rr) rr.checked = true; }
    orender();
  }

  /* =========================================================
     HIZLI SORU (İletişim)
     ========================================================= */
  var qf = $("#quickForm");
  if (qf) {
    var qrender = function () {
      var konu = radio(qf, "konu") || "Davetiye modellerini görmek istiyorum";
      var note = val($("#qNot")), ad = val($("#qAd"));
      var L = ["Merhaba " + BRAND + ",", konu + "."];
      if (note) L.push(note);
      if (ad) L.push("", ad);
      var msg = L.join("\n");
      $("#qMsg").textContent = msg; $("#qWa").href = waHref(msg); qf._msg = msg;
    };
    qf.addEventListener("input", qrender); qf.addEventListener("change", qrender);
    qf.addEventListener("submit", function (e) { e.preventDefault(); });
    $("#qCopy").addEventListener("click", function () { copyText(qf._msg || "", this, $("#qCopied")); });
    qrender();
  }
})();
