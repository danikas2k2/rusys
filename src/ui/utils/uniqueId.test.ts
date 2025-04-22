import { renderHook } from '@testing-library/react';
import { uniqueId } from '@ui/utils/uniqueId';

describe('uniqueId', () => {
    it('returns unique id with prefix', () => {
        const { result } = renderHook(() => uniqueId('test'));

        expect(result.current).toMatch(/^test-/);
    });

    it('returns different ids for different hooks', () => {
        const { result: result1 } = renderHook(() => uniqueId('test'));
        const { result: result2 } = renderHook(() => uniqueId('test'));

        expect(result1.current).not.toStrictEqual(result2.current);
    });

    it('returns different ids for different prefixes', () => {
        const { result: result1 } = renderHook(() => uniqueId('test1'));
        const { result: result2 } = renderHook(() => uniqueId('test2'));

        expect(result1.current).not.toStrictEqual(result2.current);
    });
});
