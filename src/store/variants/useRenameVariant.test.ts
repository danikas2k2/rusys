import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { renameVariantAction } from '~/server/actions/variants';
import { useRenameVariant } from '~/store/variants/useRenameVariant';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/variants/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useRenameVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', '1/2');

        expect(renameVariantAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'p', '1/2', undefined);
        expect(renameVariantAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
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

            expect(renameVariantAction).not.toHaveBeenCalled();
        }
    );
});
