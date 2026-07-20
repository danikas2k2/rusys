import { getVariantsFixture } from '@tests/fixtures';

import { vi } from 'vitest';

// noinspection JSUnusedGlobalSymbols
export const useVariants = vi.fn().mockReturnValue(getVariantsFixture());
