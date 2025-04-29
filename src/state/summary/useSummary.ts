import { useSelector } from 'react-redux';
import { type Summary } from '~/common/types';
import { type WithSummaryState } from '~/state/summary/types';
import { isEqual } from 'lodash';

export const useSummary = (): ReadonlyArray<Summary> =>
    useSelector((state: WithSummaryState) => state.summary ?? [], isEqual);
