import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useCopyVariant } from '~/store/variants/useCopyVariant';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useCopyVariant', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

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

            expect(request).toHaveBeenNthCalledWith(
                1,
                `/api/v1/groups/${encodeURIComponent(group)}/variants/${variant}/copies`,
                {
                    newGroup,
                    ...(newVariant && { newVariant }),
                },
                'POST'
            );
            expect(request).toHaveBeenNthCalledWith(2, '/api/v1/variants', 'GET');
        }
    );

    it('calls copy action with more fields', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', 'Daržovės', '1/2', { order: 1, suffix: '1/2' });

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/variants/p/copies',
            {
                newGroup: 'Daržovės',
                newVariant: '1/2',
                order: 1,
                suffix: '1/2',
            },
            'POST'
        );
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

            expect(request).not.toHaveBeenCalled();
        }
    );
});
