import { Table, ThemeIcon } from '@mantine/core';
import React from 'react';

import { DragHandleIcon } from '@icons';

import { useLabel } from '~/client/hooks/useLabel';

export function DragHandle({ ref, style, ...props }: React.ComponentPropsWithRef<'div'>): React.ReactElement {
    return (
        <Table.Td style={{ width: 0, paddingInlineEnd: 0 }}>
            <div
                ref={ref}
                data-drag-handle
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
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
                    <DragHandleIcon />
                </ThemeIcon>
            </div>
        </Table.Td>
    );
}
