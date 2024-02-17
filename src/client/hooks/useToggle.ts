import { useCallback, useState } from 'react';

export function useToggle(
    initial = false
): readonly [current: boolean, toggle: (newValue?: boolean) => void, on: () => void, off: () => void] {
    const [current, setCurrent] = useState(initial);
    const toggle = useCallback(
        (newValue?: boolean) => {
            if (newValue === current) {
                return;
            }
            if (newValue == null) {
                newValue = !current;
            }
            setCurrent(newValue);
        },
        [current]
    );
    const on = useCallback(() => toggle(true), [toggle]);
    const off = useCallback(() => toggle(false), [toggle]);
    return [current, toggle, on, off];
}
