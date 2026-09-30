import { renderHook } from '@testing-library/react';

import { useDispatch } from 'react-redux';

import { readSummary } from '~/server/actions/summary';
import { setGroupsAction } from '~/store/groups/actions';
import { setSummaryAction } from '~/store/summary/actions';
import { useGetSummary } from '~/store/summary/useGetSummary';
import { setVariantsAction } from '~/store/variants/actions';
import { setYearsAction } from '~/store/years/actions';

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
