import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { type RefreshResponse, useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';
import { DetailsActionType } from '~/state/details/actions';
import { type AmountSet } from '~/state/details/types';
import { MissingActionType } from '~/state/missing/actions';
import { type Missing } from '~/state/missing/types';
import { RemovingActionType } from '~/state/removing/actions';
import { type RemovingSet } from '~/state/removing/types';
import { YearsActionType } from '~/state/years/actions';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateStateFromResponse', () => {
    const dispatch = jest.fn();

    beforeEach(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('do nothing for undefined response', async () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        await result.current(undefined);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('do nothing for empty response', async () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        await result.current({});
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('throw default error for failed response without error', async () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        await expect(result.current({ ok: false })).rejects.toThrow('Request failed');
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('throw custom error for failed response with custom error', async () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        await expect(result.current({ ok: false, error: 'Custom error' })).rejects.toThrow('Custom error');
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('do nothing for empty successful response', async () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        await result.current({ ok: true });
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('do nothing for successful response with unknown update', async () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        await result.current({ ok: true, unknown: true } as RefreshResponse);
        expect(dispatch).not.toHaveBeenCalled();
    });

    const years = [21, 22, 23];
    it('dispatch years update action if response has years', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, years });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: YearsActionType.SET, years });
    });

    const details: AmountSet = { G: { A: { 21: { '': 1 }, 22: { '': 2, d: 3 } } } };
    it('dispatch details update action if response has details', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, details });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.SET, details });
    });

    const missing: Missing = [{ name: 'A' }, { group: 'G', name: 'B' }];
    it('dispatch missing update action if response has missing', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, missing });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: MissingActionType.SET, missing });
    });

    const removing: RemovingSet = { G: { A: { 21: true, 22: true } } };
    it('dispatch removing update action if response has removing', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, removing });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: RemovingActionType.SET, removing });
    });

    it('dispatch several update actions if response has several fields', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, years, details, missing, removing });
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(dispatch).toHaveBeenCalledWith({ type: YearsActionType.SET, years });
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.SET, details });
        expect(dispatch).toHaveBeenCalledWith({ type: MissingActionType.SET, missing });
        expect(dispatch).toHaveBeenCalledWith({ type: RemovingActionType.SET, removing });
    });

    it('do nothing if response has data fields but no ok status', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ years, details, missing, removing });
        expect(dispatch).not.toHaveBeenCalled();
    });
});
