import React, { createContext, use, useCallback, useMemo, useState } from 'react';

interface ErrorState {
    error: string | null;
    setError: (message: string) => void;
    clearError: () => void;
}

const ErrorContext = createContext<ErrorState | null>(null);

export function ErrorProvider({ children }: React.PropsWithChildren) {
    const [error, setError] = useState<string | null>(null);
    const clearError = useCallback(() => setError(null), []);
    const value = useMemo(() => ({ error, setError, clearError }), [error, clearError]);

    return <ErrorContext value={value}>{children}</ErrorContext>;
}

export function useError<T>(selector: (state: ErrorState) => T): T {
    const state = use(ErrorContext);
    if (!state) {
        throw new Error('useError must be used within ErrorProvider');
    }
    return selector(state);
}
