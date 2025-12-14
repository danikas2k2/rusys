import { useSelector } from 'react-redux';

import equal from 'fast-deep-equal/es6/react';

import type { WithGroupsState } from '~/client/state/groups/types';

export const useIsAnnual = (group: string): boolean =>
    useSelector((state: WithGroupsState) => state.groups?.find((g) => g.group === group)?.annual ?? true, equal);
