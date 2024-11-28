import { render, renderHook, screen } from '@testing-library/react';
import { useFocusRef } from '@ui/hooks/useFocusRef';
import React, { type JSX, useEffect } from 'react';

describe('useFocusRef', () => {
    it('returns a ref object with focus method when forwardedRef is undefined', () => {
        const { result } = renderHook(() => useFocusRef<HTMLElement>());

        expect(result.current).toEqual({ current: null, focus: expect.any(Function) });
    });

    it('returns a ref object with focus method when forwardedRef is a ref object', () => {
        const { result } = renderHook(() => useFocusRef<HTMLElement>({ current: null }));

        expect(result.current).toEqual({ current: null, focus: expect.any(Function) });
    });

    it('calls forwardedRef function with current ref when forwardedRef is a function', () => {
        const forwardedRef = jest.fn();
        const { result } = renderHook(() => useFocusRef<HTMLElement>(forwardedRef));

        expect(forwardedRef).toHaveBeenCalledWith(result.current?.current);
        expect(result.current?.focus).toBeInstanceOf(Function);
    });

    it('focuses on the element when focus method is called', () => {
        function TestComponent(): JSX.Element {
            const ref = useFocusRef<HTMLButtonElement>();
            useEffect(() => {
                ref?.focus();
            }, [ref]);
            return <button ref={ref} />;
        }

        render(<TestComponent />);
        expect(screen.getByRole('button')).toHaveFocus();
    });
});
