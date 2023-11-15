import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { MissingActionType } from '~/state/missing/actions';
import { useRemoveMissingGroup } from '~/state/missing/useRemoveMissingGroup';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/missing/useUpdateMissing');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRemoveMissingGroup', () => {
    const dispatch = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdateMissing as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    const missing = [
        { group: 'G', name: 'A' },
        { group: '', name: 'A' },
        { group: 'G', name: 'B' },
    ];

    it('call update action', async () => {
        const { result } = renderHook(() => useRemoveMissingGroup(), withReduxState({ missing }));
        await result.current('G');
        expect(dispatch).toHaveBeenCalledWith({
            type: MissingActionType.REMOVE_GROUP,
            group: 'G',
        });
        expect(update).toHaveBeenCalledWith([{ group: '', name: 'A' }]);
    });

    it('do not call update action if group not found', async () => {
        const { result } = renderHook(() => useRemoveMissingGroup(), withReduxState({ missing }));
        await result.current('H');
        expect(dispatch).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });
});
