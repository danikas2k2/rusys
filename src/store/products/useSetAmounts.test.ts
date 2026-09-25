import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useSetAmounts } from '~/store/products/useSetAmounts';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetAmounts', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25, [{ variant: 'p', amount: 1 }]);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s/years/25/amounts',
            {
                amounts: [{ variant: 'p', amount: 1 }],
                user: undefined,
                comment: undefined,
            },
            'PUT'
        );
    });

    it('calls update action without amounts', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s/years/25/amounts',
            { amounts: undefined, user: undefined, comment: undefined },
            'PUT'
        );
    });

    it('calls update action with zero year (non-annual)', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 0);

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s/years/0/amounts',
            { amounts: undefined, user: undefined, comment: undefined },
            'PUT'
        );
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(request).not.toHaveBeenCalled();
    });
});
