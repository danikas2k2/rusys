import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { MissingActionType } from '~/state/missing/actions';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateMissing', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call update action', async () => {
        const { result } = renderHook(
            () => useUpdateMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        await result.current([{ group: 'G', name: 'B' }]);
        expect(dispatch).toHaveBeenCalledWith({
            type: MissingActionType.SET,
            missing: [{ group: 'G', name: 'B' }],
        });
        expect(request).toHaveBeenCalledWith('/setMissing', {
            missing: [{ group: 'G', name: 'B' }],
        });
    });

    it('call update action with empty value', async () => {
        const { result } = renderHook(
            () => useUpdateMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        await result.current([]);
        expect(dispatch).toHaveBeenCalledWith({
            type: MissingActionType.SET,
            missing: [],
        });
        expect(request).toHaveBeenCalledWith('/setMissing', {
            missing: [],
        });
    });
});
