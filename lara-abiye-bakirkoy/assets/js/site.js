/* Lara Abiye — site betiği (çatısız, bağımlılıksız) */
(function () {
  "use strict";

  var WA = "https://wa.me/905453401713";
  var TEL = "tel:+905453401713";
  var HOURS = { "0": [["10:00", "20:00"]], "1": [["10:00", "20:00"]], "2": [["10:00", "20:00"]], "3": [["10:00", "20:00"]], "4": [["10:00", "20:00"]], "5": [["10:00", "20:00"]], "6": [["11:00", "20:00"]] };
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE = "laraOlcu";

  /* ---- kit/status.js'ten kopya: açık/kapalı ---- */
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
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function load() { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) { return null; } }
  function save(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) { /* sessiz */ } }
  function num(v) { var n = parseFloat(String(v || "").replace(",", ".")); return isFinite(n) && n > 0 ? Math.round(n) : null; }
  function checked(root, name) { return $$('input[name="' + name + '"]:checked', root).map(function (i) { return i.value; }); }
  function flash(btn, text) {
    var old = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", old); btn.textContent = text;
    setTimeout(function () { btn.textContent = old; }, 2200);
  }
  function copyText(text, btn) {
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", "");
      t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(t); flash(btn, ok ? "Kopyalandı" : "Kopyalanamadı");
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { flash(btn, "Kopyalandı"); }, fallback);
    } else fallback();
  }
  function bindOut(root, getMsg, validate) {
    var send = $("[data-send]", root), copy = $("[data-copy]", root);
    if (send) send.addEventListener("click", function (e) {
      if (validate && !validate()) { e.preventDefault(); return; }
      send.href = waLink(getMsg());
    });
    if (copy) copy.addEventListener("click", function () { if (validate && !validate()) return; copyText(getMsg(), copy); });
  }

  /* Genel referans beden tablosu (cm). Marka tablosu değildir. */
  var SIZES = [
    { s: "36", g: [84, 87], b: [66, 69], h: [92, 95] },
    { s: "38", g: [88, 91], b: [70, 73], h: [96, 99] },
    { s: "40", g: [92, 95], b: [74, 77], h: [100, 103] },
    { s: "42", g: [96, 99], b: [78, 81], h: [104, 107] },
    { s: "44", g: [100, 103], b: [82, 85], h: [108, 111] },
    { s: "46", g: [104, 108], b: [86, 90], h: [112, 116] },
    { s: "48", g: [109, 113], b: [91, 95], h: [117, 121] },
    { s: "50", g: [114, 118], b: [96, 100], h: [122, 126] },
    { s: "52", g: [119, 123], b: [101, 105], h: [127, 131] },
    { s: "54", g: [124, 128], b: [106, 110], h: [132, 136] },
    { s: "56", g: [129, 133], b: [111, 115], h: [137, 141] }
  ];
  function sizeFor(v, key) {
    if (!v) return null;
    if (v < SIZES[0][key][0] - 3) return { i: -1, label: "tablonun altında" };
    for (var i = 0; i < SIZES.length; i++) if (v <= SIZES[i][key][1]) return { i: i, label: SIZES[i].s };
    return { i: SIZES.length, label: "tablonun üstünde" };
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStatus();
    initNav();
    initVeil();
    $$("[data-accordion]").forEach(initAccordion);
    var t;
    if ((t = $('[data-tool="oneri"]'))) initOneri(t);
    if ((t = $('[data-tool="kod"]'))) initKod(t);
    if ((t = $('[data-tool="kesim"]'))) initKesim(t);
    if ((t = $('[data-tool="olcu"]'))) initOlcu(t);
    if ((t = $('[data-tool="mesaj"]'))) initMesaj(t);
    if ((t = $("[data-figure]"))) initFigure(t);
    if ((t = $("[data-tones]"))) initTones(t);
    if ((t = $("[data-checklist]"))) initChecklist(t);
  });

  /* ---- canlı durum + bugünün saati ---- */
  function initStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    var today = (HOURS[String(s.dayIndex)] || [])[0];
    $$("[data-today]").forEach(function (el) { el.textContent = today ? today[0] + "–" + today[1] : "Kapalı"; });
    $$("[data-day]").forEach(function (row) { row.classList.toggle("is-today", row.getAttribute("data-day") === String(s.dayIndex)); });
  }

  /* ---- telefon menüsü ---- */
  function initNav() {
    var btn = $("[data-menu]"), dr = $("#menu"), close = dr && $("[data-close]", dr);
    if (!btn || !dr) return;
    function setOpen(o) {
      dr.classList.toggle("is-open", o);
      btn.setAttribute("aria-expanded", o ? "true" : "false");
      document.body.style.overflow = o ? "hidden" : "";
      if (o) setTimeout(function () { close.focus(); }, 60); else btn.focus();
    }
    btn.addEventListener("click", function () { setOpen(true); });
    close.addEventListener("click", function () { setOpen(false); });
    dr.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        var f = $$("a,button", dr), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$("a", dr).forEach(function (a) { a.addEventListener("click", function () { if (a.getAttribute("href").charAt(0) === "#") setOpen(false); }); });
  }

  /* ---- ipek perde: sayfalar arası geçiş ---- */
  function initVeil() {
    var v = $(".veil");
    if (!v || RM) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
      var h = a.getAttribute("href");
      if (!/^[a-z0-9-]+\.html/i.test(h)) return;
      var here = location.pathname.split("/").pop() || "index.html";
      if (h.split("#")[0].split("?")[0] === here) return;
      e.preventDefault();
      v.classList.add("is-down");
      setTimeout(function () { location.href = h; }, 430);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) v.classList.remove("is-down"); });
  }

  /* ---- dikey akordeon (hero + lookbook şeritleri) ---- */
  function initAccordion(root) {
    var panels = $$("[data-panel]", root);
    if (!panels.length) return;
    var auto = parseInt(root.getAttribute("data-auto") || "0", 10);
    var cur = Math.max(0, panels.findIndex(function (p) { return p.classList.contains("is-active"); }));
    var timer = null, stopped = false, visible = true, hoverT = null;
    var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    root.style.setProperty("--auto", auto + "ms");

    function runBar() {
      var bar = $(".gala__bar", panels[cur]);
      $$(".gala__bar", root).forEach(function (b) { b.classList.remove("run"); });
      if (bar && timer) { void bar.offsetWidth; bar.classList.add("run"); }
    }
    function fit() {
      /* telefonda dikey şeritler: açık şeridin yüksekliği içeriğe göre */
      var p = panels[cur], body = p && $("[data-body]", p);
      if (body && p.classList.contains("strip")) p.style.setProperty("--h", Math.max(360, 74 + body.offsetHeight + 6) + "px");
    }
    function set(i, user) {
      if (user) stop();
      if (i === cur) return;
      cur = i;
      panels.forEach(function (p, k) {
        var on = k === i, tab = $("[data-tab]", p);
        p.classList.toggle("is-active", on);
        if (tab) tab.setAttribute("aria-expanded", on ? "true" : "false");
        if (on && !RM) { p.classList.remove("is-sheen"); void p.offsetWidth; p.classList.add("is-sheen"); }
      });
      fit();
      runBar();
    }
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if (location.hash) panels.forEach(function (p, i) {
      if (p.id !== location.hash.slice(1)) return;
      cur = -1; set(i, true);
      setTimeout(function () { p.scrollIntoView({ block: "start" }); }, RM ? 0 : 1000);
    });
    function start() {
      if (!auto || RM || stopped || timer || !visible) return;
      timer = setInterval(function () { set((cur + 1) % panels.length, false); }, auto);
      root.classList.add("is-auto"); runBar();
    }
    function pause() { if (timer) { clearInterval(timer); timer = null; } runBar(); }
    function stop() { stopped = true; pause(); root.classList.remove("is-auto"); }

    panels.forEach(function (p, i) {
      var tab = $("[data-tab]", p);
      if (tab) {
        tab.addEventListener("click", function () { set(i, true); });
        tab.addEventListener("keydown", function (e) {
          var k = e.key, n = null;
          if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % panels.length;
          if (k === "ArrowLeft" || k === "ArrowUp") n = (i - 1 + panels.length) % panels.length;
          if (n !== null) { e.preventDefault(); set(n, true); $("[data-tab]", panels[n]).focus(); }
        });
      }
      if (fine) {
        p.addEventListener("mouseenter", function () { clearTimeout(hoverT); hoverT = setTimeout(function () { set(i, true); }, 90); });
        p.addEventListener("mouseleave", function () { clearTimeout(hoverT); });
      }
    });
    root.addEventListener("focusin", function () { stop(); });
    root.addEventListener("touchstart", function () { stop(); }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) start(); else pause();
      }, { threshold: .35 }).observe(root);
    }
    start();

    /* panel içindeki "öneri iste" bağlantıları etkinliği seçer */
    $$("[data-etkinlik]", root).forEach(function (a) {
      a.addEventListener("click", function () { pickEvent(a.getAttribute("data-etkinlik")); });
    });
  }

  function pickEvent(val) {
    var tool = $('[data-tool="oneri"]');
    if (!tool || !val) return;
    $$('input[name="etkinlik"]', tool).forEach(function (r) { r.checked = r.value === val; r.dispatchEvent(new Event("change", { bubbles: true })); });
  }

  /* ---- İMZA: Davetim için öneri iste ---- */
  function initOneri(root) {
    var form = $("form", root), out = $("[data-out]", root), days = $("[data-days]", root);
    var date = $("#o-tarih", root), noDate = $("#o-tarihyok", root), more = $("details", root);
    var sizeNote = $("[data-sizenote]", root), err = $("[data-err]", root), loaded = $("[data-loaded]", root);
    var todayISO = (function () {
      try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
      catch (e) { return new Date().toISOString().slice(0, 10); }
    })();
    date.min = todayISO;

    // URL'den etkinlik (ör. koleksiyon sayfasından gelen bağlantı)
    try {
      var q = new URLSearchParams(location.search).get("etkinlik");
      if (q) pickEvent(q);
    } catch (e) { /* eski tarayıcı */ }

    // Beden rehberinde kaydedilen ölçüler
    var st = load();
    if (st && (st.gogus || st.bel || st.basen)) {
      [["gogus", "#o-gogus"], ["bel", "#o-bel"], ["basen", "#o-basen"], ["boy", "#o-boy"]].forEach(function (p) {
        var el = $(p[1], root); if (el && !el.value && st[p[0]]) el.value = st[p[0]];
      });
      if (more) more.open = true;
      if (loaded) loaded.textContent = "Beden rehberinde girdiğiniz ölçüler forma eklendi.";
    }

    function dayDiff() {
      if (!date.value || noDate.checked) return null;
      var a = Date.UTC.apply(null, todayISO.split("-").map(function (x, i) { return i === 1 ? x - 1 : +x; }));
      var p = date.value.split("-");
      var b = Date.UTC(+p[0], p[1] - 1, +p[2]);
      return Math.round((b - a) / 864e5);
    }
    function nice(iso) {
      var p = iso.split("-");
      var d = new Date(Date.UTC(+p[0], p[1] - 1, +p[2], 12));
      try { return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" }); }
      catch (e) { return iso; }
    }
    function msg() {
      var ev = checked(form, "etkinlik")[0];
      var lines = ["Merhaba Lara Abiye, davetim için öneri almak istiyorum."];
      lines.push("Etkinlik: " + (ev || "(seçilmedi)"));
      if (noDate.checked) lines.push("Tarih: henüz belli değil");
      else if (date.value) {
        var d = dayDiff();
        lines.push("Tarih: " + nice(date.value) + (d !== null && d >= 0 ? (d === 0 ? " (bugün)" : " (" + d + " gün var)") : ""));
      }
      var beden = $("#o-beden", root).value.trim();
      if (beden) lines.push("Beden: " + beden);
      var m = [];
      [["Göğüs", "#o-gogus"], ["Bel", "#o-bel"], ["Basen", "#o-basen"], ["Boy", "#o-boy"]].forEach(function (p) {
        var v = num($(p[1], root).value); if (v) m.push(p[0].toLowerCase() + " " + v + " cm");
      });
      if (m.length) lines.push("Ölçüler: " + m.join(", "));
      var renk = checked(form, "renk"); if (renk.length) lines.push("Renk: " + renk.join(", "));
      var boy = checked(form, "uzunluk")[0]; if (boy) lines.push("Elbise boyu: " + boy);
      var kol = checked(form, "kol")[0]; if (kol) lines.push("Kol / yaka: " + kol);
      var not = $("#o-not", root).value.trim(); if (not) lines.push("Not: " + not);
      var ad = $("#o-ad", root).value.trim(); if (ad) lines.push("Adım: " + ad);
      lines.push("Uygun modelleri ve beden durumunu öğrenebilir miyim?");
      return lines.join("\n");
    }
    function update() {
      date.disabled = noDate.checked;
      var d = dayDiff();
      if (d === null) days.textContent = "";
      else if (d < 0) days.textContent = "Seçtiğiniz tarih geçmiş görünüyor.";
      else if (d === 0) days.textContent = "Davetiniz bugün: en hızlısı aramak.";
      else if (d < 7) days.textContent = "Davetinize " + d + " gün var. Zaman dar; ölçülerinizi mesaja ekleyin, gerekirse arayın.";
      else if (d < 21) days.textContent = "Davetinize " + d + " gün var. Prova için güzel bir aralık.";
      else days.textContent = "Davetinize " + d + " gün var. Erken bakmak, renk ve modelleri rahatça görmenizi sağlar.";
      var g = sizeFor(num($("#o-gogus", root).value), "g"), b = sizeFor(num($("#o-bel", root).value), "b"), h = sizeFor(num($("#o-basen", root).value), "h");
      var parts = [];
      if (g) parts.push("göğüs " + g.label); if (b) parts.push("bel " + b.label); if (h) parts.push("basen " + h.label);
      sizeNote.textContent = parts.length ? "Genel tabloya göre yakın beden: " + parts.join(" · ") + ". Bu genel bir referanstır; kalıba göre değişir, kesin bedeni mağazaya sorun." : "";
      if (checked(form, "etkinlik").length) err.textContent = "";
      out.textContent = msg();
      $("[data-send]", root).href = waLink(out.textContent);
    }
    function valid() {
      if (checked(form, "etkinlik").length) return true;
      err.textContent = "Önce etkinliği seçin: hangi davet için arıyorsunuz?";
      var first = $('input[name="etkinlik"]', form); if (first) first.focus();
      return false;
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    bindOut(root, msg, valid);
    update();
  }

  /* ---- Kıyafet kodu çözücü (koleksiyon) ---- */
  function initKod(root) {
    var cards = $$("[data-kod]", root);
    function show() {
      var v = (checked(root, "kod")[0]) || cards[0].getAttribute("data-kod");
      cards.forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-kod") === v); });
    }
    root.addEventListener("change", show);
    show();
  }

  /* ---- Renk denemesi (koleksiyon) ---- */
  function initTones(root) {
    var btns = $$("[data-tone]", root), gown = $("[data-gown]", root), info = $$("[data-tone-info]", root);
    function pick(b) {
      var k = b.getAttribute("data-tone");
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      gown.style.setProperty("--gf", "url(#sp-" + k + ")");
      info.forEach(function (i) { i.hidden = i.getAttribute("data-tone-info") !== k; });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { pick(b); }); });
    pick($('[data-tone][aria-pressed="true"]', root) || btns[0]);
  }

  /* ---- Kesim bulucu (büyük beden) ---- */
  var KESIM = {
    bel: { uzun: "Bel oturtmalı A kesim bel çizgisini gösterir.", kruvaze: "Kruvaze bağlama beli nazikçe işaretler.", empire: "Göğüs altı dikiş, belin en ince yerini vurgular." },
    kol: { kaftan: "Uzun, rahat kollar.", kruvaze: "Uzun kollu kruvaze modeller yaygındır.", pelerin: "Şifon pelerin kolları hafifçe örter." },
    hareket: { uzun: "Etek bolluğu adımı serbest bırakır.", empire: "Göğüs altından açılan etek rahat hareket ettirir.", kaftan: "Dökümlü form oturup kalkarken sıkmaz.", midi: "Midi boy dansta eteğe basmayı önler." },
    boy: { tekomuz: "Tek renk, düz sütun boyu uzun gösterir.", pelerin: "Dikey dökülen pelerin boy çizgisini uzatır.", uzun: "Yere kadar tek parça etek boyu uzatır." },
    destek: { kruvaze: "Kruvaze yaka göğüs hattını toplar.", empire: "Göğüs altı dikiş destek hissi verir.", tekomuz: "Geniş tek omuz askısı göğüsü taşır." },
    basen: { uzun: "A kesim basenden itibaren açılır.", empire: "Etek göğüs altından serbest düşer.", kaftan: "Basen hattına yapışmaz." },
    hafif: { empire: "Şifon empire kesim uçuşan bir etki verir.", pelerin: "Tül ya da şifon pelerin hafiflik katar.", kaftan: "Akışkan kumaşla rahat bir döküm." },
    parilti: { tekomuz: "Payetli sütun modeller gece ışığında parlar.", balik: "Payetli balık kesim tam bir gece seçimi.", pelerin: "Taş işli pelerin detay katar." }
  };
  var KNAME = { uzun: "A kesim uzun", empire: "Empire bel", kruvaze: "Kruvaze", kaftan: "Dökümlü kaftan", pelerin: "Pelerinli sütun", tekomuz: "Tek omuz sütun", balik: "Balık kesim", midi: "Midi A kesim" };
  var WNAME = { bel: "bel çizgisi belirgin", kol: "kollar kapalı", hareket: "rahat hareket", boy: "boy uzun görünsün", destek: "göğüs hattında destek", basen: "basen hattı serbest", hafif: "hafif, uçuşan kumaş", parilti: "gece parıltısı" };
  function initKesim(root) {
    var form = $("form", root), out = $("[data-out]", root), list = $("[data-list]", root), rail = $("[data-rail]");
    function score() {
      var w = checked(form, "istek"), sc = {}, why = {};
      w.forEach(function (k) {
        Object.keys(KESIM[k] || {}).forEach(function (s) { sc[s] = (sc[s] || 0) + 1; (why[s] = why[s] || []).push(KESIM[k][s]); });
      });
      var top = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; }).slice(0, 3);
      return { w: w, top: top, why: why };
    }
    function msg() {
      var r = score(), beden = $("#k-beden", root).value.trim();
      var lines = ["Merhaba Lara Abiye, büyük beden abiye bakıyorum."];
      if (r.w.length) lines.push("İsteklerim: " + r.w.map(function (k) { return WNAME[k]; }).join(", "));
      if (r.top.length) lines.push("İlgimi çeken kesimler: " + r.top.map(function (s) { return KNAME[s]; }).join(", "));
      if (beden) lines.push("Beden / ölçü: " + beden);
      lines.push("Bu kesimlerde uygun modelleriniz var mı?");
      return lines.join("\n");
    }
    function update() {
      var r = score();
      list.innerHTML = "";
      if (!r.top.length) {
        list.innerHTML = '<li><b>Henüz seçim yok</b>Bir ya da birkaç istek işaretleyin; uygun kesimler burada sıralanır.</li>';
      } else r.top.forEach(function (s) {
        var li = document.createElement("li"), b = document.createElement("b");
        b.textContent = KNAME[s]; li.appendChild(b); li.appendChild(document.createTextNode(r.why[s].join(" ")));
        list.appendChild(li);
      });
      if (rail) {
        rail.classList.toggle("is-filtered", r.top.length > 0);
        $$("[data-look]", rail).forEach(function (l) { l.classList.toggle("is-match", r.top.indexOf(l.getAttribute("data-look")) > -1); });
      }
      out.textContent = msg();
      $("[data-send]", root).href = waLink(out.textContent);
    }
    form.addEventListener("change", update);
    form.addEventListener("input", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    bindOut(root, msg);
    update();
  }

  /* ---- Ölçü defteri (beden rehberi) ---- */
  function initOlcu(root) {
    var form = $("form", root), out = $("[data-out]", root), big = $("[data-big]", root), tip = $("[data-tip]", root), heel = $("[data-heel]", root);
    var tbl = $("#tablo");
    var st = load();
    if (st) [["gogus", "#m-gogus"], ["bel", "#m-bel"], ["basen", "#m-basen"], ["boy", "#m-boy"], ["belyer", "#m-belyer"], ["topuk", "#m-topuk"]].forEach(function (p) {
      var el = $(p[1], root); if (el && st[p[0]]) el.value = st[p[0]];
    });
    function vals() {
      return { gogus: num($("#m-gogus", root).value), bel: num($("#m-bel", root).value), basen: num($("#m-basen", root).value), boy: num($("#m-boy", root).value), belyer: num($("#m-belyer", root).value), topuk: num($("#m-topuk", root).value) };
    }
    function msg() {
      var v = vals(), m = [];
      if (v.gogus) m.push("göğüs " + v.gogus + " cm"); if (v.bel) m.push("bel " + v.bel + " cm"); if (v.basen) m.push("basen " + v.basen + " cm");
      if (v.boy) m.push("boy " + v.boy + " cm"); if (v.belyer) m.push("bel–yer " + v.belyer + " cm" + (v.topuk ? " (+" + v.topuk + " cm topuk)" : ""));
      return "Merhaba Lara Abiye, ölçülerimi iletiyorum: " + (m.length ? m.join(", ") : "(ölçü girilmedi)") + ". Bu ölçülere uygun abiye modellerini ve bedeni öğrenebilir miyim?";
    }
    function update() {
      var v = vals();
      var g = sizeFor(v.gogus, "g"), b = sizeFor(v.bel, "b"), h = sizeFor(v.basen, "h");
      if (tbl) {
        $$("td.hit", tbl).forEach(function (c) { c.classList.remove("hit"); });
        $$("tr.row-hit", tbl).forEach(function (c) { c.classList.remove("row-hit"); });
        [[g, 1], [b, 2], [h, 3]].forEach(function (p) {
          if (!p[0] || p[0].i < 0 || p[0].i >= SIZES.length) return;
          var row = $$("tbody tr", tbl)[p[0].i]; if (!row) return;
          row.classList.add("row-hit"); row.children[p[1]].classList.add("hit");
        });
      }
      var parts = [];
      if (g) parts.push("Göğüs: " + g.label); if (b) parts.push("Bel: " + b.label); if (h) parts.push("Basen: " + h.label);
      big.textContent = parts.length ? parts.join(" · ") : "Ölçülerinizi girin, tablo kendiliğinden işaretlensin.";
      var labels = [g, b, h].filter(Boolean).map(function (x) { return x.label; });
      var uniq = labels.filter(function (x, i) { return labels.indexOf(x) === i; });
      if (!labels.length) tip.textContent = "Mezurayla aldığınız ölçüleri santimetre olarak yazın. Bilgiler yalnız bu cihazda tutulur.";
      else if (uniq.length > 1) tip.textContent = "Ölçülerinizin farklı bedenlere denk gelmesi çok olağandır. Abiyede genellikle en geniş ölçünüz belirleyicidir; kalıba göre değiştiği için iki bedeni provada karşılaştırın ve mağazaya ölçülerinizi iletin.";
      else tip.textContent = "Ölçüleriniz genel tabloda aynı satıra denk geliyor. Yine de kalıp ve kumaş esnekliği değişir; kesin beden için mağazaya sorun.";
      if (v.belyer) heel.textContent = "Uzun abiyede etek boyu: topuksuz " + v.belyer + " cm" + (v.topuk ? ", " + v.topuk + " cm topukla yaklaşık " + (v.belyer + v.topuk) + " cm." : ". Topuk yüksekliğini de yazarsanız ekleyelim.");
      else heel.textContent = "";
      save(v);
      out.textContent = msg();
      $("[data-send]", root).href = waLink(out.textContent);
    }
    form.addEventListener("input", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    var clear = $("[data-clear]", root);
    if (clear) clear.addEventListener("click", function () { $$("input", form).forEach(function (i) { i.value = ""; }); try { localStorage.removeItem(STORE); } catch (e) { /* sessiz */ } update(); });
    bindOut(root, msg);
    update();
  }

  /* ---- Terzi mankeni: ölçü noktaları ---- */
  function initFigure(root) {
    var btns = $$("[data-m]", root), info = $$("[data-m-info]", root), fig = $("[data-fig]", root);
    function set(k) {
      fig.setAttribute("data-active", k);
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-m") === k ? "true" : "false"); });
      info.forEach(function (i) { i.classList.toggle("is-on", i.getAttribute("data-m-info") === k); });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { set(b.getAttribute("data-m")); }); });
    set(btns[0].getAttribute("data-m"));
  }

  /* ---- Prova hareket testi ---- */
  function initChecklist(root) {
    var boxes = $$("input[type=checkbox]", root), fill = $(".meter__fill", root), txt = $("[data-count]", root), reset = $("[data-reset]", root);
    function upd() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      fill.style.transform = "scaleX(" + (n / boxes.length) + ")";
      txt.textContent = n === boxes.length ? "Hepsi tamam: elbise davet gecesine hazır görünüyor." : n + " / " + boxes.length + " hareket denendi";
    }
    boxes.forEach(function (b) { b.addEventListener("change", upd); });
    if (reset) reset.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  /* ---- İletişim: hızlı mesaj ---- */
  function initMesaj(root) {
    var form = $("form", root), out = $("[data-out]", root);
    var T = {
      stok: "Bir model için beden ve stok bilgisi almak istiyorum.",
      gelis: "Mağazaya gelmeyi düşünüyorum, uygun olduğunuz saati öğrenebilir miyim?",
      ayirt: "Beğendiğim bir ürünü ayırtmak mümkün mü, öğrenmek istiyorum.",
      degisim: "Değişim koşullarınızı öğrenmek istiyorum.",
      insta: "Instagram hesabınızdaki (@laraabiyeonline) bir ürünü soracağım; ekran görüntüsünü bu mesajın ardından gönderiyorum."
    };
    function msg() {
      var k = checked(form, "konu")[0] || "stok";
      var lines = ["Merhaba Lara Abiye, " + T[k].charAt(0).toLowerCase() + T[k].slice(1)];
      var u = $("#h-urun", root).value.trim(); if (u) lines.push("Ürün / not: " + u);
      var g = $("#h-gun", root).value.trim(); if (g) lines.push("Gelmeyi düşündüğüm gün: " + g);
      var ad = $("#h-ad", root).value.trim(); if (ad) lines.push("Adım: " + ad);
      return lines.join("\n");
    }
    function update() { out.textContent = msg(); $("[data-send]", root).href = waLink(out.textContent); }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    bindOut(root, msg);
    update();
  }
})();
