import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useRenameProduct } from '~/client/state/products/useRenameProduct';
import { ApiUrl } from '~/types/api';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useRenameProduct', () => {
    const request = vi.fn();

    beforeAll(() => vi.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => vi.clearAllMocks());

    it('calls rename actions', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Gervuogės');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsRename, {
            group: 'Uogienės',
            name: 'Avietės',
            newName: 'Gervuogės',
        });
    });

    it('does not call rename actions with same name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 'Gervuogės');

        expect(request).not.toHaveBeenCalled();
    });
});
