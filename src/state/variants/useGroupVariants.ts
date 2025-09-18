import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { type WithVariantsState } from '~/state/variants/types';
import { type Variant } from '~/types/data';

export const useGroupVariants = (group: string): ReadonlyArray<Variant> =>
    useSelector((state: WithVariantsState) => state.variants?.filter((v) => v.group === group) ?? [], isEqual);
