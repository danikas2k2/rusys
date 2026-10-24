import { act, renderHook, waitFor } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';
import { useGroupVariants } from './useGroupVariants';
import { useVariants } from './useVariants';

vi.mock(import('~/server/actions/variants'));

describe('useGroupVariants', () => {
    const state = {
        variants: getVariantsFixture(),
    };

    afterEach(() => vi.clearAllMocks());

    it('registers the shared disabled query and only fetches when explicitly requested', async () => {
        const variants = [
            { group: 'Food', variant: 'Box', order: 0 },
            { group: 'food', variant: 'Jar', order: 1 },
        ];

        vi.mocked(getVariantsAction).mockResolvedValueOnce({ variants, groups: [] });
        const { client, wrapper } = mockQuery();
        const { result, rerender } = renderHook(() => useGroupVariants('Food'), { wrapper });
        const empty = result.current;

        rerender();

        expect(result.current).toBe(empty);
        expect(result.current).toStrictEqual([]);
        expect(getVariantsAction).not.toHaveBeenCalled();
        expect(client.getQueryCache().getAll()).toHaveLength(1);

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.variants })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual([variants[0]]));

        expect(getVariantsAction).toHaveBeenCalledExactlyOnceWith();
        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(variants);
    });

    it('reflects mounted shared-cache updates and removals without replacing the full catalog', async () => {
        const { client, wrapper } = mockQuery({ variants: state.variants });
        const { result } = renderHook(() => ({ selected: useGroupVariants('Daržovės'), all: useVariants() }), {
            wrapper,
        });
        const updated = [
            { group: 'Daržovės', variant: 'New', order: 0, suffix: 'Updated' },
            { group: 'Other', variant: 'Other', order: 1 },
        ];

        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updated);
        });
        await waitFor(() => expect(result.current.selected).toStrictEqual([updated[0]]));

        expect(result.current.all).toStrictEqual(updated);
        expect(client.getQueryCache().getAll()).toHaveLength(1);

        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updated.slice(1));
        });
        await waitFor(() => expect(result.current.selected).toStrictEqual([]));

        expect(result.current.all).toStrictEqual(updated.slice(1));
        expect(getVariantsAction).not.toHaveBeenCalled();
    });

    it('returns full variant objects for the given group', async () => {
        const { result } = renderHook(() => useGroupVariants('Daržovės'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual([
            { group: 'Daržovės', variant: 'd', order: 0 },
            { group: 'Daržovės', variant: 'p', order: 1 },
            { group: 'Daržovės', variant: 'm', order: 2 },
            { group: 'Daržovės', variant: '1', order: 3 },
            { group: 'Daržovės', variant: 'x', order: 4, suffix: 'B.' },
        ]);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useGroupVariants('Skalbikliai'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns empty list if has no state', async () => {
        const { result } = renderHook(() => useGroupVariants('Skalbikliai'), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    it('selects the correct variants when the requested group changes', () => {
        const { result, rerender } = renderHook(({ group }) => useGroupVariants(group), {
            initialProps: { group: 'Daržovės' },
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });
        const first = result.current;

        rerender({ group: 'Uogienės' });

        expect(result.current[0]?.group).toBe('Uogienės');

        rerender({ group: 'Daržovės' });

        expect(result.current).toStrictEqual(first);

        rerender({ group: 'Missing' });

        expect(result.current).toStrictEqual([]);
    });

    it('preserves catalog order and the selected reference on same-group rerenders and unrelated updates', async () => {
        const variants = [
            { group: 'Food', variant: 'Jar', order: 2 },
            { group: 'Other', variant: 'Other', order: 0 },
            { group: 'Food', variant: 'Box', order: 1 },
        ];
        const { client, wrapper } = mockQuery({ variants });
        const { result, rerender } = renderHook(
            ({ group }) => ({ selected: useGroupVariants(group), all: useVariants() }),
            { initialProps: { group: 'Food' }, wrapper }
        );
        const first = result.current.selected;

        expect(first).toStrictEqual([variants[0], variants[2]]);

        rerender({ group: 'Food' });

        expect(result.current.selected).toBe(first);

        const updated = [variants[0], { ...variants[1], suffix: 'Updated' }, variants[2]];

        act(() => {
            client.setQueryData(CATALOG_KEYS.variants, updated);
        });
        await waitFor(() => expect(result.current.all).toStrictEqual(updated));

        expect(result.current.selected).toBe(first);
    });
});
