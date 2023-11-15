import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateDetails', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call update action', async () => {
        const { result } = renderHook(() => useUpdateDetails(), withReduxState());
        await result.current('G', 'A', 21, { '': 1 });
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            value: { '': 1 },
        });
        expect(request).toHaveBeenCalledWith('/updateDetails', {
            group: 'G',
            name: 'A',
            year: 21,
            value: { '': 1 },
            updateWithoutHistory: false,
        });
    });

    it('call update action without value', async () => {
        const { result } = renderHook(() => useUpdateDetails(), withReduxState());
        await result.current('G', 'A', 21);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
        });
        expect(request).toHaveBeenCalledWith('/updateDetails', {
            group: 'G',
            name: 'A',
            year: 21,
            updateWithoutHistory: false,
        });
    });

    it('call update action without year and value', async () => {
        const { result } = renderHook(() => useUpdateDetails(), withReduxState());
        await result.current('G', 'A');
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
        });
        expect(request).toHaveBeenCalledWith('/updateDetails', {
            group: 'G',
            name: 'A',
            updateWithoutHistory: false,
        });
    });

    it('call update action with blank name, and without year and value', async () => {
        const { result } = renderHook(() => useUpdateDetails(), withReduxState());
        await result.current('G', '');
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: '',
        });
        expect(request).toHaveBeenCalledWith('/updateDetails', {
            group: 'G',
            name: '',
            updateWithoutHistory: false,
        });
    });

    it('call update action with blank group and name, and without year and value', async () => {
        const { result } = renderHook(() => useUpdateDetails(), withReduxState());
        await result.current('', '');
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.UPDATE,
            group: '',
            name: '',
        });
        expect(request).toHaveBeenCalledWith('/updateDetails', {
            group: '',
            name: '',
            updateWithoutHistory: false,
        });
    });

    it('call update action with updateWithoutHistory=true', async () => {
        const { result } = renderHook(() => useUpdateDetails(), withReduxState());
        await result.current('G', 'A', undefined, undefined, true);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
        });
        expect(request).toHaveBeenCalledWith('/updateDetails', {
            group: 'G',
            name: 'A',
            updateWithoutHistory: true,
        });
    });
});
