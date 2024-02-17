import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type WithYearsState } from '~/state/years/types';

export const useYears = (): ReadonlyArray<number> => useSelector((state: WithYearsState) => state.years ?? [], isEqual);
