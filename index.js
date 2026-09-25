// Un período completo de Fibonacci módulo 10: 60 posiciones de 6 grados.
const fibonacciRing = document.querySelector('#fibonacci-ring');
const svgNamespace = 'http://www.w3.org/2000/svg';
let currentDigit = 0;
let nextDigit = 1;

for (let index = 0; index < 60; index += 1) {
  const segment = document.createElementNS(svgNamespace, 'g');
  // El primer cero queda a la izquierda, como en la disposición original.
  segment.setAttribute('transform', `rotate(${index * 6 - 90} 50 50)`);
  segment.dataset.segmentIndex = index;

  const digit = document.createElementNS(svgNamespace, 'text');
  digit.setAttribute('x', '50');
  digit.setAttribute('y', '10');
  digit.setAttribute('class', currentDigit === 0 ? 'fibonacci-zero' : currentDigit === 5 ? 'fibonacci-five' : 'fibonacci-digit');
  digit.textContent = currentDigit;
  segment.append(digit);
  fibonacciRing.append(segment);

  [currentDigit, nextDigit] = [nextDigit, (currentDigit + nextDigit) % 10];
}

const dial = document.querySelector('svg');
const animationToggle = document.querySelector('#animation-toggle');
let dialAnimation;

function updateAnimation() {
  // Leer el ángulo visible antes de cancelar, incluso durante el regreso.
  const transform = getComputedStyle(dial).transform;
  const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
  const angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;

  if (dialAnimation) {
    dialAnimation.onfinish = null;
    dialAnimation.cancel();
  }

  if (animationToggle.checked) {
    dialAnimation = dial.animate(
      [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${angle - 360}deg)` }],
      { duration: 150000, iterations: Infinity, easing: 'linear' }
    );
  } else {
    // El ángulo normalizado vuelve a cero en un máximo de media vuelta.
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

// Mantener las letras de cada navegador independientes del control de animación.
const browserName = typeof bowser !== 'undefined'
  ? bowser.getParser(window.navigator.userAgent).getBrowserName().toLowerCase()
  : (/^((?!chrome|android).)*safari/i.test(window.navigator.userAgent) ? 'safari' : 'other');

document.querySelector(browserName === 'safari' ? '.safari-only' : '.chrome-only').style.display = 'inline';
