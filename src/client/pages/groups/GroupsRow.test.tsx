import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { GroupsRow } from '~/client/pages/groups/GroupsRow';
import { SortableRow } from '~/client/table/SortableRow';

vi.mock(import('~/client/table/SortableRow'), () => ({
    SortableRow: vi.fn(({ children }: { children: React.ReactNode }) => <tr>{children}</tr>),
}));

describe('<GroupsRow>', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders group name', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', order: 0 }} reordering={false} />
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
                        <GroupsRow group={{ group: 'Uogienės', order: 0, annual: true }} reordering={false} />
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
                        <GroupsRow group={{ group: 'Daržovės', order: 0 }} reordering={false} />
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
                        <GroupsRow group={{ group: 'Daržovės', order: 0, annual: false }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).not.toBeInTheDocument();
    });

    it('renders clipboard icon when review is true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow
                            group={{ group: 'Uogienės', order: 0, annual: false, review: true }}
                            reordering={false}
                        />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render clipboard icon when review is false', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow
                            group={{ group: 'Daržovės', order: 0, annual: false, review: false }}
                            reordering={false}
                        />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).not.toBeInTheDocument();
    });

    it('does not render clipboard icon when review is undefined', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Daržovės', order: 0, annual: false }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelector('svg')).not.toBeInTheDocument();
    });

    it('renders both icons when annual and review are true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow
                            group={{ group: 'Uogienės', order: 0, annual: true, review: true }}
                            reordering={false}
                        />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(document.querySelectorAll('svg')).toHaveLength(2);
    });

    it('passes disabled=true when reordering=true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', order: 0 }} reordering />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(true);
    });

    it('passes disabled=true when hidden=true', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', order: 0 }} reordering={false} hidden />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(true);
    });

    it('passes disabled=false when both reordering and hidden are false', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', order: 0 }} reordering={false} hidden={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = vi.mocked(SortableRow).mock.calls[0][0];

        expect(props.disabled).toBe(false);
    });

    it('passes data-hidden reflecting the hidden prop', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', order: 0 }} reordering={false} hidden />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = vi.mocked(SortableRow).mock.calls[0][0] as unknown as Record<string, unknown>;

        expect(props['data-hidden']).toBe(true);
    });

    it('passes data-hidden=false when hidden is not set', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <GroupsRow group={{ group: 'Uogienės', order: 0 }} reordering={false} />
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const props = vi.mocked(SortableRow).mock.calls[0][0] as unknown as Record<string, unknown>;

        expect(props['data-hidden']).toBe(false);
    });
});
