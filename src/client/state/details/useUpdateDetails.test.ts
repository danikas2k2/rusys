import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useUpdateDetails } from '~/client/state/details/useUpdateDetails';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateDetails', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useUpdateDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25, [{ variant: 'p', amount: 1 }]);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsUpdate, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 25,
            amounts: [{ variant: 'p', amount: 1 }],
        });
    });

    it('calls update action without amounts', async () => {
        const { result } = renderHook(() => useUpdateDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsUpdate, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 25,
        });
    });

    it('calls update action with zero year (non-annual)', async () => {
        const { result } = renderHook(() => useUpdateDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 0);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsUpdate, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 0,
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useUpdateDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useUpdateDetails(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(request).not.toHaveBeenCalled();
    });
});
