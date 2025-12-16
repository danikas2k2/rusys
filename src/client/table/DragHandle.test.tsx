import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { DragHandle } from './DragHandle';

jest.mock('~/client/hooks/useLabel', () => ({
    useLabel: jest.fn((key: string) => key),
}));

describe('<DragHandle>', () => {
    it('renders drag handle with correct attributes', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <DragHandle />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Drag' })).toHaveAttribute('data-drag-handle');
    });

    it('applies custom style', () => {
        const customStyle = { color: 'red' };

        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <DragHandle style={customStyle} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const button = screen.getByRole('button', { name: 'Drag' });

        expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });

    it('forwards ref', () => {
        const ref = React.createRef<HTMLDivElement>();

        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <DragHandle ref={ref} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement).toHaveAttribute('data-drag-handle');
    });
});
