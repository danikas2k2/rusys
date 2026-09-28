import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useUpdateVariant } from '~/store/variants/useUpdateVariant';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useUpdateVariant', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action with mandatory parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', { order: 1 });

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/groups/Uogien%C4%97s/variants/p', { order: 1 }, 'PATCH');
        expect(request).toHaveBeenNthCalledWith(2, '/api/v1/variants', 'GET');
    });

    it('calls update action with additional parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', { order: 1, suffix: '1/2' });

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/variants/p',
            { order: 1, suffix: '1/2' },
            'PATCH'
        );
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('', 'p', {});

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with empty variant', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Šaldyti', '', {});

        expect(request).not.toHaveBeenCalled();
    });

    it('calls update action with empty update', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', {});

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/groups/Uogien%C4%97s/variants/p', {}, 'PATCH');
    });
});
