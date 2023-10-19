
# The Golden Clock

  

I found the [tetragrammaton](https://en.wikipedia.org/wiki/Tetragrammaton) word `YHVH (5 6 5 10)` inside the [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence).

Using [modular arithmetic](https://brilliant.org/wiki/modular-arithmetic/) with `modulo 10` the fibonacci sequence has a 60 numbers repeat pattern.

| 0 | 1 | 1 | 2 | 3 | 5 | 8 | 3 | 1 | 4 | 5 | 9 | 4 | 3 | 7 |
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
| 0 | 7 | 7 | 4 | 1 | 5 | 6 | 1 | 7 | 8 | 5 | 3 | 8 | 1 | 9 |
| 0 | 9 | 9 | 8 | 7 | 5 | 2 | 7 | 9 | 6 | 5 | 1 | 6 | 7 | 3 |
| 0 | 3 | 3 | 6 | 9 | 5 | 4 | 9 | 3 | 2 | 5 | 7 | 2 | 9 | 1 |

If you take off the numbers 0 and 5 from the sequence you got 12 groups of 4 numbers each.

| - | 1 | 1 | 2 | 3 | - | 8 | 3 | 1 | 4 | - | 9 | 4 | 3 | 7 |
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
| - | 7 | 7 | 4 | 1 | - | 6 | 1 | 7 | 8 | - | 3 | 8 | 1 | 9 |
| - | 9 | 9 | 8 | 7 | - | 2 | 7 | 9 | 6 | - | 1 | 6 | 7 | 3 |
| - | 3 | 3 | 6 | 9 | - | 4 | 9 | 3 | 2 | - | 7 | 2 | 9 | 1 |

If you sum the 4 digits of each group and then apply `modulo 9` you got 12 numbers.

| 7 | 7 | 5 |
|--|--|--|
| 1 | 4 | 3 |
| 6 | 6 | 8 |
| 3 | 9 | 1 |
  
Divide the 12 numbers in groups of 3 and sum them. You got 4 numbers: 1 8 2 4.

| 1 |
|--|
| 8 |
| 2 |
| 4 |

Now you start summing starting from number 8, and then apply modulo 9 except for the number 10:

```
              8 + 2 = 10
10 + 4 = 14 = 1 + 4 =  5
14 + 1 = 15 = 1 + 5 =  6
15 + 8 = 23 = 2 + 3 =  5
```

  

There you go, the `tetragrammaton` inside fibonacci sequence.

I made this discovery during the 2020 quarantine.
