import { type FilterAction, FilterActionType } from '~/store/filter/actions';

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
