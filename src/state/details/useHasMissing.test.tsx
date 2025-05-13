import React from 'react';
import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { useHasMissing } from '~/state/details/useHasMissing';

describe('useHasMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasMissing(), { wrapper: MockRedux });

        expect(result.current).toBeFalse();
    });

    it('return true for filled state', () => {
        const details = getDetailsFixture();
        const { result } = renderHook(() => useHasMissing(), {
            wrapper: ({ children }) => <MockRedux state={{ details }}>{children}</MockRedux>,
        });

        expect(result.current).toBeTrue();
    });
});
