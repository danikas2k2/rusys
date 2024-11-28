import { cloneDeep } from 'lodash';
import { type Variant } from '~/common/types';
import { type VariantsAction, VariantsActionType } from '~/state/variants/actions';

export function variants(state: ReadonlyArray<Variant> = [], action: VariantsAction): ReadonlyArray<Variant> {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        default:
            return state;
    }
}
