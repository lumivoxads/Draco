/* Draco — unified scroll loop (Lenis + single rAF) */
(function () {
   'use strict';

   var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
   var stage = document.querySelector('.stage');
   var participants = [];
   var lenis = null;
   var running = false;
   var rafId = 0;

   // Single source of truth for the hero's scroll-progress thresholds (fraction
   // of the .stage's scrollable range, 0..1). earth-scroll.js and
   // verticals-globe.js both read this instead of hardcoding their own numbers —
   // the two drifting apart is what caused the globe to still be fading in while
   // the region-beat rotation had already moved past the first region.
   // Steps 1 (headline) and 2 (quote) are combined into a single held section —
   // the two overlays occupy different screen regions (hero copy upper-right,
   // quote lower-left) so they read fine together rather than crossfading.
   var PACING = {
      hintFadeEnd: 0.04,
      heroHoldEnd: 0.30,   // both step-1 and step-2 fully visible together, from the top
      heroFadeOutEnd: 0.36, // both fade out together
      step3FadeStart: 0.40,
      step3FadeEnd: 0.48 // region-beat rotation begins exactly here, fully opaque
   };

   // The two client-facing "stop points": combined hero, region vector.
   // Scroll settles into these when the user pauses near one; free scroll
   // through the region beats themselves is untouched.
   var STOP_POINTS = [0, PACING.step3FadeEnd];
   var SNAP_IDLE_FRAMES = 10;
   var SNAP_THRESHOLD = 0.035;
   var snapIdle = 0;
   var snapping = false;
   var lastSnapCheckY = null;

   var metrics = {
      stageDocTop: 0,
      maxScroll: 0,
      heroHeight: 0,
      sectionOffsets: []
   };

   function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

   function getScrollY() {
      return lenis ? lenis.scroll : window.scrollY;
   }

   function stageDocOffset(el) {
      var top = 0;
      while (el) {
         top += el.offsetTop;
         el = el.offsetParent;
      }
      return top;
   }

   function refreshMetrics() {
      if (stage) {
         metrics.stageDocTop = stageDocOffset(stage);
         metrics.maxScroll = Math.max(0, stage.offsetHeight - innerHeight);
      }

      var hero = document.querySelector('.page-hero');
      metrics.heroHeight = hero ? hero.offsetHeight : 300;

      metrics.sectionOffsets = Array.from(document.querySelectorAll('.d-section[id]')).map(function (sec) {
         return { id: sec.getAttribute('id'), top: stageDocOffset(sec) };
      });
   }

   function computeProgress() {
      if (!stage || metrics.maxScroll <= 0) return 0;
      var raw = Math.max(0, getScrollY() - metrics.stageDocTop);
      return clamp(raw / metrics.maxScroll, 0, 1);
   }

   function nearestStopY() {
      if (!stage || metrics.maxScroll <= 0) return null;
      var scrollY = getScrollY();
      var best = null, bestDist = Infinity;
      for (var i = 0; i < STOP_POINTS.length; i++) {
         var targetY = metrics.stageDocTop + STOP_POINTS[i] * metrics.maxScroll;
         var dist = Math.abs(scrollY - targetY);
         if (dist < bestDist) { bestDist = dist; best = targetY; }
      }
      if (bestDist > SNAP_THRESHOLD * metrics.maxScroll) return null;
      if (bestDist < 2) return null; // already there
      return best;
   }

   function checkSnap(scrollY) {
      if (!lenis || snapping || !stage) return;
      if (lastSnapCheckY !== null && Math.abs(scrollY - lastSnapCheckY) < 0.5) {
         snapIdle++;
      } else {
         snapIdle = 0;
      }
      lastSnapCheckY = scrollY;

      if (snapIdle === SNAP_IDLE_FRAMES) {
         var target = nearestStopY();
         if (target !== null) {
            snapping = true;
            lenis.scrollTo(target, {
               duration: 0.7,
               easing: function (t) { return 1 - Math.pow(1 - t, 3); },
               onComplete: function () { snapping = false; }
            });
         }
      }
   }

   function frame(time) {
      if (lenis) lenis.raf(time);

      var progress = stage ? computeProgress() : 0;
      var scrollY = getScrollY();

      for (var i = 0; i < participants.length; i++) {
         participants[i](time, progress, scrollY);
      }

      checkSnap(scrollY);

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
      pacing: PACING,
      register: function (fn) {
         if (typeof fn === 'function') participants.push(fn);
      },
      getProgress: computeProgress,
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
