import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Variant } from '~/common/types';
import { type WithVariantsState } from '~/state/variants/types';

export const useVariants = (): ReadonlyArray<Variant> =>
    useSelector((state: WithVariantsState) => state.variants ?? [], isEqual);
