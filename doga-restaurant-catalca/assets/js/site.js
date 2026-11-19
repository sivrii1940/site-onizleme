/* Doğa Restaurant, Alev Hanım'ın Mutfağı — defter sitesi betikleri (kütüphanesiz) */

/* ---- kit/status.js: açık/kapalı durumu (birebir kopya) ---- */
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
  var HOURS = { "0": [["10:00", "18:00"]], "1": [["10:00", "18:00"]], "2": [["10:00", "18:00"]], "3": [["10:00", "18:00"]], "4": [["10:00", "18:00"]], "5": [["10:00", "18:00"]], "6": [["10:00", "18:00"]] };
  var WA = "https://wa.me/905317219871";
  var OPEN = 600, CLOSE = 1080; /* 10:00 – 18:00, her gün */
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* İstanbul takvim günü (UTC+3, yaz saati yok) + k gün */
  function istDay(k) {
    var t = new Date(Date.now() + 3 * 3600000);
    var d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + (k || 0)));
    var wd = (d.getUTCDay() + 6) % 7;
    var iso = d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
    return { k: k || 0, iso: iso, wd: wd, day: d.getUTCDate(), month: d.getUTCMonth(), label: d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + DAYS[wd] };
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function toMin(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function diffText(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " saat" : "") + (h && r ? " " : "") + (r ? r + " dakika" : ""); }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function store(key, val) { try { if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null"); localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return null; } }

  function copyText(text, out) {
    function done(ok) { if (out) { out.textContent = ok ? "Kopyalandı, istediğiniz yere yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın."; setTimeout(function () { out.textContent = ""; }, 4000); } }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback()); });
    } else { done(fallback()); }
    function fallback() {
      try {
        var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); var ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
      } catch (e) { return false; }
    }
  }

  /* ---- canlı durum, tarih, saat çizelgesi ---- */
  var st = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) {
    el.textContent = st.text;
    el.classList.toggle("is-open", st.open);
    el.classList.toggle("is-closed", !st.open);
  });
  var today = istDay(0);
  $$("[data-today]").forEach(function (el) { el.textContent = today.day + " " + MONTHS[today.month] + ", " + DAYS[today.wd]; });
  $$("[data-hours]").forEach(function (box) {
    var row = $('[data-day="' + st.dayIndex + '"]', box);
    if (!row) return;
    row.classList.add("is-today");
    var lbl = $(".d", row); if (lbl) lbl.setAttribute("aria-label", lbl.textContent + " (bugün)");
    if (st.minutes >= 480 && st.minutes <= 1200) {
      var bar = $(".bar", row), now = document.createElement("span");
      now.className = "now"; now.setAttribute("aria-hidden", "true");
      now.style.left = ((st.minutes - 480) / 720 * 100) + "%";
      bar.appendChild(now);
    }
  });

  /* ---- gezinme ---- */
  var tog = $(".nav-toggle"), tabs = $("#sayfalar");
  if (tog && tabs) {
    var setOpen = function (o) { tabs.classList.toggle("is-open", o); tog.setAttribute("aria-expanded", o ? "true" : "false"); };
    tog.addEventListener("click", function () { setOpen(tog.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && tabs.classList.contains("is-open")) { setOpen(false); tog.focus(); } });
    document.addEventListener("click", function (e) { if (tabs.classList.contains("is-open") && !tabs.contains(e.target) && !tog.contains(e.target)) setOpen(false); });
  }

  /* ---- açık defter: yazılarak belirme ---- */
  var nb = $(".nb");
  if (nb) {
    var wrote = false, go = function () { if (!wrote) { wrote = true; nb.classList.add("is-written"); } };
    if (reduce) go();
    else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { requestAnimationFrame(go); }); setTimeout(go, 1500); }
    else go();
  }

  /* ---- görünce çiz / yerleş ---- */
  /* görünür alana giren ya da üstünden geçilen her öğe çizilir (hızlı kaydırmada da boş kalmaz) */
  var rev = $$("[data-reveal]");
  if (reduce) rev.forEach(function (el) { el.classList.add("is-in"); });
  else if (rev.length) {
    var ticking = false;
    var check = function () {
      ticking = false;
      var lim = window.innerHeight * .9;
      rev = rev.filter(function (el) {
        if (el.getBoundingClientRect().top < lim) { el.classList.add("is-in"); return false; }
        return true;
      });
      if (!rev.length) { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    setTimeout(check, 350);
  }

  /* ---- ortak: çip oluşturucu ---- */
  function chip(name, value, html, type, cls) {
    var l = document.createElement("label"); l.className = "chip" + (cls ? " " + cls : "");
    l.innerHTML = '<input type="' + (type || "radio") + '" name="' + name + '" value="' + value + '"><span>' + html + "</span>";
    return l;
  }
  function selVal(root, name) { var i = $('input[name="' + name + '"]:checked', root); return i ? i.value : ""; }
  function selAll(root, name) { return $$('input[name="' + name + '"]:checked', root).map(function (i) { return i.value; }); }

  /* ---- çentik sayacı ---- */
  function tallySVG(n, animateLast) {
    var parts = [], groups = Math.ceil(n / 5), w = Math.max(groups, 1) * 62;
    for (var i = 0; i < n; i++) {
      var g = Math.floor(i / 5), j = i % 5, x0 = g * 62, last = animateLast && i === n - 1 ? ' class="new" pathLength="1"' : "";
      var jit = ((i * 37) % 7 - 3) * .6;
      if (j < 4) { var x = x0 + 8 + j * 12; parts.push('<path' + last + ' d="M' + (x + jit) + ' 6 C ' + (x + 2) + ' 20, ' + (x - 1) + ' 34, ' + (x + jit * .5) + ' 50"/>'); }
      else parts.push('<path' + last + ' d="M' + (x0 + 1) + ' 42 C ' + (x0 + 18) + ' 34, ' + (x0 + 36) + ' 22, ' + (x0 + 56) + ' 12"/>');
    }
    return '<svg viewBox="-4 0 ' + (w + 4) + ' 56" width="' + (w + 4) + '" height="56" aria-hidden="true">' + parts.join("") + "</svg>";
  }
  function initTally(root, start, onChange) {
    var n = start, max = 30, box = $("[data-tally]", root), cnt = $("[data-count]", root), minus = $("[data-minus]", root), plus = $("[data-plus]", root);
    function render(anim) {
      box.innerHTML = tallySVG(n, anim);
      cnt.textContent = n + " kişi";
      minus.disabled = n <= 1; plus.disabled = n >= max;
      onChange(n);
    }
    minus.addEventListener("click", function () { if (n > 1) { n--; render(false); } });
    plus.addEventListener("click", function () { if (n < max) { n++; render(true); } });
    render(false);
    return { get: function () { return n; }, set: function (v) { n = Math.max(1, Math.min(max, v | 0)); render(false); } };
  }

  /* ---- masa ayırtma (ana sayfa: hafta sonu / rezervasyon: takvim) ---- */
  $$('[data-tool="masa"]').forEach(function (tool) {
    var mode = tool.getAttribute("data-mode") || "weekend";
    var daysBox = $("[data-days]", tool), calBox = $("[data-cal]", tool), timesBox = $("[data-times]", tool);
    var preview = $("[data-preview]", tool), wa = $("[data-wa]", tool), copyBtn = $("[data-copy]", tool), copied = $("[data-copied]", tool);
    var dayMap = {};
    var params = {};
    try { new URLSearchParams(location.search).forEach(function (v, k) { params[k] = v; }); } catch (e) {}

    if (mode === "weekend" && daysBox) {
      var found = 0;
      for (var k = 0; k < 15 && found < 4; k++) {
        var d = istDay(k);
        if (d.wd >= 5) {
          dayMap[d.iso] = d;
          var tag = k === 0 ? "bugün" : k === 1 ? "yarın" : DAYS[d.wd];
          daysBox.appendChild(chip("gun", d.iso, d.day + " " + MONTHS[d.month] + "<small>" + tag + "</small>", "radio", "chip--day is-weekend"));
          found++;
        }
      }
    }
    if (mode === "calendar" && calBox) {
      var first = istDay(0), lead = first.wd, total = 28, html = '<p class="cal-month" data-cal-month></p><div class="cal-head" aria-hidden="true">' + SHORT.map(function (s) { return "<span>" + s + "</span>"; }).join("") + '</div><div class="cal-grid" role="radiogroup" aria-label="Gün seçin">';
      for (var b = 0; b < lead; b++) html += '<label class="cday is-blank" aria-hidden="true"><span></span></label>';
      for (var i = 0; i < total; i++) {
        var dd = istDay(i); dayMap[dd.iso] = dd;
        html += '<label class="cday' + (dd.wd >= 5 ? " is-weekend" : "") + (i === 0 ? " is-today" : "") + '"><input type="radio" name="gun" value="' + dd.iso + '" aria-label="' + dd.label + (i === 0 ? ", bugün" : "") + '"><span>' + dd.day + "<small>" + (i === 0 ? "bugün" : dd.day === 1 || i === 0 ? MONTHS[dd.month].slice(0, 3) : SHORT[dd.wd]) + "</small></span></label>";
      }
      calBox.innerHTML = html + "</div>";
      var last = istDay(total - 1);
      $("[data-cal-month]", calBox).textContent = first.month === last.month ? MONTHS[first.month] : MONTHS[first.month] + " – " + MONTHS[last.month];
    }

    var times = [];
    var tEnd = mode === "weekend" ? 780 : 990;
    for (var m = OPEN; m <= tEnd; m += 30) times.push(hm(m));
    times.forEach(function (t) { timesBox.appendChild(chip("saat", t, t)); });
    timesBox.appendChild(chip("saat", "sor", mode === "weekend" ? "Daha geç bir saat" : "Saati konuşalım"));

    var tally = initTally(tool, 2, update);

    function refreshTimes() {
      var iso = selVal(tool, "gun"), isToday = iso === today.iso, nowM = istanbulNow().m;
      $$('input[name="saat"]', timesBox).forEach(function (inp) {
        if (inp.value === "sor") return;
        var past = isToday && toMin(inp.value) <= nowM + 20;
        inp.disabled = past;
        if (past && inp.checked) inp.checked = false;
      });
    }

    function message() {
      var iso = selVal(tool, "gun"), d = dayMap[iso], t = selVal(tool, "saat"), n = tally ? tally.get() : 2;
      var name = ($("[data-name]", tool) || {}).value || "", note = ($("[data-note]", tool) || {}).value || "";
      var purpose = mode === "weekend" ? "Hafta sonu kahvaltısı" : selVal(tool, "amac");
      var extras = selAll(tool, "ek");
      var L = ["Merhaba, Doğa Restaurant için masa ayırtmak istiyorum."];
      L.push("Gün: " + (d ? d.label : "(gün seçilmedi)"));
      L.push("Saat: " + (t === "sor" ? (mode === "weekend" ? "biraz daha geç, saati birlikte konuşalım" : "saati telefonda konuşalım") : (t || "(saat seçilmedi)")));
      L.push("Kişi sayısı: " + n);
      if (purpose) L.push("Ne için: " + purpose);
      if (extras.length) { L.push("Sormak istediklerim:"); extras.forEach(function (x) { L.push("- " + x); }); }
      if (note.trim()) L.push("Not: " + note.trim());
      if (name.trim()) L.push("Adım: " + name.trim());
      L.push("Uygun olup olmadığını yazabilir misiniz? Teşekkürler.");
      return L.join("\n");
    }
    function update() {
      if (!preview) return;
      var msg = message();
      preview.textContent = msg;
      wa.href = waHref(msg);
      wa.classList.toggle("is-ready", !!(selVal(tool, "gun") && selVal(tool, "saat")));
    }
    tool.addEventListener("change", function (e) { if (e.target.name === "gun") refreshTimes(); update(); });
    tool.addEventListener("input", function (e) { if (e.target.matches("[data-name],[data-note]")) update(); });
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(message(), copied); });

    /* varsayılanlar / adres çubuğundan gelenler */
    var pick = params.gun && dayMap[params.gun] ? params.gun : null;
    if (!pick) { var firstDay = mode === "weekend" ? $('input[name="gun"]', tool) : $('.cday.is-weekend input[name="gun"]', tool); if (firstDay) pick = firstDay.value; }
    if (pick) { var di = $('input[name="gun"][value="' + pick + '"]', tool); if (di) di.checked = true; }
    refreshTimes();
    var wantT = params.saat && /^\d\d:\d\d$/.test(params.saat) ? params.saat : null;
    if (wantT) {
      var mm = Math.round(toMin(wantT) / 30) * 30; wantT = hm(Math.max(OPEN, Math.min(990, mm)));
      var ti = $('input[name="saat"][value="' + wantT + '"]', timesBox);
      if (ti && !ti.disabled) ti.checked = true;
    }
    if (params.kisi) tally.set(parseInt(params.kisi, 10) || 2);
    if (params.amac) { var ai = $('input[name="amac"][value="' + params.amac + '"]', tool); if (ai) ai.checked = true; }
    update();
  });

  /* ---- mutfağa sor ---- */
  $$('[data-tool="mutfak"]').forEach(function (tool) {
    var preview = $("[data-preview]", tool), wa = $("[data-wa]", tool), copied = $("[data-copied]", tool);
    function message() {
      var when = selVal(tool, "ne-zaman") || "bugün", items = selAll(tool, "tabak"), note = ($("[data-note]", tool) || {}).value || "";
      var L = [];
      if (items.length) {
        var list = items.length > 1 ? items.slice(0, -1).join(", ") + " ve " + items[items.length - 1] : items[0];
        L.push("Merhaba, " + when + " mutfakta neler var? Özellikle şunları sormak istiyorum: " + list + ".");
      } else L.push("Merhaba, " + when + " mutfakta neler var? Günün menüsünü gönderebilir misiniz?");
      if (note.trim()) L.push("Not: " + note.trim());
      L.push("Teşekkürler.");
      return L.join("\n");
    }
    function update() { var m = message(); preview.textContent = m; wa.href = waHref(m); }
    tool.addEventListener("change", update);
    tool.addEventListener("input", update);
    $("[data-copy]", tool).addEventListener("click", function () { copyText(message(), copied); });
    update();
  });

  /* ---- ne zaman gelsem? planlayıcı ---- */
  $$('[data-tool="plan"]').forEach(function (tool) {
    var daysBox = $("[data-days]", tool), range = $("[data-range]", tool), big = $("[data-time-big]", tool), mark = $("[data-mark]", tool);
    var out = $("[data-plan-text]", tool), res = $("[data-plan-res]", tool), map = {};
    for (var k = 0; k < 7; k++) {
      var d = istDay(k); map[d.iso] = d;
      daysBox.appendChild(chip("plan-gun", d.iso, (k === 0 ? "Bugün" : k === 1 ? "Yarın" : DAYS[d.wd]) + "<small>" + d.day + " " + MONTHS[d.month] + "</small>", "radio", "chip--day" + (d.wd >= 5 ? " is-weekend" : "")));
    }
    var firstIn = $('input[name="plan-gun"]', daysBox); firstIn.checked = true;
    if (st.minutes > 600 && st.minutes < 1140) range.value = Math.min(1200, Math.ceil((st.minutes + 30) / 15) * 15);
    function update() {
      var iso = selVal(tool, "plan-gun"), d = map[iso], m = parseInt(range.value, 10), isToday = d.k === 0, nowM = istanbulNow().m;
      big.textContent = hm(m);
      range.setAttribute("aria-valuetext", hm(m));
      mark.style.left = ((m - 480) / 720 * 100) + "%";
      var html = "", warn = false;
      if (isToday && m < nowM) { html = "<strong>Bu saat bugün için geçti.</strong> Daha ileri bir saat ya da başka bir gün seçin."; warn = true; }
      else if (m < OPEN) html = "<strong>Kapı 10:00'da açılıyor.</strong> Açılışa " + diffText(OPEN - m) + " var; biraz geç çıkabilir ya da yolda acele etmeden gelebilirsiniz.";
      else if (m < CLOSE - 60) html = "<strong>" + (isToday ? "Bugün" : d.label) + " " + hm(m) + " için açığız.</strong> Kapanışa " + diffText(CLOSE - m) + " var; sofra ve sohbet için rahat bir zaman.";
      else if (m < CLOSE) { html = "<strong>Kapanışa az kalıyor (" + diffText(CLOSE - m) + ").</strong> Gelmeden önce arayıp mutfağın durumunu sormanızı öneririz."; warn = true; }
      else { html = "<strong>Bu saatte kapalıyız.</strong> Her gün 18:00'de kapanıyoruz; daha erken bir saat seçin."; warn = true; }
      if (d.wd >= 5 && m >= OPEN && m < CLOSE) html += " Hafta sonu geliyorsanız masanızı önceden sorun.";
      out.innerHTML = html;
      out.classList.toggle("warn", warn);
      var rm = Math.max(OPEN, Math.min(990, Math.round(m / 30) * 30));
      res.href = "rezervasyon.html?gun=" + iso + "&saat=" + hm(rm);
    }
    tool.addEventListener("change", update);
    range.addEventListener("input", update);
    update();
  });

  /* ---- hazır mesajlar ---- */
  var TPL = {
    masa: "Merhaba, Doğa Restaurant için masa ayırtmak istiyorum. Gün: ..., saat: ..., kişi sayısı: .... Uygun mu?",
    menu: "Merhaba, bugün mutfakta neler var? Günün menüsünü gönderebilir misiniz? Teşekkürler.",
    paket: "Merhaba, paket servis ya da gel-al seçeneğiniz var mı? Bulunduğum yer: .... Teşekkürler.",
    grup: "Merhaba, kalabalık bir grup için (yaklaşık ... kişi) ... günü ... saatinde gelmek istiyoruz. Uygunluk ve ayrıntılar için bilgi alabilir miyim?",
    yol: "Merhaba, size gelmek için yol tarifi alabilir miyim? ... tarafından geliyorum. Teşekkürler."
  };
  $$('[data-tool="mesaj"]').forEach(function (tool) {
    var preview = $("[data-preview]", tool), wa = $("[data-wa]", tool), copied = $("[data-copied]", tool);
    function update() { var m = TPL[selVal(tool, "sablon")] || TPL.masa; preview.textContent = m; wa.href = waHref(m); }
    tool.addEventListener("change", update);
    $("[data-copy]", tool).addEventListener("click", function () { copyText(preview.textContent, copied); });
    update();
  });

  /* ---- yola çıkmadan listesi (yalnız bu tarayıcıda hatırlanır) ---- */
  $$("[data-checklist]").forEach(function (list) {
    var key = "doga-" + list.getAttribute("data-checklist"), saved = store(key) || [];
    var boxes = $$('input[type="checkbox"]', list);
    boxes.forEach(function (b, i) { if (saved.indexOf(i) > -1) b.checked = true; });
    list.addEventListener("change", function () { store(key, boxes.map(function (b, i) { return b.checked ? i : -1; }).filter(function (i) { return i > -1; })); });
  });

  /* ---- metin kopyala (adres vb.) ---- */
  $$("[data-copy-text]").forEach(function (btn) {
    btn.addEventListener("click", function () { copyText(btn.getAttribute("data-copy-text"), document.getElementById(btn.getAttribute("aria-controls"))); });
  });
})();
