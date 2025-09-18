import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useFilter } from '~/state/filter/useFilter';

describe('useFilter', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useFilter(), { wrapper: MockRedux });

        expect(result.current).toBe('');
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useFilter(), {
            wrapper: ({ children }) => <MockRedux state={{ filter: 'filtered' }}>{children}</MockRedux>,
        });

        expect(result.current).toBe('filtered');
    });
});
