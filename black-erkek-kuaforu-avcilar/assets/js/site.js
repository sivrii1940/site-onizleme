/* BLACK — Erkek Kuaförü, Avcılar · site betiği (bağımlılık yok) */

/* ---- Açık/kapalı durumu (kit/status.js'ten kopya) ---- */
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
  var BRAND = "Black Erkek Kuaförü";
  var WA = "https://wa.me/905304597373";
  var HOURS = { "0": [["08:00", "21:30"]], "1": [["08:00", "21:30"]], "2": [["08:00", "21:30"]], "3": [["08:00", "21:30"]], "4": [["08:00", "21:00"]], "5": [["08:00", "21:30"]], "6": [["10:00", "17:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function hhmm(m) { var h = Math.floor(m / 60) % 24, x = m % 60; return (h < 10 ? "0" : "") + h + ":" + (x < 10 ? "0" : "") + x; }
  function upTR(s) { return s.toLocaleUpperCase("tr-TR"); }
  function locTR(t) { // "08:00" -> "08:00'de", "10:00" -> "10:00'da"
    var h = parseInt(t, 10), m = t.slice(3), D = { 1: "de", 2: "de", 3: "te", 4: "te", 5: "te", 6: "da", 7: "de", 8: "de", 9: "da" };
    if (m === "30") return t + "'da";
    if (m === "15" || m === "45") return t + "'te";
    var suf = h % 10 ? D[h % 10] : (h === 20 ? "de" : "da");
    return t + "'" + suf;
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || "null"); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  function istanbulDate() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { y: +o.year, m: +o.month, d: +o.day };
    } catch (e) { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
  }
  function dayInfo(k) {
    var t = istanbulDate(), dt = new Date(Date.UTC(t.y, t.m - 1, t.d + k));
    var wd = (dt.getUTCDay() + 6) % 7;
    return { k: k, wd: wd, name: DAYS[wd], date: dt.getUTCDate(), month: MONTHS[dt.getUTCMonth()] };
  }
  function dayFull(k) { var d = dayInfo(k); return (k === 0 ? "Bugün, " : k === 1 ? "Yarın, " : "") + d.name + " " + d.date + " " + d.month; }
  function daySoft(k) { var d = dayInfo(k); return k === 0 ? "bugün" : k === 1 ? "yarın" : d.name + " (" + d.date + " " + d.month + ")"; }
  function slotsFor(k) {
    var d = dayInfo(k), out = [], now = istanbulNow();
    (HOURS[String(d.wd)] || []).forEach(function (r) {
      var s = mins(r[0]), e = mins(r[1]); if (e <= s) e += 1440;
      for (var m = s; m <= e - 30; m += 30) { if (k === 0 && m < now.m + 30) continue; out.push(hhmm(m)); }
    });
    return out;
  }
  function copyText(text, btn) {
    var label = btn ? btn.textContent : "";
    function done() { if (!btn) return; btn.textContent = "Kopyalandı"; setTimeout(function () { btn.textContent = label; }, 1800); }
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* sessiz */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  /* ---------- canlı durum + bugünün satırı ---------- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-day]").forEach(function (li) {
      var on = +li.getAttribute("data-day") === s.dayIndex;
      li.classList.toggle("is-today", on);
      if (on) li.setAttribute("aria-current", "date"); else li.removeAttribute("aria-current");
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- tam ekran menü ---------- */
  var menu = $("#menu"), mOpen = $("[data-menu-open]"), mClose = $("[data-menu-close]");
  function closeMenu(focusBack) {
    if (!menu) return;
    menu.classList.remove("is-open"); document.body.classList.remove("menu-open");
    if (mOpen) mOpen.setAttribute("aria-expanded", "false");
    if (location.hash === "#menu") history.replaceState(null, "", location.pathname + location.search);
    if (focusBack && mOpen) mOpen.focus();
  }
  if (menu && mOpen) {
    mOpen.addEventListener("click", function (e) {
      e.preventDefault();
      menu.classList.add("is-open"); document.body.classList.add("menu-open");
      mOpen.setAttribute("aria-expanded", "true");
      var a = $("a[aria-current]", menu) || $("ul a", menu); if (a) a.focus();
    });
    if (mClose) mClose.addEventListener("click", function (e) { e.preventDefault(); closeMenu(true); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu(true); });
    $$("a", menu).forEach(function (a) { if (a !== mClose) a.addEventListener("click", function () { closeMenu(false); }); });
  }

  /* ---------- SVG çizimler ---------- */
  var INK = "#F5F5F5", RED = "#E10600", uid = 0;
  var ICONS = {
    makas: '<circle cx="20" cy="47" r="7.5"/><circle cx="44" cy="47" r="7.5"/><path d="M25 41.5 47 9M39 41.5 17 9"/><circle cx="32" cy="27.3" r="2" stroke="' + RED + '"/>',
    ustura: '<path d="M15 24h33c5 0 8 3 8 7v5H15z"/><path d="M16 36h40" stroke="' + RED + '"/><circle cx="15" cy="30" r="2.6"/><path d="M13 33 5 51c-1 3 2 5 4 3l9-18"/>',
    makine: '<rect x="22" y="19" width="20" height="38" rx="7"/><path d="M20 19h24M23 12v7M27 12v7M31 12v7M35 12v7M39 12v7M43 12v7"/><path d="M32 31v8" stroke="' + RED + '"/>',
    tarak: '<path d="M8 20h48v9H8z"/><path d="M11 29v15M15 29v15M19 29v15M23 29v15M27 29v15M31 29v15M35 29v11M39 29v11M43 29v11M47 29v11M51 29v11M55 29v11"/><path d="M8 50h48" stroke="' + RED + '"/>',
    buhar: '<path d="M12 44h40v10H12z"/><path d="M12 49h40" stroke="' + RED + '"/><path d="M22 36c-4-4 4-8 0-12s4-8 0-12M32 36c-4-4 4-8 0-12s4-8 0-12M42 36c-4-4 4-8 0-12s4-8 0-12"/>',
    damla: '<path d="M32 8S18 26 18 36a14 14 0 0 0 28 0C46 26 32 8 32 8z"/><path d="M25 37a7 7 0 0 0 7 7" stroke="' + RED + '"/><path d="M50 14s-5 6-5 9a5 5 0 0 0 10 0c0-3-5-9-5-9z"/>',
    papyon: '<path d="M8 20l19 9v6L8 44zM56 20l-19 9v6l19 9z"/><rect x="27" y="27" width="10" height="10"/><path d="M8 54h48" stroke="' + RED + '"/>',
    cocuk: '<circle cx="32" cy="37" r="17"/><path d="M15.5 33c2-12 11-16 19-15 8 1 13 7 14 14"/><path d="M33 18c-3-6 4-9 5-4" stroke="' + RED + '"/>',
    kas: '<path d="M10 38c10-10 34-10 44 0-10 10-34 10-44 0z"/><circle cx="32" cy="38" r="5"/><path d="M10 22c12-7 32-7 44 0" stroke-width="3"/><path d="M8 30h48" stroke="' + RED + '"/>',
    renk: '<circle cx="32" cy="32" r="20"/><path d="M32 12a20 20 0 0 1 0 40z" fill="' + INK + '"/><path d="M8 56h48" stroke="' + RED + '"/>',
    sakal: '<path d="M14 18c0 22 8 38 18 38s18-16 18-38"/><path d="M14 18c4 10 10 14 18 14s14-4 18-14" stroke="' + RED + '"/><path d="M24 44c4 3 12 3 16 0"/>',
    foto: '<rect x="8" y="20" width="48" height="32"/><circle cx="32" cy="36" r="9"/><path d="M22 20l4-6h12l4 6"/><path d="M46 27h4" stroke="' + RED + '"/>',
    takvim: '<rect x="10" y="14" width="44" height="40"/><path d="M10 24h44M20 9v9M44 9v9"/><path d="M18 40h12" stroke="' + RED + '"/>',
    saat: '<circle cx="32" cy="32" r="21"/><path d="M32 18v14l9 6"/><path d="M32 32h0" stroke="' + RED + '" stroke-width="3"/>',
    girdap: '<path d="M32 32c2-2 5 0 4 3-1 4-7 5-9 1-3-5 2-11 8-10 7 1 10 9 6 15-5 7-16 6-19-2-4-9 3-19 13-19 11 0 18 11 13 21"/><path d="M8 56h48" stroke="' + RED + '"/>',
    yuz: '<path d="M32 8c-13 0-20 10-20 23 0 15 9 25 20 25s20-10 20-25C52 18 45 8 32 8z"/><path d="M12 30h40" stroke="' + RED + '"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 64 64" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }

  var HEAD = "M72 206C72 190 68 178 62 168C53 154 49 134 50 112C51 70 80 40 114 40C142 40 158 60 158 86C158 92 157 96 156 100C159 104 162 110 165 119C167 124 167 128 163 129L159 130C160 133 161 137 158 139C160 141 160 145 157 147C157 153 156 159 150 163C144 167 134 167 127 167C123 170 121 178 121 188L121 206";
  var SCALP = "M59 163C52 150 49 132 50 112C51 70 80 40 114 40C140 40 156 52 157 66L150 70C142 74 136 78 134 82C126 84 118 86 116 90L116 112L110 112C108 106 107 102 104 98C100 94 92 94 88 100C84 108 84 120 80 134C76 146 70 155 59 163Z";
  var TOPS = {
    crew: ["M52 98C49 62 79 33 114 33C144 33 162 50 161 64L152 70C128 75 92 80 52 98Z", "M70 58C94 44 126 40 152 52M62 76C90 62 124 58 154 63"],
    side: ["M52 98C49 60 80 30 114 30C144 30 162 46 163 62C163 68 159 71 153 71C128 75 92 80 52 98Z", "M62 80C86 62 120 52 158 60M70 92C96 76 126 68 156 68", "M150 36C126 31 100 35 80 46"],
    french: ["M52 98C49 62 79 34 114 34C146 34 162 50 165 64L165 75L152 75C128 77 92 80 52 98Z", "M70 56C100 44 140 46 162 64M64 72C96 60 136 60 160 73"],
    textured: ["M52 98C50 66 66 44 86 36L92 28L99 34L107 25L114 32L122 26L128 34L137 29L142 38L151 36L155 46L163 49L162 58L167 66L160 66L161 74L152 74C128 77 92 80 52 98Z", "M84 44L96 58M104 36L112 54M122 36L126 52M138 40L140 56M150 48L150 62"],
    quiff: ["M52 98C49 62 78 32 112 30C132 28 148 22 164 24C176 28 172 42 164 50C160 58 156 64 152 70C128 75 92 80 52 98Z", "M164 30C140 32 118 40 96 56M158 46C136 50 110 60 74 80"],
    pompadour: ["M52 98C48 58 74 24 110 22C136 20 160 14 172 28C180 38 172 54 160 62L152 70C128 75 92 80 52 98Z", "M166 28C134 28 102 36 70 62M168 44C136 46 104 54 64 80"],
    undercut: ["M56 90C52 56 80 26 116 26C150 26 170 42 170 60C170 72 164 80 156 84L150 80C130 82 100 82 64 90Z", "M80 40C110 34 146 40 164 66M66 66C100 52 136 56 158 78"],
    long: ["M50 112C46 64 78 30 114 30C146 30 164 50 162 70L154 72C146 76 138 82 132 90C126 98 120 108 116 120L108 128C100 130 94 128 90 124C84 138 76 156 66 174L56 168C50 150 49 130 50 112Z", "M80 44C110 36 140 44 156 66M68 70C96 58 124 62 138 84M60 100C70 120 72 140 64 162"]
  };
  var FADES = { skin: [84, 128, 0], low: [110, 152, 0.06], mid: [94, 130, 0], high: [78, 106, 0], taper: [136, 160, 0] };
  var BEARD = {
    short: "M116 112C114 132 118 150 130 161C138 167 148 167 153 161C156 157 157 151 157 147C160 145 160 141 158 139C161 137 160 133 159 130C153 131 147 129 141 127C132 125 124 119 116 112Z",
    full: "M114 110C110 136 114 160 128 174C140 184 158 182 164 168C167 160 162 152 158 148C160 145 160 141 158 139C161 137 160 133 159 130C153 131 147 129 141 127C132 125 122 118 114 110Z"
  };
  function drawCut(c) {
    var id = "c" + (++uid), sides = c.sides || "none", top = c.top || "crew", beard = c.beard || "none";
    var s = '<svg viewBox="14 8 176 204" role="img" aria-label="' + (c.label || "Kesim çizimi") + '">';
    s += '<defs><pattern id="' + id + 'd" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r=".95" fill="' + INK + '"/></pattern>';
    s += '<pattern id="' + id + 'l" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(68)"><path d="M0 2H4" stroke="' + INK + '" stroke-width="1.7"/></pattern>';
    s += '<clipPath id="' + id + 's"><path d="' + SCALP + '"/></clipPath>';
    var f = FADES[sides];
    if (f) {
      s += '<linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="' + f[0] + '" x2="0" y2="' + f[1] + '"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="' + f[2] + '"/></linearGradient>';
      s += '<mask id="' + id + 'm"><rect x="0" y="0" width="200" height="220" fill="url(#' + id + 'g)"/></mask>';
    }
    s += "</defs>";
    s += c.kid ? '<g transform="translate(16 30) scale(.84)">' : "<g>";
    s += '<path d="' + HEAD + '" fill="#121212" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    s += '<path d="M106 132C110 148 118 160 128 165" fill="none" stroke="#5A5A5A" stroke-width="1.2"/>';
    s += '<path d="M141 101C144 99.5 148 99.5 151 101M138 93C143 90 149 90 153 92" fill="none" stroke="#9A9A9A" stroke-width="1.4" stroke-linecap="round"/>';
    s += '<path d="M98 100C91 100 88 110 90 118C92 126 98 131 103 127C107 123 107 103 98 100Z" fill="#141414" stroke="' + INK + '" stroke-width="1.4"/><path d="M98 108C95 111 96 118 100 121" fill="none" stroke="#8A8A8A" stroke-width="1.2"/>';
    // yanlar
    var fill = sides === "none" ? "url(#" + id + "l)" : "url(#" + id + "d)";
    var op = sides === "shaved" ? ' opacity=".4"' : "";
    s += '<g clip-path="url(#' + id + 's)"><rect x="30" y="30" width="150" height="150" fill="' + fill + '"' + op + (f ? ' mask="url(#' + id + 'm)"' : "") + "/>";
    if (f) s += '<path d="M30 ' + f[0] + 'H180" stroke="' + RED + '" stroke-width="1.1"/>';
    if (sides === "shaved") s += '<path d="M30 89H180" stroke="' + RED + '" stroke-width="1.1"/>';
    s += "</g>";
    // üst
    var t = TOPS[top];
    if (t && top !== "buzz") {
      s += '<path d="' + t[0] + '" fill="#ECECEC" stroke="' + INK + '" stroke-width="1" stroke-linejoin="round"/>';
      s += '<path d="' + t[1] + '" fill="none" stroke="#0A0A0A" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/>';
      if (t[2]) s += '<path d="' + t[2] + '" fill="none" stroke="#0A0A0A" stroke-width="1.8" stroke-linecap="round"/>';
    }
    // sakal
    if (beard !== "none") {
      if (beard === "full") {
        s += '<path d="' + BEARD.full + '" fill="#ECECEC" stroke="' + INK + '" stroke-width="1"/>';
        s += '<path d="M120 130C122 146 130 160 142 170M132 128C136 144 144 158 156 168M146 130C148 142 152 152 160 160" fill="none" stroke="#0A0A0A" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>';
      } else {
        s += '<path d="' + BEARD.short + '" fill="url(#' + id + 'd)"' + (beard === "stubble" ? ' opacity=".55"' : "") + "/>";
        if (beard === "kontur") s += '<path d="M116 112C124 119 132 125 141 127C147 129 153 131 159 130" fill="none" stroke="' + RED + '" stroke-width="1.2"/>';
      }
      s += '<path d="M158.5 139L150 139.5" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round"/>';
    }
    s += '<path d="M26 224C38 210 52 201 68 197C88 204 108 204 126 196C144 200 160 208 174 224" fill="#060606" stroke="' + INK + '" stroke-width="1.4"/>';
    s += "</g></svg>";
    return s;
  }
  window.BLACK_drawCut = drawCut;

  $$("[data-icon]").forEach(function (el) { el.innerHTML = icon(el.getAttribute("data-icon")); });
  $$("[data-cut]").forEach(function (el) {
    var a = el.getAttribute("data-cut").split(" ");
    el.innerHTML = drawCut({ sides: a[0], top: a[1], beard: a[2] || "none", kid: a[3] === "kid", label: el.getAttribute("data-label") || "Kesim çizimi" });
  });

  /* ---------- HERO: kesilen kelime ---------- */
  var hero = $("[data-hero]");
  if (hero && !reduce) {
    var stage = $(".hero__stage", hero), hTop = $(".hero__half--top", hero), hBot = $(".hero__half--bot", hero), hTick = false;
    var heroUpd = function () {
      hTick = false;
      var h = hero.offsetHeight, k = Math.max(0, Math.min(1, window.scrollY / h));
      hTop.style.transform = "translateX(" + (-k * 9) + "vw)";
      hBot.style.transform = "translateX(" + (k * 9) + "vw)";
      stage.style.setProperty("--bgy", (50 + k * 40) + "%");
    };
    window.addEventListener("scroll", function () { if (!hTick) { hTick = true; requestAnimationFrame(heroUpd); } }, { passive: true });
    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = hero.getBoundingClientRect();
      stage.style.setProperty("--bgx", (24 + ((e.clientX - r.left) / r.width) * 52).toFixed(1) + "%");
    });
  }

  /* ---------- kaydırmaya bağlı yazı bandı ---------- */
  $$("[data-band]").forEach(function (b) {
    if (reduce) return;
    var rows = $$(".band__row", b), tk = false;
    function upd() {
      tk = false;
      var r = b.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      if (rows[0]) rows[0].style.transform = "translateX(" + (-p * 28).toFixed(2) + "%)";
      if (rows[1]) rows[1].style.transform = "translateX(" + (-28 + p * 28).toFixed(2) + "%)";
    }
    upd();
    window.addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true });
  });

  /* ---------- makara (yatay kaydırma) ---------- */
  function initReel(reel) {
    var track = $(".reel__track", reel), prev = $("[data-prev]", reel), next = $("[data-next]", reel);
    var bar = $(".reel__progress i", reel), count = $("[data-count]", reel);
    if (!track) return;
    function items() { return $$(".reel__item", track).filter(function (i) { return !i.hidden; }); }
    function upd() {
      var max = track.scrollWidth - track.clientWidth, it = items();
      if (bar) {
        var frac = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
        bar.style.width = Math.min(100, frac * 100) + "%";
        bar.style.left = (track.scrollWidth ? track.scrollLeft / track.scrollWidth * 100 : 0) + "%";
      }
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
      if (count && it.length) {
        var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0, idx = 0;
        for (var i = 0; i < it.length; i++) { if (it[i].offsetLeft - pad <= track.scrollLeft + it[i].offsetWidth / 2) idx = i; }
        if (track.scrollLeft >= max - 4) idx = it.length - 1;
        count.textContent = (idx + 1) + " / " + it.length;
      }
    }
    function step(dir) {
      var it = items()[0], gap = parseFloat(getComputedStyle(track).columnGap) || 14;
      track.scrollBy({ left: dir * (it ? it.offsetWidth + gap : track.clientWidth * .8), behavior: reduce ? "auto" : "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
    var tk = false;
    track.addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(function () { tk = false; upd(); }); } }, { passive: true });
    window.addEventListener("resize", upd);
    // fareyle sürükleme
    var down = false, moved = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse" || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add("is-drag"); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; if (moved) { track.classList.remove("is-drag"); setTimeout(function () { moved = false; }, 30); } });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    reel._upd = upd;
    upd();
  }
  $$("[data-reel]").forEach(initReel);

  /* ---------- kesim menüsü: filtre + seçim tepsisi ---------- */
  $$("[data-filter-for]").forEach(function (group) {
    var reel = document.getElementById(group.getAttribute("data-filter-for"));
    if (!reel) return;
    $$("[data-filter]", group).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-filter");
        $$("[data-filter]", group).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        $$(".reel__item", reel).forEach(function (it) { it.hidden = !(v === "hepsi" || (" " + it.getAttribute("data-tags") + " ").indexOf(" " + v + " ") > -1); });
        var tr = $(".reel__track", reel); tr.scrollLeft = 0; if (reel._upd) reel._upd();
      });
    });
  });

  var tray = $("[data-tray]");
  if (tray) {
    var picks = store("black-picks") || [];
    var pickBtns = $$("[data-pick]");
    var renderTray = function () {
      pickBtns.forEach(function (b) {
        var on = picks.indexOf(b.getAttribute("data-pick")) > -1;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        var l = $("[data-pick-label]", b); if (l) l.textContent = on ? "Seçildi" : "Randevuya ekle";
      });
      tray.classList.toggle("is-on", picks.length > 0);
      var msg = "Merhaba " + BRAND + ", şunun için randevu almak istiyorum: " + picks.join(", ") + ". Uygun saatlerinizi yazabilir misiniz?";
      $("[data-tray-list]", tray).innerHTML = "";
      var strong = document.createElement("span"); strong.textContent = "Seçiminiz: " + picks.join(" + ");
      var sm = document.createElement("small"); sm.textContent = "Mesaj: “" + msg + "”";
      $("[data-tray-list]", tray).appendChild(strong); $("[data-tray-list]", tray).appendChild(sm);
      $("[data-tray-book]", tray).href = "randevu.html?tarz=" + encodeURIComponent(picks.join("|"));
      $("[data-tray-wa]", tray).href = waLink(msg);
      store("black-picks", picks);
    };
    pickBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-pick"), i = picks.indexOf(v);
        if (i > -1) picks.splice(i, 1); else picks.push(v);
        renderTray();
      });
    });
    $("[data-tray-clear]", tray).addEventListener("click", function () { picks = []; renderTray(); });
    renderTray();
  }

  /* ---------- hızlı randevu düğmeleri ---------- */
  function findDay(from, test) { for (var k = from; k < 9; k++) { var s = slotsFor(k); if (s.length && (!test || test(s, k))) return k; } return null; }
  var PRESETS = {
    ilk: function () {
      var k = findDay(0);
      return { title: (k === 0 ? "Bugün" : upTR(daySoft(k).charAt(0)) + daySoft(k).slice(1)) + ", ilk boş saatte", sub: "Saç kesimi",
        msg: "Merhaba " + BRAND + ", " + daySoft(k) + " ilk uygun saatinizde saç kesimi için gelmek istiyorum. Müsait bir saatiniz var mı?" };
    },
    aksam: function () {
      var k = findDay(0, function (s) { return s.some(function (x) { return x >= "18:00"; }); });
      var d = k === 0 ? "Bugün" : k === 1 ? "Yarın" : dayInfo(k).name;
      return { title: d + " akşam", sub: "Saç ve sakal, 18:00 sonrası",
        msg: "Merhaba " + BRAND + ", " + daySoft(k) + " akşam 18:00 sonrası saç ve sakal için randevu almak istiyorum. Uygun bir saat var mı?" };
    },
    sabah: function () {
      var k = findDay(1, function (s) { return s.some(function (x) { return x < "12:00"; }); });
      var d = k === 1 ? "Yarın" : dayInfo(k).name, first = slotsFor(k)[0];
      return { title: d + " sabah", sub: "Saç kesimi, " + first + " sonrası",
        msg: "Merhaba " + BRAND + ", " + daySoft(k) + " sabah saatlerinde (" + first + " sonrası) saç kesimi için randevu almak istiyorum. Uygun musunuz?" };
    },
    haftasonu: function () {
      var k = findDay(0, function (s, kk) { var w = dayInfo(kk).wd; return w === 5 || w === 6; });
      var di = dayInfo(k);
      return { title: (k === 0 ? "Bugün, " : "") + di.name + " " + di.date + " " + di.month, sub: "Çocuk tıraşı",
        msg: "Merhaba " + BRAND + ", " + daySoft(k) + " çocuğum için tıraş randevusu almak istiyorum. Uygun saatlerinizi yazabilir misiniz?" };
    }
  };
  $$("[data-quick]").forEach(function (a) {
    var fn = PRESETS[a.getAttribute("data-quick")]; if (!fn) return;
    var p = fn();
    var b = $("b", a), sub = $("[data-q-sub]", a), pv = $("[data-q-msg]", a);
    if (b) b.textContent = p.title;
    if (sub) sub.textContent = p.sub;
    if (pv) pv.textContent = "“" + p.msg + "”";
    a.href = waLink(p.msg); a.target = "_blank"; a.rel = "noopener";
  });

  /* ---------- hazır mesajlı bağlantılar ---------- */
  $$("[data-wa-msg]").forEach(function (a) {
    var src = a.getAttribute("data-wa-msg");
    var msg = src ? src : (($("[data-msg]", a) || {}).textContent || "").replace(/[“”]/g, "").trim();
    a.href = waLink(msg);
  });
  $$("[data-copy-text]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b); }); });

  /* ---------- randevu talebi aracı ---------- */
  var book = $("[data-booking]");
  if (book) {
    var qs = new URLSearchParams(location.search);
    var SVC_KEYS = { sac: "Saç kesimi", sakal: "Sakal tıraşı", sacsakal: "Saç + sakal", cocuk: "Çocuk tıraşı", yuz: "Yüz bakımı", yikama: "Yıkama ve şekillendirme", damat: "Damat tıraşı" };
    var st = { svc: [], styles: [], k: null, t: "", n: 1 };
    var hk = qs.get("h");
    st.svc = hk && SVC_KEYS[hk] ? [SVC_KEYS[hk]] : ["Saç kesimi"];
    if (qs.get("tarz")) st.styles = qs.get("tarz").split("|").filter(Boolean).slice(0, 6);
    var noteIn = $("#b-not", book), nameIn = $("#b-ad", book);
    if (qs.get("not") && noteIn) noteIn.value = qs.get("not").slice(0, 300);
    var svcBtns = $$("[data-svc]", book), dayWrap = $("[data-days]", book), timeWrap = $("[data-times]", book);
    var styleWrap = $("[data-styles]", book), styleField = $("[data-style-field]", book);
    var pre = $("[data-preview]", book), send = $("[data-send]", book), cp = $("[data-copy]", book);

    var bMsg = function () {
      var L = ["Merhaba " + BRAND + ", randevu almak istiyorum."];
      L.push("• Hizmet: " + (st.svc.length ? st.svc.join(", ") : "Henüz seçmedim, birlikte karar verelim"));
      if (st.styles.length) L.push("• Kesim ve bakım: " + st.styles.join(", "));
      L.push("• Gün: " + (st.k === null ? "Size uygun ilk gün" : dayFull(st.k)));
      L.push("• Saat: " + (st.t ? st.t + " civarı" : "Fark etmez, uygun bir saat"));
      if (st.n > 1) L.push("• Kişi sayısı: " + st.n);
      var nm = nameIn ? nameIn.value.trim() : "", nt = noteIn ? noteIn.value.trim() : "";
      if (nm) L.push("• Ad: " + nm);
      if (nt) L.push("• Not: " + nt);
      L.push("Uygun olup olmadığını yazabilir misiniz? Teşekkürler.");
      return L.join("\n");
    };
    var bRender = function () {
      var m = bMsg();
      pre.textContent = m;
      send.href = waLink(m);
    };
    var renderStyles = function () {
      if (!styleWrap) return;
      styleField.hidden = !st.styles.length;
      styleWrap.innerHTML = "";
      st.styles.forEach(function (s, i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "chip is-on";
        b.innerHTML = '<span></span><i class="plus" style="transform:rotate(45deg)" aria-hidden="true"></i>';
        b.firstChild.textContent = s; b.setAttribute("aria-label", s + " seçimini kaldır");
        b.addEventListener("click", function () { st.styles.splice(i, 1); renderStyles(); bRender(); });
        styleWrap.appendChild(b);
      });
    };
    var renderTimes = function () {
      timeWrap.innerHTML = "";
      var slots = st.k === null ? [] : slotsFor(st.k);
      if (st.t && slots.indexOf(st.t) < 0) st.t = "";
      [""].concat(slots).forEach(function (t) {
        var b = document.createElement("button"); b.type = "button"; b.className = "chip slot";
        b.textContent = t || "Fark etmez";
        b.setAttribute("aria-pressed", st.t === t ? "true" : "false");
        b.addEventListener("click", function () { st.t = t; $$(".slot", timeWrap).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); bRender(); });
        timeWrap.appendChild(b);
      });
    };
    var renderDays = function () {
      dayWrap.innerHTML = "";
      for (var k = 0; k < 8; k++) {
        (function (k) {
          var d = dayInfo(k), slots = slotsFor(k), rs = HOURS[String(d.wd)] || [];
          var b = document.createElement("button"); b.type = "button"; b.className = "day";
          b.innerHTML = "<b></b><span></span><small></small>";
          b.children[0].textContent = k === 0 ? "Bugün" : k === 1 ? "Yarın" : d.name;
          b.children[1].textContent = d.date + " " + d.month + (k > 1 ? "" : ", " + d.name);
          b.children[2].textContent = slots.length ? (rs[0] ? rs[0][0] + "–" + rs[0][1] : "") : (rs.length ? "Bugün için kapandı" : "Kapalı");
          if (!slots.length) b.disabled = true;
          if (st.k === null && slots.length) st.k = k;
          b.setAttribute("aria-pressed", st.k === k ? "true" : "false");
          b.addEventListener("click", function () { st.k = k; $$(".day", dayWrap).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); renderTimes(); bRender(); });
          dayWrap.appendChild(b);
        })(k);
      }
    };
    svcBtns.forEach(function (b) {
      var v = b.getAttribute("data-svc");
      b.setAttribute("aria-pressed", st.svc.indexOf(v) > -1 ? "true" : "false");
      b.addEventListener("click", function () {
        var i = st.svc.indexOf(v); if (i > -1) st.svc.splice(i, 1); else st.svc.push(v);
        b.setAttribute("aria-pressed", i > -1 ? "false" : "true"); bRender();
      });
    });
    $$("[data-people]", book).forEach(function (b) {
      b.setAttribute("aria-pressed", +b.getAttribute("data-people") === st.n ? "true" : "false");
      b.addEventListener("click", function () {
        st.n = +b.getAttribute("data-people");
        $$("[data-people]", book).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); bRender();
      });
    });
    [nameIn, noteIn].forEach(function (i) { if (i) i.addEventListener("input", bRender); });
    if (cp) cp.addEventListener("click", function () { copyText(bMsg(), cp); });
    renderDays(); renderTimes(); renderStyles(); bRender();
  }

  /* ---------- numara cetveli ---------- */
  var ruler = $("[data-ruler]");
  if (ruler) {
    var G = [
      ["0", "0,5–2 mm", 1.2, "Tarak takılmadan kesim. Deri belirgin seçilir; fade'lerin en alt basamağıdır."],
      ["½", "1,5 mm", 1.5, "Gölge gibi bir iz bırakır; deri hâlâ seçilir."],
      ["1", "3 mm", 3, "Çok kısa. Deri hafifçe seçilir; fade geçişlerinin alt basamaklarındandır."],
      ["2", "6 mm", 6, "Kısa ve kapalı. Yanlar için sık istenen ölçülerdendir."],
      ["3", "10 mm", 10, "Kısa ama dolgun görünür. Tek numara kesimlerde sık seçilir."],
      ["4", "13 mm", 13, "Yanlarda yumuşak, klasik bir görünüm verir."],
      ["5", "16 mm", 16, "Kısa saçlı bir üst için orta uzunluk."],
      ["6", "19 mm", 19, "Üstte kısa ama taranabilir bir boy."],
      ["7", "22 mm", 22, "Makasla devam edilecek bir üst için başlangıç boyu."],
      ["8", "25 mm", 25, "Yaygın tarak setleriyle bırakılabilecek en uzun boy."]
    ];
    var rng = $("input[type=range]", ruler), outN = $("[data-r-num]", ruler), outMm = $("[data-r-mm]", ruler), outT = $("[data-r-text]", ruler), svgBox = $("[data-r-svg]", ruler);
    var rLink = $("[data-r-link]", ruler), rows = $$("[data-guard]");
    var drawRuler = function (mm) {
      var base = 136, sc = 4.4, h = Math.max(2, mm * sc), s = '<svg viewBox="0 0 320 160" class="ruler__svg" aria-hidden="true">';
      for (var v = 0; v <= 25; v += 5) { var y = base - v * sc; s += '<path d="M28 ' + y + 'H40" stroke="#8A8A8A"/><text x="0" y="' + (y + 4) + '" fill="#ABABAB" font-size="11" font-family="Inter Tight, sans-serif">' + v + '</text>'; }
      for (v = 0; v <= 25; v++) { var yy = base - v * sc; s += '<path d="M34 ' + yy + 'H40" stroke="#555"/>'; }
      s += '<path d="M40 ' + base + 'V' + (base - 25 * sc) + '" stroke="#8A8A8A"/>';
      for (var x = 60; x <= 304; x += 7) {
        var j = ((x * 37) % 9) / 9 - .5, hh = h + j * Math.min(3, h * .2);
        s += '<path d="M' + x + ' ' + base + 'q' + (2 + j * 2).toFixed(1) + ' ' + (-hh / 2).toFixed(1) + ' ' + (j * 3).toFixed(1) + ' ' + (-hh).toFixed(1) + '" stroke="#F5F5F5" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
      }
      s += '<path d="M52 ' + (base + 1) + 'H312" stroke="#F5F5F5" stroke-width="2"/><rect x="52" y="' + (base + 2) + '" width="260" height="20" fill="#1C1C1C"/>';
      s += '<path d="M44 ' + (base - h).toFixed(1) + 'H316" stroke="#E10600" stroke-width="1"/>';
      return s + "</svg>";
    };
    var rUpd = function () {
      var g = G[+rng.value];
      outN.textContent = g[0] + " numara"; outMm.textContent = "≈ " + g[1]; outT.textContent = g[3];
      svgBox.innerHTML = drawRuler(g[2]);
      rng.setAttribute("aria-valuetext", g[0] + " numara, yaklaşık " + g[1]);
      rows.forEach(function (r) { r.classList.toggle("is-on", r.getAttribute("data-guard") === rng.value); });
      if (rLink) rLink.href = "randevu.html?not=" + encodeURIComponent("Yanlar " + g[0] + " numara olsun.");
    };
    rng.addEventListener("input", rUpd);
    rUpd();
  }

  /* ---------- kesim tarifi oluşturucu ---------- */
  var rec = $("[data-recipe]");
  if (rec) {
    var T = {
      yan: { none: "yanlar makasla, doğal", taper: "yanlar taper", low: "yanlar low fade", mid: "yanlar mid fade", high: "yanlar high fade", skin: "yanlar sıfır (skin) fade", shaved: "yanlar tek boy kısa (undercut)" },
      ust: { buzz: "üst tek numara", crew: "üst kısa", french: "üst kısa, kâkül öne", textured: "üst dağınık ve dokulu", side: "üst yandan ayrık", quiff: "üst quiff, ön kalkık", pompadour: "üst pompadour, geriye hacimli", long: "üst uzun, boy korunsun" },
      sakal: { none: "sakal yok", stubble: "kirli sakal", short: "kısa sakal", kontur: "kısa sakal, net kontur", full: "dolgun sakal" },
      ense: { dogal: "ense doğal bitiş", yuvarlak: "ense yuvarlak", kare: "ense kare" },
      bitis: { mat: "mat şekillendirici", parlak: "parlak şekillendirici", yok: "şekillendirici yok" }
    };
    var SHORT = { none: "Makas yan", taper: "Taper", low: "Low fade", mid: "Mid fade", high: "High fade", skin: "Skin fade", shaved: "Undercut" };
    var art = $("[data-recipe-art]", rec), txt = $("[data-recipe-text]", rec), rpv = $("[data-recipe-msg]", rec), rwa = $("[data-recipe-wa]", rec), rbook = $("[data-recipe-book]", rec), rcp = $("[data-recipe-copy]", rec);
    var val = function (n) { var i = $("input[name=" + n + "]:checked", rec); return i ? i.value : ""; };
    var recUpd = function () {
      var c = { yan: val("yan"), ust: val("ust"), sakal: val("sakal"), ense: val("ense"), bitis: val("bitis") };
      var topKey = c.ust === "long" && c.yan === "shaved" ? "undercut" : c.ust;
      art.innerHTML = drawCut({ sides: c.yan, top: topKey, beard: c.sakal, label: "Seçtiğiniz kesimin çizimi" });
      var parts = [T.yan[c.yan], T.ust[c.ust], T.sakal[c.sakal], T.ense[c.ense], T.bitis[c.bitis]];
      txt.textContent = SHORT[c.yan].toUpperCase() + " / " + upTR(T.ust[c.ust].replace("üst ", "") + (c.sakal !== "none" ? " / " + T.sakal[c.sakal] : ""));
      var recipe = parts.join(", ");
      var msg = "Merhaba " + BRAND + ", şu tarifte bir kesim düşünüyorum: " + recipe + ". Bana uygun olur mu, ne zaman gelebilirim?";
      rpv.textContent = msg; rwa.href = waLink(msg);
      rbook.href = "randevu.html?not=" + encodeURIComponent("Kesim tarifi: " + recipe + ".");
      rcp.onclick = function () { copyText(msg, rcp); };
    };
    $$("input", rec).forEach(function (i) { i.addEventListener("change", recUpd); });
    recUpd();
  }

  /* ---------- büyütme (galeri) ---------- */
  var lb = $("#lb");
  if (lb) {
    var lbBox = $("[data-lb-img]", lb), lbCap = $("[data-lb-cap]", lb);
    $$("[data-lb]").forEach(function (b) {
      b.addEventListener("click", function () {
        var im = $("img", b);
        if (typeof lb.showModal !== "function") { location.href = b.getAttribute("data-lb"); return; }
        var big = document.createElement("img");
        big.src = b.getAttribute("data-lb"); big.alt = im ? im.alt : "";
        if (im) { big.width = im.width; big.height = im.height; }
        lbBox.innerHTML = ""; lbBox.appendChild(big);
        lbCap.textContent = b.getAttribute("data-cap") || "Temsili görsel";
        lb.showModal();
      });
    });
    $("[data-lb-close]", lb).addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---------- saat şeridi + saat sorgu ---------- */
  var tl = $("[data-timeline]");
  if (tl) {
    var paintNow = function () {
      var n = istanbulNow();
      $$(".tl__row", tl).forEach(function (r) {
        var on = +r.getAttribute("data-tl-day") === n.d, line = $(".tl__now", r);
        r.classList.toggle("is-today", on);
        var pct = (n.m - 420) / 960 * 100;
        if (line) { line.classList.toggle("is-on", on && pct >= 0 && pct <= 100); if (on) line.style.left = pct + "%"; }
      });
    };
    paintNow(); setInterval(paintNow, 60000);
  }
  var ask = $("[data-ask]");
  if (ask) {
    var gs = $("#q-gun", ask), ts = $("#q-saat", ask), out = $("[data-ask-out]", ask);
    var n0 = istanbulNow();
    gs.value = String(n0.d);
    ts.value = hhmm(Math.min(1410, Math.ceil(n0.m / 30) * 30));
    var check = function () {
      var d = +gs.value, v = ts.value;
      if (!/^\d{2}:\d{2}$/.test(v)) { out.textContent = "Lütfen bir saat seçin."; out.className = "ask__out"; return; }
      var m = mins(v), rs = HOURS[String(d)] || [], res = null;
      rs.forEach(function (r) { var s = mins(r[0]), e = mins(r[1]); if (m >= s && m < e) res = r; });
      if (res) {
        var left = mins(res[1]) - m;
        out.textContent = DAYS[d] + " " + v + ": açık. Kapanış " + res[1] + (left <= 45 ? "; kapanışa az kaldığı için önceden yazmanız iyi olur." : ".");
        out.className = "ask__out ok";
      } else {
        var r0 = rs[0];
        out.textContent = DAYS[d] + " " + v + ": kapalı. " + (r0 ? (m < mins(r0[0]) ? "O gün " + locTR(r0[0]) + " açılıyor." : "O gün " + r0[0] + "–" + r0[1] + " arası açık.") : "");
        out.className = "ask__out no";
      }
    };
    ask.addEventListener("submit", function (e) { e.preventDefault(); check(); });
    gs.addEventListener("change", check); ts.addEventListener("change", check);
    check();
  }
})();
