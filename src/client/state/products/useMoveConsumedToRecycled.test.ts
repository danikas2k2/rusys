import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useMoveConsumedToRecycled } from '~/client/state/products/useMoveConsumedToRecycled';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useMoveConsumedToRecycled', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls move to recycled action', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, 'd', 2, {}, 'user@example.com');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsMoveToRecycled, {
            group: 'Daržovės',
            name: 'Agurkai',
            year: 22,
            variant: 'd',
            amount: 2,
            user: 'user@example.com',
        });
    });

    it('passes suspicious/home flags through', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, 'd', 2, { home: true });

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsMoveToRecycled, {
            group: 'Daržovės',
            name: 'Agurkai',
            year: 22,
            variant: 'd',
            amount: 2,
            user: undefined,
            home: true,
        });
    });

    it('does not call the action with empty group', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('', 'Agurkai', 22, 'd', 2);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call the action with empty name', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', '', 22, 'd', 2);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call the action with empty variant', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, '', 2);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call the action with a non-positive amount', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, 'd', 0);

        expect(request).not.toHaveBeenCalled();
    });
});
