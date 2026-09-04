import type { History } from '@rusys/common/data';
import { cloneDeep } from 'lodash';

import { HistoryActionType, type HistoryAction } from '~/client/state/history/actions';

export function updates(state: readonly History[] = [], action: Readonly<HistoryAction>): readonly History[] {
    switch (action.type) {
        case HistoryActionType.SET_UPDATES:
            return cloneDeep(action.updates);

        default:
            return state;
    }
}

export function undates(state: readonly History[] = [], action: Readonly<HistoryAction>): readonly History[] {
    switch (action.type) {
        case HistoryActionType.SET_UNDATES:
            return cloneDeep(action.undates);

        default:
            return state;
    }
}
