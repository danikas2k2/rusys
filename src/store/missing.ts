import type { Name } from '~/store/details.types';
import type { MissingAction } from '~/store/missing.actions';
import { MissingActionType } from '~/store/missing.actions';

function add(missing: Name[], name: Name) {
    const index = missing.indexOf(name);
    if (index >= 0) {
        return missing;
    }
    return [...missing, name];
}

function remove(missing: Name[], name: Name) {
    const index = missing.indexOf(name);
    if (index < 0) {
        return missing;
    }
    return [...missing.slice(0, index), ...missing.slice(index + 1)];
}

export default function missing(missing: Name[] = [], action: MissingAction): Name[] {
    switch (action.type) {
        case MissingActionType.SET:
            return [...action.missing];

        case MissingActionType.ADD:
            return add(missing, action.name);

        case MissingActionType.REMOVE:
            return remove(missing, action.name);

        default:
            return missing;
    }
}
