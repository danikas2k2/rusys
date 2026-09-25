import { cloneDeep } from 'lodash';

import type { Summary } from '~/common/data';
import { SummaryActionType, type SummaryAction } from './actions';

export function summary(state: readonly Summary[] = [], action: SummaryAction): readonly Summary[] {
    switch (action.type) {
        case SummaryActionType.SET:
            return cloneDeep(action.summary);

        default:
            return state;
    }
}
