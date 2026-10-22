import { renderHook, waitFor } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';
import { MockData } from '@tests/MockData';
import { mockQuery } from '@tests/MockQuery';

import React from 'react';

import { readSummary } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';
import { useSummary } from './useSummary';

vi.mock(import('~/server/actions/summary'));

describe('useSummary', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useSummary(), { wrapper: MockData });

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const summary = getSummaryFixture();
        const { result } = renderHook(() => useSummary(), {
            wrapper: ({ children }) => <MockData state={{ summary }}>{children}</MockData>,
        });

        expect(result.current).toStrictEqual(summary);
    });
});

describe('useSummary query', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads summary when the registered query is explicitly fetched', async () => {
        const summary = [{ group: 'Food', name: 'Rice', years: [] }];
        vi.mocked(readSummary).mockResolvedValue({ summary, years: [], groups: [], variants: [] });
        const { client, wrapper } = mockQuery();
        const { result } = renderHook(useSummary, { wrapper });

        expect(readSummary).not.toHaveBeenCalled();

        await client.getQueryCache().find({ queryKey: CATALOG_KEYS.summary })!.fetch();
        await waitFor(() => expect(result.current).toStrictEqual(summary));

        expect(readSummary).toHaveBeenCalledExactlyOnceWith();
    });
});
