import React from 'react';

import { ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import cx from './AddAction.pcss';

export function AddAction({ onClick }: { onClick: React.MouseEventHandler }) {
    const [active] = useActiveContent();
    return (
        <ActionIcon
            size="xl"
            radius="xl"
            color="green"
            variant="filled"
            onClick={onClick}
            className={cx('AddAction', { hidden: !!active })}
        >
            <IconPlus size={24} />
        </ActionIcon>
    );
}
