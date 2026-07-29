import { ActionIcon } from '@mantine/core';
import React, { useCallback } from 'react';

import { ReviewIcon } from '@icons';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { useLabel } from '~/client/hooks/useLabel';
import { useHasReviewGroups } from '~/client/pages/groups/hooks/useHasReviewGroups';

export function ToolbarReviewButton() {
    const setActive = useSetActiveContent();
    const hasReviewGroups = useHasReviewGroups();

    const handleClick = useCallback(() => setActive({ action: 'review' }), [setActive]);

    return (
        <ActionIcon
            variant="subtle"
            size="lg"
            aria-label={useLabel('Review')}
            disabled={!hasReviewGroups}
            onClick={handleClick}
        >
            <ReviewIcon />
        </ActionIcon>
    );
}
