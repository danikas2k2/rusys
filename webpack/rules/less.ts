import { type RuleSetRule } from 'webpack';
import getCssLoaders from '../loaders/css-loaders';

export function getLessRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.less$/,
        use: [...getCssLoaders(isDevMode), 'less-loader', 'less-import-once'],
    };
}
