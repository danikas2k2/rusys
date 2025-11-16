# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-11-16 | **Testuota:** 1,289 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage | Status                    |
| -------------- | -------- | ------------------------- |
| **Statements** | 97.57%   | ✅ Excellent              |
| **Branches**   | 87.71%   | ✅ THRESHOLD ACHIEVED! 🎉 |
| **Functions**  | 96.74%   | ✅ Excellent              |
| **Lines**      | 97.73%   | ✅ Excellent              |

**Naujausi pagerinimai (2025-11-16):**

- ✅ **Nauji testai sukurti failams be testų:**
  - `pointEvents.ts` → **100%** coverage (9 testai)
  - `AppVersion.tsx` → **100%** coverage (1 testas)
  - `Links.ts` → **100%** coverage (1 testas)
  - `DragHandle.tsx` → **100%** coverage (3 testai)
  - `GroupTitle.tsx` → **100%** coverage (3 testai)
  - `SortableContent.tsx` → **100%** coverage (2 testai)
  - `DraggableContent.tsx` → **100%** coverage (3 testai)
- ✅ **Iš viso pridėta:** 22 nauji testai
- ✅ **SwipeableTableRow.test.tsx** - Perdaryta naudoti `user.pointer()` vietoj `fireEvent.pointer*`
- ✅ **useLongPress.test.tsx** - Atnaujinta naudoti `dispatchNativeCancelEvents` vietoj `cancelAllLongPressTimers`

---

## 🎉 Progress Summary

**Seanso metu padaryta:** 7 failų testai sukurti + testų refactoring!

1. ✅ `pointEvents.ts` - 0% → **100%** (9 testai)
2. ✅ `AppVersion.tsx` - 0% → **100%** (1 testas)
3. ✅ `Links.ts` - 0% → **100%** (1 testas)
4. ✅ `DragHandle.tsx` - 0% → **100%** (3 testai)
5. ✅ `GroupTitle.tsx` - 0% → **100%** (3 testai)
6. ✅ `SortableContent.tsx` - 0% → **100%** (2 testai)
7. ✅ `DraggableContent.tsx` - 0% → **100%** (3 testai)

**Testų failai:**
- 🆕 `pointEvents.test.tsx` - Naujas testas sukurtas (9 testai)
- 🆕 `AppVersion.test.tsx` - Naujas testas sukurtas (1 testas)
- 🆕 `Links.test.ts` - Naujas testas sukurtas (1 testas)
- 🆕 `DragHandle.test.tsx` - Naujas testas sukurtas (3 testai)
- 🆕 `GroupTitle.test.tsx` - Naujas testas sukurtas (3 testai)
- 🆕 `SortableContent.test.tsx` - Naujas testas sukurtas (2 testai)
- 🆕 `DraggableContent.test.tsx` - Naujas testas sukurtas (3 testai)
- ✨ `SwipeableTableRow.test.tsx` - Perdaryta naudoti `user.pointer()` (45 testai)
- ✨ `useLongPress.test.tsx` - Atnaujinta naudoti `dispatchNativeCancelEvents`

---

## Bendras Coverage

**Naujausias patikrinimas: 2025-11-16**

### 📊 Globalinė statistika

- **Statements:** 97.57% ✅ 🚀
- **Branches:** 87.71% 🎉 **THRESHOLD ACHIEVED!**
- **Functions:** 96.74% ✅ 🎯
- **Lines:** 97.73% ✅ ⭐

### 🧪 Testai

- **Test Suites:** 200 total (**200 passed**, 0 failed) ✅
- **Tests:** 1,289 total (**1,289 passed**, 0 failed) ✅
- **Pass Rate:** **100%** 🎉
- **Laikas:** ~30-40 sekundės
- **Test framework:** Jest 30.2.0 + React Testing Library 16.3.0
- **Coverage threshold:** Branches 85% ✅ **ACHIEVED!**

### 📈 Pagerėjimai (Per visą laikotarpį)

- **Statements:** ~92.5% → **97.57%** (+5.07%) 🎉
- **Functions:** ~90.5% → **96.74%** (+6.24%) 🎉
- **Lines:** ~92.8% → **97.73%** (+4.93%) 🎉
- **Branches:** ~78% → **87.71%** (+9.71%) 🚀 **THRESHOLD ACHIEVED!**

---

## Failai, kuriems reikia padengti testais

### 🟡 Vidutinis Coverage (80-95%)

#### `src/client/theme.ts`

- **Line Coverage:** 85.71% (6/7)
- **Function Coverage:** 75% (3/4)
- **Branch Coverage:** 100%
- **Uncovered:** Line 27

**Funkcionalumas:** Theme configuration

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 27

---

#### `src/client/common/ChangeBadge.tsx`

- **Line Coverage:** 87.5% (7/8)
- **Branch Coverage:** 87.5% (7/8)
- **Function Coverage:** 100%
- **Uncovered:** Lines 17, 27, 37

**Funkcionalumas:** Change badge komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 17, 27, 37

---

#### `src/client/common/ConfirmationDialog.tsx`

- **Line Coverage:** 91.3% (21/23)
- **Branch Coverage:** 70.58% (12/17)
- **Function Coverage:** 80% (4/5)
- **Uncovered:** Lines 68, 75

**Funkcionalumas:** Confirmation dialog komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 68, 75
- [ ] Branch coverage pagerinimas (70.58% → 85%+)

---

#### `src/client/common/SwipePanel.tsx`

- **Line Coverage:** 95.55% (43/45)
- **Branch Coverage:** 75.8% (25/33)
- **Function Coverage:** 95.23% (20/21)
- **Uncovered:** Lines 28, 71

**Funkcionalumas:** Swipe panel komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 28, 71
- [ ] Branch coverage pagerinimas (75.8% → 85%+)

---

#### `src/client/common/hooks/useReorderHandler.ts`

- **Line Coverage:** 89.28% (25/28)
- **Branch Coverage:** 78.57% (11/14)
- **Function Coverage:** 75% (3/4)
- **Uncovered:** Lines 9-10, 46

**Funkcionalumas:** Reorder handler hook

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 9-10, 46
- [ ] Branch coverage pagerinimas (78.57% → 85%+)

---

#### `src/client/dialogs/ActiveImportBox.tsx`

- **Line Coverage:** 100% (8/8)
- **Branch Coverage:** 50% (1/2)
- **Function Coverage:** 66.66% (2/3)
- **Uncovered:** Line 9

**Funkcionalumas:** Active import box komponentas

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 9
- [ ] Branch coverage pagerinimas (50% → 85%+)

---

#### `src/client/dialogs/ImportBox.tsx`

- **Line Coverage:** 90.47% (38/42)
- **Branch Coverage:** 61.11% (11/18)
- **Function Coverage:** 83.33% (5/6)
- **Uncovered:** Lines 35, 40-41, 60

**Funkcionalumas:** Import box komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 35, 40-41, 60
- [ ] Branch coverage pagerinimas (61.11% → 85%+)

---

#### `src/client/hooks/useActiveSwipe.ts`

- **Line Coverage:** 100% (4/4)
- **Branch Coverage:** 75% (3/4)
- **Function Coverage:** 100%
- **Uncovered:** Line 5

**Funkcionalumas:** Active swipe hook

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 5
- [ ] Branch coverage pagerinimas (75% → 85%+)

---

#### `src/client/hooks/useGroupMatch.ts`

- **Line Coverage:** 100% (7/7)
- **Branch Coverage:** 50% (1/2)
- **Function Coverage:** 100%
- **Uncovered:** Line 5

**Funkcionalumas:** Group match hook

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 5
- [ ] Branch coverage pagerinimas (50% → 85%+)

---

#### `src/client/hooks/useLabels.ts`

- **Line Coverage:** 100% (11/11)
- **Branch Coverage:** 77.77% (7/9)
- **Function Coverage:** 100%
- **Uncovered:** Line 10

**Funkcionalumas:** Labels hook

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 10
- [ ] Branch coverage pagerinimas (77.77% → 85%+)

---

#### `src/client/hooks/useLongPress.ts`

- **Line Coverage:** 93.33% (42/45)
- **Branch Coverage:** 84.21% (32/38)
- **Function Coverage:** 90% (9/10)
- **Uncovered:** Lines 64, 84-85

**Funkcionalumas:** Long press hook

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 64, 84-85
- [ ] Branch coverage pagerinimas (84.21% → 85%+)

---

#### `src/client/pages/common/ActiveContentOutsideClick.tsx`

- **Line Coverage:** 93.33% (14/15)
- **Branch Coverage:** 84.61% (11/13)
- **Function Coverage:** 100%
- **Uncovered:** Line 12

**Funkcionalumas:** Active content outside click handler

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 12
- [ ] Branch coverage pagerinimas (84.61% → 85%+)

---

#### `src/client/pages/common/ActiveRemoveConfirmation.tsx`

- **Line Coverage:** 100% (28/28)
- **Branch Coverage:** 71.42% (5/7)
- **Function Coverage:** 100%
- **Uncovered:** Lines 19-26

**Funkcionalumas:** Active remove confirmation komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 19-26
- [ ] Branch coverage pagerinimas (71.42% → 85%+)

---

#### `src/client/pages/common/Page.tsx`

- **Line Coverage:** 100% (40/40)
- **Branch Coverage:** 50% (1/2)
- **Function Coverage:** 100%
- **Uncovered:** Lines 38-40

**Funkcionalumas:** Page layout komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 38-40
- [ ] Branch coverage pagerinimas (50% → 85%+)

---

#### `src/client/pages/details/DetailsBox.tsx`

- **Line Coverage:** 94.5% (86/91)
- **Branch Coverage:** 78.02% (32/41)
- **Function Coverage:** 92.85% (13/14)
- **Uncovered:** Lines 49, 52, 61, 121, 130

**Funkcionalumas:** Details box komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 49, 52, 61, 121, 130
- [ ] Branch coverage pagerinimas (78.02% → 85%+)

---

#### `src/client/pages/details/DetailsPage.tsx`

- **Line Coverage:** 100% (18/18)
- **Branch Coverage:** 100%
- **Function Coverage:** 66.66% (2/3)
- **Uncovered:** N/A (line coverage 100%)

**Funkcionalumas:** Details page komponentas

**Ką reikia padengti testais:**

- [ ] Function coverage pagerinimas (66.66% → 100%)

---

#### `src/client/pages/details/DetailsTable.tsx`

- **Line Coverage:** 100% (37/37)
- **Branch Coverage:** 92.85% (13/14)
- **Function Coverage:** 100%
- **Uncovered:** Line 37

**Funkcionalumas:** Details table komponentas

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 37
- [ ] Branch coverage pagerinimas (92.85% → 100%)

---

#### `src/client/pages/details/MissingOnlyCheckbox.tsx`

- **Line Coverage:** 100% (14/14)
- **Branch Coverage:** 75% (3/4)
- **Function Coverage:** 100%
- **Uncovered:** Line 13

**Funkcionalumas:** Missing only checkbox komponentas

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 13
- [ ] Branch coverage pagerinimas (75% → 85%+)

---

#### `src/client/pages/details/UpdatingDetailsContext.tsx`

- **Line Coverage:** 100% (8/8)
- **Branch Coverage:** 100%
- **Function Coverage:** 87.5% (7/8)
- **Uncovered:** N/A (line coverage 100%)

**Funkcionalumas:** Updating details context

**Ką reikia padengti testais:**

- [ ] Function coverage pagerinimas (87.5% → 100%)

---

#### `src/client/pages/details/ValueAmounts.tsx`

- **Line Coverage:** 100% (19/19)
- **Branch Coverage:** 50% (1/2)
- **Function Coverage:** 100%
- **Uncovered:** Line 18

**Funkcionalumas:** Value amounts komponentas

**Ką reikia padengti testais:**

- [ ] Testas, kuris padengia line 18
- [ ] Branch coverage pagerinimas (50% → 85%+)

---

#### `src/client/pages/details/ValueBox.tsx`

- **Line Coverage:** 93.75% (30/32)
- **Branch Coverage:** 64.86% (24/37)
- **Function Coverage:** 91.66% (11/12)
- **Uncovered:** Lines 70-73

**Funkcionalumas:** Value box komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 70-73
- [ ] Branch coverage pagerinimas (64.86% → 85%+)

---

#### `src/client/pages/details/ValueCell.tsx`

- **Line Coverage:** 89.28% (25/28)
- **Branch Coverage:** 69.23% (18/26)
- **Function Coverage:** 83.33% (5/6)
- **Uncovered:** Lines 41, 46-47

**Funkcionalumas:** Value cell komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 41, 46-47
- [ ] Branch coverage pagerinimas (69.23% → 85%+)

---

#### `src/client/pages/details/ValueInput.tsx`

- **Line Coverage:** 100% (83/83)
- **Branch Coverage:** 70.37% (19/27)
- **Function Coverage:** 100%
- **Uncovered:** Lines 37-48, 56, 74-75, 82

**Funkcionalumas:** Value input komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 37-48, 56, 74-75, 82
- [ ] Branch coverage pagerinimas (70.37% → 85%+)

---

#### `src/client/pages/details/ValueRow.tsx`

- **Line Coverage:** 100% (109/109)
- **Branch Coverage:** 85.71% (18/21)
- **Function Coverage:** 100%
- **Uncovered:** Lines 40, 103, 108

**Funkcionalumas:** Value row komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 40, 103, 108
- [ ] Branch coverage pagerinimas (85.71% → 100%)

---

#### `src/client/pages/groups/GroupBox.tsx`

- **Line Coverage:** 96.87% (62/64)
- **Branch Coverage:** 81.63% (40/49)
- **Function Coverage:** 90.9% (10/11)
- **Uncovered:** Lines 46, 104

**Funkcionalumas:** Group box komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 46, 104
- [ ] Branch coverage pagerinimas (81.63% → 85%+)

---

#### `src/client/pages/groups/GroupsPage.tsx`

- **Line Coverage:** 100% (12/12)
- **Branch Coverage:** 100%
- **Function Coverage:** 66.66% (2/3)
- **Uncovered:** N/A (line coverage 100%)

**Funkcionalumas:** Groups page komponentas

**Ką reikia padengti testais:**

- [ ] Function coverage pagerinimas (66.66% → 100%)

---

#### `src/client/pages/groups/GroupsTable.tsx`

- **Line Coverage:** 87.5% (28/32)
- **Branch Coverage:** 100%
- **Function Coverage:** 44.44% (4/9)
- **Uncovered:** Lines 32-36

**Funkcionalumas:** Groups table komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 32-36
- [ ] Function coverage pagerinimas (44.44% → 100%)

---

#### `src/client/pages/summary/hooks/useRecycledSummary.ts`

- **Line Coverage:** 100% (24/24)
- **Branch Coverage:** 50% (1/2)
- **Function Coverage:** 100%
- **Uncovered:** Lines 16-23

**Funkcionalumas:** Recycled summary hook

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 16-23
- [ ] Branch coverage pagerinimas (50% → 85%+)

---

#### `src/client/pages/variants/VariantsTable.tsx`

- **Line Coverage:** 77.41% (24/31)
- **Branch Coverage:** 0% (0/0)
- **Function Coverage:** 45.45% (5/11)
- **Uncovered:** Lines 34-46

**Funkcionalumas:** Variants table komponentas

**Ką reikia padengti testais:**

- [ ] Testai, kurie padengia lines 34-46
- [ ] Function coverage pagerinimas (45.45% → 100%)

---

## 🎯 Prioritetai Tolimesniam Darbui

### P0 - Aukštas (Branch Coverage < 70%)

1. **`VariantsTable.tsx`** - 0% branch coverage, 45.45% function coverage
2. **`ValueBox.tsx`** - 64.86% branch coverage
3. **`ValueCell.tsx`** - 69.23% branch coverage
4. **`ValueInput.tsx`** - 70.37% branch coverage
5. **`ConfirmationDialog.tsx`** - 70.58% branch coverage
6. **`ActiveRemoveConfirmation.tsx`** - 71.42% branch coverage

### P1 - Vidutinis (Branch Coverage 70-85%)

1. **`ImportBox.tsx`** - 61.11% branch coverage
2. **`ActiveImportBox.tsx`** - 50% branch coverage
3. **`SwipePanel.tsx`** - 75.8% branch coverage
4. **`useReorderHandler.ts`** - 78.57% branch coverage
5. **`DetailsBox.tsx`** - 78.02% branch coverage
6. **`useLabels.ts`** - 77.77% branch coverage
7. **`useLongPress.ts`** - 84.21% branch coverage (beveik pasiektas!)
8. **`ActiveContentOutsideClick.tsx`** - 84.61% branch coverage (beveik pasiektas!)
9. **`GroupBox.tsx`** - 81.63% branch coverage

### P2 - Žemas Function Coverage

1. **`GroupsTable.tsx`** - 44.44% function coverage
2. **`VariantsTable.tsx`** - 45.45% function coverage
3. **`DetailsPage.tsx`** - 66.66% function coverage
4. **`GroupsPage.tsx`** - 66.66% function coverage
5. **`UpdatingDetailsContext.tsx`** - 87.5% function coverage

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

## 📋 Testų failai sukurti šiame seanse (2025-11-16)

1. 🆕 `src/client/utils/pointEvents.test.tsx` - Naujas testas (9 testai) - **100% coverage!**
2. 🆕 `src/client/AppVersion.test.tsx` - Naujas testas (1 testas) - **100% coverage!**
3. 🆕 `src/client/Links.test.ts` - Naujas testas (1 testas) - **100% coverage!**
4. 🆕 `src/client/table/DragHandle.test.tsx` - Naujas testas (3 testai) - **100% coverage!**
5. 🆕 `src/client/table/GroupTitle.test.tsx` - Naujas testas (3 testai) - **100% coverage!**
6. 🆕 `src/client/common/SortableContent.test.tsx` - Naujas testas (2 testai) - **100% coverage!**
7. 🆕 `src/client/common/DraggableContent.test.tsx` - Naujas testas (3 testai) - **100% coverage!**

**Viso pridėta naujų testų šiame seanse:** 22 testai (visi praėjo! ✅)

---

## 📋 Testų failai atnaujinti šiame seanse (2025-11-16)

- ✨ `src/client/table/SwipeableTableRow.test.tsx` - Perdaryta naudoti `user.pointer()` vietoj `fireEvent.pointer*` (45 testai)
- ✨ `src/client/hooks/useLongPress.test.tsx` - Atnaujinta naudoti `dispatchNativeCancelEvents` vietoj `cancelAllLongPressTimers`

---

**Paskutinis atnaujinimas:** 2025-11-16  
**Coverage data:** Jest coverage report (`pnpm test --coverage`)  
**Test framework:** Jest 30.2.0 + React Testing Library 16.3.0  
**Coverage threshold:** Branches 85% ✅ **ACHIEVED!** (currently 87.71%)
