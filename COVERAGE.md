# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-20 | **Testuota:** 1,498 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 98.59%   |
| **Branches**   | 92.25%   |
| **Functions**  | 98.35%   |
| **Lines**      | 98.81%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

*Nėra failų su coverage < 70%*

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`SwipePanel.tsx`** - 82.25% branch coverage (linija: 71 - sunku testuoti, reikia kelių aktyvių panelų vienu metu)
2. **`DetailsBox.tsx`** - 82.41% branch coverage (linijos: 52, 130 - colon validacija ir loading timeout)
3. **`VariantBox.tsx`** - 82.79% branch coverage (linijos: 55, 134, 145 - colon validacija, loading timeout, copyVariant)
4. **`GroupBox.tsx`** - 83.67% branch coverage (linija: 104 - loading timeout su 300ms delay)

### P2 - Žemas (Branch Coverage 85-95%)

*Failai su coverage virš 85% nelaikomi prioritetais*

---

## ✅ Pabaigti / Patobulinti

- **`VariantBox.tsx`** - padidinta nuo 81.72% iki 82.79%
- **`ValueCell.tsx`** - 100% coverage
- **`useLongPress.ts`** - 85% coverage (virš slenksčio)
- **`SwipeableTableRow.tsx`** - pagerinta coverage pridėjus edge case testus

---

## ⚠️ Sunku arba Neįmanoma Testuoti

### Loading State Delays (300ms setTimeout)
Šie failai turi loading state su 300ms delay, kuris sunkiai testuojamas su `jest.useFakeTimers()`:
- **`GroupBox.tsx` linija 104**
- **`VariantBox.tsx` linija 134**
- **`DetailsBox.tsx` linija 130**

**Problemos:**
- `jest.useFakeTimers()` trikdo `userEvent` ir kitus asinchroninius testus
- Reikalingas atskiras test suite su izoliuotais fake timers setup/teardown
- Galima testuoti, bet reikia perdarinėti esamus testus

### SwipePanel Multiple Active Panels
- **`SwipePanel.tsx` linija 71** - Reikia kelių aktyvių panelų vienu metu, o komponento logika sukurta vienam aktyviam panelui

### Form Validation Edge Cases
- **`VariantBox.tsx` linija 55, `DetailsBox.tsx` linija 52** - Group field colon validacija Mantine Select komponente sunku testuoti, nes reikia `clear()` ir `type()` veiksmų

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
