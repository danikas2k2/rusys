import { renderHook, waitFor } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';
import { useVariants } from './useVariants';

vi.mock(import('~/server/actions/variants'));

describe('useVariants', () => {
    const variants = getVariantsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns variants from state', () => {
        const { result } = renderHook(() => useVariants(), {
            wrapper: ({ children }) => <MockData state={{ variants }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(variants);
    });

    it('returns an empty array when state.variants is undefined', () => {
        const { result } = renderHook(() => useVariants(), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });
});

describe('useVariants query', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads variants when the registered query is explicitly fetched', async () => {
        const variants = [{ group: 'Food', variant: 'Box', order: 0 }];
        vi.mocked(getVariantsAction).mockResolvedValue({ variants, groups: [] });
        const { client, wrapper } = mockQuery();
        const { result } = renderHook(useVariants, { wrapper });

        expect(getVariantsAction).not.toHaveBeenCalled();

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.variants })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual(variants));

        expect(getVariantsAction).toHaveBeenCalledExactlyOnceWith();
    });
});
