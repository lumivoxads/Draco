/* Draco — unified scroll loop (Lenis + single rAF) */
(function () {
   'use strict';

   var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
   var participants = [];
   var lenis = null;
   var running = false;
   var rafId = 0;

   var metrics = {
      heroHeight: 0,
      sectionOffsets: []
   };

   function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

   function getScrollY() {
      return lenis ? lenis.scroll : window.scrollY;
   }

   function docOffset(el) {
      var top = 0;
      while (el) {
         top += el.offsetTop;
         el = el.offsetParent;
      }
      return top;
   }

   function refreshMetrics() {
      var hero = document.querySelector('.page-hero');
      metrics.heroHeight = hero ? hero.offsetHeight : 300;

      metrics.sectionOffsets = Array.from(document.querySelectorAll('.d-section[id]')).map(function (sec) {
         return { id: sec.getAttribute('id'), top: docOffset(sec) };
      });
   }

   // Generic 0..1 scroll progress through a single element's own scrollable
   // range — for a position:sticky pin pattern (a tall wrapper taller than
   // the viewport, with a sticky child pinned inside it). Used by
   // assets/verticals-globe.js to drive the vector globe's region-beat
   // rotation off its own section instead of the whole page.
   function sectionProgress(el) {
      if (!el) return 0;
      var maxScroll = el.offsetHeight - innerHeight;
      if (maxScroll <= 0) return 0;
      var raw = getScrollY() - docOffset(el);
      return clamp(raw / maxScroll, 0, 1);
   }

   // Participants are called as (time, progress, scrollY). `progress` has no
   // page-wide meaning anymore (there's no single scroll-jacked stage) — it's
   // kept as a fixed 0 purely so existing 3-arg participants (assets/site.js's
   // about-page sub-nav) don't need to change their signature.
   function frame(time) {
      if (lenis) lenis.raf(time);

      var scrollY = getScrollY();

      for (var i = 0; i < participants.length; i++) {
         participants[i](time, 0, scrollY);
      }

      if (running) rafId = requestAnimationFrame(frame);
   }

   function startLoop() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
   }

   function stopLoop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
   }

   function initLenis() {
      if (isReduced || typeof Lenis === 'undefined') return;

      lenis = new Lenis({
         lerp: 0.09,
         wheelMultiplier: 1,
         syncTouch: false,
         anchors: true,
         autoRaf: false
      });

      startLoop();
   }

   function initNative() {
      startLoop();
   }

   var resizeTimer;
   function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshMetrics, 150);
   }

   window.DracoScroll = {
      lenis: null,
      isReduced: isReduced,
      register: function (fn) {
         if (typeof fn === 'function') participants.push(fn);
      },
      sectionProgress: sectionProgress,
      getScrollY: getScrollY,
      getMetrics: function () { return metrics; },
      refreshMetrics: refreshMetrics,
      start: startLoop,
      stop: stopLoop
   };

   addEventListener('resize', onResize, { passive: true });
   refreshMetrics();

   function boot() {
      refreshMetrics();
      initLenis();
      window.DracoScroll.lenis = lenis;
      if (!lenis) initNative();
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
   } else {
      boot();
   }

   addEventListener('load', refreshMetrics);
})();
