/* Bahar Pide Salonu — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var HOURS = { "0": [["08:00", "21:00"]], "1": [["08:00", "21:00"]], "2": [["08:00", "21:00"]], "3": [["08:00", "21:00"]], "4": [["08:00", "21:00"]], "5": [["08:00", "21:00"]] };
  var WA = "https://wa.me/905526694076";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function hhmm(m) { var h = Math.floor(m / 60) % 24, d = m % 60; return (h < 10 ? "0" : "") + h + ":" + (d < 10 ? "0" : "") + d; }

  /* ---- kit/status.js'ten kopya: açık/kapalı ---- */
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

  /* ---- küçük bildirim ---- */
  var tostEl = null, tostT = 0;
  function tost(t) {
    if (!tostEl) {
      tostEl = document.createElement("div");
      tostEl.className = "tost"; tostEl.setAttribute("role", "status"); tostEl.setAttribute("aria-live", "polite");
      document.body.appendChild(tostEl);
    }
    tostEl.textContent = t; tostEl.classList.add("goster");
    clearTimeout(tostT); tostT = setTimeout(function () { tostEl.classList.remove("goster"); }, 2400);
  }

  function kopyala(text, done) {
    function eski() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, eski);
    else eski();
  }

  /* ---- gezinme ---- */
  var menuBtn = $(".menu-btn"), nav = $("#gezinme");
  if (menuBtn && nav) {
    var kapat = function () { nav.classList.remove("acik"); menuBtn.setAttribute("aria-expanded", "false"); };
    menuBtn.addEventListener("click", function () {
      var acik = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!acik)); nav.classList.toggle("acik", !acik);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("acik")) { kapat(); menuBtn.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("acik") && !nav.contains(e.target) && !menuBtn.contains(e.target)) kapat(); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", kapat); });
  }

  /* ---- canlı durum ---- */
  var S = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) {
    el.textContent = S.text;
    el.classList.add("durum");
    el.classList.toggle("is-open", S.open);
    el.classList.toggle("is-closed", !S.open);
  });
  $$("[data-levha]").forEach(function (lev) {
    lev.classList.toggle("kapali", !S.open);
    if (!reduce) lev.classList.add("salla");
  });
  $$("[data-gun]").forEach(function (el) { if (parseInt(el.getAttribute("data-gun"), 10) === S.dayIndex) el.classList.add("bugun"); });
  var bugunFmt = "";
  try { bugunFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", weekday: "long" }).format(new Date()); } catch (e) { bugunFmt = "bugün"; }
  $$("[data-tarih-bugun]").forEach(function (el) { el.textContent = bugunFmt; });

  /* ---- gün çizelgesi ---- */
  var cet = $("[data-cetvel]");
  if (cet) {
    var simdi = $("[data-cetvel-simdi]", cet), simdiSaat = $("[data-cetvel-saat]", cet);
    var bas = 8 * 60, son = 21 * 60;
    var cizgi = function () {
      var n = istanbulNow();
      var acikGun = !!HOURS[String(n.d)];
      var p, acik = acikGun && n.m >= bas && n.m < son;
      if (acik) p = (n.m - bas) / (son - bas) * 100;
      else p = (!acikGun || n.m < bas) ? 0 : 100;
      simdi.style.left = p + "%";
      simdi.classList.toggle("sol", p < 14);
      simdi.classList.toggle("sag", p > 86);
      simdi.classList.toggle("kapali", !acik);
      simdiSaat.textContent = acik ? "Şimdi " + hhmm(n.m) : (acikGun ? "Şimdi " + hhmm(n.m) + " · kapalı" : "Bugün kapalı");
      simdi.classList.add("gorunur");
    };
    cizgi(); setInterval(cizgi, 60000);
  }

  /* ---- paket sayfası saat kutusu ---- */
  var saatEl = $("[data-saat-buyuk]");
  if (saatEl) {
    var ipucu = $("[data-saat-ipucu]");
    var saatCiz = function () {
      var n = istanbulNow(), st = openStatus(HOURS);
      saatEl.textContent = hhmm(n.m);
      if (!ipucu) return;
      if (!st.open) ipucu.textContent = "Fişi şimdiden hazırlayabilirsiniz; mesajınızda istediğiniz günü ve saati belirtin.";
      else if (n.m < 11 * 60) ipucu.textContent = "Sabah saatleri: öğle siparişinizi şimdiden yazmak işinizi kolaylaştırır.";
      else if (n.m < 14 * 60) ipucu.textContent = "Öğle telaşı saatleri: mesajınızda saati açıkça belirtin.";
      else ipucu.textContent = "Öğleden sonra: toplantı ikramı ya da akşamüstü paketi için yazabilirsiniz.";
    };
    saatCiz(); setInterval(saatCiz, 30000);
  }

  /* ---- fırın sahnesi (imza an) ---- */
  var firin = $("[data-firin]");
  if (firin) {
    var kay = $$(".kayik-yer .kayik", firin), ad = $("[data-firin-ad]", firin), fnot = $("[data-firin-not]", firin);
    var sira = $$("[data-firin-git]", firin), ileri = $("[data-firin-btn]", firin);
    var i = 0, oto = null, mesgul = false, gorunur = true;
    var isaretle = function () {
      sira.forEach(function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
      ad.textContent = kay[i].getAttribute("data-ad");
      fnot.textContent = kay[i].getAttribute("data-not");
    };
    var git = function (n) {
      n = (n + kay.length) % kay.length;
      if (mesgul || n === i) return;
      mesgul = true;
      kay[i].classList.remove("is-in");
      i = n; isaretle();
      setTimeout(function () { kay[i].classList.add("is-in"); mesgul = false; }, reduce ? 0 : 420);
    };
    var durdur = function () { if (oto) { clearInterval(oto); oto = null; } };
    sira.forEach(function (b) { b.addEventListener("click", function () { durdur(); git(parseInt(b.getAttribute("data-firin-git"), 10)); }); });
    if (ileri) ileri.addEventListener("click", function () { durdur(); git(i + 1); });
    kay.forEach(function (k) { k.addEventListener("click", function () { durdur(); git(i + 1); }); });
    isaretle();
    setTimeout(function () { kay[0].classList.add("is-in"); firin.classList.add("pisti"); }, reduce ? 0 : 120);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { gorunur = es[0].isIntersecting; }, { threshold: 0.3 }).observe(firin);
    }
    if (!reduce) oto = setInterval(function () { if (!document.hidden && gorunur) git(i + 1); }, 6500);
  }

  /* ---- ortak sipariş fişi (sayfalar arası) ---- */
  var ANAHTAR = "bahar-fis-v1";
  var GRUP_SIRA = ["Pide", "Döner", "Çorba", "Yanında"];
  var fis = (function () {
    try { var s = JSON.parse(localStorage.getItem(ANAHTAR) || "null"); if (s && typeof s === "object" && s.items && typeof s.items === "object") return s; } catch (e) { /* depolama yok */ }
    return { items: {} };
  })();
  var dinleyici = [];
  function kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(fis)); } catch (e) { /* depolama yok */ } }
  function toplam() { var t = 0; Object.keys(fis.items).forEach(function (k) { t += fis.items[k].n || 0; }); return t; }
  function adet(k) { return fis.items[k] ? fis.items[k].n : 0; }
  function yenile() {
    var t = toplam();
    $$("[data-fis-count]").forEach(function (b) { b.textContent = t; b.hidden = !t; });
    dinleyici.forEach(function (f) { f(); });
  }
  function ayarla(k, ad, grup, n) {
    n = Math.max(0, Math.min(99, n | 0));
    if (n) fis.items[k] = { n: n, name: ad, group: grup }; else delete fis.items[k];
    kaydet(); yenile();
  }

  /* sayı kutuları (kişi sayısı vb.) */
  $$("[data-sayi]").forEach(function (w) {
    var inp = $("input", w), min = parseInt(inp.min, 10) || 0, max = parseInt(inp.max, 10) || 999;
    $$("[data-art]", w).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = (parseInt(inp.value, 10) || 0) + parseInt(b.getAttribute("data-art"), 10);
        inp.value = Math.max(min, Math.min(max, v));
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  });

  $$("[data-siparis]").forEach(function (root) {
    var satirlar = $$(".sayac[data-key]", root);
    var cikti = $("[data-mesaj]", root), wa = $("[data-wa]", root), kop = $("[data-kopya]", root);
    var topEl = $("[data-toplam]", root), uyari = $("[data-uyari]", root), temizle = $("[data-temizle]", root);
    var bosMetin = cikti.textContent;
    var teslim = $$("input[name=teslim]", root), adresAlan = $("[data-adres-alan]", root);

    satirlar.forEach(function (r) {
      var k = r.getAttribute("data-key"), nm = r.getAttribute("data-name"), g = r.getAttribute("data-group");
      $$("[data-adim]", r).forEach(function (b) {
        b.addEventListener("click", function () { ayarla(k, nm, g, adet(k) + parseInt(b.getAttribute("data-adim"), 10)); });
      });
    });

    function uyar(t, ok) { if (!uyari) return; uyari.textContent = t; uyari.classList.toggle("tamam", !!ok); }

    function mesaj() {
      var t = toplam();
      if (!t) return "";
      var L = ["Merhaba Bahar Pide Salonu, paket sipariş vermek istiyorum."];
      GRUP_SIRA.forEach(function (g) {
        var ks = Object.keys(fis.items).filter(function (k) { return fis.items[k].group === g; });
        if (!ks.length) return;
        L.push(""); L.push(g + ":");
        ks.forEach(function (k) { L.push("• " + fis.items[k].n + " × " + fis.items[k].name); });
      });
      L.push(""); L.push("Toplam: " + t + " adet");
      var terc = $$("[data-tercih]:checked", root).map(function (c) { return c.value; });
      if (terc.length) { L.push(""); L.push("Tercihler: " + terc.join("; ") + "."); }
      var alan = [];
      $$("[data-alan]", root).forEach(function (f) {
        if (f.closest("[hidden]")) return;
        if ((f.type === "radio" || f.type === "checkbox") && !f.checked) return;
        var v = (f.value || "").trim();
        if (v) alan.push(f.getAttribute("data-alan") + ": " + v.replace(/\s*\n\s*/g, ", "));
      });
      if (alan.length) { L.push(""); L = L.concat(alan); }
      L.push(""); L.push("Uygunluğu ve tutarı yazabilir misiniz? Teşekkürler.");
      return L.join("\n");
    }

    function ciz() {
      if (adresAlan) {
        var sec = teslim.filter(function (r) { return r.checked; })[0];
        adresAlan.hidden = !(sec && sec.hasAttribute("data-adres"));
      }
      satirlar.forEach(function (r) {
        var n = adet(r.getAttribute("data-key"));
        $(".say", r).textContent = n;
        r.classList.toggle("dolu", n > 0);
        var eksi = $("[data-adim='-1']", r); if (eksi) eksi.disabled = !n;
      });
      var m = mesaj();
      if (topEl) topEl.textContent = toplam();
      if (m) {
        cikti.textContent = m; cikti.classList.remove("bos");
        wa.href = waLink(m); wa.removeAttribute("aria-disabled");
        if (uyari && !uyari.classList.contains("tamam")) uyar("");
      } else {
        cikti.textContent = bosMetin; cikti.classList.add("bos");
        wa.href = WA; wa.setAttribute("aria-disabled", "true");
      }
    }
    dinleyici.push(ciz);
    root.addEventListener("input", ciz);
    root.addEventListener("change", ciz);
    wa.addEventListener("click", function (e) {
      if (!toplam()) { e.preventDefault(); uyar("Önce en az bir ürünün adedini artırın."); }
    });
    if (kop) kop.addEventListener("click", function () {
      var m = mesaj();
      if (!m) { uyar("Kopyalanacak mesaj yok; önce adet seçin."); return; }
      kopyala(m, function (ok) { uyar(ok ? "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; fişteki metni seçip kopyalayın.", ok); });
    });
    if (temizle) temizle.addEventListener("click", function () { fis.items = {}; kaydet(); yenile(); uyar("Fiş temizlendi.", true); });
    $$("[data-herkese]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var kisiEl = $("[data-kisi]", root), n = parseInt(kisiEl && kisiEl.value, 10) || 0;
        if (n < 1) { uyar("Önce kişi sayısını girin."); return; }
        ayarla(b.getAttribute("data-key"), b.getAttribute("data-name"), b.getAttribute("data-group"), n);
        tost(b.getAttribute("data-name") + ": " + n + " adet yazıldı");
      });
    });
    ciz();
  });

  /* menüden fişe ekleme */
  $$("[data-ekle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-ekle"), nm = b.getAttribute("data-name"), g = b.getAttribute("data-group");
      ayarla(k, nm, g, adet(k) + 1);
      b.classList.add("oldu"); setTimeout(function () { b.classList.remove("oldu"); }, 700);
      tost(nm + " fişe eklendi · fişte " + toplam() + " adet");
    });
  });
  yenile();

  /* ---- menü süzgeci ---- */
  var suz = $("[data-suzgec]");
  if (suz) {
    var sbt = $$("button", suz), kalem = $$("[data-etiket]"), sonuc = $("[data-suzgec-sonuc]");
    sbt.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f"), say = 0;
        sbt.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        kalem.forEach(function (k) {
          var ok = f === "hepsi" || (" " + k.getAttribute("data-etiket") + " ").indexOf(" " + f + " ") > -1;
          k.classList.toggle("soluk", !ok); if (ok) say++;
        });
        if (sonuc) sonuc.textContent = f === "hepsi" ? "Tüm kalemler gösteriliyor." : "“" + b.textContent + "” tercihine uyan " + say + " kalem öne çıktı; diğerleri soluk.";
      });
    });
  }

  /* ---- toplu yemek planlayıcı + talep ---- */
  var tp = $("[data-toplu]");
  if (tp) {
    var kisiI = $("input[name=kisi]", tp), etsizI = $("input[name=etsiz]", tp), liste = $("[data-oneri]", tp);
    var tCikti = $("[data-mesaj]", tp), tWa = $("[data-wa]", tp), tKop = $("[data-kopya]", tp), tUy = $("[data-uyari]", tp);
    var tarihI = $("input[name=tarih]", tp), tarihNot = $("[data-tarih-not]", tp);
    var tBos = tCikti.textContent;
    var bugunISO = (function () {
      try {
        var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        return /^\d{4}-\d{2}-\d{2}$/.test(p) ? p : "";
      } catch (e) { return ""; }
    })();
    if (tarihI && bugunISO) tarihI.min = bugunISO;

    var hesap = function () {
      var n = Math.max(0, Math.min(300, parseInt(kisiI.value, 10) || 0));
      var v = Math.max(0, Math.min(n, parseInt(etsizI.value, 10) || 0));
      var agEl = $("input[name=agirlik]:checked", tp), ag = agEl ? agEl.value : "dengeli";
      var pay = { pide: 2 / 3, dengeli: 1 / 2, doner: 1 / 3 }[ag] || 0.5;
      var et = n - v, pideEt = Math.round(et * pay), doner = et - pideEt, L = [];
      var tip = ["Kıymalı pide", "Kuşbaşılı pide", "Karışık pide"], p3 = [0, 0, 0];
      for (var j = 0; j < pideEt; j++) p3[j % 3]++;
      tip.forEach(function (t, j) { if (p3[j]) L.push([t, p3[j]]); });
      if (v) { var ka = Math.ceil(v / 2); L.push(["Kaşarlı pide (etsiz)", ka]); if (v - ka) L.push(["Peynirli pide (etsiz)", v - ka]); }
      if (doner) L.push(["Döner, porsiyon ya da dürüm", doner]);
      if (n && $("input[name=lahmacun]", tp).checked) L.push(["Lahmacun, ortaya paylaşmalık", Math.ceil(n / 2)]);
      if (n && $("input[name=corba]", tp).checked) L.push(["Çorba (mercimek ya da günün çorbası)", n]);
      if (n && $("input[name=ayran]", tp).checked) L.push(["Ayran", n]);
      return { n: n, v: v, L: L };
    };
    var tarihYazi = function () {
      if (!tarihI || !tarihI.value) { if (tarihNot) tarihNot.textContent = ""; return ""; }
      var a = tarihI.value.split("-"), d = new Date(+a[0], +a[1] - 1, +a[2]);
      var yazi = "";
      try { yazi = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(d); } catch (e) { yazi = tarihI.value; }
      if (tarihNot) {
        if (d.getDay() === 0) tarihNot.textContent = "Seçtiğiniz gün Pazar; Pazar günleri kapalıyız. Başka bir gün seçmek isteyebilirsiniz.";
        else if (bugunISO && tarihI.value < bugunISO) tarihNot.textContent = "Geçmiş bir tarih seçtiniz.";
        else tarihNot.textContent = "";
      }
      return yazi;
    };
    var tMesaj = function (h) {
      if (!h.n) return "";
      var L = ["Merhaba Bahar Pide Salonu, toplu yemek için bilgi almak istiyorum.", ""];
      var tur = $("input[name=tur]:checked", tp);
      if (tur) L.push("Etkinlik: " + tur.value);
      var ty = tarihYazi(); if (ty) L.push("Tarih: " + ty);
      var saat = $("select[name=saat]", tp).value; if (saat) L.push("Saat: " + saat);
      L.push("Kişi sayısı: " + h.n + (h.v ? " (" + h.v + " kişi etsiz)" : ""));
      if (h.L.length) {
        L.push(""); L.push("Düşündüğümüz liste (kaba öneri):");
        h.L.forEach(function (x) { L.push("• " + x[1] + " × " + x[0]); });
      }
      var alan = [];
      $$("[data-alan]", tp).forEach(function (f) {
        if ((f.type === "radio" || f.type === "checkbox") && !f.checked) return;
        var v = (f.value || "").trim(); if (v) alan.push(f.getAttribute("data-alan") + ": " + v.replace(/\s*\n\s*/g, ", "));
      });
      if (alan.length) { L.push(""); L = L.concat(alan); }
      L.push(""); L.push("Uygunluk ve tutar hakkında bilgi verebilir misiniz? Teşekkürler.");
      return L.join("\n");
    };
    var tCiz = function () {
      var h = hesap();
      liste.innerHTML = "";
      if (!h.L.length) {
        var li = document.createElement("li"); li.className = "oneri-bos"; li.textContent = "Kişi sayısını girin, liste burada çıksın."; liste.appendChild(li);
      }
      h.L.forEach(function (x) {
        var li = document.createElement("li"), s = document.createElement("span"), b = document.createElement("b");
        s.textContent = x[0]; b.textContent = x[1]; li.appendChild(s); li.appendChild(b); liste.appendChild(li);
      });
      var m = tMesaj(h);
      if (m) { tCikti.textContent = m; tCikti.classList.remove("bos"); tWa.href = waLink(m); tWa.removeAttribute("aria-disabled"); }
      else { tCikti.textContent = tBos; tCikti.classList.add("bos"); tWa.href = WA; tWa.setAttribute("aria-disabled", "true"); }
    };
    tp.addEventListener("input", tCiz);
    tp.addEventListener("change", tCiz);
    tWa.addEventListener("click", function (e) { if (!hesap().n) { e.preventDefault(); tUy.textContent = "Önce kişi sayısını girin."; tUy.classList.remove("tamam"); } });
    if (tKop) tKop.addEventListener("click", function () {
      var m = tMesaj(hesap());
      if (!m) { tUy.textContent = "Önce kişi sayısını girin."; tUy.classList.remove("tamam"); return; }
      kopyala(m, function (ok) { tUy.textContent = ok ? "Talep mesajı kopyalandı." : "Kopyalanamadı; metni seçip kopyalayın."; tUy.classList.toggle("tamam", ok); });
    });
    tCiz();
  }

  /* ---- iletişim: adresi kopyala ---- */
  $$("[data-adres-kopya]").forEach(function (b) {
    b.addEventListener("click", function () {
      var hedef = $("[data-adres-uyari]");
      kopyala(b.getAttribute("data-adres-kopya"), function (ok) {
        if (hedef) { hedef.textContent = ok ? "Adres kopyalandı." : "Kopyalanamadı; adresi seçip kopyalayın."; hedef.classList.toggle("tamam", ok); }
      });
    });
  });
})();
