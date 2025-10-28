import type { Configuration, RuleSetUseItem } from 'webpack';

export type WebpackModuleLoader = RuleSetUseItem;
export type WebpackAliasMap = NonNullable<Configuration['resolve']>['alias'];
export type WebpackExternalsMap = Configuration['externals'];
export type WebpackPerformance = Configuration['performance'];
export type WebpackResolve = Configuration['resolve'];
export type WebpackOptimization = Configuration['optimization'];
export type WebpackPlugin = NonNullable<Configuration['plugins']>[0];
