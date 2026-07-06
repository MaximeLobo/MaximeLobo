/* =========================================================
   PRO TRADER — config + comportements partagés (3 pages)
   👉 POUR CHANGER LES LIENS (toi ou un collègue) : modifie UNIQUEMENT le bloc CONFIG ci-dessous.
   ========================================================= */
(function () {
  "use strict";

  /* ⚙️ TES LIENS / CODES — le seul endroit à modifier */
  var CONFIG = {
    tradequo : "https://my.tradequo.com/register?referral=019e8e96-5023-7169-93e5-2cd846dbb329",
    protrader: "https://app.myprotrader.app/",
    instagram: "https://instagram.com/MaximeLobo_",
    startCode: "STARTBOOST"
  };

  function showAll(){ try { document.querySelectorAll(".reveal").forEach(function(r){ r.classList.add("in"); }); } catch(e){} }
  setTimeout(showAll, 1500); /* filet anti écran blanc */

  function init(){
    try {
      /* liens dynamiques */
      document.querySelectorAll("[data-link]").forEach(function(a){
        var url = CONFIG[a.dataset.link];
        if (url) { a.setAttribute("href", url); }
        else { a.removeAttribute("href"); a.classList.add("disabled-link"); a.setAttribute("aria-disabled","true"); }
      });

      /* codes affichés (ex : STARTBOOST) */
      document.querySelectorAll("[data-code]").forEach(function(el){
        var v = CONFIG[el.dataset.code];
        if (v) el.textContent = v;
      });

      /* boutons « Copier » */
      document.querySelectorAll(".code-copy[data-code-for]").forEach(function(btn){
        var codeEl = document.getElementById(btn.dataset.codeFor);
        btn.addEventListener("click", function(){
          var code = codeEl ? codeEl.textContent.trim() : "";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).catch(function(){ fallbackCopy(code); });
          } else { fallbackCopy(code); }
          var original = btn.innerHTML;
          btn.classList.add("copied");
          btn.innerHTML = "✓ Copié !";
          setTimeout(function(){ btn.classList.remove("copied"); btn.innerHTML = original; }, 1800);
        });
      });
      function fallbackCopy(code){
        var t = document.createElement("textarea");
        t.value = code; t.setAttribute("readonly",""); t.style.position="fixed"; t.style.top="-9999px";
        document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); } catch(_){}
        document.body.removeChild(t);
      }

      /* vidéos : on ne charge le lecteur YouTube qu'au clic */
      document.querySelectorAll(".vid[data-yt]").forEach(function(v){
        var btn = v.querySelector(".vid-btn");
        if (!btn) return;
        btn.addEventListener("click", function(){
          var f = document.createElement("iframe");
          f.src = "https://www.youtube-nocookie.com/embed/" + v.dataset.yt + "?rel=0&playsinline=1&autoplay=1" + (v.dataset.start ? ("&start=" + v.dataset.start) : "");
          f.title = "Vidéo explicative Pro Trader";
          f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
          f.setAttribute("allowfullscreen","");
          v.innerHTML = ""; v.appendChild(f);
        });
      });

      /* svg non focusables */
      document.querySelectorAll("svg").forEach(function(s){ s.setAttribute("aria-hidden","true"); s.setAttribute("focusable","false"); });

      /* apparition au scroll */
      var reveals = document.querySelectorAll(".reveal");
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
        }, { threshold:.12 });
        reveals.forEach(function(r){ io.observe(r); });
      } else { showAll(); }

      /* compteurs animés (.count[data-to]) */
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      function fmtNum(v, dec, pre, suf){
        return (pre||"") + Number(v).toLocaleString("fr-FR", { minimumFractionDigits:dec, maximumFractionDigits:dec }) + (suf||"");
      }
      function runCount(el){
        var to = parseFloat(el.dataset.to || "0"),
            dec = parseInt(el.dataset.dec || "0", 10),
            pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", dur = 1100, t0 = null;
        function finalize(){ el.textContent = fmtNum(to, dec, pre, suf); }
        if (reduce) { finalize(); return; }
        function step(ts){
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmtNum(to * e, dec, pre, suf);
          if (p < 1) requestAnimationFrame(step); else finalize();
        }
        requestAnimationFrame(step);
        /* filet : garantit la valeur finale même si requestAnimationFrame est throttlé (onglet non visible) */
        setTimeout(finalize, dur + 400);
      }
      var counters = document.querySelectorAll(".count");
      function startCount(el){ if (el._c) return; el._c = true; runCount(el); }
      if ("IntersectionObserver" in window) {
        var co = new IntersectionObserver(function(entries){
          entries.forEach(function(en){ if (en.isIntersecting) { startCount(en.target); co.unobserve(en.target); } });
        }, { threshold:.25 });
        counters.forEach(function(c){ co.observe(c); });
      } else { counters.forEach(startCount); }
      /* filet : si l'observer ne se déclenche pas (onglet en arrière-plan), on affiche quand même les valeurs */
      setTimeout(function(){ counters.forEach(startCount); }, 1600);

      /* année du footer */
      var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    } catch (err) {
      console.error("[Pro Trader] init :", err);
      document.documentElement.classList.remove("js");
      showAll();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/* ============================================================
   HERO — graphique de trading animé (fluide, continu)
   Présent si la page contient <canvas id="heroChart">.
   ============================================================ */
(function () {
  "use strict";
  function boot() {
    var c = document.getElementById("heroChart");
    if (!c) return;
    var ctx = c.getContext("2d"),
        DPR = Math.min(window.devicePixelRatio || 1, 2),
        W = 0, H = 0;
    function resize() {
      W = c.clientWidth; H = c.clientHeight;
      c.width = Math.max(1, Math.round(W * DPR));
      c.height = Math.max(1, Math.round(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var VIS = 46, arr = [], price = 100, drift = 0.5;
    function make() {
      var o = price, mv = (Math.random() - 0.5) * 6 + drift;
      price += mv;
      if (price > 185) drift = -0.5;
      if (price < 55) drift = 0.55;
      var cl = price, hi = Math.max(o, cl) + Math.random() * 2.6, lo = Math.min(o, cl) - Math.random() * 2.6;
      return { o: o, c: cl, h: hi, l: lo };
    }
    for (var i = 0; i < VIS + 3; i++) arr.push(make());
    var offset = 0, speed = 0.34;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (W <= 0 || H <= 0) return;
      var gap = W / (VIS - 1), cw = Math.max(2, gap * 0.46), pad = Math.max(20, H * 0.12), shift = offset;
      var minP = Infinity, maxP = -Infinity;
      arr.forEach(function (k) { if (k.l < minP) minP = k.l; if (k.h > maxP) maxP = k.h; });
      function y(p) { return H - pad - (p - minP) / ((maxP - minP) || 1) * (H - 2 * pad); }
      /* aire dégradée sous la ligne */
      ctx.beginPath();
      arr.forEach(function (k, idx) { var x = idx * gap - shift, yy = y(k.c); idx ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); });
      ctx.lineTo((arr.length - 1) * gap - shift, H); ctx.lineTo(-gap, H); ctx.closePath();
      var fill = ctx.createLinearGradient(0, 0, 0, H);
      fill.addColorStop(0, "rgba(218,197,140,.16)"); fill.addColorStop(1, "rgba(218,197,140,0)");
      ctx.fillStyle = fill; ctx.fill();
      /* bougies */
      arr.forEach(function (k, idx) {
        var x = idx * gap - shift, up = k.c >= k.o;
        ctx.strokeStyle = up ? "rgba(51,174,130,.4)" : "rgba(216,110,100,.4)";
        ctx.fillStyle = up ? "rgba(51,174,130,.26)" : "rgba(216,110,100,.26)";
        ctx.beginPath(); ctx.moveTo(x, y(k.h)); ctx.lineTo(x, y(k.l)); ctx.stroke();
        var top = y(Math.max(k.o, k.c)), bot = y(Math.min(k.o, k.c));
        ctx.fillRect(x - cw / 2, top, cw, Math.max(1, bot - top));
      });
      /* ligne dorée */
      ctx.beginPath();
      arr.forEach(function (k, idx) { var x = idx * gap - shift, yy = y(k.c); idx ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); });
      var g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "rgba(218,197,140,.10)"); g.addColorStop(1, "#F3E7C4");
      ctx.strokeStyle = g; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(218,197,140,.5)"; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
      /* point lumineux à la pointe */
      var tip = arr[arr.length - 2], lx = (arr.length - 2) * gap - shift, ly = y(tip.c);
      ctx.beginPath(); ctx.arc(lx, ly, 3.4, 0, 7); ctx.fillStyle = "#F3E7C4";
      ctx.shadowColor = "rgba(243,231,196,.9)"; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
    }
    if (reduce) { draw(); return; }
    var prev = performance.now();
    function loop(now) {
      var dt = Math.min(50, now - prev); prev = now;
      var gap = W / (VIS - 1);
      offset += speed * (dt / 16.7);
      while (offset >= gap) { offset -= gap; arr.push(make()); if (arr.length > VIS + 3) arr.shift(); }
      draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
