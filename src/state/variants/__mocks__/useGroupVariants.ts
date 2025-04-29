import { getVariantsFixture } from '@tests/fixtures';

// noinspection JSUnusedGlobalSymbols
export const useGroupVariants = jest
    .fn()
    .mockImplementation((group: string) => getVariantsFixture().filter((g) => g.group === group));
