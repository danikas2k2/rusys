import React from 'react';

import { Table } from '@mantine/core';

export function DragOverlayTable({
    columns,
    children,
}: React.PropsWithChildren<{ columns: number[] }>): React.ReactElement {
    return (
        <Table data-drag-overlay>
            {!!columns.length && (
                <colgroup>
                    {columns.map((width, key) => (
                        <col key={key} style={{ width: `${width}px` }} />
                    ))}
                </colgroup>
            )}
            <Table.Tbody>{children}</Table.Tbody>
        </Table>
    );
}
