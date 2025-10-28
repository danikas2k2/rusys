import React from 'react';

export const Page = jest.fn(
    ({ children, toolbar, onAdd }: { children: React.ReactNode; toolbar?: React.ReactNode; onAdd?: () => void }) => (
        <div>
            <div>Page</div>
            {toolbar}
            {children}
            {onAdd && <button onClick={onAdd}>Add</button>}
        </div>
    )
);
