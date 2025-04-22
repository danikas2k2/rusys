import { useSelector } from 'react-redux';
import { type WithFilterState } from '~/state/filter/types';
import { isEqual } from 'lodash';

export function useFilter(): string {
    return useSelector((state: WithFilterState) => state.filter ?? '', isEqual);
}
