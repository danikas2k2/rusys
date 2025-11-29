import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { ApiUrl } from '~/types/api';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useSetProductMissing', () => {
    const request = vi.fn();

    beforeAll(() => vi.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', true);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetMissing, {
            group: 'Uogienės',
            name: 'Avietės',
            missing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', false);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetMissing, {
            group: 'Uogienės',
            name: 'Avietės',
            missing: false,
        });
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('', 'Avietės', true);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('Uogienės', '', true);

        expect(request).not.toHaveBeenCalled();
    });
});
