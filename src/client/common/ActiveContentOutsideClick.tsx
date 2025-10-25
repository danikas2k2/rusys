import { useCallback } from 'react';

import { useOutsideClick } from '@ui/hooks/useOutsideClick';

import { useActiveContent } from '~/client/common/ActiveContentContext';

export function ActiveContentOutsideClick({ selectors = '[data-swipe-controls]' }: { selectors?: string }) {
    const [active, setActive] = useActiveContent();

    const deactivate = useCallback(
        (e: Event) => {
            // Don't close if row is pinned (dialog is open) or clicking inside swipe controls (defined by selectors)
            if (!active?.pinned && !(e.target as HTMLElement).closest(selectors)) {
                setActive(undefined);
            }
        },
        [active?.pinned, selectors, setActive]
    );

    const ref = active?.ref || { current: null };
    useOutsideClick(ref, deactivate);
    return null;
}
