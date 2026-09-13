import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useDeleteVariant', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/variants/Aviet%C4%97s',
            undefined,
            'DELETE'
        );
        expect(request).toHaveBeenNthCalledWith(2, '/api/v1/variants', 'GET');
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty variant', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(request).not.toHaveBeenCalled();
    });
});
