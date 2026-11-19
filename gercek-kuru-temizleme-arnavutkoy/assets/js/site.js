/* Gerçek Kuru Temizleme — site.js (kütüphanesiz) */
document.documentElement.classList.add("js");

var BRAND = "Gerçek Kuru Temizleme";
var WA_BASE = "https://wa.me/905319113273";
var TEL_HREF = "tel:+905319113273";
var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };

/* ---- kit/status.js'ten kopya: açık/kapalı durumu ---- */
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
var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function waHref(msg) { return WA_BASE + "?text=" + encodeURIComponent(msg); }
function store(key, val) {
  try {
    if (val === undefined) return JSON.parse(window.sessionStorage.getItem(key) || "null");
    window.sessionStorage.setItem(key, JSON.stringify(val));
  } catch (e) { return null; }
  return null;
}
function copyText(text, btn) {
  function done(ok) {
    if (!btn) return;
    var old = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", old);
    btn.textContent = ok ? "Kopyalandı" : "Kopyalanamadı, elle seçin";
    setTimeout(function () { btn.textContent = old; }, 1800);
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta); done(ok);
  }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
  else fallback();
}

/* ---- canlı durum ---- */
function initStatus() {
  var s = openStatus(HOURS);
  var text = s.all24 ? "Şu an açık · Her gün 24 saat açık" : s.text;
  $$("[data-status]").forEach(function (el) {
    el.textContent = text;
    el.classList.toggle("is-open", s.open);
    var box = el.closest(".status"); if (box) box.classList.toggle("is-open", s.open);
  });
  $$("[data-day]").forEach(function (tr) {
    var today = parseInt(tr.getAttribute("data-day"), 10) === s.dayIndex;
    tr.classList.toggle("is-today", today);
    if (today && !tr.querySelector(".today")) {
      var b = document.createElement("span"); b.className = "today"; b.textContent = "bugün";
      tr.querySelector("th").appendChild(b);
    }
  });
}

/* ---- menü ---- */
function initNav() {
  var b = $(".navbtn"), n = $("#nav");
  if (!b || !n) return;
  b.addEventListener("click", function () {
    var open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", String(!open));
    document.body.classList.toggle("nav-open", !open);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) { b.click(); b.focus(); }
  });
}

/* ---- imza: kayan askı rayı (konveyör) ---- */
function initConveyor(root) {
  var vp = $(".conv__vp", root), track = $(".conv__track", root), rail = $(".conv__rail", root);
  if (!vp || !track) return;
  var base = $$(".garment", track);
  if (!base.length) return;
  root.classList.add("is-live");
  var sets = 1, setW = 0, x = 0, last = 0, tilt = 0, hover = false, focusIn = false, paused = REDUCE, drag = null, tween = null, lastDrag = 0, running = false, visible = true;
  var speed = 30;
  var pauseBtn = $("[data-pause]", root), info = $(".conv__info", root);

  function addSet() {
    base.forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute("aria-hidden", "true"); c.classList.add("is-clone");
      $$("button,a", c).forEach(function (el) { el.setAttribute("tabindex", "-1"); });
      track.appendChild(c);
    });
    sets++;
  }
  function measure() {
    if (sets < 2) addSet();
    setW = track.children[base.length].offsetLeft - track.children[0].offsetLeft;
    var need = 1 + Math.ceil((vp.clientWidth + 40) / Math.max(1, setW));
    while (sets < need + 1) addSet();
  }
  function wrap() {
    if (setW <= 0) return;
    var d = 0;
    while (x <= -setW) { x += setW; d += setW; }
    while (x > 0) { x -= setW; d -= setW; }
    if (d) { if (tween) { tween.from += d; tween.to += d; } if (drag) drag.start += d; }
  }
  function render() {
    track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    if (rail) rail.style.backgroundPosition = x.toFixed(1) + "px 0, 0 0";
    track.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
  }
  function tick(t) {
    if (!visible) { running = false; last = 0; return; }
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    var prev = x;
    if (tween) {
      var p = Math.min(1, (t - tween.t0) / tween.d), e = 1 - Math.pow(1 - p, 3);
      x = tween.from + (tween.to - tween.from) * e;
      if (p >= 1) tween = null;
    } else if (!drag && !paused && !hover && !focusIn) {
      x -= speed * dt;
    }
    var vel = dt ? (x - prev) / dt : 0;
    wrap();
    var target = Math.max(-9, Math.min(9, vel / 45));
    if (REDUCE) target = 0;
    tilt += (target - tilt) * 0.1;
    render();
    requestAnimationFrame(tick);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(tick); } }
  function step(dir) {
    var w = base[0].offsetWidth + 8;
    var from = x;
    if (REDUCE) { x = from - dir * w; wrap(); render(); return; }
    tween = { from: from, to: from - dir * w, t0: performance.now(), d: 520 };
    start();
  }
  function setPaused(v) {
    paused = v;
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", String(v));
      pauseBtn.setAttribute("aria-label", v ? "Rayı çalıştır" : "Rayı durdur");
    }
  }

  measure();
  setPaused(REDUCE);
  render();
  start();
  window.addEventListener("resize", function () { measure(); wrap(); render(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting && !document.hidden; if (visible) start(); }).observe(root);
  }
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; if (visible) start(); });

  vp.addEventListener("mouseenter", function () { hover = true; });
  vp.addEventListener("mouseleave", function () { hover = false; });
  root.addEventListener("focusin", function () { focusIn = true; });
  root.addEventListener("focusout", function () { focusIn = false; });

  vp.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag = { x0: e.clientX, start: x, moved: false, id: e.pointerId };
    tween = null;
  });
  vp.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true;
      try { vp.setPointerCapture(drag.id); } catch (err) { /* yoksay */ }
      root.classList.add("is-drag");
    }
    if (drag.moved) { x = drag.start + dx; wrap(); if (REDUCE) render(); }
  });
  function end() {
    if (!drag) return;
    if (drag.moved) lastDrag = performance.now();
    drag = null; root.classList.remove("is-drag");
  }
  vp.addEventListener("pointerup", end);
  vp.addEventListener("pointercancel", end);
  vp.addEventListener("lostpointercapture", end);

  var prev = $("[data-prev]", root), next = $("[data-next]", root);
  if (prev) prev.addEventListener("click", function () { step(-1); });
  if (next) next.addEventListener("click", function () { step(1); });
  if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!paused); });

  function pick(li) {
    var key = li.getAttribute("data-key");
    $$(".garment", track).forEach(function (g) { g.classList.toggle("is-picked", g.getAttribute("data-key") === key); });
    if (!info) return;
    $(".pick__name", info).textContent = li.getAttribute("data-name");
    $(".pick__desc", info).textContent = li.getAttribute("data-desc");
    $(".pick__svc", info).setAttribute("href", li.getAttribute("data-href"));
    $(".pick__add", info).setAttribute("href", "talep.html?ekle=" + li.getAttribute("data-ekle"));
    var fig = $(".pick__fig", info), svg = li.querySelector("svg");
    fig.innerHTML = svg ? svg.outerHTML : "";
    info.hidden = false;
    setPaused(true);
  }
  track.addEventListener("click", function (e) {
    var btn = e.target.closest(".garment__btn");
    if (!btn) return;
    if (performance.now() - lastDrag < 300) { e.preventDefault(); return; }
    pick(btn.closest(".garment"));
  });
  var x0 = info && $(".pick__x", info);
  if (x0) x0.addEventListener("click", function () {
    info.hidden = true;
    $$(".garment", track).forEach(function (g) { g.classList.remove("is-picked"); });
    if (!REDUCE) setPaused(false);
  });
}

/* ---- imza: etiket okuyucu ---- */
var FAM = { yikama: "Yıkama", agartma: "Ağartma", kurutma: "Kurutma", utu: "Ütü", profesyonel: "Profesyonel bakım" };
var FAM_ORDER = ["yikama", "agartma", "kurutma", "utu", "profesyonel"];
var FAMICON = { yikama: "s-wash", agartma: "s-bleach", kurutma: "s-dry", utu: "s-iron", profesyonel: "s-pro" };
function symInfo(item) {
  return {
    code: item.getAttribute("data-code"),
    fam: item.getAttribute("data-fam"),
    title: $(".sym__t", item).textContent,
    text: $(".sym__d", item).textContent,
    tip: $(".sym__tip", item).textContent,
    svg: item.querySelector("svg").outerHTML
  };
}
function initCare(root) {
  var items = $$(".sym", root), reader = $(".reader", root);
  if (!items.length || !reader) return;
  var current = null, mine = {};
  var addBtn = $("[data-add]", root), msgEl = $("[data-msg]", root), waEl = $("[data-wa]", root);
  var garment = $("[data-garment]", root), note = $("[data-note]", root), copyBtn = $("[data-copy]", root);

  function show(item, quiet) {
    current = item;
    var s = symInfo(item);
    items.forEach(function (i) {
      var on = i === item;
      i.classList.toggle("is-on", on);
      i.querySelector(".sym__btn").setAttribute("aria-pressed", String(on));
    });
    $(".reader__sym", reader).innerHTML = s.svg;
    $(".reader__fam", reader).textContent = FAM[s.fam];
    $(".reader__title", reader).textContent = s.title;
    $(".reader__text", reader).textContent = s.text;
    $(".reader__tip", reader).textContent = s.tip;
    reader.classList.remove("is-new"); void reader.offsetWidth; if (!quiet) reader.classList.add("is-new");
    if (addBtn) {
      var inMine = mine[s.fam] === s.code;
      addBtn.textContent = inMine ? "Etiketimden çıkar" : (mine[s.fam] ? "Bu grupta bununla değiştir" : "Etiketime ekle");
      addBtn.classList.toggle("is-in", inMine);
    }
  }
  items.forEach(function (i) {
    i.querySelector(".sym__btn").addEventListener("click", function () {
      show(i);
      var stuck = getComputedStyle(reader.parentNode).position === "sticky";
      if (!stuck && window.innerWidth < 900 && reader.getBoundingClientRect().top > window.innerHeight - 120) {
        reader.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "center" });
      }
    });
  });

  $$("[data-filter]", root).forEach(function (ch) {
    ch.addEventListener("click", function () {
      var f = ch.getAttribute("data-filter");
      $$("[data-filter]", root).forEach(function (c) { c.setAttribute("aria-pressed", String(c === ch)); });
      items.forEach(function (i) { i.hidden = !(f === "hepsi" || i.getAttribute("data-fam") === f); });
    });
  });

  function byCode(code) { for (var i = 0; i < items.length; i++) if (items[i].getAttribute("data-code") === code) return items[i]; return null; }
  function renderLabel() {
    items.forEach(function (i) { i.classList.toggle("is-mine", mine[i.getAttribute("data-fam")] === i.getAttribute("data-code")); });
    $$("[data-slot]", root).forEach(function (slot) {
      var f = slot.getAttribute("data-slot"), code = mine[f], it = code && byCode(code);
      if (it) {
        var s = symInfo(it);
        slot.innerHTML = s.svg; slot.classList.add("is-filled");
        slot.setAttribute("aria-label", FAM[f] + ": " + s.title + ". Çıkarmak için dokunun");
      } else {
        slot.innerHTML = '<span class="slot__empty"><svg viewBox="0 0 48 52" aria-hidden="true"><use href="#' + FAMICON[f] + '"/></svg></span>'; slot.classList.remove("is-filled");
        slot.setAttribute("aria-label", FAM[f] + ": boş");
      }
    });
    buildMsg();
  }
  function buildMsg() {
    if (!msgEl) return;
    var lines = ["Merhaba " + BRAND + ", bir giysim için bilgi almak istiyorum.", ""];
    lines.push("Giysi: " + (garment ? garment.value : "Belirtilmedi"));
    var picked = FAM_ORDER.filter(function (f) { return mine[f]; });
    if (picked.length) {
      lines.push("Etiketindeki semboller:");
      picked.forEach(function (f) { var s = symInfo(byCode(mine[f])); lines.push("• " + FAM[f] + ": " + s.title); });
    } else {
      lines.push("Etiketindeki semboller: henüz seçmedim (fotoğrafını gönderebilirim).");
    }
    var n = note && note.value.trim();
    if (n) lines.push("Not: " + n);
    lines.push("", "Bu parça için hangi işlemi önerirsiniz, fiyat ve hazır olacağı gün hakkında bilgi alabilir miyim?");
    var msg = lines.join("\n");
    msgEl.textContent = msg;
    if (waEl) waEl.setAttribute("href", waHref(msg));
  }
  if (addBtn) addBtn.addEventListener("click", function () {
    if (!current) return;
    var s = symInfo(current);
    if (mine[s.fam] === s.code) delete mine[s.fam]; else mine[s.fam] = s.code;
    renderLabel(); show(current, true);
    var slot = $('[data-slot="' + s.fam + '"]', root);
    if (slot && mine[s.fam]) { slot.classList.remove("is-pop"); void slot.offsetWidth; slot.classList.add("is-pop"); }
  });
  $$("[data-slot]", root).forEach(function (slot) {
    slot.addEventListener("click", function () {
      var f = slot.getAttribute("data-slot");
      if (mine[f]) { var it = byCode(mine[f]); delete mine[f]; renderLabel(); if (it) show(it, true); }
    });
  });
  if (garment) garment.addEventListener("change", buildMsg);
  if (note) note.addEventListener("input", buildMsg);
  if (copyBtn) copyBtn.addEventListener("click", function () { copyText(msgEl.textContent, copyBtn); });

  show(items[0], true);
  renderLabel();
}

/* ---- parça sayaçlı talep ---- */
function initTalep(root) {
  var rows = $$(".cnt", root);
  if (!rows.length) return;
  var counts = store("gkt-talep") || {};
  var rail = $("[data-rail]", root), empty = $("[data-empty]", root), total = $("[data-total]", root);
  var msgEl = $("[data-msg]", root), waEl = $("[data-wa]", root), warn = $("[data-warn]", root);
  var lastAdded = null;

  var m = location.search.match(/[?&]ekle=([a-z0-9-]+)/i);
  if (m && rows.some(function (r) { return r.getAttribute("data-key") === m[1]; })) {
    counts[m[1]] = Math.min(99, (counts[m[1]] || 0) + 1);
    lastAdded = m[1];
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) { /* yoksay */ }
  }

  function val(sel) { var el = $(sel, root); return el ? el.value.trim() : ""; }
  function checked(name) { return $$('input[name="' + name + '"]:checked', root).map(function (i) { return i.value; }); }

  function renderRail() {
    var sum = 0, html = [], shown = 0, MAX = 28;
    rows.forEach(function (r) {
      var k = r.getAttribute("data-key"), c = counts[k] || 0;
      sum += c;
      r.querySelector("output").textContent = c;
      r.classList.toggle("is-on", c > 0);
      var gid = r.getAttribute("data-g"), name = r.getAttribute("data-name");
      for (var i = 0; i < c; i++) {
        if (shown < MAX) {
          var isNew = (k === lastAdded && i === c - 1);
          html.push('<span class="mini' + (isNew ? " is-new" : "") + '" title="' + name + '"><svg viewBox="0 0 120 232" aria-hidden="true"><use href="#' + gid + '"/></svg></span>');
          shown++;
        }
      }
    });
    if (sum > shown) html.push('<span class="mini-more">+' + (sum - shown) + "</span>");
    rail.innerHTML = html.join("");
    empty.hidden = sum > 0;
    total.textContent = sum;
    lastAdded = null;
    return sum;
  }
  function buildMsg() {
    var sum = 0, parts = [];
    rows.forEach(function (r) {
      var c = counts[r.getAttribute("data-key")] || 0;
      if (c) { sum += c; parts.push("• " + c + " × " + r.getAttribute("data-name")); }
    });
    var lines = ["Merhaba " + BRAND + ", web sitenizden talep oluşturdum.", ""];
    if (parts.length) { lines.push("Parçalar (toplam " + sum + "):"); lines = lines.concat(parts); }
    else lines.push("Parçalar: henüz seçmedim.");
    lines.push("");
    var islem = checked("islem")[0]; if (islem) lines.push("İstenen işlem: " + islem);
    var leke = checked("leke"), yer = val("[data-lekeyer]");
    if (leke.length || yer) lines.push("Leke: " + (leke.length ? leke.join(", ") : "var") + (yer ? " (yeri: " + yer + ")" : ""));
    var getir = checked("getir")[0];
    if (getir === "soru") {
      var mh = val("[data-mahalle-in]");
      lines.push("Adresten alım yapıyor musunuz?" + (mh ? " Mahallem: " + mh + "." : ""));
    } else {
      lines.push("Getirme: Parçaları dükkâna kendim getireceğim.");
    }
    var z = val("[data-zaman]"); if (z && z !== "Belirtmeyeyim") lines.push("Uğrama zamanı: " + z);
    var not = val("[data-not]"); if (not) lines.push("Not: " + not);
    lines.push("", "Fiyat ve hazır olacağı gün hakkında bilgi verebilir misiniz?");
    var ad = val("[data-ad]"); if (ad) lines.push("Adım: " + ad);
    var msg = lines.join("\n");
    msgEl.textContent = msg;
    waEl.setAttribute("href", waHref(msg));
    var ok = sum > 0 || !!not;
    waEl.classList.toggle("is-off", !ok);
    waEl.setAttribute("aria-disabled", String(!ok));
    if (ok && warn) warn.hidden = true;
    return ok;
  }
  function update() { renderRail(); buildMsg(); store("gkt-talep", counts); }

  rows.forEach(function (r) {
    $$(".cnt__b", r).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = r.getAttribute("data-key"), d = parseInt(b.getAttribute("data-d"), 10);
        counts[k] = Math.max(0, Math.min(99, (counts[k] || 0) + d));
        if (d > 0) lastAdded = k;
        update();
      });
    });
  });
  root.addEventListener("input", buildMsg);
  root.addEventListener("change", function (e) {
    if (e.target.name === "getir") $("[data-mahalle]", root).hidden = e.target.value !== "soru";
    buildMsg();
  });
  waEl.addEventListener("click", function (e) {
    if (!buildMsg()) { e.preventDefault(); if (warn) warn.hidden = false; }
  });
  var copyBtn = $("[data-copy]", root);
  if (copyBtn) copyBtn.addEventListener("click", function () { copyText(msgEl.textContent, copyBtn); });
  var reset = $("[data-reset]", root);
  if (reset) reset.addEventListener("click", function () { counts = {}; update(); });

  update();
  if (m) setTimeout(function () { root.scrollIntoView({ behavior: "auto", block: "start" }); }, 60);
}

document.addEventListener("DOMContentLoaded", function () {
  initStatus();
  initNav();
  $$("[data-conveyor]").forEach(initConveyor);
  $$(".care").forEach(initCare);
  $$("form.talep").forEach(initTalep);
});
