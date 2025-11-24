import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';

import {
    getKey,
    UpdatingDetailsContext,
    UpdatingDetailsWrapper,
    useDetailsUpdating,
    useUpdatingDetails,
} from '~/client/pages/details/UpdatingDetailsContext';

describe('getKey', () => {
    it('generates key from details', () => {
        const details = { group: 'Uogienės', name: 'Avietės', year: 2024 };

        expect(getKey(details)).toBe('Uogienės:Avietės:2024');
    });

    it('generates unique keys for different details', () => {
        const first = { group: 'Uogienės', name: 'Avietės', year: 2024 };
        const second = { group: 'Daržovės', name: 'Agurkai', year: 2025 };

        expect(getKey(first)).toBe('Uogienės:Avietės:2024');
        expect(getKey(second)).toBe('Daržovės:Agurkai:2025');
        expect(getKey(first)).not.toBe(getKey(second));
    });
});

describe('<UpdatingDetailsContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(UpdatingDetailsContext));

        expect(result.current).toStrictEqual([{}, expect.any(Function)]);
    });

    it('calls default function from context', () => {
        const { result } = renderHook(() => use(UpdatingDetailsContext));
        const [, setUpdating] = result.current;

        expect(() => setUpdating({ group: 'Uogienės', name: 'Avietės', year: 2024 }, true)).not.toThrow();
    });
});

describe('useUpdatingDetails', () => {
    it('returns default updating details context', () => {
        const { result } = renderHook(() => useUpdatingDetails());

        expect(result.current).toStrictEqual([{}, expect.any(Function)]);
    });

    it('returns custom updating details context', () => {
        const setUpdating = jest.fn();
        const state = { 'Uogienės:Avietės:2024': true };
        const { result } = renderHook(() => useUpdatingDetails(), {
            wrapper: ({ children }) => (
                <UpdatingDetailsContext value={[state, setUpdating]}>{children}</UpdatingDetailsContext>
            ),
        });

        expect(result.current).toStrictEqual([state, setUpdating]);
    });
});

describe('useDetailsUpdating', () => {
    const details = { group: 'Uogienės', name: 'Avietės', year: 2024 };

    it('returns false when item is not updating', () => {
        const { result } = renderHook(() => useDetailsUpdating(details));

        expect(result.current).toBe(false);
    });

    it('returns true when item is updating', () => {
        const state = { 'Uogienės:Avietės:2024': true };
        const { result } = renderHook(() => useDetailsUpdating(details), {
            wrapper: ({ children }) => (
                <UpdatingDetailsContext value={[state, jest.fn()]}>{children}</UpdatingDetailsContext>
            ),
        });

        expect(result.current).toBe(true);
    });
});

describe('<UpdatingDetailsWrapper>', () => {
    function Test() {
        const [state, setUpdating] = useUpdatingDetails();
        const details = { group: 'Uogienės', name: 'Avietės', year: 2024 };
        const key = getKey(details);
        return (
            <>
                <button onClick={() => setUpdating(details, true)}>Set updating</button>
                <button onClick={() => setUpdating(details, false)}>Set idle</button>
                <div role="status">{`${key in state && state[key]}`}</div>
            </>
        );
    }

    it('uses context with default value', () => {
        render(
            <UpdatingDetailsWrapper>
                <Test />
            </UpdatingDetailsWrapper>
        );

        expect(screen.getByRole('status')).toHaveTextContent('false');
    });

    it('sets updating state to true', async () => {
        render(
            <UpdatingDetailsWrapper>
                <Test />
            </UpdatingDetailsWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Set updating' }));

        expect(screen.getByRole('status')).toHaveTextContent('true');
    });

    it('removes item from state when set to false', async () => {
        render(
            <UpdatingDetailsWrapper>
                <Test />
            </UpdatingDetailsWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Set updating' }));

        expect(screen.getByRole('status')).toHaveTextContent('true');

        await user.click(screen.getByRole('button', { name: 'Set idle' }));

        expect(screen.getByRole('status')).toHaveTextContent('false');
    });

    it('handles multiple items independently', async () => {
        function MultiTest() {
            const firstDetails = { group: 'Uogienės', name: 'Avietės', year: 2024 };
            const isFirstUpdating = useDetailsUpdating(firstDetails);
            const secondDetails = { group: 'Daržovės', name: 'Agurkai', year: 2025 };
            const isSecondUpdating = useDetailsUpdating(secondDetails);
            const [, setUpdating] = useUpdatingDetails();

            return (
                <>
                    <button onClick={() => setUpdating(firstDetails, true)}>Update first details</button>
                    <button onClick={() => setUpdating(secondDetails, true)}>Update second details</button>
                    <div role="status">
                        {String(isFirstUpdating)} : {String(isSecondUpdating)}
                    </div>
                </>
            );
        }

        render(
            <UpdatingDetailsWrapper>
                <MultiTest />
            </UpdatingDetailsWrapper>
        );

        await user.click(screen.getByRole('button', { name: 'Update first details' }));

        expect(screen.getByRole('status')).toHaveTextContent('true : false');

        await user.click(screen.getByRole('button', { name: 'Update second details' }));

        expect(screen.getByRole('status')).toHaveTextContent('true : true');
    });
});
