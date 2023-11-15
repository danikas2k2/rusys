import { cloneDeep } from 'lodash';
import { type AmountSet } from '~/state/details/types';
import { type SummaryAction, SummaryActionType } from './actions';

export default function summary(summary: AmountSet = {}, action: SummaryAction): AmountSet {
    switch (action.type) {
        case SummaryActionType.SET:
            return cloneDeep(action.summary);

        default:
            return summary;
    }
}
