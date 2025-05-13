import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useAddDetails } from '~/state/details/useAddDetails';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useAddDetails', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddDetails(), { wrapper: MockRedux });
        await result.current('G', 'A');

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsAdd, {
            group: 'G',
            name: 'A',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddDetails(), { wrapper: MockRedux });
        await result.current('G', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddDetails(), { wrapper: MockRedux });
        await result.current('', 'A');

        expect(request).not.toHaveBeenCalled();
    });
});
