import { useSelector } from 'react-redux';
import { type WithVariantsState } from '~/state/variants/types';
import { type Variant } from '~/types/data';
import { isEqual } from 'lodash';

export const useVariants = (): ReadonlyArray<Variant> =>
    useSelector((state: WithVariantsState) => state.variants ?? [], isEqual);
