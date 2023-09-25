import { type RuleSetRule } from 'webpack';
import getCssLoaders from '../loaders/css-loaders';

export function getCssRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.css$/,
        use: [...getCssLoaders(isDevMode), 'less-import-once'],
    };
}
