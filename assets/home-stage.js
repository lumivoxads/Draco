/* Draco home — active-screen state for the fixed video stage.

   The video, the dimming scrim and the vector globe are one fixed instance each
   and never scroll. This module watches which .screen is on screen and, on a
   change, dims the video, fades the globe in or out, marks the active card and
   tells the globe which region to turn to. It is the only consumer of
   window.DracoGlobe.

   See docs/superpowers/specs/2026-07-28-home-video-stage-design.md */
(function () {
   'use strict';

   var screens = [].slice.call(document.querySelectorAll('.screen'));
   if (!screens.length) return;

   var scrim = document.getElementById('stage-scrim');
   var canvas = document.getElementById('globe-canvas');
   var video = document.getElementById('stage-video');
   var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

   var HERO_SCRIM = '0.15';
   var REGION_SCRIM = '0.7';

   if (isReduced) {
      // Everything stacks and is visible at once; the poster still stands in for
      // the video (assets/site.css and index.html handle the presentation).
      if (video) video.removeAttribute('autoplay');
      screens.forEach(function (s) { s.classList.add('is-active'); });
      return;
   }

   // Some browsers refuse autoplay until the element is muted in the DOM as well
   // as in markup, and refuse silently.
   if (video) {
      video.muted = true;
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () { /* poster stands in */ });
   }

   var current = -1;

   function activate(index) {
      if (index === current) return;
      current = index;

      screens.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });

      var isHero = index === 0;
      if (scrim) scrim.style.opacity = isHero ? HERO_SCRIM : REGION_SCRIM;
      if (canvas) canvas.style.opacity = isHero ? '0' : '1';

      if (!window.DracoGlobe) return;
      window.DracoGlobe.setVisible(!isHero);
      if (!isHero) {
         var region = parseInt(screens[index].dataset.region, 10);
         if (!isNaN(region)) window.DracoGlobe.setActiveRegion(region);
      }
   }

   if (typeof IntersectionObserver === 'undefined') {
      activate(0);
      return;
   }

   var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
         if (entry.isIntersecting) activate(screens.indexOf(entry.target));
      });
   }, { threshold: 0.55 });

   screens.forEach(function (s) { observer.observe(s); });
})();
