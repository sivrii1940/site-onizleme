/* Deniz Nadide Duru Breakfast — site.js
   Canlı açık/kapalı durumu, ufuktaki güneş, saat şeridi, yer talebi, sofra haritası, Moda rotası. */

/* ---- kit/status.js'ten kopya (değiştirilmeden) ---- */
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
  var root = document.documentElement;
  root.classList.add("js");

  /* brief: hours_json (0 = Pazartesi … 6 = Pazar) */
  var HOURS = { "1": [["10:00", "17:00"]], "2": [["10:00", "16:00"]], "3": [["10:00", "17:00"]], "4": [["10:00", "17:00"]], "5": [["10:00", "17:00"]], "6": [["10:00", "17:00"]] };
  var BRAND = "Deniz Nadide Duru Breakfast";
  var ADDRESS = "Caferağa, Gürbüztürk Sok. No:29/B, 34710 Kadıköy/İstanbul";
  var WA = "https://wa.me/905422358689";
  var DAY = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var MONTH = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var AXIS0 = 540, AXISLEN = 540; /* şerit ekseni 09:00–18:00 */

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function hhmm(m) { var h = Math.floor(m / 60), n = m % 60; return (h < 10 ? "0" : "") + h + ":" + (n < 10 ? "0" : "") + n; }
  function dayRange(d) { var r = HOURS[String(d)]; return r && r[0] ? [mins(r[0][0]), mins(r[0][1])] : null; }
  function istanbulDate() {
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return new Date(Date.UTC(+o.year, +o.month - 1, +o.day));
    } catch (e) { var n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); }
  }
  function addDays(dt, k) { return new Date(dt.getTime() + k * 86400000); }
  function dIdx(dt) { return (dt.getUTCDay() + 6) % 7; }
  function iso(dt) { return dt.toISOString().slice(0, 10); }
  function longDate(dt) { return dt.getUTCDate() + " " + MONTH[dt.getUTCMonth()] + " " + DAY[dIdx(dt)]; }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function copyText(text, btn, msgEl, okText) {
    function done(ok) {
      if (msgEl) msgEl.textContent = ok ? (okText || "Mesaj panoya kopyalandı; SMS ya da istediğiniz uygulamaya yapıştırabilirsiniz.") : "Kopyalanamadı; metni seçip elle kopyalayabilirsiniz.";
      if (btn && ok) { var o = btn.getAttribute("data-label") || btn.textContent; btn.setAttribute("data-label", o); btn.textContent = "Kopyalandı"; setTimeout(function () { btn.textContent = o; }, 1800); }
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

  var st = openStatus(HOURS);
  var today = st.dayIndex;

  /* ---- Menü ---- */
  var mbtn = $(".menu-btn"), nav = $("#site-nav");
  if (mbtn && nav) {
    mbtn.addEventListener("click", function () {
      var open = mbtn.getAttribute("aria-expanded") === "true";
      mbtn.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { mbtn.click(); mbtn.focus(); }
    });
  }

  /* ---- Canlı durum ---- */
  $$("[data-status]").forEach(function (el) { el.textContent = st.text; el.classList.toggle("is-open", st.open); });
  $$("[data-today]").forEach(function (el) {
    var r = dayRange(today);
    el.textContent = "Bugün " + DAY[today] + ": " + (r ? hhmm(r[0]) + "–" + hhmm(r[1]) : "kapalıyız");
  });
  $$("[data-hday]").forEach(function (el) { if (+el.getAttribute("data-hday") === today) el.classList.add("is-today"); });

  /* ---- Ufuktaki güneş: açık saatin neresindeysek oraya yükselir ---- */
  var mqMobile = window.matchMedia ? window.matchMedia("(max-width: 900px)") : null;
  function setSun(host, p) {
    host._sunP = p;
    var s = Math.sin(Math.PI * p), mob = !!(mqMobile && mqMobile.matches), x, y;
    if (host.classList.contains("hero")) {
      /* ana sayfa: masaüstünde ufuktan doğar; telefonda başlığın üstündeki boş gökyüzünde gezinir */
      if (mob) { x = 30 + 40 * p; y = 50 - 22 * s; } else { x = 50 + 16 * p; y = 97 - 64 * s; }
    } else {
      if (mob) { x = 22 + 56 * p; y = 34 - 10 * s; } else { x = 40 + 45 * p; y = 40 - 14 * s; }
    }
    host.style.setProperty("--sx", x.toFixed(2) + "%");
    host.style.setProperty("--sy", y.toFixed(2) + "%");
    host.style.setProperty("--glint", (0.3 + 0.6 * (1 - s)).toFixed(2));
  }
  var rT;
  window.addEventListener("resize", function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      $$("[data-sun]").forEach(function (h) { if (typeof h._sunP === "number") setSun(h, h._sunP); });
    }, 150);
  });
  $$("[data-sun]").forEach(function (host) {
    var mode = host.getAttribute("data-sun");
    if (mode === "live") {
      var r = dayRange(today), p = 0.03;
      if (st.open && r) p = Math.min(1, Math.max(0, (st.minutes - r[0]) / (r[1] - r[0])));
      host.classList.toggle("is-closed", !st.open);
      setSun(host, p);
      var cap = $("[data-sun-caption]", host);
      if (cap) cap.textContent = st.open ? "Güneş, bugünkü açık saatlerimizin neresinde olduğumuzu gösteriyor." : "Güneş ufukta bekliyor: " + st.text.replace("Şu an kapalı, ", "").replace("açılış", "açılışımız") + ".";
    } else if (mode !== "follow") {
      var v = parseFloat(mode); if (!isNaN(v)) setSun(host, v);
    } else setSun(host, 0.05);
  });

  /* ---- Haftalık saat şeridi (statik satırları zenginleştirir) ---- */
  var base = istanbulDate();
  $$("[data-strip]").forEach(function (strip) {
    $$("[data-day]", strip).forEach(function (row) {
      var d = +row.getAttribute("data-day");
      var r = dayRange(d);
      var note = $(".sday small", row);
      if (d === today) {
        row.classList.add("is-today");
        if (note) note.textContent = "bugün";
        if (st.minutes >= AXIS0 && st.minutes <= AXIS0 + AXISLEN) {
          var mk = document.createElement("span");
          mk.className = "now"; mk.title = "Şu an";
          mk.style.setProperty("--t", ((st.minutes - AXIS0) / AXISLEN).toFixed(4));
          var tr = $(".strack", row); if (tr) { tr.appendChild(mk); tr.classList.add("has-now"); }
        }
      }
      var link = $("a[data-book]", row);
      if (link && r) {
        var k = (d - today + 7) % 7;
        if (k === 0 && st.minutes > r[1] - 90) k = 7;
        var dt = addDays(base, k);
        link.href = "rezervasyon.html?gun=" + iso(dt);
        if (note && d !== today) note.textContent = dt.getUTCDate() + " " + MONTH[dt.getUTCMonth()];
        link.setAttribute("aria-label", DAY[d] + " " + hhmm(r[0]) + "–" + hhmm(r[1]) + ", bu gün için yer talebi oluştur");
      }
    });
  });

  /* ---- Yer talebi aracı ---- */
  var book = $("[data-booking]");
  if (book) initBook(book);

  function initBook(rootEl) {
    var daysEl = $("[data-days]", rootEl), slotsEl = $("[data-slots]", rootEl), slotNote = $("[data-slot-note]", rootEl);
    var peopleEl = $("[data-people]", rootEl), crowd = $("[data-crowd]", rootEl);
    var nameEl = $("[data-name]", rootEl), noteEl = $("[data-note]", rootEl);
    var msgEl = $("[data-msg]", rootEl), send = $("[data-send]", rootEl), copyB = $("[data-copy]", rootEl), info = $("[data-info]", rootEl);
    var sunHost = $('[data-sun="follow"]');
    var S = { day: null, time: null, people: 2, table: "", occasion: "" };
    var now = istanbulNow();
    var days = [];
    for (var k = 0; k < 7; k++) {
      var dt = addDays(base, k), d = dIdx(dt), r = dayRange(d), slots = [];
      if (r) for (var m = r[0]; m <= r[1] - 60; m += 30) { if (k === 0 && m < now.m + 30) continue; slots.push(m); }
      days.push({ k: k, dt: dt, d: d, r: r, slots: slots });
    }
    var buttons = [];
    daysEl.innerHTML = "";
    days.forEach(function (x, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "brow" + (x.r ? "" : " is-closed");
      b.setAttribute("aria-pressed", "false");
      var title = x.k === 0 ? "Bugün" : (x.k === 1 ? "Yarın" : DAY[x.d]);
      var sub = x.dt.getUTCDate() + " " + MONTH[x.dt.getUTCMonth()] + (x.k < 2 ? ", " + DAY[x.d] : "");
      var track;
      if (!x.r) track = '<span class="strack"><span class="sclosed"><span>Kapalı</span></span></span>';
      else track = '<span class="strack"><span class="sbar" style="--s:' + ((x.r[0] - AXIS0) / 60) + ";--e:" + ((x.r[1] - AXIS0) / 60) + (x.slots.length ? "" : ";opacity:.35") + '">' + hhmm(x.r[0]) + "–" + hhmm(x.r[1]) + "</span></span>";
      if (x.r && !x.slots.length) sub = "bugün için saat kalmadı";
      b.innerHTML = '<span class="sday"><b>' + title + "</b><small>" + sub + "</small></span>" + track;
      if (!x.r || !x.slots.length) {
        b.disabled = true;
        b.setAttribute("aria-label", title + ", " + sub + (x.r ? "" : ", kapalı"));
      } else {
        b.setAttribute("aria-label", title + ", " + sub + ", " + hhmm(x.r[0]) + "–" + hhmm(x.r[1]));
      }
      b.addEventListener("click", function (ev) {
        selectDay(i);
        var tr = $(".strack", b), rect = tr.getBoundingClientRect();
        if (ev.clientX && ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top - 8 && ev.clientY <= rect.bottom + 8) {
          var minute = AXIS0 + (ev.clientX - rect.left) / rect.width * AXISLEN, best = null;
          x.slots.forEach(function (s) { if (best === null || Math.abs(s - minute) < Math.abs(best - minute)) best = s; });
          if (best !== null) selectTime(best);
        }
      });
      li.appendChild(b); daysEl.appendChild(li); buttons.push(b);
    });

    function selectDay(i) {
      if (S.day !== i) S.time = null;
      S.day = i;
      buttons.forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === i)); var pk = $(".pick", b); if (pk && j !== i) { pk.remove(); $(".strack", b).classList.remove("has-now"); } });
      var x = days[i];
      slotNote.textContent = longDate(x.dt) + ", " + hhmm(x.r[0]) + "–" + hhmm(x.r[1]) + " arası";
      slotsEl.innerHTML = "";
      x.slots.forEach(function (s) {
        var c = document.createElement("button");
        c.type = "button"; c.className = "chip num"; c.textContent = hhmm(s);
        c.setAttribute("aria-pressed", String(S.time === s));
        c.addEventListener("click", function () { selectTime(s); });
        slotsEl.appendChild(c);
      });
      if (sunHost) setSun(sunHost, 0.05);
      update();
    }
    function selectTime(s) {
      S.time = s;
      $$(".chip", slotsEl).forEach(function (c) { c.setAttribute("aria-pressed", String(c.textContent === hhmm(s))); });
      var b = buttons[S.day], tr = $(".strack", b), pk = $(".pick", tr);
      if (!pk) { pk = document.createElement("span"); pk.className = "pick"; tr.appendChild(pk); tr.classList.add("has-now"); }
      pk.style.setProperty("--t", ((s - AXIS0) / AXISLEN).toFixed(4));
      var r = days[S.day].r;
      if (sunHost) setSun(sunHost, Math.max(0.03, (s - r[0]) / (r[1] - r[0])));
      update();
    }

    $$("[data-step]", rootEl).forEach(function (b) {
      b.addEventListener("click", function () {
        S.people = Math.min(30, Math.max(1, S.people + (+b.getAttribute("data-step"))));
        update();
      });
    });
    $$("[data-group]", rootEl).forEach(function (g) {
      var key = g.getAttribute("data-group");
      $$(".chip", g).forEach(function (c) {
        c.addEventListener("click", function () {
          var on = c.getAttribute("aria-pressed") === "true";
          $$(".chip", g).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
          c.setAttribute("aria-pressed", String(!on));
          S[key] = on ? "" : c.getAttribute("data-val");
          update();
        });
      });
    });
    [nameEl, noteEl].forEach(function (el) { if (el) el.addEventListener("input", update); });

    function message() {
      var x = S.day !== null ? days[S.day] : null;
      var L = ["Merhaba, " + BRAND + " için yer talebinde bulunmak istiyorum.", ""];
      L.push("Gün: " + (x ? longDate(x.dt) : "(seçilmedi)"));
      L.push("Saat: " + (S.time !== null ? hhmm(S.time) : "(seçilmedi)"));
      L.push("Kişi sayısı: " + S.people);
      if (S.table) L.push("Sofra: " + S.table);
      if (S.occasion) L.push("Vesile: " + S.occasion);
      var nm = nameEl ? nameEl.value.trim() : ""; if (nm) L.push("İsim: " + nm);
      var nt = noteEl ? noteEl.value.trim() : ""; if (nt) L.push("Not: " + nt);
      L.push("", "Uygunluk durumunu yazabilir misiniz? Teşekkürler.");
      return L.join("\n");
    }
    function update() {
      peopleEl.textContent = S.people + " kişi";
      if (crowd) crowd.classList.toggle("is-on", S.people >= 8);
      var msg = message();
      msgEl.textContent = msg;
      send.href = waHref(msg);
      send.setAttribute("aria-disabled", String(S.day === null || S.time === null));
      if (info && S.day !== null && S.time !== null) info.textContent = "";
    }
    send.addEventListener("click", function (e) {
      if (S.day === null || S.time === null) {
        e.preventDefault();
        info.textContent = S.day === null ? "Önce şeritten bir gün seçin." : "Şimdi bir saat seçin.";
        var target = S.day === null ? buttons.filter(function (b) { return !b.disabled; })[0] : $(".chip", slotsEl);
        if (target) target.focus();
      } else {
        info.textContent = "WhatsApp açılıyor; mesajı gönderdikten sonra yanıtı oradan alırsınız.";
      }
    });
    if (copyB) copyB.addEventListener("click", function () { copyText(message(), copyB, info); });

    var q = /[?&]gun=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (q) days.forEach(function (x, i) { if (iso(x.dt) === q[1] && !buttons[i].disabled) selectDay(i); });
    update();
  }

  /* ---- Sofra haritası + soru listesi ---- */
  var sofra = $("[data-sofra]");
  if (sofra) initSofra(sofra);

  function initSofra(rootEl) {
    var plates = $$(".plate", rootEl);
    var tEl = $("[data-info-title]", rootEl), dEl = $("[data-info-text]", rootEl), qBtn = $("[data-info-ask]", rootEl);
    var msgEl = $("[data-ask-msg]", rootEl), send = $("[data-ask-send]", rootEl), copyB = $("[data-ask-copy]", rootEl), info = $("[data-ask-info]", rootEl);
    var asked = [], current = null;
    function questionFor(p) { return p.getAttribute("data-title") + ": " + p.getAttribute("data-q"); }
    function show(p) {
      current = p;
      plates.forEach(function (o) { o.setAttribute("aria-pressed", String(o === p)); });
      tEl.textContent = p.getAttribute("data-title");
      dEl.textContent = p.getAttribute("data-text");
      qBtn.hidden = false;
      syncAsk();
    }
    function syncAsk() {
      if (!current) return;
      var on = asked.indexOf(questionFor(current)) > -1;
      qBtn.setAttribute("aria-pressed", String(on));
      qBtn.textContent = on ? "Soru listemde" : "Bunu da soracağım";
    }
    plates.forEach(function (p) { p.addEventListener("click", function () { show(p); }); });
    qBtn.addEventListener("click", function () {
      if (!current) return;
      var q = questionFor(current), i = asked.indexOf(q);
      if (i > -1) asked.splice(i, 1); else asked.push(q);
      current.classList.toggle("is-asked", i === -1);
      syncAsk(); update();
    });
    $$("[data-ask]", rootEl).forEach(function (c) {
      c.addEventListener("click", function () {
        var q = c.getAttribute("data-ask"), i = asked.indexOf(q);
        if (i > -1) asked.splice(i, 1); else asked.push(q);
        c.setAttribute("aria-pressed", String(i === -1));
        update();
      });
    });
    function message() {
      if (!asked.length) return "Merhaba, güncel kahvaltı menünüzü paylaşabilir misiniz? Teşekkürler.";
      return "Merhaba, kahvaltı hakkında sormak istediklerim var:\n" + asked.map(function (q) { return "• " + q; }).join("\n") + "\nTeşekkürler.";
    }
    function update() { var m = message(); msgEl.textContent = m; send.href = waHref(m); }
    send.addEventListener("click", function () { info.textContent = "WhatsApp açılıyor; sorularınız hazır."; });
    copyB.addEventListener("click", function () { copyText(message(), copyB, info); });
    update();
  }

  /* ---- Moda'da sabah rotası ---- */
  var route = $("[data-route]");
  if (route) initRoute(route);

  function initRoute(rootEl) {
    var stops = $$("[data-stop]", rootEl), listEl = $("[data-plan]", rootEl);
    var copyB = $("[data-plan-copy]", rootEl), shareB = $("[data-plan-share]", rootEl), info = $("[data-plan-info]", rootEl);
    var order = [];
    function byKey(k) { return stops.filter(function (s) { return s.getAttribute("data-stop") === k; })[0]; }
    function toggle(k, force) {
      var i = order.indexOf(k), on = force !== undefined ? force : i === -1;
      if (on && i === -1) order.push(k);
      if (!on && i > -1) order.splice(i, 1);
      var b = byKey(k); if (b) b.setAttribute("aria-pressed", String(on));
    }
    stops.forEach(function (b) { b.addEventListener("click", function () { toggle(b.getAttribute("data-stop")); render(); }); });
    $$("[data-preset]", rootEl).forEach(function (p) {
      p.addEventListener("click", function () {
        order.slice().forEach(function (k) { toggle(k, false); });
        p.getAttribute("data-preset").split(",").forEach(function (k) { toggle(k, true); });
        $$("[data-preset]", rootEl).forEach(function (o) { o.setAttribute("aria-pressed", String(o === p)); });
        render();
      });
    });
    function firstLine() {
      var r = dayRange(today);
      return r ? "Bugün " + hhmm(r[0]) + "–" + hhmm(r[1]) + " arası açığız" : "Bugün kapalıyız; Salı–Pazar 10:00'da açılış";
    }
    function render() {
      var html = '<li class="first"><b>Duru\'da kahvaltı</b><small>Gürbüztürk Sok. No:29/B · ' + firstLine() + "</small></li>";
      order.forEach(function (k) {
        var b = byKey(k);
        html += "<li><b>" + b.getAttribute("data-name") + "</b><small>" + b.getAttribute("data-tip") + "</small></li>";
      });
      if (!order.length) html += '<li><span class="plan-empty">Bir hazır rota seçin ya da duraklara dokunun.</span></li>';
      listEl.innerHTML = html;
    }
    function text() {
      var L = ["Moda'da bir sabah", "1. " + BRAND + "'ta kahvaltı (Gürbüztürk Sok. No:29/B, Kadıköy)"];
      order.forEach(function (k, i) { L.push((i + 2) + ". " + byKey(k).getAttribute("data-name")); });
      L.push("", "Yer talebi: " + WA);
      return L.join("\n");
    }
    copyB.addEventListener("click", function () { copyText(text(), copyB, info, "Plan panoya kopyalandı."); });
    shareB.addEventListener("click", function () {
      var t = text();
      if (navigator.share) { navigator.share({ text: t }).catch(function () {}); }
      else { window.open("https://wa.me/?text=" + encodeURIComponent(t), "_blank", "noopener"); info.textContent = "Plan WhatsApp'ta açıldı; göndermek istediğiniz kişiyi seçin."; }
    });
    render();
  }

  /* ---- İletişim: hızlı soru + adres kopyala ---- */
  var quick = $("[data-quick]");
  if (quick) {
    var qMsg = $("[data-quick-msg]", quick), qSend = $("[data-quick-send]", quick), qCopy = $("[data-quick-copy]", quick), qInfo = $("[data-quick-info]", quick);
    var topics = [];
    var qMessage = function () {
      if (!topics.length) return "Merhaba, " + BRAND + " hakkında bilgi almak istiyorum.";
      return "Merhaba, " + BRAND + " hakkında şunları sormak istiyorum:\n" + topics.map(function (t) { return "• " + t; }).join("\n") + "\nTeşekkürler.";
    };
    var qUpdate = function () { var m = qMessage(); qMsg.textContent = m; qSend.href = waHref(m); };
    $$("[data-topic]", quick).forEach(function (c) {
      c.addEventListener("click", function () {
        var t = c.getAttribute("data-topic"), i = topics.indexOf(t);
        if (i > -1) topics.splice(i, 1); else topics.push(t);
        c.setAttribute("aria-pressed", String(i === -1));
        qUpdate();
      });
    });
    qSend.addEventListener("click", function () { qInfo.textContent = "WhatsApp açılıyor."; });
    qCopy.addEventListener("click", function () { copyText(qMessage(), qCopy, qInfo); });
    qUpdate();
  }
  $$("[data-copy-addr]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(ADDRESS, b, $("[data-addr-info]"), "Adres panoya kopyalandı."); });
  });
})();
