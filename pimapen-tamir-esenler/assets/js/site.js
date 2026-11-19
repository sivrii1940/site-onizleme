/* Pimapen Tamir ve Cam Balkon — site betiği (bağımlılıksız) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var HOURS = { "0": [["08:00", "19:00"]], "1": [["08:00", "19:00"]], "2": [["08:00", "19:00"]], "3": [["08:00", "19:00"]], "4": [["08:00", "19:00"]], "5": [["08:00", "19:00"]], "6": [["10:00", "18:00"]] };
  var WA = "https://wa.me/905355083586";
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }

  /* ---- canlı açık/kapalı ---- */
  function durumYaz() {
    var st = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = st.text; el.classList.toggle("is-open", st.open); });
    $$("[data-status-sahne]").forEach(function (el) { el.classList.toggle("gece", !st.open); });
    $$("[data-gun]").forEach(function (el) { el.classList.toggle("bugun", parseInt(el.getAttribute("data-gun"), 10) === st.dayIndex); });
  }
  durumYaz();
  setInterval(durumYaz, 60000);

  /* ---- mobil menü: vasistas gibi açılır ---- */
  var menuDugme = $(".menu-dugme"), menu = $("#menu");
  function menuKapat() { if (!menu) return; menu.classList.remove("acik"); menuDugme.setAttribute("aria-expanded", "false"); }
  on(menuDugme, "click", function () {
    var acik = menuDugme.getAttribute("aria-expanded") === "true";
    menuDugme.setAttribute("aria-expanded", String(!acik));
    menu.classList.toggle("acik", !acik);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("acik")) { menuKapat(); menuDugme.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (menu && menu.classList.contains("acik") && !e.target.closest(".ust")) menuKapat();
  });

  /* ---- sayfa içi bağlantılarda yumuşak kaydırma (hareket azaltma tercihine uyar) ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1), hedef = id && document.getElementById(id);
    if (!hedef) return;
    e.preventDefault();
    hedef.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    if (!hedef.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(hedef.tagName)) hedef.setAttribute("tabindex", "-1");
    try { hedef.focus({ preventScroll: true }); } catch (err) { hedef.focus(); }
  });

  /* ---- yardımcılar: WhatsApp + kopyalama ---- */
  function waLink(mesaj) { return WA + "?text=" + encodeURIComponent(mesaj); }
  function kopyala(metin, bildirim) {
    function yaz(t) { if (bildirim) { bildirim.textContent = t; setTimeout(function () { bildirim.textContent = ""; }, 3500); } }
    function eski() {
      var ta = document.createElement("textarea");
      ta.value = metin; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      yaz(ok ? "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; mesajı seçip elle kopyalayın.");
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(metin).then(function () { yaz("Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz."); }, eski);
    } else { eski(); }
  }

  /* =========================================================
     ANA SAYFA — 2×3 kanat
     ========================================================= */
  var kanatlar = $("[data-kanatlar]");
  if (kanatlar) {
    var bolmeler = $$(".bolme", kanatlar);
    var detaylar = $$(".detay");
    var secili = $("[data-secili]");
    var goster = function (k) {
      detaylar.forEach(function (d) { d.hidden = d.getAttribute("data-k") !== k; });
      var b = $('.bolme[data-k="' + k + '"]', kanatlar);
      if (secili && b) secili.textContent = "Seçili kanat: " + $(".kanat__ad", b).textContent;
    };
    var ac = function (b, acik) {
      b.classList.toggle("acik", acik);
      $(".kanat", b).setAttribute("aria-expanded", String(acik));
      var arka = $(".bolme__arka", b);
      arka.setAttribute("aria-hidden", String(!acik));
      $$("a", arka).forEach(function (a) { a.tabIndex = acik ? 0 : -1; });
    };
    bolmeler.forEach(function (b) {
      ac(b, false);
      on($(".kanat", b), "click", function () {
        var acilacak = !b.classList.contains("acik");
        ac(b, acilacak);
        if (acilacak) goster(b.getAttribute("data-k"));
      });
    });
    goster(bolmeler[0].getAttribute("data-k"));
    setTimeout(function () { ac(bolmeler[0], true); }, REDUCE ? 0 : 900);
    var hepsi = $("[data-hepsi]");
    on(hepsi, "click", function () {
      var hepsiAcik = bolmeler.every(function (b) { return b.classList.contains("acik"); });
      bolmeler.forEach(function (b, i) { setTimeout(function () { ac(b, !hepsiAcik); }, REDUCE ? 0 : i * 110); });
      hepsi.textContent = hepsiAcik ? "Bütün kanatları aç" : "Bütün kanatları kapat";
    });
  }

  /* =========================================================
     TAMİR — kolun üç konumu
     ========================================================= */
  var kolDemo = $("[data-kol-demo]");
  if (kolDemo) {
    var sahne = $(".kol-demo__sahne", kolDemo);
    var kolDugmeler = $$(".kol-demo__secim [data-konum]", kolDemo);
    var kolMetin = $$("[data-konum-metin]", kolDemo);
    var bekle = null;
    var kur = function (k) {
      sahne.setAttribute("data-konum", k);
      kolDugmeler.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-konum") === k)); });
      kolMetin.forEach(function (m) { m.hidden = m.getAttribute("data-konum-metin") !== k; });
    };
    kolDugmeler.forEach(function (b) {
      on(b, "click", function () {
        var hedef = b.getAttribute("data-konum"), simdi = sahne.getAttribute("data-konum");
        clearTimeout(bekle);
        if (!REDUCE && simdi !== "kapali" && hedef !== "kapali" && simdi !== hedef) {
          kur("kapali"); /* doğru kullanım: önce kanadı kapat, sonra kolu çevir */
          bekle = setTimeout(function () { kur(hedef); }, 1050);
        } else { kur(hedef); }
      });
    });
    kur("kapali");
  }

  /* ---- TAMİR — pencere anatomisi ---- */
  var anat = $("[data-anatomi]");
  if (anat) {
    var parcaSec = function (p) {
      $$("[data-parca]", anat).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-parca") === p)); });
      $$("[data-parca-bilgi]", anat).forEach(function (x) { x.hidden = x.getAttribute("data-parca-bilgi") !== p; });
      $$("[data-vurgu]", anat).forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-vurgu") === p); });
    };
    $$("[data-parca]", anat).forEach(function (b) { on(b, "click", function () { parcaSec(b.getAttribute("data-parca")); }); });
    parcaSec("kol");
  }

  /* ---- TAMİR — arıza kataloğu süzgeci ---- */
  var katalog = $("[data-katalog]");
  if (katalog) {
    var filtreler = $$("[data-filtre]", katalog), kalemler = $$("[data-tur]", katalog), sayim = $("[data-sayim]", katalog);
    var suz = function (f) {
      var n = 0;
      filtreler.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filtre") === f)); });
      kalemler.forEach(function (k) {
        var gorunur = f === "hepsi" || (" " + k.getAttribute("data-tur") + " ").indexOf(" " + f + " ") > -1;
        k.hidden = !gorunur; if (gorunur) n++;
      });
      if (sayim) sayim.textContent = n + " arıza gösteriliyor.";
    };
    filtreler.forEach(function (b) { on(b, "click", function () { suz(b.getAttribute("data-filtre")); }); });
    suz("hepsi");
  }

  /* =========================================================
     ÜRÜNLER — katlanır cam balkon
     ========================================================= */
  var cb = $("[data-cambalkon]");
  if (cb) {
    var paneller = $$(".cb__panel", cb), N = paneller.length, ray = $(".ray-girdi", cb), cbDurum = $(".cb__durum", cb), anim = null;
    var ciz = function (v) {
      var p = v / 100 * N, toplanan = 0;
      paneller.forEach(function (el, i) {
        var t = Math.min(1, Math.max(0, p - i));
        var kay = Math.min(1, t / 0.6), don = Math.max(0, (t - 0.6) / 0.4);
        var x = i * 100 - i * 88 * kay; /* panel genişliğinin yüzdesi; toplama noktası solda */
        el.style.transform = "translateX(" + x.toFixed(2) + "%) rotateY(" + (-82 * don).toFixed(2) + "deg)";
        el.style.zIndex = String(N - i);
        if (t >= 1) toplanan++;
      });
      if (cbDurum) cbDurum.textContent = v <= 0 ? "Kapalı: altı panel de rayda, yan yana." : v >= 100 ? "Tamamen açık: paneller sol uçta içe katlanıp toplandı." : toplanan + " panel toplandı, sıradaki kaydırılıyor.";
    };
    var git = function (hedef) {
      cancelAnimationFrame(anim);
      if (REDUCE) { ray.value = hedef; ciz(hedef); return; }
      var bas = parseFloat(ray.value), t0 = null, sure = 2400 * Math.abs(hedef - bas) / 100 + 1;
      var adim = function (ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / sure), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var v = bas + (hedef - bas) * e; ray.value = v; ciz(v);
        if (k < 1) anim = requestAnimationFrame(adim);
      };
      anim = requestAnimationFrame(adim);
    };
    on(ray, "input", function () { cancelAnimationFrame(anim); ciz(parseFloat(ray.value)); });
    $$("[data-cb-git]", cb).forEach(function (b) { on(b, "click", function () { git(parseFloat(b.getAttribute("data-cb-git"))); }); });
    ciz(parseFloat(ray.value));
  }

  /* ---- ÜRÜNLER — sineklik eşleştirici ---- */
  var sSec = $("[data-sineklik-sec]");
  if (sSec) {
    var ONERI = {
      ice: { tip: ["plise", "stor", "sabit"], metin: "İçe açılan kanatta sineklik kasanın dış tarafında durur; kanat içeri rahat açılır. Sık açıp kapatacaksanız plise ya da stor, pek kullanmayacaksanız sabit sineklik sade bir seçimdir." },
      balkon: { tip: ["plise", "menteseli"], metin: "Balkon kapısında geçiş çoktur. Plise sinekliğin alt rayı alçaktır, takılmadan geçilir; menteşeli sineklik ise kapı gibi açılır ve sağlamdır." },
      surme: { tip: ["surme", "plise"], metin: "Sürme pencere ve kapıda sineklik de kendi rayında kayabilir; yer darsa plise sineklik yana toplanır." },
      vasistas: { tip: ["sabit", "stor"], metin: "Yalnız üstten açılan (vasistas) pencerede sineklik çoğu zaman sabit kalır; isterseniz stor sineklikle kullanılmadığında toplanabilir." },
      genis: { tip: ["plise"], metin: "Geniş açıklıklarda ve cumbalarda iki yandan kapanan plise sineklikler kullanılabilir. Ölçü ve rayın oturacağı yer yerinde kontrol edilmelidir." }
    };
    var sonuc = $("[data-sineklik-sonuc]"), kartlar = $$("[data-tip]");
    $$('input[name="acilis"]', sSec).forEach(function (r) {
      on(r, "change", function () {
        var o = ONERI[r.value]; if (!o) return;
        kartlar.forEach(function (k) { k.classList.toggle("uygun", o.tip.indexOf(k.getAttribute("data-tip")) > -1); });
        var adlar = o.tip.map(function (t) { var k = $('[data-tip="' + t + '"] h3'); return k ? k.textContent : t; });
        sonuc.innerHTML = "";
        var p1 = document.createElement("p"); p1.innerHTML = "<b>Uygun tipler:</b> " + adlar.join(", ");
        var p2 = document.createElement("p"); p2.textContent = o.metin;
        sonuc.appendChild(p1); sonuc.appendChild(p2);
        var olcuTip = $("#olcu-tip"); if (olcuTip) olcuTip.value = adlar[0];
        olcuGuncelle();
      });
    });
  }

  /* ---- ÜRÜNLER — sineklik ölçü defteri ---- */
  var olcu = $("[data-olcu-defteri]");
  function sayi(v) { v = String(v || "").replace(",", ".").replace(/[^0-9.]/g, ""); var n = parseFloat(v); return isNaN(n) || n <= 0 ? null : n; }
  function yaziSayi(n) { return (Math.round(n * 10) / 10).toString().replace(".", ","); }
  function olcuGuncelle() {
    if (!olcu) return;
    var g = $$("[data-g]", olcu).map(function (i) { return sayi(i.value); }).filter(function (x) { return x !== null; });
    var y = $$("[data-y]", olcu).map(function (i) { return sayi(i.value); }).filter(function (x) { return x !== null; });
    var gm = g.length ? Math.min.apply(null, g) : null, ym = y.length ? Math.min.apply(null, y) : null;
    $("[data-g-sonuc]", olcu).textContent = gm ? yaziSayi(gm) + " cm" : "–";
    $("[data-y-sonuc]", olcu).textContent = ym ? yaziSayi(ym) + " cm" : "–";
    var yer = ($("#olcu-yer", olcu).value || "").trim(), tip = $("#olcu-tip", olcu).value;
    var m = "Merhaba, sitenizden yazıyorum. Sineklik için ölçü gönderiyorum.\n";
    if (yer) m += "Yer: " + yer + "\n";
    m += "Düşündüğüm tip: " + tip + "\n";
    m += "Genişlik (en dar): " + (gm ? yaziSayi(gm) + " cm" : "henüz ölçmedim") + (g.length > 1 ? " (ölçülen: " + g.map(yaziSayi).join(" / ") + ")" : "") + "\n";
    m += "Yükseklik (en kısa): " + (ym ? yaziSayi(ym) + " cm" : "henüz ölçmedim") + (y.length > 1 ? " (ölçülen: " + y.map(yaziSayi).join(" / ") + ")" : "") + "\n";
    m += "Pencerenin fotoğrafını da gönderiyorum. Kesin ölçü ve fiyat için bilgi rica ederim.";
    $("[data-olcu-mesaj]", olcu).textContent = m;
    $("[data-olcu-wa]", olcu).href = waLink(m);
    olcu._mesaj = m;
  }
  if (olcu) {
    $$("input, select", olcu).forEach(function (i) { on(i, "input", olcuGuncelle); on(i, "change", olcuGuncelle); });
    on($("[data-olcu-kopyala]", olcu), "click", function () { kopyala(olcu._mesaj, $("[data-olcu-bildirim]", olcu)); });
    olcuGuncelle();
  }

  /* =========================================================
     ARIZA BİLDİR — imza araç
     ========================================================= */
  var form = $("[data-ariza-form]");
  if (form) {
    var URUN = {
      pencere: { ad: "PVC pencere", sorun: ["Kol dönmüyor ya da yarıda takılıyor", "Kol kırıldı ya da boşta dönüyor", "Kanat sarkmış, kasaya sürtüyor", "Kanat tam kapanmıyor", "Kapalıyken hava, ses ya da su alıyor", "Kanat menteşeden çıktı, tek köşeden asılı", "Vasistas (üstten açılma) çalışmıyor"] },
      kapi: { ad: "PVC kapı", sorun: ["Kapı kasaya sürtüyor", "Kilit zor dönüyor ya da kilitlenmiyor", "Anahtar dönmüyor (barel)", "Kapı kolu gevşedi ya da düştü", "Kapı sarkmış, zor kapanıyor", "Alttan hava ya da su alıyor"] },
      "cam-balkon": { ad: "Cam balkon", sorun: ["Panel zor kayıyor", "Panel raydan çıktı", "Tekerlek kırık ya da ses yapıyor", "Kilit ya da kol çalışmıyor", "Su ya da hava alıyor", "Panel camı kırıldı"] },
      sineklik: { ad: "Sineklik", sorun: ["Yeni sineklik yaptırmak istiyorum", "File yırtıldı", "Plise sineklik takılıyor", "Mıknatıs ya da kilit tutmuyor", "Çerçeve kırıldı"] },
      dusakabin: { ad: "Duşakabin", sorun: ["Yeni duşakabin ya da değişim", "Kapı zor kayıyor", "Tekerlek kırıldı", "Alttan su sızdırıyor", "Conta ya da fitil yıprandı", "Kulp gevşedi"] },
      cam: { ad: "Cam", sorun: ["Cam kırıldı", "Cam çatladı", "Çift camın arası buğulanıyor", "Cam çıtası ya da kenarı açıldı", "Cam tipini değiştirmek istiyorum (buzlu, desenli vb.)"] }
    };
    var sorunKutu = $("[data-sorunlar]", form), mesajEl = $("[data-mesaj]", form), waA = $("[data-wa]", form), uyari = $("[data-uyari]", form), sonra = $("[data-sonra]", form);
    var adetOut = $("[data-adet]", form), adet = 1;

    var secilenler = function (ad) { return $$('input[name="' + ad + '"]:checked', form).map(function (i) { return i.value; }); };
    var deger = function (sel) { var e = $(sel, form); return e ? (e.value || "").trim() : ""; };

    var sorunlariKur = function (urun) {
      sorunKutu.innerHTML = "";
      if (!URUN[urun]) { var p = document.createElement("p"); p.className = "ipucu-kutu"; p.textContent = "Önce yukarıdan ürünü seçin; belirtiler ona göre gelir."; sorunKutu.appendChild(p); return; }
      var kap = document.createElement("div"); kap.className = "secim";
      URUN[urun].sorun.forEach(function (s, i) {
        var l = document.createElement("label"), inp = document.createElement("input"), sp = document.createElement("span");
        inp.type = "checkbox"; inp.name = "sorun"; inp.value = s; inp.id = "sorun-" + i; sp.textContent = s;
        l.appendChild(inp); l.appendChild(sp); kap.appendChild(l);
      });
      sorunKutu.appendChild(kap);
    };

    var mesajKur = function () {
      var urun = secilenler("urun")[0];
      var satir = ["Merhaba, sitenizden yazıyorum. Arıza bildirmek istiyorum.", ""];
      satir.push("Ürün: " + (urun ? URUN[urun].ad : "(seçilmedi)"));
      var sor = secilenler("sorun"); if (sor.length) satir.push("Sorun: " + sor.join("; "));
      var not = deger("#not"); if (not) satir.push("Not: " + not);
      var yer = [], oda = secilenler("oda")[0], kat = deger("#kat"), asansor = secilenler("asansor")[0];
      if (oda) yer.push(oda); if (kat) yer.push(kat); if (asansor) yer.push(asansor);
      if (yer.length) satir.push("Yer: " + yer.join(" · "));
      satir.push("Adet: " + adet);
      var gun = secilenler("gun"), saat = secilenler("saat");
      if (gun.length || saat.length) satir.push("Uygun zaman: " + gun.concat(saat).join(", "));
      var foto = secilenler("foto");
      if (foto.length) satir.push("Fotoğraflar: " + foto.join(", ") + " (bu mesajdan sonra gönderiyorum)");
      else satir.push("Fotoğraf: Gerekirse gönderebilirim.");
      var ad = deger("#ad"), mah = deger("#mahalle");
      if (ad) satir.push("Ad: " + ad);
      if (mah) satir.push("Mahalle / adres tarifi: " + mah);
      var m = satir.join("\n");
      mesajEl.textContent = m;
      waA.href = waLink(m);
      form._mesaj = m;
      if (urun) uyari.hidden = true;
      return m;
    };

    form.addEventListener("change", function (e) {
      if (e.target.name === "urun") sorunlariKur(e.target.value);
      mesajKur();
    });
    form.addEventListener("input", mesajKur);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    $$("[data-adet-degis]", form).forEach(function (b) {
      on(b, "click", function () {
        adet = Math.max(1, Math.min(20, adet + parseInt(b.getAttribute("data-adet-degis"), 10)));
        adetOut.textContent = String(adet); mesajKur();
      });
    });
    on(waA, "click", function (e) {
      if (!secilenler("urun").length) {
        e.preventDefault(); uyari.hidden = false;
        var ilk = $("#adim-urun", form); if (ilk) ilk.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
        return;
      }
      mesajKur(); sonra.hidden = false;
    });
    on($("[data-kopyala]", form), "click", function () { kopyala(mesajKur(), $("[data-kopya-bildirim]", form)); });

    /* ?konu= ile gelen ürünü seç (ana sayfadaki kanatlardan) */
    var konu = null;
    try { konu = new URLSearchParams(location.search).get("konu"); } catch (e) { konu = null; }
    sorunlariKur(null);
    if (konu && URUN[konu]) {
      var r = $('input[name="urun"][value="' + konu + '"]', form);
      if (r) { r.checked = true; sorunlariKur(konu); }
    }
    mesajKur();
  }
})();
