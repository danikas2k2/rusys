import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { isEqual } from 'lodash';

import { useVariants } from '~/state/variants/useVariants';

jest.mock('lodash', () => ({
    ...jest.requireActual('lodash'),
    isEqual: jest.fn(() => true),
}));

describe('useVariants', () => {
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns variants from state', () => {
        const { result } = renderHook(() => useVariants(), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(variants);
    });

    it('returns an empty array when state.variants is undefined', () => {
        const { result } = renderHook(() => useVariants(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('uses isEqual for deep comparison', () => {
        renderHook(() => useVariants(), {
            wrapper: ({ children }) => <MockRedux state={{ variants }}>{children}</MockRedux>,
        });

        expect(isEqual).toHaveBeenCalledWith(variants, variants);
    });
});
