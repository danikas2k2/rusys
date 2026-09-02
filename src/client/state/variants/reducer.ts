import { cloneDeep } from 'lodash';

import { VariantsActionType, type VariantsAction } from '~/client/state/variants/actions';
import type { Variant } from '~/common/data';

export function variants(state: readonly Variant[] = [], action: VariantsAction): readonly Variant[] {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        default:
            return state;
    }
}
