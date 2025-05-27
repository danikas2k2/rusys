import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useRenameDetails', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls rename actions', async () => {
        const { result } = renderHook(() => useRenameDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Gervuogės');

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsRename, {
            group: 'Uogienės',
            name: 'Avietės',
            newName: 'Gervuogės',
        });
    });

    it('does not call rename actions with same name', async () => {
        const { result } = renderHook(() => useRenameDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameDetails(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 'Gervuogės');

        expect(request).not.toHaveBeenCalled();
    });
});
