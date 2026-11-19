/* Spada Di Napoli — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var HOURS = { "0": [["12:00", "22:30"]], "1": [["12:00", "22:30"]], "2": [["12:00", "22:30"]], "3": [["12:00", "22:30"]], "4": [["12:00", "23:00"]], "5": [["12:00", "23:00"]], "6": [["12:00", "22:30"]] };
  var WA = "https://wa.me/905455859693";
  var BRAND = "Spada Di Napoli";
  var GUN = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var GUNK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var AYK = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function hhmm(m) { m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60), d = m % 60; return (h < 10 ? "0" : "") + h + ":" + (d < 10 ? "0" : "") + d; }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function kopyala(text, out, okMsg) {
    function ok() { if (out) { out.textContent = okMsg || "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz."; out.classList.add("is-tamam"); } }
    function yedek() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { if (out) out.textContent = "Kopyalanamadı; metni elle seçip kopyalayın."; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, yedek); else yedek();
  }
  function uyar(el, msg, tamam) { if (!el) return; el.textContent = msg || ""; el.classList.toggle("is-tamam", !!tamam); }

  /* ---- canlı durum + bugünün satırı ---- */
  function durum() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var w = el.closest(".durum");
      if (w) { w.classList.toggle("is-open", s.open); w.classList.toggle("is-kapali", !s.open); }
    });
    $$(".saat-tablo tr[data-gun]").forEach(function (tr) { tr.classList.toggle("is-bugun", +tr.getAttribute("data-gun") === s.dayIndex); });
  }
  durum();
  setInterval(durum, 60000);

  /* ---- gezinme ---- */
  var nb = $(".sayfalar-dugme"), nav = $("#gezinme");
  if (nb && nav) {
    var kapat = function () { nav.classList.remove("is-acik"); nb.setAttribute("aria-expanded", "false"); $("use", nb).setAttribute("href", "#i-menu"); };
    nb.addEventListener("click", function () {
      var o = nav.classList.toggle("is-acik");
      nb.setAttribute("aria-expanded", o ? "true" : "false");
      $("use", nb).setAttribute("href", o ? "#i-kapat" : "#i-menu");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-acik")) { kapat(); nb.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-acik") && !e.target.closest(".ust")) kapat(); });
  }

  /* ---- kaydırınca dönen daire çapaları ---- */
  if (!reduce) {
    var bekle = false;
    window.addEventListener("scroll", function () {
      if (bekle) return; bekle = true;
      requestAnimationFrame(function () { document.documentElement.style.setProperty("--sr", (window.scrollY * 0.22).toFixed(1)); bekle = false; });
    }, { passive: true });
  }

  /* ---- ana sayfa: dönen pizza + klasik seçici ---- */
  var don = $("#pizzaDon"), psvg = $("#pizzaSvg");
  if (don && psvg) {
    var aci = 0, taban = reduce ? 0 : 7, hiz = taban, son = 0, gorunur = true, surukle = null, raf = null, sonY = window.scrollY;
    var kare = function (t) {
      var dt = Math.min(0.05, (t - son) / 1000); son = t;
      if (!surukle) { hiz += (taban - hiz) * Math.min(1, dt * 1.4); aci += hiz * dt; }
      don.style.transform = "rotate(" + aci.toFixed(2) + "deg)";
      if (!surukle && taban === 0 && Math.abs(hiz) < 0.05) { raf = null; return; }
      raf = (gorunur || surukle) ? requestAnimationFrame(kare) : null;
    };
    var basla = function () { if (!raf) { son = performance.now(); raf = requestAnimationFrame(kare); } };
    var acisi = function (e) { var r = don.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    don.addEventListener("pointerdown", function (e) {
      surukle = { a: acisi(e), t: performance.now(), v: 0 };
      try { don.setPointerCapture(e.pointerId); } catch (x) { /* yok say */ }
      don.classList.add("is-tutuluyor"); basla();
    });
    don.addEventListener("pointermove", function (e) {
      if (!surukle) return;
      var a = acisi(e), d = a - surukle.a; if (d > 180) d -= 360; if (d < -180) d += 360;
      var t = performance.now(), dt = Math.max(8, t - surukle.t) / 1000;
      surukle.v = surukle.v * 0.5 + (d / dt) * 0.5; aci += d; surukle.a = a; surukle.t = t;
    });
    var birak = function () { if (!surukle) return; hiz = Math.max(-900, Math.min(900, surukle.v)); surukle = null; don.classList.remove("is-tutuluyor"); basla(); };
    don.addEventListener("pointerup", birak);
    don.addEventListener("pointercancel", birak);
    window.addEventListener("scroll", function () {
      var y = window.scrollY, d = y - sonY; sonY = y;
      if (!reduce) { hiz = Math.max(-260, Math.min(260, hiz + d * 0.5)); basla(); }
    }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { gorunur = es[0].isIntersecting; if (gorunur) basla(); }).observe(don);
    }
    basla();

    var NOTLAR = {
      margherita: ["Margherita", "Domates sosu, mozzarella, fesleğen, zeytinyağı. Napoli'nin en bilinen klasiği."],
      marinara: ["Marinara", "Domates, sarımsak, kekik, zeytinyağı. Peynirsiz; en eski Napoli klasiklerinden biri olarak anılır."],
      formaggi: ["Quattro Formaggi", "Domatessiz zemin üzerinde dört peynir: beyaz bir pizza."],
      funghi: ["Funghi", "Domates sosu, mozzarella ve mantar. Sade ve dolgun."],
      ortolana: ["Ortolana", "Kabak, biber, zeytin gibi bahçe sebzeleriyle."]
    };
    var pnot = $("#pizzaNot");
    $$(".secici__d").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-kind"), n = NOTLAR[k];
        psvg.setAttribute("data-kind", k);
        psvg.setAttribute("aria-label", "Mayolika tabakta " + n[0] + " pizza çizimi");
        $$(".secici__d").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (pnot) pnot.innerHTML = "<strong>" + n[0] + ".</strong> " + n[1];
        if (!reduce) { hiz += 240; basla(); }
      });
    });
  }

  /* ---- menü: sekmeler ---- */
  var sekmeler = $$('[role="tab"]');
  if (sekmeler.length) {
    var sekmeSec = function (t, odak) {
      sekmeler.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
      if (odak) t.focus();
    };
    sekmeler.forEach(function (t, i) {
      t.addEventListener("click", function () { sekmeSec(t); try { history.replaceState(null, "", "#" + t.id.slice(2)); } catch (e) { /* yok say */ } });
      t.addEventListener("keydown", function (e) {
        var j = i;
        if (e.key === "ArrowRight") j = (i + 1) % sekmeler.length;
        else if (e.key === "ArrowLeft") j = (i - 1 + sekmeler.length) % sekmeler.length;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = sekmeler.length - 1;
        else return;
        e.preventDefault(); sekmeSec(sekmeler[j], true);
      });
    });
    var h = (location.hash || "").replace("#", "");
    sekmeSec(sekmeler.filter(function (t) { return t.id === "t-" + h; })[0] || sekmeler[0]);
  }

  /* ---- menü: sipariş notu ---- */
  var notListe = $("#notListe");
  if (notListe) {
    var sepet = [];
    var bul = function (ad) { for (var i = 0; i < sepet.length; i++) if (sepet[i].ad === ad) return sepet[i]; return null; };
    var amac = function () { var r = $('input[name="amac"]:checked'); return r ? r.value : "paket"; };
    var notMesaj = $("#notMesaj"), notWa = $("#notWa"), notUyari = $("#notUyari"), rozet = $("#notRozet"), sayi = $("#notSayi"), bos = $("#notBos"), adresAlan = $("#notAdresAlan");
    var notGorunur = false;
    var mesaj = function () {
      var a = amac(), L = [];
      var giris = { paket: "paket sipariş vermek istiyorum", eve: "eve servisle sipariş vermek istiyorum", masa: "gelip masada yemek istiyorum, şunlar hakkında bilgi alabilir miyim", bilgi: "menünüz hakkında bilgi almak istiyorum" }[a];
      L.push("Merhaba " + BRAND + ", " + giris + ".");
      L.push("");
      if (sepet.length) {
        L.push(a === "paket" || a === "eve" ? "Siparişim:" : "Merak ettiklerim:");
        sepet.forEach(function (x) { L.push("• " + ((a === "paket" || a === "eve") ? x.adet + " × " : "") + x.ad); });
      } else {
        L.push("(Menüden henüz seçim yapmadım.)");
      }
      var ad = $("#notAd").value.trim(), adr = $("#notAdres").value.trim(), nt = $("#notNot").value.trim();
      L.push("");
      if (a === "eve") L.push("Adres: " + (adr || "(adresimi yazacağım)"));
      if (nt) L.push("Not: " + nt);
      if (ad) L.push("Ad: " + ad);
      L.push(a === "paket" || a === "eve" ? "Fiyat ve hazırlanma bilgisi için dönüşünüzü bekliyorum. Teşekkürler!" : "Güncel menü ve fiyat bilgisi rica ederim. Teşekkürler!");
      return L.join("\n");
    };
    var guncelle = function () {
      var m = mesaj();
      notMesaj.textContent = m;
      notWa.href = waLink(m);
      var toplam = sepet.reduce(function (s, x) { return s + x.adet; }, 0);
      sayi.textContent = toplam;
      rozet.hidden = !toplam || notGorunur;
      adresAlan.style.display = amac() === "eve" ? "" : "none";
      adresAlan.parentNode.classList.toggle("adressiz", amac() !== "eve");
    };
    var ciz = function () {
      notListe.innerHTML = "";
      sepet.forEach(function (x) {
        var li = document.createElement("li");
        li.innerHTML = '<span class="not-liste__ad">' + esc(x.ad) + '</span>' +
          '<button type="button" class="mini-d" data-eksi aria-label="' + esc(x.ad) + ' adedini azalt"><svg aria-hidden="true"><use href="#i-eksi"/></svg></button>' +
          '<span class="not-liste__adet" aria-label="adet">' + x.adet + '</span>' +
          '<button type="button" class="mini-d" data-arti aria-label="' + esc(x.ad) + ' adedini artır"><svg aria-hidden="true"><use href="#i-arti"/></svg></button>';
        $("[data-eksi]", li).addEventListener("click", function () { x.adet--; if (x.adet <= 0) sepet.splice(sepet.indexOf(x), 1); ciz(); });
        $("[data-arti]", li).addEventListener("click", function () { x.adet++; ciz(); });
        notListe.appendChild(li);
      });
      bos.hidden = sepet.length > 0;
      $$(".ekle").forEach(function (b) {
        var ad = b.getAttribute("data-ekle"), x = bul(ad), s = $("span", b);
        if (!b._ilk) b._ilk = s.textContent;
        b.classList.toggle("is-eklendi", !!x);
        s.textContent = x ? "Notta: " + x.adet : b._ilk;
      });
      guncelle();
    };
    $$(".ekle").forEach(function (b) {
      b.addEventListener("click", function () {
        var ad = b.getAttribute("data-ekle"), x = bul(ad);
        if (x) x.adet++; else sepet.push({ ad: ad, adet: 1 });
        ciz();
        uyar(notUyari, ad + " notunuza eklendi.", true);
      });
    });
    $$('input[name="amac"]').forEach(function (r) { r.addEventListener("change", guncelle); });
    ["#notAd", "#notAdres", "#notNot"].forEach(function (s) { $(s).addEventListener("input", guncelle); });
    notWa.addEventListener("click", function (e) {
      if (!sepet.length && amac() !== "bilgi") { e.preventDefault(); uyar(notUyari, "Önce menüden en az bir şey ekleyin ya da \"Yalnızca bilgi\" seçin."); }
    });
    $("#notKopya").addEventListener("click", function () { kopyala(mesaj(), notUyari); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { notGorunur = es[0].isIntersecting; guncelle(); }, { threshold: 0.15 }).observe($("#notum"));
    }
    ciz();
  }

  /* ---- masa çizimi (rezervasyon) ---- */
  var TURLER = ["margherita", "marinara", "formaggi", "funghi", "ortolana"];
  function masaCiz(svg, n, pid) {
    if (!svg) return;
    var g = Math.min(n, 12), R = n <= 2 ? 84 : n <= 4 ? 90 : n <= 8 ? 98 : 106, pr = n <= 4 ? 25 : n <= 6 ? 22 : n <= 9 ? 18 : 15;
    var h = '<defs><pattern id="' + pid + '" width="36" height="36" patternUnits="userSpaceOnUse"><image href="assets/img/karo.svg" width="36" height="36"/></pattern></defs>';
    var i, a, x, y;
    for (i = 0; i < g; i++) {
      a = 2 * Math.PI * i / g - Math.PI / 2; x = (R + 24) * Math.cos(a); y = (R + 24) * Math.sin(a);
      h += '<rect x="-22" y="-14" width="44" height="28" rx="11" fill="#0B4F9E" transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (a * 180 / Math.PI + 90).toFixed(1) + ')"/>';
    }
    h += '<circle r="' + R + '" fill="url(#' + pid + ')" stroke="#0B4F9E" stroke-width="5"/><circle r="' + R + '" fill="#FFF8E6" opacity=".3"/>';
    for (i = 0; i < g; i++) {
      a = 2 * Math.PI * i / g - Math.PI / 2; x = (R - pr - 6) * Math.cos(a); y = (R - pr - 6) * Math.sin(a);
      h += '<g class="tabakcik"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (pr + 4) + '" fill="#FFFDF7" stroke="#0B4F9E" stroke-width="2"/>' +
        '<use href="#mp-' + TURLER[i % 5] + '" x="' + (x - pr).toFixed(1) + '" y="' + (y - pr).toFixed(1) + '" width="' + pr * 2 + '" height="' + pr * 2 + '"/></g>';
    }
    if (n > 12) h += '<circle r="24" fill="#D62828"/><text y="7" text-anchor="middle" font-family="Karla, sans-serif" font-weight="800" font-size="20" fill="#fff">+' + (n - 12) + "</text>";
    else h += '<circle r="12" fill="#FFFDF7" stroke="#2F7D32" stroke-width="3"/><path d="M-5-1.5c2.5-6.5 7.5-6.5 10 0-2.5 4-7.5 4-10 0Z" fill="#2F7D32"/>';
    svg.innerHTML = h;
  }

  /* ---- rezervasyon aracı ---- */
  var gunlerEl = $("#gunler");
  if (gunlerEl) {
    var istTarih = function () {
      try {
        var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).split("-");
        return new Date(+p[0], +p[1] - 1, +p[2]);
      } catch (e) { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
    };
    var bugun = istTarih(), simdi = istanbulNow();
    var st = { i: null, saat: null, kisi: 2 }, gunler = [];
    var slotlar = function (g) {
      var out = [];
      (HOURS[String(g.di)] || []).forEach(function (r) {
        var s = mins(r[0]), e = mins(r[1]); if (e <= s) e += 1440;
        for (var t = s; t <= e - 60; t += 30) { if (g.k === 0 && t < simdi.m + 30) continue; out.push(hhmm(t)); }
      });
      return out;
    };
    for (var k = 0; k < 14; k++) {
      var d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + k);
      gunler.push({ k: k, d: d, di: (d.getDay() + 6) % 7 });
    }
    gunler.forEach(function (g) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "gun"; b.setAttribute("aria-pressed", "false");
      var ust = g.k === 0 ? "Bugün" : g.k === 1 ? "Yarın" : GUNK[g.di];
      b.setAttribute("aria-label", g.d.getDate() + " " + AY[g.d.getMonth()] + " " + GUN[g.di] + (g.k === 0 ? ", bugün" : g.k === 1 ? ", yarın" : ""));
      b.innerHTML = '<span class="gun__ust">' + ust + '</span><span class="gun__sayi">' + g.d.getDate() + '</span><span class="gun__ay">' + AYK[g.d.getMonth()] + "</span>";
      b.addEventListener("click", function () { gunSec(g.k); });
      g.b = b; gunlerEl.appendChild(b);
    });
    var saatEl = $("#saatSecim"), saatIpucu = $("#saatIpucu");
    var gunSec = function (i) {
      st.i = i;
      gunler.forEach(function (g) { g.b.setAttribute("aria-pressed", g.k === i ? "true" : "false"); });
      var g = gunler[i], sl = slotlar(g);
      if (sl.indexOf(st.saat) < 0) st.saat = null;
      saatEl.innerHTML = "";
      sl.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "saat-d"; b.textContent = s;
        b.setAttribute("aria-pressed", s === st.saat ? "true" : "false");
        b.addEventListener("click", function () {
          st.saat = s;
          $$(".saat-d", saatEl).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          masaGuncelle();
        });
        saatEl.appendChild(b);
      });
      var r = (HOURS[String(g.di)] || [])[0];
      saatIpucu.textContent = sl.length
        ? GUN[g.di] + " çalışma saatleri: " + (r ? r[0] + "–" + r[1] : "") + ". Saatler kapanıştan bir saat öncesine kadar listelenir."
        : "Bugün için uygun saat kalmadı; lütfen başka bir gün seçin.";
      masaGuncelle();
    };
    var kisiSayi = $("#kisiSayi"), kisiEksi = $("#kisiEksi"), kisiArti = $("#kisiArti"), kisiIpucu = $("#kisiIpucu");
    var kisiAyarla = function (n) {
      st.kisi = Math.max(1, Math.min(30, n));
      kisiSayi.textContent = st.kisi;
      kisiEksi.disabled = st.kisi <= 1; kisiArti.disabled = st.kisi >= 30;
      kisiIpucu.textContent = st.kisi >= 8 ? "Kalabalık bir masa: ayrıntıları notta belirtin; gerekirse arayarak da konuşabilirsiniz." : "Kalabalık gruplar için önceden yazmanız planlamayı kolaylaştırır.";
      masaCiz($("#masaSvg"), st.kisi, "masaKaroB");
      masaCiz($("#masaSvgMini"), st.kisi, "masaKaroM");
      $("#masaYazi").textContent = st.kisi + " kişilik masa";
      masaGuncelle();
    };
    kisiEksi.addEventListener("click", function () { kisiAyarla(st.kisi - 1); });
    kisiArti.addEventListener("click", function () { kisiAyarla(st.kisi + 1); });
    var masaMesaj = function () {
      var g = gunler[st.i], L = [];
      L.push("Merhaba " + BRAND + ", masa ayırtmak istiyorum.");
      L.push("");
      L.push("• Tarih: " + (g ? g.d.getDate() + " " + AY[g.d.getMonth()] + " " + GUN[g.di] : "(seçilmedi)"));
      L.push("• Saat: " + (st.saat || "(seçilmedi)"));
      L.push("• Kişi: " + st.kisi);
      var v = $('input[name="vesile"]:checked');
      if (v && v.value) L.push("• Vesile: " + v.value);
      var ist = $$('input[name="istek"]:checked').map(function (x) { return x.value; });
      if (ist.length) L.push("• İstekler: " + ist.join("; "));
      var nt = $("#masaNot").value.trim(); if (nt) L.push("• Not: " + nt);
      L.push("");
      var ad = $("#masaAd").value.trim(), tl = $("#masaTel").value.trim();
      L.push("Ad: " + (ad || "(yazılacak)"));
      if (tl) L.push("Telefon: " + tl);
      L.push("Uygunluk durumunu bildirirseniz sevinirim. Teşekkürler!");
      return L.join("\n");
    };
    var masaGuncelle = function () {
      var m = masaMesaj();
      $("#masaMesaj").textContent = m;
      $("#masaWa").href = waLink(m);
    };
    $$("#masaForm input, #masaForm textarea").forEach(function (el) { el.addEventListener("input", masaGuncelle); el.addEventListener("change", masaGuncelle); });
    var masaUyari = $("#masaUyari");
    var eksik = function () {
      if (st.i === null) return ["Lütfen bir gün seçin.", gunlerEl];
      if (!st.saat) return ["Lütfen bir saat seçin.", saatEl];
      if (!$("#masaAd").value.trim()) return ["Lütfen adınızı yazın.", $("#masaAd")];
      return null;
    };
    $("#masaWa").addEventListener("click", function (e) {
      var x = eksik();
      if (x) {
        e.preventDefault(); uyar(masaUyari, x[0]);
        var hedef = x[1].matches && x[1].matches("input") ? x[1] : (x[1].querySelector("button") || x[1]);
        x[1].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        if (hedef && hedef.focus) setTimeout(function () { hedef.focus({ preventScroll: true }); }, reduce ? 0 : 400);
      } else uyar(masaUyari, "WhatsApp açılıyor. Mesajı gönderdikten sonra işletmenin onayını bekleyin.", true);
    });
    $("#masaKopya").addEventListener("click", function () {
      var x = eksik();
      kopyala(masaMesaj(), masaUyari, x ? "Kopyalandı; ancak eksik bilgi var: " + x[0].toLowerCase() : null);
    });
    var ilk = slotlar(gunler[0]).length ? 0 : 1;
    gunSec(ilk);
    kisiAyarla(2);
  }

  /* ---- Napoli usulü: anatomi ---- */
  var an = $("#anatomiSvg");
  if (an) {
    var parcalar = $$(".parca");
    var VURGU = {
      cornicione: ["cornicione", "leopardatura"], leopardatura: ["leopardatura"],
      merkez: ["pomodoro", "mozzarella", "basilico", "olio"], pomodoro: ["pomodoro"],
      mozzarella: ["mozzarella"], basilico: ["basilico"], olio: ["pomodoro", "mozzarella", "basilico", "olio"]
    };
    var vurgu = $("#a-vurgu");
    var anSec = function (ad) {
      an.setAttribute("data-aktif", ad);
      if (vurgu) {
        vurgu.innerHTML = (VURGU[ad] || []).map(function (p) { return '<use href="#a-' + p + '"/>'; }).join("");
        if (ad === "merkez") vurgu.setAttribute("clip-path", "url(#a-mclip)"); else vurgu.removeAttribute("clip-path");
      }
      parcalar.forEach(function (p) {
        var on = p.getAttribute("data-parca") === ad;
        $(".parca__d", p).setAttribute("aria-expanded", on ? "true" : "false");
        $(".parca__m", p).hidden = !on;
      });
    };
    parcalar.forEach(function (p) { $(".parca__d", p).addEventListener("click", function () { anSec(p.getAttribute("data-parca")); }); });
    an.addEventListener("click", function (e) {
      var g = e.target.closest("[data-alan]");
      if (!g) return;
      var ad = g.getAttribute("data-alan");
      if (ad === "pomodoro") {
        var r = an.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        if (Math.sqrt(dx * dx + dy * dy) < 0.16) ad = "merkez";
      }
      anSec(ad);
    });
    anSec("cornicione");
  }

  /* ---- Napoli usulü: hangi klasik ---- */
  var tf = $("#testForm");
  if (tf) {
    var METIN = {
      margherita: ["Margherita", "Dengeli ve sade: domates, mozzarella, fesleğen. Napoli usulünü ilk kez deneyenler için en iyi başlangıç noktası."],
      marinara: ["Marinara", "Peynirsiz, sarımsaklı ve kekikli. Domatesin tadını en açık haliyle sevenler için."],
      formaggi: ["Quattro Formaggi", "Domatessiz, dört peynirli beyaz bir pizza. Peynir seçkisini mutfağa sorun."],
      funghi: ["Funghi", "Mantarın toprak kokusu, mozzarella ve domatesle buluşuyor."],
      ortolana: ["Ortolana", "Bol sebzeli, renkli bir seçenek. Mevsime göre içerik değişebilir."]
    };
    tf.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (n) { var r = tf.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : null; };
      var s1 = v("s1"), s2 = v("s2"), s3 = v("s3"), sonuc = $("#testSonuc");
      if (!s1 || !s2 || !s3) {
        sonuc.hidden = false;
        $("#testAd").textContent = "Bir eksik var";
        $("#testMetin").textContent = "Lütfen üç soruyu da yanıtlayın.";
        return;
      }
      var p = { margherita: 1, marinara: 0, formaggi: 0, funghi: 0, ortolana: 0 };
      if (s1 === "bol") { p.formaggi += 2; p.margherita += 1; p.funghi += 1; }
      if (s1 === "az") { p.margherita += 2; p.ortolana += 1; p.funghi += 1; }
      if (s1 === "yok") { p.marinara += 6; }
      if (s2 === "sade") p.margherita += 2;
      if (s2 === "sarimsak") p.marinara += 3;
      if (s2 === "sebze") p.ortolana += 3;
      if (s2 === "mantar") p.funghi += 3;
      if (s3 === "yok") { p.formaggi += 4; p.marinara -= 2; } else { p.formaggi -= 2; }
      var en = "margherita";
      Object.keys(p).forEach(function (k) { if (p[k] > p[en]) en = k; });
      var t = METIN[en], ek = "";
      if (s1 === "yok" && s3 === "yok") ek = " Hem peynirsiz hem domatessiz bir pizza nadirdir; en yakını Marinara ya da zeytinyağlı bir focaccia olabilir.";
      $("#testUse").setAttribute("href", "#mp-" + en);
      $("#testAd").textContent = t[0];
      $("#testMetin").textContent = t[1] + ek;
      $("#testWa").href = waLink("Merhaba " + BRAND + ", bugün menünüzde " + t[0] + " var mı?");
      sonuc.hidden = false;
      sonuc.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  }

  /* ---- iletişim: saat kadranı ---- */
  var kad = $("#kadranSvg");
  if (kad) {
    var secGun = istanbulNow().d;
    var kGunler = $("#kadranGunler"), kSaat = $("#kadranSaat"), kCevap = $("#kadranCevap");
    var aciDer = function (m) { return m / 1440 * 360 - 90; };
    var nokta = function (r, m) { var a = aciDer(m) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
    var yay = function (r, m1, m2) {
      var p1 = nokta(r, m1), p2 = nokta(r, m2), buyuk = ((m2 - m1 + 1440) % 1440) > 720 ? 1 : 0;
      return "M" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + "A" + r + " " + r + " 0 " + buyuk + " 1 " + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
    };
    var acikMi = function (d, t) {
      var sonucu = null;
      (HOURS[String(d)] || []).forEach(function (r) {
        var s = mins(r[0]), e = mins(r[1]); if (e <= s) e += 1440;
        if (t >= s && t < e) sonucu = r;
      });
      return sonucu;
    };
    var kadranCiz = function () {
      var n = istanbulNow(), bugunMu = secGun === n.d, h = "";
      h += '<circle r="122" fill="#FFF8E6"/><circle r="122" fill="none" stroke="#F4C430" stroke-width="3"/>';
      for (var i = 0; i < 24; i++) {
        var p1 = nokta(i % 3 === 0 ? 103 : 108, i * 60), p2 = nokta(115, i * 60);
        h += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="#0B4F9E" stroke-width="' + (i % 3 === 0 ? 2.6 : 1.4) + '" stroke-linecap="round"/>';
      }
      h += '<circle r="86" fill="none" stroke="#E9DFC6" stroke-width="22"/>';
      (HOURS[String(secGun)] || []).forEach(function (r) {
        var s = mins(r[0]), e = mins(r[1]);
        h += '<path d="' + yay(86, s, e) + '" fill="none" stroke="#E4B270" stroke-width="22"/>';
        h += '<path d="' + yay(86, s + 8, e - 8) + '" fill="none" stroke="#D62828" stroke-width="12" stroke-linecap="round"/>';
        for (var j = s + 25; j < e - 10; j += 45) { var q = nokta(86 + (j % 2 ? 4 : -4), j); h += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.6" fill="#FFF8E6"/>'; }
      });
      [["00", 0], ["06", 360], ["12", 720], ["18", 1080]].forEach(function (x) {
        var q = nokta(58, x[1]);
        h += '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 5).toFixed(1) + '" text-anchor="middle" font-family="Karla, sans-serif" font-weight="800" font-size="14" fill="#0B4F9E">' + x[0] + "</text>";
      });
      var tv = kSaat && kSaat.value ? mins(kSaat.value) : null;
      if (tv !== null) { var tq = nokta(86, tv); h += '<circle cx="' + tq[0].toFixed(1) + '" cy="' + tq[1].toFixed(1) + '" r="9" fill="#F4C430" stroke="#062A55" stroke-width="3"/>'; }
      if (bugunMu) {
        var a = nokta(100, n.m);
        h += '<line x1="0" y1="0" x2="' + a[0].toFixed(1) + '" y2="' + a[1].toFixed(1) + '" stroke="#062A55" stroke-width="4" stroke-linecap="round"/>';
        h += '<circle cx="' + a[0].toFixed(1) + '" cy="' + a[1].toFixed(1) + '" r="8" fill="#FFF8E6" stroke="#062A55" stroke-width="3"/><circle cx="' + a[0].toFixed(1) + '" cy="' + a[1].toFixed(1) + '" r="2" fill="#062A55"/>';
      }
      var r0 = (HOURS[String(secGun)] || [])[0];
      h += '<circle r="47" fill="#0B4F9E"/><circle r="41" fill="none" stroke="#F4C430" stroke-width="2" stroke-dasharray="3 4"/>';
      h += '<text y="-3" text-anchor="middle" font-family="Abril Fatface, Georgia, serif" font-size="' + (bugunMu ? 16 : 13) + '" fill="#FFF8E6">' + (bugunMu ? "Bugün" : GUN[secGun]) + "</text>";
      h += '<text y="15" text-anchor="middle" font-family="Karla, sans-serif" font-weight="800" font-size="10.5" fill="#F4C430">' + (r0 ? r0[0] + "–" + r0[1] : "kapalı") + "</text>";
      kad.innerHTML = h;
      kad.setAttribute("aria-label", GUN[secGun] + " çalışma saatleri: " + (r0 ? r0[0] + " ile " + r0[1] + " arası" : "kapalı"));
      if (tv !== null) {
        var ac = acikMi(secGun, tv);
        kCevap.textContent = GUN[secGun] + " " + kSaat.value + ": " + (ac ? "açık (kapanış " + ac[1] + ")." : "kapalı. O gün " + (r0 ? r0[0] + "–" + r0[1] + " arası açık." : "kapalı."));
      }
    };
    GUN.forEach(function (g, i) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = GUNK[i]; b.setAttribute("aria-label", g); b.setAttribute("aria-pressed", i === secGun ? "true" : "false");
      b.addEventListener("click", function () {
        secGun = i;
        $$("button", kGunler).forEach(function (x, j) { x.setAttribute("aria-pressed", j === i ? "true" : "false"); });
        kadranCiz();
      });
      kGunler.appendChild(b);
    });
    if (kSaat) kSaat.addEventListener("input", kadranCiz);
    kadranCiz();
    setInterval(kadranCiz, 60000);
  }

  /* ---- adres kopyala ---- */
  var ak = $("#adresKopya");
  if (ak) ak.addEventListener("click", function () { kopyala(ak.getAttribute("data-kopyala"), $("#adresUyari"), "Adres kopyalandı."); });
})();
