import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { GroupsRow } from '~/client/pages/groups/GroupsRow';
import { SortableRow } from '~/client/table/SortableRow';

jest.mock('~/client/table/SortableRow', () => ({
    SortableRow: jest.fn(({ children }) => <tr>{children}</tr>),
}));

const Wrapper = ({ children }: React.PropsWithChildren) => (
    <MockTheme>
        <Table>
            <Table.Tbody>
                <Table.Tr>{children}</Table.Tr>
            </Table.Tbody>
        </Table>
    </MockTheme>
);

describe('<GroupsRow>', () => {
    afterEach(() => jest.clearAllMocks());

    it('renders group name', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės' }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getByText('Uogienės')).toBeInTheDocument();
    });

    it('renders calendar icon when annual is true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', annual: true }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders calendar icon when annual is undefined (defaults to true via ?? true)', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Daržovės' }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render calendar icon when annual is false', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Daržovės', annual: false }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).not.toBeInTheDocument();
    });

    it('passes disabled=true when reordering=true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės' }} reordering={true} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props.disabled).toBe(true);
    });

    it('passes disabled=true when hidden=true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės' }} reordering={false} hidden={true} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props.disabled).toBe(true);
    });

    it('passes disabled=false when both reordering and hidden are false', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės' }} reordering={false} hidden={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props.disabled).toBe(false);
    });

    it('passes data-hidden reflecting the hidden prop', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės' }} reordering={false} hidden={true} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props['data-hidden']).toBe(true);
    });

    it('passes data-hidden=false when hidden is not set', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės' }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = jest.mocked(SortableRow).mock.calls[0][0];
        expect(props['data-hidden']).toBe(false);
    });
});
