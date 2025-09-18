import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { type WithSummaryState } from '~/state/summary/types';
import { type Summary } from '~/types/data';

export const useSummary = (): ReadonlyArray<Summary> =>
    useSelector((state: WithSummaryState) => state.summary ?? [], isEqual);
