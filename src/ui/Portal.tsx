import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: ReactNode;
}

const usePortalRoot = (): HTMLElement => {
    const idRef = useRef(useId());
    const rootRef = useRef<HTMLElement | null>(document.getElementById(idRef.current));
    if (!rootRef.current) {
        rootRef.current = document.createElement('div');
        rootRef.current.id = idRef.current;
        rootRef.current.setAttribute('role', 'complementary');
        rootRef.current.setAttribute('aria-label', 'portal');
        document.body.appendChild(rootRef.current);
    }

    useEffect(() => {
        return () => {
            rootRef.current?.remove();
        };
    }, []);

    return rootRef.current;
};

export function Portal({ children }: PortalProps) {
    const portalRoot = usePortalRoot();
    return createPortal(children, portalRoot, portalRoot.id);
}
