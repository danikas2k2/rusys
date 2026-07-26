import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ReviewBox } from '~/client/pages/review/ReviewBox';

export function ActiveReviewBox() {
    const [active, setActive] = useActiveContent();

    const opened = active?.action === 'review';

    const handleClose = useCallback(() => setActive(), [setActive]);

    return <ReviewBox opened={opened} onClose={handleClose} />;
}
