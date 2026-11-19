/* Haser Sineklik — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var WA = "https://wa.me/905414408936";
  var HOURS = { "0": [["08:30", "19:30"]], "1": [["08:30", "19:30"]], "2": [["08:30", "19:30"]], "3": [["08:30", "19:30"]], "4": [["08:30", "19:30"]], "5": [["08:30", "19:30"]] };

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

  /* ---- yardımcılar ---- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function num(v) { if (v == null) return NaN; v = String(v).replace(",", ".").trim(); return v === "" ? NaN : parseFloat(v); }
  function fmt(n, d) { return n.toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 1 : d }); }
  function copyText(text, okEl) {
    function done(ok) { if (okEl) { okEl.textContent = ok ? "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; mesajı elle seçip kopyalayın."; } }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback()); });
    } else { done(fallback()); }
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-200px";
      document.body.appendChild(ta); ta.select(); var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); return ok;
    }
  }
  function trNorm(s) {
    return String(s).toLocaleLowerCase("tr-TR").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/â/g, "a").replace(/î/g, "i");
  }

  /* ---- canlı açık/kapalı + bugünün satırı ---- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var host = el.parentElement;
      if (host) { host.classList.toggle("is-open", s.open); host.classList.add("is-known"); }
    });
    $$("tr[data-day]").forEach(function (tr) { tr.classList.toggle("today", +tr.getAttribute("data-day") === s.dayIndex); });
    $$(".mini-hours li[data-day]").forEach(function (li) {
      var d = li.getAttribute("data-day");
      li.classList.toggle("today", d === "0-5" ? s.dayIndex <= 5 : +d === s.dayIndex);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---- içinde bulunulan ay ---- */
  (function () {
    var m;
    try { m = parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", month: "numeric" }).format(new Date()), 10) - 1; } catch (e) { m = new Date().getMonth(); }
    $$(".month[data-m]").forEach(function (el) { el.classList.toggle("now", +el.getAttribute("data-m") === m); });
  })();

  /* ---- telefonda menü (stor gibi iner) ---- */
  (function () {
    var btn = $(".nav-toggle"), nav = $("#menu");
    if (!btn || !nav) return;
    function set(open) { btn.setAttribute("aria-expanded", open ? "true" : "false"); nav.classList.toggle("open", open); btn.lastChild.textContent = open ? "Kapat" : "Menü"; }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { set(false); btn.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  })();

  /* ---- görünce oynat ---- */
  (function () {
    var els = $$("[data-anim]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in-view"); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { en.target.classList.toggle("in-view", en.isIntersecting); });
    }, { rootMargin: "0px 0px -10% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* =====================================================================
     HERO: fileye çarpıp seken sivrisinek
     ===================================================================== */
  (function () {
    var stage = $("[data-hero]");
    if (!stage) return;
    var mosq = $("[data-mosq]", stage), layerOut = $(".layer-out", stage), layerIn = $("[data-in]", stage), fx = $("[data-fx]", stage);
    var plise = $("[data-plise]", stage), bubble = $("[data-bubble]", stage);
    var btn = $("[data-mesh-toggle]"), bumpsEl = $("[data-bumps]"), live = $("[data-hero-live]");
    var O = { l: .12, t: 40 / 540, r: .88, b: 436 / 540 };
    var FOLD = .07;
    var W = 0, H = 0;
    function measure() { var r = stage.getBoundingClientRect(); W = r.width; H = r.height; }
    measure();
    window.addEventListener("resize", measure);
    mosq.style.left = "0"; mosq.style.top = "0";

    var st = { x: .62, y: .4, z: .3, vx: 0, vy: 0, vz: .25, tx: .5, ty: .4, nextT: 0, mode: "out", face: 1 };
    var open = false, closingPending = false, bumps = 0, t = 0, last = 0, running = false, visible = true, inView = true;
    var words = ["tık!", "pat!", "bonk!", "tık!"];

    function say(msg) { if (live) live.textContent = msg; }
    function setMesh(k) { plise.style.setProperty("--k", k); }
    function edge() { return O.l + (O.r - O.l) * FOLD + .05; }

    function draw() {
      var s, bob = Math.sin(t * 9) * 2.2;
      if (st.mode === "out" || st.mode === "enter" && st.z < 1) s = .36 + .52 * clamp(st.z, 0, 1);
      else s = .9 + .35 * clamp(st.z - 1, 0, 1) + Math.sin(t * 1.7) * .04;
      var fx_ = st.face < 0 ? -s : s;
      mosq.style.transform = "translate(" + (st.x * W).toFixed(1) + "px," + (st.y * H + bob).toFixed(1) + "px) scale(" + fx_.toFixed(3) + "," + s.toFixed(3) + ")";
      if (bubble.classList.contains("show")) {
        var bx = clamp(st.x * W - 60, 6, W - 200), by = clamp(st.y * H - 86, 6, H - 60);
        bubble.style.transform = "translate(" + bx.toFixed(0) + "px," + by.toFixed(0) + "px)";
      }
    }

    function bump() {
      bumps++;
      if (bumpsEl) bumpsEl.textContent = bumps;
      var r = document.createElement("span"); r.className = "ripple";
      r.style.left = (st.x * W) + "px"; r.style.top = (st.y * H) + "px";
      fx.appendChild(r);
      var p = document.createElement("span"); p.className = "pop"; p.textContent = words[bumps % words.length];
      p.style.left = (st.x * W) + "px"; p.style.top = (st.y * H - 26) + "px";
      fx.appendChild(p);
      setTimeout(function () { r.remove(); p.remove(); }, 950);
      plise.classList.remove("hit"); void plise.offsetWidth; plise.classList.add("hit");
    }

    function pickTarget(inside) {
      if (inside) { st.tx = .1 + Math.random() * .8; st.ty = .1 + Math.random() * .72; }
      else {
        var minX = open ? Math.max(O.l + .08, edge() + .02) : O.l + .08;
        st.tx = minX + Math.random() * (O.r - .08 - minX); st.ty = O.t + .1 + Math.random() * (O.b - O.t - .24);
      }
      st.nextT = t + 1 + Math.random() * 1.6;
    }

    function goInside() {
      st.mode = "in"; layerIn.appendChild(mosq);
      bubble.classList.add("show"); pickTarget(true);
      say("Sivrisinek içeri girdi. Fileyi çekip onu dışarı gönderin.");
      setTimeout(function () { bubble.classList.remove("show"); }, 3400);
    }
    function goOutside() {
      st.mode = "out"; layerOut.appendChild(mosq); st.z = .9; st.vz = -.7; pickTarget(false);
    }

    function step(dt) {
      t += dt;
      if (t > st.nextT) pickTarget(st.mode === "in");
      var k = st.mode === "in" ? 2.6 : 2.0;
      st.vx += ((st.tx - st.x) * k - st.vx * 1.7 + (Math.random() - .5) * .9) * dt;
      st.vy += ((st.ty - st.y) * k - st.vy * 1.7 + (Math.random() - .5) * .9) * dt;
      st.x += st.vx * dt; st.y += st.vy * dt;
      if (Math.abs(st.vx) > .02) st.face = st.vx > 0 ? -1 : 1;

      if (st.mode === "out") {
        st.x = clamp(st.x, O.l + .05, O.r - .05); st.y = clamp(st.y, O.t + .07, O.b - .1);
        st.vz = clamp(st.vz + .7 * dt, -1.4, .75);
        st.z += st.vz * dt;
        if (st.z < 0) { st.z = 0; st.vz = Math.abs(st.vz) * .3; }
        if (st.z >= 1) {
          if (open && st.x > edge()) { st.mode = "enter"; }
          else { st.z = 1; st.vz = -(.85 + Math.random() * .45); st.vx += (Math.random() - .5) * .6; st.vy -= .25; bump(); }
        }
      } else if (st.mode === "enter") {
        st.z += .9 * dt;
        if (st.z > 1.08) goInside();
      } else if (st.mode === "in") {
        st.x = clamp(st.x, .06, .94); st.y = clamp(st.y, .06, .9);
        st.z = clamp(st.z + (1.5 - st.z) * dt, 1, 2);
      } else if (st.mode === "leave") {
        st.tx = .5; st.ty = .42;
        st.z -= .75 * dt;
        if (st.z < 1) { goOutside(); if (closingPending) finishClose(); }
      }
    }

    function frame(now) {
      if (!running) return;
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      step(dt); draw();
      requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; last = 0; requestAnimationFrame(frame); }
    function stop() { running = false; }
    function sync() { if (visible && inView) start(); else stop(); }

    function finishClose() {
      closingPending = false; open = false; setMesh(1);
      btn.textContent = "Fileyi topla"; btn.disabled = false;
      say("File çekildi. Sivrisinek yine dışarıda.");
    }

    btn.addEventListener("click", function () {
      if (!open) {
        open = true; setMesh(FOLD); btn.textContent = "Fileyi çek";
        say("File toplandı. Pencere açık.");
        if (reduce) { layerIn.appendChild(mosq); st.mode = "in"; st.x = .55; st.y = .62; st.z = 1.4; bubble.classList.add("show"); draw(); say("Sivrisinek içeri girdi."); }
      } else {
        if (reduce) { bubble.classList.remove("show"); layerOut.appendChild(mosq); st.mode = "out"; st.x = .62; st.y = .4; st.z = .8; draw(); finishClose(); return; }
        if (st.mode === "in" || st.mode === "enter") {
          closingPending = true; btn.disabled = true; btn.textContent = "Kovalanıyor…";
          bubble.classList.remove("show");
          if (st.mode === "enter") { goOutside(); finishClose(); } else { st.mode = "leave"; }
        } else { finishClose(); }
      }
    });

    if (reduce) { st.z = .8; draw(); return; }
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; sync(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; sync(); }).observe(stage);
    }
    pickTarget(false); draw(); sync();
  })();

  /* =====================================================================
     MODEL DEMOLARI (kaydırıcı + oynat)
     ===================================================================== */
  var DEMO_TEXT = {
    plise: ["Kapalı: file gergin, pencere korumada.", "Yarı açık: pileler katlanmaya başladı.", "Açık: file kenarda ince bir şerit oldu."],
    mente: ["Kapalı: kanat kasaya yaslandı.", "Aralık: kanat menteşesinde dönüyor.", "Açık: geçiş serbest, kanat açıkta duruyor."],
    surgu: ["Kapalı: file kanadı açıklığın önünde.", "Kayıyor: file rayında yana gidiyor.", "Açık: file diğer kanadın önüne geçti."],
    stor: ["İnik: file alt profilden tutturuldu.", "Sarılıyor: file kutuya doğru çıkıyor.", "Toplu: file kutunun içinde, pencere boş."]
  };
  $$("[data-demo]").forEach(function (d) {
    var kind = d.getAttribute("data-demo");
    var vis = $(".demo", d), range = $("input[type=range]", d), play = $("[data-demo-play]", d), out = $("[data-demo-out]", d), tog = $("[data-demo-toggle]", d);
    var raf = 0;
    function label(v) { var a = DEMO_TEXT[kind]; if (!a) return ""; return v < 12 ? a[0] : v > 88 ? a[2] : a[1]; }
    function set(v) { vis.style.setProperty("--v", v.toFixed(1)); if (range) { range.value = Math.round(v); range.setAttribute("aria-valuetext", label(v)); } if (out) out.textContent = label(v); }
    function stopPlay() { if (raf) cancelAnimationFrame(raf); raf = 0; if (play) play.textContent = "Oynat"; }
    if (range) {
      range.addEventListener("input", function () { stopPlay(); set(+range.value); });
      set(+range.value);
    }
    if (play) play.addEventListener("click", function () {
      if (raf) { stopPlay(); return; }
      if (reduce) { set(+range.value > 50 ? 0 : 100); return; }
      var t0 = 0, from = +range.value, to = from > 50 ? 0 : 100;
      play.textContent = "Durdur";
      function f(now) {
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / 3600);
        var e = p < .42 ? p / .42 : p < .6 ? 1 : 1 - (p - .6) / .4;
        e = e * e * (3 - 2 * e);
        set(from + (to - from) * e);
        if (p < 1) raf = requestAnimationFrame(f); else stopPlay();
      }
      raf = requestAnimationFrame(f);
    });
    if (tog) tog.addEventListener("click", function () {
      var off = vis.classList.toggle("off");
      tog.textContent = off ? "Yerine takın" : "Temizlik için çıkarın";
      if (out) out.textContent = off ? "Çerçeve klipslerinden çıktı; file rahatça yıkanır." : "Yerinde: çerçeve kasaya oturdu, sivrisinek dışarıda.";
    });
  });

  /* =====================================================================
     MODEL BULUCU
     ===================================================================== */
  (function () {
    var box = $("[data-finder]");
    if (!box) return;
    var list = $("[data-finder-list]", box), wa = $("[data-finder-wa]", box), hint = $("[data-finder-hint]", box);
    var NAMES = { plise: "Plise sineklik", mente: "Menteşeli sineklik", surgu: "Sürgülü sineklik", stor: "Stor (rulo) sineklik", sabit: "Sabit (çerçeveli) sineklik" };
    var LBL = {
      yer: { pencere: "pencere", balkon: "balkon kapısı", kapi: "giriş ya da bahçe kapısı" },
      acilis: { ice: "içe açılır kanat", surgu: "sürgülü", vasistas: "vasistas / çift açılım", bilmiyorum: "açılış şekli belirsiz" },
      gecis: { sik: "sık geçiş var", az: "pek geçilmiyor" }
    };
    function val(n) { var c = $("input[name=" + n + "]:checked", box); return c ? c.value : null; }
    function run() {
      var yer = val("yer"), ac = val("acilis"), ge = val("gecis");
      var S = { plise: 0, mente: 0, surgu: 0, stor: 0, sabit: 0 }, why = { plise: [], mente: [], surgu: [], stor: [], sabit: [] };
      function add(m, n, w) { S[m] += n; if (w) why[m].push(w); }
      if (yer === "pencere") { add("sabit", 3, "pencerelerde en sade çözüm"); add("stor", 3, "kullanılmadığında kutusunda gizlenir"); add("plise", 2, "kenarda az yer kaplar"); add("mente", -2); }
      if (yer === "balkon") { add("plise", 3, "geniş kapı açıklıklarında sık tercih edilir"); add("mente", 2, "kapı gibi itip geçilir"); add("surgu", 1); add("stor", -1); }
      if (yer === "kapi") { add("mente", 3, "giriş ve bahçe kapısında kapı gibi kullanılır"); add("plise", 2, "kenara toplanınca geçişi kapatmaz"); add("stor", -2); add("sabit", -3); }
      if (ac === "surgu") { add("surgu", 4, "sürgülü doğramayla aynı mantıkta çalışır"); add("plise", 1); add("mente", -2); add("sabit", -1); }
      if (ac === "ice") { add("sabit", 1, "içe açılan kanadın hareketine engel olmayacak biçimde takılabilir"); add("stor", 1); add("plise", 1); }
      if (ac === "vasistas") { add("sabit", 2, "vasistas açılımda kanadı serbest bırakır"); add("stor", 1); }
      if (ge === "sik") { add("plise", 2, "gün içinde çok açılıp kapanmaya uygun"); add("mente", 2, "elleriniz doluyken bile itip geçilebilir"); add("surgu", 1); add("stor", -3); add("sabit", -3); }
      if (ge === "az") { add("sabit", 1); add("stor", 1, "sezon boyu inik kalabilir"); }
      var order = Object.keys(S).sort(function (a, b) { return S[b] - S[a]; }).filter(function (k) { return S[k] > 0; }).slice(0, 3);
      if (!yer && !ac && !ge) { list.innerHTML = ""; hint.textContent = "Soldaki üç soruyu yanıtlayın; size uyabilecek modeller burada sıralansın."; wa.hidden = true; return; }
      hint.textContent = "Yanıtlarınıza göre öne çıkanlar (genel bilgi; kesin karar pencereyi görünce verilir):";
      list.innerHTML = "";
      order.forEach(function (k) {
        var li = document.createElement("li");
        var b = document.createElement("b"); b.textContent = NAMES[k];
        var s = document.createElement("span"); s.textContent = why[k].length ? "Neden: " + why[k].slice(0, 2).join("; ") + "." : "Bu koşullarda da kullanılabilir.";
        li.appendChild(b); li.appendChild(s); list.appendChild(li);
      });
      var parts = [];
      if (yer) parts.push("Yer: " + LBL.yer[yer]);
      if (ac) parts.push("Açılış: " + LBL.acilis[ac]);
      if (ge) parts.push("Geçiş: " + LBL.gecis[ge]);
      var msg = "Merhaba Haser Sineklik, sineklik için bilgi almak istiyorum.\n" + parts.join("\n") + "\nSitede öne çıkan modeller: " + order.map(function (k) { return NAMES[k]; }).join(", ") + ".\nBu durumda hangi seçenekleriniz var?";
      wa.href = waLink(msg); wa.hidden = false;
    }
    box.addEventListener("change", run);
    run();
  })();

  /* =====================================================================
     ÖLÇÜ FORMU
     ===================================================================== */
  (function () {
    var root = $("[data-olcu]");
    if (!root) return;
    var rowsEl = $("[data-rows]", root), addBtn = $("[data-add-row]", root), msgEl = $("[data-msg]", root), wa = $("[data-wa]", root), copyBtn = $("[data-copy]", root), ok = $("[data-copy-ok]", root);
    var totalEl = $("[data-total]", root), areaEl = $("[data-area]", root), warnEl = $("[data-warn]", root);
    var nameEl = $("[name=ad]", root), semtEl = $("[name=semt]", root), noteEl = $("[name=not]", root), visitEl = $("[name=yerinde]", root);
    var YER = ["Salon penceresi", "Yatak odası penceresi", "Çocuk odası penceresi", "Mutfak penceresi", "Banyo penceresi", "Balkon kapısı", "Giriş / bahçe kapısı", "Diğer"];
    var MODEL = ["Emin değilim", "Plise", "Menteşeli", "Sürgülü", "Stor", "Sabit"];
    var rows = [], uid = 0;

    function opt(arr, sel) { return arr.map(function (v) { return "<option" + (v === sel ? " selected" : "") + ">" + v + "</option>"; }).join(""); }
    function newRow(o) { o = o || {}; uid++; return { id: uid, yer: o.yer || YER[0], model: o.model || MODEL[0], en: o.en || "", boy: o.boy || "", adet: o.adet || 1 }; }

    function sketch(r) {
      var en = num(r.en), boy = num(r.boy), ok2 = en > 0 && boy > 0;
      var maxW = 92, maxH = 100, w = 64, h = 84;
      if (ok2) { var sc = Math.min(maxW / en, maxH / boy); w = Math.max(14, en * sc); h = Math.max(14, boy * sc); }
      var x = 18 + (maxW - w) / 2, y = 8 + (maxH - h) / 2;
      var m = r.model, extra = "";
      if (m === "Plise") { for (var i = 1; i < 8; i++) extra += '<path d="M' + (x + w * i / 8).toFixed(1) + " " + y.toFixed(1) + "v" + h.toFixed(1) + '" stroke="#3B6E1C" stroke-opacity=".45" stroke-width="1"/>'; }
      if (m === "Menteşeli") extra = '<rect x="' + (x - 3).toFixed(1) + '" y="' + (y + h * .15).toFixed(1) + '" width="4" height="8" fill="#1D2A1A"/><rect x="' + (x - 3).toFixed(1) + '" y="' + (y + h * .75).toFixed(1) + '" width="4" height="8" fill="#1D2A1A"/>';
      if (m === "Sürgülü") extra = '<path d="M' + (x + w / 2).toFixed(1) + " " + y.toFixed(1) + "v" + h.toFixed(1) + '" stroke="#1D2A1A" stroke-width="2"/>';
      if (m === "Stor") extra = '<rect x="' + (x - 3).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" width="' + (w + 6).toFixed(1) + '" height="7" rx="3" fill="#1D2A1A"/>';
      if (m === "Sabit") extra = '<rect x="' + (x + 3).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (w - 6).toFixed(1) + '" height="' + (h - 6).toFixed(1) + '" fill="none" stroke="#3B6E1C" stroke-width="1.5"/>';
      var lblEn = ok2 ? fmt(en) + " cm" : "en ?", lblBoy = ok2 ? fmt(boy) + " cm" : "boy ?";
      return '<svg class="sketch" viewBox="0 0 130 140" role="img" aria-label="Taslak: ' + (ok2 ? fmt(en) + " × " + fmt(boy) + " cm" : "ölçü bekleniyor") + '">' +
        '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="#F7FBEF"/>' +
        '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="url(#p-mesh)" stroke="#1D2A1A" stroke-width="2.5"/>' + extra +
        '<path d="M' + x.toFixed(1) + " " + (y + h + 10).toFixed(1) + "h" + w.toFixed(1) + '" stroke="#3B6E1C" stroke-width="1.5"/>' +
        '<path d="M' + x.toFixed(1) + " " + (y + h + 6).toFixed(1) + "v8M" + (x + w).toFixed(1) + " " + (y + h + 6).toFixed(1) + 'v8" stroke="#3B6E1C" stroke-width="1.5"/>' +
        '<text x="' + (x + w / 2).toFixed(1) + '" y="' + Math.min(137, y + h + 24).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="800" fill="#1D2A1A" font-family="Nunito, sans-serif">' + lblEn + "</text>" +
        '<path d="M' + (x - 8).toFixed(1) + " " + y.toFixed(1) + "v" + h.toFixed(1) + '" stroke="#3B6E1C" stroke-width="1.5"/>' +
        '<text transform="translate(' + (x - 12).toFixed(1) + " " + (y + h / 2).toFixed(1) + ') rotate(-90)" text-anchor="middle" font-size="11" font-weight="800" fill="#1D2A1A" font-family="Nunito, sans-serif">' + lblBoy + "</text>" +
        "</svg>";
    }

    function render() {
      rowsEl.innerHTML = "";
      rows.forEach(function (r, i) {
        var fs = document.createElement("fieldset"); fs.className = "orow"; fs.setAttribute("data-id", r.id);
        fs.innerHTML =
          '<div class="orow-head"><h3>Açıklık ' + (i + 1) + '</h3>' + (rows.length > 1 ? '<button type="button" class="row-del" data-del>Satırı sil</button>' : "") + "</div>" +
          '<div class="fld-2"><label class="fld">Yer<select data-k="yer">' + opt(YER, r.yer) + '</select></label>' +
          '<label class="fld">Model<select data-k="model">' + opt(MODEL, r.model) + "</select></label></div>" +
          '<div class="fld-dims"><label class="fld">En <small>(cm)</small><input type="text" inputmode="decimal" autocomplete="off" placeholder="ör. 120" data-k="en" value="' + r.en + '"></label><span class="x" aria-hidden="true">×</span>' +
          '<label class="fld">Boy <small>(cm)</small><input type="text" inputmode="decimal" autocomplete="off" placeholder="ör. 150" data-k="boy" value="' + r.boy + '"></label></div>' +
          '<div class="qty"><span class="fld" style="margin-right:6px">Adet</span><button type="button" data-q="-1" aria-label="Adedi azalt">−</button><output aria-live="polite">' + r.adet + '</output><button type="button" data-q="1" aria-label="Adedi artır">+</button></div>' +
          sketch(r);
        rowsEl.appendChild(fs);
      });
      update();
    }

    function findRow(el) { var fs = el.closest(".orow"); if (!fs) return null; var id = +fs.getAttribute("data-id"); for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return { r: rows[i], fs: fs, i: i }; return null; }

    rowsEl.addEventListener("input", function (e) {
      var k = e.target.getAttribute("data-k"); if (!k) return;
      var f = findRow(e.target); if (!f) return;
      f.r[k] = e.target.value;
      var old = $(".sketch", f.fs); if (old) old.outerHTML = sketch(f.r);
      update();
    });
    rowsEl.addEventListener("change", function (e) { if (e.target.tagName === "SELECT") { var f = findRow(e.target); if (f) { f.r[e.target.getAttribute("data-k")] = e.target.value; var old = $(".sketch", f.fs); if (old) old.outerHTML = sketch(f.r); update(); } } });
    rowsEl.addEventListener("click", function (e) {
      var q = e.target.closest("[data-q]"), del = e.target.closest("[data-del]");
      if (q) { var f = findRow(q); if (!f) return; f.r.adet = clamp(f.r.adet + (+q.getAttribute("data-q")), 1, 50); $("output", f.fs).textContent = f.r.adet; update(); }
      if (del) { var g = findRow(del); if (!g) return; rows.splice(g.i, 1); render(); var h = $(".orow h3", rowsEl); if (h) h.setAttribute("tabindex", "-1"), h.focus(); }
    });
    addBtn.addEventListener("click", function () {
      var lastR = rows[rows.length - 1];
      rows.push(newRow({ model: lastR ? lastR.model : MODEL[0] })); render();
      var fs = rowsEl.lastElementChild; if (fs) { var sel = $("select", fs); if (sel) sel.focus(); }
    });
    [nameEl, semtEl, noteEl, visitEl].forEach(function (el) { if (el) el.addEventListener("input", update); if (el) el.addEventListener("change", update); });

    function build() {
      var lines = ["Merhaba Haser Sineklik, sineklik için ölçü gönderiyorum.", ""];
      var total = 0, area = 0, missing = 0;
      rows.forEach(function (r, i) {
        var en = num(r.en), boy = num(r.boy), has = en > 0 && boy > 0;
        total += r.adet;
        if (has) area += en * boy * r.adet / 10000; else missing++;
        lines.push((i + 1) + ") " + r.yer + " · " + (r.model === "Emin değilim" ? "model: emin değilim" : r.model) + " · " + (has ? "En " + fmt(en) + " cm × Boy " + fmt(boy) + " cm" : "ölçü henüz yok") + " · " + r.adet + " adet");
      });
      lines.push("");
      lines.push("Toplam: " + total + " adet" + (area > 0 ? ", yaklaşık " + fmt(area, 2) + " m²" : "") + (missing ? " (" + missing + " satırda ölçü eksik)" : ""));
      var ad = nameEl && nameEl.value.trim(), semt = semtEl && semtEl.value.trim(), not = noteEl && noteEl.value.trim();
      if (ad) lines.push("Ad: " + ad);
      if (semt) lines.push("Semt / mahalle: " + semt);
      if (visitEl && visitEl.checked) lines.push("Yerinde ölçü ve keşif hakkında da bilgi almak istiyorum.");
      if (not) lines.push("Not: " + not);
      lines.push("");
      lines.push("Fiyat ve montaj zamanı hakkında bilgi verebilir misiniz?");
      return { text: lines.join("\n"), total: total, area: area, missing: missing };
    }
    function update() {
      var b = build();
      msgEl.textContent = b.text;
      wa.href = waLink(b.text);
      totalEl.textContent = b.total;
      areaEl.textContent = b.area > 0 ? fmt(b.area, 2) + " m²" : "—";
      var odd = rows.some(function (r) { var en = num(r.en), boy = num(r.boy); return (en > 0 && (en < 20 || en > 600)) || (boy > 0 && (boy < 20 || boy > 600)); });
      warnEl.textContent = odd ? "Bir ölçü alışılmadık görünüyor; santimetre yazdığınızdan emin olun (ör. 1,2 metre = 120 cm)." : b.missing ? "Ölçüsü olmayan satırlar mesajda \"ölçü henüz yok\" olarak gider; yerinde ölçü isteyebilirsiniz." : "";
      if (ok) ok.textContent = "";
    }
    copyBtn.addEventListener("click", function () { copyText(build().text, ok); });

    /* üç nokta yardımcısı → forma aktar */
    window.__olcuAktar = function (en, boy) {
      var r = rows[rows.length - 1];
      if (r && (r.en || r.boy)) { rows.push(newRow({ model: r.model })); r = rows[rows.length - 1]; }
      if (!r) { rows.push(newRow()); r = rows[0]; }
      r.en = en ? String(en).replace(".", ",") : ""; r.boy = boy ? String(boy).replace(".", ",") : "";
      render();
      var fs = rowsEl.lastElementChild; if (fs) { fs.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); var inp = $("input[data-k=en]", fs); if (inp) inp.focus({ preventScroll: true }); }
    };

    rows.push(newRow({ yer: "Salon penceresi" }));
    render();
  })();

  (function () {
    var box = $("[data-tri]");
    if (!box) return;
    var out = $("[data-tri-out]", box), send = $("[data-tri-send]", box);
    var res = { en: null, boy: null };
    function minOf(names) {
      var v = names.map(function (n) { return num($("[name=" + n + "]", box).value); }).filter(function (x) { return x > 0; });
      if (!v.length) return null;
      return { min: Math.min.apply(null, v), max: Math.max.apply(null, v), n: v.length };
    }
    function run() {
      var a = minOf(["e1", "e2", "e3"]), b = minOf(["b1", "b2", "b3"]);
      res.en = a ? a.min : null; res.boy = b ? b.min : null;
      if (!a && !b) { out.innerHTML = "Ölçüleri girdikçe kullanılacak en ve boy burada görünecek."; send.disabled = true; return; }
      var html = "";
      html += "Kullanılacak en: <b>" + (a ? fmt(a.min) + " cm" : "—") + "</b><br>Kullanılacak boy: <b>" + (b ? fmt(b.min) + " cm" : "—") + "</b>";
      var notes = [];
      if (a && a.n > 1 && a.max - a.min >= 1) notes.push("En ölçülerinde " + fmt(a.max - a.min) + " cm fark var");
      if (b && b.n > 1 && b.max - b.min >= 1) notes.push("boy ölçülerinde " + fmt(b.max - b.min) + " cm fark var");
      if (notes.length) html += '<br><span class="warn" style="display:block;margin-top:6px">' + notes.join(", ") + ". Kasa tam gönye olmayabilir; mesajınıza bir fotoğraf ekleyin.</span>";
      out.innerHTML = html; send.disabled = false;
    }
    box.addEventListener("input", run);
    send.addEventListener("click", function () { if (window.__olcuAktar) window.__olcuAktar(res.en, res.boy); });
    run();
  })();

  /* =====================================================================
     SSS süzgeci
     ===================================================================== */
  (function () {
    var box = $("[data-faq]");
    if (!box) return;
    var q = $("[data-faq-q]", box), chips = $$("[data-faq-cat]", box), count = $("[data-faq-count]", box), empty = $("[data-faq-empty]");
    var items = $$(".faq-item"), groups = $$(".faq-group");
    var cat = "hepsi";
    items.forEach(function (it) { it._t = trNorm(it.textContent); });
    function run() {
      var term = trNorm(q.value.trim()), n = 0;
      items.forEach(function (it) {
        var okCat = cat === "hepsi" || it.closest(".faq-group").getAttribute("data-cat") === cat;
        var okQ = !term || term.split(/\s+/).every(function (w) {
          var stem = w.length > 5 ? w.slice(0, Math.max(4, w.length - 3)) : w; /* Türkçe ekler: temizlik ~ temizlenir */
          return it._t.indexOf(w) > -1 || it._t.indexOf(stem) > -1;
        });
        var show = okCat && okQ; it.hidden = !show; if (show) n++;
        if (term && show && !it.open && term.length > 2) it.open = true;
      });
      groups.forEach(function (g) { g.hidden = !$$(".faq-item", g).some(function (i) { return !i.hidden; }); });
      count.textContent = n + " soru gösteriliyor";
      if (empty) empty.hidden = n > 0;
    }
    q.addEventListener("input", run);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        cat = c.getAttribute("data-faq-cat");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        run();
      });
    });
    run();
  })();

  /* =====================================================================
     İletişim: mesaj kurucu
     ===================================================================== */
  (function () {
    var box = $("[data-contact]");
    if (!box) return;
    var msgEl = $("[data-msg]", box), wa = $("[data-wa]", box), copyBtn = $("[data-copy]", box), ok = $("[data-copy-ok]", box);
    function v(n) { var c = $("input[name=" + n + "]:checked", box); return c ? c.value : ""; }
    function build() {
      var konu = v("konu"), zaman = v("zaman"), not = $("[name=cnot]", box).value.trim(), ad = $("[name=cad]", box).value.trim();
      var lines = ["Merhaba Haser Sineklik,"];
      lines.push(konu ? konu + " için yazıyorum." : "bilgi almak için yazıyorum.");
      if (zaman) lines.push("Bana en uygun zaman: " + zaman + ".");
      if (not) lines.push(not);
      if (ad) lines.push("Ad: " + ad);
      lines.push("Teşekkürler.");
      return lines.join("\n");
    }
    function update() { var t = build(); msgEl.textContent = t; wa.href = waLink(t); if (ok) ok.textContent = ""; }
    box.addEventListener("input", update); box.addEventListener("change", update);
    copyBtn.addEventListener("click", function () { copyText(build(), ok); });
    update();
  })();
})();
