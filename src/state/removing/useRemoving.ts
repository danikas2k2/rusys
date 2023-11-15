import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type RemovingSet, type WithRemovingState } from '~/state/removing/types';

export function useRemoving(): RemovingSet {
    return useSelector((state: WithRemovingState) => state.removing ?? {}, isEqual);
}
