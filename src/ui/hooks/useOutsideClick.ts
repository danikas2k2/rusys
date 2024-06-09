import { type RefObject, useEffect } from 'react';

export function useOutsideClick(ref: RefObject<Element | null>, handler: () => void) {
    useEffect(() => {
        const handleOutsideClick = (e: Event) => {
            const target = e.target as Element;
            if (ref?.current && ref?.current !== target && !ref?.current.contains(target)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [ref, handler]);
}
