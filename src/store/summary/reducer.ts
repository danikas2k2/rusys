import { cloneDeep } from 'lodash';
import { type AmountSet } from '~/store/details/types';
import { type SummaryAction, SummaryActionType } from './actions';

export default function statistics(statistics: AmountSet = {}, action: SummaryAction): AmountSet {
    switch (action.type) {
        case SummaryActionType.SET:
            return cloneDeep(action.summary);

        default:
            return statistics;
    }
}
