import { useActiveContent } from '~/client/common/ActiveContentContext';

export function useActiveSwipe(): boolean {
    const [active] = useActiveContent();
    return !(!active?.data || !active.offset || active.action);
}
