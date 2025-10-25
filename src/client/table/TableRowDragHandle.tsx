import React from 'react';

import { Table, ThemeIcon } from '@mantine/core';
import { IconEqual } from '@tabler/icons-react';

export function TableRowDragHandle({ ref, style, ...props }: React.ComponentPropsWithRef<'div'>): React.JSX.Element {
    return (
        <Table.Td style={{ width: 0, paddingInlineEnd: 0 }}>
            <div
                ref={ref}
                data-drag-handle
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    touchAction: 'none',
                    ...style,
                }}
                {...props}
            >
                <ThemeIcon color="gray" variant="transparent">
                    <IconEqual />
                </ThemeIcon>
            </div>
        </Table.Td>
    );
}
