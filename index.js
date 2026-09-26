const svgNS = 'http://www.w3.org/2000/svg';
const CX = 50, CY = 50;
const D2R = Math.PI / 180;

// Fibonacci mod 10 — 60 posiciones. Posición 0 en 0° (eje X, derecha), sentido anti-horario.
const fib = [];
let [fa, fb] = [0, 1];
for (let i = 0; i < 60; i++) {
  fib.push(fa);
  [fa, fb] = [fb, (fa + fb) % 10];
}

const posRad = i => i * 6 * D2R; // ángulo CCW desde eje X

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

// ── Retícula radial ───────────────────────────────────────
// Líneas de límite (posRad(i)): separadores hasta R=46, resto hasta R=44.
// Líneas de centro de casilla (posRad(i+0.5)): pasan por el centro de cada dígito, hasta R=44.
const grid = document.querySelector('#radial-grid');
for (let i = 0; i < 60; i++) {
  // Línea de límite (borde izquierdo de la casilla i)
  const a = posRad(i);

  // Determina si esta línea debe sobresalir:
  // - Si fib[i] es 0 o 5
  // - O si la línea anterior (fib[i-1]) es 0 o 5
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
// Dígitos centrados en su casilla (i+0.5). Círculos r=2 → gap de 2 unidades con R=36 y R=44.
const ringDigits = document.querySelector('#ring-digits');
for (let i = 0; i < 60; i++) {
  const d = fib[i];
  const [x, y] = pt(42, posRad(i + 0.5));

  // Excepción del anillo 1: cada casilla conserva su mini-círculo.
  const c = mk('circle');
  c.setAttribute('cx', x.toFixed(3));
  c.setAttribute('cy', y.toFixed(3));
  c.setAttribute('r', '2');
  c.setAttribute('class', 'digit-cell');
  ringDigits.append(c);

  // Orientación radial: el dígito apunta hacia el centro (pie hacia adentro)
  const angleDeg = (i + 0.5) * 6;
  const svgRot   = 90 - angleDeg;

  const t = mk('text');
  t.setAttribute('x', x.toFixed(3));
  t.setAttribute('y', y.toFixed(3));
  t.setAttribute('transform', `rotate(${svgRot.toFixed(2)},${x.toFixed(3)},${y.toFixed(3)})`);
  t.setAttribute('class', d === 0 ? 'fib-zero' : d === 5 ? 'fib-five' : 'fib-digit');
  t.textContent = d;
  ringDigits.append(t);
}

// ── Segmentos: 12 grupos de 4 casillas ───────────────────
// Cada divisor (0 o 5) queda fuera: el segmento ocupa las cuatro
// casillas internas entre ese divisor y el siguiente.
const segments = document.querySelector('#segments');
const segmentLabels = document.querySelector('#segment-labels');
const SEGMENT_IN = 32;
const SEGMENT_OUT = 36;
const SEGMENT_MID = (SEGMENT_IN + SEGMENT_OUT) / 2;
const digitalRoot = n => n === 0 ? 0 : ((n - 1) % 9) + 1;

for (let i = 0; i < 12; i++) {
  const segment = mk('path');
  segment.setAttribute('d', segmentPath(posRad(i * 5 + 1), posRad((i + 1) * 5), SEGMENT_IN, SEGMENT_OUT));
  segment.setAttribute('class', 'segment');
  segments.append(segment);

  const value = digitalRoot(fib.slice(i * 5 + 1, i * 5 + 5).reduce((sum, digit) => sum + digit, 0));
  const labelAngle = posRad(i * 5 + 3);
  const [x, y] = pt(SEGMENT_MID, labelAngle);
  const label = mk('text');
  label.setAttribute('x', x.toFixed(3));
  label.setAttribute('y', y.toFixed(3));
  label.setAttribute('transform', `rotate(${(90 - (labelAngle * 180 / Math.PI)).toFixed(2)},${x.toFixed(3)},${y.toFixed(3)})`);
  label.setAttribute('class', 'segment-label');
  label.textContent = value;
  segmentLabels.append(label);
}

// ── Anillo 2: 4 segmentos grandes ─────────────────────────
// Ancho: 4 (radio 24-28), mismo que anillo 1.
const ring2Arcs = document.querySelector('#ring2-arcs');
const ring2Segments = document.querySelector('#ring2-segments');
const ring2Labels = document.querySelector('#ring2-labels');
const RING2_IN = 24;
const RING2_OUT = 28;
const RING2_MID = (RING2_IN + RING2_OUT) / 2;

// Mapeo de valores para las etiquetas del anillo 2
const valueMap = { 2: 1, 9: 8, 3: 2, 5: 4 };
const mapValue = v => valueMap[v] !== undefined ? valueMap[v] : v;

// Segmentos identificados por número: 1, 8, 2, 4
// Índices de línea para cada segmento
const segments2 = [
  { name: 1, startIdx: 1, endIdx: 15 },
  { name: 8, startIdx: 16, endIdx: 30 },
  { name: 2, startIdx: 31, endIdx: 45 },
  { name: 4, startIdx: 46, endIdx: 60 }
];

for (const seg of segments2) {
  // Crear arcos (líneas del anillo)
  const arc = mk('path');
  arc.setAttribute('d', segmentPath(posRad(seg.startIdx), posRad(seg.endIdx % 60), RING2_IN, RING2_OUT));
  arc.setAttribute('class', 'ring2-arc');
  ring2Arcs.append(arc);

  // Crear segmento (relleno)
  const segment = mk('path');
  segment.setAttribute('d', segmentPath(posRad(seg.startIdx), posRad(seg.endIdx % 60), RING2_IN, RING2_OUT));
  segment.setAttribute('class', 'ring2-segment');
  ring2Segments.append(segment);

  // Suma de dígitos Fibonacci entre estos índices
  const sliceEnd = seg.endIdx === 60 ? 60 : seg.endIdx;
  const value = digitalRoot(fib.slice(seg.startIdx, sliceEnd).reduce((sum, digit) => sum + digit, 0));
  const displayValue = mapValue(value);
  const labelAngle = posRad(seg.startIdx + (seg.endIdx - seg.startIdx) / 2);
  const [x, y] = pt(RING2_MID, labelAngle);
  const label = mk('text');
  label.setAttribute('x', x.toFixed(3));
  label.setAttribute('y', y.toFixed(3));
  label.setAttribute('transform', `rotate(${(90 - (labelAngle * 180 / Math.PI)).toFixed(2)},${x.toFixed(3)},${y.toFixed(3)})`);
  label.setAttribute('class', 'ring2-label');
  label.textContent = displayValue;
  ring2Labels.append(label);
}

// ── Control de animación ──────────────────────────────────
const dial = document.querySelector('svg');
const animationToggle = document.querySelector('#animation-toggle');
let dialAnimation;

function updateAnimation() {
  const transform = getComputedStyle(dial).transform;
  const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
  const angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;

  if (dialAnimation) {
    dialAnimation.onfinish = null;
    dialAnimation.cancel();
  }

  if (animationToggle.checked) {
    dialAnimation = dial.animate(
      [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${angle + 360}deg)` }],
      { duration: 150000, iterations: Infinity, easing: 'linear' }
    );
  } else {
    dialAnimation = dial.animate(
      [{ transform: `rotate(${angle}deg)` }, { transform: 'rotate(0deg)' }],
      { duration: 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
    dialAnimation.onfinish = () => {
      dial.style.transform = 'rotate(0deg)';
      dialAnimation.cancel();
      dialAnimation = null;
    };
  }
}

animationToggle.addEventListener('change', updateAnimation);
updateAnimation();
