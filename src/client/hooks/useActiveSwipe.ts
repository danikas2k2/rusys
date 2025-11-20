import { useActiveContent } from '~/client/common/ActiveContentContext';

export function useActiveSwipe(): boolean {
    const [active] = useActiveContent();
    return (
        active !== undefined &&
        active.action === undefined &&
        active.data !== undefined &&
        active.offset !== undefined &&
        active.offset !== 0
    );
}
