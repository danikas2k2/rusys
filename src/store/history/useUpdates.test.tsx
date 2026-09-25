import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import type { History } from '~/common/data';
import { useUpdates } from '~/store/history/useUpdates';

describe('useHistory', () => {
    const historyData: History[] = [
        {
            group: 'Uogienės',
            name: 'Avietės',
            time: Date.parse('2023-01-01T12:00:00.000Z'),
            year: 22,
        },
    ];

    it('returns history from state', () => {
        const { result } = renderHook(() => useUpdates(), {
            wrapper: ({ children }) => <MockRedux state={{ updates: historyData }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(historyData);
    });

    it('returns an empty array when state.history is undefined', () => {
        const { result } = renderHook(() => useUpdates(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });
});
