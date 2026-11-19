/* MRV Teknik — site betiği (çatı/kütüphane yok). */

/* ---- Açık/kapalı durumu: kit/status.js'ten kopyalandı ---- */
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

(function () {
  "use strict";
  var WA = "https://wa.me/905325832420";
  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["13:00", "20:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* depolama kapalı olabilir */ } }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }

  /* ---------- mevsim anahtarı ---------- */
  var modeFns = [];
  var dialApi = null;
  function getMode() { return root.getAttribute("data-mode") === "cool" ? "cool" : "heat"; }
  function syncSwitch() {
    $$("[data-set-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set-mode") === getMode() ? "true" : "false"); });
  }
  function setMode(m, persist) {
    if (m !== "heat" && m !== "cool") return;
    var changed = getMode() !== m;
    root.setAttribute("data-mode", m);
    if (persist) sset("mrv-mode", m);
    syncSwitch();
    if (changed) modeFns.forEach(function (fn) { fn(m); });
  }
  function onMode(fn) { modeFns.push(fn); }
  if (!root.getAttribute("data-mode")) root.setAttribute("data-mode", "heat");
  syncSwitch();
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-mode], [data-go-mode]");
    if (!b) return;
    var m = b.getAttribute("data-set-mode") || b.getAttribute("data-go-mode");
    if (dialApi) dialApi.go(m); else setMode(m, true);
  });

  /* ---------- menü ---------- */
  var menuBtn = $(".menu-btn"), nav = $("#site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      var t = $(".sr-only", menuBtn); if (t) t.textContent = open ? "Menüyü kapat" : "Menüyü aç";
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false); });
  }

  /* ---------- canlı durum ---------- */
  function statusLine(s) {
    if (!s.known) return "Saatler için arayın";
    if (s.all24) return "Şu an açık · bugün 24 saat";
    if (s.open) return "Şu an açık · kapanış " + s.closesAt;
    if (s.opensAt === "00:00") return "Şu an kapalı · gece 00:00'da açılıyor";
    if (s.opensAt) return "Şu an kapalı · açılış " + s.opensWhen + " " + s.opensAt;
    return s.text;
  }
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = statusLine(s);
      var live = el.closest(".live");
      if (live) { live.classList.toggle("is-open", s.open); live.classList.toggle("is-closed", !s.open); }
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* haftalık çubuklar ve tablo: bugünü işaretle */
  (function () {
    var n = istanbulNow();
    $$("[data-week] .week__row").forEach(function (r) {
      if (+r.getAttribute("data-day") !== n.d) return;
      r.classList.add("is-today");
      var bar = $(".week__bar", r), mk = document.createElement("span");
      mk.className = "week__now"; mk.style.left = (n.m / 1440 * 100).toFixed(2) + "%"; mk.title = "Şu an";
      bar.appendChild(mk);
    });
    $$("[data-hours-table] tr[data-day]").forEach(function (r) { r.classList.toggle("is-today", +r.getAttribute("data-day") === n.d); });
  })();

  /* ---------- kopyalama ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (!b) return;
    var src = $(b.getAttribute("data-copy")), text = src ? src.textContent : "";
    var orig = b.innerHTML;
    var done = function () { b.innerHTML = orig.replace(/(<\/svg>)[\s\S]*$/, "$1") + "Kopyalandı"; setTimeout(function () { b.innerHTML = orig; }, 2200); };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { /* sessiz */ }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  /* ---------- termostat kadranı (ana sayfa) ---------- */
  var dialEl = $("[data-dial]");
  if (dialEl) (function (el) {
    var svg = $("svg", el), knob = $("[data-knob]", svg), thumb = $("[data-thumb]", svg);
    var actC = $('[data-active="cool"]', svg), actH = $('[data-active="heat"]', svg), tickG = $("[data-ticks]", svg);
    var modeEl = $("[data-dial-mode]", el), tempEl = $("[data-dial-temp]", el);
    var hero = $("[data-hero]"), tip = $("[data-dial-tip]");
    var C = 200, R = 150, MAX = 140, DEF = { heat: 42, cool: -42 }, NS = "http://www.w3.org/2000/svg";
    function P(a, r) { var t = a * Math.PI / 180; return [C + r * Math.sin(t), C - r * Math.cos(t)]; }
    function arc(a1, a2) {
      var p1 = P(a1, R), p2 = P(a2, R);
      return "M" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + "A" + R + " " + R + " 0 " + (a2 - a1 > 180 ? 1 : 0) + " 1 " + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
    }
    var ticks = [];
    for (var a = -MAX; a <= MAX; a += 7) {
      if (a === 0) continue;
      var major = a % 35 === 0, p1 = P(a, major ? 163 : 166), p2 = P(a, 176), ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", p1[0].toFixed(2)); ln.setAttribute("y1", p1[1].toFixed(2)); ln.setAttribute("x2", p2[0].toFixed(2)); ln.setAttribute("y2", p2[1].toFixed(2));
      ln.setAttribute("class", "dial__tick" + (major ? " dial__tick--major" : ""));
      tickG.appendChild(ln); ticks.push({ a: a, el: ln });
    }
    var top = document.createElementNS(NS, "circle"); top.setAttribute("cx", "200"); top.setAttribute("cy", "26"); top.setAttribute("r", "3.5"); top.setAttribute("fill", "#F3EFE8"); tickG.appendChild(top);

    function tempFor(x) { return x >= 0 ? 18 + x / MAX * 10 : 28 + x / MAX * 10; }
    function fmt(t) { var r = Math.round(t * 2) / 2; return r % 1 === 0 ? String(r) : String(r).replace(".", ","); }
    function tipFor(m, t) {
      if (m === "heat") {
        if (t <= 19.5) return "Serin ayar. Gece ya da evde kimse yokken termostatı biraz düşürmek, tüketimi azaltmanın bilinen yoludur.";
        if (t <= 22.5) return "Kışın çoğu ev için rahat aralık 20–22 °C civarıdır. Petekler eşit ısınmıyorsa sorun çoğu zaman termostatta değil tesisattadır.";
        return "Yüksek ayar odayı daha hızlı ısıtmaz; yalnızca hedefi yükseltir ve kombinin daha uzun çalışmasına yol açar.";
      }
      if (t >= 25.5) return "Hafif soğutma. Dış hava ile iç ortam arasındaki farkı çok açmamak hem konfor hem tüketim için iyidir.";
      if (t >= 23) return "Yazın çoğu kişi 24–26 °C civarını rahat bulur. Soğutma zayıfsa önce filtreleri kontrol edin.";
      return "Çok düşük ayar odayı belirgin biçimde daha hızlı soğutmaz; hedefe ulaşmak için cihazı daha uzun çalıştırır.";
    }
    var ang = 0, lastTip = "";
    function set(x, user) {
      x = Math.max(-MAX, Math.min(MAX, x)); ang = x;
      var m = x >= 0 ? "heat" : "cool", t = tempFor(x), p = P(x, R);
      knob.setAttribute("transform", "rotate(" + x.toFixed(2) + " 200 200)");
      thumb.setAttribute("transform", "translate(" + p[0].toFixed(2) + " " + p[1].toFixed(2) + ")");
      actH.setAttribute("d", m === "heat" && x > 3 ? arc(3, x) : "");
      actC.setAttribute("d", m === "cool" && x < -3 ? arc(x, -3) : "");
      ticks.forEach(function (tk) { tk.el.classList.toggle("is-lit", m === "heat" ? tk.a > 0 && tk.a <= x : tk.a < 0 && tk.a >= x); });
      modeEl.textContent = m === "heat" ? "Isıtma" : "Soğutma";
      tempEl.textContent = fmt(t);
      if (hero) hero.style.setProperty("--t", ((x + MAX) / (2 * MAX)).toFixed(3));
      svg.setAttribute("aria-valuenow", String(Math.round(x / 7)));
      svg.setAttribute("aria-valuetext", (m === "heat" ? "Isıtma" : "Soğutma") + ", hedef " + fmt(t) + " derece");
      var tp = tipFor(m, t); if (tip && tp !== lastTip) { tip.textContent = tp; lastTip = tp; }
      if (m !== getMode()) setMode(m, !!user); else if (user) sset("mrv-mode", m);
    }
    var raf = 0;
    function animateTo(target, dur, user) {
      cancelAnimationFrame(raf);
      if (reduce) { set(target, user); return; }
      var from = ang, t0 = 0;
      var ease = function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
      var step = function (now) {
        if (!t0) t0 = now;
        var k = Math.min(1, (now - t0) / dur);
        set(from + (target - from) * ease(k), user && k === 1);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function angleFrom(e) {
      var r = svg.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      var a2 = Math.atan2(x, -y) * 180 / Math.PI;
      if (Math.abs(a2) > MAX) a2 = ang >= 0 ? MAX : -MAX;
      return a2;
    }
    var dragging = false;
    svg.addEventListener("pointerdown", function (e) {
      cancelAnimationFrame(raf); dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* yok say */ }
      set(angleFrom(e), true); e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) { if (dragging) set(angleFrom(e), true); });
    var end = function () { dragging = false; };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end); svg.addEventListener("lostpointercapture", end);
    svg.addEventListener("keydown", function (e) {
      var d = { ArrowRight: 7, ArrowUp: 7, ArrowLeft: -7, ArrowDown: -7, PageUp: 35, PageDown: -35 }[e.key];
      if (d) { e.preventDefault(); cancelAnimationFrame(raf); set(ang + d, true); }
      else if (e.key === "Home") { e.preventDefault(); set(-MAX, true); }
      else if (e.key === "End") { e.preventDefault(); set(MAX, true); }
    });
    $$("[data-dial-go]").forEach(function (b) { b.addEventListener("click", function () { animateTo(DEF[b.getAttribute("data-dial-go")], 900, true); }); });
    dialApi = { go: function (m) { animateTo(DEF[m], 900, true); } };
    var m0 = getMode();
    if (reduce) set(DEF[m0], false);
    else { set(m0 === "heat" ? -70 : 70, false); animateTo(DEF[m0], 1100, false); }
  })(dialEl);

  /* ---------- mevsim kontrol listesi ---------- */
  $$("[data-checklist]").forEach(function (el) {
    var ring = $("[data-ring]", el), done = $("[data-check-done]", el), total = $("[data-check-total]", el);
    var state = $("[data-check-state]", el), prev = $("[data-check-preview]", el), wa = $("[data-check-wa]", el);
    var CIRC = 2 * Math.PI * 66, NS = "http://www.w3.org/2000/svg", tg = $("[data-ring-ticks]", el);
    for (var i = 0; i < 40; i++) {
      var a = i / 40 * Math.PI * 2, ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", (80 + 75 * Math.cos(a)).toFixed(2)); ln.setAttribute("y1", (80 + 75 * Math.sin(a)).toFixed(2));
      ln.setAttribute("x2", (80 + 79 * Math.cos(a)).toFixed(2)); ln.setAttribute("y2", (80 + 79 * Math.sin(a)).toFixed(2));
      tg.appendChild(ln);
    }
    function list(m) { return $('[data-list="' + (m || getMode()) + '"]', el); }
    ["heat", "cool"].forEach(function (m) {
      var saved = []; try { saved = JSON.parse(sget("mrv-check-" + m) || "[]"); } catch (e) { saved = []; }
      $$("input", list(m)).forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; });
    });
    function update() {
      var m = getMode(), boxes = $$("input", list(m)), on = [];
      boxes.forEach(function (b, i) { if (b.checked) on.push(i); });
      var n = on.length, N = boxes.length, heat = m === "heat";
      sset("mrv-check-" + m, JSON.stringify(on));
      done.textContent = n; total.textContent = N;
      ring.style.strokeDashoffset = (CIRC * (1 - n / N)).toFixed(2);
      state.textContent = n === 0 ? "Henüz işaretlenen madde yok." : n === N ? "Tüm maddeler tamam. Düzenli bakımı yine de aksatmayın." : (N - n) + " madde kaldı. Eksikleri aşağıdaki mesajla iletebilirsiniz.";
      var missing = boxes.filter(function (b) { return !b.checked; }).map(function (b) { return "• " + b.value; });
      var msg = "Merhaba MRV Teknik, siteden " + (heat ? "kış öncesi kombi ve petek" : "yaz öncesi klima") + " kontrol listesini doldurdum (" + n + "/" + N + " tamam).";
      msg += missing.length ? "\n\nKontrol edilmesini istediğim maddeler:\n" + missing.join("\n") : "\n\nTüm maddeler tamam; yine de bakım için bilgi almak istiyorum.";
      msg += "\n\n" + (heat ? "Kombi" : "Klima") + " bakımı için uygun bir zaman konuşabilir miyiz?";
      prev.textContent = msg; wa.href = waLink(msg);
    }
    el.addEventListener("change", update);
    var rs = $("[data-check-reset]", el);
    if (rs) rs.addEventListener("click", function () { $$("input", list()).forEach(function (b) { b.checked = false; }); update(); });
    onMode(update);
    update();
  });

  /* ---------- belirti rehberi (sekmeler) ---------- */
  $$("[data-sym]").forEach(function (el) {
    var tabs = $$('[role="tab"]', el), panels = $$(".sym__panel", el);
    function show(id, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("aria-controls") === id;
        t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(function (p) { p.hidden = p.id !== id; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t.getAttribute("aria-controls")); try { history.replaceState(null, "", "#" + t.getAttribute("aria-controls")); } catch (e) { /* yok say */ } });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return; e.preventDefault();
        var nt = tabs[(i + d + tabs.length) % tabs.length]; show(nt.getAttribute("aria-controls"), true);
      });
    });
    function fromHash(scroll) {
      var h = decodeURIComponent(location.hash.slice(1));
      var hit = panels.some(function (p) { return p.id === h; });
      show(hit ? h : panels[0].id);
      if (hit && scroll) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 30);
    }
    fromHash(true);
    window.addEventListener("hashchange", function () { fromHash(true); });
  });

  /* ---------- parça açıklamalı çizim ---------- */
  $$("[data-xray]").forEach(function (el) {
    var hs = $$(".hs", el), parts = $$(".part", el), cur = 0;
    var tEl = $("[data-xray-title]", el), xEl = $("[data-xray-text]", el), cEl = $("[data-xray-count]", el);
    function on(key) {
      el.classList.add("has-sel");
      parts.forEach(function (p, i) { if (p.getAttribute("data-part") === key) cur = i; });
      var pp = parts[cur];
      if (tEl) tEl.textContent = $(".part__btn", pp).textContent;
      if (xEl) xEl.textContent = $("dd", pp).textContent;
      if (cEl) cEl.textContent = (cur + 1) + " / " + parts.length;
      hs.forEach(function (h) { var o = h.getAttribute("data-part") === key; h.classList.toggle("is-on", o); h.setAttribute("aria-pressed", o ? "true" : "false"); });
      parts.forEach(function (p) { var o = p.getAttribute("data-part") === key; p.classList.toggle("is-on", o); $(".part__btn", p).setAttribute("aria-expanded", o ? "true" : "false"); });
      $$("[data-hl]", el).forEach(function (g) { g.classList.toggle("is-hl", g.getAttribute("data-hl") === key); });
    }
    hs.forEach(function (h) { h.addEventListener("click", function () { on(h.getAttribute("data-part")); }); });
    parts.forEach(function (p) { $(".part__btn", p).addEventListener("click", function () { on(p.getAttribute("data-part")); }); });
    var step = function (d) { on(parts[(cur + d + parts.length) % parts.length].getAttribute("data-part")); };
    var pv = $("[data-xray-prev]", el), nx = $("[data-xray-next]", el);
    if (pv) pv.addEventListener("click", function () { step(-1); });
    if (nx) nx.addEventListener("click", function () { step(1); });
    if (parts[0]) on(parts[0].getAttribute("data-part"));
  });

  /* ---------- basınç göstergesi ---------- */
  $$("[data-gauge]").forEach(function (el) {
    var input = $("input[type=range]", el), needle = $("[data-needle]", el), val = $("[data-gauge-val]", el), out = $("[data-gauge-out]", el);
    var segs = $$("[data-hot]", el), hot = false;
    var T = {
      cold: [
        [0.8, "low", "Düşük", "Çoğu kombi bu seviyede uyarı verir ya da çalışmayı durdurur. Kılavuzdaki tarife göre doldurma musluğundan yavaşça su ekleyin. Kısa sürede yine düşerse tesisatta kaçak olabilir; servis çağırın."],
        [1.0, "low", "Sınırda", "Kombi soğukken bu değerdeyse, kılavuzda önerilen değere tamamlamanız gerekebilir."],
        [2.0, "ok", "Çoğu cihaz için olağan", "Soğukken çoğu kombide beklenen aralık yaklaşık 1–2 bardır. Kesin değer için cihazınızın kılavuzuna bakın."],
        [2.5, "warm", "Soğukken biraz yüksek", "Kombi henüz ısınmamışken bu değer fazla dolum olabilir. Isınınca basınç bir miktar daha yükselir; takip edin."],
        [9, "high", "Yüksek", "Emniyet ventili genellikle 3 bar civarında su atmaya başlar (değer cihaza göre değişir). Soğukken bu kadar yüksekse doldurma musluğu kaçırıyor olabilir; servis çağırın."]
      ],
      hot: [
        [0.8, "low", "Düşük", "Su ısınınca basınç yükselir; sıcakken bile bu seviyedeyse sistemde su eksiktir. Kombi soğuyunca yeniden okuyun ve kılavuza göre tamamlayın. Sık tekrarlıyorsa kaçak olabilir."],
        [1.0, "low", "Sıcakken düşük", "Çalışırken bile 1 barın altındaysa su eksik olabilir. Soğuyunca tekrar okuyun; kılavuzdaki değere tamamlayın."],
        [2.5, "ok", "Çalışırken olağan olabilir", "Su ısındıkça basınç bir miktar yükselir; çalışırken bu aralık çoğu cihazda olağandır. Kesin değer için kılavuza bakın."],
        [2.8, "warm", "Sınırda", "Isınınca basınç bu kadar yükseliyorsa genleşme tankının ön basıncı düşmüş olabilir. Takip edin; yükselmeye devam ederse servis çağırın."],
        [9, "high", "Yüksek", "Emniyet ventili genellikle 3 bar civarında su atmaya başlar (değer cihaza göre değişir). Isınınca hızla bu seviyeye çıkıyorsa genleşme tankı kontrol edilmeli; servis çağırın."]
      ]
    };
    function upd() {
      var v = parseFloat(input.value), rows = T[hot ? "hot" : "cold"], row = rows[rows.length - 1];
      for (var i = 0; i < rows.length; i++) { if (v < rows[i][0]) { row = rows[i]; break; } }
      needle.style.transform = "rotate(" + (-120 + v / 4 * 240).toFixed(1) + "deg)";
      val.textContent = v.toFixed(1).replace(".", ",") + " bar";
      input.setAttribute("aria-valuetext", v.toFixed(1).replace(".", ",") + " bar");
      out.setAttribute("data-level", row[1]);
      out.innerHTML = "<b>" + row[2] + "</b><p>" + row[3] + "</p>";
    }
    input.addEventListener("input", upd);
    segs.forEach(function (b) { b.addEventListener("click", function () { hot = b.getAttribute("data-hot") === "1"; segs.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); upd(); }); });
    upd();
  });

  /* ---------- petek ısı haritası ---------- */
  $$("[data-heatmap]").forEach(function (el) {
    var S = {
      saglikli: ["#E4572E", "#EB6B3C", "#F08A57"],
      hava: ["#6AA6E6", "#E98A5C", "#E4572E"],
      tortu: ["#E4572E", "#B07FA0", "#2E86DE"],
      soguk: ["#7DB3EA", "#4C93E0", "#2E78C8"]
    };
    var stops = $$("[data-stop]", el), btns = $$("[data-hm]", el), texts = $$("[data-hm-text]", el);
    function show(k) {
      S[k].forEach(function (c, i) { stops.forEach(function (s) { if (+s.getAttribute("data-stop") === i) s.setAttribute("stop-color", c); }); });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-hm") === k ? "true" : "false"); });
      texts.forEach(function (t) { t.hidden = t.getAttribute("data-hm-text") !== k; });
      el.setAttribute("data-state", k);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-hm")); }); });
    show("tortu");
  });

  /* ---------- petek belirti testi ---------- */
  $$("[data-petektest]").forEach(function (el) {
    var boxes = $$("input[type=checkbox]", el), bar = $("[data-meter]", el), res = $("[data-result]", el);
    var prev = $("[data-pt-preview]", el), wa = $("[data-pt-wa]", el), cnt = $("[name=petek-sayisi]", el), semt = $("[name=pt-semt]", el);
    var R = {
      tortu: ["Tortu ve çamur belirtisi", "Seçtikleriniz, peteklerin dibinde tortu birikmesine işaret edebilir. Bu durumda petek temizliği gündeme gelir; tesisatın durumu yerinde görülerek yöntem belirlenir."],
      hava: ["Hava belirtisi", "Seçtikleriniz peteklerde hava olduğuna işaret ediyor. Önce aşağıdaki adımlarla peteklerin havasını alın, ardından kombi basıncını kontrol edin. Hava sık sık birikiyorsa tesisatı kontrol ettirin."],
      vana: ["Vana ya da hat sorunu olabilir", "Hiç ısınmayan petek için önce petek vanalarının açık olduğunu ve termostatik başlığın takılı kalmadığını kontrol edin. Sorun sürerse hat tıkanıklığı ya da dengesizlik olabilir."],
      genel: ["Genel verim belirtisi", "Seçtikleriniz tek başına kesin bir neden göstermiyor; tortu, hava, ayar ya da kombi kaynaklı olabilir. Isı haritasındaki durumlarla peteklerinizi karşılaştırın; emin olamazsanız sorun, birlikte bakalım."],
      yok: ["Henüz belirti seçmediniz", "Evinizdeki duruma uyan maddeleri işaretleyin; olası neden ve ilk yapılacaklar burada görünür."]
    };
    function upd() {
      var on = boxes.filter(function (b) { return b.checked; }), k = {};
      on.forEach(function (b) { k[b.getAttribute("data-k")] = true; });
      var key = k.tortu ? "tortu" : k.hava ? "hava" : k.vana ? "vana" : on.length ? "genel" : "yok";
      bar.style.width = (on.length / boxes.length * 100).toFixed(1) + "%";
      var extra = (key === "tortu" && k.hava) ? "<p>Hava belirtisi de var: temizlik öncesinde peteklerin havasını almak, durumu netleştirmeye yardım eder.</p>" : "";
      res.innerHTML = "<b>" + R[key][0] + "</b><p>" + R[key][1] + "</p>" + extra;
      var msg = "Merhaba MRV Teknik, petekler hakkında bilgi almak istiyorum.";
      if (on.length) msg += "\n\nGözlemlerim:\n" + on.map(function (b) { return "• " + b.value; }).join("\n");
      if (cnt && cnt.value.trim()) msg += "\n\nPetek sayısı: " + cnt.value.trim();
      if (semt && semt.value.trim()) msg += "\nSemt / mahalle: " + semt.value.trim();
      msg += "\n\nPetek temizliği gerekip gerekmediğini birlikte değerlendirebilir miyiz?";
      prev.textContent = msg; wa.href = waLink(msg);
    }
    el.addEventListener("change", upd); el.addEventListener("input", upd);
    upd();
  });

  /* ---------- servis talebi formu ---------- */
  $$("[data-request]").forEach(function (form) {
    var prev = $("[data-req-preview]"), wa = $("[data-req-wa]"), note = $("[data-req-note]");
    var groups = $$("[data-for]", form), codeRow = $("[data-code-row]", form);
    var touched = false;
    function val(name) { var el = form.elements[name]; return el ? (el.value || "").trim() : ""; }
    function radio(name) { var el = $('input[name="' + name + '"]:checked', form); return el ? el.value : ""; }
    function device() { return $('input[name="cihaz"]:checked', form); }
    function syncGroups() {
      var d = device(), k = d ? d.getAttribute("data-key") : "";
      groups.forEach(function (g) { g.hidden = g.getAttribute("data-for") !== k; });
      if (codeRow) codeRow.hidden = !(k === "kombi" || k === "klima");
    }
    function build() {
      syncGroups();
      var d = device(), k = d ? d.getAttribute("data-key") : "";
      var issue = k ? radio("sorun-" + k) : "";
      var L = ["Merhaba MRV Teknik, servis talebim var."];
      L.push("");
      L.push("Cihaz: " + (d ? d.value : "(seçilmedi)"));
      L.push("Sorun: " + (issue || "(seçilmedi)"));
      if (val("marka")) L.push("Marka / model: " + val("marka"));
      if (codeRow && !codeRow.hidden && val("kod")) L.push("Ekrandaki kod / uyarı: " + val("kod"));
      if (radio("sure")) L.push("Ne zamandır: " + radio("sure"));
      if (val("semt")) L.push("Semt / mahalle: " + val("semt"));
      if (radio("zaman")) L.push("Uygun zaman: " + radio("zaman"));
      if (val("ad")) L.push("Adım: " + val("ad"));
      if (val("not")) L.push("Not: " + val("not"));
      L.push("");
      L.push("(Bu mesaj MRV Teknik sitesindeki talep formuyla hazırlandı.)");
      var msg = L.join("\n");
      prev.textContent = msg; wa.href = waLink(msg);
      if (note) note.textContent = d && issue ? "Mesaj hazır. WhatsApp'ta açıldığında gönder tuşuna siz basarsınız." : "Cihaz ve sorunu seçin; mesaj kendiliğinden tamamlanır.";
    }
    var qs = {}; try { new URLSearchParams(location.search).forEach(function (v, k) { qs[k] = v; }); } catch (e) { qs = {}; }
    var pick = qs.cihaz ? $('input[name="cihaz"][data-key="' + qs.cihaz + '"]', form) : null;
    if (pick) { pick.checked = true; touched = true; }
    else { var def = $('input[name="cihaz"][data-key="' + (getMode() === "cool" ? "klima" : "kombi") + '"]', form); if (def) def.checked = true; }
    if (qs.sorun) {
      var k0 = device() ? device().getAttribute("data-key") : "";
      var s0 = $('input[name="sorun-' + k0 + '"][data-key="' + qs.sorun + '"]', form);
      if (s0) s0.checked = true;
    }
    form.addEventListener("change", function (e) { if (e.target.name === "cihaz") touched = true; build(); });
    form.addEventListener("input", build);
    form.addEventListener("submit", function (e) { e.preventDefault(); build(); window.open(wa.href, "_blank", "noopener"); });
    onMode(function (m) {
      if (touched) return;
      var def2 = $('input[name="cihaz"][data-key="' + (m === "cool" ? "klima" : "kombi") + '"]', form);
      if (def2) { def2.checked = true; build(); }
    });
    build();
  });

  /* ---------- klima montaj ön bilgi ---------- */
  $$("[data-montaj]").forEach(function (form) {
    var prev = $("[data-mt-preview]", form), wa = $("[data-mt-wa]", form);
    function radio(name) { var el = $('input[name="' + name + '"]:checked', form); return el ? el.value : ""; }
    function val(name) { var el = form.elements[name]; return el ? (el.value || "").trim() : ""; }
    function build() {
      var L = ["Merhaba MRV Teknik, klima montajı için bilgi almak istiyorum.", ""];
      L.push("İş: " + (radio("mt-is") || "(seçilmedi)"));
      if (radio("mt-cihaz")) L.push("Cihaz: " + radio("mt-cihaz"));
      if (val("mt-oda")) L.push("Oda büyüklüğü: yaklaşık " + val("mt-oda") + " m²");
      if (radio("mt-dis")) L.push("Dış ünite yeri: " + radio("mt-dis"));
      if (val("mt-kat")) L.push("Kat: " + val("mt-kat"));
      if (val("mt-semt")) L.push("Semt / mahalle: " + val("mt-semt"));
      if (val("mt-not")) L.push("Not: " + val("mt-not"));
      L.push("", "Keşif ve ücret için bilgi verebilir misiniz?");
      var msg = L.join("\n"); prev.textContent = msg; wa.href = waLink(msg);
    }
    form.addEventListener("change", build); form.addEventListener("input", build);
    form.addEventListener("submit", function (e) { e.preventDefault(); build(); window.open(wa.href, "_blank", "noopener"); });
    build();
  });

  /* ---------- 24 saat kadranı (iletişim) ---------- */
  $$("[data-clock]").forEach(function (el) {
    var svg = $("svg", el), arcEl = $("[data-clock-arc]", svg), full = $("[data-clock-full]", svg), needle = $("[data-clock-needle]", svg);
    var dayEl = $("[data-clock-day]", el), hrsEl = $("[data-clock-hrs]", el), btns = $$("[data-clock-btn]", el), tg = $("[data-clock-ticks]", svg);
    var C = 150, R = 112, NS = "http://www.w3.org/2000/svg";
    function P(deg, r) { var t = deg * Math.PI / 180; return [C + r * Math.sin(t), C - r * Math.cos(t)]; }
    for (var h = 0; h < 24; h++) {
      var d = h * 15, maj = h % 6 === 0, a = P(d, maj ? 132 : 136), b = P(d, 142), ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", a[0].toFixed(1)); ln.setAttribute("y1", a[1].toFixed(1)); ln.setAttribute("x2", b[0].toFixed(1)); ln.setAttribute("y2", b[1].toFixed(1));
      ln.setAttribute("stroke", maj ? "#1A1D21" : "#A8A096"); ln.setAttribute("stroke-width", maj ? "3" : "1.6"); ln.setAttribute("stroke-linecap", "round");
      tg.appendChild(ln);
    }
    function mins(s) { var x = s.split(":"); return +x[0] * 60 + +x[1]; }
    var now = istanbulNow();
    function show(day) {
      var rg = HOURS[String(day)] || [];
      btns.forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-clock-btn") === day ? "true" : "false"); });
      dayEl.textContent = DAYS[day];
      if (!rg.length) { arcEl.setAttribute("d", ""); full.style.display = "none"; hrsEl.textContent = "Kapalı"; }
      else if (rg[0][0] === "00:00" && rg[0][1] === "24:00") { arcEl.setAttribute("d", ""); full.style.display = ""; hrsEl.textContent = "24 saat açık"; }
      else {
        var s = mins(rg[0][0]) / 1440 * 360, e = mins(rg[0][1]) / 1440 * 360, p1 = P(s, R), p2 = P(e, R);
        full.style.display = "none";
        arcEl.setAttribute("d", "M" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + "A" + R + " " + R + " 0 " + (e - s > 180 ? 1 : 0) + " 1 " + p2[0].toFixed(2) + " " + p2[1].toFixed(2));
        hrsEl.textContent = rg[0][0] + "–" + rg[0][1];
      }
      var today = day === now.d;
      needle.style.display = today ? "" : "none";
      if (today) needle.setAttribute("transform", "rotate(" + (now.m / 1440 * 360).toFixed(2) + " 150 150)");
    }
    btns.forEach(function (b) {
      if (+b.getAttribute("data-clock-btn") === now.d) b.classList.add("is-today");
      b.addEventListener("click", function () { show(+b.getAttribute("data-clock-btn")); });
    });
    show(now.d);
  });
})();
