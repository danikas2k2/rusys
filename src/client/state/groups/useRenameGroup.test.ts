import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useRenameGroup', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsRename, {
            group: 'Uogienės',
            newGroup: 'Daržovės',
        });
    });

    it('calls rename action with annual and review parameters', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės', true, true);

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsRename, {
            group: 'Uogienės',
            newGroup: 'Daržovės',
            annual: true,
            review: true,
        });
    });

    it.each`
        title                | group         | newGroup
        ${'same group'}      | ${'Uogienės'} | ${'Uogienės'}
        ${'empty group'}     | ${''}         | ${'Šaldytos'}
        ${'empty new group'} | ${'Uogienės'} | ${''}
    `('does not call rename action with $title', async ({ group, newGroup }: { group: string; newGroup: string }) => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current(group, newGroup);

        expect(request).not.toHaveBeenCalled();
    });
});
