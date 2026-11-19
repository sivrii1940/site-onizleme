/* Bakaç Taş Fırın Simit — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };
  var WA = "https://wa.me/905321361804";

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

  /* ---- yardımcılar ---- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function iki(n) { return (n < 10 ? "0" : "") + n; }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function tr(n) { return String(n).replace(".", ","); }
  function sinirla(v, a, b) { v = parseInt(v, 10); if (isNaN(v)) v = a; return Math.max(a, Math.min(b, v)); }
  function tekSec(dugmeler, secilen) { dugmeler.forEach(function (b) { b.setAttribute("aria-pressed", b === secilen ? "true" : "false"); }); }
  var azHareket = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- menü ---- */
  var menuDugme = $("[data-menu-dugme]"), menu = $("#menu");
  if (menuDugme && menu) {
    var menuAyarla = function (acik) {
      menu.classList.toggle("acik", acik);
      menuDugme.setAttribute("aria-expanded", acik ? "true" : "false");
      $("[data-menu-yazi]", menuDugme).textContent = acik ? "Kapat" : "Menü";
    };
    menuDugme.addEventListener("click", function () { menuAyarla(!menu.classList.contains("acik")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("acik")) { menuAyarla(false); menuDugme.focus(); } });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menuAyarla(false); }); });
  }

  /* ---- canlı durum, saat, kadran, günün dilimi ---- */
  var gunSecildi = false;
  function dilimBul(m) { return m >= 300 && m < 660 ? "sabah" : m >= 660 && m < 960 ? "ogle" : m >= 960 && m < 1320 ? "aksam" : "gece"; }
  function dilimAc(ad) {
    $$("[data-dilim]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-dilim") === ad ? "true" : "false"); });
    $$("[data-panel]").forEach(function (p) { p.classList.toggle("acik", p.getAttribute("data-panel") === ad); });
  }
  function durumYaz() {
    var s = openStatus(HOURS), n = istanbulNow();
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    var saat = iki(Math.floor(n.m / 60)) + "." + iki(n.m % 60);
    $$("[data-saat]").forEach(function (el) { el.hidden = false; el.textContent = "saat " + saat; });
    var kor = $("[data-saat-kor]");
    if (kor) kor.style.transform = "rotate(" + (n.m / 1440 * 360).toFixed(1) + "deg)";
    $$("[data-saatler] tr").forEach(function (trEl) { trEl.classList.toggle("bugun", parseInt(trEl.getAttribute("data-gun-no"), 10) === n.d); });
    var simdi = $("[data-gun-simdi]");
    if (simdi) {
      simdi.hidden = false;
      simdi.style.setProperty("--x", Math.max(4, Math.min(96, ((n.m - 300 + 1440) % 1440) / 1440 * 100)).toFixed(1) + "%");
      if (!gunSecildi) dilimAc(dilimBul(n.m));
    }
  }
  $$("[data-dilim]").forEach(function (b) {
    b.addEventListener("click", function () { gunSecildi = true; dilimAc(b.getAttribute("data-dilim")); });
  });
  durumYaz();
  setInterval(durumYaz, 30000);

  /* ---- fırın: köz canlandırma ---- */
  var ocak = $("[data-ocak]"), dokun = $("[data-ocak-dokun]"), kivilcim = $("[data-kivilcimlar]");
  if (ocak && dokun) {
    var canliZaman;
    dokun.addEventListener("click", function () {
      ocak.classList.add("canli");
      clearTimeout(canliZaman);
      canliZaman = setTimeout(function () { ocak.classList.remove("canli"); }, 1500);
      if (azHareket || !kivilcim) return;
      for (var i = 0; i < 16; i++) {
        var k = document.createElement("i");
        k.className = "patla";
        k.style.setProperty("--x", (8 + Math.random() * 84).toFixed(1) + "%");
        k.style.setProperty("--dx", (Math.random() * 90 - 45).toFixed(0) + "px");
        k.style.setProperty("--dy", (-120 - Math.random() * 200).toFixed(0) + "px");
        k.style.setProperty("--t", (0.9 + Math.random() * 0.9).toFixed(2) + "s");
        k.addEventListener("animationend", function () { this.remove(); });
        kivilcim.appendChild(k);
      }
    });
  }

  /* ---- kopyalama ---- */
  $$("[data-kopyala]").forEach(function (b) {
    b.addEventListener("click", function () {
      var hedef = $(b.getAttribute("data-kopyala")), metin = hedef ? hedef.textContent : "";
      var yazi = $("span", b), eski = yazi.textContent;
      function bitti(ok) { yazi.textContent = ok ? "Kopyalandı" : "Kopyalanamadı"; setTimeout(function () { yazi.textContent = eski; }, 2000); }
      function eskiYol() {
        try {
          var t = document.createElement("textarea"); t.value = metin; t.style.position = "fixed"; t.style.opacity = "0";
          document.body.appendChild(t); t.select(); var ok = document.execCommand("copy"); t.remove(); bitti(ok);
        } catch (e) { bitti(false); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(function () { bitti(true); }, eskiYol);
      else eskiYol();
    });
  });

  /* ---- ana sayfa: mini hesap ---- */
  var miniKisi = $("[data-mini-kisi]");
  if (miniKisi) {
    var miniKap = miniKisi.closest("[data-tool]"), miniSonuc = $("[data-mini-sonuc]"), miniGit = $("[data-mini-git]");
    var miniYaz = function (duzelt) {
      var n = sinirla(miniKisi.value, 1, 500);
      if (duzelt) miniKisi.value = n;
      miniSonuc.innerHTML = "Kahvaltı niyetine kişi başı 2 parçadan <b>" + (n * 2) + " parça</b> eder. Yalnızca atıştırmalık olacaksa " + n + " parça yeter.";
      miniGit.setAttribute("href", "toplu-siparis.html?kisi=" + n);
    };
    $("[data-az]", miniKap).addEventListener("click", function () { miniKisi.value = sinirla(miniKisi.value, 1, 500) - 1; miniYaz(true); });
    $("[data-cok]", miniKap).addEventListener("click", function () { miniKisi.value = sinirla(miniKisi.value, 1, 500) + 1; miniYaz(true); });
    miniKisi.addEventListener("input", function () { miniYaz(false); });
    miniKisi.addEventListener("change", function () { miniYaz(true); });
    miniYaz(true);
  }

  /* ---- toplu sipariş hesaplayıcı ---- */
  var hesap = $("[data-hesap]");
  if (hesap) {
    var AD = { simit: "Simit", pogaca: "Poğaça", acma: "Açma", borek: "Börek" };
    var BIRIM = { simit: "adet", pogaca: "adet", acma: "adet", borek: "porsiyon" };
    var SIRA = ["simit", "pogaca", "acma", "borek"];
    var d = { kisi: 20, pay: 2, neden: "Ofis kahvaltısı", dagilim: "simit", yedek: false, teslim: "Fırından kendim alacağım", delta: {} };
    var kisiGir = $("[data-kisi]", hesap), kaydir = $("[data-kisi-kaydir]", hesap);
    var tarihGir = $("[data-tarih]", hesap), saatGir = $("[data-saat-sec]", hesap), adGir = $("[data-ad]", hesap), notGir = $("[data-not]", hesap);
    var liste = $("[data-sonuc-liste]", hesap), islem = $("[data-islem]", hesap), toplamEl = $("[data-toplam]", hesap), olcekEl = $("[data-olcek]", hesap);
    var mesajEl = $("[data-mesaj]", hesap), waGonder = $("[data-wa-gonder]", hesap), sifirla = $("[data-sifirla]", hesap), araSonuc = $("[data-ara-sonuc]", hesap);

    var q = /[?&]kisi=(\d{1,3})/.exec(location.search);
    if (q) d.kisi = sinirla(q[1], 1, 500);
    var bugun = new Date();
    tarihGir.min = bugun.getFullYear() + "-" + iki(bugun.getMonth() + 1) + "-" + iki(bugun.getDate());

    var secili = function () { return SIRA.filter(function (k) { return $('[data-cesit="' + k + '"]', hesap).checked; }); };
    var dagit = function (toplam, anahtarlar) {
      var ag = anahtarlar.map(function (k) { return d.dagilim === "simit" && k === "simit" && anahtarlar.length > 1 ? 2 : 1; });
      var top = ag.reduce(function (a, b) { return a + b; }, 0);
      var ham = ag.map(function (a) { return toplam * a / top; });
      var taban = ham.map(Math.floor);
      var kalan = toplam - taban.reduce(function (a, b) { return a + b; }, 0);
      ham.map(function (h, i) { return { i: i, f: h - taban[i] }; }).sort(function (a, b) { return b.f - a.f || a.i - b.i; })
        .slice(0, kalan).forEach(function (x) { taban[x.i] += 1; });
      var sonuc = {};
      anahtarlar.forEach(function (k, i) { sonuc[k] = taban[i]; });
      return sonuc;
    };
    var tarihYaz = function (v) {
      var p = v.split("-");
      try { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" }).format(new Date(+p[0], +p[1] - 1, +p[2])); }
      catch (e) { return p[2] + "." + p[1] + "." + p[0]; }
    };

    var ciz = function () {
      var odak = document.activeElement, odakAnahtar = odak && odak.getAttribute ? (odak.getAttribute("data-arti") ? "arti:" + odak.getAttribute("data-arti") : odak.getAttribute("data-eksi") ? "eksi:" + odak.getAttribute("data-eksi") : "") : "";
      var an = secili(), ana = Math.ceil(d.kisi * d.pay), yedek = d.yedek ? Math.ceil(ana / 10) : 0, hedef = ana + yedek;
      var adet = an.length ? dagit(hedef, an) : {}, toplam = 0, enCok = 0, elle = false;
      an.forEach(function (k) {
        if (d.delta[k]) { adet[k] = Math.max(0, adet[k] + d.delta[k]); elle = true; }
        toplam += adet[k]; enCok = Math.max(enCok, adet[k]);
      });
      var hesapMetni = d.kisi + " kişi × " + tr(d.pay) + " parça = " + ana + " parça" + (yedek ? ", üstüne " + yedek + " yedek" : "");
      islem.textContent = an.length ? hesapMetni : "En az bir çeşit seçin.";
      if (araSonuc) araSonuc.textContent = hesapMetni;
      var olcek = enCok <= 30 ? 1 : enCok <= 60 ? 2 : enCok <= 150 ? 5 : enCok <= 300 ? 10 : 25;
      liste.innerHTML = an.map(function (k) {
        var halka = adet[k] ? Math.max(1, Math.round(adet[k] / olcek)) : 0;
        return '<li><img src="img/' + k + '.svg" alt="" width="46" height="46"><span class="sl-ad">' + AD[k] + ' <small>' + BIRIM[k] + '</small></span>' +
          '<span class="sl-sayac"><button type="button" data-eksi="' + k + '" aria-label="' + AD[k] + ' azaltın">−</button><b>' + adet[k] + '</b>' +
          '<button type="button" data-arti="' + k + '" aria-label="' + AD[k] + ' artırın">+</button></span>' +
          '<span class="sl-halkalar" aria-hidden="true">' + new Array(halka + 1).join("<i></i>") + '</span></li>';
      }).join("");
      toplamEl.textContent = toplam;
      olcekEl.textContent = !an.length ? "" : olcek > 1 ? "Her halka yaklaşık " + olcek + " parçayı gösterir." : "Her halka bir parçayı gösterir.";
      sifirla.hidden = !elle;
      if (odakAnahtar) { var yeni = $('[data-' + odakAnahtar.split(":")[0] + '="' + odakAnahtar.split(":")[1] + '"]', liste); if (yeni) yeni.focus(); }

      var s = ["Merhaba, toplu sipariş için yazıyorum.", "", "Kişi sayısı: " + d.kisi, "Ne için: " + d.neden, "", "İstediklerim:"];
      an.forEach(function (k) { if (adet[k]) s.push("• " + AD[k] + ": " + adet[k] + " " + BIRIM[k]); });
      if (!toplam) s.push("• (çeşitleri ayrıca yazacağım)");
      s.push("Toplam: " + toplam + " parça", "");
      s.push("Tarih: " + (tarihGir.value ? tarihYaz(tarihGir.value) : "ayrıca bildireceğim"));
      if (saatGir.value) s.push("Saat: " + saatGir.value.replace(":", "."));
      s.push("Teslim: " + d.teslim);
      if (notGir.value.trim()) s.push("Not: " + notGir.value.trim());
      s.push("", "Uygun olur mu? Fiyat bilgisini de rica ederim.");
      if (adGir.value.trim()) s.push(adGir.value.trim());
      var mesaj = s.join("\n");
      mesajEl.textContent = mesaj;
      waGonder.setAttribute("href", waLink(mesaj));
    };

    var kisiAyarla = function (v, girdiyiYaz) {
      d.kisi = sinirla(v, 1, 500);
      if (girdiyiYaz !== false) kisiGir.value = d.kisi;
      kaydir.value = Math.min(200, d.kisi);
      $$("[data-kisi-hazir]", hesap).forEach(function (b) { b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-kisi-hazir"), 10) === d.kisi ? "true" : "false"); });
      ciz();
    };
    $("[data-kisi-az]", hesap).addEventListener("click", function () { kisiAyarla(d.kisi - 1); });
    $("[data-kisi-cok]", hesap).addEventListener("click", function () { kisiAyarla(d.kisi + 1); });
    kisiGir.addEventListener("input", function () { if (kisiGir.value !== "") kisiAyarla(kisiGir.value, false); });
    kisiGir.addEventListener("change", function () { kisiAyarla(kisiGir.value); });
    kaydir.addEventListener("input", function () { kisiAyarla(kaydir.value); });
    $$("[data-kisi-hazir]", hesap).forEach(function (b) { b.addEventListener("click", function () { kisiAyarla(b.getAttribute("data-kisi-hazir")); }); });

    var payDugmeler = $$("[data-pay-sec]", hesap), nedenDugmeler = $$("[data-neden]", hesap);
    var payAyarla = function (p) {
      d.pay = parseFloat(p);
      payDugmeler.forEach(function (b) { b.setAttribute("aria-pressed", parseFloat(b.getAttribute("data-pay-sec")) === d.pay ? "true" : "false"); });
    };
    nedenDugmeler.forEach(function (b) {
      b.addEventListener("click", function () { tekSec(nedenDugmeler, b); d.neden = b.getAttribute("data-neden"); payAyarla(b.getAttribute("data-pay")); ciz(); });
    });
    payDugmeler.forEach(function (b) { b.addEventListener("click", function () { payAyarla(b.getAttribute("data-pay-sec")); ciz(); }); });
    $$("[data-cesit]", hesap).forEach(function (c) { c.addEventListener("change", function () { d.delta = {}; ciz(); }); });
    var dagDugmeler = $$("[data-dagilim]", hesap);
    dagDugmeler.forEach(function (b) { b.addEventListener("click", function () { tekSec(dagDugmeler, b); d.dagilim = b.getAttribute("data-dagilim"); d.delta = {}; ciz(); }); });
    $("[data-yedek]", hesap).addEventListener("change", function () { d.yedek = this.checked; ciz(); });
    var tesDugmeler = $$("[data-teslim]", hesap);
    tesDugmeler.forEach(function (b) { b.addEventListener("click", function () { tekSec(tesDugmeler, b); d.teslim = b.getAttribute("data-teslim"); ciz(); }); });
    [tarihGir, saatGir, adGir, notGir].forEach(function (el) { el.addEventListener("input", ciz); el.addEventListener("change", ciz); });
    liste.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var k = b.getAttribute("data-arti") || b.getAttribute("data-eksi");
      d.delta[k] = (d.delta[k] || 0) + (b.hasAttribute("data-arti") ? 1 : -1);
      ciz();
    });
    sifirla.addEventListener("click", function () { d.delta = {}; ciz(); });
    kisiAyarla(d.kisi);
  }

  /* ---- ürünler: süzgeç + tezgâh listesi ---- */
  var fis = $("[data-fis]");
  if (fis) {
    var secilenler = [], fisMesaj = $("[data-fis-mesaj]"), fisWa = $("[data-fis-wa]"), fisNot = $("[data-fis-not]"), fisSayi = $("[data-fis-sayi]"), fisBos = $("[data-fis-bos]");
    var fisYaz = function () {
      var s;
      if (secilenler.length) {
        s = ["Merhaba, şu çeşitler bugün tezgâhta var mı?"];
        secilenler.forEach(function (x) { s.push("• " + x); });
      } else s = ["Merhaba, bugün tezgâhta hangi çeşitler var?"];
      if (fisNot.value.trim()) s.push("Not: " + fisNot.value.trim());
      s.push("Teşekkürler.");
      var m = s.join("\n");
      fisMesaj.textContent = m;
      fisWa.setAttribute("href", waLink(m));
      fisSayi.textContent = secilenler.length;
      fisBos.hidden = secilenler.length > 0;
    };
    $$("[data-ekle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ad = b.getAttribute("data-ekle"), i = secilenler.indexOf(ad);
        if (i === -1) secilenler.push(ad); else secilenler.splice(i, 1);
        b.setAttribute("aria-pressed", i === -1 ? "true" : "false");
        b.textContent = i === -1 ? "Eklendi" : "Ekle";
        fisYaz();
      });
    });
    fisNot.addEventListener("input", fisYaz);
    var suzDugmeler = $$("[data-suz]");
    suzDugmeler.forEach(function (b) {
      b.addEventListener("click", function () {
        tekSec(suzDugmeler, b);
        var t = b.getAttribute("data-suz");
        $$("[data-tur]").forEach(function (g) { g.hidden = t !== "hepsi" && g.getAttribute("data-tur") !== t; });
      });
    });
    fisYaz();
  }

  /* ---- iletişim: hızlı mesaj ---- */
  var hizli = $("[data-hizli]");
  if (hizli) {
    var KONU = {
      tezgah: "Merhaba, bugün tezgâhta hangi çeşitler var?",
      toplu: "Merhaba, toplu sipariş vermek istiyorum. Adet ve saat için bilgi alabilir miyim?",
      getirme: "Merhaba, adrese getirme imkânınız var mı?",
      saat: "Merhaba, bayramda ve özel günlerde çalışma saatleriniz nasıl oluyor?",
      diger: "Merhaba, bir konuda bilgi almak istiyorum."
    };
    var konu = "tezgah", konuDugmeler = $$("[data-konu]", hizli), hAd = $("[data-hizli-ad]", hizli), hNot = $("[data-hizli-not]", hizli), hMesaj = $("[data-hizli-mesaj]", hizli), hWa = $("[data-hizli-wa]", hizli);
    var hizliYaz = function () {
      var s = [KONU[konu]];
      if (hNot.value.trim()) s.push(hNot.value.trim());
      if (hAd.value.trim()) s.push(hAd.value.trim());
      var m = s.join("\n");
      hMesaj.textContent = m;
      hWa.setAttribute("href", waLink(m));
    };
    konuDugmeler.forEach(function (b) { b.addEventListener("click", function () { tekSec(konuDugmeler, b); konu = b.getAttribute("data-konu"); hizliYaz(); }); });
    hAd.addEventListener("input", hizliYaz); hNot.addEventListener("input", hizliYaz);
    hizliYaz();
  }

  /* ---- kontrol listesi (cihazda saklanır) ---- */
  $$("[data-kontrol]").forEach(function (ul) {
    var anahtar = "bakac-kontrol-" + ul.getAttribute("data-kontrol"), kutular = $$("input[type=checkbox]", ul);
    try { JSON.parse(localStorage.getItem(anahtar) || "[]").forEach(function (v, i) { if (kutular[i]) kutular[i].checked = !!v; }); } catch (e) { /* saklama yoksa sorun değil */ }
    ul.addEventListener("change", function () {
      try { localStorage.setItem(anahtar, JSON.stringify(kutular.map(function (k) { return k.checked ? 1 : 0; }))); } catch (e) { /* yok say */ }
    });
  });

  /* ---- taş fırın: kesit, şehirler, simit testi ---- */
  var kesit = $("[data-kesit]");
  if (kesit) {
    var noktalar = $$("[data-nokta]", kesit), aciklamalar = $$("[data-aciklama]", kesit);
    var kesitSec = function (ad, kaydir) {
      noktalar.forEach(function (n) { n.setAttribute("aria-pressed", n.getAttribute("data-nokta") === ad ? "true" : "false"); });
      aciklamalar.forEach(function (li) {
        var sec = li.getAttribute("data-aciklama") === ad;
        li.classList.toggle("secili", sec);
        if (sec && kaydir && li.scrollIntoView) li.scrollIntoView({ block: "nearest", behavior: azHareket ? "auto" : "smooth" });
      });
    };
    noktalar.forEach(function (n) { n.addEventListener("click", function () { kesitSec(n.getAttribute("data-nokta"), true); }); });
    aciklamalar.forEach(function (li) { li.addEventListener("click", function () { kesitSec(li.getAttribute("data-aciklama"), false); }); });
  }
  var sehirKap = $("[data-sehirler]");
  if (sehirKap) {
    var sehirDugmeler = $$("[data-sehir]", sehirKap);
    var sehirAc = function (ad) { $$("[data-sehir-panel]", sehirKap).forEach(function (p) { p.classList.toggle("acik", p.getAttribute("data-sehir-panel") === ad); }); };
    sehirDugmeler.forEach(function (b) { b.addEventListener("click", function () { tekSec(sehirDugmeler, b); sehirAc(b.getAttribute("data-sehir")); }); });
    sehirAc("istanbul");
  }
  var test = $("[data-test]");
  if (test) {
    var testKutular = $$("input[type=checkbox]", test), testSonuc = $("[data-test-sonuc]", test);
    test.addEventListener("change", function () {
      var n = testKutular.filter(function (k) { return k.checked; }).length;
      var soz = n === 0 ? "Altı ölçütten kaçı tutuyor? İşaretledikçe sonuç burada belirir."
        : n <= 2 ? "Bu simit biraz yorgun. Isıtmayı deneyin ya da tostluk yapın."
        : n <= 4 ? "Fena değil; çayın yanında güzel gider."
        : n === 5 ? "Çok iyi; tek bir eksiği var."
        : "Tam isabet. Böyle simit bekletilmez, sıcakken yenir.";
      testSonuc.innerHTML = n ? "<b>6'da " + n + "</b>" + soz : soz;
    });
  }
})();
