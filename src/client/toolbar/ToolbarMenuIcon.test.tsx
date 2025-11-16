import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ToolbarMenuIcon } from './ToolbarMenuIcon';

describe('<ToolbarMenuIcon>', () => {
    it('renders children', () => {
        render(
            <MockTheme>
                <ToolbarMenuIcon>
                    <span>Icon</span>
                </ToolbarMenuIcon>
            </MockTheme>
        );

        expect(screen.getByText('Icon')).toBeInTheDocument();
    });
});
