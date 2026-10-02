import { renderHook } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useSummary } from './useSummary';

describe('useSummary', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useSummary(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const summary = getSummaryFixture();
        const { result } = renderHook(() => useSummary(), {
            wrapper: ({ children }) => <MockRedux state={{ summary }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(summary);
    });
});
