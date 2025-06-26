import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useCopyVariant } from '~/state/variants/useCopyVariant';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useCopyVariant', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it.each`
        title                           | group         | variant | newGroup      | newVariant
        ${'new group'}                  | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${undefined}
        ${'new group and new variant'}  | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'1/2'}
        ${'new group and same variant'} | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'p'}
        ${'same group and new variant'} | ${'Uogienės'} | ${'p'}  | ${'Daržovės'} | ${'p'}
    `('calls copy action for $title', async ({ group, variant, newGroup, newVariant }) => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current(group, variant, newGroup, newVariant);

        expect(request).toHaveBeenCalledWith(ApiUrl.VariantsCopy, {
            group,
            variant,
            newGroup,
            newVariant,
        });
    });

    it('calls copy action with more fields', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', 'Daržovės', '1/2', { order: 1, suffix: '1/2' });

        expect(request).toHaveBeenCalledWith(ApiUrl.VariantsCopy, {
            group: 'Uogienės',
            variant: 'p',
            newGroup: 'Daržovės',
            newVariant: '1/2',
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
    `('does not call copy action for $title', async ({ group, variant, newGroup, newVariant }) => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current(group, variant, newGroup, newVariant);

        expect(request).not.toHaveBeenCalled();
    });
});
