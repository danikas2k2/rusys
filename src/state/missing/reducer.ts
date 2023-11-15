import { type MissingAction, MissingActionType } from '~/state/missing/actions';
import { type Missing } from '~/state/missing/types';

export default function missing(missing: Missing = [], action: MissingAction): Missing {
    switch (action.type) {
        case MissingActionType.SET:
            return [...action.missing.map((value) => (typeof value === 'string' ? { group: '', name: value } : value))];

        case MissingActionType.ADD:
            if (missing.some((item) => item.group === action.group && item.name === action.name)) {
                return missing;
            }
            return [...missing, { group: action.group, name: action.name }];

        case MissingActionType.REMOVE: {
            const filtered = missing.filter((item) => item.group !== action.group || item.name !== action.name);
            return filtered.length === missing.length ? missing : filtered;
        }

        case MissingActionType.REMOVE_GROUP: {
            const filtered = missing.filter((item) => item.group !== action.group);
            return filtered.length === missing.length ? missing : filtered;
        }

        default:
            return missing;
    }
}
