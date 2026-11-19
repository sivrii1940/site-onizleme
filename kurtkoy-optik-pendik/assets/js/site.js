/* Kurtköy Optik — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var WA = "https://wa.me/905314593688";
  var TEL = "tel:+905314593688";
  var HOURS = { "0": [["09:00", "19:30"]], "1": [["09:00", "19:30"]], "2": [["09:00", "19:30"]], "3": [["09:00", "19:30"]], "4": [["09:00", "19:30"]], "5": [["09:00", "19:30"]], "6": [["12:00", "19:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---- Canlı durum ---- */
  var ST = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) { el.textContent = ST.text; el.classList.toggle("is-open", ST.open); });
  $$("[data-hours-table] tr[data-day]").forEach(function (tr) {
    if (+tr.getAttribute("data-day") === ST.dayIndex) tr.classList.add("today");
  });

  /* ---- Güneş yayı: bugünün açık saatleri, güneş şimdiki zamanda ---- */
  $$("[data-sunarc]").forEach(function (box) {
    var today = (HOURS[String(ST.dayIndex)] || [])[0];
    if (!today) return;
    var s = mins(today[0]), e = mins(today[1]), m = ST.minutes;
    var f = (m - s) / (e - s);
    var sun = $(".sunball", box), done = $(".arc-done", box);
    var lo = $("[data-arc-open]", box), lc = $("[data-arc-close]", box), ld = $("[data-arc-day]", box);
    if (lo) lo.textContent = today[0];
    if (lc) lc.textContent = today[1];
    if (ld) ld.textContent = DAYS[ST.dayIndex];
    var cf = Math.max(0, Math.min(1, f));
    var th = Math.PI * (1 - cf), x = 200 + 170 * Math.cos(th), y = 170 - 140 * Math.sin(th);
    if (f < 0 || f > 1) { y = 186; x = f < 0 ? 30 : 370; box.classList.add("is-night"); }
    if (sun) sun.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
    if (done) {
      if (f <= 0) done.setAttribute("d", "M30 170");
      else done.setAttribute("d", "M30 170 A170 140 0 0 1 " + (200 + 170 * Math.cos(th)).toFixed(1) + " " + (170 - 140 * Math.sin(th)).toFixed(1));
    }
  });

  /* ---- Cam rengi anahtarı ---- */
  var TINTS = {
    seffaf: { name: "Şeffaf", sw: "linear-gradient(145deg,#fff,#E9E1CC)", desc: "<b>Şeffaf cam:</b> numaralı gözlüklerin camı. Renk vermez; ışık olduğu gibi geçer." },
    gri: { name: "Gri", sw: "#4E5456", desc: "<b>Gri cam</b> renkleri en az değiştiren tondur; ışığı her renkte aşağı yukarı eşit kısar." },
    kahve: { name: "Kahve", sw: "#7B4519", desc: "<b>Kahve cam</b> sıcak bir ton verir ve kontrastı artırır; değişken ışıkta rahat hissettirir." },
    yesil: { name: "Yeşil", sw: "#3F5C3A", desc: "<b>Yeşil cam</b> renkleri doğala yakın tutar, kontrastı hafifçe artırır." },
    aynali: { name: "Aynalı", sw: "linear-gradient(135deg,#3FC1FF,#8D6BFF 40%,#FF6FAE 66%,#FFB347)", desc: "<b>Aynalı kaplama</b> ışığın bir kısmını dışarı yansıtır; deniz ve kar gibi çok parlak ortamlarda tercih edilir." }
  };
  var ORDER = ["seffaf", "gri", "kahve", "yesil", "aynali"];
  var current = document.documentElement.getAttribute("data-tint") || "seffaf";
  var listeners = [];
  function setTint(t, fromUser) {
    if (!TINTS[t]) t = "seffaf";
    current = t;
    var h = document.documentElement;
    if (t === "seffaf") h.removeAttribute("data-tint"); else h.setAttribute("data-tint", t);
    $$("[data-tint-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-tint-btn") === t)); });
    $$("[data-tint-desc]").forEach(function (el) { el.innerHTML = TINTS[t].desc; });
    $$("[data-tint-name]").forEach(function (el) { el.textContent = TINTS[t].name; });
    $$("[data-tint-cycle]").forEach(function (b) {
      b.style.setProperty("--sw-now", TINTS[t].sw);
      b.setAttribute("aria-label", "Cam rengini değiştir. Şu an: " + TINTS[t].name);
      var sp = $("span", b); if (sp) sp.textContent = TINTS[t].name;
    });
    if (fromUser) { store("ko-cam", t); stopDemo(); }
    listeners.forEach(function (fn) { fn(t); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-tint-btn]") : null;
    if (b) { setTint(b.getAttribute("data-tint-btn"), true); return; }
    var c = e.target.closest ? e.target.closest("[data-tint-cycle]") : null;
    if (c) { setTint(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length], true); }
  });
  setTint(current, false);

  /* Ana sayfa: kullanıcı henüz seçmediyse dev gözlük camları bir kez renkleri dener */
  var demoTimer = null, demoEl = $("[data-demo]");
  function stopDemo() {
    if (demoTimer) { clearTimeout(demoTimer); demoTimer = null; }
    if (demoEl) demoEl.removeAttribute("data-tint");
    $$(".tsw.is-demo").forEach(function (b) { b.classList.remove("is-demo"); });
  }
  if (demoEl && !reduce && !store("ko-cam")) {
    var seq = ["gri", "kahve", "yesil", "aynali"], i = 0;
    var step = function () {
      $$(".tsw.is-demo").forEach(function (b) { b.classList.remove("is-demo"); });
      if (i >= seq.length) { stopDemo(); return; }
      demoEl.setAttribute("data-tint", seq[i]);
      var b = $('.tsw[data-tint-btn="' + seq[i] + '"]'); if (b) b.classList.add("is-demo");
      i++; demoTimer = setTimeout(step, 1500);
    };
    demoTimer = setTimeout(step, 900);
  }

  /* ---- Menü ---- */
  var mb = $("[data-menu]"), nav = $("#site-nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", String(o));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); }
    });
  }

  /* ---- Yardımcılar: seçim düğmeleri ve mesaj ---- */
  function chips(root, multi, onChange) {
    var btns = $$("button", root);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        if (multi) b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
        else btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onChange && onChange(b);
      });
    });
    return {
      vals: function () { return btns.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.getAttribute("data-v"); }); },
      labels: function () { return btns.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.getAttribute("data-label") || b.textContent.trim(); }); },
      set: function (v) { btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-v") === v)); }); }
    };
  }
  function copyText(t, okEl, msg) {
    function done() { if (okEl) { okEl.textContent = msg || "Mesaj kopyalandı."; setTimeout(function () { okEl.textContent = ""; }, 2600); } }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t).then(done, fallback); } else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { if (okEl) okEl.textContent = "Kopyalanamadı; metni seçip kopyalayın."; }
      document.body.removeChild(ta);
    }
  }
  function messenger(root, build) {
    var pre = $("[data-msg]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root), ok = $("[data-copied]", root);
    function upd() { var m = build(); if (pre) pre.textContent = m; if (wa) wa.href = WA + "?text=" + encodeURIComponent(m); }
    if (cp) cp.addEventListener("click", function () { upd(); copyText(pre.textContent, ok); });
    $$("input, textarea, select", root).forEach(function (i) { i.addEventListener("input", upd); i.addEventListener("change", upd); });
    upd();
    return upd;
  }
  function nameLine(root) { var n = $("[data-name]", root); return n && n.value.trim() ? "\nAdım: " + n.value.trim() : ""; }
  function noteLine(root) { var n = $("[data-note]", root); return n && n.value.trim() ? "\nNot: " + n.value.trim() : ""; }

  /* ---- Tamir fişi ---- */
  var SYMS = {
    sallaniyor: { part: ["vida", "mentese"], t: "Sap sallanıyor, gözlük yüzümde oynuyor", what: "Menteşe vidası gevşemiş olabilir. Vidalar kullandıkça gevşer; çoğu zaman sıkılarak ya da yeni vidayla düzelir.", dont: "Mutfak bıçağı ya da uymayan bir tornavidayla sıkmaya çalışmayın; vida başı bozulursa iş zorlaşır." },
    vida: { part: ["vida", "mentese"], t: "Vida düştü, sap ayrıldı", what: "Sapı ve çerçeveyi birlikte getirin. Uygun ölçüde bir vidayla yeniden bağlanabilir mi, gözlüğe bakıp söyleriz.", dont: "Sapı bantla, telle ya da yapıştırıcıyla tutturmayın. Vidayı bulduysanız küçük bir zarfa koyun." },
    mentese: { part: ["mentese"], t: "Menteşe kırıldı ya da yerinden çıktı", what: "Çerçevenin malzemesine göre çözüm değişir: kimi zaman onarım, kimi zaman parça ya da çerçeve değişimi gerekir. Görmeden kesin bir şey söylemeyiz.", dont: "Kırık menteşeyi zorlayarak açıp kapatmayın; çatlak büyüyebilir." },
    sararmis: { part: ["burunluk"], t: "Burunluk sarardı, sertleşti", what: "Silikon burunluklar zamanla sararır ve sertleşir. Metal çerçevelerde burunluk değiştirilebilir.", dont: "Sararmış burunluğu çamaşır suyu ya da alkollü sıvıyla ovmayın." },
    burunluk: { part: ["burunluk"], t: "Burunluk düştü ya da kırıldı", what: "Burunluk, kolu sağlamsa genellikle yenisiyle değiştirilir. Kol eğildiyse önce o ayarlanır.", dont: "Burunluk kolunu parmakla bükmeye çalışmayın; ince metal kırılabilir." },
    iz: { part: ["burunluk"], t: "Burnumda iz bırakıyor, acıtıyor", what: "Burunlukların açısı ve aralığı ayarlanarak ağırlık daha geniş bir alana dağıtılabilir.", dont: "Burnunuza bant ya da pamuk yapıştırarak idare etmeyin; gözlüğü getirin, ayara bakalım." },
    kayiyor: { part: ["burunluk", "sapucu"], t: "Gözlük burnumdan aşağı kayıyor", what: "Sap uçlarının kulağın arkasına oturuşu ve burunluk ayarı birlikte kontrol edilir.", dont: "Sapları sıcak suyla ya da saç kurutma makinesiyle kendiniz bükmeyin." },
    egik: { part: ["sap"], t: "Sap eğildi", what: "Eğilen saplar çoğu zaman ayarla düzelir. Kemik (asetat) saplar uygun ısıyla, metal saplar elle dikkatle şekillendirilir.", dont: "Evde ısıtarak ya da zorlayarak düzeltmeye çalışmayın; ince saplar kırılabilir." },
    baski: { part: ["sapucu"], t: "Kulağımın arkası baskı yapıyor", what: "Sap ucunun kıvrımı ve uzunluğu kulağınıza göre ayarlanabilir.", dont: "Baskı yapan gözlüğü takmaya devam edip alışmayı beklemeyin; ayar çoğu zaman rahatlatır." },
    sapucu: { part: ["sapucu"], t: "Sap ucu kırıldı ya da aşındı", what: "Bazı modellerde sap ucundaki kılıf değiştirilebilir; bu, modele bağlıdır.", dont: "Kırık ucu yapıştırıcıyla yapıştırmayın; yapıştırıcı kılıfın değişimini zorlaştırabilir." },
    cikti: { part: ["cam", "vida"], t: "Cam yerinden çıktı", what: "Metal çerçevede camı tutan vida, yarım çerçevede misina gevşemiş olabilir. Cam sağlamsa çoğu zaman yerine takılır.", dont: "Camı kaybetmeyin, çizilmemesi için yumuşak bir beze sarın. Kendiniz bastırarak takmaya çalışmayın." },
    cizik: { part: ["cam"], t: "Cam çizildi", what: "Çizik silerek ya da cilayla çıkmaz. Görüşünüzü etkiliyorsa cam değişimini konuşuruz; reçetenizi yanınızda getirin.", dont: "Diş macunu ya da cila gibi ev yöntemleri denemeyin; cam kaplamasına zarar verebilir." },
    yamuk: { part: ["cerceve", "sap"], t: "Gözlük yüzümde yamuk duruyor", what: "Çerçeve ya da saplardan biri eğilmiş olabilir; ayarla düzelebilir. Numaralı gözlükte yamukluk camın göz önündeki yerini değiştirir.", dont: "Masaya bastırarak düzeltmeyin; yamukluk bir yerden öbürüne kayar." },
    kirik: { part: ["cerceve"], t: "Çerçeve çatladı ya da kırıldı", what: "Kırığın yerine ve malzemesine bakmak gerekir. Bazı kırıklar onarılamaz; o zaman seçenekleri birlikte konuşuruz.", dont: "Süper yapıştırıcı sürmeyin; sonradan yapılabilecek bir onarımı imkânsız hâle getirebilir." },
    misina: { part: ["misina", "cam"], t: "Misina koptu (yarım çerçeve)", what: "Yarım çerçevelerde camı alttan tutan ince ip, misinadır. Kopan misina değiştirilebilir.", dont: "Camı çerçeveye bantlamayın; cam düşüp kırılabilir." }
  };
  var PARTN = { vida: "vida", mentese: "menteşe", burunluk: "burunluk", sap: "sap", sapucu: "sap ucu", cam: "cam", cerceve: "çerçeve", misina: "misina" };
  $$('[data-tool="tamir"]').forEach(function (root) {
    var symG = chips($("[data-syms]", root), true, function (b) { onSym(b); });
    var typeG = chips($("[data-gtype]", root), false, function () { upd(); });
    var frameG = chips($("[data-frame]", root), false, function () { upd(); });
    var photoG = chips($("[data-photo]", root), true, function () { upd(); });
    var info = $("[data-sym-info]", root), cap = $("[data-part-cap]", root);
    function paint() {
      var on = {};
      symG.vals().forEach(function (v) { SYMS[v].part.forEach(function (p) { on[p] = 1; }); });
      $$("[data-part]", root).forEach(function (el) { el.classList.toggle("on", !!on[el.getAttribute("data-part")]); });
      var names = Object.keys(on).map(function (k) { return PARTN[k]; });
      cap.textContent = names.length ? "İlgili parça: " + names.join(", ") : "Bir belirti seçin; ilgili parça çizimde yanar.";
      var cnt = $("[data-count]", root); if (cnt) cnt.textContent = symG.vals().length;
    }
    function onSym(b) {
      var v = b.getAttribute("data-v"), s = SYMS[v];
      if (b.getAttribute("aria-pressed") === "true") {
        info.innerHTML = "<h4>" + s.t + "</h4><p><b>Ne olabilir:</b> " + s.what + "</p><p><b>Siz yapmayın:</b> " + s.dont + "</p>";
      } else {
        var left = symG.vals();
        if (!left.length) info.innerHTML = "<h4>Belirti seçilmedi</h4><p>Gözlüğünüzde ne olduğunu yukarıdan seçin. Her seçim çizimde ilgili parçayı gösterir ve tamir fişine eklenir.</p>";
      }
      paint(); upd();
    }
    var upd = messenger(root, function () {
      var v = symG.vals();
      var gt = typeG.labels()[0], fr = frameG.labels()[0];
      var m = "Merhaba Kurtköy Optik, gözlüğüm için tamir sormak istiyorum.";
      if (gt || fr) m += "\nGözlük: " + [gt, fr].filter(Boolean).join(", ") + ".";
      if (v.length) m += "\nSorun:\n" + v.map(function (k) { return "• " + SYMS[k].t; }).join("\n");
      else m += "\nSorun: (henüz seçmedim)";
      m += noteLine(root);
      if (photoG.vals().length) m += "\nGözlüğün fotoğrafını bu mesajın ardından gönderiyorum.";
      m += "\nNe yapılabileceğini ve ne zaman uğrayabileceğimi öğrenebilir miyim?";
      m += nameLine(root);
      return m;
    });
    paint();
  });

  /* ---- Güneş gözlüğü: camdan bakın sahnesi ---- */
  var scene = $('[data-tool="camdan-bak"]');
  var sceneApi = null;
  if (scene) {
    var SC = { seffaf: "#6E6E6E", gri: "#4F5457", kahve: "#7E4416", yesil: "#3F6139", aynali: "#46525E" };
    var CAT = [
      { op: 0, wash: .42, t: "<b>Kategori 0:</b> ışığın yüzde 80 ile 100 arasını geçirir. Güneş gözlüğü sayılmaz; şeffaf ya da çok açık renkli camlar bu gruptadır." },
      { op: .26, wash: .22, t: "<b>Kategori 1:</b> ışığın yüzde 43 ile 80 arasını geçirir. Hafif güneşte ve bulutlu havada." },
      { op: .46, wash: .08, t: "<b>Kategori 2:</b> ışığın yüzde 18 ile 43 arasını geçirir. Orta şiddette güneş, şehir içi, günlük kullanım." },
      { op: .63, wash: 0, t: "<b>Kategori 3:</b> ışığın yüzde 8 ile 18 arasını geçirir. Parlak yaz güneşi, deniz ve kumsal." },
      { op: .79, wash: 0, t: "<b>Kategori 4:</b> ışığın yüzde 3 ile 8 arasını geçirir. Kar, buzul, yüksek dağ. <b>Araç kullanırken kullanılmaz.</b>" }
    ];
    var rng = $("[data-cat]", scene), pol = $("[data-pol]", scene);
    var tintRect = $(".sc-tint", scene), wash = $(".sc-wash", scene), glare = $$(".sc-glare", scene);
    var catOut = $("[data-cat-out]", scene), polOut = $("[data-pol-out]", scene), sum = $("[data-scene-sum]", scene), catVal = $("[data-cat-val]", scene);
    var polOn = false;
    function render() {
      var c = +rng.value, t = current;
      tintRect.setAttribute("fill", SC[t]);
      tintRect.setAttribute("opacity", CAT[c].op);
      wash.setAttribute("opacity", CAT[c].wash);
      glare.forEach(function (g) { g.setAttribute("opacity", polOn ? .1 : 1); });
      catOut.innerHTML = CAT[c].t;
      catVal.textContent = c;
      rng.setAttribute("aria-valuetext", "Kategori " + c);
      polOut.innerHTML = polOn
        ? "<b>Polarize açık:</b> sudan, yoldan ve ön camdan yansıyan yatay parlama büyük ölçüde kesilir."
        : "<b>Polarize kapalı:</b> sudaki ve yoldaki parlak yansımalar gözü kamaştırır.";
      pol.setAttribute("aria-pressed", String(polOn));
      sum.textContent = TINTS[t].name + " cam · kategori " + c + " · polarize " + (polOn ? "açık" : "kapalı");
    }
    rng.addEventListener("input", function () {
      if (+rng.value > 0 && current === "seffaf") setTint("gri", true);
      if (+rng.value === 0 && current !== "seffaf") setTint("seffaf", true);
      render();
    });
    pol.addEventListener("click", function () { polOn = !polOn; render(); });
    listeners.push(function (t) {
      if (t === "seffaf") rng.value = 0;
      else if (+rng.value === 0) rng.value = 2;
      render();
    });
    sceneApi = { set: function (t, c, p) { rng.value = c; polOn = p; setTint(t, true); render(); } };
    render();
  }

  /* ---- Güneş gözlüğü: ortama göre ---- */
  var ENV = {
    sehir: { n: "şehir içi", m: "şehir içinde", tint: "gri", cat: 2, pol: false, k: "Kategori 2 (çok güneşli günlerde 3)", r: "Gri, kahve ya da yeşil; üçü de uygun, tercih sizin.", p: "İsteğe bağlı. Vitrin ve araç camlarındaki yansımayı azaltır.", f: "Gün boyu takacağınız için hafif ve burnunuza iyi oturan bir çerçeve.", d: "" },
    arac: { n: "araç kullanırken", m: "araç kullanırken", tint: "kahve", cat: 2, pol: true, k: "Kategori 2 ya da 3", r: "Gri renkleri doğal gösterir; kahve yoldaki kontrastı artırır.", p: "Yoldan ve ön camdan gelen parlamayı azaltır. Bazı araç ekranları polarize camla koyu ya da renkli görünebilir; denerken bakın.", f: "Yan görüşü kapatmayan, ince saplı bir çerçeve.", d: "Kategori 4 cam araç kullanırken kullanılmaz. Gece sürüşünde güneş gözlüğü takmayın." },
    deniz: { n: "deniz ve havuz", m: "denizde ve havuzda", tint: "gri", cat: 3, pol: true, k: "Kategori 3", r: "Gri ya da kahve; aynalı kaplama parlak ışıkta ek rahatlık sağlar.", p: "Önerilir: su yüzeyindeki parlamayı belirgin biçimde azaltır.", f: "Yüzü saran, yanlardan ışık sızdırmayan; tuzlu sudan sonra tatlı suyla durulanabilecek bir model.", d: "Güneş gözlüğünü kumun üzerine camı aşağı gelecek şekilde koymayın." },
    kar: { n: "kar ve dağ", m: "karda ve dağda", tint: "aynali", cat: 3, pol: false, k: "Kategori 3; çok yüksek irtifada 4", r: "Aynalı kaplamalı gri ya da kahve.", p: "İsteğe bağlı. Kar yüzeyindeki parlamayı azaltır; bazı kayakçılar buzlu zemini ayırt etmek için polarizesiz tercih eder.", f: "Yanları kapalı, yüzü saran; gerekirse kayak gözlüğü.", d: "Kar ışığı çok güçlü yansıtır; gözlüksüz kalmayın. Kategori 4 araç kullanırken kullanılmaz." },
    spor: { n: "bisiklet ve koşu", m: "bisiklette ve koşuda", tint: "kahve", cat: 2, pol: false, k: "Kategori 2 ya da 3", r: "Kahve ya da turuncu tonlar yoldaki ayrıntıyı belirginleştirir.", p: "İsteğe bağlı.", f: "Yüzü saran, terde kaymayan burunluk ve sap uçları; darbeye dayanıklı cam malzemesi.", d: "" },
    bulut: { n: "bulutlu ve değişken hava", m: "bulutlu ve değişken havada", tint: "kahve", cat: 1, pol: false, k: "Kategori 1 ya da 2", r: "Kahve ya da açık tonlar.", p: "Genelde gerekmez.", f: "Numaralı gözlük kullanıyorsanız ışıkla koyulaşan (fotokromik) camları sorabilirsiniz.", d: "Fotokromik camlar araç içinde genellikle az koyulaşır; çünkü ön cam, koyulaşmayı tetikleyen UV ışığının çoğunu keser." }
  };
  $$('[data-tool="ortam"]').forEach(function (root) {
    var out = $("[data-env-out]", root), envNow = null;
    var g = chips($("[data-env]", root), false, function (b) { envNow = b.getAttribute("data-v"); show(); upd(); });
    var rx = chips($("[data-rx]", root), false, function () { upd(); });
    function show() {
      var e = ENV[envNow];
      out.innerHTML = "<h4>" + e.n.charAt(0).toUpperCase() + e.n.slice(1) + "</h4>" +
        "<dl class='env-dl'><dt>Filtre kategorisi</dt><dd>" + e.k + "</dd><dt>Cam rengi</dt><dd>" + e.r + "</dd><dt>Polarize</dt><dd>" + e.p + "</dd><dt>Çerçeve</dt><dd>" + e.f + "</dd></dl>" +
        (e.d ? "<p class='env-warn'><b>Dikkat:</b> " + e.d + "</p>" : "") +
        (sceneApi ? "<button type='button' class='btn btn--line btn--small' data-env-apply>Bu camla sahneye bakın</button>" : "");
      var ap = $("[data-env-apply]", out);
      if (ap) ap.addEventListener("click", function () {
        sceneApi.set(e.tint, e.cat, e.pol);
        var s = $('[data-tool="camdan-bak"]'); if (s) s.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    }
    var upd = messenger(root, function () {
      var e = envNow ? ENV[envNow] : null, r = rx.labels()[0];
      var m = "Merhaba Kurtköy Optik, güneş gözlüğü bakıyorum.";
      if (e) m += "\nEn çok " + e.m + " kullanacağım.";
      if (r) m += "\nCam: " + r.toLowerCase() + ".";
      m += "\nCam rengi tercihim: " + TINTS[current].name.toLowerCase() + (current === "seffaf" ? " (henüz karar vermedim)" : "") + ".";
      m += noteLine(root);
      m += "\nMağazada hangi seçenekler var, bilgi alabilir miyim?";
      m += nameLine(root);
      return m;
    });
    listeners.push(function () { upd(); });
  });

  /* ---- Numaralı gözlük: cam kalınlığı ---- */
  $$('[data-tool="kalinlik"]').forEach(function (root) {
    var P = $("[data-power]", root), pOut = $("[data-power-out]", root);
    var nG = chips($("[data-index]", root), false, function () { draw(); });
    var wG = chips($("[data-width]", root), false, function () { draw(); });
    var fG = chips($("[data-rim]", root), false, function () { draw(); });
    var shape = $(".lz-lens", root), rimL = $(".lz-rim-l", root), rimR = $(".lz-rim-r", root);
    var read = $("[data-thick-out]", root), tip = $("[data-thick-tip]", root), bars = $("[data-bars]", root);
    function fmt(x) { return x.toFixed(1).replace(".", ","); }
    function thick(p, n, h) {
      var s = h * h * Math.abs(p) / (2000 * (n - 1));
      if (p < 0) return { c: 1.6, e: 1.6 + s };
      if (p > 0) return { c: 1.0 + s, e: 1.0 };
      return { c: 2.0, e: 2.0 };
    }
    function draw() {
      var p = +P.value, n = +(nG.vals()[0] || 1.5), w = +(wG.vals()[0] || 52), rim = fG.vals()[0] || "kemik";
      var h = w / 2 + 2, t = thick(p, n, h);
      pOut.textContent = (p > 0 ? "+" : p < 0 ? "−" : "") + Math.abs(p).toFixed(2).replace(".", ",");
      P.setAttribute("aria-valuetext", pOut.textContent + " dioptri");
      // Kesit: yatay ölçek 260/h px/mm, kalınlık 9 px/mm
      var sx = 250 / 30, sy = 14, cx = 300, y0 = 52, pts = [], back = [];
      for (var i = 0; i <= 40; i++) {
        var x = -h + (2 * h) * i / 40;
        var front = y0 + (x * x) / (2 * 110) * 8;
        var th = p < 0 ? t.c + (t.e - t.c) * (x * x) / (h * h) : p > 0 ? t.c - (t.c - t.e) * (x * x) / (h * h) : t.c;
        pts.push((cx + x * sx).toFixed(1) + " " + front.toFixed(1));
        back.unshift((cx + x * sx).toFixed(1) + " " + (front + th * sy).toFixed(1));
      }
      shape.setAttribute("d", "M" + pts.join(" L") + " L" + back.join(" L") + " Z");
      var rd = rim === "kemik" ? 4.6 : 2.2, ey = y0 + (h * h) / (2 * 110) * 8, mid = ey + t.e * sy / 2;
      [rimL, rimR].forEach(function (r, k) {
        var x = k ? cx + h * sx - 4 : cx - h * sx - 14;
        r.setAttribute("x", x.toFixed(1)); r.setAttribute("y", (mid - rd * sy / 2).toFixed(1));
        r.setAttribute("height", (rd * sy).toFixed(1)); r.setAttribute("width", rim === "kemik" ? 18 : 10);
      });
      read.innerHTML = "<span>Orta: <b>≈ " + fmt(t.c) + " mm</b></span><span>Kenar: <b>≈ " + fmt(t.e) + " mm</b></span><span>Çerçeve kenarı: <b>≈ " + fmt(rd) + " mm</b></span>";
      var big = Math.max(t.c, t.e), tx;
      if (Math.abs(p) < 2) tx = "Düşük numarada camlar arasındaki kalınlık farkı azdır; indeks seçimi daha çok tercih meselesidir.";
      else if (p < 0) tx = "Eksi numarada kenarlar kalınlaşır. Daha küçük cam genişliği, yüksek indeks ve kalın kemik çerçeve kenarı daha az belli eder.";
      else tx = "Artı numarada camın ortası kalınlaşır ve cam öne doğru bombeleşir. Küçük ve yuvarlak çerçeveler camı inceltmeye yardım eder.";
      if (t.e > rd + .3 && p < 0) tx += " Bu ayarda cam kenarı çerçeveden taşar görünüyor.";
      tip.textContent = tx;
      var list = [1.5, 1.6, 1.67, 1.74], mx = 0, vals = list.map(function (nn) { var q = thick(p, nn, h); var v = Math.max(q.c, q.e); mx = Math.max(mx, v); return v; });
      bars.innerHTML = list.map(function (nn, k) {
        return "<div class='bar" + (nn === n ? " is-on" : "") + "'><span>" + String(nn).replace(".", ",") + (String(nn).length === 3 ? "0" : "") + "</span><i style='width:" + (vals[k] / Math.max(mx, 2) * 100).toFixed(0) + "%'></i><b>≈ " + fmt(vals[k]) + " mm</b></div>";
      }).join("");
    }
    P.addEventListener("input", draw);
    draw();
  });

  /* ---- Numaralı gözlük: cam bölgeleri ---- */
  var LT = {
    tek: { t: "Tek odaklı cam", d: "Camın tamamı tek bir mesafe için hazırlanır: uzak ya da yakın. Miyop, hipermetrop ve astigmatta en yaygın cam tipidir.", z: { uzak: "Bütün cam aynı odakta çalışır. Uzak için hazırlandıysa yakına bakarken ayrı bir okuma gözlüğü gerekebilir; bunu reçeteniz belirler." } },
    bi: { t: "İki odaklı (bifokal) cam", d: "Üstte uzak, altta küçük bir pencerede yakın bölge vardır. İki bölge arasındaki çizgi camda görünür; ara mesafe için ayrı bir bölge yoktur.", z: { uzak: "Camın büyük üst kısmı: yol, tabela, karşıdaki yüz.", yakin: "Alttaki küçük pencere: kitap, telefon, el işi.", cizgi: "Bölgeler arasındaki sınır. Bakışınız çizgiden geçerken görüntü bir anda değişir; buna alışmak gerekir." } },
    pro: { t: "İlerleyici (progresif) cam", d: "Üstten aşağı uzak, ara ve yakın bölgeler kesintisiz birbirine geçer; çizgi görünmez. Yanlarda net olmayan alanlar vardır. Alışma süresi kişiden kişiye değişir.", z: { uzak: "Üstteki geniş bölge: yol, televizyon, sokaktaki tabela.", ara: "Ortadaki dar koridor: bilgisayar ekranı, araçta gösterge paneli, mutfak tezgâhı.", yakin: "Alt bölge: kitap ve telefon. Okurken gözlerinizi aşağı indirirsiniz.", kenar: "Yanlardaki alanlar net değildir; bu, progresif camın tasarımından gelir. Yana bakarken başınızı biraz çevirin." } }
  };
  var ZN = { uzak: "Uzak", ara: "Ara mesafe", yakin: "Yakın", kenar: "Kenarlar", cizgi: "Sınır çizgisi" };
  $$('[data-tool="bolgeler"]').forEach(function (root) {
    var typ = "pro", zone = "uzak";
    var zWrap = $("[data-zones]", root), out = $("[data-zone-out]", root);
    var tg = chips($("[data-ltype]", root), false, function (b) { typ = b.getAttribute("data-v"); zone = "uzak"; build(); });
    function zn(z) { return typ === "tek" ? "Tüm cam" : ZN[z]; }
    function build() {
      root.setAttribute("data-lt", typ);
      var zs = Object.keys(LT[typ].z);
      zWrap.innerHTML = zs.map(function (z) { return "<button type='button' class='chip radio' data-v='" + z + "' aria-pressed='" + (z === zone) + "'>" + zn(z) + "</button>"; }).join("");
      chips(zWrap, false, function (b) { zone = b.getAttribute("data-v"); show(); });
      show();
    }
    function show() {
      $$("[data-zone]", root).forEach(function (el) { el.classList.toggle("on", el.getAttribute("data-zone") === zone); });
      out.innerHTML = "<h4>" + LT[typ].t + "</h4><p>" + LT[typ].d + "</p><p><b>" + zn(zone) + ":</b> " + LT[typ].z[zone] + "</p>";
    }
    build();
  });

  /* ---- Lens: lensli bir gün ---- */
  var ACT = {
    makyaj: { h: 8, l: "Makyaj", tip: "Lensi makyajdan önce takın; makyajı lensi çıkardıktan sonra temizleyin. Göz kalemini kirpik dibinin iç çizgisine sürmeyin.", bag: [] },
    ekran: { h: 10, l: "Ekran", tip: "Ekrana bakarken daha az göz kırparız. Ara ara uzağa bakın; kuruluk sürerse göz doktorunuza danışın.", bag: [] },
    yuzme: { h: 13, l: "Yüzme", tip: "Lensle havuza ya da denize girmeyin; su, lense mikroorganizma taşıyabilir. Suya girmeden önce lensi çıkarın ya da göz doktorunuza seçenekleri sorun.", bag: ["Lens kabı ve taze solüsyon"] },
    uyku: { h: 14.5, l: "Şekerleme", tip: "Göz doktorunuz özellikle önermediyse lensle uyumayın; kısa bir şekerleme de buna dahil.", bag: ["Lens kabı ve taze solüsyon", "Yedek gözlük"] },
    toz: { h: 15.5, l: "Rüzgâr", tip: "Tozlu ve rüzgârlı havada güneş gözlüğü gözünüzü korumaya yardım eder. Göze bir şey kaçarsa ovuşturmayın; lensi temiz elle çıkarın.", bag: ["Güneş gözlüğü"] },
    arac: { h: 17, l: "Araç", tip: "Lensin üstüne güneş gözlüğü takabilirsiniz. Lens tek başına göz çevresini güneşten korumaz.", bag: ["Güneş gözlüğü", "Yedek gözlük"] },
    spor: { h: 18.5, l: "Spor", tip: "Lens sporda geniş bir görüş alanı sağlar. Ter ve tozdan sonra gözünüzü ovuşturmayın; elleriniz temiz değilse lense dokunmayın.", bag: ["Lens kabı ve taze solüsyon"] },
    dus: { h: 20, l: "Duş", tip: "Duşta ve yüz yıkarken lense su değmemesine dikkat edin; mümkünse lensi önce çıkarın.", bag: [] },
    gece: { h: 22, l: "Geç saat", tip: "Uzun bir günün sonunda gözleriniz yorulduysa lensi çıkarıp gözlüğe geçin. Lensi önerilen kullanım süresinden uzun takmayın.", bag: ["Yedek gözlük"] }
  };
  $$('[data-tool="lensli-gun"]').forEach(function (root) {
    var marks = $("[data-marks]", root), tips = $("[data-day-tips]", root), bag = $("[data-bag]", root);
    var g = chips($("[data-acts]", root), true, function () { render(); });
    function pos(h) {
      var f = (h - 6) / 16, th = Math.PI * (1 - f);
      return { x: 300 + 260 * Math.cos(th), y: 200 - 160 * Math.sin(th) };
    }
    function render() {
      var v = g.vals();
      var vs = v.slice().sort(function (a, b) { return ACT[a].h - ACT[b].h; });
      marks.innerHTML = vs.map(function (k, i) {
        // Etiket yayın içine, merkeze doğru; komşular iki farklı mesafede
        var a = ACT[k], p = pos(a.h), ux = (p.x - 300) / 260, uy = (p.y - 200) / 160, d = i % 2 ? 66 : 34;
        var lx = -ux * d, ly = -uy * d + (uy > -0.3 ? -10 : 8);
        var anc = ux < -0.35 ? "start" : ux > 0.35 ? "end" : "middle";
        return "<g transform='translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")'><line x1='0' y1='0' x2='" + (lx * .7).toFixed(1) + "' y2='" + (ly * .7).toFixed(1) + "' class='mk-l'/><circle r='12' class='mk'/><text x='" + lx.toFixed(1) + "' y='" + (ly + 8).toFixed(1) + "' text-anchor='" + anc + "'>" + a.l + "</text></g>";
      }).join("");
      if (!v.length) {
        tips.innerHTML = "<li>Gününüzde neler olduğunu yukarıdan seçin; her seçim güneş yayına işlenir ve buraya bir hatırlatma ekler.</li>";
      } else {
        var sorted = v.slice().sort(function (a, b) { return ACT[a].h - ACT[b].h; });
        tips.innerHTML = sorted.map(function (k) { return "<li><b>" + ACT[k].l + ":</b> " + ACT[k].tip + "</li>"; }).join("");
      }
      var B = ["Lens kabı ve taze solüsyon", "Yedek gözlük"];
      v.forEach(function (k) { ACT[k].bag.forEach(function (x) { if (B.indexOf(x) < 0) B.push(x); }); });
      bag.innerHTML = B.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    }
    render();
  });

  /* ---- Lens: yenileme mesajı ---- */
  $$('[data-tool="lens-siparis"]').forEach(function (root) {
    var tG = chips($("[data-ltype2]", root), false, function () { upd(); });
    var eG = chips($("[data-eyes]", root), false, function () { upd(); });
    var xG = chips($("[data-extra]", root), true, function () { upd(); });
    var phG = chips($("[data-photo]", root), true, function () { upd(); });
    var upd = messenger(root, function () {
      var t = tG.labels()[0], e = eG.labels()[0], x = xG.labels();
      var m = "Merhaba Kurtköy Optik, kontakt lens için bilgi almak istiyorum.";
      if (t) m += "\nLens türü: " + t.toLowerCase() + ".";
      if (e) m += "\n" + e + ".";
      if (x.length) m += "\nAyrıca: " + x.join(", ").toLowerCase() + ".";
      m += noteLine(root);
      if (phG.vals().length) m += "\nLens kutumun ve reçetemin fotoğrafını bu mesajın ardından gönderiyorum.";
      m += "\nMağazada var mı, ne zaman alabilirim?";
      m += nameLine(root);
      return m;
    });
  });

  /* ---- İletişim: mesaj hazırla ---- */
  $$('[data-tool="mesaj"]').forEach(function (root) {
    var sG = chips($("[data-subj]", root), true, function () { upd(); });
    var wG = chips($("[data-when]", root), false, function () { hint(); upd(); });
    var hEl = $("[data-when-hint]", root);
    function hint() {
      var w = wG.vals()[0];
      if (w === "bugun" && !ST.open) hEl.textContent = "Not: " + ST.text.replace("Şu an kapalı", "şu an kapalıyız") + ".";
      else if (w === "bugun" && ST.open) hEl.textContent = "Bugün " + ST.closesAt + "'a kadar açığız.";
      else hEl.textContent = "";
    }
    var upd = messenger(root, function () {
      var s = sG.labels(), w = wG.labels()[0];
      var m = "Merhaba Kurtköy Optik,";
      m += s.length ? "\nŞu konuda bilgi almak istiyorum: " + s.join(", ").toLowerCase() + "." : "\nBilgi almak istiyorum.";
      if (w) m += "\nMağazaya gelmeyi düşündüğüm zaman: " + w.toLowerCase() + ".";
      m += noteLine(root);
      m += nameLine(root);
      return m;
    });
  });

  /* ---- Adres kopyalama ---- */
  $$("[data-copy-addr]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-addr"), $("[data-addr-ok]"), "Adres kopyalandı."); });
  });
})();
