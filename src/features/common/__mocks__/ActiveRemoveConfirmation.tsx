import { vi } from 'vitest';

import React from 'react';

export const ActiveRemoveConfirmation = vi.fn(({ onConfirm }: { onConfirm?: (data: unknown) => void }) => (
    <dialog open>
        <button onClick={() => onConfirm?.({})}>Remove</button>
    </dialog>
));
