import type { History } from '~/common/data';

export interface WithHistoryState {
    updates?: readonly History[];
    undates?: readonly History[];
}
