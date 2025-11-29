import { getProductsFixture } from '@tests/fixtures';

export const useProducts = vi.fn().mockReturnValue(getProductsFixture());
