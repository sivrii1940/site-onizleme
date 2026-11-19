/* Salon Ahmet Barbers — canlı durum, saat sorma, randevu talebi ve rehber araçları */
(function () {
  "use strict";

  var HOURS = {
    "0": [["10:50", "00:30"]], "1": [["10:50", "00:30"]], "2": [["10:50", "00:30"]],
    "3": [["10:50", "00:30"]], "4": [["10:50", "00:30"]], "5": [["10:50", "01:00"]]
  };
  var WA = "https://wa.me/905418833120";
  var DAY = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  var DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var TZ = "Europe/Istanbul";

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

  /* ---- yardımcılar ---- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function mins(s) { var a = s.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(m) { m = ((m % 1440) + 1440) % 1440; return two(Math.floor(m / 60)) + ":" + two(m % 60); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function dayRange(d) {
    var r = HOURS[String((d + 7) % 7)];
    if (!r || !r.length) return null;
    var s = mins(r[0][0]), e = mins(r[0][1]);
    if (e <= s) e += 1440;
    return { s: s, e: e };
  }
  function dateParts(k) {
    var dt = new Date(Date.now() + k * 86400000);
    try {
      return {
        long: new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long" }).format(dt),
        num: new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric" }).format(dt)
      };
    } catch (e) { return { long: dt.toLocaleDateString("tr-TR"), num: String(dt.getDate()) }; }
  }
  /* "00:30'a", "01:00'e": saat okunuşuna göre yönelme eki */
  function toSuffix(t) {
    var a = t.split(":"), h = parseInt(a[0], 10), m = parseInt(a[1], 10);
    if (m === 30) return "a";
    if (m !== 0) return "e";
    return ["a", "e", "ye", "e", "e", "e", "ya", "ye", "e", "a", "a", "e", "ye", "e", "e", "e", "ya", "ye", "e", "a", "ye", "e", "ye", "e"][h] || "e";
  }
  function dur(m) {
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + " sa " : "") + r + " dk";
  }
  function copyText(text, out) {
    function done(ok) {
      if (!out) return;
      out.textContent = ok ? "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; mesajı elle seçip kopyalayın.";
      clearTimeout(out._t);
      out._t = setTimeout(function () { out.textContent = ""; }, 4000);
    }
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    else legacy();
  }

  /* ---- canlı durum, neon, saat, gün şeridi ---- */
  function renderStatus() {
    var s = openStatus(HOURS), n = istanbulNow(), root = document.documentElement;
    root.classList.toggle("is-open", s.open);
    root.classList.toggle("is-closed", !s.open);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; });
    $$("[data-status-short]").forEach(function (el) {
      el.textContent = s.open ? "Açık · " + s.closesAt : (s.opensAt ? "Kapalı · " + s.opensAt : "Kapalı");
    });
    $$("[data-neon]").forEach(function (el) {
      var w = $("[data-neon-word]", el), sub = $("[data-neon-sub]", el);
      if (w) w.textContent = s.open ? "Açık" : "Kapalı";
      if (sub) sub.textContent = s.open ? s.closesAt + "'" + toSuffix(s.closesAt) + " kadar" : (s.opensAt ? "Açılış " + s.opensWhen + " " + s.opensAt : "Saatler için arayın");
    });
    $$("[data-clock]").forEach(function (el) { el.textContent = fmt(n.m); });

    var cd = "";
    if (s.open && s.closesAt) cd = "Kapanışa " + dur((mins(s.closesAt) - n.m + 1440) % 1440);
    else if (s.opensAt && s.opensWhen === "bugün") cd = "Açılışa " + dur(mins(s.opensAt) - n.m);
    else if (s.opensAt && s.opensWhen === "yarın") cd = "Açılışa " + dur(mins(s.opensAt) + 1440 - n.m);
    $$("[data-countdown]").forEach(function (el) { el.textContent = cd; });

    /* gün şeridi: gece yarısından sonraki ilk saatler bir önceki günün devamıdır */
    var late = n.m < 240, sd = late ? (n.d + 6) % 7 : n.d, pos = late ? n.m + 1440 : n.m;
    $$("[data-dayline]").forEach(function (el) {
      var r = dayRange(sd), open = $("[data-dl-open]", el), now = $("[data-dl-now]", el), note = $("[data-dl-note]", el), day = $("[data-dl-day]", el);
      el.classList.toggle("is-off", !r);
      if (r && open) { open.style.setProperty("--s", r.s); open.style.setProperty("--e", r.e); }
      if (day) day.textContent = DAY[sd];
      if (now) {
        var show = pos >= 600 && pos <= 1560;
        now.hidden = !show;
        now.classList.toggle("is-end", pos > 1440); now.classList.toggle("is-start", pos < 700);
        if (show) { now.style.setProperty("--now", pos); var b = $("b", now); if (b) b.textContent = fmt(n.m); }
      }
      if (note) note.textContent = s.text + (cd ? " (" + cd.toLocaleLowerCase("tr-TR") + ")." : ".");
    });
    $$("[data-week] li").forEach(function (li) {
      li.classList.toggle("is-today", String(n.d) === li.getAttribute("data-day"));
    });
    return s;
  }

  /* ---- menü ---- */
  function initMenu() {
    var btn = $("[data-menu-btn]"), panel = $("[data-panel]");
    if (!btn || !panel) return;
    function set(open) {
      panel.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Kapat" : "Menü";
    }
    btn.addEventListener("click", function () { set(!panel.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("is-open")) { set(false); btn.focus(); } });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  }

  /* ---- hazır sorular: data-q taşıyan bağlantılar ---- */
  function initQuestions() {
    $$("a[data-q]").forEach(function (a) { a.href = waLink(a.getAttribute("data-q")); });
  }

  /* ---- imza araç: bu akşam için saat sor ---- */
  function initAsk(box) {
    var SLOTS = $$("[data-slot]", box), nowBtn = $("[data-slot-now]", box), title = $("[data-ask-title]", box);
    var prev = $("[data-ask-preview]", box), send = $("[data-ask-send]", box), out = $("[data-copied]", box);
    var chips = $$("[data-svc]", box), state = { slot: null, svc: "saç kesimi", msg: "" };

    function target() {
      var n = istanbulNow();
      for (var k = 0; k < 8; k++) {
        var d = (n.d + k) % 7, r = dayRange(d);
        if (!r) continue;
        var av = SLOTS.map(function (b) { return b.getAttribute("data-slot"); }).filter(function (t) {
          var m = mins(t); return m >= r.s && m < r.e && (k > 0 || m > n.m + 10);
        });
        if (av.length) return { k: k, d: d, avail: av };
      }
      return null;
    }
    function render() {
      var t = target(), st = openStatus(HOURS);
      if (!t) return;
      var when = t.k === 0 ? "Bu akşam" : t.k === 1 ? "Yarın akşam" : DAY[t.d] + " akşamı";
      if (title) title.textContent = when + " için saat sor";
      if (nowBtn) nowBtn.hidden = !st.open;
      if (state.slot === "now" && !st.open) state.slot = null;
      if (state.slot !== "now" && t.avail.indexOf(state.slot) < 0) state.slot = t.avail[0];
      SLOTS.forEach(function (b) {
        var v = b.getAttribute("data-slot"), ok = t.avail.indexOf(v) >= 0, note = $(".slot__n", b);
        b.disabled = !ok;
        b.setAttribute("aria-pressed", state.slot === v ? "true" : "false");
        if (note) note.textContent = ok ? b.getAttribute("data-note") : "saati geçti";
      });
      if (nowBtn) nowBtn.setAttribute("aria-pressed", state.slot === "now" ? "true" : "false");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-svc") === state.svc ? "true" : "false"); });
      var msg;
      if (state.slot === "now") {
        msg = "Merhaba, şu an salona gelsem " + state.svc + " için uygun musunuz?";
      } else {
        msg = "Merhaba, " + (t.k < 2 ? when.toLocaleLowerCase("tr-TR") : when) + " (" + dateParts(t.k).long + ") saat " + state.slot + " için " + state.svc + " randevusu rica ediyorum. Uygun musunuz?";
      }
      state.msg = msg;
      if (prev) prev.textContent = msg;
      if (send) send.href = waLink(msg);
    }
    SLOTS.forEach(function (b) { b.addEventListener("click", function () { state.slot = b.getAttribute("data-slot"); render(); }); });
    if (nowBtn) nowBtn.addEventListener("click", function () { state.slot = "now"; render(); });
    chips.forEach(function (c) { c.addEventListener("click", function () { state.svc = c.getAttribute("data-svc"); render(); }); });
    var cp = $("[data-copy]", box);
    if (cp) cp.addEventListener("click", function () { copyText(state.msg, out); });
    render();
    return render;
  }

  /* ---- randevu talebi ---- */
  function initBook(box) {
    var daysEl = $("[data-days]", box), timesEl = $("[data-times]", box), prev = $("[data-book-preview]", box);
    var send = $("[data-book-send]", box), out = $("[data-copied]", box), people = $("[data-people]", box);
    var state = { k: null, slot: null, n: 1, msg: "" };

    function slotsFor(k) {
      var n = istanbulNow(), r = dayRange(n.d + k), list = [];
      if (!r) return list;
      for (var m = Math.ceil(r.s / 30) * 30; m <= r.e - 30; m += 30) {
        list.push({ m: m, label: fmt(m), past: k === 0 && m <= n.m + 15 });
      }
      return list;
    }
    function usable(k) { return slotsFor(k).some(function (s) { return !s.past; }); }

    function buildDays() {
      var n = istanbulNow(), html = "";
      if (state.k === null || !usable(state.k)) {
        state.k = null;
        for (var i = 0; i < 7 && state.k === null; i++) if (usable(i)) state.k = i;
      }
      for (var k = 0; k < 7; k++) {
        var d = (n.d + k) % 7, ok = usable(k), closed = !dayRange(d), p = dateParts(k);
        html += '<label class="pick"><input type="radio" name="gun" value="' + k + '"' + (ok ? "" : " disabled") + (state.k === k ? " checked" : "") + '>' +
          '<span>' + (k === 0 ? "Bugün" : k === 1 ? "Yarın" : DAY_SHORT[d]) + '<b>' + p.num + '</b><small>' + (closed ? "Kapalı" : ok ? (k < 2 ? DAY_SHORT[d] : " ") : "Geçti") + '</small></span></label>';
      }
      daysEl.innerHTML = html;
    }
    function buildTimes() {
      var every = slotsFor(state.k), groups = [["Gündüz", []], ["Akşam", []], ["Gece", []]];
      var ok = every.filter(function (s) { return !s.past; }), list = ok;
      if (!ok.some(function (s) { return s.m === state.slot; })) {
        var pref = ok.filter(function (s) { return s.m >= 1140; })[0] || ok[0];
        state.slot = pref ? pref.m : null;
      }
      list.forEach(function (s) { groups[s.m < 1080 ? 0 : s.m < 1320 ? 1 : 2][1].push(s); });
      timesEl.innerHTML = groups.filter(function (g) { return g[1].length; }).map(function (g) {
        return '<div class="times__g"><h4>' + g[0] + '</h4><div class="times__grid">' + g[1].map(function (s) {
          return '<label class="pick"><input type="radio" name="saat" value="' + s.m + '"' + (s.past ? " disabled" : "") + (state.slot === s.m ? " checked" : "") + '><span>' + s.label + '</span></label>';
        }).join("") + '</div></div>';
      }).join("") + (ok.length < every.length ? '<p class="times__note">Bugün için saati geçmiş dilimler listelenmez.</p>' : "");
    }
    function message() {
      var svc = $$('input[name="hizmet"]:checked', box).map(function (i) { return i.value; });
      var ad = ($('[name="ad"]', box).value || "").trim(), not = ($('[name="not"]', box).value || "").trim();
      var lines = ["Merhaba, randevu talebim var."];
      if (state.k !== null) lines.push("Gün: " + dateParts(state.k).long);
      var gece = state.k !== null ? DAY[(istanbulNow().d + state.k) % 7] + " gecesi, " : "";
      if (state.slot !== null) lines.push("Saat: " + fmt(state.slot) + (state.slot === 1440 ? " (" + gece + "tam gece yarısı)" : state.slot > 1440 ? " (" + gece + "gece yarısından sonra)" : ""));
      lines.push("Hizmet: " + (svc.length ? svc.join(", ") : "salonda konuşalım"));
      lines.push("Kişi sayısı: " + state.n);
      if (ad) lines.push("Ad: " + ad);
      if (not) lines.push("Not: " + not);
      lines.push("Uygun musunuz?");
      state.msg = lines.join("\n");
      prev.textContent = state.msg;
      send.href = waLink(state.msg);
    }
    function all() { buildDays(); buildTimes(); message(); }

    box.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "gun") { state.k = parseInt(t.value, 10); buildTimes(); }
      if (t.name === "saat") state.slot = parseInt(t.value, 10);
      message();
    });
    box.addEventListener("input", message);
    box.addEventListener("submit", function (e) { e.preventDefault(); });
    $$("[data-step]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        state.n = Math.max(1, Math.min(6, state.n + parseInt(b.getAttribute("data-step"), 10)));
        people.textContent = state.n; message();
      });
    });
    var cp = $("[data-copy]", box);
    if (cp) cp.addEventListener("click", function () { copyText(state.msg, out); });
    all();
    return function () {
      /* dakika ilerledikçe geçmiş saatleri kapat; kullanıcı yazarken seçimleri bozma */
      var a = document.activeElement;
      if (a && box.contains(a) && (a.tagName === "INPUT" && a.type === "text" || a.tagName === "TEXTAREA")) return;
      var list = slotsFor(state.k).filter(function (s) { return !s.past; }), cur = list.filter(function (s) { return s.m === state.slot; })[0];
      if (!cur || $$('input[name="saat"]', box).length !== list.length) all();
    };
  }

  /* ---- tarak numarası ---- */
  function initGuard(box) {
    var G = [
      ["0,5", 1.5, "Sıfıra en yakın boy. Ten belirgin görünür; geçişli kesimin en alt basamağıdır."],
      ["1", 3, "Çok kısa. Kafa derisi hafifçe seçilir; yanlarda keskin ve temiz durur."],
      ["1,5", 4.5, "1 ile 2 arasındaki ara boy. Basamakları yumuşatmak için kullanılır."],
      ["2", 6, "Kısa ama dolu görünür. Yanlar için en sık istenen boylardan biridir."],
      ["3", 10, "Ten artık görünmez. Düzgün, klasik bir kısalık verir."],
      ["4", 13, "Makineyle alınan orta boy. Üstünü de kısa sevenler için uygundur."],
      ["5", 16, "Parmak arasına hafifçe girer; yumuşak bir görüntü bırakır."],
      ["6", 19, "Makasla kesilmiş hissi veren uzunluk."],
      ["7", 22, "Uzun tarak. Üstü toplu biçimde kısaltmak için kullanılır."],
      ["8", 25, "En uzun standart tarak; aşağı yukarı bir parmak eni."]
    ];
    var nums = $("[data-guard-nums]", box), hair = $("[data-guard-hair]", box), mm = $("[data-guard-mm]", box), txt = $("[data-guard-txt]", box), say = $("[data-guard-say]", box);
    var cur = 3;
    nums.innerHTML = G.map(function (g, i) { return '<button type="button" data-i="' + i + '" aria-label="' + g[0] + ' numara">' + g[0] + '</button>'; }).join("");
    function render() {
      var g = G[cur];
      $$("button", nums).forEach(function (b, i) { b.setAttribute("aria-pressed", i === cur ? "true" : "false"); });
      hair.style.setProperty("--mm", g[1]);
      mm.innerHTML = String(g[1]).replace(".", ",") + "<small>mm</small>";
      txt.textContent = g[2];
      say.textContent = "“Yanlar " + g[0] + " numara olsun.”";
    }
    nums.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      cur = parseInt(b.getAttribute("data-i"), 10); render();
    });
    $("[data-guard-view]", box).hidden = false;
    render();
  }

  /* ---- ürün seçici ---- */
  function initPicker(box) {
    var P = {
      kil: ["Kil (clay)", "Mat bir bitiş verir, saç tellerini dolgun gösterir ve gün içinde yeniden şekil almaya izin verir.", "Nohut kadar ürünü avuç içinde iyice ısıtın, kuru saça dipten uca doğru yedirin."],
      matwax: ["Mat wax", "Güçlü tutar, parlamaz. Kalın telli ve dik duran saçı yerinde tutmaya yeter.", "Az miktarı parmak uçlarında açın; önce arkaya ve yanlara, en son öne uygulayın."],
      wax: ["Wax", "Orta güçte tutuş ve hafif doğal bir parlaklık verir; dokulu, dağınık kesimlerde iyi çalışır.", "Kuru ya da hafif nemli saça parmak uçlarıyla, tutam tutam uygulayın."],
      toz: ["Toz wax (hacim pudrası)", "İnce telli saçta dipleri kaldırır, ağırlık yapmadan hacim verir.", "Kuru saçta diplere az miktarda serpin, parmak uçlarıyla dağıtıp şekil verin."],
      macun: ["Şekillendirici macun (paste)", "Esnek tutar ve doğal görünür; saç sertleşmez, gün içinde elle düzeltilebilir.", "Nohut kadar ürünü avuçta açın; hafif nemli ya da kuru saça eşit dağıtın."],
      krem: ["Şekillendirici krem", "Hafif tutuşla saçı toplar, elektriklenmeyi ve kabarmayı azaltır; uzun saçı ağırlaştırmaz.", "Nemli saça uçlardan başlayarak yedirin; kendi hâlinde ya da fönle kurutun."],
      tuz: ["Deniz tuzu spreyi", "Saça mat, hafif pütürlü bir doku ve hareket verir; dalgayı belirginleştirir.", "Nemli saça birkaç kez sıkın, elle sıkıştırarak ya da fönle kurutun. Üstüne az miktar ürünle bitirebilirsiniz."],
      pomad: ["Su bazlı pomad", "Parlak ve taranmış bir görünüm verir; yana yatırılmış ve arkaya taranmış klasik modellerin ürünüdür. Suyla kolay çıkar.", "Hafif nemli saça yedirin, tarakla yön verin. Parlaklığı artırmak için saçı biraz daha nemli bırakın."],
      pomadguc: ["Güçlü tutuşlu pomad", "Kalın telli saçı parlak bir bitişle yerinde tutacak kadar sıkıdır.", "Avuçta iyice ısıtın, nemli saça yedirip sık dişli tarakla şekil verin."],
      bukle: ["Bukle kremi", "Dalgayı ve bukleyi dağıtmadan tanımlar, kabarmayı azaltır, saça canlı bir görünüm verir.", "Islak saça avuçla sıkıştırarak uygulayın; taramadan, kendi hâlinde kurumaya bırakın."]
    };
    var L = {
      tip: { ince: "ince telli", normal: "normal", kalin: "kalın telli", dalgali: "dalgalı ya da kıvırcık" },
      boy: { kisa: "kısa", orta: "orta boy", uzun: "uzun" },
      gor: { mat: "mat", dogal: "doğal", parlak: "parlak" }
    };
    var state = { tip: "normal", boy: "kisa", gor: "mat", msg: "" };
    function choose(s) {
      if (s.gor === "parlak") {
        if (s.tip === "dalgali") return s.boy === "kisa" ? "pomad" : "bukle";
        if (s.boy === "uzun") return "krem";
        return s.tip === "kalin" ? "pomadguc" : "pomad";
      }
      if (s.gor === "mat") {
        if (s.boy === "uzun") return "tuz";
        if (s.tip === "ince") return s.boy === "kisa" ? "kil" : "toz";
        if (s.tip === "kalin") return s.boy === "kisa" ? "matwax" : "kil";
        if (s.tip === "dalgali") return s.boy === "kisa" ? "kil" : "tuz";
        return s.boy === "kisa" ? "kil" : "matwax";
      }
      if (s.tip === "dalgali") return s.boy === "kisa" ? "macun" : "bukle";
      if (s.boy === "uzun") return s.tip === "ince" ? "tuz" : "krem";
      if (s.tip === "ince") return s.boy === "kisa" ? "macun" : "toz";
      if (s.tip === "kalin") return s.boy === "kisa" ? "wax" : "macun";
      return "macun";
    }
    var name = $("[data-pick-name]", box), why = $("[data-pick-why]", box), how = $("[data-pick-how]", box);
    var prev = $("[data-pick-preview]", box), send = $("[data-pick-send]", box), out = $("[data-copied]", box);
    function render() {
      $$("[data-k]", box).forEach(function (b) { b.setAttribute("aria-pressed", state[b.getAttribute("data-k")] === b.getAttribute("data-v") ? "true" : "false"); });
      var p = P[choose(state)];
      name.textContent = p[0]; why.textContent = p[1]; how.textContent = p[2];
      state.msg = "Merhaba, saçım " + L.tip[state.tip] + " ve " + L.boy[state.boy] + "; " + L.gor[state.gor] + " bir görünüm istiyorum. " + p[0] + " türünde bir ürününüz var mı?";
      prev.textContent = state.msg;
      send.href = waLink(state.msg);
    }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-k]"); if (!b) return;
      state[b.getAttribute("data-k")] = b.getAttribute("data-v"); render();
    });
    var cp = $("[data-copy]", box);
    if (cp) cp.addEventListener("click", function () { copyText(state.msg, out); });
    $("[data-pick-out]", box).hidden = false;
    render();
  }

  /* ---- başlat ---- */
  function start() {
    var ticks = [];
    initMenu();
    initQuestions();
    renderStatus();
    $$('[data-tool="saat-sor"]').forEach(function (b) { ticks.push(initAsk(b)); });
    $$('[data-tool="randevu"]').forEach(function (b) { ticks.push(initBook(b)); });
    $$('[data-tool="tarak"]').forEach(initGuard);
    $$('[data-tool="urun-sec"]').forEach(initPicker);
    setInterval(function () { renderStatus(); ticks.forEach(function (f) { f(); }); }, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
