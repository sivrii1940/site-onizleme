/* Tuğra GSM Center — site betiği (kütüphanesiz). */
(function () {
  "use strict";

  var WA = "https://wa.me/905332265750";
  var HOURS = { "0": [["10:00", "22:00"]], "1": [["10:00", "22:00"]], "2": [["10:00", "22:00"]], "3": [["10:00", "22:00"]], "4": [["10:00", "22:00"]], "5": [["10:00", "22:00"]], "6": [["12:00", "20:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var ROWS = ["10:00–22:00", "10:00–22:00", "10:00–22:00", "10:00–22:00", "10:00–22:00", "10:00–22:00", "12:00–20:00"];

  /* ---- kit/status.js (kopya) ---- */
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
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove(); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  function segSync(seg) {
    if (!seg) return;
    var thumb = $(".seg__thumb", seg), act = seg.querySelector('button[aria-pressed="true"]');
    if (!thumb) return;
    if (!act) { seg.classList.remove("has-active"); return; }
    seg.classList.add("has-active");
    thumb.style.width = act.offsetWidth + "px";
    thumb.style.transform = "translateX(" + (act.offsetLeft - 4) + "px)";
  }
  window.addEventListener("resize", function () { $$(".seg").forEach(segSync); });

  /* ---- canlı durum, saat, bugün ---- */
  function paint() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    var root = document.documentElement;
    root.classList.toggle("shop-open", s.open);
    root.classList.toggle("shop-closed", !s.open);
    var t = pad(Math.floor(s.minutes / 60)) + ":" + pad(s.minutes % 60);
    $$("[data-clock]").forEach(function (el) { el.textContent = t; });
    $$("[data-today]").forEach(function (el) { el.textContent = DAYS[s.dayIndex] + " " + ROWS[s.dayIndex]; });
    $$("[data-todayh]").forEach(function (el) { el.textContent = ROWS[s.dayIndex]; });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", +el.getAttribute("data-day") === s.dayIndex); });
    var d;
    try { d = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long", day: "numeric", month: "long" }).format(new Date()); } catch (e) { d = DAYS[s.dayIndex]; }
    $$("[data-date]").forEach(function (el) { el.textContent = d.charAt(0).toLocaleUpperCase("tr-TR") + d.slice(1); });
    var rg = HOURS[String(s.dayIndex)] || [];
    var a = rg.length ? mins(rg[0][0]) / 1440 : 0, b = rg.length ? mins(rg[0][1]) / 1440 : 0;
    $$("[data-dayline]").forEach(function (el) {
      el.style.setProperty("--a", a); el.style.setProperty("--b", b); el.style.setProperty("--n", s.minutes / 1440);
    });
    $$(".stcol").forEach(function (c) {
      var nw = $(".stcol__now", c); if (!nw) return;
      var f = (s.minutes / 60 - 8) / 16;
      nw.hidden = !(+c.getAttribute("data-day") === s.dayIndex && f >= 0 && f <= 1);
      nw.style.setProperty("--n", f);
    });
  }
  paint();
  setInterval(paint, 30000);

  /* ---- hazır WhatsApp metinleri ---- */
  $$("[data-wa-text]").forEach(function (a) { a.href = waHref(a.getAttribute("data-wa-text")); });

  /* ---- menü (uygulama kitaplığı) ---- */
  var menuBtn = $(".menu-btn"), sheet = $("#apps");
  if (menuBtn && sheet) {
    var openM = function () {
      sheet.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add("is-open"); }); });
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      var c = $(".sheet__close", sheet); if (c) c.focus();
    };
    var closeM = function () {
      sheet.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      setTimeout(function () { sheet.hidden = true; }, reduce ? 0 : 260);
      menuBtn.focus();
    };
    menuBtn.addEventListener("click", openM);
    sheet.addEventListener("click", function (e) { if (e.target === sheet || e.target.closest(".sheet__close")) closeM(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) closeM(); });
    sheet.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("a, button", sheet).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ---- ana sayfa: telefon maketi ---- */
  var dev = $("[data-phone]");
  if (dev) {
    var phone = $(".phone", dev), hero = $("[data-hero]"), hseg = $(".seg", dev), homeEl = $("[data-home]", dev), scr = $(".phone__screen", dev);
    var screens = {}, cur = "home";
    $$("[data-screen]", dev).forEach(function (s) { screens[s.getAttribute("data-screen")] = s; });
    var setApp = function (name, focusInside) {
      if (name === cur) return;
      var prev = screens[cur];
      if (prev) {
        prev.classList.remove("is-in"); prev.classList.add("is-out");
        (function (p) { setTimeout(function () { if (p !== screens[cur]) { p.hidden = true; p.classList.remove("is-out"); } }, reduce ? 0 : 320); })(prev);
      }
      var from = cur;
      cur = name;
      phone.setAttribute("data-app", name);
      if (hero) hero.setAttribute("data-app", name);
      var next = screens[name];
      if (next) {
        var icon = $('.apps [data-open="' + name + '"] .appicon', dev);
        if (icon && scr) {
          var ia = icon.getBoundingClientRect(), sb = scr.getBoundingClientRect();
          if (ia.width) next.style.transformOrigin = (ia.left + ia.width / 2 - sb.left) + "px " + (ia.top + ia.height / 2 - sb.top) + "px";
        }
        next.hidden = false; next.classList.remove("is-out");
        void next.offsetWidth;
        next.classList.add("is-in");
        homeEl.setAttribute("inert", ""); homeEl.setAttribute("aria-hidden", "true");
        if (focusInside) { var bk = $(".ascreen__back", next); if (bk) bk.focus({ preventScroll: true }); }
      } else {
        homeEl.removeAttribute("inert"); homeEl.removeAttribute("aria-hidden");
        if (focusInside) { var ic = $('.apps [data-open="' + from + '"]', dev); if (ic) ic.focus({ preventScroll: true }); }
      }
      $$("button[data-open]", hseg).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-open") === name ? "true" : "false"); });
      segSync(hseg);
    };
    dev.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open]");
      if (o && dev.contains(o)) {
        e.preventDefault();
        var n = o.getAttribute("data-open");
        var inSeg = !!o.closest(".seg");
        setApp(inSeg && n === cur ? "home" : n, !inSeg);
        return;
      }
      var hb = e.target.closest("[data-home-btn]");
      if (hb) setApp("home", !!hb.closest(".ascreen"));
    });
    dev.addEventListener("keydown", function (e) { if (e.key === "Escape" && cur !== "home") setApp("home", true); });
  }

  /* ---- ana sayfa: patlatılmış çizim ---- */
  var xv = $("[data-xview]");
  if (xv) {
    var rect = xv.getBoundingClientRect();
    if (!reduce && "IntersectionObserver" in window && rect.top > window.innerHeight) {
      xv.classList.add("is-shut");
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { setTimeout(function () { xv.classList.remove("is-shut"); }, 120); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(xv);
    }
    $$("[data-xp-link]").forEach(function (a) {
      var on = function () {
        var k = a.getAttribute("data-xp-link");
        xv.classList.add("has-hl");
        $$(".xp", xv).forEach(function (p) { p.classList.toggle("is-hl", p.getAttribute("data-xp") === k); });
      };
      var off = function () { xv.classList.remove("has-hl"); $$(".xp.is-hl", xv).forEach(function (p) { p.classList.remove("is-hl"); }); };
      a.addEventListener("mouseenter", on); a.addEventListener("focus", on);
      a.addEventListener("mouseleave", off); a.addEventListener("blur", off);
    });
  }

  /* ---- alım satım: Satıyorum / Alıyorum ---- */
  var modeBtns = $$("[data-mode-btn]");
  if (modeBtns.length) {
    var apphead = $("[data-apphead]"), mseg = modeBtns[0].closest(".seg");
    var setMode = function (m) {
      $$("[data-mode]").forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-mode") === m); });
      modeBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode-btn") === m ? "true" : "false"); });
      if (apphead) apphead.setAttribute("data-app", m);
      segSync(mseg);
    };
    setMode(location.hash === "#alirken" ? "al" : "sat");
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.getAttribute("data-mode-btn");
        setMode(m);
        if (history.replaceState) history.replaceState(null, "", m === "al" ? "#alirken" : "#satmadan");
      });
    });
    window.addEventListener("hashchange", function () {
      if (location.hash === "#alirken") setMode("al");
      else if (location.hash === "#satmadan") setMode("sat");
    });
  }

  /* ---- alım satım: hazırlık listesi (batarya) ---- */
  var prep = $('[data-tool="hazirlik"]');
  if (prep) {
    var KEY = "tugra-gsm-hazirlik", st = {};
    try { st = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { st = {}; }
    var items = $$("[data-ck]", prep), batt = $("[data-batt]", prep);
    var renderPrep = function () {
      var n = 0, nextT = "";
      items.forEach(function (li) {
        var on = !!st[li.getAttribute("data-ck")];
        if (on) n++; else if (!nextT) nextT = $("h3", li).textContent;
        li.classList.toggle("is-done", on);
        $(".switch", li).setAttribute("aria-checked", on ? "true" : "false");
      });
      var p = n / items.length;
      batt.style.setProperty("--p", p);
      batt.classList.toggle("is-mid", p >= 0.34 && p < 1);
      batt.classList.toggle("is-full", p === 1);
      $("[data-batt-pct]", prep).textContent = "%" + Math.round(p * 100);
      $("[data-batt-count]", prep).textContent = n;
      $("[data-batt-msg]", prep).textContent = n === 0 ? "Yedekle başlayın; sıfırlamayı en sona bırakın." : (p === 1 ? "Hazırsınız. Telefonu değerletmeye geçebilirsiniz." : "Sıradaki: " + nextT);
      $("[data-batt-done]", prep).hidden = p < 1;
    };
    var savePrep = function () { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* depolama kapalı */ } };
    prep.addEventListener("click", function (e) {
      var sw = e.target.closest(".switch");
      if (sw) { var k = sw.closest("[data-ck]").getAttribute("data-ck"); st[k] = !st[k]; savePrep(); renderPrep(); return; }
      if (e.target.closest("[data-batt-reset]")) { st = {}; savePrep(); renderPrep(); }
    });
    renderPrep();
  }

  /* ---- alım satım: *#06# tuş takımı ---- */
  var dial = $('[data-tool="imei"]');
  if (dial) {
    var disp = $("[data-dial-disp]", dial), dmsg = $("[data-dial-msg]", dial), imei = $("[data-imei]", dial), code = "", typing = null;
    var showImei = function () { imei.hidden = false; var b = $("button", imei); if (b) b.focus({ preventScroll: true }); };
    var check = function () {
      if (code === "*#06#") { dmsg.textContent = ""; setTimeout(showImei, reduce ? 0 : 260); }
      else if (code.length >= 5) dmsg.textContent = "Bu kod değil; *#06# deneyin.";
      else dmsg.textContent = "";
    };
    var press = function (k) {
      if (code.length >= 10) code = "";
      code += k; disp.textContent = code;
      var kb = dial.querySelector('[data-key="' + k + '"]');
      if (kb) { kb.classList.add("is-press"); setTimeout(function () { kb.classList.remove("is-press"); }, 160); }
      check();
    };
    dial.addEventListener("click", function (e) {
      var k = e.target.closest("[data-key]");
      if (k) { clearInterval(typing); press(k.getAttribute("data-key")); return; }
      if (e.target.closest("[data-dial-del]")) { clearInterval(typing); code = code.slice(0, -1); disp.textContent = code; check(); return; }
      if (e.target.closest("[data-imei-close]")) { imei.hidden = true; code = ""; disp.textContent = ""; $("[data-dial-demo]", dial).focus({ preventScroll: true }); return; }
      if (e.target.closest("[data-dial-demo]")) {
        clearInterval(typing); code = ""; disp.textContent = ""; dmsg.textContent = "";
        var seq = "*#06#".split(""), i = 0;
        if (reduce) { seq.forEach(press); return; }
        typing = setInterval(function () { press(seq[i++]); if (i >= seq.length) clearInterval(typing); }, 260);
      }
    });
  }

  /* ---- teknik servis: arıza seçici ---- */
  var fx = $('[data-tool="ariza-secici"]');
  if (fx) {
    var views = $$("[data-view]", fx), vbtns = $$("[data-view-btn]", fx), vseg = vbtns.length ? vbtns[0].closest(".seg") : null;
    var pinfos = $$("[data-pinfo]", fx), pbtns = $$("[data-pick]", fx), hss = $$(".hs", fx);
    var PV = { ekran: "on", bio: "on", tuslar: "on", arka: "arka", kamera: "arka", hoparlor: "kenar", mikrofon: "kenar", soket: "kenar", sim: "kenar", batarya: "ic" };
    var NAMES = {};
    pinfos.forEach(function (p) { NAMES[p.getAttribute("data-pinfo")] = $("h3", p).textContent; });
    var setView = function (v) {
      views.forEach(function (s) { if (s.getAttribute("data-view") === v) s.removeAttribute("hidden"); else s.setAttribute("hidden", ""); });
      vbtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-view-btn") === v ? "true" : "false"); });
      segSync(vseg);
    };
    var pick = function (part, o) {
      o = o || {};
      pinfos.forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-pinfo") === part); });
      pbtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-pick") === part ? "true" : "false"); });
      hss.forEach(function (h) { h.classList.toggle("is-sel", h.getAttribute("data-part") === part); });
      if (o.view && PV[part]) {
        var vis = views.some(function (s) { return !s.hasAttribute("hidden") && s.querySelector('[data-part="' + part + '"]'); });
        if (!vis) setView(PV[part]);
      }
      if (o.scroll && window.innerWidth < 1000) {
        var t = fx.querySelector('[data-pinfo="' + part + '"]');
        if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    };
    hss.forEach(function (h) {
      h.addEventListener("click", function () { pick(h.getAttribute("data-part"), { scroll: true }); });
      h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(h.getAttribute("data-part"), { scroll: true }); } });
    });
    pbtns.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-pick"), { view: true, scroll: true }); }); });
    vbtns.forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view-btn")); }); });

    var picked = $("[data-picked]", fx), tmsg = $("[data-t-msg]", fx), tsend = $("[data-t-send]", fx), symList = [];
    var radio = function (n) { var e = fx.querySelector('input[name="' + n + '"]:checked'); return e ? e.value : ""; };
    var buildT = function () {
      symList = $$("input[data-sym]:checked", fx);
      pbtns.forEach(function (b) {
        var k = b.getAttribute("data-pick"), c = symList.filter(function (x) { return x.getAttribute("data-sym") === k; }).length, badge = $(".pbtn__n", b);
        badge.hidden = !c; badge.textContent = c;
      });
      picked.innerHTML = "";
      if (!symList.length) {
        var li0 = document.createElement("li"); li0.className = "picked__empty"; li0.style.cssText = "background:none;box-shadow:none;padding:0";
        li0.textContent = "Henüz belirti seçmediniz. Yukarıdan bir parça seçip belirtiyi işaretleyin."; picked.appendChild(li0);
      }
      symList.forEach(function (x, i) {
        var li = document.createElement("li"), txt = NAMES[x.getAttribute("data-sym")] + ": " + x.value;
        li.appendChild(document.createTextNode(txt));
        var b = document.createElement("button"); b.type = "button"; b.setAttribute("data-unsym", i); b.setAttribute("aria-label", "Kaldır: " + txt);
        b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-close"/></svg>';
        li.appendChild(b); picked.appendChild(li);
      });
      var model = ($("[data-t=model]", fx).value || "").trim(), ac = radio("t_acilis"), yd = radio("t_yedek"), note = ($("[data-t=not]", fx).value || "").trim();
      var L = ["Merhaba Tuğra GSM Center, telefonum için teknik servis bilgisi almak istiyorum.", ""];
      if (model) L.push("Model: " + model);
      if (symList.length) { L.push("Sorunlar:"); symList.forEach(function (x) { L.push("• " + NAMES[x.getAttribute("data-sym")] + ": " + x.value); }); }
      if (ac) L.push("Telefon açılıyor mu: " + ac);
      if (yd) L.push("Yedek: " + yd);
      if (note) L.push("Not: " + note);
      L.push("", "Parça durumu ve süre hakkında bilgi verebilir misiniz?");
      var m = L.join("\n").replace(/\n{3,}/g, "\n\n");
      tmsg.textContent = m;
      tsend.href = waHref(m);
      return m;
    };
    fx.addEventListener("change", buildT);
    fx.addEventListener("input", function (e) { if (e.target.matches("input[type=text], textarea")) buildT(); });
    picked.addEventListener("click", function (e) {
      var b = e.target.closest("[data-unsym]"); if (!b) return;
      var x = symList[+b.getAttribute("data-unsym")]; if (x) { x.checked = false; buildT(); }
    });
    var tcopy = $("[data-t-copy]", fx), tcopied = $("[data-t-copied]", fx);
    if (tcopy) tcopy.addEventListener("click", function () {
      copyText(buildT(), function (ok) { tcopied.textContent = ok ? "Mesaj kopyalandı; istediğiniz uygulamaya yapıştırabilirsiniz." : "Kopyalanamadı; önizlemedeki metni seçip kopyalayın."; });
    });
    var qp = null;
    try { qp = new URLSearchParams(location.search).get("parca"); } catch (e) { qp = null; }
    if (qp && NAMES[qp]) pick(qp, { view: true }); else { setView("on"); pick("ekran"); }
    buildT();
  }

  /* ---- teknik servis: test araçları ---- */
  var tests = $('[data-tool="testler"]');
  if (tests) {
    var ov = null, lastBtn = null, hudTimer = null;
    var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
    var escH = function (e) { if (e.key === "Escape") closeOv(); };
    var closeOv = function () {
      if (!ov) return;
      ov.hidden = true; ov.innerHTML = ""; ov.onclick = null; ov.style.background = "";
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", escH);
      try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {}); } catch (e) { /* yok */ }
      if (lastBtn) lastBtn.focus({ preventScroll: true });
    };
    var openOv = function (label) {
      if (!ov) { ov = el("div", "testov"); ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); document.body.appendChild(ov); }
      ov.setAttribute("aria-label", label);
      ov.hidden = false; document.body.classList.add("no-scroll");
      document.addEventListener("keydown", escH);
      try { if (ov.requestFullscreen) { var pr = ov.requestFullscreen(); if (pr && pr.catch) pr.catch(function () {}); } } catch (e) { /* tam ekran yok */ }
    };
    var mkHud = function () {
      var hud = el("div", "testov__hud"), lab = el("span"), close = el("button", "", "Kapat");
      close.type = "button"; close.addEventListener("click", function (e) { e.stopPropagation(); closeOv(); });
      hud.appendChild(lab); hud.appendChild(close); ov.appendChild(hud);
      return { hud: hud, lab: lab, close: close };
    };
    var fade = function (h) { h.classList.remove("is-faded"); clearTimeout(hudTimer); hudTimer = setTimeout(function () { h.classList.add("is-faded"); }, 1800); };
    var COLORS = [["#FFFFFF", "Beyaz"], ["#000000", "Siyah"], ["#FF0000", "Kırmızı"], ["#00FF00", "Yeşil"], ["#0000FF", "Mavi"], ["#808080", "Gri"]];
    var colorTest = function () {
      openOv("Renk ve piksel testi");
      var h = mkHud(), i = 0;
      var paintC = function () { ov.style.background = COLORS[i][0]; h.lab.textContent = (i + 1) + "/" + COLORS.length + " · " + COLORS[i][1] + " · dokunun, sonraki renk"; fade(h.hud); };
      ov.onclick = function (e) { if (e.target.closest("button")) return; i++; if (i >= COLORS.length) { closeOv(); return; } paintC(); };
      paintC(); h.close.focus({ preventScroll: true });
    };
    var touchTest = function () {
      openOv("Dokunmatik testi");
      ov.style.background = "#0B0D22";
      var W = window.innerWidth, H = window.innerHeight;
      var cols = Math.max(4, Math.round(W / 60)), rows = Math.max(6, Math.round(H / 60)), total = cols * rows, done = 0, down = false;
      var g = el("div", "tgrid");
      g.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)"; g.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
      for (var k = 0; k < total; k++) g.appendChild(document.createElement("i"));
      ov.appendChild(g);
      var h = mkHud(), reset = el("button", "", "Sıfırla"); reset.type = "button";
      h.hud.insertBefore(reset, h.close);
      var upd = function () { h.lab.textContent = done >= total ? "Tüm kareler tepki verdi" : "Boyanan " + done + " / " + total; };
      reset.addEventListener("click", function (e) { e.stopPropagation(); $$("i.on", g).forEach(function (c) { c.classList.remove("on"); }); done = 0; upd(); });
      var hit = function (x, y) {
        var c = document.elementFromPoint(x, y);
        if (c && c.parentNode === g && !c.classList.contains("on")) { c.classList.add("on"); done++; upd(); }
      };
      var restoreHud = null;
      g.addEventListener("pointerdown", function (e) {
        down = true; h.hud.style.pointerEvents = "none"; h.hud.classList.add("is-faded"); clearTimeout(restoreHud);
        hit(e.clientX, e.clientY);
      });
      g.addEventListener("pointermove", function (e) {
        if (!down) return;
        var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        if (!evs.length) evs = [e];
        evs.forEach(function (ev) { hit(ev.clientX, ev.clientY); });
      });
      var up = function () { down = false; clearTimeout(restoreHud); restoreHud = setTimeout(function () { h.hud.style.pointerEvents = ""; h.hud.classList.remove("is-faded"); }, 900); };
      g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up); g.addEventListener("pointerleave", up);
      upd(); h.close.focus({ preventScroll: true });
    };
    var audioCtx = null;
    var soundTest = function (out) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { out.textContent = "Bu tarayıcı ses testini desteklemiyor."; return; }
      try {
        audioCtx = audioCtx || new AC();
        if (audioCtx.resume) audioCtx.resume();
        var t = audioCtx.currentTime + 0.05;
        [523.25, 659.25, 783.99].forEach(function (f) {
          var o = audioCtx.createOscillator(), gn = audioCtx.createGain();
          o.type = "sine"; o.frequency.value = f;
          gn.gain.setValueAtTime(0.0001, t);
          gn.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
          gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
          o.connect(gn); gn.connect(audioCtx.destination);
          o.start(t); o.stop(t + 0.4); t += 0.42;
        });
        out.textContent = "Üç ton çalındı. Duymadıysanız sessiz modu ve ses düzeyini kontrol edin.";
      } catch (e) { out.textContent = "Ses başlatılamadı; sayfayı yenileyip yeniden deneyin."; }
    };
    var vibTest = function (out) {
      if (navigator.vibrate && navigator.vibrate([180, 90, 180, 90, 380])) out.textContent = "Titreşim gönderildi. Hissetmediyseniz titreşim ayarını kontrol edin.";
      else out.textContent = "Bu tarayıcı titreşim testine izin vermiyor (iPhone'daki Safari desteklemez).";
    };
    tests.addEventListener("click", function (e) {
      var b = e.target.closest("[data-test]"); if (!b) return;
      lastBtn = b;
      var k = b.getAttribute("data-test"), out = tests.querySelector('[data-test-out="' + k + '"]');
      if (k === "renk") colorTest();
      else if (k === "dokunmatik") touchTest();
      else if (k === "ses") soundTest(out);
      else if (k === "titresim") vibTest(out);
    });
  }

  /* ---- değer sor: telefonumu değerlet ---- */
  var vf = $("#degerlet");
  if (vf) {
    var vmsg = $("[data-v-msg]", vf), vsend = $("[data-v-send]", vf), bars = $$("[data-v-sig] i", vf), slabel = $("[data-v-sig-label]", vf), shint = $("[data-v-sig-hint]", vf), other = $("[data-other]", vf), vnote = $("[data-v-note]", vf);
    var CHK = [["c_ekran", "Ekran ve dokunmatik"], ["c_kamera", "Kameralar"], ["c_sarj", "Şarj ve soket"], ["c_bio", "Yüz tanıma / parmak izi"], ["c_ses", "Ses ve mikrofon"], ["c_sebeke", "Şebeke ve SIM"]];
    var r = function (n) { var e = vf.querySelector('input[name="' + n + '"]:checked'); return e ? e.value : ""; };
    var cs = function (n) { return $$('input[name="' + n + '"]:checked', vf).map(function (e) { return e.value; }); };
    var fld = function (n) { var e = vf.querySelector('[name="' + n + '"]'); return e ? (e.value || "").trim() : ""; };
    var state = {};
    var buildV = function () {
      var marka = r("marka");
      other.hidden = marka !== "Diğer";
      if (marka === "Diğer") marka = fld("marka_diger");
      var model = fld("model"), haf = r("hafiza"), koz = r("kozmetik"), ok = [], bad = [], unk = [];
      CHK.forEach(function (c) { var v = r(c[0]); if (v === "Sorunsuz") ok.push(c[1]); else if (v === "Sorunlu") bad.push(c[1]); else if (v === "Bilmiyorum") unk.push(c[1]); });
      var bn = parseInt(fld("batarya"), 10); if (!(bn >= 1 && bn <= 100)) bn = 0;
      var tam = r("tamir"), yan = cs("yaninda"), amac = r("amac"), ad = fld("ad"), note = fld("not");
      var L = ["Merhaba Tuğra GSM Center, telefonumu değerletmek istiyorum."], D = [];
      var tel = [marka, model].filter(Boolean).join(" ");
      if (tel) D.push("• Telefon: " + tel);
      if (haf) D.push("• Hafıza: " + haf);
      if (koz) D.push("• Görünüm: " + koz);
      if (ok.length) D.push("• Sorunsuz: " + ok.join(", "));
      if (bad.length) D.push("• Sorunlu: " + bad.join(", "));
      if (unk.length) D.push("• Emin değilim: " + unk.join(", "));
      if (bn) D.push("• Batarya sağlığı: %" + bn);
      if (tam) D.push("• Daha önce tamir: " + tam);
      if (yan.length) D.push("• Yanında: " + yan.join(", "));
      if (amac) D.push("• Düşüncem: " + amac);
      if (D.length) { L.push(""); L = L.concat(D); }
      if (note) L.push("", "Not: " + note);
      L.push("", "İsterseniz fotoğraf da gönderebilirim. Uygun olduğunuzda bilgi verebilir misiniz?");
      if (ad) L.push(ad);
      var m = L.join("\n");
      vmsg.textContent = m;
      vsend.href = waHref(m);
      var score = 0;
      if (marka) score++; if (model.length > 1) score++; if (haf) score++; if (koz) score++;
      if (ok.length + bad.length + unk.length >= 3) score++; if (bn || tam) score++; if (yan.length || amac) score++;
      var nb = score === 0 ? 0 : Math.max(1, Math.round(score / 7 * 4));
      bars.forEach(function (x, i) { x.classList.toggle("on", i < nb); });
      slabel.textContent = "Bilgi gücü: " + ["zayıf", "zayıf", "orta", "iyi", "tam"][nb];
      shint.textContent = !marka || model.length < 2 ? " Marka ve modelle başlayın." : !haf ? " Hafızayı ekleyin." : !koz ? " Görünümü seçin." : (ok.length + bad.length + unk.length < 3) ? " Çalışma durumunu işaretleyin." : !(bn || tam) ? " Batarya ve tamir geçmişini ekleyin." : !(yan.length || amac) ? " Yanında olanları seçin." : " Mesaj hazır, gönderebilirsiniz.";
      state = { marka: marka, model: model };
      return m;
    };
    vf.addEventListener("input", buildV);
    vf.addEventListener("change", buildV);
    vf.addEventListener("submit", function (e) { e.preventDefault(); });
    vf.addEventListener("reset", function () { setTimeout(function () { buildV(); vnote.textContent = "Form temizlendi."; }, 0); });
    vsend.addEventListener("click", function () {
      buildV();
      vnote.textContent = state.model ? "WhatsApp açılıyor; mesajı kontrol edip gönderin." : "Model yazılmadı; mesaja eklerseniz daha net bilgi alırsınız.";
    });
    var vcopy = $("[data-v-copy]", vf);
    if (vcopy) vcopy.addEventListener("click", function () {
      copyText(buildV(), function (ok) { vnote.textContent = ok ? "Mesaj kopyalandı." : "Kopyalanamadı; önizlemedeki metni seçip kopyalayın."; });
    });
    buildV();
  }

  /* ---- sorular: arama ve süzgeç ---- */
  var fq = $('[data-tool="sss-ara"]');
  if (fq) {
    var qin = $("#q", fq), qclear = $(".searchbox__clear", fq), cats = $$(".cats button", fq), qs = $$(".fgroup .q"), groups = $$(".fgroup"), qcount = $("[data-count]", fq), qempty = $("[data-empty]"), qask = $("[data-ask]"), cat = "all";
    var norm = function (s) { return s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i"); };
    qs.forEach(function (q) { q._t = norm(q.textContent); q._g = q.closest(".fgroup").getAttribute("data-group"); });
    var run = function () {
      var words = norm(qin.value.trim()).split(/\s+/).filter(Boolean), n = 0;
      qs.forEach(function (q) {
        var show = (cat === "all" || q._g === cat) && words.every(function (w) { return q._t.indexOf(w) > -1; });
        q.hidden = !show; if (show) n++;
      });
      groups.forEach(function (g) { g.hidden = !$$(".q", g).some(function (q) { return !q.hidden; }); });
      qcount.textContent = n;
      qempty.hidden = n > 0;
      qclear.hidden = !qin.value;
      qask.href = waHref("Merhaba Tuğra GSM Center, bir sorum var: " + qin.value.trim());
    };
    qin.addEventListener("input", run);
    qclear.addEventListener("click", function () { qin.value = ""; run(); qin.focus(); });
    cats.forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.getAttribute("data-cat");
        cats.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        run();
      });
    });
    run();
  }

  /* ---- iletişim: rehbere kaydet (.vcf) ---- */
  var vcfBtn = $("[data-vcf]");
  if (vcfBtn) {
    vcfBtn.addEventListener("click", function () {
      var v = [
        "BEGIN:VCARD", "VERSION:3.0", "N:;Tuğra GSM Center;;;", "FN:Tuğra GSM Center", "ORG:Tuğra GSM Center",
        "TEL;TYPE=CELL,VOICE:+905332265750",
        "ADR;TYPE=WORK:;;Hürriyet Cd. No:19 D:1\\, Cennet;Küçükçekmece;İstanbul;34290;Türkiye",
        "URL:https://instagram.com/tugragsmcenter",
        "NOTE:Pazartesi–Cumartesi 10:00–22:00\\, Pazar 12:00–20:00",
        "END:VCARD"
      ].join("\r\n");
      var msg = $("[data-vcf-msg]");
      try {
        var url = URL.createObjectURL(new Blob([v], { type: "text/vcard;charset=utf-8" }));
        var a = document.createElement("a"); a.href = url; a.download = "tugra-gsm-center.vcf";
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
        if (msg) msg.textContent = "Kişi kartı indirildi. Dosyayı açıp rehberinize ekleyin.";
      } catch (e) { if (msg) msg.textContent = "İndirilemedi; numarayı elle kaydedin: 0533 226 57 50."; }
    });
  }

  /* ---- bölmeli denetimlerin ilk konumu ---- */
  $$(".seg").forEach(segSync);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { $$(".seg").forEach(segSync); });
})();
