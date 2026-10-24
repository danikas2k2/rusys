import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useCopyVariant } from '~/features/variants/hooks/useCopyVariant';
import { copyVariantAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useCopyVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it.each`
        title                           | group         | variant | targetGroup   | targetVariant
        ${'new group'}                  | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${undefined}
        ${'new group and new variant'}  | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'1/2'}
        ${'new group and same variant'} | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'p'}
        ${'same group and new variant'} | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'p'}
    `(
        'calls copy action for $title',
        async ({
            group,
            variant,
            targetGroup,
            targetVariant,
        }: {
            group: string;
            variant: string;
            targetGroup: string;
            targetVariant: string | undefined;
        }) => {
            const { result } = renderHook(() => useCopyVariant(), { wrapper: MockData });
            await result.current({ group, variant, targetGroup, targetVariant });

            expect(copyVariantAction).toHaveBeenNthCalledWith(1, { group, variant, targetGroup, targetVariant });
            expect(copyVariantAction).toHaveBeenCalledTimes(1);
            expect(refresh).toHaveBeenCalledExactlyOnceWith();
        }
    );

    it('calls copy action with more fields', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockData });
        await result.current({
            group: 'Uogienės',
            variant: 'p',
            targetGroup: 'Daržovės',
            targetVariant: '1/2',
            order: 1,
            suffix: '1/2',
        });

        expect(copyVariantAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            variant: 'p',
            targetGroup: 'Daržovės',
            targetVariant: '1/2',
            order: 1,
            suffix: '1/2',
        });
    });

    it.each`
        title                       | group         | variant | targetGroup   | targetVariant
        ${'same group'}             | ${'Uogienės'} | ${'p'}  | ${'Uogienės'} | ${undefined}
        ${'same group and variant'} | ${'Uogienės'} | ${'p'}  | ${'Uogienės'} | ${'p'}
        ${'empty group'}            | ${''}         | ${'p'}  | ${'Daržovės'} | ${'p'}
        ${'empty variant'}          | ${'Uogienės'} | ${''}   | ${'Daržovės'} | ${'1/2'}
        ${'empty new group'}        | ${'Uogienės'} | ${'p'}  | ${''}         | ${'1/2'}
    `(
        'does not call copy action for $title',
        async ({
            group,
            variant,
            targetGroup,
            targetVariant,
        }: {
            group: string;
            variant: string;
            targetGroup: string;
            targetVariant: string | undefined;
        }) => {
            const { result } = renderHook(() => useCopyVariant(), { wrapper: MockData });
            await result.current({ group, variant, targetGroup, targetVariant });

            expect(copyVariantAction).not.toHaveBeenCalled();
        }
    );
});
