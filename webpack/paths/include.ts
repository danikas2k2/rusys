import path from 'path';

import type { RuleSetConditionAbsolute } from 'webpack';

export function getIncludeList(): RuleSetConditionAbsolute[] {
    return [path.resolve(process.cwd(), 'src')];
}
