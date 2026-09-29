import { noop } from 'lodash';
import React, { createContext, use, useCallback, useSyncExternalStore } from 'react';

export type AmountView = 'detailed' | 'total';

const STORAGE_KEY = 'amountView';
const CHANGE_EVENT = 'amount-view-change';

function subscribe(onChange: () => void): () => void {
    window.addEventListener('storage', onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener(CHANGE_EVENT, onChange);
    };
}

function getSnapshot(): AmountView {
    return localStorage.getItem(STORAGE_KEY) === 'detailed' ? 'detailed' : 'total';
}

function getServerSnapshot(): AmountView {
    return 'total';
}

export const AmountViewContext = createContext<[AmountView, (v: AmountView) => void]>(['total', noop]);

export function AmountViewWrapper({ children }: React.PropsWithChildren) {
    const amountView = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setAndPersist = useCallback((v: AmountView) => {
        localStorage.setItem(STORAGE_KEY, v);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return <AmountViewContext value={[amountView, setAndPersist]}>{children}</AmountViewContext>;
}

export const useAmountView = () => use(AmountViewContext);
