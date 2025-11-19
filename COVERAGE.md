# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-27 | **Testuota:** 1,497 testai | **Pass rate:** 99.67%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 98.59%   |
| **Branches**   | 92.24%   |
| **Functions**  | 98.35%   |
| **Lines**      | 98.81%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

_Nėra failų su coverage < 70%_

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`VariantBox.tsx`** - 81.72% branch coverage
2. **`SwipePanel.tsx`** - 82.25% branch coverage
3. **`DetailsBox.tsx`** - 82.41% branch coverage
4. **`GroupBox.tsx`** - 83.67% branch coverage
5. **`SwipeableTableRow.tsx`** - ~82-84% branch coverage

### P2 - Žemas (Branch Coverage 85-95%)

1. **`ValueRow.tsx`** - 85.71% branch coverage
2. **`ActiveVariantBox.tsx`** - 87.5% branch coverage
3. **`ProfileAvatar.tsx`** - 87.5% branch coverage
4. **`ActiveGroupBox.tsx`** - 87.5% branch coverage
5. **`ActiveDetailsBox.tsx`** - 87.5% branch coverage
6. **`ActiveRemoveConfirmation.tsx`** - 87.5% branch coverage
7. **`amounts.ts`** - 88.88% branch coverage
8. **`useLabels.ts`** - 88.88% branch coverage
9. **`ActiveValueBox.tsx`** - 90.9% branch coverage
10. **`ValueBox.tsx`** - 91.42% branch coverage

---

## ✅ Pabaigti (100% Coverage)

- **`ValueCell.tsx`** - 100% coverage (buvo 33.33%)

---

## ⚠️ Sunku arba Neįmanoma Testuoti

- **`GroupBox.tsx` linija 104** - Loading state su 300ms delay. Reikalauja fake timers, kurie trikdo kitus testus. Galima testuoti, bet reikia atskiros testų grupės su fake timers setup/teardown.

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
