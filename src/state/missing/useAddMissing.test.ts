import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { MissingActionType } from '~/state/missing/actions';
import { useAddMissing } from '~/state/missing/useAddMissing';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/missing/useUpdateMissing');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useAddMissing', () => {
    const dispatch = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdateMissing as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('call update action', async () => {
        const { result } = renderHook(() => useAddMissing(), withReduxState());
        await result.current('G', 'A');
        expect(dispatch).toHaveBeenCalledWith({
            type: MissingActionType.ADD,
            group: 'G',
            name: 'A',
        });
        expect(update).toHaveBeenCalledWith([{ group: 'G', name: 'A' }]);
    });

    it('call update action with empty params', async () => {
        const { result } = renderHook(() => useAddMissing(), withReduxState());
        await result.current('', '');
        expect(dispatch).toHaveBeenCalledWith({
            type: MissingActionType.ADD,
            group: '',
            name: '',
        });
        expect(update).toHaveBeenCalledWith([{ group: '', name: '' }]);
    });

    it('do not call update action if already exists', async () => {
        const { result } = renderHook(
            () => useAddMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        await result.current('G', 'A');
        expect(dispatch).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });
});
