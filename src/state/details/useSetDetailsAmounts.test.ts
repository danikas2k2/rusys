import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useSetDetailsAmounts } from '~/state/details/useSetDetailsAmounts';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetDetailsAmounts', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsAmounts(), withReduxState());
        await result.current('G', 'A', 21, [{ variant: 'p', amount: 1 }]);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_AMOUNTS,
            group: 'G',
            name: 'A',
            year: 21,
            amounts: [{ variant: 'p', amount: 1 }],
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetAmounts, {
            group: 'G',
            name: 'A',
            year: 21,
            amounts: [{ variant: 'p', amount: 1 }],
        });
    });

    it('calls update action without value', async () => {
        const { result } = renderHook(() => useSetDetailsAmounts(), withReduxState());
        await result.current('G', 'A', 21);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_AMOUNTS,
            group: 'G',
            name: 'A',
            year: 21,
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetAmounts, {
            group: 'G',
            name: 'A',
            year: 21,
        });
    });

    it('calls update action with withoutHistory=true', async () => {
        const { result } = renderHook(() => useSetDetailsAmounts(), withReduxState());
        await result.current('G', 'A', 21, undefined, true);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_AMOUNTS,
            group: 'G',
            name: 'A',
            year: 21,
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetAmounts, {
            group: 'G',
            name: 'A',
            year: 21,
            withoutHistory: true,
        });
    });
});
