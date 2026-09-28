import React from 'react';

export function MockRoute({
    initialEntries,
    children,
}: React.PropsWithChildren<{ initialEntries?: string[] }>): React.ReactElement {
    window.history.replaceState({}, '', initialEntries?.[0] ?? '/');
    return <>{children}</>;
}
