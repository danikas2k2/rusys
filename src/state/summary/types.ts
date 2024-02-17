import { type Summary } from '~/common/types';

export interface WithSummaryState {
    summary?: ReadonlyArray<Summary>;
}
