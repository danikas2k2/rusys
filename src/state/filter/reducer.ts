import { FilterActionType, type FilterAction } from '~/state/filter/actions';

export function filter(state: string = '', action: Readonly<FilterAction>): string {
    switch (action.type) {
        case FilterActionType.SET:
            return action.filter;

        case FilterActionType.CLEAR:
            return '';

        default:
            return state;
    }
}
