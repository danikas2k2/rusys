import type { RuleSetConditionAbsolute } from 'webpack';

export function getExcludeList(): RuleSetConditionAbsolute[] {
    return [
        (modulePath: string) => {
            // Exclude node_modules except @mantine packages
            return /node_modules/.test(modulePath) && !/@mantine/.test(modulePath);
        },
    ];
}
