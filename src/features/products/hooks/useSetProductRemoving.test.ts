import { act, renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useSetProductRemoving } from '~/features/products/hooks/useSetProductRemoving';
import { setProductRemovingAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';
import { useError } from '~/store/error/useError';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

function useSubject() {
    const mutate = useSetProductRemoving();
    const error = useError((state) => state.error);
    return { mutate, error };
}

describe('useSetProductRemoving', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each([true, false])('updates removing=%s and sends the mutation', async (removing) => {
        const { client, wrapper } = mockQuery({
            products: [{ group: 'Food', name: 'Rice', years: [{ year: 21, removing: !removing }] }],
        });
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', year: 21, removing }));

        expect(setProductRemovingAction).toHaveBeenCalledWith({
            group: 'Food',
            name: 'Rice',
            year: 21,
            removing,
        });
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Food', name: 'Rice', years: [{ year: 21, removing: removing || undefined }] },
        ]);
    });

    it.each([
        ['', 'Rice', 21],
        ['Food', '', 21],
        ['Food', 'Rice', 0],
    ] as const)('ignores incomplete keys', async (group, name, year) => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group, name, year, removing: true }));

        expect(setProductRemovingAction).not.toHaveBeenCalled();
    });

    it('rolls back the cached value and reports a failed mutation', async () => {
        vi.mocked(setProductRemovingAction).mockRejectedValueOnce(new Error('Request failed'));
        const original = [{ group: 'Food', name: 'Rice', years: [{ year: 21, removing: false }] }];
        const { client, wrapper } = mockQuery({ products: original });
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', year: 21, removing: true }));

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual(original);
        expect(result.current.error).toBe('Something went wrong');
    });

    it('keeps another year update when an earlier mutation fails', async () => {
        let rejectFirst!: (error: Error) => void;
        vi.mocked(setProductRemovingAction)
            .mockImplementationOnce(
                () =>
                    new Promise((_, reject) => {
                        rejectFirst = reject;
                    })
            )
            .mockResolvedValueOnce(undefined);
        const original = [
            {
                group: 'Food',
                name: 'Rice',
                years: [
                    { year: 21, removing: false },
                    { year: 22, removing: false },
                ],
            },
        ];
        const { client, wrapper } = mockQuery({ products: original });
        const { result } = renderHook(useSubject, { wrapper });
        let first!: Promise<void>;
        act(() => {
            first = result.current.mutate({ group: 'Food', name: 'Rice', year: 21, removing: true });
        });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', year: 22, removing: true }));
        rejectFirst(new Error('Year 21 failed'));
        await act(() => first);

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            {
                ...original[0],
                years: [
                    { year: 21, removing: false },
                    { year: 22, removing: true },
                ],
            },
        ]);
        expect(result.current.error).toBe('Something went wrong');
    });

    it('serializes mutations of the same removing field', async () => {
        let rejectFirst!: (error: Error) => void;
        vi.mocked(setProductRemovingAction)
            .mockImplementationOnce(
                () =>
                    new Promise((_, reject) => {
                        rejectFirst = reject;
                    })
            )
            .mockResolvedValueOnce(undefined);
        const { client, wrapper } = mockQuery({
            products: [{ group: 'Food', name: 'Rice', years: [{ year: 21, removing: false }] }],
        });
        const { result } = renderHook(useSubject, { wrapper });
        let first!: Promise<void>;
        let second!: Promise<void>;
        act(() => {
            first = result.current.mutate({ group: 'Food', name: 'Rice', year: 21, removing: true });
            second = result.current.mutate({ group: 'Food', name: 'Rice', year: 21, removing: true });
        });

        expect(setProductRemovingAction).toHaveBeenCalledTimes(1);

        rejectFirst(new Error('First failed'));
        await act(() => Promise.all([first, second]));

        expect(setProductRemovingAction).toHaveBeenCalledTimes(2);
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Food', name: 'Rice', years: [{ year: 21, removing: true }] },
        ]);
    });

    it('keeps the committed value when only the refresh fails', async () => {
        vi.mocked(useGetProducts).mockReturnValueOnce(vi.fn().mockRejectedValue(new Error('Refresh failed')));
        const { client, wrapper } = mockQuery({
            products: [{ group: 'Food', name: 'Rice', years: [{ year: 21, removing: false }] }],
        });
        const { result } = renderHook(useSubject, { wrapper });
        await act(() => result.current.mutate({ group: 'Food', name: 'Rice', year: 21, removing: true }));

        expect(setProductRemovingAction).toHaveBeenCalledWith({
            group: 'Food',
            name: 'Rice',
            year: 21,
            removing: true,
        });
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Food', name: 'Rice', years: [{ year: 21, removing: true }] },
        ]);
        expect(result.current.error).toBe('Something went wrong');
    });
});
