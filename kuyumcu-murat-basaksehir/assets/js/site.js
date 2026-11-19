/* Kuyumcu Murat · vitrin ışığı. Düz JS, bağımlılık yok. */
(function () {
  "use strict";

  var HOURS = { "0": [["09:30", "19:00"]], "1": [["09:30", "19:30"]], "2": [["09:30", "19:30"]], "3": [["09:30", "19:30"]], "4": [["09:30", "19:30"]], "5": [["09:30", "19:30"]] };
  var WA = "https://wa.me/905415792588";

  /* ---- açık/kapalı durumu (kit/status.js kopyası) ---- */
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
  function tr(n, d) { return n.toFixed(d).replace(".", ","); }
  function tr0(n, d) { return tr(n, d).replace(/,0+$/, ""); }
  function num(v) { var x = parseFloat(String(v).replace(",", ".")); return isNaN(x) ? null : x; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function radio(root, name) { var el = root.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function field(root, name) { var el = root.querySelector('[name="' + name + '"]'); return el ? el.value.replace(/\s+/g, " ").trim() : ""; }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- canlı durum, bugünün satırı, tabela, çizelge ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text; el.classList.toggle("is-open", s.open); el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", +el.getAttribute("data-day") === s.dayIndex); });
    $$("[data-sign]").forEach(function (el) {
      $("[data-sign-word]", el).textContent = s.open ? "Açık" : "Kapalı";
      $("[data-sign-sub]", el).textContent = s.open ? "Kapanış " + s.closesAt : (s.opensAt ? "Açılış " + s.opensWhen + " " + s.opensAt : "Saatler için arayın");
    });
    $$(".week__now").forEach(function (n) { n.parentNode.removeChild(n); });
    var track = $('.week li[data-day="' + s.dayIndex + '"] [data-track]');
    if (track && s.minutes >= 480 && s.minutes <= 1260) {
      var now = document.createElement("span");
      now.className = "week__now"; now.style.left = ((s.minutes - 480) / 780 * 100).toFixed(2) + "%";
      now.setAttribute("title", "Şu an");
      track.appendChild(now);
    }
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- menü ---- */
  var mb = $(".menu-btn"), nav = $("#nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      mb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); }
    });
  }

  /* ---- gezen spot + altın varak parıltısı ---- */
  var spot = $(".spot"), foils = $$(".foil");
  function setFoil(p) { var v = p.toFixed(1) + "% 0"; foils.forEach(function (el) { el.style.backgroundPosition = v; }); }
  if (spot && fine && !reduce) {
    var tx = innerWidth / 2, ty = innerHeight * 0.34, cx = tx, cy = ty, raf = 0;
    var loop = function () {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      spot.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      setFoil(78 - clamp(cx / innerWidth, 0, 1) * 56);
      raf = (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) ? requestAnimationFrame(loop) : 0;
    };
    addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop);
      var felt = e.target.closest ? e.target.closest(".tray__felt") : null;
      if (felt) { var r = felt.getBoundingClientRect(); felt.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px"); felt.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px"); }
    }, { passive: true });
  } else if (!reduce) {
    /* dokunmatikte spot sabit; altın, sayfa kaydıkça ışık alır */
    var tick = 0;
    addEventListener("scroll", function () {
      if (tick) return;
      tick = requestAnimationFrame(function () { tick = 0; setFoil(50 + Math.sin(scrollY / 240) * 40); });
    }, { passive: true });
  }

  /* ---- ana sayfa: fotoğrafta spot, hüzme ve lamba ---- */
  var hero = $("[data-hero]");
  if (hero) {
    var ph = $(".hero__photo", hero), lit = $(".hero__lit", hero), beam = $(".hero__beam", hero), lamp = $(".hero__lamp", hero), hint = $("[data-spot-hint]", hero);
    var W = 0, Hh = 0, R = 150, ax = 0, ay = 0, hx = 0, hy = 0, gx = 0, gy = 0, lastMove = 0, visible = true, hraf = 0;
    var measure = function () {
      var r = ph.getBoundingClientRect(); W = r.width; Hh = r.height;
      R = clamp(Math.min(W, Hh) * 0.36, 120, 230);
      ph.style.setProperty("--hr", R.toFixed(0) + "px");
      ax = W * 0.52; ay = Hh * 0.5;
    };
    var draw = function () {
      lit.style.setProperty("--hx", hx.toFixed(1) + "px"); lit.style.setProperty("--hy", hy.toFixed(1) + "px");
      var dx = hx - W / 2, ang = Math.atan2(dx, hy), len = Math.sqrt(dx * dx + hy * hy);
      if (beam) { beam.style.height = (len + R * 0.55).toFixed(0) + "px"; beam.style.transform = "rotate(" + (-ang).toFixed(4) + "rad)"; }
      if (lamp) lamp.style.transform = "rotate(" + (-ang).toFixed(4) + "rad)";
    };
    var frame = function (t) {
      hraf = 0;
      var idle = t - lastMove > 1600, txx = gx, tyy = gy;
      if (idle) { txx = gx + Math.sin(t / 2300) * W * 0.07; tyy = gy + Math.cos(t / 3100) * Hh * 0.045; }
      hx += (txx - hx) * 0.09; hy += (tyy - hy) * 0.09;
      draw();
      if (visible) hraf = requestAnimationFrame(frame);
    };
    var aim = function (e) {
      var r = ph.getBoundingClientRect();
      gx = clamp(e.clientX - r.left, 0, r.width); gy = clamp(e.clientY - r.top, 30, r.height);
      lastMove = performance.now();
      if (reduce) { hx = gx; hy = gy; draw(); }
    };
    measure(); gx = hx = ax; gy = hy = ay; draw();
    addEventListener("resize", function () { measure(); gx = ax; gy = ay; if (reduce) { hx = gx; hy = gy; draw(); } });
    if (fine) {
      hero.addEventListener("pointermove", aim, { passive: true });
      hero.addEventListener("pointerleave", function () { gx = ax; gy = ay; });
      if (hint) hint.textContent = "İmleci fotoğrafta gezdirin; vitrin ışığı sizi izler.";
    } else {
      ph.addEventListener("pointerdown", aim, { passive: true });
      if (hint) hint.textContent = "Fotoğrafa dokunun; ışık oraya döner.";
    }
    if (!reduce) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible && !hraf) hraf = requestAnimationFrame(frame);
        }).observe(hero);
      } else { hraf = requestAnimationFrame(frame); }
    }
  }

  /* ---- kopyalama ---- */
  function fallbackCopy(t) {
    try {
      var ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      var ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
    } catch (e) { return false; }
  }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return fallbackCopy(t); });
    }
    return Promise.resolve(fallbackCopy(t));
  }

  /* ---- artı/eksi kutuları ---- */
  $$("[data-step]").forEach(function (box) {
    var inp = $("input", box);
    $$("button", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var st = parseFloat(inp.step) || 1, v = num(inp.value); if (v === null) v = parseFloat(inp.min) || 0;
        v = Math.round((v + parseFloat(b.getAttribute("data-d")) * st) * 100) / 100;
        inp.value = clamp(v, parseFloat(inp.min), parseFloat(inp.max));
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  });

  /* ---- araç iskeleti: mesaj önizleme + WhatsApp bağlantısı + kopyala ---- */
  function bindTool(el, compose) {
    var msgEl = $("[data-msg]", el), wa = $("[data-wa]", el), cp = $("[data-copy]", el), note = $("[data-copied]", el), msg = "";
    function upd() {
      msg = compose(el) || "";
      if (msgEl) msgEl.textContent = msg;
      if (wa) wa.href = WA + "?text=" + encodeURIComponent(msg);
      if (note) note.textContent = "";
    }
    el.addEventListener("input", upd); el.addEventListener("change", upd);
    if (cp) cp.addEventListener("click", function () {
      copyText(msg).then(function (ok) {
        if (note) note.textContent = ok ? "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın.";
      });
    });
    upd();
    return upd;
  }
  var TOOLS = {};

  /* fiyat sor (ana sayfa) */
  TOOLS["fiyat-sor"] = function (el) {
    bindTool(el, function () {
      var u = radio(el, "f-urun"), i = radio(el, "f-islem"), a = field(el, "f-adet"), m;
      var ne = u === "takı" ? "bir takı" : u;
      if (i === "boz") m = "Merhaba, " + ne + " bozdurmak istiyorum. Güncel alış fiyatını öğrenebilir miyim?";
      else if (i === "bilgi") m = "Merhaba, " + ne + " için güncel alış ve satış fiyatını öğrenebilir miyim?";
      else m = "Merhaba, " + ne + " almak istiyorum. Güncel satış fiyatını öğrenebilir miyim?";
      if (a) m += " Miktar: " + a + ".";
      return m;
    });
  };

  /* yüzük ölçüsü hesabı: numara = iç çevre (mm) − 40 */
  function sizeOf(d) {
    var c = Math.PI * d, s = c - 40, us = (d - 11.63) / 0.8128, q = Math.round(us * 4) / 4, w = Math.floor(q);
    var f = { 0: "", 0.25: "¼", 0.5: "½", 0.75: "¾" }[q - w] || "";
    return { d: d, c: c, s: s, n: Math.round(s), eu: Math.round(c), us: q <= 0 ? "–" : ((w ? w : "") + f) };
  }
  function defaultPpm() {
    try { var v = parseFloat(localStorage.getItem("km_ppm")); if (v > 2 && v < 12) return { v: v, saved: true }; } catch (e) { }
    return { v: fine ? 3.78 : 6.3, saved: false };
  }

  /* mini ölçü (ana sayfa) */
  TOOLS["mini-olcu"] = function (el) {
    var rng = $('[name="m-cap"]', el), ring = $("[data-ring]", el), no = $("[data-no]", el), out = $("[data-mini-out]", el), link = $("[data-mini-link]");
    ring.style.setProperty("--ppm", "5.2");
    function upd() {
      var z = sizeOf(parseFloat(rng.value));
      ring.style.setProperty("--d", z.d);
      no.textContent = z.n;
      out.textContent = "İç çap " + tr(z.d, 1) + " mm · iç çevre " + tr0(z.c, 1) + " mm";
      if (link) link.href = "yuzuk-olcusu.html?cap=" + z.d.toFixed(1) + "#bulucu";
    }
    rng.addEventListener("input", upd); upd();
  };

  /* yüzük ölçüsü bulucu */
  TOOLS["yuzuk-olcusu"] = function (el) {
    var q = /[?&]cap=([\d.]+)/.exec(location.search), d = q ? clamp(parseFloat(q[1]) || 16.5, 13, 24) : 16.5;
    var P = defaultPpm(), ppm = P.v, calibrated = P.saved;
    var rng = $('[name="y-range"]', el), iCap = $('[name="y-cap"]', el), iCev = $('[name="y-cevre"]', el), iPpm = $('[name="y-ppm"]', el);
    var ring = $("[data-ring]", el), real = $("[data-real]", el), hint = $("[data-hint]", el), calibNote = $("[data-calib-note]", el);
    var refresh = function () { };
    function paint(src) {
      var z = sizeOf(d);
      if (src !== "range") rng.value = d;
      if (src !== "cap") iCap.value = d.toFixed(1);
      if (src !== "cevre") iCev.value = (Math.round(z.c * 2) / 2).toFixed(1);
      ring.style.setProperty("--d", d.toFixed(2)); ring.style.setProperty("--ppm", ppm.toFixed(3));
      el.style.setProperty("--ppm", ppm.toFixed(3));
      var ok = z.n >= 1 && z.n <= 36;
      $("[data-no]", el).textContent = ok ? z.n : "–";
      $('[data-out="d"]', el).textContent = tr(d, 1) + " mm";
      $('[data-out="c"]', el).textContent = tr0(z.c, 1) + " mm";
      $('[data-out="eu"]', el).textContent = z.eu;
      $('[data-out="us"]', el).textContent = z.us;
      var lo = Math.floor(z.s), hi = lo + 1;
      hint.textContent = !ok ? "Bu değer standart tablonun dışında kalıyor; ölçümü bir kez daha kontrol edin."
        : Math.abs(z.s - z.n) > 0.3 ? "İki ölçü arasındasınız (" + lo + " ile " + hi + "). Geniş yüzüklerde ve eklemi kalın parmaklarda büyük olanı seçin."
          : "Tablodaki en yakın ölçü " + z.n + ". Mağazada ölçü halkasıyla doğrulamanızı öneririz.";
      real.textContent = calibrated ? "Daire gerçek boyutta; yüzüğü üstüne koyup karşılaştırın" : "Daire yaklaşık boyutta; gerçek boyut için ekranı ayarlayın";
      $$("tr[data-size]").forEach(function (r) { r.classList.toggle("is-current", ok && +r.getAttribute("data-size") === z.n); });
      el._size = ok ? z : null;
    }
    function setD(v, src) { if (v === null || isNaN(v)) return; d = clamp(v, 13, 24); paint(src); }
    rng.addEventListener("input", function () { setD(parseFloat(rng.value), "range"); });
    iCap.addEventListener("input", function () { var v = num(iCap.value); if (v !== null && v >= 13 && v <= 24) setD(v, "cap"); });
    iCev.addEventListener("input", function () { var v = num(iCev.value); if (v !== null && v >= 41 && v <= 75) setD(v / Math.PI, "cevre"); });
    iCap.addEventListener("blur", function () { paint(""); }); iCev.addEventListener("blur", function () { paint(""); });
    /* yöntem sekmeleri */
    function mode() {
      var m = radio(el, "y-mod");
      $$("[data-panel]", el).forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; });
    }
    $$('[name="y-mod"]', el).forEach(function (r) { r.addEventListener("change", mode); });
    /* ekran ayarı */
    function ref() {
      var v = radio(el, "y-ref");
      $$("[data-ref]", el).forEach(function (x) { x.hidden = x.getAttribute("data-ref") !== v; });
    }
    $$('[name="y-ref"]', el).forEach(function (r) { r.addEventListener("change", ref); });
    function setPpm(v) {
      ppm = clamp(v, 2.5, 10); calibrated = true; iPpm.value = ppm;
      try { localStorage.setItem("km_ppm", ppm.toFixed(3)); } catch (e) { }
      if (calibNote) calibNote.textContent = "Ekran ayarı kaydedildi. Şimdi yüzüğü altın dairenin üstüne koyun.";
      paint("");
    }
    iPpm.value = ppm;
    iPpm.addEventListener("input", function (e) { e.stopPropagation(); setPpm(parseFloat(iPpm.value)); refresh(); });
    $$("[data-ppm]", el).forEach(function (b) { b.addEventListener("click", function () { setPpm(ppm + parseFloat(b.getAttribute("data-ppm")) * 0.02); refresh(); }); });
    mode(); ref(); paint("");
    refresh = bindTool(el, function () {
      var z = el._size, tur = radio(el, "y-tur"), kim = radio(el, "y-kim"), not = field(el, "y-not");
      var m = z ? "Merhaba, yüzük ölçümü buldum: " + z.n + " numara (iç çap " + tr(z.d, 1) + " mm, iç çevre " + tr0(z.c, 1) + " mm). "
        : "Merhaba, yüzük ölçümü bulmakta zorlandım; mağazada ölçtürmek istiyorum. ";
      m += tur ? tur + " bakıyorum, " + kim + ". " : "Model konusunda fikir almak istiyorum, " + kim + ". ";
      if (not) m += "Not: " + not + ". ";
      return m + "Mağazada ölçüyü doğrulayıp modelleri görebilir miyim?";
    });
  };

  /* bilezik ölçüsü (koleksiyon) */
  TOOLS["bilezik-olcu"] = function (el) {
    var inp = $('[name="b-cevre"]', el), rng = $('[name="b-range"]', el), c = 19, res = { d: 6.05, s: 6.2 };
    function calc(src) {
      var d = c / Math.PI, s = Math.ceil(d / 0.2 - 0.001) * 0.2;
      res = { d: d, s: s };
      if (src !== "inp") inp.value = c.toFixed(1); if (src !== "rng") rng.value = c;
      $("[data-b-no]", el).textContent = tr(s, 1);
      $("[data-b-out]", el).textContent = "Hesaplanan çap " + tr(d, 2) + " cm; bir üst bilezik ölçüsü " + tr(s, 1) + ".";
    }
    rng.addEventListener("input", function () { c = parseFloat(rng.value); calc("rng"); });
    inp.addEventListener("input", function () { var v = num(inp.value); if (v !== null && v >= 15 && v <= 27) { c = v; calc("inp"); } });
    calc("");
    bindTool(el, function () {
      return "Merhaba, bilezik bakıyorum. El çevrem " + tr(c, 1).replace(",0", "") + " cm, yaklaşık " + tr(res.s, 1) + " iç çap. Bu ölçüde hangi modeller var?";
    });
  };

  /* has altın (koleksiyon) */
  TOOLS["has-altin"] = function (el) {
    var MIL = { 8: 333, 14: 585, 18: 750, 21: 875, 22: 916, 24: 995 };
    bindTool(el, function () {
      var g = num(field(el, "h-gram")), a = parseInt(radio(el, "h-ayar"), 10) || 22;
      if (g === null || g <= 0) g = 0;
      var has = g * MIL[a] / 1000, gs = tr(g, 2).replace(/,?0+$/, ""), hs = tr(has, 2);
      $("[data-h-ayar]", el).textContent = a + " ayar";
      $("[data-h-bar]", el).style.setProperty("--k", a);
      $("[data-h-out]", el).textContent = g ? gs + " gram " + a + " ayar altında yaklaşık " + hs + " gram has altın bulunur (binde " + MIL[a] + ")." : "Gram değerini girin.";
      return g ? "Merhaba, elimde yaklaşık " + gs + " gram " + a + " ayar altın var (yaklaşık " + hs + " gram has). Bozdurmak istiyorum; güncel alış fiyatını öğrenebilir miyim?"
        : "Merhaba, elimdeki altını bozdurmak istiyorum; güncel alış fiyatını öğrenebilir miyim?";
    });
  };

  /* tamir talebi (hizmetler) */
  TOOLS["tamir"] = function (el) {
    bindTool(el, function () {
      var not = field(el, "t-not");
      return "Merhaba, tamir için bilgi almak istiyorum. Takı: " + radio(el, "t-taki") + ". Sorun: " + radio(el, "t-sorun") + ". " + (not ? "Not: " + not + ". " : "") + "Fotoğrafını gönderiyorum; getirdiğimde yapılabilir mi?";
    });
  };

  /* isimli kolye önizleme (hizmetler) */
  TOOLS["kolye"] = function (el) {
    var svg = $("[data-neck]", el), text = $("[data-name]", el), cl = $("[data-chain-l]", el), cr = $("[data-chain-r]", el), rl = $("[data-ring-l]", el), rr = $("[data-ring-r]", el);
    var RENK = { sari: "sarı altın", beyaz: "beyaz altın", rose: "rose altın" };
    function draw() {
      var name = field(el, "k-isim"), stil = radio(el, "k-stil"), renk = radio(el, "k-renk"), paint = "url(#nk-" + renk + ")";
      svg.classList.toggle("is-script", stil === "el");
      text.textContent = (stil === "el" ? name : name.toLocaleUpperCase("tr")) || "…";
      var fs = stil === "el" ? 64 : 50; text.setAttribute("font-size", fs);
      var b; try { b = text.getBBox(); } catch (e) { return; }
      if (b.width > 286) { fs = fs * 286 / b.width; text.setAttribute("font-size", fs.toFixed(1)); b = text.getBBox(); }
      var y = b.y + b.height * (stil === "el" ? 0.5 : 0.42), xl = b.x - 7, xr = b.x + b.width + 7;
      cl.setAttribute("d", "M14 0C22 " + (y * 0.55).toFixed(0) + " " + (xl - 46).toFixed(0) + " " + (y - 26).toFixed(0) + " " + (xl - 4).toFixed(0) + " " + (y - 2).toFixed(0));
      cr.setAttribute("d", "M346 0C338 " + (y * 0.55).toFixed(0) + " " + (xr + 46).toFixed(0) + " " + (y - 26).toFixed(0) + " " + (xr + 4).toFixed(0) + " " + (y - 2).toFixed(0));
      rl.setAttribute("cx", xl); rl.setAttribute("cy", y); rr.setAttribute("cx", xr); rr.setAttribute("cy", y);
      [text].forEach(function (n) { n.setAttribute("fill", paint); });
      [cl, cr, rl, rr].forEach(function (n) { n.setAttribute("stroke", paint); });
    }
    bindTool(el, function () {
      draw();
      var name = field(el, "k-isim"), boy = radio(el, "k-boy");
      return "Merhaba, isimli kolye yaptırmak istiyorum. İsim: " + (name || "(henüz yazmadım)") + ". Yazı: " + (radio(el, "k-stil") === "el" ? "el yazısı" : "klasik büyük harf") + ". Renk: " + RENK[radio(el, "k-renk")] + ". Zincir boyu: " + boy + ". Ayar ve gram seçeneklerini, güncel fiyatı öğrenebilir miyim?";
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  };

  /* hızlı mesaj (iletişim) */
  TOOLS["iletisim"] = function (el) {
    bindTool(el, function () {
      var ad = field(el, "i-ad"), z = radio(el, "i-zaman"), not = field(el, "i-not");
      var m = "Merhaba" + (ad ? ", ben " + ad : "") + ". " + radio(el, "i-konu").replace(/^./, function (c) { return c.toLocaleUpperCase("tr"); }) + " hakkında bilgi almak istiyorum.";
      if (not) m += " " + not + (/[.!?]$/.test(not) ? "" : ".");
      if (z) m += " " + z;
      return m;
    });
  };

  $$("[data-tool]").forEach(function (el) {
    var f = TOOLS[el.getAttribute("data-tool")];
    if (f) { try { f(el); } catch (e) { if (window.console) console.warn(e); } }
  });

  /* adres kopyalama (iletişim) */
  var ca = $("[data-copy-addr]"), addr = $("[data-addr]"), an = $("[data-addr-note]");
  if (ca && addr) ca.addEventListener("click", function () {
    copyText("Kuyumcu Murat, " + addr.textContent.trim()).then(function (ok) { if (an) an.textContent = ok ? "Adres kopyalandı." : "Kopyalanamadı; adresi seçip elle kopyalayın."; });
  });
})();
