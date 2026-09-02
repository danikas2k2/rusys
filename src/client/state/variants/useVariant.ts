import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/client/state/variants/types';
import type { Variant } from '~/common/data';

export function useVariant(group: string, variant: string): Readonly<Variant> | undefined {
    return useSelector((state: WithVariantsState) =>
        state.variants?.find((v) => v.group === group && v.variant === variant)
    );
}
