/* Yiğit İnşaat Yapı Dekorasyon — renk kartelası betiği (bağımlılık yok) */
(function () {
  "use strict";
  var WA = "https://wa.me/905319932666";
  var HOURS = {}; /* çalışma saati bilinmiyor */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function copyText(text, toast) {
    function done(ok) { if (toast) { toast.textContent = ok ? "Mesaj kopyalandı." : "Kopyalanamadı; metni elle seçip kopyalayın."; } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var t = el("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); done(ok);
    }
  }

  /* ---------- canlı açık/kapalı durumu (kit/status.js kopyası) ---------- */
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
  $$("[data-status]").forEach(function (e) {
    var s = openStatus(HOURS); e.textContent = s.text; e.classList.toggle("is-open", s.open);
    var d = e.parentNode && $(".dot", e.parentNode); if (d) d.classList.toggle("is-open", s.open);
  });

  /* ---------- gezinme ---------- */
  var navBtn = $("[data-nav-btn]"), nav = $("[data-nav]");
  if (navBtn && nav) {
    var setNav = function (open) { nav.classList.toggle("is-open", open); navBtn.setAttribute("aria-expanded", open ? "true" : "false"); $("span", navBtn).textContent = open ? "Kapat" : "Menü"; };
    navBtn.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); navBtn.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target) && !navBtn.contains(e.target)) setNav(false); });
  }

  /* ---------- renk yardımcıları ---------- */
  function hexToRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function lum(h) { var c = hexToRgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function onColor(h) { return lum(h) > 0.19 ? "#1F2421" : "#FFFFFF"; }
  function rgbToHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2, d = mx - mn;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s * 100, l * 100];
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    return "#" + [r, g, b].map(function (v) { var t = Math.round((v + m) * 255).toString(16).toUpperCase(); return t.length < 2 ? "0" + t : t; }).join("");
  }

  /* ---------- oda çizimi ---------- */
  function Room(svg) {
    this.svg = svg;
    this.wall = $("[data-wall]", svg); this.sweep = $("[data-wall-new]", svg); this.side = $("[data-side]", svg);
    this.ceil = $("[data-ceil]", svg); this.roller = $("[data-roller]", svg); this.sheen = $("[data-sheen]", svg);
    this.fills = $$("[data-wallfill]", svg);
    this.cur = this.wall.getAttribute("fill");
  }
  Room.prototype.paintWall = function (hex, instant) {
    var self = this, old = this.cur;
    if (hex === old) return;
    this.cur = hex;
    this.wall.setAttribute("fill", old);
    this.sweep.setAttribute("fill", hex);
    this.fills.forEach(function (f) { f.setAttribute("fill", hex); });
    if (instant || reduce || !this.sweep.animate) { this.wall.setAttribute("fill", hex); return; }
    var opt = { duration: 680, easing: "cubic-bezier(.45,.05,.3,1)" };
    this.sweep.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], opt);
    if (this.roller) {
      this.roller.setAttribute("opacity", "1");
      var a = this.roller.animate([{ transform: "translateX(0px)" }, { transform: "translateX(630px)" }], opt);
      a.onfinish = function () { if (self.cur === hex) { self.roller.setAttribute("opacity", "0"); self.wall.setAttribute("fill", hex); } };
    }
  };
  Room.prototype.paintSide = function (hex) { this.side.setAttribute("fill", hex); };
  Room.prototype.paintCeil = function (hex) { this.ceil.setAttribute("fill", hex); };
  Room.prototype.scene = function (name) { $$("[data-scene]", this.svg).forEach(function (g) { g.style.display = g.getAttribute("data-scene") === name ? "" : "none"; }); };
  Room.prototype.finish = function (f) { if (this.sheen) this.sheen.setAttribute("opacity", f === "yari" ? ".26" : f === "ipek" ? ".12" : "0"); };
  Room.prototype.evening = function (on) { this.svg.classList.toggle("is-evening", !!on); };

  function setLabel(root, name, hex) {
    var n = $("[data-room-name]", root), h = $("[data-room-hex]", root), s = $("[data-room-swatch]", root);
    if (n) n.textContent = name; if (h) h.textContent = hex.toUpperCase(); if (s) s.style.background = hex;
  }

  /* ---------- ana sayfa: renk yelpazesi ---------- */
  var hero = $("[data-hero]");
  if (hero) {
    var hRoom = new Room($("[data-room]", hero)), fan = $("[data-fan]", hero), leaves = $$(".fan__leaf", fan);
    var pickLeaf = function (btn, instant) {
      leaves.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var hex = btn.getAttribute("data-color"), name = btn.getAttribute("data-name");
      hRoom.paintWall(hex, instant); hRoom.paintSide(hex); setLabel(hero, name, hex);
      store("yigit_last", { n: name, h: hex });
    };
    leaves.forEach(function (b) { b.addEventListener("click", function () { pickLeaf(b); }); });
    fan.classList.add("is-opening");
    setTimeout(function () { fan.classList.add("is-open"); }, 180);
    setTimeout(function () { fan.classList.remove("is-opening"); }, 1500);
  }

  /* ---------- ana sayfa: hizmet yelpazesi ---------- */
  var sfan = $("[data-sfan]");
  if (sfan) {
    var sLeaves = $$(".sfan__leaf", sfan), arts = $$("[data-sdetail] article");
    var pickSvc = function (i) {
      sLeaves.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      arts.forEach(function (a, k) { a.classList.toggle("is-on", k === i); });
    };
    sLeaves.forEach(function (b, i) { b.setAttribute("role", "button"); b.addEventListener("click", function (e) { e.preventDefault(); pickSvc(i); }); });
    pickSvc(0);
    sfan.classList.add("is-opening");
    var openS = function () { sfan.classList.add("is-open"); setTimeout(function () { sfan.classList.remove("is-opening"); }, 1500); };
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { openS(); io.disconnect(); } }); }, { threshold: 0.35 });
      io.observe(sfan);
      setTimeout(openS, 2500); /* her durumda açılır */
    } else { openS(); }
  }

  /* ---------- hizmetler: parlaklık ve duvar sorunu ---------- */
  var sheenBox = $("[data-sheen-tool]");
  if (sheenBox) {
    var SH = {
      mat: ["Mat", "Işığı yansıtmaz; sıva dalgalarını ve küçük kusurları en iyi gizleyen yüzeydir. Tavanlarda ve salon, yatak odası gibi az kirlenen duvarlarda tercih edilir. Silmeye karşı en hassas olan da budur.", 95, 30],
      ipek: ["İpek mat", "Hafif, kadifemsi bir ışıltısı vardır. Silinebilirliği mattan iyidir; koridor, çocuk odası ve yaşam alanlarında en sık seçilen dengedir.", 70, 60],
      yari: ["Yarı parlak", "Belirgin biçimde ışık yansıtır, nemli bezle rahat silinir. Mutfak, banyo, kapı ve pervazlarda kullanılır; yüzey kusurlarını daha çok gösterir.", 40, 82],
      parlak: ["Parlak", "Ayna gibi yansıtır; en sert ve en kolay silinen yüzeydir. Daha çok ahşap ve metal doğramada kullanılır; duvarda her dalgayı belli eder.", 15, 96]
    };
    var sWall = $("[data-sheen-wall]", sheenBox), sT = $("[data-sheen-title]", sheenBox), sP = $("[data-sheen-text]", sheenBox), m1 = $("[data-m1]", sheenBox), m2 = $("[data-m2]", sheenBox);
    $$("[data-sheen-btn]", sheenBox).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-sheen-btn"), d = SH[k];
        $$("[data-sheen-btn]", sheenBox).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        sWall.setAttribute("data-s", k); sT.textContent = d[0]; sP.textContent = d[1];
        m1.style.setProperty("--v", d[2]); m2.style.setProperty("--v", d[3]);
      });
    });
  }
  var probs = $("[data-probs]");
  if (probs) {
    var pBtns = $$("[data-prob]", probs), pPanels = $$(".probs__panel", probs);
    var pickProb = function (id) {
      pBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-prob") === id ? "true" : "false"); });
      pPanels.forEach(function (p) { p.classList.toggle("is-on", p.id === id); });
    };
    pBtns.forEach(function (b) { b.addEventListener("click", function () { pickProb(b.getAttribute("data-prob")); }); });
    pickProb(pBtns[0].getAttribute("data-prob"));
  }

  /* ---------- kartela verisi ---------- */
  var FAMILIES = [
    ["Kırık beyazlar", [["Şile Bezi", "#F2EDE1"], ["Kireç Beyazı", "#F6F4EE"], ["Sütlaç", "#F3EAD8"], ["Yasemin", "#F4F0DC"], ["Kuğu", "#ECEAE4"], ["İnci", "#E9E4DA"], ["Yoğurt", "#F7F3E8"], ["Pamuk", "#EEF0EC"]]],
    ["Toprak ve bej", [["Ağva Kumu", "#E3D3B8"], ["Kumsal", "#D9C5A3"], ["Sütlü Kahve", "#C8AD8D"], ["Fındık Kabuğu", "#B08D6A"], ["Kil", "#C9A58A"], ["Toprak Testi", "#C97B55"], ["Kiremit", "#B5573A"], ["Tarçın", "#9C5B3B"]]],
    ["Griler", [["Alemdağ Sisi", "#D5D8D6"], ["Bulut", "#E1E3E2"], ["Mermer", "#DAD8D2"], ["Gümüş Söğüt", "#C9CEC5"], ["Çakıl", "#BFC1BC"], ["Vapur Dumanı", "#A7ADAF"], ["Kurşuni", "#8E9695"], ["Antrasit", "#474D4F"]]],
    ["Yeşiller", [["Çekmeköy Çamı", "#216869"], ["Adaçayı", "#A9B8A0"], ["Nane", "#CFE3D3"], ["Çağla", "#B9C98A"], ["Okaliptüs", "#8FAEA3"], ["Zeytin Dalı", "#8A8F5A"], ["Polonezköy Yeşili", "#5E7F5B"], ["Orman Gölgesi", "#2F4A3F"]]],
    ["Maviler", [["Taşdelen Suyu", "#CFE4EA"], ["Buz", "#E2EEF1"], ["Riva Sabahı", "#A9C7D6"], ["Gök", "#8DB4D2"], ["Fırtına", "#5C7183"], ["Çini", "#2C7DA0"], ["Boğaz Mavisi", "#2F6F8F"], ["Lacivert", "#25405E"]]],
    ["Sıcak tonlar", [["Ayçiçeği", "#F6AE2D"], ["Gün Batımı", "#F26419"], ["Hardal", "#D6A02A"], ["Kayısı", "#F4B183"], ["Şeftali", "#F7CDB0"], ["Gül Kurusu", "#C98B8B"], ["Erguvan", "#B5739D"], ["Nar", "#A63A3A"]]],
    ["Pasteller", [["Vanilya", "#F5E8C8"], ["Limon Köpüğü", "#F6EFC2"], ["Pudra", "#F1D9D4"], ["Şeker Pembe", "#F4CAD3"], ["Leylak", "#D9C7E0"], ["Lavanta", "#C9C3E0"], ["Bebek Mavisi", "#CFE0F0"], ["Su Yeşili", "#CDE6DC"]]]
  ];
  function nameOf(hex) {
    hex = hex.toUpperCase();
    for (var i = 0; i < FAMILIES.length; i++) for (var j = 0; j < FAMILIES[i][1].length; j++) if (FAMILIES[i][1][j][1] === hex) return FAMILIES[i][1][j][0];
    return null;
  }
  var SCENES = { salon: "Salon", yatak: "Yatak odası", cocuk: "Çocuk odası" };
  var FINISH = { mat: "Mat", ipek: "İpek mat", yari: "Yarı parlak" };
  function comboText(c) {
    var t = "ana duvar " + c.wall.n + " (" + c.wall.h + ")";
    if (c.side && c.side.h !== c.wall.h) t += ", yan duvar " + c.side.n + " (" + c.side.h + ")";
    if (c.ceil) t += ", tavan " + c.ceil.n + " (" + c.ceil.h + ")";
    return t;
  }

  /* ---------- renk deneyici ---------- */
  var lab = $("[data-lab]");
  if (lab) {
    var room = new Room($("[data-room]", lab));
    var st = { scene: "salon", surf: "wall", fam: 3, finish: "mat", eve: false, linked: true,
      wall: { n: "Çekmeköy Çamı", h: "#216869" }, side: { n: "Çekmeköy Çamı", h: "#216869" }, ceil: { n: "Kireç Beyazı", h: "#F6F4EE" } };
    var saved = store("yigit_combo");
    var last = store("yigit_last");
    if (saved && saved.wall && saved.wall.h) { ["scene", "finish", "wall", "side", "ceil", "linked"].forEach(function (k) { if (saved[k] !== undefined) st[k] = saved[k]; }); }
    else if (last && last.h) { st.wall = { n: last.n, h: last.h }; st.side = { n: last.n, h: last.h }; }
    var famBox = $("[data-fams]", lab), swBox = $("[data-swatches]", lab), harmBox = $("[data-harm]", lab), favBox = $("[data-favs]", lab);
    var msgEl = $("[data-msg]", lab), waEl = $("[data-wa]", lab), toast = $("[data-toast]", lab), custom = $("[data-custom]", lab);
    var SURF = { wall: "Ana duvar", side: "Yan duvar", ceil: "Tavan" };

    var labMsg = function () {
      var m = "Merhaba, sitenizdeki renk deneyicide şu kombinasyonu beğendim:\n" +
        "Oda: " + SCENES[st.scene] + "\n" +
        "Ana duvar: " + st.wall.n + " (" + st.wall.h + ")\n" +
        (st.side.h !== st.wall.h ? "Yan duvar: " + st.side.n + " (" + st.side.h + ")\n" : "") +
        "Tavan: " + st.ceil.n + " (" + st.ceil.h + ")\n" +
        "Yüzey: " + FINISH[st.finish] + "\n\n" +
        "Bu tonlara yakın bir boya için bilgi ve keşif rica ediyorum.";
      return m;
    };
    var render = function (instantWall) {
      room.scene(st.scene); room.finish(st.finish); room.evening(st.eve);
      room.paintWall(st.wall.h, instantWall); room.paintSide(st.side.h); room.paintCeil(st.ceil.h);
      var cur = st[st.surf];
      setLabel(lab, cur.n, cur.h);
      $("[data-room-note]", lab).textContent = SURF[st.surf] + " · " + SCENES[st.scene];
      $$("[data-surf]", lab).forEach(function (b) { var k = b.getAttribute("data-surf"); b.setAttribute("aria-pressed", k === st.surf ? "true" : "false"); $("i", b).style.setProperty("--c", st[k].h); });
      $$("[data-scene-btn]", lab).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-scene-btn") === st.scene ? "true" : "false"); });
      $$("[data-finish]", lab).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-finish") === st.finish ? "true" : "false"); });
      $$("[data-light]", lab).forEach(function (b) { b.setAttribute("aria-pressed", (b.getAttribute("data-light") === "aksam") === st.eve ? "true" : "false"); });
      $$("button", famBox).forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.fam ? "true" : "false"); });
      swBox.innerHTML = "";
      FAMILIES[st.fam][1].forEach(function (c) {
        var b = el("button"); b.type = "button"; b.setAttribute("aria-pressed", cur.h.toUpperCase() === c[1] ? "true" : "false");
        b.setAttribute("aria-label", c[0] + ", " + SURF[st.surf].toLocaleLowerCase("tr") + " için seç");
        var i = el("i"); i.style.setProperty("--c", c[1]); b.appendChild(i); b.appendChild(el("span", "", c[0]));
        b.addEventListener("click", function () { apply(st.surf, c[0], c[1]); });
        swBox.appendChild(b);
      });
      if (custom) custom.value = cur.h;
      /* uyumlu renk önerileri */
      var hsl = rgbToHsl(hexToRgb(st.wall.h));
      var sug = [
        ["ceil", "Tavana açığı", st.wall.n + " açığı", hslToHex(hsl[0], Math.min(hsl[1] * 0.45, 30), 95)],
        ["side", "Yan duvara koyusu", st.wall.n + " koyusu", hslToHex(hsl[0], Math.min(hsl[1] * 1.05, 70), Math.max(hsl[2] - 24, 20))],
        ["side", "Yan duvara karşıtı", st.wall.n + " karşıtı", hslToHex(hsl[0] + 180, Math.max(Math.min(hsl[1], 55), 32), 60)]
      ];
      harmBox.innerHTML = "";
      sug.forEach(function (s) {
        var b = el("button"); b.type = "button";
        var i = el("i"); i.style.setProperty("--c", s[3]); b.appendChild(i);
        var sp = el("span"); sp.appendChild(el("b", "", s[1])); sp.appendChild(document.createTextNode(s[2] + " · " + s[3])); b.appendChild(sp);
        b.addEventListener("click", function () { apply(s[0], s[2], s[3], true); });
        harmBox.appendChild(b);
      });
      var m = labMsg(); msgEl.textContent = m; waEl.href = waLink(m);
      store("yigit_combo", { scene: st.scene, finish: st.finish, wall: st.wall, side: st.side, ceil: st.ceil, linked: st.linked });
      store("yigit_last", st.wall);
    };
    var apply = function (surf, name, hex, keepSurf) {
      hex = hex.toUpperCase();
      st[surf] = { n: name, h: hex };
      if (surf === "side") st.linked = false;
      if (surf === "wall" && st.linked) st.side = { n: name, h: hex };
      if (!keepSurf) st.surf = surf;
      toast.textContent = "";
      render();
    };
    var renderFavs = function () {
      var favs = store("yigit_fav") || [];
      favBox.innerHTML = "";
      if (!favs.length) { favBox.appendChild(el("p", "empty", "Henüz kayıt yok. Beğendiğiniz kombinasyonu kaydedin; keşif formunda da görünür.")); return; }
      favs.forEach(function (f, idx) {
        var row = el("div", "fav"), go = el("button", "fav__go"), sw = el("span", "fav__sw"), del = el("button", "fav__del", "×");
        go.type = "button"; del.type = "button"; del.setAttribute("aria-label", f.wall.n + " kaydını sil");
        [f.wall.h, (f.side || f.wall).h, f.ceil.h].forEach(function (h) { var i = el("i"); i.style.background = h; sw.appendChild(i); });
        go.appendChild(sw); go.appendChild(el("span", "", f.wall.n + " duvar, " + f.ceil.n + " tavan"));
        go.addEventListener("click", function () { st.wall = f.wall; st.side = f.side || f.wall; st.ceil = f.ceil; st.linked = st.side.h === st.wall.h; st.surf = "wall"; if (f.scene) st.scene = f.scene; if (f.finish) st.finish = f.finish; render(); });
        del.addEventListener("click", function () { var a = store("yigit_fav") || []; a.splice(idx, 1); store("yigit_fav", a); renderFavs(); });
        row.appendChild(go); row.appendChild(del); favBox.appendChild(row);
      });
    };
    var saveFav = function () {
      var favs = store("yigit_fav") || [], c = { wall: st.wall, side: st.side, ceil: st.ceil, scene: st.scene, finish: st.finish };
      var key = function (x) { return x.wall.h + (x.side || x.wall).h + x.ceil.h; };
      favs = favs.filter(function (x) { return key(x) !== key(c); });
      favs.unshift(c); favs = favs.slice(0, 4);
      store("yigit_fav", favs); renderFavs();
      toast.textContent = "Kaydedildi: " + st.wall.n + ". En çok 4 kombinasyon tutulur.";
    };
    FAMILIES.forEach(function (f, i) { var b = el("button", "", f[0]); b.type = "button"; b.addEventListener("click", function () { st.fam = i; render(); }); famBox.appendChild(b); });
    for (var fi = 0; fi < FAMILIES.length; fi++) for (var fj = 0; fj < 8; fj++) if (FAMILIES[fi][1][fj][1] === st.wall.h.toUpperCase()) st.fam = fi;
    $$("[data-surf]", lab).forEach(function (b) { b.addEventListener("click", function () { st.surf = b.getAttribute("data-surf"); render(); }); });
    $$("[data-scene-btn]", lab).forEach(function (b) { b.addEventListener("click", function () { st.scene = b.getAttribute("data-scene-btn"); render(); }); });
    $$("[data-finish]", lab).forEach(function (b) { b.addEventListener("click", function () { st.finish = b.getAttribute("data-finish"); render(); }); });
    $$("[data-light]", lab).forEach(function (b) { b.addEventListener("click", function () { st.eve = b.getAttribute("data-light") === "aksam"; render(); }); });
    if (custom) custom.addEventListener("input", function () { apply(st.surf, nameOf(custom.value) || "Özel renk", custom.value); });
    $("[data-save]", lab).addEventListener("click", saveFav);
    $("[data-copy]", lab).addEventListener("click", function () { copyText(labMsg(), toast); });
    $("[data-link-side]", lab).addEventListener("click", function () { st.linked = true; st.side = st.wall; render(); });
    $("[data-to-kesif]", lab).addEventListener("click", function () { saveFav(); });
    $$("[data-palette]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-palette").split("|"), nm = function (h) { return { n: nameOf(h) || "Özel renk", h: h }; };
        st.scene = p[0]; st.wall = nm(p[1]); st.side = nm(p[2]); st.ceil = nm(p[3]); st.linked = p[1] === p[2]; st.surf = "wall";
        for (var a = 0; a < FAMILIES.length; a++) for (var c = 0; c < 8; c++) if (FAMILIES[a][1][c][1] === p[1]) st.fam = a;
        render();
        lab.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });
    render(true); renderFavs();
  }

  /* ---------- keşif talebi ---------- */
  var req = $("[data-req]");
  if (req) {
    var form = $("form", req), out = $("[data-msg]", req), rWa = $("[data-wa]", req), rToast = $("[data-toast]", req);
    var cnt = { oda: 3, salon: 1 }, calcLine = "";
    var favWrap = $("[data-fav-picks]", req);
    (function () {
      var favs = store("yigit_fav") || [], lastC = store("yigit_last"), items = [];
      favs.forEach(function (f) { items.push({ label: f.wall.n + " duvar, " + f.ceil.n + " tavan", text: comboText(f), c: f.wall.h }); });
      if (lastC && lastC.h && !favs.some(function (f) { return f.wall.h === lastC.h; })) items.push({ label: lastC.n + " (son denediğiniz)", text: lastC.n + " (" + lastC.h + ")", c: lastC.h });
      if (!items.length) return;
      favWrap.innerHTML = "";
      items.forEach(function (it, i) {
        var l = el("label", "pick"), inp = el("input"), sp = el("span"), sw = el("i");
        inp.type = "checkbox"; inp.name = "renk"; inp.value = it.text; if (i === 0) inp.checked = true;
        sw.style.setProperty("--c", it.c); sp.appendChild(sw); sp.appendChild(document.createTextNode(it.label));
        l.appendChild(inp); l.appendChild(sp); favWrap.appendChild(l);
      });
    })();
    var vals = function (name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); };
    var val = function (name) { var e = form.elements[name]; return e && e.value ? String(e.value).trim() : ""; };
    var reqMsg = function () {
      var L = ["Merhaba, Yiğit İnşaat Yapı Dekorasyon. Keşif talebim var.", ""];
      var is = vals("is"); L.push("İş: " + (is.length ? is.join(", ") : "henüz seçmedim"));
      var mekan = vals("mekan")[0] || "";
      L.push("Mekân: " + (mekan ? mekan + ", " : "") + cnt.oda + "+" + cnt.salon);
      var m2 = val("m2").replace(",", "."); if (m2 && parseFloat(m2) > 0) L.push("Alan: yaklaşık " + String(parseFloat(m2)).replace(".", ",") + " m²");
      if (calcLine) L.push(calcLine);
      var tv = vals("tavan")[0]; if (tv) L.push("Tavanlar: " + tv);
      var ev = vals("ev")[0]; if (ev) L.push("Ev durumu: " + ev);
      var dv = vals("duvar"); if (dv.length) L.push("Duvar durumu: " + dv.join(", "));
      var rk = vals("renk"), rt = val("renkmetin"); if (rt) rk.push(rt); if (rk.length) L.push("Renk fikri: " + rk.join("; "));
      var semt = val("semt"); if (semt) L.push("Semt: " + semt);
      var zm = val("zaman"); if (zm) L.push("Uygun zaman: " + zm);
      var nt = val("not"); if (nt) L.push("Not: " + nt);
      L.push("");
      var ad = val("ad"); if (ad) L.push("Adım: " + ad);
      L.push("Keşif için ne zaman uygun olursunuz?");
      return L.join("\n");
    };
    var upd = function () {
      $("[data-oda]", req).textContent = cnt.oda; $("[data-salon]", req).textContent = cnt.salon; $("[data-plan]", req).textContent = cnt.oda + "+" + cnt.salon;
      var m = reqMsg(); out.textContent = m; rWa.href = waLink(m);
    };
    $$("[data-step]", req).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-step"), d = parseInt(b.getAttribute("data-d"), 10), mx = k === "oda" ? 12 : 4, mn = k === "oda" ? 1 : 0;
        cnt[k] = Math.max(mn, Math.min(mx, cnt[k] + d)); upd();
      });
    });
    form.addEventListener("input", upd); form.addEventListener("change", upd);
    form.addEventListener("submit", function (e) { e.preventDefault(); window.open(rWa.href, "_blank", "noopener"); });
    $("[data-copy]", req).addEventListener("click", function () { copyText(reqMsg(), rToast); });
    var q = /[?&]is=([\w-]+)/.exec(location.search);
    if (q) { var pre = $('input[name="is"][data-key="' + q[1] + '"]', form); if (pre) pre.checked = true; }

    /* boya alanı hesaplayıcı */
    var calc = $("[data-calc]");
    if (calc) {
      var roomsBox = $("[data-calc-rooms]", calc), NAMES = ["Salon", "Oda", "Oda", "Oda", "Mutfak", "Koridor"], nRoom = 0;
      var num = function (v) { var x = parseFloat(String(v).replace(",", ".")); return isFinite(x) && x > 0 ? x : 0; };
      var fmt = function (x) { return (Math.round(x * 10) / 10).toLocaleString("tr-TR", { maximumFractionDigits: 1 }); };
      var res = { wall: 0, ceil: 0 };
      var compute = function () {
        var wall = 0, ceil = 0;
        $$(".calc__room", roomsBox).forEach(function (r) {
          var en = num($('[data-f="en"]', r).value), boy = num($('[data-f="boy"]', r).value), h = num($('[data-f="h"]', r).value);
          var kapi = num($('[data-f="kapi"]', r).value), pen = num($('[data-f="pen"]', r).value);
          if (!en || !boy || !h) return;
          wall += Math.max(0, 2 * (en + boy) * h - kapi * 1.9 - pen * 1.7); ceil += en * boy;
        });
        var withCeil = $("[data-calc-ceil]", calc).checked, coats = num($("[data-calc-coats]", calc).value) || 2, cov = num($("[data-calc-cov]", calc).value) || 10;
        res.wall = wall; res.ceil = withCeil ? ceil : 0;
        var total = res.wall + res.ceil, litre = total * coats / cov;
        $("[data-o-wall]", calc).textContent = fmt(wall) + " m²";
        $("[data-o-ceil]", calc).textContent = withCeil ? fmt(ceil) + " m²" : "dahil değil";
        $("[data-o-total]", calc).textContent = fmt(total) + " m²";
        $("[data-o-litre]", calc).textContent = total ? "Yaklaşık " + fmt(Math.ceil(litre * 2) / 2) + " litre" : "Ölçüleri girin";
        $("[data-o-how]", calc).textContent = total ? fmt(total) + " m² × " + coats + " kat ÷ " + fmt(cov) + " m²/litre" : "";
      };
      var addRoom = function (en, boy) {
        nRoom++;
        var r = el("div", "calc__room"), top = el("div", "calc__top"), name = NAMES[Math.min(nRoom - 1, NAMES.length - 1)] + (nRoom > 1 && nRoom < 5 ? " " + (nRoom - 1) : "");
        top.appendChild(el("b", "", name));
        var del = el("button", "calc__del", "Çıkar"); del.type = "button"; del.setAttribute("aria-label", name + " satırını çıkar");
        del.addEventListener("click", function () { if ($$(".calc__room", roomsBox).length > 1) { roomsBox.removeChild(r); compute(); } });
        top.appendChild(del); r.appendChild(top);
        var f = el("div", "calc__f");
        [["en", "En (m)", en || ""], ["boy", "Boy (m)", boy || ""], ["h", "Yükseklik (m)", "2,7"], ["kapi", "Kapı", "1"], ["pen", "Pencere", "1"]].forEach(function (d) {
          var l = el("label", "", d[1]), i = el("input"); i.type = "text"; i.inputMode = "decimal"; i.value = d[2]; i.setAttribute("data-f", d[0]); i.autocomplete = "off";
          l.appendChild(i); f.appendChild(l);
        });
        r.appendChild(f); roomsBox.appendChild(r); compute();
      };
      calc.addEventListener("input", compute); calc.addEventListener("change", compute);
      $("[data-calc-add]", calc).addEventListener("click", function () { addRoom(); });
      $("[data-calc-use]", calc).addEventListener("click", function () {
        var t = $("[data-calc-toast]", calc);
        if (!res.wall) { t.textContent = "Önce en az bir odanın ölçülerini girin."; return; }
        calcLine = "Hesapladığım boyanacak alan: duvar " + fmt(res.wall) + " m²" + (res.ceil ? ", tavan " + fmt(res.ceil) + " m²" : "");
        upd(); t.textContent = "Talep mesajınıza eklendi.";
      });
      addRoom("5", "4");
    }
    upd();
  }

  /* ---------- hazırlık listesi ---------- */
  var chk = $("[data-check]");
  if (chk) {
    var boxes = $$("input[type=checkbox]", chk), bar = $("[data-prog]"), lbl = $("[data-prog-text]"), savedC = store("yigit_check") || [];
    var updC = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (bar) bar.style.width = (n / boxes.length * 100) + "%";
      if (lbl) lbl.textContent = n + " / " + boxes.length + " hazır";
      store("yigit_check", boxes.map(function (b) { return b.checked ? 1 : 0; }));
    };
    boxes.forEach(function (b, i) { if (savedC[i]) b.checked = true; b.addEventListener("change", updC); });
    updC();
  }

  /* ---------- iletişim: hızlı mesaj ---------- */
  var quick = $("[data-quick]");
  if (quick) {
    var qOut = $("[data-msg]", quick), qWa = $("[data-wa]", quick), qToast = $("[data-toast]", quick), qNote = $("[data-quick-note]", quick);
    var qMsg = function () {
      var t = $('input[name="konu"]:checked', quick), n = qNote.value.trim();
      return "Merhaba, Yiğit İnşaat Yapı Dekorasyon. " + (t ? t.value : "Bilgi almak istiyorum.") + (n ? "\n" + n : "");
    };
    var qUpd = function () { var m = qMsg(); qOut.textContent = m; qWa.href = waLink(m); };
    quick.addEventListener("input", qUpd); quick.addEventListener("change", qUpd);
    $("[data-copy]", quick).addEventListener("click", function () { copyText(qMsg(), qToast); });
    qUpd();
  }
  var copyAddr = $("[data-copy-addr]");
  if (copyAddr) copyAddr.addEventListener("click", function () {
    var t = $("[data-addr-toast]");
    copyText(copyAddr.getAttribute("data-copy-addr"), null); if (t) t.textContent = "Adres kopyalandı.";
  });
})();
