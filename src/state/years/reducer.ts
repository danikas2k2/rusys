import { type YearsAction, YearsActionType } from '~/state/years/actions';

export function years(state: ReadonlyArray<number> = [], action: YearsAction): ReadonlyArray<number> {
    switch (action.type) {
        case YearsActionType.SET:
            return [...action.years];

        default:
            return state;
    }
}
