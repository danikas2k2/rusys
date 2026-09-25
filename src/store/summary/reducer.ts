import { cloneDeep } from 'lodash';

import type { Summary } from '~/common/data';
import { SummaryActionType, type SummaryAction } from './actions';

export function summary(state: readonly Summary[] = [], action: SummaryAction): readonly Summary[] {
    switch (action.type) {
        case SummaryActionType.SET:
            return action.summary.map((item) => {
                const current = state.find(
                    (currentItem) => currentItem.group === item.group && currentItem.name === item.name
                );
                return { ...cloneDeep(item), ...(current?.history ? { history: current.history } : {}) };
            });

        case SummaryActionType.SET_HISTORY:
            return state.map((item) =>
                item.group !== action.group || item.name !== action.name
                    ? item
                    : { ...item, history: { ...item.history, [action.year]: cloneDeep(action.history) } }
            );

        default:
            return state;
    }
}
