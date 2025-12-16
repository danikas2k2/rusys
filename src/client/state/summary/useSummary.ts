import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithSummaryState } from '~/client/state/summary/types';
import type { Summary } from '~/types/data';

export const useSummary = (): readonly Summary[] =>
    useSelector((state: WithSummaryState) => state.summary ?? [], equal);
