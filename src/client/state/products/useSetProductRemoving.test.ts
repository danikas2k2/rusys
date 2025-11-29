import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { ApiUrl } from '~/types/api';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useSetProductRemoving', () => {
    const request = vi.fn();

    beforeAll(() => vi.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 21, true);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetRemoving, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 21,
            removing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 22, false);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetRemoving, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            removing: false,
        });
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 21, true);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 21, true);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when year is 0', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 0, true);

        expect(request).not.toHaveBeenCalled();
    });
});
