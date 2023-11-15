import { renderHook } from '@testing-library/react';
import { Variant } from '~/state/details/types';
import { useVariantComparator } from '~/state/variants/useVariantComparator';

describe('useVariantComparator', () => {
    const unsorted = [
        Variant.LITRAS,
        Variant.DVILITRIS,
        Variant.TRILITRIS,
        Variant.BLOGAS,
        Variant.DIDESNIS,
        Variant.MAZESNIS,
        Variant.PUSLITRIS,
        Variant.EGLYTES,
        Variant.PUSANTRO,
    ];

    const sorted = [
        Variant.PUSLITRIS,
        Variant.DIDESNIS,
        Variant.MAZESNIS,
        Variant.EGLYTES,
        Variant.LITRAS,
        Variant.PUSANTRO,
        Variant.DVILITRIS,
        Variant.TRILITRIS,
        Variant.BLOGAS,
    ];

    it('return sorted variants', async () => {
        const { result } = renderHook(() => useVariantComparator());
        expect(unsorted.sort(result.current)).toEqual(sorted);
    });
});
