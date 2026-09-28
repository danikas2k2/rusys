import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { Group } from '~/common/data';
import type { WithGroupsState } from '~/store/groups/types';

export const useGroups = (): readonly Group[] => useSelector((state: WithGroupsState) => state.groups ?? [], equal);
