import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

export function MockRoute({
    initialEntries,
    children,
}: React.PropsWithChildren<{ initialEntries?: string[] }>): React.ReactElement {
    return (
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="*" element={children} />
            </Routes>
        </MemoryRouter>
    );
}
