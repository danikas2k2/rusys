import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';

import {
    getKey,
    UpdatingProductsContext,
    UpdatingProductsWrapper,
    useProductUpdating,
    useUpdatingProducts,
} from '~/client/pages/products/UpdatingProductsContext';

describe('getKey', () => {
    it('generates key from product', () => {
        const product = { group: 'Uogienės', name: 'Avietės', year: 2024 };

        expect(getKey(product)).toBe('Uogienės:Avietės:2024');
    });

    it('generates unique keys for different products', () => {
        const first = { group: 'Uogienės', name: 'Avietės', year: 2024 };
        const second = { group: 'Daržovės', name: 'Agurkai', year: 2025 };

        expect(getKey(first)).toBe('Uogienės:Avietės:2024');
        expect(getKey(second)).toBe('Daržovės:Agurkai:2025');
        expect(getKey(first)).not.toBe(getKey(second));
    });
});

describe('<UpdatingProductsContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(UpdatingProductsContext));

        expect(result.current).toStrictEqual([{}, expect.any(Function)]);
    });

    it('calls default function from context', () => {
        const { result } = renderHook(() => use(UpdatingProductsContext));
        const [, setUpdating] = result.current;

        expect(() => setUpdating({ group: 'Uogienės', name: 'Avietės', year: 2024 }, true)).not.toThrow();
    });
});

describe('useUpdatingProducts', () => {
    it('returns default updating products context', () => {
        const { result } = renderHook(() => useUpdatingProducts());

        expect(result.current).toStrictEqual([{}, expect.any(Function)]);
    });

    it('returns custom updating products context', () => {
        const setUpdating = vi.fn();
        const state = { 'Uogienės:Avietės:2024': true };
        const { result } = renderHook(() => useUpdatingProducts(), {
            wrapper: ({ children }) => (
                <UpdatingProductsContext value={[state, setUpdating]}>{children}</UpdatingProductsContext>
            ),
        });

        expect(result.current).toStrictEqual([state, setUpdating]);
    });
});

describe('useProductUpdating', () => {
    const product = { group: 'Uogienės', name: 'Avietės', year: 2024 };

    it('returns false when item is not updating', () => {
        const { result } = renderHook(() => useProductUpdating(product));

        expect(result.current).toBe(false);
    });

    it('returns true when item is updating', () => {
        const state = { 'Uogienės:Avietės:2024': true };
        const { result } = renderHook(() => useProductUpdating(product), {
            wrapper: ({ children }) => (
                <UpdatingProductsContext value={[state, vi.fn()]}>{children}</UpdatingProductsContext>
            ),
        });

        expect(result.current).toBe(true);
    });
});

describe('<UpdatingProductsWrapper>', () => {
    function Test() {
        const [state, setUpdating] = useUpdatingProducts();
        const product = { group: 'Uogienės', name: 'Avietės', year: 2024 };
        const key = getKey(product);
        return (
            <>
                <button onClick={() => setUpdating(product, true)}>Set updating</button>
                <button onClick={() => setUpdating(product, false)}>Set idle</button>
                <output>{`${key in state && state[key]}`}</output>
            </>
        );
    }

    it('uses context with default value', () => {
        render(
            <UpdatingProductsWrapper>
                <Test />
            </UpdatingProductsWrapper>
        );

        expect(screen.getByRole('status')).toHaveTextContent('false');
    });

    it('sets updating state to true', async () => {
        render(
            <UpdatingProductsWrapper>
                <Test />
            </UpdatingProductsWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Set updating' }));

        expect(screen.getByRole('status')).toHaveTextContent('true');
    });

    it('removes item from state when set to false', async () => {
        render(
            <UpdatingProductsWrapper>
                <Test />
            </UpdatingProductsWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Set updating' }));

        const badge = screen.getByRole('status');

        expect(badge).toHaveTextContent('true');

        await user.click(screen.getByRole('button', { name: 'Set idle' }));

        expect(badge).toHaveTextContent('false');
    });

    it('handles multiple items independently', async () => {
        function MultiTest() {
            const firstProduct = { group: 'Uogienės', name: 'Avietės', year: 2024 };
            const isFirstUpdating = useProductUpdating(firstProduct);
            const secondProduct = { group: 'Daržovės', name: 'Agurkai', year: 2025 };
            const isSecondUpdating = useProductUpdating(secondProduct);
            const [, setUpdating] = useUpdatingProducts();

            return (
                <>
                    <button onClick={() => setUpdating(firstProduct, true)}>Update first product</button>
                    <button onClick={() => setUpdating(secondProduct, true)}>Update second product</button>
                    <output>
                        {String(isFirstUpdating)} : {String(isSecondUpdating)}
                    </output>
                </>
            );
        }

        render(
            <UpdatingProductsWrapper>
                <MultiTest />
            </UpdatingProductsWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Update first product' }));

        const badge = screen.getByRole('status');

        expect(badge).toHaveTextContent('true : false');

        await user.click(screen.getByRole('button', { name: 'Update second product' }));

        expect(badge).toHaveTextContent('true : true');
    });
});
