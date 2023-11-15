import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type AmountSet } from '~/state/details/types';
import { type WithSummaryState } from '~/state/summary/types';

export function useSummary(): AmountSet {
    return useSelector((state: WithSummaryState) => state.summary ?? {}, isEqual);
}
