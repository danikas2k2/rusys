import { useSelector } from 'react-redux';

import equal from 'fast-deep-equal/es6/react';

import type { WithGroupsState } from '~/client/state/groups/types';
import type { Group } from '~/types/data';

export const useGroups = (): readonly Group[] => useSelector((state: WithGroupsState) => state.groups ?? [], equal);
