import React, { type JSX, type PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export function MockRoute({ initialEntries, children }: PropsWithChildren<{ initialEntries?: string[] }>): JSX.Element {
    return (
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="*" element={children} />
            </Routes>
        </MemoryRouter>
    );
}
