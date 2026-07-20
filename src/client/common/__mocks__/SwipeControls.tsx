import React from 'react';
import { vi } from 'vitest';

const data = { name: 'Name', group: 'Group', variant: 'Variant' };

export const SwipeControls = vi.fn(
    ({ onEdit, onDelete }: { onEdit?: (data: unknown) => void; onDelete?: (data: unknown) => void }) => (
        <>
            <button onClick={() => onEdit?.(data)}>Edit</button>
            <button onClick={() => onDelete?.(data)}>Delete</button>
        </>
    )
);
