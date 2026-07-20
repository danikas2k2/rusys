import { renderHook } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useHasMissing } from '~/client/state/products/useHasMissing';

describe('useHasMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasMissing(), { wrapper: MockRedux });

        expect(result.current).toBe(false);
    });

    it('return true for filled state', () => {
        const products = getProductsFixture();
        const { result } = renderHook(() => useHasMissing(), {
            wrapper: ({ children }) => <MockRedux state={{ products }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(true);
    });
});
