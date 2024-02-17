import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Group } from '~/common/types';
import { type WithGroupsState } from '~/state/groups/types';

export function useGroup(group: string): Readonly<Group> | undefined {
    return useSelector((state: WithGroupsState) => state.groups?.find((g) => g.group === group), isEqual);
}
