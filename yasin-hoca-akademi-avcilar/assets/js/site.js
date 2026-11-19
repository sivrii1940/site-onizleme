/* Yasin Hoca Akademi — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var HOURS = { "0": [["08:00", "22:00"]], "1": [["08:00", "22:00"]], "2": [["08:00", "22:00"]], "3": [["08:00", "22:00"]], "4": [["08:00", "22:00"]], "5": [["08:00", "22:00"]], "6": [["08:00", "22:00"]] };
  var WA = "https://wa.me/905077081876";
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- kit/status.js'ten kopya ---- */
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

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }

  function copyText(text, out) {
    function done(ok) { if (out) { out.textContent = ok ? "Kopyalandı. İstediğiniz yere yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın."; } }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try {
        var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select(); var ok = document.execCommand("copy"); document.body.removeChild(t); done(ok);
      } catch (e) { done(false); }
    }
  }

  /* ---- gezinme ---- */
  var head = $(".site-head"), menuBtn = $(".menu-btn");
  if (head && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = head.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && head.classList.contains("open")) { head.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
    });
  }

  /* ---- canlı durum ---- */
  var ST = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) {
    el.textContent = ST.text;
    el.classList.toggle("is-open", ST.open);
    el.classList.toggle("is-closed", !ST.open);
  });

  /* ---- tahtanın köşesine bugünün tarihi ---- */
  $$("[data-today]").forEach(function (el) {
    try {
      el.textContent = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", weekday: "long" }).format(new Date());
      el.hidden = false;
    } catch (e) { /* tarih yazılamazsa boş kalır */ }
  });

  /* ---- saat tabloları: bugünü işaretle ---- */
  $$("[data-hours-table] tr[data-day]").forEach(function (tr) {
    if (+tr.getAttribute("data-day") === ST.dayIndex) tr.classList.add("today");
  });

  /* ---- haftalık tahta (ana sayfa) ---- */
  var week = $("[data-week]");
  if (week) {
    $$("th[data-d]", week).forEach(function (th) { if (+th.getAttribute("data-d") === ST.dayIndex) th.classList.add("today"); });
    $$("td[data-d]", week).forEach(function (td) {
      var d = +td.getAttribute("data-d"), h = +td.getAttribute("data-h");
      if (d === ST.dayIndex) td.classList.add("today");
      if (d === ST.dayIndex && ST.minutes >= h * 60 && ST.minutes < (h + 2) * 60) td.classList.add("now");
    });
    var wn = $("[data-week-now]");
    if (wn) {
      var hh = Math.floor(ST.minutes / 60), mm = ST.minutes % 60;
      var clock = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
      wn.textContent = ST.open ? "Saat " + clock + ", " + DAYS[ST.dayIndex] + ": kapılar açık." : "Saat " + clock + ": şu an kapalı, " + (ST.opensWhen || "") + " " + (ST.opensAt || "08:00") + "'de açılıyor.";
    }
  }

  /* ---- günün notu ---- */
  var TIPS = [
    ["Bugün tek bir konu seç, onu bitir.", "Birden çok konuya aynı anda dokunmak yorar; tek konu, net bir bitiş duygusu verir."],
    ["Kitabı kapat, hatırladığını yaz.", "Aktif hatırlama, yeniden okumaktan daha kalıcıdır. Sonra kitaba dönüp eksiğini tamamla."],
    ["Dünkü yanlışlarına beş dakika ayır.", "Soru defterini açıp dünkü yanlışları yeniden çözmek, aynı hatayı tekrarlamayı azaltır."],
    ["Telefon başka odada kalsın.", "Göz önündeki telefon, sessizde olsa bile dikkati böler."],
    ["25 dakika çalış, 5 dakika mola ver.", "Pomodoro düzeni başlamayı kolaylaştırır; Dersler sayfasındaki sayacı kullanabilirsin."],
    ["Konuyu birine anlatıyormuş gibi çalış.", "Anlatırken takıldığın yer, eksik olan yerdir. Oraya geri dön."],
    ["Planını akşamdan kâğıda yaz.", "Sabah 'ne çalışsam' diye düşünmek zaman kaybettirir; listeyi akşamdan hazırla."],
    ["Bir haftalık tekrar günü belirle.", "Haftada bir gün, o hafta öğrendiklerine kısa bir genel tekrar yap."],
    ["Su iç, kısa bir yürüyüş yap.", "Molada ekrandan uzaklaşmak, sonraki çalışma bloğuna daha dinç başlatır."],
    ["Yanlışının nedenini tek kelimeyle not et.", "Bilgi mi, dikkat mi, süre mi? Nedeni bilmek, çareyi bulmayı kolaylaştırır."],
    ["Zor dersi güne en dinç saatinde koy.", "Yorulduğunda daha kolay işleri yaparsın; zor konuyu enerjinin yüksek olduğu saate al."],
    ["Uykunu çalışmaya feda etme.", "Öğrenilenler uykuda pekişir; sınav öncesi gece de dinlenmek önemlidir."],
    ["Deneme sonrası analizi atlama.", "Deneme çözmek kadar, sonucunu konu konu incelemek de çalışmanın parçasıdır."],
    ["Küçük bir hedef koy, bitirince işaretle.", "Listeden bir maddeyi çizmek motivasyonu canlı tutar."]
  ];
  var tip = $("[data-tip]");
  if (tip) {
    var now = new Date(), start = new Date(now.getFullYear(), 0, 0);
    var doy = Math.floor((now - start) / 86400000);
    var t = TIPS[doy % TIPS.length];
    $(".tip-text", tip).textContent = t[0];
    $(".tip-why", tip).textContent = t[1];
  }

  /* ---- tebeşirle yazma (her sayfanın başlığı) ---- */
  function prepWrite(h) {
    if (h.getAttribute("data-ready")) return;
    var text = h.textContent.trim();
    h.setAttribute("data-text", text);
    var sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = text;
    var vis = document.createElement("span"); vis.setAttribute("aria-hidden", "true");
    text.split(" ").forEach(function (word, wi) {
      if (wi) vis.appendChild(document.createTextNode(" "));
      var w = document.createElement("span"); w.className = "w";
      Array.from(word).forEach(function (ch) { var c = document.createElement("span"); c.className = "c"; c.textContent = ch; w.appendChild(c); });
      vis.appendChild(w);
    });
    h.textContent = ""; h.appendChild(sr); h.appendChild(vis);
    h.setAttribute("data-ready", "1");
  }
  function writeChalk(h, done) {
    var board = h.closest(".board");
    if (!board || REDUCED) { if (done) done(); return; }
    prepWrite(h);
    var chars = $$(".c", h);
    var stick = $(".chalk-stick", board);
    if (!stick) { stick = document.createElement("span"); stick.className = "chalk-stick"; stick.setAttribute("aria-hidden", "true"); board.appendChild(stick); }
    board.classList.add("writing");
    chars.forEach(function (c) { c.classList.remove("on"); });
    var i = 0, br = board.getBoundingClientRect();
    function place(c) {
      var r = c.getBoundingClientRect(); br = board.getBoundingClientRect();
      var x = r.right - br.left - 4, y = r.top - br.top + r.height * 0.58;
      stick.style.transform = "translate(" + x + "px," + y + "px) rotate(-32deg)";
      if (Math.random() < 0.55) {
        var d = document.createElement("span"); d.className = "dust";
        d.style.left = (x + Math.random() * 6) + "px"; d.style.top = (y + 4) + "px";
        d.style.setProperty("--dx", (Math.random() * 14 - 4).toFixed(1) + "px");
        board.appendChild(d); setTimeout(function () { d.remove(); }, 950);
      }
    }
    function step() {
      if (i >= chars.length) {
        setTimeout(function () { stick.classList.remove("on"); board.classList.remove("writing"); if (done) done(); }, 260);
        return;
      }
      var c = chars[i++]; c.classList.add("on"); place(c); stick.classList.add("on");
      var next = c.parentNode.lastChild === c ? 115 : 46;
      setTimeout(step, next);
    }
    setTimeout(step, 120);
  }
  var heads = $$("[data-write]");
  heads.forEach(function (h) {
    if (REDUCED || !h.closest(".board")) { h.setAttribute("data-ready", "1"); return; }
    prepWrite(h); h.closest(".board").classList.add("writing");
  });
  if (heads.length) {
    var go = function () { heads.forEach(function (h) { writeChalk(h); }); };
    var started = false;
    var once = function () { if (!started) { started = true; go(); } };
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(once); setTimeout(once, 1200); } else { once(); }
  }

  /* silgi: tahtayı sil, yeniden yaz */
  $$("[data-erase]").forEach(function (b) {
    b.addEventListener("click", function () {
      var board = b.closest(".wood") && $(".board", b.closest(".wood"));
      var h = board && $("[data-write]", board);
      if (!h) return;
      if (REDUCED) return;
      var sw = document.createElement("span"); sw.className = "eraser-sweep"; board.appendChild(sw);
      setTimeout(function () { prepWrite(h); $$(".c", h).forEach(function (c) { c.classList.remove("on"); }); board.classList.add("writing"); }, 380);
      setTimeout(function () { sw.remove(); writeChalk(h); }, 900);
    });
  });

  /* ---- hero: ders sözcüklerini tebeşirle çevir ---- */
  var pick = $("[data-pick]");
  if (pick) {
    var out = $(".pick-out", pick), link = $("[data-pick-link]", pick);
    var update = function () {
      var sel = $$(".word[aria-pressed='true']", pick).map(function (b) { return b.getAttribute("data-value"); });
      if (sel.length) {
        out.innerHTML = "";
        var s = document.createElement("strong"); s.textContent = sel.join(", ");
        out.appendChild(document.createTextNode("Çevrildi: ")); out.appendChild(s);
        out.appendChild(document.createTextNode(". Sınıf düzeyi ve günleri talep oluşturucuda ekleyin; uygun program için bilgi alın."));
        link.href = "program.html?ders=" + encodeURIComponent(sel.join(","));
        link.textContent = "Bu derslerle talep oluştur";
      } else {
        out.textContent = "Bir ya da birkaç ders seçin; seçimleriniz talep oluşturucuya taşınır.";
        link.href = "program.html"; link.textContent = "Ders talebi oluştur";
      }
    };
    $$(".word", pick).forEach(function (b) {
      b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); update(); });
    });
    update();
  }

  /* ---- sekmeler ---- */
  $$("[data-tabs]").forEach(function (box) {
    var btns = $$("[role='tab']", box), panels = $$("[role='tabpanel']", box);
    function show(i, focus) {
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = j !== i; });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { show(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); show((i + 1) % btns.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); show((i - 1 + btns.length) % btns.length, true); }
      });
    });
    var hash = location.hash.replace("#", ""), start = 0;
    panels.forEach(function (p, j) { if (p.id === hash) start = j; });
    show(start);
  });

  /* ---- DERS TALEBİ OLUŞTURUCU ---- */
  var talep = $("[data-tool='talep']");
  if (talep) {
    var msgEl = $("[data-msg]", talep), waA = $("[data-wa-send]", talep), countEl = $("[data-count]", talep), copyOut = $("[data-copied]", talep);
    var BAND = { sabah: "sabah (08:00–12:00)", ogle: "öğleden sonra (12:00–17:00)", aksam: "akşam (17:00–22:00)" };
    var BAND_SHORT = { sabah: "sabah", ogle: "öğleden sonra", aksam: "akşam" };
    var val = function (name) { var x = $("input[name='" + name + "']:checked", talep); return x ? x.value : ""; };
    var vals = function (name) { return $$("input[name='" + name + "']:checked", talep).map(function (x) { return x.value; }); };
    var compose = function () {
      var duzey = val("duzey"), dersler = vals("ders"), diger = ($("[name='ders-diger']", talep).value || "").trim();
      if (diger) dersler.push(diger);
      var hedef = vals("hedef"), bicim = val("bicim");
      var ad = ($("[name='ad']", talep).value || "").trim(), not = ($("[name='not']", talep).value || "").trim();
      var byDay = {};
      $$(".slot[aria-pressed='true']", talep).forEach(function (s) {
        var d = +s.getAttribute("data-day"); (byDay[d] = byDay[d] || []).push(s.getAttribute("data-band"));
      });
      var dayParts = Object.keys(byDay).sort().map(function (d) { return DAYS[d] + " " + byDay[d].map(function (b) { return BAND_SHORT[b]; }).join(" ve "); });
      var slotCount = $$(".slot[aria-pressed='true']", talep).length;
      var L = [];
      L.push("Merhaba Yasin Hoca Akademi,");
      L.push("web sitenizdeki talep oluşturucudan yazıyorum; ders programınız hakkında bilgi almak istiyorum.");
      L.push("");
      if (ad) L.push("Öğrenci: " + ad);
      L.push("Sınıf düzeyi: " + (duzey || "henüz seçmedim"));
      L.push("İlgilendiğim dersler: " + (dersler.length ? dersler.join(", ") : "henüz seçmedim, birlikte konuşalım"));
      if (hedef.length) L.push("Hedef: " + hedef.join(", "));
      if (bicim) L.push("Çalışma biçimi: " + bicim);
      L.push("Uygun zamanlar: " + (dayParts.length ? dayParts.join("; ") : "esnek, sizin önerinizi bekliyorum"));
      if (not) L.push("Not: " + not);
      L.push("");
      L.push("Bu ders ve saatler için uygun program, grup/kontenjan ve kayıt bilgisini paylaşabilir misiniz? Teşekkürler.");
      var msg = L.join("\n");
      msgEl.textContent = msg;
      waA.href = waLink(msg);
      if (countEl) {
        var bits = [];
        bits.push(duzey ? duzey : "düzey seçilmedi");
        bits.push(dersler.length ? dersler.length + " ders" : "ders seçilmedi");
        bits.push(slotCount ? slotCount + " zaman dilimi" : "zaman esnek");
        countEl.textContent = bits.join(" · ");
      }
      return msg;
    };
    // sayfaya ?ders= ile gelindiyse işaretle
    try {
      var q = new URLSearchParams(location.search).get("ders");
      if (q) {
        var extra = [];
        q.split(",").forEach(function (d) {
          d = d.trim(); if (!d) return;
          var box = $$("input[name='ders']", talep).filter(function (x) { return x.value === d; })[0];
          if (box) box.checked = true; else extra.push(d);
        });
        if (extra.length) $("[name='ders-diger']", talep).value = extra.join(", ");
      }
    } catch (e) { /* eski tarayıcı */ }
    $$(".slot", talep).forEach(function (s) {
      s.addEventListener("click", function () { s.setAttribute("aria-pressed", s.getAttribute("aria-pressed") === "true" ? "false" : "true"); compose(); });
    });
    $$("[data-quick]", talep).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-quick");
        $$(".slot", talep).forEach(function (s) {
          var d = +s.getAttribute("data-day"), band = s.getAttribute("data-band");
          if (k === "temizle") s.setAttribute("aria-pressed", "false");
          if (k === "hici-aksam" && d < 5 && band === "aksam") s.setAttribute("aria-pressed", "true");
          if (k === "hsonu" && d >= 5 && band !== "aksam") s.setAttribute("aria-pressed", "true");
        });
        compose();
      });
    });
    talep.addEventListener("input", compose);
    talep.addEventListener("change", compose);
    var cp = $("[data-copy-msg]", talep);
    if (cp) cp.addEventListener("click", function () { copyText(compose(), copyOut); });
    var reset = $("[data-reset]", talep);
    if (reset) reset.addEventListener("click", function () {
      $$("input[type=checkbox], input[type=radio]", talep).forEach(function (x) { x.checked = false; });
      $$("input[type=text], textarea", talep).forEach(function (x) { x.value = ""; });
      $$(".slot", talep).forEach(function (s) { s.setAttribute("aria-pressed", "false"); });
      compose(); if (copyOut) copyOut.textContent = "";
    });
    compose();
  }

  /* ---- POMODORO ---- */
  var pomo = $("[data-tool='pomodoro']");
  if (pomo) {
    var face = $(".pomo-face .bar", pomo), tEl = $(".pomo-time b", pomo), mEl = $(".pomo-time span", pomo), live = $("[data-pomo-live]", pomo);
    var startBtn = $("[data-pomo-start]", pomo), tally = $(".tally", pomo);
    var C = 2 * Math.PI * 54; face.style.strokeDasharray = C.toFixed(2);
    var P = { odak: 25, mola: 5 }, mode = "odak", total = 25 * 60, left = total, endAt = 0, tick = null, rounds = 0;
    var origTitle = document.title;
    var fmt = function (s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; };
    var draw = function () {
      tEl.textContent = fmt(left);
      mEl.textContent = mode === "odak" ? "odak zamanı" : "mola zamanı";
      face.style.strokeDashoffset = (C * (1 - left / total)).toFixed(2);
      pomo.classList.toggle("mola", mode === "mola");
      if (tick) document.title = fmt(left) + " · " + (mode === "odak" ? "Odak" : "Mola") + " | Yasin Hoca Akademi";
    };
    var drawTally = function () {
      tally.innerHTML = "";
      if (!rounds) { tally.innerHTML = "<span class='pen-note'>Tamamlanan turlar burada tebeşir çizgisiyle sayılır.</span>"; return; }
      var groups = Math.ceil(rounds / 5);
      for (var g = 0; g < groups; g++) {
        var n = Math.min(5, rounds - g * 5), svg = "<svg viewBox='0 0 48 40' aria-hidden='true'>";
        for (var k = 0; k < Math.min(n, 4); k++) svg += "<line x1='" + (8 + k * 9) + "' y1='5' x2='" + (7 + k * 9) + "' y2='35'/>";
        if (n === 5) svg += "<line class='x' x1='2' y1='30' x2='42' y2='9'/>";
        tally.insertAdjacentHTML("beforeend", svg + "</svg>");
      }
      tally.insertAdjacentHTML("beforeend", "<span class='pen-note'>" + rounds + " odak turu</span>");
    };
    var beep = function () {
      try {
        var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
        var ctx = new A(), o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 660; g.gain.value = 0.08; o.connect(g); g.connect(ctx.destination); o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8); o.stop(ctx.currentTime + 0.85);
      } catch (e) { /* ses yoksa sessiz geç */ }
    };
    var setMode = function (m) { mode = m; total = P[m] * 60; left = total; draw(); };
    var stop = function () { clearInterval(tick); tick = null; startBtn.textContent = "Başlat"; document.title = origTitle; };
    var run = function () {
      endAt = Date.now() + left * 1000;
      tick = setInterval(function () {
        left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
        draw();
        if (left <= 0) {
          stop(); beep();
          if (mode === "odak") { rounds++; drawTally(); setMode("mola"); live.textContent = "Odak turu bitti. Mola zamanı."; }
          else { setMode("odak"); live.textContent = "Mola bitti. Yeni odak turuna hazırsınız."; }
        }
      }, 250);
      startBtn.textContent = "Duraklat";
    };
    startBtn.addEventListener("click", function () { if (tick) { stop(); live.textContent = "Duraklatıldı."; } else { run(); live.textContent = mode === "odak" ? "Odak turu başladı." : "Mola başladı."; } });
    $("[data-pomo-reset]", pomo).addEventListener("click", function () { stop(); setMode(mode); live.textContent = "Sayaç sıfırlandı."; });
    $("[data-pomo-skip]", pomo).addEventListener("click", function () { stop(); setMode(mode === "odak" ? "mola" : "odak"); live.textContent = mode === "odak" ? "Odak turuna geçildi." : "Molaya geçildi."; });
    $$("input[name='pomo-sure']", pomo).forEach(function (r) {
      r.addEventListener("change", function () { var a = r.value.split("/"); P.odak = +a[0]; P.mola = +a[1]; stop(); setMode("odak"); });
    });
    setMode("odak"); drawTally();
  }

  /* ---- ARALIKLI TEKRAR ---- */
  var rep = $("[data-tool='tekrar']");
  if (rep) {
    var konu = $("[name='konu']", rep), tarih = $("[name='tarih']", rep), list = $(".rep-out", rep), repOut = $("[data-copied]", rep);
    var STEPS = [[1, "Ertesi gün"], [3, "3 gün sonra"], [7, "1 hafta sonra"], [14, "2 hafta sonra"], [30, "1 ay sonra"]];
    var iso = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
    var fmtD = function (d) { try { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" }).format(d); } catch (e) { return d.toDateString(); } };
    if (!tarih.value) tarih.value = iso(new Date());
    var lines = [];
    var calc = function () {
      var p = (tarih.value || iso(new Date())).split("-"), base = new Date(+p[0], +p[1] - 1, +p[2]);
      list.innerHTML = ""; lines = ["Konu: " + (konu.value.trim() || "(konu adı)"), "İlk çalışma: " + fmtD(base)];
      STEPS.forEach(function (s) {
        var d = new Date(base.getTime()); d.setDate(d.getDate() + s[0]);
        var li = document.createElement("li"), b = document.createElement("b"), sp = document.createElement("span");
        b.textContent = s[1]; sp.textContent = fmtD(d); li.appendChild(b); li.appendChild(sp); list.appendChild(li);
        lines.push(s[1] + ": " + fmtD(d));
      });
    };
    konu.addEventListener("input", calc); tarih.addEventListener("change", calc); tarih.addEventListener("input", calc);
    $("[data-copy-rep]", rep).addEventListener("click", function () { calc(); copyText(lines.join("\n"), repOut); });
    calc();
  }

  /* ---- VELİ: KAYIT ÖNCESİ SORU LİSTESİ ---- */
  var vs = $("[data-tool='veli-sorular']");
  if (vs) {
    var vMsg = $("[data-msg]", vs), vWa = $("[data-wa-send]", vs), vOut = $("[data-copied]", vs);
    var vCompose = function () {
      var qs = $$("input[name='soru']:checked", vs).map(function (x) { return x.value; });
      var sinif = ($("[name='sinif']", vs).value || "").trim();
      var L = ["Merhaba Yasin Hoca Akademi,"];
      L.push(sinif ? "Çocuğum " + sinif + " öğrencisi. Kayıt öncesinde birkaç konuda bilgi almak istiyorum:" : "Kayıt öncesinde birkaç konuda bilgi almak istiyorum:");
      if (qs.length) qs.forEach(function (q, i) { L.push((i + 1) + ". " + q); });
      else L.push("(Listeden soru seçtiğinizde burada görünecek.)");
      L.push(""); L.push("Uygun olduğunuzda dönüş yaparsanız sevinirim. Teşekkürler.");
      var m = L.join("\n"); vMsg.textContent = m; vWa.href = waLink(m); return m;
    };
    vs.addEventListener("change", vCompose); vs.addEventListener("input", vCompose);
    $("[data-copy-msg]", vs).addEventListener("click", function () { copyText(vCompose(), vOut); });
    vCompose();
  }

  /* ---- adres kopyala ---- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), $(b.getAttribute("data-out")) || null); });
  });
})();
