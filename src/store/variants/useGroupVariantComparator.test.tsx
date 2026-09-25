import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useGroupVariantComparator } from '~/store/variants/useGroupVariantComparator';

describe('useGroupVariantComparator', () => {
    const variants = getVariantsFixture();

    it('compares variants based on order', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        const cmp = result.current;

        expect(cmp('p', 'd')).toBeLessThan(0);
        expect(cmp('e', 'm')).toBeGreaterThan(0);
    });

    it('compares variants alphabetically if order is the same', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Daržovės'), {
            wrapper: ({ children }) => (
                <MockRedux state={{ variants: variants.map((v) => ({ ...v, order: 1 })) }}>{children}</MockRedux>
            ),
        });

        const cmp = result.current;

        expect(cmp('p', 'd')).toBeGreaterThan(0);
        expect(cmp('1', 'm')).toBeLessThan(0);
    });

    it('compares variants according to state order and not in the state', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        const cmp = result.current;

        expect(cmp('p', 'b')).toBeLessThan(0);
        expect(cmp('k', 'm')).toBeGreaterThan(0);
    });

    it('compares variants alphabetically if not in the state', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Daržovės'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        const cmp = result.current;

        expect(cmp('c', 'b')).toBeGreaterThan(0);
        expect(cmp('k', 'n')).toBeLessThan(0);
    });

    it('compares variants alphabetically if no state', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Šaldyti'), { wrapper: MockRedux });

        const cmp = result.current;

        expect(cmp('p', 'd')).toBeGreaterThan(0);
        expect(cmp('e', 'm')).toBeLessThan(0);
    });
});
