import { renderHook } from '@testing-library/react';

import { useDispatch } from 'react-redux';

import { useGetSummary } from '~/features/summary/hooks/useGetSummary';
import { readSummary } from '~/server/actions/summary';
import { setGroupsAction } from '~/store/groups';
import { setSummaryAction } from '~/store/summary';
import { setVariantsAction } from '~/store/variants';
import { setYearsAction } from '~/store/years';

vi.mock(import('~/server/actions/summary'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetSummary', () => {
    it('reads summary and dispatches each collection', async () => {
        const dispatch = vi.fn();
        vi.mocked(useDispatch).mockReturnValue(dispatch);
        const data = { years: [26], groups: [], variants: [], summary: [] };
        vi.mocked(readSummary).mockResolvedValue(data);
        const { result } = renderHook(() => useGetSummary());

        await result.current();

        expect(dispatch).toHaveBeenCalledWith(setYearsAction(data.years));
        expect(dispatch).toHaveBeenCalledWith(setGroupsAction(data.groups));
        expect(dispatch).toHaveBeenCalledWith(setVariantsAction(data.variants));
        expect(dispatch).toHaveBeenCalledWith(setSummaryAction(data.summary));
    });
});
