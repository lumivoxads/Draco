/* Draco — scroll-scrubbed Earth frame sequence (canvas) for the home hero.
   Configured via data-* on <canvas id="earth">:
     data-frames  total frame count
     data-path    dir prefix, e.g. "assets/earth-frames/dark/"
     data-ext     "webp" | "jpg"
   Frames are named frame_0001.<ext> … (1-indexed, zero-padded to 4).
   Choreography across scroll progress (0 → 1):
     .hero-copy   fades/slides out over the first ~42%
     .scroll-hint fades out as soon as scrolling starts
     .hero-end    fades in over the last ~25% (closing CTA) */
(function () {
   var canvas = document.getElementById('earth');
   if (!canvas) return;
   var ctx = canvas.getContext('2d');
   var COUNT = parseInt(canvas.dataset.frames, 10);
   var DIR = canvas.dataset.path;
   var EXT = canvas.dataset.ext;
   var stage = document.querySelector('.stage');
   var heroCopy = document.querySelector('.hero-copy');
   var heroQuote = document.querySelector('.hero-quote');
   var heroEnd = document.querySelector('.hero-end');
   var scrollHint = document.querySelector('.scroll-hint');

   var imgs = new Array(COUNT);
   var current = -1;

   function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
   function pathFor(i) { return DIR + 'frame_' + String(i).padStart(4, '0') + '.' + EXT; }

   function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(current < 0 ? 0 : current, true);
   }

   function drawCover(img) {
      var cw = innerWidth, ch = innerHeight;
      var ir = img.width / img.height, cr = cw / ch, w, h;
      if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
   }

   function drawFrame(i, force) {
      i = clamp(i, 0, COUNT - 1);
      if (i === current && !force) return;
      var img = imgs[i];
      if (img && img.complete && img.naturalWidth) { current = i; drawCover(img); }
   }

   function onScroll() {
      var scrollable = stage.offsetHeight - innerHeight;
      var progress = scrollable > 0 ? clamp(-stage.getBoundingClientRect().top / scrollable, 0, 1) : 0;
      var idx = Math.round(progress * (COUNT - 1));
      requestAnimationFrame(function () { drawFrame(idx); });

      if (heroCopy) {
         var o = clamp(1 - progress / 0.34, 0, 1);          // opening gone by ~34%
         heroCopy.style.opacity = String(o);
         heroCopy.style.transform = 'translateY(' + (-progress * 70) + 'px)';
         heroCopy.style.pointerEvents = o < 0.05 ? 'none' : 'auto';
         if (heroQuote) {
            heroQuote.style.opacity = String(o);
            heroQuote.style.transform = 'translateY(' + (-progress * 40) + 'px)';
         }
      }
      if (scrollHint) scrollHint.style.opacity = String(clamp(1 - progress / 0.08, 0, 1));
      if (heroEnd) {
         var e = clamp((progress - 0.40) / 0.16, 0, 1);      // closing in from ~40% (small gap, no overlap)
         heroEnd.style.opacity = String(e);
         heroEnd.style.pointerEvents = e > 0.5 ? 'auto' : 'none';
      }
   }

   for (var i = 0; i < COUNT; i++) {
      (function (idx) {
         var im = new Image();
         im.onload = function () { if (idx === 0) drawFrame(0, true); };
         im.src = pathFor(idx + 1);
         imgs[idx] = im;
      })(i);
   }

   addEventListener('scroll', onScroll, { passive: true });
   addEventListener('resize', resize);
   resize();
   onScroll();
})();
