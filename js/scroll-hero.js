/**
 * Draco — scroll-driven hero frame-scrubbing engine
 *
 * Maps scroll progress (over the .scroll-spacer) to a frame in an image
 * sequence drawn on a <canvas>, and crossfades the 5 story panels.
 * Falls back to a static gradient until frames load, and to a stacked
 * layout when the user prefers reduced motion.
 */
const FRAME_CONFIG = {
  path: 'assets/frames/',   // frames named 00001.jpg … 00240.jpg
  extension: '.jpg',
  padLength: 5,
  start: 1,
  count: 240,
};

(function () {
  'use strict';

  const PANEL_RANGES = [
    { start: 0.00, end: 0.20 },
    { start: 0.20, end: 0.40 },
    { start: 0.40, end: 0.60 },
    { start: 0.60, end: 0.80 },
    { start: 0.80, end: 1.01 },
  ];

  const BEAT_LABELS = ['Introduction', 'Why Draco', 'What We Do', 'Capabilities', 'Get Started'];
  const PANEL_CENTERS = [0.10, 0.30, 0.50, 0.70, 0.90];

  let hero, canvas, gradient, spacer, panels, indicator, progressBar, footer, loader;
  let counterNum, counterLabel, prevBtn, nextBtn;
  let frames = [];
  let framesLoaded = 0;
  let drawnFrame = -1;
  let activePanel = -1;
  let ctx = null;
  let ticking = false;

  function padNumber(num) {
    return String(num).padStart(FRAME_CONFIG.padLength, '0');
  }

  function framePath(sourceIndex) {
    return FRAME_CONFIG.path + padNumber(sourceIndex) + FRAME_CONFIG.extension;
  }

  function isReady(img) {
    return img && img.complete && img.naturalWidth > 0;
  }

  function resizeCanvas() {
    if (!canvas || !ctx || !hero) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const toRedraw = drawnFrame;
    drawnFrame = -1;
    if (toRedraw >= 0) drawFrame(toRedraw);
  }

  function drawFrame(index) {
    if (!ctx || !isReady(frames[index])) return;
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
    drawnFrame = index;
  }

  /* Nearest already-loaded frame to `index`, so scrubbing never blanks
     while later frames are still streaming in. */
  function nearestLoaded(index) {
    if (isReady(frames[index])) return index;
    for (let d = 1; d < FRAME_CONFIG.count; d++) {
      if (isReady(frames[index - d])) return index - d;
      if (isReady(frames[index + d])) return index + d;
    }
    return -1;
  }

  function preloadFrames() {
    for (let i = 0; i < FRAME_CONFIG.count; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = onFrameLoad;
      img.onerror = onFrameLoad;
      img.src = framePath(FRAME_CONFIG.start + i);
      frames[i] = img;
    }
  }

  function onFrameLoad() {
    framesLoaded++;
    if (framesLoaded === 1 && gradient) gradient.style.display = 'none';
    if (loader) {
      const pct = framesLoaded / FRAME_CONFIG.count;
      loader.style.setProperty('--p', pct);
      if (framesLoaded >= FRAME_CONFIG.count) loader.classList.add('is-done');
    }
    render();
  }

  function getScrollProgress() {
    const maxScroll = spacer.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  }

  function getActivePanelIndex(progress) {
    for (let i = 0; i < PANEL_RANGES.length; i++) {
      if (progress >= PANEL_RANGES[i].start && progress < PANEL_RANGES[i].end) return i;
    }
    return PANEL_RANGES.length - 1;
  }

  function updatePanels(progress) {
    const index = getActivePanelIndex(progress);
    if (index === activePanel) return;
    activePanel = index;
    panels.forEach(function (panel, i) {
      panel.classList.toggle('is-active', i === index);
    });
    if (counterNum) counterNum.textContent = String(index + 1).padStart(2, '0');
    if (counterLabel) counterLabel.textContent = BEAT_LABELS[index];
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === PANEL_RANGES.length - 1;
  }

  function scrollToBeat(index) {
    const i = Math.min(Math.max(index, 0), PANEL_CENTERS.length - 1);
    const maxScroll = spacer.offsetHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(PANEL_CENTERS[i] * maxScroll), behavior: 'smooth' });
  }

  function updateFrame(progress) {
    const target = Math.min(
      Math.floor(progress * FRAME_CONFIG.count),
      FRAME_CONFIG.count - 1
    );
    const toDraw = nearestLoaded(target);
    if (toDraw >= 0 && toDraw !== drawnFrame) drawFrame(toDraw);
  }

  function updateUI(progress) {
    if (progressBar) progressBar.style.width = (progress * 100) + '%';
    if (indicator) indicator.classList.toggle('is-hidden', progress > 0.04);
    if (hero) hero.classList.toggle('is-complete', progress >= 0.985);
    if (footer) footer.classList.toggle('is-visible', progress >= 0.985);
  }

  function render() {
    ticking = false;
    const progress = getScrollProgress();
    updatePanels(progress);
    updateFrame(progress);
    updateUI(progress);
  }

  function onScrollRequest() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  function initReducedMotion() {
    hero.classList.add('hero--reduced-motion');
    panels.forEach(function (panel) { panel.classList.add('is-active'); });
    if (gradient) gradient.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    if (loader) loader.style.display = 'none';
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
    loader = document.querySelector('.hero__loader');
    counterNum = document.querySelector('.hero__counter-num');
    counterLabel = document.querySelector('.hero__counter-label');
    prevBtn = document.querySelector('.hero__arrow[data-dir="prev"]');
    nextBtn = document.querySelector('.hero__arrow[data-dir="next"]');

    if (!hero || !spacer) return;

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollToBeat(activePanel - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollToBeat(activePanel + 1); });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      initReducedMotion();
      return;
    }

    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }

    window.addEventListener('scroll', onScrollRequest, { passive: true });
    preloadFrames();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
