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

const DR     = n => n === 0 ? 0 : ((n - 1) % 9) + 1;
const posRad = i => i * 6 * D2R; // ángulo CCW desde eje X

// Punto en coords SVG (Y invertido respecto a matemáticas)
const pt = (r, a) => [CX + r * Math.cos(a), CY - r * Math.sin(a)];

// Sector de dona (arco CCW de a → b, radio interior/exterior)
function sector(a, b, rIn, rOut) {
  const [x1, y1] = pt(rOut, a);
  const [x2, y2] = pt(rOut, b);
  const [x3, y3] = pt(rIn, b);
  const [x4, y4] = pt(rIn, a);
  const large = (b - a) > Math.PI ? 1 : 0;
  const f = n => n.toFixed(3);
  return `M${f(x1)} ${f(y1)} A${rOut} ${rOut} 0 ${large} 0 ${f(x2)} ${f(y2)} `
       + `L${f(x3)} ${f(y3)} A${rIn} ${rIn} 0 ${large} 1 ${f(x4)} ${f(y4)} Z`;
}

function mk(tag) { return document.createElementNS(svgNS, tag); }

// Separación angular entre segmentos adyacentes (1° = 1/6 de posición)
const ARC_GAP = 1 / 6;

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

// ── Helpers para añadir rellenos y etiquetas en sus capas ─
const arcFills  = document.querySelector('#arc-fills');
const arcLabels = document.querySelector('#arc-labels');

function addFill(d, cls) {
  const p = mk('path');
  p.setAttribute('d', d);
  p.setAttribute('class', 'arc-fill ' + cls);
  arcFills.append(p);
}

function addLabel(tx, ty, aMidRad, cls, text) {
  const svgRot = 90 - (aMidRad * 180 / Math.PI);
  const t = mk('text');
  t.setAttribute('x', tx.toFixed(3));
  t.setAttribute('y', ty.toFixed(3));
  t.setAttribute('transform', `rotate(${svgRot.toFixed(2)},${tx.toFixed(3)},${ty.toFixed(3)})`);
  t.setAttribute('class', 'arc-label ' + cls);
  t.textContent = text;
  arcLabels.append(t);
}

// ── Anillo de grupos: 12 arcos, R 28–36 ──────────────────
const [RG_OUT, RG_IN] = [36, 28];
const RG_MID = (RG_OUT + RG_IN) / 2;

for (let k = 0; k < 12; k++) {
  const digits = [fib[5*k+1], fib[5*k+2], fib[5*k+3], fib[5*k+4]];
  const value  = DR(digits.reduce((s, d) => s + d, 0));
  const aStart = posRad(5*k + 1 + ARC_GAP);
  const aEnd   = posRad(5*k + 5 - ARC_GAP);
  const aMid   = posRad(5*k + 3);

  addFill(sector(aStart, aEnd, RG_IN, RG_OUT), 'group-arc');
  const [tx, ty] = pt(RG_MID, aMid);
  addLabel(tx, ty, aMid, 'group-label', value);
}

// ── Anillo de cuadrantes: 4 arcos, R 20–28 ───────────────
const [RQ_OUT, RQ_IN] = [28, 20];
const RQ_MID = (RQ_OUT + RQ_IN) / 2;
const tetValues = [1, 8, 2, 4];

for (let q = 0; q < 4; q++) {
  const aStart = posRad(15*q + 1 + ARC_GAP);
  const aEnd   = posRad(15*q + 15 - ARC_GAP);
  const aMid   = posRad(15*q + 8);

  addFill(sector(aStart, aEnd, RQ_IN, RQ_OUT), 'quad-arc');
  const [tx, ty] = pt(RQ_MID, aMid);
  addLabel(tx, ty, aMid, 'quad-label', tetValues[q]);
}

// ── Arcos de acumulación ──────────────────────────────────
// Ambos parten del inicio del cuadrante Q1/8 (posición 16 = 96°).
// Acum1: 8+2=10 → llega al 2 (posición 45 = 270°)
// Acum2: 10+4=14 → llega al 4 (posición 60 = 360°)
const accumStart = posRad(16 + ARC_GAP);
const accumRings = [
  { rOut: 20, rIn: 12, aEnd: posRad(45 - ARC_GAP), label: '10' },
  { rOut: 12, rIn:  4, aEnd: posRad(60 - ARC_GAP), label: '14' },
];

for (const { rOut, rIn, aEnd, label } of accumRings) {
  const rMid = (rOut + rIn) / 2;
  addFill(sector(accumStart, aEnd, rIn, rOut), 'accum-arc');
  const aMid = (accumStart + aEnd) / 2;
  const [tx, ty] = pt(rMid, aMid);
  addLabel(tx, ty, aMid, 'accum-label', label);
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
