import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useSetProductParent } from '~/store/products/useSetProductParent';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductParent', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls set parent action', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai%20(Zewa)',
            { parent: 'Agurkai' },
            'PATCH'
        );
    });

    it('calls set parent action with undefined to clear the parent', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai (Zewa)', undefined);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai%20(Zewa)',
            { parent: null },
            'PATCH'
        );
    });

    it('does not call set parent action with empty group', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('', 'Agurkai (Zewa)', 'Agurkai');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call set parent action with empty name', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', '', 'Agurkai');

        expect(request).not.toHaveBeenCalled();
    });
});
