import { render, screen } from '@testing-library/react';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import React from 'react';

describe('useAutoFocus', () => {
    it('focuses on the element when the ref is defined', () => {
        function TestComponent(): JSX.Element {
            const ref = useAutoFocus<HTMLButtonElement>();
            return <button ref={ref} />;
        }

        render(<TestComponent />);
        expect(screen.getByRole('button')).toHaveFocus();
    });

    it('does not focus on the element when the ref is undefined', () => {
        function TestComponent(): JSX.Element {
            useAutoFocus<HTMLButtonElement>();
            return <button />;
        }

        render(<TestComponent />);
        expect(screen.getByRole('button')).not.toHaveFocus();
    });
});
