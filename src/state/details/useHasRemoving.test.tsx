import React from 'react';
import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { useHasRemoving } from '~/state/details/useHasRemoving';
import { useYears } from '~/state/years/useYears';

jest.mock('~/state/years/useYears');

describe('useHasRemoving', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'C'), { wrapper: MockRedux });

        expect(result.current).toBeFalse();
    });

    const details = getDetailsFixture();

    it('return true for filled state', () => {
        const { result } = renderHook(() => useHasRemoving('Daržovės', 'Kopūstai'), {
            wrapper: ({ children }) => <MockRedux state={{ details }}>{children}</MockRedux>,
        });

        expect(result.current).toBeTrue();
    });

    it('return false for mismatched years', () => {
        jest.mocked(useYears).mockReturnValueOnce([18, 19]);
        const { result } = renderHook(() => useHasRemoving('G', 'C'), {
            wrapper: ({ children }) => <MockRedux state={{ details }}>{children}</MockRedux>,
        });

        expect(result.current).toBeFalse();
    });

    it('return false for missing name', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'B'), {
            wrapper: ({ children }) => <MockRedux state={{ details }}>{children}</MockRedux>,
        });

        expect(result.current).toBeFalse();
    });

    it('return false for missing group', () => {
        const { result } = renderHook(() => useHasRemoving('H', 'C'), {
            wrapper: ({ children }) => <MockRedux state={{ details }}>{children}</MockRedux>,
        });

        expect(result.current).toBeFalse();
    });
});
