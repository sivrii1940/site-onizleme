/* Lellini Patisserie — site betiği (kütüphane yok). */
var HOURS = { "0": [["09:00", "23:00"]], "1": [["09:00", "23:00"]], "2": [["09:00", "23:00"]], "3": [["09:00", "23:00"]], "4": [["09:00", "23:00"]], "5": [["09:00", "23:00"]], "6": [["09:00", "23:00"]] };
var WA_BASE = "https://wa.me/905060568314";
var BRAND = "Lellini Patisserie";

/* Açık/kapalı durumu — kit/status.js'ten kopyalandı */
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
  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function waUrl(msg) { return WA_BASE + "?text=" + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function lower(s) { try { return s.toLocaleLowerCase("tr-TR"); } catch (e) { return s.toLowerCase(); } }

  /* ---------- canlı durum, haftalık çizelge, gün çizgisi */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.add("is-live");
      el.classList.toggle("is-open", s.open);
    });
    $$("[data-week] li").forEach(function (li) {
      var today = parseInt(li.getAttribute("data-day"), 10) === s.dayIndex;
      li.classList.toggle("is-today", today);
      if (today) li.style.setProperty("--now", (s.minutes / 1440).toFixed(4));
    });
    placeDayMarker(s);
  }
  function placeDayMarker(s) {
    var wrap = $("[data-dayline]"), mark = $("[data-day-now]");
    if (!wrap || !mark) return;
    var stops = [540, 720, 960, 1140, 1380];
    var dots = $$(".dayline li", wrap);
    var m = s.minutes;
    if (!s.open || m < stops[0] || m > stops[4] || dots.length !== 5) { mark.hidden = true; return; }
    var i = 0; while (i < 3 && m >= stops[i + 1]) i++;
    var f = (m - stops[i]) / (stops[i + 1] - stops[i]);
    var wr = wrap.getBoundingClientRect();
    var a = dots[i].getBoundingClientRect(), b = dots[i + 1].getBoundingClientRect();
    var horizontal = Math.abs(b.top - a.top) < 8;
    mark.hidden = false;
    if (horizontal) {
      var x = (a.left - wr.left) + 12 + f * (b.left - a.left);
      mark.style.transform = "translate(" + Math.round(x - 12) + "px, -26px)";
    } else {
      var y = (a.top - wr.top) + f * (b.top - a.top);
      mark.style.transform = "translate(-6px, " + Math.round(y - 22) + "px)";
    }
  }
  paintStatus();
  setInterval(paintStatus, 60000);
  window.addEventListener("resize", function () { placeDayMarker(openStatus(HOURS)); });
  window.addEventListener("load", function () { placeDayMarker(openStatus(HOURS)); });

  /* ---------- gezinme */
  var navBtn = $(".nav-btn"), panel = $("#nav-panel");
  if (navBtn && panel) {
    function setNav(open) {
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("open", open);
      $("span", navBtn).textContent = open ? "Kapat" : "Menü";
      $("use", navBtn).setAttribute("href", open ? "#i-kapat" : "#i-menu");
    }
    navBtn.addEventListener("click", function () { setNav(navBtn.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) { setNav(false); navBtn.focus(); } });
    doc.addEventListener("click", function (e) { if (panel.classList.contains("open") && !e.target.closest(".nav")) setNav(false); });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  }

  /* ---------- kopyalama */
  function copyText(text, btn) {
    function done() {
      if (!btn) return;
      var old = btn.getAttribute("data-label") || btn.innerHTML;
      btn.setAttribute("data-label", old);
      btn.classList.add("copied");
      btn.textContent = "Kopyalandı";
      setTimeout(function () { btn.classList.remove("copied"); btn.innerHTML = old; }, 1800);
    }
    function fallback() {
      var ta = doc.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand("copy"); } catch (e) { /* sessiz */ }
      doc.body.removeChild(ta); done();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  doc.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy],[data-copy-text]");
    if (!b) return;
    var t = b.hasAttribute("data-copy-text") ? b.getAttribute("data-copy-text") : (($(b.getAttribute("data-copy")) || {}).textContent || "");
    copyText(t, b);
  });

  /* ---------- kaydırıcı dolgusu */
  function fillRange(r) { var p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty("--p", p + "%"); }
  $$('input[type="range"]').forEach(function (r) { fillRange(r); r.addEventListener("input", function () { fillRange(r); }); });

  /* ---------- kişi sayısına göre yaklaşık boy (genel) */
  function sizeFor(n) {
    if (n <= 6) return { t: [{ w: 150, h: 64 }], txt: "16–18 cm, tek katlı yuvarlak pasta" };
    if (n <= 10) return { t: [{ w: 178, h: 70 }], txt: "20–22 cm, tek katlı yuvarlak pasta" };
    if (n <= 15) return { t: [{ w: 206, h: 74 }], txt: "24–26 cm, tek katlı yuvarlak pasta" };
    if (n <= 20) return { t: [{ w: 230, h: 78 }], txt: "26–28 cm tek katlı ya da küçük iki katlı pasta" };
    if (n <= 35) return { t: [{ w: 232, h: 70 }, { w: 154, h: 60 }], txt: "iki katlı pasta" };
    if (n <= 60) return { t: [{ w: 244, h: 62 }, { w: 180, h: 56 }, { w: 120, h: 50 }], txt: "üç katlı ya da dikdörtgen (tepsi) pasta" };
    return { t: [{ w: 244, h: 62 }, { w: 180, h: 56 }, { w: 120, h: 50 }], txt: "birden fazla pasta ya da büyük dikdörtgen pasta" };
  }

  /* ---------- ana sayfa: pasta standı */
  var stand = $("[data-stand]");
  if (stand) {
    var tiers = $$(".tier", stand), btns = $$(".tier-btn", stand), infos = $$(".tier-info", stand);
    var order = ["pasta", "tatli", "kurabiye"], cur = "pasta", userTouched = false, timer = null;
    stand.classList.add("is-live");
    function setTier(name) {
      cur = name;
      stand.setAttribute("data-active", name);
      tiers.forEach(function (t) { t.classList.toggle("on", t.getAttribute("data-tier") === name); });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tier") === name ? "true" : "false"); });
      infos.forEach(function (i) { i.classList.toggle("on", i.getAttribute("data-info") === name); });
    }
    function stopAuto() { userTouched = true; if (timer) { clearInterval(timer); timer = null; } }
    tiers.forEach(function (t) { t.addEventListener("click", function () { stopAuto(); setTier(t.getAttribute("data-tier")); }); });
    btns.forEach(function (b) { b.addEventListener("click", function () { stopAuto(); setTier(b.getAttribute("data-tier")); }); });
    setTier("pasta");
    if (!reduce) {
      setTimeout(function () {
        if (userTouched) return;
        timer = setInterval(function () {
          if (userTouched || doc.hidden) return;
          setTier(order[(order.indexOf(cur) + 1) % 3]);
        }, 4200);
      }, 2200);
      stand.addEventListener("pointerenter", function () { if (timer) { clearInterval(timer); timer = null; } });
    }
  }

  /* ---------- ana sayfa: yatay vitrin */
  var rail = $("[data-rail]");
  if (rail) {
    var step = function () { var it = $(".rail-item", rail); return it ? it.getBoundingClientRect().width + 18 : 240; };
    var prev = $("[data-rail-prev]"), next = $("[data-rail-next]"), autoOn = !reduce, railSeen = false;
    function go(dir) {
      var max = rail.scrollWidth - rail.clientWidth - 4;
      if (dir > 0 && rail.scrollLeft >= max) rail.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
      else rail.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { autoOn = false; go(-1); });
    if (next) next.addEventListener("click", function () { autoOn = false; go(1); });
    ["pointerdown", "wheel", "touchstart", "focusin", "keydown"].forEach(function (ev) { rail.addEventListener(ev, function () { autoOn = false; }, { passive: true }); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { railSeen = en[0].isIntersecting; }, { threshold: .5 }).observe(rail);
    }
    setInterval(function () { if (autoOn && railSeen && !doc.hidden) go(1); }, 3600);
  }

  /* ---------- ana sayfa: kişi sayısı mini aracı */
  var mini = $("#mini-kisi");
  if (mini) {
    var out = $("#mini-out"), res = $("[data-mini-res]"), goBtn = $("[data-mini-go]");
    function upMini() {
      var n = parseInt(mini.value, 10);
      out.textContent = n + " kişi";
      res.textContent = "Yaklaşık öneri: " + sizeFor(n).txt;
      goBtn.setAttribute("href", "ozel-pasta.html?kisi=" + n + "#siparis");
    }
    mini.addEventListener("input", upMini); upMini();
  }

  /* ---------- vitrin: bölüm gezinmesinde etkin bağlantı */
  var catLinks = $$(".cat-track a");
  if (catLinks.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        catLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + x.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    catLinks.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) io.observe(s); });
  }

  /* ---------- vitrin: kutu hazırlama */
  var boxer = $('[data-tool="kutu"]');
  if (boxer) {
    var slotsEl = $("[data-slots]", boxer), countEl = $("[data-box-count]", boxer), msgEl = $("[data-box-msg]", boxer), waEl = $("[data-box-wa]", boxer);
    var noteEl = $("[data-box-note]", boxer), picks = $$(".pick", boxer), items = [], size = 9;
    var meta = {};
    picks.forEach(function (p) { meta[p.getAttribute("data-add")] = { name: p.getAttribute("data-name"), sym: p.getAttribute("data-sym") }; });
    function render() {
      if (items.length > size) items = items.slice(0, size);
      slotsEl.style.setProperty("--cols", size === 12 ? 4 : 3);
      var html = "";
      for (var i = 0; i < size; i++) {
        var k = items[i];
        html += k ? '<li class="slot"><button type="button" data-rm="' + i + '" aria-label="' + esc(meta[k].name) + ' çıkarın"><svg viewBox="0 0 120 100" aria-hidden="true"><use href="#' + meta[k].sym + '"/></svg></button></li>' : '<li class="slot"></li>';
      }
      slotsEl.innerHTML = html;
      var free = size - items.length;
      countEl.textContent = items.length ? (items.length + " / " + size + (free ? " · " + free + " boş yer" : " · kutu doldu")) : "Kutu boş · 0 / " + size;
      picks.forEach(function (p) { p.disabled = free === 0; });
      var when = ($('[name="kutu-gun"]:checked', boxer) || {}).value || "Bugün";
      var note = noteEl.value.trim();
      var lines;
      if (!items.length) {
        lines = ["Merhaba " + BRAND + ", " + lower(when) + " vitrinde hangi çeşitler olacak? " + size + " parçalık bir kutu hazırlatmayı düşünüyorum."];
      } else {
        var counts = {}, orderK = [];
        items.forEach(function (k) { if (!counts[k]) { counts[k] = 0; orderK.push(k); } counts[k]++; });
        lines = ["Merhaba " + BRAND + ", vitrinden " + size + " parçalık bir kutu hazırlatmak istiyorum.", "", "Kutuya koymak istediklerim:"];
        orderK.forEach(function (k) { lines.push("• " + counts[k] + " " + lower(meta[k].name)); });
        if (free) lines.push("• " + free + " parça: sizin önerinize bırakıyorum");
        lines.push("", "Ne zaman: " + when);
      }
      if (note) lines.push("Not: " + note);
      lines.push("", items.length ? "Bu çeşitler o gün vitrinde olur mu? Fiyat bilgisini de alabilir miyim?" : "Fiyat bilgisini de alabilir miyim?");
      var msg = lines.join("\n");
      msgEl.textContent = msg;
      waEl.setAttribute("href", waUrl(msg));
    }
    picks.forEach(function (p) {
      p.addEventListener("click", function () {
        if (items.length >= size) return;
        items.push(p.getAttribute("data-add"));
        p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump");
        render();
      });
    });
    slotsEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-rm]"); if (!b) return;
      items.splice(parseInt(b.getAttribute("data-rm"), 10), 1); render();
    });
    $$('[name="kutu-boy"]', boxer).forEach(function (r) { r.addEventListener("change", function () { size = parseInt(r.value, 10); render(); }); });
    $$('[name="kutu-gun"]', boxer).forEach(function (r) { r.addEventListener("change", render); });
    noteEl.addEventListener("input", render);
    $("[data-box-clear]", boxer).addEventListener("click", function () { items = []; render(); });
    render();
  }

  /* ---------- tarih yardımcıları */
  function todayISO() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
    catch (e) { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  }
  function trDate(iso, opts) {
    if (!iso) return "";
    var d = new Date(iso + "T12:00:00Z");
    try { return new Intl.DateTimeFormat("tr-TR", Object.assign({ timeZone: "UTC" }, opts)).format(d); } catch (e) { return iso; }
  }
  function dayDiff(iso) { return Math.round((new Date(iso + "T12:00:00Z") - new Date(todayISO() + "T12:00:00Z")) / 864e5); }
  $$('input[type="date"]').forEach(function (i) { i.min = todayISO(); });

  /* ---------- özel pasta oluşturucu */
  var COLORS = {
    gul: { name: "Gül kurusu", body: "#C77A8A", top: "#E7B3BE", pipe: "#FFF4F6", shade: "#7E3A4C", drip: "#5E3B32" },
    fistik: { name: "Fıstık yeşili", body: "#A9C9A4", top: "#D2E5CE", pipe: "#FFFDF7", shade: "#4F7A50", drip: "#FFFDF7" },
    krem: { name: "Krem", body: "#F1DDBB", top: "#FBF0DC", pipe: "#FFFFFF", shade: "#A88454", drip: "#C98A3F" },
    pudra: { name: "Pudra pembe", body: "#F2C6CF", top: "#FAE2E7", pipe: "#FFFFFF", shade: "#B9707F", drip: "#FFFFFF" },
    mavi: { name: "Bebek mavisi", body: "#BCD6E8", top: "#DEEBF5", pipe: "#FFFFFF", shade: "#6F8FA8", drip: "#FFFFFF" },
    beyaz: { name: "Beyaz", body: "#FBF7F0", top: "#FFFFFF", pipe: "#EADFD2", shade: "#B9A896", drip: "#E8CF92" },
    cikolata: { name: "Çikolata", body: "#6E4336", top: "#8A5A48", pipe: "#F1D9B9", shade: "#2E1A14", drip: "#F1D9B9" }
  };
  var THEMES = { dogum: "Doğum günü", cocuk: "Çocuk doğum günü", nisan: "Nişan / söz", yildonumu: "Yıl dönümü", bebek: "Bebek / diş buğdayı", mezuniyet: "Mezuniyet", kurumsal: "Kurumsal / ofis", sade: "Sade ve şık" };
  function f1(x) { return Math.round(x * 10) / 10; }
  function starPath(x, y, r) {
    var d = "";
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? "L" : "M") + f1(x + rr * Math.cos(a)) + " " + f1(y + rr * Math.sin(a)); }
    return d + "Z";
  }
  function heartPath(x, y, s) {
    var k = s / 10;
    return "M" + f1(x) + " " + f1(y + 7 * k) + "C" + f1(x - 9 * k) + " " + f1(y + k) + " " + f1(x - 5 * k) + " " + f1(y - 6 * k) + " " + f1(x) + " " + f1(y - 2 * k) +
      "C" + f1(x + 5 * k) + " " + f1(y - 6 * k) + " " + f1(x + 9 * k) + " " + f1(y + k) + " " + f1(x) + " " + f1(y + 7 * k) + "Z";
  }
  function splitText(t) {
    t = t.trim(); if (!t) return [];
    if (t.length <= 16) return [t];
    var mid = Math.floor(t.length / 2), best = -1;
    for (var i = 0; i < t.length; i++) if (t[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    if (best < 0) return [t.slice(0, 20), t.slice(20)];
    return [t.slice(0, best), t.slice(best + 1)];
  }
  function renderCake(st) {
    var c = COLORS[st.color] || COLORS.gul, sz = sizeFor(st.people), T = sz.t, cx = 180, s = "";
    s += '<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pasta önizlemesi: ' + esc(THEMES[st.theme] || "") + ", " + esc(c.name) + ", " + T.length + ' katlı">';
    s += '<defs><pattern id="ck-st" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#9DBF9E"/><rect x="10" width="10" height="10" fill="#FFF8EE"/></pattern>' +
      '<linearGradient id="ck-g" x1="0" x2="1"><stop offset="0" stop-color="#9C7A3C"/><stop offset=".4" stop-color="#F1DFA8"/><stop offset="1" stop-color="#B8914A"/></linearGradient></defs>';
    /* kapak (arkada açık duruyor) */
    var lid = "M40 228V58";
    for (var i = 0; i < 14; i++) lid += "q10 -12 20 0";
    lid += "V228Z";
    s += '<path d="' + lid + '" fill="url(#ck-st)" stroke="url(#ck-g)" stroke-width="2"/>';
    s += '<rect x="54" y="70" width="252" height="150" rx="4" fill="#FFFBF4"/><rect x="60" y="76" width="240" height="138" rx="2" fill="none" stroke="#D9BE86" stroke-dasharray="3 4"/>';
    s += '<rect x="268" y="46" width="22" height="182" fill="#B5546B"/><rect x="268" y="46" width="3" height="182" fill="#9A3F56"/><rect x="287" y="46" width="3" height="182" fill="#9A3F56"/>';
    s += '<path d="M279 52C258 26 238 40 252 54C259 60 270 58 279 52Z" fill="#B5546B"/><path d="M279 52C300 26 320 40 306 54C299 60 288 58 279 52Z" fill="#C9687E"/><ellipse cx="279" cy="53" rx="7" ry="6" fill="#9A3F56"/>';
    /* etiket */
    s += '<path d="M282 58Q300 80 312 96" fill="none" stroke="#B8914A" stroke-width="1.3"/>';
    s += '<g transform="rotate(9 318 130)"><rect x="287" y="96" width="64" height="74" rx="7" fill="#FFFBF4" stroke="url(#ck-g)" stroke-width="2"/><circle cx="319" cy="106" r="3.5" fill="none" stroke="#B8914A" stroke-width="1.3"/>';
    s += '<text x="319" y="128" text-anchor="middle" font-family="Yeseva One, serif" font-size="' + (st.tag1.length > 8 ? 11 : 12.5) + '" fill="#3A2A2E">' + esc(st.tag1) + '</text>';
    s += '<text x="319" y="144" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="10" fill="#6A5258">' + esc(st.tag2) + '</text>';
    s += '<text x="319" y="160" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="10" font-weight="700" fill="#9A3F56">' + esc(st.people + " kişi") + '</text></g>';
    /* pasta altlığı */
    var bw = T[0].w;
    s += '<ellipse cx="180" cy="288" rx="' + (bw / 2 + 20) + '" ry="12" fill="#C9A55E"/><ellipse cx="180" cy="285" rx="' + (bw / 2 + 20) + '" ry="11" fill="#FFF3DB" stroke="#D9BE86"/>';
    s += '<g class="cake-g">';
    var top = 284, tiersOut = [];
    T.forEach(function (t, idx) {
      var rx = t.w / 2, ry = t.w * .1;
      top = idx === 0 ? 284 - t.h - ry : top - t.h + 2;
      tiersOut.push({ top: top, h: t.h, rx: rx, ry: ry });
    });
    tiersOut.forEach(function (g, idx) {
      var rx = g.rx, ry = g.ry, tp = g.top, h = g.h;
      s += '<path d="M' + f1(cx - rx) + " " + f1(tp) + "V" + f1(tp + h) + "A" + rx + " " + f1(ry) + " 0 0 0 " + f1(cx + rx) + " " + f1(tp + h) + "V" + f1(tp) + 'Z" fill="' + c.body + '"/>';
      s += '<path d="M' + f1(cx + rx * .5) + " " + f1(tp + ry * .866) + "V" + f1(tp + h + ry * .866) + "A" + rx + " " + f1(ry) + " 0 0 0 " + f1(cx + rx) + " " + f1(tp + h) + "V" + f1(tp) + 'Z" fill="' + c.shade + '" opacity=".22"/>';
      if (st.theme === "kurumsal" || st.theme === "yildonumu") {
        var y1 = tp + h - 13, y2 = tp + h - 6;
        s += '<path d="M' + f1(cx - rx) + " " + f1(y1) + "A" + rx + " " + f1(ry) + " 0 0 0 " + f1(cx + rx) + " " + f1(y1) + "V" + f1(y2) + "A" + rx + " " + f1(ry) + " 0 0 1 " + f1(cx - rx) + " " + f1(y2) + 'Z" fill="url(#ck-g)"/>';
      }
      /* yan süsler */
      var offs = [-.62, -.22, .22, .62];
      offs.forEach(function (o, j) {
        var x = cx + o * rx, y = tp + h * .5 + ry * Math.sqrt(1 - o * o) * .9;
        if (st.theme === "cocuk") s += '<path d="' + starPath(x, y, 7 + (j % 2) * 2) + '" fill="' + ["#F2B33D", "#9DBF9E", "#FFFFFF", "#BCD6E8"][(j + idx) % 4] + '"/>';
        else if (st.theme === "nisan" || st.theme === "yildonumu") s += '<path d="' + heartPath(x, y, 7) + '" fill="' + (st.color === "gul" ? "#FFF4F6" : "#B5546B") + '"/>';
        else if (st.theme === "bebek") s += '<circle cx="' + f1(x) + '" cy="' + f1(y - 6) + '" r="3.4" fill="#fff"/><circle cx="' + f1(x + rx * .2) + '" cy="' + f1(y + 8) + '" r="2.6" fill="#fff" opacity=".8"/>';
        else if (st.theme === "mezuniyet") s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="2.4" fill="#E8CF92"/>';
      });
      if (st.theme === "cocuk") {
        for (var q = 0; q < 9; q++) {
          var oo = -.85 + q * .21, xx = cx + oo * rx, yy = tp + h * (.22 + (q % 3) * .25) + ry * Math.sqrt(Math.max(0, 1 - oo * oo)) * .9;
          s += '<rect x="' + f1(xx) + '" y="' + f1(yy) + '" width="5" height="2.2" rx="1" transform="rotate(' + (q * 37 % 90 - 45) + " " + f1(xx) + " " + f1(yy) + ')" fill="' + ["#F2B33D", "#B5546B", "#7FA67D", "#6F8FA8"][q % 4] + '"/>';
        }
      }
      /* üst yüzey ve damla */
      s += '<ellipse cx="' + cx + '" cy="' + f1(tp) + '" rx="' + rx + '" ry="' + f1(ry) + '" fill="' + c.top + '"/>';
      if (st.theme === "dogum" || st.theme === "cocuk") {
        var N = Math.round(rx / 11), d = "M" + f1(cx - rx) + " " + f1(tp) + "A" + rx + " " + f1(ry) + " 0 0 0 " + f1(cx + rx) + " " + f1(tp);
        for (var k = N; k >= 0; k--) {
          var a = Math.PI * k / N, px = cx + rx * Math.cos(a), py = tp + ry * Math.sin(a) + 4, L = [7, 15, 9, 18, 6, 12][k % 6];
          d += "L" + f1(px + 2.6) + " " + f1(py) + "V" + f1(py + L) + "a2.6 2.6 0 0 1 -5.2 0V" + f1(py);
        }
        s += '<path d="' + d + 'Z" fill="' + (st.theme === "cocuk" ? "#FFFFFF" : c.drip) + '"/>';
        s += '<ellipse cx="' + cx + '" cy="' + f1(tp) + '" rx="' + rx + '" ry="' + f1(ry) + '" fill="' + (st.theme === "cocuk" ? "#FFFFFF" : c.drip) + '"/>';
      }
      /* inci sırası */
      var n = Math.round(rx / 6);
      for (var m = 0; m <= n; m++) {
        var aa = Math.PI * m / n;
        s += '<circle cx="' + f1(cx + rx * Math.cos(aa)) + '" cy="' + f1(tp + h + ry * Math.sin(aa) - 1) + '" r="3" fill="' + c.pipe + '"/>';
      }
      /* üst kenar krema rozetleri */
      if (st.theme === "sade" || st.theme === "nisan" || st.theme === "kurumsal" || st.theme === "bebek") {
        var nr = Math.round(rx / 9);
        for (var r = 0; r < nr; r++) {
          var ar = Math.PI * 2 * r / nr;
          s += '<circle cx="' + f1(cx + (rx - 6) * Math.cos(ar)) + '" cy="' + f1(tp + (ry - 2) * Math.sin(ar)) + '" r="4.2" fill="' + c.pipe + '" stroke="rgba(58,42,46,.12)" stroke-width=".6"/>';
        }
      }
    });
    var tt = tiersOut[tiersOut.length - 1], ttop = tt.top;
    /* tema süsleri (üst kat) */
    if (st.theme === "dogum") {
      var nc = tt.rx > 70 ? 5 : 3;
      for (var ci = 0; ci < nc; ci++) {
        var x0 = cx + (ci - (nc - 1) / 2) * 15, colr = ["#F3D3DA", "#9DBF9E", "#E8CF92", "#BCD6E8", "#F3D3DA"][ci];
        s += '<rect x="' + f1(x0 - 2.5) + '" y="' + f1(ttop - 24) + '" width="5" height="26" rx="1.5" fill="' + colr + '"/>';
        s += '<path d="M' + f1(x0 - 2.5) + " " + f1(ttop - 17) + "l5 -3M" + f1(x0 - 2.5) + " " + f1(ttop - 9) + 'l5 -3" stroke="#fff" stroke-width="1.3"/>';
        s += '<path class="flame" d="M' + f1(x0) + " " + f1(ttop - 38) + "Q" + f1(x0 + 6) + " " + f1(ttop - 30) + " " + f1(x0) + " " + f1(ttop - 26) + "Q" + f1(x0 - 6) + " " + f1(ttop - 30) + " " + f1(x0) + " " + f1(ttop - 38) + 'Z" fill="#F2B33D"/>';
      }
    } else if (st.theme === "mezuniyet") {
      s += '<path d="M' + (cx - 20) + " " + f1(ttop - 10) + "V" + f1(ttop - 2) + "Q" + cx + " " + f1(ttop + 4) + " " + (cx + 20) + " " + f1(ttop - 2) + "V" + f1(ttop - 10) + 'Z" fill="#2E2626"/>';
      s += '<path d="M' + cx + " " + f1(ttop - 26) + "L" + (cx + 34) + " " + f1(ttop - 14) + "L" + cx + " " + f1(ttop - 2) + "L" + (cx - 34) + " " + f1(ttop - 14) + 'Z" fill="#3A2A2E"/>';
      s += '<path d="M' + cx + " " + f1(ttop - 14) + "L" + (cx + 26) + " " + f1(ttop - 8) + "V" + f1(ttop + 6) + '" fill="none" stroke="#E8CF92" stroke-width="2"/><circle cx="' + (cx + 26) + '" cy="' + f1(ttop + 8) + '" r="3" fill="#E8CF92"/>';
    } else if (st.theme === "bebek") {
      s += '<path d="M' + cx + " " + f1(ttop - 10) + "L" + (cx - 18) + " " + f1(ttop - 20) + "V" + f1(ttop) + "Z M" + cx + " " + f1(ttop - 10) + "L" + (cx + 18) + " " + f1(ttop - 20) + "V" + f1(ttop) + 'Z" fill="#fff" stroke="' + c.shade + '" stroke-width="1"/><circle cx="' + cx + '" cy="' + f1(ttop - 10) + '" r="4.5" fill="' + c.body + '" stroke="#fff" stroke-width="1.5"/>';
    } else if (st.theme === "sade" || st.theme === "kurumsal") {
      [[-14, -2], [0, -6], [14, -2], [-6, 3], [8, 3]].forEach(function (p, i) {
        if (st.theme === "kurumsal" && i > 2) return;
        s += '<circle cx="' + (cx + p[0]) + '" cy="' + f1(ttop + p[1]) + '" r="5" fill="' + (st.theme === "kurumsal" ? "url(#ck-g)" : "#A3243F") + '"/>';
      });
    }
    /* plaket ya da tepe süsü */
    var lines = splitText(st.text);
    if (lines.length) {
      var fs = lines.length === 1 ? (lines[0].length <= 12 ? 17 : 15) : (Math.max(lines[0].length, lines[1].length) <= 16 ? 14 : 12.5);
      var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
      var pw = Math.max(100, Math.min(210, longest * fs * .6 + 30)), ph = lines.length === 1 ? 36 : 52;
      var py0 = ttop - 40 - ph, px0 = cx - pw / 2;
      s += '<path d="M' + f1(cx - 22) + " " + f1(py0 + ph) + "L" + f1(cx - 18) + " " + f1(ttop + 2) + "M" + f1(cx + 22) + " " + f1(py0 + ph) + "L" + f1(cx + 18) + " " + f1(ttop + 2) + '" stroke="url(#ck-g)" stroke-width="2.4"/>';
      s += '<rect x="' + f1(px0) + '" y="' + f1(py0) + '" width="' + f1(pw) + '" height="' + ph + '" rx="' + (ph / 2) + '" fill="#FFFBF4" stroke="url(#ck-g)" stroke-width="2.2"/>';
      s += '<rect x="' + f1(px0 + 4) + '" y="' + f1(py0 + 4) + '" width="' + f1(pw - 8) + '" height="' + (ph - 8) + '" rx="' + (ph / 2 - 4) + '" fill="none" stroke="#E8CF92" stroke-dasharray="2 3"/>';
      lines.forEach(function (l, li) {
        var ty = lines.length === 1 ? py0 + ph / 2 + fs * .36 : py0 + 22 + li * 17;
        s += '<text x="' + cx + '" y="' + f1(ty) + '" text-anchor="middle" font-family="Yeseva One, serif" font-size="' + fs + '" fill="#3A2A2E">' + esc(l) + "</text>";
      });
    } else if (st.theme === "cocuk") {
      s += '<path d="M' + cx + " " + f1(ttop) + "V" + f1(ttop - 46) + '" stroke="url(#ck-g)" stroke-width="2"/><path d="' + starPath(cx, ttop - 54, 15) + '" fill="#F2B33D" stroke="#C9A55E"/>';
    } else if (st.theme === "nisan" || st.theme === "yildonumu") {
      s += '<path d="M' + cx + " " + f1(ttop) + "V" + f1(ttop - 40) + '" stroke="url(#ck-g)" stroke-width="2"/><path d="' + heartPath(cx, ttop - 52, 20) + '" fill="#B5546B" stroke="#9A3F56"/>';
      if (st.theme === "nisan") s += '<circle cx="' + (cx - 8) + '" cy="' + f1(ttop - 78) + '" r="9" fill="none" stroke="url(#ck-g)" stroke-width="3"/><circle cx="' + (cx + 8) + '" cy="' + f1(ttop - 78) + '" r="9" fill="none" stroke="url(#ck-g)" stroke-width="3"/>';
    }
    s += "</g>";
    /* kutunun önü */
    s += '<rect x="24" y="292" width="312" height="58" rx="6" fill="url(#ck-st)"/><rect x="24" y="292" width="312" height="58" rx="6" fill="none" stroke="url(#ck-g)" stroke-width="2"/>';
    s += '<rect x="24" y="292" width="312" height="5" fill="#3A2A2E" opacity=".08"/>';
    s += '<rect x="169" y="292" width="22" height="58" fill="#B5546B"/><rect x="169" y="292" width="3" height="58" fill="#9A3F56"/><rect x="188" y="292" width="3" height="58" fill="#9A3F56"/>';
    s += '<circle cx="180" cy="321" r="17" fill="url(#ck-g)"/><circle cx="180" cy="321" r="13.5" fill="#FFFBF4"/><text x="180" y="327.5" text-anchor="middle" font-family="Yeseva One, serif" font-size="17" fill="#3A2A2E">L</text>';
    return s + "</svg>";
  }

  var builder = $('[data-tool="ozel-pasta"]');
  if (builder) {
    var form = $("[data-bform]", builder), kisi = $("#kisi"), kisiR = $("#kisi-r"), tarih = $("#tarih"), saat = $("#saat"), lez = $("#lezzet");
    var yazi = $("#yazi"), notEl = $("#not"), adEl = $("#ad"), cake = $("[data-cake]", builder), sizeEl = $("[data-size]", builder);
    var dateHint = $("[data-date-hint]", builder), msgEl2 = $("[data-msg]", builder), wa2 = $("[data-wa]", builder), cnt = $("[data-yazi-count]", builder);
    var rows = $$(".size-table tbody tr");
    var peek = $("[data-cake-peek]", builder), miniCake = $("[data-cake-mini]", builder), stageEl = $(".stage", builder);
    if (peek && "IntersectionObserver" in window) {
      var stageOut = false, inBuilder = false;
      var syncPeek = function () {
        var show = stageOut && inBuilder && window.innerWidth < 960;
        if (show && peek.hidden) { peek.hidden = false; peek.classList.remove("in"); void peek.offsetWidth; peek.classList.add("in"); }
        else if (!show) peek.hidden = true;
      };
      new IntersectionObserver(function (en) { stageOut = !en[0].isIntersecting; syncPeek(); }, { threshold: .15 }).observe(stageEl);
      new IntersectionObserver(function (en) { inBuilder = en[0].isIntersecting; syncPeek(); }, { rootMargin: "0px 0px -35% 0px" }).observe($("[data-bform]", builder));
      peek.addEventListener("click", function () { stageEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); });
    }
    var q = /[?&]kisi=(\d{1,3})/.exec(location.search);
    if (q) kisi.value = Math.max(2, Math.min(150, parseInt(q[1], 10)));
    function val(name) { var r = $('[name="' + name + '"]:checked', form); return r ? r.value : ""; }
    function people() { var n = parseInt(kisi.value, 10); return isNaN(n) ? 12 : Math.max(2, Math.min(150, n)); }
    var lastKey = "";
    function update(fromRange) {
      if (fromRange) kisi.value = kisiR.value;
      var n = people();
      kisiR.value = Math.max(4, Math.min(80, n)); fillRange(kisiR);
      var sz = sizeFor(n);
      sizeEl.textContent = "Yaklaşık öneri: " + sz.txt;
      rows.forEach(function (tr) { tr.classList.toggle("is-match", n >= +tr.getAttribute("data-min") && n <= +tr.getAttribute("data-max")); });
      var d = tarih.value, tag1 = "Tarih", tag2 = "seçilmedi", dateTxt = "henüz belli değil";
      if (d) {
        var diff = dayDiff(d);
        tag1 = trDate(d, { day: "numeric", month: "long" });
        tag2 = trDate(d, { weekday: "long" });
        dateTxt = trDate(d, { day: "numeric", month: "long", year: "numeric", weekday: "long" });
        dateHint.textContent = diff < 0 ? "Geçmiş bir tarih seçtiniz; lütfen tarihi kontrol edin." : (diff === 0 ? "Bugün için seçtiniz. " : diff === 1 ? "Yarın için seçtiniz. " : dateTxt + ", " + diff + " gün sonra. ") + (diff < 0 ? "" : "Uygunluğu pastane size söyler.");
      } else dateHint.textContent = "Tarih seçin; uygunluğu pastane size söyler.";
      var theme = val("tema") || "dogum", color = val("renk") || "gul", text = yazi.value.trim();
      cnt.textContent = yazi.value.length;
      var key = [n <= 6 ? 1 : n <= 10 ? 2 : n <= 15 ? 3 : n <= 20 ? 4 : n <= 35 ? 5 : 6, theme, color].join("|");
      var svgStr = renderCake({ people: n, theme: theme, color: color, text: text, tag1: tag1, tag2: tag2 });
      cake.innerHTML = svgStr;
      if (miniCake) miniCake.innerHTML = svgStr.replace(/ck-/g, "cm-").replace('viewBox="0 0 360 360"', 'viewBox="30 40 300 300"').replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true" focusable="false"');
      if (key === lastKey || reduce) { var g = $(".cake-g", cake); if (g) g.style.animation = "none"; }
      lastKey = key;
      var L = ["Merhaba " + BRAND + ", özel pasta siparişi için bilgi almak istiyorum.", ""];
      L.push("• Kişi sayısı: " + n + " (yaklaşık öneri: " + sz.txt + ")");
      L.push("• Tarih: " + dateTxt);
      if (saat.value) L.push("• Teslim saati: " + saat.value);
      L.push("• Tema: " + THEMES[theme]);
      L.push("• Renk: " + COLORS[color].name);
      L.push("• Lezzet: " + (lez.value || "sizin önerinize bırakıyorum"));
      L.push("• Pastanın üzerine yazı: " + (text ? "“" + text + "”" : "yazı olmasın / sonra konuşalım"));
      L.push("• Teslim: " + val("teslim"));
      var nt = notEl.value.trim(); if (nt) L.push("• Not: " + nt);
      L.push("", "Bu tarih için uygunluk, fiyat ve içerik (alerjen) bilgisini öğrenebilir miyim?");
      var ad = adEl.value.trim(); if (ad) L.push("", "Ad: " + ad);
      var msg = L.join("\n");
      msgEl2.textContent = msg;
      wa2.setAttribute("href", waUrl(msg));
    }
    form.addEventListener("input", function (e) { update(e.target === kisiR); });
    form.addEventListener("change", function (e) { update(e.target === kisiR); });
    $$("[data-step]", form).forEach(function (b) {
      b.addEventListener("click", function () { kisi.value = Math.max(2, Math.min(150, people() + parseInt(b.getAttribute("data-step"), 10))); update(false); });
    });
    $$("[data-say]", form).forEach(function (b) {
      b.addEventListener("click", function () { yazi.value = b.getAttribute("data-say"); yazi.focus(); update(false); });
    });
    update(false);
  }

  /* ---------- kontrol listesi (yalnız bu cihazda hatırlanır) */
  var check = $('[data-tool="kontrol"]');
  if (check) {
    var boxes = $$('input[type="checkbox"]', check), KEY = "lellini-kontrol";
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { saved = []; }
    boxes.forEach(function (b) { b.checked = saved.indexOf(b.value) > -1; });
    function paintCheck() {
      var on = boxes.filter(function (b) { return b.checked; });
      $("[data-check-count]", check).textContent = on.length;
      $("[data-check-total]", check).textContent = boxes.length;
      $("[data-check-bar]", check).style.width = (on.length / boxes.length * 100) + "%";
      try { localStorage.setItem(KEY, JSON.stringify(on.map(function (b) { return b.value; }))); } catch (e) { /* sessiz */ }
    }
    boxes.forEach(function (b) { b.addEventListener("change", paintCheck); });
    paintCheck();
  }

  /* ---------- iletişim: mesaj hazırlayıcı */
  var asker = $('[data-tool="mesaj"]');
  if (asker) {
    var aMsg = $("[data-ask-msg]", asker), aWa = $("[data-ask-wa]", asker), aForm = $(".ask-form", asker);
    function topic() { var r = $('[name="konu"]:checked', asker); return r ? r.value : "vitrin"; }
    function checked(name) { return $$('[name="' + name + '"]:checked', asker).map(function (x) { return x.value; }); }
    function updAsk() {
      var t = topic(), L = [];
      $$("[data-topic]", asker).forEach(function (fs) { fs.hidden = fs.getAttribute("data-topic") !== t; });
      if (t === "vitrin") {
        var g = (checked("vgun")[0] || "bugün"), ce = $("#v-cesit").value.trim();
        L.push("Merhaba " + BRAND + ", " + g + " uğramayı düşünüyorum. Vitrinde hangi çeşitler olacak?");
        if (ce) L.push("Özellikle " + ce + " olacak mı?");
      } else if (t === "toplu") {
        var td = $("#t-tarih").value;
        L.push("Merhaba " + BRAND + ", toplu sipariş için bilgi almak istiyorum.", "");
        L.push("• Ne için: " + $("#t-ne").value);
        L.push("• Yaklaşık adet / kişi: " + ($("#t-adet").value || "henüz belli değil"));
        L.push("• Tarih: " + (td ? trDate(td, { day: "numeric", month: "long", year: "numeric", weekday: "long" }) : "henüz belli değil"));
        var tu = checked("turler"); L.push("• Ürünler: " + (tu.length ? tu.join(", ") : "önerinize açığım"));
        L.push("", "Uygunluk ve fiyat bilgisini alabilir miyim?");
      } else if (t === "alerji") {
        var al = checked("alerjen"), ur = $("#a-urun").value.trim();
        L.push("Merhaba " + BRAND + ", " + (ur || "ürünleriniz") + " için içerik bilgisi almak istiyorum.", "");
        L.push("• Sorduğum içerikler: " + (al.length ? al.join(", ") : "genel alerjen bilgisi"));
        L.push("", "Bu içeriklerin ürünlerde bulunup bulunmadığını ve aynı ortamda kullanılıp kullanılmadığını öğrenebilir miyim?");
      } else if (t === "ozel") {
        var k = parseInt($("#o-kisi").value, 10) || 12, od = $("#o-tarih").value;
        L.push("Merhaba " + BRAND + ", özel pasta siparişi için bilgi almak istiyorum.", "");
        L.push("• Kişi sayısı: " + k + " (yaklaşık öneri: " + sizeFor(k).txt + ")");
        L.push("• Tarih: " + (od ? trDate(od, { day: "numeric", month: "long", year: "numeric", weekday: "long" }) : "henüz belli değil"));
        L.push("", "Tasarım, uygunluk ve fiyat için konuşabilir miyiz?");
      } else {
        var dm = $("#d-mesaj").value.trim();
        L.push("Merhaba " + BRAND + ", " + (dm || "bilgi almak istiyorum."));
      }
      var nm = $("#ask-ad").value.trim(); if (nm) L.push("", "Ad: " + nm);
      var msg = L.join("\n");
      aMsg.textContent = msg;
      aWa.setAttribute("href", waUrl(msg));
    }
    aForm.addEventListener("input", updAsk);
    aForm.addEventListener("change", updAsk);
    updAsk();
  }
})();
