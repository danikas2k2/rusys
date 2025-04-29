import { type Variant } from '~/common/types';
import { VariantsActionType, type VariantsAction } from '~/state/variants/actions';
import { cloneDeep } from 'lodash';

export function variants(state: ReadonlyArray<Variant> = [], action: VariantsAction): ReadonlyArray<Variant> {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        default:
            return state;
    }
}
