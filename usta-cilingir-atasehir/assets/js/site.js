/* Usta Çilingir — site.js (bağımlılık yok) */
(function () {
  "use strict";

  var BRAND = "Usta Çilingir";
  var WA_BASE = "https://wa.me/905545835021";
  var TEL_HREF = "tel:+905545835021";
  var HOURS = { "0": [["00:00", "24:00"]], "1": [["00:00", "24:00"]], "2": [["00:00", "24:00"]], "3": [["00:00", "24:00"]], "4": [["00:00", "24:00"]], "5": [["00:00", "24:00"]], "6": [["00:00", "24:00"]] };

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function waLink(msg) { return WA_BASE + "?text=" + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Açık/kapalı durumu (kit/status.js kopyası) ---------- */
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

  /* ---------- Canlı rozet, saat, 24 saat kadranı ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function paintLive() {
    var s = openStatus(HOURS);
    $all("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $all("[data-open-word]").forEach(function (el) { el.textContent = !s.known ? "Arayın" : s.open ? "Açık" : "Kapalı"; });
    var hhmm = pad(Math.floor(s.minutes / 60)) + ":" + pad(s.minutes % 60);
    $all("[data-clock]").forEach(function (el) { el.textContent = hhmm; if (el.tagName === "TIME") el.setAttribute("datetime", hhmm); });
    $all("[data-dial-hand]").forEach(function (el) { el.style.transform = "rotate(" + (s.minutes / 1440 * 360).toFixed(1) + "deg)"; });
    $all("[data-dial-sub]").forEach(function (el) { el.textContent = s.open ? "İstanbul saati, hat açık" : "İstanbul saati"; });
    $all("[data-day]").forEach(function (tr) { tr.classList.toggle("is-today", String(s.dayIndex) === tr.getAttribute("data-day")); });
  }
  paintLive();
  setInterval(paintLive, 15000);

  /* ---------- Üç kapı: görünce bir kez aralanır ---------- */
  var doors = $all(".door");
  if (doors.length && "IntersectionObserver" in window && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (!it.isIntersecting) return;
        var i = doors.indexOf(it.target);
        setTimeout(function () { it.target.classList.add("is-swing"); }, 140 * i);
        io.unobserve(it.target);
      });
    }, { threshold: 0.45 });
    doors.forEach(function (d) { io.observe(d); });
  }

  /* ---------- Panoya kopyalama ---------- */
  function copyText(text, btn) {
    var label = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", label);
    function done(ok) {
      btn.lastChild.textContent = ok ? "Kopyalandı" : "Kopyalanamadı, metni seçip kopyalayın";
      setTimeout(function () { btn.lastChild.textContent = label; }, 2200);
    }
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    } else { legacy(); }
  }

  /* ---------- İMZA ARAÇ: durumunu seç → hazır WhatsApp mesajı ---------- */
  var DURUM = [
    { v: "kapida", t: "Kapıda kaldım", m: "Kapıda kaldım; anahtarım içeride." },
    { v: "kirildi", t: "Anahtar kilitte kırıldı", m: "Anahtarım kilidin içinde kırıldı." },
    { v: "kayip", t: "Anahtarım kayıp", m: "Anahtarımı kaybettim, kapıyı açamıyorum." },
    { v: "donmuyor", t: "Kilit dönmüyor", m: "Anahtar dönmüyor ya da dönse de kapı açılmıyor." },
    { v: "kilit", t: "Kilit, barel değişimi", m: "Kapımın kilidini (barelini) değiştirmek istiyorum." },
    { v: "guclendirme", t: "Tamir, güçlendirme", m: "Kapım için tamir ve güçlendirme hakkında bilgi almak istiyorum." },
    { v: "diger", t: "Çelik kasa ya da başka bir iş", m: "Çelik kasa, kaynak ya da başka bir iş için bilgi almak istiyorum.", wide: true }
  ];
  var KAPI = [
    { v: "celik", t: "Çelik kapı", m: "Kapı türü: çelik kapı." },
    { v: "ahsap", t: "Ahşap kapı", m: "Kapı türü: ahşap kapı." },
    { v: "isyeri", t: "İş yeri kapısı", m: "Kapı türü: iş yeri kapısı." },
    { v: "bilmiyorum", t: "Emin değilim", m: "Kapı türünden emin değilim." }
  ];
  var ACIL = [
    { v: "simdi", t: "Şu an kapıdayım", m: "Şu an kapının önündeyim, durum acil." },
    { v: "bugun", t: "Bugün içinde", m: "Bugün içinde gelmeniz mümkün mü?" },
    { v: "randevu", t: "Gün ve saat konuşalım", m: "Uygun bir gün ve saat için görüşmek istiyorum." }
  ];
  var PRESET = { kapida: ["kapida", "simdi"], kilit: ["kilit", "randevu"], guclendirme: ["guclendirme", "randevu"] };

  function optHtml(list, name, sel, row) {
    return list.map(function (o) {
      return '<label class="opt' + (o.wide ? " opt--wide" : "") + '"><input type="radio" name="' + name + '" value="' + o.v + '"' + (o.v === sel ? " checked" : "") + '><span class="opt-body">' + esc(o.t) + "</span></label>";
    }).join("");
  }
  function find(list, v) { for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i]; return null; }

  $all("[data-tool='durum']").forEach(function (root, idx) {
    var mount = root.querySelector(".tool-mount");
    if (!mount) return;
    var pre = PRESET[root.getAttribute("data-preset")] || PRESET.kapida;
    var uid = "t" + idx;
    mount.innerHTML =
      '<form class="tool-grid" novalidate>' +
      '<div class="tool-form">' +
      '<fieldset class="q"><legend>Ne oldu?</legend><div class="opts">' + optHtml(DURUM, uid + "-durum", pre[0]) + "</div></fieldset>" +
      '<fieldset class="q"><legend>Kapınız hangi tür?</legend><div class="opts opts--row">' + optHtml(KAPI, uid + "-kapi", "") + "</div></fieldset>" +
      '<fieldset class="q"><legend>Ne kadar acil?</legend><div class="opts opts--row">' + optHtml(ACIL, uid + "-acil", pre[1]) + "</div></fieldset>" +
      '<label class="check"><input type="checkbox" data-risk><span>İçeride yalnız çocuk, yaşlı, hasta ya da açık ocak var</span></label>' +
      '<p class="risk-note" data-risk-note role="status">Hayati tehlike varsa (yangın, gaz kokusu, bilinci kapalı biri) önce 112\'yi arayın.</p>' +
      '<label class="field"><span>Neredesiniz?</span><small>İsteğe bağlı. Mahalle, sokak, bina adı ve kat yazabilirsiniz.</small><input type="text" data-yer maxlength="140" autocomplete="off" placeholder="Örn. Kayışdağı, … Sokak, … Apt. kat 3"></label>' +
      '<div class="geo"><button type="button" class="btn btn--line" data-geo><svg class="ic" aria-hidden="true"><use href="#i-locate"/></svg><span>Konumumu mesaja ekle</span></button><span class="geo-note" data-geo-note role="status"></span></div>' +
      "</div>" +
      '<div class="tool-out">' +
      '<p class="out-label"><svg class="ic" aria-hidden="true"><use href="#i-chat"/></svg>Mesajınız hazır</p>' +
      '<p class="bubble" data-msg aria-live="polite"></p>' +
      '<p class="bubble-foot">' + esc(BRAND) + " WhatsApp hattına gidecek</p>" +
      '<div class="out-acts">' +
      '<a class="btn btn--y" data-send target="_blank" rel="noopener" href="' + WA_BASE + '"><svg class="ic" aria-hidden="true"><use href="#i-chat"/></svg><span>WhatsApp\'ta aç ve gönder</span></a>' +
      '<button type="button" class="btn btn--line" data-copy><svg class="ic" aria-hidden="true"><use href="#i-copy"/></svg><span>Mesajı kopyala</span></button>' +
      '<a class="btn btn--line" href="' + TEL_HREF + '"><svg class="ic" aria-hidden="true"><use href="#i-phone"/></svg><span>Yazmak yerine ara</span></a>' +
      "</div>" +
      '<div class="tip"><svg class="ic" aria-hidden="true"><use href="#i-pin"/></svg><p><b>Konum ipucu:</b> Mesajı gönderdikten sonra WhatsApp\'ta yazı alanının yanındaki ataş ya da + simgesine dokunun, “Konum”u seçin ve mevcut konumunuzu gönderin. Sokak tarif etmekten hızlıdır.</p></div>' +
      "</div></form>";

    var form = mount.querySelector("form");
    var msgEl = mount.querySelector("[data-msg]");
    var send = mount.querySelector("[data-send]");
    var yer = mount.querySelector("[data-yer]");
    var risk = mount.querySelector("[data-risk]");
    var riskNote = mount.querySelector("[data-risk-note]");
    var geoBtn = mount.querySelector("[data-geo]");
    var geoNote = mount.querySelector("[data-geo-note]");
    var geoUrl = "";

    function val(name) { var el = form.querySelector('input[name="' + uid + "-" + name + '"]:checked'); return el ? el.value : ""; }
    function build() {
      var d = find(DURUM, val("durum")), k = find(KAPI, val("kapi")), a = find(ACIL, val("acil"));
      var L = ["Merhaba " + BRAND + ","];
      L.push(d ? d.m : "Yardıma ihtiyacım var.");
      if (k) L.push(k.m);
      if (a) L.push(a.m);
      if (risk.checked) L.push("Önemli: içeride yalnız kalan biri ya da açık ocak var.");
      var y = yer.value.replace(/\s+/g, " ").trim();
      if (y) L.push("Bulunduğum yer: " + y);
      if (geoUrl) L.push("Konumum: " + geoUrl);
      else if (!a || a.v !== "randevu") L.push("Konumumu bu mesajın ardından paylaşacağım.");
      L.push("Süre ve ücret hakkında bilgi verebilir misiniz?");
      var msg = L.join("\n");
      msgEl.textContent = msg;
      send.href = waLink(msg);
      riskNote.classList.toggle("is-on", risk.checked);
      return msg;
    }
    form.addEventListener("change", build);
    form.addEventListener("input", build);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    mount.querySelector("[data-copy]").addEventListener("click", function () { copyText(build(), this); });
    geoBtn.addEventListener("click", function () {
      var fail = "Konum alınamadı. Mesajı gönderdikten sonra WhatsApp içinden konum paylaşabilirsiniz.";
      if (geoUrl) { geoUrl = ""; geoBtn.lastChild.textContent = "Konumumu mesaja ekle"; geoNote.textContent = "Konum mesajdan çıkarıldı."; build(); return; }
      if (!navigator.geolocation) { geoNote.textContent = fail; return; }
      geoNote.textContent = "Konum isteniyor, telefonunuz izin sorabilir.";
      navigator.geolocation.getCurrentPosition(function (pos) {
        geoUrl = "https://maps.google.com/?q=" + pos.coords.latitude.toFixed(5) + "," + pos.coords.longitude.toFixed(5);
        geoBtn.lastChild.textContent = "Konumu mesajdan çıkar";
        geoNote.textContent = "Konum bağlantısı mesaja eklendi.";
        build();
      }, function () { geoNote.textContent = fail; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    });
    build();
  });

  /* ---------- Kilit kontrol listesi → WhatsApp mesajı ---------- */
  $all("[data-tool='liste']").forEach(function (root) {
    var boxes = $all("input[type=checkbox]", root);
    var out = root.querySelector("[data-cl-out]");
    if (!out || !boxes.length) return;
    out.innerHTML =
      '<p data-cl-verdict role="status"></p>' +
      '<p class="bubble" data-cl-msg></p>' +
      '<div class="cl-acts"><a class="btn btn--y" data-cl-send target="_blank" rel="noopener" href="' + WA_BASE + '"><svg class="ic" aria-hidden="true"><use href="#i-chat"/></svg><span>Listeyi WhatsApp\'tan gönder</span></a>' +
      '<button type="button" class="btn btn--line" data-cl-copy><svg class="ic" aria-hidden="true"><use href="#i-copy"/></svg><span>Kopyala</span></button></div>';
    var verdict = out.querySelector("[data-cl-verdict]"), msgEl = out.querySelector("[data-cl-msg]"), send = out.querySelector("[data-cl-send]");
    function build() {
      var picked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      var n = picked.length;
      verdict.textContent = n === 0 ? "Henüz bir şey işaretlemediniz. Size uyan maddelere dokunun."
        : n === 1 ? "1 madde işaretli. Tek bir işaret bile bareli konuşmaya değer."
        : n + " madde işaretli. Kilidinizi bir ustaya göstermenin zamanı gelmiş.";
      var L = ["Merhaba " + BRAND + ",", "Kilit değişimi hakkında bilgi almak istiyorum."];
      if (n) { L.push("Durumum:"); picked.forEach(function (p) { L.push("- " + p); }); }
      L.push("Uygun seçenekleri ve ücreti öğrenebilir miyim?");
      var msg = L.join("\n");
      msgEl.textContent = msg; send.href = waLink(msg);
      return msg;
    }
    root.addEventListener("change", build);
    out.querySelector("[data-cl-copy]").addEventListener("click", function () { copyText(build(), this); });
    build();
  });

  /* ---------- Kapı anatomisi ---------- */
  $all("[data-anat]").forEach(function (root) {
    var items = $all(".parts li", root), triggers = $all("[data-part]", root);
    function show(id) {
      items.forEach(function (li) { li.classList.toggle("is-on", li.id === id); });
      triggers.forEach(function (b) { var on = b.getAttribute("data-part") === id; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    }
    triggers.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-part")); }); });
    if (items.length) show(items[0].id);
  });

  /* ---------- Sorular: arama ---------- */
  $all("[data-faq-search]").forEach(function (input) {
    var all = $all(".faq details"), groups = $all(".faq-group"), count = document.querySelector("[data-faq-count]"), empty = document.querySelector("[data-faq-empty]");
    function norm(s) { return s.toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü ]/g, " "); }
    function run() {
      var words = norm(input.value).split(/\s+/).filter(function (w) { return w.length > 1; }), shown = 0;
      all.forEach(function (d) {
        var t = norm(d.textContent), ok = words.every(function (w) { return t.indexOf(w) > -1; });
        d.hidden = !ok; if (ok) shown++;
      });
      groups.forEach(function (g) { g.hidden = !$all("details", g).some(function (d) { return !d.hidden; }); });
      if (count) count.textContent = words.length ? shown + " soru bulundu" : "";
      if (empty) empty.classList.toggle("is-on", shown === 0);
    }
    input.addEventListener("input", run);
  });
})();
