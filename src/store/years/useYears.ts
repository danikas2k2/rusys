import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithYearsState } from '~/store/years/types';

export const useYears = (n?: number): readonly number[] =>
    useSelector((state: WithYearsState) => (n ? state.years?.slice(0, n) : state.years) ?? [], equal);
