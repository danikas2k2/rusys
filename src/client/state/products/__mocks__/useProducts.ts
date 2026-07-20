import { getProductsFixture } from '@tests/fixtures';

import { vi } from 'vitest';

export const useProducts = vi.fn().mockReturnValue(getProductsFixture());
