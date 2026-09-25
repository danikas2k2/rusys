import type { Variant } from '@rusys/common/data';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/store/variants/types';

export function useVariant(group: string, variant: string): Readonly<Variant> | undefined {
    return useSelector((state: WithVariantsState) =>
        state.variants?.find((v) => v.group === group && v.variant === variant)
    );
}
