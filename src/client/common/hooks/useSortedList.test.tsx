import React from 'react';
import { renderHook } from '@testing-library/react';
import { getGroupsFixture, getSummaryFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { useSortedList } from '~/client/common/hooks/useSortedList';

describe('useSortedList', () => {
    it('returns sorted summary if group orders are not available', () => {
        const { result } = renderHook(() => useSortedList(getSummaryFixture()), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
        ]);
    });

    it('returns sorted summary if group orders are available', () => {
        const { result } = renderHook(() => useSortedList(getSummaryFixture()), {
            wrapper: ({ children }) => <MockRedux state={{ groups: getGroupsFixture() }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
        ]);
    });
});
