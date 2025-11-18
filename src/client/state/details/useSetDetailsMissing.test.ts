import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetDetailsMissing } from '~/client/state/details/useSetDetailsMissing';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');

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

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), { wrapper: MockRedux });

        await result.current('', 'Avietės', true);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), { wrapper: MockRedux });

        await result.current('Uogienės', '', true);

        expect(request).not.toHaveBeenCalled();
    });
});
