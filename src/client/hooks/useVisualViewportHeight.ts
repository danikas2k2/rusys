import { useEffect } from 'react';

const CSS_VAR = '--visual-viewport-height';

export function useVisualViewportHeight(): void {
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) {
            return;
        }

        const updateHeight = () => {
            document.documentElement.style.setProperty(CSS_VAR, `${viewport.height}px`);
        };

        updateHeight();
        viewport.addEventListener('resize', updateHeight);
        viewport.addEventListener('scroll', updateHeight);

        return () => {
            viewport.removeEventListener('resize', updateHeight);
            viewport.removeEventListener('scroll', updateHeight);
            document.documentElement.style.removeProperty(CSS_VAR);
        };
    }, []);
}
