import { type RefObject, useEffect } from 'react';

// TODO improve outside click handler to use single event listener for all components:
//  - individual refs with handlers should be stored in a map, and the handler should be called based on the ref
//  - event listener should be added when the first component is mounted
//  - event listener should be removed when the last component is unmounted
export function useOutsideClick(ref: RefObject<Element | null>, handler: (e: Event) => void) {
    useEffect(() => {
        const handleOutsideClick = (e: Event) => {
            const target = e.target as Element;
            if (ref?.current && ref?.current !== target && !ref?.current.contains(target)) {
                handler(e);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [ref, handler]);
}
