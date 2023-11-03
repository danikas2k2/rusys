import { type RuleSetConditionAbsolute } from 'webpack';

export function getExcludeList(): RuleSetConditionAbsolute[] {
    return [/node_modules/];
}
