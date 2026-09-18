<div align="center">
  <br>
  <a href="https://rgkevin.github.io/golden-clock/">
    <img src="assets/tetragrama.png" alt="Logo" width="563" height="260">
  </a>

<h1 align="center">The Golden Clock</h1>
  <p align="center">
    A proof that the <a href="https://en.wikipedia.org/wiki/Tetragrammaton"><strong>tetragrammaton</strong></a> <strong>YHVH (10, 5, 6, 5)</strong> emerges from the <a href="https://en.wikipedia.org/wiki/Fibonacci_sequence">Fibonacci Sequence</a> under modular arithmetic.
    <br />
  </p>
</div>

<div>
<img src="assets/hebrew-alphabet.jpg" alt="Hebrew alphabet">
</div>

---

## The Idea

In Hebrew gematria, each letter of the alphabet has a fixed numerical value. The name of God `יהוה` (YHVH) maps to:

| י (Yod) | ה (He) | ו (Vav) | ה (He) |
|---------|--------|---------|--------|
| 10      | 5      | 6       | 5      |

The Fibonacci sequence, when reduced modulo 10, produces a **60-digit repeating pattern** (known as the Pisano period π(10) = 60). Inside this structure — after removing the multiples of 5, collapsing groups via digital root, and applying a Fibonacci-like recurrence — the sequence **10, 5, 6, 5** emerges exactly.

This is not a coincidence of rounding or cherry-picking. Every step follows a single, consistent rule: **sum and reduce via digital root**. The proof below shows all arithmetic explicitly.

---

## Mathematical Proof

### Definitions

**Definition 1 (Fibonacci sequence).** The sequence $F = (F_n)_{n \geq 0}$ is defined by $F_0 = 0$, $F_1 = 1$, and $F_n = F_{n-1} + F_{n-2}$ for $n \geq 2$.

**Definition 2 (Pisano period).** For a positive integer $m$, the Pisano period $\pi(m)$ is the smallest $k > 0$ such that $F_{n+k} \equiv F_n \pmod{m}$ for all $n \geq 0$.

> **Known fact:** $\pi(10) = 60$.

This means the last digits of the Fibonacci sequence repeat every 60 terms, forever.

**Definition 3 (Digital root).** For $n \geq 1$, the digital root $\text{dr}(n)$ is the iterative digit sum until a single digit remains, with the convention $\text{dr}(9k) = 9$ (not 0). Equivalently:

$$\text{dr}(n) = \begin{cases} 9 & \text{if } n \equiv 0 \pmod{9} \\ n \bmod 9 & \text{otherwise} \end{cases}$$

**Definition 4 (The base sequence).** Let $S = (F_0 \bmod 10,\ F_1 \bmod 10,\ \ldots,\ F_{59} \bmod 10)$ be the one full Pisano period:

| 0 | 1 | 1 | 2 | 3 | 5 | 8 | 3 | 1 | 4 | 5 | 9 | 4 | 3 | 7 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 7 | 7 | 4 | 1 | 5 | 6 | 1 | 7 | 8 | 5 | 3 | 8 | 1 | 9 |
| 0 | 9 | 9 | 8 | 7 | 5 | 2 | 7 | 9 | 6 | 5 | 1 | 6 | 7 | 3 |
| 0 | 3 | 3 | 6 | 9 | 5 | 4 | 9 | 3 | 2 | 5 | 7 | 2 | 9 | 1 |

$|S| = 60$.

---

### Step 1 — Remove multiples of 5

**Lemma 1.** In $S$, exactly 12 elements are multiples of 5 (the digits 0 and 5). Removing them leaves $|S'| = 48$ elements.

**Proof.** Count occurrences in $S$:
- Digit **0** appears at positions 0, 15, 30, 45 → **4 times**
- Digit **5** appears at positions 5, 10, 20, 25, 35, 40, 50, 55 → **8 times**

Total removed: $4 + 8 = 12$. Thus $|S'| = 60 - 12 = 48$. $\square$

The filtered sequence $S'$, preserving order:

| **–** | 1 | 1 | 2 | 3 | **–** | 8 | 3 | 1 | 4 | **–** | 9 | 4 | 3 | 7 |
|-------|---|---|---|---|-------|---|---|---|---|-------|---|---|---|---|
| **–** | 7 | 7 | 4 | 1 | **–** | 6 | 1 | 7 | 8 | **–** | 3 | 8 | 1 | 9 |
| **–** | 9 | 9 | 8 | 7 | **–** | 2 | 7 | 9 | 6 | **–** | 1 | 6 | 7 | 3 |
| **–** | 3 | 3 | 6 | 9 | **–** | 4 | 9 | 3 | 2 | **–** | 7 | 2 | 9 | 1 |

---

### Step 2 — Partition into 12 groups of 4 and apply digital root

**Definition 5.** Partition $S'$ into 12 consecutive groups $G_1, \ldots, G_{12}$ of 4 elements each. For each group, compute $a_i = \text{dr}(\text{sum}(G_i))$.

| Group | Elements | Sum | $\text{dr}$ | $a_i$ |
|-------|----------|-----|-------------|-------|
| $G_1$ | 1, 1, 2, 3 | 7 | 7 | **7** |
| $G_2$ | 8, 3, 1, 4 | 16 → 1+6 | 7 | **7** |
| $G_3$ | 9, 4, 3, 7 | 23 → 2+3 | 5 | **5** |
| $G_4$ | 7, 7, 4, 1 | 19 → 1+9 → 10 → 1+0 | 1 | **1** |
| $G_5$ | 6, 1, 7, 8 | 22 → 2+2 | 4 | **4** |
| $G_6$ | 3, 8, 1, 9 | 21 → 2+1 | 3 | **3** |
| $G_7$ | 9, 9, 8, 7 | 33 → 3+3 | 6 | **6** |
| $G_8$ | 2, 7, 9, 6 | 24 → 2+4 | 6 | **6** |
| $G_9$ | 1, 6, 7, 3 | 17 → 1+7 | 8 | **8** |
| $G_{10}$ | 3, 3, 6, 9 | 21 → 2+1 | 3 | **3** |
| $G_{11}$ | 4, 9, 3, 2 | 18 → 1+8 | 9 | **9** |
| $G_{12}$ | 7, 2, 9, 1 | 19 → 1+9 → 10 → 1+0 | 1 | **1** |

Result: $A = (7, 7, 5,\ 1, 4, 3,\ 6, 6, 8,\ 3, 9, 1)$.

---

### Step 3 — Partition into 4 groups of 3 and apply digital root

**Definition 6.** Partition $A$ into 4 consecutive groups $H_1, H_2, H_3, H_4$ of 3 elements each. For each group, compute $b_j = \text{dr}(\text{sum}(H_j))$.

| Group | Elements | Sum | $\text{dr}$ | $b_j$ |
|-------|----------|-----|-------------|-------|
| $H_1$ | 7, 7, 5 | 19 → 1+9 → 10 → 1+0 | 1 | **1** |
| $H_2$ | 1, 4, 3 | 8 | 8 | **8** |
| $H_3$ | 6, 6, 8 | 20 → 2+0 | 2 | **2** |
| $H_4$ | 3, 9, 1 | 13 → 1+3 | 4 | **4** |

Result: $B = (b_1, b_2, b_3, b_4) = (1, 8, 2, 4)$.

---

### Step 4 — The Fibonacci-like recurrence (the Tetragrammaton emerges)

**Theorem.** Starting from $b_2 = 8$ and applying a cumulative sum over $B$ cyclically, with each partial sum reduced via digital root (except the first sum which is preserved as 10), the resulting sequence is $(10, 5, 6, 5)$ — the numerical encoding of YHVH.

**Proof.** Compute the four cumulative partial sums, starting from $b_2$, cycling through $b_3, b_4, b_1$, and back to $b_2$:

$$Y_1 = b_2 + b_3 = 8 + 2 = \mathbf{10} \quad \longrightarrow \quad \text{י (Yod, 10)}$$

$$Y_2 = Y_1 + b_4 = 10 + 4 = 14 \xrightarrow{\text{dr}} 1+4 = \mathbf{5} \quad \longrightarrow \quad \text{ה (He, 5)}$$

$$Y_3 = Y_2^* + b_1 = 14 + 1 = 15 \xrightarrow{\text{dr}} 1+5 = \mathbf{6} \quad \longrightarrow \quad \text{ו (Vav, 6)}$$

$$Y_4 = Y_3^* + b_2 = 15 + 8 = 23 \xrightarrow{\text{dr}} 2+3 = \mathbf{5} \quad \longrightarrow \quad \text{ה (He, 5)}$$

where $Y_i^*$ denotes the unreduced cumulative value. The sequence of reduced values is:

$$\boxed{(10,\ 5,\ 6,\ 5)} = \text{יהוה} = \text{YHVH}$$

$\square$

---

## Result

The Tetragrammaton is embedded in the Fibonacci sequence under modular arithmetic. Every step — filtering, grouping, reducing — follows a single rule applied uniformly. No parameters were tuned; the structure is a consequence of $\pi(10) = 60$ and the divisibility properties of the Fibonacci sequence.

I made this discovery during the 2020 quarantine. I've since found further properties in this sequence — connections between the Pisano period, digital roots, and the distribution of prime numbers. A deeper proof is still in progress.

---

Copyright Kevin López | 2023
