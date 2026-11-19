/* Sprint Fitness ve Solaryum — site betiği (bağımsız, kütüphanesiz) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var HOURS = { "0": [["09:00", "23:00"]], "1": [["09:00", "23:00"]], "2": [["09:00", "23:00"]], "3": [["09:00", "23:00"]], "4": [["09:00", "23:00"]], "5": [["10:00", "22:00"]], "6": [["12:00", "19:00"]] };
  var WA = "https://wa.me/905056464214";
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function hhmm(m) { m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60), x = m % 60; return (h < 10 ? "0" : "") + h + ":" + (x < 10 ? "0" : "") + x; }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function radio(rootEl, name) { var el = rootEl.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function checks(rootEl, name) { return $$('input[name="' + name + '"]:checked', rootEl).map(function (e) { return e.value; }); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function lowerFirst(list) { return list.map(function (s, i) { return i === 0 ? s : s.charAt(0).toLocaleLowerCase("tr") + s.slice(1); }); }

  function copyText(text, okEl) {
    function done() { if (okEl) { okEl.textContent = "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz."; setTimeout(function () { okEl.textContent = ""; }, 5000); } }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { if (okEl) okEl.textContent = "Kopyalanamadı; metni seçip kendiniz kopyalayın."; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  /* Mesaj kurucu: önizleme + WhatsApp bağlantısı + kopyalama */
  function wireMessage(tool, build) {
    var pre = $(".msg-preview", tool), wa = $("[data-wa]", tool), cp = $("[data-copy]", tool), ok = $(".copy-ok", tool);
    function update() { var m = build(); if (pre) pre.textContent = m; if (wa) wa.href = waHref(m); return m; }
    tool.addEventListener("input", update);
    tool.addEventListener("change", update);
    if (cp) cp.addEventListener("click", function () { copyText(update(), ok); });
    update();
    return update;
  }

  /* Seçilen gün + saat dilimi çalışma saatine uyuyor mu? */
  var SLOTS = { "Sabah (09:00–12:00)": [540, 720], "Öğle (12:00–17:00)": [720, 1020], "Akşam (17:00–20:00)": [1020, 1200], "Geç saat (20:00–23:00)": [1200, 1380] };
  function slotWarning(dayIdxs, slot) {
    var r = SLOTS[slot]; if (!r) return "";
    var bad = [];
    dayIdxs.forEach(function (d) {
      var h = HOURS[String(d)]; if (!h) return;
      var o = mins(h[0][0]), c = mins(h[0][1]);
      if (r[0] < o || r[1] > c) bad.push(DAYS[d] + " " + h[0][0] + "–" + h[0][1]);
    });
    return bad.length ? "Dikkat: seçtiğiniz saat dilimi her gün tam uymuyor (" + bad.join(", ") + " arası açık)." : "";
  }

  /* ---- 1. Canlı açık/kapalı ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- 2. Menü ---- */
  var menuBtn = $(".menu-btn"), menu = $("#menu");
  function closeMenu() {
    if (!menu || !menu.classList.contains("open")) return;
    menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      if (open) {
        menu.style.setProperty("--menu-top", Math.round($(".top").getBoundingClientRect().bottom) + "px");
        menu.classList.add("open"); menuBtn.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden";
        var first = $("a", menu); if (first) first.focus();
      } else closeMenu();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); menuBtn.focus(); } });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 900) closeMenu(); });
  }

  /* ---- 3. Çıkıştan bitişe ilerleme ---- */
  var lp = $(".lane-progress span"), rf = $(".race .rf"), rr = $(".race .rr"), ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (lp) lp.style.width = (p * 100).toFixed(2) + "%";
    if (rf) rf.style.height = (p * 100).toFixed(2) + "%";
    if (rr) rr.style.top = (p * 100).toFixed(2) + "%";
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---- 4. Saat kulvarları: bugün + şimdi işareti ---- */
  $$("[data-hours-chart]").forEach(function (ch) {
    var n = istanbulNow(), start = 6 * 60, end = 24 * 60;
    var row = $('[data-day="' + n.d + '"]', ch); if (!row) return;
    row.classList.add("today");
    var lbl = $(".h-day small", row); if (lbl) lbl.textContent = "Bugün";
    var bar = $(".h-bar", row);
    if (bar && n.m >= start && n.m <= end) {
      var mk = document.createElement("i");
      mk.className = "now"; mk.title = "Şu an " + hhmm(n.m);
      mk.style.left = ((n.m - start) / (end - start) * 100).toFixed(2) + "%";
      bar.appendChild(mk);
    }
  });

  /* ---- 5. İMZA: Aralık zamanlayıcı ---- */
  var intervalCfg = null;
  function intervalText() {
    if (!intervalCfg) return "";
    return intervalCfg.work + " sn çalış / " + intervalCfg.rest + " sn dinlen × " + intervalCfg.rounds + " tur";
  }
  $$('[data-tool="aralik-zamanlayici"]').forEach(function (tool) {
    var path = $(".lap-path", tool), prog = $(".prog", tool), runner = $(".runner", tool), halo = $(".runner-ring", tool);
    var ring = $(".w-ring", tool), timeEl = $(".w-time", tool), phaseEl = $(".w-phase", tool), roundEl = $(".w-round", tool);
    var startBtn = $('[data-t="start"]', tool), skipBtn = $('[data-t="skip"]', tool), resetBtn = $('[data-t="reset"]', tool), soundBtn = $('[data-t="sound"]', tool);
    var setup = $(".t-setup", tool), totalEl = $(".t-total b", tool), doneEl = $(".t-done", tool), sr = $(".t-sr", tool);
    var L = path.getTotalLength(), RC = 2 * Math.PI * 74;
    var LIM = { prep: [0, 60, 5], work: [5, 300, 5], rest: [0, 300, 5], rounds: [1, 30, 1] };
    var cfg = { prep: 10, work: 40, rest: 20, rounds: 8 };
    var phases = [], total = 1, idx = -1, state = "idle", phaseEnd = 0, remain = 0, lastBeep = -1, raf = 0, ac = null, sound = true, wake = null, shown = "";
    var LABEL = { prep: "Hazırlan", work: "Çalış", rest: "Dinlen" };
    intervalCfg = cfg;
    ring.style.strokeDasharray = RC.toFixed(2);

    function build() {
      phases = [];
      if (cfg.prep > 0) phases.push({ t: "prep", d: cfg.prep, r: 0 });
      for (var r = 1; r <= cfg.rounds; r++) {
        phases.push({ t: "work", d: cfg.work, r: r });
        if (cfg.rest > 0 && r < cfg.rounds) phases.push({ t: "rest", d: cfg.rest, r: r });
      }
      total = 0;
      phases.forEach(function (p) { p.s = total; total += p.d; });
      prog.innerHTML = "";
      var d = path.getAttribute("d");
      phases.forEach(function (p) {
        var el = document.createElementNS(NS, "path"), a = p.s / total * L, len = p.d / total * L;
        el.setAttribute("d", d);
        el.setAttribute("class", "seg " + p.t);
        el.style.strokeDasharray = Math.max(0.5, len - 2).toFixed(2) + " " + (L + 20).toFixed(2);
        el.style.strokeDashoffset = (-a - 1).toFixed(2);
        prog.appendChild(el); p.el = el;
      });
      if (totalEl) totalEl.textContent = mmss(total);
      $$(".preset", tool).forEach(function (b) {
        var v = b.getAttribute("data-p").split(",").map(Number);
        b.setAttribute("aria-pressed", String(v[0] === cfg.work && v[1] === cfg.rest && v[2] === cfg.rounds));
      });
      document.dispatchEvent(new CustomEvent("interval-change"));
    }
    function setTime(sec) {
      var t = mmss(sec); if (t === shown) return; shown = t;
      timeEl.innerHTML = t.split("").map(function (c) { return '<span' + (c === ":" ? ' class="c"' : "") + ">" + c + "</span>"; }).join("");
    }
    function render(now) {
      var p = phases[idx], rem, elapsedPhase = 0, overall = 0;
      if (state === "idle") {
        tool.setAttribute("data-phase", "idle");
        phaseEl.textContent = "Hazır";
        setTime(total);
        roundEl.textContent = cfg.rounds + " tur · toplam süre";
        ring.style.strokeDashoffset = RC.toFixed(2);
        overall = 0;
      } else if (state === "done") {
        tool.setAttribute("data-phase", "done");
        phaseEl.textContent = "Bitiş";
        setTime(0);
        roundEl.textContent = cfg.rounds + "/" + cfg.rounds + " tur tamam";
        ring.style.strokeDashoffset = "0";
        overall = total;
      } else {
        rem = (state === "running" ? phaseEnd - now : remain) / 1000;
        elapsedPhase = Math.min(p.d, Math.max(0, p.d - rem));
        overall = p.s + elapsedPhase;
        tool.setAttribute("data-phase", p.t);
        phaseEl.textContent = state === "paused" ? "Durakladı" : LABEL[p.t];
        setTime(Math.ceil(rem - 0.001));
        roundEl.textContent = p.t === "prep" ? "Başlamaya hazırlanın" : "Tur " + p.r + "/" + cfg.rounds;
        ring.style.strokeDashoffset = (RC * (1 - elapsedPhase / p.d)).toFixed(2);
      }
      phases.forEach(function (q, i) {
        q.el.classList.toggle("done", state === "done" || (idx > -1 && i < idx));
        q.el.classList.toggle("now", i === idx && state !== "done" && state !== "idle");
      });
      var pt = path.getPointAtLength(Math.min(L - 0.01, overall / total * L));
      runner.setAttribute("cx", pt.x.toFixed(1)); runner.setAttribute("cy", pt.y.toFixed(1));
      halo.setAttribute("cx", pt.x.toFixed(1)); halo.setAttribute("cy", pt.y.toFixed(1));
    }
    function ensureAudio() {
      if (!sound) return;
      try {
        if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); }
        if (ac && ac.state === "suspended") ac.resume();
      } catch (e) { ac = null; }
    }
    function beep(freq, dur, when) {
      if (!sound || !ac) return;
      try {
        var t0 = ac.currentTime + (when || 0), o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.28, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.03);
      } catch (e) { /* ses yoksa sessiz devam */ }
    }
    function buzz(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { } }
    function say(t) { if (sr) sr.textContent = t; }
    function lockScreen() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request("screen").then(function (w) { wake = w; }, function () { }); } catch (e) { } }
    function unlockScreen() { try { if (wake) { wake.release(); } } catch (e) { } wake = null; }
    function next(at) {
      idx++; lastBeep = -1;
      if (idx >= phases.length) { finish(); return; }
      var p = phases[idx];
      phaseEnd = at + p.d * 1000;
      if (p.t === "work") { beep(880, 0.32); buzz(180); }
      else if (p.t === "rest") { beep(520, 0.4); buzz([80, 60, 80]); }
      say(LABEL[p.t] + (p.r ? ", tur " + p.r + " / " + cfg.rounds : "") + ", " + p.d + " saniye");
    }
    function finish() {
      state = "done"; idx = phases.length;
      beep(880, 0.18); beep(1040, 0.18, 0.22); beep(1320, 0.5, 0.44); buzz([120, 80, 120, 80, 260]);
      setup.disabled = false; startBtn.querySelector("span").textContent = "Yeniden başlat";
      skipBtn.disabled = true;
      doneEl.hidden = false;
      doneEl.textContent = "Bitiş çizgisi! " + cfg.rounds + " tur tamamlandı, toplam " + mmss(total) + ". Soğuma için birkaç dakika yürüyün ve esneyin.";
      say("Antrenman bitti. " + cfg.rounds + " tur tamamlandı.");
      unlockScreen(); cancelAnimationFrame(raf); render(performance.now());
    }
    function step() {
      if (state !== "running") return;
      var now = performance.now();
      while (state === "running" && now >= phaseEnd) next(phaseEnd);
      if (state !== "running") return;
      var left = Math.ceil((phaseEnd - now) / 1000);
      if (left <= 3 && left >= 1 && left !== lastBeep && phases[idx].d > 3) { lastBeep = left; beep(660, 0.09); }
      render(now);
    }
    function loop() { step(); if (state === "running") raf = requestAnimationFrame(loop); }
    setInterval(function () { if (document.hidden) step(); }, 250);

    function start() {
      if (state === "running") { // duraklat
        remain = phaseEnd - performance.now(); state = "paused"; cancelAnimationFrame(raf);
        startBtn.querySelector("span").textContent = "Devam et"; say("Duraklatıldı"); unlockScreen(); render(performance.now()); return;
      }
      ensureAudio(); lockScreen();
      if (state === "paused") { phaseEnd = performance.now() + remain; }
      else { build(); idx = -1; doneEl.hidden = true; next(performance.now()); }
      state = "running"; setup.disabled = true; skipBtn.disabled = false; resetBtn.disabled = false;
      startBtn.querySelector("span").textContent = "Duraklat";
      loop();
    }
    function reset() {
      state = "idle"; idx = -1; cancelAnimationFrame(raf); unlockScreen();
      setup.disabled = false; skipBtn.disabled = true; doneEl.hidden = true;
      startBtn.querySelector("span").textContent = "Başlat"; say("Sıfırlandı"); render(performance.now());
    }
    function skip() {
      if (state === "idle" || state === "done") return;
      var wasPaused = state === "paused";
      state = "running"; next(performance.now());
      if (state === "running" && wasPaused) { state = "paused"; remain = phases[idx].d * 1000; }
      render(performance.now());
    }
    startBtn.addEventListener("click", start);
    resetBtn.addEventListener("click", reset);
    skipBtn.addEventListener("click", skip);
    soundBtn.addEventListener("click", function () {
      sound = !sound; soundBtn.setAttribute("aria-pressed", String(sound));
      soundBtn.querySelector(".lbl").textContent = sound ? "Ses açık" : "Ses kapalı";
      if (sound) ensureAudio();
    });
    skipBtn.disabled = true;

    function clamp(k, v) { var l = LIM[k]; v = Math.round((isNaN(v) ? l[0] : v) / l[2]) * l[2]; return Math.min(l[1], Math.max(l[0], v)); }
    function syncInputs() { Object.keys(cfg).forEach(function (k) { var i = $('input[name="t-' + k + '"]', tool); if (i) i.value = cfg[k]; }); }
    $$(".stepper", tool).forEach(function (st) {
      var k = st.getAttribute("data-k"), inp = $("input", st);
      $$("button", st).forEach(function (b) {
        b.addEventListener("click", function () {
          if (state !== "idle" && state !== "done") return;
          cfg[k] = clamp(k, cfg[k] + Number(b.getAttribute("data-step")) * LIM[k][2]);
          syncInputs(); if (state === "done") state = "idle"; build(); render(performance.now());
        });
      });
      inp.addEventListener("change", function () { cfg[k] = clamp(k, parseInt(inp.value, 10)); syncInputs(); if (state === "done") state = "idle"; build(); render(performance.now()); });
    });
    $$(".preset", tool).forEach(function (b) {
      b.addEventListener("click", function () {
        if (state !== "idle" && state !== "done") return;
        var v = b.getAttribute("data-p").split(",").map(Number);
        cfg.work = v[0]; cfg.rest = v[1]; cfg.rounds = v[2];
        syncInputs(); state = "idle"; doneEl.hidden = true; startBtn.querySelector("span").textContent = "Başlat"; build(); render(performance.now());
      });
    });
    var want = $("[data-want-trial]", tool);
    if (want) want.addEventListener("click", function () {
      var cb = document.querySelector('input[name="aralik"]');
      if (cb) { cb.checked = true; cb.dispatchEvent(new Event("change", { bubbles: true })); }
    });
    syncInputs(); build(); render(performance.now());
  });

  /* ---- 6. Deneme antrenmanı talebi ---- */
  $$('[data-tool="deneme-talebi"]').forEach(function (tool) {
    var warn = $(".hours-warn", tool), ival = $("[data-ival]", tool);
    var dayMap = { "Hafta içi": [0, 1, 2, 3, 4], "Cumartesi": [5], "Pazar": [6], "Fark etmez": [] };
    var update = wireMessage(tool, function () {
      var gun = radio(tool, "gun"), saat = radio(tool, "saat"), den = radio(tool, "deneyim"), hedef = checks(tool, "hedef"), ad = ($('input[name="ad"]', tool).value || "").trim();
      var useI = $('input[name="aralik"]', tool);
      if (ival) ival.textContent = intervalText() || "40 sn çalış / 20 sn dinlen × 8 tur";
      if (warn) warn.textContent = slotWarning(dayMap[gun] || [], saat);
      var L = ["Merhaba Sprint Fitness, web sitenizden yazıyorum.", "Deneme antrenmanı için uygun bir gün ve saat öğrenmek istiyorum."];
      if (gun) L.push("• Gün: " + gun);
      if (saat) L.push("• Saat: " + saat);
      if (den) L.push("• Deneyimim: " + den);
      if (hedef.length) L.push("• Hedefim: " + lowerFirst(hedef).join(", "));
      if (useI && useI.checked && intervalText()) L.push("• Denemek istediğim aralık: " + intervalText());
      if (ad) L.push("Adım: " + ad);
      L.push("Teşekkürler.");
      return L.join("\n");
    });
    document.addEventListener("interval-change", update);
  });

  /* ---- 7. Nabız kulvarları ---- */
  $$('[data-tool="nabiz-kulvarlari"]').forEach(function (tool) {
    var age = $('input[name="yas"]', tool), ageOut = $("[data-age]", tool), useRest = $('input[name="dinlenik-var"]', tool), rest = $('input[name="dinlenik"]', tool), restOut = $("[data-rest]", tool), restWrap = $("[data-rest-wrap]", tool), maxOut = $("[data-max]", tool), method = $("[data-method]", tool);
    var Z = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1]];
    function calc() {
      var a = parseInt(age.value, 10), max = 220 - a, rh = useRest.checked ? parseInt(rest.value, 10) : 0;
      ageOut.textContent = a; restOut.textContent = rest.value; maxOut.textContent = max;
      restWrap.hidden = !useRest.checked;
      method.textContent = useRest.checked ? "Dinlenik nabızla (Karvonen yöntemi) hesaplandı." : "Yalnız yaşla (220 − yaş) hesaplandı.";
      var lo0 = useRest.checked ? rh + 0.45 * (max - rh) : 0.45 * max;
      $$(".zone", tool).forEach(function (z, i) {
        var lo = useRest.checked ? rh + Z[i][0] * (max - rh) : Z[i][0] * max;
        var hi = useRest.checked ? rh + Z[i][1] * (max - rh) : Z[i][1] * max;
        $(".zt b", z).textContent = Math.round(lo) + "–" + Math.round(hi) + " atım/dk";
        var bar = $(".zb i", z);
        bar.style.left = ((lo - lo0) / (max - lo0) * 100).toFixed(1) + "%";
        bar.style.width = ((hi - lo) / (max - lo0) * 100).toFixed(1) + "%";
      });
    }
    tool.addEventListener("input", calc); tool.addEventListener("change", calc); calc();
  });

  /* ---- 8. Çanta listesi (yerel hatırlatma) ---- */
  $$("[data-bag]").forEach(function (list) {
    var boxes = $$('input[type="checkbox"]', list), meter = $(".bag-meter", list.parentNode);
    var saved = (store("sprint-canta") || "").split(",");
    boxes.forEach(function (b) { if (saved.indexOf(b.value) > -1) b.checked = true; });
    function upd() {
      var on = boxes.filter(function (b) { return b.checked; });
      store("sprint-canta", on.map(function (b) { return b.value; }).join(","));
      if (meter) { $(".bar i", meter).style.width = (on.length / boxes.length * 100) + "%"; $("span", meter).textContent = on.length + "/" + boxes.length + " hazır"; }
    }
    list.addEventListener("change", upd); upd();
  });

  /* ---- 9. Solaryum öz kontrol ---- */
  $$('[data-tool="solaryum-oz-kontrol"]').forEach(function (tool) {
    var out = $(".verdict", tool), left = $("[data-left]", tool);
    var RULES = {
      yas: ["stop", "18 yaşından küçükler için solaryum önerilmez."],
      tip1: ["stop", "Çok açık, hep yanan ve bronzlaşmayan ten (cilt tipi I) için solaryum önerilmez."],
      kanser: ["stop", "Kişisel ya da ailede cilt kanseri öyküsü varsa solaryumdan önce mutlaka dermatoloğa danışın."],
      ilac: ["stop", "Işığa duyarlılık yapabilen ilaç ya da krem kullanırken doktorunuza veya eczacınıza danışmadan seansa girmeyin."],
      yanar: ["ask", "Kolay yanan, zor bronzlaşan ya da çilli ten UV'ye daha hassastır; önce dermatoloğa danışın."],
      ben: ["ask", "Çok sayıda ya da düzensiz görünümlü beniniz varsa önce dermatoloğa kontrol ettirin."],
      hamile: ["ask", "Hamilelikte ya da bir cilt hastalığında seans öncesinde doktorunuza danışın."],
      yakin: ["ask", "Son 48 saatte seansa girdiyseniz ya da güneşte yandıysanız bekleyin; yanık geçmeden girmeyin."],
      gozluk: ["ask", "UV koruyucu gözlük olmadan seansa girmeyin; salonda sorun."]
    };
    var keys = Object.keys(RULES);
    function calc() {
      var stop = [], ask = [], answered = 0;
      keys.forEach(function (k) {
        var v = radio(tool, "s-" + k); if (!v) return; answered++;
        var bad = k === "gozluk" ? v === "hayir" : v === "evet";
        if (bad) (RULES[k][0] === "stop" ? stop : ask).push(RULES[k][1]);
      });
      if (left) left.textContent = answered < keys.length ? (keys.length - answered) + " soru yanıtlanmadı" : "Tüm sorular yanıtlandı";
      var cls = "verdict", h, p, items;
      if (!answered) { h = "Sonuç burada görünecek"; p = "Soruları yanıtladıkça uyarılar burada listelenir. Bu kontrol tıbbi değerlendirme yerine geçmez."; items = []; }
      else if (stop.length) { cls += " stop"; h = "Solaryum sizin için önerilmez"; p = "İşaretlediğiniz durumlardan en az biri ciddi bir uyarı. Önce doktorunuza ya da bir dermatoloğa danışın."; items = stop.concat(ask); }
      else if (ask.length) { cls += " ask"; h = "Önce danışın, sonra karar verin"; p = "Aşağıdaki konular için seans öncesinde doktorunuza ya da dermatoloğa danışmanız önerilir."; items = ask; }
      else { h = "Uyarı işareti seçmediniz, ama risk sıfır değil"; p = "UV ışını her seansta cildinizi etkiler; cilt kanseri ve erken yaşlanma riski seans sayısıyla artar. Karar vermeden önce şunları unutmayın:"; items = ["Her seansta UV koruyucu gözlük takın.", "Seansları seyrek ve kısa tutun; aynı gün güneşlenmeyle birleştirmeyin.", "Kızarıklık, kaşıntı ya da yeni/değişen bir ben görürseniz seanslara ara verip dermatoloğa gidin."]; }
      out.className = cls;
      out.innerHTML = "";
      var hh = document.createElement("h3"); hh.textContent = h; out.appendChild(hh);
      var pp = document.createElement("p"); pp.textContent = p; out.appendChild(pp);
      if (items.length) { var ul = document.createElement("ul"); items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); }); out.appendChild(ul); }
    }
    tool.addEventListener("change", calc);
    var rs = $("[data-reset]", tool);
    if (rs) rs.addEventListener("click", function () { $$('input[type="radio"]', tool).forEach(function (r) { r.checked = false; }); calc(); });
    calc();
  });
  $$('[data-tool="solaryum-soru"]').forEach(function (tool) {
    wireMessage(tool, function () {
      var q = checks(tool, "soru"), ad = ($('input[name="ad"]', tool) || { value: "" }).value.trim();
      var L = ["Merhaba Sprint Fitness, solaryum hakkında bilgi almak istiyorum."];
      if (q.length) { L.push("Öğrenmek istediklerim:"); q.forEach(function (x) { L.push("– " + x); }); }
      if (ad) L.push("Adım: " + ad);
      L.push("Teşekkürler.");
      return L.join("\n");
    });
  });

  /* ---- 10. Üyelik bilgi talebi ---- */
  $$('[data-tool="uyelik-bilgi"]').forEach(function (tool) {
    var warn = $(".hours-warn", tool);
    wireMessage(tool, function () {
      var ilgi = radio(tool, "ilgi"), gun = checks(tool, "gunler"), saat = radio(tool, "saat"), hedef = checks(tool, "hedef"), soru = checks(tool, "soru");
      var ad = ($('input[name="ad"]', tool).value || "").trim(), not = ($('input[name="not"]', tool).value || "").trim();
      var dIdx = gun.map(function (g) { return DAYS.indexOf(g); }).filter(function (i) { return i > -1; });
      if (warn) warn.textContent = slotWarning(dIdx, saat);
      var L = ["Merhaba Sprint Fitness, üyelik hakkında bilgi almak istiyorum."];
      if (ilgi) L.push("• İlgilendiğim: " + ilgi);
      if (gun.length) L.push("• Gelebileceğim günler: " + (gun.length === 7 ? "Her gün" : gun.join(", ")));
      if (saat) L.push("• Saat: " + saat);
      if (hedef.length) L.push("• Hedefim: " + lowerFirst(hedef).join(", "));
      if (soru.length) { L.push("Öğrenmek istediklerim:"); soru.forEach(function (x) { L.push("– " + x); }); }
      if (not) L.push("Not: " + not);
      if (ad) L.push("Adım: " + ad);
      L.push("Teşekkürler.");
      return L.join("\n");
    });
  });

  /* ---- 11. Haftalık hareket ölçer (DSÖ önerisi) ---- */
  $$('[data-tool="haftalik-hareket"]').forEach(function (tool) {
    var orta = $('input[name="orta"]', tool), yuk = $('input[name="yuksek"]', tool), guc = $('input[name="guc"]', tool);
    var o1 = $("[data-orta]", tool), o2 = $("[data-yuksek]", tool), o3 = $("[data-guc]", tool), fill = $(".who-bar .fill", tool), dot = $(".who-bar .dot", tool), out = $(".who-out", tool), CAP = 360;
    function calc() {
      var a = +orta.value, b = +yuk.value, g = +guc.value, eq = a + 2 * b, pc = Math.min(eq, CAP) / CAP * 100;
      o1.textContent = a; o2.textContent = b; o3.textContent = g;
      fill.style.width = pc + "%"; dot.style.left = pc + "%";
      var msg;
      if (eq < 150) msg = "Haftalık eşdeğeriniz <b>" + eq + " dk</b>. Önerilen en az 150 dakikaya " + (150 - eq) + " dakika kaldı; küçük adımlarla artırın.";
      else if (eq <= 300) msg = "Haftalık eşdeğeriniz <b>" + eq + " dk</b>. Önerilen 150–300 dakika aralığındasınız.";
      else msg = "Haftalık eşdeğeriniz <b>" + eq + " dk</b>. Önerilen aralığın üstündesiniz; dinlenme günlerini ve uykuyu ihmal etmeyin.";
      msg += g >= 2 ? " Kas güçlendirme: haftada " + g + " gün, öneriyi karşılıyor." : " Kas güçlendirme için haftada en az 2 gün önerilir (şu an " + g + ").";
      out.innerHTML = msg;
    }
    tool.addEventListener("input", calc); calc();
  });

  /* ---- 12. Örnek hafta planı sekmeleri ---- */
  $$("[data-plans]").forEach(function (box) {
    var tabs = $$('[role="tab"]', box), panels = $$('[role="tabpanel"]', box);
    function show(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p) { p.hidden = p.id !== t.getAttribute("aria-controls"); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -9;
        if (j !== -9) { e.preventDefault(); var n = tabs[(j + tabs.length) % tabs.length]; n.focus(); show(n); }
      });
    });
    show(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
  });

  /* ---- 13. Ne zaman gelsem? ---- */
  $$('[data-tool="ne-zaman-gelsem"]').forEach(function (tool) {
    var timeIn = $('input[name="saat"]', tool), out = $(".visit-out", tool), n = istanbulNow();
    var todayBox = $('input[name="gun"][value="' + n.d + '"]', tool);
    if (todayBox) todayBox.checked = true;
    var t = Math.ceil((n.m + 1) / 15) * 15; timeIn.value = hhmm(t);
    function verdict() {
      var d = parseInt(radio(tool, "gun") || n.d, 10), tv = timeIn.value || "18:00", m = mins(tv), h = HOURS[String(d)][0], o = mins(h[0]), c = mins(h[1]);
      var title, text, ok = false;
      if (m >= o && m < c) {
        var left = c - m, hh = Math.floor(left / 60), mm = left % 60;
        ok = true; title = DAYS[d] + " " + tv + ": açık";
        text = "Kapanışa " + (hh ? hh + " saat " : "") + (mm ? mm + " dakika" : "") + " var (" + h[1] + ").";
        if (left < 60) { ok = false; text += " Kapanışa az kalıyor; rahat bir antrenman için daha erken gelmeyi düşünün."; }
      } else if (m < o) {
        title = DAYS[d] + " " + tv + ": henüz kapalı"; text = "O gün " + h[0] + "–" + h[1] + " arası açık. En erken " + h[0] + " sonrası gelebilirsiniz.";
      } else {
        var nd = (d + 1) % 7, nh = HOURS[String(nd)][0];
        title = DAYS[d] + " " + tv + ": kapalı"; text = "O gün kapanış saati " + h[1] + ". Ertesi gün (" + DAYS[nd] + ") açılış " + nh[0] + ".";
      }
      out.className = "visit-out" + (ok ? " ok" : "");
      out.innerHTML = "";
      var b = document.createElement("b"); b.textContent = title; out.appendChild(b);
      var p = document.createElement("p"); p.textContent = text; out.appendChild(p);
      return { d: d, tv: tv, open: m >= o && m < c };
    }
    wireMessage(tool, function () {
      var v = verdict();
      return "Merhaba Sprint Fitness, " + DAYS[v.d] + " günü saat " + v.tv + " civarında salona uğramak istiyorum. Bu saat uygun mu?\nTeşekkürler.";
    });
  });

  /* Rehberdeki "Zamanlayıcıya al" düğmeleri */
  $$("[data-use]").forEach(function (b) {
    b.addEventListener("click", function () {
      var pr = document.querySelector('.preset[data-p="' + b.getAttribute("data-use") + '"]'), tm = document.getElementById("zamanlayici");
      if (pr) { var st = pr.closest("fieldset"); if (st && st.disabled) { var rs = document.querySelector('[data-t="reset"]'); if (rs) rs.click(); } pr.click(); }
      if (tm) {
        tm.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        var sb = document.querySelector('[data-t="start"]');
        if (sb) setTimeout(function () { sb.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
      }
    });
  });

  /* Sayfa içi bağlantılarda yumuşak kaydırma (atlama bağlantısı hariç) */
  if (!reduceMotion) document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains("skip")) return;
    var id = a.getAttribute("href").slice(1), t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: "smooth", block: "start" });
    try { history.replaceState(null, "", "#" + id); } catch (er) { }
  });

  /* Araç formları sunucuya gönderilmez */
  $$("[data-tool] form").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); }); });

  /* Hareket azaltma tercihinde hero animasyonu zaten CSS ile kapanır */
  if (reduceMotion) root.classList.add("reduce");
})();
