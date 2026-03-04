import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useHistory } from '~/client/state/history/useHistory';
import type { History } from '~/types/data';

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
        const { result } = renderHook(() => useHistory(), {
            wrapper: ({ children }) => <MockRedux state={{ history: historyData }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(historyData);
    });

    it('returns an empty array when state.history is undefined', () => {
        const { result } = renderHook(() => useHistory(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });
});
