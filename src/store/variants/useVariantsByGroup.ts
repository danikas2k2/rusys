import type { Variant } from '~/common/data';
import { useVariants } from './useVariants';

const cache = new WeakMap<readonly Variant[], Map<string, readonly Variant[]>>();

export const useVariantsByGroup = (group: string): readonly Variant[] => {
    const variants = useVariants();
    let groups = cache.get(variants);
    if (!groups) {
        groups = new Map();
        cache.set(variants, groups);
    }
    let result = groups.get(group);
    if (!result) {
        result = variants.filter((variant) => variant.group === group);
        groups.set(group, result);
    }
    return result;
};
