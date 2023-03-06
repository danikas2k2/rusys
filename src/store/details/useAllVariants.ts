import { useMemo } from 'react';
import { Variant } from '~/store/details/types';

export default function useAllVariants(): Variant[] {
    return useMemo(
        () => [
            Variant.PUSLITRIS,
            Variant.DIDESNIS,
            Variant.MAZESNIS,
            Variant.EGLYTES,
            Variant.LITRAS,
            Variant.PUSANTRO,
            Variant.DVILITRIS,
            Variant.TRILITRIS,
            Variant.BLOGAS,
        ],
        []
    );
}
