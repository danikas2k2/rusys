import { useProducts } from './useProducts';

export const useHasMissing = (): boolean => useProducts().some((v) => v.missing);
