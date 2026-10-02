import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useVariants } from './useVariants';

describe('useVariants', () => {
    const variants = getVariantsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns variants from state', () => {
        const { result } = renderHook(() => useVariants(), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(variants);
    });

    it('returns an empty array when state.variants is undefined', () => {
        const { result } = renderHook(() => useVariants(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });
});
