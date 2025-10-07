import React, { createContext, use, useState, type PropsWithChildren } from 'react';

import { noop } from 'lodash';

export enum UpdateTypes {
    Consumed = 'consumed',
    Updated = 'updated',
    Recycled = 'recycled',
}

export const UpdateTypeContext = createContext<[UpdateTypes, (v: UpdateTypes) => void]>([UpdateTypes.Consumed, noop]);

export function UpdateTypeContextWrapper({
    initialState = UpdateTypes.Consumed,
    children,
}: PropsWithChildren<{ initialState?: UpdateTypes }>) {
    return <UpdateTypeContext value={useState(initialState)}>{children}</UpdateTypeContext>;
}

export const useUpdateType = () => use(UpdateTypeContext);
