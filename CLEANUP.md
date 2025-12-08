# Cleanup Tasks

## Nenaudojami komponentai ir funkcijos

Šie failai yra apibrėžti ir turi testus, bet nenaudojami produkciniame kode. Reikia nuspręsti ar juos ištrinti ar palikti ateičiai.

### Custom Hooks

#### `useGroupMatch`

- **Failas:** `src/client/hooks/useGroupMatch.ts`
- **Eilučių:** 7
- **Aprašymas:** Tikrina ar grupė egzistuoja details duomenyse
- **Testas:** `src/client/hooks/useGroupMatch.test.ts`
- **Naudojimas:** Nenaudojamas aplikacijoje, tik testuose
- **Kodas:**
    ```typescript
    export function useGroupMatch(group: string): boolean {
        const groupMatch = group.trim().toLowerCase();
        return Object.keys(useDetails() ?? {}).some((g) => g.toLowerCase() === groupMatch);
    }
    ```

#### `useGroupVariants`

- **Failas:** `src/client/state/variants/useGroupVariants.ts`
- **Eilučių:** 10
- **Aprašymas:** Redux selector, grąžina variantus pagal grupę
- **Testas:** `src/client/state/variants/useGroupVariants.test.tsx`
- **Mock:** `src/client/state/variants/__mocks__/useGroupVariants.ts`
- **Naudojimas:** Nenaudojamas aplikacijoje, tik testuose
- **Kodas:**
    ```typescript
    export const useGroupVariants = (group: string): readonly Variant[] =>
        useSelector((state: WithVariantsState) => state.variants?.filter((v) => v.group === group) ?? [], isEqual);
    ```

#### `useVariantComparator`

- **Failas:** `src/client/state/variants/useVariantComparator.ts`
- **Eilučių:** 26
- **Aprašymas:** Grąžina lyginimo funkciją variantų rikiavimui pagal order ir pavadinimą
- **Testas:** `src/client/state/variants/useVariantComparator.test.tsx`
- **Naudojimas:** Nenaudojamas aplikacijoje, tik testuose
- **Kodas:**
    ```typescript
    export function useVariantComparator(): (group: string) => (a: string, b: string) => number {
        const variantOrders = useSelector(
            (state: WithVariantsState) =>
                state.variants?.reduce<Record<string, Record<string, number>>>(
                    (r, { group, variant, order }) => ({ ...r, [group]: { ...r[group], [variant]: order } }),
                    {}
                ) ?? {},
            isEqual
        );
        return useCallback(
            (group: string) =>
                (a: string, b: string): number =>
                    (variantOrders[group]?.[a] ?? Number.POSITIVE_INFINITY) -
                        (variantOrders[group]?.[b] ?? Number.POSITIVE_INFINITY) || compareNames(a, b),
            [variantOrders]
        );
    }
    ```

### Utility funkcijos

#### `getChangedIndexes`

- **Failas:** `src/client/utils/getChangedIndexes.ts`
- **Eilučių:** 3
- **Aprašymas:** Palyginę du masyvus, grąžina pasikeitusių elementų naujų indeksų žodyną
- **Testas:** `src/client/utils/getChangedIndexes.test.ts`
- **Naudojimas:** Nenaudojamas aplikacijoje, tik testuose
- **Kodas:**
    ```typescript
    export function getChangedIndexes(before: string[], after: string[]): Record<string, number> {
        return Object.fromEntries(after.map((v, i) => [v, i] as const).filter(([v], i) => i !== before.indexOf(v)));
    }
    ```

#### `getOverlapIndex`

- **Failas:** `src/client/utils/getOverlapIndex.ts`
- **Eilučių:** 24
- **Aprašymas:** Randa DOM elemento indeksą, kuris persidengia su nurodytu elementu (naudojant slenkstį)
- **Testas:** `src/client/utils/getOverlapIndex.test.ts`
- **Naudojimas:** Nenaudojamas aplikacijoje, tik testuose (minimas komentaruose `GroupsTable.test.tsx` ir `VariantsTable.test.tsx`)
- **Pastaba:** Gali būti susijęs su drag & drop funkcionalumu
- **Kodas:**
    ```typescript
    export function getOverlapIndex(element: HTMLElement | null, threshold = 0.5): number {
        if (element) {
            const rect = element.getBoundingClientRect();
            const parent = element.offsetParent as HTMLElement | null;
            if (parent) {
                const children = parent.children as HTMLCollectionOf<HTMLElement>;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child === element) continue;
                    const childRect = child.getBoundingClientRect();
                    if (
                        (childRect.top >= rect.top && childRect.top <= rect.top + rect.height * threshold) ||
                        (rect.top >= childRect.top && rect.top <= childRect.top + childRect.height * threshold)
                    ) {
                        return i;
                    }
                }
            }
        }
        return -1;
    }
    ```

---

## Veiksmai

- [ ] Peržiūrėti kiekvieną funkciją ir nuspręsti ar ji reikalinga
- [ ] Jei nereikalinga - ištrinti failą ir jo testus
- [ ] Jei gali būti reikalinga ateityje - palikti su šiuo dokumentu
- [ ] Atnaujinti šį dokumentą pašalinus/panaudojus funkcijas

---

**Paskutinis atnaujinimas:** 2025-11-08
**Analizės data:** 2025-11-08
