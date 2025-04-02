import { useEffect, useRef } from 'react';

export function usePreviousValue<T>(value: T): T | undefined {
    const valueRef = useRef<T>(undefined);
    const previousValue = valueRef.current;
    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    return previousValue;
}
