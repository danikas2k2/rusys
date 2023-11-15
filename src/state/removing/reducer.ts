import { cloneDeep } from 'lodash';
import { type RemovingAction, RemovingActionType } from '~/state/removing/actions';
import { type Removing, type RemovingSet } from '~/state/removing/types';

// TODO update reducer to remove empty sets
export default function removing(removing: RemovingSet = {}, action: RemovingAction): RemovingSet {
    switch (action.type) {
        case RemovingActionType.SET:
            return cloneDeep(action.removing);

        case RemovingActionType.UPDATE: {
            const values: Removing = { ...removing[action.group]?.[action.name] };
            if (action.year) {
                if (action.removing) {
                    values[action.year] = action.removing;
                } else {
                    delete values[action.year];
                }
            }
            return { ...removing, [action.group]: { ...removing[action.group], [action.name]: values } };
        }

        default:
            return removing;
    }
}
