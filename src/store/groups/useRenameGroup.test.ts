import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useRenameGroup } from '~/store/groups/useRenameGroup';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/groups/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useRenameGroup', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės');

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s',
            { name: 'Daržovės', annual: undefined, review: undefined, image: undefined },
            'PATCH'
        );
        expect(request).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('calls rename action with annual and review parameters', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Daržovės', true, true);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s',
            { name: 'Daržovės', annual: true, review: true, image: undefined },
            'PATCH'
        );
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
