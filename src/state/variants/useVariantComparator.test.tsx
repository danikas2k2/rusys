import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useVariantComparator } from '~/state/variants/useVariantComparator';

describe('useVariantComparator', () => {
    const variants = getVariantsFixture();

    it('compares variants based on order', async () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        const cmp = result.current('Uogienės');

        expect(cmp('p', 'd')).toBeLessThan(0);
        expect(cmp('e', 'm')).toBeGreaterThan(0);
    });

    it('compares variants alphabetically if order is the same', () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ variants: variants.map((v) => ({ ...v, order: 1 })) }}>{children}</MockRedux>
            ),
        });

        const cmp = result.current('Daržovės');

        expect(cmp('p', 'd')).toBeGreaterThan(0);
        expect(cmp('1', 'm')).toBeLessThan(0);
    });

    it('compares variants according to state order and not in the state', () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        const cmp = result.current('Uogienės');

        expect(cmp('p', 'b')).toBeLessThan(0);
        expect(cmp('k', 'm')).toBeGreaterThan(0);
    });

    it('compares variants alphabetically if not in the state', () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        const cmp = result.current('Daržovės');

        expect(cmp('c', 'b')).toBeGreaterThan(0);
        expect(cmp('k', 'n')).toBeLessThan(0);
    });

    it('compares variants alphabetically if no state', () => {
        const { result } = renderHook(() => useVariantComparator(), { wrapper: MockRedux });

        const cmp = result.current('Šaldyti');

        expect(cmp('p', 'd')).toBeGreaterThan(0);
        expect(cmp('e', 'm')).toBeLessThan(0);
    });
});
