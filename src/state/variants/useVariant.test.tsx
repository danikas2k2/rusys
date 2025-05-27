import React from 'react';
import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { useVariant } from '~/state/variants/useVariant';

describe('useVariant', () => {
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns variant details', () => {
        const { result } = renderHook(() => useVariant('Uogienės', 'p'), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(variants[0]);
    });

    it.each`
        title              | group         | variant
        ${'missing name'}  | ${'Uogienės'} | ${'b'}
        ${'missing group'} | ${'Šaldyti'}  | ${'p'}
        ${'empty name'}    | ${'Uogienės'} | ${''}
        ${'empty group'}   | ${''}         | ${'p'}
    `('does not return variant for $title', ({ group, variant }) => {
        const { result } = renderHook(() => useVariant(group, variant), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toBeUndefined();
    });

    it('does not return variant if no state', () => {
        const { result } = renderHook(() => useVariant('Daržovės', 'd'), { wrapper: MockRedux });

        expect(result.current).toBeUndefined();
    });
});
