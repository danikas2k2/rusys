import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: ReactNode;
}

const usePortalRoot = (): HTMLElement => {
    const idRef = useRef(useId());
    // eslint-disable-next-line react-hooks/refs
    const rootRef = useRef<HTMLElement | null>(document.getElementById(idRef.current));
    // eslint-disable-next-line react-hooks/refs
    if (!rootRef.current) {
        rootRef.current = document.createElement('div');
        // eslint-disable-next-line react-hooks/refs
        rootRef.current.id = idRef.current;
        // eslint-disable-next-line react-hooks/refs
        rootRef.current.setAttribute('role', 'complementary');
        // eslint-disable-next-line react-hooks/refs
        rootRef.current.setAttribute('aria-label', 'portal');
        // eslint-disable-next-line react-hooks/refs
        document.body.appendChild(rootRef.current);
    }

    useEffect(() => {
        return () => {
            rootRef.current?.remove();
        };
    }, []);

    // eslint-disable-next-line react-hooks/refs
    return rootRef.current;
};

export function Portal({ children }: PortalProps) {
    const portalRoot = usePortalRoot();
    return createPortal(children, portalRoot, portalRoot.id);
}
