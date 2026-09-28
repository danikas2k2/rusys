import { ActionIcon } from '@mantine/core';
import React, { useCallback } from 'react';

import { ReviewIcon } from '@icons';

import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { useHasReviewGroups } from '~/features/groups/hooks/useHasReviewGroups';
import { useLabel } from '~/lib/hooks/useLabel';

export function ToolbarReviewButton() {
    const setActive = useSetActiveContent();
    const hasReviewGroups = useHasReviewGroups();

    const handleClick = useCallback(() => setActive({ action: 'review' }), [setActive]);

    return (
        <IconButtonTooltip>
            <ActionIcon
                variant="subtle"
                size="lg"
                aria-label={useLabel('Review')}
                disabled={!hasReviewGroups}
                onClick={handleClick}
            >
                <ReviewIcon />
            </ActionIcon>
        </IconButtonTooltip>
    );
}
