import React from 'react';
import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useGroup } from '~/state/group/useGroup';

describe('useGroup', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useGroup(), { wrapper: MockRedux });

        expect(result.current).toBe('');
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useGroup(), {
            wrapper: ({ children }) => <MockRedux state={{ group: 'grouped' }}>{children}</MockRedux>,
        });

        expect(result.current).toBe('grouped');
    });
});
