import { useEffect, useRef } from 'react';

export function usePreviousValue<T>(value: T): T | undefined {
    const valueRef = useRef<T>(undefined);
    // eslint-disable-next-line react-hooks/refs
    const previousValue = valueRef.current;
    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    return previousValue;
}
