/* Abbas Oto Lastik — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var WA = "https://wa.me/905388284425";
  var HOURS = { "0": [["08:30", "22:30"]], "1": [["08:30", "22:30"]], "2": [["08:30", "22:30"]], "3": [["08:30", "22:30"]], "4": [["08:30", "22:30"]], "5": [["08:30", "22:30"]], "6": [["08:30", "22:30"]] };

  /* ---------- açık/kapalı durumu (kit/status.js'ten) ---------- */
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
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function nf(n, d) { return Number(n).toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function picked(root, name) { var el = root.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function pickedAll(root, name) { return $$('[name="' + name + '"]:checked', root).map(function (e) { return e.value; }); }
  function typed(root, name) { var el = root.querySelector('[name="' + name + '"]'); return el ? el.value.replace(/\s+/g, " ").trim() : ""; }
  function waUrl(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function setAttrs(el, o) { if (el) Object.keys(o).forEach(function (k) { el.setAttribute(k, o[k]); }); }

  document.documentElement.classList.add("js");

  /* mesaj önizleme + WhatsApp bağlantısı + kopyalama */
  function bindSend(root, build) {
    var pre = $("[data-msg]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root);
    function upd() {
      var m = build();
      if (pre) pre.textContent = m;
      if (wa) wa.href = waUrl(m);
      return m;
    }
    if (cp) cp.addEventListener("click", function () {
      var text = pre ? pre.textContent : "", old = cp.getAttribute("data-label") || cp.textContent;
      cp.setAttribute("data-label", old);
      function done(ok) {
        cp.textContent = ok ? "Kopyalandı" : "Kopyalanamadı";
        cp.classList.toggle("copied", ok);
        setTimeout(function () { cp.textContent = old; cp.classList.remove("copied"); }, 1800);
      }
      function legacy() {
        try {
          var ta = document.createElement("textarea");
          ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          var ok = document.execCommand("copy"); document.body.removeChild(ta); done(ok);
        } catch (e) { done(false); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
      else legacy();
    });
    root.addEventListener("input", upd);
    root.addEventListener("change", upd);
    upd();
    return upd;
  }

  /* ---------- canlı durum ---------- */
  function paintStatus() {
    var s = openStatus(HOURS), root = document.documentElement;
    root.classList.toggle("is-open", s.open);
    root.classList.toggle("is-closed", s.known && !s.open);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; });
    $$("[data-status-big]").forEach(function (el) { el.textContent = !s.known ? "ARAYIN" : s.open ? "AÇIK" : "KAPALI"; });
    $$("[data-status-bk]").forEach(function (el) { el.textContent = "Pit"; });
    $$("[data-status-k]").forEach(function (el) { el.textContent = s.open ? "Kapanış" : "Açılış"; });
    $$("[data-status-t]").forEach(function (el) { el.textContent = s.open ? (s.closesAt || "") : (s.opensAt || "08:30"); });
    $$("[data-status-short]").forEach(function (el) {
      el.textContent = !s.known ? "Saatler için arayın" : s.open ? "Açık · kapanış " + s.closesAt : "Kapalı · açılış " + s.opensAt;
    });
    $$("[data-status-mini]").forEach(function (el) {
      el.textContent = !s.known ? "Arayın" : s.open ? "Açık · " + s.closesAt : "Kapalı · " + s.opensAt;
      el.setAttribute("title", s.text);
    });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", parseInt(el.getAttribute("data-day"), 10) === s.dayIndex); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- dönen lastik ---------- */
  var wheels = $$("[data-spin]"), reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ang = 0, tween = null, holdUntil = 0, lastT = 0, lastY = window.pageYOffset, seen = [];
  function paintWheels() {
    var v = "rotate(" + ang.toFixed(2) + "deg)";
    wheels.forEach(function (w, i) { if (seen[i] !== false) w.style.transform = v; });
  }
  function showSizeOnTop() {
    if (!wheels.length) return;
    if (reduce) { ang = 180; paintWheels(); return; }
    var to = Math.ceil((ang + 200) / 360) * 360 + 180;
    tween = { from: ang, to: to, t0: performance.now(), dur: 1700 };
  }
  if (wheels.length && !reduce) {
    if ("IntersectionObserver" in window) {
      var wio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { seen[wheels.indexOf(e.target)] = e.isIntersecting; });
      });
      wheels.forEach(function (w) { wio.observe(w); });
    }
    var frame = function (t) {
      var dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
      var y = window.pageYOffset;
      if (tween) {
        var k = Math.min(1, (t - tween.t0) / tween.dur), e = 1 - Math.pow(1 - k, 3);
        ang = tween.from + (tween.to - tween.from) * e;
        if (k >= 1) { tween = null; holdUntil = t + 2600; }
      } else {
        if (t > holdUntil) ang += dt * 5;
        ang += (y - lastY) * 0.1;
      }
      lastY = y;
      if (!document.hidden) paintWheels();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* adımlar şeridi: görününce sırayla gelsin */
  $$(".lane").forEach(function (l) {
    if (!("IntersectionObserver" in window)) { l.classList.add("is-in"); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { l.classList.add("is-in"); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(l);
  });

  /* Güvenlik ağı: gözlemci hiç tetiklenmezse (çok hızlı kaydırma, eski tarayıcı) adımlar gizli kalmasın. */
  function afterLoad() {
    setTimeout(function () {
      $$(".lane").forEach(function (l) { l.classList.add("is-in"); });
    }, 1200);
  }
  if (document.readyState === "complete") afterLoad(); else window.addEventListener("load", afterLoad);

  /* ---------- artı/eksi düğmeleri ---------- */
  $$("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var sel = document.getElementById(b.getAttribute("data-for"));
      if (!sel) return;
      var i = sel.selectedIndex + parseInt(b.getAttribute("data-step"), 10);
      if (i >= 0 && i < sel.options.length) { sel.selectedIndex = i; sel.dispatchEvent(new Event("change", { bubbles: true })); }
    });
  });

  function sizeOf(g, y, j) {
    var sw = g * y / 100, rd = j * 25.4, D = rd + 2 * sw;
    return { g: g, y: y, j: j, sw: sw, rd: rd, D: D, C: Math.PI * D, label: g + "/" + y + " R" + j };
  }
  function setSel(sel, v) {
    if (!sel || v == null) return;
    for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === String(v)) { sel.selectedIndex = i; return; }
  }

  /* ---------- ana sayfa: hızlı ebat ---------- */
  var quick = $('[data-tool="hizli-ebat"]');
  if (quick) {
    var hg = $("#hg"), hy = $("#hy"), hj = $("#hj"), go = $("[data-quick-go]", quick), first = true;
    var qUpd = function () {
      var s = sizeOf(+hg.value, +hy.value, +hj.value);
      $$("[data-sw-b]").forEach(function (t) { t.textContent = s.label + " · ABBAS OTO LASTİK"; });
      if (go) { go.href = "ebat-sor.html?g=" + s.g + "&y=" + s.y + "&j=" + s.j; go.textContent = s.label + " fiyatını sor"; }
      if (!first) showSizeOnTop();
      first = false;
    };
    quick.addEventListener("change", qUpd);
    qUpd();
  }

  /* ---------- ebat seçici ---------- */
  var et = $('[data-tool="ebat"]'), eg = $("#eg"), ey = $("#ey"), ej = $("#ej");
  function curSize() { return sizeOf(+eg.value, +ey.value, +ej.value); }
  if (et) {
    try {
      var q = new URLSearchParams(location.search);
      setSel(eg, q.get("g")); setSel(ey, q.get("y")); setSel(ej, q.get("j"));
    } catch (e) { /* eski tarayıcı: varsayılan ebat kalır */ }
    $$("[data-ebat]", et).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-ebat").split("/");
        setSel(eg, p[0]); setSel(ey, p[1]); setSel(ej, p[2]);
        eg.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    var K = 0.5, lastLabel = "";
    var drawTire = function (s) {
      var Ro = Math.min(198, s.D / 2 * K), Rr = Math.min(Ro - 8, s.rd / 2 * K), sw = Ro - Rr;
      function e(n) { return $('[data-et="' + n + '"]', et); }
      setAttrs(e("outer"), { r: Ro.toFixed(1) });
      setAttrs(e("tread"), { r: (Ro - 3).toFixed(1) });
      setAttrs(e("wall"), { r: (Ro - 7).toFixed(1) });
      setAttrs(e("bead"), { r: (Rr + 3).toFixed(1) });
      setAttrs(e("rim"), { transform: "scale(" + (Rr / 100).toFixed(3) + ")" });
      var fs = Math.max(11, Math.min(27, sw * 0.46)), rt = Rr + (sw - fs * 0.72) / 2 + 1;
      setAttrs($("#et-arc"), { d: "M" + (200 - rt).toFixed(1) + ",205 A" + rt.toFixed(1) + "," + rt.toFixed(1) + " 0 0 1 " + (200 + rt).toFixed(1) + ",205" });
      var tx = e("txt"); if (tx) { tx.textContent = s.label; tx.parentNode.setAttribute("font-size", fs.toFixed(1)); }
      setAttrs(e("yl"), { x1: (Rr + 2).toFixed(1), x2: (Ro - 1).toFixed(1) });
      setAttrs(e("yl1"), { x1: (Rr + 2).toFixed(1), x2: (Rr + 2).toFixed(1) });
      setAttrs(e("yl2"), { x1: (Ro - 1).toFixed(1), x2: (Ro - 1).toFixed(1) });
      setAttrs(e("jl"), { x1: (-Rr).toFixed(1), x2: Rr.toFixed(1) });
      var w = s.g * K;
      setAttrs(e("front"), { x: (-w / 2).toFixed(1), y: (-Ro).toFixed(1), width: w.toFixed(1), height: (2 * Ro).toFixed(1) });
      [-0.27, 0, 0.27].forEach(function (f, i) { setAttrs(e("g" + i), { x1: (w * f).toFixed(1), x2: (w * f).toFixed(1), y1: (-Ro + 10).toFixed(1), y2: (Ro - 10).toFixed(1) }); });
      setAttrs(e("wl"), { x1: (-w / 2).toFixed(1), x2: (w / 2).toFixed(1) });
      setAttrs(e("wl1"), { x1: (-w / 2).toFixed(1), x2: (-w / 2).toFixed(1) });
      setAttrs(e("wl2"), { x1: (w / 2).toFixed(1), x2: (w / 2).toFixed(1) });
      function rd(n, v) { var el = $('[data-rd="' + n + '"]', et); if (el) el.textContent = v; }
      rd("sw", nf(s.sw)); rd("rim", nf(s.rd)); rd("dia", nf(s.D)); rd("cir", nf(s.C)); rd("rev", nf(1e6 / s.C));
    };
    bindSend(et, function () {
      var s = curSize(), unknown = $("#ebil").checked, konu = picked(et, "konu"), L = [];
      et.classList.toggle("is-unknown", unknown);
      drawTire(s);
      $$("[data-plate]", et).forEach(function (p) { p.textContent = unknown ? "?/? R?" : s.label; });
      if (!unknown) $$("[data-sw-b]").forEach(function (t) { t.textContent = s.label + " · ABBAS OTO LASTİK"; });
      if (!unknown && lastLabel && lastLabel !== s.label) showSizeOnTop();
      lastLabel = s.label;
      var what = unknown ? "" : s.label + " ebat ";
      if (konu === "degisim") L.push("Merhaba, " + what + "lastiklerimi söktürüp taktırmak ve balans yaptırmak istiyorum. Fiyat ve uygun saat öğrenebilir miyim?");
      else if (konu === "tamir") L.push("Merhaba, " + what + "lastiğim patladı ya da hava kaçırıyor. Tamir için bilgi alabilir miyim?");
      else L.push("Merhaba, " + what + "lastik için fiyat öğrenmek istiyorum.");
      if (unknown) L.push("Ebatı bilmiyorum, yardımcı olur musunuz?");
      var adet = picked(et, "adet"), mevsim = picked(et, "mevsim"), kod = typed(et, "kod"), arac = typed(et, "arac");
      if (adet) L.push("Adet: " + adet);
      if (mevsim && konu !== "tamir") L.push("Mevsim: " + mevsim);
      if (kod && !unknown) L.push("Yük/hız kodu: " + kod.toUpperCase());
      if (arac) L.push("Araç: " + arac);
      document.dispatchEvent(new CustomEvent("ebat:degisti"));
      return L.join("\n");
    });
  }

  /* ---------- yanak şeması ---------- */
  var sema = $('[data-tool="sema"]');
  if (sema) {
    var semaFill = function () {
      var s = et ? curSize() : sizeOf(205, 55, 16), kod = et ? typed(et, "kod") : "", m = /^(\d{2,3})\s*([A-Za-z])/.exec(kod);
      var v = { g: s.g, y: s.y, r: "R", j: s.j, l: m ? m[1] : "91", s: m ? m[2].toUpperCase() : "V" };
      Object.keys(v).forEach(function (k) {
        $$('[data-sema="' + k + '"]', sema).forEach(function (t) { t.textContent = (k === "r" || k === "l" ? " " : "") + v[k]; });
        $$('[data-code="' + k + '"]', sema).forEach(function (t) { t.textContent = v[k]; });
      });
    };
    var semaPick = function (part) {
      $$("[data-sema]", sema).forEach(function (t) { t.classList.toggle("on", t.getAttribute("data-sema") === part); });
      $$(".sema-key", sema).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-part") === part ? "true" : "false"); });
    };
    $$(".sema-key", sema).forEach(function (b) {
      b.addEventListener("click", function () { semaPick(b.getAttribute("data-part")); });
      b.addEventListener("mouseenter", function () { semaPick(b.getAttribute("data-part")); });
    });
    document.addEventListener("ebat:degisti", semaFill);
    semaFill(); semaPick("g");
  }

  /* ---------- ebat karşılaştırma ---------- */
  var cmp = $('[data-tool="karsilastir"]');
  if (cmp && et) {
    var kg = $("#kg"), ky = $("#ky"), kj = $("#kj"), cout = $("[data-out]", cmp);
    var cUpd = function () {
      var a = curSize(), b = sizeOf(+kg.value, +ky.value, +kj.value), diff = (b.D - a.D) / a.D * 100, ad = Math.abs(diff);
      $$("[data-cur]", cmp).forEach(function (x) { x.textContent = a.label; });
      var sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
      var cls = ad <= 1.5 ? "" : ad <= 3 ? "is-mid" : "is-bad";
      var head = ad < 0.05 ? "Çaplar aynı" : ad <= 1.5 ? "Fark küçük" : ad <= 3 ? "Fark sınırda" : "Fark büyük";
      var txt = "<strong>" + head + "</strong><p>" + a.label + " toplam çapı " + nf(a.D) + " mm, " + b.label + " toplam çapı " + nf(b.D) + " mm. Fark " + sign + nf(Math.abs(b.D - a.D)) + " mm (" + sign + "%" + nf(ad, 1) + ").</p>";
      txt += "<p>Gösterge 100 km/s yazarken gerçek hızınız yaklaşık " + nf(100 * b.D / a.D, 1) + " km/s olur.</p>";
      txt += ad > 3 ? "<p>Bu kadar fark hız göstergesini, davlumbaz boşluğunu ve sürüş sistemlerini etkileyebilir. Farklı ebata geçmeden önce mutlaka danışın.</p>" : "<p>Çap yakın olsa da genişlik ve jant uyumu ayrıca kontrol edilmelidir; karar vermeden önce sorun.</p>";
      cout.className = "out " + cls; cout.innerHTML = txt;
    };
    cmp.addEventListener("change", cUpd);
    document.addEventListener("ebat:degisti", cUpd);
    cUpd();
  }

  /* ---------- belirti seçici ---------- */
  var bel = $('[data-tool="belirti"]');
  if (bel) {
    var B = {
      titresim: ["Önce balansa bakılır", "Belirli bir hız aralığında başlayan direksiyon ya da koltuk titremesi çoğu zaman balans bozukluğundandır. Jant eğriliği ve lastikteki yumru da aynı belirtiyi verir.", "Teker balans makinesinde döndürülür; jant ve lastik gözle kontrol edilir.", "Belirli hızda direksiyon titriyor. Balans ve jant kontrolü için gelmek istiyorum."],
      kacak: ["Kaçağın yeri bulunur", "Yavaş hava kaybının en sık nedenleri sırta batan çivi ya da vida, eskimiş supap (sibop) ve jant dudağındaki korozyondur. Eğri jant da hava kaçırır.", "Teker suya ya da köpüğe tutularak kaçak noktası bulunur; nedene göre tamir, supap değişimi ya da jant temizliği yapılır.", "Lastiğim yavaş yavaş hava kaçırıyor. Kaçağa bakabilir misiniz?"],
      patlak: ["İnik lastikle sürmeyin", "Havası tamamen inmiş lastikle gidilen kısa mesafe bile yanağı içeriden ezer; o noktadan sonra lastik tamir edilemez, jant da zarar görebilir.", "Stepneyi takın ya da tamir kitini kullanın. Patlak sırt bölgesindeyse çoğu zaman onarılır; yanaktaysa lastik değişir.", "Lastiğim patladı. Tamir ya da değişim için bilgi alabilir miyim?"],
      balon: ["Tamiri yok, lastik değişmeli", "Yanaktaki şişlik (balon), çukur ya da kaldırım darbesiyle lastiğin iç katlarının koptuğunu gösterir. Lastik her an patlayabilir.", "Uzun yola ve yüksek hıza çıkmayın. Lastik değiştirilir; aynı darbe jantı da eğmiş olabilir, birlikte kontrol edilir.", "Lastiğimin yanağında şişlik (balon) var. Değişim için fiyat ve bilgi alabilir miyim?"],
      cekme: ["Önce basınç, sonra ön düzen", "Düz yolda aracın bir yana çekmesi çoğunlukla iki taraf arasındaki basınç farkından ya da ön düzen (rot) ayarından kaynaklanır. Düzensiz aşınmış lastik de çekme yapar.", "Dört lastiğin basıncı eşitlenir, aşınma biçimine bakılır. Ön düzen ayarı konusunda bilgi için bize sorun.", "Aracım düz yolda bir yana çekiyor. Lastiklere bakabilir misiniz?"],
      asinma: ["Aşınma biçimi nedeni söyler", "Ortadan aşınma yüksek basınca, iki omuzdan aşınma düşük basınca, tek omuzdan aşınma ön düzen ayarına, parça parça aşınma amortisör ya da balansa işaret eder.", "Lastikler sökülmeden gözle incelenir. Bu sayfadaki aşınma haritasıyla kendi lastiğinizi karşılaştırabilirsiniz.", "Lastiklerim eşit aşınmıyor. Kontrol için gelmek istiyorum."],
      ses: ["Lastik de olabilir, rulman da", "Hızla artan uğultu, testere dişi biçiminde aşınmış ya da yaşlanıp sertleşmiş lastikten gelebilir. Aynı ses teker rulmanından da kaynaklanır.", "Lastik sırtına elle ve gözle bakılır. Ses lastikten değilse aracınızı bir tamirciye göstermeniz gerekir.", "Yolda uğultu arttı, lastiklerden mi diye baktırmak istiyorum."],
      mevsim: ["Mevsim geçişi", "Hava sıcaklığı kalıcı olarak 7 °C'nin altına indiğinde kış lastiği, üstüne çıktığında yaz lastiği daha iyi tutunur.", "Dört lastik sökülüp takılır, balansı yapılır, basınçları ayarlanır. Sökülen takımı üzerine konumunu yazarak saklayın.", "Yazlık/kışlık lastik değişimi yaptırmak istiyorum. Fiyat ve uygun saat öğrenebilir miyim?"]
    };
    var bout = $("[data-out]", bel);
    bindSend(bel, function () {
      var k = picked(bel, "belirti") || "titresim", d = B[k], arac = typed(bel, "arac");
      bout.className = "out" + (k === "balon" || k === "patlak" ? " is-bad" : "");
      bout.innerHTML = "<strong>" + d[0] + "</strong><p>" + d[1] + "</p><p>" + d[2] + "</p>";
      return "Merhaba. " + d[3] + (arac ? "\nAraç: " + arac : "");
    });
  }

  /* ---------- diş derinliği ---------- */
  var dis = $('[data-tool="dis"]');
  if (dis) {
    var rng = $("#dis-r"), dout = $("[data-out]", dis), dval = $("[data-val]", dis);
    var dUpd = function () {
      var d = parseFloat(rng.value), h = d * 16;
      $$("[data-blk]", dis).forEach(function (b) { b.setAttribute("y", (170 - h).toFixed(1)); b.setAttribute("height", h.toFixed(1)); });
      dval.textContent = nf(d, 1) + " mm";
      var c, t, p;
      if (d < 1.6) { c = "is-bad"; t = "Yasal sınırın altında"; p = "Diş derinliği 1,6 mm'nin altına inmiş lastikle trafiğe çıkılmaz. Lastik değişmeli."; }
      else if (d < 3) { c = "is-mid"; t = "Sınıra yaklaşıyor"; p = "Yasal olarak kullanılabilir; ancak oluklar sığlaştıkça ıslak zeminde su tahliyesi azalır ve fren mesafesi uzar. Değişimi planlamaya başlayın."; }
      else if (d < 4) { c = ""; t = "Yazlıkta yeterli, kışlıkta sınırda"; p = "Yaz lastiği için hâlâ kullanılır durumda. Kış lastiğinde karda tutunma için genellikle en az 4 mm önerilir."; }
      else { c = ""; t = "Rahat"; p = "Diş derinliği yeterli. Ayda bir bakmaya devam edin; dört lastiği ve lastiğin iç, orta, dış bölgelerini ayrı ayrı ölçün."; }
      dout.className = "out " + c; dout.innerHTML = "<strong>" + t + "</strong><p>" + p + "</p>";
    };
    rng.addEventListener("input", dUpd); dUpd();
  }

  /* ---------- basınç çevirici ---------- */
  var bas = $('[data-tool="basinc"]');
  if (bas) {
    var psi = $("#psi"), bar = $("#bar"), kpa = $("[data-kpa]", bas);
    var num = function (el) { var v = parseFloat(String(el.value).replace(",", ".")); return isFinite(v) && v >= 0 ? v : null; };
    psi.addEventListener("input", function () { var v = num(psi); bar.value = v == null ? "" : (v / 14.5038).toFixed(2).replace(".", ","); kpa.textContent = v == null ? "–" : nf(v / 14.5038 * 100); });
    bar.addEventListener("input", function () { var v = num(bar); psi.value = v == null ? "" : (v * 14.5038).toFixed(1).replace(".", ","); kpa.textContent = v == null ? "–" : nf(v * 100); });
    psi.dispatchEvent(new Event("input"));
  }

  /* ---------- DOT okuyucu ---------- */
  var dot = $('[data-tool="dot"]');
  if (dot) {
    var din = $("#dotkod"), dotOut = $("[data-out]", dot), AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    var dotUpd = function () {
      var v = din.value.replace(/\D/g, "");
      if (din.value !== v) din.value = v;
      if (v.length === 3) { dotOut.className = "out is-bad"; dotOut.innerHTML = "<strong>Üç haneli kod</strong><p>Üç haneli üretim kodu 2000 yılından önce üretilmiş lastiklerde kullanılırdı. Bu lastik çok yaşlıdır; rakamları bir daha kontrol edin.</p>"; return; }
      if (v.length !== 4) { dotOut.className = "out is-mid"; dotOut.innerHTML = "<strong>Dört rakamı yazın</strong><p>Yanakta DOT yazısının sonundaki, çoğu zaman oval çerçeve içindeki dört rakam. Örnek: 3523.</p>"; return; }
      var w = parseInt(v.slice(0, 2), 10), yy = 2000 + parseInt(v.slice(2), 10), now = new Date();
      if (w < 1 || w > 53) { dotOut.className = "out is-bad"; dotOut.innerHTML = "<strong>Hafta 01–53 arası olmalı</strong><p>İlk iki rakam üretim haftasıdır. Rakamları kontrol edin.</p>"; return; }
      var made = new Date(yy, 0, 1 + (w - 1) * 7);
      if (made > now) { dotOut.className = "out is-bad"; dotOut.innerHTML = "<strong>Bu tarih gelecekte</strong><p>" + yy + " yılının " + w + ". haftası henüz gelmedi. Rakamları kontrol edin.</p>"; return; }
      var months = Math.floor((now - made) / (1000 * 60 * 60 * 24 * 30.44)), yrs = Math.floor(months / 12);
      var age = months < 12 ? "yaklaşık " + Math.max(1, months) + " aylık" : "yaklaşık " + yrs + " yaşında";
      var c = yrs >= 10 ? "is-bad" : yrs >= 6 ? "is-mid" : "";
      var tip = yrs >= 10 ? "Dişi kalmış olsa bile bu yaştaki lastiğin değiştirilmesi genellikle önerilir." : yrs >= 6 ? "Bu yaştan sonra lastiği her yıl çatlak ve sertleşme açısından kontrol ettirmek iyi olur." : "Yaş açısından sorun görünmüyor; diş derinliği ve yanak durumuna bakmayı sürdürün.";
      dotOut.className = "out " + c;
      dotOut.innerHTML = "<strong>" + yy + ", " + w + ". hafta</strong><p>Bu lastik " + yy + " yılının " + w + ". haftasında (" + AY[made.getMonth()] + " ayı civarı) üretilmiş; bugün " + age + ".</p><p>" + tip + "</p>";
    };
    din.addEventListener("input", dotUpd); dotUpd();
  }

  /* ---------- jant hasarı bildir ---------- */
  var jh = $('[data-tool="jant-hasar"]');
  if (jh) {
    bindSend(jh, function () {
      var h = pickedAll(jh, "hasar"), mal = picked(jh, "malzeme"), cap = typed(jh, "cap"), adet = picked(jh, "adet"), not = typed(jh, "not"), arac = typed(jh, "arac"), L = [];
      L.push("Merhaba, jant tamiri için bilgi almak istiyorum.");
      L.push("Hasar: " + (h.length ? h.join(", ") : "tam emin değilim, bakmanızı isterim"));
      if (mal) L.push("Jant türü: " + mal);
      if (cap) L.push("Jant çapı: " + cap);
      if (adet) L.push("Jant sayısı: " + adet);
      if (arac) L.push("Araç: " + arac);
      if (not) L.push("Not: " + not);
      L.push("Fotoğrafını ayrıca gönderiyorum.");
      return L.join("\n");
    });
  }

  /* ---------- jant künyesi + bijon düzeni ---------- */
  var jk = $('[data-tool="jant-kunye"]');
  if (jk) {
    var jg = $("[data-jk]", jk);
    bindSend(jk, function () {
      var cap = +typed(jk, "cap"), gen = typed(jk, "gen"), n = +typed(jk, "bijon"), pcd = typed(jk, "pcd"), etv = typed(jk, "et"), konu = picked(jk, "konu"), arac = typed(jk, "arac");
      var S = 0.72, R = cap * 25.4 / 2 * S, P = parseFloat(pcd) / 2 * S, sp = n >= 5 ? n : n * 2, h = "", i, a;
      h += '<circle r="' + (R + 5).toFixed(1) + '" fill="#0a0a0a"/><circle r="' + R.toFixed(1) + '" fill="#c9c9c0"/><circle r="' + (R - 9).toFixed(1) + '" fill="#8f8f87"/><circle r="' + (R - 14).toFixed(1) + '" fill="#161616"/>';
      for (i = 0; i < sp; i++) h += '<path transform="rotate(' + (i * 360 / sp + (n >= 5 ? 180 / n : 0)).toFixed(1) + ')" d="M-9,0 L-6,' + (-(R - 12)).toFixed(1) + ' L6,' + (-(R - 12)).toFixed(1) + ' L9,0 Z" fill="#deded6" stroke="#77776f" stroke-width="1.5"/>';
      h += '<circle r="' + (P + 17).toFixed(1) + '" fill="#deded6" stroke="#77776f" stroke-width="1.5"/>';
      h += '<circle r="' + P.toFixed(1) + '" fill="none" stroke="#D7261E" stroke-width="2.5" stroke-dasharray="5 4"/>';
      for (i = 0; i < n; i++) { a = (i * 360 / n - 90) * Math.PI / 180; h += '<circle cx="' + (P * Math.cos(a)).toFixed(1) + '" cy="' + (P * Math.sin(a)).toFixed(1) + '" r="6.5" fill="#121212"/>'; }
      h += '<circle r="' + Math.max(8, P - 14).toFixed(1) + '" fill="#FFC400"/>';
      jg.innerHTML = h;
      var kunye = gen + "J×" + cap + (etv ? " ET" + etv : "") + " · " + n + "×" + pcd.replace(".", ",");
      $$("[data-plate]", jk).forEach(function (p) { p.textContent = kunye; });
      var L = [];
      L.push(konu === "uyum" ? "Merhaba, elimdeki jantın aracıma uyup uymayacağını sormak istiyorum." : "Merhaba, jant satın almak istiyorum; fiyat ve seçenekleri öğrenebilir miyim?");
      L.push("Jant: " + cap + " inç, " + gen + "J genişlik" + (etv ? ", ET" + etv : ""));
      L.push("Bijon düzeni: " + n + "×" + pcd.replace(".", ","));
      if (arac) L.push("Araç: " + arac);
      return L.join("\n");
    });
  }

  /* ---------- iletişim: hızlı mesaj ---------- */
  var hm = $('[data-tool="mesaj"]');
  if (hm) {
    bindSend(hm, function () {
      var konu = picked(hm, "konu"), zaman = picked(hm, "zaman"), arac = typed(hm, "arac"), ebat = typed(hm, "ebat"), not = typed(hm, "not"), L = [];
      L.push("Merhaba, " + (konu || "lastik ve jant hakkında bilgi almak istiyorum") + ".");
      if (zaman) L.push("Ne zaman: " + zaman);
      if (ebat) L.push("Lastik ebatı: " + ebat);
      if (arac) L.push("Araç: " + arac);
      if (not) L.push("Not: " + not);
      return L.join("\n");
    });
  }
})();
