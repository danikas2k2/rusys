import { ActionIcon } from '@mantine/core';
import React, { useCallback } from 'react';

import { AddIcon } from '@icons';

import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { useLabel } from '~/lib/hooks/useLabel';

export function AddAction({ onClick }: { onClick?: React.MouseEventHandler }) {
    const [active, setActive] = useActiveContent();

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            setActive({ action: 'update' });
            onClick?.(e);
        },
        [onClick, setActive]
    );

    const hidden = !!(active?.action || active?.id);

    return (
        <ActionIcon
            size="xl"
            radius="xl"
            color="positive"
            variant="filled"
            onClick={handleClick}
            data-hidden={hidden}
            data-action="add"
            aria-label={useLabel('Add')}
        >
            <AddIcon size={24} />
        </ActionIcon>
    );
}
