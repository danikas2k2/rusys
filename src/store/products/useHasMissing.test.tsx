import { renderHook } from '@testing-library/react';
import { getProductsFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';

import React from 'react';

import { useHasMissing } from './useHasMissing';

describe('useHasMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasMissing(), { wrapper: MockData });

        expect(result.current).toBe(false);
    });

    it('return true for filled state', () => {
        const products = getProductsFixture();
        const { result } = renderHook(() => useHasMissing(), {
            wrapper: ({ children }) => <MockData state={{ products }}>{children}</MockData>,
        });

        expect(result.current).toBe(true);
    });
});
