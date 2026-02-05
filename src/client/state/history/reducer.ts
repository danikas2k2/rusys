import { cloneDeep } from 'lodash';

import { HistoryActionType, type HistoryAction } from '~/client/state/history/actions';
import type { History } from '~/types/data';

export function history(state: readonly History[] = [], action: Readonly<HistoryAction>): readonly History[] {
    switch (action.type) {
        case HistoryActionType.SET:
            return cloneDeep(action.history);

        default:
            return state;
    }
}
