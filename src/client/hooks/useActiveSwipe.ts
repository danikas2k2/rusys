import { useActiveContent } from '~/client/common/ActiveContentContext';

export function useActiveSwipe(): boolean {
    const [active] = useActiveContent();
    return !!active?.data && !active?.action && active?.offset !== undefined && active?.offset !== 0;
}
