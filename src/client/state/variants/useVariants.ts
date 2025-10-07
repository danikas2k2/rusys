import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { type WithVariantsState } from '~/client/state/variants/types';
import { type Variant } from '~/types/data';

export const useVariants = (): ReadonlyArray<Variant> =>
    useSelector((state: WithVariantsState) => state.variants ?? [], isEqual);
