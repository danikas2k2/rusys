import type { Variant } from '@rusys/common/data';
import { cloneDeep } from 'lodash';

import { VariantsActionType, type VariantsAction } from '~/store/variants/actions';

export function variants(state: readonly Variant[] = [], action: VariantsAction): readonly Variant[] {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        default:
            return state;
    }
}
