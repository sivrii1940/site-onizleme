/* VetLife Veteriner Kliniği — site betiği (kütüphanesiz)
   Canlı tabela, yönlendirme kioskunun (durum seçici) mantığı, randevu fişi, aşı çizelgesi,
   arama hazırlık kartı, soru süzgeci, saat planlayıcı. Hiçbir veri sunucuya gönderilmez;
   mesajlar yalnız kullanıcı düğmeye bastığında WhatsApp'ta açılır. */
(function () {
  "use strict";

  var HOURS = { "0": [["09:30", "23:00"]], "1": [["09:30", "23:00"]], "2": [["09:30", "23:00"]], "3": [["09:30", "23:00"]], "4": [["09:30", "23:00"]], "5": [["09:30", "23:00"]], "6": [["12:00", "23:00"]] };
  var TEL = "tel:+905303660730";
  var PHONE = "0530 366 07 30";
  var WA = "https://wa.me/905303660730";
  var BRAND = "VetLife Veteriner Kliniği";
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  /* ---- kit/status.js (kopya) ---- */
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
  /* ---- /kit/status.js ---- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function mins(s) { var a = String(s).split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1] || "0", 10); }
  function pad(x) { return (x < 10 ? "0" : "") + x; }
  function hhmm(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function dur(m) {
    var h = Math.floor(m / 60), mm = m % 60, out = [];
    if (h) out.push(h + " sa");
    if (mm || !h) out.push(mm + " dk");
    return out.join(" ");
  }
  var DAT = { "23:00": "'e", "09:30": "'a", "12:00": "'ye" };
  var LOC = { "23:00": "'te", "09:30": "'da", "12:00": "'de" };
  function dat(t) { return DAT[t] ? t + DAT[t] : "saat " + t + "'a"; }
  function loc(t) { return LOC[t] ? t + LOC[t] : "saat " + t + "'da"; }
  function icoHTML(n) { return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#' + n + '"/></svg>'; }
  function cvar(key) { return "--c:var(--c-" + key + ")" + (key === "kontrol" ? ";--on:var(--ink)" : ""); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function reduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function makeBtn(cls, href, icon, label, external) {
    var a = document.createElement("a");
    a.className = "btn " + cls;
    a.href = href;
    if (external) { a.target = "_blank"; a.rel = "noopener"; }
    a.innerHTML = icoHTML(icon) + "<span>" + esc(label) + "</span>";
    return a;
  }
  function copyText(text, out) {
    function done(ok) {
      if (!out) return;
      out.textContent = ok ? "Mesaj panoya kopyalandı." : "Kopyalanamadı; metni seçip elle kopyalayın.";
      clearTimeout(out._t); out._t = setTimeout(function () { out.textContent = ""; }, 4000);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  function makeCopyBtn(getText, out, cls) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn " + (cls || "btn--ghost-light");
    b.innerHTML = icoHTML("p-copy") + "<span>Mesajı kopyala</span>";
    b.addEventListener("click", function () { copyText(getText(), out); });
    return b;
  }
  /* Bir textarea + WhatsApp bağlantısını eşleştirir: kullanıcı metni düzenlerse bağlantı da güncellenir. */
  function bindMsg(ta, waBtn) {
    if (!ta || !waBtn) return;
    ta.oninput = function () { waBtn.href = waLink(ta.value); };
  }
  function istDate(offset) {
    var y, m, d;
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      y = +o.year; m = +o.month; d = +o.day;
    } catch (e) { var n = new Date(); y = n.getFullYear(); m = n.getMonth() + 1; d = n.getDate(); }
    return new Date(Date.UTC(y, m - 1, d + (offset || 0)));
  }
  function fmtDate(dt, withYear) { return dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()] + (withYear ? " " + dt.getUTCFullYear() : ""); }

  /* ================= Canlı durum ================= */
  function renderStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-status-short]").forEach(function (el) {
      el.textContent = s.open ? "Açık · " + s.closesAt + "'e dek" : "Şu an kapalı";
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
    });
    $$("[data-day]").forEach(function (el) {
      el.classList.toggle("is-today", parseInt(el.getAttribute("data-day"), 10) === s.dayIndex);
    });
    renderBoard(s);
    return s;
  }
  function renderBoard(s) {
    var b = $("[data-board]");
    if (!b) return;
    var w = $("[data-board-word]", b), sub = $("[data-board-sub]", b), n = s.minutes;
    var word = s.open ? "AÇIK" : "KAPALI";
    b.classList.toggle("is-closed", !s.open);
    if (w.textContent !== word) {
      w.textContent = word;
      if (!reduced()) { w.classList.remove("is-lit"); void w.offsetWidth; w.classList.add("is-lit"); }
    }
    if (s.open) {
      var close = mins(s.closesAt); if (close <= n) close += 1440;
      sub.textContent = "Bugün " + dat(s.closesAt) + " kadar açığız. Kapanışa " + dur(close - n) + " var.";
    } else if (s.opensAt) {
      var k = s.opensWhen === "bugün" ? 0 : s.opensWhen === "yarın" ? 1 : (DAYS.indexOf(s.opensWhen) - s.dayIndex + 7) % 7;
      var until = k * 1440 + mins(s.opensAt) - n;
      var when = s.opensWhen === "bugün" ? "Bugün" : s.opensWhen === "yarın" ? "Yarın" : s.opensWhen;
      sub.textContent = when + " " + loc(s.opensAt) + " açılıyoruz, " + dur(until) + " sonra. Acil bir durumda yine de arayın.";
    }
    var r = HOURS[String(s.dayIndex)] || [];
    if (r.length) {
      var a = mins(r[0][0]), e = mins(r[0][1]); if (e <= a) e = 1440;
      var o = $("[data-tl-open]", b);
      o.style.left = (a / 1440 * 100) + "%"; o.style.width = ((e - a) / 1440 * 100) + "%";
      $("[data-tl-range]", b).textContent = r[0][0] + "–" + r[0][1];
    }
    $("[data-tl-day]", b).textContent = "Bugün, " + DAYS[s.dayIndex];
    var now = $("[data-tl-now]", b);
    now.style.left = (n / 1440 * 100) + "%"; now.classList.add("on");
    $("[data-clock]", b).textContent = "İstanbul saati " + hhmm(n);
  }

  /* ================= Menü (telefon) ================= */
  function initMenu() {
    var rail = $("#levhalar"), open = $("[data-menu]"), close = $("[data-menu-close]");
    if (!rail || !open) return;
    function set(on) {
      rail.classList.toggle("is-open", on);
      document.body.classList.toggle("menu-open", on);
      open.setAttribute("aria-expanded", on ? "true" : "false");
      if (on) { setTimeout(function () { var f = $(".rl", rail); if (f) f.focus(); }, 60); } else { open.focus(); }
    }
    open.addEventListener("click", function () { set(true); });
    if (close) close.addEventListener("click", function () { set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && rail.classList.contains("is-open")) set(false); });
    $$(".rl", rail).forEach(function (a) { a.addEventListener("click", function () { if (rail.classList.contains("is-open")) set(false); }); });
  }

  /* ================= Ortak veri: ziyaret nedenleri ================= */
  var FLAGS = ["Nefes almakta zorlanıyor", "Karnı şişkin ve sert", "Durmayan kanama var", "Nöbet geçirdi ya da geçiriyor", "İdrar yapamıyor", "Zehirli bir şey yemiş olabilir", "Kaza geçirdi, yüksekten düştü"];
  var R = {
    muayene: { t: "Muayene", ico: "p-steth",
      q1: { title: "Ne fark ettiniz?", m: "Fark ettiklerim", hint: "Birden fazla seçebilirsiniz.", type: "checkbox", opts: ["İştahsızlık", "Kusma", "İshal", "Halsizlik", "Kaşıntı, tüy dökülmesi", "Topallama", "Öksürük, hapşırık", "Göz ya da kulak sorunu", "Su içme ya da idrarda değişiklik", "Davranış değişikliği"] },
      q2: { title: "Ne zamandır?", m: "Ne zamandır", type: "radio", opts: ["Bugün başladı", "Birkaç gündür", "Bir haftadan uzun süredir"] },
      bring: ["Aşı karnesi ya da pasaportu", "Kullandığı ilaçların adı (kutunun fotoğrafı yeter)", "Belirtinin videosu ya da fotoğrafı", "Belirtinin başladığı gün ve tekrar sayısı"],
      text: "Belirtiyi ve ne zamandır sürdüğünü yazın; size uygun saati birlikte belirleyelim. Belirtiler hızla kötüleşirse beklemeden arayın." },
    asi: { t: "Aşı", ico: "p-syringe",
      q1: { title: "Hangi aşı için?", m: "Aşı", type: "radio", opts: ["İlk aşılar (yavru)", "Tekrar (rapel) aşısı", "Kuduz aşısı", "Emin değilim"] },
      q2: { title: "Aşı karnesi var mı?", m: "Aşı karnesi", type: "radio", opts: ["Karnesi var", "Karnesi yok"] },
      bring: ["Aşı karnesi ya da pasaportu", "Başka yerde aşı olduysa kayıtları", "Son iç ve dış parazit uygulamasının tarihi"],
      text: "Aşı günü dostunuzun genel durumu değerlendirilir. Halsiz ya da hastaysa bunu yazın; aşının zamanlamasına hekiminiz karar verir." },
    acil: { t: "Acil durum", ico: "p-siren",
      q1: { title: "Ne oldu?", m: "Durum", type: "radio", opts: FLAGS.concat(["Başka bir acil durum"]) },
      bring: ["Zehirlenme şüphesinde ambalaj ya da etiket", "Kullandığı ilaçların kutusu", "Kusmuk ya da dışkının fotoğrafı"] },
    kontrol: { t: "Kontrol", ico: "p-clip",
      q1: { title: "Ne kontrolü?", m: "Kontrol", type: "radio", opts: ["Tedavi sonrası kontrol", "Operasyon sonrası, dikiş kontrolü", "Düzenli sağlık kontrolü", "Yaşlı dost kontrolü"] },
      bring: ["Önceki reçete, rapor ya da notlar", "Kullandığı ilaçların kutuları", "Yara bölgesinin günlük fotoğrafları"],
      text: "Önceki tedaviyle ilgili notlarınızı getirin. İyileşmiş görünse bile hekimin istediği kontrolü atlamayın." },
    parazit: { t: "Pire, kene, parazit", ico: "p-tick",
      q1: { title: "Konu ne?", m: "Konu", type: "radio", opts: ["Pire", "Kene", "İç parazit", "Düzenli koruma planı"] },
      bring: ["Kullandığınız ürünün adı ya da kutusu", "Son uygulamanın tarihi"],
      text: "Kullandığınız ürünün adını ve son uygulama tarihini yazın. Kediye köpek ürünü uygulamayın." },
    kisir: { t: "Kısırlaştırma", ico: "p-lamp",
      q1: { title: "Ne istiyorsunuz?", m: "Talep", type: "radio", opts: ["Ön görüşme, bilgi almak", "Operasyon sonrası kontrol"] },
      q2: { title: "Cinsiyeti", m: "Cinsiyeti", type: "radio", opts: ["Dişi", "Erkek"] },
      bring: ["Aşı karnesi", "Sorularınızın listesi", "Dişilerde son kızgınlık dönemi bilgisi"],
      text: "Süreç kısa bir ön görüşmeyle başlar. Operasyon öncesi aç bırakma talimatını hekiminiz verir." },
    bakim: { t: "Bakım ve beslenme", ico: "p-bowl",
      q1: { title: "Hangi konu?", m: "Konular", hint: "Birden fazla seçebilirsiniz.", type: "checkbox", opts: ["Beslenme ve mama", "Kilo takibi", "Tüy ve deri", "Tırnak ve kulak", "Diş ve ağız", "Yaşlı dost bakımı"] },
      bring: ["Kullandığınız mamanın adı ve günlük miktarı", "Biliyorsanız son kilosu"],
      text: "Merak ettiklerinizi yazın; dostunuzun yaşına ve yaşam düzenine göre birlikte değerlendirelim." }
  };
  function optHTML(name, type, val, key) {
    return '<label class="pick" style="' + cvar(key) + '"><input type="' + type + '" name="' + name + '" value="' + esc(val) + '"><span class="pick-f">' + esc(val) + "</span></label>";
  }
  function checkedVals(form, name) {
    return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; });
  }
  function val(form, name) { var el = form.elements[name]; return el ? String(el.value || "").trim() : ""; }

  /* ================= İMZA: Durum seçici (kiosk) ================= */
  function initKiosk() {
    var form = $("[data-kiosk]");
    if (!form) return;
    var root = form.closest("[data-tool]");
    var ctx = $("[data-ctx]", root), ctxT = $("[data-ctx-title]", root), ctxH = $("[data-ctx-hint]", root);
    var o1 = $("[data-ctx-opts]", root), o2 = $("[data-ctx-opts2]", root);
    var flags = $("[data-flags]", root), flagBox = $("[data-flag-opts]", root);
    var verdict = $("[data-verdict]", root), vIco = $("[data-v-ico]", root), vK = $("[data-v-k]", root), vT = $("[data-v-t]", root);
    var vText = $("[data-v-text]", root), vBring = $("[data-v-bring]", root), vList = $("[data-v-list]", root);
    var msgWrap = $("[data-v-msgwrap]", root), msg = $("[data-v-msg]", root), btns = $("[data-v-btns]", root), copied = $("[data-v-copied]", root);
    var lastStep = $("[data-step-last]", root);
    var current = null, lastState = "";

    flagBox.innerHTML = FLAGS.map(function (f) { return optHTML("flag", "checkbox", f, "acil"); }).join("");

    function renderCtx(key) {
      var r = R[key];
      ctx.hidden = false;
      ctxT.textContent = r.q1.title;
      ctxH.textContent = r.q1.hint || "";
      ctxH.hidden = !r.q1.hint;
      var c = key === "acil" ? "acil" : key;
      o1.innerHTML = r.q1.opts.map(function (v) { return optHTML("q1", r.q1.type, v, c); }).join("");
      if (r.q2) {
        o2.hidden = false;
        o2.innerHTML = '<p class="hint" style="width:100%;margin:4px 0 0;font:600 16px var(--f-sign);color:var(--ink)">' + esc(r.q2.title) + "</p>" +
          r.q2.opts.map(function (v) { return optHTML("q2", r.q2.type, v, c); }).join("");
      } else { o2.hidden = true; o2.innerHTML = ""; }
      flags.hidden = key === "acil";
      if (key === "acil") $$('input[name="flag"]', flagBox).forEach(function (i) { i.checked = false; });
      if (lastStep) lastStep.textContent = "4";
    }

    function setVerdict(kind, kTxt, tTxt, icon) {
      var cls = "verdict" + (kind ? " is-" + kind : "");
      var state = kind + "|" + tTxt;
      verdict.className = cls;
      vK.textContent = kTxt; vT.textContent = tTxt;
      vIco.innerHTML = icoHTML(icon);
      if (state !== lastState && !reduced()) { verdict.classList.remove("flip"); void verdict.offsetWidth; verdict.classList.add("flip"); }
      lastState = state;
    }

    function update() {
      var key = (form.querySelector('input[name="neden"]:checked') || {}).value;
      if (key !== current) { current = key; if (key) renderCtx(key); }
      if (!key) return;
      var r = R[key], s = openStatus(HOURS);
      var tur = (form.querySelector('input[name="tur"]:checked') || {}).value || "";
      var ad = val(form, "ad"), yas = val(form, "yas"), zaman = val(form, "zaman"), sahip = val(form, "sahip");
      var a1 = checkedVals(form, "q1"), a2 = checkedVals(form, "q2"), fl = checkedVals(form, "flag");
      var pet = (tur || "Türünü belirtmedim") + (ad ? ", adı " + ad : "") + (yas ? ", " + yas : "");
      var kind, lines = [], text, bring = r.bring;

      if (key === "acil" || fl.length) {
        kind = "call";
        setVerdict("call", "Yönlendirme · " + (key === "acil" ? "Acil durum" : "Acil belirti"), "Hemen arayın", "p-phone");
        text = "<strong>Bu durum beklememesi gereken bir durum olabilir.</strong> Mesaj yazmakla vakit kaybetmeyin; arayın ve durumu anlatın. Size söylenmeden ilaç vermeyin, kusturmaya çalışmayın.";
        if (!s.open) text += " <strong>Şu an çalışma saatleri dışındayız.</strong> Yine de arayın; ulaşamazsanız vakit kaybetmeden açık olan en yakın veteriner kliniğine başvurun.";
        bring = R.acil.bring;
        var what = key === "acil" ? a1 : fl;
        lines.push("Merhaba " + BRAND + ", acil bir durum için yazıyorum.");
        lines.push("Dostum: " + pet);
        lines.push("Durum: " + (what.length ? what.join(", ") : "belirtmedim"));
        if (key !== "acil" && a1.length) lines.push(r.q1.m + ": " + a1.join(", "));
        lines.push("Telefonla ulaşmaya çalışıyorum; lütfen dönüş yapın.");
        if (sahip) lines.push("Adım: " + sahip);
      } else if (tur === "Diğer") {
        kind = "ask";
        setVerdict("ask", "Yönlendirme · " + r.t, "Önce arayın", "p-phone");
        text = "Kedi ve köpek dışındaki türler için gelmeden önce telefonda bilgi alın; size nasıl yardımcı olabileceğimizi söyleyelim. İsterseniz aşağıdaki mesajla da sorabilirsiniz.";
        lines.push("Merhaba " + BRAND + ",");
        lines.push(r.t + " konusunda bilgi almak istiyorum. Dostum kedi ya da köpek değil.");
        lines.push("Türü ve yaşı: " + (ad ? ad + ", " : "") + (yas || "(yazınız)"));
        if (a1.length) lines.push(r.q1.m + ": " + a1.join(", "));
        if (sahip) lines.push("Adım: " + sahip);
      } else {
        kind = "book";
        setVerdict("book", "Yönlendirme · " + r.t, "Randevu alın", "p-cal");
        text = esc(r.text);
        if (key === "parazit" && a1.indexOf("Kene") > -1) text += " <strong>Keneyi çıplak elle koparmayın; kolonya ya da yağ sürmeyin.</strong>";
        if (!s.open) text += " <strong>Şu an kapalıyız;</strong> açılış " + esc(s.opensWhen + " " + s.opensAt) + ". Mesajınızı şimdi gönderebilirsiniz.";
        else if (zaman === "Bugün") text += " Bugün gelmek istiyorsanız arayarak uygun saati sorun.";
        lines.push("Merhaba " + BRAND + ",");
        lines.push(r.t + " için randevu almak istiyorum.");
        lines.push("Dostum: " + pet);
        if (a1.length) lines.push(r.q1.m + ": " + a1.join(", "));
        if (r.q2 && a2.length) lines.push(r.q2.m + ": " + a2.join(", "));
        lines.push("Uygun zaman: " + zaman);
        if (sahip) lines.push("Adım: " + sahip);
        lines.push("Uygun bir saat için dönüşünüzü rica ederim.");
      }

      vText.innerHTML = text;
      vBring.hidden = false;
      vList.innerHTML = bring.map(function (b) { return "<li>" + icoHTML("p-check") + "<span>" + esc(b) + "</span></li>"; }).join("");
      msgWrap.hidden = false;
      msg.value = lines.join("\n");

      btns.innerHTML = "";
      var wa;
      if (kind === "call") {
        btns.appendChild(makeBtn("btn--red", TEL, "p-phone", "Ara: " + PHONE));
        btns.appendChild(makeBtn("btn--ghost-light", "acil.html", "p-siren", "Acil durum rehberi"));
        wa = makeBtn("btn--ghost-light", waLink(msg.value), "p-chat", "Bilgi mesajı gönder", true);
        btns.appendChild(wa);
      } else {
        wa = makeBtn(kind === "ask" ? "btn--ghost-light" : "", waLink(msg.value), "p-chat", "WhatsApp'tan gönder", true);
        if (kind === "ask") btns.appendChild(makeBtn("btn--amber", TEL, "p-phone", "Ara: " + PHONE));
        btns.appendChild(wa);
        if (kind === "book") btns.appendChild(makeBtn("btn--ghost-light", TEL, "p-phone", "Ara"));
        btns.appendChild(makeCopyBtn(function () { return msg.value; }, copied));
        if (kind === "book") btns.appendChild(makeBtn("btn--ghost-light", "randevu.html?neden=" + key, "p-cal", "Gün ve saat seçerek talep"));
      }
      bindMsg(msg, wa);
    }

    form.addEventListener("change", update);
    form.addEventListener("input", function (e) { if (e.target !== msg) update(); });

    $$("[data-pick]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var key = a.getAttribute("data-pick");
        var inp = form.querySelector('input[name="neden"][value="' + key + '"]');
        if (!inp) return;
        e.preventDefault();
        inp.checked = true;
        update();
        var target = document.getElementById("yonlendirme");
        if (target) target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        setTimeout(function () { inp.focus({ preventScroll: true }); }, reduced() ? 0 : 450);
      });
    });
  }

  /* ================= Randevu talebi ================= */
  function initAppt() {
    var form = $("[data-appt]");
    if (!form) return;
    var root = form.closest("[data-tool]");
    var daysBox = $("[data-days]", root), slotsBox = $("[data-slots]", root), slotHint = $("[data-slot-hint]", root);
    var warn = $("[data-acil-warn]", root);
    var band = $("[data-t-band]", root), tIco = $("[data-t-ico]", root);
    var msg = $("[data-r-msg]", root), btns = $("[data-r-btns]", root), copied = $("[data-r-copied]", root);
    var SLOTS = [["Sabah", "09:30", "12:00"], ["Öğle", "12:00", "17:00"], ["Akşam", "17:00", "23:00"]];
    var now = istanbulNow();
    var days = [];
    for (var k = 0; k < 7; k++) {
      var di = (now.d + k) % 7, r = HOURS[String(di)][0], dt = istDate(k);
      var closed = k === 0 && now.m >= mins(r[1]) - 30;
      var name = k === 0 ? "Bugün" : k === 1 ? "Yarın" : DAYS[di];
      days.push({ k: k, di: di, r: r, dt: dt, name: name, label: (k < 2 ? name + ", " + DAYS[di] : DAYS[di]) + " " + fmtDate(dt), closed: closed });
    }
    daysBox.innerHTML = days.map(function (d) {
      return '<label class="pick" style="' + cvar("kontrol") + '"><input type="radio" name="gun" value="' + d.k + '"' + (d.closed ? " disabled" : "") + '><span class="pick-f"><span>' + esc(d.name) + "</span><small>" +
        esc(fmtDate(d.dt)) + "</small><small>" + (d.closed ? "bugün kapandı" : d.r[0] + "–" + d.r[1]) + "</small></span></label>";
    }).join("");

    function renderSlots() {
      var g = form.querySelector('input[name="gun"]:checked');
      if (!g) { slotsBox.innerHTML = ""; slotHint.hidden = false; return; }
      var d = days[+g.value], open = mins(d.r[0]), close = mins(d.r[1]);
      var prev = (form.querySelector('input[name="saat"]:checked') || {}).value;
      var html = [];
      SLOTS.forEach(function (sl) {
        var a = Math.max(mins(sl[1]), open), b = Math.min(mins(sl[2]), close);
        if (b - a < 60) return;
        var past = d.k === 0 && now.m >= b - 30;
        var v = sl[0] + " (" + hhmm(a) + "–" + hhmm(b) + ")";
        html.push('<label class="pick" style="' + cvar("kontrol") + '"><input type="radio" name="saat" value="' + esc(v) + '"' + (past ? " disabled" : "") + (prev === v && !past ? " checked" : "") + '><span class="pick-f">' + esc(v) + "</span></label>");
      });
      html.push('<label class="pick" style="' + cvar("kontrol") + '"><input type="radio" name="saat" value="Fark etmez"' + (prev === "Fark etmez" ? " checked" : "") + '><span class="pick-f">Fark etmez</span></label>');
      slotsBox.innerHTML = html.join("");
      slotHint.hidden = true;
    }

    function update(e) {
      if (e && e.target && e.target.name === "gun") renderSlots();
      var key = (form.querySelector('input[name="neden"]:checked') || {}).value;
      var tur = (form.querySelector('input[name="tur"]:checked') || {}).value || "";
      var g = form.querySelector('input[name="gun"]:checked');
      var sl = (form.querySelector('input[name="saat"]:checked') || {}).value || "";
      var ad = val(form, "ad"), yas = val(form, "yas"), sahip = val(form, "sahip"), donus = val(form, "donus"), not = val(form, "not");
      var d = g ? days[+g.value] : null;
      var pet = tur ? tur + (ad ? ", adı " + ad : "") + (yas ? ", " + yas : "") : (ad || yas ? [ad, yas].filter(Boolean).join(", ") : "");
      var isAcil = key === "acil";
      warn.classList.toggle("on", isAcil);

      band.setAttribute("style", key ? cvar(key) : "--c:#3B534B;--on:#fff");
      tIco.setAttribute("href", "#" + (key ? R[key].ico : "p-cal"));
      $("[data-t-dept]", root).textContent = key ? (isAcil ? "Acil: önce arayın" : R[key].t) : "Seçilmedi";
      $("[data-t-pet]", root).textContent = pet || "—";
      $("[data-t-day]", root).textContent = d ? d.label : "—";
      $("[data-t-slot]", root).textContent = sl || "—";
      $("[data-t-name]", root).textContent = sahip || "—";

      var lines = [];
      if (isAcil) {
        lines.push("Merhaba " + BRAND + ", acil bir durum için ulaşmaya çalışıyorum.");
        if (pet) lines.push("Dostum: " + pet);
        if (not) lines.push("Durum: " + not);
        lines.push("Lütfen dönüş yapın.");
      } else {
        lines.push("Merhaba " + BRAND + ",");
        lines.push("Randevu talebi oluşturmak istiyorum.");
        lines.push("Neden: " + (key ? R[key].t : "(seçmedim)"));
        lines.push("Dostum: " + (pet || "(belirtmedim)"));
        lines.push("Gün: " + (d ? d.label : "(seçmedim)"));
        lines.push("Saat aralığı: " + (sl || "(seçmedim)"));
        if (not) lines.push("Not: " + not);
        if (sahip) lines.push("Adım: " + sahip);
        lines.push("Dönüş tercihim: " + donus);
        lines.push("Uygunluk durumunu bildirirseniz sevinirim.");
      }
      msg.value = lines.join("\n");
      btns.innerHTML = "";
      var wa;
      if (isAcil) {
        btns.appendChild(makeBtn("btn--red", TEL, "p-phone", "Hemen ara: " + PHONE));
        wa = makeBtn("btn--ghost-light", waLink(msg.value), "p-chat", "Bilgi mesajı gönder", true);
        btns.appendChild(wa);
      } else {
        wa = makeBtn("btn--amber", waLink(msg.value), "p-chat", "WhatsApp'tan gönder", true);
        btns.appendChild(wa);
        btns.appendChild(makeBtn("btn--ghost-light", TEL, "p-phone", "Ara"));
        btns.appendChild(makeCopyBtn(function () { return msg.value; }, copied));
      }
      bindMsg(msg, wa);
    }
    form.addEventListener("change", update);
    form.addEventListener("input", function (e) { if (e.target.tagName !== "INPUT" || (e.target.type !== "radio" && e.target.type !== "checkbox")) update(e); });

    var q = (location.search.match(/[?&]neden=([a-z]+)/) || [])[1];
    if (q) { var inp = form.querySelector('input[name="neden"][value="' + q + '"]'); if (inp) inp.checked = true; }
    var first = form.querySelector('input[name="gun"]:not(:disabled)');
    if (first) { first.checked = true; renderSlots(); }
    update();
  }

  /* ================= Yavru aşı çizelgesi ================= */
  function initCalc() {
    var form = $("[data-calc]");
    if (!form) return;
    var root = form.closest("[data-tool]");
    var out = $("[data-calc-out]", root), btns = $("[data-calc-btns]", root), birth = $("[data-birth]", root);
    var today = istDate(0);
    var iso = today.toISOString().slice(0, 10);
    birth.max = iso;
    var minD = istDate(-365 * 3); birth.min = minD.toISOString().slice(0, 10);
    var PLAN = {
      kopek: [
        { a: { w: 6 }, b: { w: 8 }, t: "İlk karma aşı dönemi", d: "Parvovirüs, gençlik hastalığı (distemper), bulaşıcı hepatit gibi hastalıklara karşı ilk doz." },
        { a: { w: 9 }, b: { w: 12 }, t: "Tekrar dozları", d: "Önceki dozdan 2–4 hafta sonra; genellikle 16 haftalık olana dek sürer." },
        { a: { mo: 3 }, b: { mo: 3, w: 2 }, t: "Kuduz aşısı (3 aylıktan sonra)", d: "Yasal olarak zorunludur; kaydı karneye işlenir." },
        { a: { w: 16 }, b: { w: 17 }, t: "Yavru aşılarının çoğunlukla tamamlandığı dönem", d: "Eksik doz kalıp kalmadığını karneden kontrol edin." },
        { a: { mo: 12 }, b: { mo: 12, w: 2 }, t: "Bir yaşında: tekrar aşıları ve genel kontrol", d: "Hekimin belirlediği aralıklarla; kuduz aşısı genellikle her yıl tekrarlanır." }
      ],
      kedi: [
        { a: { w: 6 }, b: { w: 8 }, t: "İlk karma aşı dönemi", d: "Panlökopeni, kedi herpes virüsü ve calici virüsüne karşı ilk doz." },
        { a: { w: 9 }, b: { w: 12 }, t: "Tekrar dozları", d: "Önceki dozdan 2–4 hafta sonra; genellikle 16 haftalık olana dek sürer." },
        { a: { mo: 3 }, b: { mo: 3, w: 2 }, t: "Kuduz aşısı (3 aylıktan sonra)", d: "Yasal olarak zorunludur; kaydı karneye işlenir." },
        { a: { w: 16 }, b: { w: 17 }, t: "Yavru aşılarının çoğunlukla tamamlandığı dönem", d: "Lösemi (FeLV) aşısını yaşam koşuluna göre hekiminizle konuşun." },
        { a: { mo: 12 }, b: { mo: 12, w: 2 }, t: "Bir yaşında: tekrar aşıları ve genel kontrol", d: "Hekimin belirlediği aralıklarla; kuduz aşısı genellikle her yıl tekrarlanır." }
      ]
    };
    function add(base, o) {
      var d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + (o.mo || 0), base.getUTCDate()));
      return new Date(d.getTime() + (o.w || 0) * 7 * 864e5);
    }
    function range(a, b) {
      var sameY = a.getUTCFullYear() === b.getUTCFullYear();
      return fmtDate(a, !sameY) + " – " + fmtDate(b, true);
    }
    function update() {
      var tur = (form.querySelector('input[name="ctur"]:checked') || {}).value;
      btns.innerHTML = "";
      if (!tur || !birth.value) { out.innerHTML = '<p class="out-text">Tür ve doğum tarihi seçildiğinde dönemler burada listelenir.</p>'; return; }
      var p = birth.value.split("-"), b0 = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
      if (isNaN(b0.getTime())) return;
      if (b0 > today) { out.innerHTML = '<p class="out-text">Doğum tarihi bugünden sonra olamaz; tarihi kontrol edin.</p>'; return; }
      var soon = new Date(today.getTime() + 21 * 864e5), nextMarked = false;
      var items = PLAN[tur].map(function (m) {
        var a = add(b0, m.a), b = add(b0, m.b), cls, tag;
        if (b < today) { cls = "is-past"; tag = "Geçti"; }
        else if (a <= today) { cls = "is-soon"; tag = "Şu an"; nextMarked = true; }
        else if (a <= soon) { cls = "is-soon"; tag = "Yaklaşıyor"; nextMarked = true; }
        else if (!nextMarked) { cls = "is-next"; tag = "Sıradaki"; nextMarked = true; }
        else { cls = ""; tag = "İleride"; }
        return '<li class="' + cls + '"><b>' + esc(m.t) + "</b><em>" + tag + "</em><span>" + esc(range(a, b)) + " · " + esc(m.d) + "</span></li>";
      });
      var ageW = Math.floor((today - b0) / (7 * 864e5));
      var head = '<p class="out-text" style="margin-bottom:10px">Yavrunuz yaklaşık <strong>' + (ageW < 1 ? "1 haftalıktan küçük" : ageW + " haftalık") + "</strong>.";
      if (ageW > 20) head += " Yavru dönem aşıları geride kalmış olabilir; karnesine bakarak eksikleri hekiminiz planlar.";
      head += "</p>";
      out.innerHTML = head + "<ol>" + items.join("") + "</ol>";
      var turTxt = tur === "kedi" ? "kedi" : "köpek";
      var m = "Merhaba " + BRAND + ", " + turTxt + " yavrum için aşı takvimi hakkında bilgi ve randevu almak istiyorum. Doğum tarihi: " + fmtDate(b0, true) + " (yaklaşık " + ageW + " haftalık).";
      btns.appendChild(makeBtn("btn--white", waLink(m), "p-chat", "Aşı randevusu için yaz", true));
      btns.appendChild(makeBtn("btn--ghost-light", TEL, "p-phone", "Ara"));
    }
    form.addEventListener("change", update);
    form.addEventListener("input", update);
  }

  /* ================= Acil: arama hazırlık kartı ================= */
  function initCallCard() {
    var form = $("[data-callcard]");
    if (!form) return;
    var root = form.closest("[data-tool]");
    var msg = $("[data-cc-msg]", root), btns = $("[data-cc-btns]", root), copied = $("[data-cc-copied]", root);
    function update() {
      var tur = (form.querySelector('input[name="tur"]:checked') || {}).value || "";
      var ne = (form.querySelector('input[name="ne"]:checked') || {}).value || "";
      var zaman = (form.querySelector('input[name="zaman"]:checked') || {}).value || "";
      var durum = checkedVals(form, "durum");
      var yas = val(form, "yas"), kilo = val(form, "kilo"), madde = val(form, "madde");
      var L = [];
      L.push("Acil durum özeti (" + BRAND + ")");
      L.push("Dostum: " + ([tur, yas, kilo ? "yaklaşık " + kilo : ""].filter(Boolean).join(", ") || "(türünü, yaşını, kilosunu söyleyin)"));
      L.push("Ne oldu: " + (ne || "(seçin)") + (madde ? " (yediği/maruz kaldığı: " + madde + ")" : ""));
      L.push("Ne zaman: " + (zaman || "(seçin)"));
      L.push("Şu anki durumu: " + (durum.length ? durum.join(", ") : "(seçin)"));
      msg.value = L.join("\n");
      btns.innerHTML = "";
      btns.appendChild(makeBtn("btn--red", TEL, "p-phone", "Şimdi ara: " + PHONE));
      var wa = makeBtn("btn--ghost-light", waLink(msg.value), "p-chat", "Özeti WhatsApp'tan gönder", true);
      btns.appendChild(wa);
      btns.appendChild(makeCopyBtn(function () { return msg.value; }, copied));
      bindMsg(msg, wa);
    }
    form.addEventListener("change", update);
    form.addEventListener("input", update);
    update();
  }

  /* ================= SSS: arama süzgeci ================= */
  function fold(s) {
    return String(s).toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, function (c) { return { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" }[c]; });
  }
  function initFaq() {
    var q = $("[data-faq-q]");
    if (!q) return;
    var count = $("[data-faq-count]"), empty = $("[data-faq-empty]");
    var groups = $$("[data-faq-group]");
    var items = $$("[data-faq-group] details").map(function (d) { return { el: d, words: fold(d.textContent).split(/[^a-z0-9]+/).filter(Boolean) }; });
    function run() {
      var terms = fold(q.value).split(/[^a-z0-9]+/).filter(Boolean), n = 0;
      items.forEach(function (it) {
        var ok = terms.every(function (t) { return it.words.some(function (w) { return w.indexOf(t) === 0; }); });
        it.el.hidden = !ok;
        if (ok) n++;
      });
      if (terms.length) items.forEach(function (it) { if (!it.el.hidden) it.el.open = n <= 3; });
      groups.forEach(function (g) { g.hidden = !$$("details", g).some(function (d) { return !d.hidden; }); });
      count.textContent = terms.length ? (n ? n + " soru bulundu." : "Eşleşen soru yok.") : "";
      empty.classList.toggle("on", terms.length > 0 && n === 0);
    }
    q.addEventListener("input", run);
  }

  /* ================= SSS: soru yazma ================= */
  function initAsk() {
    var form = $("[data-ask]");
    if (!form) return;
    var root = form.closest("[data-tool]");
    var msg = $("[data-ask-msg]", root), btns = $("[data-ask-btns]", root), copied = $("[data-ask-copied]", root);
    function update() {
      var konu = (form.querySelector('input[name="konu"]:checked') || {}).value || "";
      var tur = val(form, "tur"), sahip = val(form, "sahip"), soru = val(form, "soru");
      var L = ["Merhaba " + BRAND + ", bir sorum var."];
      if (konu) L.push("Konu: " + konu);
      if (tur) L.push("Dostum: " + tur);
      L.push("Sorum: " + (soru || "(sorunuzu yazın)"));
      if (sahip) L.push("Adım: " + sahip);
      msg.value = L.join("\n");
      btns.innerHTML = "";
      var wa = makeBtn("", waLink(msg.value), "p-chat", "WhatsApp'tan gönder", true);
      btns.appendChild(wa);
      btns.appendChild(makeCopyBtn(function () { return msg.value; }, copied));
      bindMsg(msg, wa);
    }
    form.addEventListener("change", update);
    form.addEventListener("input", update);
    update();
  }

  /* ================= İletişim: saat planlayıcı ================= */
  function initPlanner() {
    var form = $("[data-planner]");
    if (!form) return;
    var root = form.closest("[data-tool]");
    var out = $("[data-planner-out]", root), nowBtn = $("[data-planner-now]", root);
    function run() {
      var d = parseInt(form.elements.gun.value, 10), t = form.elements.saat.value;
      out.classList.remove("is-open", "is-closed");
      if (!t) { out.textContent = "Bir saat seçin."; return; }
      var m = mins(t), r = HOURS[String(d)][0], a = mins(r[0]), e = mins(r[1]);
      var html;
      if (m >= a && m < e) {
        out.classList.add("is-open");
        html = esc(DAYS[d] + " " + t) + ": açığız.<small>O gün " + r[0] + "–" + r[1] + " arası açığız." + (e - m <= 60 ? " Kapanışa " + dur(e - m) + " kalıyor; gelmeden önce arayın." : "") + "</small>";
      } else {
        out.classList.add("is-closed");
        var nx = HOURS[String((d + 1) % 7)][0][0];
        html = esc(DAYS[d] + " " + t) + ": kapalıyız.<small>" + (m < a ? "O gün " + loc(r[0]) + " açılıyoruz." : "O gün " + loc(r[1]) + " kapanıyoruz; " + DAYS[(d + 1) % 7].toLocaleLowerCase("tr") + " günü " + loc(nx) + " açılıyoruz.") + " Acil bir durumda yine de arayın.</small>";
      }
      out.innerHTML = "<span>" + html + "</span>";
    }
    function toNow() {
      var n = istanbulNow();
      form.elements.gun.value = String(n.d);
      form.elements.saat.value = hhmm(n.m);
      run();
    }
    form.addEventListener("change", run);
    form.addEventListener("input", run);
    if (nowBtn) nowBtn.addEventListener("click", toNow);
    toNow();
  }

  function init() {
    renderStatus();
    setInterval(renderStatus, 30000);
    initMenu();
    initKiosk();
    initAppt();
    initCalc();
    initCallCard();
    initFaq();
    initAsk();
    initPlanner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
