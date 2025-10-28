import React, { useCallback } from 'react';

import { ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import cx from './AddAction.pcss';

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
            color="green"
            variant="filled"
            onClick={handleClick}
            className={cx('AddAction')}
            data-hidden={hidden}
        >
            <IconPlus size={24} />
        </ActionIcon>
    );
}
