import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useRenameVariant } from '~/client/state/variants/useRenameVariant';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useRenameVariant', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', '1/2');

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/groups/Uogien%C4%97s/variants/p', { name: '1/2' }, 'PATCH');
        expect(request).toHaveBeenNthCalledWith(2, '/api/v1/variants', 'GET');
    });

    it.each`
        title                  | group         | variant | newVariant
        ${'same variant'}      | ${'Uogienės'} | ${'p'}  | ${'p'}
        ${'empty group'}       | ${''}         | ${'p'}  | ${'1/2'}
        ${'empty variant'}     | ${'Uogienės'} | ${''}   | ${'1/2'}
        ${'empty new variant'} | ${'Uogienės'} | ${'p'}  | ${''}
    `(
        'does not call rename action with $title',
        async ({ group, variant, newVariant }: { group: string; variant: string; newVariant: string }) => {
            const { result } = renderHook(() => useRenameVariant(), { wrapper: MockRedux });
            await result.current(group, variant, newVariant);

            expect(request).not.toHaveBeenCalled();
        }
    );
});
