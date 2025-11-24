import { renderHook } from '@testing-library/react';
import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';

describe('useUniqueGroups', () => {
    const state = { groups: getGroupsFixture() };

    it('returns unique groups from variants', () => {
        const { result } = renderHook(() => useUniqueGroups(getVariantsFixture()), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(['Uogienės', 'Daržovės']);
    });

    it('returns unique groups from products', () => {
        const { result } = renderHook(() => useUniqueGroups(getProductsFixture()), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(['Uogienės', 'Daržovės']);
    });

    it('returns empty group list for empty list', () => {
        const { result } = renderHook(() => useUniqueGroups([]), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([]);
    });
});
