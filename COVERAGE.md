# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-20 | **Testuota:** 1,500 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 99.10%   |
| **Branches**   | 93.48%   |
| **Functions**  | 98.58%   |
| **Lines**      | 99.34%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

_Nėra failų su coverage < 70%_

### P1 - Vidutinis (Branch Coverage 70-85%)

- **`DetailsBox.tsx`** - 83.14% branch coverage (linija: 130 - loading timeout su 300ms delay)
- **`VariantBox.tsx`** - 83.51% branch coverage (linijos: 134, 145 - loading timeout, copyVariant)
- **`GroupBox.tsx`** - 83.67% branch coverage (linija: 104 - loading timeout su 300ms delay)

### P2 - Žemas (Branch Coverage 85-95%)

- **`SwipePanel.tsx`** - 88.88% branch coverage (200ms animacijos delay)

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
