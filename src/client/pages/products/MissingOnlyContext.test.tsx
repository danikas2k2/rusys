import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';

import { MissingOnlyContext, MissingOnlyWrapper, useMissingOnly } from '~/client/pages/products/MissingOnlyContext';

describe('<MissingOnlyContext>', () => {
    afterEach(() => {});

    it('uses context with default value', () => {
        const { result } = renderHook(() => use(MissingOnlyContext));

        expect(result.current).toStrictEqual([false, expect.any(Function)]);
    });
});

describe('useMissingOnly', () => {
    it('returns default missing-only context', () => {
        const { result } = renderHook(() => useMissingOnly());

        expect(result.current).toStrictEqual([false, expect.any(Function)]);
    });

    it('returns custom missing-only context', () => {
        const setMissingOnly = vi.fn();
        const { result } = renderHook(() => useMissingOnly(), {
            wrapper: ({ children }) => (
                <MissingOnlyContext value={[true, setMissingOnly]}>{children}</MissingOnlyContext>
            ),
        });

        expect(result.current).toStrictEqual([true, setMissingOnly]);
    });
});

describe('<MissingOnlyContextWrapper>', () => {
    function Test() {
        const [missingOnly, setMissingOnly] = useMissingOnly();
        return <button onClick={() => setMissingOnly(true)}>{missingOnly ? 'MissingOnly' : 'Everything'}</button>;
    }

    it('uses context with default value', () => {
        render(
            <MissingOnlyWrapper>
                <Test />
            </MissingOnlyWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('Everything');
    });

    it('changes context', async () => {
        render(
            <MissingOnlyWrapper>
                <Test />
            </MissingOnlyWrapper>
        );
        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('MissingOnly');
    });
});
