import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SwipeControlsWrapper, useSwipePanelWidth } from './SwipeControlsContext';

function TestComponent() {
    const [width, setWidth] = useSwipePanelWidth();

    return (
        <div>
            <span aria-label="width">{width}</span>
            <button onClick={() => setWidth(100)}>Set Width</button>
        </div>
    );
}

describe('<SwipeControlsWrapper>', () => {
    it('provides initial width value of 0', () => {
        render(
            <MockTheme>
                <SwipeControlsWrapper>
                    <TestComponent />
                </SwipeControlsWrapper>
            </MockTheme>
        );

        expect(screen.getByRole('generic', { name: 'width' })).toHaveTextContent('0');
    });

    it('allows updating width value', async () => {
        render(
            <MockTheme>
                <SwipeControlsWrapper>
                    <TestComponent />
                </SwipeControlsWrapper>
            </MockTheme>
        );

        const widthEl = screen.getByRole('generic', { name: 'width' });

        expect(widthEl).toHaveTextContent('0');

        await user.click(screen.getByRole('button', { name: 'Set Width' }));

        expect(widthEl).toHaveTextContent('100');
    });
});
