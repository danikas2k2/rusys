import React from 'react';
import { vi } from 'vitest';

export const Page = vi.fn(
    ({ children, toolbar, onAdd }: React.PropsWithChildren<{ toolbar?: React.ReactNode; onAdd?: () => void }>) => (
        <div>
            <div>Page</div>
            {toolbar}
            {children}
            {onAdd && <button onClick={onAdd}>Add</button>}
        </div>
    )
);
