import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Variant } from '~/common/types';
import { type WithVariantsState } from '~/state/variants/types';

export function useVariants(): ReadonlyArray<Variant> {
    return useSelector((state: WithVariantsState) => state.variants ?? [], isEqual);
}
