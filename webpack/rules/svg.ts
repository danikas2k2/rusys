import { type RuleSetRule } from 'webpack';

import { getSvgLoader } from '../loaders/svg';
import { getExcludeList } from '../paths/exclude';
import { getIncludeList } from '../paths/include';

export function getSvgRule(): RuleSetRule {
    return {
        test: /\.svg$/,
        include: getIncludeList(),
        exclude: getExcludeList(),
        use: [getSvgLoader()],
    };
}
