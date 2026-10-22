import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';

import React from 'react';

import { useGroupVariantComparator } from './useGroupVariantComparator';

describe('useGroupVariantComparator', () => {
    const variants = getVariantsFixture();

    it('compares variants based on order', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('Uogienės'), {
            wrapper: ({ children }) => <MockData state={{ variants }}>{children}</MockData>,
        });

        const cmp = result.current;

        expect(cmp('p', 'd')).toBeLessThan(0);
        expect(cmp('e', 'm')).toBeGreaterThan(0);
    });

    it('compares variants alphabetically if order is the same', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Daržovės'), {
            wrapper: ({ children }) => (
                <MockData state={{ variants: variants.map((v) => ({ ...v, order: 1 })) }}>{children}</MockData>
            ),
        });

        const cmp = result.current;

        expect(cmp('p', 'd')).toBeGreaterThan(0);
        expect(cmp('1', 'm')).toBeLessThan(0);
    });

    it('compares variants according to state order and not in the state', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Uogienės'), {
            wrapper: ({ children }) => <MockData state={{ variants }}>{children}</MockData>,
        });

        const cmp = result.current;

        expect(cmp('p', 'b')).toBeLessThan(0);
        expect(cmp('k', 'm')).toBeGreaterThan(0);
    });

    it('compares variants alphabetically if not in the state', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Daržovės'), {
            wrapper: ({ children }) => <MockData state={{ variants }}>{children}</MockData>,
        });

        const cmp = result.current;

        expect(cmp('c', 'b')).toBeGreaterThan(0);
        expect(cmp('k', 'n')).toBeLessThan(0);
    });

    it('compares variants alphabetically if no state', () => {
        const { result } = renderHook(() => useGroupVariantComparator('Šaldyti'), { wrapper: MockData });

        const cmp = result.current;

        expect(cmp('p', 'd')).toBeGreaterThan(0);
        expect(cmp('e', 'm')).toBeLessThan(0);
    });
});
