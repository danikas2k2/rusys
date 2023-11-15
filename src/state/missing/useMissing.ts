import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Missing, type WithMissingState } from '~/state/missing/types';

export function useMissing(): Missing {
    return useSelector((state: WithMissingState) => state.missing ?? [], isEqual);
}
