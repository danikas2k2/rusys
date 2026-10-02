import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import type { WithVariantsState } from './types';
import { useAllVariants } from './useAllVariants';

describe('useAllVariants', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns list of all variants', async () => {
        const { result } = renderHook(() => useAllVariants('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns list of all variants of different group', async () => {
        const { result } = renderHook(() => useAllVariants('Daržovės'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useAllVariants('Skalbikliai'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns empty list if has no state', async () => {
        const { result } = renderHook(() => useAllVariants('Skalbikliai'), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('reuses a cached result when switching back to a group', () => {
        const { result, rerender } = renderHook(({ group }) => useAllVariants(group), {
            initialProps: { group: 'Uogienės' },
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });
        const first = result.current;

        rerender({ group: 'Daržovės' });

        expect(result.current).toStrictEqual(['d', 'p', 'm', '1', 'x']);

        rerender({ group: 'Uogienės' });

        expect(result.current).toBe(first);
    });
});
