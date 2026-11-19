/* Luxury Boutique Turkey — site betiği (kütüphanesiz). */
(function () {
  'use strict';

  var HOURS = { "0": [["10:00", "20:00"]], "1": [["10:00", "20:00"]], "2": [["10:00", "20:00"]], "3": [["10:00", "20:00"]], "4": [["10:00", "20:00"]], "5": [["10:00", "20:00"]], "6": [["12:00", "18:00"]] };
  var WA = "https://wa.me/905342110216";
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var DAYS_S = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

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

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; } ta.remove(); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Canlı açık/kapalı ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("tr[data-day]").forEach(function (tr) { tr.classList.toggle("is-today", +tr.getAttribute("data-day") === s.dayIndex); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- Üst bilgi + menü ---- */
  var header = $("[data-header]"), hero = $(".hero"), menuBtn = $(".menu-btn"), menu = $("#menu");
  function headerState() {
    if (!header) return;
    var over = hero && !document.body.classList.contains("menu-open") && window.scrollY < hero.offsetHeight - header.offsetHeight - 8;
    header.classList.toggle("is-over", !!over);
  }
  if (hero) { headerState(); window.addEventListener("scroll", headerState, { passive: true }); window.addEventListener("resize", headerState); }
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.firstChild.nodeValue = open ? "Kapat " : "Menü ";
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    headerState();
    if (open) { var a = $("a", menu); if (a) a.focus(); }
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth >= 900 && menu && !menu.hidden) setMenu(false); });
  }

  /* ---- İmza: liste üstünde görsel belirme ---- */
  var fineQ = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)");
  $$("[data-reveal]").forEach(function (root) {
    var rows = $$("[data-reveal-row]", root), frames = $$("[data-reveal-frame]", root), stage = $(".reveal-stage", root), list = $(".rows", root);
    if (!rows.length || !stage) return;
    var current, tx = 0, ty = 0, x = 0, y = 0, raf = 0, placed = false;
    function activate(key) {
      if (key === current) return;
      current = key;
      frames.forEach(function (f) { f.classList.toggle("is-on", f.getAttribute("data-reveal-frame") === key); });
      rows.forEach(function (r) { r.classList.toggle("is-active", r.getAttribute("data-reveal-row") === key); });
      root.classList.toggle("has-active", !!key);
    }
    function loop() {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      var tilt = Math.max(-4, Math.min(4, (tx - x) * 0.03));
      stage.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + tilt.toFixed(2) + "deg)";
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(loop); else raf = 0;
    }
    function aim(cx, cy) {
      var b = root.getBoundingClientRect(), w = stage.offsetWidth, h = stage.offsetHeight;
      tx = Math.max(0, Math.min(b.width - w, cx - b.left + 56));
      ty = Math.max(0, Math.min(b.height - h, cy - b.top - h / 2));
      if (!placed || reduce) {
        x = tx; y = ty; placed = true;
        if (stage.hidden) { stage.hidden = false; void stage.offsetWidth; }
        root.classList.add("is-placed");
      }
      if (!raf) raf = requestAnimationFrame(loop);
    }
    rows.forEach(function (r) {
      r.addEventListener("mouseenter", function () { if (fineQ.matches) activate(r.getAttribute("data-reveal-row")); });
      r.addEventListener("focusin", function () {
        activate(r.getAttribute("data-reveal-row"));
        if (fineQ.matches) { var rb = r.getBoundingClientRect(); aim(rb.left + rb.width * 0.55, rb.top + rb.height / 2); }
      });
    });
    var hideT = 0;
    list.addEventListener("mouseleave", function () {
      if (!fineQ.matches) return;
      activate(null); placed = false; root.classList.remove("is-placed");
      clearTimeout(hideT);
      hideT = setTimeout(function () { if (!placed && fineQ.matches) stage.hidden = true; }, 480);
    });
    root.addEventListener("mousemove", function (e) { if (fineQ.matches) aim(e.clientX, e.clientY); });
    var ticking = false;
    function byScroll() {
      ticking = false;
      if (fineQ.matches) return;
      var line = stage.getBoundingClientRect().bottom + 36, pick = rows[0].getAttribute("data-reveal-row");
      rows.forEach(function (r) { if (r.getBoundingClientRect().top < line) pick = r.getAttribute("data-reveal-row"); });
      activate(pick);
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(byScroll); } }, { passive: true });
    function mode() {
      stage.style.transform = ""; placed = false; root.classList.remove("is-placed"); current = undefined;
      if (fineQ.matches) { stage.hidden = true; activate(null); } else { stage.hidden = false; byScroll(); }
    }
    if (fineQ.addEventListener) fineQ.addEventListener("change", mode); else if (fineQ.addListener) fineQ.addListener(mode);
    mode();
  });

  /* ---- Yatay kayan lookbook ---- */
  var wideQ = window.matchMedia("(min-width: 900px)");
  $$("[data-gallery]").forEach(function (g) {
    var track = $(".gallery-track", g), items = $$(".look", track);
    var prev = $("[data-prev]", g), next = $("[data-next]", g), bar = $(".gallery-progress span", g), cur = $("[data-current]", g);
    if (!track || !items.length) return;
    function max() { return Math.max(1, track.scrollWidth - track.clientWidth); }
    function index() {
      var sl = track.scrollLeft;
      if (sl >= max() - 4) return items.length - 1;
      var ref = sl + (wideQ.matches ? track.clientWidth * 0.3 : track.clientWidth * 0.5), best = 0;
      items.forEach(function (it, i) { if (it.offsetLeft <= ref) best = i; });
      return best;
    }
    function go(i, instant) {
      i = Math.max(0, Math.min(items.length - 1, i));
      var it = items[i], pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var left = wideQ.matches ? it.offsetLeft - pad : it.offsetLeft + it.offsetWidth / 2 - track.clientWidth / 2;
      track.scrollTo({ left: left, behavior: instant || reduce ? "auto" : "smooth" });
    }
    function update() {
      var sl = track.scrollLeft, m = max();
      if (bar) bar.style.transform = "scaleX(" + Math.max(0.04, Math.min(1, sl / m)).toFixed(3) + ")";
      if (cur) cur.textContent = index() + 1;
      if (prev) prev.disabled = sl < 4;
      if (next) next.disabled = sl > m - 4;
    }
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    if (prev) prev.addEventListener("click", function () { go(index() - 1); });
    if (next) next.addEventListener("click", function () { go(index() + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
      if (e.key === "Home") { e.preventDefault(); go(0); }
      if (e.key === "End") { e.preventDefault(); go(items.length - 1); }
    });
    /* Masaüstünde dikey tekerlek, galeri ekranın ortasındayken yatay kaydırır */
    track.addEventListener("wheel", function (e) {
      if (!fineQ.matches || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var r = track.getBoundingClientRect(), mid = (r.top + r.bottom) / 2;
      if (mid < window.innerHeight * 0.18 || mid > window.innerHeight * 0.82) return;
      var sl = track.scrollLeft, m = max();
      if ((e.deltaY > 0 && sl < m - 1) || (e.deltaY < 0 && sl > 1)) {
        e.preventDefault();
        track.scrollLeft = sl + e.deltaY * (e.deltaMode === 1 ? 32 : 1);
      }
    }, { passive: false });
    /* Fareyle sürükleme */
    var down = false, sx = 0, ss = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse" || e.button !== 0) return; down = true; moved = false; sx = e.clientX; ss = track.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add("is-drag"); }
      if (moved) track.scrollLeft = ss - dx;
    });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; setTimeout(function () { track.classList.remove("is-drag"); }, 0); });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    /* #gorunum-N bağlantısı */
    var h = location.hash && document.getElementById(location.hash.slice(1));
    if (h && track.contains(h)) {
      var i = items.indexOf(h.closest(".look"));
      setTimeout(function () { g.scrollIntoView({ block: "center" }); go(i, true); update(); }, 60);
    }
    update();
  });

  /* ---- Sekmeler (renk cetveli, bakım etiketi) ---- */
  $$("[data-tabs]").forEach(function (t) {
    var tabs = $$("[role=tab]", t), panels = tabs.map(function (b) { return document.getElementById(b.getAttribute("aria-controls")); });
    function sel(i, focus) {
      tabs.forEach(function (b, j) { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; if (panels[j]) panels[j].hidden = i !== j; });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { sel(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); sel((i + 1) % tabs.length, true); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); sel((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    sel(0);
  });

  /* ---- Kapsül gardırop ---- */
  var cap = $("[data-capsule]");
  if (cap) {
    var boxes = $$("input[type=checkbox]", cap), saved = store("lbt-kapsul") || [];
    var cOut = $("[data-cap-count]"), cMiss = $("[data-cap-missing]"), cWa = $("[data-cap-wa]");
    boxes.forEach(function (b) { if (saved.indexOf(b.value) > -1) b.checked = true; });
    function capUpdate() {
      var have = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      var miss = boxes.filter(function (b) { return !b.checked; }).map(function (b) { return b.value; });
      store("lbt-kapsul", have); store("lbt-eksik", miss);
      if (cOut) cOut.textContent = have.length + " / " + boxes.length;
      if (cMiss) cMiss.textContent = miss.length ? "Eksik görünenler: " + miss.join(", ") + "." : "Listenin tamamı gardırobunuzda. Şimdi bakım zamanı: Stil defterine göz atın.";
      if (cWa) cWa.href = waLink("Merhaba, Luxury Boutique Turkey. Kapsül gardırobum için şu parçalara bakmak istiyorum: " + (miss.length ? miss.join(", ") : "yeni sezon parçaları") + ". Uygun seçenekler hakkında bilgi verebilir misiniz?");
    }
    boxes.forEach(function (b) { b.addEventListener("change", capUpdate); });
    capUpdate();
  }

  /* ---- Ölçü rehberi ---- */
  var meas = $("[data-measure]");
  if (meas) {
    var mBtns = $$("[data-m]", meas);
    function mSel(key) {
      mBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === key)); });
      $$("[data-m-line]", meas).forEach(function (l) { l.classList.toggle("is-on", l.getAttribute("data-m-line") === key); });
      $$("[data-m-text]", meas).forEach(function (l) { l.classList.toggle("is-on", l.getAttribute("data-m-text") === key); });
    }
    mBtns.forEach(function (b) { b.addEventListener("click", function () { mSel(b.getAttribute("data-m")); }); });
    mSel("gogus");
    var conv = $("[data-conv]");
    if (conv) {
      var cin = $$("input", conv), cOutEl = $("[data-conv-out]", conv);
      function cUpd() {
        var parts = cin.map(function (i) {
          var v = parseFloat(String(i.value).replace(",", "."));
          return v > 0 ? i.getAttribute("data-label") + " " + v.toLocaleString("tr-TR") + " cm ≈ " + (v / 2.54).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " inç" : null;
        }).filter(Boolean);
        cOutEl.textContent = parts.length ? parts.join(" · ") : "İnç karşılığı burada görünür.";
      }
      cin.forEach(function (i) { i.addEventListener("input", cUpd); });
      cUpd();
      var push = $("[data-conv-push]", conv);
      if (push) push.addEventListener("click", function () {
        cin.forEach(function (i) { var t = document.getElementById(i.getAttribute("data-target")); if (t) { t.value = i.value; t.dispatchEvent(new Event("input", { bubbles: true })); } });
        var tool = $("[data-tool='randevu']");
        if (tool) tool.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    }
  }

  /* ---- Ortak: seçim düğmeleri ---- */
  function chipGroup(box, multi, onChange) {
    var chips = $$("[data-v]", box);
    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "true" : "false");
      c.addEventListener("click", function () {
        if (c.disabled) return;
        var on = c.getAttribute("aria-pressed") !== "true";
        if (!multi) chips.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", String(multi ? on : true));
        onChange();
      });
    });
    return function () { return chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; }).map(function (c) { return c.getAttribute("data-v"); }); };
  }
  function bindOutput(root, getMsg) {
    var pre = $("[data-msg]", root), wa = $("[data-wa]", root), copy = $("[data-copy]", root), note = $("[data-copied]", root);
    function render() { var m = getMsg(); if (pre) pre.textContent = m; if (wa) wa.href = waLink(m); return m; }
    if (copy) copy.addEventListener("click", function () {
      copyText(render(), function (ok) { if (note) note.textContent = ok ? "Mesaj kopyalandı. WhatsApp ya da SMS’e yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın."; });
    });
    return render;
  }

  /* ---- Özel randevu talebi ---- */
  var rt = $("[data-tool='randevu']");
  if (rt) {
    var render;
    var getAmac = chipGroup($("[data-group='amac']", rt), true, function () { render(); });
    var getKisi = chipGroup($("[data-group='kisi']", rt), false, function () { render(); });
    var getRenk = chipGroup($("[data-group='renk']", rt), true, function () { render(); });
    var daysBox = $("[data-days]", rt), slotsBox = $("[data-slots]", rt), slotNote = $("[data-slot-note]", rt);
    var selDay = null, selSlot = null;
    var todayStr;
    try { todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { var dn = new Date(); todayStr = dn.getFullYear() + "-" + String(dn.getMonth() + 1).padStart(2, "0") + "-" + String(dn.getDate()).padStart(2, "0"); }
    var tp = todayStr.split("-").map(Number), base = Date.UTC(tp[0], tp[1] - 1, tp[2], 12);
    var dayList = [];
    for (var i = 0; i < 14; i++) {
      var dt = new Date(base + i * 86400000), di = (dt.getUTCDay() + 6) % 7;
      dayList.push({ i: i, di: di, d: dt.getUTCDate(), mo: dt.getUTCMonth(), label: dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()] + " " + DAYS[di] });
    }
    dayList.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", o.label + (o.i === 0 ? " (bugün)" : "") + ", " + HOURS[o.di][0].join("–"));
      b.innerHTML = "<span>" + (o.i === 0 ? "Bugün" : o.i === 1 ? "Yarın" : DAYS_S[o.di]) + "</span><b>" + o.d + "</b><small>" + MONTHS[o.mo].slice(0, 3) + " · " + HOURS[o.di][0][0].slice(0, 2) + "–" + HOURS[o.di][0][1].slice(0, 2) + "</small>";
      b.addEventListener("click", function () {
        $$(".day", daysBox).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true"); selDay = o; selSlot = null; buildSlots(); render();
      });
      daysBox.appendChild(b);
    });
    function buildSlots() {
      slotsBox.innerHTML = "";
      var di = selDay ? selDay.di : 0, r = HOURS[di][0], s = mins(r[0]), e = mins(r[1]), now = istanbulNow().m, any = false;
      for (var t = s; t < e; t += 120) {
        var a = t, z = Math.min(e, t + 120);
        var lab = String(Math.floor(a / 60)).padStart(2, "0") + ":00–" + String(Math.floor(z / 60)).padStart(2, "0") + ":00";
        var b = document.createElement("button");
        b.type = "button"; b.className = "chip"; b.textContent = lab; b.setAttribute("data-v", lab); b.setAttribute("aria-pressed", String(selSlot === lab));
        if (selDay && selDay.i === 0 && z - 30 <= now) b.disabled = true; else any = true;
        (function (btn, l) {
          btn.addEventListener("click", function () {
            if (btn.disabled) return;
            $$(".chip", slotsBox).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
            btn.setAttribute("aria-pressed", "true"); selSlot = l; render();
          });
        })(b, lab);
        slotsBox.appendChild(b);
      }
      var flex = document.createElement("button");
      flex.type = "button"; flex.className = "chip"; flex.textContent = "Saat fark etmez"; flex.setAttribute("aria-pressed", String(selSlot === "fark etmez"));
      flex.addEventListener("click", function () { $$(".chip", slotsBox).forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); flex.setAttribute("aria-pressed", "true"); selSlot = "fark etmez"; render(); });
      slotsBox.appendChild(flex);
      slotNote.textContent = !selDay ? "Önce bir gün seçin; aralıklar o günün çalışma saatine göre açılır." :
        (!any ? "Bugün için uygun aralık kalmadı; başka bir gün seçebilirsiniz." : DAYS[selDay.di] + " çalışma saatleri: " + r.join("–") + ".");
    }
    buildSlots();
    var fAd = $("#r-ad", rt), fNot = $("#r-not", rt), fBeden = $("#r-beden", rt), fG = $("#r-gogus", rt), fB = $("#r-bel", rt), fBa = $("#r-basen", rt);
    var eksik = store("lbt-eksik") || [], fromList = $("[data-from-list]", rt), useList = false;
    if (fromList && eksik.length) {
      fromList.classList.add("is-on");
      var fb = $("button", fromList);
      fb.textContent = "Kapsül listemdeki eksikleri ekle (" + eksik.length + ")";
      fb.addEventListener("click", function () { useList = !useList; fb.setAttribute("aria-pressed", String(useList)); render(); });
    }
    function num(el) { var v = el ? parseFloat(String(el.value).replace(",", ".")) : NaN; return v > 0 ? v.toLocaleString("tr-TR") : null; }
    function compose() {
      var L = ["Merhaba, Luxury Boutique Turkey.", "Mağazanıza gelmeden önce özel randevu talebinde bulunmak istiyorum.", ""];
      var ad = fAd.value.trim();
      if (ad) L.push("Ad: " + ad);
      var am = getAmac(); L.push("Ziyaret amacı: " + (am.length ? am.join(", ") : "Henüz karar vermedim, göz atmak istiyorum"));
      L.push("Gün: " + (selDay ? selDay.label : "Size uygun bir gün"));
      L.push("Saat aralığı: " + (selSlot && selSlot !== "fark etmez" ? selSlot : "Size uygun bir saat"));
      var k = getKisi(); if (k.length) L.push("Kişi: " + k[0]);
      if (fBeden.value) L.push("Beden: " + fBeden.value);
      var rn = getRenk(); if (rn.length) L.push("Renk tercihi: " + rn.join(", "));
      var ms = [["göğüs", num(fG)], ["bel", num(fB)], ["basen", num(fBa)]].filter(function (x) { return x[1]; }).map(function (x) { return x[0] + " " + x[1] + " cm"; });
      if (ms.length) L.push("Ölçüler: " + ms.join(", "));
      if (useList && eksik.length) L.push("Bakmak istediğim parçalar: " + eksik.join(", "));
      var nt = fNot.value.trim(); if (nt) L.push("Not: " + nt);
      L.push("", "Uygun olup olmadığını bildirirseniz sevinirim. Teşekkürler.");
      return L.join("\n");
    }
    render = bindOutput(rt, compose);
    [fAd, fNot, fBeden, fG, fB, fBa].forEach(function (el) { if (el) { el.addEventListener("input", render); el.addEventListener("change", render); } });
    render();
  }

  /* ---- Adres kopyalama ---- */
  $$("[data-copy-text]").forEach(function (b) {
    b.addEventListener("click", function () {
      var note = $("[data-copy-note]");
      copyText(b.getAttribute("data-copy-text"), function (ok) { if (note) note.textContent = ok ? "Adres kopyalandı." : "Kopyalanamadı; adresi elle seçebilirsiniz."; });
    });
  });

  /* ---- Hızlı soru (iletişim) ---- */
  var qt = $("[data-tool='soru']");
  if (qt) {
    var qRender;
    var getQ = chipGroup($("[data-group='soru']", qt), false, function () { qRender(); });
    var qAd = $("#q-ad", qt), qNot = $("#q-not", qt);
    qRender = bindOutput(qt, function () {
      var q = getQ();
      var L = ["Merhaba, Luxury Boutique Turkey."];
      L.push(q.length ? q[0] : "Bir konuda bilgi almak istiyorum.");
      if (qNot.value.trim()) L.push(qNot.value.trim());
      if (qAd.value.trim()) L.push("", "Adım: " + qAd.value.trim());
      L.push("", "Teşekkürler.");
      return L.join("\n");
    });
    [qAd, qNot].forEach(function (el) { el.addEventListener("input", qRender); });
    qRender();
  }
})();
