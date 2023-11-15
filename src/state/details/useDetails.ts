import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type AmountSet, type WithDetailsState } from '~/state/details/types';

export function useDetails(): AmountSet {
    return useSelector((state: WithDetailsState) => state.details ?? {}, isEqual);
}
