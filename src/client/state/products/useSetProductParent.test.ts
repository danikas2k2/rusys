import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetProductParent } from '~/client/state/products/useSetProductParent';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useSetProductParent', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls set parent action', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetParent, {
            group: 'Daržovės',
            name: 'Agurkai (Zewa)',
            parent: 'Agurkai',
        });
    });

    it('calls set parent action with undefined to clear the parent', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai (Zewa)', undefined);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetParent, {
            group: 'Daržovės',
            name: 'Agurkai (Zewa)',
            parent: undefined,
        });
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
