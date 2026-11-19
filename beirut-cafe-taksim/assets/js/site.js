/* Beirut Cafe Taksim — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var HOURS = { "0": [["08:00", "00:30"]], "1": [["08:00", "00:30"]], "2": [["08:00", "00:30"]], "3": [["08:00", "00:30"]], "4": [["08:00", "00:30"]], "5": [["08:00", "00:30"]], "6": [["08:00", "00:30"]] };
  var WA = "https://wa.me/905456824036";
  var BRAND = "Beirut Cafe Taksim";
  var OPEN = 480, CLOSE = 1470; /* 08:00 – 00:30 (ertesi gün) dakika olarak */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- açık/kapalı (kit/status.js'ten) ---------- */
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

  /* ---------- yardımcılar ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hhmm(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* işletme saatine göre "gün içi dakika": gece yarısından sonraki 00:00–00:30 → 1440–1470 */
  function dayMinute(m) { return m < 30 ? m + 1440 : m; }
  function span(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, out = [];
    if (h) out.push(h + " saat");
    if (m || !h) out.push(m + " dakika");
    return out.join(" ");
  }
  function copyText(text, btn) {
    function done(ok) {
      var lab = btn && (btn.querySelector("span") || btn);
      if (!lab) return;
      var old = lab.getAttribute("data-old") || lab.textContent;
      lab.setAttribute("data-old", old);
      lab.textContent = ok ? "Kopyalandı" : "Kopyalanamadı, elle seçin";
      setTimeout(function () { lab.textContent = old; }, 2200);
    }
    function legacy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy"); document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    else legacy();
  }

  /* ---------- gök rengi: saate göre pencere ---------- */
  var SKY = [[480, "#7FBFC9", "#F7E2B8"], [720, "#4FA9BE", "#CDE9E4"], [960, "#5AA6BC", "#F3DDAE"], [1110, "#3A6E8C", "#F0A56B"], [1170, "#1F4A63", "#D9705A"], [1260, "#0B2E33", "#1B4C57"], [1470, "#06181D", "#123B44"]];
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(x[i] + (y[i] - x[i]) * t); }).join(",") + ")"; }
  function skyAt(t) {
    t = clamp(t, OPEN, CLOSE);
    var i = 0; while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++;
    var a = SKY[i], b = SKY[i + 1], f = (t - a[0]) / (b[0] - a[0]);
    var night = clamp((t - 1110) / 150, 0, 1), moon = t >= 1170, x, y;
    if (!moon) { var p = (t - OPEN) / (1170 - OPEN); x = 10 + 80 * p; y = 62 - 46 * Math.sin(Math.PI * p); }
    else { var q = (t - 1170) / (CLOSE - 1170); x = 20 + 48 * q; y = 52 - 34 * Math.sin(Math.PI * q / 2); }
    return { a: mix(a[1], b[1], f), b: mix(a[2], b[2], f), night: night, sil: mix("#2A7A80", "#05161A", clamp((t - 960) / 300, 0, 1)), moon: moon, x: x, y: y };
  }
  function paintSky(el, t) {
    var s = skyAt(t), st = el.style;
    st.setProperty("--sky-a", s.a); st.setProperty("--sky-b", s.b); st.setProperty("--sil", s.sil);
    st.setProperty("--night-f", s.night.toFixed(2)); st.setProperty("--orb-x", s.x.toFixed(1) + "%"); st.setProperty("--orb-y", s.y.toFixed(1) + "%");
    el.classList.toggle("is-night", s.moon);
  }
  function liveSkyMinute() {
    var n = istanbulNow(), s = openStatus(HOURS);
    return s.open ? dayMinute(n.m) : CLOSE; /* kapalıyken gece */
  }

  /* ---------- durum, saat kemeri, bugünün satırı ---------- */
  function paintStatus() {
    var s = openStatus(HOURS), n = istanbulNow(), dm = dayMinute(n.m);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text; el.classList.toggle("is-open", s.open); el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-status-short]").forEach(function (el) { el.textContent = s.open ? "Şu an açığız" : "Şu an kapalıyız"; });
    var rem = s.open ? "Kapanışa " + span(CLOSE - dm) + " var" : "Açılışa " + span(((OPEN - n.m) + 1440) % 1440) + " var";
    $$("[data-remaining]").forEach(function (el) { el.textContent = rem; });
    $$("[data-hours] tr").forEach(function (tr) {
      /* 00:00–00:30 arası hâlâ dünün vardiyasıdır */
      var today = (s.open && n.m < 30) ? (s.dayIndex + 6) % 7 : s.dayIndex;
      tr.classList.toggle("is-today", String(today) === tr.getAttribute("data-day"));
    });
    $$("[data-dial]").forEach(function (d) {
      d.classList.toggle("is-closed", !s.open);
      if (!s.open) return;
      var f = (dm - OPEN) / (CLOSE - OPEN), th = Math.PI * (1 - f), x = 160 + 140 * Math.cos(th), y = 176 - 140 * Math.sin(th);
      var now = $(".dial__now", d), done = $(".dial__done", d);
      now.setAttribute("cx", x.toFixed(1)); now.setAttribute("cy", y.toFixed(1));
      done.setAttribute("d", "M20 176A140 140 0 0 1 " + x.toFixed(1) + " " + y.toFixed(1));
    });
    return s;
  }
  function buildDials() {
    var NS = "http://www.w3.org/2000/svg";
    $$("[data-dial]").forEach(function (d) {
      var g = $(".dial__ticks", d); if (!g || g.childNodes.length) return;
      for (var t = 540; t <= 1440; t += 60) {
        var f = (t - OPEN) / (CLOSE - OPEN), th = Math.PI * (1 - f), c = Math.cos(th), s = Math.sin(th), big = t % 240 === 0;
        var l = document.createElementNS(NS, "line"), r1 = big ? 118 : 124, r2 = 131;
        l.setAttribute("x1", (160 + r1 * c).toFixed(1)); l.setAttribute("y1", (176 - r1 * s).toFixed(1));
        l.setAttribute("x2", (160 + r2 * c).toFixed(1)); l.setAttribute("y2", (176 - r2 * s).toFixed(1));
        l.setAttribute("class", "dial__tick"); g.appendChild(l);
        if (big && t < 1440) {
          var tx = document.createElementNS(NS, "text");
          tx.setAttribute("x", (160 + 104 * c).toFixed(1)); tx.setAttribute("y", (176 - 104 * s + 4).toFixed(1));
          tx.setAttribute("text-anchor", "middle"); tx.textContent = hhmm(t); g.appendChild(tx);
        }
      }
    });
  }

  /* ---------- gezinme ---------- */
  function initNav() {
    var btn = $(".navbtn"), nav = $("#nav"), x = $(".nav__x");
    if (!btn || !nav) return;
    function set(open) {
      nav.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (open && x) x.focus(); else if (!open && document.activeElement && nav.contains(document.activeElement)) btn.focus();
    }
    btn.addEventListener("click", function () { set(true); });
    if (x) x.addEventListener("click", function () { set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) set(false); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  }

  /* ---------- hero: karolar + gün çubuğu ---------- */
  function initTiles() {
    var host = $("[data-tiles]"); if (!host) return;
    var grid = document.createElement("div"); grid.className = "tilegrid";
    var COLS = 4, ROWS = 11, tiles = [];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var t = document.createElement("div");
      var k = ((r + c) % 2 === 0) ? 1 : 2;
      if (r % 4 === 2 && c % 2 === 1) k = 3;
      if (r % 4 === 0 && c % 4 === 2) k = 4;
      t.className = "tile t" + k; t.setAttribute("data-k", k); t.style.setProperty("--i", r + c);
      grid.appendChild(t); tiles.push(t);
    }
    host.appendChild(grid);
    function flip(t, k) {
      if (t.classList.contains("flip")) return;
      k = k || (parseInt(t.getAttribute("data-k"), 10) % 4) + 1;
      if (REDUCED) { t.className = "tile t" + k; t.setAttribute("data-k", k); t.style.animation = "none"; return; }
      t.style.animationDelay = "0s"; t.classList.add("flip");
      setTimeout(function () { t.className = "tile flip t" + k; t.setAttribute("data-k", k); }, 250);
      setTimeout(function () { t.classList.remove("flip"); t.style.animation = "none"; }, 520);
    }
    grid.addEventListener("click", function (e) {
      var t = e.target; if (!t.classList || !t.classList.contains("tile")) return;
      var i = tiles.indexOf(t), k = (parseInt(t.getAttribute("data-k"), 10) % 4) + 1;
      flip(t, k);
      /* komşulara dalga */
      [i - 1, i + 1, i - COLS, i + COLS].forEach(function (j, n) {
        if (j < 0 || j >= tiles.length) return;
        if ((n === 0 && i % COLS === 0) || (n === 1 && i % COLS === COLS - 1)) return;
        setTimeout(function () { flip(tiles[j], k); }, 110);
      });
    });
    if (!REDUCED) setInterval(function () {
      if (document.hidden) return;
      flip(tiles[Math.floor(Math.random() * 28)]);
    }, 2800);
  }
  function initDaybar() {
    var bar = $("[data-daybar]"), arcade = $("[data-arcade]"); if (!bar || !arcade) return;
    var range = $("input[type=range]", bar), out = $("output", bar), say = $(".daybar__say", bar), nowBtn = $(".daybar__now", bar), live = true;
    function phrase(t) {
      if (t < 660) return "Sabah. Güne ilk fincanla başlamak isteyenlerin saati.";
      if (t < 840) return "Öğle. İki iş arasında kısa, sıcak bir mola.";
      if (t < 1020) return "Öğleden sonra. Çayın yanına bir dilim tatlı yakışır.";
      if (t < 1170) return "Akşamüstü. İstiklal dönüşü buluşmaların saati.";
      if (t < 1350) return "Akşam. Sohbet uzar, fincanlar tazelenir.";
      return "Gece yarısına doğru. Günün son fincanı için hâlâ vakit var.";
    }
    function paint() {
      var s = openStatus(HOURS), n = istanbulNow(), t;
      if (live) {
        t = s.open ? dayMinute(n.m) : CLOSE;
        range.value = Math.round(t / 15) * 15;
        out.textContent = hhmm(n.m);
        say.textContent = s.open ? "Şu an. " + phrase(t) : "Şu an kapalıyız. Pencerenin ışığı sabah 08:00'de yeniden yanar; kaydırıp günü gezebilirsiniz.";
      } else {
        t = parseInt(range.value, 10);
        out.textContent = hhmm(t);
        say.textContent = phrase(t);
      }
      range.setAttribute("aria-valuetext", out.textContent);
      nowBtn.setAttribute("aria-pressed", live ? "true" : "false");
      paintSky(arcade, t);
    }
    range.addEventListener("input", function () { live = false; paint(); });
    nowBtn.addEventListener("click", function () { live = true; paint(); });
    paint(); setInterval(function () { if (live) paint(); }, 30000);
  }
  function initSkies() {
    function run() {
      $$("[data-sky]").forEach(function (el) {
        if (el.hasAttribute("data-arcade") || el.hasAttribute("data-sky-bound")) return;
        var v = el.getAttribute("data-sky");
        paintSky(el, v === "live" ? liveSkyMinute() : parseInt(v, 10));
      });
    }
    run(); setInterval(run, 60000);
  }

  /* ---------- sayaç (− / +) ---------- */
  function initSteppers() {
    $$("[data-stepper]").forEach(function (st) {
      var out = $("output", st), b = $$("button", st), min = +st.getAttribute("data-min"), max = +st.getAttribute("data-max");
      function set(v) {
        v = clamp(v, min, max); out.textContent = v; b[0].disabled = v <= min; b[1].disabled = v >= max;
        st.dispatchEvent(new CustomEvent("change", { detail: v, bubbles: true }));
      }
      b[0].addEventListener("click", function () { set(+out.textContent - 1); });
      b[1].addEventListener("click", function () { set(+out.textContent + 1); });
      st.setValue = set;
    });
  }

  /* ---------- ana sayfa: hızlı masa ---------- */
  function initQuick() {
    var box = $("[data-tool='hizli-masa']"); if (!box) return;
    var a = $("#q-git", box), sel = $("#q-saat", box), out = $("#q-kisi", box);
    function upd() { a.href = "rezervasyon.html?kisi=" + encodeURIComponent(out.textContent) + "&saat=" + encodeURIComponent(sel.value); }
    box.addEventListener("change", upd); upd();
  }

  /* ---------- menü sekmeleri ---------- */
  function initTabs() {
    var root = $("[data-tabs]"); if (!root) return;
    var tabs = $$("[role=tab]", root), panels = $$("[role=tabpanel]", root);
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        select(i);
        if (history.replaceState) history.replaceState(null, "", "#" + panels[i].id);
      });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length;
        if (k === "ArrowRight") { e.preventDefault(); select((i + 1) % n, true); }
        else if (k === "ArrowLeft") { e.preventDefault(); select((i + n - 1) % n, true); }
        else if (k === "Home") { e.preventDefault(); select(0, true); }
        else if (k === "End") { e.preventDefault(); select(n - 1, true); }
      });
    });
    function fromHash() {
      var id = (location.hash || "").slice(1), idx = -1;
      panels.forEach(function (p, k) { if (p.id === id) idx = k; });
      select(idx < 0 ? 0 : idx);
      if (idx >= 0) setTimeout(function () { root.scrollIntoView({ block: "start" }); }, 60);
    }
    fromHash(); window.addEventListener("hashchange", fromHash);
  }

  /* ---------- mesaj kutuları (menü soruları, gelmeden sor) ---------- */
  function bindCopy(box, getText) {
    var c = $("[data-copy]", box);
    if (c) c.addEventListener("click", function () { copyText(getText(), c); });
  }
  function initMenuAsk() {
    var tool = $("[data-tool='menu']"); if (!tool) return;
    var pre = $("[data-ask-pre]", tool), wa = $("[data-ask-wa]", tool), cnt = $("[data-ask-count]", tool), msg = pre.textContent;
    function upd() {
      var picked = $$(".mi input:checked", tool).map(function (i) { return i.value; });
      if (!picked.length) {
        msg = "Merhaba " + BRAND + ", güncel menünüzü paylaşabilir misiniz? Teşekkürler.";
        cnt.textContent = "Henüz bir şey işaretlemediniz. Yine de güncel menüyü isteyebilirsiniz.";
      } else {
        msg = "Merhaba " + BRAND + ", menünüzle ilgili bir sorum var. Şu çeşitler bugün var mı?\n" +
          picked.map(function (p) { return "– " + p; }).join("\n") + "\nGüncel menünüzü de paylaşabilir misiniz? Teşekkürler.";
        cnt.textContent = "Listenizde " + picked.length + " çeşit var. Sekmeler arasında gezerken seçimleriniz korunur.";
      }
      pre.textContent = msg; wa.href = waLink(msg);
    }
    tool.addEventListener("change", upd); bindCopy(tool, function () { return msg; }); upd();
  }
  function initAskChips() {
    var tool = $("[data-tool='gelmeden-sor']"); if (!tool) return;
    var pre = $("[data-ask-pre]", tool), wa = $("[data-ask-wa]", tool), cnt = $("[data-ask-count]", tool), msg = pre.textContent;
    function upd() {
      var qs = $$("[data-qs] input:checked", tool).map(function (i) { return i.value; });
      if (!qs.length) {
        msg = "Merhaba " + BRAND + ", gelmeden önce bilgi almak istiyorum.";
        cnt.textContent = "Yukarıdan sorularınızı seçin; mesaj kendiliğinden yazılır.";
      } else {
        msg = "Merhaba " + BRAND + ", gelmeden önce " + (qs.length === 1 ? "bir şey" : "birkaç şey") + " sormak istiyorum:\n" +
          qs.map(function (q) { return "– " + q; }).join("\n") + "\nŞimdiden teşekkürler.";
        cnt.textContent = qs.length + " soru seçtiniz.";
      }
      pre.textContent = msg; wa.href = waLink(msg);
    }
    tool.addEventListener("change", upd); bindCopy(tool, function () { return msg; }); upd();
  }

  /* ---------- rezervasyon aracı ---------- */
  function istDate(offset) {
    var a;
    try { a = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).split("-"); }
    catch (e) { var n = new Date(); a = [n.getFullYear(), n.getMonth() + 1, n.getDate()]; }
    return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2] + offset));
  }
  function initRez() {
    var tool = $("[data-tool='rezervasyon']"); if (!tool) return;
    var GUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"], GK = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    var pre = $("[data-ask-pre]", tool), wa = $("[data-ask-wa]", tool), warn = $("[data-rez-warn]", tool);
    var kisiOut = $("#r-kisi", tool), people = $("[data-people]", tool), days = $("[data-days]", tool);
    var range = $("#r-saat", tool), clock = $("#r-saat-o", tool), sky = $(".rez__sky", tool), ad = $("#r-ad", tool), not = $("#r-not", tool);
    var day = 0, msg = "", qs = new URLSearchParams(location.search);
    if (sky) sky.setAttribute("data-sky-bound", "");

    /* gün çipleri: bugünden başlayarak 8 gün */
    for (var i = 0; i < 8; i++) (function (i) {
      var d = istDate(i), b = document.createElement("button");
      b.type = "button"; b.className = "chipbtn"; b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = "<span>" + (i === 0 ? "Bugün" : i === 1 ? "Yarın" : GK[d.getUTCDay()]) + "</span><b>" + d.getUTCDate() + " " + AY[d.getUTCMonth()].slice(0, 3) + "</b>";
      b.addEventListener("click", function () {
        day = i; $$("button", days).forEach(function (x, k) { x.setAttribute("aria-pressed", k === i ? "true" : "false"); }); upd();
      });
      days.appendChild(b);
    })(i);

    /* ana sayfadan gelen ön seçimler */
    var k0 = parseInt(qs.get("kisi"), 10), s0 = (qs.get("saat") || "").match(/^(\d{1,2}):(\d{2})$/);
    var stepper = $("[data-stepper]", tool);
    if (k0 && stepper.setValue) stepper.setValue(k0);
    if (s0) { var m0 = (+s0[1]) * 60 + (+s0[2]); if (m0 >= 480 && m0 <= 1410) range.value = m0; }

    function val(name) { var r = $("input[name=" + name + "]:checked", tool); return r ? r.value : ""; }
    function upd() {
      var n = +kisiOut.textContent, t = parseInt(range.value, 10), d = istDate(day), now = istanbulNow();
      var gun = d.getUTCDate() + " " + AY[d.getUTCMonth()] + " " + GUN[d.getUTCDay()] + (day === 0 ? " (bugün)" : day === 1 ? " (yarın)" : "");
      clock.textContent = hhmm(t); range.setAttribute("aria-valuetext", hhmm(t));
      if (sky) paintSky(sky, t);
      if (people.childNodes.length !== Math.min(n, 30)) {
        while (people.childNodes.length > n) people.removeChild(people.lastChild);
        while (people.childNodes.length < n) people.appendChild(document.createElement("i"));
      }
      var lines = ["Merhaba " + BRAND + ", masa ayırtmak istiyorum.", "", "Kişi sayısı: " + n, "Gün: " + gun, "Saat: " + hhmm(t)];
      var v = val("vesile"), tr = val("tercih"), name = ad.value.trim(), note = not.value.trim();
      if (v) lines.push("Vesile: " + v);
      if (tr) lines.push("Oturma tercihi: " + tr);
      if (name) lines.push("Ad: " + name);
      if (note) lines.push("Not: " + note);
      lines.push("", "Uygunluk durumunu bildirir misiniz? Teşekkürler.");
      msg = lines.join("\n"); pre.textContent = msg; wa.href = waLink(msg);
      var w = "";
      if (day === 0 && now.m >= 30 && t <= now.m) w = "Seçtiğiniz saat bugün için geçmiş görünüyor. Daha ileri bir saat ya da yarını seçebilirsiniz.";
      else if (n >= 9) w = "Kalabalık bir grup için yazıyorsunuz; uygunluğu teyit edebilmemiz için talebinizi olabildiğince erken iletin.";
      warn.textContent = w; warn.hidden = !w;
    }
    tool.addEventListener("change", upd); tool.addEventListener("input", upd);
    bindCopy(tool, function () { return msg; });
    upd();
  }

  /* ---------- düz kopyalama düğmeleri ---------- */
  function initCopyText() {
    $$("[data-copy-text]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b); }); });
  }

  function start() {
    initNav(); buildDials(); paintStatus(); setInterval(paintStatus, 30000);
    initTiles(); initDaybar(); initSkies(); initSteppers(); initQuick(); initTabs(); initMenuAsk(); initAskChips(); initRez(); initCopyText();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
