import { renderHook } from '@testing-library/react';

import { useDispatch } from 'react-redux';

import { readVariants } from '~/server/actions/readData';
import { setGroupsAction } from '~/store/groups/actions';
import { setVariantsAction } from '~/store/variants/actions';
import { useGetVariants } from '~/store/variants/useGetVariants';

vi.mock(import('~/server/actions/readData'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetVariants', () => {
    const dispatch = vi.fn();
    const variants = [{ group: 'Food', variant: 'Box', order: 0 }];
    const groups = [{ group: 'Food', order: 0 }];

    beforeEach(() => vi.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => vi.clearAllMocks());

    it('refreshes variants and groups', async () => {
        vi.mocked(readVariants).mockResolvedValue({ variants, groups });
        const { result } = renderHook(() => useGetVariants());
        await result.current();

        expect(readVariants).toHaveBeenCalledWith();
        expect(dispatch).toHaveBeenCalledWith(setVariantsAction(variants));
        expect(dispatch).toHaveBeenCalledWith(setGroupsAction(groups));
        expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it('also loads groups initially', async () => {
        vi.mocked(readVariants).mockResolvedValue({ variants, groups });
        const { result } = renderHook(() => useGetVariants());
        await result.current(true);

        expect(readVariants).toHaveBeenCalledWith();
        expect(dispatch).toHaveBeenCalledWith(setGroupsAction(groups));
    });
});
