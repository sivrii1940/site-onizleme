/* Beraliva — canlı saatler, dönen çarklar, araçlar. Dış bağımlılık yok. */
(function () {
  "use strict";
  var doc = document;
  doc.documentElement.classList.add("js");

  var HOURS = { "0": [["10:00", "21:00"]], "1": [["10:00", "21:00"]], "2": [["10:00", "21:00"]], "3": [["10:00", "21:00"]], "4": [["10:00", "21:00"]], "5": [["10:00", "21:00"]], "6": [["10:00", "21:00"]] };
  var WA = "https://wa.me/905323051224";
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { }

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function comma(x, d) { return x.toFixed(d).replace(".", ","); }

  /* ---------- kit/status.js (kopya) ---------- */
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

  /* ---------- İstanbul saati (saniye hassasiyetli) ---------- */
  var OFF = 0;
  function calcOffset() {
    try {
      var f = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
      var now = Date.now(), p = {};
      f.formatToParts(new Date(now)).forEach(function (x) { p[x.type] = x.value; });
      var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
      OFF = asUTC - Math.floor(now / 1000) * 1000;
    } catch (e) { OFF = -new Date().getTimezoneOffset() * 60000; }
  }
  calcOffset();
  setInterval(calcOffset, 60000);
  function ist() {
    var d = new Date(Date.now() + OFF);
    return { h: d.getUTCHours(), m: d.getUTCMinutes(), s: d.getUTCSeconds(), ms: d.getUTCMilliseconds(), wd: (d.getUTCDay() + 6) % 7, day: d.getUTCDate() };
  }

  /* ---------- analog saatler ---------- */
  var clocks = $all("[data-clock]").map(function (svg) {
    var c = (svg.getAttribute("data-c") || "20 20").split(" ");
    return {
      svg: svg, cx: c[0], cy: c[1], vis: true,
      h: svg.querySelector('[data-hand="h"]'), m: svg.querySelector('[data-hand="m"]'),
      s: svg.querySelector('[data-hand="s"]'), g: svg.querySelector('[data-hand="g"]'),
      date: svg.querySelector("[data-date]")
    };
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { clocks.forEach(function (c) { if (c.svg === e.target) c.vis = e.isIntersecting; }); });
    });
    clocks.forEach(function (c) { io.observe(c.svg); });
  }
  function rot(el, a, c) { if (el) el.setAttribute("transform", "rotate(" + a.toFixed(2) + " " + c.cx + " " + c.cy + ")"); }
  var digitals = $all("[data-digital]");
  var lastSec = -1;
  function drawClocks(force) {
    var t = ist(), sf = t.s + t.ms / 1000;
    clocks.forEach(function (c) {
      if (!c.vis && !force) return;
      var mode = c.svg.getAttribute("data-sweep") || "smooth", sec;
      if (mode === "smooth") sec = reduce ? t.s : sf;
      else if (mode === "mech") sec = Math.floor(sf * 8) / 8;
      else if (mode === "eol") sec = Math.floor(t.s / 4) * 4;
      else sec = t.s;
      var min = t.m + sec / 60, hr = (t.h % 12) + min / 60;
      rot(c.s, sec * 6, c); rot(c.m, min * 6, c); rot(c.h, hr * 30, c);
      rot(c.g, (t.h + min / 60) * 15, c);
      if (c.date && c.date.textContent !== String(t.day)) c.date.textContent = t.day;
    });
    if (t.s !== lastSec) {
      lastSec = t.s;
      digitals.forEach(function (d) { d.textContent = pad(t.h) + ":" + pad(t.m) + ":" + pad(t.s); });
    }
  }
  function frame() { drawClocks(false); requestAnimationFrame(frame); }
  drawClocks(true);
  requestAnimationFrame(frame);

  /* ---------- kaydırdıkça dönen çarklar ---------- */
  var gears = $all("[data-gear]");
  function drawGears() {
    var y = window.pageYOffset || 0;
    gears.forEach(function (g) {
      var n = +g.getAttribute("data-n") || 20, dir = +g.getAttribute("data-dir") || 1, ph = +g.getAttribute("data-phase") || 0;
      var a = ph + dir * y * 0.16 * 40 / n;
      if (g.namespaceURI === "http://www.w3.org/2000/svg" && g.tagName.toLowerCase() === "g") {
        g.setAttribute("transform", "rotate(" + a.toFixed(2) + " " + g.getAttribute("data-cx") + " " + g.getAttribute("data-cy") + ")");
      } else {
        g.style.transform = "rotate(" + a.toFixed(2) + "deg)";
      }
    });
  }
  if (!reduce && gears.length) {
    var gTick = false;
    window.addEventListener("scroll", function () {
      if (gTick) return; gTick = true;
      requestAnimationFrame(function () { drawGears(); gTick = false; });
    }, { passive: true });
  }

  /* ---------- menü ---------- */
  var head = doc.querySelector(".site-head"), toggle = doc.querySelector("[data-nav-toggle]");
  function setHeadH() { if (head) doc.documentElement.style.setProperty("--head-h", Math.max(0, head.getBoundingClientRect().bottom) + "px"); }
  setHeadH(); window.addEventListener("resize", setHeadH);
  if (toggle && head) {
    var lbl = toggle.querySelector("[data-label]");
    function setNav(open) {
      head.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (lbl) lbl.textContent = open ? "Kapat" : "Menü";
      doc.body.style.overflow = open ? "hidden" : "";
      setHeadH();
    }
    toggle.addEventListener("click", function () { setNav(!head.classList.contains("nav-open")); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && head.classList.contains("nav-open")) { setNav(false); toggle.focus(); } });
    $all(".nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  }

  /* ---------- açık/kapalı durumu, 24 saat halkaları, tablo ---------- */
  function mins(s) { var a = s.split(":"); return +a[0] * 60 + +a[1]; }
  function dur(m) { var h = Math.floor(m / 60), mm = m % 60; return (h ? h + " sa " : "") + mm + " dk"; }
  function paintStatus() {
    var s = openStatus(HOURS), t = ist(), nowM = t.h * 60 + t.m;
    $all("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $all("[data-ring24]").forEach(function (r) {
      var hand = r.querySelector("[data-now-hand]");
      if (hand) hand.setAttribute("transform", "rotate(" + ((t.h + t.m / 60) * 15).toFixed(2) + " 150 150)");
      var st = r.querySelector("[data-ring-state]"), sb = r.querySelector("[data-ring-sub]");
      if (r.getAttribute("data-ring24") === "date") return;
      if (st) st.textContent = s.open ? "Şu an açık" : "Şu an kapalı";
      if (sb) {
        if (s.open && s.closesAt) { var left = mins(s.closesAt) - nowM; if (left < 0) left += 1440; sb.textContent = "Kapanışa " + dur(left) + " var (" + s.closesAt + ")"; }
        else if (s.opensAt) { var to = mins(s.opensAt) - nowM; if (s.opensWhen !== "bugün") to += 1440; if (to < 0) to += 1440; sb.textContent = "Açılışa " + dur(to) + " var (" + s.opensWhen + " " + s.opensAt + ")"; }
      }
    });
    $all("[data-hours-table] [data-d]").forEach(function (tr) { tr.classList.toggle("is-today", +tr.getAttribute("data-d") === t.wd); });
    $all("[data-weekday]").forEach(function (el) { el.textContent = DAYS[t.wd]; });
    /* tarih ayarı uyarıcısı */
    $all("[data-date-advisor]").forEach(function (box) {
      var v = box.querySelector("[data-verdict]"), bad = t.h >= 21 || t.h < 3;
      if (!v) return;
      v.classList.toggle("bad", bad); v.classList.toggle("good", !bad);
      v.textContent = "Şu an " + pad(t.h) + ":" + pad(t.m) + (bad ? ": hızlı tarih ayarı için riskli aralık" : ": hızlı tarih ayarı için uygun aralık");
      var st = box.querySelector("[data-ring-state]"); if (st) st.textContent = bad ? "Bekleyin" : "Uygun";
      var sb = box.querySelector("[data-ring-sub]");
      if (sb) { var until = bad ? ((3 * 60 - (t.h * 60 + t.m)) + 1440) % 1440 : (21 * 60 - (t.h * 60 + t.m)); sb.textContent = bad ? "Uygun aralığa " + dur(until) : "Riskli aralığa " + dur(until); }
    });
  }
  paintStatus();
  setInterval(paintStatus, 15000);

  /* ---------- kopyalama yardımcısı ---------- */
  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute("data-old") || btn.textContent;
      btn.setAttribute("data-old", old);
      btn.textContent = ok ? "Kopyalandı" : "Kopyalanamadı";
      setTimeout(function () { btn.textContent = old; }, 2000);
    }
    function fallback() {
      try {
        var ta = doc.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0"; doc.body.appendChild(ta); ta.select();
        var ok = doc.execCommand("copy"); doc.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  $all("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), b); }); });

  /* ---------- sorun kadranı (ana sayfa) ---------- */
  $all("[data-problem-dial]").forEach(function (box) {
    var btns = $all("[data-p]", box), panels = $all("[data-panel]", box), ptr = box.querySelector("[data-pointer]"), cur = 0;
    function sel(key) {
      btns.forEach(function (b) {
        var on = b.getAttribute("data-p") === key;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        if (on && ptr) {
          var target = +b.getAttribute("data-angle"), d = ((target - cur) % 360 + 540) % 360 - 180;
          cur += d; ptr.style.transform = "rotate(" + cur + "deg)";
        }
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== key; });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { sel(b.getAttribute("data-p")); }); });
    if (btns[0]) sel(btns[0].getAttribute("data-p"));
  });

  /* ---------- pil uyarısı gösterimi (saat sayfası) ---------- */
  $all("[data-eol]").forEach(function (b) {
    var target = doc.getElementById(b.getAttribute("data-eol")), note = doc.querySelector("[data-eol-note]");
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "Normal çalışmaya dön" : "Pil biterken nasıl görünür?";
      if (target) target.setAttribute("data-sweep", on ? "eol" : "tick");
      if (note) note.hidden = !on;
    });
  });

  /* ---------- su direnci seçici ---------- */
  $all("[data-water]").forEach(function (box) {
    var btns = $all("[data-wr]", box), rows = $all("[data-wr-row]", box);
    function sel(k) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-wr") === k ? "true" : "false"); });
      rows.forEach(function (r) { r.hidden = r.getAttribute("data-wr-row") !== k; });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { sel(b.getAttribute("data-wr")); }); });
    if (btns[1]) sel(btns[1].getAttribute("data-wr"));
  });

  /* ---------- sapma ölçer ---------- */
  $all("[data-drift]").forEach(function (box) {
    var KEY = "beraliva-sapma", hh = box.querySelector("[data-dh]"), mm = box.querySelector("[data-dm]"), out = box.querySelector("[data-drift-out]");
    var send = box.querySelector("[data-drift-send]"), reset = box.querySelector("[data-drift-reset]"), mark = box.querySelector("[data-drift-mark]");
    var t0 = ist(); hh.value = pad(t0.h); mm.value = pad(t0.m);
    function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
    function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } }
    var list = load();
    function sgn(x) { return (x >= 0 ? "+" : "−") + comma(Math.abs(x), Math.abs(x) < 10 ? 1 : 0); }
    function render() {
      if (!list.length) { out.innerHTML = "<b>Henüz ölçüm yok</b>Saatinizdeki saati yazın, saniye ibresi 12'ye geldiğinde düğmeye basın."; if (send) send.hidden = true; return; }
      var last = list[list.length - 1], first = list[0], txt, summary;
      var d = last.d, word = d >= 0 ? "ileri" : "geri";
      function fmt(x) { x = Math.round(Math.abs(x)); if (x < 120) return x + " saniye"; var h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s2 = x % 60; return (h ? h + " saat " : "") + (m ? m + " dakika " : "") + (s2 ? s2 + " saniye" : "").trim(); }
      txt = "<b>Saatiniz " + fmt(d).trim() + " " + word + "</b>";
      summary = "referans saate göre " + fmt(d).trim() + " " + word;
      if (list.length > 1) {
        var days = (last.t - first.t) / 86400000;
        if (days >= 0.25) {
          var rate = (last.d - first.d) / days;
          txt += "Günlük sapma: yaklaşık <strong>" + sgn(rate) + " saniye/gün</strong> (" + comma(days, 1) + " günlük ölçüm). " + (Math.abs(rate) > 60 ? "Bu, bakım ya da ayar gerektirebilecek büyük bir sapma." : "Mekanik bir saat için bu düzeyde sapma çoğu zaman olağandır; pilli bir saatte ise fazladır.");
          summary = "günde yaklaşık " + sgn(rate) + " saniye sapıyor (" + comma(days, 1) + " günlük ölçüm)";
        } else {
          txt += "Günlük sapmayı görmek için ilk ölçümden en az 6 saat, tercihen bir gün sonra tekrar ölçün.";
        }
      } else {
        txt += "Yarın aynı saatlerde tekrar ölçün; günlük sapma hesaplanır.";
      }
      out.innerHTML = txt;
      if (send) { send.hidden = false; send.href = "tamir-talebi.html?sorun=mekanizma&sapma=" + encodeURIComponent("Sitedeki sapma ölçere göre saatim " + summary + "."); }
    }
    mark.addEventListener("click", function () {
      var h = parseInt(hh.value, 10), m = parseInt(mm.value, 10);
      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) { out.innerHTML = "<b>Saati kontrol edin</b>Saat 0–23, dakika 0–59 arası olmalı."; return; }
      var t = ist(), ref = t.h * 3600 + t.m * 60 + t.s + t.ms / 1000, w = h * 3600 + m * 60, d = w - ref;
      if (d > 43200) d -= 86400; if (d < -43200) d += 86400;
      if (Math.abs(d) > 3600 && h < 13) { var d2 = (h + 12) * 3600 + m * 60 - ref; if (d2 > 43200) d2 -= 86400; if (Math.abs(d2) < Math.abs(d)) d = d2; }
      list = list.length ? [list[0], { t: Date.now(), d: d }] : [{ t: Date.now(), d: d }];
      save(list); render();
    });
    if (reset) reset.addEventListener("click", function () { list = []; save(list); render(); });
    render();
  });

  /* ---------- ayar kadranı ---------- */
  $all("[data-ayar]").forEach(function (box) {
    var D = {
      "8": { m: 333, k: "8 ayar altın", f: "24 parçanın 8'i altın", t: "Altın oranı düşük, sert bir alaşım. Ekonomik takılarda görülür." },
      "14": { m: 585, k: "14 ayar altın", f: "24 parçanın 14'ü altın", t: "Sert ve çizilmeye dayanıklı. Taşlı yüzük, tektaş ve günlük takılarda sık kullanılır." },
      "18": { m: 750, k: "18 ayar altın", f: "24 parçanın 18'i altın", t: "Rengi daha doygun, 14 ayardan yumuşak. Pırlantalı ve özel takılarda tercih edilir." },
      "22": { m: 916, k: "22 ayar altın", f: "24 parçanın 22'si altın", t: "Bilezik ve ziynet altınlarında (çeyrek, yarım, tam, ata) kullanılan ayar." },
      "24": { m: 995, k: "24 ayar altın", f: "Saf altına en yakın", t: "Çok yumuşak olduğu için takıdan çok gram altın ve külçede görülür. Damgası 995 ya da 999 olabilir." },
      "g800": { m: 800, k: "800 gümüş", f: "Binde 800 gümüş", t: "Eski ve bazı Avrupa yapımı gümüş eşyalarda görülür." },
      "g925": { m: 925, k: "925 gümüş", f: "Binde 925 gümüş, kalanı çoğunlukla bakır", t: "Takı gümüşünde en yaygın damga; “sterling” de denir. Hem dayanıklı hem işlenebilir." },
      "g999": { m: 999, k: "999 gümüş", f: "Saf gümüş", t: "Çok yumuşak olduğu için takıdan çok külçe ve hatıra eşyada görülür." }
    };
    var arc = box.querySelector("[data-arc]"), ndl = box.querySelector("[data-needle]"), big = box.querySelector("[data-ayar-big]"), sub = box.querySelector("[data-ayar-sub]"), txt = box.querySelector("[data-ayar-txt]"), ttl = box.querySelector("[data-ayar-title]");
    var C = 2 * Math.PI * 110, btns = $all("[data-k]", box), rows = $all("[data-row]", box);
    if (arc) arc.setAttribute("stroke-dasharray", "0 " + C);
    function sel(k) {
      var d = D[k]; if (!d) return;
      btns.forEach(function (b) { var on = b.getAttribute("data-k") === k; b.setAttribute("aria-pressed", on ? "true" : "false"); if ("checked" in b) b.checked = on; });
      rows.forEach(function (r) { r.classList.toggle("is-on", r.getAttribute("data-row") === k); });
      if (arc) { arc.setAttribute("stroke-dasharray", (d.m / 1000 * C).toFixed(1) + " " + C.toFixed(1)); arc.setAttribute("stroke", k.charAt(0) === "g" ? "#DDE3EA" : "#E2B34C"); }
      if (ndl) ndl.setAttribute("transform", "rotate(" + (d.m / 1000 * 360).toFixed(1) + " 150 150)");
      big.textContent = d.m; sub.textContent = "binde " + d.m + " · " + d.f; txt.textContent = d.t; ttl.textContent = d.k;
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { sel(b.getAttribute("data-k")); }); });
    sel("14");
  });

  /* ---------- yüzük ölçüsü ---------- */
  $all("[data-ring-size]").forEach(function (box) {
    var inp = box.querySelector("[data-mm]"), lbl = box.querySelector("[data-mm-label]"), oc = box.querySelector("[data-rs-c]"), od = box.querySelector("[data-rs-d]"), on = box.querySelector("[data-rs-n]");
    var circ = box.querySelector("[data-rs-circle]"), dimTxt = box.querySelector("[data-rs-dim]"), wa = box.querySelector("[data-rs-wa]"), cp = box.querySelector("[data-rs-copy]"), msgEl = box.querySelector("[data-rs-msg]"), warn = box.querySelector("[data-rs-warn]");
    var msg = "";
    function method() { var r = box.querySelector('input[name="yontem"]:checked'); return r ? r.value : "cevre"; }
    function calc() {
      var meth = method(), v = parseFloat(String(inp.value).replace(",", "."));
      lbl.textContent = meth === "cevre" ? "Parmak çevresi (mm)" : "Yüzüğün iç çapı (mm)";
      inp.setAttribute("min", meth === "cevre" ? "40" : "13"); inp.setAttribute("max", meth === "cevre" ? "80" : "25");
      var c, d;
      if (isNaN(v)) { warn.textContent = "Bir ölçü yazın."; return; }
      if (meth === "cevre") { if (v < 40 || v > 80) { warn.textContent = "Parmak çevresi genelde 40–80 mm arasıdır; ölçüyü kontrol edin."; return; } c = v; d = c / Math.PI; }
      else { if (v < 13 || v > 25) { warn.textContent = "Yüzük iç çapı genelde 13–25 mm arasıdır; ölçüyü kontrol edin."; return; } d = v; c = d * Math.PI; }
      warn.textContent = "";
      var n = Math.round(c - 40);
      oc.textContent = comma(c, 1); od.textContent = comma(d, 1); on.textContent = n;
      if (circ) circ.setAttribute("r", (d * 5.2).toFixed(1));
      if (dimTxt) dimTxt.textContent = "Ø " + comma(d, 1) + " mm";
      msg = "Merhaba Beraliva, sitenizdeki hesaplayıcıyla yüzük ölçümü buldum: iç çevre yaklaşık " + comma(c, 1) + " mm, iç çap " + comma(d, 1) + " mm, yaklaşık " + n + " numara. Bu ölçüdeki yüzük modelleri hakkında bilgi almak istiyorum.";
      if (msgEl) msgEl.textContent = msg;
      if (wa) wa.href = WA + "?text=" + encodeURIComponent(msg);
    }
    inp.addEventListener("input", calc);
    $all('input[name="yontem"]', box).forEach(function (r) {
      r.addEventListener("change", function () { inp.value = r.value === "cevre" ? "54" : "17,2"; calc(); });
    });
    if (cp) cp.addEventListener("click", function () { copyText(msg, cp); });
    calc();
  });

  /* ---------- tamir talebi (imza araç) ---------- */
  var form = doc.querySelector("[data-repair]");
  if (form) {
    var msgOut = doc.querySelector("[data-msg]"), waBtn = doc.querySelector("[data-wa-send]"), copyBtn = doc.querySelector("[data-copy-msg]"), warnEl = doc.querySelector("[data-msg-warn]");
    var hourBtns = $all("[data-hour]", form), alarmHand = form.querySelector("[data-alarm]"), alarmBox = form.querySelector("[data-alarm-box]"), hourOut = form.querySelector("[data-hour-out]");
    var selHour = null, current = "";
    function v(name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ""; }
    function vs(name) { return $all('[name="' + name + '"]:checked', form).map(function (e) { return e.value; }); }
    function tx(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ""; }
    var params = new URLSearchParams(location.search), pre = params.get("sorun"), sap = params.get("sapma");
    if (pre === "taki") { var tk = form.querySelector('[name="tur"][value="taki"]'); if (tk) tk.checked = true; }
    else if (pre) { var cb = form.querySelector('[name="sorun"][value="' + pre + '"]'); if (cb) cb.checked = true; }
    if (sap) { var nt = form.querySelector('[name="not"]'); if (nt && !nt.value) nt.value = sap.slice(0, 160); }

    function dayInfo() {
      var t = ist(), g = v("gun");
      if (g === "bugun") return { label: "Bugün (" + DAYS[t.wd] + ")", today: true };
      if (g === "yarin") return { label: "Yarın (" + DAYS[(t.wd + 1) % 7] + ")", today: false };
      if (g === "baska") return { label: tx("gunsec") || "Başka bir gün", today: false };
      return null;
    }
    function syncHours() {
      var t = ist(), di = dayInfo(), nowM = t.h * 60 + t.m;
      var todayR = form.querySelector('[name="gun"][value="bugun"]');
      if (todayR) {
        todayR.disabled = nowM >= 20 * 60 + 30;
        if (todayR.disabled && todayR.checked) { todayR.checked = false; var y = form.querySelector('[name="gun"][value="yarin"]'); if (y) y.checked = true; di = dayInfo(); }
      }
      var off = !di;
      if (alarmBox) alarmBox.classList.toggle("alarm-off", off);
      hourBtns.forEach(function (b) {
        var h = +b.getAttribute("data-hour"), dis = off || (di && di.today && h * 60 <= nowM);
        b.disabled = !!dis;
        if (dis && selHour === h) selHour = null;
        b.setAttribute("aria-pressed", selHour === h ? "true" : "false");
      });
      if (alarmHand) {
        alarmHand.style.opacity = selHour === null ? "0" : "1";
        if (selHour !== null) alarmHand.setAttribute("transform", "rotate(" + ((selHour % 12) * 30) + " 110 110)");
      }
      if (hourOut) hourOut.textContent = off ? "Gün seçince saat seçebilirsiniz." : selHour === null ? "Kadrandan bir saat seçin (isteğe bağlı)." : "Seçilen saat: " + pad(selHour) + ":00 civarı";
      $all("[data-gunsec-wrap]", form).forEach(function (w) { w.hidden = v("gun") !== "baska"; });
    }
    hourBtns.forEach(function (b) {
      b.addEventListener("click", function () { var h = +b.getAttribute("data-hour"); selHour = selHour === h ? null : h; syncHours(); build(); });
    });

    function build() {
      var kind = v("tur") || "kol", isTaki = kind === "taki";
      $all("[data-for]", form).forEach(function (el) { el.hidden = el.getAttribute("data-for") !== (isTaki ? "taki" : "saat"); });
      /* alt seçenekler */
      $all("[data-sub]", form).forEach(function (el) {
        var cb = form.querySelector('[name="' + (isTaki ? "tsorun" : "sorun") + '"][value="' + el.getAttribute("data-sub") + '"]');
        el.hidden = !(cb && cb.checked);
      });
      var L = [];
      if (isTaki) {
        L.push("Merhaba Beraliva, takı tamiri için bilgi almak istiyorum.");
        var tt = v("takitur"), mt = v("metal");
        L.push("• Takı: " + ([tt, mt && mt !== "Bilmiyorum" ? mt : ""].filter(Boolean).join(", ") || "belirtilmedi"));
        var ts = vs("tsorun").map(function (k) { var m = { kopma: "Kopma, lehim", olcu: "Yüzük ölçüsü", tas: "Taş düştü ya da gevşedi", kilit: "Kilit, klips", temizlik: "Temizlik, parlatma", diger: "Başka bir sorun" }; var s = m[k] || k; if (k === "olcu" && v("olcuyon")) s += " (" + v("olcuyon") + ")"; return s; });
        current = ts.length ? "ok" : "";
        L.push("• Sorun: " + (ts.length ? ts.join("; ") : "henüz seçilmedi"));
      } else {
        L.push("Merhaba Beraliva, saat tamiri için bilgi almak istiyorum.");
        var w = { kol: "Kol saati", diger: "Duvar, masa ya da cep saati" }[kind] || "Saat", c = v("calisma");
        if (c && c !== "Bilmiyorum") w += ", " + c;
        L.push("• Saat: " + w);
        var mk = [tx("marka"), tx("model")].filter(Boolean).join(" ");
        if (mk) L.push("• Marka / model: " + mk);
        var names = { pil: "Pil", kayis: "Kayış ya da kordon", cam: "Cam", mekanizma: "Mekanizma", kurma: "Kurma kolu", su: "Su aldı, buğu var", diger: "Başka bir sorun" };
        var ss = vs("sorun").map(function (k) {
          var s = names[k] || k, d = v(k + "_d");
          if (d) s += " (" + d + ")";
          return s;
        });
        current = ss.length ? "ok" : "";
        L.push("• Sorun: " + (ss.length ? ss.join("; ") : "henüz seçilmedi"));
      }
      var note = tx("not"); if (note) L.push("• Not: " + note);
      var di = dayInfo();
      L.push("• Uğrama: " + (di ? di.label + (selHour !== null ? ", " + pad(selHour) + ":00 civarı" : "") : "henüz belli değil"));
      var ad = tx("ad"); if (ad) L.push("• Ad: " + ad);
      if (form.querySelector('[name="foto"]:checked')) L.push("Fotoğraflarını bu mesajın ardından gönderiyorum.");
      L.push("Teşekkürler.");
      var msg = L.join("\n");
      msgOut.textContent = msg;
      waBtn.href = WA + "?text=" + encodeURIComponent(msg);
      if (current) warnEl.textContent = "";
      form._msg = msg;
    }
    form.addEventListener("input", function () { syncHours(); build(); });
    form.addEventListener("change", function () { syncHours(); build(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    waBtn.addEventListener("click", function (e) {
      if (!current) {
        e.preventDefault();
        warnEl.textContent = "Önce sorunu seçin: en az bir kutuyu işaretleyin.";
        var first = form.querySelector('[data-for]:not([hidden]) [name="sorun"], [data-for]:not([hidden]) [name="tsorun"]');
        if (first) first.focus();
      }
    });
    copyBtn.addEventListener("click", function () { copyText(form._msg || "", copyBtn); });
    syncHours(); build();
    setInterval(function () { syncHours(); }, 30000);
  }

  /* ---------- tembel görselleri sayfa yüklendikten sonra sessizce getir ---------- */
  window.addEventListener("load", function () {
    setTimeout(function () {
      $all('img[loading="lazy"], iframe[loading="lazy"]').forEach(function (el) { el.setAttribute("loading", "eager"); });
    }, 400);
  });

  drawGears();
})();
