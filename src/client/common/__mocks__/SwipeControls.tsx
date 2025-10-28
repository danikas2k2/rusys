import React from 'react';

const data = { name: 'Name', group: 'Group', variant: 'Variant' };

export const SwipeControls = jest.fn(
    ({ onEdit, onDelete }: { onEdit?: (data: unknown) => void; onDelete?: (data: unknown) => void }) => (
        <>
            <button onClick={() => onEdit?.(data)}>Edit</button>
            <button onClick={() => onDelete?.(data)}>Delete</button>
        </>
    )
);
