import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type WithYearsState } from '~/state/years/types';

export const useYears = (n?: number): ReadonlyArray<number> =>
    useSelector((state: WithYearsState) => (n ? state.years?.slice(0, n) : state.years) ?? [], isEqual);
