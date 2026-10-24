import { useQuery } from '@tanstack/react-query';

import type { Group } from '~/schema';
import { getGroupsAction } from '~/server/actions/groups';
import { CATALOG_KEYS } from '~/store/catalog';

const EMPTY_GROUPS: readonly Group[] = [];

export const useGroups = (): readonly Group[] =>
    useQuery({ queryKey: CATALOG_KEYS.groups, queryFn: getGroupsAction, enabled: false }).data ?? EMPTY_GROUPS;
