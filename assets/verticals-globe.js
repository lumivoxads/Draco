/* Draco — vector-geometry globe for Verticals & Geographies (d3-geo orthographic) */
(function () {
  'use strict';

  // PLACEHOLDER — client still preparing final region/country list
  var REGIONS = [
    {
      region: 'Middle East',
      anchor: [55.27, 25.20],
      countryIds: ['784', '682', '634', '414', '512', '048'],
      verticals: ['Retail', 'Hospitality', 'Fuel & Energy', 'Banking & Financial Services']
    },
    {
      region: 'Europe',
      anchor: [-0.13, 51.51],
      countryIds: ['826', '276', '250', '724', '380', '528'],
      verticals: ['Automotive', 'Telecommunications', 'E-Commerce']
    },
    {
      region: 'Asia Pacific',
      anchor: [103.82, 1.35],
      countryIds: ['458', '356', '036', '392', '764'],
      verticals: ['Restaurants & Cafés', 'Healthcare', 'Lifestyle']
    },
    {
      region: 'Americas',
      anchor: [-74.01, 40.71],
      countryIds: ['840', '124', '076', '484'],
      verticals: ['Entertainment', 'Enterprise Organisations']
    }
  ];

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
  var scrim = document.getElementById('globe-scrim');
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
  var step3Visible = false;
  var topologyReady = false;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function anchorToRotation(anchor) {
    return [-anchor[0], -anchor[1], 0];
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
    if (!allLit) currentRotation[0] += 0.04;
  }

  function getGlobeLayout() {
    var size = Math.min(innerWidth, innerHeight) * 0.8;
    var mobile = innerWidth <= 768;
    if (mobile) {
      return { size: size, cx: innerWidth * 0.5, cy: innerHeight * 0.34, mobile: true };
    }
    return { size: size, cx: innerWidth * 0.30, cy: innerHeight * 0.5, mobile: false };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    path = d3.geoPath(projection, ctx);
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
    if (!topologyReady || !step3Visible) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      return;
    }

    var layout = getGlobeLayout();
    var radius = layout.size * 0.46;
    projection
      .scale(radius)
      .translate([layout.cx, layout.cy])
      .rotate(currentRotation);

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    var hairline = Math.max(0.5, 1 / dpr);

    // Sphere fill
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = COLORS.sphereFill;
    ctx.fill();

    // Graticule
    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = COLORS.graticule;
    ctx.lineWidth = hairline;
    ctx.stroke();

    // Country outlines + highlights
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

    // Sphere outline
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = COLORS.sphereOutline;
    ctx.lineWidth = hairline;
    ctx.stroke();

    drawMarkerAndConnector(layout, hairline);
  }

  function lerpColorStroke(weight) {
    var r = Math.round(lerp(244, 201, weight));
    var g = Math.round(lerp(246, 169, weight));
    var b = Math.round(lerp(248, 106, weight));
    var a = lerp(0.16, 1, weight);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function drawMarkerAndConnector(layout, hairline) {
    if (allLit || activeRegionIndex < 0) return;

    var region = REGIONS[activeRegionIndex];
    var xy = projection(region.anchor);
    if (!xy) return;

    var pulse = isReduced ? 1 : 1 + Math.sin(pulsePhase) * 0.35;
    var markerR = 4 * pulse;

    ctx.beginPath();
    ctx.arc(xy[0], xy[1], markerR, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.marker;
    ctx.fill();

    if (layout.mobile || innerWidth < 992) return;

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

  function getScrollProgress() {
    var stage = document.querySelector('.stage');
    if (!stage) return 0;
    var rawScroll = Math.max(0, -stage.getBoundingClientRect().top);
    var maxScroll = stage.offsetHeight - innerHeight;
    if (maxScroll <= 0) return 0;
    var pageProgress = clamp(rawScroll / maxScroll, 0, 1);
    return clamp((pageProgress - 0.75) / 0.25, 0, 1);
  }

  function updateFromScroll() {
    var step3 = document.querySelector('.step-3');
    var opacity = step3 ? parseFloat(step3.style.opacity || '0') : 0;
    step3Visible = opacity > 0.05;

    if (scrim) {
      scrim.style.opacity = step3Visible ? String(Math.min(1, opacity * 1.2)) : '0';
    }
    canvas.style.opacity = step3Visible ? String(Math.min(1, opacity * 1.2)) : '0';

    if (!step3Visible || isReduced) return;

    var prog = getScrollProgress();
    var totalBeats = REGIONS.length + 0.5;
    var beatFloat = prog * totalBeats;
    var beatIndex = Math.floor(beatFloat);
    var beatFrac = beatFloat - beatIndex;

    if (beatIndex >= REGIONS.length) {
      allLit = true;
      regionWeights = REGIONS.map(function () { return 1; });
      renderPanel(-1);
      targetRotation = anchorToRotation(REGIONS[REGIONS.length - 1].anchor);
    } else {
      allLit = false;
      regionWeights = REGIONS.map(function (_, i) {
        if (i === beatIndex) return clamp(beatFrac * 1.5, 0, 1);
        if (i === beatIndex - 1) return clamp(1 - beatFrac * 1.5, 0, 1);
        return 0;
      });
      targetRotation = anchorToRotation(REGIONS[beatIndex].anchor);
      renderPanel(beatIndex);
    }
  }

  function tick() {
    if (!isReduced) {
      pulsePhase += 0.08;
      easeRotation();
    }
    updateFromScroll();
    drawGlobe();
    if (!isReduced) requestAnimationFrame(tick);
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

    var step3Section = document.querySelector('.step-3 .d-section');
    if (step3Section) {
      step3Section.innerHTML = '';
      step3Section.style.flexDirection = 'column';
      step3Section.style.alignItems = 'center';
      step3Section.style.gap = '24px';
      step3Section.style.padding = '80px var(--d-pad) 120px';

      REGIONS.forEach(function (r) {
        var panel = document.createElement('div');
        panel.className = 'glass-panel';
        panel.innerHTML =
          '<div class="panel-header"><h2 class="d-display region-name">' + r.region + '</h2></div>' +
          '<div class="panel-content"><div class="verticals-chips">' +
          r.verticals.map(function (v) { return '<div class="v-chip show">' + v + '</div>'; }).join('') +
          '</div></div>';
        step3Section.appendChild(panel);
      });
    }

    if (scrim) scrim.style.opacity = '1';
    canvas.style.opacity = '1';
    step3Visible = true;
    drawGlobe();
  }

  function initBentoFallback() {
    document.body.classList.add('fallback-mode', 'bento-fallback-mode');
    if (scrim) scrim.style.opacity = '1';

    var step3 = document.querySelector('.step-3');
    if (step3) {
      step3.style.opacity = '1';
      step3.style.pointerEvents = 'auto';
    }

    var step3Section = document.querySelector('.step-3 .d-section');
    if (!step3Section) return;

    step3Section.innerHTML =
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
    targetRotation = anchorToRotation(REGIONS[0].anchor);
    currentRotation = targetRotation.slice();

    loadTopology()
      .then(function () {
        topologyReady = true;
        if (isReduced) {
          initReducedMotion();
          return;
        }
        renderPanel(0);
        tick();
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

    window.addEventListener('scroll', function () {
      if (isReduced) return;
      updateFromScroll();
    }, { passive: true });
  }

  if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
    initBentoFallback();
    return;
  }

  initGlobe();
})();
