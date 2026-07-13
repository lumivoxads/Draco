/* Draco — auto-playing Earth background loop (canvas, ping-pong so it never jumps).
   Configured via data-* on <canvas id="earth">:
     data-frames  total frame count
     data-path    dir prefix, e.g. "assets/earth-frames/dark/"
     data-ext     "webp" | "jpg"
     data-fps     playback frames per second (default 24)
   Plays 0 → last → 0 → … forever (direction reverses at each end = seamless). */
(function () {
   var canvas = document.getElementById('earth');
   if (!canvas) return;
   var ctx = canvas.getContext('2d');
   var COUNT = parseInt(canvas.dataset.frames, 10);
   var DIR = canvas.dataset.path;
   var EXT = canvas.dataset.ext;
   var FPS = parseFloat(canvas.dataset.fps || '24');
   var interval = 1000 / FPS;

   var imgs = new Array(COUNT);
   var frame = 0, step = 1, last = 0, drawn = -1;

   function pathFor(i) { return DIR + 'frame_' + String(i).padStart(4, '0') + '.' + EXT; }

   function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawn = -1; draw(frame);
   }

   function draw(i) {
      var img = imgs[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = innerWidth, ch = innerHeight, ir = img.width / img.height, cr = cw / ch, w, h;
      if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = i;
   }

   function tick(t) {
      requestAnimationFrame(tick);
      if (t - last < interval) return;
      last = t;
      draw(frame);
      frame += step;
      if (frame >= COUNT - 1) { frame = COUNT - 1; step = -1; }
      else if (frame <= 0) { frame = 0; step = 1; }
   }

   for (var i = 0; i < COUNT; i++) {
      (function (idx) {
         var im = new Image();
         im.onload = function () { if (idx === 0) draw(0); };
         im.src = pathFor(idx + 1);
         imgs[idx] = im;
      })(i);
   }

   addEventListener('resize', resize);
   resize();
   requestAnimationFrame(tick);
})();
