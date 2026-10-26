import { act, renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useSetProductMissing } from '~/features/products/hooks/useSetProductMissing';
import { trackFaroEvent } from '~/lib/observability/faro';
import { setProductMissingAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';
import { useError } from '~/store/error/useError';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

function useSubject() {
    const mutate = useSetProductMissing();
    const error = useError((state) => state.error);
    return { mutate, error };
}

describe('useSetProductMissing', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each([true, false])('updates missing=%s and sends the mutation', async (missing) => {
        const { client, wrapper } = mockQuery({ products: [{ group: 'Food', name: 'Rice', missing: !missing }] });
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', missing }));

        expect(setProductMissingAction).toHaveBeenCalledWith({ group: 'Food', name: 'Rice', missing });
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Food', name: 'Rice', missing: missing || undefined },
        ]);
    });

    it.each([
        ['', 'Rice'],
        ['Food', ''],
    ])('ignores incomplete keys', async (group, name) => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group, name, missing: true }));

        expect(setProductMissingAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('rolls back the cached value and reports a failed mutation', async () => {
        vi.mocked(setProductMissingAction).mockRejectedValueOnce(new Error('Request failed'));
        const original = [{ group: 'Food', name: 'Rice', missing: false }];
        const { client, wrapper } = mockQuery({ products: original });
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', missing: true }));

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual(original);
        expect(result.current.error).toBe('Something went wrong');
        expect(trackFaroEvent).toHaveBeenLastCalledWith('data_action', {
            entity: 'product',
            action: 'set_missing',
            result: 'error',
        });
    });

    it('keeps another product update when an earlier mutation fails', async () => {
        let rejectFirst!: (error: Error) => void;
        vi.mocked(setProductMissingAction)
            .mockImplementationOnce(
                () =>
                    new Promise((_, reject) => {
                        rejectFirst = reject;
                    })
            )
            .mockResolvedValueOnce(undefined);
        const original = [
            { group: 'Food', name: 'Rice', missing: false },
            { group: 'Food', name: 'Beans', missing: false },
        ];
        const { client, wrapper } = mockQuery({ products: original });
        const { result } = renderHook(useSubject, { wrapper });
        let first!: Promise<void>;
        act(() => {
            first = result.current.mutate({ group: 'Food', name: 'Rice', missing: true });
        });
        await act(() => result.current.mutate({ group: 'Food', name: 'Beans', missing: true }));
        rejectFirst(new Error('Rice failed'));
        await act(() => first);

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            original[0],
            { ...original[1], missing: true },
        ]);
        expect(result.current.error).toBe('Something went wrong');
    });

    it('serializes mutations of the same missing field', async () => {
        let rejectFirst!: (error: Error) => void;
        vi.mocked(setProductMissingAction)
            .mockImplementationOnce(
                () =>
                    new Promise((_, reject) => {
                        rejectFirst = reject;
                    })
            )
            .mockResolvedValueOnce(undefined);
        const { client, wrapper } = mockQuery({ products: [{ group: 'Food', name: 'Rice', missing: false }] });
        const { result } = renderHook(useSubject, { wrapper });
        let first!: Promise<void>;
        let second!: Promise<void>;
        act(() => {
            first = result.current.mutate({ group: 'Food', name: 'Rice', missing: true });
            second = result.current.mutate({ group: 'Food', name: 'Rice', missing: true });
        });

        expect(setProductMissingAction).toHaveBeenCalledTimes(1);

        rejectFirst(new Error('First failed'));
        await act(() => Promise.all([first, second]));

        expect(setProductMissingAction).toHaveBeenCalledTimes(2);
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Food', name: 'Rice', missing: true },
        ]);
    });

    it('keeps the committed value when only the refresh fails', async () => {
        vi.mocked(useGetProducts).mockReturnValueOnce(vi.fn().mockRejectedValue(new Error('Refresh failed')));
        const { client, wrapper } = mockQuery({ products: [{ group: 'Food', name: 'Rice', missing: false }] });
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', missing: true }));

        expect(setProductMissingAction).toHaveBeenCalledWith({ group: 'Food', name: 'Rice', missing: true });
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Food', name: 'Rice', missing: true },
        ]);
        expect(result.current.error).toBe('Something went wrong');
    });
});
