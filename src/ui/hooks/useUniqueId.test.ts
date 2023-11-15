import { renderHook } from '@testing-library/react';
import { useUniqueId } from './useUniqueId';

describe('useUniqueId', () => {
    it('returns unique id with prefix', () => {
        const { result } = renderHook(() => useUniqueId('test'));
        expect(result.current).toMatch(/^test-/);
    });

    it('returns different ids for different hooks', () => {
        const { result: result1 } = renderHook(() => useUniqueId('test'));
        const { result: result2 } = renderHook(() => useUniqueId('test'));
        expect(result1.current).not.toEqual(result2.current);
    });

    it('returns different ids for different prefixes', () => {
        const { result: result1 } = renderHook(() => useUniqueId('test1'));
        const { result: result2 } = renderHook(() => useUniqueId('test2'));
        expect(result1.current).not.toEqual(result2.current);
    });
});
