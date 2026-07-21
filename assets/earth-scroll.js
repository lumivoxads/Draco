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

   var stage = document.querySelector('.stage');
   var scrollHint = document.querySelector('.scroll-hint');
   var step1 = document.querySelector('.step-1');
   var step2 = document.querySelector('.step-2');
   var step3 = document.querySelector('.step-3');

   var imgs = new Array(COUNT);
   var frame = 0, step = 1, last = 0;
   var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
   window.DracoEarth = {
      pause: false,
      // Unpause and repaint immediately. The canvas is cleared by any resize
      // (setting canvas.width wipes it), so coming back from a paused state
      // without a redraw leaves the black .sticky background showing through.
      resume: function () { this.pause = false; drawFrame(frame); }
   };

   function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
   function pathFor(i) { return DIR + 'frame_' + String(i).padStart(4, '0') + '.' + EXT; }

   function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Always repaint after a resize — the width assignment above clears the
      // canvas, and if the loop is paused or reduced-motion is on nothing else
      // will draw it back.
      drawFrame(isReduced ? 0 : frame);
   }

   function drawFrame(i) {
      var img = imgs[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = innerWidth, ch = innerHeight, ir = img.width / img.height, cr = cw / ch, w, h;
      if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
   }

   function tick(t) {
      if (!isReduced) requestAnimationFrame(tick);
      if (window.DracoEarth && window.DracoEarth.pause) return;
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
      var baseScrollable = innerHeight * 5; // Pacing for original 600vh stage
      var progress = clamp(rawScroll / baseScrollable, 0, 1);
      
      if (scrollHint) scrollHint.style.opacity = String(clamp(1 - progress / 0.05, 0, 1));

      // Step 1: 0.1 to 0.40 (fade out by 0.45)
      if (step1) {
         var p1 = clamp((progress - 0.05) / 0.1, 0, 1);
         var o1 = clamp(1 - (progress - 0.35) / 0.1, 0, 1);
         var val1 = p1 * o1;
         step1.style.opacity = String(val1);
         step1.style.transform = 'translateY(' + ((1 - p1) * 30 - (1 - o1) * 30) + 'px)';
         step1.style.pointerEvents = val1 > 0.5 ? 'auto' : 'none';
      }

      // Step 2: 0.45 to 0.75 (fade out by 0.80)
      if (step2) {
         var p2 = clamp((progress - 0.40) / 0.1, 0, 1);
         var o2 = clamp(1 - (progress - 0.70) / 0.1, 0, 1);
         var val2 = p2 * o2;
         step2.style.opacity = String(val2);
         step2.style.transform = 'translateY(' + ((1 - p2) * 30 - (1 - o2) * 30) + 'px)';
         step2.style.pointerEvents = val2 > 0.5 ? 'auto' : 'none';
         
         // Highlight the rail when step 2 is active
         var rail = document.querySelector('.contact-rail');
         if (rail) {
             if (val2 > 0.8) rail.classList.add('highlight');
             else rail.classList.remove('highlight');
         }
      }

      // Step 3: 0.80 to 1.0 (stays)
      if (step3) {
         var p3 = clamp((progress - 0.75) / 0.15, 0, 1);
         step3.style.opacity = String(p3);
         step3.style.transform = 'translateY(' + ((1 - p3) * 30) + 'px)';
         step3.style.pointerEvents = p3 > 0.5 ? 'auto' : 'none';
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
