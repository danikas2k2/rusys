import { noop } from 'lodash';
import React, { createContext, use, useCallback, useEffect, useState } from 'react';

export type AmountView = 'detailed' | 'total';

const STORAGE_KEY = 'amountView';

function readInitialAmountView(): AmountView {
    return localStorage.getItem(STORAGE_KEY) === 'detailed' ? 'detailed' : 'total';
}

export const AmountViewContext = createContext<[AmountView, (v: AmountView) => void]>(['total', noop]);

export function AmountViewWrapper({ children }: React.PropsWithChildren) {
    const [amountView, setAmountView] = useState<AmountView>('total');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage after hydration.
        setAmountView(readInitialAmountView());
    }, []);

    const setAndPersist = useCallback((v: AmountView) => {
        localStorage.setItem(STORAGE_KEY, v);
        setAmountView(v);
    }, []);

    return <AmountViewContext value={[amountView, setAndPersist]}>{children}</AmountViewContext>;
}

export const useAmountView = () => use(AmountViewContext);
