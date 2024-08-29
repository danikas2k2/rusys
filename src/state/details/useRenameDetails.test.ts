import { renderHook } from '@testing-library/react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useRenameDetails', () => {
    const request = jest.fn();

    beforeAll(() => (useUpdatingApiRequest as jest.Mock).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls rename actions', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', 'B');
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsRename, { group: 'G', name: 'A', newName: 'B' });
    });

    it('does not call rename actions with same name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', 'A');
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', '', 'A');
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', '');
        expect(request).not.toHaveBeenCalled();
    });

    it('calls rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', 'A', 'B');
        expect(request).not.toHaveBeenCalled();
    });
});
