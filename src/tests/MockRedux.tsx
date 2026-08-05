import { configureStore } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
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
}: React.PropsWithChildren<{
    state?: S;
    reducers?: ReducersMapObject<S, A>;
}>): React.ReactElement {
    const stateReducers = addMissingReducers(state, reducers);
    const reducer = isEmpty(stateReducers) ? getPassThrough() : combineReducers(stateReducers);
    const store = configureStore({
        reducer,
        preloadedState: state as never,
        // RTK's default dev middleware deep-clones/deep-compares the whole state tree on every
        // store creation and dispatch to catch mutations/non-serializable values. Every render()
        // in every test creates a fresh store, so this tax is paid constantly; it doesn't guard
        // against anything these tests need, so skip it for speed.
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
    });
    return <Provider store={store}>{children}</Provider>;
}
