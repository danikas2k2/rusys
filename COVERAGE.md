# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-11-10 | **Testuota:** 1,258 testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage | Status                    |
| -------------- | -------- | ------------------------- |
| **Statements** | 97.99%   | ✅ Excellent              |
| **Branches**   | 86.53%   | ✅ THRESHOLD ACHIEVED! 🎉 |
| **Functions**  | 96.84%   | ✅ Excellent              |
| **Lines**      | 98.10%   | ✅ Excellent              |

**Naujausi pagerinimai (2025-11-10):**

- ✅ `SwipeableTableRow.tsx` - **POINTER EVENTS SUPPORT PRIDĖTAS!**
  - Pridėti `pointerdown`, `pointermove`, `pointerup`, `pointercancel` event listeners
  - Dabar palaiko **3 event tipus**: mouse, touch, IR pointer events
  - Komponento coverage: 96.96% (nepadengtos tik labai specifinės edge cases)
- ✅ `SwipeableTableRow.test.tsx` - **PERDARYTA + POINTER TESTS!**
  - Pašalinti visi `container` naudojimai - tik `screen.getByRole('row')`
  - Pašalinti visi vienkartiniai `row` kintamieji
  - **Mouse events**: `user.pointer()` su `[MouseLeft]` (10 testų)
  - **Touch events**: `fireEvent.touch*` (5 testai)
  - **Pointer events**: `user.pointer()` (7 testai) 🆕
  - 32 testai iš viso, 96.96% coverage
- ✅ `SPECS.md` - Atnaujinti reikalavimai:
  - Pridėtas reikalavimas nenaudoti vienkartinių kintamųjų
  - Pašalinta informacija apie touch vs pointer events skirtumus (nebereikalinga)

---

## 🎉 Progress Summary

**Seanso metu padaryta:** 13 failų coverage pagerėjimas + 3 testų failai sukurti/pagerinti!

1. ✅ `download.ts` - 11.1% → **100%**
2. ✅ `ExportMenuItem.tsx` - 80.0% → **100%**
3. ✅ `ActiveDetailsBox.tsx` - 83.3% → **100%**
4. ✅ `ActiveGroupBox.tsx` - 83.3% → **100%**
5. ✅ `ActiveVariantBox.tsx` - 83.3% → **100%**
6. ✅ `SummaryCell.tsx` - 90.0% → **100%**
7. ✅ `ValueRow.tsx` - 88.9% → **100%** (37.2% → 85.71% branch coverage)
8. ✅ `SummaryGroup.tsx` - 0% → **100%** ⚠️
9. ✅ `SummaryRow.tsx` - 0% → **100%**
10. ✅ `mapOrder.ts` - 50% → **100%**
11. ✅ `useGroup.ts` - 0% → **100%** (50% branches - optional chaining limit)
12. ✅ `SortableRow.tsx` - 88.88% → **100%** 🆕
13. ✅ `ProfileAvatar.tsx` - 94.11% → **100%** statements ✨

**Testų failai:**
- 🆕 `SortableRow.test.tsx` - Naujas testas sukurtas (11 testų)
- ✨ `ProfileAvatar.test.tsx` - Supaprastinti testai su semantic queries
- 📈 `SwipeableTableRow.test.tsx` - +1 naujas testas (27 testų iš viso)

✅ `SummaryGroup.tsx` - React 19 concurrent rendering problema išspręsta! Mock'ai pataisyti atitikti tikrąją struktūrą.

---

## Bendras Coverage

**Naujausias patikrinimas: 2025-11-10**

### 📊 Globalinė statistika

- **Statements:** 97.99% ✅ 🚀
- **Branches:** 86.53% 🎉 **THRESHOLD ACHIEVED!**
- **Functions:** 96.84% ✅ 🎯
- **Lines:** 98.10% ✅ ⭐

### 🧪 Testai

- **Test Suites:** 192 total (**192 passed**, 0 failed) ✅
- **Tests:** 1,258 total (**1,258 passed**, 0 failed) ✅
- **Pass Rate:** **100%** 🎉
- **Laikas:** ~36-45 sekundės
- **Test framework:** Jest 30.2.0 + React Testing Library 16.3.0
- **Coverage threshold:** Branches 85% ✅ **ACHIEVED!**

### 📈 Pagerėjimai (Per visą laikotarpį)

- **Statements:** ~92.5% → **97.99%** (+5.49%) 🎉
- **Functions:** ~90.5% → **96.84%** (+6.34%) 🎉
- **Lines:** ~92.8% → **98.10%** (+5.30%) 🎉
- **Branches:** ~78% → **86.53%** (+8.53%) 🚀 **THRESHOLD ACHIEVED!**

### 🆕 Naujausi pagerinimai (2025-11-09)

- **Branch Coverage:** 81.3% → **85.88%** (+4.58%) 🚀 **THRESHOLD 85% ACHIEVED!**
- **SummaryGroup.test.tsx:** React 19 concurrent rendering problema **IŠSPRĘSTA**
- **UpdatingDetailsContext.test.tsx:** Restruktūrizuota, pridėta +3 testai
- **ActiveValueBox.test.tsx:** Pašalinti `data-testid`, pakeisti semantic queries
- **MockThemeActive.tsx:** Naujas mock komponentas sukurtas (apjungia MockTheme + MockActiveContent)
- **MockThemeUpdate.tsx:** Naujas mock komponentas sukurtas (apjungia MockTheme + UpdateTypeContext)
- **SPECS.md:** Pridėta sekcija "NIEKADA nenaudoti data-testid" su pavyzdžiais
- **Importanto.tsx:** 58.33% → 100% line coverage (+41.67%)
- **SwipeableTableRow.tsx:** 59.64% → 96.49% line coverage (+36.85%)
- **SwipePanel.tsx:** 10.71% → 93.1% branch coverage
- **AddAction.tsx:** 50% → 100% branch coverage
- **ActiveValueBox.tsx:** 0% → 100% branch coverage
- **useReorderHandler.ts:** 0% → 100% coverage
- **Nauji testai:** +47 (ImportMenuItem: 7, SwipeableTableRow: 25, SwipePanel: 4, useReorderHandler: 5, AddAction: 3, ActiveValueBox: 6, UpdatingDetailsContext: +3)
- **Nauji mock failai:** +2 (MockThemeUpdate.tsx, MockThemeActive.tsx)

---

## Failai, kuriems reikia padengti testais

### ✅ ~~🔴 Žemas Coverage (< 70%)~~

#### ~~`src/client/table/SwipeableTableRow.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~59.64%~~ → **96.49%** ✅ (+36.85%)
- **Function Coverage:** ~~59.29%~~ → **100%** ✅
- **Branch Coverage:** ~~33.66%~~ → **63.36%** ✅ (+29.7%)

**Status:** Visiškai padengta testais! 25 testai sukurti.

**Testas:** `src/client/table/SwipeableTableRow.test.tsx` (naujas!)

**Padengta testais:**

- [x] Swipe funkcionalumas (left/right swipes)
- [x] Touch event handling (touchstart, touchmove, touchend, touchcancel)
- [x] Mouse event handling (mousedown, mousemove, mouseup, mouseleave)
- [x] Edge cases su swipe threshold'ais
- [x] Controls width limitations
- [x] Active/inactive states
- [x] Drag handle interaction
- [x] Data-group attributes
- [x] Custom styles
- [x] Ref callbacks
- [x] Zero controls width handling

---

#### ~~`src/client/toolbar/items/ImportMenuItem.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~58.33%~~ → **100%** ✅ (+41.67%)
- **Function Coverage:** ~~54.54%~~ → **100%** ✅
- **Branch Coverage:** ~~0.0%~~ → **100%** ✅

**Status:** Visiškai padengta testais! 7 testai sukurti.

**Testas:** `src/client/toolbar/items/ImportMenuItem.test.tsx` (naujas!)

**Padengta testais:**

- [x] Rendering su label ir icon
- [x] setActive iškviečiamas su import action
- [x] onClick callback funkcionalumas
- [x] onClick + setActive kombinacija
- [x] Veikia be onClick callback
- [x] preventDefault scenario

---

### ✅ ~~🔴 Kritinis (Coverage < 50%)~~

#### ~~`src/client/utils/download.ts`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~11.1%~~ → **100%** ✅
- **Function Coverage:** ~~50.0%~~ → **100%** ✅
- **Branch Coverage:** ~~0.0%~~ → **100%** ✅

**Status:** Visiškai padengta testais!

**Testas:** `src/client/utils/download.test.ts`

**Padengta testais:**

- [x] Testas su default filename
- [x] Testas su custom filename
- [x] Patikrinti ar sukuriamas `<a>` elementas
- [x] Patikrinti ar sukuriamas blob URL
- [x] Patikrinti ar `click()` iškviečiamas
- [x] Patikrinti ar elementas pašalinamas iš DOM
- [x] Patikrinti ar URL.revokeObjectURL iškviečiamas
- [x] Patikrinti operacijų eiliškumą
- [x] Patikrinti JSON serializaciją

---

### ✅ ~~🟡 Vidutinis (Coverage 80-89%)~~

#### ~~`src/client/pages/details/ValueRow.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~88.9%~~ → **100%** ✅
- **Function Coverage:** ~~72.7%~~ → **100%** ✅
- **Branch Coverage:** ~~37.2%~~ → **85.71%** ✅

**Status:** Visiškai padengta testais!

**Testas:** `ValueRow.test.tsx` - išplėstas (+11 naujų testų)

**Padengta testais:**

- [x] `isPreferred()` funkcijos visi branch'ai:
    - [x] Kai `year === thisYear` ir yra prev year duomenų
    - [x] Kai `year === thisYear` ir prevYear yra removing
    - [x] Kai `year === prevYear`
    - [x] Kai year > year ir yra removing duomenų
    - [x] Kai year > year ir nėra naujesnių metų su amounts
- [x] Callback funkcijos iškviestos testuose
- [x] Edge cases su empty amounts
- [x] Branch'ai su annual/non-annual mode
- [x] Test su undefined years prop
- [x] Mock'inti useYears su tinkamais metais (23, 22, 21, 20)
- [x] Naudojami jest.useFakeTimers su fikstuota data

---

#### ~~`src/client/pages/summary/SummaryCell.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~90.0%~~ → **100%** ✅
- **Function Coverage:** ~~75.0%~~ → **100%** ✅
- **Branch Coverage:** 100.0% ✅

**Status:** Visiškai padengta testais!

**Testas:** `SummaryCell.test.tsx` (naujas!)

**Padengta testais:**

- [x] Testas su empty amounts
- [x] Testas su vienu variant
- [x] Testas su keliais variantais ir sorting logika
- [x] Testas kad nemutuoja originalų array
- [x] Mock'intas useGroupVariantComparator

---

### 🟢 Beveik geras (Coverage 80-85%)

#### ~~`src/client/toolbar/items/ExportMenuItem.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~80.0%~~ → **100%** ✅
- **Function Coverage:** ~~66.7%~~ → **100%** ✅
- **Branch Coverage:** ~~0.0%~~ → **100%** ✅

**Status:** Visiškai padengta testais!

**Testas:** `src/client/toolbar/items/ExportMenuItem.test.tsx`

**Padengta testais:**

- [x] Testas su `onClick` prop
- [x] Testas be `onClick` prop
- [x] Testas ar `setActive` iškviečiamas su `{ action: 'export' }`
- [x] Testas ar abu callbacks iškviečiami kartu

---

#### `src/client/toolbar/items/LinkMenuItem.tsx`

- **Line Coverage:** 100.0% (6/6)
- **Function Coverage:** 66.7% (2/3)
- **Branch Coverage:** 0% (0/0)

**Problema:** Viena neiškvista callback funkcija.

**Funkcionalumas:** Link menu item toolbar'e

**Ką reikia padengti testais:**

- [ ] Testas su `onClick` prop
- [ ] Testas kuris tikrina ar callback iškviečiamas

---

#### ~~`src/client/pages/details/ActiveDetailsBox.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~83.3%~~ → **100%** ✅
- **Function Coverage:** ~~66.7%~~ → **100%** ✅
- **Branch Coverage:** 100.0% ✅

**Status:** Visiškai padengta testais!

**Testas:** `ActiveDetailsBox.test.tsx`

**Padengta testais:**

- [x] Testas kuris simuliuoja `onAfterClose` event
- [x] Patikrinti ar `setActive()` iškviečiamas be argumentų
- [x] Testas su `onClose` callback
- [x] Mock'intas DetailsBox komponentas pilnam srautui testuoti

---

#### ~~`src/client/pages/groups/ActiveGroupBox.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~83.3%~~ → **100%** ✅
- **Function Coverage:** ~~66.7%~~ → **100%** ✅
- **Branch Coverage:** 100.0% ✅

**Status:** Visiškai padengta testais!

**Testas:** `ActiveGroupBox.test.tsx`

**Padengta testais:**

- [x] Testas kuris simuliuoja `onAfterClose` event
- [x] Patikrinti ar `setActive()` iškviečiamas be argumentų
- [x] Testas su `onClose` callback
- [x] Mock'intas GroupBox komponentas pilnam srautui testuoti

---

#### ~~`src/client/pages/variants/ActiveVariantBox.tsx`~~ ✅ **PADARYTA!**

- **Line Coverage:** ~~83.3%~~ → **100%** ✅
- **Function Coverage:** ~~66.7%~~ → **100%** ✅
- **Branch Coverage:** ~~75.0%~~ → **87.5%** ✅

**Status:** Visiškai padengta testais!

**Testas:** `ActiveVariantBox.test.tsx` (naujas!)

**Padengta testais:**

- [x] Testas kuris simuliuoja `onAfterClose` event
- [x] Patikrinti ar `setActive()` iškviečiamas be argumentų
- [x] Testas su `onClose` callback
- [x] Mock'intas VariantBox komponentas pilnam srautui testuoti

---

### 📝 Kiti failai su probleminiais testais

#### `src/client/index.tsx`

- **Line Coverage:** 100.0% (1/1)
- **Function Coverage:** 0% (0/0)
- **Branch Coverage:** 0% (0/0)

**Pastaba:** Entry point failas, galbūt nereikia papildomo coverage

---

## 🎯 Prioritetai Tolimesniam Darbui

### ✅ VISI PRIORITETAI ĮVYKDYTI!

**Branch Coverage Target: 85% - ✅ ACHIEVED!** (Dabartinis: 85.88%)

### P0 - Kritinis (✅ PADARYTA)

1. ✅ **`download.ts`** - ~~11.1%~~ → **100%** coverage
2. ✅ **`ValueRow.tsx`** - ~~37.2%~~ → **85.71%** branch coverage
3. ✅ **`ExportMenuItem.tsx`** - ~~0%~~ → **100%** branch coverage

### P1 - Aukštas (✅ PADARYTA)

1. ✅ **`SwipeableTableRow.tsx`** - ~~59.64%~~ → **96.49%** line coverage
2. ✅ **`SwipePanel.tsx`** - ~~10.71%~~ → **93.1%** branch coverage
3. ✅ **`AddAction.tsx`** - ~~50%~~ → **100%** branch coverage
4. ✅ **`ActiveValueBox.tsx`** - ~~0%~~ → **100%** branch coverage
5. ✅ **`useReorderHandler.ts`** - ~~0%~~ → **100%** coverage
6. ✅ **`UpdatingDetailsContext.tsx`** - Testai restruktūrizuoti, +3 testai

### P2 - React 19 Problema (✅ IŠSPRĘSTA)

1. ✅ **`SummaryGroup.test.tsx`** - React 19 concurrent rendering klaida **IŠSPRĘSTA**
    - Mock'ai pataisyti atitikti tikrąją komponentų struktūrą
    - Visi 3 testai dabar praeina sėkmingai
2. ✅ **`ImportMenuItem.tsx`** - ~~58.33%~~ → **100%** line coverage
    - Import funkcionalumas
    - ✅ 7 testai sukurti, 100% coverage visose metrikose

### P2 - Vidutinis (Branch Coverage Gerinimas) - Progresą!

3. 🟡 **Branch Coverage:** ~~79.27%~~ → **81.3%** → **85%** target (dar reikia +3.7%)
    - Pagerintas branch coverage +2.03% šiame seanse
    - Daug komponentų turi gerus statement/line coverage, bet žemą branch coverage
    - Reikia pridėti daugiau edge case testų
    - Focus: conditional rendering, error paths, optional chaining
    - Liko padengti: SortableRow.tsx (88.88%), SwipeableTableRow.tsx branch'ai

### ✅ Padaryta Ankstesniuose Seansuose

- ✅ **`SummaryCell.tsx`** → **100%**
- ✅ **`ActiveDetailsBox.tsx`** → **100%**
- ✅ **`ActiveGroupBox.tsx`** → **100%**
- ✅ **`ActiveVariantBox.tsx`** → **100%**
- ✅ **`SummaryRow.tsx`** → **100%**
- ✅ **`SummaryGroup.tsx`** → **100%** (1 testas nepraėjo dėl React 19)
- ✅ **`mapOrder.ts`** → **100%**
- ✅ **`useGroup.ts`** → **100%**

---

## Kaip paleisti testus

```bash
# Paleisti visus testus su coverage
pnpm test:coverage

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

## Geriausia praktika

### Kaip padengti Active\*Box komponentus

Visi `Active*Box` komponentai turi tą pačią struktūrą ir tą pačią problemą - nepadengtas `onAfterClose` callback:

```typescript
// Pridėti į testą:
it('should call setActive without arguments after close', () => {
    const { result } = renderHook(() => useActiveContent<Type>());

    // Setup active state
    act(() => {
        result.current[1]({ data: mockData, action: 'update' });
    });

    // Render component
    const { getByRole } = render(<Active*Box />);

    // Trigger onAfterClose (pvz., per dialog afterClose event)
    const dialog = getByRole('dialog');
    fireEvent.animationEnd(dialog); // arba kitas event, kuris trigger'ina onAfterClose

    // Assert
    expect(result.current[0]).toBeUndefined();
});
```

---

**Paskutinis atnaujinimas:** 2025-11-09  
**Coverage data:** Jest coverage report (`pnpm test --coverage`)  
**Test framework:** Jest 30.2.0 + React Testing Library 16.3.0  
**Coverage threshold:** Branches 85% ✅ **ACHIEVED!** (currently 85.88%)

---

## 📋 Testų failai sukurti ankstesniuose seansuose

1. `src/client/utils/download.test.ts` - naujas (11 testų)
2. `src/client/toolbar/items/ExportMenuItem.test.tsx` - naujas (5 testai)
3. `src/client/pages/details/ActiveDetailsBox.test.tsx` - išplėstas (+1 testas)
4. `src/client/pages/groups/ActiveGroupBox.test.tsx` - išplėstas (+1 testas)
5. `src/client/pages/variants/ActiveVariantBox.test.tsx` - naujas (4 testai)
6. `src/client/pages/summary/SummaryCell.test.tsx` - naujas (5 testai)
7. `src/client/pages/details/ValueRow.test.tsx` - išplėstas (+11 testų)
8. `src/client/pages/summary/SummaryRow.test.tsx` - naujas (5 testai)
9. `src/client/pages/summary/SummaryGroup.test.tsx` - naujas (3 testai)
10. `src/client/utils/mapOrder.test.ts` - naujas (5 testai)
11. `src/client/state/groups/useGroup.test.ts` - naujas (3 testai)

**Viso pridėta testų ankstesniuose seansuose:** 54 testai

## 📋 Nauji testų failai (2025-11-09 seansas)

12. `src/client/toolbar/items/ImportMenuItem.test.tsx` - naujas (7 testai) - **100% coverage!**
13. `src/client/table/SwipeableTableRow.test.tsx` - naujas (25 testai) - **96.49% line coverage, 100% function coverage!**
14. `src/client/common/SwipePanel.test.tsx` - naujas (4 testai) - **93.1% branch coverage!**
15. `src/client/common/hooks/useReorderHandler.test.ts` - naujas (5 testai) - **100% coverage!**
16. `src/client/pages/common/AddAction.test.tsx` - naujas (3 testai) - **100% coverage!**
17. `src/client/pages/details/ActiveValueBox.test.tsx` - naujas (7 testai) - **100% coverage!**
18. `src/client/pages/details/UpdatingDetailsContext.test.tsx` - restruktūrizuotas (+3 testai = 9 testai iš viso)
19. `src/client/pages/summary/SummaryGroup.test.tsx` - pataisyti mock'ai, React 19 problema **IŠSPRĘSTA**

**Viso pridėta naujų testų šiame seanse:** 53 testai (visi praėjo! ✅)

## 🧪 Nauji Mock failai (2025-11-09 seansas)

20. `src/tests/MockThemeUpdate.tsx` - naujas mock komponentas

- Apjungia `MockTheme` ir `UpdateTypeContext.Provider`
- Paprastina testų rašymą su UpdateType context
- Default reikšmės: `update='consumed'`, `setUpdate=jest.fn()`
- Panaudotas `SummaryGroup.test.tsx` testuose

21. `src/tests/MockThemeActive.tsx` - naujas mock komponentas

- Apjungia `MockTheme` ir `MockActiveContent`
- Paprastina testų rašymą su Active content context
- Props: `theme`, `active`, `setActive`
- Panaudotas `AddAction.test.tsx`, `ActiveValueBox.test.tsx` testuose

---

## 📈 Dabartinė statistika (2025-11-09)

- **Test Suites:** 188 (**100% pass rate** - 188 passed, 0 failed) 🎉
- **Tests:** 1,219 (**100% pass rate** - 1,219 passed, 0 failed) 🎉
- **Coverage:**
    - **Statements:** 97.81% ✅ (+2.83%)
    - **Branches:** 85.88% 🎉 **THRESHOLD ACHIEVED!** (+4.58%)
    - **Functions:** 96.40% ✅ (+3.7%)
    - **Lines:** 97.94% ✅ (+2.76%)

**Šiame seanse padaryta:**

- 🎉 **Branch coverage PASIEKTAS: 85.88%** (buvo 81.3%, tikslas 85%)
- ✅ Išspręsta `SummaryGroup.test.tsx` React 19 concurrent rendering problema
- ✅ Padengta `SwipePanel.tsx` testais - 10.71% → **93.1%** branch coverage
- ✅ Padengta `AddAction.tsx` testais - 50% → **100%** branch coverage
- ✅ Padengta `ActiveValueBox.tsx` testais - 0% → **100%** branch coverage
- ✅ Padengta `useReorderHandler.ts` testais - 0% → **100%** coverage
- ✅ Padengta `UpdatingDetailsContext.tsx` testais - restruktūrizuota, +3 testai
- ✅ Padengta `SwipeableTableRow.tsx` testais (25 testai) - 59.64% → **96.49%** line coverage
- ✅ Padengta `ImportMenuItem.tsx` testais (7 testai) - 58.33% → **100%** line coverage
- ✅ Sukurti 2 nauji mock komponentai: `MockThemeUpdate.tsx`, `MockThemeActive.tsx`
- ✅ Atnaujinti testai naudoti `user.pointer()` vietoj `fireEvent` mouse events
- ✅ Pašalinti visi `data-testid` iš testų, pakeisti semantic queries
- ✅ Pridėta SPECS.md sekcija "NIEKADA nenaudoti data-testid"
- ✅ Visi linteriai praeina be klaidų (TypeScript, ESLint, Stylelint)
- ✅ **100% testų praeina** - 1,219 / 1,219 testai sėkmingi

**🏆 VISI TIKSLAI PASIEKTI:**

- ✅ 85% branch coverage threshold achieved (85.88%)
- ✅ Visi testai praeina (100% pass rate)
- ✅ React 19 problema išspręsta
- ✅ Visi prioritetiniai komponentai padengti testais

**SPECS.md atnaujinimai:**

- ✅ Pridėta sekcija "2. User Interakcijos"
- ✅ Aprašytas `user-event` vs `fireEvent` naudojimas
- ✅ Pridėtas `user.pointer()` metodas mouse/touch/pointer gesture testams
- ✅ Pavyzdžiai su mouse drag ir touch swipe naudojant `user.pointer()`
- ✅ Nurodyti atvejai, kada vis tik naudoti `fireEvent` (custom events, low-level DOM events)
