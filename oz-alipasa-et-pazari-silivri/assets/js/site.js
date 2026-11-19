/* Öz Alipaşa Et Pazarı — site.js (bağımlılık yok) */
(function () {
  "use strict";

  var WA = "https://wa.me/905367701346";
  var MARKA = "Öz Alipaşa Et Pazarı";
  var HOURS = { "0": [["08:00", "19:30"]], "1": [["08:00", "19:30"]], "2": [["08:00", "19:30"]], "3": [["08:00", "19:30"]], "4": [["08:00", "19:30"]], "5": [["08:00", "19:30"]], "6": [["08:00", "19:30"]] };

  /* ---------- açık / kapalı (kit/status.js) ---------- */
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

  /* ---------- yardımcılar ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function waLink(m) { return WA + "?text=" + encodeURIComponent(m); }
  function miktarYaz(m, b) {
    if (b === "adet") return m + " adet";
    if (m < 1000) return m + " g";
    return String(m / 1000).replace(".", ",") + " kg";
  }
  function adim(b) { return b === "adet" ? 1 : 250; }
  function sinir(m, b) { var a = adim(b), ust = b === "adet" ? 30 : 15000; return Math.max(a, Math.min(ust, m)); }
  var azHareket = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function durumYaz() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var hedef = el.closest("[data-status-kap]") || el;
      hedef.classList.toggle("is-open", s.open);
      hedef.classList.toggle("is-closed", !s.open);
    });
    $$("[data-status-kisa]").forEach(function (el) { el.textContent = s.open ? "AÇIK" : "KAPALI"; });
    $$("[data-gun]").forEach(function (tr) { tr.classList.toggle("bugun", +tr.getAttribute("data-gun") === s.dayIndex); });
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ---------- gezinme ---------- */
  var md = $(".menu-dugme"), gez = $("#gez");
  if (md && gez) {
    var menuAyar = function (acik) { md.setAttribute("aria-expanded", String(acik)); gez.classList.toggle("is-acik", acik); };
    md.addEventListener("click", function () { menuAyar(md.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && md.getAttribute("aria-expanded") === "true") { menuAyar(false); md.focus(); } });
    document.addEventListener("click", function (e) { if (md.getAttribute("aria-expanded") === "true" && !e.target.closest(".ust")) menuAyar(false); });
  }

  /* ---------- ürünler ---------- */
  var H = {
    biftek: ["3 cm dilim", "2 cm dilim", "Bütün parça", "Kasap önersin"],
    parca: ["Kuşbaşı", "Bütün parça", "Kıyma çekilsin", "Kasap önersin"],
    kusbasi: ["Orta boy", "İri", "Küçük (sotelik)"],
    kemik: ["Kemikli, iri parça", "Kemikli, dilim", "Kemiksiz"],
    kiyma: ["Orta yağlı, tek çekim", "Orta yağlı, çift çekim", "Yağsız, çift çekim", "Yağlı, tek çekim"],
    pirzola: ["Kalın kesim", "İnce kesim", "Dövülmüş"]
  };
  var KATALOG = [
    { k: "dana", ad: "Dana", u: [
      ["dana-antrikot", "Dana antrikot", "g", H.biftek],
      ["dana-kontrfile", "Dana kontrfile", "g", H.biftek],
      ["dana-bonfile", "Dana bonfile", "g", ["Lokum (madalyon)", "Bütün parça", "Sotelik doğransın"]],
      ["dana-kusbasi", "Dana kuşbaşı", "g", H.kusbasi],
      ["dana-but", "Dana but", "g", ["Bütün parça", "Kuşbaşı", "Yaprak (ince dilim)", "Kıyma çekilsin"]],
      ["dana-sokum", "Dana sokum", "g", ["Rostoluk, sicimle bağlı", "Külbastı", "Kuşbaşı"]],
      ["dana-kurek", "Dana kürek / kol", "g", H.parca],
      ["dana-gerdan", "Dana gerdan", "g", H.kemik],
      ["dana-incik", "Dana incik", "g", H.kemik],
      ["dana-kaburga", "Dana kaburga", "g", ["Kemikli, iri kesim", "Kemikli, ince kesim (ızgaralık)"]],
      ["dana-dos", "Dana döş", "g", ["Bütün parça", "Haşlamalık doğransın", "Kıyma çekilsin"]],
      ["dana-bogur", "Dana böğür (sancak)", "g", ["Kıyma çekilsin", "Bütün parça"]]
    ] },
    { k: "kuzu", ad: "Kuzu", u: [
      ["kuzu-pirzola", "Kuzu pirzola", "g", H.pirzola],
      ["kuzu-bel", "Kuzu bel", "g", ["Külbastı açılsın", "Bel pirzola", "Şişlik doğransın"]],
      ["kuzu-but", "Kuzu but", "g", ["Bütün (fırınlık)", "Şişlik doğransın", "Kuşbaşı", "Külbastı"]],
      ["kuzu-kol", "Kuzu kol", "g", ["Bütün (tandırlık)", "İri parça", "Kuşbaşı"]],
      ["kuzu-gerdan", "Kuzu gerdan", "g", ["Dilim (haşlamalık)", "Bütün"]],
      ["kuzu-incik", "Kuzu incik", "adet", ["Bütün", "Ortadan ikiye"]],
      ["kuzu-dos", "Kuzu döş / kaburga", "g", ["Dolmalık (cep açılsın)", "Haşlamalık doğransın", "Bütün"]],
      ["kuzu-kusbasi", "Kuzu kuşbaşı", "g", H.kusbasi],
      ["kuzu-kuyruk", "Kuyruk yağı", "g", ["Küçük doğransın", "Bütün"]]
    ] },
    { k: "kiyma", ad: "Kıyma", u: [
      ["kiyma-dana", "Dana kıyma", "g", H.kiyma],
      ["kiyma-kuzu", "Kuzu kıyma", "g", H.kiyma],
      ["kiyma-karisik", "Karışık kıyma (dana-kuzu)", "g", H.kiyma],
      ["kiyma-kofte", "Köftelik kıyma", "g", ["Orta yağlı, çift çekim", "Orta yağlı, tek çekim", "Yağlı, tek çekim"]]
    ] },
    { k: "mangal", ad: "Mangal", u: [
      ["mangal-kofte", "Kasap köfte", "g", ["Izgaralık şekil verilmiş", "Harç olarak"]],
      ["kuzu-pirzola", "Kuzu pirzola", "g", H.pirzola],
      ["kuzu-sis", "Kuzu şiş", "g", ["Şişlik doğransın", "Şişe dizilsin"]],
      ["dana-antrikot", "Dana antrikot", "g", H.biftek],
      ["tavuk-kanat", "Tavuk kanat", "g", ["Bütün", "Ortadan ayrılmış"]],
      ["sucuk", "Sucuk", "g", ["Kangal", "Dilimlensin"]]
    ] },
    { k: "beyaz", ad: "Beyaz et", u: [
      ["tavuk-gogus", "Tavuk göğüs", "g", ["Bütün", "Kuşbaşı", "İnce dilim (şnitzellik)"]],
      ["tavuk-but", "Tavuk but", "g", ["Kemikli", "Kemiksiz", "Açılmış (pirzola)"]],
      ["tavuk-kanat", "Tavuk kanat", "g", ["Bütün", "Ortadan ayrılmış"]],
      ["tavuk-butun", "Bütün tavuk", "adet", ["Bütün", "Parçalansın"]],
      ["hindi", "Hindi eti", "g", ["Kasap önersin"]]
    ] },
    { k: "sarkuteri", ad: "Şarküteri", u: [
      ["sucuk", "Sucuk", "g", ["Kangal", "Dilimlensin"]],
      ["pastirma", "Pastırma", "g", ["İnce dilim", "Bütün parça"]],
      ["kavurma", "Kavurma", "g", ["Dilim", "Bütün parça"]]
    ] }
  ];
  var URUN = {};
  KATALOG.forEach(function (g) { g.u.forEach(function (u) { if (!URUN[u[0]]) URUN[u[0]] = { ad: u[1], b: u[2], h: u[3], g: g.k }; }); });
  function varsayilan(k) { var u = URUN[k]; if (!u) return 500; if (u.b === "adet") return 1; return (u.g === "sarkuteri" || k === "kuzu-kuyruk") ? 250 : 500; }

  /* ---------- liste deposu ---------- */
  var Liste = (function () {
    var ANAHTAR = "ozalipasa-liste-v1", bellek = null, dinleyenler = [];
    function oku() {
      if (bellek) return bellek;
      try { var v = JSON.parse(localStorage.getItem(ANAHTAR) || "[]"); bellek = Array.isArray(v) ? v.filter(function (x) { return x && x.k && x.ad && x.m > 0; }) : []; }
      catch (e) { bellek = []; }
      return bellek;
    }
    function yaz(sessiz) {
      try { localStorage.setItem(ANAHTAR, JSON.stringify(bellek)); } catch (e) { /* özel sekme: yalnız bellekte tutulur */ }
      dinleyenler.forEach(function (f) { f(bellek, sessiz); });
    }
    return {
      hepsi: oku,
      dinle: function (f) { dinleyenler.push(f); },
      ekle: function (k, m, h, ad, b) {
        var a = oku(), u = URUN[k] || { ad: ad, b: b || "g", h: [] };
        var var_ = null;
        a.forEach(function (x) { if (x.k === k && (x.h || "") === (h || "")) var_ = x; });
        if (var_) var_.m = sinir(var_.m + m, var_.b);
        else a.push({ k: k, ad: u.ad, b: u.b, m: sinir(m, u.b), h: h || "" });
        yaz(false);
      },
      degistir: function (i, alan, deger) { var a = oku(); if (a[i]) { a[i][alan] = deger; yaz(true); } },
      sil: function (i) { oku().splice(i, 1); yaz(false); },
      bosalt: function () { bellek = []; yaz(false); },
      icerir: function (k) { return oku().some(function (x) { return x.k === k; }); }
    };
  })();
  function sayiYaz() {
    var n = Liste.hepsi().length;
    $$("[data-liste-sayi]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }
  Liste.dinle(sayiYaz);
  sayiYaz();

  /* ---------- fiş: önizleme + WhatsApp + kopyala ---------- */
  function fisBagla(kok, mesaj) {
    var pre = $("[data-fis-metin]", kok), wa = $("[data-fis-wa]", kok), kop = $("[data-fis-kopya]", kok);
    function yenile() { var m = mesaj(); if (pre) pre.textContent = m; if (wa) wa.href = waLink(m); }
    if (kop) kop.addEventListener("click", function () {
      var m = mesaj(), eski = kop.textContent;
      function tamam() { kop.textContent = "Kopyalandı"; setTimeout(function () { kop.textContent = eski; }, 1800); }
      function yedek() {
        var t = document.createElement("textarea"); t.value = m; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); tamam(); } catch (e) { kop.textContent = "Kopyalanamadı"; }
        document.body.removeChild(t);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(tamam, yedek); else yedek();
    });
    yenile();
    return yenile;
  }

  /* ---------- kesim verisi ---------- */
  var KESIM = {
    dana: {
      p: {
        gerdan: { no: 1, ad: "Gerdan", yer: "Boyun; başla kürek arası", yum: 2, yag: 3, ozet: "Hayvanın en çok çalışan kaslarından. Serttir ama lezzeti derindir; bağ dokusu uzun pişirmede eriyip suyuna koyuluk verir.", yemek: ["Haşlama", "Tencere yemeği", "Et suyu", "Lezzetli kıyma"], pisirme: "Kısık ateşte uzun süre; düdüklü tencerede de güzel olur.", soz: "Haşlamalık gerdan istiyorum, kemikli olsun, iri parçalayın.", urun: "dana-gerdan" },
        kurek: { no: 2, ad: "Kürek ve kol", yer: "Ön omuz; gerdanın arkası, döşün üstü", yum: 3, yag: 3, ozet: "Orta yağlı, lifleri belirgin bir bölge. Kuşbaşı ve kıyma dendiğinde ilk akla gelen yerlerden biridir.", yemek: ["Kuşbaşı yahni", "Güveç", "Tas kebabı", "Köftelik kıyma"], pisirme: "Tencerede ağır ağır; kıyma olarak hemen her yemeğe gider.", soz: "Kürekten orta boy kuşbaşı, sinirleri alınmış olsun.", urun: "dana-kurek" },
        antrikot: { no: 3, ad: "Antrikot", yer: "Sırtın ön yarısı, kaburgaların üstü", yum: 4, yag: 4, ozet: "Kasın içine dağılmış ince yağ damarları pişerken erir ve eti kendi yağında yumuşatır. Izgaranın gözdesidir.", yemek: ["Izgara", "Mangal", "Döküm tavada biftek", "Kemikli dana pirzola"], pisirme: "Kızgın ateşte kısa süre; ateşten alınca birkaç dakika dinlendirin.", soz: "Üç santim kalınlığında antrikot dilimi; kenar yağı kalsın.", urun: "dana-antrikot" },
        kontrfile: { no: 4, ad: "Kontrfile", yer: "Sırtın bel tarafı, antrikotun devamı", yum: 4, yag: 3, ozet: "Antrikota göre daha derli toplu ve az yağlıdır; bir kenarında yağ şeridi bulunur. Düzgün, eşit dilim verir.", yemek: ["Izgara biftek", "Tava", "Rozbif", "Dana şiş"], pisirme: "Yüksek ateş, kısa süre. Yağ şeridini pişerken bırakın, tabakta ayırırsınız.", soz: "Kontrfileden üç santim kalınlığında biftek.", urun: "dana-kontrfile" },
        bonfile: { no: 5, ad: "Bonfile", yer: "Belin iç tarafında, kontrfilenin altındaki ince uzun kas", yum: 5, yag: 1, ozet: "Neredeyse hiç çalışmayan bir kas olduğu için etin en yumuşak parçasıdır. Yağsızdır; lezzetini kısa ve sert ateşten alır.", yemek: ["Lokum bonfile", "Madalyon", "Sote", "Fırında bütün bonfile"], pisirme: "Çok kısa süre, kızgın tava ya da ızgara. Fazla pişerse kurur.", soz: "Bonfilenin orta kısmından, üç parmak kalınlığında lokum.", urun: "dana-bonfile" },
        sokum: { no: 6, ad: "Sokum", yer: "Belin buta bağlandığı yer", yum: 3, yag: 2, ozet: "Yağsız ama lezzetli; biftekle kuşbaşı arasında, iki işe de gelen bir bölgedir.", yemek: ["Rosto", "Rozbif", "Külbastı", "Dana şiş", "Kuşbaşı"], pisirme: "Bütün halde fırında ya da ince dilim olarak ızgarada.", soz: "Sokumdan rostoluk tek parça; sicimle bağlar mısınız?", urun: "dana-sokum" },
        but: { no: 7, ad: "But", diger: "Nuar, tranç, kontrnuar, yumurta", yer: "Arka bacağın üstü; dört büyük kastan oluşur", yum: 3, yag: 1, ozet: "Reyonun en yağsız ve en bol et veren bölgesi. Nuar rostoya, tranç şnitzele ve yaprak ete, kontrnuar kuşbaşı ile kavurmaya, yumurta yağsız kıymaya gider.", yemek: ["Rosto", "Şnitzel", "Yaprak et", "Kavurma", "Yağsız kıyma", "Kuşbaşı"], pisirme: "Yağsız olduğu için ya çok kısa ya da sulu ve uzun pişirin.", soz: "Tranştan şnitzellik, ince açın.", urun: "dana-but" },
        dos: { no: 8, ad: "Döş", yer: "Göğüs; ön bacakların arası", yum: 2, yag: 5, ozet: "Yağlı ve liflidir. Kıymaya katıldığında köfteyi sulu yapar; tek başına uzun pişirildiğinde lif lif ayrılır.", yemek: ["Köftelik kıyma (karışımda)", "Haşlama", "Fırında ağır pişirme", "Döner"], pisirme: "Düşük ısıda saatlerce; ya da kıyma karışımının yağ payı olarak.", soz: "Köftelik kıymaya biraz döş katın.", urun: "dana-dos" },
        incik: { no: 9, ad: "İncik", yer: "Ön ve arka bacakların alt kısmı", yum: 2, yag: 2, ozet: "Bağ dokusu ve jelatin deposudur. Sabırla pişince kaşıkla ayrılacak kadar yumuşar, suyunu da koyulaştırır.", yemek: ["Fırında incik", "Haşlama", "Kemik suyu", "Koyu kıvamlı çorba"], pisirme: "Fırında ya da tencerede birkaç saat; acele sevmez.", soz: "Arka incik, kemikli; ortadan ikiye kesin.", urun: "dana-incik" },
        kaburga: { no: 10, ad: "Kaburga", yer: "Göğüs kafesinin orta ve alt kısmı", yum: 2, yag: 4, ozet: "Kemik, et ve yağ katman katmandır. Kemiğin verdiği lezzet uzun pişirmede ortaya çıkar.", yemek: ["Fırında kaburga", "Haşlama", "İnce kesim ızgara", "Et suyu"], pisirme: "Fırında ağır ateşte; ince kesilirse mangalda da olur.", soz: "Kaburgayı kemikli, dört parmak eninde kesin.", urun: "dana-kaburga" },
        bogur: { no: 11, ad: "Böğür", diger: "Sancak, etek", yer: "Karın boşluğunun çevresi; kaburganın arkası", yum: 2, yag: 4, ozet: "İnce, lifli ve yağlıdır. Kıyma olarak lahmacun ve köfte harcına lezzet verir; lifine ters kesilirse ızgarada da güzeldir.", yemek: ["Lahmacun ve pide kıyması", "Köfte harcı", "Kavurma", "Dolma, sarma içi"], pisirme: "Kıyma olarak her işe gelir; parça halinde uzun pişirin.", soz: "Sancaktan orta yağlı kıyma, tek çekim.", urun: "dana-bogur" }
      },
      y: {
        izgara: { ad: "Izgara biftek", p: ["antrikot", "kontrfile", "bonfile"], not: "Kısa sürede, kızgın ateşte pişecek et yumuşak olmalı; içinde ince yağ damarı varsa daha da iyi." },
        kofte: { ad: "Köfte", p: ["dos", "kurek", "bogur"], not: "Köftenin suyu yağdan gelir. Yağsız buttan çekilen kıyma kuru kalır; döş ya da sancak karışımlı, orta yağlı kıyma isteyin." },
        kusbasi: { ad: "Kuşbaşı yemek", p: ["kurek", "but", "sokum"], not: "Yahni, güveç, tas kebabı gibi sulu yemeklerde hafif yağlı kürek daha yumuşak düşer; yağsız seviyorsanız but." },
        haslama: { ad: "Haşlama", p: ["gerdan", "incik", "kaburga", "dos"], not: "Haşlamanın lezzeti kemikten ve bağ dokusundan gelir. Kemikli parça isteyin, suyunu atmayın." },
        rosto: { ad: "Rosto", p: ["but", "sokum", "kontrfile"], not: "Tek parça, düzgün şekilli ve az yağlı kas gerekir. Sicimle bağlatırsanız pişerken şeklini korur." },
        kavurma: { ad: "Kavurma", p: ["but", "kurek", "bogur"], not: "Kendi yağında ağır ağır pişer. Yağsız ete biraz yağlı parça eklemek kavurmayı yumuşatır." },
        manti: { ad: "Mantı, içli köfte", p: ["but"], not: "İnce hamurun içine yağsız ve çift çekilmiş kıyma yakışır." },
        lahmacun: { ad: "Lahmacun, pide", p: ["bogur", "dos", "kurek"], not: "Harç fırında kurumasın diye kıymanın yağlı taraftan olması istenir." },
        firin: { ad: "Fırında uzun pişirme", p: ["incik", "kaburga", "dos", "gerdan"], not: "Sert ve bağ dokulu parçalar düşük ısıda saatler içinde lokum gibi olur." },
        sis: { ad: "Dana şiş", p: ["sokum", "kontrfile", "bonfile"], not: "Şişte et küçük doğrandığı için çabuk kurur; yumuşak bölgelerden seçin." },
        etsuyu: { ad: "Et suyu", p: ["incik", "gerdan", "kaburga"], not: "Kemikli ve jelatinli parçalar suya koyuluk verir." }
      },
      ilk: "antrikot"
    },
    kuzu: {
      p: {
        gerdan: { no: 1, ad: "Gerdan", yer: "Boyun", yum: 2, yag: 3, ozet: "Kemikli ve lezzetlidir. Uzun pişince eti kemiğinden kendiliğinden ayrılır.", yemek: ["Gerdan haşlama", "Tandır", "Fırında gerdan", "Yahni"], pisirme: "Tencerede ya da fırında, kısık ateşte uzun süre.", soz: "Kuzu gerdan, dilim dilim kesin; haşlamalık.", urun: "kuzu-gerdan" },
        kol: { no: 2, ad: "Kol", yer: "Ön omuz ve üst bacak", yum: 3, yag: 3, ozet: "Tandırın ve fırın kebabının klasik parçası. Kemikli pişince hem yumuşak hem sulu kalır.", yemek: ["Kuzu tandır", "Fırında kol", "Güveç", "Kuşbaşı"], pisirme: "Fırında üstü kapalı, düşük ısıda saatlerce.", soz: "Kuzu kol, bütün; tepsiye sığacak şekilde çıtlatın.", urun: "kuzu-kol" },
        sirt: { no: 3, ad: "Sırt", diger: "Pirzola, kafes", yer: "Sırt boyunca, kaburgaların üstü", yum: 5, yag: 3, ozet: "Kuzu pirzolanın çıktığı yer. Kemik sapıyla birlikte kesilir; mangalın en çabuk pişen parçasıdır.", yemek: ["Kuzu pirzola", "Kafes (bütün, fırında)", "Izgara", "Tava"], pisirme: "Kızgın ızgarada kısa süre; ortası hafif pembe kalırsa sulu olur.", soz: "Kuzu pirzola, kalın kesin, dövmeyin.", urun: "kuzu-pirzola" },
        bel: { no: 4, ad: "Bel", diger: "Bel pirzola, külbastı", yer: "Sırtın arkası, butun önü", yum: 5, yag: 2, ozet: "Kemiksiz ayrıldığında kuzunun en yumuşak dilimlerini verir. Külbastı ve beyti için aranır.", yemek: ["Bel pirzola", "Külbastı", "Beyti", "Şiş"], pisirme: "Izgarada ya da tavada kısa süre.", soz: "Kuzu belden külbastı, ince açın.", urun: "kuzu-bel" },
        but: { no: 5, ad: "But", yer: "Arka bacak", yum: 4, yag: 2, ozet: "Etli ve az yağlıdır. Bütün olarak fırına, doğranınca şişe ve kuşbaşıya gider.", yemek: ["Fırında kuzu but", "Kuzu şiş", "Çöp şiş", "Kuşbaşı", "Külbastı"], pisirme: "Bütünse fırında uzun; doğranmışsa ızgarada kısa.", soz: "Kuzu buttan şişlik, ceviz büyüklüğünde doğrayın.", urun: "kuzu-but" },
        dos: { no: 6, ad: "Döş ve kaburga", yer: "Göğüs ve karın altı", yum: 2, yag: 5, ozet: "Yağlı, kemikli, lezzetlidir. İçi doldurulup dikilen kaburga dolması buradan yapılır.", yemek: ["Kaburga dolması", "Haşlama", "Tandır", "Yağlı kıyma"], pisirme: "Önce haşlanır, sonra fırında kızartılır; ya da baştan sona ağır ateş.", soz: "Kuzu kaburga, dolmalık; cebini açar mısınız?", urun: "kuzu-dos" },
        incik: { no: 7, ad: "İncik", yer: "Bacakların alt kısmı", yum: 2, yag: 2, ozet: "Kişi başı bir incik hesabıyla porsiyonluk gelir. Ağır ateşte piştiğinde jelatinli ve yumuşacık olur.", yemek: ["Fırında kuzu incik", "Haşlama", "Beğendili incik"], pisirme: "Fırında üstü kapalı, sebzeyle birlikte uzun süre.", soz: "Dört tane kuzu incik, arka olsun.", urun: "kuzu-incik" },
        kuyruk: { no: 8, ad: "Kuyruk yağı", yer: "Kuyruk", yum: 5, yag: 5, ozet: "Et değil, lezzet yağıdır. Şişte et aralarına dizilir, kıymaya katılır, ciğerin yanında közlenir.", yemek: ["Şiş arası", "Ciğer şiş", "Köfte ve kebap harcı", "Kavurma yağı"], pisirme: "Közde eriyene kadar; az miktarı yeter.", soz: "Şiş arası için biraz kuyruk yağı, küçük doğrayın.", urun: "kuzu-kuyruk" }
      },
      ilk: "sirt"
    }
  };

  function olcer(ad, n) {
    var s = '<span class="olcer">' + ad + '<span class="olcer__cubuk" role="img" aria-label="' + ad + ": 5 üzerinden " + n + '">';
    for (var i = 1; i <= 5; i++) s += "<i" + (i <= n ? ' class="dolu"' : "") + "></i>";
    return s + "</span></span>";
  }

  /* ---------- "listeye ekle" satırı ---------- */
  function ekleHTML(urunK, kimlik) {
    var u = URUN[urunK], s = "";
    u.h.forEach(function (h) { s += "<option>" + esc(h) + "</option>"; });
    return '<div class="ekle" data-ekle-satir="' + urunK + '">' +
      '<div class="sayac"><button type="button" data-azalt aria-label="Miktarı azalt">−</button><output data-miktar>' + miktarYaz(varsayilan(urunK), u.b) + '</output><button type="button" data-artir aria-label="Miktarı artır">+</button></div>' +
      '<div><label class="gizli" for="' + kimlik + '">Nasıl hazırlansın?</label><select id="' + kimlik + '" data-haz>' + s + "</select></div>" +
      '<button type="button" class="dugme" data-ekle>Listeye ekle</button>' +
      '<p class="ekle__bilgi" data-ekle-bilgi role="status"></p></div>';
  }
  function ekleBagla(kok) {
    var satir = $("[data-ekle-satir]", kok); if (!satir) return;
    var k = satir.getAttribute("data-ekle-satir"), u = URUN[k], m = varsayilan(k);
    var out = $("[data-miktar]", satir), bilgi = $("[data-ekle-bilgi]", satir);
    function yaz() { out.textContent = miktarYaz(m, u.b); }
    $("[data-azalt]", satir).addEventListener("click", function () { m = sinir(m - adim(u.b), u.b); yaz(); });
    $("[data-artir]", satir).addEventListener("click", function () { m = sinir(m + adim(u.b), u.b); yaz(); });
    $("[data-ekle]", satir).addEventListener("click", function () {
      var h = $("[data-haz]", satir).value;
      Liste.ekle(k, m, h);
      bilgi.innerHTML = "Eklendi: " + esc(u.ad) + ", " + miktarYaz(m, u.b) + '. <a href="siparis.html">Listeyi açın</a>';
    });
  }

  /* ---------- etkileşimli kesim şeması ---------- */
  function semaKur(kok) {
    var tur = kok.getAttribute("data-diagram"), V = KESIM[tur]; if (!V) return;
    var panel = $("[data-cut-panel]", kok);
    var parcalar = $$("path[data-cut]", kok), cipler = $$("[data-cut-chip]", kok), nolar = $$("[data-no]", kok);
    var yemekCip = $$("[data-dish]", kok), kipler = $$("[data-kip]", kok);
    var siraParca = $("[data-sira=parca]", kok), siraYemek = $("[data-sira=yemek]", kok);

    function isaretle(liste, ana, kaydir) {
      parcalar.forEach(function (p) { var k = p.getAttribute("data-cut"); p.classList.toggle("is-secili", liste.indexOf(k) > -1); p.setAttribute("aria-pressed", String(k === ana)); });
      nolar.forEach(function (t) { t.classList.toggle("is-secili", liste.indexOf(t.getAttribute("data-no")) > -1); });
      cipler.forEach(function (c) {
        var on = c.getAttribute("data-cut-chip") === ana; c.setAttribute("aria-pressed", String(on));
        var s = c.parentNode;
        if (on && kaydir && s.scrollWidth > s.clientWidth + 4) { var sol = c.offsetLeft - s.offsetLeft; if (sol < s.scrollLeft || sol + c.offsetWidth > s.scrollLeft + s.clientWidth) s.scrollLeft = Math.max(0, sol - 40); }
      });
    }
    function gorunur() {
      if (!panel.getBoundingClientRect) return;
      var r = panel.getBoundingClientRect(), alt = window.innerHeight - 90;
      if (r.top > alt - 160 || r.top < 70) panel.scrollIntoView({ block: "nearest", behavior: azHareket ? "auto" : "smooth" });
    }
    function sec(k, kaydir) {
      var d = V.p[k]; if (!d) return;
      isaretle([k], k, kaydir);
      var h = '<div class="etiket"><div class="etiket__ust"><span class="etiket__no" aria-hidden="true">' + d.no + '</span><div><h3 class="etiket__ad">' + d.ad +
        (d.diger ? ' <span class="etiket__diger">' + d.diger + "</span>" : "") + '</h3><p class="etiket__yer">' + d.yer + "</p></div></div>" +
        '<div class="etiket__icerik"><div><div class="olcerler">' + olcer("Yumuşaklık", d.yum) + olcer("Yağ", d.yag) + "</div><p>" + d.ozet + "</p>" +
        '<p class="soz"><b>Tezgâhta şöyle isteyebilirsiniz</b>“' + d.soz + "”</p></div>" +
        '<div><h4>Yakışan yemekler</h4><ul class="yemekler">' + d.yemek.map(function (y) { return "<li>" + y + "</li>"; }).join("") + "</ul>" +
        "<h4>Pişirme</h4><p>" + d.pisirme + "</p></div></div>" + ekleHTML(d.urun, "haz-" + tur) + "</div>";
      panel.innerHTML = h;
      ekleBagla(panel);
      if (kaydir) gorunur();
    }
    function yemekSec(yk, kaydir) {
      var y = V.y && V.y[yk]; if (!y) return;
      yemekCip.forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-dish") === yk)); });
      isaretle(y.p, null);
      var h = '<div class="etiket"><div class="etiket__ust"><div><h3 class="etiket__ad">' + y.ad + '</h3><p class="etiket__yer">Şemada kırmızıya boyanan ' + y.p.length + " bölge bu yemeğe uygun.</p></div></div><p>" + y.not + '</p><div class="esler">';
      y.p.forEach(function (pk) { var d = V.p[pk]; h += '<button type="button" data-git="' + pk + '"><b>' + d.no + "</b><strong>" + d.ad + "</strong><span>" + d.yer + "</span></button>"; });
      panel.innerHTML = h + '</div><p class="kucuk">Bir parçaya dokunun: ayrıntısını görün, listenize ekleyin.</p></div>';
      $$("[data-git]", panel).forEach(function (b) { b.addEventListener("click", function () { sec(b.getAttribute("data-git"), true); }); });
      if (kaydir) gorunur();
    }
    function kipAyar(kip) {
      kipler.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-kip") === kip)); });
      if (siraParca) siraParca.hidden = kip !== "parca";
      if (siraYemek) siraYemek.hidden = kip !== "yemek";
      if (kip === "yemek") yemekSec((yemekCip.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0] || yemekCip[0]).getAttribute("data-dish"), false);
      else sec(V.ilk, false);
    }

    parcalar.forEach(function (p) {
      var d = V.p[p.getAttribute("data-cut")]; if (!d) return;
      p.setAttribute("tabindex", "0"); p.setAttribute("role", "button"); p.setAttribute("aria-label", d.no + ", " + d.ad);
      p.addEventListener("click", function () { sec(p.getAttribute("data-cut"), true); });
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sec(p.getAttribute("data-cut"), true); } });
    });
    cipler.forEach(function (c) { c.addEventListener("click", function () { sec(c.getAttribute("data-cut-chip"), true); }); });
    yemekCip.forEach(function (c) { c.addEventListener("click", function () { yemekSec(c.getAttribute("data-dish"), true); }); });
    kipler.forEach(function (b) { b.addEventListener("click", function () { kipAyar(b.getAttribute("data-kip")); }); });
    sec(V.ilk, false);
  }
  $$("[data-diagram]").forEach(semaKur);

  /* ---------- sipariş listesi aracı ---------- */
  function siparisKur(kok) {
    var katSira = $("[data-kat-sira]", kok), katListe = $("[data-katalog]", kok), listeEl = $("[data-liste]", kok), bos = $("[data-liste-bos]", kok);
    var form = $("[data-siparis-form]", kok), gunDiger = $("[data-gun-diger]", kok), temizle = $("[data-liste-temizle]", kok);
    var aktif = (location.hash || "").replace("#", "");
    if (!KATALOG.some(function (g) { return g.k === aktif; })) aktif = "dana";

    katSira.innerHTML = KATALOG.map(function (g) { return '<button type="button" class="cip" data-kat="' + g.k + '" aria-pressed="' + (g.k === aktif) + '">' + g.ad + "</button>"; }).join("");
    function katCiz() {
      var g = KATALOG.filter(function (x) { return x.k === aktif; })[0];
      katListe.innerHTML = g.u.map(function (u) {
        var varMi = Liste.icerir(u[0]);
        return "<li><span>" + u[1] + '</span><button type="button" data-urun="' + u[0] + '"' + (varMi ? ' class="is-var"' : "") + ' aria-label="' + u[1] + (varMi ? " listede, bir kez daha ekle" : " listeye ekle") + '">' + (varMi ? "Listede" : "Ekle") + "</button></li>";
      }).join("");
      $$("[data-kat]", katSira).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-kat") === aktif)); });
    }
    katSira.addEventListener("click", function (e) { var b = e.target.closest("[data-kat]"); if (b) { aktif = b.getAttribute("data-kat"); katCiz(); } });
    katListe.addEventListener("click", function (e) {
      var b = e.target.closest("[data-urun]"); if (!b) return;
      var k = b.getAttribute("data-urun"); Liste.ekle(k, varsayilan(k), URUN[k].h[0]);
    });

    function listeCiz() {
      var a = Liste.hepsi();
      bos.hidden = a.length > 0; temizle.hidden = a.length === 0;
      listeEl.innerHTML = a.map(function (x, i) {
        var u = URUN[x.k], sel = "";
        if (u && u.h.length) {
          sel = '<label class="gizli" for="lh-' + i + '">' + esc(x.ad) + ' nasıl hazırlansın?</label><select id="lh-' + i + '" data-i="' + i + '" data-haz>' +
            u.h.map(function (h) { return "<option" + (h === x.h ? " selected" : "") + ">" + esc(h) + "</option>"; }).join("") + "</select>";
        }
        return '<li class="liste__satir' + (sel ? "" : " liste__satir--tek") + '"><span class="liste__ad">' + esc(x.ad) + '</span><button type="button" class="liste__sil" data-sil="' + i + '" aria-label="' + esc(x.ad) + ' listeden çıkar">Çıkar</button>' +
          '<div class="sayac"><button type="button" data-azalt="' + i + '" aria-label="' + esc(x.ad) + ' miktarını azalt">−</button><output>' + miktarYaz(x.m, x.b) + '</output><button type="button" data-artir="' + i + '" aria-label="' + esc(x.ad) + ' miktarını artır">+</button></div>' + sel + "</li>";
      }).join("");
    }
    listeEl.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      var a = Liste.hepsi(), i;
      if (t.hasAttribute("data-sil")) { Liste.sil(+t.getAttribute("data-sil")); return; }
      if (t.hasAttribute("data-azalt") || t.hasAttribute("data-artir")) {
        var art = t.hasAttribute("data-artir"); i = +t.getAttribute(art ? "data-artir" : "data-azalt");
        var x = a[i]; if (!x) return;
        var yeni = sinir(x.m + (art ? 1 : -1) * adim(x.b), x.b);
        Liste.degistir(i, "m", yeni);
        t.parentNode.querySelector("output").textContent = miktarYaz(yeni, x.b);
      }
    });
    listeEl.addEventListener("change", function (e) { var s = e.target.closest("[data-haz]"); if (s) Liste.degistir(+s.getAttribute("data-i"), "h", s.value); });
    temizle.addEventListener("click", function () { Liste.bosalt(); });

    var ozel = $("[data-ozel-form]", kok);
    if (ozel) {
      var ozelGir = $("input", ozel);
      var ozelEkle = function () {
        var v = ozelGir.value.trim().slice(0, 60); if (!v) { ozelGir.focus(); return; }
        Liste.ekle("ozel-" + v.toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü]+/g, "-"), 500, "", v, "g"); ozelGir.value = "";
      };
      $("button", ozel).addEventListener("click", ozelEkle);
      ozelGir.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ozelEkle(); } });
    }

    function deger(ad) { var el = form.querySelector('[name="' + ad + '"]:checked') || form.querySelector('[name="' + ad + '"]'); return el ? el.value.trim() : ""; }
    function mesaj() {
      var a = Liste.hepsi();
      if (!a.length) return "Merhaba " + MARKA + ", sipariş vermek istiyorum. Bugün reyonda neler var?";
      var s = "Merhaba " + MARKA + ", sipariş listem:\n";
      a.forEach(function (x, i) { s += "\n" + (i + 1) + ") " + x.ad + " · " + miktarYaz(x.m, x.b) + (x.h ? " · " + x.h : ""); });
      s += "\n\nTeslim: " + deger("teslim");
      var gun = deger("gun"), saat = deger("saat");
      if (gun === "Başka gün") gun = (gunDiger.value.trim() || "gün belirtilecek");
      s += "\nZaman: " + gun + (saat ? ", saat " + saat + " gibi" : "");
      var ad = deger("ad"), not = deger("not");
      if (ad) s += "\nAd: " + ad;
      if (not) s += "\nNot: " + not;
      return s + "\n\nUygunluk ve tutar bilgisini yazar mısınız?";
    }
    var yenile = fisBagla(kok, mesaj);
    function gunAyar() { gunDiger.parentNode.hidden = deger("gun") !== "Başka gün"; }
    form.addEventListener("input", function () { gunAyar(); yenile(); });
    form.addEventListener("change", function () { gunAyar(); yenile(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    Liste.dinle(function (a, sessiz) { if (!sessiz) { listeCiz(); katCiz(); } yenile(); });
    gunAyar(); katCiz(); listeCiz(); yenile();
  }
  $$("[data-siparis]").forEach(siparisKur);

  /* ---------- porsiyon hesabı ---------- */
  var PORSIYON = {
    biftek: { ad: "Izgara biftek", kalem: [["dana-antrikot", 200, "3 cm dilim"]], not: "Kemiksiz ızgaralık et için kişi başı çiğ ağırlık." },
    pirzola: { ad: "Kuzu pirzola", kalem: [["kuzu-pirzola", 280, "Kalın kesim"]], not: "Kemikli olduğu için gramaj yüksek tutulur." },
    kofte: { ad: "Köfte", kalem: [["kiyma-kofte", 150, "Orta yağlı, çift çekim"]], not: "Soğan, ekmek içi gibi katkılar hariç kıyma ağırlığı." },
    kusbasi: { ad: "Kuşbaşılı sulu yemek", kalem: [["dana-kusbasi", 130, "Orta boy"]], not: "Sebze ya da bakliyatla pişen tencere yemekleri için." },
    haslama: { ad: "Haşlama", kalem: [["dana-gerdan", 320, "Kemikli, iri parça"]], not: "Kemik ağırlığı hesaba katılmıştır." },
    kanat: { ad: "Tavuk kanat", kalem: [["tavuk-kanat", 300, "Bütün"]], not: "Kanadın yarıya yakını kemiktir." },
    karisik: { ad: "Karışık mangal", kalem: [["kiyma-kofte", 120, "Orta yağlı, çift çekim"], ["kuzu-pirzola", 140, "Kalın kesim"], ["tavuk-kanat", 120, "Bütün"]], not: "Üç çeşit bir arada; kişi başı toplam ağırlık." }
  };
  function porsiyonKur(kok) {
    var kisi = 4, kisiOut = $("[data-kisi]", kok), sonuc = $("[data-porsiyon-sonuc]", kok);
    function sec(ad) { var el = kok.querySelector('[name="' + ad + '"]:checked'); return el ? el.value : ""; }
    function hesap() {
      var t = PORSIYON[sec("p-tur")] || PORSIYON.biftek, carpan = sec("p-istah") === "istahli" ? 1.25 : 1, toplam = 0;
      var satirlar = t.kalem.map(function (k) {
        var ham = k[1] * carpan * kisi, yuvarlak = Math.max(250, Math.ceil(ham / 250) * 250);
        toplam += yuvarlak;
        return { k: k[0], m: yuvarlak, h: k[2], kb: Math.round(k[1] * carpan) };
      });
      var h = '<p class="porsiyon__buyuk">' + miktarYaz(toplam, "g") + '</p><p><strong>' + kisi + " kişilik " + t.ad.toLocaleLowerCase("tr") + "</strong> için yaklaşık çiğ ağırlık. " + t.not + "</p><ul>";
      satirlar.forEach(function (s) { h += "<li><span>" + URUN[s.k].ad + " <small>(kişi başı " + s.kb + " g)</small></span><b>" + miktarYaz(s.m, "g") + "</b></li>"; });
      h += '</ul><button type="button" class="dugme dugme--tam" data-porsiyon-ekle>Listeye ekle</button><p class="ekle__bilgi" role="status" data-porsiyon-bilgi></p>';
      sonuc.innerHTML = h;
      $("[data-porsiyon-ekle]", sonuc).addEventListener("click", function () {
        satirlar.forEach(function (s) { Liste.ekle(s.k, s.m, s.h); });
        $("[data-porsiyon-bilgi]", sonuc).innerHTML = 'Listeye eklendi. <a href="siparis.html#liste">Listeye gidin</a>';
      });
    }
    $("[data-kisi-azalt]", kok).addEventListener("click", function () { kisi = Math.max(1, kisi - 1); kisiOut.textContent = kisi + " kişi"; hesap(); });
    $("[data-kisi-artir]", kok).addEventListener("click", function () { kisi = Math.min(40, kisi + 1); kisiOut.textContent = kisi + " kişi"; hesap(); });
    kok.addEventListener("change", hesap);
    hesap();
  }
  $$("[data-porsiyon]").forEach(porsiyonKur);

  /* ---------- pişirme derecesi ---------- */
  var DERECE = [
    { ad: "Az pişmiş", isi: "Merkez 50–52 °C", ic: "#B22A2E", oz: "#981A22", olcek: 1.1, gor: "Dışı mühürlü, ortası koyu kırmızı ve ılık. Kesince suyu bolca akar.", kim: "Bonfile gibi yağsız ve çok yumuşak parçalarda sevilir." },
    { ad: "Orta-az", isi: "Merkez 54–57 °C", ic: "#C24A4C", oz: "#B02C34", olcek: 1.04, gor: "Ortası kırmızıdan pembeye döner, sıcak ve suludur.", kim: "Antrikot ve kontrfilede en çok önerilen derece: yağ erimeye başlar, et kurumaz." },
    { ad: "Orta", isi: "Merkez 60–63 °C", ic: "#CF7C78", oz: "#C8605F", olcek: .96, gor: "Ortası baştan sona pembe, doku toparlanmış, suyu yerinde.", kim: "Kuzu pirzola ve kalın kesilmiş biftekler için güvenli bir orta yol." },
    { ad: "Orta-iyi", isi: "Merkez 65–69 °C", ic: "#BD8C7C", oz: "#C59B8C", olcek: .88, gor: "Ortada ince bir pembelik kalır; et sıkılaşır, suyu azalır.", kim: "Yağlı parçalar bu dereceyi yağsızlardan daha iyi kaldırır." },
    { ad: "İyi pişmiş", isi: "Merkez 71 °C ve üzeri", ic: "#8E6C5A", oz: "#8A6856", olcek: .82, gor: "Pembelik kalmaz, kesit baştan sona kahverengi-gridir.", kim: "Köfte ve kıymalı her şey bu derecede yenir. Biftekte istenirse ince dilim seçin, kurumasın." }
  ];
  function pisirmeKur(kok) {
    var dilim = $(".dilim", kok), dugmeler = $$("[data-derece]", kok), sonuc = $("[data-derece-sonuc]", kok);
    function sec(i) {
      var d = DERECE[i]; if (!d) return;
      dugmeler.forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-derece") === i)); });
      dilim.style.setProperty("--ic", d.ic); dilim.style.setProperty("--oz", d.oz); dilim.style.setProperty("--olcek", d.olcek);
      sonuc.innerHTML = "<h3>" + d.ad + '</h3><p class="pisirme__isi">' + d.isi + "</p><p>" + d.gor + "</p><p>" + d.kim + "</p>";
    }
    dugmeler.forEach(function (b) { b.addEventListener("click", function () { sec(+b.getAttribute("data-derece")); }); });
    sec(1);
  }
  $$("[data-pisirme]").forEach(pisirmeKur);

  /* ---------- sofra sorusu ---------- */
  function sofraKur(kok) {
    var kisi = 4, kisiOut = $("[data-kisi]", kok);
    function sec(ad) { var el = kok.querySelector('[name="' + ad + '"]:checked'); return el ? el.value : ""; }
    function mesaj() {
      var konular = $$('[name="s-konu"]:checked', kok).map(function (c) { return c.value; });
      var s = "Merhaba " + MARKA + ", sofra için bilgi almak istiyorum.\n\nKişi sayısı: " + kisi + "\nGün: " + sec("s-gun");
      var saat = $('[name="s-saat"]', kok).value; if (saat) s += ", saat " + saat + " gibi";
      if (konular.length) s += "\nSormak istediklerim: " + konular.join(", ");
      var not = $('[name="s-not"]', kok).value.trim(); if (not) s += "\nNot: " + not;
      return s + "\n\nBilgi verebilir misiniz?";
    }
    var yenile = fisBagla(kok, mesaj);
    $("[data-kisi-azalt]", kok).addEventListener("click", function () { kisi = Math.max(1, kisi - 1); kisiOut.textContent = kisi + " kişi"; yenile(); });
    $("[data-kisi-artir]", kok).addEventListener("click", function () { kisi = Math.min(60, kisi + 1); kisiOut.textContent = kisi + " kişi"; yenile(); });
    kok.addEventListener("input", yenile); kok.addEventListener("change", yenile);
    var f = $("form", kok); if (f) f.addEventListener("submit", function (e) { e.preventDefault(); });
  }
  $$("[data-sofra-soru]").forEach(sofraKur);

  /* ---------- hazır sorular (iletişim) ---------- */
  function soruKur(kok) {
    function mesaj() {
      var el = kok.querySelector('[name="soru"]:checked'), ek = $('[name="soru-ek"]', kok).value.trim();
      var s = "Merhaba " + MARKA + ", " + (el ? el.value : "bilgi almak istiyorum.");
      if (ek) s += "\n" + ek;
      return s;
    }
    var yenile = fisBagla(kok, mesaj);
    kok.addEventListener("input", yenile); kok.addEventListener("change", yenile);
    var f = $("form", kok); if (f) f.addEventListener("submit", function (e) { e.preventDefault(); });
  }
  $$("[data-hazir-soru]").forEach(soruKur);

  /* saat seçenekleri: açılış–kapanış arası yarım saatlik */
  $$("[data-saat-sec]").forEach(function (sel) {
    for (var m = 510; m <= 1140; m += 30) {
      var o = document.createElement("option"), s = ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2);
      o.value = s; o.textContent = s; sel.appendChild(o);
    }
  });
})();
