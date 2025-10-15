import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { Dropdown } from '@ui/Dropdown';

describe('<Dropdown>', () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('opens when trigger is clicked', async () => {
        render(<Dropdown trigger={<button>Open</button>} onOpen={onOpen} />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));

        expect(onOpen).toHaveBeenCalledWith();
    });

    it('closes when outside of dropdown is clicked', async () => {
        render(<Dropdown trigger={<button>Open</button>} onClose={onClose} />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.click(screen.getByRole('complementary', { name: 'backdrop' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('does not close when outside of dropdown is clicked and closeOnOutsideClick is false', async () => {
        render(<Dropdown trigger={<button>Open</button>} onClose={onClose} closeOnOutsideClick={false} />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.click(screen.getByRole('complementary', { name: 'backdrop' }));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes when escape key is pressed', async () => {
        render(<Dropdown trigger={<button>Open</button>} onClose={onClose} closeOnOutsideClick={false} />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.type(screen.getByRole('complementary', { name: 'backdrop' }), '{Escape}');

        expect(onClose).toHaveBeenCalledWith();
    });

    it('does not close when escape key is pressed and closeOnEscape is false', async () => {
        render(
            <Dropdown
                trigger={<button>Open</button>}
                onClose={onClose}
                closeOnEscape={false}
                closeOnOutsideClick={false}
            />
        );
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.type(screen.getByRole('complementary', { name: 'backdrop' }), '{Escape}');

        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes when trigger is clicked', async () => {
        render(<Dropdown trigger={<button>Open</button>} onOpen={onOpen} onClose={onClose} />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));

        expect(onOpen).toHaveBeenCalledWith();
        expect(onClose).toHaveBeenCalledWith();
    });

    it('renders with content', async () => {
        render(
            <Dropdown trigger={<button>Open</button>}>
                <div>Content</div>
            </Dropdown>
        );
        const trigger = screen.getByRole('button', { name: 'Open' });
        await userEvent.click(trigger);

        expect(trigger).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveTextContent('Content');
    });
});
