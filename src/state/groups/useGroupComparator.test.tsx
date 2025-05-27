import React from 'react';
import { renderHook } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { useGroupComparator } from '~/state/groups/useGroupComparator';

describe('useGroupComparator', () => {
    const groups = getGroupsFixture();

    it('compares groups based on order', async () => {
        const { result } = renderHook(() => useGroupComparator(), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        const cmp = result.current;

        expect(cmp('Uogienės', 'Daržovės')).toBeLessThan(0);
        expect(cmp('Daržovės', 'Uogienės')).toBeGreaterThan(0);
    });

    it('compares groups alphabetically if order is the same', () => {
        const { result } = renderHook(() => useGroupComparator(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ groups: [...groups, { group: 'Šaldyti', order: 1 }] }}>{children}</MockRedux>
            ),
        });

        const cmp = result.current;

        expect(cmp('Daržovės', 'Šaldyti')).toBeGreaterThan(0);
        expect(cmp('Uogienės', 'Šaldyti')).toBeGreaterThan(0);
    });

    it('compares groups according to state order and not in the state', () => {
        const { result } = renderHook(() => useGroupComparator(), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        const cmp = result.current;

        expect(cmp('Kruopos', 'Uogienės')).toBeGreaterThan(0);
        expect(cmp('Daržovės', 'Sriubos')).toBeLessThan(0);
    });

    it('compares groups alphabetically if not in the state', () => {
        const { result } = renderHook(() => useGroupComparator(), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        const cmp = result.current;

        expect(cmp('Kruopos', 'Chemija')).toBeGreaterThan(0);
        expect(cmp('Chemija', 'Sriubos')).toBeLessThan(0);
    });

    it('compares groups alphabetically if no state', () => {
        const { result } = renderHook(() => useGroupComparator(), { wrapper: MockRedux });

        const cmp = result.current;

        expect(cmp('Uogienės', 'Daržovės')).toBeGreaterThan(0);
        expect(cmp('Daržovės', 'Šaldyti')).toBeLessThan(0);
    });
});
