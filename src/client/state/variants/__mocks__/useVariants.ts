import { getVariantsFixture } from '@tests/fixtures';

// noinspection JSUnusedGlobalSymbols
export const useVariants = vi.fn().mockReturnValue(getVariantsFixture());
