import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ClearFilterIcon } from './ClearFilterIcon';

vi.mock(import('~/client/hooks/useLabel'), () => ({
    useLabel: vi.fn((key: string) => key),
}));

describe('<ClearFilterIcon>', () => {
    it('renders clear filter icon', () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <ClearFilterIcon onClick={onClick} />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <ClearFilterIcon onClick={onClick} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('stops propagation and prevents default on click', async () => {
        const onClick = vi.fn();
        const parentOnClick = vi.fn();
        const stopPropagation = vi.fn();
        const preventDefault = vi.fn();

        render(
            <MockTheme>
                <div onClick={parentOnClick} onKeyDown={parentOnClick} role="button" tabIndex={0}>
                    <ClearFilterIcon onClick={onClick} />
                </div>
            </MockTheme>
        );

        const button = screen.getByRole('button', { name: 'Clear' });
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(clickEvent, 'stopPropagation', { value: stopPropagation, writable: true });
        Object.defineProperty(clickEvent, 'preventDefault', { value: preventDefault, writable: true });

        button.dispatchEvent(clickEvent);

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(parentOnClick).not.toHaveBeenCalled();
    });
});
