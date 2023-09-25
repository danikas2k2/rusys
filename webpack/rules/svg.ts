import { type RuleSetRule } from 'webpack';
import getSvgLoader from '../loaders/svg';

export function getSvgRule(): RuleSetRule {
    return {
        test: /\.svg$/,
        use: [getSvgLoader()],
    };
}
