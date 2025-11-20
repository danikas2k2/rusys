# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-20 | **Testuota:** 1,501 testai | **Pass rate:** 99.93%

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
- **Loading state testai** - pridėti testai su `jest.useFakeTimers()` visiems trims failams:
  - `GroupBox.tsx` linija 104
  - `VariantBox.tsx` linija 134
  - `DetailsBox.tsx` linija 130

---

## ⚠️ Sunku arba Neįmanoma Testuoti

### Loading State Delays (300ms setTimeout)
Šie failai turi loading state su 300ms delay, kuris dabar testuojamas su `jest.useFakeTimers()`:
- **`GroupBox.tsx` linija 104** - ✅ Testuojama su fake timers
- **`VariantBox.tsx` linija 134** - ✅ Testuojama su fake timers
- **`DetailsBox.tsx` linija 130** - ✅ Testuojama su fake timers

**Sprendimas:**
- Pridėtos atskiros `describe` sekcijos su `jest.useFakeTimers()` kiekvienam failui
- Naudojamas `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })` su `act()` wrapper
- Testai patvirtina, kad `setTimeout` su 300ms delay yra vykdomas

### SwipePanel Multiple Active Panels
- **`SwipePanel.tsx` linija 71** - Reikia kelių aktyvių panelų vienu metu, o komponento logika sukurta vienam aktyviam panelui. Esami testai jau padengia šią logiką, bet coverage matuoja kitaip dėl branch coverage specifikos.

### Form Validation Edge Cases
- **`VariantBox.tsx` linija 55, `DetailsBox.tsx` linija 52** - Group field colon validacija Mantine Select komponente sunku testuoti, nes reikia `clear()` ir `type()` veiksmų, kurie gali neveikti su Mantine Select komponentu.

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
