# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-27 | **Testuota:** 1,384 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 98.21%   |
| **Branches**   | 89.95%   |
| **Functions**  | 97.61%   |
| **Lines**      | 98.41%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

1. **`ValueBox.tsx`** - 75.67% branch coverage
2. **`ValueCell.tsx`** - 84.61% branch coverage
3. **`ValueInput.tsx`** - 81.48% branch coverage
4. **`ConfirmationDialog.tsx`** - 82.35% branch coverage
5. **`ActiveRemoveConfirmation.tsx`** - 78.57% branch coverage

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`ImportBox.tsx`** - 83.33% branch coverage
2. **`SwipePanel.tsx`** - 75.8% branch coverage
3. **`useReorderHandler.ts`** - 78.57% branch coverage
4. **`DetailsBox.tsx`** - 78.02% branch coverage
5. **`useLabels.ts`** - 77.77% branch coverage
6. **`useLongPress.ts`** - 84.21% branch coverage
7. **`ActiveContentOutsideClick.tsx`** - 84.61% branch coverage
8. **`GroupBox.tsx`** - 81.63% branch coverage

### P2 - Žemas Function Coverage

1. **`GroupsPage.tsx`** - 66.66% function coverage
2. **`UpdatingDetailsContext.tsx`** - 87.5% function coverage

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
