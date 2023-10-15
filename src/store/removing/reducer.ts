import { cloneDeep } from 'lodash';
import { type RemovingAction, RemovingActionType } from '~/store/removing/actions';
import { type Removing, type RemovingSet } from '~/store/removing/types';

export default function removing(removing: RemovingSet = {}, action: RemovingAction): RemovingSet {
    switch (action.type) {
        case RemovingActionType.SET:
            return cloneDeep(action.removing);

        case RemovingActionType.UPDATE: {
            const values: Removing = { ...removing[action.name] };
            if (action.year) {
                if (action.removing) {
                    values[action.year] = action.removing;
                } else {
                    delete values[action.year];
                }
            }
            return { ...removing, [action.name]: values };
        }

        default:
            return removing;
    }
}
