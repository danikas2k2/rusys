import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { MissingActionType } from '~/state/missing/actions';
import { useRemoveMissing } from '~/state/missing/useRemoveMissing';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/missing/useUpdateMissing');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRemoveMissing', () => {
    const dispatch = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdateMissing as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('call update action', async () => {
        const { result } = renderHook(
            () => useRemoveMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        await result.current('G', 'A');
        expect(dispatch).toHaveBeenCalledWith({
            type: MissingActionType.REMOVE,
            group: 'G',
            name: 'A',
        });
        expect(update).toHaveBeenCalledWith([]);
    });

    it('do not call update action if name not found', async () => {
        const { result } = renderHook(
            () => useRemoveMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        await result.current('G', 'B');
        expect(dispatch).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it('do not call update action if group not found', async () => {
        const { result } = renderHook(
            () => useRemoveMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        await result.current('H', 'A');
        expect(dispatch).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });
});
