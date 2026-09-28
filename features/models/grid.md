# Grid Model — Reloj de la Formación

Reglas que definen la geometría del reloj. Toda posición visual debe derivarse de estas reglas, no de coordenadas hardcodeadas.

---

## GRD-00 — Unidad de casilla

El círculo completo se divide en **60 secciones iguales**. Cada sección ocupa **6°** de arco. A cada sección se le llama **casilla**. El círculo tiene exactamente 60 casillas, numeradas de 0 a 59.

## GRD-01 — Anillo exterior

El anillo exterior contiene las 60 casillas. Cada casilla aloja un dígito de la secuencia de Fibonacci módulo 10. Esta secuencia tiene período 60, por eso el anillo exterior tiene exactamente 60 casillas.

## GRD-02 — Origen de la secuencia

El **borde inicial de la casilla 0** coincide con el **eje x+** (0°, equivalente a las 3:00 en un reloj analógico). El eje x+ es una línea divisoria, no el centro de ninguna casilla.

- En orientación antihoraria: la casilla 0 ocupa de 0° a 6° en sentido CCW, su centro visual está en 3° CCW desde el eje x+.
- En orientación horaria: la casilla 0 ocupa de 0° a 6° en sentido CW, su centro visual está en 3° CW desde el eje x+.

La línea en 0° marca el inicio del índice 0, no su posición.

## GRD-03 — Orientación de la secuencia

La secuencia puede fluir en dos sentidos:

- **Antihorario** (sentido positivo matemático, CCW): los índices crecen en dirección contraria a las agujas del reloj. Este es el estado actual/por defecto.
- **Horario** (CW): los índices crecen en la dirección de las agujas del reloj.

Un botón en la interfaz permite invertir la orientación. Cambiar la orientación re-mapea visualmente todas las casillas sin alterar los valores ni la lógica de segmentos.

## GRD-04 — Anillos interiores

Los anillos interiores están compuestos por **segmentos**. Un segmento:

- Pertenece a un nivel de anillo específico.
- Ocupa N casillas consecutivas.
- Su posición se define por el índice de casilla inicial y final (entre 0 y 59, soportando wrap mod 60).

Los segmentos son la proyección radial de agrupaciones de casillas del anillo exterior hacia el interior.

---

## GRD-05 — Casillas separadoras

La secuencia Fibonacci mod 10 tiene la propiedad de que en todo índice múltiplo de 5, el valor es siempre 0 o 5:

- **fib = 0** en índices: 0, 15, 30, 45 (múltiplos de 15) → separadores mayores
- **fib = 5** en índices: 5, 10, 20, 25, 35, 40, 50, 55 (múltiplos de 5 que no son de 15) → separadores menores

Estas casillas actúan como **fronteras naturales** de los segmentos. Ningún segmento las incluye como contenido; son los límites entre segmentos.

## GRD-06 — Nivel 1: 12 segmentos de 4 casillas

- 12 segmentos, cada uno ocupa **4 casillas**.
- Las fronteras son las casillas separadoras (múltiplos de 5).
- Fórmula: segmento `i` → `startIdx = i*5 + 1`, `endIdx = (i+1)*5` (exclusivo).
- El valor mostrado es la raíz digital de la suma de los 4 dígitos fib del segmento.

## GRD-07 — Nivel 2: 4 cuadrantes de 14 casillas

- 4 segmentos, cada uno ocupa **14 casillas** (equivale a 3 segmentos de nivel 1).
- Las fronteras son los separadores mayores (fib = 0, múltiplos de 15: índices 0, 15, 30, 45).
- Fórmula: cuadrante `j` → `startIdx = j*15 + 1`, `endIdx = (j+1)*15` (exclusivo).

## GRD-08 — Niveles 3–6: segmentos medios (arco de 174°)

Los cuatro anillos más interiores contienen cada uno **un único segmento** que abarca 29 casillas (174° de arco, aproximadamente medio círculo). Cada nivel rota **15 casillas (90°)** respecto al nivel anterior, formando un patrón en espiral:

| Nivel | Anillo | startIdx | endIdx (visual) | Centro aproximado |
|-------|--------|----------|-----------------|-------------------|
| 3     | Ring 4 | 16       | 45              | eje y−  (270°)    |
| 4     | Ring 5 | 31       | 59              | eje x−  (180°... wrap) |
| 5     | Ring 6 | 46       | 14 (wrap)       | eje y+  (90°)     |
| 6     | Ring 7 | 1        | 29              | eje x+  (0°)      |

La regla es: cada nivel interior desplaza su inicio **+15 casillas** respecto al nivel anterior, con wrap mod 60.
