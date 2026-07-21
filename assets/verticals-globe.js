import createGlobe from './vendor/cobe.js';

// Placeholder data - swap in real customer verticals and regions once confirmed
const regionsData = [
  { region: 'Middle East', location: [25.20, 55.27], verticals: ['Retail', 'Hospitality', 'Fuel & Energy', 'Banking & Financial Services'] },
  { region: 'Europe', location: [51.51, -0.13], verticals: ['Automotive', 'Telecommunications', 'E-Commerce'] },
  { region: 'Asia Pacific', location: [1.35, 103.82], verticals: ['Restaurants & Cafés', 'Healthcare', 'Lifestyle'] },
  { region: 'Americas', location: [40.71, -74.01], verticals: ['Entertainment', 'Enterprise Organisations'] }
];

const cobeCanvas = document.getElementById('cobe-canvas');
const connectorCanvas = document.getElementById('connector-canvas');
const earthCanvas = document.getElementById('earth');
const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let globe = null;

function locationToAngles(lat, long) {
  return [
    Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180
  ];
}

function checkWebGL() {
  // Probe on a throwaway canvas. Calling getContext() on cobeCanvas here would
  // lock in a context with default attributes — every later getContext() returns
  // that same context and ignores the attributes cobe asks for, so the globe
  // initialises against the wrong context and renders nothing.
  try {
    if (!window.WebGLRenderingContext) return false;
    var probe = document.createElement('canvas');
    return !!(probe.getContext('webgl') || probe.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

let currentPhi = 0;
let currentTheta = 0;
let targetPhi = 0;
let targetTheta = 0;
let activeRegionIndex = -1;
let allLit = false;
let mapSamples = 16000;
let globeWidth = 1000;
let globeHeight = 1000;

function renderPanel(index) {
   if (index === activeRegionIndex) return;
   activeRegionIndex = index;
   
   const panel = document.getElementById('verticals-panel');
   if (!panel) return;

   if (index === -1) {
      panel.style.opacity = '0';
      return;
   }
   
   panel.style.opacity = '1';
   const r = regionsData[index];
   const title = document.getElementById('region-name');
   if (title) title.innerText = r.region;
   
   const chipsContainer = document.getElementById('verticals-chips');
   if (chipsContainer) {
       chipsContainer.innerHTML = r.verticals.map(v => `<div class="v-chip">${v}</div>`).join('');
       // Stagger in
       setTimeout(() => {
          const chips = chipsContainer.querySelectorAll('.v-chip');
          chips.forEach((c, i) => {
             setTimeout(() => { c.classList.add('show'); }, i * 60);
          });
       }, 50);
   }
}

function getScrollProgress() {
   const stage = document.querySelector('.stage');
   if (!stage) return 0;
   const rawScroll = Math.max(0, -stage.getBoundingClientRect().top);
   const globeStart = innerHeight * 4.5; 
   const maxScroll = stage.offsetHeight - innerHeight;
   const globeSpace = maxScroll - globeStart;
   if (globeSpace <= 0) return 0;
   return Math.max(0, Math.min(1, (rawScroll - globeStart) / globeSpace));
}

function drawConnector() {
   if (!connectorCanvas) return;
   const dpr = Math.min(window.devicePixelRatio || 1, 2);
   const ctx = connectorCanvas.getContext('2d');
   
   if (!connectorCanvas || !ctx) return;
   
   ctx.clearRect(0, 0, connectorCanvas.width, connectorCanvas.height);
   
   if (activeRegionIndex === -1 || allLit || innerWidth < 992) {
       return;
   }
   
   const panel = document.getElementById('verticals-panel');
   if (!panel) return;
   const panelRect = panel.getBoundingClientRect();
   const panelX = panelRect.left * dpr;
   const panelY = (panelRect.top + panelRect.height / 2) * dpr;
   
   const cx = connectorCanvas.width / 2;
   const cy = connectorCanvas.height / 2;
   const r = regionsData[activeRegionIndex];
   const targetAngles = locationToAngles(r.location[0], r.location[1]);
   const dPhi = targetAngles[0] - currentPhi;
   const dTheta = targetAngles[1] - currentTheta;
   
   const R = Math.min(connectorCanvas.width, connectorCanvas.height) * 0.42;
   const markerX = cx + Math.sin(dPhi) * Math.cos(dTheta) * R;
   const markerY = cy - Math.sin(dTheta) * R; 
   if (!panel) return;
   ctx.beginPath();
   ctx.moveTo(markerX, markerY);
   ctx.lineTo(panelX, panelY);
   ctx.strokeStyle = 'rgba(201, 169, 106, 1)'; // var(--d-accent) fully opaque
   ctx.lineWidth = 2 * dpr;
   ctx.stroke();
   
   // Dot
   ctx.beginPath();
   ctx.arc(markerX, markerY, 4 * dpr, 0, Math.PI * 2);
   ctx.fillStyle = '#c9a96a';
   ctx.fill();
}

function initGlobe() {
   let dpr = Math.min(window.devicePixelRatio || 1, 2);
   
   function resizeConnectorCanvas() {
       if (!connectorCanvas) return;
       connectorCanvas.width = innerWidth * dpr;
       connectorCanvas.height = innerHeight * dpr;
       connectorCanvas.style.width = innerWidth + 'px';
       connectorCanvas.style.height = innerHeight + 'px';
   }

   function setup() {
       if (globe) globe.destroy();
       mapSamples = innerWidth < 768 ? 8000 : 16000;
       // Square, in CSS pixels. cobe applies devicePixelRatio itself, so passing
       // pre-multiplied dimensions here scales the canvas twice and pushes the
       // sphere's centre off-screen. Square because cobe inscribes the globe in
       // the canvas — a 16:9 canvas renders an ellipse.
       const side = Math.round(Math.min(innerWidth, innerHeight) * 0.92);
       globeWidth = side;
       globeHeight = side;

       let markers = regionsData.map(r => ({
           location: r.location,
           size: 0.03,
           id: r.region
       }));

       globe = createGlobe(cobeCanvas, {
          devicePixelRatio: dpr,
          width: globeWidth,
          height: globeHeight,
          phi: currentPhi,
          theta: currentTheta,
          dark: 0.55,
          diffuse: 1.6,
          mapSamples: mapSamples,
          mapBrightness: 12,
          // Landmass dots. The previous value sat at roughly the same luminance
          // as the page background, so the continents were invisible.
          baseColor: [0.34, 0.35, 0.40],
          markerColor: [0.79, 0.66, 0.42], // --d-accent
          glowColor: [0.20, 0.17, 0.13],
          markers: markers,
          onRender: (state) => {
             // Easing
             currentPhi += (targetPhi - currentPhi) * 0.08;
             currentTheta += (targetTheta - currentTheta) * 0.08;
             // Idle drift
             currentPhi += 0.003;

             state.phi = currentPhi;
             state.theta = currentTheta;
             
             // Update marker sizes dynamically
             /*state.markers.forEach((m, i) => {
                 let targetSize = 0.03;
                 if (allLit) targetSize = 0.06;
                 else if (i === activeRegionIndex) targetSize = 0.08;
                 
                 if (m._currentSize === undefined) m._currentSize = 0.03;
                 m._currentSize += (targetSize - m._currentSize) * 0.1;
                 m.size = m._currentSize;
             });*/

             drawConnector();
          }
       });

       // cobe writes its own inline width/height onto the canvas, which would
       // otherwise override the stylesheet's inset:0 sizing.
       cobeCanvas.style.width = side + 'px';
       cobeCanvas.style.height = side + 'px';
       cobeCanvas.style.left = '50%';
       cobeCanvas.style.top = '50%';
       cobeCanvas.style.right = 'auto';
       cobeCanvas.style.bottom = 'auto';
       cobeCanvas.style.transform = 'translate(-50%, -50%)';
   }
   
   // Debounced: setup() tears down and rebuilds the WebGL globe, and mobile
   // browsers fire resize continuously while the address bar collapses.
   let resizeTimer = null;
   window.addEventListener('resize', () => {
       clearTimeout(resizeTimer);
       resizeTimer = setTimeout(() => {
           dpr = Math.min(window.devicePixelRatio || 1, 2);
           setup();
           resizeConnectorCanvas();
       }, 200);
   });
   
   setup();
   resizeConnectorCanvas();
   
   let isCrossfaded = false;
   let pauseTimer = null;
   if (earthCanvas) earthCanvas.style.transition = 'opacity 0.6s ease';

   window.addEventListener('scroll', () => {
       const stage = document.querySelector('.stage');
       if (!stage) return;
       const rawScroll = Math.max(0, -stage.getBoundingClientRect().top);
       const crossfadeTrigger = innerHeight * 4.2;

       if (rawScroll > crossfadeTrigger && !isCrossfaded) {
           isCrossfaded = true;
           cobeCanvas.style.opacity = '1';
           if (earthCanvas) earthCanvas.style.opacity = '0';
           // Pause the frame loop only once the fade has finished. Cancel any
           // pending pause first — crossing the trigger and scrolling straight
           // back used to leave this timer armed, so it fired after the reverse
           // had already unpaused and froze the Earth on a cleared canvas.
           clearTimeout(pauseTimer);
           pauseTimer = setTimeout(() => { if (window.DracoEarth) window.DracoEarth.pause = true; }, 600);
       } else if (rawScroll <= crossfadeTrigger && isCrossfaded) {
           isCrossfaded = false;
           clearTimeout(pauseTimer);
           pauseTimer = null;
           cobeCanvas.style.opacity = '0';
           if (earthCanvas) earthCanvas.style.opacity = '1';
           if (window.DracoEarth) window.DracoEarth.resume();
       }

       const prog = getScrollProgress();
       const totalBeats = regionsData.length + 0.5;
       let beatIndex = Math.floor(prog * totalBeats);
       
       if (beatIndex < regionsData.length) {
           allLit = false;
           let r = regionsData[beatIndex];
           let angles = locationToAngles(r.location[0], r.location[1]);
           targetPhi = angles[0];
           targetTheta = angles[1];
           renderPanel(beatIndex);
       } else {
           allLit = true;
           renderPanel(-1); 
       }
   }, { passive: true });
   
   // Initial trigger
   let r0 = regionsData[0];
   let a0 = locationToAngles(r0.location[0], r0.location[1]);
   targetPhi = a0[0];
   targetTheta = a0[1];
   renderPanel(0);
}

function initFallback() {
  document.body.classList.add('fallback-mode');
  const step3 = document.querySelector('.step-3 .d-section');
  if (step3) {
      step3.innerHTML = '';
      regionsData.forEach(r => {
         const panel = document.createElement('div');
         panel.className = 'glass-panel';
         panel.innerHTML = `
            <div class="panel-header">
               <h2 class="d-display region-name">${r.region}</h2>
            </div>
            <div class="panel-content">
               <div class="verticals-chips">
                  ${r.verticals.map(v => `<div class="v-chip show">${v}</div>`).join('')}
               </div>
            </div>
         `;
         step3.appendChild(panel);
      });
  }
  
  if (checkWebGL()) {
      let m = regionsData.map(r => ({ location: r.location, size: 0.06, id: r.region }));
      cobeCanvas.style.opacity = '1';
      if (earthCanvas) earthCanvas.style.opacity = '0';
      createGlobe(cobeCanvas, {
          devicePixelRatio: 2,
          width: innerWidth * 2, height: innerHeight * 2,
          phi: 0, theta: 0,
          dark: 1, diffuse: 1.2, mapSamples: 8000, mapBrightness: 6,
          baseColor: [0.16, 0.18, 0.22],
          markerColor: [0.79, 0.66, 0.42],
          glowColor: [0.12, 0.14, 0.18],
          markers: m,
          onRender: () => {}
      });
  }
}

if (!checkWebGL() || isReduced) {
  initFallback();
} else {
  initGlobe();
}
