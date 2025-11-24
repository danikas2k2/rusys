import React from 'react';

import { Table } from '@mantine/core';

export function GroupTitle({
    children,
    bg,
    style,
    ...props
}: React.ComponentProps<typeof Table.Th>): React.ReactElement {
    const color = `var(--color-${bg})`;

    return (
        <Table.Tbody>
            <Table.Tr>
                <Table.Th
                    {...props}
                    style={{
                        fontSize: 'var(--font-size-xlarge)',
                        fontWeight: 'var(--font-weight-semi-bold)',
                        padding: '1.25rem 0.75rem 0.75rem',
                        position: 'sticky',
                        insetBlockStart: '2.25rem',
                        zIndex: 1,
                        background: `var(--color-base) linear-gradient(135deg, color(from ${color} srgb r g b / 0%) 30%, color(from ${color} srgb r g b / 50%))`,
                        ...style,
                    }}
                >
                    {children}
                </Table.Th>
            </Table.Tr>
        </Table.Tbody>
    );
}
