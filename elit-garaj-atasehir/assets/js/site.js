/* Elit Garaj Detailing · site betiği (kütüphanesiz) */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");

  var WA = "https://wa.me/905426967536";
  var HOURS = { "0": [["09:00", "21:00"]], "1": [["09:00", "21:00"]], "2": [["09:00", "21:00"]], "3": [["09:00", "21:00"]], "4": [["09:00", "21:00"]], "5": [["09:00", "21:00"]], "6": [["09:00", "21:00"]] };
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---- Açık/kapalı durumu (kit/status.js'ten kopya) ---- */
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

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var live = el.closest(".live");
      if (live) { live.classList.toggle("is-open", s.open); live.classList.toggle("is-closed", !s.open); }
    });
    $$("[data-hours] tr[data-day]").forEach(function (tr) {
      tr.classList.toggle("is-today", parseInt(tr.getAttribute("data-day"), 10) === s.dayIndex);
    });
    var sign = $("[data-sign]");
    if (sign) {
      sign.classList.toggle("is-open", s.open);
      sign.classList.toggle("is-closed", !s.open);
      var w = $("[data-sign-word]", sign);
      if (w) w.textContent = s.open ? "Açık" : "Kapalı";
    }
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- Kopyalama yardımcısı ---- */
  function copyText(text, out, okMsg) {
    function fallback() {
      try {
        var ta = d.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
        d.body.appendChild(ta); ta.select();
        var ok = d.execCommand("copy"); d.body.removeChild(ta); return ok;
      } catch (e) { return false; }
    }
    function done(ok) {
      if (!out) return;
      out.textContent = ok ? okMsg : "Kopyalanamadı; metni seçip elle kopyalayın.";
      clearTimeout(out._t); out._t = setTimeout(function () { out.textContent = ""; }, 4500);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback()); });
    } else { done(fallback()); }
  }

  /* ---- Menü ---- */
  var navBtn = $(".nav-btn"), nav = $("#nav");
  if (navBtn && nav) {
    navBtn.addEventListener("click", function () {
      var open = navBtn.getAttribute("aria-expanded") !== "true";
      navBtn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { navBtn.click(); navBtn.focus(); }
    });
  }

  /* ---- Sahne ışıkları + krom çizgiler ---- */
  $$(".stage, .phero").forEach(function (s) {
    if (reduce) { s.classList.add("lit"); return; }
    requestAnimationFrame(function () { setTimeout(function () { s.classList.add("lit"); }, 80); });
  });
  var rules = $$(".rule");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("lit"); io.unobserve(e.target); } });
    }, { threshold: 0 });
    rules.forEach(function (r) { io.observe(r); });
  }

  /* ---- İmza: parlaklık bandını parmak/imleçle sürme ---- */
  var sw = $("[data-sweep]");
  if (sw && !reduce) {
    var svg = $("svg", sw), band = $(".sweep", sw), leaveT;
    var moveBand = function (clientX) {
      var b = svg.getBoundingClientRect();
      if (!b.width) return;
      var x = (clientX - b.left) / b.width * 1000;
      clearTimeout(leaveT);
      svg.classList.add("manual");
      band.style.transform = "translateX(" + (x + 175).toFixed(1) + "px)";
    };
    var release = function (delay) {
      clearTimeout(leaveT);
      leaveT = setTimeout(function () { svg.classList.remove("manual"); band.style.transform = ""; }, delay);
    };
    sw.addEventListener("pointermove", function (e) { moveBand(e.clientX); });
    sw.addEventListener("pointerdown", function (e) { moveBand(e.clientX); });
    sw.addEventListener("pointerleave", function () { release(0); });
    sw.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") release(1200); });
    sw.addEventListener("pointercancel", function () { release(600); });
  }

  /* ---- Paketler: karşılaştırma, üstten görünüş, bulucu ---- */
  var PK = [
    { key: "temel", name: "Temel Yıkama", desc: "düzenli bakım için iç dış yıkama.", z: ["wash", "wheels", "glass", "int"] },
    { key: "detay", name: "Detaylı İç-Dış", desc: "iç dış yıkamaya ek olarak koltuk, döşeme, tavan ve ızgaralar.", z: ["wash", "wheels", "glass", "int", "deep"] },
    { key: "pasta", name: "Pasta Cila", desc: "detaylı temizliğe ek olarak boya düzeltme ve parlatma.", z: ["wash", "wheels", "glass", "int", "deep", "paint"] },
    { key: "seramik", name: "Seramik Koruma", desc: "pasta ve parlatmanın üzerine koruma katmanı.", z: ["wash", "wheels", "glass", "int", "deep", "paint", "coat"] }
  ];
  var cmp = $(".cmp"), picks = [0, 1], extraMotor = false;
  function applyPicks() {
    if (!cmp) return;
    cmp.classList.add("js-cmp");
    $$(".cmp-table [data-col]").forEach(function (c) { c.classList.toggle("off", picks.indexOf(parseInt(c.getAttribute("data-col"), 10)) < 0); });
    $$("[data-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(picks.indexOf(parseInt(b.getAttribute("data-pick"), 10)) > -1)); });
  }
  function selectPk(i) {
    $$("[data-select]").forEach(function (b) { b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-select"), 10) === i)); });
    $$(".cmp-table [data-col]").forEach(function (c) { c.classList.toggle("sel", parseInt(c.getAttribute("data-col"), 10) === i); });
    if (cmp && picks.indexOf(i) < 0) { picks = [picks[1], i]; applyPicks(); }
    var tv = $("[data-topview]");
    if (tv) {
      var on = PK[i].z.slice(); if (extraMotor) on.push("engine");
      $$("[data-z]", tv).forEach(function (el) { el.classList.toggle("on", on.indexOf(el.getAttribute("data-z")) > -1); });
      $("[data-tv-name]", tv).textContent = PK[i].name;
      $("[data-tv-desc]", tv).textContent = PK[i].desc;
    }
  }
  if (cmp || $("[data-topview]")) {
    applyPicks();
    $$("[data-pick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-pick"), 10);
        if (picks.indexOf(i) > -1) return;
        picks = [picks[1], i]; applyPicks();
      });
    });
    $$("[data-select]").forEach(function (b) {
      b.addEventListener("click", function () { selectPk(parseInt(b.getAttribute("data-select"), 10)); });
    });
    selectPk(0);
  }

  var finder = $(".finder");
  if (finder) {
    var WHY = [
      "İç ve dış yüzey için düzenli bakım yeterli görünüyor.",
      "İçerideki leke, tüy ya da koku için detaylı iç temizlik öne çıkıyor.",
      "Boyadaki ince çizik ve matlık için pasta ve parlatma gerekiyor olabilir.",
      "Koruma katmanı, yüzey temizlenip gerekiyorsa düzeltildikten sonra uygulanır; bu yüzden seramik paketi pasta adımlarını da içerir."
    ];
    var evalFinder = function () {
      var v = function (n) { var r = finder.querySelector("input[name='" + n + "']:checked"); return r ? parseInt(r.value, 10) : 0; };
      var ic = v("ic"), boya = v("boya"), koruma = v("koruma"), motor = v("motor");
      var i = koruma ? 3 : boya ? 2 : ic ? 1 : 0;
      extraMotor = !!motor;
      $("[data-finder-name]", finder).textContent = PK[i].name + (motor ? " + motor temizliği" : "");
      $("[data-finder-why]", finder).textContent = WHY[i] + (ic && i >= 2 ? " İçerideki leke ve tüy de bu örnek pakette ele alınır." : "") + (motor ? " Motor temizliği ek işlem olarak eklenir." : "");
      $("[data-finder-link]", finder).setAttribute("href", "teklif.html?paket=" + PK[i].key + (motor ? "&ek=motor" : ""));
      selectPk(i);
    };
    finder.addEventListener("change", evalFinder);
  }

  /* ---- Sekme yardımcısı (boya kesiti, süreç bölümleri) ---- */
  function tabs(list, onSelect) {
    var t = $$("[role='tab']", list);
    function sel(tab, focus) {
      t.forEach(function (x) {
        var on = x === tab;
        x.setAttribute("aria-selected", String(on));
        x.tabIndex = on ? 0 : -1;
        var p = d.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      onSelect(tab);
    }
    t.forEach(function (x, idx) {
      x.addEventListener("click", function () { sel(x); });
      x.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        sel(t[(idx + (e.key === "ArrowRight" ? 1 : -1) + t.length) % t.length], true);
      });
    });
    return { select: sel, tabs: t };
  }

  var kt = $("[data-kesit-tabs]");
  if (kt) {
    var fig = $("[data-kesit]");
    var kTabs = tabs(kt, function (tab) { fig.setAttribute("data-kesit", tab.getAttribute("data-layer")); });
    kTabs.select(kTabs.tabs[0]);
  }

  /* ---- Süreç: araç haritası ---- */
  var ex = $(".explorer");
  if (ex) {
    var car = $(".ex-car", ex), fill = $(".ex-visual .meter-fill", ex), mt = $("[data-meter-text]", ex);
    var prev = $("[data-ex-prev]", ex), next = $("[data-ex-next]", ex);
    var ORDER = ["dis", "ic", "motor"], NAMES = { dis: "Dış yüzey", ic: "İç mekân", motor: "Motor bölmesi" };
    var cur = { set: "dis", idx: 0 };
    var exTabs;
    var itemsOf = function (set) { return $$(".ex-steps li", d.getElementById("set-" + set)); };
    var setStep = function (set, idx) {
      var items = itemsOf(set);
      idx = Math.max(0, Math.min(items.length - 1, idx));
      cur.set = set; cur.idx = idx;
      items.forEach(function (li, k) {
        li.classList.toggle("active", k === idx);
        li.classList.toggle("done", k < idx);
        $(".ex-step", li).setAttribute("aria-expanded", String(k === idx));
      });
      var zones = (items[idx].getAttribute("data-zone") || "").split(" ");
      $$(".zz", car).forEach(function (z) { z.classList.toggle("on", zones.indexOf(z.getAttribute("data-zone")) > -1); });
      var p = (idx + 1) / items.length;
      fill.style.setProperty("--p", Math.round(p * 100) + "%");
      car.style.setProperty("--shine", (set === "dis" ? p : p * 0.45).toFixed(2));
      mt.textContent = NAMES[set] + " · adım " + (idx + 1) + " / " + items.length + ": " + $(".ex-step span:last-child", items[idx]).textContent;
      prev.disabled = set === ORDER[0] && idx === 0;
      next.disabled = set === ORDER[ORDER.length - 1] && idx === items.length - 1;
      next.textContent = idx === items.length - 1 && !next.disabled ? "Sonraki bölüm" : "Sonraki adım";
    };
    exTabs = tabs($(".seg--ex", ex), function (tab) {
      var set = tab.getAttribute("data-set");
      if (set !== cur.set || !ex._init) setStep(set, set === cur.set ? cur.idx : 0);
    });
    $$(".ex-step", ex).forEach(function (b) {
      b.addEventListener("click", function () {
        var li = b.closest("li"), panel = b.closest(".ex-set");
        setStep(panel.id.slice(4), itemsOf(panel.id.slice(4)).indexOf(li));
      });
    });
    var goSet = function (set, idx) {
      var tab = exTabs.tabs.filter(function (t) { return t.getAttribute("data-set") === set; })[0];
      cur.set = set; cur.idx = idx;
      exTabs.select(tab);
      setStep(set, idx);
    };
    prev.addEventListener("click", function () {
      if (cur.idx > 0) return setStep(cur.set, cur.idx - 1);
      var si = ORDER.indexOf(cur.set);
      if (si > 0) goSet(ORDER[si - 1], itemsOf(ORDER[si - 1]).length - 1);
    });
    next.addEventListener("click", function () {
      var n = itemsOf(cur.set).length;
      if (cur.idx < n - 1) return setStep(cur.set, cur.idx + 1);
      var si = ORDER.indexOf(cur.set);
      if (si < ORDER.length - 1) goSet(ORDER[si + 1], 0);
    });
    exTabs.select(exTabs.tabs[0]);
    ex._init = true;
    setStep("dis", 0);
  }

  /* ---- Bırakma öncesi kontrol listesi ---- */
  var cl = $(".checklist");
  if (cl) {
    var boxes = $$("input[type='checkbox']", cl), cnt = $("[data-ck-count]", cl), cf = $(".meter-fill", cl), KEY = "elitgaraj-birakma";
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; });
    } catch (e) { /* depolama kapalı olabilir */ }
    var upd = function () {
      var on = [];
      boxes.forEach(function (b, i) { if (b.checked) on.push(i); });
      cnt.textContent = on.length;
      cf.style.setProperty("--p", Math.round(on.length / boxes.length * 100) + "%");
      try { localStorage.setItem(KEY, JSON.stringify(on)); } catch (e) { /* yok say */ }
    };
    cl.addEventListener("change", upd);
    $("[data-ck-reset]", cl).addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  /* ---- İmza: aracım için teklif al ---- */
  var q = $("form.quote");
  if (q) {
    var TIP = { hatchback: "Hatchback", sedan: "Sedan", suv: "SUV / Crossover", station: "Station wagon", ticari: "Minivan / Ticari", pikap: "Pikap" };
    var ISL = { icdis: "İç dış yıkama", ic: "Detaylı iç temizlik", koltuk: "Koltuk yıkama", motor: "Motor temizliği", pasta: "Pasta cila", seramik: "Seramik koruma", koku: "Koku giderme", far: "Far temizliği" };
    var PKN = { temel: "Temel Yıkama", detay: "Detaylı İç-Dış", pasta: "Pasta Cila", seramik: "Seramik Koruma" };
    var PKI = { temel: ["icdis"], detay: ["icdis", "ic"], pasta: ["icdis", "ic", "pasta"], seramik: ["icdis", "ic", "pasta", "seramik"] };
    var EXTRA = ["koltuk", "motor", "koku", "far"];
    var waBtn = $("[data-q-wa]", q), msgEl = $("[data-q-msg]", q), warn = $("[data-q-warn]", q), badge = $("[data-q-badge]", q);
    var carBox = $("[data-q-car]", q), dateWrap = $("[data-date-wrap]", q), lastMsg = "";
    var val = function (n) { var r = q.querySelector("input[name='" + n + "']:checked"); return r ? r.value : ""; };
    var vals = function (n) { return $$("input[name='" + n + "']:checked", q).map(function (i) { return i.value; }); };
    var trDate = function (s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? m[3] + "." + m[2] + "." + m[1] : ""; };
    var setQ = function (k, t) { var el = $("[data-q='" + k + "']", q); if (el) el.textContent = t; };

    var build = function () {
      var tip = val("tip"), pk = val("paket"), isl = vals("islem"), dur = vals("durum"), gun = val("gun"), saat = val("saat");
      var tarih = trDate(q.elements.tarih.value), model = q.elements.model.value.trim(), ad = q.elements.ad.value.trim(), note = q.elements.not.value.trim();
      dateWrap.classList.toggle("show", gun === "tarih");
      var gunTxt = gun === "tarih" ? (tarih ? tarih + " tarihinde" : "Belirli bir tarih (mesajda yazacağım)") : gun;
      var zaman = gunTxt + (saat && saat !== "Fark etmez" ? ", " + saat : ", saat fark etmez");
      var islTxt = isl.map(function (k) { return ISL[k]; }).join(", ");
      var L = ["Merhaba Elit Garaj, aracım için teklif almak istiyorum.", ""];
      L.push("Araç tipi: " + (TIP[tip] || "seçilmedi"));
      if (model) L.push("Marka/model: " + model);
      if (pk) L.push("Paket: " + PKN[pk] + " (sitedeki örnek paket)");
      L.push("İşlemler: " + (islTxt || "seçilmedi"));
      if (dur.length) L.push("Aracın durumu: " + dur.join(", "));
      L.push("Zaman tercihi: " + zaman);
      if (note) L.push("Not: " + note);
      if (ad) L.push("Adım: " + ad);
      L.push("");
      L.push("Fiyat ve uygun saat bilgisi rica ederim. Teşekkürler.");
      var msg = L.join("\n");
      lastMsg = msg;
      msgEl.textContent = msg;
      var ok = !!tip && isl.length > 0;
      waBtn.setAttribute("href", WA + "?text=" + encodeURIComponent(msg));
      waBtn.setAttribute("aria-disabled", String(!ok));
      warn.hidden = ok;
      badge.textContent = ok ? "Gönderime hazır" : "Taslak";
      badge.classList.toggle("ready", ok);
      setQ("tip", TIP[tip] || "Seçilmedi");
      setQ("paket", pk ? PKN[pk] : "Yok");
      setQ("islem", islTxt || "Seçilmedi");
      setQ("durum", dur.length ? dur.join(", ") : "Belirtilmedi");
      setQ("zaman", zaman);
      $$(".vt", q).forEach(function (l) { l.classList.toggle("is-on", $("input", l).checked); });
      if (tip && carBox.getAttribute("data-tip") !== tip) {
        carBox.setAttribute("data-tip", tip);
        var src = $(".vt input[value='" + tip + "']", q).parentNode.querySelector("svg");
        carBox.innerHTML = "";
        carBox.appendChild(src.cloneNode(true));
        carBox.classList.remove("swept"); void carBox.offsetWidth; carBox.classList.add("swept");
      }
      return ok;
    };

    q.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "paket" && t.value && PKI[t.value]) {
        $$("input[name='islem']", q).forEach(function (i) {
          i.checked = PKI[t.value].indexOf(i.value) > -1 || (i.checked && EXTRA.indexOf(i.value) > -1);
        });
      }
      build();
    });
    q.addEventListener("input", build);
    waBtn.addEventListener("click", function (e) {
      if (build()) return;
      e.preventDefault();
      var target = !val("tip") ? $("#q-tip") : $("#q-islem");
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      var f = $("input", target); if (f) { try { f.focus({ preventScroll: true }); } catch (er) { f.focus(); } }
      warn.classList.remove("shake"); void warn.offsetWidth; warn.classList.add("shake");
    });
    $("[data-q-copy]", q).addEventListener("click", function () {
      build();
      copyText(lastMsg, $("[data-q-copied]", q), "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz.");
    });

    /* Bağlantıdan gelen ön seçimler: ?tip= &paket= &islem= &ek= */
    var sp;
    try { sp = new URLSearchParams(location.search); } catch (e) { sp = { get: function () { return null; } }; }
    var tp = sp.get("tip");
    if (tp && TIP[tp]) { var rt = $(".vt input[value='" + tp + "']", q); if (rt) rt.checked = true; }
    var pp = sp.get("paket");
    if (pp && PKI[pp]) {
      var rp = $("input[name='paket'][value='" + pp + "']", q); if (rp) rp.checked = true;
      PKI[pp].forEach(function (k) { var c = $("input[name='islem'][value='" + k + "']", q); if (c) c.checked = true; });
    }
    ((sp.get("islem") || "") + "," + (sp.get("ek") || "")).split(",").forEach(function (k) {
      if (ISL[k]) { var c = $("input[name='islem'][value='" + k + "']", q); if (c) c.checked = true; }
    });
    build();
  }

  /* ---- İletişim: adres kopyalama ---- */
  var ca = $("[data-copy-addr]");
  if (ca) {
    ca.addEventListener("click", function () {
      copyText($("[data-addr]").textContent.trim(), $("[data-addr-copied]"), "Adres kopyalandı.");
    });
  }
})();
