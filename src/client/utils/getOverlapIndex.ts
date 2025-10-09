export function getOverlapIndex(element: HTMLElement | null, threshold = 0.5): number {
    if (element) {
        const rect = element.getBoundingClientRect();
        const parent = element.offsetParent as HTMLElement | null;
        if (parent) {
            const children = parent.children as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child === element) {
                    continue;
                }
                const childRect = child.getBoundingClientRect();
                if (
                    (childRect.top >= rect.top && childRect.top <= rect.top + rect.height * threshold) ||
                    (rect.top >= childRect.top && rect.top <= childRect.top + childRect.height * threshold)
                ) {
                    return i;
                }
            }
        }
    }
    return -1;
}
