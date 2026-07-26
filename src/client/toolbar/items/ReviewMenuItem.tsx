import { NavLink } from '@mantine/core';
import { IconClipboardList } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { useHasReviewGroups } from '~/client/pages/groups/hooks/useHasReviewGroups';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

interface ReviewMenuItemProps {
    onClick?: React.MouseEventHandler;
}

export function ReviewMenuItem({ onClick }: ReviewMenuItemProps) {
    const setActive = useSetActiveContent();
    const hasReviewGroups = useHasReviewGroups();

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            onClick?.(e);
            setActive({ action: 'review' });
        },
        [onClick, setActive]
    );

    return (
        <NavLink
            label={<Label>Review</Label>}
            leftSection={
                <ToolbarMenuIcon>
                    <IconClipboardList />
                </ToolbarMenuIcon>
            }
            disabled={!hasReviewGroups}
            onClick={handleClick}
        />
    );
}
