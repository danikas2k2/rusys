import { cloneDeep } from 'lodash';

import type { Variant } from '~/common/data';
import { VariantsActionType, type VariantsAction } from '~/store/variants/actions';

export function variants(state: readonly Variant[] = [], action: VariantsAction): readonly Variant[] {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        default:
            return state;
    }
}
