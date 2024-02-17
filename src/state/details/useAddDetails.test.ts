import { renderHook } from '@testing-library/react';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useSetDetailsYears } from '~/state/details/useSetDetailsYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useSetDetailsYears');

describe('useAddDetails', () => {
    const update = jest.fn();

    beforeAll(() => {
        (useSetDetailsYears as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useAddDetails(), withReduxState());
        await result.current('G', 'A');
        expect(update).toHaveBeenCalledWith('G', 'A');
    });

    it('calls update action with empty params', async () => {
        const { result } = renderHook(() => useAddDetails(), withReduxState());
        await result.current('', '');
        expect(update).toHaveBeenCalledWith('', '');
    });
});
