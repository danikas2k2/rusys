import React from 'react';
import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { type WithVariantsState } from '~/state/variants/types';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';

describe('useGroupVariantComparator', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns sorted variants', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(['x', 'd', 'm', 'p', 'e'].sort(result.current)).toStrictEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns sorted variants for different group', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('Daržovės'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(['1', 'p', 'd', 'x', 'm'].sort(result.current)).toStrictEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('leaves invalid variants at the end of list', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={state}>{children}</MockRedux>,
        });

        expect(['1', 'p', 'd', 'm', '3', '2'].sort(result.current)).toStrictEqual(['p', 'd', 'm', '1', '3', '2']);
    });
});
