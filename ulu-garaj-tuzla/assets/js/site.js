/* Ulu Garaj · Tuzla Detailing — site.js (kütüphanesiz) */
(function () {
  "use strict";

  var WA = "https://wa.me/905412992957";
  var HOURS = { "0": [["09:00", "21:00"]], "1": [["09:00", "21:00"]], "2": [["09:00", "21:00"]], "3": [["09:00", "21:00"]], "4": [["09:00", "21:00"]], "5": [["09:00", "21:00"]], "6": [["09:00", "21:00"]] };

  /* --- kit/status.js'ten kopya: açık/kapalı durumu --- */
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

  /* --- yardımcılar --- */
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(d, opt) {
    opt.timeZone = "Europe/Istanbul";
    try { return new Intl.DateTimeFormat("tr-TR", opt).format(d); } catch (e) { delete opt.timeZone; return new Intl.DateTimeFormat("tr-TR", opt).format(d); }
  }
  function todayStr() {
    var d = new Date();
    try { return fmt(d, { day: "2-digit", month: "2-digit", year: "numeric" }); } catch (e) { return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear(); }
  }
  function cap(s) { return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1); }
  function dayInfo(k) {
    var d = new Date(Date.now() + k * 864e5);
    var wd = cap(fmt(d, { weekday: "long" }));
    var dm = fmt(d, { day: "numeric", month: "long" });
    var sm = fmt(d, { day: "numeric", month: "short" });
    return { name: k === 0 ? "Bugün" : k === 1 ? "Yarın" : wd, short: sm, value: (k === 0 ? "bugün, " : k === 1 ? "yarın, " : "") + dm + " " + wd };
  }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  var OPS = { "ic-dis": "İç dış yıkama", "detayli-ic": "Detaylı iç temizlik", "koltuk": "Koltuk yıkama", "motor": "Motor temizliği", "pasta-cila": "Pasta cila", "koruma": "Seramik / boya koruma", "emin-degil": "Emin değilim, önerinizi isterim" };
  var CARS = { hatchback: "Hatchback", sedan: "Sedan", station: "Station wagon", suv: "SUV / Crossover", pickup: "Pick-up", ticari: "Ticari / Van" };

  /* --- canlı durum + mesai kartı --- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-punch]").forEach(function (card) {
      $$("tr[data-day]", card).forEach(function (tr) { tr.classList.toggle("is-today", +tr.getAttribute("data-day") === s.dayIndex); });
      var now = $("[data-now]", card); if (now) now.style.left = (s.minutes / 1440 * 100).toFixed(2) + "%";
      var st = $("[data-punch-stamp]", card); if (st) st.textContent = s.open ? "AÇIK" : "KAPALI";
    });
    $$("[data-open-stamp]").forEach(function (el) { el.textContent = s.open ? "ŞU AN AÇIK" : "ŞU AN KAPALI"; });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  var today = todayStr();
  $$("[data-today]").forEach(function (el) { el.textContent = today; });
  $$("[data-today-stamp]").forEach(function (el) { el.textContent = "Ulu Garaj · " + today; });

  /* --- menü --- */
  var mb = $(".menu-btn");
  if (mb) {
    var setNav = function (open) { mb.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("nav-open", open); };
    mb.addEventListener("click", function () { setNav(mb.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setNav(false); mb.focus(); } });
    $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  }

  /* --- imza: ana sayfadaki kısa iş emri (kalem kendisi doldurur, sonra siz) --- */
  var mini = $("#mini-form");
  if (mini) (function () {
    var out = $("#mini-msg"), waA = $("#mini-wa"), full = $("#mini-full"), stamp = $(".mini-stamp", mini), pen = $(".pen", mini), hint = $(".mini-hint", mini), date = $("[data-today]", mini);
    var running = false, done = false, timers = [];
    function state() {
      var c = mini.querySelector("input[name=arac]:checked");
      return { car: c ? c.value : "", ops: $$("input[name=islem]:checked", mini).map(function (i) { return i.value; }), note: (mini.elements.not.value || "").trim() };
    }
    function build() {
      var s = state(), msg;
      if (!s.car && !s.ops.length && !s.note) msg = "Merhaba Ulu Garaj, aracım için bilgi almak istiyorum.";
      else {
        var L = ["Merhaba Ulu Garaj, kısa iş emrim:"];
        if (s.car) L.push("- Araç: " + CARS[s.car]);
        if (s.ops.length) L.push("- İşlemler: " + s.ops.map(function (v) { return OPS[v]; }).join(", "));
        if (s.note) L.push("- Not: " + s.note);
        L.push("Uygun gün ve saat için bilgi alabilir miyim?");
        msg = L.join("\n");
      }
      out.textContent = msg;
      waA.href = waLink(msg);
      var q = [];
      if (s.car) q.push("arac=" + s.car);
      if (s.ops.length) q.push("islem=" + s.ops.join(","));
      if (s.note) q.push("not=" + encodeURIComponent(s.note));
      full.href = "is-emri.html" + (q.length ? "?" + q.join("&") : "") + "#form";
      if (!running) stamp.classList.toggle("is-on", !!(s.car && s.ops.length));
    }
    function penTo(x, y) { pen.style.transform = "translate(" + Math.round(x - 4.6) + "px," + Math.round(y - 87.4) + "px)"; }
    function penAt(el, where) {
      var b = mini.getBoundingClientRect(), r = el.getBoundingClientRect();
      var x = where === "end" ? r.right - b.left - 2 : where === "start" ? r.left - b.left + 2 : r.left - b.left + Math.min(r.width / 2, 14);
      penTo(x, r.top - b.top + r.height * 0.62);
    }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function tick(inp) { inp.checked = true; build(); }
    function finish() {
      timers.forEach(clearTimeout); timers = [];
      running = false; done = true;
      date.classList.add("is-written");
      pen.classList.remove("is-on");
      pen.style.transitionDuration = "";
      build();
      if (hint) hint.classList.add("is-on");
    }
    function stop() { if (running) finish(); if (hint) hint.classList.remove("is-on"); }
    function run() {
      if (running || done) return;
      running = true;
      var car = mini.querySelector("input[value=sedan]").closest(".car-opt");
      var o1 = mini.querySelector("input[value=ic-dis]").closest(".op");
      var o2 = mini.querySelector("input[value=detayli-ic]").closest(".op");
      pen.style.transition = "none"; penTo(mini.clientWidth - 70, 30); void pen.offsetWidth; pen.style.transition = "";
      pen.classList.add("is-on");
      var t = 120;
      later(function () { penAt(date, "start"); }, t); t += 560;
      later(function () { pen.style.transitionDuration = ".7s"; penAt(date, "end"); date.classList.add("is-written"); }, t); t += 780;
      later(function () { pen.style.transitionDuration = ""; penAt($(".car", car)); }, t); t += 560;
      later(function () { tick($("input", car)); }, t); t += 520;
      later(function () { penAt($(".box", o1)); }, t); t += 540;
      later(function () { tick($("input", o1)); }, t); t += 400;
      later(function () { penAt($(".box", o2)); }, t); t += 460;
      later(function () { tick($("input", o2)); }, t); t += 420;
      later(function () { penTo(mini.clientWidth * 0.62, mini.clientHeight * 0.5); pen.classList.remove("is-on"); }, t); t += 260;
      later(finish, t);
    }
    ["pointerdown", "keydown"].forEach(function (ev) { mini.addEventListener(ev, stop); });
    mini.addEventListener("change", function () { stop(); build(); });
    mini.addEventListener("input", build);
    mini.addEventListener("submit", function (e) { e.preventDefault(); });
    build();
    if (reduce) {
      mini.querySelector("input[value=sedan]").checked = true;
      mini.querySelector("input[value=ic-dis]").checked = true;
      mini.querySelector("input[value=detayli-ic]").checked = true;
      finish();
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { io.disconnect(); setTimeout(run, 400); }
      }, { threshold: 0.3 });
      io.observe(mini);
    } else run();
  })();

  /* --- sorun fişi --- */
  var fis = $("[data-tool=sorun-fisi]");
  if (fis) (function () {
    var tabs = $$(".fis-tab", fis), cards = $$(".fis", fis);
    function show(id, scroll) {
      tabs.forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-fis") === id)); });
      cards.forEach(function (c) {
        var on = c.getAttribute("data-fis-card") === id;
        c.classList.toggle("is-on", on);
        if (on && scroll && window.innerWidth < 980) c.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      });
    }
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-fis"), true); }); });
    show(tabs[0].getAttribute("data-fis"), false);
  })();

  /* --- yüzey muayenesi --- */
  var mu = $("[data-tool=muayene]");
  if (mu) (function () {
    var RES = {
      poset: { ok: ["Pürüzsüz", "Poşet testi: yüzeyde gömülü kir yok gibi."], bad: ["Pürüzlü", "Poşet testi: boyaya gömülü kir var (sanayi tozu, demir tozu, reçine); pasta ya da koruma öncesinde yüzey temizliği gerekir."] },
      damla: { ok: ["Su toplanıyor", "Damla testi: koruma katmanı işini yapıyor."], bad: ["Su yayılıyor", "Damla testi: koruma zayıflamış ya da hiç yok."] },
      fener: { ok: ["Net nokta", "Fener testi: vernik iyi görünüyor."], hare: ["Hare var", "Fener testi: dairesel çizikler var; pasta cila ile belirgin biçimde azaltılabilir."], cizik: ["Belirgin çizgiler", "Fener testi: çiziğin derinliğine bakmak gerekir; fotoğrafını gönderin."] }
    };
    var sumEl = $("#mu-sum"), link = $("#mu-link"), st = $(".mu-stamp", mu), def = sumEl.textContent;
    function upd() {
      var islem = {}, notes = [], sum = [], n = 0, allOk = true;
      ["poset", "damla", "fener"].forEach(function (k) {
        var c = mu.querySelector("input[name=" + k + "]:checked"), v = c ? c.value : "", el = $("[data-line=" + k + "] .mu-v", mu);
        if (!v) { el.textContent = "Bekleniyor"; el.classList.remove("set"); allOk = false; return; }
        n++;
        el.textContent = RES[k][v][0]; el.classList.add("set"); sum.push(RES[k][v][1]);
        if (v !== "ok") allOk = false;
        if (k === "poset" && v === "bad") notes.push("poşet testinde pürüz var");
        if (k === "damla" && v === "bad") { islem.koruma = 1; notes.push("damla testinde su yayılıyor"); }
        if (k === "fener" && v !== "ok") { islem["pasta-cila"] = 1; notes.push(v === "hare" ? "fener testinde hare var" : "fener testinde belirgin çizikler var"); }
      });
      if (n && allOk && n === 3) sum.push("Aracınız iyi durumda görünüyor; düzenli iç dış yıkama çoğu zaman yeterlidir.");
      sumEl.textContent = n ? sum.join(" ") : def;
      var keys = Object.keys(islem);
      if (!keys.length && notes.length) keys = ["emin-degil"];
      if (!keys.length && n === 3) keys = ["ic-dis"];
      var q = [];
      if (keys.length) q.push("islem=" + keys.join(","));
      if (notes.length) q.push("not=" + encodeURIComponent("Evde muayene: " + notes.join("; ")));
      link.href = "is-emri.html" + (q.length ? "?" + q.join("&") : "") + "#form";
      st.classList.toggle("is-on", n === 3);
    }
    mu.addEventListener("change", upd);
    upd();
  })();

  /* --- tam iş emri --- */
  var ie = $("#ie-form");
  if (ie) (function () {
    var msgEl = $("#ie-msg"), waA = $("#ie-wa"), warn = $("#ie-warn"), stampEl = $("#ie-stamp"), prog = $$(".nusha-prog li");
    var zones = {}, wasReady = false;
    var days = $("#days"), fe = days.firstElementChild;
    for (var k = 0; k < 7; k++) {
      var d = dayInfo(k), lab = document.createElement("label");
      lab.className = "chip";
      lab.innerHTML = '<input type="radio" name="gun"><span>' + d.name + " <small>" + d.short + "</small></span>";
      lab.firstChild.value = d.value;
      days.insertBefore(lab, fe);
    }
    var q = new URLSearchParams(location.search), ok = /^[a-z-]+$/;
    var qa = q.get("arac");
    if (qa && ok.test(qa)) { var r = ie.querySelector('input[name=arac][value="' + qa + '"]'); if (r) r.checked = true; }
    (q.get("islem") || "").split(",").forEach(function (v) {
      if (!ok.test(v)) return;
      var c = ie.querySelector('input[name=islem][value="' + v + '"]'); if (c) c.checked = true;
    });
    if (q.get("not")) ie.elements.not.value = q.get("not").slice(0, 400);

    function val(n) { var e = ie.querySelector('input[name="' + n + '"]:checked'); return e ? e.value : ""; }
    function vals(n) { return $$('input[name="' + n + '"]:checked', ie).map(function (i) { return i.value; }); }
    function setZone(name, on) {
      if (on) zones[name] = 1; else delete zones[name];
      $$('[data-zone="' + name + '"]', ie).forEach(function (el) {
        if (el.tagName.toLowerCase() === "button") el.setAttribute("aria-pressed", String(!!on));
        else el.classList.toggle("on", !!on);
      });
      build();
    }
    $$("button[data-zone]", ie).forEach(function (b) { b.addEventListener("click", function () { var z = b.getAttribute("data-zone"); setZone(z, !zones[z]); }); });
    $$(".plan .zone", ie).forEach(function (g) { g.addEventListener("click", function () { var z = g.getAttribute("data-zone"); setZone(z, !zones[z]); }); });

    function text() {
      var car = val("arac"), ops = vals("islem"), model = ie.elements.model.value.trim(), renk = val("renk"),
        gun = val("gun"), saat = val("saat"), ad = ie.elements.ad.value.trim(), note = ie.elements.not.value.trim();
      var L = ["Merhaba Ulu Garaj, iş emri talebim:"];
      var a = [car ? CARS[car] : "", model, renk].filter(Boolean);
      if (a.length) L.push("- Araç: " + a.join(" · "));
      if (ops.length) {
        L.push("- İşlemler:");
        ops.forEach(function (o) {
          var extra = [];
          if (o === "detayli-ic") extra = vals("ic-alan");
          if (o === "koltuk") extra = vals("koltuk-tur");
          if (o === "pasta-cila") extra = vals("pasta");
          if (o === "koruma") extra = vals("koruma");
          L.push("  • " + OPS[o] + (extra.length ? " (" + extra.join(", ") + ")" : ""));
        });
      }
      var zl = Object.keys(zones);
      if (zl.length) L.push("- Dikkat edilecek yerler: " + zl.join(", "));
      if (gun || saat) L.push("- Tercih: " + [gun ? (gun === "fark etmez" ? "gün fark etmez" : gun) : "", saat ? (saat === "fark etmez" ? "saat fark etmez" : saat) : ""].filter(Boolean).join(", "));
      if (note) L.push("- Not: " + note);
      if (ad) L.push("- Ad: " + ad);
      L.push("Uygunluk ve bilgi için dönüşünüzü rica ederim.");
      return {
        msg: L.join("\n"), ready: !!(car && ops.length), car: car, ops: ops,
        parts: { A: !!car, B: ops.length > 0, C: zl.length > 0, D: !!(gun || saat), E: !!(ad || note) }
      };
    }
    function build() {
      $$(".op-wrap", ie).forEach(function (w) { w.classList.toggle("is-open", $("input[name=islem]", w).checked); });
      var t = text();
      var blank = !t.parts.A && !t.parts.B && !t.parts.C && !t.parts.D && !t.parts.E && !ie.elements.model.value.trim() && !val("renk");
      msgEl.textContent = blank ? "Araç tipini ve en az bir işlemi işaretleyin; mesajınız burada, siz doldurdukça yazılır." : t.msg;
      msgEl.classList.toggle("empty", blank);
      waA.href = waLink(t.msg);
      prog.forEach(function (li) { li.classList.toggle("done", !!t.parts[li.getAttribute("data-p")]); });
      if (t.ready) {
        stampEl.textContent = "GÖNDERİME HAZIR";
        if (!wasReady) { stampEl.classList.remove("go"); void stampEl.offsetWidth; stampEl.classList.add("go"); }
        warn.textContent = "";
      } else {
        stampEl.textContent = "TASLAK";
        stampEl.classList.remove("go");
      }
      wasReady = t.ready;
      return t;
    }
    ie.addEventListener("change", build);
    ie.addEventListener("input", build);
    ie.addEventListener("submit", function (e) { e.preventDefault(); });
    waA.addEventListener("click", function (e) {
      var t = build();
      if (t.ready) return;
      e.preventDefault();
      var miss = !t.car ? "part-a" : "part-b";
      warn.textContent = !t.car && !t.ops.length ? "Göndermeden önce araç tipini ve en az bir işlemi işaretleyin." : !t.car ? "Göndermeden önce araç tipini seçin (A bölümü)." : "Göndermeden önce en az bir işlem işaretleyin (B bölümü).";
      var sec = document.getElementById(miss);
      sec.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      var first = $("input", sec); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduce ? 0 : 450);
    });
    $("#ie-copy").addEventListener("click", function () {
      copyText(text().msg, function (okc) { warn.textContent = okc ? "Mesaj kopyalandı. WhatsApp'a yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip kopyalayın."; });
    });
    $("#ie-reset").addEventListener("click", function () {
      ie.reset();
      Object.keys(zones).forEach(function (z) { setZone(z, false); });
      warn.textContent = "Form temizlendi.";
      build();
    });
    build();
  })();

  /* --- teslim kontrol kartı --- */
  var tk = $("[data-tool=teslim-kontrol]");
  if (tk) (function () {
    var boxes = $$("input[name=tk]", tk), n = $("#tk-n"), bar = $("#tk-bar"), msg = $("#tk-msg"), st = $(".tk-stamp", tk);
    function upd() {
      var c = boxes.filter(function (b) { return b.checked; }).length, all = c === boxes.length;
      n.textContent = c;
      bar.style.width = (c / boxes.length * 100) + "%";
      st.classList.toggle("is-on", all);
      msg.textContent = all ? "Hepsi tamam. İyi yolculuklar!" : c ? (boxes.length - c) + " kontrol kaldı." : "Kontrol ettikçe işaretleyin.";
    }
    tk.addEventListener("change", upd);
    $("#tk-reset").addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  })();

  /* --- soru fişleri: arama ve konu --- */
  var fl = $("[data-tool=soru-filtre]");
  if (fl) (function () {
    var items = $$("#q-list .q"), inp = $("#q-search"), cats = $$("button[data-cat]", fl), cnt = $("#q-count"), empty = $("#q-empty"), cur = "hepsi";
    function norm(s) { return s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function apply() {
      var t = norm(inp.value.trim()), shown = 0;
      items.forEach(function (d) {
        var hit = (cur === "hepsi" || d.getAttribute("data-cat") === cur) && (!t || norm(d.textContent).indexOf(t) > -1);
        d.hidden = !hit;
        if (hit) shown++;
        if (hit && t.length > 2) d.open = true;
      });
      cnt.textContent = shown + " / " + items.length + " fiş gösteriliyor";
      empty.hidden = shown > 0;
    }
    inp.addEventListener("input", apply);
    cats.forEach(function (b) {
      b.addEventListener("click", function () {
        cur = b.getAttribute("data-cat");
        cats.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply();
      });
    });
    apply();
  })();

  /* --- hazır mesaj fişleri --- */
  var sl = $("[data-tool=hazir-mesaj]");
  if (sl) (function () {
    var ta = $("#slip-text"), wa2 = $("#slip-wa"), note = $("#slip-note"), slips = $$(".slip", sl);
    function upd() { var m = ta.value.trim(); wa2.href = m ? waLink(m) : WA; }
    slips.forEach(function (b) {
      b.addEventListener("click", function () {
        slips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        ta.value = b.getAttribute("data-msg");
        upd();
        if (/: $/.test(ta.value)) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
        note.textContent = "Metni dilediğiniz gibi düzenleyebilirsiniz.";
      });
    });
    ta.addEventListener("input", upd);
    $("#slip-copy").addEventListener("click", function () {
      copyText(ta.value, function (okc) { note.textContent = okc ? "Metin kopyalandı." : "Kopyalanamadı; metni seçip kopyalayın."; });
    });
    upd();
  })();
})();
