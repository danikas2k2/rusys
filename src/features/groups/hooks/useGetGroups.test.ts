import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { getGroupsAction } from '~/server/actions/groups';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/groups'));

describe('useGetGroups', () => {
    it('loads groups into the shared query cache', async () => {
        const { client, wrapper } = mockQuery();
        const groups = [{ group: 'Food', order: 0 }];
        vi.mocked(getGroupsAction).mockResolvedValue(groups);
        const { result } = renderHook(useGetGroups, { wrapper });
        await result.current();

        expect(client.getQueryData(CATALOG_KEYS.groups)).toStrictEqual(groups);
    });
});
