import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useUndates } from '~/client/state/history/useUndates';
import type { History } from '~/common/data';

describe('useUndates', () => {
    const historyData: History[] = [
        {
            group: 'Uogienės',
            name: 'Avietės',
            time: Date.parse('2023-01-01T12:00:00.000Z'),
            year: 22,
        },
    ];

    it('returns undates from state', () => {
        const { result } = renderHook(() => useUndates(), {
            wrapper: ({ children }) => <MockRedux state={{ undates: historyData }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(historyData);
    });

    it('returns an empty array when state.undates is undefined', () => {
        const { result } = renderHook(() => useUndates(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });
});
