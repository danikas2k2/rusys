import { renderHook } from '@testing-library/react';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';

jest.mock('~/state/details/useUpdateDetails');

describe('useAddDetails', () => {
    const update = jest.fn();

    beforeAll(() => {
        (useUpdateDetails as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('call update action', async () => {
        const { result } = renderHook(() => useAddDetails());
        await result.current('G', 'A');
        expect(update).toHaveBeenCalledWith('G', 'A');
    });

    it('call update action with empty params', async () => {
        const { result } = renderHook(() => useAddDetails());
        await result.current('', '');
        expect(update).toHaveBeenCalledWith('', '');
    });
});
