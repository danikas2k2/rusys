import React, { createContext, use, useState } from 'react';

import { noop } from 'lodash';

export type UpdateTypes = 'consumed' | 'updated' | 'recycled';

export const UpdateTypeContext = createContext<[UpdateTypes, (v: UpdateTypes) => void]>(['consumed', noop]);

export function UpdateTypeWrapper({
    initialState = 'consumed',
    children,
}: React.PropsWithChildren<{ initialState?: UpdateTypes }>) {
    return <UpdateTypeContext value={useState(initialState)}>{children}</UpdateTypeContext>;
}

export const useUpdateType = () => use(UpdateTypeContext);
