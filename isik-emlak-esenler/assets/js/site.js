/* Işık Emlak Danışmanlık — site.js (kütüphanesiz) */

/* ---- Açık/kapalı durumu (kit/status.js kopyası) ---- */
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
  var WA = "https://wa.me/905366619376";
  var HOURS = { "0": [["09:00", "20:00"]], "1": [["09:00", "20:00"]], "2": [["09:00", "20:00"]], "3": [["09:00", "20:00"]], "4": [["09:00", "20:00"]], "5": [["09:00", "20:00"]], "6": [["12:00", "20:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var RM = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function low(s) { return String(s).toLocaleLowerCase("tr-TR"); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function copyText(text, out) {
    function done(ok) {
      if (!out) return;
      out.textContent = ok ? "Panoya kopyalandı." : "Kopyalanamadı; metni seçip elle kopyalayın.";
      clearTimeout(out._t); out._t = setTimeout(function () { out.textContent = ""; }, 3200);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }

  /* ---- canlı durum ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-shop]").forEach(function (el) {
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("tr[data-d]").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-d") === s.dayIndex); });
    return s;
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- menü (telefonda asansör paneli) ---- */
  var mbtn = $(".menu-btn"), nav = $("#menu");
  if (mbtn && nav) {
    var setOpen = function (o) {
      if (o) {
        var hb = $(".site-header").getBoundingClientRect().bottom;
        document.documentElement.style.setProperty("--hdr-b", Math.round(hb) + "px");
      }
      document.body.classList.toggle("nav-open", o);
      mbtn.setAttribute("aria-expanded", o ? "true" : "false");
    };
    mbtn.addEventListener("click", function () { setOpen(mbtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setOpen(false); mbtn.focus(); }
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 900) setOpen(false); });
  }

  /* ---- kaydırdıkça yanan pencereler: gece ızgarası + kule ---- */
  var tower = $(".tower"), tw = [];
  if (tower) for (var i = 0; i < 24; i++) { var ti = document.createElement("i"); tower.appendChild(ti); tw.push(ti); }
  var grid = document.createElement("div");
  grid.className = "nightgrid"; grid.setAttribute("aria-hidden", "true");
  document.body.insertBefore(grid, document.body.firstChild);
  var cells = [], order = [], lastLit = -1, gridKey = "";
  function buildGrid() {
    var cw = window.innerWidth < 700 ? 48 : 66;
    var cols = Math.max(4, Math.ceil(window.innerWidth / cw)), rows = Math.max(6, Math.ceil(window.innerHeight / cw));
    if (rows > 60) rows = 60;
    var key = cols + "x" + rows;
    if (key === gridKey) return;
    gridKey = key;
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
    cells = [];
    var frag = document.createDocumentFragment();
    for (var k = 0; k < cols * rows; k++) { var c = document.createElement("i"); frag.appendChild(c); cells.push(c); }
    grid.appendChild(frag);
    order = shuffle(cells.map(function (_, j) { return j; }));
    lastLit = -1;
  }

  /* görünür olunca bir kez çalışan işler (atlanırsa da çalışır) */
  var pending = [];
  function watch(el, fn) { pending.push({ el: el, fn: fn }); }
  function check() {
    var vh = window.innerHeight;
    pending = pending.filter(function (p) {
      if (!p.el.getClientRects().length) return true;
      var r = p.el.getBoundingClientRect();
      if (r.top < vh * 0.9) { p.fn(r.bottom < 0); return false; }
      return true;
    });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 1;
    if (tw.length) { var n = Math.round(p * tw.length); tw.forEach(function (t, j) { t.classList.toggle("on", j < n); }); }
    if (cells.length) {
      var m = Math.round(cells.length * (0.05 + p * 0.5));
      if (m !== lastLit) { order.forEach(function (idx, j) { cells[idx].classList.toggle("on", j < m); }); lastLit = m; }
    }
    check();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { buildGrid(); req(); });

  /* ---- SVG sahneleri: pencereler sırayla yanar ---- */
  function lightScene(svg, fast) {
    var ls = shuffle($$(".l", svg));
    if (RM || fast) { ls.forEach(function (e) { e.classList.add("on"); }); return; }
    var step = Math.max(14, Math.min(90, 1500 / Math.max(1, ls.length)));
    ls.forEach(function (e, k) { setTimeout(function () { e.classList.add("on"); }, 80 + k * step); });
  }
  function live(svg) {
    if (RM) return;
    var ws = $$(".w:not(.door)", svg);
    if (!ws.length) return;
    setInterval(function () {
      if (document.hidden) return;
      var r = svg.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      ws[Math.floor(Math.random() * ws.length)].classList.toggle("on");
    }, 2300);
  }
  $$(".scene").forEach(function (svg) {
    if (svg.hasAttribute("data-live")) { lightScene(svg); setTimeout(function () { live(svg); }, 3500); }
    else watch(svg, function (passed) { lightScene(svg, passed); });
  });
  document.addEventListener("click", function (e) {
    var t = e.target;
    var w = t && t.closest ? t.closest(".scene .w") : null;
    if (w && !w.closest(".svc-svg")) w.classList.toggle("on");
  });

  /* kat kat yanan bloklar */
  $$("[data-light]").forEach(function (el) { watch(el, function () { el.classList.add("is-lit"); }); });

  /* ---- 582 yorum = 582 ışık ---- */
  $$("[data-lights]").forEach(function (f) {
    var n = +f.getAttribute("data-lights") || 0, items = [], frag = document.createDocumentFragment();
    for (var k = 0; k < n; k++) { var c = document.createElement("i"); frag.appendChild(c); items.push(c); }
    f.appendChild(frag);
    watch(f, function (passed) {
      if (RM || passed) { items.forEach(function (c) { c.classList.add("on"); }); return; }
      var ord = shuffle(items.slice()), idx = 0, per = Math.ceil(n / 70);
      (function tick() {
        for (var j = 0; j < per && idx < ord.length; j++, idx++) ord[idx].classList.add("on");
        if (idx < ord.length) requestAnimationFrame(tick);
      })();
    });
  });

  /* ---- gündüz / akşam ---- */
  $$("[data-daynight]").forEach(function (sec) {
    var btns = $$("[data-mode-btn]", sec), panels = $$("[data-panel]", sec);
    function set(m) {
      sec.setAttribute("data-mode", m);
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode-btn") === m ? "true" : "false"); });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { set(b.getAttribute("data-mode-btn")); }); });
    set("gunduz");
  });

  /* ---- sekmeler ---- */
  $$("[data-tabs]").forEach(function (box) {
    var tabs = $$("[role=tab]", box);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    function sel(k, focus) {
      tabs.forEach(function (t, j) {
        var on = j === k;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (panels[j]) panels[j].hidden = !on;
      });
      if (focus) tabs[k].focus();
      req();
    }
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { sel(k); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          sel((k + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length, true);
        }
      });
    });
    sel(0);
  });

  /* ---- kontrol listeleri (tarayıcıda saklanır) ---- */
  $$("[data-checklist]").forEach(function (cl) {
    var key = "isik-emlak-" + cl.getAttribute("data-checklist");
    var boxes = $$("input[type=checkbox]", cl), cnt = $("[data-count]", cl), tot = $("[data-total]", cl);
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) { saved = {}; }
    function paint() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (cnt) cnt.textContent = n;
      if (tot) tot.textContent = boxes.length;
    }
    function save() {
      var o = {};
      boxes.forEach(function (b, k) { if (b.checked) o[k] = 1; });
      try { localStorage.setItem(key, JSON.stringify(o)); } catch (e) { /* saklanamazsa sorun değil */ }
      paint();
    }
    boxes.forEach(function (b, k) { if (saved[k]) b.checked = true; b.addEventListener("change", save); });
    var rs = $("[data-reset]", cl);
    if (rs) rs.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); save(); });
    paint();
  });

  /* ---- sözlük süzgeci ---- */
  function norm(s) { return low(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i"); }
  $$("[data-filter]").forEach(function (inp) {
    var list = document.getElementById(inp.getAttribute("data-filter"));
    if (!list) return;
    var items = $$("[data-term]", list), empty = document.getElementById(inp.getAttribute("data-empty"));
    inp.addEventListener("input", function () {
      var q = norm(inp.value.trim()), shown = 0;
      items.forEach(function (it) { var ok = !q || norm(it.textContent).indexOf(q) > -1; it.hidden = !ok; if (ok) shown++; });
      if (empty) empty.hidden = shown > 0;
    });
  });

  /* ---- kat kesiti (arayanlar) ---- */
  var sect = $(".sect-svg"), lvBtns = $$("[data-lv-btn]");
  if (sect && lvBtns.length) {
    var pick = function (b) {
      var k = b.getAttribute("data-lv-btn");
      lvBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".lv", sect).forEach(function (g) {
        var on = g.getAttribute("data-lv") === k;
        g.classList.toggle("on", on);
        $$(".w", g).forEach(function (w) { w.classList.toggle("on", on); });
      });
    };
    lvBtns.forEach(function (b) {
      b.addEventListener("click", function () { pick(b); });
      b.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) pick(b); });
    });
    pick(lvBtns[0]);
  }

  /* ---- ışık saatleri çizelgesi ---- */
  $$("[data-hours-chart]").forEach(function (hc) {
    var s = openStatus(HOURS);
    $$(".hc-row", hc).forEach(function (r) { r.classList.toggle("today", +r.getAttribute("data-d") === s.dayIndex); });
    var track = $('.hc-row[data-d="' + s.dayIndex + '"] .hc-track', hc);
    if (track) {
      var m = document.createElement("i");
      m.className = "hc-now";
      m.style.left = (s.minutes / 1440 * 100).toFixed(2) + "%";
      m.setAttribute("data-t", "Şimdi " + pad(Math.floor(s.minutes / 60)) + ":" + pad(s.minutes % 60));
      track.appendChild(m);
    }
  });

  /* ---- kopyala düğmeleri ---- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var src = document.getElementById(b.getAttribute("data-copy"));
      var out = document.getElementById(b.getAttribute("data-out"));
      if (src) copyText(src.value !== undefined && src.tagName === "TEXTAREA" ? src.value : src.textContent.trim(), out);
    });
  });

  /* ---- ortak form yardımcıları ---- */
  function radio(form, n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ""; }
  function checks(form, n) { return $$('input[name="' + n + '"]:checked', form).map(function (e) { return e.value; }); }
  function text(form, n) { var el = form.elements[n]; return el && el.value ? String(el.value).trim() : ""; }
  function money(inp) {
    inp.addEventListener("input", function () {
      var d = inp.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12);
      inp.value = d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
    });
  }

  /* ---- NE ARIYORSUNUZ sihirbazı ---- */
  var wz = $('[data-tool="ne-ariyorsunuz"]');
  if (wz) (function () {
    var form = $("form", wz), steps = $$(".wz-step", wz), res = $(".wz-result", wz);
    var prev = $("[data-prev]", wz), next = $("[data-next]", wz), count = $(".wz-count", wz), err = $(".wz-err", wz);
    var lis = $$(".wz-steps li", wz), bl = $(".wz-bldg", wz), msg = $("#wz-msg"), wa = $("[data-wa]", wz);
    var N = steps.length, cur = 0;
    if (form.elements.butce) money(form.elements.butce);

    var q = new URLSearchParams(location.search);
    var qn = q.get("niyet");
    if (qn) { var r1 = form.querySelector('input[name="niyet"][value="' + (qn === "kiralik" ? "kira" : qn === "satilik" ? "satin" : qn) + '"]'); if (r1) r1.checked = true; }
    if (q.get("tur") === "isyeri") { var r2 = form.querySelector('input[name="tur"][value="Dükkân"]'); if (r2) r2.checked = true; }

    function isBiz() { var t = radio(form, "tur"); return t === "Dükkân" || t === "Ofis"; }
    function answered(k) {
      var st = steps[k];
      if ($$("input:checked", st).length) return true;
      return $$('input[type="text"], input[type="number"], textarea', st).some(function (e) { return e.value.trim() !== ""; });
    }
    function deps() {
      var n = radio(form, "niyet"), biz = isBiz();
      $$("[data-niyet]", wz).forEach(function (el) { el.hidden = n !== el.getAttribute("data-niyet"); });
      $$("[data-biz]", wz).forEach(function (el) { el.hidden = (el.getAttribute("data-biz") === "1") !== biz; });
      $$("[data-niyet-txt]", wz).forEach(function (el) { el.textContent = n === "kira" ? el.getAttribute("data-kira") : el.getAttribute("data-satin"); });
    }
    function paintSide() {
      for (var k = 0; k < N; k++) {
        var w = bl && bl.querySelector('[data-step="' + (k + 1) + '"]');
        if (w) w.classList.toggle("on", answered(k));
        if (lis[k]) { lis[k].classList.toggle("done", answered(k)); lis[k].classList.toggle("cur", k === cur); }
      }
      var d = bl && bl.querySelector('[data-step="7"]');
      if (d) d.classList.toggle("on", cur === N);
      if (lis[N]) { lis[N].classList.toggle("cur", cur === N); lis[N].classList.toggle("done", cur === N); }
    }
    function build() {
      var n = radio(form, "niyet"), t = radio(form, "tur"), L = [];
      L.push("Merhaba Işık Emlak, web sitenizdeki sihirbazla yazıyorum.");
      var what = t && t !== "Henüz karar vermedim" ? low(t) : "ev ya da iş yeri";
      if (n === "satin") L.push("Satın almak için " + what + " arıyorum.");
      else if (n === "kira") L.push("Kiralamak için " + what + " arıyorum.");
      else L.push(what.charAt(0).toLocaleUpperCase("tr-TR") + what.slice(1) + " arıyorum.");
      var size = [], oda = radio(form, "oda"), m2 = text(form, "m2");
      if (oda && !isBiz()) size.push(oda === "Fark etmez" ? "oda sayısı fark etmez" : oda);
      if (m2) size.push("yaklaşık " + m2 + " m²");
      if (size.length) L.push("• Büyüklük: " + size.join(", "));
      var b = text(form, "butce");
      if (form.elements.butce_sonra && form.elements.butce_sonra.checked) L.push("• Bütçe: görüşmede konuşalım");
      else if (b) L.push("• Bütçe: " + (n === "kira" ? "aylık kira en fazla " : "en fazla ") + b + " TL");
      var od = radio(form, "odeme");
      if (od && n === "satin") L.push("• Ödeme: " + low(od));
      var kim = radio(form, "kim");
      if (kim && n === "kira") L.push("• Oturacak: " + low(kim));
      if (n === "kira" && form.elements.evcil && form.elements.evcil.checked) L.push("• Evcil hayvanım var");
      var loc = [], bolge = radio(form, "bolge"), mah = text(form, "mahalle");
      if (bolge) loc.push(bolge === "Fark etmez" ? "fark etmez" : bolge);
      if (mah) loc.push("tercihen " + mah);
      if (loc.length) L.push("• Konum: " + loc.join(", "));
      var ol = checks(form, "olmazsa");
      if (ol.length) L.push("• Olmazsa olmazlar: " + low(ol.join(", ")));
      var z = radio(form, "zaman");
      if (z) L.push("• Zaman: " + low(z));
      var ad = text(form, "ad"), don = radio(form, "donus"), saat = radio(form, "saat");
      var tail = [];
      if (ad) tail.push("Adım " + ad + ".");
      if (don) tail.push(don + (saat ? ", tercihen " + low(saat) + " saatlerinde." : "."));
      else if (saat) tail.push("Bana en uygun saatler: " + low(saat) + ".");
      if (tail.length) L.push(tail.join(" "));
      var nt = text(form, "not");
      if (nt) L.push("Not: " + nt);
      L.push("Uygun seçenek olursa haberleşelim, teşekkürler.");
      return L.join("\n");
    }
    function sync() { wa.href = waLink(msg.value); }
    function show(k, focus) {
      cur = k;
      steps.forEach(function (s, j) { s.hidden = j !== k; });
      res.hidden = k !== N;
      prev.hidden = k === 0;
      next.hidden = k === N;
      next.textContent = k === N - 1 ? "Mesajı hazırla" : "İleri";
      count.textContent = k < N ? "Adım " + (k + 1) + " / " + N : "Son adım";
      err.textContent = "";
      if (k === N) { msg.value = build(); sync(); }
      paintSide();
      if (focus) {
        var target = k === N ? res : steps[k];
        target.setAttribute("tabindex", "-1");
        try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
        var top = wz.getBoundingClientRect().top;
        if (top < 70 || top > window.innerHeight * 0.6) wz.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
      }
    }
    next.addEventListener("click", function () {
      var need = steps[cur].getAttribute("data-req");
      if (need && !radio(form, need)) { err.textContent = steps[cur].getAttribute("data-err") || "Lütfen bir seçim yapın."; return; }
      show(cur + 1, true);
    });
    prev.addEventListener("click", function () { show(Math.max(0, cur - 1), true); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    form.addEventListener("change", function () { deps(); paintSide(); err.textContent = ""; });
    form.addEventListener("input", function () { paintSide(); });
    msg.addEventListener("input", sync);
    $("[data-restart]", wz).addEventListener("click", function () { form.reset(); deps(); show(0, true); });
    $("[data-copy-msg]", wz).addEventListener("click", function () { copyText(msg.value, $(".copied", wz)); });
    deps();
    show(0, false);
  })();

  /* ---- EVİMİ DEĞERLET ---- */
  var vf = $('[data-tool="evimi-degerlet"]');
  if (vf) (function () {
    var form = $("form", vf), msg = $("#val-msg"), wa = $("[data-wa]", vf), num = $("[data-meter-n]", vf), tip = $("[data-meter-tip]", vf);
    var svg = $(".meter-svg", vf);
    var panes = [8, 9, 6, 7, 4, 5, 2, 3, 0, 1].map(function (k) { return svg ? svg.querySelector('[data-k="' + k + '"]') : null; });
    var tests = [
      function () { return !!radio(form, "amac"); },
      function () { return !!radio(form, "tip"); },
      function () { return !!form.elements.oda.value; },
      function () { return !!(text(form, "brut") || text(form, "net")); },
      function () { return !!text(form, "kat"); },
      function () { return !!text(form, "yas"); },
      function () { return !!radio(form, "durum"); },
      function () { return !!radio(form, "tapu"); },
      function () { return !!radio(form, "oturan"); },
      function () { return !!(text(form, "mahalle") || text(form, "sokak")); }
    ];
    var tips = [
      "Formu doldurdukça pencerenin camları birer birer aydınlanır.",
      "Güzel bir başlangıç. Alan, kat ve bina yaşı fiyat görüşü için en çok sorulan bilgiler.",
      "Yarıdan fazlası tamam. Tapu durumu ve evde şu an kimin oturduğu da işe yarar.",
      "Bütün camlar yandı. Mesajın ardından birkaç fotoğraf eklerseniz görüş daha isabetli olur."
    ];
    function build() {
      var a = radio(form, "amac"), L = [];
      L.push("Merhaba Işık Emlak, web sitenizden yazıyorum. Evim için bir değer görüşü almak istiyorum.");
      if (a) L.push("Amacım: " + low(a) + ".");
      var tip2 = radio(form, "tip"), oda = form.elements.oda.value;
      var mulk = [oda && oda !== "İş yeri / uygun değil" ? oda : "", tip2 ? low(tip2) : ""].filter(Boolean).join(" ");
      if (mulk) L.push("• Mülk: " + mulk);
      var br = text(form, "brut"), ne = text(form, "net"), al = [];
      if (br) al.push("brüt " + br + " m²");
      if (ne) al.push("net " + ne + " m²");
      if (al.length) L.push("• Alan: " + al.join(", "));
      var kat = text(form, "kat"), tk = text(form, "toplamkat");
      if (kat || tk) L.push("• Kat: " + (kat || "?") + (tk ? " (bina " + tk + " katlı)" : ""));
      var yas = text(form, "yas");
      if (yas) L.push("• Bina yaşı: yaklaşık " + yas);
      var is = form.elements.isinma.value;
      if (is) L.push("• Isınma: " + low(is));
      var oz = checks(form, "ozellik");
      if (oz.length) L.push("• Özellikler: " + low(oz.join(", ")));
      var du = radio(form, "durum"), ta = radio(form, "tapu"), ot = radio(form, "oturan");
      if (du) L.push("• Genel durum: " + low(du));
      if (ta) L.push("• Tapu: " + low(ta));
      if (ot) L.push("• Şu an: " + low(ot));
      var adr = [text(form, "mahalle"), text(form, "sokak")].filter(Boolean).join(", ");
      if (adr) L.push("• Adres: " + adr);
      L.push("Fotoğrafları bu mesajın ardından gönderebilirim.");
      var ad = text(form, "ad"), sa = radio(form, "saat");
      var t = [];
      if (ad) t.push("Adım " + ad + ".");
      if (sa) t.push("Aranmak için uygun saat: " + low(sa) + ".");
      if (t.length) L.push(t.join(" "));
      return L.join("\n");
    }
    function paint() {
      var n = tests.filter(function (f) { return f(); }).length;
      panes.forEach(function (p, k) { if (p) p.classList.toggle("on", k < n); });
      if (svg) svg.style.setProperty("--glow", (n / 10 * 0.9).toFixed(2));
      if (num) num.textContent = n;
      var n2 = $("[data-meter-n2]", vf);
      if (n2) n2.textContent = n + "/10";
      $$(".vm-w i", vf).forEach(function (w, k) { w.classList.toggle("on", k < n); });
      if (tip) tip.textContent = tips[n === 0 ? 0 : n < 5 ? 1 : n < 10 ? 2 : 3];
      msg.value = build();
      wa.href = waLink(msg.value);
    }
    form.addEventListener("input", paint);
    form.addEventListener("change", paint);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    msg.addEventListener("input", function () { wa.href = waLink(msg.value); });
    $("[data-copy-msg]", vf).addEventListener("click", function () { copyText(msg.value, $(".copied", vf)); });
    $("[data-clear]", vf).addEventListener("click", function () { form.reset(); paint(); });
    paint();
  })();

  /* ---- ZİYARET planlayıcı ---- */
  var vt = $('[data-tool="ziyaret"]');
  if (vt) (function () {
    var form = $("form", vt), daysBox = $(".days", vt), slotsBox = $(".slots", vt), msg = $("#vt-msg"), wa = $("[data-wa]", vt), empty = $(".vt-empty", vt);
    var now = istanbulNow(), base = new Date();
    var fmt;
    try { fmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long" }); } catch (e) { fmt = null; }
    function mins(s) { var a = s.split(":"); return +a[0] * 60 + +a[1]; }
    var SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    var days = [];
    for (var k = 0; k < 7; k++) {
      var di = (now.d + k) % 7, dt = new Date(base.getTime() + k * 864e5);
      var date = fmt ? fmt.format(dt) : "";
      days.push({ k: k, di: di, date: date, name: k === 0 ? "Bugün" : k === 1 ? "Yarın" : DAYS[di], short: k === 0 ? "Bugün" : k === 1 ? "Yarın" : SHORT[di] });
    }
    days.forEach(function (d) {
      var lab = document.createElement("label");
      lab.className = "chip";
      lab.innerHTML = '<input type="radio" name="gun" value="' + d.k + '" aria-label="' + d.name + " " + d.date + '"><span><b>' + d.short + "</b>" + d.date + "</span>";
      daysBox.appendChild(lab);
    });
    function slotsFor(d) {
      var out = [];
      (HOURS[String(d.di)] || []).forEach(function (r) {
        for (var m = mins(r[0]); m <= mins(r[1]) - 60; m += 60) {
          if (d.k === 0 && m < now.m + 30) continue;
          out.push(pad(Math.floor(m / 60)) + ":" + pad(m % 60));
        }
      });
      return out;
    }
    function fillSlots() {
      var g = radio(form, "gun");
      slotsBox.innerHTML = "";
      if (g === "") { empty.hidden = true; return; }
      var list = slotsFor(days[+g]);
      empty.hidden = list.length > 0;
      list.forEach(function (s) {
        var lab = document.createElement("label");
        lab.className = "chip";
        lab.innerHTML = '<input type="radio" name="saat" value="' + s + '"><span>' + s + "</span>";
        slotsBox.appendChild(lab);
      });
    }
    function build() {
      var g = radio(form, "gun"), s = radio(form, "saat"), konu = radio(form, "konu"), ad = text(form, "ad");
      var L = ["Merhaba Işık Emlak,"];
      if (g !== "") {
        var d = days[+g];
        var when = (d.k < 2 ? low(d.name) + " (" + d.date + ")" : d.date + " " + d.name).trim();
        L.push(when + (s ? " saat " + s + " civarında" : "") + " ofisinize uğramak istiyorum. Uygun olur mu?");
      } else {
        L.push("ofisinize uğramak istiyorum; size uygun bir gün ve saat önerir misiniz?");
      }
      if (konu) L.push("Konu: " + low(konu) + ".");
      if (ad) L.push("Adım " + ad + ".");
      L.push("Teşekkürler.");
      return L.join("\n");
    }
    function paint() { msg.value = build(); wa.href = waLink(msg.value); }
    form.addEventListener("change", function (e) { if (e.target.name === "gun") fillSlots(); paint(); });
    form.addEventListener("input", paint);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    msg.addEventListener("input", function () { wa.href = waLink(msg.value); });
    $("[data-copy-msg]", vt).addEventListener("click", function () { copyText(msg.value, $(".copied", vt)); });
    var first = days.filter(function (d) { return slotsFor(d).length; })[0];
    if (first) { var fi = form.querySelector('input[name="gun"][value="' + first.k + '"]'); if (fi) fi.checked = true; }
    fillSlots();
    paint();
  })();

  /* sayfa içi bağlantılarda yumuşak kaydırma (hareket azaltmaya saygılı) */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || a.classList.contains("skip")) return;
    var id = a.getAttribute("href").slice(1);
    var t = id ? document.getElementById(id) : null;
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
  });

  /* ilk boyama */
  buildGrid();
  update();
  window.addEventListener("load", req);
})();
