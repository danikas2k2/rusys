import React, { type JSX, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import { combineReducers, type Action, type Reducer, type ReducersMapObject } from 'redux';

const getPassThrough =
    (d?: unknown): Reducer =>
    (s?: unknown) =>
        s ?? d ?? {};

function addMissingReducers<S, A extends Action<never>>(
    state: unknown,
    reducers?: ReducersMapObject<S, A> | undefined
): ReducersMapObject {
    return Object.keys(state ?? {}).reduce((res: ReducersMapObject, key) => {
        if (!(key in res)) {
            res[key] = getPassThrough();
        }
        return res;
    }, reducers ?? {});
}

export function MockRedux<S, A extends Action<never>>({
    state,
    reducers,
    children,
}: PropsWithChildren<{
    state?: S;
    reducers?: ReducersMapObject<S, A>;
}>): JSX.Element {
    const stateReducers = addMissingReducers(state, reducers);
    const reducer = isEmpty(stateReducers) ? getPassThrough() : combineReducers(stateReducers);
    const store = configureStore({
        reducer,
        preloadedState: state as never,
    });
    return <Provider store={store}>{children}</Provider>;
}
