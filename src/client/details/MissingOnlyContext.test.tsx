import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { use } from 'react';
import { MissingOnlyContext, MissingOnlyContextWrapper, useMissingOnly } from '~/client/details/MissingOnlyContext';

describe('MissingOnlyContext', () => {
    afterEach(() => {});

    it('uses context with default value', () => {
        const { result } = renderHook(() => use(MissingOnlyContext));
        expect(result.current).toEqual([false, expect.any(Function)]);
    });
});

describe('useMissingOnly', () => {
    it('returns default missing-only context', () => {
        const { result } = renderHook(() => useMissingOnly());
        expect(result.current).toEqual([false, expect.any(Function)]);
    });

    it('returns custom missing-only context', () => {
        const setMissingOnly = jest.fn();
        const { result } = renderHook(() => useMissingOnly(), {
            wrapper: ({ children }) => (
                <MissingOnlyContext value={[true, setMissingOnly]}>{children}</MissingOnlyContext>
            ),
        });
        expect(result.current).toEqual([true, setMissingOnly]);
    });
});

describe('MissingOnlyContextWrapper', () => {
    function Test() {
        const [missingOnly, setMissingOnly] = useMissingOnly();
        return <button onClick={() => setMissingOnly(true)}>{missingOnly ? 'MissingOnly' : 'Everything'}</button>;
    }

    it('uses context with default value', () => {
        render(
            <MissingOnlyContextWrapper>
                <Test />
            </MissingOnlyContextWrapper>
        );
        expect(screen.getByRole('button')).toHaveTextContent('Everything');
    });

    it('changes context', async () => {
        render(
            <MissingOnlyContextWrapper>
                <Test />
            </MissingOnlyContextWrapper>
        );
        await userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('MissingOnly');
    });
});
