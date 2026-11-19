/* Vie Fit Pilates Studio — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var WA = "https://wa.me/905332038651";
  var HOURS = { "0": [["09:00", "21:00"]], "1": [["09:00", "21:00"]], "2": [["09:00", "21:00"]], "3": [["09:00", "21:00"]], "4": [["09:00", "21:00"]], "5": [["09:00", "15:00"]] };

  /* ---- açık/kapalı durumu (kit/status.js'ten kopya) ---- */
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

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem("viefit:" + key) || "null");
      localStorage.setItem("viefit:" + key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  /* ---- canlı durum + bugün ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", +el.getAttribute("data-day") === s.dayIndex); });
    $$(".week-row").forEach(function (row) {
      var now = $(".week-now", row); if (!now) return;
      var isToday = +row.getAttribute("data-day") === s.dayIndex;
      var lo = 8 * 60, hi = 22 * 60;
      if (isToday && s.minutes >= lo && s.minutes <= hi) {
        now.style.left = ((s.minutes - lo) / (hi - lo) * 100).toFixed(2) + "%";
        now.style.display = "block";
        now.title = "Şu an";
      } else { now.style.display = "none"; }
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- telefon menüsü ---- */
  var menuBtn = $(".menu-btn"), nav = $("#site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      $(".menu-label", menuBtn).textContent = open ? "Kapat" : "Menü";
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960) setMenu(false); });
  }

  /* ---- nefes rehberi (imza araç) ---- */
  var RHY = {
    esit: [["in", 4], ["out", 4]],
    uzun: [["in", 4], ["out", 6]],
    kutu: [["in", 4], ["hold", 4], ["out", 4], ["rest", 4]]
  };
  var WORD = { in: "Nefes al", out: "Nefes ver", hold: "Tut", rest: "Bekle" };
  var DESC = { esit: "4 sn al, 4 sn ver", uzun: "4 sn al, 6 sn yavaşça ver", kutu: "kutu nefesi: 4 al, 4 tut, 4 ver, 4 bekle" };
  var MIN = 0.64, MAX = 1;

  $$("[data-breath]").forEach(function (root) {
    var body = $(".breath-body", root), prog = $(".ring-progress", root), cnt = $(".breath-count", root),
      hold = $(".w-hold", root), status = $("[data-breath-status]", root), live = $("[data-breath-live]", root),
      startBtn = $("[data-breath-start]", root), stopBtn = $("[data-breath-stop]", root), done = $("[data-breath-done]", root),
      vib = $("[data-breath-vib]", root);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var st = null, raf = 0;
    if (vib && "vibrate" in navigator) vib.hidden = false;

    function cfg() {
      var r = ($("input[name=ritim]:checked", root) || {}).value || "esit";
      var d = +(($("input[name=sure]:checked", root) || {}).value || 3);
      var ph = RHY[r] || RHY.esit, cyc = 0;
      ph.forEach(function (p) { cyc += p[1]; });
      var cycles = Math.max(1, Math.round(d * 60 / cyc));
      return { ph: ph, cyc: cyc, cycles: cycles, total: cycles * cyc, mins: d };
    }
    function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ":" + (s < 10 ? "0" : "") + s; }
    function ease(p) { return 0.5 - 0.5 * Math.cos(Math.PI * p); }

    function frame() {
      if (!st || st.paused) return;
      var t = (performance.now() - st.t0) / 1000;
      if (t >= st.c.total) { finish(true); return; }
      var tc = t % st.c.cyc, acc = 0, ph = st.c.ph[0], p = 0, i;
      for (i = 0; i < st.c.ph.length; i++) {
        var len = st.c.ph[i][1];
        if (tc < acc + len) { ph = st.c.ph[i]; p = (tc - acc) / len; break; }
        acc += len;
      }
      var name = ph[0], sc = MIN, off = 100;
      if (name === "in") { sc = MIN + (MAX - MIN) * ease(p); off = 100 * (1 - p); }
      else if (name === "out") { sc = MAX - (MAX - MIN) * ease(p); off = 100 * p; }
      else if (name === "hold") { sc = MAX; off = 0; }
      else { sc = MIN; off = 100; }
      if (!reduce) body.style.transform = "scale(" + sc.toFixed(4) + ")";
      prog.style.strokeDashoffset = off.toFixed(2);
      cnt.textContent = String(Math.max(1, Math.ceil(ph[1] - (tc - acc))));
      if (root.getAttribute("data-phase") !== name) {
        root.setAttribute("data-phase", name);
        if (name === "hold" || name === "rest") hold.textContent = WORD[name];
        if (live) live.textContent = WORD[name];
        if (vib && $("input", vib) && $("input", vib).checked && navigator.vibrate) { try { navigator.vibrate(name === "in" ? 40 : [20, 60, 20]); } catch (e) { } }
      }
      var round = Math.min(st.c.cycles, Math.floor(t / st.c.cyc) + 1);
      status.textContent = "Tur " + round + " / " + st.c.cycles + " · Kalan " + fmt(st.c.total - t);
      raf = requestAnimationFrame(frame);
    }
    function begin() {
      var c = cfg();
      st = { c: c, t0: performance.now(), paused: false, el: 0 };
      if (done) done.hidden = true;
      root.classList.add("is-guided"); root.classList.remove("is-paused");
      root.removeAttribute("data-phase");
      startBtn.textContent = "Duraklat";
      stopBtn.hidden = false;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    }
    function pause() {
      if (!st || st.paused) return;
      st.paused = true; st.el = performance.now() - st.t0;
      cancelAnimationFrame(raf);
      root.classList.add("is-paused");
      startBtn.textContent = "Devam et";
      status.textContent = "Duraklatıldı · " + status.textContent.replace(/^Duraklatıldı · /, "");
    }
    function resume() {
      if (!st || !st.paused) return;
      st.paused = false; st.t0 = performance.now() - st.el;
      root.classList.remove("is-paused");
      startBtn.textContent = "Duraklat";
      raf = requestAnimationFrame(frame);
    }
    function finish(completed) {
      cancelAnimationFrame(raf);
      var c = st ? st.c : null;
      st = null;
      root.classList.remove("is-guided", "is-paused");
      root.removeAttribute("data-phase");
      body.style.transform = "";
      prog.style.strokeDashoffset = "100";
      startBtn.textContent = "Rehberle başla";
      stopBtn.hidden = true;
      if (completed && c && done) {
        done.hidden = false;
        $("[data-done-text]", done).textContent = c.cycles + " tur, yaklaşık " + c.mins + " dakikalık nefes molanızı tamamladınız.";
        status.textContent = "Tamamlandı. İsterseniz yeniden başlayın.";
        if (live) live.textContent = "Nefes molası tamamlandı.";
      } else {
        status.textContent = "Hazır olduğunuzda başlayın.";
      }
    }
    startBtn.addEventListener("click", function () {
      if (!st) begin(); else if (st.paused) resume(); else pause();
    });
    stopBtn.addEventListener("click", function () { finish(false); });
    $$("input[name=ritim], input[name=sure]", root).forEach(function (i) {
      i.addEventListener("change", function () {
        if (st) begin();
        else {
          var c = cfg();
          var rk = ($("input[name=ritim]:checked", root) || {}).value || "esit";
          status.textContent = "Seçiminiz: " + DESC[rk] + " · " + c.cycles + " tur, yaklaşık " + c.mins + " dk.";
        }
      });
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); });
  });

  /* ---- WhatsApp mesajı kuran formlar ---- */
  function checked(form, name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
  function one(form, name) { var c = $('input[name="' + name + '"]:checked', form); return c ? c.value : ""; }
  function text(form, name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim().replace(/\s+/g, " ") : ""; }
  function listTr(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " ve " + a[a.length - 1]; }
  function lowerRest(a) { return a.map(function (x, i) { return i ? x.charAt(0).toLocaleLowerCase("tr-TR") + x.slice(1) : x; }); }

  var BUILD = {
    deneme: function (f) {
      var L = ["Merhaba Vie Fit Pilates Studio,", "deneme dersi için bilgi almak ve uygun bir gün belirlemek istiyorum.", ""];
      var ders = one(f, "ders"), den = one(f, "deneyim"), gun = checked(f, "gun"), saat = one(f, "saat"), kim = one(f, "kisi"), dur = checked(f, "durum");
      if (ders) L.push("• İlgilendiğim ders: " + ders);
      if (den) L.push("• Pilates deneyimim: " + den);
      if (gun.length) L.push("• Uygun günlerim: " + listTr(gun));
      if (saat) L.push("• Uygun saat aralığım: " + saat);
      if (kim) L.push("• " + kim);
      var d2 = dur.filter(function (x) { return x !== "Yok"; });
      if (d2.length) L.push("• Bilmenizi istediğim durum: " + listTr(lowerRest(d2)));
      if ($('input[name="diyet"]', f) && $('input[name="diyet"]', f).checked) L.push("• Diyetisyen ön görüşmesiyle de ilgileniyorum.");
      var not = text(f, "not"); if (not) L.push("• Not: " + not);
      L.push("");
      var ad = text(f, "ad"); if (ad) L.push("Adım: " + ad);
      L.push("Ders programı ve ücret bilgisini de paylaşabilirseniz sevinirim. Teşekkürler.");
      // Cumartesi uyarısı
      var warn = $("[data-sat-warn]", f);
      if (warn) warn.hidden = !(gun.length && gun.every(function (g) { return g === "Cumartesi"; }) && /İkindi|Akşam/.test(saat));
      var hw = $("[data-health-warn]", f);
      if (hw) hw.hidden = !d2.length;
      return L.join("\n");
    },
    diyet: function (f) {
      var L = ["Merhaba Vie Fit,", "diyetisyen ön görüşmesi için bilgi almak istiyorum.", ""];
      var konu = checked(f, "konu"), gun = checked(f, "gun"), saat = one(f, "saat"), sag = one(f, "saglik");
      if (konu.length) L.push("• Konuşmak istediğim " + (konu.length > 1 ? "konular: " : "konu: ") + listTr(lowerRest(konu)));
      if (gun.length) L.push("• Uygun günlerim: " + listTr(gun));
      if (saat) L.push("• Uygun saat aralığım: " + saat);
      if (sag) L.push("• Sağlık durumu: " + sag);
      if ($('input[name="pilates"]', f) && $('input[name="pilates"]', f).checked) L.push("• Pilates dersleriyle de ilgileniyorum.");
      var not = text(f, "not"); if (not) L.push("• Not: " + not);
      L.push("");
      var ad = text(f, "ad"); if (ad) L.push("Adım: " + ad);
      L.push("Görüşme düzeni ve ücret hakkında bilgi verebilir misiniz? Teşekkürler.");
      return L.join("\n");
    },
    hizli: function (f) {
      var q = checked(f, "soru");
      var L = ["Merhaba Vie Fit Pilates Studio,"];
      if (!q.length) L.push("bilgi almak istiyorum.");
      else { L.push(""); q.forEach(function (x) { L.push("• " + x); }); }
      var ad = text(f, "ad"); if (ad) { L.push(""); L.push("Adım: " + ad); }
      L.push("Teşekkürler.");
      return L.join("\n");
    }
  };

  function copyText(s, done) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = s; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(s).then(function () { done(true); }, fallback);
    else fallback();
  }

  $$("[data-wa-form]").forEach(function (f) {
    var kind = f.getAttribute("data-wa-form"), tool = f.closest("[data-tool]") || document;
    var bubble = $("[data-msg]", tool), link = $("[data-wa-link]", tool), copy = $("[data-copy]", tool), ok = $("[data-copy-ok]", tool);
    function upd() {
      var msg = BUILD[kind](f);
      if (bubble) bubble.textContent = msg;
      if (link) link.href = WA + "?text=" + encodeURIComponent(msg);
      return msg;
    }
    f.addEventListener("input", upd);
    f.addEventListener("change", upd);
    f.addEventListener("submit", function (e) { e.preventDefault(); upd(); if (link) window.open(link.href, "_blank", "noopener"); });
    if (copy) copy.addEventListener("click", function () {
      copyText(upd(), function (r) {
        if (ok) { ok.textContent = r ? "Mesaj kopyalandı; WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; mesajı elle seçip kopyalayın."; }
      });
    });
    // "Yok" seçilince diğer durumları kaldır
    var none = $('input[name="durum"][value="Yok"]', f);
    if (none) {
      $$('input[name="durum"]', f).forEach(function (i) {
        i.addEventListener("change", function () {
          if (!i.checked) return;
          if (i === none) $$('input[name="durum"]', f).forEach(function (x) { if (x !== none) x.checked = false; });
          else none.checked = false;
          upd();
        });
      });
    }
    upd();
  });

  /* ---- kontrol listeleri (tarayıcıda hatırlanır) ---- */
  $$("[data-checklist]").forEach(function (box) {
    var key = "list-" + box.getAttribute("data-checklist");
    var inputs = $$("input[type=checkbox]", box);
    var saved = store(key) || [];
    inputs.forEach(function (i) { if (saved.indexOf(i.id) > -1) i.checked = true; });
    var scope = box.closest("[data-check-scope]") || box.parentNode;
    var out = $("[data-meter-out]", scope), bar = $("[data-meter-bar]", scope), reset = $("[data-check-reset]", scope);
    function paint() {
      var n = inputs.filter(function (i) { return i.checked; }).length;
      if (out) out.textContent = n === inputs.length ? "Hepsi hazır" : n + " / " + inputs.length + " hazır";
      if (bar) bar.style.width = (n / inputs.length * 100) + "%";
      store(key, inputs.filter(function (i) { return i.checked; }).map(function (i) { return i.id; }));
    }
    inputs.forEach(function (i) { i.addEventListener("change", paint); });
    if (reset) reset.addEventListener("click", function () { inputs.forEach(function (i) { i.checked = false; }); paint(); });
    paint();
  });

  /* ---- altı ilke yörüngesi ---- */
  $$("[data-orbit]").forEach(function (o) {
    var tabs = $$("[role=tab]", o), list = $(o.getAttribute("data-orbit")), name = $("[data-orbit-name]", o);
    if (!list) return;
    list.classList.add("is-tabbed");
    function sel(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      if (name) name.textContent = t.textContent;
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowRight" || k === "ArrowDown") j = (i + 1) % tabs.length;
        if (k === "ArrowLeft" || k === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
        if (k === "Home") j = 0;
        if (k === "End") j = tabs.length - 1;
        if (j > -1) { e.preventDefault(); sel(tabs[j], true); }
      });
    });
    sel(tabs[0]);
  });

  /* ---- yeme-içme notu yazdırma ---- */
  $$("[data-print-note]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.body.classList.add("print-note");
      window.print();
      setTimeout(function () { document.body.classList.remove("print-note"); }, 800);
    });
  });
})();
