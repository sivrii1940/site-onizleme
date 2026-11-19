/* Petilya Pet Shop — site betiği (kütüphanesiz).
   Ortak alışveriş listesi tarayıcıda saklanır; hiçbir şey sunucuya gönderilmez.
   WhatsApp mesajı yalnız kullanıcı düğmeye bastığında açılır. */
(function () {
  "use strict";

  var HOURS = { "0": [["09:00", "21:00"]], "1": [["09:00", "21:00"]], "2": [["09:00", "21:00"]], "3": [["09:00", "21:00"]], "4": [["09:00", "21:00"]], "5": [["09:30", "21:00"]], "6": [["10:30", "21:00"]] };
  var WA = "https://wa.me/905057512643";
  var BRAND = "Petilya Pet Shop";
  var SPRITE = "img/stickers.svg#";
  var KEY = "petilya-liste-v1";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Açık/kapalı (kit/status.js kopyası) ---------- */
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

  /* ---------- Yardımcılar ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function icon(id, cls) { return '<svg class="' + (cls || "") + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><use href="' + SPRITE + id + '"/></svg>'; }
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  function copyText(txt, done) {
    function fallback() {
      var t = el("textarea"); t.value = txt; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(t); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function () { done(true); }, fallback);
    else fallback();
  }

  /* ---------- Raflar (katalog) ---------- */
  var ORDER = ["kedi", "kopek", "kus", "akvaryum", "genel"];
  var ANIMALS = {
    kedi: { name: "Kedi", who: "Kedim", icon: "s-cat", items: [
      ["kuru-mama", "Kuru mama", "s-bag"], ["yas-mama", "Yaş mama (konserve / pouch)", "s-can"], ["odul", "Ödül ve atıştırmalık", "s-treat"],
      ["malt", "Malt / tüy yumağı ürünü", "s-tube"], ["kum", "Kedi kumu", "s-litter"], ["kum-kabi", "Kum kabı ve kürek", "s-scoop"],
      ["tirmalama", "Tırmalama tahtası / ağacı", "s-post"], ["oyuncak", "Oyuncak", "s-yarn"], ["tarak", "Tarak / fırça", "s-comb"],
      ["tasima", "Taşıma çantası", "s-carrier"], ["kap", "Mama / su kabı", "s-bowl"], ["su-pinari", "Su pınarı", "s-fountain"],
      ["yatak", "Yatak / minder", "s-bed"], ["tirnak", "Tırnak makası", "s-scissors"], ["takviye", "Takviye (veteriner önerisiyle)", "s-tube"]],
      details: [{ k: "yas", l: "Yaş dönemi", o: ["Yavru", "Yetişkin", "Yaşlı"] }, { k: "durum", l: "Özel durum (varsa)", multi: true, o: ["Kısırlaştırılmış", "Hassas sindirim", "Veteriner önerili özel mama"] }] },
    kopek: { name: "Köpek", who: "Köpeğim", icon: "s-dog", items: [
      ["kuru-mama", "Kuru mama", "s-bag"], ["yas-mama", "Yaş mama", "s-can"], ["odul", "Ödül maması", "s-treat"], ["cigneme", "Çiğneme ürünü", "s-bone"],
      ["tasma", "Boyun tasması", "s-collar"], ["gogus", "Göğüs tasması", "s-harness"], ["kayis", "Gezdirme kayışı", "s-leash"], ["kunye", "Künye", "s-tagdisc"],
      ["diski", "Dışkı poşeti", "s-roll"], ["ped", "Çiş pedi", "s-pad"], ["sampuan", "Şampuan / bakım ürünü", "s-bottle"], ["oyuncak", "Oyuncak", "s-ball"],
      ["yatak", "Yatak / minder", "s-bed"], ["tasima", "Taşıma çantası / kafesi", "s-carrier"], ["kap", "Mama / su kabı", "s-bowl"], ["tarak", "Tarak / fırça", "s-comb"]],
      details: [{ k: "yas", l: "Yaş dönemi", o: ["Yavru", "Yetişkin", "Yaşlı"] }, { k: "boy", l: "Irk boyutu", o: ["Küçük ırk", "Orta ırk", "Büyük ırk"] }, { k: "durum", l: "Özel durum (varsa)", multi: true, o: ["Kısırlaştırılmış", "Hassas sindirim", "Veteriner önerili özel mama"] }] },
    kus: { name: "Kuş", who: "Kuşum", icon: "s-bird", items: [
      ["yem", "Kuş yemi", "s-millet"], ["kraker", "Kraker / ödül çubuğu", "s-seedbag"], ["kalamar", "Kalamar kemiği", "s-cuttle"], ["gaga", "Gaga taşı / mineral blok", "s-mineral"],
      ["kafes", "Kafes", "s-cage"], ["tunek", "Tünek", "s-perch"], ["yemlik", "Yemlik ve suluk", "s-bowl"], ["oyuncak", "Kuş oyuncağı", "s-ball"],
      ["taban", "Kafes tabanı kumu / kâğıdı", "s-gravel"], ["banyo", "Banyo kabı", "s-fountain"], ["ortu", "Kafes örtüsü", "s-pad"], ["vitamin", "Vitamin (veteriner önerisiyle)", "s-drop"]],
      details: [{ k: "tur", l: "Türü", o: ["Muhabbet kuşu", "Kanarya", "Sultan papağanı", "Başka bir tür"] }] },
    akvaryum: { name: "Akvaryum", who: "Akvaryumum", icon: "s-fish", items: [
      ["akvaryum", "Akvaryum", "s-tank"], ["filtre", "Filtre / hava motoru", "s-filter"], ["isitici", "Isıtıcı ve termometre", "s-thermo"], ["duzenleyici", "Su düzenleyici", "s-drop"],
      ["yem", "Balık yemi", "s-flakes"], ["zemin", "Kum / çakıl", "s-gravel"], ["bitki", "Bitki ve dekor", "s-plant"], ["isik", "Aydınlatma", "s-light"],
      ["sifon", "Sifon / temizlik", "s-siphon"], ["kepce", "Kepçe", "s-net"], ["test", "Su test kiti", "s-test"]],
      details: [{ k: "tip", l: "Akvaryum", o: ["Tatlı su", "Deniz (tuzlu su)", "Yeni kuruyorum"] }, { k: "litre", l: "Hacim (litre, biliyorsanız)", input: "number" }] },
    genel: { name: "Kasa önü", who: "Genel", icon: "s-paw", items: [
      ["tuy-rulo", "Tüy toplama rulosu", "s-lint"], ["mendil", "Evcil hayvanlara uygun ıslak mendil", "s-pad"], ["odul-canta", "Ödül çantası", "s-treat"],
      ["gezi-su", "Gezi su kabı", "s-fountain"], ["kunye", "Künye", "s-tagdisc"], ["diski", "Dışkı poşeti", "s-roll"]],
      details: [] }
  };
  function findItem(a, id) {
    var A = ANIMALS[a]; if (!A) return null;
    for (var i = 0; i < A.items.length; i++) if (A.items[i][0] === id) return A.items[i];
    return null;
  }
  function labelOf(it) { var f = findItem(it.a, it.id); return f ? f[1] : (it.l || it.id); }
  function iconOf(it) { var f = findItem(it.a, it.id); return f ? f[2] : "s-paw"; }

  /* ---------- Ortak liste deposu ---------- */
  var memory = null;
  function blank() { return { items: [], meta: {}, cur: "kedi", when: "", delivery: "", name: "", note: "" }; }
  function load() {
    if (memory) return memory;
    var st = null;
    try { st = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { st = null; }
    if (!st || !Array.isArray(st.items)) st = blank();
    var b = blank(); Object.keys(b).forEach(function (k) { if (st[k] == null) st[k] = b[k]; });
    st.items = st.items.filter(function (it) { return it && ANIMALS[it.a] && it.id; });
    memory = st; return st;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) { /* gizli pencere: yalnız bu sayfada kalır */ } }
  function idx(a, id) { var s = load(); for (var i = 0; i < s.items.length; i++) if (s.items[i].a === a && s.items[i].id === id) return i; return -1; }
  function has(a, id) { return idx(a, id) > -1; }
  function changed(why) { save(); document.dispatchEvent(new CustomEvent("list:change", { detail: why || {} })); }
  function addItem(a, id, l, silent) { if (has(a, id)) return false; var it = { a: a, id: id, q: 1 }; if (l) it.l = l; load().items.push(it); if (!silent) changed({ added: it }); return true; }
  function removeItem(a, id) { var i = idx(a, id); if (i > -1) { load().items.splice(i, 1); changed({ removed: true }); } }
  function toggleItem(a, id) { if (has(a, id)) { removeItem(a, id); return false; } addItem(a, id); return true; }
  function parseKey(k) { var p = String(k).split(":"); return { a: p[0], id: p[1] }; }

  /* ---------- Sayaçlar, düğmeler ---------- */
  function syncCounts(bump) {
    var n = load().items.length;
    $$("[data-count]").forEach(function (c) {
      c.textContent = n;
      if (bump && !reduce) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    });
    $$("[data-count-label]").forEach(function (c) { c.textContent = n ? n + " ürün" : "boş"; });
  }
  function syncAddButtons() {
    $$("[data-add]").forEach(function (b) { var k = parseKey(b.getAttribute("data-add")); b.setAttribute("aria-pressed", has(k.a, k.id) ? "true" : "false"); });
  }

  /* Kolajdaki çıkartma listeye "uçar" */
  function fly(from, iconId) {
    if (reduce || !from) return;
    var target = $("[data-pad]") || $(".mylist");
    if (!target) return;
    var r = from.getBoundingClientRect(), t = target.getBoundingClientRect();
    if (t.bottom < 0 || t.top > window.innerHeight) target = $(".dock__list") || target, t = target.getBoundingClientRect();
    var size = Math.min(r.width, 90);
    var f = el("div", { "class": "fly", "aria-hidden": "true" }, icon(iconId, "die"));
    f.style.left = (r.left + r.width / 2 - size / 2) + "px"; f.style.top = (r.top + 4) + "px"; f.style.width = size + "px"; f.style.height = size + "px";
    f.firstChild.style.width = "100%"; f.firstChild.style.height = "100%";
    document.body.appendChild(f);
    var dx = (t.left + Math.min(t.width, 160) / 2) - (r.left + r.width / 2), dy = (t.top + 30) - (r.top + 4 + size / 2);
    if (!f.animate) { f.remove(); return; }
    var an = f.animate([
      { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: "translate(" + dx * 0.45 + "px," + (dy * 0.45 - 70) + "px) scale(.8) rotate(-14deg)", opacity: 1, offset: 0.45 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.28) rotate(18deg)", opacity: 0.2 }
    ], { duration: 720, easing: "cubic-bezier(.45,.05,.55,1)" });
    an.onfinish = function () { f.remove(); };
  }

  function bindAdds() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-add]");
      if (!b) return;
      var k = parseKey(b.getAttribute("data-add"));
      var on = toggleItem(k.a, k.id);
      if (on) {
        var it = findItem(k.a, k.id);
        if (b.classList.contains("stk")) fly(b, it ? it[2] : "s-paw");
        var live = $("[data-live]");
        if (live) live.textContent = (it ? it[1] : "Ürün") + " (" + ANIMALS[k.a].name + ") listenize eklendi.";
      } else {
        var live2 = $("[data-live]");
        if (live2) live2.textContent = "Ürün listenizden çıkarıldı.";
      }
    });
  }

  /* Ana sayfadaki mini liste */
  function renderMiniPad() {
    var pad = $("[data-pad]"); if (!pad) return;
    var ol = $("ol", pad), st = load(), items = st.items.slice(-4);
    if (!st.items.length) {
      ol.innerHTML = '<li class="minipad__empty" style="animation:none">Henüz boş. Çıkartmalara dokunun.</li>';
      return;
    }
    ol.innerHTML = items.map(function (it) { return "<li>" + esc(labelOf(it)) + " <span style=\"color:var(--ink-2);font-weight:600\">(" + esc(ANIMALS[it.a].name.toLocaleLowerCase("tr")) + ")</span></li>"; }).join("");
    if (st.items.length > 4) ol.insertAdjacentHTML("beforeend", "<li style=\"animation:none\">… ve " + (st.items.length - 4) + " ürün daha</li>");
  }

  /* ---------- Menü ---------- */
  function bindMenu() {
    var top = $(".top"), btn = $(".menu-btn");
    if (!top || !btn) return;
    function set(open) { top.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open ? "true" : "false"); }
    btn.addEventListener("click", function () { set(!top.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && top.classList.contains("is-open")) { set(false); btn.focus(); } });
    document.addEventListener("click", function (e) { if (top.classList.contains("is-open") && !top.contains(e.target)) set(false); });
  }

  /* ---------- Canlı durum + bugün ---------- */
  function bindStatus() {
    var s = openStatus(HOURS);
    $$("[data-status]").forEach(function (e) {
      e.textContent = s.text;
      var w = e.closest(".status") || e.parentElement;
      if (w) w.classList.toggle("is-open", s.open);
    });
    $$("[data-d]").forEach(function (d) { d.classList.toggle("is-today", parseInt(d.getAttribute("data-d"), 10) === s.dayIndex); });
  }

  /* ---------- Raf kaydırma düğmeleri ---------- */
  function bindRails() {
    $$(".rail").forEach(function (r) {
      var t = $(".rail__track", r), p = $("[data-prev]", r), n = $("[data-next]", r);
      if (!t || !p || !n) return;
      function upd() { p.disabled = t.scrollLeft < 8; n.disabled = t.scrollLeft + t.clientWidth > t.scrollWidth - 8; }
      p.addEventListener("click", function () { t.scrollBy({ left: -t.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" }); });
      n.addEventListener("click", function () { t.scrollBy({ left: t.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" }); });
      t.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
    });
  }

  /* ---------- Mesaj kurucu ---------- */
  function metaText(a, st) {
    var m = st.meta[a] || {}, parts = [];
    (ANIMALS[a].details || []).forEach(function (d) {
      var v = m[d.k];
      if (Array.isArray(v)) { if (v.length) parts.push(v.join(", ")); }
      else if (v) parts.push(d.input === "number" ? v + " litre" : v);
    });
    return parts.join(", ");
  }
  function buildMessage(st) {
    var lines = ["Merhaba " + BRAND + ", web sitenizden yazıyorum."];
    if (!st.items.length) {
      lines.push("Bir ürünün stok durumunu ve fiyatını sormak istiyorum.");
    } else {
      lines.push("Aşağıdaki ürünler için stok ve fiyat bilgisi alabilir miyim?");
      ORDER.forEach(function (a) {
        var its = st.items.filter(function (it) { return it.a === a; });
        if (!its.length) return;
        var mt = metaText(a, st);
        lines.push("");
        lines.push((a === "genel" ? "Genel" : ANIMALS[a].who) + (mt ? " (" + mt + ")" : "") + ":");
        its.forEach(function (it) { lines.push("• " + labelOf(it) + (it.q > 1 ? " × " + it.q : "")); });
      });
    }
    var extra = [];
    if (st.when) extra.push("Mağazaya gelme zamanım: " + st.when);
    if (st.delivery === "Teslimat seçeneklerini öğrenmek istiyorum") extra.push("Teslimat seçenekleri hakkında da bilgi almak istiyorum.");
    else if (st.delivery) extra.push("Ürünleri mağazadan alacağım.");
    if (st.note && st.note.trim()) extra.push("Not: " + st.note.trim());
    if (st.name && st.name.trim()) extra.push("İsim: " + st.name.trim());
    if (extra.length) { lines.push(""); lines = lines.concat(extra); }
    lines.push(""); lines.push("Teşekkürler!");
    return lines.join("\n");
  }

  /* ---------- Liste oluşturucu (liste.html) ---------- */
  function bindBuilder() {
    var root = $("[data-builder]"); if (!root) return;
    var elAnimals = $("[data-animals]", root), elDetails = $("[data-details]", root), elNeeds = $("[data-needs]", root),
      elNeedTitle = $("[data-need-title]", root), elList = $("[data-list]", root), elMsg = $("[data-msg]", root),
      elWa = $$("[data-wa]", root), elToast = $("[data-toast]", root), elCustom = $("[data-custom]", root),
      elWhen = $("[data-when]", root), elDel = $("[data-delivery]", root), elName = $("[data-name]", root), elNote = $("[data-note]", root);
    var undo = null, toastT = 0;
    function toast(html) { elToast.innerHTML = html; clearTimeout(toastT); toastT = setTimeout(function () { elToast.innerHTML = ""; undo = null; }, 7000); }

    function refocus(group, text) {
      var box = $$(".opts[aria-label]", root).filter(function (b) { return b.getAttribute("aria-label") === group; })[0];
      if (!box) return;
      var btn = $$(".chip", box).filter(function (c) { return c.textContent === text; })[0];
      if (btn) btn.focus();
    }
    function chipGroup(box, opts, current, multi, onPick) {
      box.innerHTML = "";
      opts.forEach(function (o) {
        var on = multi ? (current || []).indexOf(o) > -1 : current === o;
        var b = el("button", { type: "button", "class": "chip", "aria-pressed": on ? "true" : "false" }, esc(o));
        b.addEventListener("click", function () { var g = box.getAttribute("aria-label"); onPick(o); refocus(g, o); });
        box.appendChild(b);
      });
    }
    function renderAnimals() {
      var st = load();
      elAnimals.innerHTML = "";
      ORDER.forEach(function (a) {
        var n = st.items.filter(function (it) { return it.a === a; }).length;
        var b = el("button", { type: "button", "class": "animal animal--" + a, "aria-pressed": st.cur === a ? "true" : "false", style: "--ac:var(--" + (a === "genel" ? "kasa" : a) + ")" },
          icon(ANIMALS[a].icon) + "<span>" + esc(ANIMALS[a].name) + "</span><span class=\"animal__n\" aria-label=\"" + n + " ürün\">" + (n || "") + "</span>");
        b.addEventListener("click", function () { st.cur = a; save(); renderAll(); var h = elNeedTitle; if (h && window.innerWidth < 1000) h.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); });
        elAnimals.appendChild(b);
      });
    }
    function renderDetails() {
      var st = load(), a = st.cur, A = ANIMALS[a];
      elNeedTitle.innerHTML = icon(A.icon) + esc(a === "genel" ? "Kasa önü rafı" : A.name + " rafı");
      elDetails.innerHTML = "";
      st.meta[a] = st.meta[a] || {};
      A.details.forEach(function (d) {
        var wrap = el("div", { "class": "field" });
        if (d.input) {
          var id = "f-" + a + "-" + d.k;
          wrap.innerHTML = '<label for="' + id + '">' + esc(d.l) + '</label><input id="' + id + '" type="number" inputmode="numeric" min="1" max="2000" placeholder="Örn. 60">';
          var inp = $("input", wrap); inp.value = st.meta[a][d.k] || "";
          inp.addEventListener("input", function () { st.meta[a][d.k] = inp.value.replace(/[^0-9]/g, "").slice(0, 4); save(); renderOut(); renderList(); });
        } else {
          wrap.innerHTML = "<h3 style=\"margin:4px 0 8px\">" + esc(d.l) + "</h3>";
          var box = el("div", { "class": "opts", role: "group", "aria-label": d.l });
          chipGroup(box, d.o, st.meta[a][d.k], d.multi, function (o) {
            if (d.multi) {
              var arr = st.meta[a][d.k] = st.meta[a][d.k] || [];
              var i = arr.indexOf(o); if (i > -1) arr.splice(i, 1); else arr.push(o);
            } else st.meta[a][d.k] = st.meta[a][d.k] === o ? "" : o;
            save(); renderDetails(); renderList(); renderOut();
          });
          wrap.appendChild(box);
        }
        elDetails.appendChild(wrap);
      });
      if (!A.details.length) elDetails.innerHTML = "<p style=\"margin:0\">Kasa önü rafı her dost için: küçük ama unutulmaması gereken şeyler.</p>";
      elNeeds.innerHTML = "";
      A.items.forEach(function (it) {
        var on = has(a, it[0]);
        var b = el("button", { type: "button", "class": "chip", "aria-pressed": on ? "true" : "false" }, esc(it[1]));
        b.addEventListener("click", function () { toggleItem(a, it[0]); refocus("Raftaki ürünler", it[1]); });
        elNeeds.appendChild(b);
      });
      st.items.filter(function (it) { return it.a === a && it.l; }).forEach(function (it) {
        var b = el("button", { type: "button", "class": "chip", "aria-pressed": "true" }, esc(it.l));
        b.addEventListener("click", function () { removeItem(a, it.id); });
        elNeeds.appendChild(b);
      });
    }
    function renderList() {
      var st = load();
      if (!st.items.length) { elList.innerHTML = '<p class="empty">Listeniz boş. Soldan dostunuzu seçip raftan ürün işaretleyin.</p>'; return; }
      var html = "";
      ORDER.forEach(function (a) {
        var its = st.items.filter(function (it) { return it.a === a; });
        if (!its.length) return;
        var mt = metaText(a, st);
        html += '<div class="list-group"><p class="list-group__h" style="margin:0">' + icon(ANIMALS[a].icon, "die") + esc(ANIMALS[a].name) + (mt ? ' <small style="font:700 .9rem/1.2 var(--body);color:var(--ink-2)">(' + esc(mt) + ")</small>" : "") + "</p><ol>";
        its.forEach(function (it) {
          var k = esc(it.a + ":" + it.id), nm = esc(labelOf(it));
          html += '<li class="li"><span class="li__name">' + nm + '</span><span class="qty"><button type="button" class="ibtn" data-q="-1" data-k="' + k + '" aria-label="' + nm + ' adedini azalt">' + icon("s-minus") + "</button><b aria-label=\"adet\">" + it.q + '</b><button type="button" class="ibtn" data-q="1" data-k="' + k + '" aria-label="' + nm + ' adedini artır">' + icon("s-plus") + '</button></span><button type="button" class="ibtn ibtn--x" data-rm="' + k + '" aria-label="' + nm + ' ürününü listeden çıkar">' + icon("s-x") + "</button></li>";
        });
        html += "</ol></div>";
      });
      elList.innerHTML = html;
    }
    function renderOut() {
      var st = load(), msg = buildMessage(st);
      elMsg.textContent = msg;
      elWa.forEach(function (w) { w.setAttribute("href", waHref(msg)); });
    }
    function renderExtras() {
      var st = load();
      chipGroup(elWhen, ["Bugün", "Yarın", "Hafta içi akşam", "Hafta sonu", "Henüz belli değil"], st.when, false, function (o) { st.when = st.when === o ? "" : o; save(); renderExtras(); renderOut(); });
      chipGroup(elDel, ["Mağazadan alırım", "Teslimat seçeneklerini öğrenmek istiyorum"], st.delivery, false, function (o) { st.delivery = st.delivery === o ? "" : o; save(); renderExtras(); renderOut(); });
    }
    function renderAll() { renderAnimals(); renderDetails(); renderList(); renderOut(); }

    elList.addEventListener("click", function (e) {
      var q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
      if (q) {
        var k = parseKey(q.getAttribute("data-k")), i = idx(k.a, k.id); if (i < 0) return;
        var it = load().items[i]; it.q = Math.max(1, Math.min(20, it.q + parseInt(q.getAttribute("data-q"), 10)));
        changed({ qty: true });
        var again = $('[data-q="' + q.getAttribute("data-q") + '"][data-k="' + q.getAttribute("data-k") + '"]', elList); if (again) again.focus();
      } else if (rm) {
        var k2 = parseKey(rm.getAttribute("data-rm")); removeItem(k2.a, k2.id);
        var first = $("button", elList); if (first) first.focus();
      }
    });
    var form = $("[data-custom-form]", root);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = elCustom.value.trim().replace(/\s+/g, " ").slice(0, 80);
      if (!v) { elCustom.focus(); return; }
      addItem(load().cur, "x" + Date.now().toString(36), v);
      elCustom.value = "";
    });
    elName.value = load().name || ""; elNote.value = load().note || "";
    elName.addEventListener("input", function () { load().name = elName.value.slice(0, 60); save(); renderOut(); });
    elNote.addEventListener("input", function () { load().note = elNote.value.slice(0, 400); save(); renderOut(); });
    $("[data-copy]", root).addEventListener("click", function () {
      copyText(buildMessage(load()), function (ok) { toast(ok ? "Mesaj kopyalandı. WhatsApp'a ya da SMS'e yapıştırabilirsiniz." : "Kopyalanamadı; mesajı elle seçip kopyalayın."); });
    });
    $("[data-clear]", root).addEventListener("click", function () {
      var st = load(); if (!st.items.length) { toast("Liste zaten boş."); return; }
      undo = JSON.parse(JSON.stringify(st.items)); st.items = []; changed({ cleared: true });
      toast('Liste temizlendi. <button type="button" class="btn btn--sm" data-undo style="margin-left:8px">Geri al</button>');
    });
    elToast.addEventListener("click", function (e) {
      if (e.target.closest("[data-undo]") && undo) { load().items = undo; undo = null; changed({ undo: true }); toast("Liste geri geldi."); }
    });
    document.addEventListener("list:change", function () { renderAll(); });
    renderAll(); renderExtras();
  }

  /* ---------- Rehber: "Verilir mi?" süzgeci ---------- */
  function bindFoodTool() {
    var root = $("[data-foodtool]"); if (!root) return;
    var items = $$(".food", root), q = $("[data-q]", root), found = $("[data-found]", root), cur = "hepsi";
    function norm(s) { return s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function run() {
      var term = norm(q.value.trim()), n = 0;
      items.forEach(function (it) {
        var ok = (cur === "hepsi" || (" " + it.getAttribute("data-who") + " ").indexOf(" " + cur + " ") > -1) && (!term || norm(it.textContent).indexOf(term) > -1);
        it.hidden = !ok; if (ok) n++;
      });
      found.textContent = n ? n + " madde gösteriliyor." : "Bu aramada madde yok. Emin değilseniz vermeyin ve veteriner hekiminize danışın.";
    }
    $$("[data-filter]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        cur = b.getAttribute("data-filter");
        $$("[data-filter]", root).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        run();
      });
    });
    q.addEventListener("input", run);
    run();
  }

  /* ---------- Rehber: mama geçiş planı ---------- */
  function bindPlanTool() {
    var root = $("[data-plantool]"); if (!root) return;
    var start = $("[data-start]", root), out = $("[data-plan]", root), len = 7;
    var PH = { 7: [[2, 3], [2, 2], [2, 1], [1, 0]], 10: [[3, 3], [3, 2], [3, 1], [1, 0]] };
    var WORD = { 3: "dörtte üç", 2: "yarı yarıya", 1: "dörtte bir", 0: "hiç" };
    var NEWW = { 3: "dörtte bir", 2: "yarı yarıya", 1: "dörtte üç", 0: "tamamı" };
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    var t = new Date(); start.value = t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
    function fmt(d) { try { return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" }); } catch (e) { return d.toDateString(); } }
    function run() {
      var p = (start.value || "").split("-"), d0 = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date();
      if (isNaN(d0)) d0 = new Date();
      var day = 0, html = "";
      PH[len].forEach(function (ph) {
        var from = new Date(d0); from.setDate(d0.getDate() + day);
        var to = new Date(d0); to.setDate(d0.getDate() + day + ph[0] - 1);
        var label = ph[1] === 0 ? fmt(from) + " ve sonrası" : (ph[0] > 1 ? fmt(from) + " – " + fmt(to) : fmt(from));
        var oldQ = ph[1], newQ = 4 - ph[1];
        html += '<li><span class="plan__day">' + esc(label) + '</span><span class="plan__bar" aria-hidden="true"><span class="plan__old" style="flex:' + oldQ + '"></span><span class="plan__new" style="flex:' + newQ + '"></span></span><span class="plan__txt">' +
          (oldQ === 0 ? "Yalnız yeni mama" : "Eski mama " + WORD[oldQ] + ", yeni mama " + NEWW[oldQ]) + "</span></li>";
        day += ph[0];
      });
      out.innerHTML = html;
    }
    $$("[data-len]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        len = parseInt(b.getAttribute("data-len"), 10);
        $$("[data-len]", root).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        run();
      });
    });
    start.addEventListener("change", run);
    run();
  }

  /* ---------- Rehber: yeni dost kontrol listesi → alışveriş listesi ---------- */
  function bindCheckTool() {
    var root = $("[data-checktool]"); if (!root) return;
    var tabs = $$("[data-ctab]", root), panels = $$("[data-cpanel]", root), msg = $("[data-check-msg]", root);
    function show(a) {
      tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-ctab") === a ? "true" : "false"); });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-cpanel") !== a; });
    }
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-ctab")); }); });
    show(tabs[0].getAttribute("data-ctab"));
    $("[data-check-add]", root).addEventListener("click", function () {
      var n = 0;
      $$("input[data-item]:checked", root).forEach(function (c) { var k = parseKey(c.getAttribute("data-item")); if (addItem(k.a, k.id, null, true)) n++; });
      changed({ bulk: n });
      msg.innerHTML = n ? n + ' ürün listenize eklendi. <a href="liste.html">Listeye gidin</a>' : "İşaretli yeni ürün yok; işaretlediklerinizin hepsi zaten listenizde olabilir.";
    });
  }

  /* ---------- İletişim: mesaj aracı ---------- */
  function bindMsgTool() {
    var root = $("[data-msgtool]"); if (!root) return;
    var topic = "Stok sorusu", topics = $$("[data-topic]", root), name = $("[data-mname]", root), txt = $("[data-mtext]", root),
      out = $("[data-mout]", root), wa = $("[data-mwa]", root), note = $("[data-mnote]", root);
    var INTRO = {
      "Stok sorusu": "Bir ürünün stokta olup olmadığını sormak istiyorum.",
      "Ürün önerisi": "Dostum için uygun ürün seçerken yardımınızı rica ediyorum.",
      "Teslimat bilgisi": "Teslimat seçenekleriniz hakkında bilgi almak istiyorum.",
      "Diğer": "Bir konuda bilgi almak istiyorum."
    };
    function build() {
      var l = ["Merhaba " + BRAND + ", web sitenizden yazıyorum.", "Konu: " + topic, INTRO[topic]];
      if (txt.value.trim()) l.push("", txt.value.trim());
      if (name.value.trim()) l.push("", "İsim: " + name.value.trim());
      l.push("", "Teşekkürler!");
      return l.join("\n");
    }
    function run() { var m = build(); out.textContent = m; wa.setAttribute("href", waHref(m)); }
    topics.forEach(function (b) {
      b.addEventListener("click", function () {
        topic = b.getAttribute("data-topic");
        topics.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        run();
      });
    });
    name.addEventListener("input", run); txt.addEventListener("input", run);
    $("[data-mcopy]", root).addEventListener("click", function () { copyText(build(), function (ok) { note.textContent = ok ? "Mesaj kopyalandı." : "Kopyalanamadı; mesajı elle seçip kopyalayın."; }); });
    run();
  }

  /* ---------- Başlat ---------- */
  document.addEventListener("list:change", function (e) {
    syncCounts(!!(e.detail && (e.detail.added || e.detail.bulk)));
    syncAddButtons(); renderMiniPad();
  });
  function init() {
    load();
    bindStatus(); bindMenu(); bindRails(); bindAdds();
    syncCounts(false); syncAddButtons(); renderMiniPad();
    bindBuilder(); bindFoodTool(); bindPlanTool(); bindCheckTool(); bindMsgTool();
    window.addEventListener("storage", function (e) { if (e.key === KEY) { memory = null; document.dispatchEvent(new CustomEvent("list:change", { detail: {} })); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
