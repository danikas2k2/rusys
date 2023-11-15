import { type Year } from '~/state/types';
import { type YearsAction, YearsActionType } from '~/state/years/actions';

export default function years(years: Year[] = [], action: YearsAction): Year[] {
    switch (action.type) {
        case YearsActionType.SET:
            return [...action.years];

        default:
            return years;
    }
}
