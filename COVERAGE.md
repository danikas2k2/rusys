# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-27 | **Testuota:** 1,438 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 98.26%   |
| **Branches**   | 90.75%   |
| **Functions**  | 97.61%   |
| **Lines**      | 98.46%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

*Nėra failų su coverage < 70%*

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`ActiveRemoveConfirmation.tsx`** - 87.5% branch coverage (uncovered: 19)
2. **`ValueCell.tsx`** - 87.5% branch coverage (uncovered: 62-66)
3. **`ValueInput.tsx`** - 81.48% branch coverage
4. **`ConfirmationDialog.tsx`** - 82.35% branch coverage
5. **`SwipePanel.tsx`** - 82.25% branch coverage
6. **`DetailsBox.tsx`** - 82.41% branch coverage
7. **`useLongPress.ts`** - 84.21% branch coverage
8. **`ActiveContentOutsideClick.tsx`** - 84.61% branch coverage
9. **`GroupBox.tsx`** - 81.63% branch coverage

### P2 - Žemas (Branch Coverage 85-95%)

1. **`ValueBox.tsx`** - 91.42% branch coverage
2. **`useLabels.ts`** - 88.88% branch coverage

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
