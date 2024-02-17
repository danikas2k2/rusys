import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetDetailsMissing', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), withReduxState());
        await result.current('G', 'A', true);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_MISSING,
            group: 'G',
            name: 'A',
            missing: true,
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'G',
            name: 'A',
            missing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), withReduxState());
        await result.current('G', 'A', false);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_MISSING,
            group: 'G',
            name: 'A',
            missing: false,
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'G',
            name: 'A',
            missing: false,
        });
    });
});
