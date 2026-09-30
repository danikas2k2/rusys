import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { copyVariantAction } from '~/server/actions/variants';
import { useCopyVariant } from '~/store/variants/useCopyVariant';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/variants/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useCopyVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it.each`
        title                           | group         | variant | newGroup      | newVariant
        ${'new group'}                  | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${undefined}
        ${'new group and new variant'}  | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'1/2'}
        ${'new group and same variant'} | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'p'}
        ${'same group and new variant'} | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'p'}
    `(
        'calls copy action for $title',
        async ({
            group,
            variant,
            newGroup,
            newVariant,
        }: {
            group: string;
            variant: string;
            newGroup: string;
            newVariant: string | undefined;
        }) => {
            const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
            await result.current(group, variant, newGroup, newVariant);

            expect(copyVariantAction).toHaveBeenNthCalledWith(1, group, variant, newGroup, newVariant, undefined);
            expect(copyVariantAction).toHaveBeenCalledTimes(1);
            expect(refresh).toHaveBeenCalledExactlyOnceWith();
        }
    );

    it('calls copy action with more fields', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', 'Daržovės', '1/2', { order: 1, suffix: '1/2' });

        expect(copyVariantAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'p', 'Daržovės', '1/2', {
            order: 1,
            suffix: '1/2',
        });
    });

    it.each`
        title                       | group         | variant | newGroup      | newVariant
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
            newGroup,
            newVariant,
        }: {
            group: string;
            variant: string;
            newGroup: string;
            newVariant: string | undefined;
        }) => {
            const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
            await result.current(group, variant, newGroup, newVariant);

            expect(copyVariantAction).not.toHaveBeenCalled();
        }
    );
});
