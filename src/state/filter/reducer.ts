import { type FilterAction, FilterActionType } from '~/state/filter/actions';

export default function filter(filter = '', action: FilterAction): string {
    switch (action.type) {
        case FilterActionType.SET:
            return action.filter;

        case FilterActionType.CLEAR:
            return '';

        default:
            return filter;
    }
}
