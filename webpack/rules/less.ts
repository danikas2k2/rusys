import { type RuleSetRule } from 'webpack';
import { getCssLoaders } from '../loaders/css-loaders';
import { getExcludeList } from '../paths/exclude';
import { getIncludeList } from '../paths/include';

export function getLessRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.less$/,
        include: getIncludeList(),
        exclude: getExcludeList(),
        use: [...getCssLoaders(isDevMode), 'less-loader', 'less-import-once'],
    };
}
