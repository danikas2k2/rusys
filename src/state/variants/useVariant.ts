import { useSelector } from 'react-redux';
import { type Variant } from '~/common/types';
import { type WithVariantsState } from '~/state/variants/types';

export function useVariant(variant: string): Readonly<Variant> | undefined {
    return useSelector((state: WithVariantsState) => state.variants?.find((v) => v.variant === variant));
}
