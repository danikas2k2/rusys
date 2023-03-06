import { useEffect, useRef } from 'react';

export default function usePreviousValue<T>(val: T): T | undefined {
    const ref = useRef<T>();
    const previousValue = ref.current;
    useEffect(() => {
        ref.current = val;
    }, [val]);
    return previousValue;
}
