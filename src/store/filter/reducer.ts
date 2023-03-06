import type { FilterAction } from '~/store/filter/actions';
import { FilterActionType } from '~/store/filter/actions';

export default function filter(filter = '', action: FilterAction): string {
    switch (action.type) {
        case FilterActionType.SET:
            return action.filter;

        case FilterActionType.CLEAN:
            return '';

        default:
            return filter;
    }
}
