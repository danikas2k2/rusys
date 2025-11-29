import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { isEqual } from 'lodash';

import { useGroupVariants } from '~/client/state/variants/useGroupVariants';

vi.mock('lodash', async () => {
    const actual = await vi.importActual<typeof import('lodash')>('lodash');
    return {
        ...actual,
        isEmpty: actual.isEmpty,
        isEqual: vi.fn(() => true),
    };
});

describe('useGroupVariants', () => {
    const variants = getVariantsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns variants from state for group', () => {
        const { result } = renderHook(() => useGroupVariants('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(variants.slice(0, 5));
    });

    it('returns an empty array for missing group', () => {
        const { result } = renderHook(() => useGroupVariants('Šaldyti'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns an empty array for empty group', () => {
        const { result } = renderHook(() => useGroupVariants('Šaldyti'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns an empty array when state.variants is undefined', () => {
        const { result } = renderHook(() => useGroupVariants('Uogienės'), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('uses isEqual for deep comparison', () => {
        renderHook(() => useGroupVariants('Daržovės'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(isEqual).toHaveBeenCalledWith(variants.slice(5), variants.slice(5));
    });
});
