import { createRef, type RefObject, useEffect, useState } from 'react';

export function useRefs<T>(n: number): RefObject<T>[] {
    const [refs, setRefs] = useState([]);
    useEffect(() => setRefs(Array.from({ length: n }, (_v, i) => refs[i] ?? createRef<T>())), [n, refs]);
    return refs;
}
