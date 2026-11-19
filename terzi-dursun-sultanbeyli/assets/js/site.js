/* Terzi Dursun — site.js
   Canlı açık/kapalı durumu, menü, emanet fişi (üç tezgâh sekmesi), paça, ölçü, leke, ütü ısısı,
   kurumsal teklif fişi, gün seçici, hazır mesajlar, kontrol fişleri. Hiçbir veri sunucuya gitmez. */
(function () {
  "use strict";
  var d = document;
  d.documentElement.classList.add("js");

  var WA = "https://wa.me/905413993958";
  var HOURS = { "0": [["09:00", "20:00"]], "2": [["09:00", "20:00"]], "3": [["09:00", "20:00"]], "4": [["09:00", "20:00"]], "5": [["09:00", "20:00"]], "6": [["09:00", "20:00"]] };
  var DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  /* --- kit/status.js'ten kopya --- */
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

  /* --- yardımcılar --- */
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function store(k, v) {
    try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) { /* gizli sekme vb. */ }
    return null;
  }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function pad(x) { return (x < 10 ? "0" : "") + x; }
  function draftNo(key) {
    var n = new Date(), today = pad(n.getDate()) + pad(n.getMonth() + 1), saved = store("td-" + key);
    if (saved && saved.indexOf(today + "-") === 0) return saved;
    var v = today + "-" + (100 + Math.floor(Math.random() * 900));
    store("td-" + key, v);
    return v;
  }
  function copyText(text, btn) {
    function fallback() {
      var ta = d.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0"; d.body.appendChild(ta); ta.select();
      var ok = false; try { ok = d.execCommand("copy"); } catch (e) { ok = false; }
      d.body.removeChild(ta); return ok;
    }
    function done(ok) {
      if (!btn) return;
      var t = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", t);
      btn.textContent = ok ? "Kopyalandı" : "Kopyalanamadı";
      setTimeout(function () { btn.textContent = t; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback()); });
    } else { done(fallback()); }
  }
  function num(inp, min) { var v = parseInt(inp && inp.value, 10); return isNaN(v) || v < (min || 0) ? (min || 0) : v; }

  /* --- canlı durum --- */
  function paintStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (el) { el.textContent = s.text; el.classList.toggle("is-open", s.open); });
    $$("[data-day]").forEach(function (el) { el.classList.toggle("is-today", parseInt(el.getAttribute("data-day"), 10) === s.dayIndex); });
    return s;
  }
  var NOW = paintStatus();
  setInterval(paintStatus, 60000);

  /* --- menü --- */
  var mb = $(".menu-btn"), nav = $("#nav");
  if (mb && nav) {
    var setMenu = function (open) { nav.classList.toggle("is-open", open); mb.setAttribute("aria-expanded", open ? "true" : "false"); };
    mb.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); mb.focus(); } });
    d.addEventListener("click", function (e) { if (nav.classList.contains("is-open") && !nav.contains(e.target) && !mb.contains(e.target)) setMenu(false); });
  }

  /* --- sekmeler --- */
  function tabs(list, onChange) {
    var ts = $$('[role="tab"]', list);
    function show(t) { ts.forEach(function (x) { var p = d.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = x !== t; }); }
    function sel(t, focus) {
      ts.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; });
      show(t); if (focus) t.focus(); if (onChange) onChange(t);
    }
    ts.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var j;
        if (e.key === "ArrowRight") j = (i + 1) % ts.length;
        else if (e.key === "ArrowLeft") j = (i - 1 + ts.length) % ts.length;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = ts.length - 1;
        else return;
        e.preventDefault(); sel(ts[j], true);
      });
    });
    show(ts.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || ts[0]);
  }

  /* --- İMZA: emanet fişi (ana sayfa) --- */
  var fis = $('[data-tool="emanet-fisi"]');
  if (fis) {
    var swing = fis.closest("[data-swing]");
    var draft = draftNo("fis");
    $$("[data-draft]", fis).forEach(function (e) { e.textContent = draft; });
    var note = $("[data-note]", fis), msgEl = $("[data-msg]", fis), waBtn = $("[data-wa]", fis);
    var sway = function (cls) {
      if (!swing || reduce) return;
      swing.classList.remove(cls); void swing.offsetWidth; swing.classList.add(cls);
      setTimeout(function () { swing.classList.remove(cls); }, 1200);
    };
    tabs($('[role="tablist"]', fis), function () { sway("is-sway"); });
    var build = function () {
      var parts = [], total = 0;
      $$("[data-group]", fis).forEach(function (pan) {
        var lines = [], cnt = 0;
        $$("[data-item]", pan).forEach(function (row) {
          var n = num($("input", row));
          row.classList.toggle("is-on", n > 0);
          if (n > 0) { lines.push("- " + row.getAttribute("data-item") + " × " + n); cnt += n; }
        });
        var c = $('[data-cnt="' + pan.getAttribute("data-key") + '"]', fis);
        if (c) c.textContent = cnt ? cnt + " parça" : "";
        total += cnt;
        if (lines.length) parts.push(pan.getAttribute("data-group") + ":\n" + lines.join("\n"));
      });
      var m = "Merhaba Terzi Dursun, sitenizdeki emanet fişinden yazıyorum.\nTaslak fiş: " + draft + "\n\n";
      m += parts.length ? parts.join("\n\n") + "\n" : "Henüz parça seçmedim; genel bilgi almak istiyorum.\n";
      var nt = note.value.trim();
      if (nt) m += "\nNot: " + nt + "\n";
      m += "\nFiyat ve teslim günü hakkında bilgi alabilir miyim?";
      msgEl.textContent = m;
      waBtn.href = waHref(m);
      return m;
    };
    fis.addEventListener("click", function (e) {
      var b = e.target.closest("[data-d]");
      if (!b) return;
      var inp = $("input", b.closest("[data-item]"));
      inp.value = Math.max(0, Math.min(999, num(inp) + parseInt(b.getAttribute("data-d"), 10)));
      build();
    });
    fis.addEventListener("input", build);
    $("[data-copy]", fis).addEventListener("click", function () { copyText(build(), this); });
    waBtn.addEventListener("click", function () { build(); sway("is-torn"); });
    build();
    setTimeout(function () { sway("is-sway"); }, 350);
  }

  /* --- paça kırılma aracı --- */
  var paca = $('[data-tool="paca"]');
  if (paca) {
    var pcur = 1;
    var pBuild = function () {
      $$(".leg", paca).forEach(function (g) { g.classList.toggle("is-on", parseInt(g.getAttribute("data-k"), 10) === pcur); });
      $$("button[data-k]", paca).forEach(function (b) { b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-k"), 10) === pcur ? "true" : "false"); });
      $$("[data-ktext]", paca).forEach(function (el) { el.hidden = parseInt(el.getAttribute("data-ktext"), 10) !== pcur; });
      var name = $('button[data-k="' + pcur + '"]', paca).textContent.trim();
      var tur = $("[data-paca-tur]", paca).value, ad = num($("[data-paca-adet]", paca), 1);
      var m = "Merhaba Terzi Dursun, paça kısaltma için yazıyorum.\n" + tur + " × " + ad + "\nİstediğim boy: " + name.toLocaleLowerCase("tr-TR") + "\nProva için hangi gün gelebilirim?";
      $("[data-msg]", paca).textContent = m;
      $("[data-wa]", paca).href = waHref(m);
    };
    paca.addEventListener("click", function (e) { var b = e.target.closest("button[data-k]"); if (b) { pcur = parseInt(b.getAttribute("data-k"), 10); pBuild(); } });
    paca.addEventListener("input", pBuild);
    paca.addEventListener("change", pBuild);
    pBuild();
  }

  /* --- ölçü fişi --- */
  var olcu = $('[data-tool="olcu"]');
  if (olcu) {
    var hi = function (key) {
      $$("[data-m]", olcu).forEach(function (li) { li.classList.toggle("is-on", li.getAttribute("data-m") === key); });
      $$("[data-for]", olcu).forEach(function (el) { el.classList.toggle("is-on", el.getAttribute("data-for") === key); });
    };
    var oBuild = function () {
      var lines = [];
      $$("[data-m]", olcu).forEach(function (li) {
        var v = $("input", li).value.trim();
        if (v) lines.push("- " + $("label", li).textContent.trim() + ": " + v.replace(".", ",") + " cm");
      });
      var nt = $("[data-olcu-note]", olcu).value.trim();
      var m = "Merhaba Terzi Dursun, ölçülerimi gönderiyorum.\n" + (lines.length ? lines.join("\n") : "(Henüz ölçü yazmadım.)") + (nt ? "\nNot: " + nt : "") + "\nBu ölçülerle hangi işi yaptırabileceğimi konuşmak istiyorum.";
      $("[data-msg]", olcu).textContent = m;
      $("[data-wa]", olcu).href = waHref(m);
      return m;
    };
    olcu.addEventListener("focusin", function (e) { var li = e.target.closest("[data-m]"); if (li) hi(li.getAttribute("data-m")); });
    olcu.addEventListener("click", function (e) { var li = e.target.closest("[data-m]"); if (li) hi(li.getAttribute("data-m")); });
    olcu.addEventListener("input", oBuild);
    $("[data-copy]", olcu).addEventListener("click", function () { copyText(oBuild(), this); });
    hi("omuz"); oBuild();
  }

  /* --- leke fişi --- */
  var leke = $('[data-tool="leke"]');
  if (leke) {
    var lcur = "kahve";
    var lBuild = function () {
      $$("button[data-leke]", leke).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-leke") === lcur ? "true" : "false"); });
      $$("[data-leke-card]", leke).forEach(function (c) { c.hidden = c.getAttribute("data-leke-card") !== lcur; });
      var name = $('button[data-leke="' + lcur + '"]', leke).textContent.trim();
      var parca = $("[data-lparca]", leke).value, zaman = $("[data-lzaman]", leke).value, nt = $("[data-lnot]", leke).value.trim();
      var m = "Merhaba Terzi Dursun, " + parca.toLocaleLowerCase("tr-TR") + " üzerinde leke var.\nLeke: " + name + "\nNe zaman oldu: " + zaman + (nt ? "\nNot: " + nt : "") + "\nTemizlik için bilgi alabilir miyim? Fotoğrafını da gönderebilirim.";
      $("[data-msg]", leke).textContent = m;
      $("[data-wa]", leke).href = waHref(m);
      return m;
    };
    leke.addEventListener("click", function (e) { var b = e.target.closest("button[data-leke]"); if (b) { lcur = b.getAttribute("data-leke"); lBuild(); } });
    leke.addEventListener("input", lBuild);
    leke.addEventListener("change", lBuild);
    $("[data-copy]", leke).addEventListener("click", function () { copyText(lBuild(), this); });
    lBuild();
  }

  /* --- ütü ısısı --- */
  var isi = $('[data-tool="isi"]');
  if (isi) {
    var FAB = {
      pamuk: [3, "En fazla 200 °C", "Hafif nemliyken ütülemek kırışığı kolay açar. Koyu renkleri tersinden ütüleyin."],
      keten: [3, "En fazla 200 °C", "Nemliyken ve buharla ütüleyin; parlamaması için tersinden çalışın."],
      yun: [2, "En fazla 150 °C", "Ütüyü doğrudan değdirmeyin: araya nemli bir bez koyup bastırarak ütüleyin. Sürtmek parlatır."],
      ipek: [2, "En fazla 150 °C", "Düşük ayardan başlayın, tersinden ütüleyin; su püskürtmeyin, damla izi kalabilir."],
      polyester: [2, "En fazla 150 °C", "Yüksek ısı parlatır, eritebilir. Tersinden ve orta ayarda."],
      viskon: [2, "En fazla 150 °C", "Tersinden ve hafif nemliyken ütüleyin; ıslakken çekiştirmeyin."],
      akrilik: [1, "En fazla 110 °C", "Düşük ısı. Buhar sentetik lifleri bozabilir; çoğu zaman buharsız ütülenir."],
      naylon: [1, "En fazla 110 °C", "Düşük ısı ve tersinden; yüksek ısıda erir."],
      asetat: [1, "En fazla 110 °C", "Kuruyken, tersinden ve araya bez koyarak ütüleyin."]
    };
    var icur = "pamuk";
    var iBuild = function () {
      var f = FAB[icur];
      $$("button[data-kumas]", isi).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-kumas") === icur ? "true" : "false"); });
      $$(".dot", isi).forEach(function (c, i) { c.classList.toggle("is-on", i < f[0]); });
      $("[data-isi-ad]", isi).textContent = $('button[data-kumas="' + icur + '"]', isi).textContent.trim() + ": " + f[0] + " nokta";
      $("[data-isi-deg]", isi).textContent = f[1];
      $("[data-isi-tip]", isi).textContent = f[2];
    };
    isi.addEventListener("click", function (e) { var b = e.target.closest("button[data-kumas]"); if (b) { icur = b.getAttribute("data-kumas"); iBuild(); } });
    iBuild();
  }

  /* --- İMZA: kurumsal teklif fişi --- */
  var tk = $('[data-tool="teklif"]');
  if (tk) {
    var tdraft = "K-" + draftNo("teklif");
    $$("[data-tdraft]", tk).forEach(function (e) { e.textContent = tdraft; });
    var list = $("[data-items]", tk), tarih = $("[data-tarih]", tk);
    var nowD = new Date();
    tarih.min = nowD.getFullYear() + "-" + pad(nowD.getMonth() + 1) + "-" + pad(nowD.getDate());
    var rowId = 0;
    var addRow = function (name, qty, focus) {
      rowId++;
      var li = d.createElement("li");
      li.innerHTML = '<label class="sr" for="k' + rowId + '">Kalem</label><input class="field" id="k' + rowId + '" data-kname placeholder="Kalem adı" list="kalem-oneri">' +
        '<label class="sr" for="a' + rowId + '">Adet</label><input class="field" id="a' + rowId + '" data-kqty type="number" inputmode="numeric" min="1" placeholder="Adet">' +
        '<button type="button" class="icon-btn" data-del aria-label="Bu kalemi sil">×</button>';
      $("[data-kname]", li).value = name || "";
      if (qty) $("[data-kqty]", li).value = qty;
      list.appendChild(li);
      if (focus) $(name ? "[data-kqty]" : "[data-kname]", li).focus();
      tBuild();
    };
    var fmtDate = function (v) {
      if (!v) return null;
      var p = v.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
      return { dt: dt, text: dt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) + ", " + DAYS[(dt.getDay() + 6) % 7], sali: dt.getDay() === 2 };
    };
    var setDD = function (key, val) {
      var el = $('[data-out="' + key + '"]', tk);
      if (!el) return;
      el.classList.toggle("empty", !val);
      el.textContent = val || el.getAttribute("data-empty");
    };
    var tBuild = function () {
      var turs = $$("[data-tur] [aria-pressed='true']", tk).map(function (b) { return b.textContent.trim(); });
      var items = [];
      $$("li", list).forEach(function (li) {
        var n = $("[data-kname]", li).value.trim(), q = num($("[data-kqty]", li));
        if (n || q) items.push((n || "Kalem") + (q ? ": " + q + " adet" : ": adet belirtilmedi"));
      });
      var firma = $("[data-firma]", tk).value.trim(), yet = $("[data-yetkili]", tk).value.trim(), nt = $("[data-tnot]", tk).value.trim();
      var dt = fmtDate(tarih.value);
      $("[data-sali]", tk).hidden = !(dt && dt.sali);
      var past = dt && dt.dt < new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate());
      $("[data-tarih-hint]", tk).textContent = dt ? (past ? "Bu tarih geçmişte kaldı; ileri bir gün seçin." : "Seçilen gün: " + dt.text + ". Uygunluk görüşmede netleşir.") : "İstediğiniz tarihi seçin; uygunluk görüşmede netleşir.";
      setDD("firma", firma); setDD("yetkili", yet); setDD("tur", turs.join(", "));
      setDD("kalem", items.join("\n")); setDD("tarih", dt ? dt.text : ""); setDD("not", nt);
      var m = "Merhaba Terzi Dursun, sitenizdeki teklif fişinden yazıyorum.\nTeklif fişi: " + tdraft + "\n";
      if (firma) m += "Firma / otel: " + firma + "\n";
      if (yet) m += "Yetkili: " + yet + "\n";
      m += "İş türü: " + (turs.length ? turs.join(", ") : "belirtilmedi") + "\n";
      m += items.length ? "Kalemler:\n- " + items.join("\n- ") + "\n" : "Kalemler: henüz yazılmadı\n";
      m += "İstenen teslim tarihi: " + (dt ? dt.text : "belirtilmedi") + "\n";
      if (nt) m += "Not: " + nt + "\n";
      m += "Fiyat ve takvim için dönüşünüzü rica ederim.";
      $("[data-msg]", tk).textContent = m;
      $("[data-wa]", tk).href = waHref(m);
      tk.setAttribute("data-ready", turs.length || items.length ? "1" : "0");
      if (turs.length || items.length) $("[data-need]", tk).hidden = true;
      return m;
    };
    $("[data-tur]", tk).addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); tBuild();
    });
    $("[data-quick]", tk).addEventListener("click", function (e) {
      var b = e.target.closest("button[data-q]"); if (!b) return;
      var name = b.getAttribute("data-q"), found = null;
      $$("li", list).forEach(function (li) { if ($("[data-kname]", li).value.trim().toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")) found = li; });
      if (found) { $("[data-kqty]", found).focus(); return; }
      var empty = $$("li", list).filter(function (li) { return !$("[data-kname]", li).value.trim() && !$("[data-kqty]", li).value; })[0];
      if (empty) { $("[data-kname]", empty).value = name; $("[data-kqty]", empty).focus(); tBuild(); }
      else addRow(name, "", true);
    });
    $("[data-add]", tk).addEventListener("click", function () { addRow("", "", true); });
    list.addEventListener("click", function (e) {
      var b = e.target.closest("[data-del]"); if (!b) return;
      var li = b.closest("li"); li.parentNode.removeChild(li);
      if (!$$("li", list).length) addRow("", "");
      tBuild();
    });
    tk.addEventListener("input", tBuild);
    tk.addEventListener("change", tBuild);
    $("[data-wa]", tk).addEventListener("click", function (e) {
      tBuild();
      if (tk.getAttribute("data-ready") !== "1") { e.preventDefault(); var w = $("[data-need]", tk); w.hidden = false; $("[data-tur] button", tk).focus(); }
    });
    $("[data-copy]", tk).addEventListener("click", function () { copyText(tBuild(), this); });
    var pr = $("[data-print]", tk);
    if (pr) pr.addEventListener("click", function () { tBuild(); window.print(); });
    addRow("", "");
  }

  /* --- gün seçici --- */
  var gun = $('[data-tool="gun"]');
  if (gun) {
    var gBuild = function (i) {
      $$("button[data-g]", gun).forEach(function (b) {
        var k = parseInt(b.getAttribute("data-g"), 10);
        b.setAttribute("aria-pressed", k === i ? "true" : "false");
        b.classList.toggle("is-today", k === NOW.dayIndex);
      });
      var r = HOURS[String(i)], today = i === NOW.dayIndex;
      var out = $("[data-gun-out]", gun);
      out.innerHTML = "";
      var b = d.createElement("b"); b.textContent = DAYS[i] + (today ? " (bugün)" : "");
      var s = d.createElement("span");
      if (r) { s.textContent = "Açık: " + r[0][0] + "–" + r[0][1] + (today ? " · " + openStatus(HOURS).text : ""); }
      else { s.className = "stamp"; s.textContent = "Kapalı"; }
      out.appendChild(b); out.appendChild(s);
      var tip = $("[data-gun-tip]", gun);
      tip.textContent = r ? "Prova ya da teslim için gelmeden önce aramanız, beklemeden işinizi halletmenizi kolaylaştırır." : "Salı günleri dükkân kapalı. WhatsApp mesajınızı yine de bırakabilir, gelmek için başka bir gün seçebilirsiniz.";
    };
    gun.addEventListener("click", function (e) { var b = e.target.closest("button[data-g]"); if (b) gBuild(parseInt(b.getAttribute("data-g"), 10)); });
    gBuild(NOW.dayIndex);
  }

  /* --- hazır mesajlar --- */
  var hz = $('[data-tool="hazir"]');
  if (hz) {
    var ta = $("[data-hz-text]", hz);
    var hBuild = function () { $("[data-wa]", hz).href = waHref(ta.value.trim() || "Merhaba Terzi Dursun."); };
    hz.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-preset]"); if (!b) return;
      $$("button[data-preset]", hz).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      ta.value = b.getAttribute("data-preset"); hBuild();
    });
    ta.addEventListener("input", hBuild);
    $("[data-copy]", hz).addEventListener("click", function () { copyText(ta.value, this); });
    hBuild();
  }

  /* --- kontrol fişleri (yalnız bu cihazda) --- */
  $$("[data-check]").forEach(function (ul) {
    var key = "td-check-" + ul.getAttribute("data-check"), boxes = $$("input[type=checkbox]", ul);
    var root = ul.closest("[data-tool]") || ul.parentNode, cnt = $("[data-check-count]", root);
    var saved = (store(key) || "").split("");
    boxes.forEach(function (b, i) { b.checked = saved[i] === "1"; });
    var upd = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (cnt) cnt.textContent = n + "/" + boxes.length;
      store(key, boxes.map(function (b) { return b.checked ? "1" : "0"; }).join(""));
    };
    ul.addEventListener("change", upd); upd();
  });

  /* --- adres kopyala --- */
  $$("[data-copy-text]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy-text"), b); });
  });
})();
