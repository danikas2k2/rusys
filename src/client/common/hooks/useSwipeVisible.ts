import { useActiveContent } from '~/client/common/ActiveContentContext';

export function useSwipeVisible(): boolean {
    const [active] = useActiveContent();
    return !!active?.offset && !active.action;
}
