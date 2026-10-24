import { act, renderHook, waitFor } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';
import { useVariant } from './useVariant';
import { useVariants } from './useVariants';

vi.mock(import('~/server/actions/variants'));

describe('useVariant', () => {
    const variants = getVariantsFixture();

    afterEach(() => vi.clearAllMocks());

    it('loads the full list only when explicitly fetched and selects the requested variant', async () => {
        vi.mocked(getVariantsAction).mockResolvedValueOnce({ variants, groups: [] });
        const { client, wrapper } = mockQuery();
        const { result } = renderHook(() => useVariant(variants[0].group, variants[0].variant), { wrapper });

        expect(result.current).toBeUndefined();
        expect(getVariantsAction).not.toHaveBeenCalled();

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.variants })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual(variants[0]));

        expect(getVariantsAction).toHaveBeenCalledExactlyOnceWith();
        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(variants);
    });

    it('returns variant details', () => {
        const { result } = renderHook(() => useVariant('Uogienės', 'p'), {
            wrapper: ({ children }) => <MockData state={{ variants }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(variants[0]);
    });

    it.each`
        title              | group         | variant
        ${'missing name'}  | ${'Uogienės'} | ${'b'}
        ${'missing group'} | ${'Šaldyti'}  | ${'p'}
        ${'empty name'}    | ${'Uogienės'} | ${''}
        ${'empty group'}   | ${''}         | ${'p'}
    `('does not return variant for $title', ({ group, variant }: { group: string; variant: string }) => {
        const { result } = renderHook(() => useVariant(group, variant), {
            wrapper: ({ children }) => <MockData state={{ variants }}>{children}</MockData>,
        });

        expect(result.current).toBeUndefined();
    });

    it('does not return variant if no state', () => {
        const { result } = renderHook(() => useVariant('Daržovės', 'd'), { wrapper: MockData });

        expect(result.current).toBeUndefined();
    });

    it('selects a new variant when the requested group or name changes', () => {
        const entries = [
            { group: 'Food', variant: 'Box', order: 0 },
            { group: 'Food', variant: 'Jar', order: 1 },
            { group: 'Other', variant: 'Jar', order: 0 },
        ];
        const { wrapper } = mockQuery({ variants: entries });
        const { result, rerender } = renderHook(({ group, variant }) => useVariant(group, variant), {
            initialProps: { group: 'Food', variant: 'Box' },
            wrapper,
        });

        expect(result.current).toStrictEqual(entries[0]);

        rerender({ group: 'Food', variant: 'Jar' });

        expect(result.current).toStrictEqual(entries[1]);

        rerender({ group: 'Other', variant: 'Jar' });

        expect(result.current).toStrictEqual(entries[2]);
    });

    it('keeps the full list in the shared cache and reflects selected variant changes and removal', async () => {
        const { client, wrapper } = mockQuery({ variants });
        const { result } = renderHook(
            () => ({ selected: useVariant(variants[0].group, variants[0].variant), variants: useVariants() }),
            { wrapper }
        );

        expect(result.current.selected).toStrictEqual(variants[0]);
        expect(result.current.variants).toStrictEqual(variants);
        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(variants);

        const updatedVariants = [{ ...variants[0], suffix: 'Updated' }, ...variants.slice(1)];
        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updatedVariants);
        });
        await waitFor(() => expect(result.current.selected).toStrictEqual(updatedVariants[0]));

        expect(result.current.variants).toStrictEqual(updatedVariants);

        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updatedVariants.slice(1));
        });
        await waitFor(() => expect(result.current.selected).toBeUndefined());

        expect(result.current.variants).toStrictEqual(updatedVariants.slice(1));
    });
});
