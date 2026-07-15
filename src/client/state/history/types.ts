import type { History } from '~/types/data';

export interface WithHistoryState {
    history?: readonly History[];
    undates?: readonly History[];
}
