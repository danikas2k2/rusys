import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';

import React from 'react';

import type { WithVariantsState } from './types';
import { useAllVariants } from './useAllVariants';

describe('useAllVariants', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns list of all variants', async () => {
        const { result } = renderHook(() => useAllVariants('Uogienės'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns list of all variants of different group', async () => {
        const { result } = renderHook(() => useAllVariants('Daržovės'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useAllVariants('Skalbikliai'), {
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns empty list if has no state', async () => {
        const { result } = renderHook(() => useAllVariants('Skalbikliai'), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    it('reuses a cached result when switching back to a group', () => {
        const { result, rerender } = renderHook(({ group }) => useAllVariants(group), {
            initialProps: { group: 'Uogienės' },
            wrapper: ({ children }) => <MockData state={state}>{children}</MockData>,
        });
        const first = result.current;

        rerender({ group: 'Daržovės' });

        expect(result.current).toStrictEqual(['d', 'p', 'm', '1', 'x']);

        rerender({ group: 'Uogienės' });

        expect(result.current).toBe(first);
    });
});
