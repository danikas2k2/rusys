import { useLabels } from '~/client/hooks/useLabels';

export function useLabel(label: string, locale?: string): string {
    const _ = useLabels();
    return _(label, locale) ?? label;
}
