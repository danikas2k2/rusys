import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useUpdateVariant } from '~/client/state/variants/useUpdateVariant';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useUpdateVariant', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action with mandatory parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', { order: 1 });

        expect(request).toHaveBeenCalledWith(ApiUrl.VariantsUpdate, { group: 'Uogienės', variant: 'p', order: 1 });
    });

    it('calls update action with additional parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', { order: 1, suffix: '1/2' });

        expect(request).toHaveBeenCalledWith(ApiUrl.VariantsUpdate, {
            group: 'Uogienės',
            variant: 'p',
            order: 1,
            suffix: '1/2',
        });
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

        expect(request).toHaveBeenCalledWith(ApiUrl.VariantsUpdate, {
            group: 'Uogienės',
            variant: 'p',
        });
    });
});
