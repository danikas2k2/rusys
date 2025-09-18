import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useRenameGroup } from '~/state/groups/useRenameGroup';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useRenameGroup', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsRename, {
            group: 'Uogienės',
            newGroup: 'Daržovės',
        });
    });

    it.each`
        title                | group         | newGroup
        ${'same group'}      | ${'Uogienės'} | ${'Uogienės'}
        ${'empty group'}     | ${''}         | ${'Šaldytos'}
        ${'empty new group'} | ${'Uogienės'} | ${''}
    `('does not call rename action with $title', async ({ group, newGroup }) => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current(group, newGroup);

        expect(request).not.toHaveBeenCalled();
    });
});
