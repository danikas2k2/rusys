import React from 'react';

export const ActiveRemoveConfirmation = vi.fn(({ onConfirm }: { onConfirm?: (data: unknown) => void }) => (
    <div role="dialog">
        <button onClick={() => onConfirm?.({})}>Remove</button>
    </div>
));
