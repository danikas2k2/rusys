import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useContext } from 'react';
import { RecycledContext, RecycledContextWrapper, useRecycled } from '~/client/common/RecycledContext';

describe('RecycledContext', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => useContext(RecycledContext));
        expect(result.current).toEqual([false, expect.any(Function)]);
    });
});

describe('useRecycled', () => {
    it('returns default missing-only context', () => {
        const { result } = renderHook(() => useRecycled());
        expect(result.current).toEqual([false, expect.any(Function)]);
    });

    it('returns custom missing-only context', () => {
        const setRecycled = jest.fn();
        const { result } = renderHook(() => useRecycled(), {
            wrapper: ({ children }) => (
                <RecycledContext.Provider value={[true, setRecycled]}>{children}</RecycledContext.Provider>
            ),
        });
        expect(result.current).toEqual([true, setRecycled]);
    });
});

describe('RecycledContextWrapper', () => {
    function Test() {
        const [recycled, setRecycled] = useRecycled();
        return <button onClick={() => setRecycled(true)}>{recycled ? 'Recycled' : 'Consumed'}</button>;
    }

    it('uses context with default value', () => {
        render(
            <RecycledContextWrapper>
                <Test />
            </RecycledContextWrapper>
        );
        expect(screen.getByRole('button')).toHaveTextContent('Consumed');
    });

    it('changes context', async () => {
        render(
            <RecycledContextWrapper>
                <Test />
            </RecycledContextWrapper>
        );
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('Recycled');
    });
});
