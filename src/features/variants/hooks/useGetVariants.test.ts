import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/variants'));

describe('useGetVariants', () => {
    it('loads variants and groups into the shared query cache', async () => {
        const { client, wrapper } = mockQuery();
        const variants = [{ group: 'Food', variant: 'Box', order: 0 }];
        const groups = [{ group: 'Food', order: 0 }];
        vi.mocked(getVariantsAction).mockResolvedValue({ variants, groups });
        const { result } = renderHook(useGetVariants, { wrapper });
        await result.current();

        expect(client.getQueryData(CATALOG_KEYS.variants)).toStrictEqual(variants);
        expect(client.getQueryData(CATALOG_KEYS.groups)).toStrictEqual(groups);
    });
});
