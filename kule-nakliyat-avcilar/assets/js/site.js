/* Kule Nakliyat — site betiği (kütüphanesiz) */
(function () {
  "use strict";

  var WA = "https://wa.me/905421804868";
  var TEL = "tel:+905421804868";
  var HOURS = { "0": [["07:00", "23:00"]], "1": [["07:00", "23:00"]], "2": [["00:00", "24:00"]], "3": [["07:00", "23:00"]], "4": [["07:30", "23:00"]], "5": [["07:00", "23:00"]], "6": [["07:00", "23:00"]] };

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

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function store(key, val) {
    try {
      if (val === undefined) { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function copyText(text, done) {
    function fallback() {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(t); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else { fallback(); }
  }
  function say(el, text) { if (!el) return; el.textContent = text; clearTimeout(el._t); el._t = setTimeout(function () { el.textContent = ""; }, 4000); }
  function printOnly(cls) {
    document.body.classList.add(cls);
    var off = function () { document.body.classList.remove(cls); window.removeEventListener("afterprint", off); };
    window.addEventListener("afterprint", off);
    window.print();
    setTimeout(off, 1500);
  }
  function armReset(btn, fn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("reset-armed")) { btn.classList.remove("reset-armed"); btn.textContent = btn.dataset.label; fn(); return; }
      btn.dataset.label = btn.dataset.label || btn.textContent;
      btn.classList.add("reset-armed"); btn.textContent = "Emin misiniz? Tekrar dokunun";
      setTimeout(function () { btn.classList.remove("reset-armed"); btn.textContent = btn.dataset.label; }, 3500);
    });
  }

  /* ---- Canlı durum ve saat tablosu ---- */
  function statusText(s) {
    if (!s.known) return s.text;
    if (s.all24) return "Şu an açık · bugün 24 saat açık";
    if (s.open) return "Şu an açık · kapanış " + s.closesAt;
    if (s.opensAt === "00:00") return "Şu an kapalı · gece 00:00'da açılıyor";
    if (s.opensAt) return "Şu an kapalı · açılış " + s.opensWhen + " " + s.opensAt;
    return s.text;
  }
  var ST = openStatus(HOURS);
  $$("[data-status]").forEach(function (el) {
    el.textContent = statusText(ST);
    el.classList.toggle("is-open", ST.open);
    el.classList.toggle("is-closed", !ST.open);
  });
  $$("[data-hours] tr[data-d]").forEach(function (tr) {
    if (parseInt(tr.getAttribute("data-d"), 10) === ST.dayIndex) tr.classList.add("today");
  });

  /* ---- Menü ---- */
  var mb = $(".menu-btn"), nav = $("#nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      mb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !mb.contains(e.target)) { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Kule göstergesi: aşağı indikçe büyür ---- */
  var secs = $$("[data-box]");
  var rail = $(".rail"), mini = $(".mini");
  var railItems = [], miniItems = [];
  secs.forEach(function (s, i) {
    if (!s.id) s.id = "b" + i;
    var r = (i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.5);
    if (rail) {
      var a = document.createElement("a");
      a.href = "#" + s.id; a.textContent = s.getAttribute("data-box");
      a.style.width = Math.max(56, 94 - i * 5) + "px";
      a.style.setProperty("--r", r + "deg");
      rail.appendChild(a); railItems.push(a);
    }
    if (mini) {
      var b = document.createElement("i");
      b.style.width = Math.max(14, 36 - i * 3) + "px";
      b.style.transform = "";
      mini.appendChild(b); miniItems.push(b);
    }
  });
  var ticking = false;
  function updTower() {
    ticking = false;
    var vh = window.innerHeight, cur = -1;
    secs.forEach(function (s, i) {
      var on = s.getBoundingClientRect().top < vh * 0.72;
      if (on) cur = i;
      if (railItems[i]) railItems[i].classList.toggle("on", on);
      if (miniItems[i]) miniItems[i].classList.toggle("on", on);
    });
    railItems.forEach(function (a, i) { a.classList.toggle("cur", i === cur); });
  }
  if (secs.length) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(updTower); } }, { passive: true });
    window.addEventListener("resize", updTower);
    updTower();
  }

  /* ---- Oda ve eşya verisi (eşya listesi, hızlı sayım, kule rozetleri) ---- */
  // [kimlik, ad, ipucu, tür(m: mobilya, b: beyaz eşya, e: elektronik, k: koli, d: diğer), kırılır]
  var ROOMS = [
    { id: "salon", name: "Salon", color: "#1D4E89", items: [
      ["koltuk", "Koltuk / kanepe", "Üçlü ve ikiliyi ayrı sayın", "m"], ["berjer", "Tekli koltuk / berjer", "", "m"], ["sehpa", "Sehpa", "Orta ve yan sehpalar", "m"],
      ["masa", "Yemek masası", "", "m"], ["sandalye", "Sandalye", "", "m"], ["tvunite", "TV ünitesi", "", "m"], ["tv", "Televizyon", "Kutusu varsa nota yazın", "e", 1],
      ["vitrin", "Vitrin / büfe", "Camlıysa içi boşaltılır", "m", 1], ["kitaplik", "Kitaplık", "", "m"], ["hali", "Halı", "", "d"], ["koli", "Koli", "Kitap, süs, kırlent…", "k"]] },
    { id: "yatak", name: "Yatak odası", color: "#7A3B69", items: [
      ["cift", "Çift kişilik yatak", "Baza ve yatak birlikte", "m"], ["tek", "Tek kişilik yatak", "", "m"], ["gardirop", "Gardırop", "Kapak sayısını nota yazabilirsiniz", "m"],
      ["komodin", "Komodin", "", "m"], ["sifonyer", "Şifonyer / çekmeceli dolap", "", "m"], ["makyaj", "Makyaj masası", "", "m"], ["ayna", "Boy aynası", "", "d", 1], ["koli", "Koli", "Giysi, nevresim…", "k"]] },
    { id: "cocuk", name: "Çocuk odası", color: "#2E7D5B", items: [
      ["karyola", "Karyola / ranza", "", "m"], ["besik", "Beşik", "", "m"], ["calisma", "Çalışma masası", "", "m"], ["dolap", "Dolap", "", "m"],
      ["oyuncak", "Oyuncak kolisi", "", "k"], ["koli", "Koli", "", "k"]] },
    { id: "mutfak", name: "Mutfak", color: "#D7263D", items: [
      ["buzdolabi", "Buzdolabı", "", "b"], ["firin", "Fırın / ocak", "Doğalgazlıysa bağlantıyı yetkiliye söktürün", "b"], ["bulasik", "Bulaşık makinesi", "", "b"],
      ["mikro", "Mikrodalga / küçük ev aleti", "", "e"], ["mmasa", "Mutfak masası", "", "m"], ["msandalye", "Sandalye", "", "m"], ["tabak", "Tabak, bardak kolisi", "", "k", 1], ["koli", "Koli", "Tencere, kiler…", "k"]] },
    { id: "banyo", name: "Banyo ve çamaşır", color: "#1F6F78", items: [
      ["camasir", "Çamaşır makinesi", "", "b"], ["kurutma", "Kurutma makinesi", "", "b"], ["bdolap", "Banyo dolabı / kirli sepeti", "", "m"], ["koli", "Koli", "", "k"]] },
    { id: "balkon", name: "Balkon ve depo", color: "#7E5A31", items: [
      ["btakim", "Balkon takımı", "", "m"], ["bisiklet", "Bisiklet", "", "d"], ["saksi", "Saksı / bitki", "", "d"], ["bavul", "Bavul", "", "d"], ["koli", "Koli", "", "k"]] },
    { id: "ofis", name: "Çalışma odası / ofis", color: "#C27C0E", items: [
      ["omasa", "Çalışma masası", "", "m"], ["okoltuk", "Ofis koltuğu", "", "m"], ["dosya", "Dosya dolabı", "", "m"], ["pc", "Bilgisayar / ekran", "", "e", 1],
      ["yazici", "Yazıcı", "", "e"], ["koli", "Koli", "Dosya, kırtasiye…", "k"]] }
  ];
  var KEY = "kule-liste-v1";
  function loadList() {
    var s = store(KEY) || {};
    s.c = s.c || {}; s.x = s.x || []; s.f = s.f || {};
    return s;
  }
  var LIST = loadList();
  function saveList() { store(KEY, LIST); }
  function itemOf(key) {
    var p = key.split("."), r = ROOMS.filter(function (x) { return x.id === p[0]; })[0];
    if (!r) return null;
    var it = r.items.filter(function (x) { return x[0] === p[1]; })[0];
    return it ? { room: r, it: it } : null;
  }
  function roomCount(id) {
    var n = 0;
    Object.keys(LIST.c).forEach(function (k) { if (k.indexOf(id + ".") === 0) n += LIST.c[k] || 0; });
    if (id === "diger") LIST.x.forEach(function (x) { n += x.q || 0; });
    return n;
  }
  function totals() {
    var t = { m: 0, b: 0, e: 0, k: 0, d: 0, all: 0 };
    Object.keys(LIST.c).forEach(function (k) {
      var o = itemOf(k), q = LIST.c[k] || 0;
      if (!o || !q) return;
      t[o.it[3]] += q; t.all += q;
    });
    LIST.x.forEach(function (x) { t.d += x.q || 0; t.all += x.q || 0; });
    return t;
  }
  function fmtDate(v) {
    if (!v) return "";
    var p = v.split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : v;
  }
  function place(addr, floor, lift) {
    var bits = [];
    if (floor) bits.push(floor);
    if (lift === "var") bits.push("bina asansörü var");
    else if (lift === "yok") bits.push("bina asansörü yok");
    else if (lift === "bilmiyorum") bits.push("asansör durumunu bilmiyorum");
    return (addr || "belirtmedim") + (bits.length ? " (" + bits.join(", ") + ")" : "");
  }
  function buildMsg() {
    var f = LIST.f, L = [];
    L.push("Merhaba Kule Nakliyat, taşınmam için keşif ve fiyat bilgisi almak istiyorum.");
    var head = L.length;
    L.push("");
    if (f.from || f.fromFloor || f.fromLift) L.push("Nereden: " + place(f.from, f.fromFloor, f.fromLift));
    if (f.to || f.toFloor || f.toLift) L.push("Nereye: " + place(f.to, f.toFloor, f.toLift));
    if (f.date || f.flex || f.time) {
      var d = f.date ? fmtDate(f.date) : "henüz belli değil";
      L.push("Tarih: " + d + (f.flex ? " (esnek)" : "") + (f.time ? ", " + f.time.toLocaleLowerCase("tr") + " tercih" : ""));
    }
    if (L.length > head + 1) L.push("");
    L.push("Eşya listesi:");
    var any = false;
    ROOMS.forEach(function (r) {
      var parts = [];
      r.items.forEach(function (it) {
        var q = LIST.c[r.id + "." + it[0]] || 0;
        if (q) parts.push(it[1] + (it[4] ? " (kırılır)" : "") + ": " + q);
      });
      if (parts.length) { any = true; L.push("• " + r.name + " — " + parts.join(", ")); }
    });
    var ex = LIST.x.filter(function (x) { return x.q > 0; }).map(function (x) { return x.n + ": " + x.q; });
    if (ex.length) { any = true; L.push("• Diğer — " + ex.join(", ")); }
    if (!any) L.push("• Listeyi henüz doldurmadım, görüşürken anlatırım.");
    var t = totals();
    if (t.all) {
      var tt = [];
      var parca = t.m + t.b + t.e + t.d;
      if (parca) tt.push(parca + " parça eşya" + (t.b ? " (" + t.b + " beyaz eşya)" : ""));
      if (t.k) tt.push(t.k + " koli");
      L.push("Toplam: " + tt.join(", "));
    }
    if (f.pack) L.push("Paketleme: " + f.pack);
    if (f.dis && f.dis.length) L.push("Söküm ve kurulum: " + f.dis.join(", "));
    if (f.note) L.push("Not: " + f.note);
    if (f.name) { L.push(""); L.push("Adım: " + f.name); }
    return L.join("\n");
  }

  /* ---- Hero kulesi: yeniden diz + oda rozetleri ---- */
  var replay = $(".replay");
  if (replay) {
    replay.addEventListener("click", function () {
      var h = document.documentElement;
      h.classList.remove("anim"); void h.offsetWidth; h.classList.add("anim");
    });
  }
  function paintBadges() {
    $$(".tower-svg .badge").forEach(function (g) {
      var id = g.getAttribute("data-badge"), n = roomCount(id);
      while (g.firstChild) g.removeChild(g.firstChild);
      if (!n) return;
      var NS = "http://www.w3.org/2000/svg";
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", "14"); c.setAttribute("fill", "#D7263D"); c.setAttribute("stroke", "#FFF8EC"); c.setAttribute("stroke-width", "2.5");
      var t = document.createElementNS(NS, "text");
      t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "central"); t.setAttribute("fill", "#fff");
      t.textContent = n > 99 ? "99+" : String(n);
      g.appendChild(c); g.appendChild(t);
    });
  }
  paintBadges();

  /* ---- Sayaç yardımcıları ---- */
  function counterHTML(key, label) {
    var q = LIST.c[key] || 0;
    return '<div class="counter' + (q ? " has" : "") + '" data-key="' + key + '">' +
      '<button type="button" data-d="-1" aria-label="' + label + ' azalt"' + (q ? "" : " disabled") + '>−</button>' +
      '<output aria-live="polite" aria-label="' + label + ' adedi">' + q + '</output>' +
      '<button type="button" data-d="1" aria-label="' + label + ' artır">+</button></div>';
  }
  function bindCounters(root, onChange) {
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".counter button");
      if (!b) return;
      var box = b.closest(".counter"), key = box.getAttribute("data-key");
      if (!key) return;
      var q = Math.max(0, Math.min(999, (LIST.c[key] || 0) + parseInt(b.getAttribute("data-d"), 10)));
      if (q) LIST.c[key] = q; else delete LIST.c[key];
      box.querySelector("output").textContent = q;
      box.classList.toggle("has", q > 0);
      box.querySelector('[data-d="-1"]').disabled = !q;
      saveList();
      onChange(key);
    });
  }
  function stackHTML(rows) {
    if (!rows.length) return '<div class="sb ghost" style="width:280px">Salon ?</div><div class="sb ghost" style="width:240px;--r:1deg">Yatak odası ?</div><div class="sb ghost" style="width:200px;--r:-1deg">Mutfak ?</div><p class="empty">Eşya ekledikçe kuleniz burada yükselecek.</p>';
    return rows.map(function (r, i) {
      var w = Math.max(120, 290 - i * 22);
      var rot = (i % 2 ? 1 : -1) * (0.5 + (i % 3) * 0.6);
      return '<div class="sb' + (r.red ? " red" : "") + '" style="width:' + w + 'px;--r:' + rot + 'deg;border-top-color:' + (r.color || "") + '">' + r.label + ' <b>' + r.n + '</b></div>';
    }).join("");
  }

  /* ---- Ana sayfa: hızlı sayım ---- */
  var quick = $('[data-tool="hizli"]');
  if (quick) {
    var qkeys = [["salon.koltuk", "Koltuk / kanepe", "Salon", "koltuk"], ["yatak.cift", "Çift kişilik yatak", "Yatak odası", "yatak"], ["mutfak.buzdolabi", "Buzdolabı", "Mutfak", "buzdolabi"], ["banyo.camasir", "Çamaşır makinesi", "Banyo", "camasir"], ["salon.koli", "Koli", "Salon", "koli"]];
    var ql = $(".quick-list", quick);
    ql.innerHTML = qkeys.map(function (k) {
      return '<li><span class="q-name"><svg class="ico" aria-hidden="true"><use href="img/ikonlar.svg#' + k[3] + '"></use></svg><span>' + k[1] + '<small>' + k[2] + '</small></span></span>' + counterHTML(k[0], k[1]) + '</li>';
    }).join("");
    var qstack = $(".stack", quick), qsum = $(".q-sum", quick), qwa = $(".q-wa", quick);
    var drawQuick = function () {
      var t = totals(), rows = [];
      ROOMS.forEach(function (r) { var n = roomCount(r.id); if (n) rows.push({ label: r.name, n: n, color: r.color, red: r.id === "mutfak" }); });
      qstack.innerHTML = stackHTML(rows);
      qsum.textContent = t.all ? "Listenizde " + (t.all - t.k) + " parça eşya ve " + t.k + " koli var. Odaların geri kalanını eşya listesinde tamamlayabilirsiniz." : "Sayaçlara dokunun; liste bu cihazda saklanır, eşya listesi sayfasında kaldığınız yerden devam edersiniz.";
      qwa.href = waLink(buildMsg());
      paintBadges();
    };
    bindCounters(ql, drawQuick);
    drawQuick();
  }

  /* ---- Eşya listesi aracı ---- */
  var lister = $('[data-tool="esya"]');
  if (lister) {
    var roomsBox = $(".rooms", lister);
    roomsBox.innerHTML = ROOMS.map(function (r, i) {
      var n = roomCount(r.id);
      return '<details class="room" id="oda-' + r.id + '" style="--rc:' + r.color + '"' + (i < 2 || n ? " open" : "") + '><summary>' + r.name + '<span class="rc' + (n ? " has" : "") + '" data-rc="' + r.id + '">' + (n ? n + " adet" : "boş") + '</span></summary><ul class="items">' +
        r.items.map(function (it) {
          return '<li><span class="nm">' + it[1] + (it[4] ? ' <span class="fr">KIRILIR</span>' : "") + (it[2] ? "<small>" + it[2] + "</small>" : "") + '</span>' + counterHTML(r.id + "." + it[0], r.name + ": " + it[1]) + '</li>';
        }).join("") + '</ul></details>';
    }).join("") +
      '<details class="room" id="oda-diger" style="--rc:#2B2118"' + (LIST.x.length ? " open" : "") + '><summary>Diğer eşyalar<span class="rc" data-rc="diger">' + (roomCount("diger") ? roomCount("diger") + " adet" : "boş") + '</span></summary><ul class="items extra"></ul>' +
      '<div class="add"><label class="sr-only" for="ex-name">Eşya adı</label><input id="ex-name" class="inp" type="text" maxlength="60" placeholder="Ör. piyano, akvaryum, kasa"><button type="button" class="btn btn-sm ex-add">Ekle</button></div></details>';

    var extraList = $(".extra", lister);
    var drawExtra = function () {
      extraList.innerHTML = LIST.x.map(function (x, i) {
        return '<li><span class="nm">' + x.n.replace(/[<>&"]/g, "") + '</span><div class="counter' + (x.q ? " has" : "") + '" data-x="' + i + '"><button type="button" data-xd="-1" aria-label="' + x.n.replace(/[<>&"]/g, "") + ' azalt">−</button><output>' + x.q + '</output><button type="button" data-xd="1" aria-label="' + x.n.replace(/[<>&"]/g, "") + ' artır">+</button></div></li>';
      }).join("");
    };
    drawExtra();
    var exName = $("#ex-name");
    var addExtra = function () {
      var v = (exName.value || "").trim().replace(/[<>&"]/g, "");
      if (!v) { exName.focus(); return; }
      LIST.x.push({ n: v, q: 1 }); exName.value = ""; saveList(); drawExtra(); drawAll();
    };
    $(".ex-add", lister).addEventListener("click", addExtra);
    exName.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addExtra(); } });
    extraList.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-xd]");
      if (!b) return;
      var i = parseInt(b.closest(".counter").getAttribute("data-x"), 10);
      LIST.x[i].q += parseInt(b.getAttribute("data-xd"), 10);
      if (LIST.x[i].q <= 0) LIST.x.splice(i, 1);
      saveList(); drawExtra(); drawAll();
    });

    // form
    var form = $(".move-form", lister);
    var fill = function () {
      var f = LIST.f;
      $$("[data-f]", form).forEach(function (el) {
        var k = el.getAttribute("data-f");
        if (el.type === "radio") el.checked = f[k] === el.value;
        else if (el.type === "checkbox" && k === "dis") el.checked = (f.dis || []).indexOf(el.value) > -1;
        else if (el.type === "checkbox") el.checked = !!f[k];
        else if (f[k] != null) el.value = f[k];
      });
    };
    fill();
    var readForm = function () {
      var f = { dis: [] };
      $$("[data-f]", form).forEach(function (el) {
        var k = el.getAttribute("data-f");
        if (el.type === "radio") { if (el.checked) f[k] = el.value; }
        else if (el.type === "checkbox" && k === "dis") { if (el.checked) f.dis.push(el.value); }
        else if (el.type === "checkbox") f[k] = el.checked;
        else f[k] = el.value.trim();
      });
      LIST.f = f; saveList(); drawAll();
    };
    form.addEventListener("input", readForm);
    form.addEventListener("change", readForm);

    var out = $(".msg", lister), wa = $(".l-wa", lister), stack = $(".stack", lister), tots = $(".totals", lister), toast = $(".toast", lister);
    var drawAll = function () {
      var rows = [];
      ROOMS.forEach(function (r) {
        var n = roomCount(r.id);
        var rc = $('[data-rc="' + r.id + '"]', lister);
        if (rc) { rc.textContent = n ? n + " adet" : "boş"; rc.classList.toggle("has", n > 0); }
        if (n) rows.push({ label: r.name, n: n, color: r.color, red: r.id === "mutfak" });
      });
      var nd = roomCount("diger");
      var rcd = $('[data-rc="diger"]', lister);
      if (rcd) { rcd.textContent = nd ? nd + " adet" : "boş"; rcd.classList.toggle("has", nd > 0); }
      if (nd) rows.push({ label: "Diğer", n: nd, color: "#2B2118" });
      stack.innerHTML = stackHTML(rows);
      var t = totals();
      tots.innerHTML = '<li><b>' + t.m + '</b>mobilya</li><li><b>' + t.b + '</b>beyaz eşya</li><li><b>' + t.k + '</b>koli</li><li><b>' + (t.e + t.d) + '</b>elektronik ve diğer</li>';
      var ls = $(".live-sum", lister);
      if (ls) ls.textContent = t.all ? "Kuleniz: " + (t.all - t.k) + " parça eşya · " + t.k + " koli" : "";
      var m = buildMsg();
      out.textContent = m;
      wa.href = waLink(m);
    };
    bindCounters(roomsBox, drawAll);
    drawAll();

    $(".l-copy", lister).addEventListener("click", function () {
      copyText(buildMsg(), function (ok) { say(toast, ok ? "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; metni seçip elle kopyalayın."); });
    });
    $(".l-print", lister).addEventListener("click", function () { printOnly("print-msg"); });
    armReset($(".l-reset", lister), function () {
      LIST = { c: {}, x: [], f: {} }; saveList();
      $$(".counter", roomsBox).forEach(function (c) {
        if (!c.hasAttribute("data-key")) return;
        c.querySelector("output").textContent = "0"; c.classList.remove("has"); c.querySelector('[data-d="-1"]').disabled = true;
      });
      form.reset(); drawExtra(); drawAll(); say(toast, "Liste temizlendi.");
    });
    var openHash = function () {
      var h = location.hash.replace("#", "");
      if (h.indexOf("oda-") === 0) { var d = document.getElementById(h); if (d) { d.open = true; d.scrollIntoView({ block: "start" }); } }
    };
    window.addEventListener("hashchange", openHash);
    openHash();
  }

  /* ---- Taşınma kontrol listesi ---- */
  var cl = $('[data-tool="kontrol"]');
  if (cl) {
    var CK = "kule-kontrol-v1", done = store(CK) || {};
    var boxes = $$("input[type=checkbox]", cl);
    boxes.forEach(function (b) { b.checked = !!done[b.id]; });
    var drawCl = function () {
      var all = 0, ok = 0;
      $$(".period", cl).forEach(function (p) {
        var bs = $$("input[type=checkbox]", p), n = bs.filter(function (b) { return b.checked; }).length;
        all += bs.length; ok += n;
        p.classList.toggle("done", n === bs.length);
        var pc = $(".pc", p); if (pc) pc.textContent = n + " / " + bs.length;
        var pb = document.querySelector('.ptower .pb[data-p="' + p.id + '"]');
        if (pb) { pb.classList.toggle("done", n === bs.length); var em = $("em", pb); if (em) em.textContent = n + "/" + bs.length; }
      });
      $$(".progress-line").forEach(function (el) { el.textContent = ok === all ? "Bütün işler tamam. Kolay gelsin!" : ok + " / " + all + " iş tamam"; });
    };
    cl.addEventListener("change", function (e) {
      if (e.target.type !== "checkbox") return;
      if (e.target.checked) done[e.target.id] = 1; else delete done[e.target.id];
      store(CK, done); drawCl();
    });
    drawCl();
    var pr = $(".c-print", cl); if (pr) pr.addEventListener("click", function () { printOnly("print-check"); });
    var rs = $(".c-reset", cl);
    if (rs) armReset(rs, function () { done = {}; store(CK, done); boxes.forEach(function (b) { b.checked = false; }); drawCl(); });
  }

  /* ---- Sekmeler ---- */
  $$(".tabs").forEach(function (tl) {
    var tabs = $$("[role=tab]", tl);
    var sel = function (t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -9;
        if (j !== -9) { e.preventDefault(); sel(tabs[(j + tabs.length) % tabs.length], true); }
      });
    });
    sel(tabs[0]);
  });

  /* ---- Koli etiketi ---- */
  var lm = $('[data-tool="etiket"]');
  if (lm) {
    var lab = $(".klabel", lm);
    var drawLabel = function () {
      var room = $("#e-oda", lm), opt = room.options[room.selectedIndex];
      lab.style.setProperty("--lc", opt.getAttribute("data-c"));
      $(".kl-room", lab).textContent = opt.value;
      var no = parseInt($("#e-no", lm).value, 10);
      $(".kl-no", lab).textContent = "No " + (no > 0 ? no : 1);
      var w = $("#e-ne", lm).value.trim();
      $(".kl-what", lab).textContent = w || "İçindekileri yazın: ör. çay bardakları, kahve takımı";
      var icons = $(".kl-icons", lab), html = "";
      $$("input[name=e-isaret]:checked", lm).forEach(function (c) {
        html += '<span class="' + (c.value === "kirilir" ? "r" : "") + '"><svg aria-hidden="true"><use href="img/ikonlar.svg#' + c.value + '"></use></svg>' + c.getAttribute("data-t") + "</span>";
      });
      icons.innerHTML = html;
      var who = $("#e-kim", lm).value.trim();
      $(".kl-foot", lab).textContent = (who ? who + " · " : "") + "Yeni evde: " + ($("#e-yer", lm).value.trim() || "odasına bırakın");
    };
    lm.addEventListener("input", drawLabel);
    lm.addEventListener("change", drawLabel);
    $(".e-next", lm).addEventListener("click", function () { var i = $("#e-no", lm); i.value = (parseInt(i.value, 10) || 0) + 1; $("#e-ne", lm).value = ""; drawLabel(); $("#e-ne", lm).focus(); });
    $(".e-print", lm).addEventListener("click", function () { printOnly("print-label"); });
    drawLabel();
  }

  /* ---- İletişim: hızlı soru ---- */
  var qa = $('[data-tool="soru"]');
  if (qa) {
    var qout = $(".msg", qa), qlink = $(".s-wa", qa), qtoast = $(".toast", qa);
    var qmsg = function () {
      var topic = ($("input[name=s-konu]:checked", qa) || {}).value || "";
      var semt = $("#s-semt", qa).value.trim(), when = $("#s-zaman", qa).value.trim(), txt = $("#s-not", qa).value.trim();
      var L = ["Merhaba Kule Nakliyat,"];
      L.push(topic ? topic + " hakkında bilgi almak istiyorum." : "bilgi almak istiyorum.");
      if (semt) L.push("Semt: " + semt);
      if (when) L.push("Düşündüğüm tarih: " + when);
      if (txt) L.push(txt);
      return L.join("\n");
    };
    var drawQ = function () { var m = qmsg(); qout.textContent = m; qlink.href = waLink(m); };
    qa.addEventListener("input", drawQ); qa.addEventListener("change", drawQ);
    $(".s-copy", qa).addEventListener("click", function () { copyText(qmsg(), function (ok) { say(qtoast, ok ? "Mesaj kopyalandı." : "Kopyalanamadı; metni seçip elle kopyalayın."); }); });
    drawQ();
  }

  /* ---- Hizmet kolilerindeki "sorun" bağlantıları ---- */
  $$("[data-ask]").forEach(function (a) {
    a.href = waLink("Merhaba Kule Nakliyat, " + a.getAttribute("data-ask") + " hakkında bilgi almak istiyorum.");
  });

  void TEL;
})();
