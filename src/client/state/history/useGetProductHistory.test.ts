import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProductHistory } from '~/client/state/history/useGetProductHistory';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useGetProductHistory', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls request with ApiUrl.History and year', async () => {
        const year = 22;
        const { result } = renderHook(() => useGetProductHistory(year));

        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsHistory, { year });
    });
});
