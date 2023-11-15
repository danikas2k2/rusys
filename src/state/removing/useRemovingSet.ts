import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Removing, type WithRemovingState } from '~/state/removing/types';
import { type Group, type Name } from '~/state/types';

export function useRemovingSet(group: Group, name: Name): Removing {
    return useSelector((state: WithRemovingState) => state.removing?.[group]?.[name] ?? {}, isEqual);
}
