/* Arıcan Yapı Market Nalbur — site betiği (kütüphanesiz). */
(function () {
  "use strict";

  var HOURS = { "0": [["08:00", "21:00"]], "1": [["08:00", "21:00"]], "2": [["08:00", "21:00"]], "3": [["08:00", "21:00"]], "4": [["08:00", "21:00"]], "5": [["08:00", "21:00"]], "6": [["08:00", "21:00"]] };
  var WA = "https://wa.me/905072894392";
  var TEL = "tel:+905072894392";

  /* ---- kit/status.js kopyası: açık/kapalı durumu ---- */
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

  /* ---- Reyon verisi ---- */
  var REYON = {
    hirdavat: { ad: "Hırdavat ve el aletleri", ikon: "i-cekic", kisa: "Çekiçten matkap ucuna, tornavidadan şerit metreye: evdeki tamir çantasının eksikleri.",
      urunler: ["Çekiç", "Tornavida takımı", "Pense", "Şerit metre", "Matkap ucu", "Su terazisi", "Ayarlı (İngiliz) anahtar", "Alyan anahtar takımı", "Maket bıçağı", "Bits uç seti", "Zımpara kâğıdı", "Silikon tabancası", "İş eldiveni"] },
    baglanti: { ad: "Vida, dübel, cıvata", ikon: "i-civata", kisa: "Duvara, ahşaba, metale: her yüzeyin bağlantı elemanı ayrıdır. Duvarınızı söyleyin, doğru dübeli bulalım.",
      urunler: ["Plastik dübel", "Gazbeton dübeli", "Alçıpan dübeli", "Çelik dübel", "Kimyasal dübel", "Sunta vidası", "Ağaç vidası", "Matkap uçlu vida", "Cıvata", "Somun", "Pul", "Dişli çubuk", "Perçin"] },
    boya: { ad: "Boya ve yapı kimyasalları", ikon: "i-rulo", kisa: "İç ve dış cephe boyası, astar, macun, silikon ve boyanın bütün aletleri.",
      urunler: ["İç cephe boyası", "Dış cephe boyası", "Tavan boyası", "Astar", "Saten alçı", "Hazır macun", "Rulo ve boya tavası", "Fırça", "Maskeleme bandı", "Koruma naylonu", "Zımpara", "Silikon", "Akrilik mastik", "Vernik"] },
    yapi: { ad: "Çimento ve yapı malzemesi", ikon: "i-torba", kisa: "Tadilatın torba işleri: çimento, sıva, alçı, yapıştırıcı ve derz.",
      urunler: ["Çimento", "Hazır sıva", "Kartonpiyer alçısı", "Seramik yapıştırıcısı", "Derz dolgusu", "Tamir harcı", "Su yalıtım malzemesi", "Sıva filesi", "Köşe profili", "Harç kovası", "Mala", "Spatula"] },
    elektrik: { ad: "Elektrik malzemesi", ikon: "i-fis", kisa: "Kablo, priz, anahtar, sigorta ve aydınlatma. Eski parçanın fotoğrafı çoğu zaman yeter.",
      urunler: ["Kablo", "Priz", "Anahtar", "Çerçeve", "Otomatik sigorta", "Kaçak akım rölesi", "Duy", "LED ampul", "Spot ampul (GU10)", "Uzatma kablosu", "Grup priz", "Buat", "Kablo kanalı", "Klemens", "İzole bant", "Kontrol kalemi"] },
    tesisat: { ad: "Su tesisatı", ikon: "i-musluk", kisa: "Musluk, batarya, ara musluk, boru ve bütün bağlantı parçaları.",
      urunler: ["Musluk", "Batarya", "Ara musluk (küresel vana)", "Flex hortum", "Teflon bant", "Keten ve macun", "Conta takımı", "PPR boru", "Rakor", "Dirsek", "Te", "Nipel", "Manşon", "PVC atık su borusu", "Sifon", "Klozet iç takımı", "Duş başlığı ve hortumu"] },
    kilit: { ad: "Kilit ve kapı donanımı", ikon: "i-kilit", kisa: "Barel, kapı kilidi, kol, menteşe ve asma kilit.",
      urunler: ["Barel", "Kapı kilidi", "Kapı kolu", "Asma kilit", "Menteşe", "Kapı stoperi", "Kapı dürbünü", "Dolap kilidi", "Sürgü", "Kapı kapatıcı", "Kilit yağlayıcı sprey"] },
    bahce: { ad: "Bahçe ve temizlik", ikon: "i-bahce", kisa: "Hortumdan budama makasına, süpürgeden kovaya: bahçenin ve evin temizlik malzemesi.",
      urunler: ["Bahçe hortumu", "Musluk rakoru", "Hortum bağlantı parçası", "Sulama tabancası", "Hortum kelepçesi", "Kürek", "Tırmık", "Budama makası", "Süpürge", "Faraş", "Kova", "Paspas ve çekpas", "Çöp torbası", "İş eldiveni"] }
  };
  var SIRA = ["hirdavat", "baglanti", "boya", "yapi", "elektrik", "tesisat", "kilit", "bahce"];

  var KITLER = {
    musluk: { ad: "Musluk tamiri", kalem: ["Musluk contası (eskisinin ölçüsünde)", "Batarya kartuşu", "Teflon bant"] },
    raf: { ad: "Raf asma", kalem: ["Dübel (duvar tipine göre)", "Vida (dübele uygun)", "Matkap ucu (dübel çapında)", "Raf konsolu"] },
    boya: { ad: "Oda boyama", kalem: ["İç cephe boyası", "Rulo ve boya tavası", "Fırça (köşeler için)", "Maskeleme bandı", "Koruma naylonu"] },
    priz: { ad: "Priz değişimi", kalem: ["Priz / anahtar (mevcut tipte)", "Kontrol kalemi", "İzole tornavida"] },
    barel: { ad: "Barel değişimi", kalem: ["Barel (eskisinin ölçüsünde)", "Tornavida"] },
    silikon: { ad: "Silikon yenileme", kalem: ["Banyo ve mutfak silikonu", "Silikon tabancası", "Maket bıçağı"] },
    sulama: { ad: "Sulama", kalem: ["Bahçe hortumu", "Musluk rakoru", "Hortum bağlantı parçası"] },
    tadilat: { ad: "Tadilat", kalem: ["Çimento", "Tamir harcı", "Harç kovası", "Mala ve spatula"] }
  };

  var BIRIMLER = ["adet", "paket", "kutu", "metre", "top", "kg", "torba", "litre", "kova", "takım", "rulo", "çift"];

  /* ---- yardımcılar ---- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var azHareket = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function kucuk(s) { return String(s || "").trim().toLocaleLowerCase("tr-TR"); }
  function sayiOku(v) { var n = parseFloat(String(v || "").replace(",", ".")); return isNaN(n) ? 0 : n; }
  function sayiYaz(n, basamak) {
    var b = basamak == null ? 1 : basamak;
    var k = Math.round(n * Math.pow(10, b)) / Math.pow(10, b);
    return String(k).replace(".", ",");
  }
  function waLink(mesaj) { return WA + "?text=" + encodeURIComponent(mesaj); }

  /* ---- Canlı durum, bugün işaretleri, gün çizelgesi ---- */
  function durumYaz() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("li[data-gun]").forEach(function (li) { li.classList.toggle("bugun", parseInt(li.getAttribute("data-gun"), 10) === s.dayIndex); });
    $$("tr[data-gun]").forEach(function (tr) {
      var bu = parseInt(tr.getAttribute("data-gun"), 10) === s.dayIndex;
      tr.classList.toggle("bugun", bu);
      var th = tr.querySelector("th"), et = tr.querySelector(".bugun-etiket");
      if (bu && th && !et) { et = document.createElement("span"); et.className = "bugun-etiket"; et.textContent = "Bugün"; th.appendChild(et); }
      if (!bu && et) et.remove();
    });
    $$("[data-cizelge]").forEach(function (el) {
      el.style.setProperty("--simdi", (s.minutes / 1440 * 100).toFixed(2) + "%");
      var y = el.querySelector("[data-cizelge-yazi]");
      if (y) {
        var hh = Math.floor(s.minutes / 60), mm = s.minutes % 60;
        y.textContent = "İstanbul saatiyle şu an " + (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + ". " + s.text + ".";
      }
    });
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ---- Menü ---- */
  var ust = $(".ust"), menuDugme = $(".menu-dugme");
  if (ust && menuDugme) {
    var kapat = function () { ust.classList.remove("acik"); menuDugme.setAttribute("aria-expanded", "false"); };
    menuDugme.addEventListener("click", function () {
      var acik = ust.classList.toggle("acik");
      menuDugme.setAttribute("aria-expanded", acik ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ust.classList.contains("acik")) { kapat(); menuDugme.focus(); } });
    document.addEventListener("click", function (e) { if (ust.classList.contains("acik") && !ust.contains(e.target)) kapat(); });
  }

  /* ---- Levhalar görünürken hafifçe sallanır ---- */
  if ("IntersectionObserver" in window && !azHareket) {
    var levhaGozcu = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add("salla"); levhaGozcu.unobserve(g.target); } });
    }, { threshold: 0.7 });
    $$(".levha").forEach(function (l) { levhaGozcu.observe(l); });
  }

  /* ---- Bildirim ---- */
  var bildirimEl = null, bildirimZaman = null;
  function bildirimGizle() { if (bildirimEl) bildirimEl.classList.remove("gorunur"); }
  function bildir(metin, eylem) {
    if (!bildirimEl) {
      bildirimEl = document.createElement("div");
      bildirimEl.className = "bildirim";
      bildirimEl.setAttribute("role", "status");
      bildirimEl.setAttribute("aria-live", "polite");
      document.body.appendChild(bildirimEl);
    }
    bildirimEl.innerHTML = "";
    var sp = document.createElement("span"); sp.textContent = metin; bildirimEl.appendChild(sp);
    if (eylem) {
      var b;
      if (eylem.href) { b = document.createElement("a"); b.href = eylem.href; }
      else { b = document.createElement("button"); b.type = "button"; b.addEventListener("click", function () { eylem.fn(); bildirimGizle(); }); }
      b.textContent = eylem.metin;
      bildirimEl.appendChild(b);
    }
    requestAnimationFrame(function () { bildirimEl.classList.add("gorunur"); });
    clearTimeout(bildirimZaman);
    bildirimZaman = setTimeout(bildirimGizle, eylem ? 5200 : 3200);
  }

  /* ---- Malzeme listesi deposu (yalnız bu tarayıcıda) ---- */
  var ANAHTAR = "arican-malzeme-listesi";
  var bellek = null;
  function bosListe() { return { satirlar: [], zaman: "", foto: false, isim: "" }; }
  function oku() {
    if (bellek) return bellek;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(ANAHTAR) || "null"); } catch (e) { d = null; }
    if (!d || !Array.isArray(d.satirlar)) d = bosListe();
    bellek = d;
    return d;
  }
  function kaydet() {
    try { localStorage.setItem(ANAHTAR, JSON.stringify(bellek || bosListe())); } catch (e) { /* depolama kapalı: liste yalnız bu sayfada kalır */ }
    rozetGuncelle();
  }
  function doluSatirlar() { return oku().satirlar.filter(function (s) { return String(s.ad || "").trim(); }); }
  function rozetGuncelle() {
    var n = doluSatirlar().length;
    $$("[data-list-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }
  function birimTahmin(ad) {
    var a = kucuk(ad);
    if (/kablo|hortumu|kanalı|boru|file/.test(a)) return "metre";
    if (/çimento|sıva$|alçı|yapıştırıcı|harcı|dolgusu/.test(a)) return "torba";
    if (/boyası$|astar|vernik|tiner/.test(a)) return "litre";
    if (/takım|seti/.test(a)) return "takım";
    if (/eldiven/.test(a)) return "çift";
    if (/bant/.test(a)) return "rulo";
    return "adet";
  }
  function listeyeEkle(ad, ek) {
    ek = ek || {};
    var d = oku(), k = kucuk(ad), not = String(ek.not || "");
    var bulunan = null;
    d.satirlar.forEach(function (s) { if (!bulunan && kucuk(s.ad) === k && String(s.not || "") === not) bulunan = s; });
    if (bulunan && !ek.adet) {
      bulunan.adet = sayiYaz(sayiOku(bulunan.adet) + 1, 2);
    } else if (bulunan && ek.adet) {
      bulunan.adet = ek.adet; if (ek.birim) bulunan.birim = ek.birim;
    } else {
      var yeni = { ad: ad, adet: ek.adet || "1", birim: ek.birim || birimTahmin(ad), not: not };
      var bosIdx = -1;
      d.satirlar.forEach(function (s, i) { if (bosIdx < 0 && !String(s.ad || "").trim() && !String(s.not || "").trim()) bosIdx = i; });
      if (bosIdx > -1) d.satirlar[bosIdx] = yeni; else d.satirlar.push(yeni);
    }
  }
  rozetGuncelle();
  window.addEventListener("storage", function (e) { if (e.key === ANAHTAR) { bellek = null; rozetGuncelle(); if (listeCiz) listeCiz(); } });

  var listeCiz = null; /* liste sayfasında tanımlanır */
  var listeSayfasi = !!$("[data-liste]");

  function eklendiBildir(metin) {
    bildir(metin, listeSayfasi ? null : { metin: "Listeyi aç", href: "malzeme-listesi.html" });
  }

  /* ---- "+" düğmeleri (reyon ürünleri) ---- */
  $$("[data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      var ad = b.getAttribute("data-add");
      listeyeEkle(ad, { birim: b.getAttribute("data-birim") || undefined });
      kaydet();
      if (listeCiz) listeCiz();
      b.classList.add("eklendi");
      setTimeout(function () { b.classList.remove("eklendi"); }, 1100);
      eklendiBildir("“" + ad + "” listenize eklendi.");
    });
  });

  /* ---- İş kitleri (ana sayfa) ---- */
  var sekmeler = $$(".kit-sekme");
  if (sekmeler.length) {
    var sekmeSec = function (btn, odak) {
      sekmeler.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        var p = document.getElementById(b.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (odak) btn.focus();
    };
    sekmeler.forEach(function (b, i) {
      b.addEventListener("click", function () { sekmeSec(b); });
      b.addEventListener("keydown", function (e) {
        var j = -1, n = sekmeler.length;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (i + 1) % n;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (i - 1 + n) % n;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = n - 1;
        if (j >= 0) { e.preventDefault(); sekmeSec(sekmeler[j], true); }
      });
    });
    sekmeSec(sekmeler[0]);
  }
  $$("[data-kit-ekle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var kit = b.closest(".kit");
      var secili = $$("input.onay:checked", kit).map(function (i) { return i.value; });
      if (!secili.length) { bildir("Önce en az bir kalem işaretleyin."); return; }
      secili.forEach(function (ad) { listeyeEkle(ad); });
      kaydet();
      eklendiBildir(secili.length + " kalem listenize eklendi.");
    });
  });

  /* ---- İmza an: petek + arı + asılı reyon levhası ---- */
  var petek = $("[data-petek]");
  if (petek) {
    var hucreler = $$(".cell[data-reyon]", petek);
    var ari = $(".ari", petek);
    var tabela = $("[data-tabela]");
    var turSira = 0, turZaman = null, dokunuldu = false, gorunur = true;
    if (tabela) tabela.setAttribute("aria-live", "off");

    var ariYerlestir = function (x, y, anlik) {
      if (!ari) return;
      var eski = parseFloat(ari.getAttribute("data-x") || x);
      if (Math.abs(x - eski) > 2) ari.classList.toggle("sol", x < eski);
      ari.setAttribute("data-x", x);
      if (anlik) { ari.style.transition = "none"; }
      ari.style.setProperty("--ax", x + "px");
      ari.style.setProperty("--ay", y + "px");
      if (anlik) { void ari.offsetWidth; ari.style.transition = ""; }
    };
    var ariGotur = function (el, anlik) {
      ariYerlestir(el.offsetLeft + el.offsetWidth * 0.5, el.offsetTop - el.offsetHeight * 0.06, anlik);
    };
    var ariBaslangic = function () {
      var w = hucreler[0].offsetWidth;
      ariYerlestir(petek.offsetWidth / 2 + w * 0.62, petek.offsetHeight / 2 - w * 1.32, true);
    };
    var reyonSec = function (el) {
      hucreler.forEach(function (c) { c.setAttribute("aria-pressed", c === el ? "true" : "false"); });
      var key = el.getAttribute("data-reyon"), r = REYON[key];
      if (r && tabela) {
        $("[data-t-ad]", tabela).textContent = r.ad;
        $("[data-t-kisa]", tabela).textContent = r.kisa;
        var ik = $("[data-t-ikon]", tabela); if (ik) ik.setAttribute("href", "img/ikonlar.svg#" + r.ikon);
        var ul = $("[data-t-urun]", tabela); ul.innerHTML = "";
        r.urunler.slice(0, 5).forEach(function (u) { var li = document.createElement("li"); li.textContent = u; ul.appendChild(li); });
        $("[data-t-link]", tabela).setAttribute("href", "reyonlar.html#" + key);
        if (!azHareket) { tabela.classList.remove("salla"); void tabela.offsetWidth; tabela.classList.add("salla"); }
      }
      ariGotur(el, azHareket);
    };
    hucreler.forEach(function (c, i) {
      c.addEventListener("click", function () {
        dokunuldu = true;
        clearInterval(turZaman);
        turSira = i;
        if (tabela) tabela.setAttribute("aria-live", "polite");
        reyonSec(c);
      });
    });
    ariBaslangic();
    setTimeout(function () { if (!dokunuldu) reyonSec(hucreler[0]); }, azHareket ? 0 : 1500);
    if (!azHareket) {
      turZaman = setInterval(function () {
        if (dokunuldu || !gorunur || document.hidden) return;
        turSira = (turSira + 1) % hucreler.length;
        reyonSec(hucreler[turSira]);
      }, 3800);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (g) { gorunur = g[0].isIntersecting; }, { threshold: 0.25 }).observe(petek);
    }
    var yenidenBoyut = null;
    window.addEventListener("resize", function () {
      clearTimeout(yenidenBoyut);
      yenidenBoyut = setTimeout(function () {
        var aktif = hucreler.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0];
        if (aktif) ariGotur(aktif, true); else ariBaslangic();
      }, 120);
    });
  }

  /* ---- Dübel seçici ---- */
  var DUVAR = {
    beton: { ad: "Beton", not: "Beton serttir; darbeli (kırıcı) modda ve beton ucuyla delin.",
      hafif: ["Plastik dübel, 5–6 mm"], orta: ["Plastik dübel, 8 mm"], agir: ["Çelik dübel ya da kimyasal dübel", "Ağır askılarda askının montaj talimatındaki dübel önerisine uyun."] },
    tugla: { ad: "Dolu tuğla", not: "Darbeli modda delebilirsiniz; deliği mümkünse tuğlanın ortasına, derzden uzağa açın.",
      hafif: ["Plastik dübel, 5–6 mm"], orta: ["Plastik dübel, 8 mm"], agir: ["Kimyasal dübel", "Ağır askılarda askının montaj talimatındaki dübel önerisine uyun."] },
    delikli: { ad: "Delikli tuğla", not: "Darbe (kırıcı) modunu kapatarak delin; aksi hâlde tuğlanın içi dağılır ve dübel tutmaz.",
      hafif: ["Uzun gövdeli (çok amaçlı) plastik dübel"], orta: ["Uzun gövdeli plastik dübel, 8–10 mm"], agir: ["Kimyasal dübel ve delikli tuğla süzgeci (file)"] },
    gazbeton: { ad: "Gazbeton", not: "Darbe kapalı delin; delik çapı için dübel ambalajındaki talimata bakın.",
      hafif: ["Gazbeton dübeli (kanatlı ya da spiral)"], orta: ["Gazbeton dübeli, büyük boy"], agir: ["Gazbetona uygun kimyasal dübel"] },
    alcipan: { ad: "Alçıpan", not: "Profilin yerini bulmak için duvara hafifçe vurun; boş ses yerine dolu ses gelen yerde profil vardır.",
      hafif: ["Alçıpan dübeli (vidalı, spiral)"], orta: ["Metal gergili (kelebek) alçıpan dübeli"], agir: ["Alçıpana tek başına ağır yük asmayın", "Arkadaki metal profile ya da duvar içine konan ahşap takviyeye sabitleyin."] },
    ahsap: { ad: "Ahşap", not: "Sert ağaçta çatlamaması için önce vidadan ince bir kılavuz delik açın.",
      hafif: ["Ağaç vidası (dübel gerekmez)"], orta: ["Kalın ağaç vidası (dübel gerekmez)"], agir: ["Cıvata ve somunla geçmeli bağlantı"] }
  };
  var YUK = { hafif: "hafif yük", orta: "orta yük", agir: "ağır yük" };
  var dubelArac = $("[data-dubel]");
  if (dubelArac) {
    var dubelSonuc = $("[data-dubel-sonuc]", dubelArac);
    var dubelHesap = function () {
      var dv = ($("input[name=duvar]:checked", dubelArac) || {}).value || "beton";
      var yk = ($("input[name=yuk]:checked", dubelArac) || {}).value || "orta";
      var d = DUVAR[dv], r = d[yk];
      var oneri = r[0], ekNot = r[1] || "";
      var plastik = /plastik dübel/i.test(oneri);
      dubelSonuc.innerHTML = "";
      var p1 = document.createElement("p"); p1.textContent = d.ad + " duvar, " + YUK[yk] + " için genellikle:";
      var bb = document.createElement("span"); bb.className = "buyuk"; bb.textContent = oneri;
      var ul = document.createElement("ul");
      [d.not, ekNot, plastik ? "Matkap ucu: plastik dübelde uç çapı dübel çapıyla aynı seçilir (8 mm dübele 8 mm uç)." : "",
        /ağaç vidası|cıvata/i.test(oneri) ? "" : "Delik derinliği dübel boyundan biraz fazla olsun; vida boyu en az dübel boyu artı asılan parçanın kalınlığı kadar olmalı."]
        .filter(Boolean).forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
      dubelSonuc.appendChild(p1); dubelSonuc.appendChild(bb); dubelSonuc.appendChild(ul);
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn--sari btn--kucuk";
      btn.textContent = "Listeye ekle";
      var listeAdi = /asmayın/.test(oneri) ? "Alçıpan için ağır yük bağlantısı (sorulacak)" : oneri;
      btn.addEventListener("click", function () {
        listeyeEkle(listeAdi, { not: d.ad + ", " + YUK[yk], birim: /vidası|cıvata/i.test(oneri) ? "adet" : "paket" });
        kaydet();
        eklendiBildir("Dübel önerisi listenize eklendi.");
      });
      dubelSonuc.appendChild(btn);
    };
    $$("input", dubelArac).forEach(function (i) { i.addEventListener("change", dubelHesap); });
    dubelHesap();
  }

  /* ---- Boya hesaplayıcı ---- */
  var boyaArac = $("[data-boya]");
  if (boyaArac) {
    var bS = $("[data-boya-sonuc]", boyaArac);
    var bVal = function (n) { var el = $("[name=" + n + "]", boyaArac); return el ? sayiOku(el.value) : 0; };
    var yarim = function (n) { return Math.ceil(n * 2) / 2; };
    var son = null;
    var boyaHesap = function () {
      var en = bVal("en"), boy = bVal("boy"), yuk = bVal("yukseklik");
      var kapi = Math.max(0, Math.round(bVal("kapi"))), pen = Math.max(0, Math.round(bVal("pencere")));
      var kat = Math.max(1, Math.round(bVal("kat")) || 1), kutu = bVal("kutu");
      var tavan = !!($("[name=tavan]", boyaArac) || {}).checked;
      bS.innerHTML = "";
      if (!(en > 0 && boy > 0 && yuk > 0)) {
        var u = document.createElement("p"); u.textContent = "Odanın enini, boyunu ve tavan yüksekliğini metre olarak yazın."; bS.appendChild(u); son = null; return;
      }
      var duvar = Math.max(0, 2 * (en + boy) * yuk - kapi * 1.8 - pen * 1.5);
      var tAlan = tavan ? en * boy : 0;
      var aralik = function (alan) {
        var top = alan * kat;
        if (kutu > 0) { var v = yarim(top / kutu); return { yazi: sayiYaz(v) + " litre", adet: sayiYaz(v) }; }
        var a = yarim(top / 12), b = yarim(top / 8);
        return { yazi: sayiYaz(a) + "–" + sayiYaz(b) + " litre", adet: sayiYaz(a) + "–" + sayiYaz(b) };
      };
      var dR = aralik(duvar), tR = tavan ? aralik(tAlan) : null;
      var p = document.createElement("p");
      p.innerHTML = "Boyanacak duvar alanı yaklaşık " + sayiYaz(duvar) + " m<sup>2</sup>" + (tavan ? ", tavan " + sayiYaz(tAlan) + " m<sup>2</sup>" : "") + "; " + kat + " kat.";
      var bb = document.createElement("span"); bb.className = "buyuk"; bb.textContent = "Duvar: " + dR.yazi;
      bS.appendChild(p); bS.appendChild(bb);
      if (tR) { var tb = document.createElement("span"); tb.className = "buyuk"; tb.textContent = "Tavan: " + tR.yazi; bS.appendChild(tb); }
      var n = document.createElement("p");
      n.innerHTML = kutu > 0 ? "Hesap, yazdığınız " + sayiYaz(kutu) + " m<sup>2</sup>/litre değerine göre yapıldı." : "Aralık, tek katta litre başına 8–12 m<sup>2</sup> sarfiyata göre hesaplandı; kesin değer kutunun üzerinde yazar.";
      bS.appendChild(n);
      son = { dR: dR, tR: tR, duvar: duvar, tAlan: tAlan, kat: kat };
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn--sari btn--kucuk"; btn.textContent = "Sonucu listeye ekle";
      btn.addEventListener("click", function () {
        if (!son) return;
        listeyeEkle("İç cephe boyası", { adet: son.dR.adet, birim: "litre", not: "yaklaşık; " + sayiYaz(son.duvar, 0) + " metrekare duvar, " + son.kat + " kat" });
        if (son.tR) listeyeEkle("Tavan boyası", { adet: son.tR.adet, birim: "litre", not: "yaklaşık; " + sayiYaz(son.tAlan, 0) + " metrekare tavan, " + son.kat + " kat" });
        kaydet();
        eklendiBildir("Boya ihtiyacı listenize eklendi.");
      });
      bS.appendChild(btn);
    };
    $$("input", boyaArac).forEach(function (i) { i.addEventListener("input", boyaHesap); i.addEventListener("change", boyaHesap); });
    boyaHesap();
  }

  /* ---- Torba hesabı ---- */
  var torbaArac = $("[data-torba]");
  if (torbaArac) {
    var tS = $("[data-torba-sonuc]", torbaArac);
    var tVal = function (n) { var el = $("[name=" + n + "]", torbaArac); return el ? sayiOku(el.value) : 0; };
    var torbaHesap = function () {
      var alan = tVal("alan"), sarf = tVal("sarfiyat"), kg = tVal("torba");
      var urun = ($("[name=urun]", torbaArac) || {}).value || "Seramik yapıştırıcısı";
      tS.innerHTML = "";
      if (!(alan > 0 && sarf > 0 && kg > 0)) {
        var u = document.createElement("p");
        u.innerHTML = "Alanı ve ambalajın üzerinde yazan sarfiyatı (kg/m<sup>2</sup>) ile torba ağırlığını girin; kaç torba gerektiğini hesaplayalım.";
        tS.appendChild(u); return;
      }
      var toplam = alan * sarf, adet = Math.ceil(toplam / kg);
      var p = document.createElement("p"); p.innerHTML = sayiYaz(alan) + " m<sup>2</sup> × " + sayiYaz(sarf) + " kg/m<sup>2</sup> = yaklaşık " + sayiYaz(toplam) + " kg";
      var bb = document.createElement("span"); bb.className = "buyuk"; bb.textContent = adet + " torba";
      var n = document.createElement("p"); n.textContent = "Kırılan, dökülen ve yüzey bozukluğu için bir miktar pay bırakmak iyi olur.";
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn--sari btn--kucuk"; btn.textContent = "Listeye ekle";
      btn.addEventListener("click", function () {
        listeyeEkle(urun, { adet: String(adet), birim: "torba", not: sayiYaz(alan) + " metrekare için" });
        kaydet();
        eklendiBildir(urun + " listenize eklendi.");
      });
      tS.appendChild(p); tS.appendChild(bb); tS.appendChild(n); tS.appendChild(btn);
    };
    $$("input, select", torbaArac).forEach(function (i) { i.addEventListener("input", torbaHesap); i.addEventListener("change", torbaHesap); });
    torbaHesap();
  }

  /* ---- Kopyalama ---- */
  function kopyala(metin, tamam) {
    var yedek = function () {
      var t = document.createElement("textarea");
      t.value = metin; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0"; t.style.left = "0"; t.style.top = "0";
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      t.remove(); tamam(ok);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(metin).then(function () { tamam(true); }, yedek);
    } else { yedek(); }
  }

  /* ---- Malzeme listesi aracı (imza özellik) ---- */
  var listeKok = $("[data-liste]");
  if (listeKok) {
    var ul = $("[data-satirlar]", listeKok);
    var bosEl = $("[data-bos]", listeKok);
    var onizleme = $("[data-onizleme]");
    var gonder = $("[data-gonder]");
    var mesajDurum = $("[data-mesaj-durum]");
    var dl = document.getElementById("urunler");
    if (dl) {
      var tum = [];
      SIRA.forEach(function (k) { REYON[k].urunler.forEach(function (u) { if (tum.indexOf(u) < 0) tum.push(u); }); });
      tum.sort(function (a, b) { return a.localeCompare(b, "tr"); }).forEach(function (u) { var o = document.createElement("option"); o.value = u; dl.appendChild(o); });
    }

    var mesajKur = function () {
      var d = oku(), dolu = doluSatirlar();
      if (!dolu.length) return "";
      var L = ["Merhaba Arıcan Yapı Market,", "aşağıdaki malzemeler için stok ve fiyat bilgisi alabilir miyim?", ""];
      dolu.forEach(function (s, i) {
        var t = (i + 1) + ") " + String(s.ad).trim();
        var m = String(s.adet || "").trim();
        if (m && sayiOku(m) !== 0) t += " — " + m + " " + (s.birim || "");
        else if (m && isNaN(parseFloat(m.replace(",", ".")))) t += " — " + m + " " + (s.birim || "");
        if (String(s.not || "").trim()) t += " (" + String(s.not).trim() + ")";
        L.push(t.trim());
      });
      var ek = [];
      if (d.zaman) ek.push("Ne zaman lazım: " + d.zaman);
      if (d.foto) ek.push("Adını bilmediğim parça(lar)ın fotoğrafını bu mesajın ardından gönderiyorum.");
      if (ek.length) { L.push(""); L = L.concat(ek); }
      L.push("");
      L.push("Teşekkürler." + (String(d.isim || "").trim() ? " " + String(d.isim).trim() : ""));
      return L.join("\n");
    };
    var mesajGuncelle = function () {
      var m = mesajKur();
      if (m) {
        onizleme.textContent = m; onizleme.classList.remove("bos");
        gonder.setAttribute("href", waLink(m)); gonder.removeAttribute("aria-disabled");
      } else {
        onizleme.textContent = "Listeye ürün ekledikçe mesajınız burada oluşur. Ürün adını, adedini ve varsa ölçüsünü yazın."; onizleme.classList.add("bos");
        gonder.setAttribute("href", WA); gonder.setAttribute("aria-disabled", "true");
      }
      rozetGuncelle();
    };
    gonder.addEventListener("click", function (e) {
      if (gonder.getAttribute("aria-disabled") === "true") { e.preventDefault(); bildir("Önce listeye en az bir ürün yazın."); }
    });

    var ikonDugme = function (ikon, etiket, sinif) {
      var b = document.createElement("button"); b.type = "button"; if (sinif) b.className = sinif;
      b.setAttribute("aria-label", etiket);
      b.innerHTML = '<svg aria-hidden="true"><use href="img/ikonlar.svg#' + ikon + '"/></svg>';
      return b;
    };
    var satirEl = function (s, i) {
      var li = document.createElement("li"); li.className = "satir";
      var no = document.createElement("span"); no.className = "satir-no"; no.setAttribute("aria-hidden", "true"); no.textContent = i + 1;
      var adK = document.createElement("div"); adK.className = "s-ad";
      var adL = document.createElement("label"); adL.className = "gizli"; adL.htmlFor = "urun-" + i; adL.textContent = (i + 1) + ". ürün";
      var ad = document.createElement("input"); ad.className = "girdi"; ad.id = "urun-" + i; ad.setAttribute("list", "urunler"); ad.autocomplete = "off";
      ad.placeholder = "Ürün (ör. 8 mm plastik dübel)"; ad.value = s.ad || "";
      ad.addEventListener("input", function () { s.ad = ad.value; kaydet(); mesajGuncelle(); });
      adK.appendChild(adL); adK.appendChild(ad);

      var adetK = document.createElement("div"); adetK.className = "s-adet";
      var adim = document.createElement("div"); adim.className = "adim";
      var az = ikonDugme("i-eksi", (i + 1) + ". ürünün miktarını azalt");
      var mk = document.createElement("input"); mk.setAttribute("inputmode", "decimal"); mk.setAttribute("aria-label", (i + 1) + ". ürünün miktarı"); mk.value = s.adet || "";
      var cok = ikonDugme("i-arti", (i + 1) + ". ürünün miktarını artır");
      var degis = function (fark) { var v = Math.max(0, sayiOku(mk.value) + fark); mk.value = sayiYaz(v, 2); s.adet = mk.value; kaydet(); mesajGuncelle(); };
      az.addEventListener("click", function () { degis(-1); });
      cok.addEventListener("click", function () { degis(1); });
      mk.addEventListener("input", function () { s.adet = mk.value; kaydet(); mesajGuncelle(); });
      adim.appendChild(az); adim.appendChild(mk); adim.appendChild(cok);
      var sel = document.createElement("select"); sel.className = "girdi"; sel.setAttribute("aria-label", (i + 1) + ". ürünün birimi");
      var bl = BIRIMLER.slice(); if (s.birim && bl.indexOf(s.birim) < 0) bl.unshift(s.birim);
      bl.forEach(function (b) { var o = document.createElement("option"); o.value = b; o.textContent = b; if (b === (s.birim || "adet")) o.selected = true; sel.appendChild(o); });
      sel.addEventListener("change", function () { s.birim = sel.value; kaydet(); mesajGuncelle(); });
      adetK.appendChild(adim); adetK.appendChild(sel);

      var notK = document.createElement("div"); notK.className = "s-not";
      var nt = document.createElement("input"); nt.className = "girdi"; nt.placeholder = "Ölçü, renk ya da not (isteğe bağlı)"; nt.setAttribute("aria-label", (i + 1) + ". ürün için not"); nt.value = s.not || "";
      nt.addEventListener("input", function () { s.not = nt.value; kaydet(); mesajGuncelle(); });
      notK.appendChild(nt);

      var sil = ikonDugme("i-carpi", (i + 1) + ". satırı sil", "s-sil");
      sil.addEventListener("click", function () {
        var d = oku(), idx = d.satirlar.indexOf(s);
        if (idx > -1) d.satirlar.splice(idx, 1);
        kaydet(); listeCiz();
        var sonraki = $$(".satir .s-ad input", ul)[Math.min(idx, d.satirlar.length - 1)];
        if (sonraki) sonraki.focus(); else ($("[data-satir-ekle]") || document.body).focus();
      });

      li.appendChild(no); li.appendChild(adK); li.appendChild(adetK); li.appendChild(notK); li.appendChild(sil);
      return li;
    };
    listeCiz = function () {
      var d = oku();
      if (!d.satirlar.length) d.satirlar.push({ ad: "", adet: "1", birim: "adet", not: "" });
      ul.innerHTML = "";
      d.satirlar.forEach(function (s, i) { ul.appendChild(satirEl(s, i)); });
      bosEl.hidden = doluSatirlar().length > 0;
      mesajGuncelle();
    };

    $("[data-satir-ekle]").addEventListener("click", function () {
      var d = oku();
      d.satirlar.push({ ad: "", adet: "1", birim: "adet", not: "" });
      kaydet(); listeCiz();
      var inp = $$(".satir .s-ad input", ul).pop(); if (inp) inp.focus();
    });

    /* Hızlı ekle: reyon sekmeleri + ürün çipleri */
    var hsek = $("[data-hizli-sekme]"), cipler = $("[data-cipler]");
    if (hsek && cipler) {
      var cipleriCiz = function (key) {
        $$("button", hsek).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-k") === key ? "true" : "false"); });
        cipler.innerHTML = "";
        var dizi = key === "foto" ? ["Fotoğraftaki parça"] : REYON[key].urunler;
        dizi.forEach(function (u) {
          var c = document.createElement("button"); c.type = "button"; c.className = "cip"; c.textContent = u;
          c.setAttribute("aria-label", u + ": listeye ekle");
          c.addEventListener("click", function () {
            listeyeEkle(u);
            if (u === "Fotoğraftaki parça") { oku().foto = true; var fk = $("[data-foto]"); if (fk) fk.checked = true; }
            kaydet(); listeCiz();
            bildir("“" + u + "” eklendi.");
          });
          cipler.appendChild(c);
        });
      };
      SIRA.forEach(function (k) {
        var b = document.createElement("button"); b.type = "button"; b.setAttribute("data-k", k);
        b.innerHTML = '<svg aria-hidden="true"><use href="img/ikonlar.svg#' + REYON[k].ikon + '"/></svg>';
        b.appendChild(document.createTextNode(REYON[k].ad.split(" ve ")[0].split(",")[0]));
        b.addEventListener("click", function () { cipleriCiz(k); });
        hsek.appendChild(b);
      });
      var fb = document.createElement("button"); fb.type = "button"; fb.setAttribute("data-k", "foto");
      fb.innerHTML = '<svg aria-hidden="true"><use href="img/ikonlar.svg#i-kamera"/></svg>';
      fb.appendChild(document.createTextNode("Adını bilmediğim parça"));
      fb.addEventListener("click", function () { cipleriCiz("foto"); });
      hsek.appendChild(fb);
      cipleriCiz("hirdavat");
    }
    var kitKap = $("[data-kitler]");
    if (kitKap) {
      Object.keys(KITLER).forEach(function (k) {
        var b = document.createElement("button"); b.type = "button"; b.className = "cip"; b.textContent = KITLER[k].ad;
        b.setAttribute("aria-label", KITLER[k].ad + " başlangıç listesini ekle");
        b.addEventListener("click", function () {
          KITLER[k].kalem.forEach(function (u) { listeyeEkle(u); });
          kaydet(); listeCiz();
          bildir(KITLER[k].kalem.length + " kalem eklendi; adetleri düzenleyin.");
        });
        kitKap.appendChild(b);
      });
    }

    /* Seçenekler */
    var d0 = oku();
    $$("input[name=zaman]").forEach(function (r) {
      if (r.value === (d0.zaman || "")) r.checked = true;
      r.addEventListener("change", function () { if (r.checked) { oku().zaman = r.value; kaydet(); mesajGuncelle(); } });
    });
    var fotoK = $("[data-foto]");
    if (fotoK) { fotoK.checked = !!d0.foto; fotoK.addEventListener("change", function () { oku().foto = fotoK.checked; kaydet(); mesajGuncelle(); }); }
    var isimG = $("[data-isim]");
    if (isimG) { isimG.value = d0.isim || ""; isimG.addEventListener("input", function () { oku().isim = isimG.value; kaydet(); mesajGuncelle(); }); }

    /* Mesaj düğmeleri */
    var durumYazi = function (t) { if (mesajDurum) { mesajDurum.textContent = t; setTimeout(function () { if (mesajDurum.textContent === t) mesajDurum.textContent = ""; }, 4000); } };
    $("[data-kopyala]").addEventListener("click", function () {
      var m = mesajKur();
      if (!m) { bildir("Kopyalanacak bir liste yok; önce ürün ekleyin."); return; }
      kopyala(m, function (ok) { durumYazi(ok ? "Mesaj kopyalandı. SMS'e ya da istediğiniz uygulamaya yapıştırabilirsiniz." : "Kopyalanamadı; mesajı seçip elle kopyalayın."); });
    });
    var yazdir = $("[data-yazdir]");
    if (yazdir) yazdir.addEventListener("click", function () { window.print(); });
    $("[data-temizle]").addEventListener("click", function () {
      var d = oku();
      if (!d.satirlar.length) { bildir("Liste zaten boş."); return; }
      var yedek = JSON.parse(JSON.stringify(d));
      bellek = bosListe(); kaydet(); listeCiz();
      $$("input[name=zaman]").forEach(function (r) { r.checked = r.value === ""; });
      if (fotoK) fotoK.checked = false;
      if (isimG) isimG.value = "";
      bildir("Liste temizlendi.", { metin: "Geri al", fn: function () {
        bellek = yedek; kaydet(); listeCiz();
        $$("input[name=zaman]").forEach(function (r) { r.checked = r.value === (yedek.zaman || ""); });
        if (fotoK) fotoK.checked = !!yedek.foto; if (isimG) isimG.value = yedek.isim || "";
      } });
    });

    listeCiz();
  }

  /* ---- Hızlı soru (İletişim) ---- */
  var soru = $("[data-soru]");
  if (soru) {
    var sU = $("[data-soru-urun]", soru), sO = $("[data-soru-olcu]", soru), sF = $("[data-soru-foto]", soru);
    var sP = $("[data-soru-onizleme]", soru), sG = $("[data-soru-gonder]", soru), sD = $("[data-soru-durum]", soru);
    var soruMesaj = function () {
      var u = sU.value.trim(), o = sO.value.trim();
      if (!u && !sF.checked) return "";
      var L = ["Merhaba Arıcan Yapı Market,"];
      if (u) L.push(u + " arıyorum." + (o ? " Ölçü / miktar: " + o + "." : ""));
      else L.push("Bir parça arıyorum." + (o ? " Ölçü / miktar: " + o + "." : ""));
      L.push("Stokta var mı, fiyatı nedir?");
      if (sF.checked) L.push("Parçanın fotoğrafını bu mesajın ardından gönderiyorum.");
      L.push("Teşekkürler.");
      return L.join("\n");
    };
    var soruGuncelle = function () {
      var m = soruMesaj();
      if (m) { sP.textContent = m; sP.classList.remove("bos"); sG.href = waLink(m); sG.removeAttribute("aria-disabled"); }
      else { sP.textContent = "Ne aradığınızı yazın; mesajınız burada hazırlanır."; sP.classList.add("bos"); sG.href = WA; sG.setAttribute("aria-disabled", "true"); }
    };
    [sU, sO, sF].forEach(function (el) { el.addEventListener("input", soruGuncelle); el.addEventListener("change", soruGuncelle); });
    sG.addEventListener("click", function (e) { if (sG.getAttribute("aria-disabled") === "true") { e.preventDefault(); bildir("Önce ne aradığınızı yazın."); sU.focus(); } });
    $("[data-soru-kopyala]", soru).addEventListener("click", function () {
      var m = soruMesaj();
      if (!m) { bildir("Önce ne aradığınızı yazın."); return; }
      kopyala(m, function (ok) { sD.textContent = ok ? "Mesaj kopyalandı." : "Kopyalanamadı; mesajı seçip elle kopyalayın."; });
    });
    soruGuncelle();
  }
})();
