import { ActionIcon } from '@mantine/core';
import React, { useCallback } from 'react';

import { ClearIcon } from '@icons';

import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { useLabel } from '~/lib/hooks/useLabel';

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
        <IconButtonTooltip>
            <ActionIcon
                onClick={handleClick}
                variant="subtle"
                color="orange"
                aria-label={useLabel('Clear')}
                size={16}
                style={{ pointerEvents: 'auto' }}
            >
                <ClearIcon size={16} />
            </ActionIcon>
        </IconButtonTooltip>
    );
}
