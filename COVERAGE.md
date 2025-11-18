# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-27 | **Testuota:** 1,462 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 98.54%   |
| **Branches**   | 91.81%   |
| **Functions**  | 98.35%   |
| **Lines**      | 98.76%   |

---

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

1. **`ToolbarGroupFilter.tsx`** - 69.23% branch coverage
2. **`ToolbarFilter.tsx`** - 66.67% branch coverage

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`useSetDetailsMissing.ts`** - 75% branch coverage
2. **`MissingOnlyCheckbox.tsx`** - 75% branch coverage
3. **`useActiveSwipe.ts`** - 75% branch coverage
4. **`VariantBox.tsx`** - 77.41% branch coverage
5. **`useLoginSuccess.ts`** - 80% branch coverage
6. **`useSetDetailsRemoving.ts`** - 80% branch coverage
7. **`useLongPress.ts`** - 80% branch coverage
8. **`ValueInput.tsx`** - 81.48% branch coverage
9. **`GroupBox.tsx`** - 81.63% branch coverage
10. **`SwipePanel.tsx`** - 82.25% branch coverage
11. **`ConfirmationDialog.tsx`** - 82.35% branch coverage
12. **`DetailsBox.tsx`** - 82.41% branch coverage
13. **`useIsAnnual.ts`** - 83.33% branch coverage
14. **`SwipeableTableRow.tsx`** - 84.02% branch coverage
15. **`ActiveContentOutsideClick.tsx`** - 84.61% branch coverage

### P2 - Žemas (Branch Coverage 85-95%)

1. **`ValueRow.tsx`** - 85.71% branch coverage
2. **`ActiveVariantBox.tsx`** - 87.5% branch coverage
3. **`ProfileAvatar.tsx`** - 87.5% branch coverage
4. **`ActiveGroupBox.tsx`** - 87.5% branch coverage
5. **`ActiveDetailsBox.tsx`** - 87.5% branch coverage
6. **`ActiveRemoveConfirmation.tsx`** - 87.5% branch coverage
7. **`amounts.ts`** - 88.89% branch coverage
8. **`useLabels.ts`** - 88.89% branch coverage
9. **`ActiveValueBox.tsx`** - 90.9% branch coverage
10. **`ValueBox.tsx`** - 91.42% branch coverage

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
