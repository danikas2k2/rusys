import { useSelector } from 'react-redux';

import equal from 'fast-deep-equal/es6/react';

import type { WithYearsState } from '~/client/state/years/types';

export const useYears = (n?: number): readonly number[] =>
    useSelector((state: WithYearsState) => (n ? state.years?.slice(0, n) : state.years) ?? [], equal);
