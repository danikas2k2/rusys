import type { Group } from '@rusys/common/data';
import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithGroupsState } from '~/store/groups/types';

export const useGroups = (): readonly Group[] => useSelector((state: WithGroupsState) => state.groups ?? [], equal);
