/* Efsane Çiçekçilik · site.js
   Canlı açık/kapalı durumu, büyüyen buket, buket tarif formu, kontrol listesi, hızlı soru. Kütüphane yok. */
(function () {
  "use strict";

  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["09:30", "22:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };
  var WA_BASE = "https://wa.me/905349861717";
  var GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- açık/kapalı durumu (kit/status.js) ---- */
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
      var kap = el.closest(".durum") || el;
      kap.classList.toggle("is-open", s.open);
      kap.classList.toggle("is-closed", s.known && !s.open);
    });
    $$("[data-gun]").forEach(function (el) {
      el.classList.toggle("bugun", parseInt(el.getAttribute("data-gun"), 10) === s.dayIndex);
    });
    $$("[data-hafta]").forEach(function (h) {
      var iz = $('[data-gun="' + s.dayIndex + '"] .hafta-iz', h);
      if (!iz) return;
      var isaret = $(".hafta-simdi", h);
      if (!isaret) { isaret = document.createElement("b"); isaret.className = "hafta-simdi"; isaret.title = "Şu an"; }
      iz.appendChild(isaret);
      isaret.style.left = (s.minutes / 14.4).toFixed(2) + "%";
    });
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ---- gezinme ---- */
  var menuDugme = $(".menu-dugme"), sayfalar = $("#sayfalar");
  function menuKapat() { if (sayfalar) sayfalar.classList.remove("acik"); if (menuDugme) menuDugme.setAttribute("aria-expanded", "false"); }
  if (menuDugme && sayfalar) {
    menuDugme.addEventListener("click", function () {
      var acik = sayfalar.classList.toggle("acik");
      menuDugme.setAttribute("aria-expanded", acik ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { menuKapat(); } });
    document.addEventListener("click", function (e) {
      if (!sayfalar.contains(e.target) && !menuDugme.contains(e.target)) menuKapat();
    });
  }
  function sekmeIsaretle() {
    var h = location.hash.replace("#", "");
    $$(".sekme").forEach(function (a) {
      var esit = document.body.getAttribute("data-sayfa") === "buketler" && h && a.getAttribute("href").split("#")[1] === h;
      if (esit) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  sekmeIsaretle();
  window.addEventListener("hashchange", sekmeIsaretle);

  /* ---- kaydırınca çizilen sarmaşıklar ---- */
  var cizilecek = $$("[data-ciz]");
  function cizKontrol() {
    var h = window.innerHeight || 800;
    cizilecek.forEach(function (el) {
      if (!el.classList.contains("cizildi") && el.getBoundingClientRect().top < h * 0.86) el.classList.add("cizildi");
    });
  }
  if (cizilecek.length) {
    window.addEventListener("scroll", cizKontrol, { passive: true });
    window.addEventListener("resize", cizKontrol);
    cizKontrol();
  }

  /* ---- büyüyen buket ---- */
  function yenidenBuyut(svg) {
    if (!svg) return;
    svg.classList.remove("buyu");
    void svg.getBoundingClientRect();
    svg.classList.add("buyu");
  }
  var sahne = $("[data-buket-sahne]");
  if (sahne) {
    var paletAd = $("[data-palet-ad]", sahne), paletGit = $("[data-palet-git]", sahne);
    $$("[data-palet-sec]", sahne).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-palet-sec");
        sahne.setAttribute("data-palet", p);
        $$("[data-palet-sec]", sahne).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (paletAd) paletAd.textContent = b.getAttribute("data-ad");
        if (paletGit) paletGit.setAttribute("href", "siparis.html?renk=" + encodeURIComponent(p));
        yenidenBuyut($(".buket-svg", sahne));
      });
    });
  }

  /* ---- ortak: panoya kopyalama ---- */
  function kopyala(metin, durumEl) {
    function bitti(ok) { if (durumEl) durumEl.textContent = ok ? "Mesaj kopyalandı. Dilediğiniz yere yapıştırabilirsiniz." : "Kopyalanamadı; mesajı elle seçip kopyalayın."; }
    function eski() {
      try {
        var t = document.createElement("textarea");
        t.value = metin; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(t); bitti(ok);
      } catch (e) { bitti(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(function () { bitti(true); }, eski);
    else eski();
  }
  function waAdres(metin) { return WA_BASE + "?text=" + encodeURIComponent(metin); }

  /* ---- buket tarif formu ---- */
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function gunEkle(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
  function isoCoz(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; }
  function tarihYazi(d) { return d.getDate() + " " + AYLAR[d.getMonth()] + " " + d.getFullYear() + " " + GUNLER[d.getDay()]; }
  function binlik(s) { return String(parseInt(s, 10)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function butceYazi(ham) {
    var t = (ham || "").replace(/tl|₺|lira/gi, "").trim();
    if (!t) return "";
    var parca = t.split(/\s*[-–]\s*/).map(function (x) { return x.replace(/[.\s]/g, ""); });
    if (parca.length <= 2 && parca.every(function (x) { return /^\d{1,7}$/.test(x); })) return parca.map(binlik).join("–") + " TL";
    return t + " TL";
  }

  var tarif = $('[data-tool="buket-tarif"]');
  if (tarif) {
    var form = $("form", tarif), ozet = $("[data-ozet]", tarif), mesajEl = $("[data-mesaj]", tarif), waEl = $("[data-wa-gonder]", tarif);
    var tarihEl = form.elements["tarih"], notEl = form.elements["not"], yerSatir = $("[data-yer-satir]", tarif);
    var yapraklar = $$(".ys", tarif), yaprakYazi = $("[data-yaprak-yazi]", tarif), tarihNot = $("[data-tarih-not]", tarif);
    var TARIH_NOT = tarihNot.textContent, sonPalet = ozet.getAttribute("data-palet"), sonMesaj = "";
    tarihEl.min = iso(gunEkle(0));

    try {
      var q = new URLSearchParams(location.search);
      ["vesile", "renk", "bicim"].forEach(function (ad) {
        var v = q.get(ad); if (!v) return;
        $$('input[name="' + ad + '"]', form).forEach(function (i) { if (i.value === v) i.checked = true; });
      });
      if (q.get("not")) notEl.value = q.get("not").slice(0, 200);
    } catch (e) { /* eski tarayıcı: ön doldurma yok */ }

    function secili(ad) { var i = $('input[name="' + ad + '"]:checked', form); return i ? { v: i.value, ad: i.getAttribute("data-ad") } : null; }
    function yaz(anahtar, metin) { var el = $('[data-o="' + anahtar + '"]', tarif); if (el) el.textContent = metin; }

    function guncelle() {
      var vesileYazi = form.elements["vesile-yazi"].value.trim();
      var vesile = vesileYazi ? { v: "diger", ad: vesileYazi } : secili("vesile");
      var bicim = secili("bicim"), renk = secili("renk"), teslim = secili("teslim");
      var butce = butceYazi(form.elements["butce"].value);
      var ozel = form.elements["ozel"].value.trim(), yer = form.elements["yer"].value.trim();
      var not = notEl.value.trim(), ad = form.elements["ad"].value.trim(), saat = form.elements["saat"].value;
      var gun = isoCoz(tarihEl.value), bugun = gunEkle(0), gecmis = false, tarihMetin = "";
      if (gun && iso(gun) < iso(bugun)) { gecmis = true; gun = null; }
      if (gun) {
        tarihMetin = tarihYazi(gun);
        if (iso(gun) === iso(bugun)) tarihMetin = "bugün (" + tarihMetin + ")";
        else if (iso(gun) === iso(gunEkle(1))) tarihMetin = "yarın (" + tarihMetin + ")";
      }
      var dukkan = teslim && teslim.v === "dukkan";
      yerSatir.hidden = !!dukkan;

      tarihNot.textContent = gecmis ? "Geçmiş bir tarih seçtiniz; lütfen bugünü ya da ileri bir günü seçin."
        : (gun && gun.getDay() === 4 ? "Perşembe günleri dükkân 09:30–22:00 arasında açık. Kesin saat WhatsApp'ta teyit edilir." : TARIH_NOT);
      $$("[data-gun-ekle]", tarif).forEach(function (b) {
        b.setAttribute("aria-pressed", gun && iso(gun) === iso(gunEkle(parseInt(b.getAttribute("data-gun-ekle"), 10))) ? "true" : "false");
      });

      /* levha */
      yaz("vesile", vesile ? vesile.ad : "Henüz seçilmedi");
      yaz("bicim", bicim ? bicim.ad : "Henüz seçilmedi");
      yaz("renk", renk ? renk.ad : "Henüz seçilmedi");
      yaz("butce", butce || "Yazılmadı");
      yaz("tarih", gun ? gun.getDate() + " " + AYLAR[gun.getMonth()] + " " + GUNLER[gun.getDay()] + (saat ? ", " + saat.toLocaleLowerCase("tr") : "") : "Belli değil");
      var palet = renk ? renk.v : "secsin";
      if (palet !== sonPalet) { ozet.setAttribute("data-palet", palet); sonPalet = palet; yenidenBuyut($(".buket-svg", ozet)); }

      /* yaprak sayacı */
      var dolu = [!!vesile, !!bicim, !!renk, !!butce, !!gun], eksikAd = ["vesile", "ne hazırlanacağı", "renk paleti", "bütçe", "teslim günü"];
      var say = dolu.filter(Boolean).length, ilkEksik = eksikAd[dolu.indexOf(false)];
      yapraklar.forEach(function (y, i) { y.classList.toggle("dolu", i < say); });
      var EK = ["", "biri", "ikisi", "üçü", "dördü"];
      yaprakYazi.textContent = say === 0 ? "Tarifin beş yaprağından hiçbiri dolmadı; vesileyle başlayın."
        : say === 5 ? "Beş yaprak da doldu. Mesajı okuyup gönderebilirsiniz."
          : "Beş yapraktan " + EK[say] + " doldu. Sırada: " + ilkEksik + ".";

      /* mesaj */
      var s = ["Merhaba Efsane Çiçekçilik, bir çiçek siparişi tarif etmek istiyorum.", ""];
      if (vesile) s.push("Vesile: " + vesile.ad);
      if (bicim) s.push("Ne hazırlansın: " + bicim.ad);
      if (renk) s.push("Renkler: " + renk.ad);
      if (ozel) s.push("Özellikle: " + ozel);
      s.push("Bütçe: " + (butce ? "yaklaşık " + butce : "belirtmedim, önerinizi bekliyorum"));
      s.push("Teslim günü: " + (gun ? tarihMetin + (saat ? ", " + saat.toLocaleLowerCase("tr") : "") : "henüz belli değil" + (saat ? " (" + saat.toLocaleLowerCase("tr") + " saatleri uygun)" : "")));
      if (teslim) s.push("Teslim şekli: " + teslim.ad + (!dukkan && yer ? " (" + yer + ")" : ""));
      if (not) s.push("Kart notu: “" + not + "”");
      s.push("", "Uygun seçenekleri ve fiyat bilgisini paylaşabilir misiniz?");
      if (ad) s.push(ad);
      sonMesaj = s.join("\n");
      mesajEl.textContent = sonMesaj;
      waEl.setAttribute("href", waAdres(sonMesaj));
      var sayac = $("[data-sayac]", tarif); if (sayac) sayac.textContent = notEl.value.length + " / 200";
    }

    form.addEventListener("input", function (e) {
      if (e.target.name === "vesile-yazi" && e.target.value.trim()) $$('input[name="vesile"]', form).forEach(function (i) { i.checked = false; });
      if (e.target.name === "vesile" && e.target.checked) form.elements["vesile-yazi"].value = "";
      guncelle();
    });
    form.addEventListener("change", guncelle);
    $$("[data-gun-ekle]", tarif).forEach(function (b) {
      b.addEventListener("click", function () { tarihEl.value = iso(gunEkle(parseInt(b.getAttribute("data-gun-ekle"), 10))); guncelle(); });
    });
    var gunSil = $("[data-gun-sil]", tarif);
    if (gunSil) gunSil.addEventListener("click", function () { tarihEl.value = ""; guncelle(); });
    $("[data-kopyala]", tarif).addEventListener("click", function () { kopyala(sonMesaj, $("[data-kopya-durum]", tarif)); });
    guncelle();
  }

  /* ---- teslimat kontrol listesi ---- */
  var liste = $('[data-tool="kontrol-listesi"]');
  if (liste) {
    var kutular = $$("input[type=checkbox]", liste), lsAd = "efsane-kontrol-listesi";
    var listeSayac = $("[data-liste-sayac]", liste), listeCubuk = $("[data-liste-cubuk]", liste);
    var HAZIR = ["", "biri", "ikisi", "üçü", "dördü", "beşi", "altısı", "yedisi"];
    try {
      var kayit = JSON.parse(localStorage.getItem(lsAd) || "[]");
      kutular.forEach(function (k) { if (kayit.indexOf(k.getAttribute("data-k")) > -1) k.checked = true; });
    } catch (e) { /* saklama kapalı olabilir */ }
    var listeYaz = function () {
      var isaretli = kutular.filter(function (k) { return k.checked; });
      var n = isaretli.length;
      listeSayac.textContent = n === 0 ? "Sekiz bilgiden hiçbiri işaretlenmedi."
        : n === kutular.length ? "Sekiz bilginin hepsi hazır. Tarife geçebilirsiniz."
          : "Sekiz bilgiden " + HAZIR[n] + " hazır.";
      listeCubuk.style.width = (n / kutular.length * 100) + "%";
      try { localStorage.setItem(lsAd, JSON.stringify(isaretli.map(function (k) { return k.getAttribute("data-k"); }))); } catch (e) { /* yok say */ }
    };
    kutular.forEach(function (k) { k.addEventListener("change", listeYaz); });
    $("[data-liste-sifirla]", liste).addEventListener("click", function () { kutular.forEach(function (k) { k.checked = false; }); listeYaz(); });
    listeYaz();
  }

  /* ---- teslimat yeri sekmeleri ---- */
  $$("[data-sekme]").forEach(function (kap) {
    var dugmeler = $$('[role="tab"]', kap);
    function sec(d, odak) {
      dugmeler.forEach(function (x) {
        var a = x === d;
        x.setAttribute("aria-selected", a ? "true" : "false");
        x.tabIndex = a ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !a;
      });
      if (odak) d.focus();
    }
    dugmeler.forEach(function (d, i) {
      d.addEventListener("click", function () { sec(d); });
      d.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          sec(dugmeler[(i + (e.key === "ArrowRight" ? 1 : dugmeler.length - 1)) % dugmeler.length], true);
        }
      });
    });
    if (dugmeler.length) sec(dugmeler[0]);
  });

  /* ---- iletişim: hazır soru ---- */
  var soru = $('[data-tool="hizli-soru"]');
  if (soru) {
    var soruMesaj = $("[data-soru-mesaj]", soru), soruGonder = $("[data-soru-gonder]", soru), ekEl = $("textarea", soru), soruMetin = "";
    var soruYaz = function () {
      var s = $('input[name="soru"]:checked', soru), ek = ekEl.value.trim();
      soruMetin = "Merhaba Efsane Çiçekçilik,\n" + (s ? s.value : "Bilgi alabilir miyim?") + (ek ? "\n\n" + ek : "");
      soruMesaj.textContent = soruMetin;
      soruGonder.setAttribute("href", waAdres(soruMetin));
    };
    soru.addEventListener("input", soruYaz);
    soru.addEventListener("change", soruYaz);
    $("[data-soru-kopyala]", soru).addEventListener("click", function () { kopyala(soruMetin, $("[data-soru-durum]", soru)); });
    soruYaz();
  }
})();
