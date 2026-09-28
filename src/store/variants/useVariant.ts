import { useSelector } from 'react-redux';

import type { Variant } from '~/common/data';
import type { WithVariantsState } from '~/store/variants/types';

export function useVariant(group: string, variant: string): Readonly<Variant> | undefined {
    return useSelector((state: WithVariantsState) =>
        state.variants?.find((v) => v.group === group && v.variant === variant)
    );
}
