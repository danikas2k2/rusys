import { renderHook } from '@testing-library/react';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProductHistory } from '~/client/state/history/useGetProductHistory';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useGetProductHistory', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls request with ApiUrl.History and year', async () => {
        const year = 22;
        const { result } = renderHook(() => useGetProductHistory(year));

        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsHistory, { year });
    });
});
