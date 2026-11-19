/* Tesisat Hizmeti — site betiği (kütüphane yok) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var WA = "https://wa.me/905325993477";
  var TEL = "tel:+905325993477";
  var HOURS = {}; /* çalışma saati bilinmiyor */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- açık/kapalı durumu (kit/status.js kopyası) ---------- */
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
  var st = openStatus(HOURS);
  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.textContent = st.text;
    el.classList.toggle("is-open", st.open);
  });

  /* ---------- yardımcılar ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function fmt(x, d) { return x.toLocaleString("tr-TR", { maximumFractionDigits: d, minimumFractionDigits: 0 }); }
  function waLink(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function copyText(text, btn) {
    var label = btn.textContent;
    function ok() { btn.textContent = "Kopyalandı"; btn.classList.add("copied"); setTimeout(function () { btn.textContent = label; btn.classList.remove("copied"); }, 1800); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { /* kopyalanamadı */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  /* ---------- menü (vana volanı) ---------- */
  var mb = $(".menu-btn"), nav = $("#site-nav");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var open = mb.getAttribute("aria-expanded") === "true";
      mb.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); }
    });
  }

  /* ---------- ana boru hattı: kaydırdıkça su iner, vanalar açılır ---------- */
  var main = $("main"), pipeline = $(".pipeline");
  var joints = $$(".joint").filter(function (j) { return !j.hasAttribute("data-manual"); });
  var maxF = 0, ticking = false;
  function flow() {
    ticking = false;
    if (!main || !pipeline) return;
    var r = main.getBoundingClientRect(), line = window.innerHeight * 0.62;
    var f = (line - r.top) / Math.max(1, r.height);
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) f = 1;
    f = Math.max(0, Math.min(1, f));
    if (f > maxF) { maxF = f; pipeline.style.setProperty("--flow", maxF.toFixed(4)); }
    joints.forEach(function (j) {
      if (j.classList.contains("is-open")) return;
      var jr = j.getBoundingClientRect();
      if (jr.top + jr.height / 2 < line || f === 1) j.classList.add("is-open");
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(flow); } }
  if (pipeline) {
    pipeline.style.setProperty("--flow", "0");
    if (REDUCED) { pipeline.style.setProperty("--flow", "1"); joints.forEach(function (j) { j.classList.add("is-open"); }); }
    else { flow(); window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req); window.addEventListener("load", req); }
  }

  /* ---------- hero: damlayan musluk ---------- */
  var tap = $("[data-tap]");
  if (tap) {
    var drop = $(".t-dropg", tap), cnt = $("[data-drops]", tap), say = $("[data-say]", tap);
    var bValve = $("[data-act='valve']", tap), n = 0, stopReq = false;
    var T0 = say ? say.innerHTML : "";
    if (drop) drop.addEventListener("animationiteration", function () {
      if (stopReq) { tap.classList.add("is-dry"); stopReq = false; return; }
      n++; if (cnt) cnt.textContent = n;
    });
    $$("[data-act]", tap).forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-act");
        if (a === "squeeze") {
          tap.classList.remove("is-squeeze"); void tap.offsetWidth; tap.classList.add("is-squeeze");
          if (!tap.classList.contains("is-valve")) say.innerHTML = "Kolu ne kadar sıksanız da damla sürüyor. Kapalı musluğun damlatması çoğu zaman yıpranmış <b>conta</b> ya da <b>kartuştan</b> olur; kolu zorlamak parçaya zarar verebilir. Şimdi ara musluğu kapatmayı deneyin.";
        } else if (a === "valve") {
          tap.classList.add("is-valve"); bValve.setAttribute("aria-pressed", "true");
          if (REDUCED) tap.classList.add("is-dry"); else stopReq = true;
          say.innerHTML = "Ara musluk kapandı, hattaki su kesildi ve damla duruyor. Gerçekte de önce lavabo altındaki <b>ara musluğu</b> ya da <b>ana vanayı</b> kapatın, sonra <a href=\"ariza-bildir.html#musluk\">arızayı bildirin</a>.";
        } else if (a === "reset") {
          tap.classList.remove("is-valve", "is-dry", "is-squeeze"); stopReq = false; bValve.setAttribute("aria-pressed", "false");
          say.innerHTML = T0;
        }
      });
    });
  }

  /* ---------- araç: damla hesabı ---------- */
  var dc = $("[data-tool='damla']");
  if (dc) {
    var rate = $("[data-rate]", dc), rateOut = $("[data-rate-out]", dc), tapper = $("[data-tapper]", dc), tapInfo = $("[data-tap-info]", dc);
    var outDay = $("[data-day]", dc), outMonth = $("[data-month]", dc), outYear = $("[data-year]", dc), outEq = $("[data-eq]", dc), cw = $(".c-w", dc);
    var hits = [];
    function size() { var r = $("input[name='dsize']:checked", dc); return r ? parseFloat(r.value) : 0.1; }
    function calc() {
      var per = parseInt(rate.value, 10) || 1, ml = size();
      var day = per * 60 * 24 * ml / 1000;
      rateOut.textContent = "dakikada " + per + " damla";
      outDay.textContent = "≈ " + fmt(day, day < 10 ? 1 : 0) + " L";
      outMonth.textContent = "≈ " + fmt(day * 30, 0) + " L";
      outYear.textContent = "≈ " + fmt(day * 365, 0) + " L";
      var buckets = day * 30 / 10;
      outEq.textContent = buckets < 1 ? "Ayda bir kovayı (10 litre) doldurmaya yakın su." : "Ayda yaklaşık " + fmt(buckets, buckets < 10 ? 1 : 0) + " kova (10 litrelik) su boşa gider.";
      var f = Math.min(1, Math.sqrt(day / 52));
      var h = Math.max(3, f * 150);
      cw.setAttribute("y", String(176 - h)); cw.setAttribute("height", String(h));
    }
    rate.addEventListener("input", calc);
    $$("input[name='dsize']", dc).forEach(function (r) { r.addEventListener("change", calc); });
    tapper.addEventListener("click", function () {
      var now = Date.now();
      if (hits.length && now - hits[hits.length - 1] > 20000) hits = [];
      hits.push(now); if (hits.length > 12) hits.shift();
      tapper.classList.add("is-hit"); setTimeout(function () { tapper.classList.remove("is-hit"); }, 140);
      if (hits.length < 3) { tapInfo.textContent = hits.length + ". damla. En az üç damlada dokunun."; return; }
      var per = Math.round((hits.length - 1) / ((hits[hits.length - 1] - hits[0]) / 60000));
      per = Math.max(1, Math.min(180, per));
      rate.value = per; calc();
      tapInfo.textContent = hits.length + " dokunuşa göre dakikada yaklaşık " + per + " damla.";
    });
    calc();
  }

  /* ---------- araç: sayaç defteri ---------- */
  var mt = $("[data-tool='sayac']");
  if (mt) {
    var r1 = $("[data-r1]", mt), r2 = $("[data-r2]", mt), mins = $("[data-mins]", mt), save = $("[data-save]", mt), saved = $("[data-saved]", mt);
    var odo = $("[data-odo]", mt), out = $("[data-meter-out]", mt), mwa = $("[data-meter-wa]", mt), KEY = "th-sayac";
    function num(v) { v = String(v || "").replace(/\s/g, "").replace(",", "."); return v === "" ? NaN : parseFloat(v); }
    function drawOdo(v) {
      var x = isNaN(v) ? 0 : v, ip = Math.floor(x), dp = Math.round((x - ip) * 1000);
      if (dp === 1000) { ip++; dp = 0; }
      var a = ("00000" + ip).slice(-5), b = ("000" + dp).slice(-3), h = "";
      for (var i = 0; i < 5; i++) h += "<span>" + a[i] + "</span>";
      h += "<i aria-hidden=\"true\"></i>";
      for (var k = 0; k < 3; k++) h += "<span class=\"r\">" + b[k] + "</span>";
      odo.innerHTML = h;
    }
    function store() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
    function run() {
      var a = num(r1.value), b = num(r2.value), m = num(mins.value);
      drawOdo(!isNaN(b) ? b : a);
      if (isNaN(a) || isNaN(b)) { out.innerHTML = "<p>İki okumayı ve aradaki süreyi girin; sonuç burada görünür.</p>"; mwa.hidden = true; return; }
      if (b < a) { out.innerHTML = "<p><b>İkinci okuma ilkinden küçük olamaz.</b> Hanelerin yerini ve virgülü kontrol edin.</p>"; mwa.hidden = true; return; }
      var L = (b - a) * 1000, msg;
      if (!(m > 0)) { out.innerHTML = "<p>Aradaki süreyi dakika olarak girin.</p>"; mwa.hidden = true; return; }
      var ph = L / m * 60;
      if (L < 0.5) {
        msg = "<p><b>Bu sürede sayaç ilerlememiş.</b> Su kullanılmadığında sayacın durması beklenir; bu ölçüm görünür bir kaçak işareti vermiyor.</p><p>Yine de duvarda nem, tavanda leke görüyorsanız fotoğrafını gönderin.</p>";
      } else {
        msg = "<p><b>Su kullanılmadığı hâlde " + fmt(L, 1) + " litre geçmiş</b> (saatte yaklaşık " + fmt(ph, 1) + " litre).</p><p>Bu, tesisatta bir yerde su kaçtığını gösterebilir. Önce rezervuarların durmadan dolup dolmadığını ve muslukların tam kapalı olduğunu kontrol edin; sonuç değişmiyorsa ölçümü bize gönderin.</p>";
      }
      out.innerHTML = msg;
      var t = "Merhaba Tesisat Hizmeti, sayaçla kaçak kontrolü yaptım.\nİlk okuma: " + r1.value + " m³\nİkinci okuma: " + r2.value + " m³\nAradaki süre: " + mins.value + " dakika\nFark: yaklaşık " + fmt(L, 1) + " litre\nBu sürede su kullanmadık. Sayacın fotoğrafını da gönderiyorum.";
      mwa.href = waLink(t); mwa.hidden = false;
    }
    [r1, r2, mins].forEach(function (el) { el.addEventListener("input", run); });
    r2.addEventListener("change", function () {
      var s = store(), el = s && s.t ? Math.round((Date.now() - s.t) / 60000) : 0;
      if (el >= 5 && !mins.value) { mins.value = el; run(); }
    });
    save.addEventListener("click", function () {
      var a = num(r1.value);
      if (isNaN(a)) { saved.textContent = "Önce ilk okumayı yazın."; r1.focus(); return; }
      var d = new Date();
      try { localStorage.setItem(KEY, JSON.stringify({ r: r1.value, t: d.getTime() })); } catch (e) { /* depolama kapalı */ }
      saved.textContent = "Kaydedildi: " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ". Su kullanmadan bekleyin, sonra ikinci okumayı girin.";
    });
    var s0 = store();
    if (s0 && s0.r) {
      r1.value = s0.r;
      var d0 = new Date(s0.t);
      saved.textContent = "Kayıtlı ilk okuma: " + s0.r + " m³ (" + ("0" + d0.getHours()).slice(-2) + ":" + ("0" + d0.getMinutes()).slice(-2) + ").";
    }
    run();
  }

  /* ---------- imza aracı: arıza seçici ---------- */
  var pk = $("[data-tool='ariza-secici']");
  if (pk) {
    var KINDS = {
      tikaniklik: {
        label: "Tıkanıklık",
        where: ["Lavabo", "Mutfak evyesi", "Klozet", "Duş ya da küvet gideri", "Banyo zemin süzgeci", "Balkon gideri"],
        sym: ["Su yavaş gidiyor", "Su hiç gitmiyor, birikiyor", "Giderden kötü koku geliyor", "Fokurdama sesi var", "Başka bir giderden su geri geliyor", "Kimyasal açıcı denedim"],
        photos: ["Suyun biriktiği yerin genel görüntüsü", "Gider ağzının yakın çekimi", "Lavabo ya da evye altındaki sifon ve borular", "Kullandıysanız açıcının ambalajı"]
      },
      kacak: {
        label: "Kaçak",
        where: ["Tavan", "Duvar", "Zemin ya da alt kat", "Lavabo ya da evye altı", "Görünen boru ya da bağlantı", "Sayaç çevresi"],
        sym: ["Damla damla akıyor", "Sürekli akıyor ya da fışkırıyor", "Islaklık, leke ya da kabarma var", "Su kullanılmıyorken sayaç ilerliyor", "Alt kattan su geldiği söylendi"],
        photos: ["Islak alanın genel görüntüsü (odanın neresi olduğu anlaşılsın)", "Leke, damla ya da sızıntının yakın çekimi", "Su sayacı (rakamlar okunacak şekilde)", "Yakındaki musluk, klozet ya da makine bağlantısı"]
      },
      musluk: {
        label: "Musluk ve batarya",
        where: ["Banyo lavabosu", "Mutfak", "Duş ya da küvet", "Balkon ya da bahçe musluğu", "Çamaşır makinesi musluğu"],
        sym: ["Kapalıyken damlatıyor", "Gövdesinden ya da dibinden sızıyor", "Kolu sert, gevşek ya da tam kapanmıyor", "Su ince ya da dağınık akıyor", "Sıcak-soğuk ayarı bozuk", "Bataryayı değiştirmek istiyorum"],
        photos: ["Musluğun ya da bataryanın tamamı", "Damlayan ya da sızan noktanın yakın çekimi", "Altındaki bağlantı hortumları ve ara musluklar", "Varsa takılmasını istediğiniz yeni batarya"]
      },
      klozet: {
        label: "Klozet ve rezervuar",
        where: ["Dış (görünen) rezervuar", "Gömme rezervuar", "Klozet", "Klozet dibi ve zemin"],
        sym: ["Rezervuar durmadan su dolduruyor", "Sifon zayıf çekiyor ya da hiç çekmiyor", "Basma düğmesi takılıyor", "Klozet dibinden su sızıyor", "Klozet tıkalı", "Klozet ya da rezervuarı değiştirmek istiyorum"],
        photos: ["Klozet ve rezervuarın genel görüntüsü", "Dış rezervuarda kapak açıkken iç düzen", "Gömme rezervuarda basma paneli", "Sızıntı varsa klozet dibi ve zemin", "Sürekli dolma sesi için kısa bir video"]
      }
    };
    var whereBox = $("[data-where]", pk), symBox = $("[data-symptoms]", pk), phBox = $("[data-photos]", pk);
    var msgEl = $("[data-msg]", pk), waBtn = $("[data-wa-out]", pk), cpBtn = $("[data-copy]", pk);
    var sumKind = $("[data-sum-kind]", pk), sumPh = $("[data-sum-ph]", pk);
    var nameIn = $("[data-name]", pk), placeIn = $("[data-place]", pk), noteIn = $("[data-note]", pk);
    function chips(box, name, list, type, checked) {
      box.innerHTML = list.map(function (t, i) {
        return "<label class=\"chip" + (type === "checkbox" ? " chip--check" : "") + "\"><input type=\"" + type + "\" name=\"" + name + "\" value=\"" + esc(t) + "\"" + (checked ? " checked" : "") + "><span>" + esc(t) + "</span></label>";
      }).join("");
    }
    function val(name) { var r = $("input[name='" + name + "']:checked", pk); return r ? r.value : ""; }
    function vals(name) { return $$("input[name='" + name + "']:checked", pk).map(function (r) { return r.value; }); }
    function setKind(k) {
      var K = KINDS[k]; if (!K) return;
      chips(whereBox, "where", K.where, "radio", false);
      chips(symBox, "sym", K.sym, "checkbox", false);
      chips(phBox, "ph", K.photos, "checkbox", true);
      build();
    }
    function mark(step, on) { var j = $("[data-step='" + step + "'] .joint", pk); if (j) j.classList.toggle("is-open", !!on); }
    function build() {
      var k = val("kind"), K = KINDS[k], lines = [];
      var where = val("where"), sym = vals("sym"), urg = val("urg"), off = $("[data-off]", pk).checked, when = val("when"), ph = vals("ph");
      var nm = nameIn.value.trim(), pl = placeIn.value.trim(), nt = noteIn.value.trim();
      mark(1, !!K); mark(2, !!where); mark(3, sym.length > 0); mark(4, !!urg); mark(5, !!K && (ph.length > 0 || nt));
      if (!K) {
        msgEl.textContent = "Merhaba Tesisat Hizmeti, bir tesisat arızası için yazıyorum.\n\n(Arıza türünü seçtiğinizde mesaj burada kendiliğinden yazılır.)";
        waBtn.href = waLink("Merhaba Tesisat Hizmeti, bir tesisat arızası için yazıyorum.");
        sumKind.textContent = "Seçilmedi"; sumPh.textContent = "-";
        return;
      }
      lines.push("Merhaba Tesisat Hizmeti, sitenizdeki arıza seçiciden yazıyorum.", "");
      lines.push("Arıza: " + K.label);
      if (where) lines.push("Yer: " + where);
      if (sym.length) lines.push("Belirti: " + sym.join("; "));
      var d = [];
      if (urg) d.push(urg + ".");
      if (off) d.push("Ana vanayı ya da ara musluğu kapattım.");
      if (d.length) lines.push("Durum: " + d.join(" "));
      if (when) lines.push("Uygun zaman: " + when);
      if (pl) lines.push("Adres / semt: " + pl);
      if (nt) lines.push("Not: " + nt);
      if (ph.length) { lines.push("", "Bu mesajın ardından şu fotoğrafları gönderiyorum:"); ph.forEach(function (p) { lines.push("- " + p); }); }
      if (nm) lines.push("", "Ad: " + nm);
      var text = lines.join("\n");
      msgEl.textContent = text;
      waBtn.href = waLink(text);
      sumKind.textContent = K.label + (where ? ", " + where.toLocaleLowerCase("tr-TR") : "");
      sumPh.textContent = ph.length ? ph.length + " fotoğraf" : "yok";
    }
    pk.addEventListener("change", function (e) {
      if (e.target.name === "kind") setKind(e.target.value); else build();
    });
    pk.addEventListener("input", function (e) { if (e.target.matches("input[type='text'], textarea")) build(); });
    cpBtn.addEventListener("click", function () { copyText(msgEl.textContent, cpBtn); });
    function fromHash() {
      var h = (location.hash || "").replace("#", "");
      var r = KINDS[h] && $("input[name='kind'][value='" + h + "']", pk);
      if (r && !r.checked) { r.checked = true; setKind(h); }
    }
    window.addEventListener("hashchange", fromHash);
    var pre = val("kind");
    if (pre) setKind(pre); else build();
    fromHash();
  }

  /* ---------- kopyala düğmeleri (genel) ---------- */
  $$("[data-copy-text]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b); });
  });
})();
