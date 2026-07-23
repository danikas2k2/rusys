import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';

import { AmountViewContext, AmountViewWrapper, useAmountView } from '~/client/common/AmountViewContext';

describe('<AmountViewContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(AmountViewContext));

        expect(result.current).toStrictEqual(['detailed', expect.any(Function)]);
    });
});

describe('useAmountView', () => {
    it('returns detailed view by default', () => {
        const { result } = renderHook(() => useAmountView());

        expect(result.current).toStrictEqual(['detailed', expect.any(Function)]);
    });

    it('returns total view when provided', () => {
        const setAmountView = vi.fn();
        const { result } = renderHook(() => useAmountView(), {
            wrapper: ({ children }) => (
                <AmountViewContext value={['total', setAmountView]}>{children}</AmountViewContext>
            ),
        });

        expect(result.current).toStrictEqual(['total', setAmountView]);
    });
});

describe('<AmountViewWrapper>', () => {
    function Test() {
        const [amountView, setAmountView] = useAmountView();
        return <button onClick={() => setAmountView('total')}>{amountView}</button>;
    }

    afterEach(() => localStorage.clear());

    it('defaults to detailed when localStorage is empty', () => {
        render(
            <AmountViewWrapper>
                <Test />
            </AmountViewWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('detailed');
    });

    it('reads the initial value from localStorage', () => {
        localStorage.setItem('amountView', 'total');

        render(
            <AmountViewWrapper>
                <Test />
            </AmountViewWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('total');
    });

    it('ignores an unknown localStorage value and defaults to detailed', () => {
        localStorage.setItem('amountView', 'nonsense');

        render(
            <AmountViewWrapper>
                <Test />
            </AmountViewWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('detailed');
    });

    it('changes context and persists the new value to localStorage', async () => {
        render(
            <AmountViewWrapper>
                <Test />
            </AmountViewWrapper>
        );
        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('total');
        expect(localStorage.getItem('amountView')).toBe('total');
    });
});
