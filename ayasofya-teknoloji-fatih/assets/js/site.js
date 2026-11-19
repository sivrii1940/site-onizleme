/* Ayasofya Teknoloji — site.js
   Kubbe saati, devre darbeleri, canlı açık/kapalı durumu ve WhatsApp mesajı kuran araçlar.
   Hiçbir form sunucuya veri göndermez; mesaj yalnızca kullanıcı WhatsApp'ta gönderirse gider. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var BRAND = "Ayasofya Teknoloji";
  var WA = "https://wa.me/905528888862";
  var HOURS = {
    "0": [["10:00", "00:00"]], "1": [["10:00", "00:00"]], "2": [["10:00", "00:00"]], "3": [["10:00", "00:00"]],
    "4": [["10:00", "00:00"]], "5": [["10:00", "00:00"]], "6": [["10:00", "00:00"]]
  };

  /* ---- kit/status.js'ten kopya: açık/kapalı durumu ---- */
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
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function fmt(n, d) { return Number(n).toLocaleString("tr-TR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function fallbackCopy(t) {
    var ta = document.createElement("textarea");
    ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta); return ok;
  }
  function copyText(t, statusEl) {
    function done(ok) {
      if (!statusEl) return;
      statusEl.textContent = ok ? "Kopyalandı. Dilediğiniz yere yapıştırabilirsiniz." : "Kopyalanamadı; metni basılı tutup elle kopyalayın.";
      clearTimeout(statusEl._t); statusEl._t = setTimeout(function () { statusEl.textContent = ""; }, 4000);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(fallbackCopy(t)); });
    } else { done(fallbackCopy(t)); }
  }

  /* Ortak çıktı: mesaj önizlemesi + WhatsApp bağlantısı + kopyala */
  function wireOut(root, build) {
    var msgEl = $("[data-msg]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root), st = $("[data-copied]", root);
    function update() {
      var m = build();
      if (msgEl) msgEl.textContent = m;
      if (wa) wa.setAttribute("href", waHref(m));
      return m;
    }
    if (cp) cp.addEventListener("click", function () { copyText(build(), st); });
    root.addEventListener("input", update);
    root.addEventListener("change", update);
    update();
    return update;
  }

  /* ---- canlı durum, kubbe saati, 24 saat şeridi ---- */
  var CX = 400, CY = 305, R = 196;
  function arcPt(f, r) { var th = Math.PI * (1 - f); return [CX + r * Math.cos(th), CY - r * Math.sin(th)]; }
  function paintDomeClock(s) {
    var g = document.getElementById("tNow");
    if (!g) return;
    var svg = g.ownerSVGElement, lit = document.getElementById("tLit"), txt = document.getElementById("tNowTxt");
    var st = document.getElementById("tStart"), en = document.getElementById("tEnd");
    var m = s.minutes, open = s.open;
    var f = open ? (m - 600) / 840 : 0;
    if (f < 0) f = 0; if (f > 1) f = 1;
    var p = arcPt(f, R);
    g.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
    lit.setAttribute("d", open && f > 0.004 ? "M204 305A196 196 0 0 1 " + p[0].toFixed(1) + " " + p[1].toFixed(1) : "M204 305");
    var lp = arcPt(f, R + 30);
    var anchor = lp[0] < 372 ? "end" : (lp[0] > 428 ? "start" : "middle");
    txt.setAttribute("x", lp[0].toFixed(1));
    txt.setAttribute("y", (lp[1] + 6).toFixed(1));
    txt.setAttribute("text-anchor", anchor);
    txt.textContent = open ? "Şu an " + pad(Math.floor(m / 60)) + ":" + pad(m % 60) : "Kapalı";
    if (!open) { txt.setAttribute("y", (lp[1] - 18).toFixed(1)); txt.setAttribute("text-anchor", "middle"); txt.setAttribute("x", (lp[0] - 6).toFixed(1)); }
    if (st) st.style.opacity = (open && f < 0.07) ? "0" : "1";
    if (en) en.style.opacity = (open && f > 0.93) ? "0" : "1";
    svg.classList.toggle("is-closed", !open);
  }
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      var p = el.closest(".pill");
      if (p) { p.classList.toggle("is-open", s.open); p.classList.toggle("is-closed", !s.open); }
    });
    paintDomeClock(s);
    $$("[data-now]").forEach(function (el) { el.style.left = (s.minutes / 1440 * 100).toFixed(2) + "%"; el.classList.add("on"); });
    $$("[data-day]").forEach(function (li) { li.classList.toggle("today", parseInt(li.getAttribute("data-day"), 10) === s.dayIndex); });
  }

  /* ---- kubbeye dokununca devre yolları ışır ---- */
  function initDome() {
    var svg = $(".dome-svg");
    if (!svg) return;
    var layer = $(".bursts", svg);
    function ripple(x, y) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("r", "16"); c.setAttribute("class", "rip");
      layer.appendChild(c); setTimeout(function () { c.remove(); }, 1000);
    }
    function burst(x, y) {
      if (reduceMotion) return;
      if (typeof x === "number") ripple(x, y);
      $$(".pulses .pl", svg).forEach(function (pl, i) {
        var c = pl.cloneNode(false);
        c.setAttribute("class", "bst");
        c.removeAttribute("style");
        c.style.animationDelay = ((i % 6) * 0.07) + "s";
        layer.appendChild(c);
        setTimeout(function () { c.remove(); }, 1700);
      });
    }
    svg.addEventListener("click", function (e) {
      var ctm = svg.getScreenCTM();
      if (ctm && svg.createSVGPoint) {
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var q = pt.matrixTransform(ctm.inverse()); burst(q.x, q.y);
      } else { burst(); }
    });
    svg.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); burst(400, 160); }
    });
  }

  /* ---- ekranda görünmeyen çizimlerin hareketini durdur (ısı/pil dostu) ---- */
  function initPause() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("paused", !e.isIntersecting); });
    }, { rootMargin: "60px" });
    $$(".dome-svg, .mini-dome, .foot-dome, .batt, .street").forEach(function (el) { io.observe(el); });
    document.addEventListener("visibilitychange", function () {
      document.documentElement.classList.toggle("hidden-tab", document.hidden);
    });
  }

  /* ---- menü ---- */
  function initMenu() {
    var head = $("[data-head]"), btn = $(".menu-btn");
    if (!head || !btn) return;
    var lbl = $("[data-lbl]", btn);
    function set(o) { head.classList.toggle("open", o); btn.setAttribute("aria-expanded", o ? "true" : "false"); if (lbl) lbl.textContent = o ? "Kapat" : "Menü"; }
    btn.addEventListener("click", function () { set(!head.classList.contains("open")); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && head.classList.contains("open")) { set(false); btn.focus(); } });
  }

  /* ---- İMZA: telefonuma uygun aksesuar (ana sayfa hızlı soru + Ürün sor seçici) ---- */
  function initAksesuar(root) {
    function val(n) { var el = root.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; }
    function checkedVals(n) { return $$('[name="' + n + '"]:checked', root).map(function (i) { return i.value; }); }
    function radio(n) { var r = root.querySelector('[name="' + n + '"]:checked'); return r ? r.value : ""; }
    var details = $$("[data-detail]", root);
    var empty = $("[data-detail-empty]", root);
    var steps = $$("[data-step]", root);

    function boxTypes(b) { return b.getAttribute("data-detail").split("|"); }
    function syncDetails(types) {
      var anyShown = false;
      details.forEach(function (b) {
        var show = boxTypes(b).some(function (t) { return types.indexOf(t) > -1; });
        b.hidden = !show; if (show) anyShown = true;
      });
      if (empty) empty.hidden = anyShown;
    }
    function detailFor(t) {
      var parts = [];
      details.forEach(function (b) {
        if (b.hidden || b.hasAttribute("data-shared") || boxTypes(b).indexOf(t) < 0) return;
        $$("input:checked", b).forEach(function (i) { if (i.value && i.value !== "Fark etmez") parts.push(i.value); });
        $$('input[type="text"]', b).forEach(function (i) { if (i.value.trim()) parts.push("renk: " + i.value.trim()); });
      });
      return parts.join(", ");
    }
    function build() {
      var model = val("model"), types = checkedVals("tur");
      var unknownEl = root.querySelector('[name="bilmiyorum"]');
      var unknown = unknownEl && unknownEl.checked;
      syncDetails(types);
      var L = ["Merhaba " + BRAND + ","];
      if (model) L.push("Telefonum: " + model);
      else if (unknown) L.push("Telefonumun modelini bilmiyorum, arkasının fotoğrafını göndereceğim.");
      if (types.length) {
        L.push(""); L.push("Bakmak istediğim ürünler:");
        types.forEach(function (t) { var d = detailFor(t); L.push("• " + t + (d ? " (" + d + ")" : "")); });
        details.forEach(function (b) {
          if (b.hidden || !b.hasAttribute("data-shared")) return;
          $$("[data-line]", b).forEach(function (g) {
            var v = $$("input:checked", g).map(function (i) { return i.value; }).join(", ");
            if (v) L.push(g.getAttribute("data-line") + ": " + v);
          });
        });
      } else {
        L.push((model || unknown) ? "Bu telefona uygun aksesuarlar hakkında bilgi almak istiyorum." : "Telefonuma uygun aksesuarlar hakkında bilgi almak istiyorum.");
      }
      var niyet = radio("niyet"); if (niyet) { L.push(""); L.push(niyet + "."); }
      var not = val("not"); if (not) { L.push("Not: " + not); }
      var ad = val("ad"); L.push(""); L.push(ad ? "Teşekkürler, " + ad : "Teşekkürler.");
      if (steps.length) {
        var visibleChecked = details.some(function (b) { return !b.hidden && $$("input:checked", b).length > 0; });
        var st = [!!(model || unknown), types.length > 0, visibleChecked, !!(niyet || not || ad)];
        steps.forEach(function (s, i) { s.classList.toggle("done", !!st[i]); });
      }
      return L.join("\n");
    }
    wireOut(root, build);
  }

  /* ---- telefon seçme pusulası ---- */
  function initPusula(root) {
    var infos = $$("[data-infos] .info", root), hint = $("[data-hint]", root);
    function build() {
      var sel = $$('[name="oncelik"]:checked', root);
      var keys = sel.map(function (i) { return i.value; });
      infos.forEach(function (el) { el.hidden = keys.length > 0 && keys.indexOf(el.getAttribute("data-k")) < 0; });
      if (hint) hint.textContent = keys.length ? "Seçtiğiniz " + keys.length + " öncelik için bakmanız gerekenler:" : "Hiçbir şey seçmediğinizde tüm başlıklar görünür; seçtikçe yalnız sizin için önemli olanlar kalır.";
      var L = ["Merhaba " + BRAND + ",", "Telefon bakıyorum."];
      if (sel.length) L.push("Benim için önemli olanlar: " + sel.map(function (i) { return i.getAttribute("data-ad"); }).join(", ") + ".");
      var not = ($('[name="not"]', root) || {}).value; if (not && not.trim()) L.push("Not: " + not.trim());
      L.push("Elinizdeki seçenekler hakkında bilgi alabilir miyim?");
      return L.join("\n");
    }
    wireOut(root, build);
  }

  /* ---- kaç GB yeter? ---- */
  function initDepolama(root) {
    var TIERS = [64, 128, 256, 512, 1024];
    var SYS = 15;
    function v(k) { var el = $('[data-k="' + k + '"]', root); return el ? parseFloat(el.value) || 0 : 0; }
    function build() {
      var gb = {
        sys: SYS,
        foto: v("foto") * 3 / 1024,
        v1080: v("v1080") * 100 / 1024,
        v4k: v("v4k") * 300 / 1024,
        app: v("app") * 0.2,
        msg: v("msg"),
        muz: v("muz")
      };
      var total = 0; Object.keys(gb).forEach(function (k) { total += gb[k]; });
      var need = total * 4 / 3, rec = TIERS[TIERS.length - 1];
      for (var i = 0; i < TIERS.length; i++) { if (TIERS[i] >= need) { rec = TIERS[i]; break; } }
      var label = function (x) { return x >= 1024 ? "1 TB" : x + " GB"; };
      var o = {
        foto: fmt(v("foto")), v1080: fmt(v("v1080")) + " dk", v4k: fmt(v("v4k")) + " dk",
        app: fmt(v("app")), msg: fmt(v("msg")) + " GB", muz: fmt(v("muz")) + " GB"
      };
      Object.keys(o).forEach(function (k) { var el = $('[data-o="' + k + '"]', root); if (el) el.textContent = o[k]; });
      $("[data-total]", root).textContent = "~ " + fmt(Math.round(total)) + " GB";
      Object.keys(gb).forEach(function (k) { var s = $('[data-seg="' + k + '"]', root); if (s) s.style.width = (gb[k] / rec * 100).toFixed(2) + "%"; });
      $$("[data-gb]", root).forEach(function (li) { li.classList.toggle("on", parseInt(li.getAttribute("data-gb"), 10) === rec); });
      var recEl = $("[data-rec]", root);
      if (need > 1024) recEl.textContent = "Hesaplanan ihtiyaç 1 TB'ı aşıyor; bir kısmını buluta ya da harici depolamaya taşımayı düşünün.";
      else recEl.textContent = "Önerilen kapasite: en az " + label(rec) + ". Çubuk, bu kapasitenin ne kadarının dolacağını gösterir; değerler yaklaşık ortalamadır.";
      return "Merhaba " + BRAND + ",\nEn az " + label(rec) + " depolamalı telefon bakıyorum. Elinizdeki seçenekler hakkında bilgi alabilir miyim?";
    }
    wireOut(root, build);
  }

  /* ---- kontrol listesi ---- */
  function initChecklist(root) {
    var boxes = $$('input[type="checkbox"]', root), out = $("[data-prog]", root), fill = $(".progress-fill", root), KEY = "ayasofya-kontrol";
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "[]"); boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) > -1; }); } catch (e) { /* depolama yoksa sorun değil */ }
    function upd() {
      var on = []; boxes.forEach(function (b, i) { if (b.checked) on.push(i); });
      out.textContent = on.length + " / " + boxes.length + " tamam";
      fill.style.width = (on.length / boxes.length * 100) + "%";
      try { localStorage.setItem(KEY, JSON.stringify(on)); } catch (e) { /* yok say */ }
    }
    root.addEventListener("change", upd);
    var rs = $("[data-reset]", root);
    if (rs) rs.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  /* ---- arıza belirtisi rehberi ---- */
  function initAriza(root) {
    var infos = $$(".infos .info", root);
    function build() {
      var r = $('[name="belirti"]:checked', root);
      var k = r ? r.value : "";
      infos.forEach(function (el) { el.hidden = !!k && el.getAttribute("data-k") !== k; });
      var model = ($('[name="model"]', root) || {}).value || "";
      var L = ["Merhaba " + BRAND + ","];
      if (model.trim()) L.push("Telefonum: " + model.trim());
      L.push(r ? "Telefonumda bir arıza var: " + r.getAttribute("data-ad").toLocaleLowerCase("tr-TR") + "." : "Telefonumda bir arıza var.");
      L.push("Bilgi alabilir miyim?");
      return L.join("\n");
    }
    wireOut(root, build);
  }

  /* ---- uç tanıma ---- */
  function initUc(root) {
    var btns = $$("[data-port]", root), infos = $$(".infos .info", root), cur = "usbc";
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        cur = b.getAttribute("data-port");
        btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        update();
      });
    });
    function build() {
      infos.forEach(function (el) { el.hidden = el.getAttribute("data-k") !== cur; });
      var b = btns.filter(function (x) { return x.getAttribute("data-port") === cur; })[0];
      var ad = b ? b.getAttribute("data-ad") : "";
      if (cur === "jak") return "Merhaba " + BRAND + ",\nTelefonumda 3,5 mm kulaklık girişi var. Bu girişe uygun kulaklık sormak istiyorum.";
      if (cur === "usba") return "Merhaba " + BRAND + ",\nAdaptör tarafı USB-A olan bir kablo ve şarj aleti sormak istiyorum. Telefonumun girişini de yazacağım.";
      return "Merhaba " + BRAND + ",\nTelefonumda " + ad + " giriş var. Bu girişe uygun kablo ve şarj aleti sormak istiyorum.";
    }
    var update = wireOut(root, build);
  }

  /* ---- powerbank dolum hesabı ---- */
  function initPowerbank(root) {
    var ozelBox = $("[data-ozel]", root);
    function build() {
      var tel = parseFloat(($('[name="tel"]', root) || {}).value) || 0;
      var r = $('[name="pb"]:checked', root), pbv = r ? r.value : "10000";
      if (ozelBox) ozelBox.hidden = pbv !== "ozel";
      var pb = pbv === "ozel" ? (parseFloat(($('[name="ozel"]', root) || {}).value) || 0) : parseFloat(pbv);
      var dolum = tel > 0 ? pb * 0.65 / tel : 0;
      var wh = pb * 3.7 / 1000;
      $("[data-dolum]", root).textContent = tel > 0 && pb > 0 ? "~ " + fmt(dolum, 1) + " kez" : "—";
      var cls = wh <= 100 ? "kabin bagajında taşınabilecek sınıfta (100 Wh altı); bavula konmaz." : (wh <= 160 ? "uçakta taşımak için havayolu onayı gerekir (100–160 Wh)." : "uçakta taşınamayacak kadar büyük (160 Wh üstü).");
      $("[data-wh]", root).textContent = fmt(wh, 0) + " Wh · " + cls;
      return "Merhaba " + BRAND + ",\n" + fmt(pb) + " mAh civarında powerbank sormak istiyorum." + (tel ? " Telefonumun bataryası yaklaşık " + fmt(tel) + " mAh." : "");
    }
    wireOut(root, build);
  }

  /* ---- adresi kopyala ---- */
  function initCopyText() {
    $$("[data-copy-text]").forEach(function (b) {
      b.addEventListener("click", function () {
        var st = b.parentNode && b.parentNode.nextElementSibling && b.parentNode.nextElementSibling.matches("[data-copied]") ? b.parentNode.nextElementSibling : null;
        copyText(b.getAttribute("data-copy-text"), st);
      });
    });
  }

  /* ---- başlat ---- */
  function boot() {
    initMenu();
    paintStatus();
    setInterval(paintStatus, 30000);
    initDome();
    initPause();
    initCopyText();
    $$('[data-tool="aksesuar"]').forEach(initAksesuar);
    $$('[data-tool="pusula"]').forEach(initPusula);
    $$('[data-tool="depolama"]').forEach(initDepolama);
    $$('[data-tool="ariza"]').forEach(initAriza);
    $$('[data-tool="uc"]').forEach(initUc);
    $$('[data-tool="powerbank"]').forEach(initPowerbank);
    $$("[data-checklist]").forEach(initChecklist);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
