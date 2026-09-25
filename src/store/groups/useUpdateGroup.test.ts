import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useUpdateGroup } from '~/store/groups/useUpdateGroup';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useUpdateGroup', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s',
            { annual: undefined, review: undefined, image: undefined },
            'PUT'
        );
    });

    it('calls update action with annual parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', true);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s',
            { annual: true, review: undefined, image: undefined },
            'PUT'
        );
    });

    it('calls update action with review parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', true, true);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s',
            { annual: true, review: true, image: undefined },
            'PUT'
        );
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(request).not.toHaveBeenCalled();
    });
});
