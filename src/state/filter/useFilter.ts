import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type WithFilterState } from '~/state/filter/types';

export function useFilter(): string {
    return useSelector((state: WithFilterState) => state.filter ?? '', isEqual);
}
