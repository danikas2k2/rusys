export function supportsClippedViewTransitions(): boolean {
    return (
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        typeof CSS !== 'undefined' &&
        CSS.supports('view-transition-group', 'contain')
    );
}
