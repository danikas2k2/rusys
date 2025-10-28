import React from 'react';

import { Table, ThemeIcon } from '@mantine/core';
import { IconEqual } from '@tabler/icons-react';

import { useLabel } from '~/client/hooks/useLabel';

export function DragHandle({ ref, style, ...props }: React.ComponentPropsWithRef<'div'>): React.ReactElement {
    return (
        <Table.Td style={{ width: 0, paddingInlineEnd: 0 }}>
            <div
                ref={ref}
                data-drag-handle
                role="button"
                aria-label={useLabel('Drag')}
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
