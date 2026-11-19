/* Posus Cafe ve Kahvaltı — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var WA = "https://wa.me/905303456929";
  var BRAND = "Posus Cafe ve Kahvaltı";
  var HOURS = { "0": [["07:30", "19:00"]], "1": [["07:30", "19:00"]], "2": [["07:30", "19:00"]], "3": [["07:30", "19:00"]], "4": [["07:30", "19:00"]], "5": [["07:30", "19:00"]], "6": [["07:30", "19:00"]] };
  var OPEN_M = 450, CLOSE_M = 1140;

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
  /* ---- kopya sonu ---- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function copyText(text, okEl) {
    function done(ok) {
      if (!okEl) return;
      okEl.textContent = ok ? "Mesaj kopyalandı. WhatsApp ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın.";
      clearTimeout(okEl._t); okEl._t = setTimeout(function () { okEl.textContent = ""; }, 4200);
    }
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    else legacy();
  }

  var st = openStatus(HOURS);

  /* canlı durum */
  $$("[data-status]").forEach(function (el) {
    el.textContent = st.text;
    el.classList.toggle("is-open", st.open);
    var p = el.closest(".status, .foot__status");
    if (p) p.classList.toggle("is-open", st.open);
  });
  $$(".hours tr[data-day]").forEach(function (tr) { tr.classList.toggle("is-today", +tr.getAttribute("data-day") === st.dayIndex); });

  /* gezinme */
  var nb = $(".navbtn"), nav = $("#site-nav");
  if (nb && nav) {
    var setNav = function (o) { nav.classList.toggle("is-open", o); nb.setAttribute("aria-expanded", o ? "true" : "false"); };
    nb.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); nb.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target) && !nb.contains(e.target)) setNav(false); });
  }

  /* basit kopyalama düğmeleri */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), $(b.getAttribute("data-copy-ok") || "#none")); });
  });

  function partOf(m) { return m < 660 || m >= CLOSE_M ? "sabah" : m < 900 ? "ogle" : "ikindi"; }

  /* ===== Ana sayfa: kuşbakışı masa, Sabah / Öğle / İkindi ===== */
  var table = $("[data-table]");
  if (table) {
    var SETS = {
      sabah: { J: ["tb-ekmek", ""], A: ["tb-domates", "domates-salatalık"], H: ["tb-yumurta", "sahanda yumurta"], B: ["tb-peynir", "beyaz peynir ve kaşar"], C: ["tb-zeytin", "zeytin"], D: ["tb-bal", "bal-kaymak"], E: ["tb-simit", "simit"], F: ["tb-cay", "demli çay"], G: ["tb-recel", "reçel"], cap: "Sabah sofrası" },
      ogle: { J: ["tb-cay", ""], A: ["tb-borek", "kol böreği"], H: ["tb-tost", "tost"], B: ["tb-salata", "salata"], C: ["tb-zeytin", "zeytin"], D: ["tb-pogaca", "poğaça"], E: ["tb-ekmek", "ekmek sepeti"], F: ["tb-ayran", "ayran"], G: ["tb-peynir", "peynir tabağı"], cap: "Öğle arası" },
      ikindi: { J: ["tb-ekmek", ""], A: ["tb-pasta", "pasta"], H: ["tb-kahve", "Türk kahvesi"], B: ["tb-kurabiye", "kurabiye"], C: ["tb-pogaca", "poğaça"], D: ["tb-borek", "börek"], E: ["tb-simit", "simit"], F: ["tb-cay", "demli çay"], G: ["tb-recel", "reçel"], cap: "İkindi çayı" }
    };
    var ORDER = ["A", "H", "B", "C", "D", "E", "F", "G", "J"];
    var cap = $("[data-table-cap]"), btns = $$("[data-daypart] button"), cur = "sabah";
    var apply = function (key, animate) {
      var set = SETS[key]; if (!set) return;
      ORDER.forEach(function (slotKey, idx) {
        var slot = table.querySelector('[data-slot="' + slotKey + '"]'); if (!slot) return;
        var use = slot.querySelector("use"), want = "#" + set[slotKey][0];
        if (use.getAttribute("href") === want) return;
        if (!animate || reduce) { use.setAttribute("href", want); return; }
        setTimeout(function () {
          slot.classList.add("is-swap");
          setTimeout(function () {
            use.setAttribute("href", want);
            slot.style.setProperty("--r", (Math.round(Math.random() * 50) - 25) + "deg");
            slot.classList.remove("is-swap");
          }, 330);
        }, idx * 70);
      });
      var names = ORDER.map(function (k) { return set[k][1]; }).filter(Boolean);
      names.push("fırından ekmek");
      if (cap) cap.innerHTML = "<b>" + set.cap + ":</b> " + esc(names.join(", ")) + ". <span class=\"muted\">Çizimler temsilidir; günün çeşitlerini sorun.</span>";
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-key") === key ? "true" : "false"); });
      cur = key;
    };
    btns.forEach(function (b) { b.addEventListener("click", function () { if (b.getAttribute("data-key") !== cur) apply(b.getAttribute("data-key"), true); }); });
    var dp = $("[data-daypart]"); if (dp) dp.classList.add("is-ready");
    apply(partOf(st.minutes), false);
  }

  /* ===== Güneş yayı ===== */
  $$("[data-sun]").forEach(function (box) {
    var sun = box.querySelector(".sun"), left = box.querySelector("[data-sun-left]");
    var m = st.minutes, x, y;
    if (m < OPEN_M) { x = 40; y = 270; }
    else if (m >= CLOSE_M) { x = 600; y = 270; }
    else {
      var f = (m - OPEN_M) / (CLOSE_M - OPEN_M), a = Math.PI * (1 - f);
      x = 320 + 280 * Math.cos(a); y = 260 - 220 * Math.sin(a);
    }
    if (sun) sun.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
    if (left) {
      if (st.open) {
        var rem = CLOSE_M - m, h = Math.floor(rem / 60), mm = rem % 60;
        left.textContent = "Kapanışa " + (h ? h + " saat " : "") + (mm ? mm + " dakika" : "") + " var.";
      } else {
        left.textContent = st.opensWhen === "bugün" ? "Bugün 07:30'da kapıyı açıyoruz." : "Yarın sabah 07:30'da yeniden buradayız.";
      }
    }
    var now = st.open ? partOf(m) : null;
    $$("[data-part]").forEach(function (li) { li.classList.toggle("is-now", li.getAttribute("data-part") === now); });
  });

  /* ===== Menü sekmeleri ===== */
  var tabs = $$('[role="tab"]');
  if (tabs.length) {
    var select = function (tab, focus, push) {
      tabs.forEach(function (t) {
        var on = t === tab, p = document.getElementById(t.getAttribute("aria-controls"));
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (p) { p.hidden = !on; if (on) { p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); } }
      });
      if (focus) tab.focus();
      if (push && history.replaceState) history.replaceState(null, "", "#" + tab.getAttribute("aria-controls"));
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false, true); });
      t.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") j = 0;
        if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j], true, true); }
      });
    });
    var fromHash = function () {
      var id = (location.hash || "").slice(1), hit = null;
      tabs.forEach(function (t) { if (t.getAttribute("aria-controls") === id) hit = t; });
      select(hit || tabs[0], false, false);
      if (hit) { var tl = $(".tabs"); if (tl) tl.scrollIntoView({ block: "start" }); }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
  }

  /* ===== Menü: sorulacaklar tepsisi ===== */
  var trayTool = $('[data-tool="sor-tepsisi"]');
  if (trayTool) {
    var picked = [], COLORS = ["#F4D35E", "#E76F51", "#2A9D8F", "#C98B4B", "#8C9A36", "#F6AE22"];
    var list = $("[data-tray-list]"), plates = $("[data-tray-plates]"), pre = $("[data-tray-msg]"), wa = $("[data-tray-wa]");
    var noteEl = $("#tray-not"), howEls = $$('input[name="nasil"]'), link = $("[data-tray-count]"), ok = $("[data-tray-ok]");
    var addBtns = $$(".mi__add");
    var trayMsg = function () {
      var how = (howEls.filter(function (x) { return x.checked; })[0] || {}).value || "";
      var lines = [];
      if (picked.length) {
        lines.push("Merhaba, " + BRAND + " menüsünden şunları sormak istiyorum:");
        picked.forEach(function (p) { lines.push("• " + p); });
        lines.push("Bugün var mı, güncel fiyat bilgisi alabilir miyim?");
      } else {
        lines.push("Merhaba, " + BRAND + "'nın güncel menüsünü ve fiyatlarını öğrenebilir miyim?");
      }
      if (how) lines.push(how);
      var n = (noteEl && noteEl.value.trim()) || "";
      if (n) lines.push("Not: " + n);
      return lines.join("\n");
    };
    var sync = function () {
      addBtns.forEach(function (b) {
        var on = picked.indexOf(b.getAttribute("data-add")) > -1;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.lastChild.textContent = on ? "Tepside" : "Sor";
        b.firstChild.textContent = on ? "✓" : "+";
      });
      list.innerHTML = picked.length ? picked.map(function (p, i) {
        return '<li><span>' + esc(p) + '</span><button type="button" data-rm="' + i + '" aria-label="' + esc(p) + ' tepsiden çıkar">Çıkar</button></li>';
      }).join("") : '<li class="tray__empty">Tepsi şimdilik boş. Menüden "Sor" düğmesine dokunun.</li>';
      plates.innerHTML = picked.map(function (p, i) { return '<span style="--c:' + COLORS[i % COLORS.length] + '" title="' + esc(p) + '"></span>'; }).join("");
      var msg = trayMsg();
      pre.textContent = msg;
      wa.href = waLink(msg);
      if (link) link.textContent = picked.length ? "Tepside " + picked.length + " ürün var · mesaja geç" : "Sorulacaklar tepsisine geç";
    };
    addBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var n = b.getAttribute("data-add"), i = picked.indexOf(n);
        if (i < 0) picked.push(n); else picked.splice(i, 1);
        sync();
      });
    });
    list.addEventListener("click", function (e) {
      var b = e.target.closest("[data-rm]"); if (!b) return;
      picked.splice(+b.getAttribute("data-rm"), 1); sync();
    });
    if (noteEl) noteEl.addEventListener("input", sync);
    howEls.forEach(function (x) { x.addEventListener("change", sync); });
    var clr = $("[data-tray-clear]"); if (clr) clr.addEventListener("click", function () { picked = []; sync(); });
    var cp = $("[data-tray-copy]"); if (cp) cp.addEventListener("click", function () { copyText(trayMsg(), ok); });
    sync();
  }

  /* ===== Rezervasyon: kuşbakışı masa talebi ===== */
  var bk = $('[data-tool="masa-talebi"]');
  if (bk) {
    var MAXN = 12;
    var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    var DAYS_S = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    var FOOD = ["tb-domates", "tb-peynir", "tb-zeytin", "tb-bal", "tb-recel", "tb-yumurta", "tb-simit", "tb-pogaca", "tb-borek", "tb-salata", "tb-domates", "tb-zeytin"];
    var S = { n: 2, day: null, time: null, prevN: 0 };
    var q = /[?&]kisi=(\d+)/.exec(location.search);
    if (q) S.n = Math.max(1, Math.min(MAXN, parseInt(q[1], 10) || 2));

    var istDate = function () {
      try {
        var p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
        return { y: +o.year, m: +o.month, d: +o.day };
      } catch (e) { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
    };
    var now = istanbulNow(), base = istDate(), days = [];
    for (var k = 0; k < 7; k++) {
      var dt = new Date(Date.UTC(base.y, base.m - 1, base.d + k)), wd = (dt.getUTCDay() + 6) % 7;
      days.push({ k: k, label: k === 0 ? "Bugün" : k === 1 ? "Yarın" : DAYS_S[wd], sub: dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()].slice(0, 3), long: dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()] + " " + DAYS[wd] });
    }
    var slots = [];
    for (var t = OPEN_M; t <= 1080; t += 30) slots.push(t);
    var hm = function (t) { return ("0" + Math.floor(t / 60)).slice(-2) + ":" + ("0" + t % 60).slice(-2); };
    var slotOk = function (dayK, t) { return dayK > 0 || t > now.m + 15; };

    var dayBox = $("[data-days]", bk), timeBox = $("[data-times]", bk);
    dayBox.innerHTML = days.map(function (d) {
      return '<label class="chip"><input type="radio" name="gun" value="' + d.k + '"><span>' + d.label + '<small>' + d.sub + '</small></span></label>';
    }).join("");
    var groups = [["Sabah", 450, 660], ["Öğle", 690, 870], ["İkindi", 900, 1080]];
    timeBox.innerHTML = groups.map(function (g) {
      return '<div class="slot-group"><h4>' + g[0] + '</h4><div class="chips chips--times">' + slots.filter(function (x) { return x >= g[1] && x <= g[2]; }).map(function (x) {
        return '<label class="chip"><input type="radio" name="saat" value="' + hm(x) + '" data-m="' + x + '"><span>' + hm(x) + '</span></label>';
      }).join("") + '</div></div>';
    }).join("");

    var dayInputs = $$('input[name="gun"]', bk), timeInputs = $$('input[name="saat"]', bk);
    var refreshTimes = function () {
      var first = null;
      timeInputs.forEach(function (inp) {
        var okk = slotOk(S.day, +inp.getAttribute("data-m"));
        inp.disabled = !okk;
        if (okk && first === null) first = inp;
      });
      var sel = timeInputs.filter(function (x) { return x.value === S.time; })[0];
      if (!sel || sel.disabled) {
        var pref = timeInputs.filter(function (x) { return x.value === "09:30" && !x.disabled; })[0];
        sel = pref || first;
      }
      if (sel) { sel.checked = true; S.time = sel.value; }
    };
    S.day = slots.some(function (x) { return slotOk(0, x); }) ? 0 : 1;
    dayInputs[S.day].checked = true;
    if (S.day === 1) { var lab = dayInputs[0].parentNode.querySelector("small"); if (lab) lab.textContent = "saat geçti"; dayInputs[0].disabled = true; }
    refreshTimes();

    var peopleOut = $$("[data-people]", bk), minus = $('[data-step="-1"]', bk), plus = $('[data-step="1"]', bk), hint = $("[data-people-hint]", bk);
    var lives = $$("[data-live]", bk), caps = $$("[data-live-cap]", bk), msgEl = $("[data-msg]", bk), waEl = $("[data-wa]", bk), okEl = $("[data-ok]", bk);

    var seatSvg = function (x, y, rot, isNew, tabak) {
      var plate = tabak
        ? '<use href="#tb-tabak" x="-21" y="-21" width="42" height="42"/>'
        : '<circle r="20" fill="#fff" stroke="#E4D6B8" stroke-width="1.5"/><circle r="14.5" fill="none" stroke="#2A9D8F" stroke-width="1.8" stroke-dasharray=".01 3.6" stroke-linecap="round"/>';
      return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')"><g class="seat' + (isNew ? " pop" : "") + '">' + plate +
        '<rect x="-30" y="-12" width="3.4" height="25" rx="1.7" fill="#AFA99D"/><rect x="26.6" y="-12" width="3.4" height="25" rx="1.7" fill="#AFA99D"/>' +
        '<circle cx="19" cy="-25" r="7" fill="#A93E17" stroke="#EFE7D8" stroke-width="2.4"/></g></g>';
    };
    var chairSvg = function (x, y, rot) {
      return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')"><rect x="-19" y="-10" width="38" height="23" rx="9" fill="#C98B4B"/><rect x="-19" y="7" width="38" height="7" rx="3.5" fill="#A86F38"/></g>';
    };
    var dish = function (id, x, y, sz) {
      return '<use href="#' + id + '" x="' + (x - sz / 2).toFixed(1) + '" y="' + (y - sz / 2).toFixed(1) + '" width="' + sz + '" height="' + sz + '"/>';
    };
    var drawTable = function () {
      var n = S.n, style = (($('input[name="sekil"]:checked', bk) || {}).value) || "Serpme kahvaltı";
      var tabak = style === "Kahvaltı tabağı", serpme = style === "Serpme kahvaltı";
      var cx = 210, cy = 165, out = [], chairs = [], seats = [], dishes = [];
      if (n <= 6) {
        var R = n <= 2 ? 100 : n <= 4 ? 112 : 124;
        out.push('<circle cx="' + cx + '" cy="' + (cy + 6) + '" r="' + R + '" fill="rgba(46,42,37,.14)"/>');
        for (var i = 0; i < n; i++) {
          var deg = 90 + i * 360 / n, a = deg * Math.PI / 180;
          chairs.push(chairSvg(cx + (R + 14) * Math.cos(a), cy + (R + 14) * Math.sin(a), deg - 90));
          seats.push([cx + (R - 28) * Math.cos(a), cy + (R - 28) * Math.sin(a), deg - 90]);
        }
        out.push(chairs.join(""));
        out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#p-gingham)" stroke="#E2BF4C" stroke-width="3"/>');
        if (serpme) {
          var cnt = n <= 2 ? 4 : n <= 4 ? n + 2 : 7, rr = n <= 2 ? 31 : n <= 4 ? 36 : 46, sz = n <= 2 ? 36 : n <= 4 ? 34 : 36, off = n <= 2 ? 45 : -90;
          for (var j = 0; j < cnt; j++) {
            var b = (off + j * 360 / cnt) * Math.PI / 180;
            dishes.push(dish(FOOD[j], cx + rr * Math.cos(b), cy + rr * Math.sin(b), sz));
          }
          if (n > 2) dishes.push(dish("tb-caydanlik", cx, cy, n <= 4 ? 34 : 40));
        } else if (tabak) {
          dishes.push(dish("tb-caydanlik", cx - 22, cy, 38));
          dishes.push(dish("tb-ekmek", cx + 22, cy, 38));
        } else {
          dishes.push(dish("tb-caydanlik", cx, cy, 36));
          dishes.push(dish("tb-ekmek", cx - 34, cy, 32));
          dishes.push(dish("tb-zeytin", cx + 34, cy, 30));
        }
      } else {
        var per = Math.ceil(n / 2), bot = n - per, Wt = Math.max(per * 60 + 30, 250), Ht = 170, x0 = cx - Wt / 2, y0 = cy - Ht / 2;
        var row = function (count, yy, rot, cy2) {
          for (var i2 = 0; i2 < count; i2++) {
            var xx = cx - (count - 1) * 30 + i2 * 60;
            chairs.push(chairSvg(xx, cy2, rot));
            seats.push([xx, yy, rot]);
          }
        };
        row(per, y0 + 28, 180, y0 - 14);
        row(bot, y0 + Ht - 28, 0, y0 + Ht + 14);
        out.push('<rect x="' + x0 + '" y="' + (y0 + 6) + '" width="' + Wt + '" height="' + Ht + '" rx="26" fill="rgba(46,42,37,.14)"/>');
        out.push(chairs.join(""));
        out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + Wt + '" height="' + Ht + '" rx="26" fill="url(#p-gingham)" stroke="#E2BF4C" stroke-width="3"/>');
        if (serpme) {
          var c2 = Math.min(n + 1, 12), gap = Math.min(32, (Wt - 40) / c2), startX = cx - (c2 - 1) * gap / 2;
          for (var j2 = 0; j2 < c2; j2++) dishes.push(dish(FOOD[j2 % FOOD.length], startX + j2 * gap, cy + (j2 % 2 ? 6 : -6), 32));
        } else {
          dishes.push(dish("tb-caydanlik", cx - 30, cy, 40));
          dishes.push(dish("tb-ekmek", cx + 30, cy, 38));
          if (!tabak) { dishes.push(dish("tb-zeytin", cx - 82, cy, 32)); dishes.push(dish("tb-peynir", cx + 82, cy, 32)); }
        }
      }
      out.push(dishes.join(""));
      out.push(seats.map(function (s, idx) { return seatSvg(s[0], s[1], s[2], idx >= S.prevN, tabak); }).join(""));
      var svg = '<svg viewBox="0 0 420 330" role="img" aria-label="' + n + ' kişilik masa düzeni, kuşbakışı temsili çizim">' + out.join("") + "</svg>";
      lives.forEach(function (l) { l.innerHTML = svg; });
      var d = days[S.day] || days[0];
      caps.forEach(function (c) { c.textContent = n + " kişilik masa · " + style + " · " + d.label + " " + (S.time || ""); });
      S.prevN = n;
    };

    var buildMsg = function () {
      var d = days[S.day];
      var style = (($('input[name="sekil"]:checked', bk) || {}).value) || "";
      var occ = (($('input[name="vesile"]:checked', bk) || {}).value) || "";
      var ex = $$('input[name="ek"]:checked', bk).map(function (x) { return x.value; });
      var name = ($("#bk-ad", bk) || {}).value || "", note = ($("#bk-not", bk) || {}).value || "";
      var L = ["Merhaba, " + BRAND + " için masa talebim var.", "", "Kişi sayısı: " + S.n, "Gün: " + d.long + (d.k === 0 ? " (bugün)" : d.k === 1 ? " (yarın)" : ""), "Saat: " + S.time];
      if (style) L.push("Kahvaltı tercihi: " + style);
      if (occ) L.push("Özel gün: " + occ);
      if (ex.length) L.push("Ek istek: " + ex.join(", "));
      if (note.trim()) L.push("Not: " + note.trim());
      L.push("");
      L.push("Uygun olup olmadığını yazabilir misiniz? Teşekkürler." + (name.trim() ? "\n" + name.trim() : ""));
      return L.join("\n");
    };
    var update = function (redraw) {
      peopleOut.forEach(function (o) { o.textContent = S.n; });
      minus.disabled = S.n <= 1; plus.disabled = S.n >= MAXN;
      hint.innerHTML = S.n >= MAXN ? 'Daha kalabalık gruplar için en iyisi telefonla konuşmak: <a href="tel:+905303456929">0530 345 69 29</a>.' : S.n === 1 ? "Tek kişilik kahvaltıya da masa ayırabilirsiniz." : S.n + " kişi için masa düzeni aşağıda kendiliğinden kuruluyor.";
      if (redraw !== false) drawTable();
      var msg = buildMsg();
      msgEl.textContent = msg;
      waEl.href = waLink(msg);
    };
    minus.addEventListener("click", function () { if (S.n > 1) { S.n--; S.prevN = Math.min(S.prevN, S.n); update(); } });
    plus.addEventListener("click", function () { if (S.n < MAXN) { S.n++; update(); } });
    dayInputs.forEach(function (inp) { inp.addEventListener("change", function () { S.day = +inp.value; refreshTimes(); update(); }); });
    timeInputs.forEach(function (inp) { inp.addEventListener("change", function () { S.time = inp.value; update(); }); });
    $$('input[name="sekil"]', bk).forEach(function (x) { x.addEventListener("change", function () { S.prevN = 0; update(); }); });
    $$('input[name="vesile"], input[name="ek"]', bk).forEach(function (x) { x.addEventListener("change", function () { update(false); }); });
    $$("#bk-ad, #bk-not", bk).forEach(function (x) { x.addEventListener("input", function () { update(false); }); });
    var form = $("form", bk); if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
    var cpb = $("[data-copy-msg]", bk); if (cpb) cpb.addEventListener("click", function () { copyText(buildMsg(), okEl); });
    update();
  }

  /* ===== İletişim: hızlı mesaj ===== */
  var qm = $('[data-tool="hizli-mesaj"]');
  if (qm) {
    var TOPIC = {
      masa: "Masa ayırtmak istiyorum. Kişi sayısı ve saat:",
      menu: "Güncel menünüzü ve fiyatlarınızı öğrenebilir miyim?",
      gelal: "Gel-al ya da paket olarak sipariş vermek mümkün mü?",
      grup: "Kalabalık bir grup / kutlama için bilgi almak istiyorum.",
      yol: "Size nasıl gelebileceğimi sormak istiyorum.",
      diger: "Bir sorum var:"
    };
    var qPre = $("[data-qm-msg]", qm), qWa = $("[data-qm-wa]", qm), qOk = $("[data-qm-ok]", qm), qNote = $("#qm-not", qm), qName = $("#qm-ad", qm), qHint = $("[data-qm-hint]", qm);
    var qMsg = function () {
      var tp = (($('input[name="konu"]:checked', qm) || {}).value) || "diger";
      var L = ["Merhaba " + BRAND + ",", TOPIC[tp]];
      if (qNote.value.trim()) L.push(qNote.value.trim());
      if (qName.value.trim()) L.push("— " + qName.value.trim());
      return L.join("\n");
    };
    var qSync = function () {
      var m = qMsg(); qPre.textContent = m; qWa.href = waLink(m);
      var tp = (($('input[name="konu"]:checked', qm) || {}).value);
      if (qHint) qHint.hidden = tp !== "masa";
    };
    $$('input[name="konu"]', qm).forEach(function (x) { x.addEventListener("change", qSync); });
    [qNote, qName].forEach(function (x) { x.addEventListener("input", qSync); });
    $("[data-qm-copy]", qm).addEventListener("click", function () { copyText(qMsg(), qOk); });
    qSync();
  }

  /* ===== Hakkımızda: masa haritası ===== */
  var board = $("[data-anatomy]");
  if (board) {
    var show = function (key) {
      board.classList.toggle("is-focus", !!key);
      $$(".dish-g", board).forEach(function (g) { g.classList.toggle("is-on", g.getAttribute("data-key") === key); });
      $$("[data-legend] button").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-key") === key); });
    };
    $$("[data-legend] button").forEach(function (b) {
      var k2 = b.getAttribute("data-key");
      b.addEventListener("mouseenter", function () { show(k2); });
      b.addEventListener("focus", function () { show(k2); });
      b.addEventListener("click", function () { show(k2); });
      b.addEventListener("mouseleave", function () { if (document.activeElement !== b) show(null); });
      b.addEventListener("blur", function () { show(null); });
    });
  }

  /* ===== Kontrol listesi sayacı ===== */
  $$("[data-checklist]").forEach(function (cl) {
    var boxes = $$('input[type="checkbox"]', cl), out = $("[data-check-count]", cl);
    var upd = function () { var c = boxes.filter(function (b) { return b.checked; }).length; if (out) out.textContent = c === boxes.length ? "Hepsi tamam, masa talebinizi gönderebilirsiniz." : c + " / " + boxes.length + " madde işaretlendi."; };
    boxes.forEach(function (b) { b.addEventListener("change", upd); });
    upd();
  });
})();
