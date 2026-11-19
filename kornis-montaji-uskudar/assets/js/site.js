/* Korniş Montajı ve Perde Sistemleri — site.js
   Kütüphane yok. Bölümler: canlı durum, ray gezinme, ilerleme rayı, hero ray düzeneği,
   iş kartları, patlatılmış çizim, sorun bulucu, servis çağırma aracı, duvar rehberi,
   SSS filtresi, hazır mesajlar. */

/* ---- kit/status.js'ten kopya (değiştirilmedi) ---- */
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

  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };
  var WA = "https://wa.me/905066535287";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function trLower(s) { try { return s.toLocaleLowerCase("tr"); } catch (e) { return s.toLowerCase(); } }

  function copyText(text, stateEl) {
    function done(ok) {
      if (stateEl) stateEl.textContent = ok ? "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; metni basılı tutup elle kopyalayın.";
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else { fallback(); }
  }

  /* ortak kaydırma / boyut döngüsü */
  var scrollFns = [], resizeFns = [], ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; scrollFns.forEach(function (f) { f(); }); });
  }, { passive: true });
  var rzT = 0;
  window.addEventListener("resize", function () { clearTimeout(rzT); rzT = setTimeout(function () { resizeFns.forEach(function (f) { f(); }); }, 120); });

  /* ---------- 1. canlı durum ---------- */
  var st = openStatus(HOURS);
  var stText = st.all24 ? "Şu an açık · her gün 24 saat açık" : st.text;
  $$("[data-status]").forEach(function (el) { el.textContent = stText; el.classList.toggle("is-open", st.open); });
  $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", parseInt(el.getAttribute("data-day"), 10) === st.dayIndex); });

  /* ---------- 2. menü + gezinme makarası ---------- */
  var hd = $("[data-hd]"), nav = $("[data-nav]"), menu = $("[data-menu]");
  var navCar = nav ? $(".nav__car", nav) : null, navRail = nav ? $(".nav__rail", nav) : null;
  var navLinks = nav ? $$(".nav__list a", nav) : [];
  function wide() { return window.matchMedia("(min-width: 960px)").matches; }
  function currentLink() { return (nav && $(".nav__list a[aria-current]", nav)) || navLinks[0]; }
  function placeCar(a, instant) {
    if (!navCar || !a || !navRail) return;
    if (instant) navCar.style.transition = "none";
    if (wide()) {
      var x = a.offsetLeft + a.offsetWidth / 2 - navRail.offsetLeft - navRail.clientLeft - 9;
      navCar.style.setProperty("--x", x.toFixed(1) + "px");
      navCar.style.setProperty("--rot", (x * 6.4).toFixed(1) + "deg");
    } else {
      var y = a.offsetTop + a.offsetHeight / 2 - navRail.offsetTop - navRail.clientTop - 9;
      navCar.style.setProperty("--y", y.toFixed(1) + "px");
      navCar.style.setProperty("--rot", (y * 6.4).toFixed(1) + "deg");
    }
    if (instant) { void navCar.offsetWidth; navCar.style.transition = ""; }
  }
  function setMenu(open) {
    if (!hd || !menu) return;
    hd.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) placeCar(currentLink(), true);
  }
  if (menu) {
    menu.addEventListener("click", function () { setMenu(!hd.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && hd.classList.contains("is-open")) { setMenu(false); menu.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (hd.classList.contains("is-open") && !hd.contains(e.target)) setMenu(false);
    });
  }
  navLinks.forEach(function (a) {
    a.addEventListener("mouseenter", function () { placeCar(a); });
    a.addEventListener("focus", function () { placeCar(a); });
  });
  if (nav) {
    nav.addEventListener("mouseleave", function () { placeCar(currentLink()); });
    nav.addEventListener("focusout", function (e) { if (!nav.contains(e.relatedTarget)) placeCar(currentLink()); });
  }
  function initCar() { placeCar(currentLink(), true); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initCar);
  initCar();
  resizeFns.push(function () { if (wide()) setMenu(false); initCar(); });

  /* ---------- 3. sayfa ilerleme rayı ---------- */
  var prog = $(".prog i");
  function progUpd() {
    if (!prog) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.setProperty("--p", h > 0 ? clamp(window.scrollY / h, 0, 1).toFixed(4) : 0);
  }
  scrollFns.push(progUpd); progUpd();

  /* ---------- 4. hero: kaydırdıkça makaraları kayan ray ---------- */
  var rig = $("[data-rig]");
  if (rig) {
    var stage = $(".rig__stage", rig), cars = $$("[data-car]", rig), N = cars.length;
    var PARK_L = [0, .05, .1, .15], SPREAD = [0, 1 / 3, 2 / 3, 1], PARK_R = [.82, .88, .94, 1];
    var wheels = cars.map(function (c) { return $(".car__wheel", c); });
    var drops = cars.map(function (c) { return $(".car__drop", c); });
    var S = cars.map(function () { return { px: null, v: 0, th: 0, om: 0 }; });
    var introStart = null, scrollP = 0, rigTop = 0, raf = 0;
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var geo = { W: 300, m: 46 };
    function measure() {
      var tw = parseFloat(getComputedStyle(stage).getPropertyValue("--tw")) || 80;
      geo = { W: stage.clientWidth, m: tw / 2 + 6 };
      rigTop = rig.getBoundingClientRect().top + window.scrollY;
    }
    function frame(t) {
      raf = 0;
      if (introStart === null) introStart = t;
      var introT = reduce ? 1 : clamp((t - introStart) / 1800, 0, 1);
      var moving = introT < 1;
      for (var i = 0; i < N; i++) {
        var e = easeOut(clamp(introT * 1.3 - (N - 1 - i) * .09, 0, 1));
        var base = PARK_L[i] + (SPREAD[i] - PARK_L[i]) * e;
        var sp = easeIO(clamp(scrollP * 1.4 - (N - 1 - i) * .12, 0, 1));
        var f = base + (PARK_R[i] - base) * sp;
        var px = geo.m + f * (geo.W - 2 * geo.m), s = S[i];
        var v = s.px === null ? 0 : px - s.px, a = v - s.v;
        s.v = v; s.px = px;
        if (!reduce) {
          s.om += a * 2.6 + v * .02 - .05 * s.th - .085 * s.om;
          s.th = clamp(s.th + s.om, -26, 26);
          if (Math.abs(s.th) > .04 || Math.abs(s.om) > .04 || Math.abs(v) > .02) moving = true;
        }
        cars[i].style.setProperty("--x", f.toFixed(4));
        wheels[i].style.setProperty("--rot", (px * 5.2).toFixed(1) + "deg");
        drops[i].style.setProperty("--sw", s.th.toFixed(2) + "deg");
      }
      if (moving) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function onScroll() {
      if (reduce) return;
      var range = Math.max(300, rigTop + rig.offsetHeight * .9);
      var p = clamp(window.scrollY / range, 0, 1);
      if (Math.abs(p - scrollP) > .0005) { scrollP = p; kick(); }
    }
    measure(); onScroll(); kick();
    scrollFns.push(onScroll);
    resizeFns.push(function () { measure(); onScroll(); kick(); });
  }

  /* ---------- 5. rayda kayan iş kartları ---------- */
  var track = $("[data-slide]");
  if (track) {
    var cards = $$(".job", track);
    var prevB = $("[data-slide-prev]"), nextB = $("[data-slide-next]"), countEl = $("[data-slide-count]");
    var stepW = function () { return cards[0].getBoundingClientRect().width + 14; };
    if (prevB) prevB.addEventListener("click", function () { track.scrollBy({ left: -stepW(), behavior: reduce ? "auto" : "smooth" }); });
    if (nextB) nextB.addEventListener("click", function () { track.scrollBy({ left: stepW(), behavior: reduce ? "auto" : "smooth" }); });
    var slUpd = function () {
      var sl = track.scrollLeft, max = track.scrollWidth - track.clientWidth;
      track.style.setProperty("--rot", (sl * 7.2).toFixed(1) + "deg");
      if (prevB) prevB.disabled = sl < 4;
      if (nextB) nextB.disabled = sl > max - 4;
      if (countEl && max > 4) {
        var idx = clamp(Math.round(sl / stepW()), 0, cards.length - 1);
        countEl.textContent = "Rayda: " + cards[idx].querySelector("h3").textContent;
      }
    };
    var slTick = false;
    track.addEventListener("scroll", function () {
      if (slTick) return; slTick = true;
      requestAnimationFrame(function () { slTick = false; slUpd(); });
    }, { passive: true });
    slUpd(); resizeFns.push(slUpd);
  }

  /* ---------- 6. patlatılmış çizim ---------- */
  var xv = $("[data-xv]");
  if (xv) {
    var partItems = $$("[data-parts] li");
    var xvBtn = $("[data-xv-toggle]");
    var hot = function (p) {
      $$("[data-part]", xv).forEach(function (g) { g.classList.toggle("is-hot", g.getAttribute("data-part") === p); });
      partItems.forEach(function (li) {
        var on = li.getAttribute("data-part") === p;
        li.classList.toggle("is-hot", on);
        li.querySelector("button").setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
    $$("[data-part-btn]").forEach(function (b) {
      b.addEventListener("click", function () { hot(b.getAttribute("data-part-btn")); });
      b.addEventListener("mouseenter", function () { hot(b.getAttribute("data-part-btn")); });
    });
    $$("[data-part]", xv).forEach(function (g) {
      g.addEventListener("click", function () {
        var p = g.getAttribute("data-part"); hot(p);
        var li = $('[data-parts] li[data-part="' + p + '"]');
        if (li && !wide()) li.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      });
    });
    var setAsm = function (on) {
      xv.classList.toggle("is-assembled", on);
      if (xvBtn) { xvBtn.setAttribute("aria-pressed", on ? "true" : "false"); xvBtn.textContent = on ? "Parçalara ayır" : "Sistemi birleştir"; }
    };
    if (xvBtn) xvBtn.addEventListener("click", function () { setAsm(!xv.classList.contains("is-assembled")); });
    hot("A");
    /* Görünüme girerken bir kez: birleşik halden parçalara ayrılır. Hiç görünmezse ayrık (bilgi veren) hal kalır. */
    if (!reduce && "IntersectionObserver" in window) {
      var armed = false;
      var io1 = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting || armed) return;
        if (en[0].intersectionRatio > .35) { io1.disconnect(); io2.disconnect(); return; }
        armed = true; io1.disconnect();
        xv.classList.add("no-tr"); setAsm(true); void xv.getBoundingClientRect();
        requestAnimationFrame(function () { xv.classList.remove("no-tr"); });
      }, { threshold: [0, .35] });
      var io2 = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && armed) { io2.disconnect(); setTimeout(function () { setAsm(false); }, 500); }
      }, { threshold: .55 });
      io1.observe(xv); io2.observe(xv);
    }
  }

  /* ---------- ortak veri: iş tipleri ve belirtiler ---------- */
  var JOB = { "kornis-takma": "Korniş takma", "ray-tamiri": "Ray tamiri", "perde-takma": "Perde takma", "stor-montaji": "Stor montajı" };
  var FAULT = {
    "takiliyor": { t: "Perde zor kayıyor, takılıyor", why: "Aşınmış ya da kırık bir makara, kanalda biriken toz ya da rayda bir eğilme olabilir.", you: "Perdeyi yavaşça çekip takıldığı noktayı not edin. Kanalı kuru bir fırçayla temizlemek bazen yeter; yağlı ürünler toz tutabilir.", job: "ray-tamiri" },
    "sarkma": { t: "Ray ortadan sarkıyor", why: "Ortadaki klips ya da konsol gevşemiş, dübel yerinden çıkmış ya da askı aralığı perdenin yüküne göre geniş kalmış olabilir.", you: "Perdeyi indirip yükü azaltın, rayı elle düzeltmeye zorlamayın. Sarkan bölgenin fotoğrafını çekin.", job: "ray-tamiri" },
    "makara-dusuyor": { t: "Makaralar raydan çıkıyor", why: "Uç tapası (stoper) kayıp ya da kırık olabilir; makara kanaldan taşıyor da olabilir.", you: "Düşen makaraları saklayın; uç tapası takıldıktan sonra yerlerine geri girebilirler.", job: "ray-tamiri" },
    "ayrildi": { t: "Ray duvardan ya da tavandan ayrıldı", why: "Dübel duvar malzemesine uygun değil, delik genişlemiş ya da bağlantı aparatı kırılmış olabilir.", you: "Perdeyi indirin, rayı tamamen sökmeye çalışmadan duvar ve rayın fotoğrafını çekin.", job: "ray-tamiri" },
    "stor-sarmiyor": { t: "Stor perde düzgün sarılmıyor", why: "Mekanizma borusu terazide olmayabilir ya da kumaş boruya kayarak sarılıyor olabilir.", you: "Perdeyi tamamen açıp kapatırken hangi tarafa kaydığına bakın, mesajda belirtin.", job: "stor-montaji" },
    "zincir": { t: "Stor zinciri boşa dönüyor", why: "Zincir mekanizması ya da içindeki kavrama parçası aşınmış olabilir.", you: "Zinciri zorlamayın; zincirin hangi tarafta olduğunu ve ne zamandır böyle olduğunu not edin.", job: "stor-montaji" },
    "degisim": { t: "Eski korniş değişecek", why: "Eski kornişin delikleri yeni montajda kullanılabilir ya da kapatılması gerekebilir; bu, yeni rayın ölçüsüne göre yerinde değerlendirilir.", you: "Eski kornişin ve duvarın fotoğrafını çekin; yeni rayı kendiniz aldıysanız ambalajıyla hazır tutun.", job: "kornis-takma" }
  };

  /* ---------- 7. sorun bulucu ---------- */
  var finder = $("[data-finder]");
  if (finder) {
    var fOut = $("[data-finder-out]", finder);
    var fBtns = $$("[data-fault]", finder);
    fBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-fault"), d = FAULT[k];
        if (!d) return;
        fBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        fOut.innerHTML = "";
        var h = document.createElement("h3"); h.textContent = d.t; fOut.appendChild(h);
        var dl = document.createElement("dl");
        [["Olası neden", d.why], ["Siz ne yapabilirsiniz", d.you]].forEach(function (r) {
          var dt = document.createElement("dt"); dt.textContent = r[0];
          var dd = document.createElement("dd"); dd.textContent = r[1];
          dl.appendChild(dt); dl.appendChild(dd);
        });
        var dt2 = document.createElement("dt"); dt2.textContent = "Servise iletilecek iş";
        var dd2 = document.createElement("dd"); var tag = document.createElement("span"); tag.className = "finder__job"; tag.textContent = JOB[d.job]; dd2.appendChild(tag);
        dl.appendChild(dt2); dl.appendChild(dd2);
        fOut.appendChild(dl);
        var a = document.createElement("a");
        a.className = "btn"; a.href = "servis-cagir.html?is=" + d.job + "&belirti=" + k;
        a.textContent = "Bu bilgiyle servis çağır";
        fOut.appendChild(a);
        var n = document.createElement("p"); n.className = "note"; n.style.marginTop = "12px";
        n.textContent = "Buradaki bilgiler geneldir; kesin teşhis yerinde yapılır.";
        fOut.appendChild(n);
        if (!wide()) fOut.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- 8. servis çağırma aracı (imza) ---------- */
  var order = $("[data-order]");
  if (order) {
    var form = $("form", order);
    var cnt = $("[data-count]", order), minus = $("[data-minus]", order), plus = $("[data-plus]", order);
    var winsSvg = $("[data-wins]", order), winsTxt = $("[data-wins-txt]", order);
    var msgEl = $("[data-msg]", order), waBtn = $("[data-wa]", order), copyBtn = $("[data-copy]", order);
    var warn = $("[data-warn]", order), cState = $("[data-copy-state]", order), dateEl = $("[data-date]", order);
    var MAXW = 30, lastN = 1;

    try {
      var q = new URLSearchParams(window.location.search);
      (q.get("is") || "").split(",").forEach(function (k) {
        if (!JOB[k]) return;
        var inp = form.querySelector('input[name="is"][value="' + k + '"]');
        if (inp) inp.checked = true;
      });
      var bk = q.get("belirti");
      if (bk && FAULT[bk] && form.elements.not) form.elements.not.value = "Belirti: " + FAULT[bk].t + ".";
    } catch (e) { /* eski tarayıcı: parametresiz devam */ }

    if (dateEl) {
      try { dateEl.textContent = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", weekday: "long" }).format(new Date()); } catch (e) { dateEl.textContent = ""; }
    }

    var checkedVals = function (name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); };
    var val = function (name) { var el = form.elements[name]; return el && el.value ? String(el.value).trim() : ""; };
    var getN = function () { return clamp(parseInt(cnt.value, 10) || 1, 1, MAXW); };

    var drawWins = function (n, grow) {
      if (!winsSvg) return;
      var show = Math.min(n, 10), W = 52, gap = 12, extra = n > 10 ? 70 : 0;
      var total = show * W + (show - 1) * gap + extra;
      var vbw = Math.max(total + 24, 300), x0 = (vbw - total) / 2, h = "";
      h += '<rect class="hx" x="0" y="0" width="' + vbw + '" height="10"/><path class="ln" d="M0 10H' + vbw + '"/>';
      for (var i = 0; i < show; i++) {
        var x = x0 + i * (W + gap);
        h += '<g class="win' + (grow && i === show - 1 ? " is-new" : "") + '">' +
          '<rect class="pt" x="' + (x + 6) + '" y="10" width="6" height="5"/><rect class="pt" x="' + (x + W - 12) + '" y="10" width="6" height="5"/>' +
          '<rect class="pd" x="' + (x - 4) + '" y="15" width="' + (W + 8) + '" height="7"/>' +
          '<circle class="po" cx="' + (x + 10) + '" cy="24" r="3.4"/><circle class="po" cx="' + (x + W - 10) + '" cy="24" r="3.4"/>' +
          '<rect class="pt" x="' + x + '" y="34" width="' + W + '" height="56"/>' +
          '<rect class="glass" x="' + (x + 5) + '" y="39" width="' + (W / 2 - 7.5) + '" height="46"/>' +
          '<rect class="glass" x="' + (x + W / 2 + 2.5) + '" y="39" width="' + (W / 2 - 7.5) + '" height="46"/>' +
          "</g>";
      }
      if (n > 10) h += '<text class="lbl lbl-b" x="' + (x0 + show * (W + gap) + 2) + '" y="68">+' + (n - 10) + "</text>";
      winsSvg.setAttribute("viewBox", "0 0 " + vbw + " 96");
      winsSvg.innerHTML = h;
      if (winsTxt) winsTxt.textContent = n + " pencere seçildi";
    };

    var build = function () {
      var jobs = checkedVals("is").map(function (k) { return JOB[k]; }).filter(Boolean);
      var n = getN(), ek = checkedVals("ek");
      var yer = checkedVals("yer")[0] || "", duvar = checkedVals("duvar")[0] || "";
      var L = ["Merhaba, servis çağırmak istiyorum."];
      L.push("Yapılacak iş: " + (jobs.length ? jobs.join(", ") : "(seçilmedi)"));
      L.push("Pencere sayısı: " + n);
      if (ek.length) L.push("Ek istek: " + ek.join(", "));
      if (yer) L.push("Montaj yeri: " + yer);
      if (duvar) L.push("Duvar/tavan: " + duvar);
      if (val("genislik")) L.push("Yaklaşık genişlik: " + val("genislik"));
      if (val("semt")) L.push("Semt / mahalle: " + val("semt"));
      if (val("zaman")) L.push("Uygun zaman: " + val("zaman"));
      if (val("not")) L.push("Not: " + val("not"));
      if (val("ad")) L.push("Adım: " + val("ad"));
      L.push("");
      L.push("Uygun olduğunuzda dönüş yapabilir misiniz? Teşekkürler.");
      return { text: L.join("\n"), ok: jobs.length > 0 };
    };

    var update = function () {
      var r = build();
      msgEl.textContent = "";
      r.text.split("\n").forEach(function (line, i) {
        if (i) msgEl.appendChild(document.createTextNode("\n"));
        if (line.indexOf("(seçilmedi)") !== -1) {
          var sp = document.createElement("span"); sp.className = "miss"; sp.textContent = line; msgEl.appendChild(sp);
        } else { msgEl.appendChild(document.createTextNode(line)); }
      });
      waBtn.href = waLink(r.text);
      if (r.ok && warn) warn.classList.remove("is-on");
      var n = getN();
      if (minus) minus.disabled = n <= 1;
      if (plus) plus.disabled = n >= MAXW;
      return r;
    };

    var setN = function (n) {
      n = clamp(n, 1, MAXW);
      cnt.value = n;
      drawWins(n, n > lastN && !reduce);
      lastN = n; update();
    };
    if (minus) minus.addEventListener("click", function () { setN(getN() - 1); });
    if (plus) plus.addEventListener("click", function () { setN(getN() + 1); });
    cnt.addEventListener("change", function () { setN(getN()); });
    cnt.addEventListener("input", function () { if (cnt.value !== "") { var n = getN(); drawWins(n, false); lastN = n; update(); } });

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); waBtn.click(); });

    waBtn.addEventListener("click", function (e) {
      var r = update();
      if (!r.ok) {
        e.preventDefault();
        if (warn) warn.classList.add("is-on");
        var first = form.querySelector('input[name="is"]');
        if (first) { first.focus({ preventScroll: true }); first.closest("fieldset").scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }); }
      }
    });
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(build().text, cState); });

    setN(getN());
  }

  /* ---------- 9. duvar tipi rehberi ---------- */
  var walls = $("[data-walls]");
  if (walls) {
    var wBtns = $$("[data-wall]", walls), wPanels = $$("[data-wall-panel]", walls);
    var showWall = function (k) {
      wBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-wall") === k ? "true" : "false"); });
      wPanels.forEach(function (p) { p.hidden = p.getAttribute("data-wall-panel") !== k; });
    };
    wBtns.forEach(function (b) { b.addEventListener("click", function () { showWall(b.getAttribute("data-wall")); }); });
    showWall(wBtns[0].getAttribute("data-wall"));
  }

  /* ---------- 10. SSS filtresi ---------- */
  var fq = $("[data-faq-filter]");
  if (fq) {
    var qas = $$(".qa"), groups = $$(".qgroup"), fcount = $("[data-faq-count]"), fempty = $("[data-faq-empty]");
    qas.forEach(function (d) { d._txt = trLower(d.textContent); });
    var runQ = function () {
      var q = trLower(fq.value.trim()), shown = 0;
      qas.forEach(function (d) {
        var hit = !q || d._txt.indexOf(q) !== -1;
        d.classList.toggle("is-hidden", !hit);
        if (hit) shown++;
        if (q.length >= 3) d.open = hit;
      });
      groups.forEach(function (g) { g.classList.toggle("is-hidden", !$(".qa:not(.is-hidden)", g)); });
      if (fcount) fcount.textContent = q ? shown + " soru bulundu" : qas.length + " soru, 5 başlık";
      if (fempty) fempty.classList.toggle("is-on", shown === 0);
    };
    fq.addEventListener("input", runQ);
    runQ();
  }

  /* ---------- 11. hazır mesajlar (iletişim) ---------- */
  var qm = $("[data-qm]");
  if (qm) {
    var QM = {
      olcu: "Merhaba, ölçü alımı için randevu almak istiyorum. Semtim: ",
      foto: "Merhaba, ürün fotoğrafı rica ediyorum. İlgilendiğim ürün: (tül / fon / stor / zebra / korniş)",
      ray: "Merhaba, rayım için tamir bilgisi almak istiyorum. Sorun: ",
      stor: "Merhaba, stor perde montajı için bilgi almak istiyorum. Pencere sayısı: ",
      kornis: "Merhaba, korniş takma için bilgi almak istiyorum. Pencere sayısı: "
    };
    var qBtns = $$("[data-qm-key]", qm), qPrev = $("[data-qm-prev]", qm), qWa = $("[data-qm-wa]", qm), qCopy = $("[data-qm-copy]", qm), qState = $("[data-qm-state]", qm);
    var curQ = "";
    var pickQ = function (k) {
      curQ = QM[k] || "";
      qBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-qm-key") === k ? "true" : "false"); });
      qPrev.textContent = curQ;
      qWa.href = waLink(curQ);
      if (qState) qState.textContent = "";
    };
    qBtns.forEach(function (b) { b.addEventListener("click", function () { pickQ(b.getAttribute("data-qm-key")); }); });
    if (qCopy) qCopy.addEventListener("click", function () { copyText(curQ, qState); });
    pickQ(qBtns[0].getAttribute("data-qm-key"));
  }
})();
