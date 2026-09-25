import type React from 'react';

import type { ActiveContentData } from '~/components/runtime/ActiveContentContext';

export interface DraggableRowProps<D = ActiveContentData, T = HTMLTableRowElement> extends React.HTMLAttributes<T> {
    id: string;
    data: Readonly<D>;
}
