# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-20 | **Testuota:** 1,500 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 99.03%   |
| **Branches**   | 93.19%   |
| **Functions**  | 98.47%   |
| **Lines**      | 99.31%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

_Nėra failų su coverage < 70%_

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`SwipePanel.tsx`** - 82.25% branch coverage (linija: 71 - sunku testuoti, reikia kelių aktyvių panelų vienu metu)
2. **`DetailsBox.tsx`** - 83.14% branch coverage (linija: 130 - loading timeout su 300ms delay)
3. **`VariantBox.tsx`** - 83.51% branch coverage (linijos: 134, 145 - loading timeout, copyVariant)
4. **`GroupBox.tsx`** - 83.67% branch coverage (linija: 104 - loading timeout su 300ms delay)

### P2 - Žemas (Branch Coverage 85-95%)

_Failai su coverage virš 85% nelaikomi prioritetais_

---

## ⚠️ Sunku arba Neįmanoma Testuoti

### SwipePanel Multiple Active Panels

- **`SwipePanel.tsx` linija 71** - Reikia kelių aktyvių panelų vienu metu, o komponento logika sukurta vienam aktyviam panelui. Esami testai jau padengia šią logiką, bet coverage matuoja kitaip dėl branch coverage specifikos.


---

## Kaip paleisti testus

```bash
# Paleisti visus testus su coverage
pnpm test --coverage

# Paleisti visus testus be coverage
pnpm test

# Paleisti konkretaus failo testą
pnpm test ValueRow.test.tsx

# Paleisti testus watch mode
pnpm test -- --watch

# Žiūrėti HTML coverage reportą
open coverage/lcov-report/index.html

# Žiūrėti coverage summary
cat coverage/coverage-summary.json
```

---

**Coverage data:** Jest coverage report (`pnpm test --coverage`)  
**Test framework:** Jest 30.2.0 + React Testing Library 16.3.0
