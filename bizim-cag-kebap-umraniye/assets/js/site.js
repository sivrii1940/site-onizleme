/* Bizim Cağ Kebap — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var HOURS = { "0": [["10:00", "21:00"]], "1": [["10:00", "21:00"]], "2": [["10:00", "21:00"]], "3": [["10:00", "21:00"]], "4": [["10:00", "21:00"]], "5": [["10:00", "21:00"]] };
  var WA = "https://wa.me/905402494625";
  var TEL = "tel:+905402494625";
  var TEL_GORUNEN = "0540 249 46 25";
  var AD = "Bizim Cağ Kebap";
  var GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

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

  function $(s, k) { return (k || document).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); }
  function dk(s) { var a = String(s).split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1] || "0", 10); }
  function waLink(mesaj) { return WA + "?text=" + encodeURIComponent(mesaj); }
  var azHareket = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function kopyala(metin, durumEl) {
    function bitti(ok) {
      if (!durumEl) return;
      durumEl.textContent = ok ? "Mesaj panoya kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; mesajı elle seçip kopyalayın.";
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(metin).then(function () { bitti(true); }, function () { eski(); });
    } else { eski(); }
    function eski() {
      var t = document.createElement("textarea");
      t.value = metin; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(t); bitti(ok);
    }
  }

  /* ---- Canlı durum ---- */
  var durum = openStatus(HOURS);
  function durumYaz() {
    durum = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = durum.text;
      el.classList.toggle("is-open", durum.open);
      el.classList.toggle("is-closed", !durum.open);
    });
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ---- Gezinme ---- */
  var menuBtn = $(".menu-ac"), gez = $("#gezinti");
  if (menuBtn && gez) {
    menuBtn.addEventListener("click", function () {
      var acik = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", acik ? "false" : "true");
      gez.classList.toggle("acik", !acik);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gez.classList.contains("acik")) { gez.classList.remove("acik"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
    });
  }

  /* ---- Mini şiş çizimi ---- */
  function miniSis(yeni) {
    var renk = ["#8E3A18", "#A84B22", "#7A3216", "#B5582B", "#93401C", "#A3471F"];
    var s = '<svg class="mini-sis' + (yeni ? " yeni" : "") + '" viewBox="0 0 260 36" aria-hidden="true" focusable="false">' +
      '<line x1="18" y1="18" x2="246" y2="18" stroke="#C9C0B7" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="10" cy="18" r="7" fill="none" stroke="#C9C0B7" stroke-width="3"/>' +
      '<path d="M244 14 L258 18 L244 22Z" fill="#A9A19A"/>';
    for (var i = 0; i < 7; i++) {
      var x = 70 + i * 22, h = 12 + ((i * 7) % 4);
      s += '<rect x="' + x + '" y="' + (18 - h) + '" width="20" height="' + (h * 2) + '" rx="7" fill="' + renk[i % renk.length] + '"/>' +
        '<rect x="' + (x + 3) + '" y="' + (18 - h + 2) + '" width="14" height="4" rx="2" fill="#F2A03D" opacity=".45"/>';
    }
    return s + "</svg>";
  }

  /* ---- Ana sayfa: cağdan şiş kes ---- */
  var cag = $("#cagKes");
  if (cag) {
    var n = 0, MAX = 30;
    var sayiEl = $("#tepsiSayi"), metinEl = $("#tepsiMetin"), sislerEl = $("#tepsiSisler"), sipLink = $("#tepsiSiparis");
    var svg = cag.querySelector("svg");
    function tepsiCiz(yeniEklendi) {
      sayiEl.textContent = n;
      metinEl.innerHTML = n === 0 ? "Cağa dokunun, ilk şişi kesin." : "<b>" + n + " şiş</b> tabağınızda. Bu kadar mı, bir şiş daha mı?";
      var html = "", goster = Math.min(n, 8);
      for (var i = 0; i < goster; i++) html += miniSis(yeniEklendi && i === goster - 1 && n <= 8);
      if (n > 8) html += '<span class="tepsi__fazla">+' + (n - 8) + "</span>";
      sislerEl.innerHTML = html;
      sipLink.href = "siparis.html" + (n > 0 ? "?sis=" + n : "");
      sipLink.textContent = n > 0 ? n + " şişle siparişe geç" : "Siparişe geç";
    }
    function kes() {
      if (n >= MAX) return;
      n++;
      if (!azHareket && svg) { svg.classList.remove("kes"); void svg.getBoundingClientRect(); svg.classList.add("kes"); }
      tepsiCiz(true);
    }
    cag.addEventListener("click", kes);
    $("#tepsiKes").addEventListener("click", kes);
    $("#tepsiEksilt").addEventListener("click", function () { if (n > 0) { n--; tepsiCiz(false); } });
    if (svg) svg.addEventListener("animationend", function (e) { if (e.animationName === "dilim") svg.classList.remove("kes"); });
    tepsiCiz(false);
  }

  /* ---- Yana kayan şiş bantları ---- */
  var kaylar = $$("[data-kay]");
  if (kaylar.length) {
    var mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    var bekliyor = false;
    function kayGuncelle() {
      bekliyor = false;
      kaylar.forEach(function (k) {
        var ray = $(".kay__ray", k), pencere = $(".kay__pencere", k);
        if (!mq.matches) { ray.style.transform = ""; return; }
        var r = pencere.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh - r.top) / (vh + r.height);
        p = Math.min(1, Math.max(0, (p - 0.12) / 0.66));
        var max = Math.max(0, ray.scrollWidth - pencere.clientWidth);
        ray.style.transform = "translate3d(" + (-max * p).toFixed(1) + "px,0,0)";
      });
    }
    function iste() { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kayGuncelle); } }
    window.addEventListener("scroll", iste, { passive: true });
    window.addEventListener("resize", iste);
    kayGuncelle();
  }

  /* ---- Saat çizelgesi ---- */
  $$("[data-saatler]").forEach(function (blok) {
    var satir = $('[data-gun="' + durum.dayIndex + '"]', blok);
    if (!satir) return;
    satir.classList.add("bugun");
    var ray = $(".ray", satir);
    if (ray) {
      var cizgi = document.createElement("span");
      cizgi.className = "simdi";
      cizgi.style.left = (durum.minutes / 1440 * 100).toFixed(2) + "%";
      cizgi.title = "Şu an";
      ray.appendChild(cizgi);
    }
  });

  /* ---- Ortak: adet düğmeleri ---- */
  $$("[data-adet]").forEach(function (kutu) {
    var inp = $("input", kutu);
    $$("button", kutu).forEach(function (b) {
      b.addEventListener("click", function () {
        var min = parseInt(inp.min || "0", 10), max = parseInt(inp.max || "99", 10);
        var v = parseInt(inp.value || "0", 10) || 0;
        v += b.hasAttribute("data-arti") ? 1 : -1;
        inp.value = Math.min(max, Math.max(min, v));
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  });

  /* ---- Sipariş: Kaç şiş? ---- */
  var sipForm = $("#siparisForm");
  if (sipForm) {
    var sisInp = $("#sis"), kisiInp = $("#kisi"), ayranInp = $("#ayran");
    var mesajEl = $("#mesaj"), waBtn = $("#waGonder"), tabakEl = $("#tabakSisler"), uyariEl = $("#sipUyari");
    var adresKutu = $("#adresKutu"), saatInp = $("#saat");
    var q = new URLSearchParams(location.search);
    if (q.get("sis")) sisInp.value = Math.min(60, Math.max(0, parseInt(q.get("sis"), 10) || 0));
    if (q.get("kisi")) kisiInp.value = Math.min(50, Math.max(1, parseInt(q.get("kisi"), 10) || 1));

    function deger(ad) { var el = $('input[name="' + ad + '"]:checked', sipForm); return el ? el.value : ""; }
    function tabakCiz(sayi) {
      if (sayi <= 0) { tabakEl.innerHTML = '<span class="tabak__bos">Tabak boş: şiş sayısını seçin</span>'; return; }
      var h = "", g = Math.min(sayi, 10);
      tabakEl.classList.toggle("cift-sira", sayi > 4);
      for (var i = 0; i < g; i++) h += miniSis(false);
      if (sayi > 10) h += '<span class="tabak__fazla">+' + (sayi - 10) + " şiş daha</span>";
      tabakEl.innerHTML = h;
    }
    function guncelle() {
      var sis = Math.min(60, Math.max(0, parseInt(sisInp.value, 10) || 0));
      var kisi = Math.min(50, Math.max(1, parseInt(kisiInp.value, 10) || 1));
      var ayran = Math.min(30, Math.max(0, parseInt(ayranInp.value, 10) || 0));
      var yan = $$('input[name="yan"]:checked', sipForm).map(function (x) { return x.value; });
      var teslim = deger("teslim"), zaman = deger("zaman");
      adresKutu.hidden = teslim !== "paket";
      saatInp.disabled = zaman !== "saat";
      $$(".hizli button").forEach(function (b) { b.setAttribute("aria-pressed", String(parseInt(b.textContent, 10) === sis)); });
      tabakCiz(sis);

      var L = ["Merhaba " + AD + ",", (teslim === "paket" ? "Paket sipariş vermek istiyorum." : "Gelip almak üzere sipariş vermek istiyorum."), ""];
      L.push(sis > 0 ? "• Cağ kebabı: " + sis + " şiş" : "• Cağ kebabı: kaç şiş alacağıma karar veremedim, önerinizi rica ederim");
      L.push("• Kişi sayısı: " + kisi);
      if (yan.length) L.push("• Yanına (varsa): " + yan.join(", "));
      if (ayran > 0) L.push("• Ayran: " + ayran + " adet");
      if (teslim === "paket") {
        var adr = ($("#adres").value || "").trim();
        L.push("• Teslim: Adrese paket" + (adr ? "" : " (adresimi ayrıca yazacağım)"));
        if (adr) L.push("• Adres: " + adr);
        L.push("  Bu adrese gönderim yapıyor musunuz?");
      } else {
        L.push("• Teslim: Gelip alacağım");
      }
      if (zaman === "saat" && saatInp.value) L.push("• Saat: " + saatInp.value + " civarı");
      else L.push("• Zaman: Olabildiğince erken");
      var ad = ($("#adSoyad").value || "").trim(), not = ($("#not").value || "").trim();
      if (not) L.push("• Not: " + not);
      if (ad) L.push("• Ad: " + ad);
      L.push("", "Toplam tutarı ve ne zaman hazır olacağını yazabilir misiniz? Teşekkürler.");
      var mesaj = L.join("\n");
      mesajEl.textContent = mesaj;
      waBtn.href = waLink(mesaj);

      var u = [];
      var st = openStatus(HOURS);
      if (!st.open) u.push(st.text + ". Mesajınızı yine de hazırlayıp gönderebilirsiniz.");
      if (zaman === "saat" && saatInp.value) {
        var m = dk(saatInp.value);
        if (m < 600 || m >= 1260) u.push("Seçtiğiniz saat, çalışma saatlerinin (10:00–21:00) dışında.");
      }
      uyariEl.textContent = u.join(" ");
    }
    sipForm.addEventListener("input", guncelle);
    sipForm.addEventListener("change", guncelle);
    $$(".hizli button").forEach(function (b) {
      b.addEventListener("click", function () { sisInp.value = parseInt(b.textContent, 10); guncelle(); });
    });
    $("#kopyala").addEventListener("click", function () { kopyala(mesajEl.textContent, $("#kopyaDurum")); });
    guncelle();
  }

  /* ---- Sipariş: toplu ---- */
  var topluForm = $("#topluForm");
  if (topluForm) {
    var tMesaj = $("#topluMesaj"), tWa = $("#topluWa"), tUyari = $("#topluUyari"), tTarih = $("#tTarih");
    try {
      var bugun = new Date(); bugun.setMinutes(bugun.getMinutes() - bugun.getTimezoneOffset());
      tTarih.min = bugun.toISOString().slice(0, 10);
    } catch (e) { /* yok */ }
    function tGuncelle() {
      var kisi = Math.min(500, Math.max(1, parseInt($("#tKisi").value, 10) || 1));
      var tarih = tTarih.value, saat = $("#tSaat").value, not = ($("#tNot").value || "").trim();
      var teslim = ($('input[name="tTeslim"]:checked', topluForm) || {}).value || "";
      var L = ["Merhaba " + AD + ",", "Toplu sipariş için bilgi almak istiyorum.", "", "• Kişi sayısı: " + kisi];
      var u = [];
      if (tarih) {
        var p = tarih.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
        var gi = (d.getDay() + 6) % 7;
        L.push("• Tarih: " + p[2] + "." + p[1] + "." + p[0] + " " + GUNLER[gi]);
        if (gi === 6) u.push("Seçtiğiniz gün Pazar; saat çizelgesine göre Pazar günleri kapalı.");
      } else {
        L.push("• Tarih: henüz belli değil");
      }
      if (saat) {
        L.push("• Saat: " + saat);
        var m = dk(saat); if (m < 600 || m >= 1260) u.push("Seçtiğiniz saat 10:00–21:00 dışında.");
      }
      L.push("• Teslim: " + (teslim === "adres" ? "Adrese (gönderim yapılıp yapılmadığını öğrenmek istiyorum)" : "Gelip alacağız"));
      if (not) L.push("• Not: " + not);
      L.push("", "Uygun olup olmadığını ve ayrıntıları yazabilir misiniz? Teşekkürler.");
      var mesaj = L.join("\n");
      tMesaj.textContent = mesaj;
      tWa.href = waLink(mesaj);
      tUyari.textContent = u.join(" ");
    }
    topluForm.addEventListener("input", tGuncelle);
    topluForm.addEventListener("change", tGuncelle);
    $("#topluKopyala").addEventListener("click", function () { kopyala(tMesaj.textContent, $("#topluKopyaDurum")); });
    tGuncelle();
  }

  /* ---- Menü: Bugün var mı? ---- */
  var sorPanel = $("#sorPanel");
  if (sorPanel) {
    var secilen = [];
    var sMesaj = $("#sorMesaj"), sWa = $("#sorWa"), sListe = $("#sorListe"), cip = $("#sorCip");
    function sGuncelle() {
      var L = ["Merhaba " + AD + ","];
      if (secilen.length) {
        L.push("Bugün menünüzde şunlar var mı?", "");
        secilen.forEach(function (x) { L.push("• " + x); });
        L.push("", "Varsa fiyatlarını da yazabilir misiniz?");
      } else {
        L.push("Bugünkü menünüzü öğrenebilir miyim?");
      }
      L.push("", "Teşekkürler.");
      var mesaj = L.join("\n");
      sMesaj.textContent = mesaj;
      sWa.href = waLink(mesaj);
      sListe.textContent = secilen.length ? secilen.length + " kalem seçili: " + secilen.join(", ") : "Henüz kalem seçmediniz; menüdeki “Var mı?” düğmelerine dokunun.";
      cip.classList.toggle("goster", secilen.length > 0);
      $("#sorCipSayi").textContent = secilen.length;
    }
    $$("[data-sor]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ad = b.getAttribute("data-sor"), i = secilen.indexOf(ad);
        if (i === -1) secilen.push(ad); else secilen.splice(i, 1);
        b.setAttribute("aria-pressed", String(i === -1));
        sGuncelle();
      });
    });
    cip.addEventListener("click", function () {
      sorPanel.scrollIntoView({ behavior: azHareket ? "auto" : "smooth", block: "start" });
      var h = $("#sorBaslik"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    });
    $("#sorTemizle").addEventListener("click", function () {
      secilen = []; $$("[data-sor]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); }); sGuncelle();
    });
    $("#sorKopyala").addEventListener("click", function () { kopyala(sMesaj.textContent, $("#sorKopyaDurum")); });
    sGuncelle();
  }

  /* ---- Cağ nedir: anatomi ---- */
  var sahne = $("#anatomiSahne");
  if (sahne) {
    var noktalar = $$(".nokta-btn", sahne), parcalar = $$(".parca");
    function sec(id) {
      sahne.classList.add("odak");
      noktalar.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-parca") === id)); });
      parcalar.forEach(function (p) {
        var on = p.getAttribute("data-parca") === id;
        p.classList.toggle("secili", on);
        $("button", p).setAttribute("aria-expanded", String(on));
      });
      $$(".vurgu-parca", sahne).forEach(function (g) { g.classList.toggle("aktif", (" " + g.getAttribute("data-parca") + " ").indexOf(" " + id + " ") > -1); });
    }
    noktalar.forEach(function (b) { b.addEventListener("click", function () { sec(b.getAttribute("data-parca")); }); });
    parcalar.forEach(function (p) { $("button", p).addEventListener("click", function () { sec(p.getAttribute("data-parca")); }); });
    sec("cag");
    sahne.classList.remove("odak");
  }

  /* ---- İletişim: ne zaman gelsem? ---- */
  var nzForm = $("#neZamanForm");
  if (nzForm) {
    var gSec = $("#nzGun"), sInp = $("#nzSaat"), sonuc = $("#nzSonuc");
    gSec.value = String(durum.dayIndex);
    var hh = Math.floor(durum.minutes / 60), mm = durum.minutes % 60;
    sInp.value = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
    function kontrol() {
      var g = parseInt(gSec.value, 10), m = dk(sInp.value || "12:00");
      var aralik = HOURS[String(g)] || [];
      var acik = null;
      aralik.forEach(function (x) { if (m >= dk(x[0]) && m < dk(x[1])) acik = x; });
      sonuc.classList.remove("acik", "kapali");
      if (acik) {
        var kalan = dk(acik[1]) - m;
        sonuc.classList.add("acik");
        sonuc.innerHTML = "<b>Açık</b>" + GUNLER[g] + " " + sInp.value + " çalışma saatleri içinde. Kapanış " + acik[1] +
          (kalan <= 60 ? "; kapanışa az kaldığı için önceden aramanızı öneririz." : ".");
      } else {
        var bulundu = "";
        for (var k = 0; k < 8 && !bulundu; k++) {
          var dd = (g + k) % 7, rs = HOURS[String(dd)] || [];
          for (var j = 0; j < rs.length; j++) {
            if (k > 0 || dk(rs[j][0]) > m) { bulundu = (k === 0 ? "aynı gün" : GUNLER[dd]) + " " + rs[j][0]; break; }
          }
        }
        sonuc.classList.add("kapali");
        sonuc.innerHTML = "<b>Kapalı</b>" + GUNLER[g] + " " + sInp.value + " çalışma saatleri dışında." + (bulundu ? " En yakın açılış: " + bulundu + "." : "");
      }
    }
    nzForm.addEventListener("input", kontrol);
    nzForm.addEventListener("change", kontrol);
    nzForm.addEventListener("submit", function (e) { e.preventDefault(); kontrol(); });
    kontrol();
  }

  /* ---- Tembel görselleri sayfa yüklendikten sonra boşta önden yükle ---- */
  window.addEventListener("load", function () {
    function onden() { $$('img[loading="lazy"]').forEach(function (i) { i.loading = "eager"; }); }
    if ("requestIdleCallback" in window) requestIdleCallback(onden, { timeout: 600 }); else setTimeout(onden, 400);
  });

  /* ---- Adres kopyala ---- */
  $$("[data-kopyala]").forEach(function (b) {
    b.addEventListener("click", function () {
      var hedef = $(b.getAttribute("data-kopyala-durum"));
      kopyala(b.getAttribute("data-kopyala"), null);
      if (hedef) hedef.textContent = "Adres panoya kopyalandı.";
    });
  });
})();
