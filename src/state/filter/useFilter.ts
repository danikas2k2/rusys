import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Filter, type WithFilterState } from '~/state/filter/types';

export function useFilter(): Filter {
    return useSelector((state: WithFilterState) => state.filter ?? '', isEqual);
}
