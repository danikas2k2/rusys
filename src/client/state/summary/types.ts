import { type Summary } from '~/types/data';

export interface WithSummaryState {
    summary?: ReadonlyArray<Summary>;
}
