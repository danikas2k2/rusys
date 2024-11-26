import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { useCallback } from 'react';
import { useActiveRow } from '~/client/common/ActiveRowContext';

export function ActiveRowOutsideClick() {
    const [active, setActive] = useActiveRow();
    const setInactive = useCallback(() => setActive(undefined), [setActive]);
    useOutsideClick((!active?.pinned && active?.ref) || { current: null }, setInactive);
    return null;
}
