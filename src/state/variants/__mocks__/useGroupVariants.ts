import { getVariantsFixture } from '~/tests/fixtures';

export const useGroupVariants = jest
    .fn()
    .mockImplementation((group: string) => getVariantsFixture().filter((g) => g.group === group));
