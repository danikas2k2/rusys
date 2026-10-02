import { renderHook } from '@testing-library/react';

import { useDispatch } from 'react-redux';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { getGroupsAction } from '~/server/actions/groups';
import { setGroupsAction } from '~/store/groups';

vi.mock(import('~/server/actions/groups'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetGroups', () => {
    it('reads and dispatches groups', async () => {
        const dispatch = vi.fn();
        vi.mocked(useDispatch).mockReturnValue(dispatch);
        vi.mocked(getGroupsAction).mockResolvedValue([{ group: 'Food', order: 0 }]);
        const { result } = renderHook(() => useGetGroups());

        await result.current();

        expect(dispatch).toHaveBeenCalledWith(setGroupsAction([{ group: 'Food', order: 0 }]));
    });
});
