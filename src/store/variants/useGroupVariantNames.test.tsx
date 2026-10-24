import { act, renderHook, waitFor } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';
import { useGroupVariantNames } from './useGroupVariantNames';
import { useGroupVariants } from './useGroupVariants';
import { useVariants } from './useVariants';

vi.mock(import('~/server/actions/variants'));

describe('useGroupVariantNames', () => {
    const state = {
        variants: getVariantsFixture(),
    };

    afterEach(() => vi.clearAllMocks());

    it('keeps its empty fallback stable and only fetches the shared query on request', async () => {
        const variants = [
            { group: 'Food', variant: 'Jar', order: 2 },
            { group: 'food', variant: 'Other', order: 0 },
            { group: 'Food', variant: 'Box', order: 1 },
        ];

        vi.mocked(getVariantsAction).mockResolvedValueOnce({ variants, groups: [] });
        const { client, wrapper } = mockQuery();
        const { result, rerender } = renderHook(() => useGroupVariantNames('Food'), { wrapper });
        const empty = result.current;

        rerender();

        expect(result.current).toBe(empty);
        expect(result.current).toStrictEqual([]);
        expect(getVariantsAction).not.toHaveBeenCalled();
        expect(client.getQueryCache().getAll()).toHaveLength(1);

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.variants })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual(['Box', 'Jar']));

        expect(getVariantsAction).toHaveBeenCalledExactlyOnceWith();
        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(variants);
    });

    it('resorts mounted cache updates without mutating or splitting the shared catalog', async () => {
        const variants = Object.freeze([
            { group: 'Food', variant: 'Jar', order: 2 },
            { group: 'Other', variant: 'Other', order: 0 },
            { group: 'Food', variant: 'Box', order: 1 },
        ]);
        const { client, wrapper } = mockQuery({ variants });
        const { result } = renderHook(
            () => ({ selected: useGroupVariantNames('Food'), grouped: useGroupVariants('Food'), all: useVariants() }),
            { wrapper }
        );

        expect(result.current.selected).toStrictEqual(['Box', 'Jar']);
        expect(result.current.grouped).toStrictEqual([variants[0], variants[2]]);
        expect(client.getQueryData(CATALOG_KEYS.variants)).toBe(variants);
        expect(result.current.all.map(({ variant }) => variant)).toStrictEqual(['Jar', 'Other', 'Box']);

        const updated = [variants[0], variants[1], { ...variants[2], order: 3 }];

        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updated);
        });
        await waitFor(() => expect(result.current.selected).toStrictEqual(['Jar', 'Box']));

        expect(result.current.all).toStrictEqual(updated);
        expect(result.current.grouped).toStrictEqual([updated[0], updated[2]]);
        expect(client.getQueryCache().getAll()).toHaveLength(1);
        expect(getVariantsAction).not.toHaveBeenCalled();
    });

    it('returns list of all variants', async () => {
        const { result } = renderHook(() => useGroupVariantNames('Uogienės'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns list of all variants of different group', async () => {
        const { result } = renderHook(() => useGroupVariantNames('Daržovės'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useGroupVariantNames('Skalbikliai'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns empty list if has no state', async () => {
        const { result } = renderHook(() => useGroupVariantNames('Skalbikliai'), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    it('selects the correct names when the requested group changes', () => {
        const { result, rerender } = renderHook(({ group }) => useGroupVariantNames(group), {
            initialProps: { group: 'Uogienės' },
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });
        const first = result.current;

        rerender({ group: 'Daržovės' });

        expect(result.current).toStrictEqual(['d', 'p', 'm', '1', 'x']);

        rerender({ group: 'Uogienės' });

        expect(result.current).toStrictEqual(first);

        rerender({ group: 'Missing' });

        expect(result.current).toStrictEqual([]);
    });

    it('keeps selected names stable on same-group rerenders and unrelated catalog updates', async () => {
        const variants = [
            { group: 'Food', variant: 'Jar', order: 2 },
            { group: 'Other', variant: 'Other', order: 0 },
            { group: 'Food', variant: 'Box', order: 1 },
        ];
        const { client, wrapper } = mockQuery({ variants });
        const { result, rerender } = renderHook(
            ({ group }) => ({ selected: useGroupVariantNames(group), all: useVariants() }),
            { initialProps: { group: 'Food' }, wrapper }
        );
        const first = result.current.selected;

        expect(first).toStrictEqual(['Box', 'Jar']);

        rerender({ group: 'Food' });

        expect(result.current.selected).toBe(first);

        const updated = [variants[0], { ...variants[1], order: -1 }, variants[2]];

        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updated);
        });
        await waitFor(() => expect(result.current.all).toStrictEqual(updated));

        expect(result.current.selected).toBe(first);
    });
});
