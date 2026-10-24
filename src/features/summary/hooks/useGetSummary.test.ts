import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetSummary } from '~/features/summary/hooks/useGetSummary';
import { readSummary } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/summary'));

describe('useGetSummary', () => {
    it('loads summary and dependent collections into the shared query cache', async () => {
        const { client, wrapper } = mockQuery();
        const data = { years: [26], groups: [], variants: [], summary: [] };
        vi.mocked(readSummary).mockResolvedValue(data);
        const { result } = renderHook(useGetSummary, { wrapper });
        await result.current();

        expect(client.getQueryData(CATALOG_KEYS.years)).toStrictEqual(data.years);
        expect(client.getQueryData(CATALOG_KEYS.groups)).toStrictEqual(data.groups);
        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(data.variants);
        expect(client.getQueryData(CATALOG_KEYS.summary)).toStrictEqual(data.summary);
    });
});
