/* Draco — vector-geometry globe for Verticals & Geographies (d3-geo orthographic) */
(function () {
  'use strict';

  // Client region / vertical matrix (Jul 2026)
  var REGIONS = [
    {
      region: 'Africa',
      anchor: [20, 5],
      countryIds: ['710', '566', '818', '404', '012', '288', '834', '024', '108'],
      verticals: ['BFSI', 'Fuel']
    },
    {
      region: 'Asia',
      anchor: [105, 10],
      countryIds: ['392', '156', '356', '764', '360', '702', '410', '158', '704'],
      verticals: ['Airline', 'Airport', 'Ecosystem', 'Hospitality', 'QSR', 'Retail', 'Retail / CPG']
    },
    {
      region: 'Central America',
      anchor: [-88, 14],
      countryIds: ['484', '320', '188', '591', '340', '222', '558', '084'],
      verticals: ['Airline', 'QSR', 'Retail / CPG']
    },
    {
      region: 'Central Asia',
      anchor: [67, 42],
      countryIds: ['398', '860', '762', '795', '417'],
      verticals: ['Airline']
    },
    {
      region: 'Europe',
      anchor: [15, 50],
      countryIds: ['826', '276', '250', '724', '380', '528', '616', '620', '752', '578'],
      verticals: ['Airline', 'Ecosystem', 'Hospitality', 'Retail / CPG', 'Telco']
    },
    {
      region: 'Middle East',
      anchor: [55, 25],
      countryIds: ['784', '682', '634', '414', '512', '048', '376', '400', '364'],
      verticals: ['Airline', 'Hospitality', 'QSR', 'Retail', 'Retail / CPG']
    },
    {
      region: 'North America',
      anchor: [-98, 45],
      countryIds: ['840', '124'],
      verticals: ['Airline', 'Ecosystem', 'Hospitality']
    }
  ];

  // Each region beat: ~78% scroll is a hold (globe stopped on region), ~22% transitions.
  var REGION_HOLD = 0.78;

  var COLORS = {
    sphereFill: 'rgba(6,7,10,0.38)',
    graticule: 'rgba(244,246,248,0.08)',
    sphereOutline: 'rgba(244,246,248,0.18)',
    countryStroke: 'rgba(244,246,248,0.16)',
    activeFill: 'rgba(201,169,106,0.18)',
    activeStroke: '#c9a96a',
    marker: '#c9a96a',
    connector: '#c9a96a'
  };

  var canvas = document.getElementById('globe-canvas');
  var verticalsSection = document.getElementById('verticals');
  var pinEl = document.querySelector('.verticals-pin');

  var isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) {
    initBentoFallback();
    return;
  }

  var dpr = 1;
  var countries = [];
  var countryById = {};
  var projection = d3.geoOrthographic().clipAngle(90);
  var path = null;
  var graticule = d3.geoGraticule10();

  var currentRotation = [0, 0, 0];
  var targetRotation = [0, 0, 0];
  var regionWeights = REGIONS.map(function () { return 0; });
  var activeRegionIndex = -1;
  var allLit = false;
  var pulsePhase = 0;
  var sectionVisible = false;
  var topologyReady = false;
  var lastEarth = null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function anchorToRotation(anchor) {
    return [-anchor[0], -anchor[1], 0];
  }

  function lerpAngle(a, b, t) {
    return a + shortestDelta(a, b) * t;
  }

  function rotationForBeat(beatFloat) {
    var last = REGIONS.length - 1;
    if (beatFloat >= last) return anchorToRotation(REGIONS[last].anchor);
    var idx = Math.floor(beatFloat);
    var frac = beatFloat - idx;
    var from = anchorToRotation(REGIONS[idx].anchor);
    var to = anchorToRotation(REGIONS[idx + 1].anchor);
    return [
      lerpAngle(from[0], to[0], frac),
      from[1] + (to[1] - from[1]) * frac,
      from[2] + (to[2] - from[2]) * frac
    ];
  }

  function shortestDelta(from, to) {
    var diff = to - from;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }

  function easeRotation() {
    if (isReduced) return;
    currentRotation[0] += shortestDelta(currentRotation[0], targetRotation[0]) * 0.08;
    currentRotation[1] += (targetRotation[1] - currentRotation[1]) * 0.08;
    currentRotation[2] += (targetRotation[2] - currentRotation[2]) * 0.08;
  }

  // Earth's disc in the static background frame (assets/earth-frames/dark/
  // frame_0120.jpg, 1280×720), as fractions of frame width/height — calibrated
  // visually Jul 2026, confirmed on all four limb edges. The frame is rendered
  // as a plain centered object-fit:cover <img> now (index.html .bg-image), so
  // this reproduces that same centered cover-fit math directly instead of
  // reading it from the old scroll-scrubbed canvas (assets/earth-scroll.js).
  var EARTH_FRAME_W = 1280;
  var EARTH_FRAME_H = 720;
  var EARTH_CX_FRAC = 0.3360;
  var EARTH_CY_FRAC = 0.4460;
  var EARTH_R_FRAC = 0.1930;

  function getEarthCoverFit(cw, ch) {
    var ir = EARTH_FRAME_W / EARTH_FRAME_H, cr = cw / ch, w, h;
    if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
    return { w: w, h: h, ox: (cw - w) / 2, oy: (ch - h) / 2 };
  }

  function getEarthLayout() {
    var fit = getEarthCoverFit(innerWidth, innerHeight);
    var s = fit.w / EARTH_FRAME_W;
    return {
      cx: fit.ox + EARTH_CX_FRAC * EARTH_FRAME_W * s,
      cy: fit.oy + EARTH_CY_FRAC * EARTH_FRAME_H * s,
      r: EARTH_R_FRAC * EARTH_FRAME_W * s
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    path = d3.geoPath(projection, ctx);
    if (topologyReady) positionPanel(getEarthLayout());
  }

  function positionPanel(e) {
    if (!verticalsSection || !e) return;
    lastEarth = e;

    var mobile = innerWidth <= 768;
    if (mobile) {
      var bottomPad = 100;
      // Cap from above too: on a tall narrow viewport the globe's disc can reach
      // most of the way down the screen, which pushed the card almost entirely
      // off-screen. Never start the card lower than half the viewport so there
      // is always real room for it, even if that means it sits over the lower
      // edge of the globe.
      var topPad = Math.min(Math.max(e.cy + e.r + 24, 120), innerHeight * 0.5);
      verticalsSection.style.flexDirection = 'column';
      verticalsSection.style.alignItems = 'center';
      verticalsSection.style.justifyContent = 'flex-start';
      verticalsSection.style.padding = '0 var(--d-pad) ' + bottomPad + 'px';
      verticalsSection.style.paddingTop = topPad + 'px';

      // Cap the card to whatever space is actually left below the globe, so the
      // whole card (border to border) stays on-screen instead of running off
      // the bottom of the viewport — the globe's own position is untouched.
      var panelEl = document.getElementById('verticals-panel');
      if (panelEl) {
         panelEl.style.maxHeight = 'calc(100vh - ' + (topPad + bottomPad) + 'px - 20px)';
      }
      return;
    }

    var rightSpace = innerWidth - (e.cx + e.r);
    var leftSpace = e.cx - e.r;
    var pad = 'var(--d-pad)';
    verticalsSection.style.flexDirection = 'row';
    verticalsSection.style.alignItems = 'center';
    verticalsSection.style.padding = '0';
    verticalsSection.style.paddingTop = '0';

    if (rightSpace >= leftSpace) {
      verticalsSection.style.justifyContent = 'flex-end';
      verticalsSection.style.paddingRight = pad;
      verticalsSection.style.paddingLeft = Math.max(e.cx + e.r + 24, 24) + 'px';
    } else {
      verticalsSection.style.justifyContent = 'flex-start';
      verticalsSection.style.paddingLeft = pad;
      verticalsSection.style.paddingRight = Math.max(innerWidth - (e.cx - e.r) + 24, 24) + 'px';
    }
  }

  function getCountryHighlight(id) {
    if (allLit) {
      for (var i = 0; i < REGIONS.length; i++) {
        if (REGIONS[i].countryIds.indexOf(id) !== -1) return 1;
      }
      return 0;
    }
    var maxW = 0;
    for (var j = 0; j < REGIONS.length; j++) {
      if (REGIONS[j].countryIds.indexOf(id) === -1) continue;
      if (regionWeights[j] > maxW) maxW = regionWeights[j];
    }
    return maxW;
  }

  function drawGlobe() {
    if (!topologyReady || !sectionVisible) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      return;
    }

    var e = getEarthLayout();
    positionPanel(e);
    projection
      .scale(e.r)
      .translate([e.cx, e.cy])
      .rotate(currentRotation);

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    var hairline = Math.max(0.5, 1 / dpr);

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = COLORS.sphereFill;
    ctx.fill();

    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = COLORS.graticule;
    ctx.lineWidth = hairline;
    ctx.stroke();

    for (var i = 0; i < countries.length; i++) {
      var feature = countries[i];
      var id = String(feature.id);
      var weight = getCountryHighlight(id);
      ctx.beginPath();
      path(feature);
      if (weight > 0.01) {
        ctx.fillStyle = COLORS.activeFill.replace('0.18', String(0.18 * weight));
        ctx.fill();
        ctx.strokeStyle = weight > 0.5 ? COLORS.activeStroke : lerpColorStroke(weight);
      } else {
        ctx.strokeStyle = COLORS.countryStroke;
      }
      ctx.lineWidth = hairline;
      ctx.stroke();
    }

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = COLORS.sphereOutline;
    ctx.lineWidth = hairline;
    ctx.stroke();

    drawMarkerAndConnector(e, hairline);
  }

  function lerpColorStroke(weight) {
    var r = Math.round(lerp(244, 201, weight));
    var g = Math.round(lerp(246, 169, weight));
    var b = Math.round(lerp(248, 106, weight));
    var a = lerp(0.16, 1, weight);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function markerVisible(xy, e) {
    if (!xy) return false;
    var x = xy[0], y = xy[1];
    if (x < -8 || y < -8 || x > innerWidth + 8 || y > innerHeight + 8) return false;
    var dx = x - e.cx, dy = y - e.cy;
    return (dx * dx + dy * dy) <= (e.r * e.r);
  }

  function drawMarkerAndConnector(e, hairline) {
    if (allLit || activeRegionIndex < 0) return;

    var region = REGIONS[activeRegionIndex];
    var xy = projection(region.anchor);
    if (!markerVisible(xy, e)) return;

    var pulse = isReduced ? 1 : 1 + Math.sin(pulsePhase) * 0.35;
    var markerR = 4 * pulse;

    ctx.beginPath();
    ctx.arc(xy[0], xy[1], markerR, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.marker;
    ctx.fill();

    if (innerWidth < 992) return;

    var panel = document.getElementById('verticals-panel');
    if (!panel) return;
    var rect = panel.getBoundingClientRect();
    if (rect.width <= 0) return;

    var panelX = rect.left;
    var panelY = rect.top + rect.height * 0.5;

    ctx.beginPath();
    ctx.moveTo(xy[0], xy[1]);
    ctx.lineTo(panelX, panelY);
    ctx.strokeStyle = COLORS.connector;
    ctx.lineWidth = hairline * 1.5;
    ctx.stroke();
  }

  function renderPanel(index) {
    if (index === activeRegionIndex && index !== -1) return;
    activeRegionIndex = index;

    var panel = document.getElementById('verticals-panel');
    if (!panel) return;

    if (index === -1 || allLit) {
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      return;
    }

    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    var r = REGIONS[index];
    var title = document.getElementById('region-name');
    if (title) title.textContent = r.region;

    var chipsContainer = document.getElementById('verticals-chips');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = r.verticals.map(function (v) {
      return '<div class="v-chip">' + v + '</div>';
    }).join('');

    if (isReduced) {
      chipsContainer.querySelectorAll('.v-chip').forEach(function (c) { c.classList.add('show'); });
      return;
    }

    setTimeout(function () {
      var chips = chipsContainer.querySelectorAll('.v-chip');
      chips.forEach(function (c, i) {
        setTimeout(function () { c.classList.add('show'); }, i * 50);
      });
    }, 50);
  }

  function getSectionProgress() {
    if (window.DracoScroll && window.DracoScroll.sectionProgress) {
      return window.DracoScroll.sectionProgress(pinEl);
    }
    // Defensive fallback if the shared loop failed to load.
    if (!pinEl) return 0;
    var maxScroll = pinEl.offsetHeight - innerHeight;
    if (maxScroll <= 0) return 0;
    var rect = pinEl.getBoundingClientRect();
    return clamp(-rect.top / maxScroll, 0, 1);
  }

  function mapSnappedBeats(raw) {
    var totalBeats = REGIONS.length + 0.5;
    if (raw <= 0) return 0;
    if (raw >= 1) return totalBeats;

    var pos = raw * totalBeats;
    var idx = Math.floor(pos);
    var local = pos - idx;

    if (local < REGION_HOLD) return idx;

    var t = (local - REGION_HOLD) / (1 - REGION_HOLD);
    return Math.min(idx + t, totalBeats);
  }

  function updateFromScroll() {
    if (!sectionVisible || isReduced) return;

    var prog = getSectionProgress();
    var beatFloat = mapSnappedBeats(prog);
    var beatIndex = Math.floor(beatFloat);
    var beatFrac = beatFloat - beatIndex;
    var inHold = beatFrac < 0.001 && beatIndex < REGIONS.length;

    if (beatIndex >= REGIONS.length) {
      allLit = true;
      regionWeights = REGIONS.map(function () { return 1; });
      renderPanel(-1);
      targetRotation = anchorToRotation(REGIONS[REGIONS.length - 1].anchor);
    } else {
      allLit = false;
      if (inHold) {
        regionWeights = REGIONS.map(function (_, i) { return i === beatIndex ? 1 : 0; });
      } else {
        regionWeights = REGIONS.map(function (_, i) {
          if (i === beatIndex) return clamp(beatFrac * 1.5, 0, 1);
          if (i === beatIndex - 1) return clamp(1 - beatFrac * 1.5, 0, 1);
          return 0;
        });
      }
      targetRotation = rotationForBeat(beatFloat);
      renderPanel(beatIndex);
    }
  }

  // Shared-loop participant (assets/scroll-loop.js drives the one rAF for the
  // whole page). Registered unconditionally; no-ops until topology has loaded.
  // Local scroll progress (getSectionProgress) is read fresh each frame rather
  // than taking a page-wide progress argument — this is the only section left
  // that animates on scroll, so it paces itself off its own .verticals-pin.
  function updateGlobe() {
    if (!topologyReady) return;
    if (!isReduced) {
      pulsePhase += 0.08;
      easeRotation();
    }
    updateFromScroll();
    drawGlobe();
  }

  function verifyCountryIds(topology) {
    var features = topojson.feature(topology, topology.objects.countries).features;
    var idSet = {};
    features.forEach(function (f) { idSet[String(f.id)] = f; });

    var missing = [];
    REGIONS.forEach(function (region) {
      region.countryIds.forEach(function (id) {
        if (!idSet[id]) missing.push(id);
      });
    });

    if (missing.length) {
      console.warn('[verticals-globe] Missing country ids in topology:', missing.join(', '));
    }

    countries = features;
    countryById = idSet;
    return missing;
  }

  function initReducedMotion() {
    document.body.classList.add('fallback-mode', 'reduced-globe-mode');
    allLit = true;
    regionWeights = REGIONS.map(function () { return 1; });
    currentRotation = anchorToRotation(REGIONS[0].anchor);
    targetRotation = currentRotation.slice();

    var section = document.getElementById('verticals');
    if (section) {
      section.innerHTML = '';
      section.style.flexDirection = 'column';
      section.style.alignItems = 'center';
      section.style.gap = '24px';
      section.style.padding = '80px var(--d-pad) 120px';

      REGIONS.forEach(function (r) {
        var panel = document.createElement('div');
        panel.className = 'glass-panel';
        panel.innerHTML =
          '<div class="panel-header"><h2 class="d-display region-name">' + r.region + '</h2></div>' +
          '<div class="panel-content"><div class="verticals-chips">' +
          r.verticals.map(function (v) { return '<div class="v-chip show">' + v + '</div>'; }).join('') +
          '</div></div>';
        section.appendChild(panel);
      });
    }

    sectionVisible = true;
    drawGlobe();
  }

  function unpinVerticalsSection() {
    if (pinEl) pinEl.style.height = 'auto';
    var sticky = document.querySelector('.verticals-sticky');
    if (sticky) {
      sticky.style.position = 'relative';
      sticky.style.height = 'auto';
      sticky.style.overflow = 'visible';
    }
  }

  function initBentoFallback() {
    document.body.classList.add('fallback-mode', 'bento-fallback-mode');
    unpinVerticalsSection();

    var section = document.getElementById('verticals');
    if (!section) return;

    section.innerHTML =
      '<div class="verticals-bento-wrap">' +
      '<div class="section-head" style="margin-bottom:32px;">' +
      '<span class="d-eyebrow">Where we operate</span>' +
      '<h2 class="d-display" style="text-transform:none;font-size:clamp(2rem,4vw,3rem);">Verticals &amp; geographies</h2>' +
      '</div>' +
      '<div class="bento-grid">' +
      REGIONS.map(function (r, i) {
        return '<div class="bento-card' + (i === 0 ? ' feat' : '') + '">' +
          '<h3>' + r.region + '</h3>' +
          '<div class="bento-chips">' +
          r.verticals.map(function (v) { return '<span class="bento-chip">' + v + '</span>'; }).join('') +
          '</div></div>';
      }).join('') +
      '</div></div>';

    if (canvas) canvas.style.display = 'none';
  }

  function loadTopology() {
    return fetch('assets/vendor/countries-110m.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Topology fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (topology) {
        var missing = verifyCountryIds(topology);
        if (missing.length > 2) {
          return fetch('assets/vendor/countries-50m.json')
            .then(function (res) {
              if (!res.ok) throw new Error('50m topology fetch failed');
              return res.json();
            })
            .then(function (topo50) {
              verifyCountryIds(topo50);
              return topo50;
            });
        }
        return topology;
      });
  }

  function initGlobe() {
    resize();
    currentRotation = anchorToRotation(REGIONS[0].anchor);
    targetRotation = currentRotation.slice();

    // Perf guard only (not an opacity/fade choreography): skip rotation easing
    // and redraw work while the pinned section is nowhere near the viewport.
    if (pinEl && typeof IntersectionObserver !== 'undefined' && !isReduced) {
      new IntersectionObserver(function (entries) {
        sectionVisible = entries[0].isIntersecting;
      }, { rootMargin: '20% 0px' }).observe(pinEl);
    }

    loadTopology()
      .then(function () {
        topologyReady = true;
        if (isReduced) {
          initReducedMotion();
          return;
        }
        renderPanel(0);
        if (window.DracoScroll) {
          window.DracoScroll.register(updateGlobe);
        } else {
          // Defensive fallback if the shared loop failed to load.
          (function fallbackTick() {
            updateGlobe();
            requestAnimationFrame(fallbackTick);
          })();
        }
      })
      .catch(function (err) {
        console.error('[verticals-globe]', err);
        initBentoFallback();
      });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        drawGlobe();
      }, 150);
    });
  }

  if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
    initBentoFallback();
    return;
  }

  initGlobe();
})();
