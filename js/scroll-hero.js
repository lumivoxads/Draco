/**
 * Draco — scroll-driven hero frame scrubbing engine
 */
const FRAME_CONFIG = {
  path: 'assets/frames/frame_',
  extension: '.webp',
  padLength: 4,
  count: 0,
};

(function () {
  'use strict';

  const PANEL_RANGES = [
    { start: 0, end: 0.2 },
    { start: 0.2, end: 0.4 },
    { start: 0.4, end: 0.6 },
    { start: 0.6, end: 0.8 },
    { start: 0.8, end: 1.0 },
  ];

  let hero, canvas, gradient, spacer, panels, indicator, progressBar, footer;
  let frames = [];
  let framesLoaded = 0;
  let currentFrame = -1;
  let ctx = null;
  let ticking = false;
  let reducedMotion = false;

  function padNumber(num) {
    return String(num).padStart(FRAME_CONFIG.padLength, '0');
  }

  function framePath(index) {
    return FRAME_CONFIG.path + padNumber(index) + FRAME_CONFIG.extension;
  }

  function resizeCanvas() {
    if (!canvas || !ctx || !hero) return;
    const dpr = window.devicePixelRatio || 1;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (currentFrame >= 0 && frames[currentFrame]) {
      drawFrame(currentFrame);
    }
  }

  function drawFrame(index) {
    if (!ctx || !frames[index] || !frames[index].complete) return;
    const img = frames[index];
    const cw = hero.clientWidth;
    const ch = hero.clientHeight;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  function preloadFrames() {
    if (FRAME_CONFIG.count <= 0) return;

    for (let i = 1; i <= FRAME_CONFIG.count; i++) {
      const img = new Image();
      const idx = i - 1;
      img.onload = function () {
        framesLoaded++;
        if (framesLoaded === 1) {
          if (gradient) gradient.style.display = 'none';
          drawFrame(0);
        }
      };
      img.onerror = function () {
        framesLoaded++;
      };
      img.src = framePath(i);
      frames[idx] = img;
    }
  }

  function getScrollProgress() {
    const maxScroll = spacer.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  }

  function getActivePanelIndex(progress) {
    for (let i = 0; i < PANEL_RANGES.length; i++) {
      const range = PANEL_RANGES[i];
      if (progress >= range.start && progress < range.end) return i;
    }
    return PANEL_RANGES.length - 1;
  }

  function updatePanels(progress) {
    const panelIndex = getActivePanelIndex(progress);
    panels.forEach(function (panel, i) {
      panel.classList.toggle('is-active', i === panelIndex);
    });
  }

  function updateFrame(progress) {
    if (FRAME_CONFIG.count <= 0 || frames.length === 0) {
      if (gradient) {
        gradient.style.transform = 'translateY(' + (progress * 30) + 'px)';
      }
      return;
    }

    const frameIndex = Math.min(
      Math.floor(progress * FRAME_CONFIG.count),
      FRAME_CONFIG.count - 1
    );

    if (frameIndex !== currentFrame && frames[frameIndex] && frames[frameIndex].complete) {
      currentFrame = frameIndex;
      drawFrame(frameIndex);
    }
  }

  function updateUI(progress) {
    if (progressBar) {
      progressBar.style.width = (progress * 100) + '%';
    }
    if (indicator) {
      indicator.classList.toggle('is-hidden', progress > 0.05);
    }
    if (hero) {
      hero.classList.toggle('is-complete', progress >= 0.98);
    }
    if (footer) {
      footer.classList.toggle('is-visible', progress >= 0.98);
    }
  }

  function onScroll() {
    ticking = false;
    const progress = getScrollProgress();
    updatePanels(progress);
    updateFrame(progress);
    updateUI(progress);
  }

  function onScrollRequest() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }

  function initReducedMotion() {
    hero.classList.add('hero--reduced-motion');
    panels.forEach(function (panel) {
      panel.classList.add('is-active');
    });
    if (gradient) gradient.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    if (footer) footer.classList.add('is-visible');
  }

  function init() {
    hero = document.querySelector('.hero');
    canvas = document.querySelector('.hero__canvas');
    gradient = document.querySelector('.hero__gradient');
    spacer = document.querySelector('.scroll-spacer');
    panels = document.querySelectorAll('.hero__panel');
    indicator = document.querySelector('.scroll-indicator');
    progressBar = document.querySelector('.scroll-progress');
    footer = document.querySelector('.site-footer');

    if (!hero || !spacer) return;

    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      initReducedMotion();
      return;
    }

    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }

    window.addEventListener('scroll', onScrollRequest, { passive: true });

    if (FRAME_CONFIG.count > 0) {
      preloadFrames();
    }

    onScroll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
