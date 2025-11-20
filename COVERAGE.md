# Test Coverage Report

**Paskutinis atnaujinimas:** 2025-01-20 | **Testuota:** 1,500+ testai | **Pass rate:** 100%

## 📊 Quick Summary

| Metric         | Coverage |
| -------------- | -------- |
| **Statements** | 99.16%   |
| **Branches**   | 94.00%   |
| **Functions**  | 98.58%   |
| **Lines**      | 99.42%   |

---

## 🎯 Prioritetai Tolimesniam Darbui

- **`DetailsBox.tsx`** - 84.7% branch coverage
- **`VariantBox.tsx`** - 86.2% branch coverage
- **`GroupBox.tsx`** - 86.66% branch coverage
- **`SwipePanel.tsx`** - 88.88% branch coverage

---

## ⚠️ Sunku arba Neįmanoma Testuoti

### Coverage Ignore Anotacijos

Projekte naudojamos **Istanbul coverage ignore anotacijos** sunkiai testuojamoms vietoms. Jest naudoja Istanbul coverage tool, kuris palaiko šias anotacijas:

**Sintaksė:**

```typescript
// istanbul ignore next - paaiškinimas kodėl ignoruojama
ref.current?.focus();
```

**Galimos anotacijos:**

- `/* istanbul ignore next */` - ignoruoja sekantį statement
- `/* istanbul ignore if */` - ignoruoja if statement
- `/* istanbul ignore else */` - ignoruoja else statement
- `/* istanbul ignore file */` - ignoruoja visą failą

**Panaudotos anotacijos projekte:**

- `DetailsBox.tsx` - ref'ų focus() metodai (linijos 118, 120, 148)
- `GroupBox.tsx` - ref'ų focus() metodai (linijos 75, 98, 120)
- `VariantBox.tsx` - ref'ų focus() metodai (linijos 122, 124, 155)
- `SwipePanel.tsx` - requestAnimationFrame callback (linija 41)

**Kodėl naudojamos:**

- React Testing Library automatiškai priskiria ref'us, todėl `ref.current` praktiškai niekada nėra `null` po render'inimo. Testuoti `null` scenarijų reikalautų mock'inti React render'inimą, kas nėra realus naudojimo atvejis.
- `requestAnimationFrame` yra asinchroninis ir priklauso nuo browser'io render'inimo ciklo. Testuoti reikalautų mock'inti `requestAnimationFrame` arba laukti tikrojo animacijos ciklo, kas yra sudėtinga ir nestabilu testuose.

### Likę Neįmanomi arba Sunkiai Testuojami Branch'ai

**DetailsBox.tsx (84.7% branch coverage):**

- `||` operacijų branch'ai, kurie yra padengti, bet coverage matuoja kaip atskirus branch'us

**GroupBox.tsx (86.66% branch coverage):**

- `||` operacijų branch'ai (linija 114: `!isEditing || annualChanged`)

**VariantBox.tsx (86.2% branch coverage):**

- `||` operacijų branch'ai (linija 148: `!isEditing || suffixChanged`)

**SwipePanel.tsx (88.88% branch coverage):**

- `||` operacijų branch'ai (linija 69: `!active?.data || active?.action`)
- Edge case su keliais paneliais tuo pačiu `id` - neįmanomas realiame naudojime

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
