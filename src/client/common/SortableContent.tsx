import React from 'react';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function SortableContent({ items, children }: React.PropsWithChildren<{ items: string[] }>): React.ReactElement {
    return (
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {children}
        </SortableContext>
    );
}
