import { useCallback } from 'react';

import { useOutsideClick } from '@ui/hooks/useOutsideClick';

import { useActiveRow } from '~/client/app/common/ActiveRowContext';

export function ActiveRowOutsideClick() {
    const [active, setActive] = useActiveRow();
    const setInactive = useCallback(() => setActive(undefined), [setActive]);
    const ref = (!active?.pinned && active?.ref) || { current: null };
    useOutsideClick(ref, setInactive);
    return null;
}
