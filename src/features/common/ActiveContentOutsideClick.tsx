import { useCallback, useEffect } from 'react';

import { useSwipeVisible } from '~/components/hooks/useSwipeVisible';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';

export function ActiveContentOutsideClick() {
    const setActive = useSetActiveContent();

    const handleClick = useCallback(
        (e: MouseEvent) => {
            // Don't close if clicking on swipe controls
            if ((e.target as HTMLElement).closest('[data-swipe-controls]')) {
                return;
            }

            // Prevent click event from propagating to table row when panel is open
            // This prevents table row click handlers from firing
            e.stopPropagation();
            e.preventDefault();

            // Close swipe for any other click
            setActive();
        },
        [setActive]
    );

    const visible = useSwipeVisible();

    useEffect(() => {
        if (visible) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [visible, handleClick]);

    return null;
}
