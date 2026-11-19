/* Çakır Giyim Terzi — site.js (bağımlılık yok) */
(function () {
  "use strict";

  var MARKA = "Çakır Giyim Terzi";
  var WA = "https://wa.me/905534674045";
  var HOURS = { "0": [["07:00", "22:00"]], "1": [["07:00", "22:00"]], "2": [["07:00", "22:00"]], "3": [["07:00", "22:00"]], "4": [["07:00", "22:00"]], "5": [["07:00", "22:00"]] };
  var CM = 96 / 2.54;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── canlı açık/kapalı (kit/status.js) ── */
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

  function durumYaz() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-gun]").forEach(function (li) { li.classList.toggle("bugun", +li.getAttribute("data-gun") === s.dayIndex); });
    $$(".cetvel .simdi").forEach(function (x) { x.remove(); });
    var satir = $('.cetvel [data-gun="' + s.dayIndex + '"] .bar');
    if (satir) {
      var i = document.createElement("i");
      i.className = "simdi"; i.style.left = (s.minutes / 1440 * 100).toFixed(2) + "%";
      satir.appendChild(i);
    }
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ── gezinme ── */
  var menuD = $(".menu-dugme"), gez = $(".gezinme");
  if (menuD && gez) {
    menuD.addEventListener("click", function () {
      var a = gez.classList.toggle("acik");
      menuD.setAttribute("aria-expanded", a ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gez.classList.contains("acik")) { gez.classList.remove("acik"); menuD.setAttribute("aria-expanded", "false"); menuD.focus(); }
    });
  }

  /* ── mezura: santim numaraları, bölüm hizalama, ibre ── */
  var page = $(".page"), tape = $(".tape"), ibre = $(".ibre b");
  var tapeAdet = -1, bekliyor = false;
  function mezura() {
    bekliyor = false;
    if (!page || !tape) return;
    var bolumler = $$("[data-bolum]", page);
    bolumler.forEach(function (s) { s.style.marginTop = ""; s.style.paddingBottom = ""; });
    var ust = page.getBoundingClientRect().top;
    bolumler.forEach(function (s, i) {
      var y = s.getBoundingClientRect().top - ust;
      var n = Math.ceil((y - 0.6) / CM), fark = n * CM - y;
      if (fark > 0.6) {
        var once = i > 0 ? bolumler[i - 1] : null;
        /* boşluk bir önceki bölümün zeminini uzatır; mezura şeridinde ve ilk bölümde üst boşluk kullanılır */
        if (once && !once.classList.contains("serit")) once.style.paddingBottom = (parseFloat(getComputedStyle(once).paddingBottom) + fark).toFixed(2) + "px";
        else s.style.marginTop = fark.toFixed(2) + "px";
      }
      var e = s.querySelector(":scope > .cm");
      if (!e) { e = document.createElement("span"); e.className = "cm"; e.setAttribute("aria-hidden", "true"); s.insertBefore(e, s.firstChild); }
      e.setAttribute("data-cm", n);
    });
    var adet = Math.floor(page.offsetHeight / CM);
    if (adet !== tapeAdet) {
      tapeAdet = adet;
      $$("i", tape).forEach(function (x) { x.remove(); });
      var f = document.createDocumentFragment();
      for (var k = 1; k <= adet; k++) {
        var i = document.createElement("i");
        i.style.setProperty("--n", k); i.setAttribute("data-n", k);
        if (k % 10 === 0) i.className = "on";
        f.appendChild(i);
      }
      tape.appendChild(f);
    }
    ibreYaz();
  }
  function ibreYaz() {
    if (!ibre || !page) return;
    var r = ibre.parentNode.getBoundingClientRect();
    var n = Math.round((r.top + r.height / 2 - page.getBoundingClientRect().top) / CM);
    ibre.setAttribute("data-n", Math.max(0, n));
  }
  function mezuraIste() { if (!bekliyor) { bekliyor = true; requestAnimationFrame(mezura); } }
  if (page && tape) {
    mezura();
    window.addEventListener("resize", mezuraIste);
    window.addEventListener("load", mezuraIste);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mezuraIste);
    if (window.ResizeObserver) new ResizeObserver(mezuraIste).observe($("main") || page);
    var kay = false;
    window.addEventListener("scroll", function () {
      if (kay) return; kay = true;
      requestAnimationFrame(function () { kay = false; ibreYaz(); });
    }, { passive: true });
  }

  /* ── ortak: WhatsApp mesajı, kopyalama ── */
  function waAdres(m) { return WA + "?text=" + encodeURIComponent(m); }
  function kopyala(metin, durum) {
    function tamam() { if (durum) { durum.textContent = "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz."; setTimeout(function () { durum.textContent = ""; }, 5000); } }
    function eski() {
      var t = document.createElement("textarea");
      t.value = metin; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); tamam(); } catch (e) { if (durum) durum.textContent = "Kopyalanamadı; mesajı elle seçip kopyalayabilirsiniz."; }
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(tamam, eski); else eski();
  }
  function aracBagla(kok, mesajKur) {
    var on = $("[data-onizleme]", kok), wa = $("[data-wa]", kok), kb = $("[data-kopya]", kok), kd = $("[data-kopya-durum]", kok);
    function yenile() {
      var m = mesajKur();
      if (on) on.textContent = m;
      if (wa) wa.href = waAdres(m);
      return m;
    }
    kok.addEventListener("input", yenile);
    kok.addEventListener("change", yenile);
    if (kb) kb.addEventListener("click", function () { kopyala(yenile(), kd); });
    if (kok.tagName === "FORM") kok.addEventListener("submit", function (e) { e.preventDefault(); });
    $$("form", kok).forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); }); });
    yenile();
    return yenile;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function sakla(anahtar, deger, kalici) { try { (kalici ? localStorage : sessionStorage).setItem(anahtar, JSON.stringify(deger)); } catch (e) { } }
  function oku(anahtar, kalici) { try { return JSON.parse((kalici ? localStorage : sessionStorage).getItem(anahtar)); } catch (e) { return null; } }

  /* ── imza araç: tıklanabilir giysi şeması ── */
  var GIYSI = {
    pantolon: {
      ad: "Pantolon", ilk: "paca",
      cizim:
        '<path class="g-o" d="M92,40 L228,40 L230,58 C237,90 241,120 238,150 L224,362 L170,364 L161,172 L159,172 L150,364 L96,362 L82,150 C79,120 83,90 90,58 Z"/>' +
        '<path class="g-d" d="M90,58 L230,58"/><path class="g-d" d="M160,58 L160,172"/>' +
        '<path class="g-d" d="M108,58 C108,80 98,98 83,106"/><path class="g-d" d="M212,58 C212,80 222,98 237,106"/>' +
        '<path class="g-df" d="M106,37 h6 v24 h-6z M138,37 h6 v24 h-6z M176,37 h6 v24 h-6z M208,37 h6 v24 h-6z"/>' +
        '<circle class="g-df" cx="166" cy="49" r="3.6"/>' +
        '<path class="g-s" d="M172,58 L172,108 Q172,124 160,130"/>' +
        '<path class="g-s" d="M122,66 L123,352 M198,66 L197,352"/>' +
        '<path class="g-s" d="M97,353 L150,355 M170,355 L223,353"/>',
      bolgeler: [
        { id: "bel", ad: "Bel", n: [222, 49], yan: "sag", ey: 50, hl: '<path d="M92,40 L228,40 L230,58 L90,58Z"/>', ol: [[88, 28, 232, 28]],
          isler: [["Bel daraltma", "Arka ortadan ya da yanlardan alınır; kemer bolluğu ve belde açılma giderilir."], ["Bel genişletme", "Arka dikişte pay varsa o kadar açılır; pay yoksa parça eklemek gerekebilir."], ["Kemer köprüsü", "Kopan ya da sökülen köprüler yeniden dikilir."], ["Bel lastiği yenileme", "Lastikli bellerde gevşeyen lastik değiştirilir."]],
          ipucu: "Bel ölçüsü, pantolonu taşıdığınız hizadan alınır; her modelde göbek hizası bel değildir." },
        { id: "fermuar", ad: "Fermuar", n: [166, 96], yan: "sag", ey: 118, hl: '<path d="M160,58 L174,58 L174,110 Q172,126 160,132Z"/>', ol: [[182, 60, 182, 130]],
          isler: [["Fermuar değişimi", "Dişi atlayan, ayrılan ya da kilidi tutmayan fermuar komple yenilenir."], ["Kürsör (elcik) değişimi", "Şerit sağlamsa yalnız kürsörü değiştirmek yetebilir."], ["Düğme ve kopça", "Bel düğmesi, çıtçıt ya da kopça yeniden takılır."]],
          ipucu: "Fermuar boyu ve kalınlığı giysiye göre seçilir; kot fermuarı ile kumaş pantolon fermuarı aynı değildir." },
        { id: "cep", ad: "Cep", n: [98, 88], yan: "sol", ey: 92, hl: '<path d="M90,58 L108,58 C108,80 98,98 83,106 C82,90 85,72 90,58Z"/>', olp: "M112,58 C112,82 101,101 85,110",
          isler: [["Cep torbası yenileme", "Delinen iç cep kumaşı değiştirilir."], ["Cep ağzı onarımı", "Sökülen, yırtılan cep ağzı sağlamlaştırılır."], ["Cep kapatma", "Açılıp formu bozan yan cepler isteğe göre kapatılır."]],
          ipucu: "Cebi delinen pantolonda çoğu zaman yalnız torba değişir; dışarıdan belli olmaz." },
        { id: "ag", ad: "Ağ", n: [160, 172], yan: "sol", ey: 178, hl: '<ellipse cx="160" cy="164" rx="30" ry="20"/>', olp: "M130,176 Q160,148 190,176",
          isler: [["Ağ onarımı", "Sürtünmeden incelen ya da açılan ağ bölgesi içten beslenerek onarılır."], ["Ağ dikişi", "Sökülen ağ dikişi yeniden ve sağlam dikilir."], ["Basen daraltma", "Kalça ve basen bolluğu arka dikişten alınır."]],
          ipucu: "Ağ onarımında besleme kumaşının rengi ve kalınlığı önemlidir; kotlarda içten besleme yapılır." },
        { id: "bacak", ad: "Bacak", n: [120, 262], yan: "sol", ey: 262, hl: '<path d="M86,210 L156,210 L152,310 L93,310Z"/>', ol: [[90, 256, 154, 256]],
          isler: [["Bacak daraltma", "Bol kesim, iç ve dış dikişten dengeli alınarak dar kesime çevrilir."], ["Diz altı daraltma", "Yalnız dizden aşağısı inceltilir; üst kısım olduğu gibi kalır."]],
          ipucu: "Daraltmada oran önemlidir: paça dizle birlikte ayarlanır ki pantolon bacakta dönmesin." },
        { id: "paca", ad: "Paça", n: [198, 358], yan: "sag", ey: 352, hl: '<path d="M172,328 L226,328 L224,362 L170,364Z"/>', ol: [[168, 374, 226, 372], [236, 328, 236, 362]],
          isler: [["Paça kısaltma", "Boy ayakkabıya göre işaretlenir; fazlası kesilip yeniden bastırılır."], ["Orijinal paça", "Kotlarda fabrikasyon paça ucu korunarak kısaltılır."], ["Paça uzatma", "İçte katlı pay varsa o kadar uzatılabilir; iz kalıp kalmayacağı kumaşa bağlıdır."], ["Duble paça", "Kumaş pantolonlarda dışa kıvrık duble yapılır; yeterli boy gerekir."]],
          ipucu: "Paça provasına, o pantolonla giyeceğiniz ayakkabıyla gelin." }
      ]
    },
    ceket: {
      ad: "Ceket", ilk: "kolboyu",
      cizim:
        '<path class="g-o" d="M96,74 C80,110 66,200 60,300 L88,306 C92,240 98,180 102,140 Z"/>' +
        '<path class="g-o" d="M224,74 C240,110 254,200 260,300 L232,306 C228,240 222,180 218,140 Z"/>' +
        '<path class="g-o" d="M140,52 L96,74 L102,140 C106,200 102,262 98,330 Q126,342 150,337 Q160,334 161,304 Q162,334 172,337 Q196,342 222,330 C218,262 214,200 218,140 L224,74 L180,52 Q160,62 140,52 Z"/>' +
        '<path class="g-ic" d="M146,60 L160,212 L174,60 Q160,68 146,60Z"/>' +
        '<path class="g-df" d="M140,52 L118,88 L130,96 L112,104 C124,150 146,192 160,212 L146,60 Z"/>' +
        '<path class="g-df" d="M180,52 L202,88 L190,96 L208,104 C196,150 174,192 160,212 L174,60 Z"/>' +
        '<path class="g-d" d="M130,96 L146,78"/><path class="g-d" d="M190,96 L174,78"/>' +
        '<path class="g-d" d="M160,212 L161,304"/>' +
        '<circle class="g-df" cx="154" cy="226" r="4.2"/><circle class="g-df" cx="154" cy="258" r="4.2"/>' +
        '<path class="g-df" d="M108,264 L140,267 L140,277 L108,274Z"/><path class="g-df" d="M212,264 L180,267 L180,277 L212,274Z"/>' +
        '<path class="g-df" d="M186,150 L208,147 L208,153 L186,156Z"/>' +
        '<circle class="g-df" cx="67" cy="292" r="2.2"/><circle class="g-df" cx="68.500" cy="283" r="2.2"/><circle class="g-df" cx="253" cy="292" r="2.2"/><circle class="g-df" cx="251.500" cy="283" r="2.2"/>' +
        '<path class="g-s" d="M126,170 L124,260 M194,170 L196,260"/>',
      bolgeler: [
        { id: "omuz", ad: "Omuz", n: [108, 70], yan: "sol", ey: 60, hl: '<path d="M140,52 L96,74 L100,96 L138,72Z"/>', ol: [[92, 64, 136, 42]],
          isler: [["Omuz daraltma", "Kol yerinden sökülür, omuz içeri alınıp kol yeniden takılır."], ["Vatka değişimi", "Çöken ya da kalın gelen vatka yenilenir, omuz hattı düzelir."]],
          ipucu: "Omuz, ceketin en zahmetli tadilatıdır. Ceket alırken önce omzun oturmasına bakın; gerisi daha kolay düzelir." },
        { id: "kol", ad: "Kol", n: [82, 196], yan: "sol", ey: 180, hl: '<path d="M77,150 L101,150 L95,240 L64,238Z"/>', ol: [[66, 200, 99, 196]],
          isler: [["Kol daraltma", "Bol gelen kol, dikiş boyunca inceltilir."], ["Kol evi ayarı", "Koltuk altındaki bolluk, kol daraltmayla birlikte toparlanır."]],
          ipucu: "Kol daraltılırken koltuk altı genişliği de birlikte değerlendirilir; yalnız bilek daralırsa kol huni gibi durur." },
        { id: "kolboyu", ad: "Kol boyu", n: [74, 296], yan: "sol", ey: 300, hl: '<path d="M62,276 L91,281 L88,306 L60,300Z"/>', olp: "M86,70 C70,108 55,200 49,300 M44,299 L54,301 M81,68 L91,72",
          isler: [["Kol kısaltma", "Kol ağzından kısaltılır; düğmeli yırtmaç varsa düğmeler yeniden yerleştirilir."], ["Kol uzatma", "İçte pay varsa o kadar uzatılır."], ["Omuzdan kısaltma", "Kol ağzında açık ilik varsa kısaltma omuzdan yapılır."]],
          ipucu: "Ceket kolu, altından gömlek manşeti bir parmak kadar görünecek boyda olursa dengeli durur." },
        { id: "yaka", ad: "Yaka", n: [198, 96], yan: "sag", ey: 70, hl: '<path d="M180,52 L202,88 L190,96 L208,104 C196,150 174,192 160,212 L174,60 Z"/>', olp: "M140,44 Q160,56 180,44",
          isler: [["Ense potluğu alma", "Yakanın arkasında, ensede toplanan fazlalık giderilir."], ["Yaka onarımı", "Yıpranan yaka altı ya da açılan yaka dikişi onarılır."]],
          ipucu: "Ensedeki potluk çoğu zaman duruşla ilgilidir; provada ayakta, doğal duruşunuzla bakılır." },
        { id: "dugme", ad: "Düğme", n: [154, 226], yan: "sag", ey: 150, hl: '<ellipse cx="154" cy="242" rx="13" ry="30"/>', ol: [[172, 226, 172, 258]],
          isler: [["Düğme dikimi", "Kopan, sallanan düğmeler saplı ve sağlam dikilir."], ["İlik onarımı", "Açılan, tiftiklenen ilik yeniden sarılır."], ["Düğme yeri kaydırma", "Küçük bolluk ya da darlıkta düğme yeri kaydırılarak ceket toparlanır."]],
          ipucu: "Yedek düğme çoğu ceketin iç etiketinde ya da iç cebinde bulunur; yanınızda getirin." },
        { id: "bel", ad: "Bel", n: [214, 222], yan: "sag", ey: 226, hl: '<path d="M104,204 L216,204 L217,242 L103,242Z"/>', ol: [[104, 222, 216, 222]],
          isler: [["Bel oyma (daraltma)", "Yan dikişlerden ve arka ortadan alınarak ceket bele oturtulur."], ["Genişletme", "Dikiş paylarının izin verdiği kadar açılır."]],
          ipucu: "Düğme iliklenince X biçiminde çekme oluyorsa ceket dar, kumaş sarkıyorsa boldur." },
        { id: "boy", ad: "Boy", n: [200, 332], yan: "sag", ey: 334, hl: '<path d="M98,306 L222,306 L222,330 Q196,342 172,337 Q162,334 161,306 Q160,334 150,337 Q126,342 98,330Z"/>', ol: [[206, 78, 206, 334]],
          isler: [["Ceket boyu kısaltma", "Etek ucundan kısaltılır; cep ve düğme dengesi korunacak kadar."], ["Astar onarımı", "Sökülen, yırtılan astar onarılır ya da yenilenir."]],
          ipucu: "Ceket boyu fazla kısaltılırsa cepler orantısız kalır; sınırı provada birlikte görmek en doğrusu." }
      ]
    },
    gomlek: {
      ad: "Gömlek", ilk: "manset",
      cizim:
        '<path class="g-o" d="M92,74 C78,120 64,200 56,288 L85,294 C90,240 96,180 100,144 Z"/>' +
        '<path class="g-o" d="M228,74 C242,120 256,200 264,288 L235,294 C230,240 224,180 220,144 Z"/>' +
        '<path class="g-o" d="M56,288 L85,294 L83,312 L54,306 Z"/><path class="g-o" d="M264,288 L235,294 L237,312 L266,306 Z"/>' +
        '<path class="g-o" d="M136,50 L92,74 L100,144 L102,326 Q118,352 160,354 Q202,352 218,326 L220,144 L228,74 L184,50 Q160,60 136,50 Z"/>' +
        '<path class="g-d" d="M136,50 Q160,40 184,50"/>' +
        '<path class="g-d" d="M153,84 L153,353"/><path class="g-d" d="M167,84 L167,353"/>' +
        '<path class="g-df" d="M136,50 L126,66 L148,92 L160,74 Z"/><path class="g-df" d="M184,50 L194,66 L172,92 L160,74 Z"/>' +
        '<circle class="g-df" cx="160" cy="104" r="2.7"/><circle class="g-df" cx="160" cy="142" r="2.7"/><circle class="g-df" cx="160" cy="180" r="2.7"/><circle class="g-df" cx="160" cy="218" r="2.7"/><circle class="g-df" cx="160" cy="256" r="2.7"/><circle class="g-df" cx="160" cy="294" r="2.7"/><circle class="g-df" cx="160" cy="332" r="2.7"/>' +
        '<path class="g-df" d="M184,132 L212,132 L212,160 L198,168 L184,160Z"/>' +
        '<circle class="g-df" cx="64" cy="301" r="1.9"/><circle class="g-df" cx="256" cy="301" r="1.9"/>' +
        '<path class="g-s" d="M104,320 Q120,345 152,347 M168,347 Q200,345 216,320"/><path class="g-s" d="M98,84 L130,60 M222,84 L190,60"/>',
      bolgeler: [
        { id: "yaka", ad: "Yaka", n: [146, 70], yan: "sol", ey: 56, hl: '<path d="M136,50 L126,66 L148,92 L160,74 L172,92 L194,66 L184,50 Q160,40 136,50Z"/>', olp: "M128,42 Q160,26 192,42",
          isler: [["Yaka çevirme", "Yıpranan yaka sökülür, sağlam yüzü dışa gelecek biçimde yeniden takılır."], ["Yaka düğmesi kaydırma", "Üst düğmenin yeri kaydırılarak yaka bir miktar rahatlatılır."]],
          ipucu: "Yaka ölçüsü, mezura ile boyun arasına bir parmak sığacak kadar pay bırakılarak alınır." },
        { id: "kol", ad: "Kol", n: [80, 190], yan: "sol", ey: 186, hl: '<path d="M74,150 L99,150 L93,238 L61,234Z"/>', ol: [[64, 192, 98, 188]],
          isler: [["Kol daraltma", "Bol kollar dikiş boyunca inceltilir."], ["Kısa kola çevirme", "Uzun kollu gömlek kısa kola çevrilir."]],
          ipucu: "Kol daraltırken dirsek hareketi için pay bırakılır; çok dar kol, kolu büktüğünüzde manşeti yukarı çeker." },
        { id: "manset", ad: "Manşet", n: [70, 300], yan: "sol", ey: 300, hl: '<path d="M56,288 L85,294 L83,312 L54,306Z"/>', olp: "M82,70 C68,118 53,200 45,290 M40,289 L50,291 M77,68 L87,72",
          isler: [["Kol boyu kısaltma", "Manşet sökülür, kol kısaltılıp manşet yeniden takılır."], ["Manşet onarımı", "Yıpranan manşet ucu onarılır ya da çevrilir."]],
          ipucu: "Gömlek kolu, kolunuz serbest dururken bilek kemiğini örtecek boyda olmalıdır." },
        { id: "dugme", ad: "Düğme", n: [160, 142], yan: "sag", ey: 120, hl: '<path d="M153,84 L167,84 L167,353 L153,353Z"/>', ol: [[176, 104, 176, 142]],
          isler: [["Düğme dikimi", "Kopan, kırılan düğmeler yenisiyle değiştirilir."], ["İlik onarımı", "Açılan ilik yeniden sarılır."], ["Gizli çıtçıt", "Göğüs hizasında açılan düğme arasına gizli çıtçıt takılır."]],
          ipucu: "Yedek düğme çoğunlukla gömleğin etek ucundaki ya da yan dikişteki etikette dikilidir." },
        { id: "beden", ad: "Beden", n: [216, 222], yan: "sag", ey: 222, hl: '<path d="M101,192 L219,192 L219,252 L101,252Z"/>', ol: [[101, 222, 219, 222]],
          isler: [["Yanlardan daraltma", "Koltuk altından etek ucuna kadar yan dikişten alınır."], ["Sırta pens", "Arkaya iki pens atılarak bel oturtulur; gömlek pantolondan taşmaz."]],
          ipucu: "Yan dikişten daraltmak kalıcıdır; pens ise ileride sökülüp eski bolluğa dönülebilir." },
        { id: "boy", ad: "Boy", n: [196, 348], yan: "sag", ey: 348, hl: '<path d="M102,314 L218,314 L218,326 Q202,352 160,354 Q118,352 102,326Z"/>', ol: [[128, 96, 128, 350]],
          isler: [["Boy kısaltma", "Etek ucu, özgün kıvrım biçimi korunarak kısaltılır."], ["Etek ucu onarımı", "Sökülen etek ucu yeniden bastırılır."]],
          ipucu: "Pantolonun dışında giyilecek gömlek, içine sokulacak olandan daha kısa tutulur." }
      ]
    },
    elbise: {
      ad: "Elbise", ilk: "boy",
      cizim:
        '<path class="g-o" d="M128,50 L142,50 Q160,100 178,50 L192,50 Q206,88 198,120 Q192,152 189,180 Q216,270 236,372 Q160,394 84,372 Q104,270 131,180 Q128,152 122,120 Q114,88 128,50Z"/>' +
        '<path class="g-d" d="M131,180 Q160,189 189,180"/>' +
        '<path class="g-d" d="M148,187 Q139,290 128,381"/><path class="g-d" d="M172,187 Q181,290 192,381"/>' +
        '<path class="g-d" d="M213,300 L224,375"/>' +
        '<path class="g-s" d="M149,183 L145,134 M171,183 L175,134"/>' +
        '<path class="g-s" d="M87,363 Q160,385 233,363"/>' +
        '<path class="g-s" d="M194,124 Q188,152 185,181 L193,212"/>',
      bolgeler: [
        { id: "omuz", ad: "Omuz", n: [134, 54], yan: "sol", ey: 52, hl: '<path d="M128,50 L142,50 L148,70 L122,70Z M178,50 L192,50 L198,70 L172,70Z"/>', ol: [[116, 48, 116, 72]],
          isler: [["Askı kısaltma", "Düşen askılar boyunuza göre kısaltılır."], ["Omuzdan alma", "Dekolte ve kol evi yukarı çekilir; göğüs hattı yerine oturur."]],
          ipucu: "Askı kısalınca dekolte de yukarı çıkar; ne kadar alınacağına ayna karşısında, provada karar verilir." },
        { id: "gogus", ad: "Göğüs", n: [140, 122], yan: "sol", ey: 118, hl: '<path d="M121,104 L199,104 L196,140 L125,140Z"/>', ol: [[122, 120, 198, 120]],
          isler: [["Göğüs daraltma", "Yan dikişten ya da penslerden alınır."], ["Pens ekleme", "Bolluk, yeni bir pensle forma sokulur."]],
          ipucu: "Astarlı elbiselerde astar da aynı ölçüde alınır; iş iki kat sayılır." },
        { id: "bel", ad: "Bel", n: [133, 181], yan: "sol", ey: 184, hl: '<path d="M129,168 L191,168 L194,196 L126,196Z"/>', ol: [[131, 180, 189, 180]],
          isler: [["Bel oturtma", "Bel dikişinden ve yanlardan alınarak elbise bele oturtulur."], ["Genişletme", "Dikiş payı kadar açılır; pay yoksa parça ekleme gibi çözümler konuşulur."]],
          ipucu: "Bel dikişi kendi belinizden yukarıda ya da aşağıda kalıyorsa söyleyin; bazen sorun genişlik değil, bel hizasıdır." },
        { id: "fermuar", ad: "Fermuar", n: [194, 150], yan: "sag", ey: 150, hl: '<path d="M190,120 L201,122 L193,180 L201,214 L190,216 L182,180Z"/>', olp: "M206,124 Q200,152 197,180 L205,212",
          isler: [["Gizli fermuar değişimi", "Ayrılan ya da takılan gizli fermuar yenilenir."], ["Kopça ve agraf", "Fermuar ucundaki kopça yeniden takılır."]],
          ipucu: "Gizli fermuar çoğu zaman bel dikişinin kalınlaştığı yerde takılır; zorlamadan önce elbiseyi daraltan başka bir şey var mı diye bakılır." },
        { id: "yirtmac", ad: "Yırtmaç", n: [216, 316], yan: "sag", ey: 300, hl: '<path d="M205,296 L224,296 L234,372 L214,378Z"/>', ol: [[228, 298, 239, 372]],
          isler: [["Yırtmaç kapatma", "Fazla açık gelen yırtmaç istenen boya kadar kapatılır."], ["Yırtmaç açma", "Adım atmayı zorlaştıran dar eteğe yırtmaç açılır."], ["Yırtmaç ucu sağlamlaştırma", "Açılmaya başlayan yırtmaç ucu sık dikişle tutturulur."]],
          ipucu: "Yırtmaç boyuna otururken karar verin; ayakta uygun görünen açıklık oturunca artar." },
        { id: "boy", ad: "Boy", n: [190, 381], yan: "sag", ey: 372, hl: '<path d="M90,350 Q160,372 230,350 L236,372 Q160,394 84,372Z"/>', ol: [[160, 194, 160, 386]],
          isler: [["Etek boyu kısaltma", "Giyeceğiniz ayakkabıyla işaretlenir, etek ucundan kısaltılır."], ["Katlı ve tül etek", "Tül, astar ve üst kat ayrı ayrı kısaltılır."], ["Etek ucu baskısı", "Sökülen etek ucu yeniden bastırılır."]],
          ipucu: "Uzun elbise boyu için provaya o gün giyeceğiniz ayakkabıyla gelin." }
      ]
    }
  };

  function kesit(a) {
    var dx = a[2] - a[0], dy = a[3] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l * 5, ny = dx / l * 5;
    function f(v) { return Math.round(v * 10) / 10; }
    return "M" + a[0] + "," + a[1] + " L" + a[2] + "," + a[3] +
      " M" + f(a[0] - nx) + "," + f(a[1] - ny) + " L" + f(a[0] + nx) + "," + f(a[1] + ny) +
      " M" + f(a[2] - nx) + "," + f(a[3] - ny) + " L" + f(a[2] + nx) + "," + f(a[3] + ny);
  }

  function semaKur(kok) {
    var liste = (kok.getAttribute("data-giysiler") || "pantolon,ceket").split(",").filter(function (k) { return GIYSI[k]; });
    var secG = liste[0], secB = GIYSI[secG].ilk;
    var fis = oku("cgt-fis") || [];
    if (!Array.isArray(fis)) fis = [];
    fis = fis.filter(function (x) { return x && GIYSI[x.g]; });

    kok.innerHTML =
      '<div class="sema-sekmeler" role="group" aria-label="Giysi seçin">' +
      liste.map(function (k) { return '<button type="button" class="sema-sekme" data-g="' + k + '" aria-pressed="false">' + GIYSI[k].ad + "</button>"; }).join("") +
      "</div>" +
      '<div class="sema-sol"><div class="sema-sahne"></div><p class="sema-nasil">Sarı noktalara ya da etiketlere dokunun; ölçü çizgisi ve iş listesi değişir.</p></div>' +
      '<div class="sema-panel" aria-live="polite"></div>' +
      '<div class="fis">' +
      '<h3>Tadilat fişiniz <small data-adet></small></h3>' +
      '<ul class="fis-liste"></ul>' +
      '<p class="fis-bos">Henüz bir iş eklemediniz. Şemada bir bölgeye dokunun, listeden “Fişe ekle”yi seçin.</p>' +
      '<label class="alan">Eklemek istediğiniz not<textarea data-not rows="2" placeholder="Örn. lacivert takım, cumartesiye lazım"></textarea></label>' +
      '<div class="onizleme-kutu"><b>WhatsApp mesajınız</b><p data-onizleme></p></div>' +
      '<div class="fis-dugmeler">' +
      '<a class="dugme" data-wa target="_blank" rel="noopener" href="' + WA + '">WhatsApp’tan gönder</a>' +
      '<button type="button" class="dugme bos" data-kopya>Mesajı kopyala</button>' +
      '<p class="kopya-durum" data-kopya-durum role="status"></p>' +
      "</div></div>";

    var sahne = $(".sema-sahne", kok), panel = $(".sema-panel", kok), fisL = $(".fis-liste", kok), fisBos = $(".fis-bos", kok), adet = $("[data-adet]", kok), not = $("[data-not]", kok);

    function bolge(g, id) { return GIYSI[g].bolgeler.filter(function (b) { return b.id === id; })[0]; }
    function fisteMi(g, b, ad) { return fis.some(function (x) { return x.g === g && x.b === b && x.ad === ad; }); }

    function mesaj() {
      var m;
      if (!fis.length) m = "Merhaba " + MARKA + ", tadilat hakkında bilgi almak istiyorum.";
      else {
        m = "Merhaba " + MARKA + ", web sitenizdeki şemadan seçtim:\n" + fis.map(function (x) {
          var b = bolge(x.g, x.b);
          return "• " + GIYSI[x.g].ad + " / " + (b ? b.ad.toLocaleLowerCase("tr") : x.b) + ": " + x.ad;
        }).join("\n");
      }
      var n = not.value.trim();
      if (n) m += "\nNot: " + n;
      if (fis.length) m += "\nBilgi verebilir misiniz?";
      return m;
    }
    var yenile = aracBagla(kok, mesaj);

    function fisCiz() {
      fisL.innerHTML = fis.map(function (x, i) {
        var b = bolge(x.g, x.b);
        return "<li><span>" + esc(x.ad) + "<small>" + esc(GIYSI[x.g].ad) + " · " + esc(b ? b.ad : "") + '</small></span><button type="button" class="fis-sil" data-sil="' + i + '" aria-label="' + esc(x.ad) + ' işini fişten çıkar"></button></li>';
      }).join("");
      fisBos.hidden = fis.length > 0;
      adet.textContent = fis.length ? fis.length + " iş" : "boş";
      sakla("cgt-fis", fis);
      yenile();
    }

    function panelCiz() {
      var g = GIYSI[secG], b = bolge(secG, secB);
      panel.innerHTML =
        '<p class="sema-yer">' + esc(g.ad) + " şeması · seçili bölge</p><h3>" + esc(b.ad) + "</h3>" +
        '<ul class="sema-isler">' + b.isler.map(function (x) {
          var v = fisteMi(secG, secB, x[0]);
          return "<li><div><strong>" + esc(x[0]) + "</strong><span>" + esc(x[1]) + '</span></div><button type="button" class="ekle" data-ekle="' + esc(x[0]) + '" aria-pressed="' + (v ? "true" : "false") + '">' + (v ? "Fişte" : "Fişe ekle") + "</button></li>";
        }).join("") + "</ul>" +
        '<p class="sema-ipucu">' + esc(b.ipucu) + "</p>";
    }

    function bolgeSec(id, odak) {
      secB = id;
      $$("[data-hl]", sahne).forEach(function (e) { e.classList.toggle("on", e.getAttribute("data-hl") === id); });
      $$("[data-kl]", sahne).forEach(function (e) { e.classList.toggle("on", e.getAttribute("data-kl") === id); });
      $$("[data-ol]", sahne).forEach(function (e) { e.classList.toggle("on", e.getAttribute("data-ol") === id); });
      $$(".g-nk", sahne).forEach(function (e) { e.classList.toggle("on", e.getAttribute("data-b") === id); });
      $$(".sema-etiket", sahne).forEach(function (e) { e.setAttribute("aria-pressed", e.getAttribute("data-b") === id ? "true" : "false"); });
      panelCiz();
      if (odak && window.matchMedia("(max-width:759px)").matches) {
        var r = panel.getBoundingClientRect();
        if (r.top > window.innerHeight - 150) window.scrollBy({ top: r.top - window.innerHeight + 230, behavior: "smooth" });
      }
    }

    function giysiSec(k) {
      secG = k;
      var g = GIYSI[k];
      $$(".sema-sekme", kok).forEach(function (e) { e.setAttribute("aria-pressed", e.getAttribute("data-g") === k ? "true" : "false"); });
      var s = '<svg class="ciz" viewBox="0 0 360 400" role="img" aria-label="' + g.ad + ' teknik çizimi; ölçü noktaları: ' + g.bolgeler.map(function (b) { return b.ad; }).join(", ") + '"><g transform="translate(20 0)">' + g.cizim;
      s += '<g class="g-hl">' + g.bolgeler.map(function (b) { return '<g data-hl="' + b.id + '">' + b.hl + "</g>"; }).join("") + "</g>";
      s += '<g class="g-kl">' + g.bolgeler.map(function (b) { return '<line data-kl="' + b.id + '" x1="' + b.n[0] + '" y1="' + b.n[1] + '" x2="' + (b.yan === "sol" ? 56 : 264) + '" y2="' + b.ey + '"/>'; }).join("") + "</g>";
      s += '<g class="g-ol">' + g.bolgeler.map(function (b) { return '<path pathLength="1" data-ol="' + b.id + '" d="' + (b.olp || "") + " " + (b.ol || []).map(kesit).join(" ") + '"/>'; }).join("") + "</g>";
      s += g.bolgeler.map(function (b, i) {
        return '<g class="g-nk" data-b="' + b.id + '" style="--i:' + i + '"><circle class="hit" cx="' + b.n[0] + '" cy="' + b.n[1] + '" r="17"/><circle class="halka" cx="' + b.n[0] + '" cy="' + b.n[1] + '" r="6"/><circle class="nokta" cx="' + b.n[0] + '" cy="' + b.n[1] + '" r="6"/></g>';
      }).join("");
      s += '<text class="g-ad" x="160" y="394" text-anchor="middle">' + g.ad.toLocaleUpperCase("tr") + " · ÖNDEN GÖRÜNÜŞ</text></g></svg>";
      s += g.bolgeler.map(function (b) {
        return '<button type="button" class="sema-etiket ' + b.yan + '" data-b="' + b.id + '" style="top:' + (b.ey / 4) + '%" aria-pressed="false">' + b.ad + "</button>";
      }).join("");
      sahne.innerHTML = s;
      $$(".g-o,.g-d,.g-df", sahne).forEach(function (e) { e.setAttribute("pathLength", "1"); });
      var svg = $("svg", sahne);
      setTimeout(function () { if (svg.isConnected) svg.classList.remove("ciz"); }, 1900);
      bolgeSec(g.ilk, false);
    }

    kok.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-g],[data-b],[data-ekle],[data-sil]") : null;
      if (!t || !kok.contains(t)) return;
      if (t.hasAttribute("data-g")) giysiSec(t.getAttribute("data-g"));
      else if (t.hasAttribute("data-b")) bolgeSec(t.getAttribute("data-b"), true);
      else if (t.hasAttribute("data-ekle")) {
        var ad = t.getAttribute("data-ekle");
        if (fisteMi(secG, secB, ad)) fis = fis.filter(function (x) { return !(x.g === secG && x.b === secB && x.ad === ad); });
        else fis.push({ g: secG, b: secB, ad: ad });
        panelCiz(); fisCiz();
        var yeni = $$(".ekle", panel).filter(function (b) { return b.getAttribute("data-ekle") === ad; })[0];
        if (yeni) yeni.focus();
      } else if (t.hasAttribute("data-sil")) {
        fis.splice(+t.getAttribute("data-sil"), 1);
        panelCiz(); fisCiz();
      }
    });

    giysiSec(secG);
    fisCiz();
  }
  $$('[data-tool="sema"]').forEach(semaKur);

  /* ── ölçü rehberi: figür + ölçü kartı ── */
  var olcu = $('[data-tool="olcu"]');
  if (olcu) {
    var adimlar = $$(".olcu-adim", olcu), simdiB = $(".olcu-simdi b", olcu), simdiS = $(".olcu-simdi span", olcu);
    var kayit = oku("cgt-olcu", true) || {};
    $$("[data-f]", olcu).forEach(function (i) { var v = kayit[i.getAttribute("data-f")]; if (v && i.tagName === "INPUT") i.value = v; });
    var etkin = null;
    var sayiYaz = function (v) { return String(v).replace(".", ","); };
    var adimSec = function (id) {
      if (etkin === id) return;
      etkin = id;
      adimlar.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-o") === id); });
      $$(".fo > *", olcu).forEach(function (e) { e.classList.toggle("on", e.getAttribute("data-o") === id); });
      var a = adimlar.filter(function (x) { return x.getAttribute("data-o") === id; })[0];
      if (a && simdiB) {
        simdiB.textContent = a.getAttribute("data-ad");
        var inp = $("input", a);
        simdiS.textContent = inp && inp.value ? "Yazdığınız: " + sayiYaz(inp.value) + " cm" : a.getAttribute("data-yer");
      }
    };
    adimlar.forEach(function (a) {
      a.addEventListener("click", function () { adimSec(a.getAttribute("data-o")); });
      a.addEventListener("focusin", function () { adimSec(a.getAttribute("data-o")); });
    });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) adimSec(e.target.getAttribute("data-o")); });
      }, { rootMargin: "-48% 0px -48% 0px" });
      adimlar.forEach(function (a) { io.observe(a); });
    }
    if (adimlar[0]) adimSec(adimlar[0].getAttribute("data-o"));
    aracBagla(olcu, function () {
      var satir = [], k = {};
      adimlar.forEach(function (a) {
        var i = $("input", a);
        if (i && i.value && +i.value > 0) { satir.push(a.getAttribute("data-ad") + ": " + sayiYaz(i.value) + " cm"); k[i.getAttribute("data-f")] = i.value; }
      });
      sakla("cgt-olcu", k, true);
      var e = etkin; etkin = null; if (e) adimSec(e);
      var is = ($("[data-is]", olcu) || {}).value || "";
      var m = "Merhaba " + MARKA + ", ";
      if (satir.length) m += "evde aldığım ölçüler şöyle:\n" + satir.join("\n"); else m += "ölçü ve dikim hakkında bilgi almak istiyorum.";
      if (is.trim()) m += "\nİstediğim iş: " + is.trim();
      if (satir.length) m += "\nBu ölçülerle ilgili bilgi verebilir misiniz?";
      return m;
    });
    var temizle = $("[data-temizle]", olcu);
    if (temizle) temizle.addEventListener("click", function () {
      $$("input[data-f]", olcu).forEach(function (i) { i.value = ""; });
      olcu.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  /* ── paça boyu ── */
  var paca = $('[data-tool="paca"]');
  if (paca) {
    var PACA = { kiriksiz: "kırıksız (ayakkabıya değip biten)", yarim: "yarım kırık (ayakkabıya hafif oturan)", tam: "tam kırık (ayakkabının üstüne yığılan)" };
    var pacaSec = function () {
      var v = ($("input[name=paca]:checked", paca) || {}).value || "yarim";
      $$("[data-pc]", paca).forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-pc") === v); });
      $$("[data-pm]", paca).forEach(function (d) { d.hidden = d.getAttribute("data-pm") !== v; });
      return v;
    };
    aracBagla(paca, function () {
      return "Merhaba " + MARKA + ", pantolon paçası kısaltılacak. Boy tercihim: " + PACA[pacaSec()] + ". Bilgi verebilir misiniz?";
    });
  }

  /* ── inç ↔ cm ── */
  var inc = $("[data-inc]"), cmx = $("[data-cmx]");
  if (inc && cmx) {
    var yaz = function (v) { return (Math.round(v * 10) / 10).toString(); };
    inc.addEventListener("input", function () { cmx.value = inc.value ? yaz(parseFloat(inc.value) * 2.54) : ""; });
    cmx.addEventListener("input", function () { inc.value = cmx.value ? yaz(parseFloat(cmx.value) / 2.54) : ""; });
  }

  /* ── SSS: arama ── */
  var ara = $("[data-sss-ara]");
  if (ara) {
    var sorular = $$(".soru"), sayi = $(".sss-sayi");
    var duz = function (s) { return s.toLocaleLowerCase("tr").replace(/[âà]/g, "a").replace(/î/g, "i").replace(/û/g, "u"); };
    var suz = function () {
      var q = duz(ara.value.trim()), n = 0;
      sorular.forEach(function (d) {
        var v = !q || duz(d.textContent).indexOf(q) > -1;
        d.hidden = !v; if (v) n++;
        if (q && v && q.length > 2) d.open = true;
      });
      $$(".sss-grup").forEach(function (g) { g.hidden = !$$(".soru", g).some(function (d) { return !d.hidden; }); });
      if (sayi) sayi.textContent = q ? (n ? n + " soru bulundu." : "Bu sözcükle eşleşen soru yok. Aşağıdan bize yazabilirsiniz.") : sorular.length + " soru var; bir sözcük yazarak süzebilirsiniz.";
    };
    ara.addEventListener("input", suz);
    suz();
  }

  /* ── soru sor (SSS) ── */
  var soru = $('[data-tool="soru"]');
  if (soru) aracBagla(soru, function () {
    var k = ($("[data-konu]", soru) || {}).value || "", s = ($("[data-soru]", soru) || {}).value || "";
    var m = "Merhaba " + MARKA + ", " + (k ? k.toLocaleLowerCase("tr") + " hakkında " : "") + "bir sorum var";
    return m + (s.trim() ? ":\n" + s.trim() : ".");
  });

  /* ── iletişim: mesaj hazırlayıcı ── */
  var ilt = $('[data-tool="iletisim"]');
  if (ilt) aracBagla(ilt, function () {
    var konu = ($("input[name=konu]:checked", ilt) || {}).value || "tadilat";
    var giysi = ($("[data-giysi]", ilt) || {}).value || "", gun = ($("[data-zaman]", ilt) || {}).value || "", n = ($("[data-not]", ilt) || {}).value || "";
    var m = "Merhaba " + MARKA + ", " + konu + " için yazıyorum.";
    if (giysi.trim()) m += "\nGetireceğim: " + giysi.trim();
    if (gun) m += "\nUğramak istediğim zaman: " + gun;
    if (n.trim()) m += "\nNot: " + n.trim();
    return m + "\nUygun musunuz?";
  });

  /* ── adres kopyalama ── */
  $$("[data-adres-kopya]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = $("[data-adres-durum]");
      kopyala(b.getAttribute("data-adres-kopya"), null);
      if (d) { d.textContent = "Adres kopyalandı."; setTimeout(function () { d.textContent = ""; }, 4000); }
    });
  });
})();
