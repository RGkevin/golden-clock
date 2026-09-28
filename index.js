const svgNS = 'http://www.w3.org/2000/svg';
const CX = 50, CY = 50;
const D2R = Math.PI / 180;

// Fibonacci mod 10 — 60 posiciones. Posición 0 en 0° (eje X, derecha).
const fib = [];
let [fa, fb] = [0, 1];
for (let i = 0; i < 60; i++) {
  fib.push(fa);
  [fa, fb] = [fb, (fa + fb) % 10];
}

// -1 = CW (Normal / horario), 1 = CCW (Anti horario)
let direction = -1;

const posRad = i => i * 6 * D2R;

// Punto en coords SVG (Y invertido respecto a matemáticas)
const pt = (r, a) => [CX + r * Math.cos(a), CY - r * Math.sin(a)];

// Contorno de una banda segmentada entre dos radios.
function segmentPath(a, b, rIn, rOut) {
  const [x1, y1] = pt(rOut, a);
  const [x2, y2] = pt(rOut, b);
  const [x3, y3] = pt(rIn, b);
  const [x4, y4] = pt(rIn, a);
  const f = n => n.toFixed(3);
  return `M${f(x1)} ${f(y1)} A${rOut} ${rOut} 0 0 0 ${f(x2)} ${f(y2)} `
       + `L${f(x3)} ${f(y3)} A${rIn} ${rIn} 0 0 1 ${f(x4)} ${f(y4)} Z`;
}

function mk(tag) { return document.createElementNS(svgNS, tag); }

// En CW el índice i muestra el valor que en CCW estaba en (60-i)%60
const fibAt = i => fib[direction === -1 ? (60 - i) % 60 : i];

// Suma de dígitos Fibonacci en un rango (soporta wrap)
function rangeSum(startIdx, endIdx) {
  let s = 0;
  for (let i = 0; i < endIdx - startIdx; i++) s += fibAt((startIdx + i) % 60);
  return s;
}

// Índices involucrados en un rango (set, soporta wrap)
function rangeSet(startIdx, endIdx) {
  const s = new Set();
  for (let i = 0; i < endIdx - startIdx; i++) s.add((startIdx + i) % 60);
  return s;
}

const digitalRoot = n => n === 0 ? 0 : ((n - 1) % 9) + 1;

// Genera texto de descomposición: "23=2+3=5"
function mkDecompStr(rawSum) {
  if (rawSum <= 9) return null;
  const digits = String(rawSum).split('').map(Number);
  const s1 = digits.reduce((a, b) => a + b, 0);
  if (s1 <= 9) return `${rawSum}=${digits.join('+')}=${s1}`;
  const d2 = String(s1).split('').map(Number);
  return `${rawSum}=${digits.join('+')}=${s1}=${d2.join('+')}=${d2.reduce((a,b)=>a+b,0)}`;
}

// ── Estado de interactividad ──────────────────────────────────
const allInteractive = [];
let selectedSeg = null;
const decompLabels = document.querySelector('#decomp-labels');

function makeDecompEl(rawSum, labelAngle, midR) {
  const text = mkDecompStr(rawSum);
  if (!text) return null;
  const r = midR - 1.8;
  const [dx, dy] = pt(r, labelAngle);
  const rotDeg = 90 - (labelAngle * 180 / Math.PI);
  const el = mk('text');
  el.setAttribute('x', dx.toFixed(3));
  el.setAttribute('y', dy.toFixed(3));
  el.setAttribute('transform', `rotate(${rotDeg.toFixed(2)},${dx.toFixed(3)},${dy.toFixed(3)})`);
  el.setAttribute('class', 'decomp-text');
  el.textContent = text;
  decompLabels.append(el);
  return el;
}

function registerSeg(pathEl, startIdx, endIdx, rawSum, labelAngle, midR, level) {
  const decompEl = rawSum != null ? makeDecompEl(rawSum, labelAngle, midR) : null;
  allInteractive.push({ pathEl, startIdx, endIdx, decompEl, level });
  pathEl.addEventListener('click', () => handleSegClick(pathEl));
}

function rangesOverlap(s1, e1, s2, e2) {
  const set2 = rangeSet(s2, e2);
  for (let i = 0; i < e1 - s1; i++) if (set2.has((s1 + i) % 60)) return true;
  return false;
}

function clearAll() {
  allInteractive.forEach(s => {
    s.pathEl.classList.remove('seg-dimmed');
    if (s.decompEl) s.decompEl.classList.remove('decomp-visible');
  });
  document.querySelectorAll('[data-idx]').forEach(el =>
    el.classList.remove('digit-lit', 'digit-dim')
  );
}

function handleSegClick(pathEl) {
  const seg = allInteractive.find(s => s.pathEl === pathEl);
  if (!seg) return;

  if (selectedSeg === seg) {
    selectedSeg = null;
    clearAll();
    return;
  }

  selectedSeg = seg;
  clearAll();

  if (seg.level === 1) {
    // Ring 1: solo afecta dígitos del anillo exterior
    const lit = rangeSet(seg.startIdx, seg.endIdx);
    if (seg.decompEl) seg.decompEl.classList.add('decomp-visible');
    document.querySelectorAll('[data-idx]').forEach(el => {
      const idx = parseInt(el.dataset.idx);
      el.classList.toggle('digit-lit', lit.has(idx));
      el.classList.toggle('digit-dim', !lit.has(idx));
    });
  } else {
    // Ring N > 1: ilumina los segmentos del ring N-1 que se solapan con este rango
    const parentLevel = seg.level - 1;
    if (seg.decompEl) seg.decompEl.classList.add('decomp-visible');
    allInteractive.forEach(s => {
      if (s.level !== parentLevel) return;
      const overlaps = rangesOverlap(s.startIdx, s.endIdx, seg.startIdx, seg.endIdx);
      s.pathEl.classList.toggle('seg-dimmed', !overlaps);
    });
  }
}

// ── Renderizado del reloj (re-ejecutable al cambiar dirección) ──
function renderClock() {
  allInteractive.length = 0;
  selectedSeg = null;

  ['radial-grid', 'segments', 'segment-labels', 'ring-digits',
   'ring2-arcs', 'ring2-segments', 'ring2-labels',
   'ring4-arcs', 'ring4-segments', 'ring4-labels',
   'ring5-arcs', 'ring5-segments', 'ring5-labels',
   'ring6-arcs', 'ring6-segments', 'ring6-labels',
   'ring7-arcs', 'ring7-segments', 'ring7-labels',
   'decomp-labels'
  ].forEach(id => { document.querySelector(`#${id}`).innerHTML = ''; });

  // ── Retícula radial ───────────────────────────────────────
  const grid = document.querySelector('#radial-grid');
  for (let i = 0; i < 60; i++) {
    const a = posRad(i);
    let isZero = fib[i] === 0 || (i > 0 && fib[i-1] === 0);
    let isFive = fib[i] === 5 || (i > 0 && fib[i-1] === 5);
    let isSep = isZero || isFive;

    const [x, y] = pt(isSep ? 46 : 44, a);
    const line = mk('line');
    line.setAttribute('x1', '50'); line.setAttribute('y1', '50');
    line.setAttribute('x2', x.toFixed(3)); line.setAttribute('y2', y.toFixed(3));
    if      (isZero) line.classList.add('axis-zero');
    else if (isFive) line.classList.add('axis-five');
    else             line.classList.add('grid-fade');
    grid.append(line);
  }

  // ── Banda exterior: 60 dígitos ────────────────────────────
  const ringDigits = document.querySelector('#ring-digits');
  for (let i = 0; i < 60; i++) {
    const d = fibAt(i);
    const [x, y] = pt(42, posRad(i + 0.5));

    const c = mk('circle');
    c.setAttribute('cx', x.toFixed(3));
    c.setAttribute('cy', y.toFixed(3));
    c.setAttribute('r', '2');
    c.setAttribute('class', 'digit-cell');
    c.dataset.idx = i;
    ringDigits.append(c);

    const svgRot = 90 - (i + 0.5) * 6;

    const t = mk('text');
    t.setAttribute('x', x.toFixed(3));
    t.setAttribute('y', y.toFixed(3));
    t.setAttribute('transform', `rotate(${svgRot.toFixed(2)},${x.toFixed(3)},${y.toFixed(3)})`);
    t.setAttribute('class', d === 0 ? 'fib-zero' : d === 5 ? 'fib-five' : 'fib-digit');
    t.dataset.idx = i;
    t.textContent = d;
    ringDigits.append(t);
  }

  // ── Segmentos: 12 grupos de 4 casillas ───────────────────
  const segments = document.querySelector('#segments');
  const segmentLabels = document.querySelector('#segment-labels');
  const SEGMENT_IN = 33;
  const SEGMENT_OUT = 36;
  const SEGMENT_MID = (SEGMENT_IN + SEGMENT_OUT) / 2;

  for (let i = 0; i < 12; i++) {
    const startIdx = i * 5 + 1;
    const endIdx = (i + 1) * 5;
    const raw = rangeSum(startIdx, endIdx);
    const value = digitalRoot(raw);
    const labelAngle = posRad(i * 5 + 3);

    const segment = mk('path');
    segment.setAttribute('d', segmentPath(posRad(startIdx), posRad(endIdx), SEGMENT_IN, SEGMENT_OUT));
    segment.setAttribute('class', 'segment');
    segments.append(segment);

    const [x, y] = pt(SEGMENT_MID, labelAngle);
    const label = mk('text');
    label.setAttribute('x', x.toFixed(3));
    label.setAttribute('y', y.toFixed(3));
    label.setAttribute('transform', `rotate(${(90 - (labelAngle * 180 / Math.PI)).toFixed(2)},${x.toFixed(3)},${y.toFixed(3)})`);
    label.setAttribute('class', 'segment-label');
    label.textContent = value;
    segmentLabels.append(label);

    registerSeg(segment, startIdx, endIdx, raw, labelAngle, SEGMENT_MID, 1);
  }

  // ── Anillo 2: 4 segmentos grandes ─────────────────────────
  const ring2Arcs = document.querySelector('#ring2-arcs');
  const ring2Segments = document.querySelector('#ring2-segments');
  const ring2Labels = document.querySelector('#ring2-labels');
  const RING2_IN = 28;
  const RING2_OUT = 31;
  const RING2_MID = (RING2_IN + RING2_OUT) / 2;

  const valueMap = { 2: 1, 9: 8, 3: 2, 5: 4 };
  const mapValue = v => valueMap[v] !== undefined ? valueMap[v] : v;

  const segments2 = [
    { name: 1, startIdx: 1,  endIdx: 15 },
    { name: 8, startIdx: 16, endIdx: 30 },
    { name: 2, startIdx: 31, endIdx: 45 },
    { name: 4, startIdx: 46, endIdx: 60 }
  ];

  for (const seg of segments2) {
    const arc = mk('path');
    arc.setAttribute('d', segmentPath(posRad(seg.startIdx), posRad(seg.endIdx % 60), RING2_IN, RING2_OUT));
    arc.setAttribute('class', 'ring2-arc');
    ring2Arcs.append(arc);

    const raw = rangeSum(seg.startIdx, seg.endIdx);
    const value = digitalRoot(raw);
    const displayValue = mapValue(value);
    const labelAngle = posRad(seg.startIdx + (seg.endIdx - seg.startIdx) / 2);

    const segment = mk('path');
    segment.setAttribute('d', segmentPath(posRad(seg.startIdx), posRad(seg.endIdx % 60), RING2_IN, RING2_OUT));
    segment.setAttribute('class', 'ring2-segment');
    ring2Segments.append(segment);

    const [x, y] = pt(RING2_MID, labelAngle);
    const label = mk('text');
    label.setAttribute('x', x.toFixed(3));
    label.setAttribute('y', y.toFixed(3));
    label.setAttribute('transform', `rotate(${(90 - (labelAngle * 180 / Math.PI)).toFixed(2)},${x.toFixed(3)},${y.toFixed(3)})`);
    label.setAttribute('class', 'ring2-label');
    label.textContent = displayValue;
    ring2Labels.append(label);

    registerSeg(segment, seg.startIdx, seg.endIdx, raw, labelAngle, RING2_MID, 2);
  }

  // ── Anillo 4: segmento grande ────────────────────────────
  const ring4Arcs = document.querySelector('#ring4-arcs');
  const ring4Segments = document.querySelector('#ring4-segments');
  const ring4Labels = document.querySelector('#ring4-labels');
  const RING4_IN = 23;
  const RING4_OUT = 26;
  const RING4_MID = (RING4_IN + RING4_OUT) / 2;

  const ring4Seg = { startIdx: 16, endIdx: 45 };

  const arc4 = mk('path');
  arc4.setAttribute('d', segmentPath(posRad(ring4Seg.startIdx), posRad(ring4Seg.endIdx), RING4_IN, RING4_OUT));
  arc4.setAttribute('class', 'ring4-arc');
  ring4Arcs.append(arc4);

  const segment4 = mk('path');
  segment4.setAttribute('d', segmentPath(posRad(ring4Seg.startIdx), posRad(ring4Seg.endIdx), RING4_IN, RING4_OUT));
  segment4.setAttribute('class', 'ring4-segment');
  ring4Segments.append(segment4);

  const labelAngle4 = posRad(ring4Seg.startIdx + (ring4Seg.endIdx - ring4Seg.startIdx) / 2);
  const [x4, y4] = pt(RING4_MID, labelAngle4);
  const label4 = mk('text');
  label4.setAttribute('x', x4.toFixed(3));
  label4.setAttribute('y', y4.toFixed(3));
  label4.setAttribute('transform', `rotate(${(90 - (labelAngle4 * 180 / Math.PI)).toFixed(2)},${x4.toFixed(3)},${y4.toFixed(3)})`);
  label4.setAttribute('class', 'ring4-label');
  label4.textContent = '10 · י';
  ring4Labels.append(label4);

  registerSeg(segment4, ring4Seg.startIdx, ring4Seg.endIdx + 1, null, labelAngle4, RING4_MID, 3);

  // ── Anillo 5: segmento grande ────────────────────────────
  const ring5Arcs = document.querySelector('#ring5-arcs');
  const ring5Segments = document.querySelector('#ring5-segments');
  const ring5Labels = document.querySelector('#ring5-labels');
  const RING5_IN = 18;
  const RING5_OUT = 21;
  const RING5_MID = (RING5_IN + RING5_OUT) / 2;

  const ring5Seg = { startIdx: 31, endIdx: 60 };

  const arc5 = mk('path');
  arc5.setAttribute('d', segmentPath(posRad(ring5Seg.startIdx), posRad(ring5Seg.endIdx % 60), RING5_IN, RING5_OUT));
  arc5.setAttribute('class', 'ring5-arc');
  ring5Arcs.append(arc5);

  const segment5 = mk('path');
  segment5.setAttribute('d', segmentPath(posRad(ring5Seg.startIdx), posRad(ring5Seg.endIdx % 60), RING5_IN, RING5_OUT));
  segment5.setAttribute('class', 'ring5-segment');
  ring5Segments.append(segment5);

  const labelAngle5 = posRad(ring5Seg.startIdx + (ring5Seg.endIdx - ring5Seg.startIdx) / 2);
  const [x5, y5] = pt(RING5_MID, labelAngle5);
  const label5 = mk('text');
  label5.setAttribute('x', x5.toFixed(3));
  label5.setAttribute('y', y5.toFixed(3));
  label5.setAttribute('transform', `rotate(${(90 - (labelAngle5 * 180 / Math.PI)).toFixed(2)},${x5.toFixed(3)},${y5.toFixed(3)})`);
  label5.setAttribute('class', 'ring5-label');
  label5.textContent = '5 · ה';
  ring5Labels.append(label5);

  registerSeg(segment5, ring5Seg.startIdx, ring5Seg.endIdx, null, labelAngle5, RING5_MID, 4);

  // ── Anillo 6: segmento grande ────────────────────────────
  const ring6Arcs = document.querySelector('#ring6-arcs');
  const ring6Segments = document.querySelector('#ring6-segments');
  const ring6Labels = document.querySelector('#ring6-labels');
  const RING6_IN = 13;
  const RING6_OUT = 16;
  const RING6_MID = (RING6_IN + RING6_OUT) / 2;

  const ring6Seg = { startIdx: 46, endIdx: 75 };

  const arc6 = mk('path');
  arc6.setAttribute('d', segmentPath(posRad(ring6Seg.startIdx), posRad(ring6Seg.endIdx % 60), RING6_IN, RING6_OUT));
  arc6.setAttribute('class', 'ring6-arc');
  ring6Arcs.append(arc6);

  const segment6 = mk('path');
  segment6.setAttribute('d', segmentPath(posRad(ring6Seg.startIdx), posRad(ring6Seg.endIdx % 60), RING6_IN, RING6_OUT));
  segment6.setAttribute('class', 'ring6-segment');
  ring6Segments.append(segment6);

  const labelAngle6 = posRad(ring6Seg.startIdx + (ring6Seg.endIdx - ring6Seg.startIdx) / 2);
  const [x6, y6] = pt(RING6_MID, labelAngle6);
  const label6 = mk('text');
  label6.setAttribute('x', x6.toFixed(3));
  label6.setAttribute('y', y6.toFixed(3));
  label6.setAttribute('transform', `rotate(${(90 - (labelAngle6 * 180 / Math.PI)).toFixed(2)},${x6.toFixed(3)},${y6.toFixed(3)})`);
  label6.setAttribute('class', 'ring6-label');
  label6.textContent = '6 · ו';
  ring6Labels.append(label6);

  registerSeg(segment6, ring6Seg.startIdx, ring6Seg.endIdx, null, labelAngle6, RING6_MID, 5);

  // ── Anillo 7: segmento grande ────────────────────────────
  const ring7Arcs = document.querySelector('#ring7-arcs');
  const ring7Segments = document.querySelector('#ring7-segments');
  const ring7Labels = document.querySelector('#ring7-labels');
  const RING7_IN = 8;
  const RING7_OUT = 11;
  const RING7_MID = (RING7_IN + RING7_OUT) / 2;

  const ring7Seg = { startIdx: 61, endIdx: 90 };

  const arc7 = mk('path');
  arc7.setAttribute('d', segmentPath(posRad(ring7Seg.startIdx % 60), posRad(ring7Seg.endIdx % 60), RING7_IN, RING7_OUT));
  arc7.setAttribute('class', 'ring7-arc');
  ring7Arcs.append(arc7);

  const segment7 = mk('path');
  segment7.setAttribute('d', segmentPath(posRad(ring7Seg.startIdx % 60), posRad(ring7Seg.endIdx % 60), RING7_IN, RING7_OUT));
  segment7.setAttribute('class', 'ring7-segment');
  ring7Segments.append(segment7);

  const labelAngle7 = posRad((ring7Seg.startIdx + (ring7Seg.endIdx - ring7Seg.startIdx) / 2) % 60);
  const [x7, y7] = pt(RING7_MID, labelAngle7);
  const label7 = mk('text');
  label7.setAttribute('x', x7.toFixed(3));
  label7.setAttribute('y', y7.toFixed(3));
  label7.setAttribute('transform', `rotate(${(90 - (labelAngle7 * 180 / Math.PI)).toFixed(2)},${x7.toFixed(3)},${y7.toFixed(3)})`);
  label7.setAttribute('class', 'ring7-label');
  label7.textContent = '5 · ה';
  ring7Labels.append(label7);

  registerSeg(segment7, ring7Seg.startIdx, ring7Seg.endIdx, null, labelAngle7, RING7_MID, 6);
}

renderClock();

// ── Control de animación ──────────────────────────────────
// +3° ancla el centro de casilla 0 en 12:00 (offset de medio-casilla, siempre CCW)
const INITIAL_ROT = 273;
const dial = document.querySelector('svg');
const animBtns = document.querySelectorAll('.anim-btn');
let dialAnimation = null;
let activeBtn = null;

function currentAngle() {
  const transform = getComputedStyle(dial).transform;
  const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
  return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
}

function stopAnimation() {
  const angle = currentAngle();
  if (dialAnimation) {
    dialAnimation.onfinish = null;
    dialAnimation.cancel();
    dialAnimation = null;
  }
  let target = INITIAL_ROT;
  const delta = ((target - angle) % 360 + 360) % 360;
  target = angle + (delta > 180 ? delta - 360 : delta);
  const anim = dial.animate(
    [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${target}deg)` }],
    { duration: 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
  );
  anim.onfinish = () => {
    dial.style.transform = `rotate(${INITIAL_ROT}deg)`;
    anim.cancel();
  };
}

function startAnimation(duration) {
  const angle = currentAngle();
  if (dialAnimation) {
    dialAnimation.onfinish = null;
    dialAnimation.cancel();
  }
  dialAnimation = dial.animate(
    [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${angle + direction * 360}deg)` }],
    { duration, iterations: Infinity, easing: 'linear' }
  );
}

animBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn === activeBtn) {
      btn.classList.remove('active');
      activeBtn = null;
      stopAnimation();
    } else {
      animBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBtn = btn;
      startAnimation(Number(btn.dataset.duration));
    }
  });
});

dial.style.transform = `rotate(${INITIAL_ROT}deg)`;

// ── Control de orientación ────────────────────────────────
const orientBtns = document.querySelectorAll('.orient-btn');

orientBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const newDir = btn.dataset.dir === 'cw' ? -1 : 1;
    if (newDir === direction) return;

    orientBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    direction = newDir;

    if (activeBtn) {
      activeBtn.classList.remove('active');
      activeBtn = null;
      if (dialAnimation) {
        dialAnimation.onfinish = null;
        dialAnimation.cancel();
        dialAnimation = null;
      }
      dial.style.transform = `rotate(${INITIAL_ROT}deg)`;
    }

    renderClock();
  });
});
