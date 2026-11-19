/* Pawz Up! Grooming & Shop — site.js (bağımlılıksız, düz JS)
   İçerik: canlı açık/kapalı · telefon menüsü · kayan bant durdurma · pati çak (hero)
           randevu bileti oluşturucu · tüy rehberi · keçe testi · sorulacaklar listesi
           mama geçişi kâsesi · hızlı soru kartı
   Formlar hiçbir sunucuya göndermez: seçimlerden Türkçe mesaj kurup WhatsApp bağlantısını açar. */

var HOURS = { "1": [["10:00", "18:00"]], "2": [["10:00", "18:00"]], "3": [["10:00", "18:00"]], "4": [["10:00", "18:00"]], "5": [["10:00", "20:00"]], "6": [["10:00", "18:00"]] };
var WA = "https://wa.me/905380503535";

/* ---- kit/status.js kopyası ---- */
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
/* İstanbul'a göre bugünün tarihi (takvim için) */
function istanbulYMD() {
  try {
    var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    return { y: +o.year, m: +o.month, d: +o.day };
  } catch (e) { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
}

(function () {
  "use strict";
  var DAY = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var DAY3 = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var MON = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var MON3 = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(t) { return WA + "?text=" + encodeURIComponent(t); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function low(s) { return (s || "").toLocaleLowerCase("tr"); }
  function cap(s) { return s ? s.charAt(0).toLocaleUpperCase("tr") + s.slice(1) : s; }
  function checked(root, name) { return root.querySelector('[name="' + name + '"]:checked'); }
  function val(root, name) { var el = checked(root, name); return el ? el.value : ""; }
  function lab(el) { return el ? (el.getAttribute("data-label") || el.parentNode.textContent.trim()) : ""; }
  function labelOf(root, name) { return lab(checked(root, name)); }
  function labels(root, name) { return $$('[name="' + name + '"]:checked', root).map(lab); }
  function txt(root, name) { var el = root.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ""; }

  /* ---------- canlı açık/kapalı + bugünün satırı ---------- */
  var st = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) {
    el.textContent = st.text;
    el.classList.toggle("is-open", st.open);
    el.classList.toggle("is-closed", !st.open);
  });
  $$("[data-hours] tr[data-day]").forEach(function (tr) {
    if (+tr.getAttribute("data-day") === st.dayIndex) tr.classList.add("is-today");
  });

  /* ---------- telefon menüsü ---------- */
  var menuBtn = $("[data-menu]"), nav = $("#site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open, keepFocus) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("nav-open", open);
      if (open) { var a = $(".nav__a", nav); if (a) a.focus(); }
      else if (!keepFocus) menuBtn.focus();
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    var closeBtn = $("[data-menu-close]", nav);
    if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { if (nav.classList.contains("is-open")) setMenu(false, true); }); });
  }

  /* ---------- kayan bant: durdur / oynat ---------- */
  $$("[data-tapes]").forEach(function (t) {
    var b = $("[data-tapes-toggle]", t);
    if (!b) return;
    if (reduced) { t.classList.add("is-paused"); b.hidden = true; return; }
    b.addEventListener("click", function () {
      var p = t.classList.toggle("is-paused");
      b.setAttribute("aria-pressed", p ? "true" : "false");
    });
  });

  /* ---------- pati çak (ana sayfa imza anı) ---------- */
  var h5 = $("[data-high5]");
  if (h5) {
    var words = ["ŞAP!", "PATİ!", "ÇAK!", "HAV!", "MİYAV!"];
    var says = ["Pati çakıldı! Bir daha?", "Hav hav, anlaştık.", "Miyav onaylı selam.", "Kadıköy usulü çak!", "Köpük de çakar mı acaba?"];
    var wi = 0, wordEl = $("[data-high5-word]", h5), say = $("[data-high5-say]", h5);
    var hi = function (manual) {
      h5.classList.remove("is-hi");
      void h5.offsetWidth;
      if (wordEl) wordEl.textContent = words[wi % words.length];
      if (say && manual) say.textContent = says[wi % says.length];
      wi++;
      h5.classList.add("is-hi");
    };
    $$("[data-high5-btn], .h5__svg", h5).forEach(function (el) { el.addEventListener("click", function () { hi(true); }); });
    if (reduced) { h5.classList.add("is-hi"); wi = 1; } else setTimeout(function () { hi(false); }, 650);
  }

  /* ---------- ortak: kopyala + mesaj aracı ---------- */
  function copyText(text, note) {
    function done(ok) { if (note) note.textContent = ok ? "Mesaj kopyalandı; WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; önizlemedeki metni basılı tutup seçebilirsiniz."; }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); return ok;
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback()); });
    else done(fallback());
  }
  function wireTool(root, build, opts) {
    opts = opts || {};
    var out = $("[data-msg]", root), wa = $("[data-wa]", root), cp = $("[data-copy]", root), note = $("[data-note]", root), hint = $("[data-hint]", root);
    var state = { text: "", ok: false, missing: "" };
    function update() {
      state = build();
      if (out) out.textContent = state.text;
      if (wa) { wa.href = waLink(state.text); wa.setAttribute("data-ready", state.ok ? "1" : "0"); }
      if (hint && state.ok) hint.textContent = "";
    }
    root.addEventListener("input", update);
    root.addEventListener("change", update);
    if (cp) cp.addEventListener("click", function () { update(); copyText(state.text, note); });
    if (wa) wa.addEventListener("click", function (e) {
      update();
      if (!state.ok) {
        e.preventDefault();
        if (hint) hint.textContent = state.missing;
        if (opts.focusMissing) opts.focusMissing(state);
        return;
      }
      if (hint) hint.textContent = "";
      if (note) note.textContent = "WhatsApp yeni sekmede açılıyor. Açılmazsa mesajı kopyalayıp 0538 050 35 35 numarasına gönderebilirsiniz.";
      if (opts.onSend) opts.onSend();
    });
    $$("form", root).forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); }); });
    update();
    return update;
  }

  /* ---------- randevu bileti oluşturucu (imza özellik) ---------- */
  var tk = $("[data-ticket-tool]");
  if (tk) (function () {
    var form = $("form", tk), ticket = $("[data-ticket]", tk), cal = $("[data-cal]", tk);
    var resetBtn = $("[data-reset]", tk);
    var now = istanbulNow(), ymd = istanbulYMD();
    var todayIdx = now.d, base = Date.UTC(ymd.y, ymd.m - 1, ymd.d), start = base - todayIdx * 864e5;
    var SLOTS = { sabah: [600, 720], ogle: [720, 900], ikindi: [900, 1080], aksam: [1080, 1200] };
    function closeOf(wd) { var r = HOURS[String(wd)]; if (!r) return 0; var a = r[0][1].split(":"); return +a[0] * 60 + +a[1]; }

    /* üç haftalık takvim: bu haftanın pazartesisinden başlar; pazartesi sütunu kapalı ve üstü çizili */
    var html = "";
    DAY3.forEach(function (d, i) { html += '<span class="cal__h' + (i === 0 ? " is-off" : "") + '" aria-hidden="true">' + d + "</span>"; });
    for (var i = 0; i < 21; i++) {
      var t = start + i * 864e5, dt = new Date(t), wd = i % 7, dn = dt.getUTCDate(), mo = dt.getUTCMonth();
      var past = i < todayIdx, isToday = i === todayIdx, closed = !HOURS[String(wd)];
      var over = isToday && !closed && now.m >= closeOf(wd) - 30;
      var full = dn + " " + MON[mo] + " " + DAY[wd];
      var aria = full + (closed ? ", dükkân kapalı" : past ? ", geçti" : over ? ", bugün için saat kalmadı" : isToday ? ", bugün" : "");
      var cls = "day" + (closed ? " is-mon" : "") + (isToday ? " is-today" : "") + (past ? " is-past" : "");
      html += '<label class="' + cls + '"><input type="radio" name="gun" value="' + t + '" data-wd="' + wd + '" data-today="' + (isToday ? 1 : 0) +
        '" data-label="' + full + '" aria-label="' + aria + '"' + (past || closed || over ? " disabled" : "") + '>' +
        '<span class="day__face" aria-hidden="true"><span class="day__n">' + dn + '</span><span class="day__w">' +
        (closed ? "Kapalı" : isToday ? "Bugün" : MON3[mo]) + "</span></span></label>";
    }
    cal.innerHTML = html;

    function refreshSpecies() {
      var tur = val(form, "tur");
      $$("[data-for]", form).forEach(function (el) {
        var hide = !!tur && el.getAttribute("data-for") !== tur;
        el.hidden = hide;
        if (hide) $$("input", el).forEach(function (inp) { inp.checked = false; });
      });
    }
    function refreshSlots() {
      var g = checked(form, "gun"), wd = g ? +g.getAttribute("data-wd") : -1, isT = !!g && g.getAttribute("data-today") === "1";
      var close = wd >= 0 ? closeOf(wd) : 1200;
      $$('[name="saat"]', form).forEach(function (inp) {
        var s = SLOTS[inp.value], dis = false;
        if (s) { if (s[0] >= close) dis = true; if (isT && now.m >= s[1] - 30) dis = true; }
        inp.disabled = dis;
        if (dis && inp.checked) inp.checked = false;
      });
    }
    var T = {};
    $$("[data-t]", ticket).forEach(function (el) { T[el.getAttribute("data-t")] = el; });
    function setT(k, v, empty) { var el = T[k]; if (!el) return; el.textContent = v || empty; el.classList.toggle("is-empty", !v); }
    var weekCells = $$(".tweek li", ticket);

    function build() {
      refreshSpecies(); refreshSlots();
      var turEl = checked(form, "tur"), tur = lab(turEl);
      var ad = txt(form, "ad"), boy = labelOf(form, "boy"), tuy = labelOf(form, "tuy");
      var hiz = labels(form, "hizmet"), nts = labels(form, "notlar"), serbest = txt(form, "not"), sahip = txt(form, "sahip");
      var g = checked(form, "gun"), gunL = g ? g.getAttribute("data-label") : "", wd = g ? +g.getAttribute("data-wd") : -1;
      var saat = labelOf(form, "saat");
      var parts = [tur, boy, tuy].filter(Boolean).join(", ");
      var dost = ad ? ad + (parts ? " (" + parts + ")" : "") : cap(parts);
      var notes = nts.concat(serbest ? [serbest] : []);
      setT("dost", dost, "Kim geliyor?");
      setT("hizmet", hiz.join(" + "), "Hizmet seçin");
      setT("gun", gunL, "Gün seçin");
      setT("saat", saat, "Saat aralığı seçin");
      setT("not", notes.join("; "), "Yok");
      weekCells.forEach(function (li, i) { li.classList.toggle("is-sel", i === wd); });
      var d = g ? new Date(+g.value) : null;
      var code = (ad || "").replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "").slice(0, 3).toLocaleUpperCase("tr");
      setT("no", "No. " + (d ? pad(d.getUTCDate()) + pad(d.getUTCMonth() + 1) : "····") + (code ? "-" + code : ""), "");
      var miss = [];
      if (!turEl) miss.push("dostunuzun türü");
      if (!hiz.length) miss.push("en az bir bakım işlemi");
      if (!g) miss.push("gün");
      var L = ["Merhaba Pawz Up! Siteden randevu bileti hazırladım:", ""];
      L.push("• Dost: " + (dost || "-"));
      L.push("• Bakım: " + (hiz.length ? hiz.join(", ") : "-"));
      L.push("• Gün: " + (gunL || "-"));
      L.push("• Saat aralığı: " + (saat || "Fark etmez"));
      if (notes.length) L.push("• Notlar: " + notes.join("; "));
      if (sahip) L.push("• Adım: " + sahip);
      L.push("", "Uygun saat için dönüşünüzü bekliyorum. Teşekkürler!");
      return { text: L.join("\n"), ok: !miss.length, miss: miss, missing: miss.length ? "Bilette eksik var: " + miss.join(", ") + "." : "" };
    }

    /* sayfa adresinden ön seçim: randevu.html?tur=kopek&tuy=cift&hizmet=banyo,tirnak */
    try {
      var q = new URLSearchParams(location.search), ok = /^[a-z-]+$/;
      var pre = function (name, v) { if (!ok.test(v)) return; var el = form.querySelector('[name="' + name + '"][value="' + v + '"]'); if (el && !el.disabled) el.checked = true; };
      if (q.get("tur")) pre("tur", q.get("tur"));
      refreshSpecies();
      if (q.get("tuy")) pre("tuy", q.get("tuy"));
      (q.get("hizmet") || "").split(",").forEach(function (h) { if (h) pre("hizmet", h); });
    } catch (e) { /* eski tarayıcı: ön seçim yok */ }

    var update = wireTool(tk, build, {
      focusMissing: function (s) {
        var target = null;
        if (s.miss.indexOf("dostunuzun türü") > -1) target = form.querySelector('[name="tur"]');
        else if (s.miss.indexOf("en az bir bakım işlemi") > -1) target = form.querySelector('[name="hizmet"]');
        else target = form.querySelector('[name="gun"]:not(:disabled)');
        if (target) {
          var box = target.closest("fieldset") || target;
          box.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          setTimeout(function () { target.focus({ preventScroll: true }); }, reduced ? 0 : 450);
        }
      },
      onSend: function () { ticket.classList.add("is-torn"); if (resetBtn) resetBtn.hidden = false; }
    });
    form.addEventListener("input", function () { ticket.classList.remove("is-torn"); });
    form.addEventListener("change", function () { ticket.classList.remove("is-torn"); });
    if (resetBtn) resetBtn.addEventListener("click", function () {
      form.reset(); ticket.classList.remove("is-torn"); resetBtn.hidden = true; update();
      var n = $("[data-note]", tk); if (n) n.textContent = "";
      form.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  })();

  /* ---------- tüy tipi rehberi ---------- */
  $$("[data-coat]").forEach(function (root) {
    var cards = $$("[data-coat-card]", root);
    function show() {
      var v = val(root, "coat") || (cards[0] && cards[0].getAttribute("data-coat-card"));
      cards.forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-coat-card") === v); });
    }
    root.addEventListener("change", show);
    show();
  });

  /* ---------- keçe (tarak) testi ---------- */
  $$("[data-mat]").forEach(function (root) {
    var boxes = $$('input[type="checkbox"]', root), bar = $("[data-mat-bar]", root);
    var title = $("[data-mat-title]", root), text = $("[data-mat-text]", root), link = $("[data-mat-link]", root);
    var R = [
      ["Tüyler rahat görünüyor", "Düzenli taramaya devam edin. Kulak arkası, koltuk altı ve tasma bölgesini haftada birkaç kez kontrol etmek, düğümü daha başlamadan yakalar."],
      ["Başlangıç düğümleri olabilir", "Düğümü parmaklarınızla gevşetip uçtan köke doğru, kısa hareketlerle tarayın. Deriye çekiştirmeden açılmıyorsa zorlamayın; bakımda tüy açma isteyebilirsiniz."],
      ["Keçe ilerlemiş olabilir", "Sıkı keçeyi evde zorla taramak canını yakabilir ve deriyi tahriş edebilir. Tüy açma ya da dostunuzun rahatı için kısa kesim seçeneğini konuşmak için yazın. Keçenin altında kızarıklık, yara ya da koku varsa önce veteriner hekiminize danışın."]
    ];
    function upd() {
      var n = boxes.filter(function (b) { return b.checked; }).length, lv = n === 0 ? 0 : n <= 2 ? 1 : 2;
      bar.style.width = Math.round(n / boxes.length * 100) + "%";
      bar.setAttribute("data-level", String(n));
      title.textContent = R[lv][0]; text.textContent = R[lv][1];
      if (link) link.hidden = lv === 0;
    }
    root.addEventListener("change", upd);
    upd();
  });

  /* ---------- sorulacaklar listesi (shop) ---------- */
  var lt = $("[data-list-tool]");
  if (lt) (function () {
    var form = $("form", lt), list = $("[data-list]", lt);
    wireTool(lt, function () {
      var items = labels(form, "urun"), kim = labelOf(form, "kim"), yas = labelOf(form, "yas");
      var kilo = txt(form, "kilo"), boyun = txt(form, "boyun"), gogus = txt(form, "gogus"), not = txt(form, "marka"), ad = txt(form, "ad");
      list.innerHTML = "";
      if (!items.length) { var e = document.createElement("li"); e.className = "is-empty"; e.textContent = "Henüz bir şey seçmediniz"; list.appendChild(e); }
      items.forEach(function (it) { var li = document.createElement("li"); li.textContent = it; list.appendChild(li); });
      var L = ["Merhaba Pawz Up! Dükkânda şunlar var mı, çeşit ve fiyat bilgisi alabilir miyim?", ""];
      items.forEach(function (it) { L.push("• " + it); });
      var who = [yas, kim].filter(Boolean).join(" ");
      if (who || kilo) L.push("", "Kimin için: " + (who || "-") + (kilo ? ", yaklaşık " + kilo + " kg" : ""));
      if (boyun || gogus) L.push("Ölçüler: " + [boyun ? "boyun " + boyun + " cm" : "", gogus ? "göğüs " + gogus + " cm" : ""].filter(Boolean).join(", "));
      if (not) L.push("Not: " + not);
      if (ad) L.push("Adım: " + ad);
      L.push("", "Teşekkürler!");
      return { text: L.join("\n"), ok: items.length > 0, missing: "Listeye en az bir ürün grubu ekleyin." };
    });
  })();

  /* ---------- mama geçişi kâsesi ---------- */
  $$("[data-bowl]").forEach(function (root) {
    var r = $('input[type="range"]', root), out = $("[data-bowl-day]", root), tx = $("[data-bowl-text]", root);
    var kibs = $$(".kib", root), steps = $$(".plan-strip li", root);
    var P = [
      { to: 3, n: 1, t: "Dörtte üç eski mama, dörtte bir yeni mama." },
      { to: 6, n: 2, t: "Yarı yarıya: yarısı eski, yarısı yeni mama." },
      { to: 9, n: 3, t: "Dörtte bir eski mama, dörtte üç yeni mama." },
      { to: 10, n: 4, t: "Kâsenin tamamı yeni mama. İştah ve dışkı normalse geçiş tamamlandı." }
    ];
    function upd() {
      var d = +r.value, k = 0;
      while (d > P[k].to) k++;
      var nNew = Math.round(kibs.length * P[k].n / 4);
      kibs.forEach(function (el) { el.setAttribute("fill", +el.getAttribute("data-o") < nNew ? "#FF4F79" : "#2EC4B6"); });
      out.textContent = d + ". gün";
      tx.textContent = P[k].t;
      r.setAttribute("aria-valuetext", d + ". gün: " + P[k].t);
      steps.forEach(function (li, i) { li.classList.toggle("is-on", i === k); });
    }
    r.addEventListener("input", upd);
    upd();
  });

  /* ---------- hızlı soru kartı (iletişim) ---------- */
  var ask = $("[data-ask-tool]");
  if (ask) (function () {
    var f = $("form", ask);
    var K = {
      randevu: "Dostum için randevu almak istiyorum. Önümüzdeki günlerde uygun gün ve saatleriniz nedir?",
      fiyat: "Dostum için bakım ücreti hakkında bilgi almak istiyorum.",
      urun: "Dükkânda aradığım bir ürün var; stokta olup olmadığını sorabilir miyim?",
      kedi: "Kedim için bakım seçenekleri hakkında bilgi almak istiyorum.",
      diger: "Bir sorum olacaktı."
    };
    wireTool(ask, function () {
      var k = val(f, "konu"), dost = txt(f, "dost"), m = txt(f, "mesaj"), ad = txt(f, "ad");
      var L = ["Merhaba Pawz Up!"];
      if (k) L.push(K[k]);
      if (dost) L.push("Dostum: " + dost);
      if (m) L.push(m);
      if (ad) L.push("Adım: " + ad);
      L.push("Teşekkürler!");
      return { text: L.join("\n"), ok: !!(k || m), missing: "Bir konu seçin ya da mesajınızı yazın." };
    });
  })();
})();
