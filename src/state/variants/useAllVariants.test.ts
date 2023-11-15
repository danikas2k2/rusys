import { renderHook } from '@testing-library/react';
import { Variant } from '~/state/details/types';
import { useAllVariants } from '~/state/variants/useAllVariants';

describe('useAllVariants', () => {
    it('return list of all variants', async () => {
        const { result } = renderHook(() => useAllVariants());
        expect(result.current).toEqual([
            Variant.PUSLITRIS,
            Variant.DIDESNIS,
            Variant.MAZESNIS,
            Variant.EGLYTES,
            Variant.LITRAS,
            Variant.PUSANTRO,
            Variant.DVILITRIS,
            Variant.TRILITRIS,
            Variant.BLOGAS,
        ]);
    });
});
