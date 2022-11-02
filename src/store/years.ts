import type { Year } from '~/store/details.types';
import type { YearsAction} from '~/store/years.actions';
import { YearsActionType } from '~/store/years.actions';

export default function years(years: Year[] = [], action: YearsAction): Year[] {
    switch (action.type) {
        case YearsActionType.SET:
            return [...action.years];

        default:
            return years;
    }
}
