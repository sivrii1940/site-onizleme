/* AHM.ET Gece Döneri — site betiği (bağımlılıksız). */
document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

var HOURS = { "0": [["12:00", "04:00"]], "1": [["12:00", "04:00"]], "2": [["12:00", "04:00"]], "3": [["12:00", "04:00"]], "4": [["12:00", "04:00"]], "5": [["12:00", "04:00"]], "6": [["09:00", "04:00"]] };
var SITE = { brand: "AHM.ET Gece Döneri", wa: "https://wa.me/905425587927", tel: "tel:+905425587927", phone: "0542 558 79 27" };

/* --- kit/status.js kopyası (değiştirilmedi) --- */
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
  var d = document, root = d.documentElement;
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $$(s, el) { return Array.prototype.slice.call((el || d).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function fmt(abs) { var m = ((Math.round(abs) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }

  /* Saniye duyarlı İstanbul saati */
  function clock() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      return { d: { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[o.weekday], s: (parseInt(o.hour, 10) % 24) * 3600 + parseInt(o.minute, 10) * 60 + parseInt(o.second, 10) };
    } catch (e) { var n = new Date(); return { d: (n.getDay() + 6) % 7, s: n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds() }; }
  }

  /* Türkçe saat ekleri: 04:00'te, 12:00'de, 09:00'da, 04:00'e kadar */
  var UNIT = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"], TEN = { 10: "on", 20: "yirmi", 30: "otuz", 40: "kırk", 50: "elli" };
  var LOC = { bir: "de", iki: "de", "üç": "te", "dört": "te", "beş": "te", "altı": "da", yedi: "de", sekiz: "de", dokuz: "da", on: "da", yirmi: "de", otuz: "da", "kırk": "ta", elli: "de", "sıfır": "da" };
  var DAT = { bir: "e", iki: "ye", "üç": "e", "dört": "e", "beş": "e", "altı": "ya", yedi: "ye", sekiz: "e", dokuz: "a", on: "a", yirmi: "ye", otuz: "a", "kırk": "a", elli: "ye", "sıfır": "a" };
  function lastWord(t) { var h = parseInt(t.slice(0, 2), 10) % 24, m = parseInt(t.slice(3, 5), 10), n = m || h; if (!n) return "sıfır"; return n % 10 ? UNIT[n % 10] : TEN[n]; }
  function at(t) { return t + "’" + LOC[lastWord(t)]; }
  function to(t) { return t + "’" + DAT[lastWord(t)]; }

  /* Açık aralıklar: gün d'nin başına göre dakika cinsinden (gece yarısını aşanlar dahil) */
  function intervalsFrom(day) {
    var out = [];
    for (var k = -1; k <= 8; k++) {
      var dd = ((day + k) % 7 + 7) % 7;
      (HOURS[String(dd)] || []).forEach(function (x) {
        var s = hm(x[0]), e = x[1] === "24:00" ? 1440 : hm(x[1]);
        if (e <= s) e += 1440;
        out.push([k * 1440 + s, k * 1440 + e]);
      });
    }
    out.sort(function (a, b) { return a[0] - b[0]; });
    var m = [];
    out.forEach(function (iv) {
      var l = m[m.length - 1];
      if (l && iv[0] <= l[1]) l[1] = Math.max(l[1], iv[1]); else m.push(iv.slice());
    });
    return m;
  }
  function stateAt(day, minute) {
    var ivs = intervalsFrom(day);
    for (var i = 0; i < ivs.length; i++) {
      if (minute >= ivs[i][0] && minute < ivs[i][1]) return { open: true, from: ivs[i][0], until: ivs[i][1] };
      if (ivs[i][0] > minute) return { open: false, until: ivs[i][0] };
    }
    return { open: false, until: null };
  }
  function whenWord(day, abs, closing) {
    var k = Math.floor(abs / 1440), mm = abs - k * 1440;
    if (closing && mm <= 360 && k <= 1) return "bu gece";
    if (k === 0) return "bugün";
    if (k === 1) return "yarın";
    return DAYS[(day + k) % 7];
  }

  /* ---------- canlı durum + sayaç ---------- */
  var lastText = "";
  function paintStatus() {
    var s = openStatus(HOURS);
    root.setAttribute("data-open", s.open ? "1" : "0");
    if (s.text !== lastText) {
      lastText = s.text;
      $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
      $$("[data-openflag]").forEach(function (el) { el.textContent = s.open ? "AÇIK" : "KAPALI"; el.classList.toggle("is-closed", !s.open); });
    }
  }
  function paintCountdown() {
    var boxes = $$("[data-countdown]");
    if (!boxes.length) return;
    var c = clock(), st = stateAt(c.d, c.s / 60);
    boxes.forEach(function (box) {
      var lab = box.querySelector("[data-cd-label]");
      if (st.until == null) { if (lab) lab.textContent = "Saatler için arayın"; return; }
      var secs = Math.max(0, Math.round(st.until * 60 - c.s));
      var set = function (sel, v) { var el = box.querySelector(sel); if (el && el.textContent !== v) el.textContent = v; };
      set("[data-cd-h]", pad(Math.floor(secs / 3600)));
      set("[data-cd-m]", pad(Math.floor(secs % 3600 / 60)));
      set("[data-cd-s]", pad(secs % 60));
      box.classList.toggle("is-closed", !st.open);
      if (lab) {
        var t = fmt(st.until), w = whenWord(c.d, st.until, st.open);
        var txt = st.open ? "Kapanışa kalan süre · " + w + " " + t : "Açılışa kalan süre · " + w + " " + t;
        if (lab.textContent !== txt) lab.textContent = txt;
      }
    });
  }
  function paintNow() {
    var c = clock(), m = c.s / 60, row = c.d, pos;
    if (m < 480) { row = (c.d + 6) % 7; pos = (m + 1440 - 480) / 1440; } else { pos = (m - 480) / 1440; }
    $$("[data-nightline]").forEach(function (nl) {
      $$(".nl-row", nl).forEach(function (r) {
        r.classList.toggle("is-now", parseInt(r.getAttribute("data-day"), 10) === row);
        var old = r.querySelector(".nl-now"); if (old) old.parentNode.removeChild(old);
      });
      var tr = nl.querySelector('.nl-row[data-day="' + row + '"] .nl-track');
      if (tr) {
        var mark = d.createElement("span");
        mark.className = "nl-now"; mark.style.left = (pos * 100).toFixed(2) + "%";
        mark.innerHTML = "<b>şimdi " + fmt(m) + "</b>";
        if (pos > .86) mark.firstChild.style.transform = "translateX(-85%)";
        if (pos < .1) mark.firstChild.style.transform = "translateX(-15%)";
        tr.appendChild(mark);
      }
    });
    $$("[data-hours] tr[data-day]").forEach(function (tr) { tr.classList.toggle("is-now", parseInt(tr.getAttribute("data-day"), 10) === row); });
  }
  paintStatus(); paintCountdown(); paintNow();
  setInterval(function () { paintCountdown(); }, 1000);
  setInterval(function () { paintStatus(); paintNow(); }, 30000);

  /* ---------- gezinme ---------- */
  var tog = d.querySelector(".nav-toggle"), nav = d.getElementById("site-nav");
  if (tog && nav) {
    var close = function () { nav.classList.remove("is-open"); tog.setAttribute("aria-expanded", "false"); };
    tog.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open); tog.setAttribute("aria-expanded", open ? "true" : "false");
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    d.addEventListener("click", function (e) { if (!nav.contains(e.target) && !tog.contains(e.target)) close(); });
  }

  /* ---------- ortak: mesaj, kopyalama ---------- */
  function waHref(msg) { return SITE.wa + "?text=" + encodeURIComponent(msg); }
  function setMsg(box, msg) {
    box.setAttribute("data-message", msg);
    var p = box.querySelector("[data-msg]"); if (p) p.textContent = msg;
    $$("[data-wa]", box).forEach(function (a) { a.href = waHref(msg); });
  }
  function fallbackCopy(txt) {
    var ta = d.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
    d.body.appendChild(ta); ta.select();
    var ok = false; try { ok = d.execCommand("copy"); } catch (e) { ok = false; }
    d.body.removeChild(ta); return ok;
  }
  function flash(btn, ok) {
    var lab = btn.querySelector("[data-copy-label]") || btn;
    if (!lab.getAttribute("data-orig")) lab.setAttribute("data-orig", lab.textContent);
    lab.textContent = ok ? "Kopyalandı" : "Kopyalanamadı";
    setTimeout(function () { lab.textContent = lab.getAttribute("data-orig"); }, 1800);
  }
  d.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-copy]") : null;
    if (!btn) return;
    var holder = btn.closest("[data-message]");
    var txt = btn.getAttribute("data-copy-text") || (holder && holder.getAttribute("data-message")) || "";
    if (!txt) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(function () { flash(btn, true); }, function () { flash(btn, fallbackCopy(txt)); });
    } else flash(btn, fallbackCopy(txt));
  });

  function form(box) {
    return {
      num: function (n) { var i = box.querySelector('[name="' + n + '"]'); return i ? Math.max(0, parseInt(i.value, 10) || 0) : 0; },
      one: function (n) { var i = box.querySelector('[name="' + n + '"]:checked'); return i ? i.value : null; },
      many: function (n) { return $$('[name="' + n + '"]:checked', box).map(function (i) { return i.value; }); },
      val: function (n) { var i = box.querySelector('[name="' + n + '"]'); return i ? String(i.value || "").trim() : ""; }
    };
  }
  /* +/- düğmeleri */
  d.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-step]") : null;
    if (!b) return;
    var scope = b.closest("[data-tool]") || d, inp = scope.querySelector('[name="' + b.getAttribute("data-for") + '"]');
    if (!inp) return;
    var v = (parseInt(inp.value, 10) || 0) + parseInt(b.getAttribute("data-step"), 10);
    v = Math.max(parseInt(inp.min || "0", 10), Math.min(parseInt(inp.max || "999", 10), v));
    inp.value = v;
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  });

  /* ---------- kilo hesaplayıcı ---------- */
  var PROD = {
    doner: { label: "Döner", g: 150, cls: "b-doner" },
    et: { label: "Et döner", g: 150, cls: "b-doner" },
    tavuk: { label: "Tavuk döner", g: 150, cls: "b-tavuk" },
    kanat: { label: "Kilo ile kanat", g: 300, cls: "b-kanat" }
  };
  var ISTAH = { hafif: [0.8, "hafif"], normal: [1, "normal"], doyurucu: [1.25, "doyurucu"] };
  var SOFRA = { tek: [1, "sofradaki tek ana yemek"], yanli: [0.85, "yanında pilav, meze, salata da var"], kalabalik: [0.65, "sofrada başka ana yemekler de var"] };
  var YAN = { lavas: "lavaş / ekmek", sogus: "söğüş", tursu: "turşu", ayran: "ayran / içecek" };
  function ceilQ(kg) { return Math.max(0.25, Math.ceil(kg * 4 - 1e-9) / 4); }
  function kgTxt(x) { return x.toFixed(2).replace(".", ","); }

  function initCalc(box) {
    var f = form(box), mini = box.hasAttribute("data-calc-mini");
    var readEl = box.querySelector("[data-kg]"), shown = null, raf = null;
    if (!mini && location.search) {
      try {
        var q = new URLSearchParams(location.search);
        var y = parseInt(q.get("y"), 10), c = parseInt(q.get("c"), 10), u = q.get("u");
        if (y > 0) box.querySelector('[name="yetiskin"]').value = Math.min(y, 120);
        if (c >= 0) box.querySelector('[name="cocuk"]').value = Math.min(c, 60);
        if (u) {
          var want = u.split(",");
          $$('[name="urun"]', box).forEach(function (i) { i.checked = want.indexOf(i.value) > -1; });
        }
      } catch (e) { /* parametre okunamadı: varsayılanlar kalır */ }
    }
    function showKg(target) {
      if (!readEl) return;
      if (reduce || shown === null) { shown = target; readEl.textContent = kgTxt(target); return; }
      var from = shown, t0 = null;
      if (raf) cancelAnimationFrame(raf);
      var step = function (ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / 320), v = from + (target - from) * (1 - Math.pow(1 - k, 3));
        readEl.textContent = kgTxt(Math.round(v * 100) / 100);
        if (k < 1) raf = requestAnimationFrame(step); else { shown = target; readEl.textContent = kgTxt(target); }
      };
      raf = requestAnimationFrame(step);
    }
    function whenText() {
      var g = f.val("gun"), t = f.val("saat"), warn = box.querySelector("[data-timewarn]");
      var base = g === "1" ? "yarın" : g === "x" ? "başka bir gün (notta yazdım)" : "bugün";
      if (warn) warn.hidden = true;
      if (!t || g === "x") return g === "x" ? base : base + ", saati birlikte belirleyelim";
      var mm = hm(t), night = mm < 360, c = clock(), dayIdx = (c.d + (g === "1" ? 1 : 0) + (night ? 1 : 0)) % 7;
      var st = stateAt(dayIdx, mm);
      if (warn && !st.open) {
        warn.textContent = "Seçtiğiniz saatte tezgâh kapalı görünüyor. Açık saatler: Pazartesi–Cumartesi 12:00–04:00, Pazar 09:00–04:00.";
        warn.hidden = false;
      }
      return base + (night ? ", gece " : " ") + t + " civarı";
    }
    function update() {
      var ad = f.num("yetiskin"), co = mini ? 0 : f.num("cocuk");
      if (ad + co < 1) ad = 1;
      var P = ad + co * 0.5;
      var ist = mini ? ISTAH.normal : (ISTAH[f.one("istah")] || ISTAH.normal);
      var sof = mini ? SOFRA.tek : (SOFRA[f.one("sofra")] || SOFRA.tek);
      var prods;
      if (mini) { var u = f.one("urun") || "doner"; prods = u === "karisik" ? ["doner", "kanat"] : [u]; }
      else prods = f.many("urun");
      var brk = box.querySelector("[data-breakdown]"), blocks = box.querySelector("[data-blocks]");
      if (!prods.length) {
        showKg(0);
        if (brk) brk.textContent = "Döner ya da kanattan en az birini seçin.";
        if (blocks) blocks.innerHTML = "";
        setMsg(box, "Merhaba " + SITE.brand + ", kilo ile sipariş için bilgi almak istiyorum.");
        return;
      }
      var lines = [], total = 0;
      prods.forEach(function (p) {
        var kg = ceilQ(P * ist[0] * sof[0] / prods.length * PROD[p].g / 1000);
        total += kg; lines.push({ p: p, kg: kg });
      });
      showKg(total);
      if (brk) {
        if (brk.tagName === "UL") brk.innerHTML = lines.map(function (l) { return "<li>" + PROD[l.p].label + ": <b>yaklaşık " + kgTxt(l.kg) + " kg</b></li>"; }).join("");
        else brk.textContent = lines.map(function (l) { return PROD[l.p].label + " yaklaşık " + kgTxt(l.kg) + " kg"; }).join(" + ");
      }
      if (blocks) {
        var html = "", n = 0, cap = mini ? 32 : 48;
        lines.forEach(function (l) { for (var i = 0; i < Math.round(l.kg / 0.25); i++) { n++; if (n <= cap) html += '<i class="' + PROD[l.p].cls + '"></i>'; } });
        if (n > cap) html += "<em>+" + (n - cap) + "</em>";
        blocks.innerHTML = html;
        blocks.setAttribute("title", "Her blok çeyrek kilo");
      }
      var more = box.querySelector("[data-more]");
      if (more) more.href = "kilo-ile-siparis.html?y=" + ad + "&u=" + (prods.join(",").replace("doner", "et"));

      var L = [];
      if (mini) {
        L.push("Merhaba " + SITE.brand + ", kilo ile sipariş vermek istiyorum.");
        L.push("Kişi: " + ad);
        lines.forEach(function (l) { L.push("• " + PROD[l.p].label + ": yaklaşık " + kgTxt(l.kg) + " kg"); });
        L.push("Miktarı ve fiyatı teyit edebilir misiniz?");
      } else {
        var yan = f.many("yan"), bread = Math.ceil(ad * 1.5 + co);
        var br = box.querySelector("[data-bread]");
        if (br) br.textContent = yan.indexOf("lavas") > -1 ? "Lavaş / ekmek için kabaca " + bread + " adet düşünün (kişi başı bir buçuk, çocuğa bir)." : "Yanına lavaş ya da ekmek isterseniz “Yanına” bölümünden seçin.";
        L.push("Merhaba " + SITE.brand + ", kilo ile sipariş vermek istiyorum.");
        L.push("Kişi: " + ad + " yetişkin" + (co ? " + " + co + " çocuk" : "") + " (iştah " + ist[1] + "; " + sof[1] + ")");
        L.push("Sitedeki hesaplayıcının önerisi:");
        lines.forEach(function (l) { L.push("• " + PROD[l.p].label + ": yaklaşık " + kgTxt(l.kg) + " kg"); });
        if (yan.length) L.push("Yanına: " + yan.map(function (y) { return y === "lavas" ? YAN[y] + " (yaklaşık " + bread + " adet)" : YAN[y]; }).join(", "));
        L.push("Teslim: " + (f.one("teslim") === "paket" ? "paket servis (adresimi yazacağım; bölgeme geliyor mu?)" : "gelip alacağım"));
        L.push("Zaman: " + whenText());
        var note = f.val("not"); if (note) L.push("Not: " + note);
        L.push("Miktarı ve fiyatı teyit edebilir misiniz? Teşekkürler.");
      }
      setMsg(box, L.join("\n"));
    }
    box.addEventListener("input", update);
    box.addEventListener("change", update);
    update();
  }
  $$("[data-calc]").forEach(initCalc);

  /* ---------- sipariş fişi ---------- */
  var TUR = { durum: "dürüm", ekmek: "ekmek arası", porsiyon: "porsiyon", pilav: "pilav üstü" };
  var ET = { et: "Et döner", tavuk: "Tavuk döner", kanat: "Kanat" };
  var DEF_IC = ["domates", "sogan", "maydanoz", "yesillik"];
  var NO = { domates: "domatessiz", sogan: "soğansız", maydanoz: "maydanozsuz", yesillik: "yeşilliksiz" };
  var WITH = { tursu: "turşulu", patates: "patatesli" };
  var SOSW = { mayonez: "mayonezli", ketcap: "ketçaplı", acisos: "acı soslu" };
  var ACI = { yok: "acısız", az: "az acılı", bol: "bol acılı" };
  function initSlip(box) {
    var f = form(box), items = [], list = box.querySelector("[data-lines]"), live = box.querySelector("[data-slip-live]");
    function current() {
      var ic = f.many("ic"), det = [];
      DEF_IC.forEach(function (x) { if (ic.indexOf(x) < 0) det.push(NO[x]); });
      ic.forEach(function (x) { if (WITH[x]) det.push(WITH[x]); });
      f.many("sos").forEach(function (x) { det.push(SOSW[x]); });
      var a = f.one("aci"); if (a && ACI[a]) det.push(ACI[a]);
      var n = Math.max(1, f.num("adet"));
      return n + " × " + ET[f.one("et") || "et"] + " " + TUR[f.one("tur") || "durum"] + (det.length ? " — " + det.join(", ") : "");
    }
    function render() {
      list.innerHTML = "";
      if (!items.length) {
        var li = d.createElement("li"); li.className = "slip-empty";
        li.textContent = "Fiş boş. Eklemeden gönderirseniz, soldaki seçim tek kalem olarak mesaja girer: " + current();
        list.appendChild(li);
      }
      items.forEach(function (t, i) {
        var li = d.createElement("li"), s = d.createElement("span"), b = d.createElement("button");
        s.textContent = (i + 1) + ") " + t;
        b.type = "button"; b.textContent = "×"; b.setAttribute("aria-label", "Fişten çıkar: " + t);
        b.addEventListener("click", function () { items.splice(i, 1); render(); });
        li.appendChild(s); li.appendChild(b); list.appendChild(li);
      });
      var lines = items.length ? items : [current()];
      var L = ["Merhaba " + SITE.brand + ", sipariş vermek istiyorum:"];
      lines.forEach(function (t, i) { L.push((i + 1) + ") " + t); });
      L.push("Teslim: " + (f.one("teslim") === "paket" ? "paket servis (adresim aşağıda; bölgeme geliyor mu?)" : "gelip alacağım"));
      var note = f.val("not"); if (note) L.push((f.one("teslim") === "paket" ? "Adres / not: " : "Not: ") + note);
      L.push("Uygunluğu ve toplam tutarı teyit edebilir misiniz? Teşekkürler.");
      setMsg(box, L.join("\n"));
    }
    var add = box.querySelector("[data-add]");
    if (add) add.addEventListener("click", function () {
      items.push(current());
      var adet = box.querySelector('[name="adet"]'); if (adet) adet.value = 1;
      if (live) live.textContent = "Fişe eklendi. Fişte " + items.length + " kalem var.";
      render();
    });
    box.addEventListener("input", render);
    box.addEventListener("change", render);
    render();
  }
  $$("[data-slip]").forEach(initSlip);

  /* ---------- o saatte açık mı? + 24 saat kadranı ---------- */
  function arcPath(a, b, r, c) {
    var p = function (m) { var t = m / 1440 * Math.PI * 2 - Math.PI / 2; return (c + r * Math.cos(t)).toFixed(2) + " " + (c + r * Math.sin(t)).toFixed(2); };
    var large = (b - a) > 720 ? 1 : 0;
    return "M" + p(a) + " A" + r + " " + r + " 0 " + large + " 1 " + p(b);
  }
  function initTimecheck(box) {
    var sel = box.querySelector('[name="gun"]'), tim = box.querySelector('[name="saat"]'), out = box.querySelector("[data-tc-result]");
    var arcs = box.querySelector("[data-dial-arcs]"), hand = box.querySelector("[data-dial-hand]");
    var dayT = box.querySelector("[data-dial-day]"), timeT = box.querySelector("[data-dial-time]");
    function run() {
      var dd = parseInt(sel.value, 10) || 0, t = tim.value || "00:00", m = hm(t), st = stateAt(dd, m);
      out.classList.toggle("is-closed", !st.open);
      if (st.open) {
        var fd = DAYS[((dd + Math.floor(st.from / 1440)) % 7 + 7) % 7], ud = DAYS[(dd + Math.floor(st.until / 1440)) % 7];
        out.innerHTML = "<b>Açık</b> " + fd + " " + at(fmt(st.from)) + " açılan tezgâh " + ud + " " + to(fmt(st.until)) + " kadar açık.";
      } else if (st.until != null) {
        var nd = DAYS[(dd + Math.floor(st.until / 1440)) % 7];
        out.innerHTML = "<b>Kapalı</b> En yakın açılış: " + nd + " " + fmt(st.until) + ".";
      }
      if (arcs) {
        var html = "";
        intervalsFrom(dd).forEach(function (iv) {
          var a = Math.max(0, iv[0]), b = Math.min(1440, iv[1]);
          if (b - a <= 0) return;
          if (b - a >= 1440) { html += '<path class="dial-arc" d="' + arcPath(0, 720, 110, 150) + '"/><path class="dial-arc" d="' + arcPath(720, 1439.9, 110, 150) + '"/>'; return; }
          html += '<path class="dial-arc" d="' + arcPath(a, b, 110, 150) + '"/>';
        });
        arcs.innerHTML = html;
      }
      if (hand) hand.setAttribute("transform", "rotate(" + (m / 1440 * 360).toFixed(2) + " 150 150)");
      if (dayT) dayT.textContent = DAYS[dd];
      if (timeT) timeT.textContent = t;
    }
    function setNow() {
      var c = clock();
      sel.value = String(c.d);
      tim.value = pad(Math.floor(c.s / 3600)) + ":" + pad(Math.floor(c.s % 3600 / 60));
      run();
    }
    var nowBtn = box.querySelector("[data-tc-now]");
    if (nowBtn) nowBtn.addEventListener("click", setNow);
    sel.addEventListener("change", run); tim.addEventListener("input", run); tim.addEventListener("change", run);
    setNow();
  }
  $$("[data-timecheck]").forEach(initTimecheck);

  /* ---------- hızlı mesaj ---------- */
  var KONU = {
    siparis: "sipariş vermek istiyorum.",
    kilo: "kilo ile sipariş hakkında bilgi almak istiyorum.",
    paket: "adresime paket servis olup olmadığını öğrenmek istiyorum.",
    bilgi: "bilgi almak istiyorum."
  };
  function initContact(box) {
    var f = form(box);
    function update() {
      var L = ["Merhaba " + SITE.brand + ", " + (KONU[f.one("konu")] || KONU.bilgi)];
      var m = f.val("mesaj"), ad = f.val("ad");
      if (m) L.push(m);
      if (ad) L.push("— " + ad);
      setMsg(box, L.join("\n"));
    }
    box.addEventListener("input", update); box.addEventListener("change", update); update();
  }
  $$("[data-contact]").forEach(initContact);

  /* ---------- kontrol listesi ---------- */
  $$("[data-checklist]").forEach(function (box) {
    var KEY = "agd-kontrol-listesi", boxes = $$('input[type="checkbox"]', box), saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { saved = []; }
    boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; });
    function count() {
      var done = [];
      boxes.forEach(function (b, i) { if (b.checked) done.push(i); });
      var el = box.querySelector("[data-check-done]"); if (el) el.textContent = done.length;
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* depolama kapalı */ }
    }
    box.addEventListener("change", count);
    var r = box.querySelector("[data-check-reset]");
    if (r) r.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); count(); });
    count();
  });

  /* ---------- SSS süzgeci ---------- */
  var filt = d.querySelector("[data-faq-filter]");
  if (filt) {
    var none = d.querySelector("[data-faq-none]");
    var norm = function (s) { return s.toLocaleLowerCase("tr"); };
    filt.addEventListener("input", function () {
      var q = norm(filt.value.trim()), shown = 0;
      $$(".faq-group").forEach(function (g) {
        var any = 0;
        $$("details", g).forEach(function (det) {
          var hit = !q || norm(det.textContent).indexOf(q) > -1;
          det.hidden = !hit; if (hit) any++;
          if (q && hit) det.open = true;
        });
        g.hidden = !any; shown += any;
      });
      if (none) none.hidden = shown > 0;
    });
  }
})();
