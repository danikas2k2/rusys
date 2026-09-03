import type { History } from '@rusys/common/data';

export interface WithHistoryState {
    updates?: readonly History[];
    undates?: readonly History[];
}
