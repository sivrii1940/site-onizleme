/* Batı Göz Optik ve Lens — site.js (bağımlılık yok) */
(function () {
  "use strict";
  window.__bgo = true;

  var HOURS = { "0": [["09:00", "21:00"]], "1": [["09:00", "21:00"]], "2": [["09:00", "21:00"]], "3": [["09:00", "21:00"]], "4": [["09:00", "21:00"]], "5": [["09:00", "21:00"]], "6": [["12:00", "21:00"]] };
  var WA = "https://wa.me/905424122284";
  var BRAND = "Batı Göz Optik ve Lens";

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
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function copyText(text, btn) {
    var orig = btn.innerHTML;
    function done(ok) {
      btn.textContent = ok ? "Kopyalandı" : "Kopyalanamadı";
      setTimeout(function () { btn.innerHTML = orig; }, 1800);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }

  /* Mesaj kurucu: kapsayıcıdaki [data-msg], [data-wa], [data-copy] öğelerini günceller */
  function builder(root, compose) {
    var pre = $("[data-msg]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root);
    function update() {
      var m = compose();
      if (pre) pre.textContent = m;
      if (wa) wa.href = waHref(m);
      return m;
    }
    root.addEventListener("input", update);
    root.addEventListener("change", update);
    if (cp) cp.addEventListener("click", function () { copyText(update(), cp); });
    update();
    return update;
  }
  function val(root, name) { var el = $("input[name='" + name + "']:checked", root); return el ? el.value : ""; }
  function txt(root, sel) { var el = $(sel, root); return el ? el.value.trim() : ""; }

  /* ---- canlı açık/kapalı ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-hours] [data-day]").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-day") === s.dayIndex); });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- menü ---- */
  var head = $(".site-head"), menuBtn = $(".menu-btn"), nav = $("#nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      if (open && head) document.documentElement.style.setProperty("--navtop", Math.round(head.getBoundingClientRect().bottom) + "px");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("menu-open", open);
    };
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); }
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960) setMenu(false); });
  }

  /* ---- bölümler: bulanıktan nete (bir kez) ---- */
  var pend = $$("[data-focus]");
  function reveal() {
    var h = window.innerHeight || 800;
    pend = pend.filter(function (el) {
      if (el.getBoundingClientRect().top < h * 0.9) { el.classList.add("is-sharp"); return false; }
      return true;
    });
    if (!pend.length) window.removeEventListener("scroll", onScroll);
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; reveal(); }); } }
  if (reduce) pend.forEach(function (el) { el.classList.add("is-sharp"); });
  else { reveal(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); }

  /* ---- göz tablosu + deneme camı ---- */
  var RING = '<svg viewBox="-130 -130 260 260" aria-hidden="true" focusable="false">' +
    '<circle r="100" fill="none" stroke="#0e0e0e" stroke-width="9"/>' +
    '<circle r="88" fill="none" stroke="#0e0e0e" stroke-width="1.5"/>' +
    '<path d="M-88 0h13M75 0h13" stroke="#0047ff" stroke-width="3"/>' +
    '<g transform="rotate(42)"><rect x="101" y="-12" width="27" height="24" rx="3" fill="#0e0e0e"/><path d="M108 0h13" stroke="#fff" stroke-width="2.5"/></g></svg>';

  function initChart(chart) {
    var body = $(".chart-body", chart);
    if (!body) return;
    var rows = $$(".crow", body);
    rows.forEach(function (r, i) {
      if (reduce) r.classList.add("sharp");
      else setTimeout(function () { r.classList.add("sharp"); }, 40 + i * 85);
    });

    var view = document.createElement("div");
    view.className = "lens-view"; view.setAttribute("aria-hidden", "true");
    var clone = body.cloneNode(true);
    $$("h1, h2, p", clone).forEach(function (h) {
      var d = document.createElement("div"); d.className = h.className; d.innerHTML = h.innerHTML;
      h.parentNode.replaceChild(d, h);
    });
    $$("[id]", clone).forEach(function (n) { n.removeAttribute("id"); });
    view.appendChild(clone);
    chart.appendChild(view);
    var ring = document.createElement("div");
    ring.className = "lens-ring"; ring.setAttribute("aria-hidden", "true"); ring.innerHTML = RING;
    chart.appendChild(ring);

    var cur = { x: 0, y: 0 }, tgt = { x: 0, y: 0 }, rest = { x: 0, y: 0 }, rad = 60, raf = 0, dragging = false, moved = false;
    var restIdx = parseInt(chart.getAttribute("data-rest") || "0", 10);
    function measure() {
      var cw = chart.clientWidth;
      rad = Math.round(Math.max(40, Math.min(80, cw * parseFloat(chart.getAttribute("data-scale") || "0.135"))));
      chart.style.setProperty("--rad", rad + "px");
      var row = rows[Math.min(restIdx, rows.length - 1)], t = row && $(".ct", row);
      if (!t) return;
      var cr = chart.getBoundingClientRect(), tr = t.getBoundingClientRect();
      rest.x = tr.left - cr.left + tr.width * 0.74;
      rest.y = tr.top - cr.top + tr.height * 0.5;
    }
    function paint() {
      chart.style.setProperty("--lx", cur.x.toFixed(1) + "px");
      chart.style.setProperty("--ly", cur.y.toFixed(1) + "px");
    }
    function loop() {
      var dx = tgt.x - cur.x, dy = tgt.y - cur.y;
      if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) { cur.x = tgt.x; cur.y = tgt.y; paint(); raf = 0; return; }
      cur.x += dx * 0.15; cur.y += dy * 0.15; paint();
      raf = requestAnimationFrame(loop);
    }
    function go(x, y, instant) {
      tgt.x = x; tgt.y = y;
      if (instant || reduce) { cur.x = x; cur.y = y; paint(); return; }
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function local(e) {
      var r = chart.getBoundingClientRect();
      return { x: Math.max(0, Math.min(r.width, e.clientX - r.left)), y: Math.max(0, Math.min(r.height, e.clientY - r.top)) };
    }
    measure();
    cur.x = chart.clientWidth + rad * 1.6; cur.y = rest.y; paint();
    setTimeout(function () { measure(); chart.classList.add("lens-on"); go(rest.x, rest.y); }, reduce ? 0 : rows.length * 85 + 350);

    chart.addEventListener("pointermove", function (e) {
      if (dragging) { var p = local(e); go(p.x, p.y, true); return; }
      if (e.pointerType === "mouse") { var q = local(e); moved = true; go(q.x, q.y); }
    });
    chart.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && !dragging) { moved = false; go(rest.x, rest.y); } });
    chart.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" && !ring.contains(e.target)) { var p = local(e); moved = true; go(p.x, p.y); }
    });
    ring.addEventListener("pointerdown", function (e) {
      dragging = true; moved = true; chart.classList.add("dragging");
      try { ring.setPointerCapture(e.pointerId); } catch (err) { /* yok */ }
      e.preventDefault();
    });
    function endDrag() { dragging = false; chart.classList.remove("dragging"); }
    ring.addEventListener("pointerup", endDrag);
    ring.addEventListener("pointercancel", endDrag);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { measure(); if (!moved) go(rest.x, rest.y, true); else go(Math.min(tgt.x, chart.clientWidth), Math.min(tgt.y, chart.clientHeight), true); }, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); if (chart.classList.contains("lens-on") && !moved) go(rest.x, rest.y, true); });
  }
  $$("[data-chart]").forEach(initChart);

  /* ---- açıklamalı kartlar (reçete, lens kutusu) ---- */
  $$("[data-explain]").forEach(function (box) {
    var keys = $$(".rx-key", box), out = $(".rx-explain", box), defs = {};
    $$(".rx-defs [data-key]", box).forEach(function (d) { defs[d.getAttribute("data-key")] = { t: $("dt", d).innerHTML, d: $("dd", d).innerHTML }; });
    function show(k) {
      if (!defs[k]) return;
      keys.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-key") === k ? "true" : "false"); });
      $$("[data-col]", box).forEach(function (c) { c.classList.toggle("hl", c.getAttribute("data-col") === k); });
      out.innerHTML = "<h3>" + defs[k].t + "</h3>" + defs[k].d;
    }
    keys.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-key")); }); });
    show(box.getAttribute("data-explain") || (keys[0] && keys[0].getAttribute("data-key")));
  });

  /* ---- gözlüğün parçaları ---- */
  $$("[data-parts]").forEach(function (box) {
    var btns = $$(".part-btn", box);
    function on(k) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-part") === k ? "true" : "false"); });
      $$("[data-p]", box).forEach(function (el) { el.classList.toggle("on", el.getAttribute("data-p") === k); });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { on(b.getAttribute("data-part")); }); });
    on("b");
  });

  /* ---- kontrol listeleri ---- */
  $$("[data-checklist]").forEach(function (cl) {
    var boxes = $$("input[type=checkbox]", cl), out = $("[data-count]", cl), bar = $(".cl-bar i", cl);
    function upd() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (out) out.textContent = n + " / " + boxes.length;
      if (bar) bar.style.width = (100 * n / boxes.length) + "%";
    }
    cl.addEventListener("change", upd); upd();
  });

  /* ---- çerçeve biçimleri (SVG) ---- */
  var FR = {
    yuvarlak: "Yuvarlak", oval: "Oval", dikdortgen: "Dikdörtgen", kare: "Kare", pilot: "Pilot (damla)",
    kedigoz: "Kedi göz", geometrik: "Geometrik", trapez: "Kalın üstlü", kas: "Kaş çerçeve", ince: "İnce metal / çerçevesiz"
  };
  var LENS = {
    yuvarlak: "M-21 0a21 21 0 1 0 42 0a21 21 0 1 0-42 0Z",
    oval: "M-24 0a24 17 0 1 0 48 0a24 17 0 1 0-48 0Z",
    dikdortgen: "M-20-15H20Q25-15 25-10V10Q25 15 20 15H-20Q-25 15-25 10V-10Q-25-15-20-15Z",
    kare: "M-16-20H16Q22-20 22-14V14Q22 20 16 20H-16Q-22 20-22 14V-14Q-22-20-16-20Z",
    pilot: "M-22-15Q0-19 25-15Q27 3 15 15Q5 22-7 19Q-21 14-22-2Z",
    kedigoz: "M-23-8Q-6-15 26-19Q27-3 17 9Q7 17-8 15Q-22 12-23-8Z",
    geometrik: "M-24 0L-13-17H13L24 0L13 17H-13Z",
    trapez: "M-25-16L25-17Q26-17 25-12L20 12Q19 16 14 16H-15Q-20 16-21 12L-25-12Q-26-16-25-16Z",
    kas: "M-23-10Q-23-15-18-15H19Q24-15 24-10V6Q24 16 12 16H-11Q-23 16-23 6Z",
    ince: "M-22-13Q0-16 22-13Q25 0 20 11Q0 17-20 11Q-25 0-22-13Z"
  };
  function frameMarkup(k) {
    var d = LENS[k], c = k === "ince" ? "lens thin" : "lens", s = "";
    s += '<path class="' + c + '" d="' + d + '" transform="translate(132 114)"/>';
    s += '<path class="' + c + '" d="' + d + '" transform="translate(68 114) scale(-1 1)"/>';
    s += '<path class="' + (k === "ince" ? "thin" : "") + '" d="M108 107Q100 100 92 107"/>';
    if (k === "pilot") s += '<path d="M107 99H93"/>';
    if (k === "kas") s += '<path class="thick" d="M108 100Q132 93 157 100M92 100Q68 93 43 100"/>';
    if (k === "trapez") s += '<path class="thick" d="M107 98L157 97M93 98L43 97"/>';
    s += '<path class="' + (k === "ince" ? "thin" : "") + '" d="M156 106L166 104M44 106L34 104"/>';
    return s;
  }
  function miniFrame(k, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="32 86 136 56" aria-hidden="true" focusable="false">' + frameMarkup(k) + "</svg>";
  }
  /* statik küçük çerçeve çizimleri */
  $$("[data-mini]").forEach(function (el) { el.innerHTML = miniFrame(el.getAttribute("data-mini")); });

  /* ---- yüz şekline göre çerçeve aracı ---- */
  var faceTool = $("[data-tool='cerceve']");
  if (faceTool) (function (tool) {
    var data = {};
    $$("[data-shape]").forEach(function (a) {
      data[a.getAttribute("data-shape")] = {
        name: $("h3", a).textContent.trim(),
        sum: $(".shape-sum", a).textContent.trim(),
        tip: $(".shape-tip", a).textContent.trim(),
        less: $(".shape-less", a).textContent.trim(),
        good: (a.getAttribute("data-good") || "").split(" ").filter(Boolean),
        bad: (a.getAttribute("data-bad") || "").split(" ").filter(Boolean)
      };
    });
    var faceBtns = $$(".face-btn", tool), useEl = $("[data-stage-face]", tool), layer = $("[data-stage-frame]", tool);
    var title = $("[data-t-title]", tool), sum = $("[data-t-sum]", tool), tip = $("[data-t-tip]", tool), less = $("[data-t-less]", tool), lessArt = $("[data-t-lessart]", tool);
    var framesBox = $("[data-frames]", tool), cap = $("[data-stage-cap]", tool);
    var st = { face: "oval", view: null, picked: [] };

    function setView(k) {
      st.view = k;
      layer.innerHTML = k ? frameMarkup(k) : "";
      cap.textContent = k ? "Denenen: " + FR[k] : "Bir çerçeve seçin";
      $$(".frame-btn", framesBox).forEach(function (b) { b.classList.toggle("is-viewing", b.getAttribute("data-frame") === k); });
    }
    function paintPicked() {
      $$(".frame-btn", framesBox).forEach(function (b) {
        var on = st.picked.indexOf(b.getAttribute("data-frame")) > -1;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        $(".fb-state", b).textContent = on ? "Listemde" : "Listeme ekle";
      });
    }
    function selectFace(f, keepPicked) {
      if (!data[f]) return;
      st.face = f;
      faceBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-face") === f ? "true" : "false"); });
      useEl.setAttribute("href", "#f-" + f);
      var d = data[f];
      title.textContent = d.name + " yüz";
      sum.textContent = d.sum; tip.textContent = d.tip; less.textContent = d.less;
      lessArt.innerHTML = d.bad.map(function (k) { return miniFrame(k); }).join("");
      framesBox.innerHTML = d.good.map(function (k) {
        return '<button type="button" class="frame-btn" data-frame="' + k + '" aria-pressed="false">' + miniFrame(k) +
          "<span>" + esc(FR[k]) + '</span><span class="fb-state">Listeme ekle</span></button>';
      }).join("");
      if (!keepPicked) st.picked = [];
      st.picked = st.picked.filter(function (k) { return d.good.indexOf(k) > -1; });
      paintPicked();
      setView(d.good[0]);
      update();
    }
    framesBox.addEventListener("click", function (e) {
      var b = e.target.closest(".frame-btn"); if (!b) return;
      var k = b.getAttribute("data-frame"), i = st.picked.indexOf(k);
      if (i > -1 && st.view === k) st.picked.splice(i, 1); else if (i === -1) st.picked.push(k);
      setView(k); paintPicked(); update();
    });
    faceBtns.forEach(function (b) { b.addEventListener("click", function () { selectFace(b.getAttribute("data-face")); }); });

    /* emin değilim: üç soru */
    var qt = $("[data-quiz-open]", tool), quiz = $(".quiz", tool), qout = $(".quiz-out", tool);
    if (qt && quiz) {
      qt.addEventListener("click", function () {
        var open = quiz.hasAttribute("hidden");
        if (open) quiz.removeAttribute("hidden"); else quiz.setAttribute("hidden", "");
        qt.setAttribute("aria-expanded", open ? "true" : "false");
      });
      quiz.addEventListener("change", function () {
        var a = val(quiz, "q1"), b = val(quiz, "q2"), c = val(quiz, "q3");
        if (!a || !b || !c) { qout.textContent = "Üç soruyu da yanıtlayın."; return; }
        var sc = { oval: 0, yuvarlak: 0, kare: 0, kalp: 0 };
        [
          { alin: { kalp: 2, kare: 1 }, elmacik: { yuvarlak: 1, oval: 1 }, esit: { kare: 2, yuvarlak: 1 } }[a],
          { sivri: { kalp: 2 }, yumusak: { yuvarlak: 1, oval: 1 }, koseli: { kare: 2 } }[b],
          { uzun: { oval: 2 }, yakin: { yuvarlak: 2, kare: 1 } }[c]
        ].forEach(function (pts) { Object.keys(pts || {}).forEach(function (k) { sc[k] += pts[k]; }); });
        var best = ["oval", "yuvarlak", "kare", "kalp"].reduce(function (m, k) { return sc[k] > sc[m] ? k : m; }, "oval");
        qout.textContent = "Yanıtlarınıza göre en yakın şekil: " + data[best].name + ". Sonuç aşağıda gösterildi; isterseniz başka bir şekil de seçebilirsiniz.";
        selectFace(best);
      });
    }

    var update = builder($("[data-send]", tool), function () {
      var d = data[st.face], use = val(tool, "kullanim") || "Henüz karar vermedim", name = txt(tool, "[data-name]");
      var picks = st.picked.length ? st.picked.map(function (k) { return FR[k]; }).join(", ") : "Önerilen biçimlere birlikte bakmak isterim";
      return "Merhaba " + BRAND + ",\nsitenizdeki çerçeve rehberine baktım.\n" +
        "• Yüz şeklim: " + d.name + "\n" +
        "• Bakmak istediğim çerçeveler: " + picks + "\n" +
        "• Aradığım: " + use + "\n" +
        "Bu tarzda modellere mağazada bakmak istiyorum." + (name ? "\nAdım: " + name : "");
    });

    var m = (location.hash || "").match(/^#yuz-(oval|kare|yuvarlak|kalp)$/);
    selectFace(m ? m[1] : "oval");
  })(faceTool);

  /* ---- reçete gönder (gözlük) ---- */
  var rxSend = $("[data-tool='recete-gonder']");
  if (rxSend) builder(rxSend, function () {
    var need = val(rxSend, "ihtiyac") || "Numaralı gözlük", name = txt(rxSend, "[data-name]");
    var withRx = $("[data-rx]", rxSend).checked, own = $("[data-own]", rxSend).checked;
    return "Merhaba " + BRAND + ",\n" + need + " için bilgi almak istiyorum.\n" +
      (withRx ? "Reçetemin fotoğrafını bu mesaja ekleyeceğim.\n" : "Reçetemi mağazaya getireceğim.\n") +
      (own ? "Mevcut çerçevemi kullanmayı düşünüyorum.\n" : "") +
      "Cam ve çerçeve seçenekleri hakkında bilgi verebilir misiniz?" + (name ? "\nAdım: " + name : "");
  });

  /* ---- lens değişim takvimi ---- */
  var cal = $("[data-tool='takvim']");
  if (cal) (function () {
    var dateIn = $("[data-open]", cal), countIn = $("[data-count-in]", cal);
    var big = $("[data-cal-big]", cal), sub = $("[data-cal-sub]", cal), strip = $(".cal-strip", cal), box = $("[data-cal-box]", cal), legend = $(".cal-legend", cal);
    var DAYS = { gunluk: 1, iki: 14, aylik: 30 }, NAMES = { gunluk: "Günlük", iki: "İki haftalık", aylik: "Aylık" };
    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function parse(s) { var a = (s || "").split("-"); return a.length === 3 ? new Date(+a[0], +a[1] - 1, +a[2], 12) : null; }
    function fmt(d) { return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }); }
    var today = new Date(); today.setHours(12, 0, 0, 0);
    if (dateIn && !dateIn.value) dateIn.value = iso(today);
    function calc() {
      var t = val(cal, "ltype") || "iki", per = DAYS[t], open = parse(dateIn.value) || today;
      var used = Math.round((today - open) / 864e5);
      var n = Math.max(1, Math.min(360, parseInt(countIn.value, 10) || 1)), pairs = Math.floor(n / 2);
      strip.innerHTML = ""; legend.hidden = t === "gunluk";
      if (used < 0) {
        big.textContent = "Açılış günü ileri bir tarih";
        sub.textContent = "Lensi ilk açtığınız günü seçin; hesap o günden başlar.";
      } else if (t === "gunluk") {
        big.textContent = "Her gün yeni bir çift";
        sub.textContent = "Günlük lens bir kez takılır, çıkarılınca atılır; ertesi gün yenisi takılır.";
      } else {
        var change = new Date(open.getTime() + per * 864e5), left = per - used;
        big.textContent = left > 0 ? "Değişim günü: " + fmt(change) : (left === 0 ? "Bugün yeni çifte geçin" : "Değişim günü geçti");
        sub.textContent = left > 0 ? "Bu çiftle kalan süre: " + left + " gün." : (left === 0 ? "Bu çiftin süresi bugün doluyor." : "Süre " + (-left) + " gün önce doldu; yeni çifte geçmeniz önerilir.");
        var html = "";
        for (var i = 0; i < per; i++) html += '<i class="' + (i < used ? "past" : "") + (i === used ? " now" : "") + (i === per - 1 ? " end" : "") + '" title="' + (i + 1) + '. gün"></i>';
        strip.innerHTML = html;
      }
      var lasts = pairs * per;
      box.textContent = pairs < 1 ? "İki göz için en az 2 lens gerekir." :
        "Kutudaki " + n + " lens, iki göz için yaklaşık " + lasts + " gün yeter" +
        (used >= 0 ? " (tahmini bitiş: " + fmt(new Date(open.getTime() + lasts * 864e5)) + ")." : ".") +
        (n % 2 ? " Tek kalan lens yedek olarak durur." : "");
      return { t: t, n: n };
    }
    builder(cal, function () {
      var r = calc(), name = txt(cal, "[data-name]");
      return "Merhaba " + BRAND + ",\n" + NAMES[r.t] + " kontakt lensimi yenilemek istiyorum.\n" +
        "Kullandığım lensin kutusunun ve reçetemin fotoğrafını bu mesaja ekleyeceğim.\n" +
        "Seçenekler hakkında bilgi verebilir misiniz?" + (name ? "\nAdım: " + name : "");
    });
  })();

  /* ---- iletişim mesajı ---- */
  var msgTool = $("[data-tool='mesaj']");
  if (msgTool) builder(msgTool, function () {
    var konu = val(msgTool, "konu") || "Genel bilgi", zaman = val(msgTool, "zaman"), name = txt(msgTool, "[data-name]"), note = txt(msgTool, "[data-note]");
    var rx = $("[data-rx]", msgTool).checked;
    return "Merhaba " + BRAND + ",\n" + konu + " konusunda yazıyorum.\n" +
      (zaman ? "Mağazaya gelmeyi düşündüğüm zaman: " + zaman + ".\n" : "") +
      (rx ? "Reçetem var; fotoğrafını bu mesaja ekleyeceğim.\n" : "") +
      (note ? "Not: " + note + "\n" : "") +
      "Bilgi verebilir misiniz?" + (name ? "\nAdım: " + name : "");
  });
})();
