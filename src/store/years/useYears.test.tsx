import { renderHook, waitFor } from '@testing-library/react';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import { getProductsAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';
import { useYears } from './useYears';

vi.mock(import('~/server/actions/products'));

describe('useYears', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useYears(), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    it('return empty list for empty state with custom number of years', () => {
        const { result } = renderHook(() => useYears(3), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    const years: number[] = [25, 24, 23, 22, 21];

    it('return filled state', () => {
        const { result } = renderHook(() => useYears(), {
            wrapper: ({ children }) => <MockData state={{ years }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(years);
    });

    it('return custom number of years', () => {
        const { result } = renderHook(() => useYears(3), {
            wrapper: ({ children }) => <MockData state={{ years }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(years.slice(0, 3));
    });
});

describe('useYears query', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads years and applies the requested limit', async () => {
        vi.mocked(getProductsAction).mockResolvedValue({ products: [], years: [2026, 2025], groups: [], variants: [] });
        const { client, wrapper } = mockQuery();
        const { result } = renderHook(() => useYears(1), { wrapper });

        expect(getProductsAction).not.toHaveBeenCalled();

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.years })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual([2026]));

        expect(getProductsAction).toHaveBeenCalledExactlyOnceWith();
    });
});
