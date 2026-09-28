import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { useState } from 'react';

import { IconButtonTooltip } from './IconButtonTooltip';

function setup(hover: boolean) {
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation((query: string) => ({
            matches: query === '(hover: hover)' && hover,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
    );

    function Example() {
        const [visible, setVisible] = useState(true);
        return visible ? (
            <IconButtonTooltip>
                <button aria-label="Move variants" onClick={() => setVisible(false)} />
            </IconButtonTooltip>
        ) : null;
    }

    render(
        <MockTheme>
            <Example />
        </MockTheme>
    );
}

describe('<IconButtonTooltip>', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => vi.unstubAllGlobals());

    it('waits before showing and closes when its trigger disappears', async () => {
        setup(true);
        const button = screen.getByRole('button', { name: 'Move variants' });

        await user.hover(button);

        await expect(screen.findByRole('tooltip')).resolves.toHaveTextContent('Move variants');

        await user.click(button);

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not show a tooltip on devices without hover', async () => {
        setup(false);
        await user.hover(screen.getByRole('button', { name: 'Move variants' }));

        await new Promise((resolve) => setTimeout(resolve, 550));

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
