import React from 'react';
import { getDecoratorType } from './getDecoratorType';

describe('getDecoratorType', () => {
    it('returns "text" for string input', () => {
        expect(getDecoratorType('example')).toBe('text');
    });

    it('returns "text" for number input', () => {
        expect(getDecoratorType(123)).toBe('text');
    });

    it('returns "text" for boolean input', () => {
        expect(getDecoratorType(true)).toBe('text');
    });

    it('returns "node" for null input', () => {
        expect(getDecoratorType(null)).toBe('node');
    });

    it('returns "node" for undefined input', () => {
        expect(getDecoratorType(undefined)).toBe('node');
    });

    it('returns "node" for ReactNode input', () => {
        expect(getDecoratorType(<div>Test</div>)).toBe('node');
    });

    it('returns "node" for awaited ReactNode input', async () => {
        expect(getDecoratorType(Promise.resolve(<span>Async Test</span>))).toBe('node');
    });
});
