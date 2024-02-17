import { type YearsAction, YearsActionType } from '~/state/years/actions';

export function years(years: ReadonlyArray<number> = [], action: YearsAction): ReadonlyArray<number> {
    switch (action.type) {
        case YearsActionType.SET:
            return [...action.years];

        default:
            return years;
    }
}
