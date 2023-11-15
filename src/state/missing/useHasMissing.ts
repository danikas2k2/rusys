import { useMissing } from '~/state/missing/useMissing';

export function useHasMissing(): boolean {
    return !!useMissing().length;
}
