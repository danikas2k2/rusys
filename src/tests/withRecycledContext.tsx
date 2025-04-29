import React, { type PropsWithChildren } from 'react';
import { type RenderHookOptions } from '@testing-library/react';
import { RecycledContext, RecycledContextWrapper } from '~/client/common/RecycledContext';

export function withRecycledContext<P>(value?: [boolean, (v: boolean) => void]): RenderHookOptions<P> {
    return {
        wrapper: ({ children }: PropsWithChildren) =>
            value ? (
                <RecycledContext value={value}>{children}</RecycledContext>
            ) : (
                <RecycledContextWrapper>{children}</RecycledContextWrapper>
            ),
    };
}
