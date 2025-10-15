import { useId, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: ReactNode;
}

const usePortalRoot = (): HTMLElement => {
    const id = useId();

    const portalRoot = useMemo(() => {
        // Check if element already exists
        const existingElement = document.getElementById(id);
        if (existingElement) {
            return existingElement;
        }

        // Create new element
        const element = document.createElement('div');
        element.id = id;
        element.setAttribute('role', 'complementary');
        element.setAttribute('aria-label', 'portal');
        document.body.appendChild(element);
        return element;
    }, [id]);

    useLayoutEffect(() => {
        return () => {
            document.getElementById(id)?.remove();
        };
    }, [id]);

    return portalRoot;
};

export function Portal({ children }: PortalProps) {
    const portalRoot = usePortalRoot();
    return createPortal(children, portalRoot, portalRoot.id);
}
