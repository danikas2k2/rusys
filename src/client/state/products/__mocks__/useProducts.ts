import { getProductsFixture } from '@tests/fixtures';

export const useProducts = jest.fn().mockReturnValue(getProductsFixture());
