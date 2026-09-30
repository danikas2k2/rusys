import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { useState } from 'react';

import { IconButtonTooltip } from './IconButtonTooltip';

const positioning = vi.hoisted(() => ({ enabled: false }));

vi.mock(import('@mantine/core'), async (importOriginal) => {
    const actual = await importOriginal();
    const { createElement } = await import('react');
    return {
        ...actual,
        Tooltip: (props: React.ComponentProps<typeof actual.Tooltip>) =>
            positioning.enabled
                ? createElement(
                      'div',
                      { 'data-label': props.label, 'data-transition': props.transitionProps?.transition },
                      props.children,
                      createElement(
                          'button',
                          { onClick: () => props.onPositionChange?.('bottom-start') },
                          'Move below'
                      ),
                      createElement('button', { onClick: () => props.onPositionChange?.('top') }, 'Move above')
                  )
                : createElement(actual.Tooltip, props),
    };
});

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

    afterEach(() => {
        positioning.enabled = false;
        vi.unstubAllGlobals();
    });

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

    it('uses the explicit label and follows vertical placement changes', () => {
        positioning.enabled = true;
        const { container } = render(
            <IconButtonTooltip label="Explicit">
                <button aria-label="Fallback" />
            </IconButtonTooltip>
        );

        expect(container.firstChild).toHaveAttribute('data-label', 'Explicit');
        expect(container.firstChild).toHaveAttribute('data-transition', 'fade-up');

        fireEvent.click(screen.getByRole('button', { name: 'Move below' }));

        expect(container.firstChild).toHaveAttribute('data-transition', 'fade-down');

        fireEvent.click(screen.getByRole('button', { name: 'Move above' }));

        expect(container.firstChild).toHaveAttribute('data-transition', 'fade-up');
    });

    it('uses a horizontal transition for left-positioned tooltips', () => {
        positioning.enabled = true;
        const { container } = render(
            <IconButtonTooltip position="left">
                <button aria-label="Move" />
            </IconButtonTooltip>
        );

        expect(container.firstChild).toHaveAttribute('data-label', 'Move');
        expect(container.firstChild).toHaveAttribute('data-transition', 'fade-left');
    });
});
