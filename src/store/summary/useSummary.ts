import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { Summary } from '~/common/data';
import type { WithSummaryState } from './types';

export const useSummary = (): readonly Summary[] =>
    useSelector((state: WithSummaryState) => state.summary ?? [], equal);
