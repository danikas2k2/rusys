import { type FilterAction, FilterActionType } from '~/state/filter/actions';

export function filter(filter: string = '', action: Readonly<FilterAction>): string {
    switch (action.type) {
        case FilterActionType.SET:
            return action.filter;

        case FilterActionType.CLEAR:
            return '';

        default:
            return filter;
    }
}
