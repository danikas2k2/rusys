import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useRenameVariant } from '~/features/variants/hooks/useRenameVariant';
import { renameVariantAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useRenameVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameVariant(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variant: 'p', targetVariant: '1/2' });

        expect(renameVariantAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            variant: 'p',
            targetVariant: '1/2',
        });
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
            const { result } = renderHook(() => useRenameVariant(), { wrapper: MockData });
            await result.current({ group, variant, targetVariant: newVariant });

            expect(renameVariantAction).not.toHaveBeenCalled();
        }
    );
});
