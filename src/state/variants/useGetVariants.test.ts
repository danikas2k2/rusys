import { renderHook } from '@testing-library/react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useGetVariants } from '~/state/variants/useGetVariants';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useGetVariants', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls get action', async () => {
        const { result } = renderHook(() => useGetVariants());
        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.Variants);
    });
});
