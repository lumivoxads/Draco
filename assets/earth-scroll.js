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

   var stage = document.querySelector('.stage');
   var scrollHint = document.querySelector('.scroll-hint');
   var step1 = document.querySelector('.step-1');
   var step2 = document.querySelector('.step-2');
   var step3 = document.querySelector('.step-3');

   var imgs = new Array(COUNT);
   var frame = 0, step = 1, last = 0;
   var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
   var holdForStep3 = false;
   var step3Active = false;

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

   function tick(t) {
      if (!isReduced) requestAnimationFrame(tick);
      if (window.DracoEarth && window.DracoEarth.pause) return;
      if (holdForStep3 || step3Active) return;
      if (t - last < interval) return;
      last = t;
      drawFrame(frame);
      frame += step;
      if (frame >= COUNT - 1) { frame = COUNT - 1; step = -1; }
      else if (frame <= 0) { frame = 0; step = 1; }
   }

   function onScroll() {
      if (isReduced) return;
      var rawScroll = Math.max(0, -stage.getBoundingClientRect().top);
      var maxScroll = stage.offsetHeight - innerHeight;
      var progress = maxScroll > 0 ? clamp(rawScroll / maxScroll, 0, 1) : 0;

      if (scrollHint) scrollHint.style.opacity = String(clamp(1 - progress / 0.05, 0, 1));

      if (step1) {
         var o1 = clamp(1 - (progress - 0.35) / 0.1, 0, 1);
         step1.style.opacity = String(o1);
         step1.style.transform = 'translateY(' + ((1 - o1) * 30) + 'px)';
         step1.style.pointerEvents = o1 > 0.5 ? 'auto' : 'none';
      }

      if (step2) {
         var p2 = clamp((progress - 0.40) / 0.1, 0, 1);
         var o2 = clamp(1 - (progress - 0.66) / 0.08, 0, 1);
         var val2 = p2 * o2;
         step2.style.opacity = String(val2);
         step2.style.transform = 'translateY(' + ((1 - p2) * 30 - (1 - o2) * 30) + 'px)';
         step2.style.pointerEvents = val2 > 0.5 ? 'auto' : 'none';

         var rail = document.querySelector('.contact-rail');
         if (rail) {
            if (val2 > 0.8) rail.classList.add('highlight');
            else rail.classList.remove('highlight');
         }
      }

      if (step3) {
         var p3 = clamp((progress - 0.76) / 0.14, 0, 1);
         step3.style.opacity = String(p3);
         step3.style.transform = 'translateY(' + ((1 - p3) * 30) + 'px)';
         step3.style.pointerEvents = p3 > 0.5 ? 'auto' : 'none';
      }

      var wasStep3 = step3Active;
      step3Active = progress >= 0.76;
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

   for (var i = 0; i < COUNT; i++) {
      (function (idx) {
         var im = new Image();
         im.onload = function () { if (idx === 0) { drawFrame(0); if (isReduced) drawFrame(0); } };
         im.src = pathFor(idx + 1);
         imgs[idx] = im;
      })(i);
   }

   addEventListener('scroll', onScroll, { passive: true });
   addEventListener('resize', resize);
   resize();
   onScroll();
   if (!isReduced) requestAnimationFrame(tick);
})();
