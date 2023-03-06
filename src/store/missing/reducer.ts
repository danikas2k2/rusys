import type { Name } from '~/store/details/types';
import type { MissingAction } from '~/store/missing/actions';
import { MissingActionType } from '~/store/missing/actions';

export default function missing(missing: Name[] = [], action: MissingAction): Name[] {
    switch (action.type) {
        case MissingActionType.SET:
            return [...action.missing];

        case MissingActionType.ADD:
            if (missing.includes(action.name)) {
                return missing;
            }
            return [...missing, action.name];

        case MissingActionType.REMOVE:
            if (!missing.includes(action.name)) {
                return missing;
            }
            return missing.filter((name) => name !== action.name);

        default:
            return missing;
    }
}
