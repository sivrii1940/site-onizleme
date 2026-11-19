/* Terzi Rahmi-Erkan 1982 · site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var BRAND = "Terzi Rahmi-Erkan 1982";
  var WA = "https://wa.me/905321775783";
  var HOURS = { "0": [["09:00", "20:00"]], "1": [["09:00", "20:00"]], "2": [["09:00", "20:00"]], "3": [["09:00", "20:00"]], "4": [["09:00", "20:00"]], "5": [["09:00", "20:03"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    try { return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : ""; } catch (e) { return ""; }
  }

  /* ---- açık/kapalı durumu (kit/status.js'ten kopya) ---- */
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

  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-hours] tr").forEach(function (tr) { tr.classList.toggle("is-today", tr.getAttribute("data-day") === String(s.dayIndex)); });
  }

  /* ---- menü ---- */
  function initNav() {
    var b = $(".menu-btn"), nav = $("#nav");
    if (!b || !nav) return;
    b.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- panoya kopyala ---- */
  function copyText(text, out) {
    function done(ok) { if (out) { out.textContent = ok ? "Mesaj kopyalandı." : "Kopyalanamadı; metni elle seçebilirsiniz."; } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try {
        var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select(); var ok = document.execCommand("copy"); document.body.removeChild(t); done(ok);
      } catch (e) { done(false); }
    }
  }

  /* ---- imza an: etiketin dikilmesi ve çevrilmesi ---- */
  function initLabel() {
    var tag = $("[data-flip]"); if (!tag) return;
    var reveal = $(".woven__reveal", tag), needle = $(".woven__needle", tag), tail = $(".woven__tail", tag);
    var btn = $(".flip-btn"), raf = 0;

    function sew(duration) {
      if (!reveal || !needle || !reveal.getTotalLength) return;
      var L = reveal.getTotalLength();
      cancelAnimationFrame(raf);
      if (reduce) { reveal.style.strokeDasharray = "none"; needle.style.opacity = "0"; if (tail) tail.style.opacity = "1"; return; }
      reveal.style.strokeDasharray = L + " " + L;
      reveal.style.strokeDashoffset = L;
      needle.style.opacity = "1"; if (tail) tail.style.opacity = "0";
      var t0 = 0;
      function frame(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / duration);
        var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var len = L * e, p = reveal.getPointAtLength(len);
        var bob = Math.abs(Math.sin(len / 23 * Math.PI)) * 9;
        reveal.style.strokeDashoffset = L - len;
        needle.setAttribute("transform", "translate(" + p.x.toFixed(1) + "," + (p.y - bob).toFixed(1) + ")");
        if (k < 1) { raf = requestAnimationFrame(frame); }
        else { needle.style.opacity = "0"; if (tail) tail.style.opacity = "1"; }
      }
      raf = requestAnimationFrame(frame);
    }

    function flip() {
      var on = tag.classList.toggle("is-flipped");
      if (btn) {
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        $("span", btn).textContent = on ? "Ön yüze dönün" : "Etiketin arkasını çevirin";
      }
      $(".tag3d__face--front", tag).setAttribute("aria-hidden", on ? "true" : "false");
      $(".tag3d__face--back", tag).setAttribute("aria-hidden", on ? "false" : "true");
      if (!on) setTimeout(function () { sew(1300); }, 380);
    }
    tag.addEventListener("click", flip);
    if (btn) btn.addEventListener("click", flip);
    sew(1700);
  }

  /* ---- bakım etiketi çözücü ---- */
  function initCare() {
    var root = $('[data-tool="bakim"]'); if (!root) return;
    var title = $("[data-care-title]", root), text = $("[data-care-text]", root);
    var btns = $$(".care__grid button", root);
    function pick(b) {
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      title.textContent = b.getAttribute("aria-label");
      text.textContent = $(".care__d", b.parentNode).textContent;
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { pick(b); }); });
    if (btns.length) pick(btns[0]);
  }

  /* ---- sipariş defteri: süz, ara, seç ---- */
  function initLedger() {
    var root = $('[data-tool="defter"]'); if (!root) return;
    var rows = $$(".row", root), groups = $$(".ledger__group", root), chips = $$("[data-filter]", root);
    var q = $("[data-ledger-search]", root), empty = $(".ledger__empty", root);
    var slip = $(".slip", root), count = $("[data-slip-count]", root), link = $("[data-slip-link]", root), clear = $(".slip__clear", root);
    var active = "hepsi";
    function norm(s) { return s.toLocaleLowerCase("tr").replace(/\s+/g, " ").trim(); }
    function apply() {
      var term = norm(q.value || ""), shown = 0;
      groups.forEach(function (g) {
        var okGroup = active === "hepsi" || g.getAttribute("data-group") === active, n = 0;
        $$(".row", g).forEach(function (r) {
          var ok = okGroup && (!term || norm(r.textContent).indexOf(term) > -1);
          r.hidden = !ok; if (ok) n++;
        });
        g.hidden = n === 0; shown += n;
      });
      empty.hidden = shown > 0;
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        active = c.getAttribute("data-filter");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        apply();
      });
    });
    q.addEventListener("input", apply);
    function picked() { return rows.filter(function (r) { return $("input", r).checked; }).map(function (r) { return $("input", r).value; }); }
    function paint() {
      var p = picked();
      rows.forEach(function (r) { r.classList.toggle("is-picked", $("input", r).checked); });
      slip.hidden = p.length === 0;
      count.textContent = p.length + " kalem deftere yazıldı";
      link.setAttribute("href", "randevu.html" + (p.length ? "?kalem=" + encodeURIComponent(p.join("|")) : ""));
    }
    rows.forEach(function (r) { $("input", r).addEventListener("change", paint); });
    clear.addEventListener("click", function () { rows.forEach(function (r) { $("input", r).checked = false; }); paint(); });
    apply(); paint();
  }

  /* ---- paça kırımı ---- */
  function initHem() {
    var root = $('[data-tool="paca"]'); if (!root) return;
    var T = [
      ["Kırımsız", "Paça ayakkabıya değmeden biter; kumaş dümdüz iner. Dar ve kısa kesim pantolonlarda, yazlık kumaşlarda tercih edilir. Yürürken çorabın göründüğünü hesaba katın."],
      ["Hafif kırım", "Paça ayakkabının üstüne ancak dokunur, önde belli belirsiz bir dalga olur. Günlük kullanım ve dar paçalı takımlar için dengeli bir seçimdir."],
      ["Yarım kırım", "Önde tek ve net bir kırım oluşur, arkada paça topuğun başladığı yere iner. Klasik takım elbise boyudur; çoğu ayakkabıyla uyumludur."],
      ["Tam kırım", "Kumaş ayakkabının üstünde belirgin biçimde katlanır, arkada topuğa yaklaşır. Geniş paçalı, ağır kumaşlı klasik pantolonlarda durur; dar paçada fazlalık gibi görünür."]
    ];
    var arts = $$("[data-hem]", root), title = $("[data-hem-title]", root), text = $("[data-hem-text]", root), link = $("[data-hem-link]", root);
    function set(i) {
      arts.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("data-hem") === String(i)); });
      title.textContent = T[i][0]; text.textContent = T[i][1];
      link.setAttribute("href", "randevu.html?not=" + encodeURIComponent("Paça tercihi: " + T[i][0].toLocaleLowerCase("tr")));
    }
    $$("input[name=hem]", root).forEach(function (r) { r.addEventListener("change", function () { set(parseInt(r.value, 10)); }); });
    set(2);
  }

  /* ---- ölçü kartı ---- */
  function initOlcu() {
    var root = $('[data-tool="olcu"]'); if (!root) return;
    var rows = $$(".olcu__row", root), lines = $$("[data-m]", root), title = $("[data-olcu-title]", root), text = $("[data-olcu-text]", root);
    var msg = $("[data-olcu-msg]", root), send = $("[data-olcu-send]", root), copy = $("[data-olcu-copy]", root), copied = $("[data-olcu-copied]", root);
    function select(row) {
      var key = row.getAttribute("data-key");
      rows.forEach(function (r) { $("button", r).setAttribute("aria-pressed", r === row ? "true" : "false"); });
      lines.forEach(function (l) { l.classList.toggle("is-on", l.getAttribute("data-m") === key); });
      title.textContent = $("button", row).textContent; text.textContent = row.getAttribute("data-how");
    }
    function build() {
      var parts = [];
      rows.forEach(function (r) {
        var v = ($("input", r).value || "").replace(",", ".").trim(), n = parseFloat(v);
        if (v && !isNaN(n) && n > 0 && n < 300) parts.push($("button", r).textContent.trim() + ": " + String(n).replace(".", ",") + " cm");
      });
      var m = "Merhaba, " + BRAND + " için yazıyorum. Kişiye özel dikim düşünüyorum.\n";
      m += parts.length ? "Evde aldığım ön ölçüler:\n- " + parts.join("\n- ") + "\n" : "Henüz ölçü almadım.\n";
      m += "Kesin ölçü ve model görüşmesi için ne zaman uğrayabilirim?";
      msg.textContent = m; send.setAttribute("href", waLink(m));
      return m;
    }
    rows.forEach(function (r) {
      $("button", r).addEventListener("click", function () { select(r); });
      $("input", r).addEventListener("focus", function () { select(r); });
      $("input", r).addEventListener("input", build);
    });
    copy.addEventListener("click", function () { copyText(build(), copied); });
    select(rows[2] || rows[0]); build();
  }

  /* ---- prova randevusu oluşturucu ---- */
  function initBook() {
    var form = $('[data-tool="randevu"]'); if (!form) return;
    var dayBox = $("[data-days]", form), slotBox = $("[data-slots]", form), msg = $("[data-book-msg]"), send = $("[data-book-send]");
    var copy = $("[data-book-copy]"), copied = $("[data-book-copied]"), fromBox = $("[data-from-ledger]", form);
    function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
    function hhmm(m) { return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2); }

    /* İstanbul'a göre bugünden başlayarak açık günler */
    var now = istanbulNow(), base;
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      base = Date.UTC(parseInt(o.year, 10), parseInt(o.month, 10) - 1, parseInt(o.day, 10));
    } catch (e) { var d0 = new Date(); base = Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate()); }

    function slotsFor(dow, isToday) {
      var r = (HOURS[String(dow)] || [])[0], out = []; if (!r) return out;
      var s = mins(r[0]), e = mins(r[1]);
      for (var a = s; a < e; a += 120) {
        var b = Math.min(a + 120, e);
        if (e - a < 45) break;
        if (isToday && b - now.m < 40) continue;
        out.push(hhmm(a) + "–" + hhmm(b));
      }
      return out;
    }
    var days = [];
    for (var k = 0; k < 24 && days.length < 10; k++) {
      var dt = new Date(base + k * 864e5), dow = (dt.getUTCDay() + 6) % 7, sl = slotsFor(dow, k === 0);
      if (!sl.length) continue;
      days.push({ k: k, dow: dow, date: dt.getUTCDate(), mon: dt.getUTCMonth(), slots: sl,
        short: k === 0 ? "Bugün" : k === 1 ? "Yarın" : DAYS_SHORT[dow],
        long: dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()] + " " + DAYS[dow] });
    }
    dayBox.innerHTML = days.map(function (d, i) {
      return '<label class="opt opt--day"><input type="radio" name="gun" value="' + i + '"><span><small>' + d.short + "</small><b>" + d.date + "</b><small>" + MONTHS_SHORT[d.mon] + "</small></span></label>";
    }).join("");
    function paintSlots() {
      var c = $("input[name=gun]:checked", form);
      if (!c) { slotBox.innerHTML = '<p class="note">Önce bir gün seçin; o günün açık saatleri burada görünür.</p>'; return; }
      var d = days[parseInt(c.value, 10)];
      slotBox.innerHTML = '<div class="opts">' + d.slots.map(function (s) {
        return '<label class="opt"><input type="radio" name="saat" value="' + s + '"><span>' + s + "</span></label>";
      }).join("") + '<label class="opt"><input type="radio" name="saat" value="" checked><span>Fark etmez</span></label></div>';
    }

    /* defterden ve paça aracından gelenler */
    var carried = param("kalem").split("|").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 30);
    if (carried.length) {
      fromBox.hidden = false;
      $(".opts", fromBox).innerHTML = carried.map(function (c) {
        var safe = c.replace(/[<>&"]/g, "");
        return '<label class="opt"><input type="checkbox" name="kalem" value="' + safe + '" checked><span>' + safe + "</span></label>";
      }).join("");
      var t = $("input[name=konu][value=Tadilat]", form); if (t) t.checked = true;
    }
    var note = param("not"); if (note) $("[name=not]", form).value = note.slice(0, 300);

    function vals(name) { return $$("input[name=" + name + "]:checked", form).map(function (i) { return i.value; }); }
    function build() {
      var konu = vals("konu")[0], parca = vals("parca"), is = vals("kalem").concat(vals("is"));
      var adet = parseInt($("[name=adet]", form).value, 10), gun = $("input[name=gun]:checked", form), saat = vals("saat")[0];
      var ad = $("[name=ad]", form).value.trim(), n = $("[name=not]", form).value.trim();
      var L = ["Merhaba, " + BRAND + " için prova randevusu rica ediyorum."];
      if (konu) L.push("Konu: " + konu);
      if (parca.length) L.push("Parça: " + parca.join(", ") + (adet > 1 ? " (toplam " + adet + " parça)" : ""));
      else if (adet > 1) L.push("Parça sayısı: " + adet);
      if (is.length) L.push("Yapılacak iş: " + is.join("; "));
      if (gun) { var d = days[parseInt(gun.value, 10)]; L.push("Gün: " + d.long + (saat ? ", " + saat + " arası" : ", saat fark etmez")); }
      else L.push("Gün: Size uygun bir gün olabilir.");
      if (ad) L.push("Ad: " + ad);
      if (n) L.push("Not: " + n);
      L.push("Uygun olup olmadığını yazar mısınız? Teşekkürler.");
      var m = L.join("\n");
      msg.textContent = m; send.setAttribute("href", waLink(m));
      return m;
    }
    form.addEventListener("change", function (e) { if (e.target && e.target.name === "gun") paintSlots(); build(); });
    form.addEventListener("input", build);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    copy.addEventListener("click", function () { copyText(build(), copied); });
    paintSlots(); build();
  }

  /* ---- iletişim: hızlı soru ---- */
  function initAsk() {
    var root = $('[data-tool="soru"]'); if (!root) return;
    var msg = $("[data-ask-msg]", root), send = $("[data-ask-send]", root), copy = $("[data-ask-copy]", root), copied = $("[data-ask-copied]", root), extra = $("[name=ek]", root);
    var Q = {
      acik: "Bugün kaça kadar açıksınız? Uğramayı düşünüyorum.",
      tadilat: "Tadilat için bir parça getirmek istiyorum. Hangi gün uğramam uygun olur?",
      hazir: "Bıraktığım parça hazır mı? Teslim almaya gelmek istiyorum.",
      dikim: "Kişiye özel dikim hakkında bilgi almak istiyorum. Görüşmek için ne zaman gelebilirim?",
      yol: "İş merkezinde atölyeyi nasıl bulurum? Kat ve kapı bilgisini yazar mısınız?",
      fiyat: "Bir tadilat için fikir almak istiyorum; parçanın fotoğrafını gönderebilir miyim?"
    };
    function build() {
      var c = $("input[name=soru]:checked", root), e = extra.value.trim();
      var m = "Merhaba, " + BRAND + " için yazıyorum.\n" + (c ? Q[c.value] : "Bir sorum olacaktı.") + (e ? "\n" + e : "") + "\nTeşekkürler.";
      msg.textContent = m; send.setAttribute("href", waLink(m)); return m;
    }
    root.addEventListener("change", build); root.addEventListener("input", build);
    copy.addEventListener("click", function () { copyText(build(), copied); });
    build();
  }

  /* ---- iletişim: adresi kopyala ---- */
  function initAddr() {
    var b = $("[data-copy-addr]"); if (!b) return;
    b.addEventListener("click", function () {
      copyText("Terzi Rahmi-Erkan 1982, Sinanpaşa, Hasfırın Cd. Sinanpaşa işmerkezi No:5 D:2 kat 305, 34353 Beşiktaş/İstanbul", null);
      $("[data-addr-copied]").textContent = "Adres kopyalandı.";
    });
  }

  function init() {
    paintStatus(); setInterval(paintStatus, 60000);
    initNav(); initLabel(); initCare(); initLedger(); initHem(); initOlcu(); initBook(); initAsk(); initAddr();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
