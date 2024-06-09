import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import React, { useRef } from 'react';

function OutsideClickTest({ handler }: { handler: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, handler);
    return (
        <>
            <div ref={ref} role="article" tabIndex={-1}>
                <button>Inside</button>
            </div>
            <button>Outside</button>
        </>
    );
}

describe('useOutsideClick', () => {
    it('does not call handler if clicked inside the container', async () => {
        const handler = jest.fn();
        render(<OutsideClickTest handler={handler} />);

        await userEvent.pointer({ target: screen.getByText('Inside'), keys: '[MouseLeft>]' });
        expect(handler).not.toHaveBeenCalled();
    });

    it('does not call handler if clicked on the container', async () => {
        const handler = jest.fn();
        render(<OutsideClickTest handler={handler} />);

        await userEvent.click(screen.getByRole('article'));
        expect(handler).not.toHaveBeenCalled();
    });

    it('calls handler if clicked outside the container', async () => {
        const handler = jest.fn();
        render(<OutsideClickTest handler={handler} />);

        await userEvent.click(screen.getByText('Outside'));
        expect(handler).toHaveBeenCalledWith();
    });
});
