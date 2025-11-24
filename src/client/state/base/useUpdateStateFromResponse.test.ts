import { renderHook } from '@testing-library/react';
import { getProductsFixture, getSummaryFixture, getYearsFixture } from '@tests/fixtures';

import { useDispatch } from 'react-redux';

import { useUpdateStateFromResponse, type RefreshResult } from '~/client/state/base/useUpdateStateFromResponse';
import { ProductsActionType } from '~/client/state/products/actions';
import { SummaryActionType } from '~/client/state/summary/actions';
import { YearsActionType } from '~/client/state/years/actions';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateStateFromResponse', () => {
    const dispatch = jest.fn();

    beforeEach(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

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
        await result.current({ ok: true, unknown: true } as RefreshResult);

        expect(dispatch).not.toHaveBeenCalled();
    });

    const years = getYearsFixture();

    it('dispatch years update action if response has years', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, years });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: YearsActionType.SET, years });
    });

    const products = getProductsFixture();

    it('dispatch products update action if response has products', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, products });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: ProductsActionType.SET, products });
    });

    const summary = getSummaryFixture();

    it('dispatch several update actions if response has several fields', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ ok: true, years, products, summary });

        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(dispatch).toHaveBeenCalledWith({ type: YearsActionType.SET, years });
        expect(dispatch).toHaveBeenCalledWith({ type: ProductsActionType.SET, products });
        expect(dispatch).toHaveBeenCalledWith({ type: SummaryActionType.SET, summary });
    });

    it('do nothing if response has data fields but no ok status', () => {
        const { result } = renderHook(() => useUpdateStateFromResponse());
        result.current({ years, products, summary } as any);

        expect(dispatch).not.toHaveBeenCalled();
    });
});
