import type { RuleSetRule } from 'webpack';

import { getClassNamesLoader } from '../loaders/class-names';
import { getCssLoader } from '../loaders/css';
import { getPostCssLoader } from '../loaders/postcss';
import { getStyleLoader } from '../loaders/style';
import { getExcludeList } from '../paths/exclude';
import { getIncludeList } from '../paths/include';

export function getCssRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.p?css$/,
        exclude: getExcludeList(),
        use: [
            getClassNamesLoader(isDevMode),
            getStyleLoader(isDevMode),
            getCssLoader(isDevMode),
            getPostCssLoader(isDevMode),
        ],
    };
}
