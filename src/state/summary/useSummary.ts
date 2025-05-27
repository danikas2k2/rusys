import { useSelector } from 'react-redux';
import { type WithSummaryState } from '~/state/summary/types';
import { type Summary } from '~/types/data';
import { isEqual } from 'lodash';

export const useSummary = (): ReadonlyArray<Summary> =>
    useSelector((state: WithSummaryState) => state.summary ?? [], isEqual);
