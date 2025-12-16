import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { GroupTitle } from './GroupTitle';

describe('<GroupTitle>', () => {
    it('renders group title with children', () => {
        render(
            <MockTheme>
                <Table>
                    <GroupTitle>Test Group</GroupTitle>
                </Table>
            </MockTheme>
        );

        expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('applies custom style', () => {
        const customStyle = { fontSize: '20px' };

        render(
            <MockTheme>
                <Table>
                    <GroupTitle style={customStyle}>Test Group</GroupTitle>
                </Table>
            </MockTheme>
        );

        const th = screen.getByText('Test Group').closest('th');

        expect(th).toHaveStyle({ fontSize: '20px' });
    });
});
