import type { History } from '~/types/data';

export interface WithHistoryState {
    updates?: readonly History[];
    undates?: readonly History[];
}
