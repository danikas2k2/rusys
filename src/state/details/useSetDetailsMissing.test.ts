import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSetDetailsMissing', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), { wrapper: MockRedux });
        await result.current('G', 'A', true);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'G',
            name: 'A',
            missing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), { wrapper: MockRedux });
        await result.current('G', 'A', false);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'G',
            name: 'A',
            missing: false,
        });
    });
});
