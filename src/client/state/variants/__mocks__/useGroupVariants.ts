import { getVariantsFixture } from '@tests/fixtures';

import { vi } from 'vitest';

// noinspection JSUnusedGlobalSymbols
export const useGroupVariants = vi
    .fn()
    .mockImplementation((group: string) => getVariantsFixture().filter((g) => g.group === group));
