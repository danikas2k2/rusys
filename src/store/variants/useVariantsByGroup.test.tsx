import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import type { WithVariantsState } from '~/store/variants/types';
import { useVariantsByGroup } from '~/store/variants/useVariantsByGroup';

describe('useVariantsByGroup', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns full variant objects for the given group', async () => {
        const { result } = renderHook(() => useVariantsByGroup('Daržovės'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([
            { group: 'Daržovės', variant: 'd', order: 0 },
            { group: 'Daržovės', variant: 'p', order: 1 },
            { group: 'Daržovės', variant: 'm', order: 2 },
            { group: 'Daržovės', variant: '1', order: 3 },
            { group: 'Daržovės', variant: 'x', order: 4, suffix: 'B.' },
        ]);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useVariantsByGroup('Skalbikliai'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([]);
    });

    it('returns empty list if has no state', async () => {
        const { result } = renderHook(() => useVariantsByGroup('Skalbikliai'), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });
});
