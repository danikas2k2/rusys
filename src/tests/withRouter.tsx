import type { RenderHookOptions } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export function withRouter<P>(initialEntries?: string[]): RenderHookOptions<P> {
    return {
        wrapper: ({ children }: PropsWithChildren) => (
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="*" element={children} />
                </Routes>
            </MemoryRouter>
        ),
    };
}
