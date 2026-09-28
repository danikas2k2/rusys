import { YearsActionType, type YearsAction } from '~/store/years/actions';

export function years(state: readonly number[] = [], action: YearsAction): readonly number[] {
    switch (action.type) {
        case YearsActionType.SET:
            return [...action.years];

        default:
            return state;
    }
}
