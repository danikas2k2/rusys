import { Year } from '~/store/details.types';
import { YearsAction, YearsActionType } from '~/store/years.actions';

export default function years(years: Year[] = [], action: YearsAction) {
    switch (action.type) {
        case YearsActionType.SET:
            return [...action.years];

        default:
            return years;
    }
}
