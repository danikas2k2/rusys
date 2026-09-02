import type { Summary } from '~/common/data';

export interface WithSummaryState {
    summary?: readonly Summary[];
}
