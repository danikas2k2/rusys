import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type WithYearsState, type Years } from '~/state/years/types';

export function useYears(): Years {
    return useSelector((state: WithYearsState) => state.years ?? [], isEqual);
}
