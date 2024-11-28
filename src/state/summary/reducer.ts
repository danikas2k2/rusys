import { cloneDeep } from 'lodash';
import { type Summary } from '~/common/types';
import { type SummaryAction, SummaryActionType } from './actions';

export function summary(state: ReadonlyArray<Summary> = [], action: SummaryAction): ReadonlyArray<Summary> {
    switch (action.type) {
        case SummaryActionType.SET:
            return cloneDeep(action.summary);

        default:
            return state;
    }
}
