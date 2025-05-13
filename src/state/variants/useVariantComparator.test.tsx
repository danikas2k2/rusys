import React from 'react';
import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { type WithVariantsState } from '~/state/variants/types';
import { useVariantComparator } from '~/state/variants/useVariantComparator';

describe('useVariantComparator', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns sorted variants', async () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(['x', 'd', 'm', 'p', 'e'].sort(result.current('Uogienės'))).toStrictEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns sorted variants for different group', async () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(['1', 'p', 'd', 'x', 'm'].sort(result.current('Daržovės'))).toStrictEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('leaves invalid variants at the end of list', async () => {
        const { result } = renderHook(() => useVariantComparator(), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(['3', 'p', 'd', 'm', '1'].sort(result.current('Uogienės'))).toStrictEqual(['p', 'd', 'm', '3', '1']);
    });
});
