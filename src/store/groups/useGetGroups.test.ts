import { renderHook } from '@testing-library/react';

import { useDispatch } from 'react-redux';

import { readGroups } from '~/server/actions/readData';
import { setGroupsAction } from '~/store/groups/actions';
import { useGetGroups } from '~/store/groups/useGetGroups';

vi.mock(import('~/server/actions/readData'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetGroups', () => {
    it('reads and dispatches groups', async () => {
        const dispatch = vi.fn();
        vi.mocked(useDispatch).mockReturnValue(dispatch);
        vi.mocked(readGroups).mockResolvedValue([{ group: 'Food', order: 0 }]);
        const { result } = renderHook(() => useGetGroups());

        await result.current();

        expect(dispatch).toHaveBeenCalledWith(setGroupsAction([{ group: 'Food', order: 0 }]));
    });
});
