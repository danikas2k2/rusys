import { cloneDeep } from 'lodash';

import { VariantsActionType, type VariantsAction } from '~/state/variants/actions';
import { type Variant } from '~/types/data';

export function variants(state: ReadonlyArray<Variant> = [], action: VariantsAction): ReadonlyArray<Variant> {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        default:
            return state;
    }
}
