import { type RuleSetRule } from 'webpack';
import { getCssLoaders } from '../loaders/css-loaders';
import { getExcludeList } from '../paths/exclude';
import { getIncludeList } from '../paths/include';

export function getCssRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.css$/,
        include: getIncludeList(),
        exclude: getExcludeList(),
        use: [...getCssLoaders(isDevMode), 'less-import-once'],
    };
}
