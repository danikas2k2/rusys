import React, { useCallback } from 'react';

import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { ReviewBox } from '~/features/review/ReviewBox';

export function ActiveReviewBox() {
    const [active, setActive] = useActiveContent();

    const opened = active?.action === 'review';

    const handleClose = useCallback(() => setActive(), [setActive]);

    return <ReviewBox opened={opened} onClose={handleClose} />;
}
