import { configureStore } from '@reduxjs/toolkit';
import { type RenderHookOptions } from '@testing-library/react';
import { isEmpty } from 'lodash';
import React, { type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, type Reducer } from 'redux';

const getPassThrough =
    (defaultState: unknown = null): Reducer =>
    (s: unknown) =>
        s ?? defaultState;

function addMissingReducers<S extends object>(
    state?: S,
    reducers: Record<string, Reducer> = {}
): Record<string, Reducer> {
    return Object.keys(state ?? {}).reduce((res: Record<string, Reducer>, key: string) => {
        if (!(key in res)) {
            res[key] = getPassThrough();
        }
        return res;
    }, reducers);
}

export function withReduxState<P, S extends object>(state?: S, reducers = {}): RenderHookOptions<P> {
    const stateReducers = addMissingReducers<S>(state, reducers);
    const reducer = isEmpty(stateReducers) ? getPassThrough({}) : combineReducers(stateReducers);
    const store = configureStore({
        reducer,
        preloadedState: state,
    });
    return {
        wrapper: ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>,
    };
}
