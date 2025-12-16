import { ActionIcon } from '@mantine/core';
import { IconCircleX } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useLabel } from '~/client/hooks/useLabel';

export function ClearFilterIcon({ onClick }: { onClick: React.MouseEventHandler }) {
    const handleClick = useCallback<React.MouseEventHandler>(
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick(e);
        },
        [onClick]
    );

    return (
        <ActionIcon
            onClick={handleClick}
            variant="subtle"
            color="orange"
            aria-label={useLabel('Clear')}
            size={16}
            style={{ pointerEvents: 'auto' }}
        >
            <IconCircleX size={16} />
        </ActionIcon>
    );
}
