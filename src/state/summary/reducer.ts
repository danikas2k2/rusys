import { type Summary } from '~/types/data';
import { SummaryActionType, type SummaryAction } from './actions';
import { cloneDeep } from 'lodash';

export function summary(state: ReadonlyArray<Summary> = [], action: SummaryAction): ReadonlyArray<Summary> {
    switch (action.type) {
        case SummaryActionType.SET:
            return cloneDeep(action.summary);

        default:
            return state;
    }
}
