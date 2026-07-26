/* Draco — hybrid auto-playing Earth loop + scroll reveals */
(function () {
   var canvas = document.getElementById('earth');
   if (!canvas) return;
   var ctx = canvas.getContext('2d');
   var COUNT = parseInt(canvas.dataset.frames, 10);
   var DIR = canvas.dataset.path;
   var EXT = canvas.dataset.ext;
   var FPS = parseFloat(canvas.dataset.fps || '24');
   var interval = 1000 / FPS;
   var FRAME_W = 1280;
   var FRAME_H = 720;

   // Option A — hold this frame for the globe act (1-indexed frame 120).
   var HOLD_FRAME = 119;

   // Earth's disc in frame 120 (1280×720), as fractions of frame width / height.
   // Calibrated visually Jul 2026 — owner confirmed on all four limb edges.
   var EARTH_CX_FRAC = 0.3360;
   var EARTH_CY_FRAC = 0.4460;
   var EARTH_R_FRAC = 0.1930;

   // d3-geo rotation [λ, φ, γ] that matches frame 120's frozen camera — separate
   // from cx/cy/r, which only register the disc boundary.
   var EARTH_BASE_ROTATION = [98, -45, 0];

   var scrollHint = document.querySelector('.scroll-hint');
   var step1 = document.querySelector('.step-1');
   var step2 = document.querySelector('.step-2');
   var step3 = document.querySelector('.step-3');

   var imgs = new Array(COUNT);
   var frame = 0, step = 1, last = 0;
   var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
   var holdForStep3 = false;
   var step3Active = false;

   // Shared thresholds from assets/scroll-loop.js; fallback matches its defaults
   // in case that script fails to load.
   var pacing = (window.DracoScroll && window.DracoScroll.pacing) || {
      hintFadeEnd: 0.04, heroHoldEnd: 0.30, heroFadeOutEnd: 0.36,
      step3FadeStart: 0.40, step3FadeEnd: 0.48
   };

   function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
   function pathFor(i) { return DIR + 'frame_' + String(i).padStart(4, '0') + '.' + EXT; }

   function getCoverFit(cw, ch) {
      var ir = FRAME_W / FRAME_H, cr = cw / ch, w, h;
      if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
      return { w: w, h: h, ox: (cw - w) / 2, oy: (ch - h) / 2 };
   }

   function earthFracsForFrame(i) {
      return { cx: EARTH_CX_FRAC, cy: EARTH_CY_FRAC, r: EARTH_R_FRAC };
   }

   function earthOnScreen() {
      var fit = getCoverFit(innerWidth, innerHeight);
      var s = fit.w / FRAME_W;
      var f = earthFracsForFrame(frame);
      return {
         cx: fit.ox + f.cx * FRAME_W * s,
         cy: fit.oy + f.cy * FRAME_H * s,
         r: f.r * FRAME_W * s
      };
   }

   window.DracoEarth = {
      pause: false,
      holdFrame: HOLD_FRAME,
      step3Active: false,
      baseRotation: EARTH_BASE_ROTATION,
      getCoverFit: getCoverFit,
      earthOnScreen: earthOnScreen,
      earthFracsForFrame: earthFracsForFrame,
      resume: function () { this.pause = false; drawFrame(displayFrame()); },
      get currentFrame() { return frame; }
   };

   function displayFrame() {
      if (holdForStep3 || step3Active) return HOLD_FRAME;
      return frame;
   }

   function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(displayFrame());
   }

   function drawFrame(i) {
      var img = imgs[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = innerWidth, ch = innerHeight;
      var fit = getCoverFit(cw, ch);
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, fit.ox, fit.oy, fit.w, fit.h);
   }

   // Single participant in the shared frame loop (assets/scroll-loop.js): advances
   // the idle photo sequence on its own fps throttle, then applies the scroll-driven
   // reveal math. `progress` is the pre-computed, cache-backed 0..1 stage position —
   // no DOM geometry reads happen here.
   function updateEarth(time, progress) {
      if (!holdForStep3 && !step3Active && !window.DracoEarth.pause) {
         if (time - last >= interval) {
            last = time;
            drawFrame(frame);
            frame += step;
            if (frame >= COUNT - 1) { frame = COUNT - 1; step = -1; }
            else if (frame <= 0) { frame = 0; step = 1; }
         }
      }

      var P = pacing;
      if (scrollHint) scrollHint.style.opacity = String(clamp(1 - progress / P.hintFadeEnd, 0, 1));

      // Steps 1 (headline) and 2 (quote) are one combined section — both are
      // fully visible from the very top of the page (the landing stop point)
      // and fade out together rather than crossfading one for the other.
      var heroVal = clamp(1 - (progress - P.heroHoldEnd) / (P.heroFadeOutEnd - P.heroHoldEnd), 0, 1);

      if (step1) {
         step1.style.opacity = String(heroVal);
         step1.style.transform = 'translateY(' + ((1 - heroVal) * 30) + 'px)';
         step1.style.pointerEvents = heroVal > 0.5 ? 'auto' : 'none';
      }

      if (step2) {
         step2.style.opacity = String(heroVal);
         step2.style.transform = 'translateY(' + ((1 - heroVal) * 30) + 'px)';
         step2.style.pointerEvents = heroVal > 0.5 ? 'auto' : 'none';

         var rail = document.querySelector('.contact-rail');
         if (rail) {
            if (heroVal > 0.8) rail.classList.add('highlight');
            else rail.classList.remove('highlight');
         }
      }

      if (step3) {
         var p3 = clamp((progress - P.step3FadeStart) / (P.step3FadeEnd - P.step3FadeStart), 0, 1);
         step3.style.opacity = String(p3);
         step3.style.transform = 'translateY(' + ((1 - p3) * 30) + 'px)';
         step3.style.pointerEvents = p3 > 0.5 ? 'auto' : 'none';
      }

      // step3 is only considered "active" once fully opaque (P.step3FadeEnd) —
      // this is also where the region-beat rotation begins (verticals-globe.js),
      // so the globe, glass panel, and black overlay are already fully loaded by
      // the moment the first region's beat starts.
      var wasStep3 = step3Active;
      step3Active = progress >= P.step3FadeEnd;
      window.DracoEarth.step3Active = step3Active;

      if (step3Active && !wasStep3) {
         holdForStep3 = true;
         window.DracoEarth.pause = true;
         frame = HOLD_FRAME;
         drawFrame(HOLD_FRAME);
      } else if (!step3Active && holdForStep3) {
         holdForStep3 = false;
         window.DracoEarth.pause = false;
      }
   }

   // Eager-load enough of the sequence that the hero is alive immediately and the
   // held globe-act frame (HOLD_FRAME) is guaranteed available whenever a user
   // reaches it; the remainder trickles in during idle time so decode work stays
   // off the early-scroll critical path.
   var EAGER_COUNT = Math.min(COUNT, Math.max(30, HOLD_FRAME + 1));
   var idleHandle = typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : function (fn) { return setTimeout(fn, 200); };

   function loadFrame(idx) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () {
         if (idx === 0) {
            drawFrame(0);
            if (window.DracoScroll) window.DracoScroll.refreshMetrics();
         }
         if (typeof im.decode === 'function') im.decode().catch(function () {});
      };
      im.src = pathFor(idx + 1);
      imgs[idx] = im;
   }

   function loadRemainingIdle(idx) {
      if (idx >= COUNT) return;
      idleHandle(function () {
         loadFrame(idx);
         loadRemainingIdle(idx + 1);
      });
   }

   for (var i = 0; i < EAGER_COUNT; i++) loadFrame(i);
   loadRemainingIdle(EAGER_COUNT);

   addEventListener('resize', resize);
   resize();

   // Steps 1+2 are shown together now, so on narrow/short phones the quote
   // (bottom-anchored) can run into the headline (top-anchored) depending on
   // exact device metrics and font rendering — CSS breakpoints alone can't
   // guarantee a gap across every phone size. Measure and reposition instead.
   function layoutMobileHero() {
      var hc = step1 && step1.querySelector('.hero-copy');
      var hq = step2 && step2.querySelector('.hero-quote');
      if (!hc || !hq) return;

      hq.style.top = '';
      hq.style.bottom = '';
      if (innerWidth > 600) return;

      var gap = 28;
      var minTop = hc.getBoundingClientRect().bottom + gap;
      if (hq.getBoundingClientRect().top < minTop) {
         hq.style.bottom = 'auto';
         hq.style.top = minTop + 'px';
      }
   }

   var mobileHeroResizeTimer;
   addEventListener('resize', function () {
      clearTimeout(mobileHeroResizeTimer);
      mobileHeroResizeTimer = setTimeout(layoutMobileHero, 150);
   });
   layoutMobileHero();
   addEventListener('load', layoutMobileHero); // fonts can shift text height after first layout

   if (isReduced) {
      // Matches prior behaviour: reduced motion renders the CSS-only stacked
      // fallback and never drives the photo loop or reveal math from here.
   } else if (window.DracoScroll) {
      updateEarth(performance.now(), window.DracoScroll.getProgress()); // set initial state before first paint
      window.DracoScroll.register(updateEarth);
   } else {
      // Defensive fallback if the shared loop failed to load.
      addEventListener('scroll', function () { updateEarth(performance.now(), 0); }, { passive: true });
      requestAnimationFrame(function raf(t) { updateEarth(t, 0); requestAnimationFrame(raf); });
   }
})();
