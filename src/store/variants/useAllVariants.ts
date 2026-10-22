import type { Variant } from '~/common/data';
import { useVariants } from './useVariants';

const cache = new WeakMap<readonly Variant[], Map<string, string[]>>();

export const useAllVariants = (group: string): string[] => {
    const variants = useVariants();
    let groups = cache.get(variants);
    if (!groups) {
        groups = new Map();
        cache.set(variants, groups);
    }
    let result = groups.get(group);
    if (!result) {
        result = variants
            .filter((variant) => variant.group === group)
            .sort((a, b) => a.order - b.order)
            .map((variant) => variant.variant);
        groups.set(group, result);
    }
    return result;
};
