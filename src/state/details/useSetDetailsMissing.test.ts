import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSetDetailsMissing', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', true);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'Uogienės',
            name: 'Avietės',
            missing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', false);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'Uogienės',
            name: 'Avietės',
            missing: false,
        });
    });
});
